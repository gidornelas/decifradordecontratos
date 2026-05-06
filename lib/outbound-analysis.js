var db = require("./db");
var claude = require("./claude");
var documents = require("./documents");

var ANALYSIS_KIND_OUTBOUND = "outbound_contract_review";
var ANALYSIS_PERSPECTIVE_SENDER = "sender";
var OUTBOUND_PROMPT_VERSION = "outbound-contract-review-v1";

async function createOutboundAnalysis(input) {
  var contractDocumentId = input && input.contractDocumentId ? String(input.contractDocumentId) : "";
  var proposalDocumentId = input && input.proposalDocumentId ? String(input.proposalDocumentId) : "";
  var userId = input && input.userId ? String(input.userId) : "";
  var internalNotes = input && input.internalNotes ? String(input.internalNotes) : "";
  var onEvent = input && typeof input.onEvent === "function" ? input.onEvent : null;
  var startedAt = Date.now();
  var contractDocument;
  var proposalDocument;
  var pendingAnalysisResult;
  var analysisId;

  if (!contractDocumentId || !proposalDocumentId || !userId) {
    throw new Error("Contract document, proposal document and user are required.");
  }

  if (contractDocumentId === proposalDocumentId) {
    throw new Error("Contract document and proposal document must be different files.");
  }

  contractDocument = await documents.getDocumentById(contractDocumentId, userId);
  proposalDocument = await documents.getDocumentById(proposalDocumentId, userId);

  if (!contractDocument) {
    throw new Error("Contract document not found.");
  }

  if (!proposalDocument) {
    throw new Error("Proposal document not found.");
  }

  ensureReadableText(contractDocument, "contract");
  ensureReadableText(proposalDocument, "proposal");

  pendingAnalysisResult = await findPendingOutboundAnalysis({
    userId: userId,
    contractDocumentId: contractDocumentId,
    proposalDocumentId: proposalDocumentId
  });

  if (pendingAnalysisResult) {
    throw new Error("Outbound analysis already in progress for this contract and proposal.");
  }

  emitEvent(onEvent, "outbound_analysis_started", {
    userId: userId,
    contractDocumentId: contractDocumentId,
    contractDocumentName: contractDocument.original_name,
    proposalDocumentId: proposalDocumentId,
    proposalDocumentName: proposalDocument.original_name,
    internalNotesLength: internalNotes.trim().length
  });

  pendingAnalysisResult = await db.query(
    [
      "insert into analyses (",
      "document_id, source_document_id, reference_document_id, user_id, status,",
      "prompt_version, analysis_kind, analysis_perspective, internal_notes",
      ") values ($1, $1, $2, $3, $4, $5, $6, $7, $8)",
      "returning id"
    ].join(" "),
    [
      contractDocumentId,
      proposalDocumentId,
      userId,
      "analyzing",
      OUTBOUND_PROMPT_VERSION,
      ANALYSIS_KIND_OUTBOUND,
      ANALYSIS_PERSPECTIVE_SENDER,
      internalNotes.trim() || null
    ]
  );

  analysisId = pendingAnalysisResult.rows[0].id;

  try {
    var claudeResponse = await claude.analyzeOutboundContractPair({
      contractDocumentName: contractDocument.original_name,
      contractText: contractDocument.extracted_text,
      proposalDocumentName: proposalDocument.original_name,
      proposalText: proposalDocument.extracted_text,
      internalNotes: internalNotes,
      onEvent: onEvent
    });

    await persistCompletedOutboundAnalysis({
      analysisId: analysisId,
      contractDocumentId: contractDocumentId,
      proposalDocumentId: proposalDocumentId,
      result: claudeResponse.result,
      modelName: claudeResponse.model,
      promptVersion: claudeResponse.promptVersion,
      internalNotes: internalNotes
    });

    emitEvent(onEvent, "outbound_analysis_completed", {
      analysisId: analysisId,
      userId: userId,
      contractDocumentId: contractDocumentId,
      proposalDocumentId: proposalDocumentId,
      model: claudeResponse.model,
      attemptCount: claudeResponse.attemptCount,
      fallbackUsed: claudeResponse.fallbackUsed,
      attemptedModels: claudeResponse.attemptedModels,
      issueCount: claudeResponse.result.issues.length,
      checklistCount: claudeResponse.result.checklist.length,
      proposalConsistencyScore: claudeResponse.result.proposalConsistencyScore,
      sendReadinessScore: claudeResponse.result.sendReadinessScore,
      durationMs: Date.now() - startedAt
    });

    return getOutboundAnalysisById(analysisId, userId);
  } catch (error) {
    await markOutboundAnalysisAsFailed({
      analysisId: analysisId,
      message: error && error.message ? error.message : "Outbound analysis failed."
    });

    emitEvent(onEvent, "outbound_analysis_failed", {
      analysisId: analysisId,
      userId: userId,
      contractDocumentId: contractDocumentId,
      proposalDocumentId: proposalDocumentId,
      durationMs: Date.now() - startedAt,
      message: error && error.message ? error.message : "Outbound analysis failed."
    });

    throw error;
  }
}

async function getOutboundAnalysisById(analysisId, userId) {
  var analysisResult = await db.query(
    [
      "select",
      "a.id, a.document_id, a.source_document_id, a.reference_document_id, a.user_id,",
      "a.status, a.contract_type, a.summary, a.recommendation, a.model_name, a.prompt_version,",
      "a.analysis_kind, a.analysis_perspective, a.final_verdict,",
      "a.proposal_consistency_score, a.send_readiness_score,",
      "a.executive_recommendation, a.checklist, a.matched_points, a.missing_points, a.internal_notes,",
      "a.created_at, a.updated_at,",
      "contract_doc.original_name as source_document_name,",
      "proposal_doc.original_name as reference_document_name",
      "from analyses a",
      "join documents contract_doc on contract_doc.id = a.source_document_id",
      "left join documents proposal_doc on proposal_doc.id = a.reference_document_id",
      "where a.id = $1 and a.user_id = $2",
      "and contract_doc.deleted_at is null",
      "and coalesce(a.analysis_kind, $3) = $3",
      "limit 1"
    ].join(" "),
    [analysisId, userId, ANALYSIS_KIND_OUTBOUND]
  );

  if (!analysisResult.rows.length) {
    return null;
  }

  var issuesResult = await db.query(
    [
      "select id, issue_type, severity, title, description, source_excerpt,",
      "reference_excerpt, recommended_fix, created_at",
      "from analysis_issues",
      "where analysis_id = $1",
      "order by created_at asc, id asc"
    ].join(" "),
    [analysisId]
  );

  var analysisRow = analysisResult.rows[0];

  return {
    analysis: normalizeOutboundAnalysisRow(analysisRow),
    issues: Array.isArray(issuesResult.rows) ? issuesResult.rows : [],
    checklist: ensureArray(analysisRow.checklist),
    matchedPoints: ensureArray(analysisRow.matched_points),
    missingPoints: ensureArray(analysisRow.missing_points)
  };
}

async function getLatestOutboundAnalysisForDocument(documentId, userId) {
  var result = await db.query(
    [
      "select a.id",
      "from analyses a",
      "join documents d on d.id = a.source_document_id",
      "where a.source_document_id = $1 and a.user_id = $2 and d.deleted_at is null",
      "and coalesce(a.analysis_kind, $3) = $3",
      "order by a.created_at desc",
      "limit 1"
    ].join(" "),
    [documentId, userId, ANALYSIS_KIND_OUTBOUND]
  );

  if (!result.rows.length) {
    return null;
  }

  return getOutboundAnalysisById(result.rows[0].id, userId);
}

async function findPendingOutboundAnalysis(input) {
  var result = await db.query(
    [
      "select id",
      "from analyses",
      "where user_id = $1 and source_document_id = $2 and reference_document_id = $3",
      "and coalesce(analysis_kind, $4) = $4",
      "and status in ('pending', 'analyzing')",
      "order by created_at desc",
      "limit 1"
    ].join(" "),
    [input.userId, input.contractDocumentId, input.proposalDocumentId, ANALYSIS_KIND_OUTBOUND]
  );

  return result.rows.length ? result.rows[0] : null;
}

async function persistCompletedOutboundAnalysis(input) {
  await db.withClient(async function (client) {
    await client.query("begin");

    try {
      await client.query(
        [
          "update analyses",
          "set status = $2, contract_type = $3, summary = $4, recommendation = $5,",
          "model_name = $6, prompt_version = $7, final_verdict = $8,",
          "proposal_consistency_score = $9, send_readiness_score = $10,",
          "executive_recommendation = $11, checklist = $12::jsonb, matched_points = $13::jsonb,",
          "missing_points = $14::jsonb, internal_notes = $15, updated_at = timezone('utc', now())",
          "where id = $1"
        ].join(" "),
        [
          input.analysisId,
          "completed",
          input.result.contractType,
          input.result.summary,
          input.result.executiveRecommendation,
          input.modelName,
          input.promptVersion,
          input.result.finalVerdict,
          input.result.proposalConsistencyScore,
          input.result.sendReadinessScore,
          input.result.executiveRecommendation,
          JSON.stringify(input.result.checklist),
          JSON.stringify(input.result.matchedPoints),
          JSON.stringify(input.result.missingPoints),
          input.internalNotes && input.internalNotes.trim() ? input.internalNotes.trim() : null
        ]
      );

      for (var index = 0; index < input.result.issues.length; index += 1) {
        var issue = input.result.issues[index];

        await client.query(
          [
            "insert into analysis_issues (",
            "analysis_id, issue_type, severity, title, description, source_excerpt,",
            "reference_excerpt, recommended_fix",
            ") values ($1, $2, $3, $4, $5, $6, $7, $8)"
          ].join(" "),
          [
            input.analysisId,
            issue.issueType,
            issue.severity,
            issue.title,
            issue.description || null,
            issue.sourceExcerpt || null,
            issue.referenceExcerpt || null,
            issue.recommendedFix || null
          ]
        );
      }

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

async function markOutboundAnalysisAsFailed(input) {
  await db.query(
    [
      "update analyses",
      "set status = $2, recommendation = $3, updated_at = timezone('utc', now())",
      "where id = $1"
    ].join(" "),
    [input.analysisId, "failed", input.message || "Outbound analysis failed."]
  );
}

function ensureReadableText(documentItem, label) {
  if (!documentItem || !documentItem.extracted_text || !String(documentItem.extracted_text).trim()) {
    throw new Error(
      "The " + label + " document does not have extracted text yet. Upload a TXT file or send PDF/DOCX content so the backend can extract the text first."
    );
  }
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeOutboundAnalysisRow(row) {
  return Object.assign({}, row, {
    checklist: ensureArray(row && row.checklist),
    matched_points: ensureArray(row && row.matched_points),
    missing_points: ensureArray(row && row.missing_points)
  });
}

function emitEvent(onEvent, eventName, payload) {
  if (typeof onEvent === "function") {
    onEvent(eventName, payload || {});
  }
}

module.exports = {
  createOutboundAnalysis: createOutboundAnalysis,
  getLatestOutboundAnalysisForDocument: getLatestOutboundAnalysisForDocument,
  getOutboundAnalysisById: getOutboundAnalysisById
};

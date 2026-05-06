var db = require("./db");
var claude = require("./claude");
var schemaCapabilities = require("./schema-capabilities");

var ANALYSIS_KIND_RECEIVED = "received_contract_review";
var ANALYSIS_PERSPECTIVE_RECEIVER = "receiver";

async function createAnalysisForDocument(input) {
  var documentId = input && input.documentId ? String(input.documentId) : "";
  var userId = input && input.userId ? String(input.userId) : "";
  var onEvent = input && typeof input.onEvent === "function" ? input.onEvent : null;
  var startedAt = Date.now();

  if (!documentId || !userId) {
    throw new Error("Document and user are required.");
  }

  var documentItem = await getOwnedDocument(documentId, userId);
  var capabilities = await schemaCapabilities.getAnalysisSchemaCapabilities();

  if (!documentItem) {
    throw new Error("Document not found.");
  }

  if (!documentItem.extracted_text || !documentItem.extracted_text.trim()) {
    throw new Error(
      "This document does not have extracted text yet. Upload a TXT file or send PDF/DOCX content so the backend can extract the contract text first."
    );
  }

  if (documentItem.processing_status === "analyzing") {
    throw new Error("Analysis already in progress for this document.");
  }

  emitEvent(onEvent, "analysis_started", {
    documentId: documentId,
    userId: userId,
    documentName: documentItem.original_name,
    extractedTextLength: documentItem.extracted_text.length
  });

  var insertColumns = ["document_id", "user_id", "status", "prompt_version"];
  var insertValues = [documentId, userId, "pending", "contract-analysis-v1"];

  if (capabilities.hasSourceDocumentId) {
    insertColumns.push("source_document_id");
    insertValues.push(documentId);
  }

  if (capabilities.hasAnalysisKind) {
    insertColumns.push("analysis_kind");
    insertValues.push(ANALYSIS_KIND_RECEIVED);
  }

  if (capabilities.hasAnalysisPerspective) {
    insertColumns.push("analysis_perspective");
    insertValues.push(ANALYSIS_PERSPECTIVE_RECEIVER);
  }

  var pendingAnalysis = await db.query(
    [
      "insert into analyses (",
      insertColumns.join(", "),
      ") values (",
      insertValues.map(function (_, index) { return "$" + (index + 1); }).join(", "),
      ") returning id"
    ].join(" "),
    insertValues
  );

  var analysisId = pendingAnalysis.rows[0].id;

  await db.query(
    [
      "update documents",
      "set processing_status = $2, error_message = null, updated_at = timezone('utc', now())",
      "where id = $1"
    ].join(" "),
    [documentId, "analyzing"]
  );

  try {
    var claudeResponse = await claude.analyzeContractText({
      documentName: documentItem.original_name,
      contractText: documentItem.extracted_text,
      onEvent: onEvent
    });

    await persistCompletedAnalysis({
      analysisId: analysisId,
      documentId: documentId,
      result: claudeResponse.result,
      modelName: claudeResponse.model,
      promptVersion: claudeResponse.promptVersion
    });

    emitEvent(onEvent, "analysis_completed", {
      analysisId: analysisId,
      documentId: documentId,
      userId: userId,
      model: claudeResponse.model,
      attemptCount: claudeResponse.attemptCount,
      fallbackUsed: claudeResponse.fallbackUsed,
      attemptedModels: claudeResponse.attemptedModels,
      riskCount: claudeResponse.result.risks.length,
      clauseCount: claudeResponse.result.clauses.length,
      riskScore: claudeResponse.result.riskScore,
      durationMs: Date.now() - startedAt
    });

    return getAnalysisById(analysisId, userId);
  } catch (error) {
    await markAnalysisAsFailed({
      analysisId: analysisId,
      documentId: documentId,
      message: error.message || "Analysis failed."
    });

    emitEvent(onEvent, "analysis_failed", {
      analysisId: analysisId,
      documentId: documentId,
      userId: userId,
      durationMs: Date.now() - startedAt,
      message: error && error.message ? error.message : "Analysis failed."
    });

    throw error;
  }
}

async function getAnalysisById(analysisId, userId) {
  var capabilities = await schemaCapabilities.getAnalysisSchemaCapabilities();
  var selectExtras = [
    capabilities.hasAnalysisKind
      ? "a.analysis_kind"
      : "'" + ANALYSIS_KIND_RECEIVED + "'::text as analysis_kind",
    capabilities.hasAnalysisPerspective
      ? "a.analysis_perspective"
      : "'" + ANALYSIS_PERSPECTIVE_RECEIVER + "'::text as analysis_perspective",
    capabilities.hasSourceDocumentId
      ? "a.source_document_id"
      : "a.document_id as source_document_id",
    capabilities.hasReferenceDocumentId
      ? "a.reference_document_id"
      : "null::uuid as reference_document_id",
    capabilities.hasFinalVerdict
      ? "a.final_verdict"
      : "null::text as final_verdict",
    capabilities.hasProposalConsistencyScore
      ? "a.proposal_consistency_score"
      : "null::integer as proposal_consistency_score",
    capabilities.hasSendReadinessScore
      ? "a.send_readiness_score"
      : "null::integer as send_readiness_score",
    capabilities.hasExecutiveRecommendation
      ? "a.executive_recommendation"
      : "null::text as executive_recommendation",
    capabilities.hasChecklist
      ? "a.checklist"
      : "'[]'::jsonb as checklist",
    capabilities.hasMatchedPoints
      ? "a.matched_points"
      : "'[]'::jsonb as matched_points",
    capabilities.hasMissingPoints
      ? "a.missing_points"
      : "'[]'::jsonb as missing_points",
    capabilities.hasInternalNotes
      ? "a.internal_notes"
      : "null::text as internal_notes"
  ];
  var sourceDocumentNameSelect = capabilities.hasSourceDocumentId
    ? "source_doc.original_name as source_document_name"
    : "d.original_name as source_document_name";
  var referenceDocumentNameSelect = capabilities.hasReferenceDocumentId
    ? "reference_doc.original_name as reference_document_name"
    : "null::text as reference_document_name";
  var joins = [];

  if (capabilities.hasSourceDocumentId) {
    joins.push("left join documents source_doc on source_doc.id = a.source_document_id");
  }

  if (capabilities.hasReferenceDocumentId) {
    joins.push("left join documents reference_doc on reference_doc.id = a.reference_document_id");
  }

  var analysisResult = await db.query(
    [
      "select",
      "a.id, a.document_id, a.user_id, a.status, a.contract_type, a.risk_score,",
      "a.summary, a.recommendation, a.model_name, a.prompt_version,",
      selectExtras.join(", ") + ",",
      "a.created_at, a.updated_at,",
      "d.original_name as document_name, d.processing_status as document_status,",
      sourceDocumentNameSelect + ",",
      referenceDocumentNameSelect,
      "from analyses a",
      "join documents d on d.id = a.document_id",
      joins.join(" "),
      "where a.id = $1 and a.user_id = $2 and d.deleted_at is null",
      "limit 1"
    ].join(" "),
    [analysisId, userId]
  );

  if (!analysisResult.rows.length) {
    return null;
  }

  var risksResult = await db.query(
    [
      "select id, clause_number, title, severity, category, original_excerpt,",
      "simplified_explanation, impact_description, recommendation, confidence, created_at",
      "from analysis_risks",
      "where analysis_id = $1",
      "order by created_at asc, id asc"
    ].join(" "),
    [analysisId]
  );

  var clausesResult = await db.query(
    [
      "select id, clause_number, clause_title, original_text, simplified_text,",
      "why_it_matters, severity, confidence, created_at",
      "from analysis_clauses",
      "where analysis_id = $1",
      "order by created_at asc, id asc"
    ].join(" "),
    [analysisId]
  );

  return {
    analysis: analysisResult.rows[0],
    risks: risksResult.rows || [],
    clauses: clausesResult.rows || []
  };
}

async function getLatestAnalysisForDocument(documentId, userId) {
  var capabilities = await schemaCapabilities.getAnalysisSchemaCapabilities();
  var whereKindClause = capabilities.hasAnalysisKind
    ? "and a.analysis_kind = $3"
    : "";
  var params = capabilities.hasAnalysisKind
    ? [documentId, userId, ANALYSIS_KIND_RECEIVED]
    : [documentId, userId];
  var result = await db.query(
    [
      "select a.id",
      "from analyses a",
      "join documents d on d.id = a.document_id",
      "where a.document_id = $1 and a.user_id = $2 and d.deleted_at is null",
      whereKindClause,
      "order by a.created_at desc",
      "limit 1"
    ].join(" "),
    params
  );

  if (!result.rows.length) {
    return null;
  }

  return getAnalysisById(result.rows[0].id, userId);
}

async function reprocessAnalysisById(analysisId, userId, options) {
  var capabilities = await schemaCapabilities.getAnalysisSchemaCapabilities();
  var whereKindClause = capabilities.hasAnalysisKind
    ? "and a.analysis_kind = $3"
    : "";
  var params = capabilities.hasAnalysisKind
    ? [analysisId, userId, ANALYSIS_KIND_RECEIVED]
    : [analysisId, userId];
  var result = await db.query(
    [
      "select a.id, a.document_id",
      "from analyses a",
      "join documents d on d.id = a.document_id",
      "where a.id = $1 and a.user_id = $2 and d.deleted_at is null",
      whereKindClause,
      "limit 1"
    ].join(" "),
    params
  );

  if (!result.rows.length) {
    throw new Error("Analysis not found.");
  }

  return createAnalysisForDocument({
    documentId: result.rows[0].document_id,
    userId: userId,
    onEvent: options && options.onEvent
  });
}

async function getRecentAnalysisHealthSummary(options) {
  var capabilities = await schemaCapabilities.getAnalysisSchemaCapabilities();
  var windowHours = normalizeWindowHours(options && options.windowHours, 24);
  var recentParams = [String(windowHours)];
  var recentWhere = [
    "created_at >= timezone('utc', now()) - ($1::text || ' hours')::interval"
  ];

  if (capabilities.hasAnalysisKind) {
    recentWhere.unshift("analysis_kind = $2");
    recentParams.push(ANALYSIS_KIND_RECEIVED);
  }

  var recentResult = await db.query(
    [
      "select",
      "count(*)::int as total_count,",
      "count(*) filter (where status = 'completed')::int as completed_count,",
      "count(*) filter (where status = 'failed')::int as failed_count,",
      "count(*) filter (where status in ('pending', 'analyzing'))::int as in_progress_count,",
      "max(created_at) as latest_created_at,",
      "max(updated_at) as latest_updated_at",
      "from analyses",
      "where " + recentWhere.join(" and ")
    ].join(" "),
    recentParams
  );

  var latestFailureParams = capabilities.hasAnalysisKind
    ? [ANALYSIS_KIND_RECEIVED]
    : [];
  var latestFailureWhere = ["a.status = 'failed'"];

  if (capabilities.hasAnalysisKind) {
    latestFailureWhere.push("a.analysis_kind = $1");
  }

  var latestFailureResult = await db.query(
    [
      "select",
      "a.id, a.document_id, a.user_id, a.status, a.model_name, a.prompt_version,",
      "a.created_at, a.updated_at, d.original_name as document_name, d.error_message",
      "from analyses a",
      "join documents d on d.id = a.document_id",
      "where " + latestFailureWhere.join(" and "),
      "order by a.updated_at desc nulls last, a.created_at desc",
      "limit 1"
    ].join(" "),
    latestFailureParams
  );

  var totals = recentResult.rows[0] || {};
  var totalCount = Number(totals.total_count) || 0;
  var failedCount = Number(totals.failed_count) || 0;

  return {
    windowHours: windowHours,
    totals: {
      total: totalCount,
      completed: Number(totals.completed_count) || 0,
      failed: failedCount,
      inProgress: Number(totals.in_progress_count) || 0
    },
    latestCreatedAt: totals.latest_created_at || null,
    latestUpdatedAt: totals.latest_updated_at || null,
    recentSuccess: totalCount > 0 && failedCount === 0,
    latestFailure: formatFailureRow(latestFailureResult.rows[0] || null)
  };
}

function emitEvent(onEvent, eventName, payload) {
  if (typeof onEvent === "function") {
    onEvent(eventName, payload || {});
  }
}

function formatFailureRow(row) {
  if (!row) {
    return null;
  }

  return {
    analysisId: row.id,
    documentId: row.document_id,
    userId: row.user_id,
    documentName: row.document_name || null,
    status: row.status,
    modelName: row.model_name || null,
    promptVersion: row.prompt_version || null,
    errorMessage: row.error_message || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeWindowHours(value, fallback) {
  var parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(24 * 30, Math.round(parsed));
}

async function getOwnedDocument(documentId, userId) {
  var result = await db.query(
    [
      "select id, user_id, original_name, extracted_text, processing_status",
      "from documents",
      "where id = $1 and user_id = $2 and deleted_at is null",
      "limit 1"
    ].join(" "),
    [documentId, userId]
  );

  return result.rows.length ? result.rows[0] : null;
}

async function persistCompletedAnalysis(input) {
  await db.withClient(async function (client) {
    await client.query("begin");

    try {
      await client.query(
        [
          "update analyses",
          "set status = $2, contract_type = $3, risk_score = $4, summary = $5,",
          "recommendation = $6, model_name = $7, prompt_version = $8,",
          "updated_at = timezone('utc', now())",
          "where id = $1"
        ].join(" "),
        [
          input.analysisId,
          "completed",
          input.result.contractType,
          input.result.riskScore,
          input.result.summary,
          input.result.recommendation,
          input.modelName,
          input.promptVersion
        ]
      );

      for (var i = 0; i < input.result.risks.length; i += 1) {
        var risk = input.result.risks[i];

        await client.query(
          [
            "insert into analysis_risks (",
            "analysis_id, clause_number, title, severity, category, original_excerpt,",
            "simplified_explanation, impact_description, recommendation, confidence",
            ") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
          ].join(" "),
          [
            input.analysisId,
            risk.clauseNumber || null,
            risk.title,
            risk.severity,
            risk.category || null,
            risk.originalExcerpt || null,
            risk.simplifiedExplanation || null,
            risk.impactDescription || null,
            risk.recommendation || null,
            risk.confidence
          ]
        );
      }

      for (var j = 0; j < input.result.clauses.length; j += 1) {
        var clause = input.result.clauses[j];

        await client.query(
          [
            "insert into analysis_clauses (",
            "analysis_id, clause_number, clause_title, original_text, simplified_text,",
            "why_it_matters, severity, confidence",
            ") values ($1, $2, $3, $4, $5, $6, $7, $8)"
          ].join(" "),
          [
            input.analysisId,
            clause.clauseNumber || null,
            clause.clauseTitle || null,
            clause.originalText || null,
            clause.simplifiedText || null,
            clause.whyItMatters || null,
            clause.severity,
            clause.confidence
          ]
        );
      }

      await client.query(
        [
          "update documents",
          "set processing_status = $2, error_message = null, updated_at = timezone('utc', now())",
          "where id = $1"
        ].join(" "),
        [input.documentId, "completed"]
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

async function markAnalysisAsFailed(input) {
  await db.withClient(async function (client) {
    await client.query("begin");

    try {
      await client.query(
        [
          "update analyses",
          "set status = $2, updated_at = timezone('utc', now())",
          "where id = $1"
        ].join(" "),
        [input.analysisId, "failed"]
      );

      await client.query(
        [
          "update documents",
          "set processing_status = $2, error_message = $3, updated_at = timezone('utc', now())",
          "where id = $1"
        ].join(" "),
        [input.documentId, "failed", input.message]
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

module.exports = {
  createAnalysisForDocument: createAnalysisForDocument,
  getAnalysisById: getAnalysisById,
  getLatestAnalysisForDocument: getLatestAnalysisForDocument,
  getRecentAnalysisHealthSummary: getRecentAnalysisHealthSummary,
  reprocessAnalysisById: reprocessAnalysisById
};

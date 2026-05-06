var db = require("./db");

var CACHE_TTL_MS = 60 * 1000;
var cachedCapabilities = null;
var cachedAt = 0;

async function getAnalysisSchemaCapabilities() {
  var now = Date.now();

  if (cachedCapabilities && now - cachedAt < CACHE_TTL_MS) {
    return cachedCapabilities;
  }

  var trackedColumns = [
    "analysis_kind",
    "analysis_perspective",
    "source_document_id",
    "reference_document_id",
    "final_verdict",
    "proposal_consistency_score",
    "send_readiness_score",
    "executive_recommendation",
    "checklist",
    "matched_points",
    "missing_points",
    "internal_notes"
  ];

  var columnsResult = await db.query(
    [
      "select column_name",
      "from information_schema.columns",
      "where table_schema = 'public'",
      "and table_name = 'analyses'",
      "and column_name = any($1::text[])"
    ].join(" "),
    [trackedColumns]
  );

  var tablesResult = await db.query(
    "select to_regclass('public.analysis_issues') as analysis_issues_table",
    []
  );

  var knownColumns = {};
  (columnsResult.rows || []).forEach(function (row) {
    if (row && row.column_name) {
      knownColumns[row.column_name] = true;
    }
  });

  cachedCapabilities = {
    hasAnalysisKind: Boolean(knownColumns.analysis_kind),
    hasAnalysisPerspective: Boolean(knownColumns.analysis_perspective),
    hasSourceDocumentId: Boolean(knownColumns.source_document_id),
    hasReferenceDocumentId: Boolean(knownColumns.reference_document_id),
    hasFinalVerdict: Boolean(knownColumns.final_verdict),
    hasProposalConsistencyScore: Boolean(knownColumns.proposal_consistency_score),
    hasSendReadinessScore: Boolean(knownColumns.send_readiness_score),
    hasExecutiveRecommendation: Boolean(knownColumns.executive_recommendation),
    hasChecklist: Boolean(knownColumns.checklist),
    hasMatchedPoints: Boolean(knownColumns.matched_points),
    hasMissingPoints: Boolean(knownColumns.missing_points),
    hasInternalNotes: Boolean(knownColumns.internal_notes),
    hasAnalysisIssuesTable: Boolean(
      tablesResult.rows &&
      tablesResult.rows[0] &&
      tablesResult.rows[0].analysis_issues_table
    )
  };
  cachedAt = now;

  return cachedCapabilities;
}

function clearSchemaCapabilitiesCache() {
  cachedCapabilities = null;
  cachedAt = 0;
}

module.exports = {
  clearSchemaCapabilitiesCache: clearSchemaCapabilitiesCache,
  getAnalysisSchemaCapabilities: getAnalysisSchemaCapabilities
};

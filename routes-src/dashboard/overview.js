var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var userId = authContext.session.user_id;
    var countsResult = await db.query(
      [
        "select",
        "(select count(*)::int from documents where user_id = $1) as total_documents,",
        "(select count(*)::int from analyses where user_id = $1 and status = 'completed') as completed_analyses,",
        "(",
        "select count(*)::int",
        "from analysis_risks r",
        "join analyses a on a.id = r.analysis_id",
        "where a.user_id = $1 and r.severity = 'critical'",
        ") as critical_risks"
      ].join(" "),
      [userId]
    );

    var recentDocumentsResult = await db.query(
      [
        "select id, original_name, mime_type, extension, size_bytes, processing_status, created_at",
        "from documents",
        "where user_id = $1",
        "order by created_at desc",
        "limit 5"
      ].join(" "),
      [userId]
    );

    return http.ok(res, {
      kpis: countsResult.rows[0] || {
        total_documents: 0,
        completed_analyses: 0,
        critical_risks: 0
      },
      recentDocuments: recentDocumentsResult.rows || []
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

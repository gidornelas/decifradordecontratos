var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return listDocuments(req, res);
  }

  if (req.method === "POST") {
    return http.badRequest(
      res,
      "Document upload endpoint is not implemented yet.",
      { nextPhase: "Fase 4 — Upload real de contratos" }
    );
  }

  return http.methodNotAllowed(res, ["GET", "POST"]);
};

async function listDocuments(req, res) {
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var response = await db.query(
      [
        "select id, original_name, mime_type, size_bytes, processing_status, created_at",
        "from documents",
        "where user_id = $1",
        "order by created_at desc",
        "limit 20"
      ].join(" "),
      [authContext.session.user_id]
    );

    return http.ok(res, {
      documents: response.rows || []
    });
  } catch (error) {
    return http.internalError(res, error);
  }
}

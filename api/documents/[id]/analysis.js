var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var analysis = require("../../../lib/analysis");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      return http.badRequest(res, "Document id is required.");
    }

    var result = await analysis.getLatestAnalysisForDocument(
      documentId,
      authContext.session.user_id
    );

    if (!result) {
      return http.badRequest(res, "No analysis found for this document.");
    }

    return http.ok(res, result);
  } catch (error) {
    return http.internalError(res, error);
  }
};

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

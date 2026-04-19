var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var analysis = require("../../../lib/analysis");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var analysisId = getRouteParam(req, "id");
    if (!analysisId) {
      return http.badRequest(res, "Analysis id is required.");
    }

    var result = await analysis.reprocessAnalysisById(
      analysisId,
      authContext.session.user_id
    );

    return http.created(res, result);
  } catch (error) {
    if (
      error &&
      (error.message === "Analysis not found." ||
        error.message.indexOf("extracted text") !== -1)
    ) {
      return http.badRequest(res, error.message);
    }

    if (error && error.message === "Analysis already in progress for this document.") {
      return http.conflict(res, error.message);
    }

    return http.internalError(res, error);
  }
};

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

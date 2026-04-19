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

    var analysisId = getRouteParam(req, "id");
    if (!analysisId) {
      return http.badRequest(res, "Analysis id is required.");
    }

    var result = await analysis.getAnalysisById(
      analysisId,
      authContext.session.user_id
    );

    if (!result) {
      return http.badRequest(res, "Analysis not found.");
    }

    return http.ok(res, {
      analysis: result.analysis,
      risks: result.risks
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

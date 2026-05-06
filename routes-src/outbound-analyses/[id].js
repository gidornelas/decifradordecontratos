var http = require("../../lib/http");
var auth = require("../../lib/auth");
var observability = require("../../lib/observability");
var outboundAnalysis = require("../../lib/outbound-analysis");
var validation = require("../../lib/validation");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "outboundAnalyses.detail"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "outboundAnalyses.detail",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;
    var analysisId = getRouteParam(req, "id");

    if (!analysisId) {
      return http.badRequest(res, "Analysis id is required.");
    }

    if (!validation.isUuid(analysisId)) {
      return http.badRequest(res, "Analysis id format is invalid.");
    }

    var result = await outboundAnalysis.getOutboundAnalysisById(analysisId, currentUserId);

    if (!result) {
      observability.logRequestComplete(req, res, {
        route: "outboundAnalyses.detail",
        userId: currentUserId,
        analysisId: analysisId,
        statusCode: 404
      });
      return http.badRequest(res, "Outbound analysis not found.");
    }

    observability.logRequestComplete(req, res, {
      route: "outboundAnalyses.detail",
      userId: currentUserId,
      analysisId: analysisId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, result);
  } catch (error) {
    observability.logAppError("outbound_analyses.detail_failed", error, {
      route: "outboundAnalyses.detail",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "outboundAnalyses.detail",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

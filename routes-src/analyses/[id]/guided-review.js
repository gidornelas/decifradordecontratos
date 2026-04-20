var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var analysis = require("../../../lib/analysis");
var observability = require("../../../lib/observability");
var validation = require("../../../lib/validation");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "analyses.guidedReview"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "analyses.guidedReview",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var analysisId = getRouteParam(req, "id");
    if (!analysisId) {
      observability.logRequestComplete(req, res, {
        route: "analyses.guidedReview",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Analysis id is required.");
    }

    if (!validation.isUuid(analysisId)) {
      observability.logRequestComplete(req, res, {
        route: "analyses.guidedReview",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Analysis id format is invalid.");
    }

    var result = await analysis.getAnalysisById(
      analysisId,
      authContext.session.user_id
    );

    if (!result) {
      observability.logRequestComplete(req, res, {
        route: "analyses.guidedReview",
        userId: currentUserId,
        analysisId: analysisId,
        statusCode: 404
      });
      return http.badRequest(res, "Analysis not found.");
    }

    observability.logRequestComplete(req, res, {
      route: "analyses.guidedReview",
      userId: currentUserId,
      analysisId: analysisId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      analysis: result.analysis,
      clauses: result.clauses
    });
  } catch (error) {
    observability.logAppError("analyses.guided_review_failed", error, {
      route: "analyses.guidedReview",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "analyses.guidedReview",
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

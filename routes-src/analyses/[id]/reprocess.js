var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var analysis = require("../../../lib/analysis");
var observability = require("../../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  var requestContext;
  var currentUserId = null;
  var analysisId = "";

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;
    requestContext = observability.logRequestStart(req, res, {
      route: "analyses.reprocess",
      userId: currentUserId
    });

    analysisId = getRouteParam(req, "id");
    if (!analysisId) {
      observability.logRequestComplete(req, res, {
        route: "analyses.reprocess",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Analysis id is required.");
    }

    var result = await analysis.reprocessAnalysisById(
      analysisId,
      currentUserId,
      {
        onEvent: buildAnalysisEventLogger(requestContext, currentUserId, analysisId)
      }
    );

    observability.logRequestComplete(req, res, {
      route: "analyses.reprocess",
      userId: currentUserId,
      statusCode: 201,
      analysisId: result && result.analysis ? result.analysis.id : analysisId,
      sourceAnalysisId: analysisId
    });
    return http.created(res, result);
  } catch (error) {
    if (
      error &&
      (error.message === "Analysis not found." ||
        error.message.indexOf("extracted text") !== -1)
    ) {
      observability.logRequestComplete(req, res, {
        route: "analyses.reprocess",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    if (error && error.message === "Analysis already in progress for this document.") {
      observability.logRequestComplete(req, res, {
        route: "analyses.reprocess",
        userId: currentUserId,
        statusCode: 409
      });
      return http.conflict(res, error.message);
    }

    observability.logAppError("analyses.reprocess_failed", error, {
      route: "analyses.reprocess",
      requestId: requestContext && requestContext.requestId,
      userId: currentUserId,
      analysisId: analysisId || null
    });
    observability.logRequestComplete(req, res, {
      route: "analyses.reprocess",
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

function buildAnalysisEventLogger(requestContext, userId, sourceAnalysisId) {
  return function onEvent(eventName, payload) {
    observability.logAppEvent(
      eventName === "analysis_failed" ? "error" :
      eventName === "claude_attempt_fallback" ? "warn" :
      "info",
      eventName,
      Object.assign(
        {
          route: "analyses.reprocess",
          requestId: requestContext && requestContext.requestId,
          userId: userId,
          sourceAnalysisId: sourceAnalysisId
        },
        payload || {}
      )
    );
  };
}

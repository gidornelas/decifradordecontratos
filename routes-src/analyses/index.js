var http = require("../../lib/http");
var auth = require("../../lib/auth");
var analysis = require("../../lib/analysis");
var rateLimit = require("../../lib/rate-limit");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  var requestContext;
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    requestContext = observability.logRequestStart(req, res, {
      route: "analyses.create",
      userId: currentUserId
    });

    var limit = await rateLimit.consumeRateLimit({
      scope: "analyses.create.user",
      subject: currentUserId,
      windowMs: 60 * 60 * 1000,
      maxRequests: 20
    });

    if (!limit.allowed) {
      observability.logSecurityEvent(req, res, "rate_limit_exceeded", {
        route: "analyses.create",
        userId: currentUserId,
        requestCount: limit.requestCount
      });
      observability.logRequestComplete(req, res, {
        route: "analyses.create",
        userId: currentUserId,
        statusCode: 429
      });
      return http.tooManyRequests(
        res,
        "Analysis limit reached for this hour. Please try again later.",
        { retryAfterSeconds: limit.retryAfterSeconds }
      );
    }

    var body = await http.parseJsonBody(req);
    var documentId = typeof body.documentId === "string" ? body.documentId.trim() : "";

    if (!documentId) {
      observability.logRequestComplete(req, res, {
        route: "analyses.create",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "documentId is required.");
    }

    var result = await analysis.createAnalysisForDocument({
      documentId: documentId,
      userId: currentUserId,
      onEvent: buildAnalysisEventLogger(requestContext, currentUserId, documentId)
    });

    observability.logRequestComplete(req, res, {
      route: "analyses.create",
      userId: currentUserId,
      statusCode: 201,
      documentId: documentId,
      analysisId: result && result.analysis ? result.analysis.id : null
    });
    return http.created(res, result);
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      observability.logRequestComplete(req, res, {
        route: "analyses.create",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    if (error && error.message === "Document not found.") {
      observability.logRequestComplete(req, res, {
        route: "analyses.create",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    if (
      error &&
      error.message &&
      error.message.indexOf("extracted text") !== -1
    ) {
      observability.logRequestComplete(req, res, {
        route: "analyses.create",
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    if (error && error.message === "Analysis already in progress for this document.") {
      observability.logRequestComplete(req, res, {
        route: "analyses.create",
        userId: currentUserId,
        statusCode: 409
      });
      return http.conflict(res, error.message);
    }

    observability.logAppError("analyses.create_failed", error, {
      route: "analyses.create",
      requestId: requestContext && requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "analyses.create",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

function buildAnalysisEventLogger(requestContext, userId, documentId) {
  return function onEvent(eventName, payload) {
    observability.logAppEvent(
      eventName === "analysis_failed" ? "error" :
      eventName === "claude_attempt_fallback" ? "warn" :
      "info",
      eventName,
      Object.assign(
        {
          route: "analyses.create",
          requestId: requestContext && requestContext.requestId,
          userId: userId,
          documentId: documentId
        },
        payload || {}
      )
    );
  };
}

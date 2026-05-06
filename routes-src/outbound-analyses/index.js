var http = require("../../lib/http");
var auth = require("../../lib/auth");
var observability = require("../../lib/observability");
var outboundAnalysis = require("../../lib/outbound-analysis");
var rateLimit = require("../../lib/rate-limit");
var validation = require("../../lib/validation");

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
      route: "outboundAnalyses.create",
      userId: currentUserId
    });

    var limit = await rateLimit.consumeRateLimit({
      scope: "outbound_analyses.create.user",
      subject: currentUserId,
      windowMs: 60 * 60 * 1000,
      maxRequests: 20
    });

    if (!limit.allowed) {
      observability.logSecurityEvent(req, res, "rate_limit_exceeded", {
        route: "outboundAnalyses.create",
        userId: currentUserId,
        requestCount: limit.requestCount
      });
      observability.logRequestComplete(req, res, {
        route: "outboundAnalyses.create",
        userId: currentUserId,
        statusCode: 429
      });
      return http.tooManyRequests(
        res,
        "Outbound analysis limit reached for this hour. Please try again later.",
        { retryAfterSeconds: limit.retryAfterSeconds }
      );
    }

    var body = await http.parseJsonBody(req);
    var contractDocumentId = typeof body.contractDocumentId === "string" ? body.contractDocumentId.trim() : "";
    var proposalDocumentId = typeof body.proposalDocumentId === "string" ? body.proposalDocumentId.trim() : "";
    var internalNotes = typeof body.internalNotes === "string" ? body.internalNotes : "";

    if (!contractDocumentId) {
      return http.badRequest(res, "contractDocumentId is required.");
    }

    if (!proposalDocumentId) {
      return http.badRequest(res, "proposalDocumentId is required.");
    }

    if (!validation.isUuid(contractDocumentId) || !validation.isUuid(proposalDocumentId)) {
      return http.badRequest(res, "Document id format is invalid.");
    }

    var result = await outboundAnalysis.createOutboundAnalysis({
      contractDocumentId: contractDocumentId,
      proposalDocumentId: proposalDocumentId,
      internalNotes: internalNotes,
      userId: currentUserId,
      onEvent: buildOutboundEventLogger(requestContext, currentUserId, contractDocumentId, proposalDocumentId)
    });

    observability.logRequestComplete(req, res, {
      route: "outboundAnalyses.create",
      userId: currentUserId,
      statusCode: 201,
      contractDocumentId: contractDocumentId,
      proposalDocumentId: proposalDocumentId,
      analysisId: result && result.analysis ? result.analysis.id : null,
      requestId: requestContext && requestContext.requestId
    });
    return http.created(res, result);
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      return http.badRequest(res, error.message);
    }

    if (
      error &&
      error.message &&
      (
        error.message === "Contract document not found." ||
        error.message === "Proposal document not found." ||
        error.message === "Contract document and proposal document must be different files." ||
        error.message === "Outbound analysis already in progress for this contract and proposal." ||
        error.message.indexOf("does not have extracted text yet") !== -1
      )
    ) {
      return http.badRequest(res, error.message);
    }

    observability.logAppError("outbound_analyses.create_failed", error, {
      route: "outboundAnalyses.create",
      requestId: requestContext && requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "outboundAnalyses.create",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

function buildOutboundEventLogger(requestContext, userId, contractDocumentId, proposalDocumentId) {
  return function onEvent(eventName, payload) {
    observability.logAppEvent(
      eventName === "outbound_analysis_failed" ? "error" :
      eventName === "claude_attempt_fallback" ? "warn" :
      "info",
      eventName,
      Object.assign(
        {
          route: "outboundAnalyses.create",
          requestId: requestContext && requestContext.requestId,
          userId: userId,
          contractDocumentId: contractDocumentId,
          proposalDocumentId: proposalDocumentId
        },
        payload || {}
      )
    );
  };
}

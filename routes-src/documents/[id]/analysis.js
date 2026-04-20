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
    route: "documents.analysis"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "documents.analysis",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      observability.logRequestComplete(req, res, {
        route: "documents.analysis",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id is required.");
    }

    if (!validation.isUuid(documentId)) {
      observability.logRequestComplete(req, res, {
        route: "documents.analysis",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id format is invalid.");
    }

    var result = await analysis.getLatestAnalysisForDocument(
      documentId,
      authContext.session.user_id
    );

    if (!result) {
      observability.logRequestComplete(req, res, {
        route: "documents.analysis",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 404
      });
      return http.badRequest(res, "No analysis found for this document.");
    }

    observability.logRequestComplete(req, res, {
      route: "documents.analysis",
      userId: currentUserId,
      documentId: documentId,
      statusCode: 200,
      analysisId: result.analysis && result.analysis.id ? result.analysis.id : null,
      requestId: requestContext.requestId
    });
    return http.ok(res, result);
  } catch (error) {
    observability.logAppError("documents.analysis_failed", error, {
      route: "documents.analysis",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "documents.analysis",
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

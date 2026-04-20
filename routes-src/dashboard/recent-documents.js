var http = require("../../lib/http");
var auth = require("../../lib/auth");
var documents = require("../../lib/documents");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "dashboard.recentDocuments"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "dashboard.recentDocuments",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var items = await documents.listDocumentsByUser(
      currentUserId,
      10
    );

    observability.logRequestComplete(req, res, {
      route: "dashboard.recentDocuments",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId,
      documentCount: items.length
    });
    return http.ok(res, {
      documents: items
    });
  } catch (error) {
    observability.logAppError("dashboard.recent_documents_failed", error, {
      route: "dashboard.recentDocuments",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "dashboard.recentDocuments",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

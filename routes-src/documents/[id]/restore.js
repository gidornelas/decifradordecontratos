var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var audit = require("../../../lib/document-audit");
var documents = require("../../../lib/documents");
var observability = require("../../../lib/observability");
var validation = require("../../../lib/validation");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "documents.restore"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "documents.restore",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      observability.logRequestComplete(req, res, {
        route: "documents.restore",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id is required.");
    }

    if (!validation.isUuid(documentId)) {
      observability.logRequestComplete(req, res, {
        route: "documents.restore",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id format is invalid.");
    }

    var deletedDocument = await documents.getDeletedDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!deletedDocument) {
      observability.logRequestComplete(req, res, {
        route: "documents.restore",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 404
      });
      return http.badRequest(res, "Document not found in trash.");
    }

    var restored = await documents.restoreDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!restored) {
      observability.logRequestComplete(req, res, {
        route: "documents.restore",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 409
      });
      return http.badRequest(res, "Trash window expired for this document.");
    }

    await audit.appendEvent({
      documentId: documentId,
      userId: currentUserId,
      actorUserId: currentUserId,
      eventName: "restore",
      metadata: {
        originalName: deletedDocument.original_name || null,
        deletedAt: deletedDocument.deleted_at || null
      }
    });

    observability.logRequestComplete(req, res, {
      route: "documents.restore",
      userId: currentUserId,
      documentId: documentId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      restored: true
    });
  } catch (error) {
    observability.logAppError("documents.restore_failed", error, {
      route: "documents.restore",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "documents.restore",
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

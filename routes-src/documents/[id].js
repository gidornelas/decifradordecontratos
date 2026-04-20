var http = require("../../lib/http");
var auth = require("../../lib/auth");
var audit = require("../../lib/document-audit");
var documents = require("../../lib/documents");
var env = require("../../lib/env");
var observability = require("../../lib/observability");
var validation = require("../../lib/validation");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return getDocument(req, res);
  }

  if (req.method === "DELETE") {
    return deleteDocument(req, res);
  }

  return http.methodNotAllowed(res, ["GET", "DELETE"]);
};

async function getDocument(req, res) {
  var requestContext = observability.logRequestStart(req, res, {
    route: "documents.detail"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "documents.detail",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      observability.logRequestComplete(req, res, {
        route: "documents.detail",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id is required.");
    }

    if (!validation.isUuid(documentId)) {
      observability.logRequestComplete(req, res, {
        route: "documents.detail",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id format is invalid.");
    }

    var documentItem = await documents.getDocumentById(
      documentId,
      currentUserId
    );

    if (!documentItem) {
      observability.logRequestComplete(req, res, {
        route: "documents.detail",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 404
      });
      return http.badRequest(res, "Document not found.");
    }

    observability.logRequestComplete(req, res, {
      route: "documents.detail",
      userId: currentUserId,
      documentId: documentId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      document: documentItem
    });
  } catch (error) {
    observability.logAppError("documents.detail_failed", error, {
      route: "documents.detail",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "documents.detail",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
}

async function deleteDocument(req, res) {
  var requestContext = observability.logRequestStart(req, res, {
    route: "documents.delete"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);
    var serverEnv = env.getServerEnv();

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "documents.delete",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      observability.logRequestComplete(req, res, {
        route: "documents.delete",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id is required.");
    }

    if (!validation.isUuid(documentId)) {
      observability.logRequestComplete(req, res, {
        route: "documents.delete",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id format is invalid.");
    }

    var documentItem = await documents.getDocumentById(
      documentId,
      currentUserId
    );

    if (!documentItem) {
      observability.logRequestComplete(req, res, {
        route: "documents.delete",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 404
      });
      return http.badRequest(res, "Document not found.");
    }

    var purgeAfter = buildPurgeDate(serverEnv.trashRetentionDays || 7);
    var deletedDocument = await documents.softDeleteDocumentById(
      documentId,
      currentUserId,
      purgeAfter.toISOString()
    );

    if (!deletedDocument) {
      observability.logRequestComplete(req, res, {
        route: "documents.delete",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 404
      });
      return http.badRequest(res, "Document not found.");
    }

    await audit.appendEvent({
      documentId: documentId,
      userId: currentUserId,
      actorUserId: currentUserId,
      eventName: "trash",
      metadata: {
        originalName: documentItem.original_name || null,
        purgeAfterAt: deletedDocument.purge_after_at
      }
    });

    observability.logRequestComplete(req, res, {
      route: "documents.delete",
      userId: currentUserId,
      documentId: documentId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      deleted: true,
      deletedAt: deletedDocument.deleted_at,
      purgeAfterAt: deletedDocument.purge_after_at
    });
  } catch (error) {
    observability.logAppError("documents.delete_failed", error, {
      route: "documents.delete",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "documents.delete",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
}

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

function buildPurgeDate(trashDays) {
  var days = Number(trashDays);
  var safeDays = Number.isFinite(days) && days > 0 ? Math.round(days) : 7;
  return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
}

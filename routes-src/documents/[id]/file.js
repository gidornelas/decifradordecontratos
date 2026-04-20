var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var documents = require("../../../lib/documents");
var observability = require("../../../lib/observability");
var storage = require("../../../lib/storage");
var validation = require("../../../lib/validation");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "documents.file"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logSecurityEvent(req, res, "missing_session", {
        route: "documents.file"
      });
      observability.logRequestComplete(req, res, {
        route: "documents.file",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      observability.logRequestComplete(req, res, {
        route: "documents.file",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id is required.");
    }

    if (!validation.isUuid(documentId)) {
      observability.logRequestComplete(req, res, {
        route: "documents.file",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "Document id format is invalid.");
    }

    var documentItem = await documents.getDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!documentItem) {
      observability.logRequestComplete(req, res, {
        route: "documents.file",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 404
      });
      return http.badRequest(res, "Document not found.");
    }

    if (!documentItem.storage_bucket || !documentItem.storage_path) {
      observability.logRequestComplete(req, res, {
        route: "documents.file",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 400
      });
      return http.badRequest(
        res,
        "This document does not have a private file stored yet."
      );
    }

    if (!storage.isStorageConfigured()) {
      observability.logRequestComplete(req, res, {
        route: "documents.file",
        userId: currentUserId,
        documentId: documentId,
        statusCode: 503
      });
      return http.badRequest(
        res,
        "Private storage is not configured on the server."
      );
    }

    var file = await storage.getPrivateDocument({
      storageBucket: documentItem.storage_bucket,
      storagePath: documentItem.storage_path
    });

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + buildSafeDownloadName(documentItem.original_name) + '"'
    );

    if (file.contentLength) {
      res.setHeader("Content-Length", String(file.contentLength));
    }

    observability.logRequestComplete(req, res, {
      route: "documents.file",
      userId: currentUserId,
      documentId: documentId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    res.status(200).end(file.body);
  } catch (error) {
    observability.logAppError("documents.file_failed", error, {
      route: "documents.file",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "documents.file",
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

function buildSafeDownloadName(value) {
  return String(value || "document")
    .replace(/[\r\n"]/g, "")
    .trim() || "document";
}

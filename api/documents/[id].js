var http = require("../../lib/http");
var auth = require("../../lib/auth");
var documents = require("../../lib/documents");
var storage = require("../../lib/storage");

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
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      return http.badRequest(res, "Document id is required.");
    }

    var documentItem = await documents.getDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!documentItem) {
      return http.badRequest(res, "Document not found.");
    }

    return http.ok(res, {
      document: documentItem
    });
  } catch (error) {
    return http.internalError(res, error);
  }
}

async function deleteDocument(req, res) {
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var documentId = getRouteParam(req, "id");
    if (!documentId) {
      return http.badRequest(res, "Document id is required.");
    }

    var documentItem = await documents.getDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!documentItem) {
      return http.badRequest(res, "Document not found.");
    }

    if (
      documentItem.storage_path &&
      documentItem.storage_bucket &&
      storage.isStorageConfigured()
    ) {
      await storage.deletePrivateDocument({
        storageBucket: documentItem.storage_bucket,
        storagePath: documentItem.storage_path
      });
    }

    await documents.deleteDocumentById(documentId, authContext.session.user_id);

    return http.ok(res, {
      deleted: true
    });
  } catch (error) {
    return http.internalError(res, error);
  }
}

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

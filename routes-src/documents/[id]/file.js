var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var documents = require("../../../lib/documents");
var storage = require("../../../lib/storage");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

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

    if (!documentItem.storage_bucket || !documentItem.storage_path) {
      return http.badRequest(
        res,
        "This document does not have a private file stored yet."
      );
    }

    if (!storage.isStorageConfigured()) {
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

    res.status(200).end(file.body);
  } catch (error) {
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

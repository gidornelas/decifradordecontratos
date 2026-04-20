var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var audit = require("../../../lib/document-audit");
var documents = require("../../../lib/documents");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
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

    var deletedDocument = await documents.getDeletedDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!deletedDocument) {
      return http.badRequest(res, "Document not found in trash.");
    }

    var restored = await documents.restoreDocumentById(
      documentId,
      authContext.session.user_id
    );

    if (!restored) {
      return http.badRequest(res, "Trash window expired for this document.");
    }

    await audit.appendEvent({
      documentId: documentId,
      userId: authContext.session.user_id,
      actorUserId: authContext.session.user_id,
      eventName: "restore",
      metadata: {
        originalName: deletedDocument.original_name || null,
        deletedAt: deletedDocument.deleted_at || null
      }
    });

    return http.ok(res, {
      restored: true
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

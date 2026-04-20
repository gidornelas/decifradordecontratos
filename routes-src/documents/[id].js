var http = require("../../lib/http");
var auth = require("../../lib/auth");
var audit = require("../../lib/document-audit");
var documents = require("../../lib/documents");
var env = require("../../lib/env");

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
    var serverEnv = env.getServerEnv();

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

    var purgeAfter = buildPurgeDate(serverEnv.trashRetentionDays || 7);
    var deletedDocument = await documents.softDeleteDocumentById(
      documentId,
      authContext.session.user_id,
      purgeAfter.toISOString()
    );

    if (!deletedDocument) {
      return http.badRequest(res, "Document not found.");
    }

    await audit.appendEvent({
      documentId: documentId,
      userId: authContext.session.user_id,
      actorUserId: authContext.session.user_id,
      eventName: "trash",
      metadata: {
        originalName: documentItem.original_name || null,
        purgeAfterAt: deletedDocument.purge_after_at
      }
    });

    return http.ok(res, {
      deleted: true,
      deletedAt: deletedDocument.deleted_at,
      purgeAfterAt: deletedDocument.purge_after_at
    });
  } catch (error) {
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

var http = require("../../../lib/http");
var auth = require("../../../lib/auth");
var documents = require("../../../lib/documents");

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

    var status = await documents.getDocumentStatus(
      documentId,
      authContext.session.user_id
    );

    if (!status) {
      return http.badRequest(res, "Document not found.");
    }

    return http.ok(res, {
      document: status
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

function getRouteParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

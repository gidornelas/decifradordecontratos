var http = require("../../lib/http");
var auth = require("../../lib/auth");
var documents = require("../../lib/documents");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    return http.ok(res, {
      documents: await documents.listDocumentsByUser(
        authContext.session.user_id,
        10
      )
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

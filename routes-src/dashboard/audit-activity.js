var http = require("../../lib/http");
var auth = require("../../lib/auth");
var documentAudit = require("../../lib/document-audit");

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
      events: await documentAudit.listRecentEventsByUser(
        authContext.session.user_id,
        12
      )
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

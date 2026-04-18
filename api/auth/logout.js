var auth = require("../../lib/auth");
var http = require("../../lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (authContext) {
      await auth.deleteSessionByToken(authContext.token);
    }

    auth.clearSessionCookie(res);

    return http.ok(res, {
      success: true
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

var auth = require("../../lib/auth");
var http = require("../../lib/http");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "auth.logout"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (authContext) {
      currentUserId = authContext.session.user_id;
      await auth.deleteSessionByToken(authContext.token);
    }

    auth.clearSessionCookie(res);

    observability.logRequestComplete(req, res, {
      route: "auth.logout",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      success: true
    });
  } catch (error) {
    observability.logAppError("auth.logout_failed", error, {
      route: "auth.logout",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "auth.logout",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

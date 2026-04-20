var http = require("../../lib/http");
var auth = require("../../lib/auth");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "auth.me"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "auth.me",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var session = authContext.session;
    currentUserId = session.user_id;

    observability.logRequestComplete(req, res, {
      route: "auth.me",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      user: {
        id: session.user_id,
        email: session.email,
        fullName: session.full_name,
        planCode: session.plan_code,
        createdAt: session.created_at
      },
      session: {
        id: session.session_id,
        expiresAt: session.expires_at,
        rememberSession: session.remember_session
      }
    });
  } catch (error) {
    observability.logAppError("auth.me_failed", error, {
      route: "auth.me",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "auth.me",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

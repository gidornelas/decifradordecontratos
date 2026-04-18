var http = require("../../lib/http");
var auth = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var session = authContext.session;

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
    return http.internalError(res, error);
  }
};

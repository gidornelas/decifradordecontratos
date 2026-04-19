var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return getCurrentUser(req, res);
  }

  if (req.method === "PATCH") {
    return updateCurrentUser(req, res);
  }

  return http.methodNotAllowed(res, ["GET", "PATCH"]);
};

async function getCurrentUser(req, res) {
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    return http.ok(res, {
      user: serializeUser(authContext.session)
    });
  } catch (error) {
    return http.internalError(res, error);
  }
}

async function updateCurrentUser(req, res) {
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var body = await http.parseJsonBody(req);
    var fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!fullName) {
      return http.badRequest(res, "fullName is required.");
    }

    if (fullName.length > 120) {
      return http.badRequest(res, "fullName must have at most 120 characters.");
    }

    var result = await db.query(
      [
        "update users",
        "set full_name = $2",
        "where id = $1",
        "returning id, email, full_name, plan_code, created_at"
      ].join(" "),
      [authContext.session.user_id, fullName]
    );

    if (!result.rows.length) {
      return http.badRequest(res, "User not found.");
    }

    return http.ok(res, {
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        planCode: result.rows[0].plan_code,
        createdAt: result.rows[0].created_at
      },
      message: "Profile updated successfully."
    });
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      return http.badRequest(res, error.message);
    }

    return http.internalError(res, error);
  }
}

function serializeUser(session) {
  return {
    id: session.user_id,
    email: session.email,
    fullName: session.full_name,
    planCode: session.plan_code,
    createdAt: session.created_at
  };
}

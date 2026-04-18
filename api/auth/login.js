var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  try {
    var body = await http.parseJsonBody(req);
    var email = normalizeEmail(body.email);
    var password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return http.badRequest(res, "Email and password are required.");
    }

    var userResult = await db.query(
      "select id, email, full_name, plan_code, password_hash, created_at from users where email = $1 limit 1",
      [email]
    );

    if (!userResult.rows.length) {
      return http.unauthorized(res, "Invalid email or password.");
    }

    var user = userResult.rows[0];

    if (!auth.verifyPassword(password, user.password_hash)) {
      return http.unauthorized(res, "Invalid email or password.");
    }

    var session = await auth.createSession(user.id, Boolean(body.rememberSession));
    auth.setSessionCookie(res, session.token, session.expiresAt);

    return http.ok(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        planCode: user.plan_code,
        createdAt: user.created_at
      },
      session: {
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      return http.badRequest(res, error.message);
    }

    return http.internalError(res, error);
  }
};

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

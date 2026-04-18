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
    var fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!email || !password) {
      return http.badRequest(res, "Email and password are required.");
    }

    if (password.length < 8) {
      return http.badRequest(res, "Password must have at least 8 characters.");
    }

    var existing = await db.query("select id from users where email = $1 limit 1", [email]);
    if (existing.rows.length) {
      return http.badRequest(res, "An account with this email already exists.");
    }

    var passwordHash = auth.hashPassword(password);
    var insertResult = await db.query(
      [
        "insert into users (email, password_hash, full_name)",
        "values ($1, $2, $3)",
        "returning id, email, full_name, plan_code, created_at"
      ].join(" "),
      [email, passwordHash, fullName || null]
    );

    var user = insertResult.rows[0];
    var session = await auth.createSession(user.id, Boolean(body.rememberSession));
    auth.setSessionCookie(res, session.token, session.expiresAt);

    return http.created(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        planCode: user.plan_code,
        createdAt: user.created_at
      },
      session: {
        expiresAt: session.expiresAt
      },
      message: "Registration request completed."
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

var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");
var rateLimit = require("../../lib/rate-limit");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return http.methodNotAllowed(res, ["POST"]);
  }

  observability.logRequestStart(req, res, { route: "auth.login" });

  try {
    var limit = await rateLimit.consumeRateLimit({
      scope: "auth.login.ip",
      subject: observability.getClientIp(req),
      windowMs: 15 * 60 * 1000,
      maxRequests: 20
    });

    if (!limit.allowed) {
      observability.logSecurityEvent(req, res, "rate_limit_exceeded", {
        route: "auth.login",
        scope: "auth.login.ip",
        requestCount: limit.requestCount
      });
      observability.logRequestComplete(req, res, {
        route: "auth.login",
        statusCode: 429
      });
      return http.tooManyRequests(
        res,
        "Too many login attempts. Please try again later.",
        { retryAfterSeconds: limit.retryAfterSeconds }
      );
    }

    var body = await http.parseJsonBody(req);
    var email = normalizeEmail(body.email);
    var password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      observability.logRequestComplete(req, res, {
        route: "auth.login",
        statusCode: 400
      });
      return http.badRequest(res, "Email and password are required.");
    }

    var userResult = await db.query(
      "select id, email, full_name, plan_code, password_hash, created_at from users where email = $1 limit 1",
      [email]
    );

    if (!userResult.rows.length) {
      observability.logSecurityEvent(req, res, "login_failed", {
        route: "auth.login",
        email: email
      });
      observability.logRequestComplete(req, res, {
        route: "auth.login",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid email or password.");
    }

    var user = userResult.rows[0];

    if (!auth.verifyPassword(password, user.password_hash)) {
      observability.logSecurityEvent(req, res, "login_failed", {
        route: "auth.login",
        email: email,
        userId: user.id
      });
      observability.logRequestComplete(req, res, {
        route: "auth.login",
        statusCode: 401,
        userId: user.id
      });
      return http.unauthorized(res, "Invalid email or password.");
    }

    var session = await auth.createSession(user.id, Boolean(body.rememberSession));
    auth.setSessionCookie(res, session.token, session.expiresAt);

    observability.logRequestComplete(req, res, {
      route: "auth.login",
      statusCode: 200,
      userId: user.id
    });
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
      observability.logRequestComplete(req, res, {
        route: "auth.login",
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    observability.logRequestComplete(req, res, {
      route: "auth.login",
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

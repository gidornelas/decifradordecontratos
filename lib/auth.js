var crypto = require("crypto");
var db = require("./db");
var env = require("./env");

var SESSION_COOKIE_NAME = "decodificador_session";
var SESSION_TTL_MS = 1000 * 60 * 60 * 24;
var REMEMBER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function hashPassword(password, salt) {
  var actualSalt = salt || crypto.randomBytes(16).toString("hex");
  var hash = crypto.scryptSync(password, actualSalt, 64).toString("hex");
  return actualSalt + ":" + hash;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || storedHash.indexOf(":") === -1) {
    return false;
  }

  var parts = storedHash.split(":");
  var recalculated = hashPassword(password, parts[0]);
  return crypto.timingSafeEqual(Buffer.from(recalculated), Buffer.from(storedHash));
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token) {
  return crypto
    .createHmac("sha256", env.getServerEnv().authSecret)
    .update(token)
    .digest("hex");
}

async function createSession(userId, rememberSession) {
  var token = generateSessionToken();
  var tokenHash = hashSessionToken(token);
  var expiresAt = new Date(Date.now() + (rememberSession ? REMEMBER_SESSION_TTL_MS : SESSION_TTL_MS));

  await db.query(
    [
      "insert into sessions (user_id, token_hash, remember_session, expires_at)",
      "values ($1, $2, $3, $4)"
    ].join(" "),
    [userId, tokenHash, Boolean(rememberSession), expiresAt]
  );

  return {
    token: token,
    expiresAt: expiresAt.toISOString()
  };
}

async function deleteSessionByToken(token) {
  if (!token) {
    return;
  }

  await db.query("delete from sessions where token_hash = $1", [hashSessionToken(token)]);
}

async function getSessionFromRequest(req) {
  var token = getSessionTokenFromRequest(req);

  if (!token) {
    return null;
  }

  var result = await db.query(
    [
      "select s.id as session_id, s.user_id, s.expires_at, s.remember_session,",
      "u.email, u.full_name, u.plan_code, u.created_at",
      "from sessions s",
      "join users u on u.id = s.user_id",
      "where s.token_hash = $1 and s.expires_at > timezone('utc', now())",
      "limit 1"
    ].join(" "),
    [hashSessionToken(token)]
  );

  if (!result.rows.length) {
    return null;
  }

  return {
    token: token,
    session: result.rows[0]
  };
}

function getSessionTokenFromRequest(req) {
  var cookies = parseCookies(req);

  if (cookies[SESSION_COOKIE_NAME]) {
    return cookies[SESSION_COOKIE_NAME];
  }

  var bearer = require("./http").getBearerToken(req);
  return bearer || null;
}

function parseCookies(req) {
  var header = req.headers.cookie || "";

  return header.split(";").reduce(function (acc, pair) {
    var trimmed = pair.trim();

    if (!trimmed) {
      return acc;
    }

    var separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return acc;
    }

    var key = trimmed.slice(0, separatorIndex).trim();
    var value = trimmed.slice(separatorIndex + 1).trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function setSessionCookie(res, token, expiresAt) {
  var secure = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  var parts = [
    SESSION_COOKIE_NAME + "=" + encodeURIComponent(token),
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Expires=" + new Date(expiresAt).toUTCString()
  ];

  if (secure) {
    parts.push("Secure");
  }

  appendSetCookie(res, parts.join("; "));
}

function clearSessionCookie(res) {
  var secure = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  var parts = [
    SESSION_COOKIE_NAME + "=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ];

  if (secure) {
    parts.push("Secure");
  }

  appendSetCookie(res, parts.join("; "));
}

function appendSetCookie(res, value) {
  var current = res.getHeader("Set-Cookie");

  if (!current) {
    res.setHeader("Set-Cookie", value);
    return;
  }

  if (Array.isArray(current)) {
    res.setHeader("Set-Cookie", current.concat(value));
    return;
  }

  res.setHeader("Set-Cookie", [current, value]);
}

module.exports = {
  clearSessionCookie: clearSessionCookie,
  createSession: createSession,
  deleteSessionByToken: deleteSessionByToken,
  getSessionFromRequest: getSessionFromRequest,
  hashPassword: hashPassword,
  parseCookies: parseCookies,
  setSessionCookie: setSessionCookie,
  verifyPassword: verifyPassword
};

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

    var limit = getPositiveInt(req, "limit", 12, 100);

    return http.ok(res, {
      events: await documentAudit.listRecentEventsByUser(
        authContext.session.user_id,
        limit
      )
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

function getPositiveInt(req, name, fallback, max) {
  var raw = req && req.query ? req.query[name] : null;
  var value = Number(raw);

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(value), max || value);
}

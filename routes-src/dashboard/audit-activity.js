var http = require("../../lib/http");
var auth = require("../../lib/auth");
var documentAudit = require("../../lib/document-audit");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "dashboard.auditActivity"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "dashboard.auditActivity",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;
    var limit = getPositiveInt(req, "limit", 12, 100);
    var events = await documentAudit.listRecentEventsByUser(
      currentUserId,
      limit
    );

    observability.logRequestComplete(req, res, {
      route: "dashboard.auditActivity",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId,
      limit: limit,
      eventCount: events.length
    });
    return http.ok(res, {
      events: events
    });
  } catch (error) {
    observability.logAppError("dashboard.audit_activity_failed", error, {
      route: "dashboard.auditActivity",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "dashboard.auditActivity",
      userId: currentUserId,
      statusCode: 500
    });
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

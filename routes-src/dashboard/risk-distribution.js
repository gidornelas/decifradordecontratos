var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "dashboard.riskDistribution"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "dashboard.riskDistribution",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var result = await db.query(
      [
        "select severity, count(*)::int as count",
        "from analysis_risks r",
        "join analyses a on a.id = r.analysis_id",
        "join documents d on d.id = a.document_id",
        "where a.user_id = $1 and d.deleted_at is null",
        "group by severity"
      ].join(" "),
      [currentUserId]
    );

    var distribution = {
      critical: 0,
      attention: 0,
      safe: 0
    };

    (result.rows || []).forEach(function (row) {
      if (row.severity === "critical") distribution.critical = row.count;
      if (row.severity === "attention") distribution.attention = row.count;
      if (row.severity === "safe") distribution.safe = row.count;
    });

    observability.logRequestComplete(req, res, {
      route: "dashboard.riskDistribution",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      distribution: distribution
    });
  } catch (error) {
    observability.logAppError("dashboard.risk_distribution_failed", error, {
      route: "dashboard.riskDistribution",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "dashboard.riskDistribution",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

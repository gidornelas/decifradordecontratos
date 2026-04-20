var http = require("../lib/http");
var observability = require("../lib/observability");

var handlers = {
  overview: require("../routes-src/dashboard/overview"),
  recentDocuments: require("../routes-src/dashboard/recent-documents"),
  riskDistribution: require("../routes-src/dashboard/risk-distribution"),
  auditActivity: require("../routes-src/dashboard/audit-activity")
};

module.exports = async function handler(req, res) {
  var action = getStringParam(req, "action");
  var routeHandler = handlers[action];

  if (!routeHandler) {
    observability.logAppEvent("warn", "dashboard.invalid_action", {
      route: "api.dashboard",
      action: action || null,
      path: req.url || "/api/dashboard"
    });
    return http.notFound(res, "Dashboard route not found.");
  }

  return routeHandler(req, res);
};

function getStringParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

var http = require("../lib/http");
var observability = require("../lib/observability");

var handlers = {
  me: require("../routes-src/users/me")
};

module.exports = async function handler(req, res) {
  var action = getStringParam(req, "action");
  var routeHandler = handlers[action];

  if (!routeHandler) {
    observability.logAppEvent("warn", "users.invalid_action", {
      route: "api.users",
      action: action || null,
      path: req.url || "/api/users"
    });
    return http.notFound(res, "User route not found.");
  }

  return routeHandler(req, res);
};

function getStringParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

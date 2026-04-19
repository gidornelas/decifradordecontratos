var http = require("../lib/http");

var handlers = {
  login: require("../routes-src/auth/login"),
  register: require("../routes-src/auth/register"),
  me: require("../routes-src/auth/me"),
  logout: require("../routes-src/auth/logout")
};

module.exports = async function handler(req, res) {
  var action = getStringParam(req, "action");
  var routeHandler = handlers[action];

  if (!routeHandler) {
    return http.notFound(res, "Auth route not found.");
  }

  return routeHandler(req, res);
};

function getStringParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

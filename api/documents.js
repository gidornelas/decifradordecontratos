var http = require("../lib/http");
var observability = require("../lib/observability");

var handlers = {
  index: require("../routes-src/documents/index"),
  detail: require("../routes-src/documents/[id]"),
  file: require("../routes-src/documents/[id]/file"),
  analysis: require("../routes-src/documents/[id]/analysis"),
  status: require("../routes-src/documents/[id]/status"),
  restore: require("../routes-src/documents/[id]/restore")
};

module.exports = async function handler(req, res) {
  var action = getStringParam(req, "action") || "index";
  var routeHandler = handlers[action];

  if (!routeHandler) {
    observability.logAppEvent("warn", "documents.invalid_action", {
      route: "api.documents",
      action: action || null,
      path: req.url || "/api/documents"
    });
    return http.notFound(res, "Document route not found.");
  }

  return routeHandler(req, res);
};

function getStringParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

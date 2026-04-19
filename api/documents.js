var http = require("../lib/http");

var handlers = {
  index: require("../routes-src/documents/index"),
  detail: require("../routes-src/documents/[id]"),
  file: require("../routes-src/documents/[id]/file"),
  analysis: require("../routes-src/documents/[id]/analysis"),
  status: require("../routes-src/documents/[id]/status")
};

module.exports = async function handler(req, res) {
  var action = getStringParam(req, "action") || "index";
  var routeHandler = handlers[action];

  if (!routeHandler) {
    return http.notFound(res, "Document route not found.");
  }

  return routeHandler(req, res);
};

function getStringParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

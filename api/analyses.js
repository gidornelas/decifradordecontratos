var http = require("../lib/http");

var handlers = {
  index: require("../routes-src/analyses/index"),
  detail: require("../routes-src/analyses/[id]"),
  reprocess: require("../routes-src/analyses/[id]/reprocess"),
  risks: require("../routes-src/analyses/[id]/risks"),
  guidedReview: require("../routes-src/analyses/[id]/guided-review")
};

module.exports = async function handler(req, res) {
  var action = getStringParam(req, "action") || "index";
  var routeHandler = handlers[action];

  if (!routeHandler) {
    return http.notFound(res, "Analysis route not found.");
  }

  return routeHandler(req, res);
};

function getStringParam(req, name) {
  var value = req.query && req.query[name];
  return typeof value === "string" ? value.trim() : "";
}

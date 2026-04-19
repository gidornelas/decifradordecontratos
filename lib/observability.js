var crypto = require("crypto");

function getOrCreateRequestContext(req, res) {
  if (req.__requestContext) {
    return req.__requestContext;
  }

  var requestId =
    getHeaderValue(req, "x-request-id") ||
    getHeaderValue(req, "x-vercel-id") ||
    crypto.randomUUID();

  var startedAt = Date.now();
  var context = {
    requestId: requestId,
    startedAt: startedAt,
    method: req.method || "GET",
    path: getRequestPath(req),
    ip: getClientIp(req),
    userAgent: getHeaderValue(req, "user-agent") || ""
  };

  req.__requestContext = context;
  res.setHeader("X-Request-Id", requestId);

  return context;
}

function logRequestStart(req, res, meta) {
  var context = getOrCreateRequestContext(req, res);

  console.info(
    "[request_start]",
    buildLogPayload(context, meta)
  );

  return context;
}

function logRequestComplete(req, res, meta) {
  var context = getOrCreateRequestContext(req, res);

  console.info(
    "[request_complete]",
    buildLogPayload(context, Object.assign({
      durationMs: Date.now() - context.startedAt
    }, meta || {}))
  );

  return context;
}

function logSecurityEvent(req, res, eventName, meta) {
  var context = getOrCreateRequestContext(req, res);

  console.warn(
    "[security_event]",
    buildLogPayload(context, Object.assign({
      event: eventName
    }, meta || {}))
  );

  return context;
}

function getClientIp(req) {
  var forwarded = getHeaderValue(req, "x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (req.socket && req.socket.remoteAddress) {
    return String(req.socket.remoteAddress);
  }

  return "unknown";
}

function getRequestPath(req) {
  if (req.url) {
    return String(req.url).split("?")[0];
  }

  return "/";
}

function getHeaderValue(req, name) {
  return req && req.headers && req.headers[name]
    ? String(req.headers[name]).trim()
    : "";
}

function buildLogPayload(context, meta) {
  return Object.assign(
    {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      ip: context.ip
    },
    meta || {}
  );
}

module.exports = {
  getClientIp: getClientIp,
  getOrCreateRequestContext: getOrCreateRequestContext,
  logRequestComplete: logRequestComplete,
  logRequestStart: logRequestStart,
  logSecurityEvent: logSecurityEvent
};

function setDefaultHeaders(res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
}

function sendJson(res, statusCode, payload) {
  setDefaultHeaders(res);
  res.status(statusCode).end(JSON.stringify(payload));
}

function ok(res, payload) {
  sendJson(res, 200, payload);
}

function created(res, payload) {
  sendJson(res, 201, payload);
}

function badRequest(res, message, details) {
  sendJson(res, 400, {
    error: "bad_request",
    message: message,
    details: details || null
  });
}

function unauthorized(res, message) {
  sendJson(res, 401, {
    error: "unauthorized",
    message: message || "Authentication required."
  });
}

function tooManyRequests(res, message, details) {
  if (details && details.retryAfterSeconds) {
    res.setHeader("Retry-After", String(details.retryAfterSeconds));
  }

  sendJson(res, 429, {
    error: "too_many_requests",
    message: message || "Too many requests.",
    details: details || null
  });
}

function methodNotAllowed(res, allowedMethods) {
  res.setHeader("Allow", allowedMethods.join(", "));
  sendJson(res, 405, {
    error: "method_not_allowed",
    message: "Method not allowed."
  });
}

function internalError(res, error) {
  console.error("[internal_error]", {
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : null
  });

  sendJson(res, 500, {
    error: "internal_error",
    message: "Unexpected server error.",
    details: process.env.NODE_ENV === "development" ? String(error && error.message || error) : null
  });
}

function getBearerToken(req) {
  var header = req.headers.authorization || "";

  if (!header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return header.slice(7).trim() || null;
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  var raw = await readRequestBody(req);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
}

function readRequestBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];

    req.on("data", function (chunk) {
      chunks.push(chunk);
    });

    req.on("end", function () {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", function (error) {
      reject(error);
    });
  });
}

module.exports = {
  badRequest: badRequest,
  created: created,
  getBearerToken: getBearerToken,
  internalError: internalError,
  methodNotAllowed: methodNotAllowed,
  ok: ok,
  parseJsonBody: parseJsonBody,
  tooManyRequests: tooManyRequests,
  unauthorized: unauthorized
};

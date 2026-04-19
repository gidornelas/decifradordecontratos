var db = require("./db");

async function consumeRateLimit(input) {
  var scope = String(input && input.scope ? input.scope : "").trim();
  var subject = String(input && input.subject ? input.subject : "").trim();
  var windowMs = Number(input && input.windowMs);
  var maxRequests = Number(input && input.maxRequests);

  if (!scope || !subject) {
    throw new Error("Rate limit scope and subject are required.");
  }

  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("Rate limit window must be a positive number.");
  }

  if (!Number.isFinite(maxRequests) || maxRequests <= 0) {
    throw new Error("Rate limit maxRequests must be a positive number.");
  }

  var now = new Date();
  var windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  var result = await db.query(
    [
      "insert into api_rate_limits (scope, subject, window_start, request_count, last_request_at)",
      "values ($1, $2, $3, 1, timezone('utc', now()))",
      "on conflict (scope, subject, window_start)",
      "do update set request_count = api_rate_limits.request_count + 1,",
      "last_request_at = timezone('utc', now())",
      "returning request_count"
    ].join(" "),
    [scope, subject, windowStart.toISOString()]
  ).catch(function (error) {
    if (
      error &&
      error.message &&
      error.message.toLowerCase().indexOf("api_rate_limits") !== -1 &&
      error.message.toLowerCase().indexOf("does not exist") !== -1
    ) {
      console.warn("[rate_limit_disabled]", {
        scope: scope,
        reason: "api_rate_limits table is missing"
      });

      return {
        rows: [{ request_count: 1 }]
      };
    }

    throw error;
  });

  var requestCount = Number(result.rows[0] && result.rows[0].request_count) || 0;
  var resetAt = new Date(windowStart.getTime() + windowMs);

  return {
    allowed: requestCount <= maxRequests,
    requestCount: requestCount,
    maxRequests: maxRequests,
    resetAt: resetAt.toISOString(),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((resetAt.getTime() - now.getTime()) / 1000)
    )
  };
}

module.exports = {
  consumeRateLimit: consumeRateLimit
};

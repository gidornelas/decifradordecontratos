var env = require("../../lib/env");
var auth = require("../../lib/auth");
var http = require("../../lib/http");
var observability = require("../../lib/observability");
var retention = require("../../lib/retention");

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return http.methodNotAllowed(res, ["GET", "POST"]);
  }

  observability.logRequestStart(req, res, { route: "internal.retention" });

  try {
    var serverEnv = env.getServerEnv();

    if (!serverEnv.cronSecret) {
      observability.logRequestComplete(req, res, {
        route: "internal.retention",
        statusCode: 503
      });
      return http.badRequest(
        res,
        "Retention job secret is not configured on the server."
      );
    }

    var providedSecret = getProvidedSecret(req);

    if (
      !providedSecret ||
      !auth.secretsEqual(providedSecret, serverEnv.cronSecret)
    ) {
      observability.logSecurityEvent(req, res, "invalid_cron_secret", {
        route: "internal.retention"
      });
      observability.logRequestComplete(req, res, {
        route: "internal.retention",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid cron secret.");
    }

    var result = await retention.runRetentionJobs({
      documentDays: getNumberQueryParam(req, "documentDays"),
      sessionDays: getNumberQueryParam(req, "sessionDays"),
      rateLimitDays: getNumberQueryParam(req, "rateLimitDays"),
      batchSize: getNumberQueryParam(req, "batchSize")
    });

    observability.logRequestComplete(req, res, {
      route: "internal.retention",
      statusCode: 200,
      deletedDocuments: result.documents.deletedCount,
      deletedSessions: result.sessions.deletedCount,
      deletedRateLimits: result.rateLimits.deletedCount
    });

    return http.ok(res, {
      ok: true,
      job: "retention",
      result: result
    });
  } catch (error) {
    observability.logRequestComplete(req, res, {
      route: "internal.retention",
      statusCode: 500
    });
    return http.internalError(res, error);
  }
};

function getProvidedSecret(req) {
  var authHeader = req.headers.authorization || "";
  var cronHeader = req.headers["x-cron-secret"] || "";

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return String(cronHeader || "").trim();
}

function getNumberQueryParam(req, name) {
  var value = req.query && req.query[name];

  if (value == null || value === "") {
    return null;
  }

  var parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

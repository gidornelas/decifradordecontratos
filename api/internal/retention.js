var env = require("../../lib/env");
var auth = require("../../lib/auth");
var http = require("../../lib/http");
var observability = require("../../lib/observability");
var retention = require("../../lib/retention");
var retentionJobRuns = require("../../lib/retention-job-runs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return http.methodNotAllowed(res, ["GET", "POST"]);
  }

  var requestContext = observability.logRequestStart(req, res, {
    route: "internal.retention"
  });
  var startedAt = new Date();

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
    var finishedAt = new Date();

    await retentionJobRuns.recordRun({
      jobName: "retention",
      status: "completed",
      triggerSource: getTriggerSource(req),
      requestId: requestContext.requestId,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      result: result
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
      result: result,
      execution: {
        requestId: requestContext.requestId,
        triggerSource: getTriggerSource(req),
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString()
      }
    });
  } catch (error) {
    var failedAt = new Date();

    try {
      await retentionJobRuns.recordRun({
        jobName: "retention",
        status: "failed",
        triggerSource: getTriggerSource(req),
        requestId: requestContext.requestId,
        startedAt: startedAt.toISOString(),
        finishedAt: failedAt.toISOString(),
        durationMs: failedAt.getTime() - startedAt.getTime(),
        errorMessage: error && error.message ? error.message : "Unknown retention error"
      });
    } catch (loggingError) {
      console.warn("[retention_job_run_log_failed]", {
        requestId: requestContext.requestId,
        message: loggingError && loggingError.message ? loggingError.message : "Unknown logging error"
      });
    }

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

function getTriggerSource(req) {
  var userAgent = String((req.headers && req.headers["user-agent"]) || "").toLowerCase();

  if (userAgent.indexOf("vercel-cron/") !== -1) {
    return "vercel-cron";
  }

  if (req.method === "POST") {
    return "manual-post";
  }

  return "manual-get";
}

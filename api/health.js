var env = require("../lib/env");
var db = require("../lib/db");
var http = require("../lib/http");
var storage = require("../lib/storage");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return http.methodNotAllowed(res, ["GET"]);
  }

  try {
    var publicEnv = env.getPublicEnv();
    var serverEnv = env.getServerEnv();
    var dbResult = await db.query(
      [
        "select",
        "1 as ok,",
        "to_regclass('public.api_rate_limits') is not null as api_rate_limits_table_ready"
      ].join(" ")
    );
    var storageStatus = storage.getStorageConfigStatus();
    var retentionWindows = {
      documentDays: normalizePositiveNumber(serverEnv.retentionDocumentDays),
      sessionDays: normalizePositiveNumber(serverEnv.retentionSessionDays),
      rateLimitDays: normalizePositiveNumber(serverEnv.retentionRateLimitDays)
    };

    return http.ok(res, {
      ok: true,
      service: "decodificador-api",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      checks: {
        appUrlConfigured: Boolean(publicEnv.appUrl),
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        databaseReachable: Boolean(dbResult.rows[0] && dbResult.rows[0].ok === 1),
        authSecretConfigured: Boolean(process.env.AUTH_SECRET),
        claudeApiKeyConfigured: Boolean(process.env.CLAUDE_API_KEY),
        cronSecretConfigured: Boolean(serverEnv.cronSecret),
        rateLimitTableConfigured: Boolean(
          dbResult.rows[0] && dbResult.rows[0].api_rate_limits_table_ready
        ),
        retentionWindowsConfigured: Boolean(
          retentionWindows.documentDays &&
            retentionWindows.sessionDays &&
            retentionWindows.rateLimitDays
        ),
        privateStorageConfigured: storageStatus.configured,
        privateStorageMissingVars: storageStatus.missingVars,
        retentionWindows: retentionWindows
      },
      features: {
        usersApi: true,
        protectedDocumentDownload: true,
        retentionJob: true
      }
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

function normalizePositiveNumber(value) {
  var parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

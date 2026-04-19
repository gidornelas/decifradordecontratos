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
    var dbResult = await db.query("select 1 as ok");
    var storageStatus = storage.getStorageConfigStatus();

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
        privateStorageConfigured: storageStatus.configured,
        privateStorageMissingVars: storageStatus.missingVars
      }
    });
  } catch (error) {
    return http.internalError(res, error);
  }
};

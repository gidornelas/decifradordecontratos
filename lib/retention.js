var db = require("./db");
var env = require("./env");
var storage = require("./storage");

async function runRetentionJobs(options) {
  var serverEnv = env.getServerEnv();
  var config = Object.assign(
    {
      documentDays: normalizePositiveInt(
        options && options.documentDays,
        serverEnv.retentionDocumentDays,
        30
      ),
      trashDays: normalizePositiveInt(
        options && options.trashDays,
        serverEnv.trashRetentionDays,
        7
      ),
      sessionDays: normalizePositiveInt(
        options && options.sessionDays,
        serverEnv.retentionSessionDays,
        14
      ),
      rateLimitDays: normalizePositiveInt(
        options && options.rateLimitDays,
        serverEnv.retentionRateLimitDays,
        7
      ),
      batchSize: normalizePositiveInt(options && options.batchSize, 100, 100)
    },
    options || {}
  );

  var documents = await pruneExpiredDocuments(config.documentDays, config.trashDays, config.batchSize);
  var sessions = await pruneExpiredSessions(config.sessionDays);
  var rateLimits = await pruneStaleRateLimits(config.rateLimitDays);

  return {
    config: {
      documentDays: config.documentDays,
      trashDays: config.trashDays,
      sessionDays: config.sessionDays,
      rateLimitDays: config.rateLimitDays,
      batchSize: config.batchSize
    },
    documents: documents,
    sessions: sessions,
    rateLimits: rateLimits
  };
}

async function pruneExpiredDocuments(retentionDays, trashDays, batchSize) {
  var cutoff = buildCutoffDate(retentionDays);
  var trashCutoff = buildCutoffDate(trashDays);
  var candidates = await db.query(
    [
      "select id, user_id, storage_bucket, storage_path, deleted_at, purge_after_at",
      "from documents",
      "where (deleted_at is not null and ((purge_after_at is not null and purge_after_at < timezone('utc', now())) or (purge_after_at is null and deleted_at < $1)))",
      "or (deleted_at is null and created_at < $2)",
      "order by coalesce(purge_after_at, created_at) asc",
      "limit $3"
    ].join(" "),
    [trashCutoff.toISOString(), cutoff.toISOString(), batchSize]
  );

  var deletedCount = 0;
  var storageDeletedCount = 0;
  var storageDeleteFailures = 0;

  for (var i = 0; i < candidates.rows.length; i += 1) {
    var item = candidates.rows[i];

    if (
      item.storage_path &&
      item.storage_bucket &&
      storage.isStorageConfigured()
    ) {
      try {
        await storage.deletePrivateDocument({
          storageBucket: item.storage_bucket,
          storagePath: item.storage_path
        });
        storageDeletedCount += 1;
      } catch (error) {
        storageDeleteFailures += 1;
      }
    }

    await db.query("delete from documents where id = $1", [item.id]);
    deletedCount += 1;
  }

  return {
    cutoff: cutoff.toISOString(),
    trashCutoff: trashCutoff.toISOString(),
    scanned: candidates.rows.length,
    deletedCount: deletedCount,
    storageDeletedCount: storageDeletedCount,
    storageDeleteFailures: storageDeleteFailures
  };
}

async function pruneExpiredSessions(retentionDays) {
  var cutoff = buildCutoffDate(retentionDays);
  var result = await db.query(
    [
      "delete from sessions",
      "where expires_at < $1 or created_at < $1"
    ].join(" "),
    [cutoff.toISOString()]
  );

  return {
    cutoff: cutoff.toISOString(),
    deletedCount: result.rowCount || 0
  };
}

async function pruneStaleRateLimits(retentionDays) {
  var cutoff = buildCutoffDate(retentionDays);

  try {
    var result = await db.query(
      [
        "delete from api_rate_limits",
        "where last_request_at < $1"
      ].join(" "),
      [cutoff.toISOString()]
    );

    return {
      cutoff: cutoff.toISOString(),
      deletedCount: result.rowCount || 0
    };
  } catch (error) {
    if (
      error &&
      error.message &&
      error.message.toLowerCase().indexOf("api_rate_limits") !== -1 &&
      error.message.toLowerCase().indexOf("does not exist") !== -1
    ) {
      return {
        cutoff: cutoff.toISOString(),
        deletedCount: 0,
        skipped: true
      };
    }

    throw error;
  }
}

function buildCutoffDate(retentionDays) {
  return new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
}

function normalizePositiveInt(value, fallback, hardFallback) {
  var parsed = Number(value);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(parsed);
  }

  if (Number.isFinite(Number(fallback)) && Number(fallback) > 0) {
    return Math.round(Number(fallback));
  }

  return hardFallback;
}

module.exports = {
  runRetentionJobs: runRetentionJobs
};

function getRequiredEnv(name) {
  var value = process.env[name];

  if (!value) {
    throw new Error("Missing required environment variable: " + name);
  }

  return value;
}

function getOptionalEnv(name, fallback) {
  var value = process.env[name];
  return value == null || value === "" ? fallback : value;
}

function getPublicEnv() {
  return {
    appUrl: getOptionalEnv("APP_URL", "http://localhost:3000")
  };
}

function getServerEnv() {
  return {
    appUrl: getOptionalEnv("APP_URL", "http://localhost:3000"),
    authSecret: getRequiredEnv("AUTH_SECRET"),
    claudeApiKey: getOptionalEnv("CLAUDE_API_KEY", ""),
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    databaseUrlUnpooled: getOptionalEnv("DATABASE_URL_UNPOOLED", getRequiredEnv("DATABASE_URL")),
    storageS3Endpoint: getOptionalEnv("STORAGE_S3_ENDPOINT", ""),
    storageS3Region: getOptionalEnv("STORAGE_S3_REGION", "auto"),
    storageS3Bucket: getOptionalEnv("STORAGE_S3_BUCKET", ""),
    storageS3AccessKeyId: getOptionalEnv("STORAGE_S3_ACCESS_KEY_ID", ""),
    storageS3SecretAccessKey: getOptionalEnv("STORAGE_S3_SECRET_ACCESS_KEY", ""),
    storageS3ForcePathStyle:
      String(getOptionalEnv("STORAGE_S3_FORCE_PATH_STYLE", "true")).toLowerCase() !== "false",
    cronSecret: getOptionalEnv("CRON_SECRET", ""),
    retentionDocumentDays: Number(getOptionalEnv("RETENTION_DOCUMENT_DAYS", "30")),
    retentionSessionDays: Number(getOptionalEnv("RETENTION_SESSION_DAYS", "14")),
    retentionRateLimitDays: Number(getOptionalEnv("RETENTION_RATE_LIMIT_DAYS", "7"))
  };
}

module.exports = {
  getOptionalEnv: getOptionalEnv,
  getPublicEnv: getPublicEnv,
  getRequiredEnv: getRequiredEnv,
  getServerEnv: getServerEnv
};

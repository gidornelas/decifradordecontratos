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
    databaseUrlUnpooled: getOptionalEnv("DATABASE_URL_UNPOOLED", getRequiredEnv("DATABASE_URL"))
  };
}

module.exports = {
  getOptionalEnv: getOptionalEnv,
  getPublicEnv: getPublicEnv,
  getRequiredEnv: getRequiredEnv,
  getServerEnv: getServerEnv
};

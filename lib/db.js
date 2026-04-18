var Pool = require("pg").Pool;
var env = require("./env");

var pool;

function getPool() {
  if (!pool) {
    var serverEnv = env.getServerEnv();

    pool = new Pool({
      connectionString: serverEnv.databaseUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      query_timeout: 5000,
      statement_timeout: 5000
    });
  }

  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function withClient(fn) {
  var client = await getPool().connect();

  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

module.exports = {
  getPool: getPool,
  query: query,
  withClient: withClient
};

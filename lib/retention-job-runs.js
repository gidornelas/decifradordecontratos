var db = require("./db");

async function recordRun(input) {
  var payload = input || {};

  try {
    await db.query(
      [
        "insert into retention_job_runs (",
        "job_name, status, trigger_source, request_id, started_at, finished_at, duration_ms, result, error_message",
        ") values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)"
      ].join(" "),
      [
        payload.jobName || "retention",
        payload.status || "completed",
        payload.triggerSource || null,
        payload.requestId || null,
        payload.startedAt || new Date().toISOString(),
        payload.finishedAt || new Date().toISOString(),
        normalizeDuration(payload.durationMs),
        JSON.stringify(payload.result || {}),
        payload.errorMessage || null
      ]
    );

    return { logged: true };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { logged: false, skipped: true };
    }

    throw error;
  }
}

async function getLatestRun(jobName) {
  try {
    var result = await db.query(
      [
        "select id, job_name, status, trigger_source, request_id, started_at, finished_at, duration_ms, result, error_message",
        "from retention_job_runs",
        "where job_name = $1",
        "order by started_at desc",
        "limit 1"
      ].join(" "),
      [jobName || "retention"]
    );

    return result.rows[0] || null;
  } catch (error) {
    if (isMissingTableError(error)) {
      return null;
    }

    throw error;
  }
}

function isMissingTableError(error) {
  var message = error && error.message ? String(error.message).toLowerCase() : "";
  return message.indexOf("retention_job_runs") !== -1 && message.indexOf("does not exist") !== -1;
}

function normalizeDuration(value) {
  var parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

module.exports = {
  getLatestRun: getLatestRun,
  recordRun: recordRun
};

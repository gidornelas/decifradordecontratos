var db = require("./db");

async function appendEvent(input) {
  var payload = input || {};

  try {
    await db.query(
      [
        "insert into document_audit_events (",
        "document_id, user_id, actor_user_id, event_name, metadata",
        ") values ($1, $2, $3, $4, $5::jsonb)"
      ].join(" "),
      [
        payload.documentId || null,
        payload.userId || null,
        payload.actorUserId || null,
        payload.eventName || "unknown",
        JSON.stringify(payload.metadata || {})
      ]
    );

    return { logged: true };
  } catch (error) {
    if (isMissingAuditTableError(error)) {
      return { logged: false, skipped: true };
    }

    throw error;
  }
}

async function listRecentEventsByUser(userId, limit) {
  try {
    var result = await db.query(
      [
        "select id, document_id, user_id, actor_user_id, event_name, metadata, created_at",
        "from document_audit_events",
        "where user_id = $1",
        "order by created_at desc",
        "limit $2"
      ].join(" "),
      [userId, normalizeLimit(limit, 10)]
    );

    return result.rows || [];
  } catch (error) {
    if (isMissingAuditTableError(error)) {
      return [];
    }

    throw error;
  }
}

function isMissingAuditTableError(error) {
  var message = error && error.message ? String(error.message).toLowerCase() : "";
  return message.indexOf("document_audit_events") !== -1 && message.indexOf("does not exist") !== -1;
}

function normalizeLimit(limit, fallback) {
  var value = Number(limit);

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(50, Math.round(value)));
}

module.exports = {
  appendEvent: appendEvent,
  listRecentEventsByUser: listRecentEventsByUser
};

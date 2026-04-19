var db = require("./db");

async function listDocumentsByUser(userId, limit) {
  var result = await db.query(
    [
      "select id, original_name, mime_type, extension, size_bytes, processing_status,",
      "error_message, created_at, updated_at",
      "from documents",
      "where user_id = $1",
      "order by created_at desc",
      "limit $2"
    ].join(" "),
    [userId, normalizeLimit(limit, 20)]
  );

  return result.rows || [];
}

async function getDocumentById(documentId, userId) {
  var result = await db.query(
    [
      "select id, user_id, original_name, mime_type, extension, size_bytes,",
      "storage_bucket, storage_path, extracted_text, processing_status, error_message,",
      "created_at, updated_at",
      "from documents",
      "where id = $1 and user_id = $2",
      "limit 1"
    ].join(" "),
    [documentId, userId]
  );

  return result.rows.length ? result.rows[0] : null;
}

async function deleteDocumentById(documentId, userId) {
  var result = await db.query(
    [
      "delete from documents",
      "where id = $1 and user_id = $2",
      "returning id"
    ].join(" "),
    [documentId, userId]
  );

  return Boolean(result.rows.length);
}

async function getDocumentStatus(documentId, userId) {
  var result = await db.query(
    [
      "select id, processing_status, error_message, created_at, updated_at",
      "from documents",
      "where id = $1 and user_id = $2",
      "limit 1"
    ].join(" "),
    [documentId, userId]
  );

  return result.rows.length ? result.rows[0] : null;
}

function normalizeLimit(limit, fallback) {
  var value = Number(limit);

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(100, Math.round(value)));
}

module.exports = {
  deleteDocumentById: deleteDocumentById,
  getDocumentById: getDocumentById,
  getDocumentStatus: getDocumentStatus,
  listDocumentsByUser: listDocumentsByUser
};

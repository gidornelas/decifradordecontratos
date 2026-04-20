var db = require("./db");

async function listDocumentsByUser(userId, limit) {
  var result = await db.query(
    [
      "select id, original_name, mime_type, extension, size_bytes, processing_status,",
      "error_message, created_at, updated_at",
      "from documents",
      "where user_id = $1 and deleted_at is null",
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
      "where id = $1 and user_id = $2 and deleted_at is null",
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
      "where id = $1 and user_id = $2 and deleted_at is null",
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
      "where id = $1 and user_id = $2 and deleted_at is null",
      "limit 1"
    ].join(" "),
    [documentId, userId]
  );

  return result.rows.length ? result.rows[0] : null;
}

async function getDeletedDocumentById(documentId, userId) {
  var result = await db.query(
    [
      "select id, user_id, original_name, mime_type, extension, size_bytes,",
      "storage_bucket, storage_path, extracted_text, processing_status, error_message,",
      "created_at, updated_at, deleted_at, purge_after_at",
      "from documents",
      "where id = $1 and user_id = $2 and deleted_at is not null",
      "limit 1"
    ].join(" "),
    [documentId, userId]
  );

  return result.rows.length ? result.rows[0] : null;
}

async function softDeleteDocumentById(documentId, userId, purgeAfterIso) {
  var result = await db.query(
    [
      "update documents",
      "set deleted_at = timezone('utc', now()), purge_after_at = $3, updated_at = timezone('utc', now())",
      "where id = $1 and user_id = $2 and deleted_at is null",
      "returning id, deleted_at, purge_after_at"
    ].join(" "),
    [documentId, userId, purgeAfterIso]
  );

  return result.rows.length ? result.rows[0] : null;
}

async function restoreDocumentById(documentId, userId) {
  var result = await db.query(
    [
      "update documents",
      "set deleted_at = null, purge_after_at = null, updated_at = timezone('utc', now())",
      "where id = $1 and user_id = $2 and deleted_at is not null",
      "and (purge_after_at is null or purge_after_at > timezone('utc', now()))",
      "returning id"
    ].join(" "),
    [documentId, userId]
  );

  return Boolean(result.rows.length);
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
  getDeletedDocumentById: getDeletedDocumentById,
  getDocumentById: getDocumentById,
  getDocumentStatus: getDocumentStatus,
  listDocumentsByUser: listDocumentsByUser,
  restoreDocumentById: restoreDocumentById,
  softDeleteDocumentById: softDeleteDocumentById
};

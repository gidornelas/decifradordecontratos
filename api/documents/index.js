var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return listDocuments(req, res);
  }

  if (req.method === "POST") {
    return createDocument(req, res);
  }

  return http.methodNotAllowed(res, ["GET", "POST"]);
};

async function listDocuments(req, res) {
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var response = await db.query(
      [
        "select id, original_name, mime_type, extension, size_bytes, processing_status, created_at",
        "from documents",
        "where user_id = $1",
        "order by created_at desc",
        "limit 20"
      ].join(" "),
      [authContext.session.user_id]
    );

    return http.ok(res, {
      documents: response.rows || []
    });
  } catch (error) {
    return http.internalError(res, error);
  }
}

async function createDocument(req, res) {
  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      return http.unauthorized(res, "Invalid or missing session.");
    }

    var body = await http.parseJsonBody(req);
    var originalName =
      typeof body.originalName === "string" ? body.originalName.trim() : "";
    var mimeType = typeof body.mimeType === "string" ? body.mimeType.trim() : "";
    var extension = getExtension(
      typeof body.extension === "string" && body.extension
        ? body.extension
        : originalName
    );
    var textContent =
      typeof body.textContent === "string" ? body.textContent.trim() : "";
    var sizeBytes = normalizeSize(body.sizeBytes);

    if (!originalName) {
      return http.badRequest(res, "Document name is required.");
    }

    if (!isAllowedExtension(extension)) {
      return http.badRequest(
        res,
        "Only PDF, DOCX and TXT files are supported right now."
      );
    }

    if (sizeBytes <= 0) {
      return http.badRequest(res, "Document size must be greater than zero.");
    }

    if (sizeBytes > 10 * 1024 * 1024) {
      return http.badRequest(res, "Document size exceeds the 10 MB limit.");
    }

    var extractedText =
      extension === "txt" && textContent ? textContent.slice(0, 200000) : null;

    var insertResult = await db.query(
      [
        "insert into documents (",
        "user_id, original_name, mime_type, extension, size_bytes, extracted_text, processing_status",
        ") values ($1, $2, $3, $4, $5, $6, $7)",
        "returning id, original_name, mime_type, extension, size_bytes, processing_status, created_at"
      ].join(" "),
      [
        authContext.session.user_id,
        originalName,
        mimeType || guessMimeType(extension),
        extension,
        sizeBytes,
        extractedText,
        "uploaded"
      ]
    );

    return http.created(res, {
      document: insertResult.rows[0],
      message: "Document uploaded successfully."
    });
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      return http.badRequest(res, error.message);
    }

    return http.internalError(res, error);
  }
}

function normalizeSize(value) {
  var size = Number(value);
  return Number.isFinite(size) ? Math.max(0, Math.round(size)) : 0;
}

function getExtension(value) {
  var normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!normalized) {
    return "";
  }

  if (normalized.indexOf(".") !== -1) {
    var parts = normalized.split(".");
    return parts.pop();
  }

  return normalized;
}

function isAllowedExtension(extension) {
  return extension === "pdf" || extension === "docx" || extension === "txt";
}

function guessMimeType(extension) {
  if (extension === "pdf") {
    return "application/pdf";
  }

  if (extension === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (extension === "txt") {
    return "text/plain";
  }

  return "application/octet-stream";
}

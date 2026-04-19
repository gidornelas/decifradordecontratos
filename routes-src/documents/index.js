var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");
var documents = require("../../lib/documents");
var extraction = require("../../lib/document-extraction");
var storage = require("../../lib/storage");
var rateLimit = require("../../lib/rate-limit");
var observability = require("../../lib/observability");

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

    return http.ok(res, {
      documents: await documents.listDocumentsByUser(authContext.session.user_id, 20)
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

    observability.logRequestStart(req, res, {
      route: "documents.create",
      userId: authContext.session.user_id
    });

    var limit = await rateLimit.consumeRateLimit({
      scope: "documents.create.user",
      subject: authContext.session.user_id,
      windowMs: 60 * 60 * 1000,
      maxRequests: 30
    });

    if (!limit.allowed) {
      observability.logSecurityEvent(req, res, "rate_limit_exceeded", {
        route: "documents.create",
        userId: authContext.session.user_id,
        requestCount: limit.requestCount
      });
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        userId: authContext.session.user_id,
        statusCode: 429
      });
      return http.tooManyRequests(
        res,
        "Upload limit reached for this hour. Please try again later.",
        { retryAfterSeconds: limit.retryAfterSeconds }
      );
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
    var base64Content =
      typeof body.base64Content === "string" ? body.base64Content.trim() : "";
    var sizeBytes = normalizeSize(body.sizeBytes);

    if (!originalName) {
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        userId: authContext.session.user_id,
        statusCode: 400
      });
      return http.badRequest(res, "Document name is required.");
    }

    if (!isAllowedExtension(extension)) {
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        userId: authContext.session.user_id,
        statusCode: 400
      });
      return http.badRequest(
        res,
        "Only PDF, DOCX and TXT files are supported right now."
      );
    }

    if (sizeBytes <= 0) {
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        userId: authContext.session.user_id,
        statusCode: 400
      });
      return http.badRequest(res, "Document size must be greater than zero.");
    }

    if (sizeBytes > 10 * 1024 * 1024) {
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        userId: authContext.session.user_id,
        statusCode: 400
      });
      return http.badRequest(res, "Document size exceeds the 10 MB limit.");
    }

    var extractedPayload = await extraction.extractDocumentPayload({
      extension: extension,
      mimeType: mimeType,
      textContent: textContent,
      base64Content: base64Content
    });
    var extractedText = extractedPayload.extractedText || null;
    var processingStatus =
      extractedPayload.hasBinarySource && !extractedText ? "failed" : "uploaded";

    var insertResult = await db.query(
      [
        "insert into documents (",
        "user_id, original_name, mime_type, extension, size_bytes, extracted_text, processing_status, error_message",
        ") values ($1, $2, $3, $4, $5, $6, $7, $8)",
        "returning id, original_name, mime_type, extension, size_bytes, processing_status, error_message, storage_bucket, storage_path, created_at"
      ].join(" "),
      [
        authContext.session.user_id,
        originalName,
        mimeType || guessMimeType(extension),
        extension,
        sizeBytes,
        extractedText,
        processingStatus,
        extractedPayload.hasBinarySource && !extractedText
          ? "No readable text could be extracted from this file."
          : null
      ]
    );

    var createdDocument = insertResult.rows[0];

    if (base64Content && storage.isStorageConfigured()) {
      try {
        var storedObject = await storage.uploadPrivateDocument({
          documentId: createdDocument.id,
          userId: authContext.session.user_id,
          originalName: originalName,
          extension: extension,
          mimeType: mimeType || guessMimeType(extension),
          base64Content: base64Content
        });

        var updatedDocument = await db.query(
          [
            "update documents",
            "set storage_bucket = $2, storage_path = $3, updated_at = timezone('utc', now())",
            "where id = $1",
            "returning id, original_name, mime_type, extension, size_bytes, processing_status, error_message, storage_bucket, storage_path, created_at"
          ].join(" "),
          [createdDocument.id, storedObject.bucket, storedObject.key]
        );

        createdDocument = updatedDocument.rows[0];
      } catch (storageError) {
        await db.query(
          [
            "update documents",
            "set processing_status = $2, error_message = $3, updated_at = timezone('utc', now())",
            "where id = $1"
          ].join(" "),
          [createdDocument.id, "failed", storageError.message || "Private storage upload failed."]
        );

        throw storageError;
      }
    }

    observability.logRequestComplete(req, res, {
      route: "documents.create",
      userId: authContext.session.user_id,
      statusCode: 201,
      documentId: createdDocument.id,
      storageEnabled: Boolean(createdDocument.storage_path)
    });
    return http.created(res, {
      document: createdDocument,
      message: extractedText
        ? "Document uploaded and text extracted successfully."
        : "Document uploaded successfully."
    });
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    if (
      error &&
      /Binary document content is required|not valid base64|Unsupported document type|Document extension is required|bad XRef entry|Invalid PDF structure|Corrupted zip|End of data reached/i.test(
        error.message || ""
      )
    ) {
      observability.logRequestComplete(req, res, {
        route: "documents.create",
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    observability.logRequestComplete(req, res, {
      route: "documents.create",
      statusCode: 500
    });
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

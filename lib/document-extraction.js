var mammoth = require("mammoth");
var pdfParse = require("pdf-parse");

var MAX_EXTRACTED_TEXT_LENGTH = 200000;

async function extractDocumentPayload(input) {
  var extension = normalizeExtension(input && input.extension);
  var mimeType = normalizeString(input && input.mimeType);
  var textContent = normalizeString(input && input.textContent);
  var base64Content = normalizeString(input && input.base64Content);
  var maxBinaryBytes = normalizePositiveNumber(input && input.maxBinaryBytes);

  if (!extension) {
    throw new Error("Document extension is required for extraction.");
  }

  if (extension === "txt") {
    return {
      extractedText: normalizeExtractedText(
        textContent || decodeBuffer(base64Content, maxBinaryBytes).toString("utf8")
      ),
      hasBinarySource: Boolean(base64Content)
    };
  }

  if (!base64Content) {
    return {
      extractedText: "",
      hasBinarySource: false
    };
  }

  var buffer = decodeBuffer(base64Content, maxBinaryBytes);

  if (extension === "pdf") {
    return {
      extractedText: await extractPdfText(buffer),
      hasBinarySource: true
    };
  }

  if (extension === "docx") {
    return {
      extractedText: await extractDocxText(buffer),
      hasBinarySource: true
    };
  }

  throw new Error(
    "Unsupported document type for extraction: " + (mimeType || extension) + "."
  );
}

async function extractPdfText(buffer) {
  var result = await pdfParse(buffer);
  return normalizeExtractedText(result && result.text ? result.text : "");
}

async function extractDocxText(buffer) {
  var result = await mammoth.extractRawText({ buffer: buffer });
  return normalizeExtractedText(result && result.value ? result.value : "");
}

function decodeBuffer(value, maxBytes) {
  var normalized = normalizeString(value);

  if (!normalized) {
    throw new Error("Binary document content is required for this file type.");
  }

  var data = normalized.replace(/^data:[^;]+;base64,/, "");

  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(data)) {
    throw new Error("Document content is not valid base64.");
  }

  var estimatedSize = estimateBase64DecodedSize(data);

  if (maxBytes && estimatedSize > maxBytes) {
    throw new Error("Document size exceeds the 10 MB limit.");
  }

  return Buffer.from(data, "base64");
}

function normalizeExtractedText(value) {
  var text = normalizeString(value)
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text.slice(0, MAX_EXTRACTED_TEXT_LENGTH);
}

function normalizeExtension(value) {
  var normalized = normalizeString(value).toLowerCase();

  if (!normalized) {
    return "";
  }

  if (normalized.indexOf(".") !== -1) {
    return normalized.split(".").pop();
  }

  return normalized;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePositiveNumber(value) {
  var parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function estimateBase64DecodedSize(value) {
  var normalized = String(value || "").replace(/\s+/g, "");

  if (!normalized) {
    return 0;
  }

  var padding = 0;

  if (normalized.slice(-2) === "==") {
    padding = 2;
  } else if (normalized.slice(-1) === "=") {
    padding = 1;
  }

  return Math.floor((normalized.length * 3) / 4) - padding;
}

module.exports = {
  estimateBase64DecodedSize: estimateBase64DecodedSize,
  extractDocumentPayload: extractDocumentPayload
};

var S3 = require("@aws-sdk/client-s3");
var env = require("./env");

var client;
var STORAGE_ENV_NAMES = [
  "STORAGE_S3_ENDPOINT",
  "STORAGE_S3_BUCKET",
  "STORAGE_S3_ACCESS_KEY_ID",
  "STORAGE_S3_SECRET_ACCESS_KEY"
];

function getStorageConfigStatus() {
  var serverEnv = env.getServerEnv();
  var valuesByName = {
    STORAGE_S3_ENDPOINT: serverEnv.storageS3Endpoint,
    STORAGE_S3_BUCKET: serverEnv.storageS3Bucket,
    STORAGE_S3_ACCESS_KEY_ID: serverEnv.storageS3AccessKeyId,
    STORAGE_S3_SECRET_ACCESS_KEY: serverEnv.storageS3SecretAccessKey
  };
  var missingVars = STORAGE_ENV_NAMES.filter(function (name) {
    return !valuesByName[name];
  });

  return {
    configured: missingVars.length === 0,
    missingVars: missingVars
  };
}

function isStorageConfigured() {
  return getStorageConfigStatus().configured;
}

function getClient() {
  if (!isStorageConfigured()) {
    throw new Error("Private storage is not configured.");
  }

  if (!client) {
    var serverEnv = env.getServerEnv();

    client = new S3.S3Client({
      region: serverEnv.storageS3Region,
      endpoint: serverEnv.storageS3Endpoint,
      forcePathStyle: serverEnv.storageS3ForcePathStyle,
      credentials: {
        accessKeyId: serverEnv.storageS3AccessKeyId,
        secretAccessKey: serverEnv.storageS3SecretAccessKey
      }
    });
  }

  return client;
}

function getBucketName() {
  return env.getServerEnv().storageS3Bucket;
}

async function uploadPrivateDocument(input) {
  var fileBuffer = decodeBase64(
    input && input.base64Content,
    input && input.maxBytes
  );
  var key = buildDocumentKey(input);

  await getClient().send(
    new S3.PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: fileBuffer,
      ContentType: input.mimeType || "application/octet-stream"
    })
  );

  return {
    bucket: getBucketName(),
    key: key,
    sizeBytes: fileBuffer.length
  };
}

async function deletePrivateDocument(input) {
  if (!input || !input.storagePath) {
    return false;
  }

  await getClient().send(
    new S3.DeleteObjectCommand({
      Bucket: input.storageBucket || getBucketName(),
      Key: input.storagePath
    })
  );

  return true;
}

async function getPrivateDocument(input) {
  var response = await getClient().send(
    new S3.GetObjectCommand({
      Bucket: input.storageBucket || getBucketName(),
      Key: input.storagePath
    })
  );

  return {
    body: await streamToBuffer(response.Body),
    contentType: response.ContentType || "application/octet-stream",
    contentLength: response.ContentLength || 0,
    lastModified: response.LastModified || null
  };
}

function buildDocumentKey(input) {
  var extension = normalizeExtension(input && input.extension);
  var originalName = sanitizeFileName(input && input.originalName);
  var fileName = originalName || ("document" + (extension ? "." + extension : ""));

  return [
    "users",
    String(input.userId || "anonymous"),
    "documents",
    String(input.documentId || Date.now()),
    fileName
  ].join("/");
}

function sanitizeFileName(value) {
  var normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function normalizeExtension(value) {
  var normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  if (normalized.indexOf(".") !== -1) {
    return normalized.split(".").pop();
  }

  return normalized;
}

function decodeBase64(value, maxBytes) {
  var normalized = String(value || "").trim().replace(/^data:[^;]+;base64,/, "");

  if (!normalized) {
    throw new Error("Binary document content is required for private storage.");
  }

  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(normalized)) {
    throw new Error("Binary document content is not valid base64.");
  }

  var estimatedSize = estimateBase64DecodedSize(normalized);

  if (maxBytes && estimatedSize > maxBytes) {
    throw new Error("Document size exceeds the 10 MB limit.");
  }

  return Buffer.from(normalized, "base64");
}

function streamToBuffer(stream) {
  if (!stream) {
    return Promise.resolve(Buffer.alloc(0));
  }

  if (Buffer.isBuffer(stream)) {
    return Promise.resolve(stream);
  }

  return new Promise(function (resolve, reject) {
    var chunks = [];

    stream.on("data", function (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    stream.on("end", function () {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", function (error) {
      reject(error);
    });
  });
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
  deletePrivateDocument: deletePrivateDocument,
  getStorageConfigStatus: getStorageConfigStatus,
  getPrivateDocument: getPrivateDocument,
  isStorageConfigured: isStorageConfigured,
  uploadPrivateDocument: uploadPrivateDocument
};

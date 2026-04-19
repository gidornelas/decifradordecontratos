var Anthropic = require("@anthropic-ai/sdk");
var env = require("./env");

var DEFAULT_MODEL = "claude-3-7-sonnet-latest";
var DEFAULT_PROMPT_VERSION = "contract-analysis-v1";
var FALLBACK_MODELS = [
  "claude-3-7-sonnet-latest",
  "claude-sonnet-4-20250514",
  "claude-3-5-haiku-latest"
];
var anthropicClient;

function getClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: env.getServerEnv().claudeApiKey
    });
  }

  return anthropicClient;
}

function isConfigured() {
  return Boolean(env.getServerEnv().claudeApiKey);
}

async function analyzeContractText(input) {
  if (!isConfigured()) {
    throw new Error("Claude API key is not configured.");
  }

  var documentName = input && input.documentName ? input.documentName : "documento";
  var contractText = input && input.contractText ? String(input.contractText) : "";

  if (!contractText.trim()) {
    throw new Error("Contract text is empty.");
  }

  var preferredModel = env.getOptionalEnv("CLAUDE_MODEL", DEFAULT_MODEL);
  var promptVersion = env.getOptionalEnv("CLAUDE_PROMPT_VERSION", DEFAULT_PROMPT_VERSION);
  var attemptModels = buildModelAttemptList(preferredModel);
  var completedAttempt = await createAnalysisWithFallback({
    attemptModels: attemptModels,
    promptVersion: promptVersion,
    documentName: documentName,
    contractText: contractText
  });
  var rawText = extractTextFromResponse(completedAttempt.response);
  var parsed = parseJsonResponse(rawText);

  return {
    model: completedAttempt.model,
    promptVersion: promptVersion,
    rawText: rawText,
    result: normalizeAnalysis(parsed)
  };
}

async function createAnalysisWithFallback(input) {
  var errors = [];
  var index;

  for (index = 0; index < input.attemptModels.length; index += 1) {
    try {
      return {
        model: input.attemptModels[index],
        response: await requestAnalysis(
          input.attemptModels[index],
          input.promptVersion,
          input.documentName,
          input.contractText
        )
      };
    } catch (error) {
      if (!isModelNotFoundError(error)) {
        throw error;
      }

      errors.push(formatModelError(input.attemptModels[index], error));
    }
  }

  throw new Error(
    "Claude model is unavailable. Attempts: " + errors.join(" | ")
  );
}

async function requestAnalysis(model, promptVersion, documentName, contractText) {
  return getClient().messages.create({
    model: model,
    max_tokens: 4096,
    temperature: 0.2,
    system: buildSystemPrompt(promptVersion),
    messages: [
      {
        role: "user",
        content: buildUserPrompt(documentName, contractText)
      }
    ]
  });
}

function buildModelAttemptList(preferredModel) {
  var seen = Object.create(null);

  return [preferredModel].concat(FALLBACK_MODELS).filter(function (model) {
    var normalized = String(model || "").trim();

    if (!normalized || seen[normalized]) {
      return false;
    }

    seen[normalized] = true;
    return true;
  });
}

function isModelNotFoundError(error) {
  var status = error && error.status;
  var type = safeString(error && error.error && error.error.type, "");
  var message = safeString(error && error.message, "").toLowerCase();

  return (
    status === 404 ||
    type === "not_found_error" ||
    message.indexOf("model:") !== -1 ||
    message.indexOf("not found") !== -1
  );
}

function formatModelError(model, error) {
  var type = safeString(error && error.error && error.error.type, "unknown_error");
  var message = safeString(error && error.message, "no message");

  return model + " => " + type + ": " + message;
}

function buildSystemPrompt(promptVersion) {
  return [
    "Voce e um analista de contratos para um produto chamado Decodificador de Contratos.",
    "Seu trabalho e identificar o tipo de contrato, calcular risco, resumir o documento,",
    "listar riscos relevantes e explicar clausulas em linguagem simples.",
    "Responda somente JSON valido, sem markdown, sem comentarios e sem texto fora do JSON.",
    'Use este schema exato: {"contractType":"","riskScore":0,"summary":"","recommendation":"","risks":[],"clauses":[]}.',
    'Cada item de "risks" deve seguir: {"clauseNumber":"","title":"","severity":"critical|attention|safe","category":"","originalExcerpt":"","simplifiedExplanation":"","impactDescription":"","recommendation":"","confidence":"high|medium|low"}.',
    'Cada item de "clauses" deve seguir: {"clauseNumber":"","clauseTitle":"","originalText":"","simplifiedText":"","whyItMatters":"","severity":"critical|attention|safe","confidence":"high|medium|low"}.',
    "Retorne entre 3 e 8 riscos quando houver material suficiente.",
    "Retorne entre 5 e 12 clausulas resumidas quando houver material suficiente.",
    "Prompt version: " + promptVersion + "."
  ].join(" ");
}

function buildUserPrompt(documentName, contractText) {
  return [
    "Analise este contrato e gere o JSON solicitado.",
    "Nome do documento: " + documentName + ".",
    "Texto do contrato:",
    contractText.slice(0, 120000)
  ].join("\n\n");
}

function extractTextFromResponse(response) {
  if (!response || !Array.isArray(response.content)) {
    return "";
  }

  return response.content
    .filter(function (block) {
      return block && block.type === "text" && typeof block.text === "string";
    })
    .map(function (block) {
      return block.text;
    })
    .join("\n")
    .trim();
}

function parseJsonResponse(rawText) {
  var cleaned = String(rawText || "").trim();

  if (!cleaned) {
    throw new Error("Claude returned an empty response.");
  }

  if (cleaned.indexOf("```") !== -1) {
    cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    var firstBrace = cleaned.indexOf("{");
    var lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Claude response was not valid JSON.");
  }
}

function normalizeAnalysis(payload) {
  var risks = Array.isArray(payload && payload.risks) ? payload.risks : [];
  var clauses = Array.isArray(payload && payload.clauses) ? payload.clauses : [];

  return {
    contractType: safeString(payload && payload.contractType, "Contrato"),
    riskScore: clampInteger(payload && payload.riskScore, 0, 100, 0),
    summary: safeString(payload && payload.summary, ""),
    recommendation: safeString(payload && payload.recommendation, ""),
    risks: risks.slice(0, 12).map(normalizeRisk),
    clauses: clauses.slice(0, 20).map(normalizeClause)
  };
}

function normalizeRisk(item) {
  return {
    clauseNumber: safeString(item && item.clauseNumber, ""),
    title: safeString(item && item.title, "Risco identificado"),
    severity: normalizeSeverity(item && item.severity),
    category: safeString(item && item.category, ""),
    originalExcerpt: safeString(item && item.originalExcerpt, ""),
    simplifiedExplanation: safeString(item && item.simplifiedExplanation, ""),
    impactDescription: safeString(item && item.impactDescription, ""),
    recommendation: safeString(item && item.recommendation, ""),
    confidence: normalizeConfidence(item && item.confidence)
  };
}

function normalizeClause(item) {
  return {
    clauseNumber: safeString(item && item.clauseNumber, ""),
    clauseTitle: safeString(item && item.clauseTitle, "Clausula"),
    originalText: safeString(item && item.originalText, ""),
    simplifiedText: safeString(item && item.simplifiedText, ""),
    whyItMatters: safeString(item && item.whyItMatters, ""),
    severity: normalizeSeverity(item && item.severity),
    confidence: normalizeConfidence(item && item.confidence)
  };
}

function normalizeSeverity(value) {
  var normalized = safeString(value, "attention").toLowerCase();

  if (normalized === "critical" || normalized === "attention" || normalized === "safe") {
    return normalized;
  }

  if (normalized === "high" || normalized === "danger" || normalized === "critico") {
    return "critical";
  }

  if (normalized === "low" || normalized === "ok" || normalized === "seguro") {
    return "safe";
  }

  return "attention";
}

function normalizeConfidence(value) {
  var normalized = safeString(value, "medium").toLowerCase();

  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }

  return "medium";
}

function safeString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  var trimmed = value.trim();
  return trimmed || fallback;
}

function clampInteger(value, min, max, fallback) {
  var number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(number)));
}

module.exports = {
  analyzeContractText: analyzeContractText,
  isConfigured: isConfigured
};

var Anthropic = require("@anthropic-ai/sdk");
var env = require("./env");

var DEFAULT_MODEL = "claude-3-7-sonnet-latest";
var DEFAULT_PROMPT_VERSION = "contract-analysis-v1";
var DEFAULT_OUTBOUND_PROMPT_VERSION = "outbound-contract-review-v1";
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
  var completedAttempt = await runJsonAnalysis({
    preferredModel: preferredModel,
    promptVersion: promptVersion,
    systemPrompt: buildContractSystemPrompt(promptVersion),
    userPrompt: buildContractUserPrompt(documentName, contractText),
    onEvent: input && input.onEvent
  });

  return {
    model: completedAttempt.model,
    attemptedModels: completedAttempt.attemptedModels,
    attemptCount: completedAttempt.attemptCount,
    fallbackUsed: completedAttempt.fallbackUsed,
    promptVersion: promptVersion,
    rawText: completedAttempt.rawText,
    result: normalizeAnalysis(completedAttempt.parsed)
  };
}

async function analyzeOutboundContractPair(input) {
  if (!isConfigured()) {
    throw new Error("Claude API key is not configured.");
  }

  var contractDocumentName = input && input.contractDocumentName ? input.contractDocumentName : "contrato";
  var proposalDocumentName = input && input.proposalDocumentName ? input.proposalDocumentName : "proposta";
  var contractText = input && input.contractText ? String(input.contractText) : "";
  var proposalText = input && input.proposalText ? String(input.proposalText) : "";
  var internalNotes = input && input.internalNotes ? String(input.internalNotes) : "";

  if (!contractText.trim()) {
    throw new Error("Contract text is empty.");
  }

  if (!proposalText.trim()) {
    throw new Error("Proposal text is empty.");
  }

  var preferredModel = env.getOptionalEnv("CLAUDE_MODEL", DEFAULT_MODEL);
  var promptVersion = env.getOptionalEnv("CLAUDE_OUTBOUND_PROMPT_VERSION", DEFAULT_OUTBOUND_PROMPT_VERSION);
  var completedAttempt = await runJsonAnalysis({
    preferredModel: preferredModel,
    promptVersion: promptVersion,
    systemPrompt: buildOutboundSystemPrompt(promptVersion),
    userPrompt: buildOutboundUserPrompt(
      contractDocumentName,
      contractText,
      proposalDocumentName,
      proposalText,
      internalNotes
    ),
    onEvent: input && input.onEvent
  });

  return {
    model: completedAttempt.model,
    attemptedModels: completedAttempt.attemptedModels,
    attemptCount: completedAttempt.attemptCount,
    fallbackUsed: completedAttempt.fallbackUsed,
    promptVersion: promptVersion,
    rawText: completedAttempt.rawText,
    result: normalizeOutboundAnalysis(completedAttempt.parsed)
  };
}

async function runJsonAnalysis(input) {
  var attemptModels = buildModelAttemptList(input.preferredModel);
  var completedAttempt = await createAnalysisWithFallback({
    attemptModels: attemptModels,
    promptVersion: input.promptVersion,
    systemPrompt: input.systemPrompt,
    userPrompt: input.userPrompt,
    onEvent: input.onEvent
  });
  var rawText = extractTextFromResponse(completedAttempt.response);

  return {
    model: completedAttempt.model,
    attemptedModels: completedAttempt.attemptedModels,
    attemptCount: completedAttempt.attemptCount,
    fallbackUsed: completedAttempt.fallbackUsed,
    rawText: rawText,
    parsed: parseJsonResponse(rawText)
  };
}

async function createAnalysisWithFallback(input) {
  var errors = [];
  var attemptedModels = [];
  var index;

  for (index = 0; index < input.attemptModels.length; index += 1) {
    var currentModel = input.attemptModels[index];

    attemptedModels.push(currentModel);
    emitEvent(input.onEvent, "claude_attempt_started", {
      model: currentModel,
      attemptNumber: index + 1
    });

    try {
      var response = await requestAnalysis({
        model: currentModel,
        systemPrompt: input.systemPrompt,
        userPrompt: input.userPrompt
      });

      emitEvent(input.onEvent, "claude_attempt_succeeded", {
        model: currentModel,
        attemptNumber: index + 1,
        fallbackUsed: index > 0
      });

      return {
        model: currentModel,
        response: response,
        attemptedModels: attemptedModels.slice(),
        attemptCount: attemptedModels.length,
        fallbackUsed: index > 0
      };
    } catch (error) {
      emitEvent(input.onEvent, isModelNotFoundError(error) ? "claude_attempt_fallback" : "claude_attempt_failed", {
        model: currentModel,
        attemptNumber: index + 1,
        message: error && error.message ? error.message : "Unknown Claude error",
        status: error && error.status ? error.status : null
      });

      if (!isModelNotFoundError(error)) {
        throw error;
      }

      errors.push(formatModelError(currentModel, error));
    }
  }

  throw new Error(
    "Claude model is unavailable. Attempts: " + errors.join(" | ")
  );
}

function emitEvent(onEvent, eventName, payload) {
  if (typeof onEvent === "function") {
    onEvent(eventName, payload || {});
  }
}

async function requestAnalysis(input) {
  return getClient().messages.create({
    model: input.model,
    max_tokens: 4096,
    temperature: 0.2,
    system: input.systemPrompt,
    messages: [
      {
        role: "user",
        content: input.userPrompt
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

function buildContractSystemPrompt(promptVersion) {
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

function buildContractUserPrompt(documentName, contractText) {
  return [
    "Analise este contrato e gere o JSON solicitado.",
    "Nome do documento: " + documentName + ".",
    "Texto do contrato:",
    contractText.slice(0, 120000)
  ].join("\n\n");
}

function buildOutboundSystemPrompt(promptVersion) {
  return [
    "Voce e um revisor de contratos antes do envio ao cliente.",
    "Seu trabalho e comparar a proposta comercial com o contrato final e avaliar se o documento esta pronto para ser enviado.",
    "Procure divergencias de valor, escopo, prazo, SLA, obrigacoes, anexos, placeholders, lacunas e inconsistencias comerciais ou juridicas.",
    "Responda somente JSON valido, sem markdown, sem comentarios e sem texto fora do JSON.",
    'Use este schema exato: {"contractType":"","summary":"","proposalConsistencyScore":0,"sendReadinessScore":0,"finalVerdict":"ready_to_send|ready_with_notes|not_ready","executiveRecommendation":"","issues":[],"checklist":[],"matchedPoints":[],"missingPoints":[]}.',
    'Cada item de "issues" deve seguir: {"issueType":"proposal_mismatch|missing_information|placeholder_found|commercial_inconsistency|legal_inconsistency|approval_warning|send_readiness","severity":"critical|attention|safe","title":"","description":"","sourceExcerpt":"","referenceExcerpt":"","recommendedFix":""}.',
    'Cada item de "checklist" deve seguir: {"title":"","description":"","status":"pending|done"}.',
    'Cada item de "matchedPoints" deve seguir: {"topic":"","proposalText":"","contractText":"","status":"aligned"}.',
    'Cada item de "missingPoints" deve seguir: {"topic":"","proposalText":"","contractText":"","status":"missing|mismatch"}.',
    "Priorize clareza operacional para quem vai enviar o contrato.",
    "Se houver bloqueadores, use finalVerdict not_ready.",
    "Prompt version: " + promptVersion + "."
  ].join(" ");
}

function buildOutboundUserPrompt(contractDocumentName, contractText, proposalDocumentName, proposalText, internalNotes) {
  return [
    "Compare a proposta com o contrato final e gere o JSON solicitado.",
    "Contrato final: " + contractDocumentName + ".",
    "Proposta de referencia: " + proposalDocumentName + ".",
    "Observacoes internas:",
    internalNotes.trim() ? internalNotes.slice(0, 4000) : "Nenhuma observacao interna informada.",
    "Texto da proposta:",
    proposalText.slice(0, 80000),
    "Texto do contrato final:",
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

function normalizeOutboundAnalysis(payload) {
  var issues = Array.isArray(payload && payload.issues) ? payload.issues : [];
  var checklist = Array.isArray(payload && payload.checklist) ? payload.checklist : [];
  var matchedPoints = Array.isArray(payload && payload.matchedPoints) ? payload.matchedPoints : [];
  var missingPoints = Array.isArray(payload && payload.missingPoints) ? payload.missingPoints : [];

  return {
    contractType: safeString(payload && payload.contractType, "Contrato"),
    summary: safeString(payload && payload.summary, ""),
    proposalConsistencyScore: clampInteger(payload && payload.proposalConsistencyScore, 0, 100, 0),
    sendReadinessScore: clampInteger(payload && payload.sendReadinessScore, 0, 100, 0),
    finalVerdict: normalizeFinalVerdict(payload && payload.finalVerdict),
    executiveRecommendation: safeString(payload && payload.executiveRecommendation, ""),
    issues: issues.slice(0, 20).map(normalizeOutboundIssue),
    checklist: checklist.slice(0, 20).map(normalizeChecklistItem),
    matchedPoints: matchedPoints.slice(0, 20).map(normalizeComparisonPoint.bind(null, "aligned")),
    missingPoints: missingPoints.slice(0, 20).map(normalizeComparisonPoint.bind(null, "missing"))
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

function normalizeOutboundIssue(item) {
  return {
    issueType: normalizeIssueType(item && item.issueType),
    severity: normalizeSeverity(item && item.severity),
    title: safeString(item && item.title, "Ponto para revisar"),
    description: safeString(item && item.description, ""),
    sourceExcerpt: safeString(item && item.sourceExcerpt, ""),
    referenceExcerpt: safeString(item && item.referenceExcerpt, ""),
    recommendedFix: safeString(item && item.recommendedFix, "")
  };
}

function normalizeChecklistItem(item) {
  return {
    title: safeString(item && item.title, "Revisar item"),
    description: safeString(item && item.description, ""),
    status: normalizeChecklistStatus(item && item.status)
  };
}

function normalizeComparisonPoint(defaultStatus, item) {
  return {
    topic: safeString(item && item.topic, "Ponto de comparacao"),
    proposalText: safeString(item && item.proposalText, ""),
    contractText: safeString(item && item.contractText, ""),
    status: normalizeComparisonStatus(defaultStatus, item && item.status)
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

function normalizeFinalVerdict(value) {
  var normalized = safeString(value, "ready_with_notes").toLowerCase();

  if (
    normalized === "ready_to_send" ||
    normalized === "ready_with_notes" ||
    normalized === "not_ready"
  ) {
    return normalized;
  }

  if (normalized === "approved" || normalized === "pronto") {
    return "ready_to_send";
  }

  if (normalized === "blocked" || normalized === "nao_enviar" || normalized === "notready") {
    return "not_ready";
  }

  return "ready_with_notes";
}

function normalizeIssueType(value) {
  var normalized = safeString(value, "send_readiness").toLowerCase();
  var allowed = {
    proposal_mismatch: true,
    missing_information: true,
    placeholder_found: true,
    commercial_inconsistency: true,
    legal_inconsistency: true,
    approval_warning: true,
    send_readiness: true
  };

  return allowed[normalized] ? normalized : "send_readiness";
}

function normalizeChecklistStatus(value) {
  var normalized = safeString(value, "pending").toLowerCase();

  if (normalized === "done" || normalized === "pending") {
    return normalized;
  }

  if (normalized === "completed" || normalized === "ok") {
    return "done";
  }

  return "pending";
}

function normalizeComparisonStatus(defaultStatus, value) {
  var normalized = safeString(value, defaultStatus || "aligned").toLowerCase();

  if (normalized === "aligned" || normalized === "missing" || normalized === "mismatch") {
    return normalized;
  }

  if (normalized === "ok" || normalized === "match") {
    return "aligned";
  }

  return defaultStatus === "missing" ? "missing" : "aligned";
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
  analyzeOutboundContractPair: analyzeOutboundContractPair,
  isConfigured: isConfigured
};

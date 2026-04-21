(function () {
  var loginScreen = document.getElementById("login-screen");
  var app = document.getElementById("app");
  var loginTitle = document.querySelector(".login-title");
  var loginSubtitle = document.querySelector(".login-sub");
  var loginButton = document.getElementById("login-btn");
  var signupLink = document.getElementById("signup-link");
  var signupCopy = document.querySelector(".login-signup");
  var forgotLink = document.querySelector(".login-forgot");
  var loginError = document.getElementById("login-error");
  var loginErrorText = document.getElementById("login-error-text");
  var loginNameField = document.getElementById("login-name-field");
  var loginNameInput = document.getElementById("login-name");
  var loginEmailInput = document.getElementById("login-email");
  var loginPasswordInput = document.getElementById("login-password");
  var loginRememberInput = document.getElementById("login-remember");
  var logoutButton = document.getElementById("logout-btn");
  var appSidebar = document.getElementById("app-sidebar");
  var sidebarBackdrop = document.getElementById("sidebar-backdrop");
  var mobileNavToggle = document.getElementById("mobile-nav-toggle");
  var topbarTitle = document.getElementById("topbar-title");
  var dashboardSearchInput = document.getElementById("dashboard-search");
  var dashboardFilterStatus = document.getElementById("dashboard-filter-status");
  var dashboardFilterType = document.getElementById("dashboard-filter-type");
  var dashboardFilterSeverity = document.getElementById("dashboard-filter-severity");
  var dashboardFilterPeriod = document.getElementById("dashboard-filter-period");
  var auditEventFilter = document.getElementById("audit-event-filter");
  var userNameEl = document.querySelector(".user-name");
  var userEmailEl = document.querySelector(".user-email");
  var userAvatarEl = document.querySelector(".user-avatar");
  var overviewDocumentsTable = document.getElementById("overview-documents-table");
  var overviewRiskRing = document.getElementById("overview-risk-ring");
  var overviewRiskScore = document.getElementById("overview-risk-score");
  var overviewRiskLabel = document.getElementById("overview-risk-label");
  var overviewRiskDesc = document.getElementById("overview-risk-desc");
  var overviewAnalysesCount = document.getElementById("overview-analyses-count");
  var overviewDocumentsCount = document.getElementById("overview-documents-count");
  var overviewCriticalFill = document.getElementById("overview-critical-fill");
  var overviewAttentionFill = document.getElementById("overview-attention-fill");
  var overviewSafeFill = document.getElementById("overview-safe-fill");
  var overviewCriticalCount = document.getElementById("overview-critical-count");
  var overviewAttentionCount = document.getElementById("overview-attention-count");
  var overviewSafeCount = document.getElementById("overview-safe-count");
  var overviewActivityList = document.getElementById("overview-activity-list");
  var overviewActivitySummary = document.getElementById("overview-activity-summary");
  var historyActivityList = document.getElementById("history-activity-list");
  var historyActivitySummary = document.getElementById("history-activity-summary");
  var overviewTypeInsights = document.getElementById("overview-type-insights");
  var overviewScoreBands = document.getElementById("overview-score-bands");
  var overviewTrendInsights = document.getElementById("overview-trend-insights");
  var documentsSelectAllBtn = document.getElementById("documents-select-all-btn");
  var documentsClearSelectionBtn = document.getElementById("documents-clear-selection-btn");
  var documentsBulkDeleteBtn = document.getElementById("documents-bulk-delete-btn");
  var documentsUploadEntry = document.getElementById("documents-upload-entry");
  var documentsUploadBtn = document.getElementById("documents-upload-btn");
  var documentsFeedback = document.getElementById("documents-feedback");
  var documentsFeedbackText = document.getElementById("documents-feedback-text");
  var documentsFeedbackUndoBtn = document.getElementById("documents-feedback-undo-btn");
  var documentsSelectionSummary = document.getElementById("documents-selection-summary");
  var documentsTable = document.getElementById("documents-table");
  var uploadZone = document.getElementById("upload-zone");
  var fileInput = document.getElementById("file-input");
  var uploadProgress = document.getElementById("upload-progress");
  var progressFill = document.getElementById("progress-fill");
  var progressText = document.getElementById("progress-text");
  var analysisResult = document.getElementById("analysis-result");
  var newAnalysisBtn = document.getElementById("new-analysis-btn");
  var riskDocSelect = document.getElementById("risk-doc-select");
  var guidedDocSelect = document.getElementById("guided-doc-select");
  var resultsDocSelect = document.getElementById("results-doc-select");
  var exportPdfBtn = document.getElementById("export-pdf-btn");
  var shareResultsBtn = document.getElementById("share-results-btn");
  var copyResultsBtn = document.getElementById("copy-results-btn");
  var resultsFeedback = document.getElementById("results-feedback");
  var analysisFlowTabs = Array.prototype.slice.call(document.querySelectorAll(".analysis-flow-tab"));
  var settingsFullNameInput = document.getElementById("settings-full-name");
  var settingsEmailInput = document.getElementById("settings-email");
  var settingsPlanInput = document.getElementById("settings-plan");
  var settingsCreatedAtInput = document.getElementById("settings-created-at");
  var settingsSaveButton = document.getElementById("settings-save-btn");
  var settingsFeedback = document.getElementById("settings-feedback");
  var settingsSessionStatus = document.getElementById("settings-session-status");
  var settingsStorageTitle = document.getElementById("settings-storage-title");
  var settingsStorageDetail = document.getElementById("settings-storage-detail");
  var settingsStorageDot = document.getElementById("settings-storage-dot");
  var settingsUsageTitle = document.getElementById("settings-usage-title");
  var settingsUsageDetail = document.getElementById("settings-usage-detail");
  var settingsUsageDot = document.getElementById("settings-usage-dot");
  var riskFilters = Array.prototype.slice.call(document.querySelectorAll(".risk-filter"));
  var guidedTabs = Array.prototype.slice.call(document.querySelectorAll(".guided-tab"));
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item[data-page]"));
  var navButtons = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var authMode = "login";
  var currentDocuments = [];
  var analysisCache = {};
  var overviewActivityCache = {};
  var overviewActivityItems = [];
  var auditHistoryItems = [];
  var currentSearchQuery = "";
  var currentStatusFilter = "all";
  var currentTypeFilter = "all";
  var currentSeverityFilter = "all";
  var currentPeriodFilter = "all";
  var currentAuditEventFilter = "all";
  var documentSeverityCache = {};
  var selectedDocumentIds = {};
  var deletingDocumentIds = {};
  var isBulkDeletingDocuments = false;
  var pendingDeletionBatch = null;
  var currentDocumentId = "";
  var currentUser = null;
  var currentRiskFilter = "all";
  var currentGuidedTab = "resumo";
  var settingsLoaded = false;
  var latestHealthSnapshot = null;
  var mobileNavBreakpoint = window.matchMedia("(max-width: 980px)");
  var resultsFeedbackTimer = null;
  var documentsFeedbackTimer = null;
  var pendingDeletionWindowMs = 6000;
  var sessionHandlingInFlight = false;
  var overviewComparisonToken = 0;
  var speechSynthesisApi = typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
  var isSpeechSynthesisSupported = Boolean(speechSynthesisApi && typeof window.SpeechSynthesisUtterance === "function");
  var activeSpeechButton = null;
  var activeSpeechKey = "";
  var pageTitles = {
    overview: "Visão geral",
    documents: "Documentos",
    history: "Historico",
    analyze: "Analisar Contrato",
    risks: "Riscos",
    guided: "Leitura Guiada",
    results: "Resultados",
    settings: "Configurações"
  };

  pageTitles = Object.assign({}, pageTitles, {
    overview: "Inicio",
    documents: "Contratos",
    history: "Atividade",
    analyze: "Nova analise",
    risks: "Riscos e alertas",
    guided: "Revisao guiada",
    results: "Resumo final",
    settings: "Conta"
  });

  var isLocalPreviewMode = window.location.protocol === "file:";
  var localPreviewStorageKey = "clausee-local-preview-v1";

  if (!isSpeechSynthesisSupported && document && document.documentElement) {
    document.documentElement.classList.add("no-tts");
  }

  function cloneLocalPreview(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createLocalPreviewId(prefix) {
    return [
      prefix || "preview",
      Date.now().toString(36),
      Math.random().toString(36).slice(2, 8)
    ].join("-");
  }

  function inferContractTypeFromName(fileName) {
    var normalized = String(fileName || "").toLowerCase();

    if (normalized.indexOf("nda") !== -1 || normalized.indexOf("confid") !== -1) {
      return "Confidencialidade";
    }
    if (normalized.indexOf("trabalho") !== -1 || normalized.indexOf("emprego") !== -1) {
      return "Trabalho";
    }
    if (normalized.indexOf("alug") !== -1 || normalized.indexOf("loca") !== -1) {
      return "Locacao";
    }
    if (normalized.indexOf("serv") !== -1) {
      return "Prestacao de servicos";
    }

    return "Contrato";
  }

  function getLocalPreviewState() {
    var parsed = null;
    var fallbackUser = {
      id: "local-preview-user",
      full_name: "Preview local",
      email: "preview@clausee.local",
      plan_code: "pro",
      created_at: new Date().toISOString()
    };

    try {
      parsed = JSON.parse(window.localStorage.getItem(localPreviewStorageKey) || "null");
    } catch (error) {
      parsed = null;
    }

    parsed = parsed && typeof parsed === "object" ? parsed : {};
    parsed.user = parsed.user && typeof parsed.user === "object" ? parsed.user : fallbackUser;
    parsed.documents = Array.isArray(parsed.documents) ? parsed.documents : [];
    parsed.analyses = parsed.analyses && typeof parsed.analyses === "object" ? parsed.analyses : {};

    return parsed;
  }

  function saveLocalPreviewState(state) {
    window.localStorage.setItem(localPreviewStorageKey, JSON.stringify(state || {}));
  }

  function buildLocalPreviewAnalysis(documentItem, payload) {
    var text = String(payload && (payload.textContent || payload.originalName) || "").toLowerCase();
    var contractType = inferContractTypeFromName(documentItem && documentItem.original_name);
    var hasPenalty = text.indexOf("multa") !== -1 || text.indexOf("penal") !== -1;
    var hasExclusivity = text.indexOf("exclusiv") !== -1;
    var hasDeadline = text.indexOf("prazo") !== -1 || text.indexOf("vigencia") !== -1;
    var clauses = [
      {
        clause_number: "1",
        clause_title: "Objeto do contrato",
        severity: "safe",
        confidence: "high",
        original_text: "Define o escopo principal do acordo entre as partes.",
        simplified_text: "Explica o que esta sendo contratado e qual e o objetivo do documento.",
        why_it_matters: "Ajuda a confirmar se o contrato cobre exatamente o que voce espera."
      },
      {
        clause_number: "2",
        clause_title: hasPenalty ? "Multas e penalidades" : "Obrigacoes das partes",
        severity: hasPenalty ? "critical" : "attention",
        confidence: "medium",
        original_text: hasPenalty
          ? "Prevê multas e penalidades por descumprimento contratual."
          : "Lista entregas, responsabilidades e condutas esperadas.",
        simplified_text: hasPenalty
          ? "Existe previsao de multa que merece revisao antes da assinatura."
          : "As obrigacoes devem ser conferidas com cuidado para evitar desequilibrio.",
        why_it_matters: hasPenalty
          ? "Clausulas com multa podem gerar custo relevante ou risco juridico."
          : "Obrigacoes mal distribuidas costumam gerar retrabalho e discussoes futuras."
      },
      {
        clause_number: "3",
        clause_title: hasExclusivity ? "Exclusividade" : hasDeadline ? "Prazo e vigencia" : "Rescisao",
        severity: hasExclusivity ? "critical" : hasDeadline ? "attention" : "safe",
        confidence: "medium",
        original_text: hasExclusivity
          ? "Impõe exclusividade durante a vigencia do contrato."
          : hasDeadline
            ? "Determina prazo de vigencia e renovacao."
            : "Descreve as hipoteses de encerramento do contrato.",
        simplified_text: hasExclusivity
          ? "A exclusividade pode limitar sua liberdade comercial."
          : hasDeadline
            ? "O prazo precisa estar claro para evitar renovacoes indesejadas."
            : "As condicoes de saida parecem objetivas.",
        why_it_matters: hasExclusivity
          ? "Exclusividade costuma exigir negociacao ou validacao juridica."
          : hasDeadline
            ? "Prazos e renovacoes automaticas sao pontos de revisao importantes."
            : "Boas regras de rescisao reduzem risco operacional."
      }
    ];
    var risks = clauses
      .filter(function (clause) {
        var severity = normalizeSeverity(clause && clause.severity);
        return severity === "critical" || severity === "attention";
      })
      .map(function (clause) {
        return {
          clause_number: clause.clause_number,
          title: clause.clause_title,
          severity: clause.severity,
          category: normalizeSeverity(clause.severity) === "critical" ? "Riscos criticos" : "Pontos de atencao",
          impact_description: clause.why_it_matters,
          simplified_explanation: clause.simplified_text,
          original_excerpt: clause.original_text,
          recommendation: normalizeSeverity(clause.severity) === "critical"
            ? "Revisar com prioridade e considerar negociacao antes de assinar."
            : "Validar esta clausula antes de seguir."
        };
      });
    var riskScore = risks.reduce(function (total, risk) {
      return total + (normalizeSeverity(risk.severity) === "critical" ? 38 : 18);
    }, 12);
    var now = new Date().toISOString();

    return {
      analysis: {
        id: createLocalPreviewId("analysis"),
        document_id: documentItem.id,
        status: "completed",
        contract_type: contractType,
        risk_score: Math.max(0, Math.min(100, riskScore)),
        summary: risks.length
          ? "Analise local concluida com " + risks.length + " ponto" + (risks.length > 1 ? "s" : "") + " relevante" + (risks.length > 1 ? "s" : "") + " para revisar."
          : "Analise local concluida sem alertas relevantes.",
        recommendation: risks.some(function (risk) { return normalizeSeverity(risk.severity) === "critical"; })
          ? "Revise as clausulas criticas antes de considerar a assinatura."
          : "Valide os pontos destacados e siga para a revisao final.",
        updated_at: now
      },
      clauses: clauses,
      risks: risks
    };
  }

  function buildLocalPreviewHealth(state) {
    var documents = (state.documents || []).filter(function (documentItem) {
      return !documentItem.deleted_at;
    });
    var analyses = state.analyses || {};
    var completed = 0;
    var failed = 0;
    var pending = 0;
    var latestFailure = null;

    documents.forEach(function (documentItem) {
      var status = String(documentItem.processing_status || "").toLowerCase();
      if (status === "completed") completed += 1;
      else if (status === "failed") failed += 1;
      else pending += 1;

      if (status === "failed" && !latestFailure) {
        latestFailure = {
          documentId: documentItem.id,
          documentName: documentItem.original_name,
          updatedAt: documentItem.updated_at || documentItem.created_at
        };
      }
    });

    return {
      checks: {
        privateStorageConfigured: true,
        privateStorageMissingVars: [],
        analysisRecentSuccess: completed > 0
      },
      operations: {
        analyses: {
          recentTotals: {
            total: documents.length,
            completed: completed,
            failed: failed,
            pending: pending
          },
          latestFailure: latestFailure
        }
      },
      previewMode: true,
      generatedAt: new Date().toISOString()
    };
  }

  async function requestLocalPreview(url, options) {
    var method = String(options && options.method || "GET").toUpperCase();
    var state = getLocalPreviewState();
    var match;
    var documentId;
    var body;
    var documentItem;
    var analysisPayload;
    var now;

    if (url === "/api/auth/me" && method === "GET") {
      return { ok: true, status: 200, payload: { user: cloneLocalPreview(state.user) } };
    }

    if ((url === "/api/auth/login" || url === "/api/auth/register") && method === "POST") {
      body = options && options.body ? JSON.parse(options.body) : {};
      state.user = {
        id: state.user && state.user.id ? state.user.id : createLocalPreviewId("user"),
        full_name: String(body.fullName || body.email || "Preview local").split("@")[0],
        email: body.email || "preview@clausee.local",
        plan_code: "pro",
        created_at: state.user && state.user.created_at ? state.user.created_at : new Date().toISOString()
      };
      saveLocalPreviewState(state);
      return { ok: true, status: 200, payload: { user: cloneLocalPreview(state.user) } };
    }

    if (url === "/api/auth/logout" && method === "POST") {
      state.user = {
        id: "local-preview-user",
        full_name: "Preview local",
        email: "preview@clausee.local",
        plan_code: "pro",
        created_at: state.user && state.user.created_at ? state.user.created_at : new Date().toISOString()
      };
      saveLocalPreviewState(state);
      return { ok: true, status: 200, payload: { ok: true } };
    }

    if (url === "/api/users/me" && method === "GET") {
      return { ok: true, status: 200, payload: { user: cloneLocalPreview(state.user) } };
    }

    if (url === "/api/users/me" && method === "PATCH") {
      body = options && options.body ? JSON.parse(options.body) : {};
      state.user.full_name = body.fullName || state.user.full_name;
      saveLocalPreviewState(state);
      return {
        ok: true,
        status: 200,
        payload: {
          message: "Perfil salvo no modo local.",
          user: cloneLocalPreview(state.user)
        }
      };
    }

    if (url === "/api/health" && method === "GET") {
      return { ok: true, status: 200, payload: buildLocalPreviewHealth(state) };
    }

    if (url === "/api/documents" && method === "GET") {
      return {
        ok: true,
        status: 200,
        payload: {
          documents: cloneLocalPreview(
            state.documents.filter(function (item) {
              return !item.deleted_at;
            })
          )
        }
      };
    }

    if (url === "/api/documents" && method === "POST") {
      body = options && options.body ? JSON.parse(options.body) : {};
      now = new Date().toISOString();
      documentItem = {
        id: createLocalPreviewId("doc"),
        original_name: body.originalName || "contrato.txt",
        processing_status: "completed",
        created_at: now,
        updated_at: now
      };
      analysisPayload = buildLocalPreviewAnalysis(documentItem, body);
      state.documents.unshift(documentItem);
      state.analyses[documentItem.id] = analysisPayload;
      saveLocalPreviewState(state);
      return {
        ok: true,
        status: 200,
        payload: {
          document: cloneLocalPreview(documentItem)
        }
      };
    }

    match = url.match(/^\/api\/documents\/([^/]+)\/analysis$/);
    if (match && method === "GET") {
      documentId = decodeURIComponent(match[1]);
      analysisPayload = state.analyses[documentId];

      if (!analysisPayload) {
        return {
          ok: false,
          status: 400,
          payload: { message: "No analysis found for this document." }
        };
      }

      return { ok: true, status: 200, payload: cloneLocalPreview(analysisPayload) };
    }

    match = url.match(/^\/api\/documents\/([^/]+)\/restore$/);
    if (match && method === "POST") {
      documentId = decodeURIComponent(match[1]);
      documentItem = state.documents.find(function (item) { return item.id === documentId; });

      if (!documentItem) {
        return { ok: false, status: 404, payload: { message: "Documento nao encontrado." } };
      }

      documentItem.deleted_at = null;
      documentItem.updated_at = new Date().toISOString();
      saveLocalPreviewState(state);
      return { ok: true, status: 200, payload: { ok: true } };
    }

    match = url.match(/^\/api\/documents\/([^/]+)$/);
    if (match && method === "DELETE") {
      documentId = decodeURIComponent(match[1]);
      documentItem = state.documents.find(function (item) { return item.id === documentId; });

      if (!documentItem) {
        return { ok: false, status: 404, payload: { message: "Documento nao encontrado." } };
      }

      documentItem.deleted_at = new Date().toISOString();
      documentItem.updated_at = documentItem.deleted_at;
      saveLocalPreviewState(state);
      return { ok: true, status: 200, payload: { ok: true } };
    }

    if (url === "/api/analyses" && method === "POST") {
      body = options && options.body ? JSON.parse(options.body) : {};
      documentId = body.documentId;
      documentItem = state.documents.find(function (item) { return item.id === documentId; });

      if (!documentItem) {
        return { ok: false, status: 404, payload: { message: "Documento nao encontrado." } };
      }

      analysisPayload = buildLocalPreviewAnalysis(documentItem, { originalName: documentItem.original_name });
      state.analyses[documentId] = analysisPayload;
      documentItem.processing_status = "completed";
      documentItem.updated_at = analysisPayload.analysis.updated_at;
      saveLocalPreviewState(state);
      return { ok: true, status: 200, payload: cloneLocalPreview(analysisPayload) };
    }

    return {
      ok: false,
      status: 404,
      payload: { message: "Rota indisponivel no modo local." }
    };
  }

  function buildRequestOptions(options) {
    var config = Object.assign({ credentials: "include" }, options || {});
    config.headers = Object.assign(
      { "Content-Type": "application/json" },
      config.headers || {}
    );
    return config;
  }

  async function requestJsonDetailed(url, options) {
    if (isLocalPreviewMode) {
      return requestLocalPreview(url, options);
    }

    var response = await fetch(url, buildRequestOptions(options));
    var payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (
      response.status === 401 &&
      !/^\/api\/auth\/(login|register|logout)$/.test(String(url || "")) &&
      typeof handleSessionExpired === "function"
    ) {
      handleSessionExpired(
        payload && payload.message
          ? payload.message
          : "Sua sessao expirou. Entre novamente para continuar."
      );
    }

    return {
      ok: response.ok,
      status: response.status,
      payload: payload
    };
  }

  async function requestJson(url, options) {
    var response = await requestJsonDetailed(url, options);

    if (!response.ok) {
      throw new Error(
        response.payload && response.payload.message
          ? response.payload.message
          : "Não foi possível concluir a operação."
      );
    }

    return response.payload;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setAuthMode(mode) {
    authMode = mode === "register" ? "register" : "login";

    if (loginTitle) {
      loginTitle.textContent =
        authMode === "register" ? "Crie sua conta" : "Entre na sua conta";
    }

    if (loginSubtitle) {
      loginSubtitle.textContent =
        authMode === "register"
          ? "Crie seu acesso para analisar contratos online"
          : "Acesse seus contratos e análises";
    }

    if (loginButton) {
      loginButton.lastChild.textContent =
        authMode === "register" ? " Criar conta" : " Entrar";
    }

    if (loginNameField) {
      loginNameField.hidden = authMode !== "register";
    }

    if (forgotLink) {
      forgotLink.hidden = authMode === "register";
    }

    if (signupCopy) {
      signupCopy.innerHTML =
        authMode === "register"
          ? 'Já tem conta? <a href="#" id="signup-link">Entrar</a>'
          : 'Não tem conta? <a href="#" id="signup-link">Crie grátis</a>';

      signupLink = document.getElementById("signup-link");
      if (signupLink) {
        signupLink.addEventListener("click", handleSignupToggle);
      }
    }
  }

  function handleSignupToggle(event) {
    event.preventDefault();
    hideLoginError();
    setAuthMode(authMode === "login" ? "register" : "login");
  }

  function showLoginError(message) {
    if (!loginError || !loginErrorText) return;
    loginErrorText.textContent = message;
    loginError.hidden = false;
  }

  function hideLoginError() {
    if (!loginError) return;
    loginError.hidden = true;
  }

  function setLoginLoading(isLoading) {
    if (!loginButton) return;
    loginButton.disabled = isLoading;
    loginButton.lastChild.textContent = isLoading
      ? " Aguarde..."
      : authMode === "register"
        ? " Criar conta"
        : " Entrar";
  }

  function showApp() {
    if (loginScreen) {
      loginScreen.classList.add("hidden");
    }
    if (app) {
      app.style.display = "grid";
    }
  }

  function showLogin() {
    if (loginScreen) {
      loginScreen.classList.remove("hidden");
    }
    if (app) {
      app.style.display = "none";
    }
  }

  function resetClientState() {
    if (pendingDeletionBatch && pendingDeletionBatch.timerId) {
      window.clearTimeout(pendingDeletionBatch.timerId);
    }
    analysisCache = {};
    overviewActivityCache = {};
    currentDocuments = [];
    currentDocumentId = "";
    auditHistoryItems = [];
    currentSearchQuery = "";
    currentStatusFilter = "all";
    currentTypeFilter = "all";
    currentSeverityFilter = "all";
    currentPeriodFilter = "all";
    currentAuditEventFilter = "all";
    documentSeverityCache = {};
    selectedDocumentIds = {};
    deletingDocumentIds = {};
    isBulkDeletingDocuments = false;
    pendingDeletionBatch = null;
    clearPendingDeletionStorage();
    settingsLoaded = false;
    latestHealthSnapshot = null;
    setSettingsFeedback("", "");
    setResultsFeedback("", "");
    setDocumentsFeedback("", "");
    setCurrentUser(null);

    if (dashboardSearchInput) {
      dashboardSearchInput.value = "";
    }
    if (dashboardFilterStatus) {
      dashboardFilterStatus.value = "all";
    }
    if (dashboardFilterType) {
      dashboardFilterType.value = "all";
    }
    if (dashboardFilterSeverity) {
      dashboardFilterSeverity.value = "all";
    }
    if (dashboardFilterPeriod) {
      dashboardFilterPeriod.value = "all";
    }
    if (auditEventFilter) {
      auditEventFilter.value = "all";
    }

    syncDocumentViews([]);
    renderOverviewKpis({}, { critical: 0, attention: 0, safe: 0 });
    renderOverviewActivity(buildOverviewActivityFallback([]));
    renderAuditHistory([]);
    resetUploadUi();
  }

  function handleSessionExpired(message) {
    if (sessionHandlingInFlight || !app || app.style.display === "none") {
      return;
    }

    sessionHandlingInFlight = true;
    resetClientState();
    setAuthMode("login");
    showLogin();
    showLoginError(message || "Sua sessao expirou. Entre novamente para continuar.");

    window.setTimeout(function () {
      sessionHandlingInFlight = false;
    }, 300);
  }

  function getInitials(name, email) {
    var source = String(name || email || "DC").trim();
    var parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }

  function setCurrentUser(user) {
    currentUser = user || null;

    if (userNameEl) {
      userNameEl.textContent = user
        ? user.fullName || user.full_name || user.email || "Usuário"
        : "Maria Silva";
    }

    if (userEmailEl) {
      userEmailEl.textContent = user ? user.email || "" : "maria@exemplo.com";
    }

    if (userAvatarEl) {
      userAvatarEl.textContent = user
        ? getInitials(user.fullName || user.full_name, user.email)
        : "MS";
    }

    populateSettingsFields(currentUser);
  }

  function isMobileNavigation() {
    return mobileNavBreakpoint.matches;
  }

  function setMobileNavOpen(isOpen) {
    if (!mobileNavToggle && !sidebarBackdrop) {
      return;
    }

    var shouldOpen = Boolean(isOpen) && isMobileNavigation();

    document.body.classList.toggle("mobile-nav-open", shouldOpen);

    if (mobileNavToggle) {
      mobileNavToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      mobileNavToggle.setAttribute("aria-label", shouldOpen ? "Fechar menu" : "Abrir menu");
    }

    if (appSidebar) {
      appSidebar.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    }
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  function setResultsFeedback(message, tone) {
    if (!resultsFeedback) return;

    if (resultsFeedbackTimer) {
      window.clearTimeout(resultsFeedbackTimer);
      resultsFeedbackTimer = null;
    }

    if (!message) {
      resultsFeedback.hidden = true;
      resultsFeedback.textContent = "";
      resultsFeedback.removeAttribute("data-tone");
      return;
    }

    resultsFeedback.hidden = false;
    resultsFeedback.textContent = message;
    resultsFeedback.setAttribute("data-tone", tone || "info");

    if (tone !== "error") {
      resultsFeedbackTimer = window.setTimeout(function () {
        setResultsFeedback("", "");
      }, 3200);
    }
  }

  function setInlineFeedback(element, timerName, message, tone) {
    if (!element) return;

    if (timerName === "documents" && documentsFeedbackTimer) {
      window.clearTimeout(documentsFeedbackTimer);
      documentsFeedbackTimer = null;
    }

    if (!message) {
      element.hidden = true;
      if (documentsFeedbackText && element === documentsFeedback) {
        documentsFeedbackText.textContent = "";
      } else {
        element.textContent = "";
      }
      element.removeAttribute("data-tone");
      if (documentsFeedbackUndoBtn && element === documentsFeedback) {
        documentsFeedbackUndoBtn.hidden = true;
        documentsFeedbackUndoBtn.onclick = null;
      }
      return;
    }

    element.hidden = false;
    if (documentsFeedbackText && element === documentsFeedback) {
      documentsFeedbackText.textContent = message;
    } else {
      element.textContent = message;
    }
    element.setAttribute("data-tone", tone || "info");

    if (tone !== "error" && timerName === "documents") {
      documentsFeedbackTimer = window.setTimeout(function () {
        setDocumentsFeedback("", "");
      }, 3600);
    }
  }

  function setDocumentsFeedback(message, tone) {
    setInlineFeedback(documentsFeedback, "documents", message, tone);
  }

  function setDocumentsUndoFeedback(message, onUndo) {
    setDocumentsFeedback(message, "info");
    if (documentsFeedbackUndoBtn) {
      documentsFeedbackUndoBtn.hidden = false;
      documentsFeedbackUndoBtn.onclick = function () {
        if (typeof onUndo === "function") {
          onUndo();
        }
      };
    }
  }

  function getSelectedDocumentIds() {
    return Object.keys(selectedDocumentIds).filter(function (documentId) {
      return Boolean(selectedDocumentIds[documentId]);
    });
  }

  function clearSelectedDocuments() {
    selectedDocumentIds = {};
  }

  function pruneSelectedDocuments(documents) {
    var allowed = {};

    (Array.isArray(documents) ? documents : []).forEach(function (documentItem) {
      if (documentItem && documentItem.id) {
        allowed[documentItem.id] = true;
      }
    });

    Object.keys(selectedDocumentIds).forEach(function (documentId) {
      if (!allowed[documentId]) {
        delete selectedDocumentIds[documentId];
      }
    });
  }

  function syncDocumentBulkActions(visibleDocuments) {
    var visibleIds = (Array.isArray(visibleDocuments) ? visibleDocuments : []).map(function (documentItem) {
      return documentItem.id;
    });
    var selectedIds = getSelectedDocumentIds();
    var selectedCount = selectedIds.length;
    var selectedVisibleCount = visibleIds.filter(function (documentId) {
      return Boolean(selectedDocumentIds[documentId]);
    }).length;
    var hasVisibleDocuments = visibleIds.length > 0;
    var allVisibleSelected = hasVisibleDocuments && selectedVisibleCount === visibleIds.length;

    if (documentsSelectAllBtn) {
      documentsSelectAllBtn.disabled = !hasVisibleDocuments || isBulkDeletingDocuments;
      documentsSelectAllBtn.textContent = allVisibleSelected
        ? "Visiveis selecionados"
        : "Selecionar visiveis";
    }

    if (documentsClearSelectionBtn) {
      documentsClearSelectionBtn.disabled = selectedCount === 0 || isBulkDeletingDocuments;
      documentsClearSelectionBtn.textContent = selectedCount > 0
        ? "Limpar selecao (" + selectedCount + ")"
        : "Limpar selecao";
    }

    if (documentsBulkDeleteBtn) {
      documentsBulkDeleteBtn.disabled = selectedCount === 0 || isBulkDeletingDocuments;
      documentsBulkDeleteBtn.textContent = isBulkDeletingDocuments
        ? "Excluindo..."
        : selectedCount > 0
        ? "Excluir selecionados (" + selectedCount + ")"
        : "Excluir selecionados";
    }

    renderDocumentsSelectionSummary(visibleDocuments);
  }

  function hasPendingDeletionForDocument(documentId) {
    return Boolean(
      pendingDeletionBatch &&
        Array.isArray(pendingDeletionBatch.documentIds) &&
        pendingDeletionBatch.documentIds.indexOf(documentId) !== -1
    );
  }

  function sortDocumentsByNewest(documents) {
    return (Array.isArray(documents) ? documents.slice() : []).sort(function (left, right) {
      var leftTime = new Date(getDocumentFilterTimestamp(left) || 0).getTime();
      var rightTime = new Date(getDocumentFilterTimestamp(right) || 0).getTime();
      return rightTime - leftTime;
    });
  }

  function restorePendingDocuments(documents) {
    currentDocuments = sortDocumentsByNewest(currentDocuments.concat(Array.isArray(documents) ? documents : []));
    syncDocumentViews(currentDocuments);
  }

  function getPendingDeletionStorageKey() {
    var userId = currentUser && currentUser.id ? currentUser.id : "anonymous";
    return "dc-pending-delete:" + userId;
  }

  function clearPendingDeletionStorage() {
    try {
      window.localStorage.removeItem(getPendingDeletionStorageKey());
    } catch (error) {
      // Ignore storage access failures.
    }
  }

  function persistPendingDeletionBatch() {
    if (!pendingDeletionBatch) {
      clearPendingDeletionStorage();
      return;
    }

    try {
      window.localStorage.setItem(
        getPendingDeletionStorageKey(),
        JSON.stringify({
          documentIds: pendingDeletionBatch.documentIds,
          documentNames: pendingDeletionBatch.documentNames,
          expiresAt: pendingDeletionBatch.expiresAt
        })
      );
    } catch (error) {
      // Ignore storage access failures.
    }
  }

  function schedulePendingDeletionFeedbackExpiry() {
    if (!pendingDeletionBatch) {
      return;
    }

    if (pendingDeletionBatch.timerId) {
      window.clearTimeout(pendingDeletionBatch.timerId);
    }

    var remainingMs = Math.max(0, pendingDeletionBatch.expiresAt - Date.now());
    pendingDeletionBatch.timerId = window.setTimeout(function () {
      pendingDeletionBatch = null;
      clearPendingDeletionStorage();
      setDocumentsFeedback("", "");
      renderDocumentsSelectionSummary(filterDocuments(currentDocuments));
    }, remainingMs);
  }

  function hydratePendingDeletionBatch() {
    var raw;
    var parsed;

    if (!currentUser || !currentUser.id) {
      return;
    }

    try {
      raw = window.localStorage.getItem(getPendingDeletionStorageKey());
    } catch (error) {
      raw = "";
    }

    if (!raw) {
      return;
    }

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      clearPendingDeletionStorage();
      return;
    }

    if (!parsed || !Array.isArray(parsed.documentIds) || !parsed.documentIds.length || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      pendingDeletionBatch = null;
      clearPendingDeletionStorage();
      return;
    }

    pendingDeletionBatch = {
      documentIds: parsed.documentIds.slice(),
      documentNames: Array.isArray(parsed.documentNames) ? parsed.documentNames.slice() : [],
      expiresAt: Number(parsed.expiresAt),
      timerId: null
    };

    schedulePendingDeletionFeedbackExpiry();
    renderDocumentsSelectionSummary(filterDocuments(currentDocuments));
    setDocumentsUndoFeedback(
      parsed.documentIds.length === 1
        ? '"' + (pendingDeletionBatch.documentNames[0] || "documento") + '" esta na lixeira temporaria. Voce ainda pode desfazer.'
        : pendingDeletionBatch.documentIds.length + " documentos estao na lixeira temporaria. Voce ainda pode desfazer.",
      function () {
        undoPendingDeletionBatch();
      }
    );
  }

  function setActionLoading(button, isLoading, loadingLabel, idleLabel) {
    if (!button) return;
    var label = button.querySelector(".btn-label");
    button.disabled = isLoading;
    if (label) {
      label.textContent = isLoading ? loadingLabel : idleLabel;
    }
  }

  function switchPage(pageName) {
    pages.forEach(function (page) {
      page.classList.remove("active");
    });

    navItems.forEach(function (item) {
      item.classList.remove("active");
    });

    var targetPage = document.getElementById("page-" + pageName);
    if (targetPage) {
      targetPage.classList.add("active");
    }

    var activeNav = document.querySelector('.nav-item[data-page="' + pageName + '"]');
    if (activeNav) {
      activeNav.classList.add("active");
    }

    if (topbarTitle) {
      topbarTitle.textContent = pageTitles[pageName] || "Decodificador";
    }

    analysisFlowTabs.forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-analysis-page") === pageName);
    });

    if (pageName === "settings") {
      loadSettingsProfile(false);
    }

    if (pageName !== "results") {
      setResultsFeedback("", "");
    }

    closeMobileNav();
  }

  function openAnalyzeUploadEntry() {
    switchPage("analyze");
    resetUploadUi();

    if (analysisResult) {
      analysisResult.classList.remove("visible");
    }

    if (uploadZone) {
      uploadZone.style.display = "";
      if (typeof uploadZone.scrollIntoView === "function") {
        uploadZone.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function getVisiblePageName() {
    var activePage = document.querySelector(".page.active");
    if (!activePage || !activePage.id) {
      return "overview";
    }

    return activePage.id.replace(/^page-/, "");
  }

  function populateSettingsFields(user) {
    if (settingsFullNameInput) {
      settingsFullNameInput.value = user ? user.fullName || user.full_name || "" : "";
    }

    if (settingsEmailInput) {
      settingsEmailInput.value = user ? user.email || "" : "";
    }

    if (settingsPlanInput) {
      settingsPlanInput.value = user ? formatPlanCode(user.planCode || user.plan_code) : "";
    }

    if (settingsCreatedAtInput) {
      settingsCreatedAtInput.value = user ? formatDate(user.createdAt || user.created_at) : "";
    }

    if (settingsSessionStatus) {
      settingsSessionStatus.textContent = user ? "Conectado" : "Sessão ausente";
    }
  }

  function formatPlanCode(value) {
    var normalized = String(value || "").trim().toLowerCase();

    if (!normalized) {
      return "--";
    }

    if (normalized === "free") return "Free";
    if (normalized === "pro") return "Pro";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  function setSettingsFeedback(message, tone) {
    if (!settingsFeedback) return;

    if (!message) {
      settingsFeedback.hidden = true;
      settingsFeedback.textContent = "";
      settingsFeedback.style.color = "";
      settingsFeedback.style.borderColor = "";
      return;
    }

    settingsFeedback.hidden = false;
    settingsFeedback.textContent = message;
    settingsFeedback.style.color = tone === "success" ? "var(--safe)" : "var(--danger)";
    settingsFeedback.style.borderColor = tone === "success"
      ? "rgba(34,197,94,.28)"
      : "rgba(239,68,68,.28)";
  }

  function setSettingsSaving(isSaving) {
    if (!settingsSaveButton) return;
    settingsSaveButton.disabled = isSaving;
    settingsSaveButton.lastChild.textContent = isSaving
      ? " Salvando..."
      : " Salvar perfil";
  }

  function renderStorageStatus(checks) {
    if (!settingsStorageTitle || !settingsStorageDetail || !settingsStorageDot) {
      return;
    }

    var isConfigured = Boolean(checks && checks.privateStorageConfigured);
    var missingVars = Array.isArray(checks && checks.privateStorageMissingVars)
      ? checks.privateStorageMissingVars
      : [];

    settingsStorageDot.classList.remove("activity-dot--safe", "activity-dot--warn", "activity-dot--danger");

    if (isConfigured) {
      settingsStorageDot.classList.add("activity-dot--safe");
      settingsStorageTitle.textContent = "configurado";
      settingsStorageDetail.textContent = "Uploads privados e download protegido estão habilitados.";
      return;
    }

    settingsStorageDot.classList.add("activity-dot--warn");
    settingsStorageTitle.textContent = "ainda não configurado";
    settingsStorageDetail.textContent = missingVars.length
      ? "Variáveis ausentes: " + missingVars.join(", ")
      : "Faltam credenciais de storage no backend de produção.";
  }

  async function loadSettingsProfile(forceRefresh) {
    if (!forceRefresh && settingsLoaded && currentUser) {
      populateSettingsFields(currentUser);
      renderSettingsUsageStatus(currentDocuments, latestHealthSnapshot);
      return;
    }

    if (!currentUser && !forceRefresh) {
      populateSettingsFields(null);
      renderSettingsUsageStatus(currentDocuments, latestHealthSnapshot);
      return;
    }

    try {
      var data = await requestJson("/api/users/me", { method: "GET" });
      settingsLoaded = true;
      setCurrentUser(data.user || null);
      setSettingsFeedback("", "");
    } catch (error) {
      setSettingsFeedback(
        error.message || "Não foi possível carregar seu perfil agora.",
        "error"
      );
    }

    try {
      var healthData = await requestJson("/api/health", { method: "GET" });
      latestHealthSnapshot = healthData || null;
      renderStorageStatus(healthData && healthData.checks);
      renderSettingsUsageStatus(currentDocuments, healthData || {});
    } catch (error) {
      latestHealthSnapshot = null;
      renderStorageStatus(null);
      renderSettingsUsageStatus(currentDocuments, null);
    }
  }

  async function saveSettingsProfile() {
    if (!settingsFullNameInput) return;

    setSettingsFeedback("", "");
    setSettingsSaving(true);

    try {
      var data = await requestJson("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: settingsFullNameInput.value.trim()
        })
      });

      settingsLoaded = true;
      setCurrentUser(data.user || null);
      setSettingsFeedback(
        data.message || "Perfil atualizado com sucesso.",
        "success"
      );
    } catch (error) {
      setSettingsFeedback(
        error.message || "Não foi possível atualizar seu perfil.",
        "error"
      );
    } finally {
      setSettingsSaving(false);
    }
  }

  function formatDate(value) {
    var date = value ? new Date(value) : null;
    var months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    if (!date || Number.isNaN(date.getTime())) {
      return "--";
    }

    return [
      String(date.getDate()).padStart(2, "0"),
      months[date.getMonth()],
      date.getFullYear()
    ].join(" ");
  }

  function formatRelativeDate(value) {
    var date = value ? new Date(value) : null;
    var diffMs;
    var diffMinutes;
    var diffHours;
    var diffDays;

    if (!date || Number.isNaN(date.getTime())) {
      return "--";
    }

    diffMs = Date.now() - date.getTime();
    diffMinutes = Math.max(1, Math.round(diffMs / 60000));

    if (diffMinutes < 60) {
      return diffMinutes === 1 ? "agora mesmo" : "há " + diffMinutes + " min";
    }

    diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return diffHours === 1 ? "há 1 hora" : "há " + diffHours + " horas";
    }

    diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) {
      return diffDays === 1 ? "há 1 dia" : "há " + diffDays + " dias";
    }

    return formatDate(value);
  }

  function getFileExtension(value) {
    var normalized = String(value || "").trim().toLowerCase();
    if (!normalized) return "";
    var parts = normalized.split(".");
    return parts.length > 1 ? parts.pop() : normalized;
  }

  function getDocumentTypeLabel(documentItem) {
    var extension = getFileExtension(documentItem && documentItem.original_name);

    if (extension === "pdf") return "PDF";
    if (extension === "doc" || extension === "docx") return "DOCX";
    if (extension === "txt") return "TXT";
    return "Contrato";
  }

  function getStatusMeta(status) {
    var normalized = String(status || "").toLowerCase();

    if (normalized === "completed") {
      return { label: "Concluído", className: "badge--safe" };
    }

    if (normalized === "failed" || normalized === "error") {
      return { label: "Erro", className: "badge--critical" };
    }

    if (normalized === "analyzing") {
      return { label: "Analisando", className: "badge--processing" };
    }

    if (normalized === "extracting") {
      return { label: "Extraindo", className: "badge--processing" };
    }

    if (normalized === "uploaded") {
      return { label: "Enviado", className: "badge--processing" };
    }

    return { label: "Pendente", className: "badge--attention" };
  }

  function normalizeSeverity(value) {
    var normalized = String(value || "").trim().toLowerCase();

    if (normalized === "critical" || normalized === "critico") return "critical";
    if (normalized === "attention" || normalized === "warning" || normalized === "atencao") return "attention";
    if (normalized === "safe" || normalized === "seguro" || normalized === "success") return "safe";
    return "neutral";
  }

  function getSeverityMeta(severity) {
    var normalized = normalizeSeverity(severity);

    if (normalized === "critical") {
      return {
        key: "critical",
        label: "Crítico",
        badgeClass: "badge--critical",
        pillClass: "risk-badge--critical",
        cardClass: "risk-card--critical",
        dotClass: "results-clause-dot--danger",
        clauseClass: "clause-item--critical"
      };
    }

    if (normalized === "attention") {
      return {
        key: "attention",
        label: "Atenção",
        badgeClass: "badge--attention",
        pillClass: "risk-badge--attention",
        cardClass: "risk-card--attention",
        dotClass: "results-clause-dot--warn",
        clauseClass: "clause-item--attention"
      };
    }

    if (normalized === "safe") {
      return {
        key: "safe",
        label: "Seguro",
        badgeClass: "badge--safe",
        pillClass: "risk-badge--safe",
        cardClass: "risk-card--safe",
        dotClass: "results-clause-dot--safe",
        clauseClass: "clause-item--safe"
      };
    }

    return {
      key: "neutral",
      label: "Neutro",
      badgeClass: "badge--processing",
      pillClass: "risk-badge--attention",
      cardClass: "risk-card--attention",
      dotClass: "results-clause-dot--warn",
      clauseClass: "clause-item--attention"
    };
  }

  function getRiskScoreMeta(scoreValue) {
    var score = Number(scoreValue);

    if (!Number.isFinite(score)) {
      return {
        label: "Risco indefinido",
        description: "Análise ainda sem score consolidado.",
        ringClass: "ring--warn"
      };
    }

    if (score >= 70) {
      return {
        label: "Risco Alto",
        description: "Requer atenção antes de assinar",
        ringClass: "ring--danger"
      };
    }

    if (score >= 40) {
      return {
        label: "Risco Moderado",
        description: "Vale revisar antes de seguir",
        ringClass: "ring--warn"
      };
    }

    return {
      label: "Risco Baixo",
      description: "Sem sinais relevantes de alerta",
      ringClass: "ring--safe"
    };
  }

  function formatRiskScore(scoreValue) {
    var score = Number(scoreValue);

    if (!Number.isFinite(score)) {
      return "--";
    }

    return String(Math.max(0, Math.min(100, Math.round(score))));
  }

  function setRingTone(element, ringClass) {
    if (!element) return;
    element.classList.remove("ring--danger", "ring--warn", "ring--safe");
    element.classList.add(ringClass);
  }

  function buildBreakdown(result) {
    var counts = { critical: 0, attention: 0, safe: 0, neutral: 0 };
    var clauses = Array.isArray(result && result.clauses) ? result.clauses : [];

    clauses.forEach(function (clause) {
      var severity = normalizeSeverity(clause && clause.severity);
      counts[severity] = (counts[severity] || 0) + 1;
    });

    return counts;
  }

  function countItemsBySeverity(items) {
    var counts = { critical: 0, attention: 0, safe: 0, neutral: 0 };

    (Array.isArray(items) ? items : []).forEach(function (item) {
      var severity = normalizeSeverity(item && item.severity);
      counts[severity] = (counts[severity] || 0) + 1;
    });

    return counts;
  }

  function renderBreakdownBar(root, counts) {
    if (!root) return;
    var segments = [];

    if (counts.critical) {
      segments.push('<div style="flex:' + counts.critical + ';background:var(--danger)"></div>');
    }
    if (counts.attention) {
      segments.push('<div style="flex:' + counts.attention + ';background:var(--warn)"></div>');
    }
    if (counts.safe) {
      segments.push('<div style="flex:' + counts.safe + ';background:var(--safe)"></div>');
    }
    if (counts.neutral) {
      segments.push('<div style="flex:' + counts.neutral + ';background:var(--neutral-4)"></div>');
    }

    root.innerHTML = segments.length
      ? segments.join("")
      : '<div style="flex:1;background:var(--neutral-4)"></div>';
  }

  function renderBreakdownLegend(root, counts) {
    if (!root) return;
    var items = [];

    if (counts.critical) {
      items.push('<span class="breakdown-item"><span style="background:var(--danger)"></span>' + counts.critical + " Críticos</span>");
    }
    if (counts.attention) {
      items.push('<span class="breakdown-item"><span style="background:var(--warn)"></span>' + counts.attention + " Atenção</span>");
    }
    if (counts.safe) {
      items.push('<span class="breakdown-item"><span style="background:var(--safe)"></span>' + counts.safe + " Seguros</span>");
    }
    if (counts.neutral) {
      items.push('<span class="breakdown-item"><span style="background:var(--neutral-3)"></span>' + counts.neutral + " Neutros</span>");
    }

    root.innerHTML = items.join("");
  }

  function chooseDefaultDocumentId() {
    return currentDocuments.length ? currentDocuments[0].id : "";
  }

  function getSearchQuery() {
    return String(currentSearchQuery || "").trim().toLowerCase();
  }

  function getDocumentTypeKey(documentItem) {
    return String(getFileExtension(documentItem && documentItem.original_name) || "").toLowerCase();
  }

  function normalizeStatusFilterValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getDocumentSeverityKey(documentItem) {
    return documentSeverityCache[documentItem && documentItem.id] || "unknown";
  }

  function filterDocumentsBySearch(documents) {
    var query = getSearchQuery();

    if (!query) {
      return Array.isArray(documents) ? documents.slice() : [];
    }

    return (Array.isArray(documents) ? documents : []).filter(function (documentItem) {
      var name = String(documentItem && documentItem.original_name || "").toLowerCase();
      var typeLabel = String(getDocumentTypeLabel(documentItem) || "").toLowerCase();
      var statusLabel = String(getStatusMeta(documentItem && documentItem.processing_status).label || "").toLowerCase();

      return (
        name.indexOf(query) !== -1 ||
        typeLabel.indexOf(query) !== -1 ||
        statusLabel.indexOf(query) !== -1
      );
    });
  }

  function getDocumentFilterTimestamp(documentItem) {
    if (!documentItem) {
      return null;
    }

    return documentItem.updated_at || documentItem.created_at || null;
  }

  function matchesCurrentPeriodFilter(timestamp) {
    var date = timestamp ? new Date(timestamp) : null;
    var now = new Date();
    var start;

    if (currentPeriodFilter === "all") {
      return true;
    }

    if (!date || Number.isNaN(date.getTime())) {
      return false;
    }

    if (currentPeriodFilter === "month") {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }

    start = new Date(now.getTime());
    if (currentPeriodFilter === "7d") {
      start.setDate(start.getDate() - 7);
    } else if (currentPeriodFilter === "30d") {
      start.setDate(start.getDate() - 30);
    } else if (currentPeriodFilter === "90d") {
      start.setDate(start.getDate() - 90);
    } else {
      return true;
    }

    return date.getTime() >= start.getTime();
  }

  function filterDocuments(documents) {
    return filterDocumentsBySearch(documents).filter(function (documentItem) {
      var status = normalizeStatusFilterValue(documentItem && documentItem.processing_status);
      var typeKey = getDocumentTypeKey(documentItem);
      var severityKey = getDocumentSeverityKey(documentItem);
      var timestamp = getDocumentFilterTimestamp(documentItem);

      if (currentStatusFilter !== "all" && status !== currentStatusFilter) {
        return false;
      }

      if (currentTypeFilter !== "all" && typeKey !== currentTypeFilter) {
        return false;
      }

      if (currentSeverityFilter !== "all" && severityKey !== currentSeverityFilter) {
        return false;
      }

      if (!matchesCurrentPeriodFilter(timestamp)) {
        return false;
      }

      return true;
    });
  }

  function filterOverviewActivityItems(items) {
    var query = getSearchQuery();

    if (!query) {
      return Array.isArray(items) ? items.slice() : [];
    }

    return (Array.isArray(items) ? items : []).filter(function (item) {
      var searchable = String(item && item.searchText || "").toLowerCase();
      var statusKey = String(item && item.statusKey || "all").toLowerCase();
      var typeKey = String(item && item.typeKey || "all").toLowerCase();
      var severityKey = String(item && item.severityKey || "unknown").toLowerCase();
      var timestamp = item && item.timestamp;
      var documentId = item && item.documentId;

      if (documentId && hasPendingDeletionForDocument(documentId)) {
        return false;
      }

      if (query && searchable.indexOf(query) === -1) {
        return false;
      }

      if (currentStatusFilter !== "all" && statusKey !== currentStatusFilter) {
        return false;
      }

      if (currentTypeFilter !== "all" && typeKey !== currentTypeFilter) {
        return false;
      }

      if (currentSeverityFilter !== "all" && severityKey !== currentSeverityFilter) {
        return false;
      }

      if (!matchesCurrentPeriodFilter(timestamp)) {
        return false;
      }

      return true;
    });
  }

  function filterAuditHistoryItems(items) {
    return (Array.isArray(items) ? items : []).filter(function (item) {
      var searchable = String(item && item.searchText || "").toLowerCase();
      var statusKey = String(item && item.statusKey || "all").toLowerCase();
      var typeKey = String(item && item.typeKey || "all").toLowerCase();
      var severityKey = String(item && item.severityKey || "unknown").toLowerCase();
      var eventKey = String(item && item.eventKey || "other").toLowerCase();
      var timestamp = item && item.timestamp;
      var documentId = item && item.documentId;

      if (documentId && hasPendingDeletionForDocument(documentId)) {
        return false;
      }

      if (currentSearchQuery && searchable.indexOf(getSearchQuery()) === -1) {
        return false;
      }

      if (currentStatusFilter !== "all" && statusKey !== currentStatusFilter) {
        return false;
      }

      if (currentTypeFilter !== "all" && typeKey !== currentTypeFilter) {
        return false;
      }

      if (currentSeverityFilter !== "all" && severityKey !== currentSeverityFilter) {
        return false;
      }

      if (currentAuditEventFilter !== "all" && eventKey !== currentAuditEventFilter) {
        return false;
      }

      if (!matchesCurrentPeriodFilter(timestamp)) {
        return false;
      }

      return true;
    });
  }

  function findDocumentById(documentId) {
    return currentDocuments.find(function (item) {
      return item.id === documentId;
    }) || null;
  }

  function setActiveDocument(documentId) {
    currentDocumentId = documentId || chooseDefaultDocumentId();

    [riskDocSelect, guidedDocSelect, resultsDocSelect].forEach(function (select) {
      if (!select) return;
      select.value = currentDocumentId || "";
    });
  }

  function createDocumentRowMarkup(documentItem, options) {
    var config = options || {};
    var status = getStatusMeta(documentItem.processing_status);
    var isSelectable = Boolean(config.selectable);
    var isSelected = Boolean(selectedDocumentIds[documentItem.id]);
    var isDeleting = Boolean(deletingDocumentIds[documentItem.id]);
    var rowClasses = ["table-row"];

    if (isSelected) {
      rowClasses.push("is-selected");
    }

    return [
      '<div class="' + rowClasses.join(" ") + '" data-document-id="' + escapeHtml(documentItem.id) + '">',
      isSelectable
        ? '<span class="table-select"><input class="table-checkbox" type="checkbox" data-action="select" aria-label="Selecionar ' + escapeHtml(documentItem.original_name || "documento") + '"' + (isSelected ? " checked" : "") + "></span>"
        : "",
      '<span class="table-doc">',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      escapeHtml(documentItem.original_name || "documento"),
      "</span>",
      '<span class="table-type">' + escapeHtml(getDocumentTypeLabel(documentItem)) + "</span>",
      '<span class="table-date">' + escapeHtml(formatDate(documentItem.created_at)) + "</span>",
      '<span class="badge ' + status.className + '"><span class="badge-dot"></span>' + escapeHtml(status.label) + "</span>",
      '<span class="table-actions">' +
        '<button class="table-action-btn" type="button" data-action="open" aria-label="Abrir documento"' + (isDeleting || isBulkDeletingDocuments ? " disabled" : "") + '><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
        '<button class="table-action-btn table-action-btn--danger' + (isDeleting ? " is-loading" : "") + '" type="button" data-action="delete" aria-label="' + (isDeleting ? "Excluindo documento" : "Excluir documento") + '"' + (isDeleting || isBulkDeletingDocuments ? " disabled" : "") + '><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>' +
      "</span>",
      "</div>"
    ].join("");
  }

  function getDocumentOnboardingMarkup() {
    var state = getOnboardingState();

    return [
      '<div class="empty-state">',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
      '<div class="empty-state-title">' + escapeHtml(state.title) + "</div>",
      '<div class="empty-state-text">' + escapeHtml(state.text) + "</div>",
      '<div class="empty-state-actions">',
      "<button class=\"btn btn-primary\" type=\"button\" data-nav=\"" + escapeHtml(state.primaryNav) + "\">" + escapeHtml(state.primaryLabel) + "</button>",
      "<button class=\"btn btn-outline\" type=\"button\" data-nav=\"" + escapeHtml(state.secondaryNav) + "\">" + escapeHtml(state.secondaryLabel) + "</button>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderTable(tableElement, documents, limit) {
    if (!tableElement) return;

    var rows = documents;
    var isSelectable = tableElement === documentsTable;
    if (typeof limit === "number") {
      rows = documents.slice(0, limit);
    }

    if (!rows.length && !getSearchQuery() && currentStatusFilter === "all" && currentTypeFilter === "all" && currentSeverityFilter === "all") {
      tableElement.innerHTML = getDocumentOnboardingMarkup();
      if (isSelectable) {
        syncDocumentBulkActions([]);
      }
      return;
    }

    var head = isSelectable
      ? '<div class="table-head"><span></span><span>Documento</span><span>Tipo</span><span>Data</span><span>Status</span><span></span></div>'
      : '<div class="table-head"><span>Documento</span><span>Tipo</span><span>Data</span><span>Status</span><span></span></div>';
    var body = rows.length
      ? rows.map(function (documentItem) {
        return createDocumentRowMarkup(documentItem, { selectable: isSelectable });
      }).join("")
      : '<div class="table-empty">' + getDocumentSearchEmptyMessage() + "</div>";

    tableElement.innerHTML = head + body;
    if (isSelectable) {
      syncDocumentBulkActions(rows);
    }
  }

  function renderTableLoading(tableElement, message, selectable) {
    if (!tableElement) return;

    var head = selectable
      ? '<div class="table-head"><span></span><span>Documento</span><span>Tipo</span><span>Data</span><span>Status</span><span></span></div>'
      : '<div class="table-head"><span>Documento</span><span>Tipo</span><span>Data</span><span>Status</span><span></span></div>';

    tableElement.innerHTML = head + '<div class="table-empty">' + escapeHtml(message || "Carregando dados...") + "</div>";

    if (selectable) {
      syncDocumentBulkActions([]);
    }
  }

  function renderSelectOptions(selectElement, documents) {
    if (!selectElement) return;

    selectElement.innerHTML = "";

    if (!documents.length) {
      selectElement.innerHTML = '<option value="">' + (getSearchQuery() ? 'Nenhum resultado para a busca' : 'Nenhum documento enviado') + "</option>";
      return;
    }

    documents.forEach(function (documentItem) {
      var option = document.createElement("option");
      option.value = documentItem.id;
      option.textContent = documentItem.original_name || "documento";
      selectElement.appendChild(option);
    });
  }

  function getOverviewDocumentCountLabel(totalDocuments) {
    var summary = countDocumentsByStatus(currentDocuments);

    if (!Number.isFinite(totalDocuments) || totalDocuments <= 0) {
      return "Nenhum documento enviado";
    }

    if (summary.completed > 0) {
      return String(summary.completed) + " analise" + (summary.completed > 1 ? "s prontas" : " pronta");
    }

    if (summary.analyzing > 0) {
      return String(summary.analyzing) + " em analise agora";
    }

    if (summary.failed > 0 && summary.total === summary.failed) {
      return "Revisao necessaria nos envios";
    }

    if (totalDocuments === 1) {
      return "1 documento no painel";
    }

    return String(totalDocuments) + " documentos no painel";
  }

  function setOverviewDistributionFill(element, count, total) {
    if (!element) return;
    element.style.width = total > 0 ? String(Math.max(8, Math.round((count / total) * 100))) + "%" : "0%";
  }

  function createOverviewActivityItem(item) {
    return [
      '<div class="activity-item">',
      '<span class="activity-dot ' + escapeHtml(item.dotClass) + '"></span>',
      "<div>",
      '<div class="activity-text">' + item.html + "</div>",
      '<div class="activity-time">' + escapeHtml(item.timeLabel) + "</div>",
      item.actionMarkup || "",
      "</div>",
      "</div>"
    ].join("");
  }

  function getDocumentSearchEmptyMessage() {
    if (getSearchQuery()) {
      return 'Nenhum documento encontrado para "' + escapeHtml(currentSearchQuery) + '".';
    }

    if (currentStatusFilter !== "all" || currentTypeFilter !== "all" || currentSeverityFilter !== "all") {
      return "Nenhum documento corresponde aos filtros selecionados.";
    }

    return "Nenhum documento enviado ainda.";
  }

  function countDocumentsByStatus(documents) {
    var summary = {
      total: 0,
      uploaded: 0,
      analyzing: 0,
      completed: 0,
      failed: 0
    };

    (Array.isArray(documents) ? documents : []).forEach(function (documentItem) {
      var status = normalizeStatusFilterValue(documentItem && documentItem.processing_status);
      summary.total += 1;

      if (status === "completed") {
        summary.completed += 1;
      } else if (status === "analyzing") {
        summary.analyzing += 1;
      } else if (status === "failed") {
        summary.failed += 1;
      } else {
        summary.uploaded += 1;
      }
    });

    return summary;
  }

  function setNavBadge(pageName, count) {
    var navItem = document.querySelector('.nav-item[data-page="' + pageName + '"]');
    var badge = navItem ? navItem.querySelector(".nav-badge") : null;
    var normalizedCount = Number(count) || 0;

    if (!badge) {
      return;
    }

    badge.textContent = String(normalizedCount);
    badge.hidden = normalizedCount <= 0;
  }

  function updateNavigationBadges(documents) {
    var source = Array.isArray(documents) ? documents : [];
    var statusSummary = countDocumentsByStatus(source);
    var analysisQueueCount = statusSummary.uploaded + statusSummary.analyzing + statusSummary.failed;
    var riskyDocumentsCount = source.filter(function (documentItem) {
      var severity = getDocumentSeverityKey(documentItem);
      return severity === "critical" || severity === "attention";
    }).length;

    setNavBadge("analyze", analysisQueueCount);
    setNavBadge("risks", riskyDocumentsCount);
  }

  function buildSummaryPill(label, value, tone) {
    return '<span class="activity-summary__pill"' +
      (tone ? ' data-tone="' + escapeHtml(tone) + '"' : "") +
      '><strong>' + escapeHtml(String(value)) + "</strong> " + escapeHtml(label) + "</span>";
  }

  function renderActivitySummary(element, pills) {
    if (!element) {
      return;
    }

    var items = Array.isArray(pills) ? pills.filter(Boolean) : [];
    element.innerHTML = items.join("");
  }

  function renderOverviewActivitySummary(documents, items) {
    var summary = countDocumentsByStatus(documents);
    var criticalCount = (Array.isArray(items) ? items : []).filter(function (item) {
      return item && item.severityKey === "critical";
    }).length;
    var attentionCount = (Array.isArray(items) ? items : []).filter(function (item) {
      return item && item.severityKey === "attention";
    }).length;
    var pendingCount = summary.analyzing + summary.uploaded;

    renderActivitySummary(overviewActivitySummary, [
      buildSummaryPill("no filtro atual", summary.total, ""),
      pendingCount ? buildSummaryPill("aguardando andamento", pendingCount, "warn") : "",
      criticalCount ? buildSummaryPill("alertas criticos", criticalCount, "danger") : "",
      attentionCount ? buildSummaryPill("itens de atencao", attentionCount, "warn") : "",
      summary.completed ? buildSummaryPill("analises concluidas", summary.completed, "safe") : "",
      buildSummaryPill(getCurrentPeriodInsightLabel(), "Janela", "")
    ]);
  }

  function renderHistoryActivitySummary(items) {
    var source = Array.isArray(items) ? items : [];
    var trashCount = source.filter(function (item) {
      return item && item.eventKey === "trash";
    }).length;
    var restoreCount = source.filter(function (item) {
      return item && item.eventKey === "restore";
    }).length;
    var purgeCount = source.filter(function (item) {
      return item && item.eventKey === "purge";
    }).length;

    renderActivitySummary(historyActivitySummary, [
      buildSummaryPill("eventos no historico", source.length, ""),
      trashCount ? buildSummaryPill("envios para lixeira", trashCount, "warn") : "",
      restoreCount ? buildSummaryPill("restauracoes", restoreCount, "safe") : "",
      purgeCount ? buildSummaryPill("limpezas automaticas", purgeCount, "") : ""
    ]);
  }

  function renderDocumentsSelectionSummary(visibleDocuments) {
    if (!documentsSelectionSummary) {
      return;
    }

    var visibleCount = Array.isArray(visibleDocuments) ? visibleDocuments.length : 0;
    var totalCount = Array.isArray(currentDocuments) ? currentDocuments.length : 0;
    var selectedCount = getSelectedDocumentIds().length;
    var remainingSeconds = pendingDeletionBatch
      ? Math.max(0, Math.ceil((pendingDeletionBatch.expiresAt - Date.now()) / 1000))
      : 0;
    var message = "";

    if (pendingDeletionBatch && pendingDeletionBatch.documentIds.length) {
      message = "<strong>" + escapeHtml(String(pendingDeletionBatch.documentIds.length)) +
        "</strong> documento" + (pendingDeletionBatch.documentIds.length > 1 ? "s" : "") +
        " na lixeira temporaria. Voce ainda pode desfazer por cerca de <strong>" +
        escapeHtml(String(remainingSeconds)) + "s</strong>.";
    } else if (selectedCount > 0) {
      message = "<strong>" + escapeHtml(String(selectedCount)) + "</strong> selecionado" +
        (selectedCount > 1 ? "s" : "") + " para acao em lote";

      if (visibleCount > 0) {
        message += ". O filtro atual mostra <strong>" + escapeHtml(String(visibleCount)) +
          "</strong> de <strong>" + escapeHtml(String(totalCount)) + "</strong> documento" +
          (totalCount > 1 ? "s" : "") + ".";
      } else {
        message += ". Ajuste os filtros se quiser revisar a selecao antes de excluir.";
      }
    } else if (visibleCount > 0 && visibleCount !== totalCount) {
      message = "Mostrando <strong>" + escapeHtml(String(visibleCount)) + "</strong> de <strong>" +
        escapeHtml(String(totalCount)) + "</strong> documento" + (totalCount > 1 ? "s" : "") +
        " com os filtros atuais.";
    }

    documentsSelectionSummary.hidden = !message;
    documentsSelectionSummary.innerHTML = message;
  }

  function renderSettingsUsageStatus(documents, healthData) {
    if (!settingsUsageTitle || !settingsUsageDetail || !settingsUsageDot) {
      return;
    }

    var summary = countDocumentsByStatus(documents);
    var checks = healthData && healthData.checks ? healthData.checks : {};
    var analyses = healthData && healthData.operations ? healthData.operations.analyses : null;
    var recentTotals = analyses && analyses.totals ? analyses.totals : null;
    var latestFailure = analyses && analyses.latestFailure ? analyses.latestFailure : null;
    var pendingCount = summary.uploaded + summary.analyzing;

    settingsUsageDot.classList.remove("activity-dot--safe", "activity-dot--warn", "activity-dot--danger", "activity-dot--default");

    if (!summary.total) {
      settingsUsageDot.classList.add("activity-dot--default");
      settingsUsageTitle.textContent = "pronto para receber o primeiro contrato";
      settingsUsageDetail.textContent = "Assim que voce enviar um documento, este resumo mostra volume, andamento e saude recente das analises.";
      return;
    }

    if (summary.failed || latestFailure) {
      settingsUsageDot.classList.add("activity-dot--warn");
      settingsUsageTitle.textContent = summary.failed
        ? summary.failed + " documento" + (summary.failed > 1 ? "s precisam" : " precisa") + " de nova tentativa"
        : "ha falhas recentes para revisar";
      settingsUsageDetail.textContent = latestFailure && latestFailure.documentName
        ? 'Ultima falha conhecida: "' + latestFailure.documentName + '" em ' + formatRelativeDate(latestFailure.updatedAt || latestFailure.createdAt) + "."
        : "Revise os documentos com erro antes de seguir com novos envios.";
      return;
    }

    if (pendingCount) {
      settingsUsageDot.classList.add("activity-dot--warn");
      settingsUsageTitle.textContent = pendingCount + " documento" + (pendingCount > 1 ? "s ainda estao" : " ainda esta") + " em andamento";
      settingsUsageDetail.textContent = summary.completed
        ? summary.completed + " analise" + (summary.completed > 1 ? "s ja concluidas" : " ja concluida") + " no painel."
        : "O painel aguarda a primeira analise concluida.";
      return;
    }

    settingsUsageDot.classList.add(checks.analysisRecentSuccess ? "activity-dot--safe" : "activity-dot--default");
    settingsUsageTitle.textContent = summary.completed + " analise" + (summary.completed > 1 ? "s concluidas" : " concluida") + " no painel";
    settingsUsageDetail.textContent = recentTotals && recentTotals.total
      ? recentTotals.completed + " concluida" + (recentTotals.completed > 1 ? "s" : "") + " nas ultimas 24h, sem falhas recentes."
      : "Seu historico recente esta estavel e pronto para novas comparacoes.";
  }

  function getOnboardingState() {
    var summary = countDocumentsByStatus(currentDocuments);

    if (!summary.total) {
      return {
        title: "Envie seu primeiro contrato",
        text: "Suba um PDF, DOCX ou TXT para desbloquear riscos, leitura guiada e resultados completos no painel.",
        primaryLabel: "Analisar contrato",
        primaryNav: "analyze",
        secondaryLabel: "Ver configuracoes",
        secondaryNav: "settings"
      };
    }

    if (!summary.completed && (summary.uploaded || summary.analyzing)) {
      return {
        title: "Seu primeiro painel esta em andamento",
        text: "Voce ja enviou " + summary.total + " documento" + (summary.total > 1 ? "s" : "") + ". Assim que a analise terminar, vamos liberar riscos, leitura guiada e resultados para compartilhar.",
        primaryLabel: "Acompanhar documentos",
        primaryNav: "documents",
        secondaryLabel: "Enviar outro contrato",
        secondaryNav: "analyze"
      };
    }

    if (!summary.completed && summary.failed) {
      return {
        title: "Hora de tentar de novo",
        text: "Os documentos enviados ainda nao concluiram uma analise valida. Revise o arquivo, tente outro formato ou envie uma nova versao.",
        primaryLabel: "Ver documentos",
        primaryNav: "documents",
        secondaryLabel: "Nova analise",
        secondaryNav: "analyze"
      };
    }

    return {
      title: "Continue alimentando seu painel",
      text: "Voce ja tem analises concluidas. Envie mais contratos para comparar riscos e manter o historico atualizado.",
      primaryLabel: "Enviar outro contrato",
      primaryNav: "analyze",
      secondaryLabel: "Ver resultados",
      secondaryNav: "results"
    };
  }

  function buildActivityAction(label, nav, documentId, page) {
    if (!label) {
      return "";
    }

    return '<button class="btn btn-outline btn-sm" type="button" data-nav="' +
      escapeHtml(nav || "") +
      '"' +
      (documentId ? ' data-document-id="' + escapeHtml(documentId) + '"' : "") +
      (page ? ' data-target-page="' + escapeHtml(page) + '"' : "") +
      ">" +
      escapeHtml(label) +
      "</button>";
  }

  function mergeOverviewActivityItems(primaryItems, secondaryItems, limit) {
    return (Array.isArray(primaryItems) ? primaryItems : [])
      .concat(Array.isArray(secondaryItems) ? secondaryItems : [])
      .sort(function (left, right) {
        var leftTime = new Date(left && left.timestamp || 0).getTime();
        var rightTime = new Date(right && right.timestamp || 0).getTime();
        return rightTime - leftTime;
      })
      .slice(0, typeof limit === "number" ? limit : 6);
  }

  function buildAuditActivityItems(events) {
    return (Array.isArray(events) ? events : []).map(function (eventItem) {
      var metadata = eventItem && eventItem.metadata ? eventItem.metadata : {};
      var originalName = metadata.originalName || "documento";
      var extension = getFileExtension(originalName);
      var typeKey = extension === "doc" ? "docx" : extension;
      var eventName = String(eventItem && eventItem.event_name || "").toLowerCase();
      var baseItem = {
        documentId: eventItem && eventItem.document_id ? eventItem.document_id : "",
        timeLabel: formatRelativeDate(eventItem && eventItem.created_at),
        timestamp: eventItem && eventItem.created_at ? eventItem.created_at : null,
        searchText: originalName + " " + eventName,
        eventKey: eventName || "other",
        statusKey: "all",
        typeKey: typeKey || "all",
        severityKey: "unknown",
        actionMarkup: ""
      };

      if (eventName === "trash") {
        return Object.assign(baseItem, {
          dotClass: "activity-dot--warn",
          html: "<strong>" + escapeHtml(originalName) + "</strong> foi para a lixeira temporaria",
          actionMarkup: buildActivityAction("Ver documentos", "documents")
        });
      }

      if (eventName === "restore") {
        return Object.assign(baseItem, {
          dotClass: "activity-dot--safe",
          html: "<strong>" + escapeHtml(originalName) + "</strong> foi restaurado para o painel",
          actionMarkup: baseItem.documentId
            ? buildActivityAction("Abrir", "documents", baseItem.documentId, "documents")
            : buildActivityAction("Ver documentos", "documents")
        });
      }

      if (eventName === "purge") {
        return Object.assign(baseItem, {
          dotClass: "activity-dot--default",
          html: "<strong>" + escapeHtml(originalName) + "</strong> foi removido automaticamente da lixeira",
          actionMarkup: buildActivityAction("Analisar contrato", "analyze")
        });
      }

      return Object.assign(baseItem, {
        dotClass: "activity-dot--default",
        html: "<strong>" + escapeHtml(originalName) + "</strong> teve uma atualizacao registrada"
      });
    });
  }

  function normalizeComparisonTypeLabel(label) {
    var normalized = String(label || "").trim();
    return normalized || "Contrato sem tipo definido";
  }

  function getCurrentPeriodInsightLabel() {
    if (currentPeriodFilter === "7d") return "ultimos 7 dias";
    if (currentPeriodFilter === "30d") return "ultimos 30 dias";
    if (currentPeriodFilter === "90d") return "ultimos 90 dias";
    if (currentPeriodFilter === "month") return "este mes";
    return "todo o periodo";
  }

  function getScoreBand(score) {
    var numeric = Number(score);

    if (!Number.isFinite(numeric)) {
      return { key: "pending", label: "Sem score", pillClass: "comparison-pill--neutral" };
    }

    if (numeric >= 70) {
      return { key: "high", label: "Score alto", pillClass: "comparison-pill--critical" };
    }

    if (numeric >= 40) {
      return { key: "medium", label: "Score moderado", pillClass: "comparison-pill--attention" };
    }

    return { key: "low", label: "Score baixo", pillClass: "comparison-pill--safe" };
  }

  function getComparisonToneFromAverage(score) {
    var band = getScoreBand(score);

    if (band.key === "high") return { label: "Mais sensivel", pillClass: band.pillClass };
    if (band.key === "medium") return { label: "Pede revisao", pillClass: band.pillClass };
    if (band.key === "low") return { label: "Melhor equilibrio", pillClass: band.pillClass };
    return { label: "Sem leitura", pillClass: band.pillClass };
  }

  function createComparisonItemMarkup(title, meta, pillLabel, pillClass) {
    return [
      '<div class="comparison-item">',
      "<div>",
      '<div class="comparison-title">' + escapeHtml(title) + "</div>",
      '<div class="comparison-meta">' + escapeHtml(meta) + "</div>",
      "</div>",
      '<span class="comparison-pill ' + escapeHtml(pillClass || "comparison-pill--neutral") + '">' + escapeHtml(pillLabel) + "</span>",
      "</div>"
    ].join("");
  }

  function buildOverviewActivityFallback(documents) {
    var summary = countDocumentsByStatus(documents);

    if (!Array.isArray(documents) || !documents.length) {
      return [
        {
          dotClass: "activity-dot--default",
          html: "Envie seu primeiro contrato para começar a montar o painel.",
          timeLabel: "Sem atividade ainda",
          searchText: "envie seu primeiro contrato",
          statusKey: "all",
          typeKey: "all",
          severityKey: "unknown",
          actionMarkup: buildActivityAction("Enviar contrato", "analyze")
        }
      ];
    }

    if (!summary.completed && (summary.uploaded || summary.analyzing)) {
      return [
        {
          dotClass: "activity-dot--default",
          html: "Seu painel esta sendo preparado com os primeiros documentos enviados.",
          timeLabel: "Analise em andamento",
          searchText: "primeiros documentos em analise",
          statusKey: "analyzing",
          typeKey: "all",
          severityKey: "unknown",
          actionMarkup: buildActivityAction("Abrir documentos", "documents")
        }
      ];
    }

    return documents.slice(0, 4).map(function (documentItem) {
      var status = getStatusMeta(documentItem.processing_status);
      var normalizedStatus = normalizeStatusFilterValue(documentItem.processing_status);
      var typeKey = getDocumentTypeKey(documentItem);
      return {
        documentId: documentItem.id,
        dotClass:
          status.className === "badge--critical"
            ? "activity-dot--danger"
            : status.className === "badge--safe"
              ? "activity-dot--safe"
              : status.className === "badge--attention"
                ? "activity-dot--warn"
                : "activity-dot--default",
        html:
          "<strong>" +
          escapeHtml(documentItem.original_name || "documento") +
          "</strong> " +
          escapeHtml(status.label.toLowerCase()),
        timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
        timestamp: documentItem.updated_at || documentItem.created_at,
        searchText: (documentItem.original_name || "") + " " + status.label,
        statusKey: normalizedStatus,
        typeKey: typeKey,
        severityKey: getDocumentSeverityKey(documentItem),
        actionMarkup: buildActivityAction("Abrir", "documents", documentItem.id, "documents")
      };
    });
  }

  async function buildOverviewComparisons(documents) {
    var sourceDocuments = Array.isArray(documents) ? documents : [];
    var typeMap = {};
    var scoreBands = {
      high: 0,
      medium: 0,
      low: 0,
      pending: 0
    };
    var timeline = [];

    if (!sourceDocuments.length) {
      return {
        types: [],
        scoreBands: scoreBands
      };
    }

    await Promise.all(
      sourceDocuments.map(async function (documentItem) {
        var payload = await getAnalysisForOverview(documentItem.id);
        var analysis = payload && payload.analysis ? payload.analysis : null;
        var typeLabel = normalizeComparisonTypeLabel(
          analysis && analysis.contract_type ? analysis.contract_type : getDocumentTypeLabel(documentItem)
        );
        var numericScore = analysis && Number.isFinite(Number(analysis.risk_score))
          ? Number(analysis.risk_score)
          : null;
        var band = getScoreBand(numericScore);

        if (!typeMap[typeLabel]) {
          typeMap[typeLabel] = {
            label: typeLabel,
            count: 0,
            scoreTotal: 0,
            scoredCount: 0
          };
        }

        typeMap[typeLabel].count += 1;

        if (numericScore !== null) {
          typeMap[typeLabel].scoreTotal += numericScore;
          typeMap[typeLabel].scoredCount += 1;
          timeline.push({
            documentName: documentItem.original_name || "documento",
            score: numericScore,
            updatedAt: analysis && analysis.updated_at ? analysis.updated_at : (documentItem.updated_at || documentItem.created_at)
          });
        }

        scoreBands[band.key] += 1;
      })
    );

    timeline.sort(function (left, right) {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });

    var recentTimeline = timeline.slice(0, 6);
    var newerSlice = recentTimeline.slice(0, Math.max(1, Math.ceil(recentTimeline.length / 2)));
    var olderSlice = recentTimeline.slice(Math.max(1, Math.ceil(recentTimeline.length / 2)));
    var newerAverage = newerSlice.length
      ? Math.round(newerSlice.reduce(function (total, item) { return total + item.score; }, 0) / newerSlice.length)
      : null;
    var olderAverage = olderSlice.length
      ? Math.round(olderSlice.reduce(function (total, item) { return total + item.score; }, 0) / olderSlice.length)
      : null;
    var delta = newerAverage !== null && olderAverage !== null ? newerAverage - olderAverage : null;
    var latestItem = recentTimeline[0] || null;
    var latestBand = latestItem ? getScoreBand(latestItem.score) : null;
    var trendSummary = "Sem base suficiente para comparar a tendencia recente.";
    var trendPillLabel = "Coletando";
    var trendPillClass = "comparison-pill--neutral";

    if (delta !== null) {
      if (delta >= 8) {
        trendSummary = "Os scores recentes subiram cerca de " + delta + " pontos frente ao bloco anterior.";
        trendPillLabel = "Risco subindo";
        trendPillClass = "comparison-pill--critical";
      } else if (delta <= -8) {
        trendSummary = "Os scores recentes cairam cerca de " + Math.abs(delta) + " pontos frente ao bloco anterior.";
        trendPillLabel = "Risco melhorando";
        trendPillClass = "comparison-pill--safe";
      } else {
        trendSummary = "Os scores recentes seguem estaveis em relacao ao bloco anterior.";
        trendPillLabel = "Estavel";
        trendPillClass = "comparison-pill--attention";
      }
    } else if (latestItem) {
      trendSummary = "Ainda ha poucas analises historicas, mas ja da para acompanhar a ultima entrega.";
      trendPillLabel = "Historico curto";
    }

    return {
      types: Object.keys(typeMap)
        .map(function (key) {
          var item = typeMap[key];
          var averageScore = item.scoredCount
            ? Math.round(item.scoreTotal / item.scoredCount)
            : null;
          var tone = getComparisonToneFromAverage(averageScore);

          return {
            label: item.label,
            count: item.count,
            averageScore: averageScore,
            toneLabel: tone.label,
            toneClass: tone.pillClass
          };
        })
        .sort(function (left, right) {
          if (right.count !== left.count) {
            return right.count - left.count;
          }

          return (right.averageScore || -1) - (left.averageScore || -1);
        })
        .slice(0, 4),
      scoreBands: scoreBands,
      trend: {
        items: recentTimeline,
        summary: trendSummary,
        pillLabel: trendPillLabel,
        pillClass: trendPillClass,
        latestLabel: latestItem
          ? latestItem.documentName + " · " + latestItem.score + "/100"
          : "Sem analise recente",
        latestMeta: latestItem
          ? "Atualizado em " + formatDate(latestItem.updatedAt)
          : "Conclua uma analise para liberar a linha do tempo.",
        latestClass: latestBand ? latestBand.pillClass : "comparison-pill--neutral",
        velocityLabel: recentTimeline.length + " analise" + (recentTimeline.length !== 1 ? "s" : "") + " nas ultimas leituras",
        velocityMeta: recentTimeline.length > 1
          ? "As " + recentTimeline.length + " entregas mais recentes ja entram no comparativo do painel."
          : "Assim que houver mais resultados, vamos comparar a evolucao entre blocos."
      }
    };
  }

  function renderOverviewComparisons(comparisons) {
    if (!overviewTypeInsights || !overviewScoreBands || !overviewTrendInsights) {
      return;
    }

    var typeItems = comparisons && Array.isArray(comparisons.types) ? comparisons.types : [];
    var bands = comparisons && comparisons.scoreBands ? comparisons.scoreBands : null;

    if (!typeItems.length) {
      overviewTypeInsights.innerHTML = '<div class="table-empty">Envie contratos com analise concluida para comparar tipos.</div>';
    } else {
      overviewTypeInsights.innerHTML = typeItems
        .map(function (item) {
          var meta = item.count + " documento" + (item.count > 1 ? "s" : "") +
            (item.averageScore !== null ? " · media " + item.averageScore + "/100" : " · ainda sem score consolidado");
          return createComparisonItemMarkup(item.label, meta, item.toneLabel, item.toneClass);
        })
        .join("");
    }

    if (!bands) {
      overviewScoreBands.innerHTML = '<div class="table-empty">Sem comparativo de score disponivel.</div>';
      return;
    }

    overviewScoreBands.innerHTML = [
      createComparisonItemMarkup("Score alto", bands.high + " contrato" + (bands.high !== 1 ? "s" : "") + " acima de 70", "Revisar primeiro", "comparison-pill--critical"),
      createComparisonItemMarkup("Score moderado", bands.medium + " contrato" + (bands.medium !== 1 ? "s" : "") + " entre 40 e 69", "Acompanhar", "comparison-pill--attention"),
      createComparisonItemMarkup("Score baixo", bands.low + " contrato" + (bands.low !== 1 ? "s" : "") + " abaixo de 40", "Mais estaveis", "comparison-pill--safe"),
      createComparisonItemMarkup("Sem score", bands.pending + " documento" + (bands.pending !== 1 ? "s" : "") + " aguardando analise", "Em preparo", "comparison-pill--neutral")
    ].join("");

    var trend = comparisons && comparisons.trend ? comparisons.trend : null;

    if (!trend || !trend.items || !trend.items.length) {
      overviewTrendInsights.innerHTML = '<div class="table-empty">Conclua mais analises para enxergar a tendencia de risco.</div>';
      return;
    }

    overviewTrendInsights.innerHTML = [
      createComparisonItemMarkup("Tendencia do score", trend.summary, trend.pillLabel, trend.pillClass),
      createComparisonItemMarkup("Ultima analise", trend.latestLabel, trend.latestMeta, trend.latestClass),
      createComparisonItemMarkup("Ritmo recente", trend.velocityLabel, trend.velocityMeta, "comparison-pill--neutral")
    ].join("");
  }

  async function buildOverviewComparisonsDeep(documents) {
    var base = await buildOverviewComparisons(documents);
    var sourceDocuments = Array.isArray(documents) ? documents : [];
    var periodLabel = getCurrentPeriodInsightLabel();
    var typeItems = Array.isArray(base && base.types) ? base.types.slice() : [];
    var scoredTypes = typeItems.filter(function (item) {
      return item && item.averageScore !== null && item.averageScore !== undefined;
    });
    var scoredTimeline = base && base.trend && Array.isArray(base.trend.items)
      ? base.trend.items.slice().sort(function (left, right) {
        return left.score - right.score;
      })
      : [];
    var lowestItem = scoredTimeline[0] || null;
    var highestItem = scoredTimeline[scoredTimeline.length - 1] || null;
    var completionStats = {
      completed: 0,
      failed: 0,
      pending: 0
    };
    var riskiestType;
    var safestType;

    sourceDocuments.forEach(function (documentItem) {
      var normalizedStatus = String(documentItem && documentItem.processing_status || "pending").toLowerCase();

      if (normalizedStatus === "completed") {
        completionStats.completed += 1;
      } else if (normalizedStatus === "failed") {
        completionStats.failed += 1;
      } else {
        completionStats.pending += 1;
      }
    });

    typeItems = typeItems.map(function (item) {
      var share = sourceDocuments.length
        ? Math.round((item.count / sourceDocuments.length) * 100)
        : 0;

      return Object.assign({}, item, {
        share: share
      });
    });

    riskiestType = scoredTypes.slice().sort(function (left, right) {
      return right.averageScore - left.averageScore;
    })[0] || null;

    safestType = scoredTypes.slice().sort(function (left, right) {
      return left.averageScore - right.averageScore;
    })[0] || null;

    return Object.assign({}, base || {}, {
      periodLabel: periodLabel,
      types: typeItems,
      trend: Object.assign({}, base && base.trend ? base.trend : {}, {
        latestLabel: highestItem && lowestItem
          ? "Faixa observada: " + lowestItem.score + " a " + highestItem.score + "/100"
          : base && base.trend ? base.trend.latestLabel : "Sem analise recente",
        latestMeta: highestItem && lowestItem
          ? "Menor score em " + lowestItem.documentName + " e maior score em " + highestItem.documentName + "."
          : base && base.trend ? base.trend.latestMeta : "Conclua uma analise para liberar a linha do tempo.",
        latestClass: highestItem
          ? getScoreBand(highestItem.score).pillClass
          : base && base.trend ? base.trend.latestClass : "comparison-pill--neutral",
        velocityLabel: "Janela analisada: " + periodLabel,
        velocityMeta:
          completionStats.completed + " concluida" + (completionStats.completed !== 1 ? "s" : "") +
          ", " + completionStats.failed + " com falha" + (completionStats.failed !== 1 ? "s" : "") +
          " e " + completionStats.pending + " pendente" + (completionStats.pending !== 1 ? "s" : "") + ".",
        focusLabel: riskiestType
          ? "Mais sensivel: " + riskiestType.label
          : "Tipos em consolidacao",
        focusMeta: riskiestType && safestType
          ? "Pior media em " + riskiestType.averageScore + "/100" +
            (safestType && safestType.label !== riskiestType.label
              ? " · Melhor equilibrio em " + safestType.label + " com " + safestType.averageScore + "/100."
              : ".")
          : "Conclua mais analises para destacar os tipos com melhor e pior comportamento."
      })
    });
  }

  function renderOverviewComparisonLoading() {
    if (overviewTypeInsights) {
      overviewTypeInsights.innerHTML = '<div class="table-empty">Carregando comparativos por tipo...</div>';
    }

    if (overviewScoreBands) {
      overviewScoreBands.innerHTML = '<div class="table-empty">Carregando distribuicao de score...</div>';
    }

    if (overviewTrendInsights) {
      overviewTrendInsights.innerHTML = '<div class="table-empty">Carregando tendencia recente...</div>';
    }
  }

  function refreshOverviewComparisons(documents) {
    var token = ++overviewComparisonToken;

    renderOverviewComparisonLoading();

    buildOverviewComparisonsDeep(documents)
      .then(function (comparisons) {
        if (token !== overviewComparisonToken) {
          return;
        }

        renderOverviewComparisons(comparisons);
      })
      .catch(function () {
        if (token !== overviewComparisonToken) {
          return;
        }

        renderOverviewComparisons(null);
      });
  }

  async function getAnalysisForOverview(documentId) {
    if (!documentId) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(overviewActivityCache, documentId)) {
      return overviewActivityCache[documentId];
    }

    var existing = await requestJsonDetailed(
      "/api/documents/" + encodeURIComponent(documentId) + "/analysis",
      { method: "GET" }
    );
    var message = existing.payload && existing.payload.message ? existing.payload.message : "";

    if (existing.ok) {
      overviewActivityCache[documentId] = existing.payload;
      return existing.payload;
    }

    if (existing.status === 400 && message === "No analysis found for this document.") {
      overviewActivityCache[documentId] = null;
      return null;
    }

    overviewActivityCache[documentId] = null;
    return null;
  }

  async function buildOverviewActivity(documents) {
    var sourceDocuments = Array.isArray(documents) ? documents.slice(0, 4) : [];
    var analyses = await Promise.all(
      sourceDocuments.map(function (documentItem) {
        return getAnalysisForOverview(documentItem.id);
      })
    );

    return sourceDocuments.map(function (documentItem, index) {
      var analysisPayload = analyses[index];
      var analysisItem = analysisPayload && analysisPayload.analysis ? analysisPayload.analysis : null;
      var risks = analysisPayload && Array.isArray(analysisPayload.risks) ? analysisPayload.risks : [];
      var criticalCount = risks.filter(function (risk) {
        return normalizeSeverity(risk && risk.severity) === "critical";
      }).length;
      var status = String(documentItem.processing_status || "").toLowerCase();

      if (analysisItem && analysisItem.status === "completed") {
        if (criticalCount > 0) {
          return {
            dotClass: "activity-dot--danger",
          html:
            "<strong>" +
            escapeHtml(documentItem.original_name || "documento") +
            "</strong> com " +
            escapeHtml(String(criticalCount)) +
            " risco" +
            (criticalCount > 1 ? "s críticos" : " crítico"),
            timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
            searchText: (documentItem.original_name || "") + " riscos críticos " + criticalCount
          };
        }

        return {
          dotClass: "activity-dot--safe",
          html:
            "<strong>" +
            escapeHtml(documentItem.original_name || "documento") +
            "</strong> analisado sem riscos críticos",
          timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
          searchText: (documentItem.original_name || "") + " analisado sem riscos críticos"
        };
      }

      if (status === "analyzing" || status === "uploaded") {
      return {
        dotClass: "activity-dot--default",
        html:
          "<strong>" +
          escapeHtml(documentItem.original_name || "documento") +
          "</strong> enviado para análise",
        timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
        searchText: (documentItem.original_name || "") + " enviado para análise"
      };
    }

      if (status === "failed") {
      return {
        dotClass: "activity-dot--warn",
        html:
          "<strong>" +
          escapeHtml(documentItem.original_name || "documento") +
          "</strong> precisa de revisão antes de nova análise",
        timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
        searchText: (documentItem.original_name || "") + " revisão falha"
      };
    }

    return {
      dotClass: "activity-dot--default",
        html:
        "<strong>" +
        escapeHtml(documentItem.original_name || "documento") +
        "</strong> disponível no painel",
      timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
      searchText: (documentItem.original_name || "") + " disponível no painel"
    };
  });
}

  function renderOverviewKpis(kpis, distribution) {
    var totalDocuments = Number(kpis && kpis.total_documents) || 0;
    var completedAnalyses = Number(kpis && kpis.completed_analyses) || 0;
    var criticalRisks = Number(kpis && kpis.critical_risks) || 0;
    var critical = Number(distribution && distribution.critical) || 0;
    var attention = Number(distribution && distribution.attention) || 0;
    var safe = Number(distribution && distribution.safe) || 0;
    var totalRiskItems = critical + attention + safe;
    var computedScore =
      totalRiskItems > 0
        ? Math.max(
            0,
            Math.min(100, Math.round(((critical * 100) + (attention * 55) + (safe * 15)) / totalRiskItems))
          )
        : 0;
    var scoreMeta = getRiskScoreMeta(computedScore);

    if (overviewRiskScore) {
      overviewRiskScore.textContent = String(computedScore);
    }
    if (overviewRiskLabel) {
      overviewRiskLabel.textContent = scoreMeta.label;
    }
    if (overviewRiskDesc) {
      overviewRiskDesc.textContent = criticalRisks > 0
        ? String(criticalRisks) + " risco" + (criticalRisks > 1 ? "s críticos encontrados" : " crítico encontrado")
        : completedAnalyses > 0
          ? "Análises concluídas sem riscos críticos"
          : "Envie um documento para começar";
    }
    setRingTone(overviewRiskRing, scoreMeta.ringClass);

    if (overviewAnalysesCount) {
      overviewAnalysesCount.textContent = String(completedAnalyses);
    }
    if (overviewDocumentsCount) {
      overviewDocumentsCount.textContent = getOverviewDocumentCountLabel(totalDocuments);
    }

    if (overviewCriticalCount) overviewCriticalCount.textContent = String(critical);
    if (overviewAttentionCount) overviewAttentionCount.textContent = String(attention);
    if (overviewSafeCount) overviewSafeCount.textContent = String(safe);

    setOverviewDistributionFill(overviewCriticalFill, critical, totalRiskItems);
    setOverviewDistributionFill(overviewAttentionFill, attention, totalRiskItems);
    setOverviewDistributionFill(overviewSafeFill, safe, totalRiskItems);
  }

  function renderOverviewLoadingState() {
    renderOverviewKpis({}, { critical: 0, attention: 0, safe: 0 });
    renderActivitySummary(overviewActivitySummary, []);
    renderActivitySummary(historyActivitySummary, []);

    if (overviewActivityList) {
      overviewActivityList.innerHTML = '<div class="table-empty">Carregando atividade recente...</div>';
    }

    if (historyActivityList) {
      historyActivityList.innerHTML = '<div class="table-empty">Carregando historico de auditoria...</div>';
    }

    renderOverviewComparisonLoading();
  }

  async function hydrateDocumentSeverityCache(documents) {
    var sourceDocuments = Array.isArray(documents) ? documents : [];

    await Promise.all(
      sourceDocuments.map(async function (documentItem) {
        var response;
        var payload;
        var risks;

        if (!documentItem || !documentItem.id || Object.prototype.hasOwnProperty.call(documentSeverityCache, documentItem.id)) {
          return;
        }

        response = await requestJsonDetailed(
          "/api/documents/" + encodeURIComponent(documentItem.id) + "/analysis",
          { method: "GET" }
        );

        if (!response.ok) {
          documentSeverityCache[documentItem.id] = "unknown";
          return;
        }

        payload = response.payload || {};
        risks = Array.isArray(payload.risks) ? payload.risks : [];

        if (risks.some(function (risk) { return normalizeSeverity(risk && risk.severity) === "critical"; })) {
          documentSeverityCache[documentItem.id] = "critical";
          return;
        }

        if (risks.some(function (risk) { return normalizeSeverity(risk && risk.severity) === "attention"; })) {
          documentSeverityCache[documentItem.id] = "attention";
          return;
        }

        if ((payload.analysis && payload.analysis.status === "completed") || risks.some(function (risk) { return normalizeSeverity(risk && risk.severity) === "safe"; })) {
          documentSeverityCache[documentItem.id] = "safe";
          return;
        }

        documentSeverityCache[documentItem.id] = "unknown";
      })
    );
  }

  function renderOverviewActivity(items) {
    if (!overviewActivityList) return;

    overviewActivityList.innerHTML = (Array.isArray(items) && items.length ? items : [
      {
        dotClass: "activity-dot--default",
        html: "Sem atividade recente para mostrar.",
        timeLabel: "Agora"
      }
    ])
      .map(createOverviewActivityItem)
      .join("");

    renderOverviewActivitySummary(filterDocuments(currentDocuments), items);
  }

  function renderAuditHistory(items) {
    if (!historyActivityList) return;

    historyActivityList.innerHTML = (Array.isArray(items) && items.length ? items : [
      {
        dotClass: "activity-dot--default",
        html: getSearchQuery() || currentAuditEventFilter !== "all"
          ? "Nenhum evento de auditoria corresponde aos filtros atuais."
          : "Nenhum evento de auditoria registrado ainda.",
        timeLabel: getSearchQuery() || currentAuditEventFilter !== "all"
          ? "Ajuste os filtros e tente de novo"
          : "Assim que houver exclusoes, restauracoes ou limpezas, elas vao aparecer aqui."
      }
    ])
      .map(createOverviewActivityItem)
      .join("");

    renderHistoryActivitySummary(items);
  }

  async function buildOverviewActivityFiltered(documents) {
    var sourceDocuments = Array.isArray(documents) ? documents.slice(0, 4) : [];
    var analyses = await Promise.all(
      sourceDocuments.map(function (documentItem) {
        return getAnalysisForOverview(documentItem.id);
      })
    );

    return sourceDocuments.map(function (documentItem, index) {
      var analysisPayload = analyses[index];
      var analysisItem = analysisPayload && analysisPayload.analysis ? analysisPayload.analysis : null;
      var risks = analysisPayload && Array.isArray(analysisPayload.risks) ? analysisPayload.risks : [];
      var hasCritical = risks.some(function (risk) {
        return normalizeSeverity(risk && risk.severity) === "critical";
      });
      var hasAttention = risks.some(function (risk) {
        return normalizeSeverity(risk && risk.severity) === "attention";
      });
      var status = normalizeStatusFilterValue(documentItem.processing_status);
      var typeKey = getDocumentTypeKey(documentItem);

      if (analysisItem && analysisItem.status === "completed") {
        var criticalCount = risks.filter(function (risk) {
          return normalizeSeverity(risk && risk.severity) === "critical";
        }).length;
        var attentionCount = risks.filter(function (risk) {
          return normalizeSeverity(risk && risk.severity) === "attention";
        }).length;

        if (hasCritical) {
          return {
            documentId: documentItem.id,
            dotClass: "activity-dot--danger",
            html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> terminou com " + escapeHtml(String(criticalCount)) + " risco" + (criticalCount > 1 ? "s criticos" : " critico"),
            timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
            timestamp: analysisItem.updated_at || documentItem.updated_at || documentItem.created_at,
            searchText: (documentItem.original_name || "") + " riscos criticos",
            statusKey: "completed",
            typeKey: typeKey,
            severityKey: "critical",
            actionMarkup: buildActivityAction("Ver riscos", "risks", documentItem.id, "risks")
          };
        }

        if (hasAttention) {
          return {
            documentId: documentItem.id,
            dotClass: "activity-dot--warn",
            html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> requer atencao em " + escapeHtml(String(attentionCount)) + " ponto" + (attentionCount > 1 ? "s" : ""),
            timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
            timestamp: analysisItem.updated_at || documentItem.updated_at || documentItem.created_at,
            searchText: (documentItem.original_name || "") + " requer atencao",
            statusKey: "completed",
            typeKey: typeKey,
            severityKey: "attention",
            actionMarkup: buildActivityAction("Abrir resultados", "results", documentItem.id, "results")
          };
        }

        return {
          documentId: documentItem.id,
          dotClass: "activity-dot--safe",
          html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> esta pronto para revisao e compartilhamento",
          timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
          timestamp: analysisItem.updated_at || documentItem.updated_at || documentItem.created_at,
          searchText: (documentItem.original_name || "") + " analisado seguro",
          statusKey: "completed",
          typeKey: typeKey,
          severityKey: "safe",
          actionMarkup: buildActivityAction("Ver resultados", "results", documentItem.id, "results")
        };
      }

      if (status === "analyzing" || status === "uploaded") {
        return {
          documentId: documentItem.id,
          dotClass: "activity-dot--default",
          html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> entrou na fila de analise",
          timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
          timestamp: documentItem.updated_at || documentItem.created_at,
          searchText: (documentItem.original_name || "") + " enviado para analise",
          statusKey: status,
          typeKey: typeKey,
          severityKey: "unknown",
          actionMarkup: buildActivityAction("Acompanhar", "documents", documentItem.id, "documents")
        };
      }

      if (status === "failed") {
        return {
          documentId: documentItem.id,
          dotClass: "activity-dot--warn",
          html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> falhou e precisa de uma nova tentativa",
          timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
          timestamp: documentItem.updated_at || documentItem.created_at,
          searchText: (documentItem.original_name || "") + " precisa de revisao",
          statusKey: "failed",
          typeKey: typeKey,
          severityKey: "unknown",
          actionMarkup: buildActivityAction("Enviar novamente", "analyze", documentItem.id, "analyze")
        };
      }

      return {
        documentId: documentItem.id,
        dotClass: "activity-dot--default",
        html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> disponivel no painel",
        timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
        timestamp: documentItem.updated_at || documentItem.created_at,
        searchText: (documentItem.original_name || "") + " disponivel no painel",
        statusKey: status || "uploaded",
        typeKey: typeKey,
        severityKey: "unknown",
        actionMarkup: buildActivityAction("Abrir", "documents", documentItem.id, "documents")
      };
    });
  }

  function applySearchFilter() {
    var filteredDocuments = filterDocuments(currentDocuments);
    var activeDocument = findDocumentById(currentDocumentId);
    var hasActiveInFilter = activeDocument && filteredDocuments.some(function (item) {
      return item.id === activeDocument.id;
    });

    updateNavigationBadges(currentDocuments);
    renderTable(overviewDocumentsTable, filteredDocuments, 5);
    renderTable(documentsTable, filteredDocuments);
    renderSelectOptions(riskDocSelect, filteredDocuments);
    renderSelectOptions(guidedDocSelect, filteredDocuments);
    renderSelectOptions(resultsDocSelect, filteredDocuments);
    renderOverviewActivity(filterOverviewActivityItems(overviewActivityItems));
    renderAuditHistory(filterAuditHistoryItems(auditHistoryItems));
    refreshOverviewComparisons(filteredDocuments);

    setActiveDocument(hasActiveInFilter ? currentDocumentId : (filteredDocuments.length ? filteredDocuments[0].id : ""));
  }

  async function loadOverviewData() {
    var responses = await Promise.all([
      requestJsonDetailed("/api/dashboard/overview", { method: "GET" }),
      requestJsonDetailed("/api/dashboard/risk-distribution", { method: "GET" }),
      requestJsonDetailed("/api/dashboard/audit-activity?limit=50", { method: "GET" })
    ]);
    var overviewResponse = responses[0] || {};
    var riskResponse = responses[1] || {};
    var auditResponse = responses[2] || {};
    var overviewData = overviewResponse.ok ? (overviewResponse.payload || {}) : {};
    var riskData = riskResponse.ok ? (riskResponse.payload || {}) : {};
    var auditData = auditResponse.ok ? (auditResponse.payload || {}) : {};
    var recentDocuments = Array.isArray(overviewData.recentDocuments)
      ? overviewData.recentDocuments
      : currentDocuments.slice(0, 5);
    var activityItems = [];
    var auditItems = [];
    var partialFailures = [];

    if (!overviewResponse.ok) {
      partialFailures.push("visao geral");
    }

    if (!riskResponse.ok) {
      partialFailures.push("distribuicao de riscos");
    }

    if (!auditResponse.ok) {
      partialFailures.push("historico de auditoria");
    }

    renderOverviewKpis(overviewData.kpis || {}, riskData.distribution || {});

    if (overviewResponse.ok) {
      activityItems = await buildOverviewActivityFiltered(recentDocuments);
    } else {
      activityItems = buildOverviewActivityFallback(currentDocuments);
    }

    if (auditResponse.ok) {
      auditItems = buildAuditActivityItems(auditData.events || []);
      auditHistoryItems = auditItems;
    } else {
      auditHistoryItems = [];
    }

    overviewActivityItems = mergeOverviewActivityItems(activityItems, auditItems, 6);
    renderOverviewActivity(filterOverviewActivityItems(overviewActivityItems));
    renderAuditHistory(filterAuditHistoryItems(auditHistoryItems));
    refreshOverviewComparisons(filterDocuments(currentDocuments));

    if (partialFailures.length) {
      setDocumentsFeedback(
        "Parte do painel nao carregou agora: " + partialFailures.join(", ") + ". Os demais dados continuam disponiveis.",
        "info"
      );
    }
  }

  function syncDocumentViews(documents) {
    currentDocuments = Array.isArray(documents) ? documents : [];
    pruneSelectedDocuments(currentDocuments);
    renderSettingsUsageStatus(currentDocuments, latestHealthSnapshot);
    applySearchFilter();
  }

  function buildAnalysisMeta(documentItem, analysis) {
    var parts = [];

    if (analysis && analysis.contract_type) {
      parts.push(analysis.contract_type);
    }

    parts.push("Analisado em " + formatDate(analysis && analysis.updated_at));
    parts.push((Array.isArray(analysis && analysis.clauses) ? analysis.clauses.length : 0) + " cláusulas identificadas");

    return escapeHtml(parts.join(" · "));
  }

  function getClauseAudioKey(clause, index) {
    var clauseNumber = clause && clause.clause_number ? String(clause.clause_number) : String(index + 1);
    return "clause-audio-" + clauseNumber + "-" + index;
  }

  function buildClauseAudioText(clause, index) {
    var clauseLabel = clause && clause.clause_number
      ? "Clausula " + clause.clause_number
      : "Clausula " + String(index + 1);
    var title = clause && clause.clause_title ? clause.clause_title : "";
    var simplified = clause && clause.simplified_text ? clause.simplified_text : "";
    var why = clause && clause.why_it_matters ? clause.why_it_matters : "";
    var parts = [];

    parts.push(clauseLabel + (title ? ". " + title + "." : "."));

    if (simplified) {
      parts.push("Explicacao simplificada. " + simplified);
    }

    if (why) {
      parts.push("Por que isso importa. " + why);
    }

    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function createClauseAudioButtonMarkup(clause, index) {
    if (!isSpeechSynthesisSupported) {
      return "";
    }

    return [
      '<button class="clause-audio-btn" type="button" data-audio-action="toggle" data-audio-key="' + escapeHtml(getClauseAudioKey(clause, index)) + '" data-audio-text="' + escapeHtml(buildClauseAudioText(clause, index)) + '" aria-label="Ouvir explicacao simplificada desta clausula">',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
      '<span class="clause-audio-btn__label">Ouvir explicacao</span>',
      "</button>"
    ].join("");
  }

  function setClauseAudioButtonState(button, isPlaying) {
    var label = button ? button.querySelector(".clause-audio-btn__label") : null;

    if (!button) {
      return;
    }

    button.classList.toggle("is-playing", Boolean(isPlaying));
    button.setAttribute(
      "aria-label",
      isPlaying
        ? "Parar leitura em audio desta clausula"
        : "Ouvir explicacao simplificada desta clausula"
    );

    if (label) {
      label.textContent = isPlaying ? "Parar audio" : "Ouvir explicacao";
    }
  }

  function clearActiveClauseAudio() {
    if (activeSpeechButton) {
      setClauseAudioButtonState(activeSpeechButton, false);
    }

    activeSpeechButton = null;
    activeSpeechKey = "";
  }

  function choosePortugueseVoice() {
    var voices = speechSynthesisApi && typeof speechSynthesisApi.getVoices === "function"
      ? speechSynthesisApi.getVoices()
      : [];
    var ptBrVoice = voices.find(function (voice) {
      return /^pt-BR/i.test(String(voice && voice.lang || ""));
    });
    var ptVoice;

    if (ptBrVoice) {
      return ptBrVoice;
    }

    ptVoice = voices.find(function (voice) {
      return /^pt/i.test(String(voice && voice.lang || ""));
    });

    return ptVoice || null;
  }

  function stopClauseAudio() {
    if (speechSynthesisApi && typeof speechSynthesisApi.cancel === "function") {
      speechSynthesisApi.cancel();
    }

    clearActiveClauseAudio();
  }

  function speakClauseExplanation(button) {
    var text;
    var key;
    var utterance;
    var voice;

    if (!isSpeechSynthesisSupported || !button) {
      return;
    }

    text = String(button.getAttribute("data-audio-text") || "").trim();
    key = String(button.getAttribute("data-audio-key") || "");

    if (!text) {
      return;
    }

    if (activeSpeechKey && activeSpeechKey === key) {
      stopClauseAudio();
      return;
    }

    stopClauseAudio();

    utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1;

    voice = choosePortugueseVoice();
    if (voice) {
      utterance.voice = voice;
      if (voice.lang) {
        utterance.lang = voice.lang;
      }
    }

    utterance.onend = function () {
      clearActiveClauseAudio();
    };

    utterance.onerror = function () {
      clearActiveClauseAudio();
    };

    activeSpeechButton = button;
    activeSpeechKey = key;
    setClauseAudioButtonState(button, true);
    speechSynthesisApi.speak(utterance);
  }

  function buildRiskItems(result) {
    var items = [];
    var seen = {};
    var risks = Array.isArray(result && result.risks) ? result.risks : [];
    var clauses = Array.isArray(result && result.clauses) ? result.clauses : [];

    risks.forEach(function (risk) {
      items.push({
        clauseNumber: risk.clause_number,
        title: risk.title || "Risco identificado",
        severity: risk.severity,
        category: risk.category || "Riscos identificados",
        summary: risk.impact_description || risk.simplified_explanation || risk.original_excerpt || "",
        recommendation: risk.recommendation || "",
        source: risk.original_excerpt || "",
        action: normalizeSeverity(risk.severity) === "critical" ? "negotiate" : "review"
      });
      seen[String(risk.clause_number || "") + "|" + String(risk.title || "")] = true;
    });

    clauses.forEach(function (clause) {
      var title = clause.clause_title || clause.simplified_text || "Clausula";
      var key = String(clause.clause_number || "") + "|" + title;
      var severity = normalizeSeverity(clause.severity);

      if (seen[key] || severity === "neutral") {
        return;
      }

      items.push({
        clauseNumber: clause.clause_number,
        title: title,
        severity: clause.severity,
        category: severity === "safe" ? "Clausulas seguras" : "Clausulas em destaque",
        summary: clause.why_it_matters || clause.simplified_text || "",
        recommendation: clause.why_it_matters || "",
        source: clause.original_text || "",
        action: severity === "safe" ? "approve" : "review"
      });
    });

    return items.sort(function (left, right) {
      var order = { critical: 0, attention: 1, safe: 2, neutral: 3 };
      var leftKey = normalizeSeverity(left.severity);
      var rightKey = normalizeSeverity(right.severity);
      return order[leftKey] - order[rightKey];
    });
  }

  function createRiskCardMarkup(item) {
    var severity = getSeverityMeta(item.severity);
    var actionClass =
      item.action === "negotiate"
        ? "risk-action-btn--negotiate"
        : item.action === "approve"
          ? "risk-action-btn--approved"
          : "risk-action-btn--review";
    var actionLabel =
      item.action === "negotiate"
        ? "Negociar"
        : item.action === "approve"
          ? "Aprovado"
          : "Revisar";

    return [
      '<div class="risk-card ' + severity.cardClass + '" data-risk="' + escapeHtml(severity.key) + '">',
      '<div class="risk-card__head">',
      '<span class="risk-badge ' + severity.pillClass + '">' + escapeHtml(severity.label) + "</span>",
      '<span class="risk-clause">' + escapeHtml(item.clauseNumber ? "Cláusula " + item.clauseNumber : "Sem cláusula") + "</span>",
      "</div>",
      "<h3>" + escapeHtml(item.title) + "</h3>",
      "<p>" + escapeHtml(item.summary || item.recommendation || "Sem detalhes adicionais.") + "</p>",
      '<div class="risk-card__footer">',
      '<span class="risk-source">' + escapeHtml(item.source || item.recommendation || "Sem trecho disponível.") + "</span>",
      '<button class="risk-action-btn ' + actionClass + '" type="button">' + escapeHtml(actionLabel) + "</button>",
      "</div>",
      "</div>"
    ].join("");
  }

  function createClauseMarkup(clause, index) {
    var severity = getSeverityMeta(clause.severity);
    var confidence = String(clause.confidence || "medium").toLowerCase();
    var confidenceClass =
      confidence === "high"
        ? "detail-confidence--high"
        : confidence === "low"
          ? "detail-confidence--low"
          : "detail-confidence--medium";

    return [
      '<div class="clause-item ' + severity.clauseClass + '" data-clause-item>',
      '<button class="clause-trigger" type="button" data-clause-trigger>',
      '<span class="clause-num">' + escapeHtml(String(index + 1)) + "</span>",
      '<div class="clause-preview">',
      '<div class="clause-title">' + escapeHtml((clause.clause_title || "Clausula") + (clause.clause_number ? " - Clausula " + clause.clause_number : "")) + "</div>",
      '<div class="clause-original">' + escapeHtml(clause.original_text || "Sem texto original disponível.") + "</div>",
      '<span class="badge ' + severity.badgeClass + '" style="font-size:11px"><span class="badge-dot"></span>' + escapeHtml(severity.label) + "</span>",
      "</div>",
      '<svg class="clause-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
      "</button>",
      '<div class="clause-detail">',
      "<div>",
      '<span class="detail-label">Texto original</span>',
      '<p class="detail-original">' + escapeHtml(clause.original_text || "Sem texto original disponível.") + "</p>",
      '<div class="detail-confidence ' + confidenceClass + '"><span>Confiança ' + escapeHtml(confidence) + "</span></div>",
      "</div>",
      "<div>",
      '<span class="detail-label">Explicacao simplificada</span>',
      createClauseAudioButtonMarkup(clause, index),
      '<p class="detail-simple">' + escapeHtml(clause.simplified_text || "Sem resumo simplificado.") + "</p>",
      '<div class="detail-why"><span>' + escapeHtml(clause.why_it_matters || "Sem contexto adicional.") + "</span></div>",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function buildChecklistItems(result) {
    var risks = Array.isArray(result && result.risks) ? result.risks : [];

    if (!risks.length) {
      return [
        {
          title: "Revisar resumo da análise",
          text: "Não há riscos listados. Confirme se o contrato foi processado corretamente."
        }
      ];
    }

    return risks.slice(0, 6).map(function (risk) {
      return {
        title: (risk.title || "Revisar ponto") + (risk.clause_number ? " (Cl. " + risk.clause_number + ")" : ""),
        text: risk.recommendation || risk.impact_description || risk.simplified_explanation || "Validar esta cláusula antes de seguir."
      };
    });
  }

  function buildFocusItems(result) {
    return buildRiskItems(result)
      .filter(function (item) {
        var severity = normalizeSeverity(item.severity);
        return severity === "critical" || severity === "attention";
      })
      .slice(0, 5)
      .map(function (item) {
        return item.title + (item.clauseNumber ? " (Cl. " + item.clauseNumber + ")" : "");
      });
  }

  function buildRecommendationItems(result) {
    var items = [];
    var risks = Array.isArray(result && result.risks) ? result.risks : [];

    risks.forEach(function (risk) {
      var text = risk.recommendation || risk.impact_description || risk.simplified_explanation;
      if (text) {
        items.push(text);
      }
    });

    if (!items.length) {
      buildChecklistItems(result).forEach(function (item) {
        if (item && item.text) {
          items.push(item.text);
        }
      });
    }

    return items.slice(0, 5);
  }

  function renderChecklist(items) {
    var checklistRoot = document.getElementById("checklist-items");
    var checklistLabel = document.getElementById("checklist-label");
    var checklistFill = document.getElementById("checklist-fill");

    if (!checklistRoot || !checklistLabel || !checklistFill) return;

    checklistRoot.innerHTML = items
      .map(function (item, index) {
        return [
          '<div class="checklist-item">',
          '<label class="checklist-label">',
          '<input type="checkbox" data-checklist-index="' + escapeHtml(String(index)) + '">',
          "<div>",
          '<div class="checklist-title">' + escapeHtml(item.title) + "</div>",
          '<div class="checklist-desc">' + escapeHtml(item.text) + "</div>",
          "</div>",
          "</label>",
          "</div>"
        ].join("");
      })
      .join("");

    checklistLabel.textContent = "0 de " + items.length + " itens concluidos";
    checklistFill.style.width = "0%";
  }

  function updateChecklistProgress() {
    var checklistRoot = document.getElementById("checklist-items");
    var checklistLabel = document.getElementById("checklist-label");
    var checklistFill = document.getElementById("checklist-fill");
    var inputs = checklistRoot
      ? checklistRoot.querySelectorAll('input[type="checkbox"]')
      : [];
    var total = inputs.length;
    var done = 0;

    Array.prototype.forEach.call(inputs, function (input) {
      if (input.checked) done += 1;
    });

    if (checklistLabel) {
      checklistLabel.textContent = done + " de " + total + " itens concluidos";
    }

    if (checklistFill) {
      checklistFill.style.width = total ? String((done / total) * 100) + "%" : "0%";
    }
  }

  function renderAnalysisEmptyState(title, message) {
    var titleEl = analysisResult ? analysisResult.querySelector(".analysis-title") : null;
    var metaEl = analysisResult ? analysisResult.querySelector(".analysis-meta") : null;
    var breakdownEl = analysisResult ? analysisResult.querySelector(".analysis-breakdown-bar") : null;
    var risksEl = analysisResult ? analysisResult.querySelector(".risk-cards-grid") : null;
    var scoreRing = analysisResult ? analysisResult.querySelector(".ring") : null;
    var scoreValue = analysisResult ? analysisResult.querySelector(".ring-val") : null;
    var scoreMax = analysisResult ? analysisResult.querySelector(".ring-max") : null;
    var isFirstUse = !currentDocuments.length && !getSearchQuery();

    if (uploadZone) uploadZone.style.display = "";
    if (analysisResult) {
      analysisResult.classList.add("visible");
    }
    if (titleEl) titleEl.textContent = title;
    if (metaEl) metaEl.textContent = message;
    if (scoreValue) scoreValue.textContent = "--";
    if (scoreMax) scoreMax.textContent = "";
    setRingTone(scoreRing, "ring--warn");
    if (breakdownEl) {
      breakdownEl.innerHTML = '<div style="flex:1;background:var(--neutral-4)"></div>';
    }
    if (risksEl) {
      risksEl.innerHTML = isFirstUse
        ? getDocumentOnboardingMarkup()
        : '<div class="table-empty">' + escapeHtml(message) + "</div>";
    }
    renderRisksEmpty(message);
    renderGuidedEmpty(message);
    renderResultsEmpty(message);
  }

  function renderAnalyzeView(documentItem, result) {
    var analysis = result.analysis || {};
    var risks = buildRiskItems(result);
    var scoreMeta = getRiskScoreMeta(analysis.risk_score);
    var titleEl = analysisResult.querySelector(".analysis-title");
    var metaEl = analysisResult.querySelector(".analysis-meta");
    var breakdownEl = analysisResult.querySelector(".analysis-breakdown-bar");
    var risksEl = analysisResult.querySelector(".risk-cards-grid");
    var scoreRing = analysisResult.querySelector(".ring");
    var scoreValue = analysisResult.querySelector(".ring-val");
    var scoreMax = analysisResult.querySelector(".ring-max");

    if (uploadZone) uploadZone.style.display = "none";
    analysisResult.classList.add("visible");

    if (titleEl) titleEl.textContent = documentItem.original_name || "documento";
    if (metaEl) metaEl.textContent = (analysis.contract_type || "Contrato") + " · " + formatDate(analysis.updated_at) + " · " + (Array.isArray(result.clauses) ? result.clauses.length : 0) + " cláusulas";
    if (scoreValue) scoreValue.textContent = formatRiskScore(analysis.risk_score);
    if (scoreMax) scoreMax.textContent = "/100";
    setRingTone(scoreRing, scoreMeta.ringClass);
    renderBreakdownBar(breakdownEl, buildBreakdown(result));
    risksEl.innerHTML = risks.length
      ? risks.slice(0, 4).map(createRiskCardMarkup).join("")
      : '<div class="table-empty">Nenhum risco destacado nessa análise.</div>';
  }

  function renderRisksEmpty(message) {
    var riskGroupsRoot = document.getElementById("risk-groups-root");
    var counts = document.querySelectorAll(".risk-count-num");

    Array.prototype.forEach.call(counts, function (countEl) {
      countEl.textContent = "0";
    });

    if (!riskGroupsRoot) return;

    riskGroupsRoot.innerHTML = [
      '<div class="risk-filters">',
      '<button class="risk-filter active" data-filter="all">Todos</button>',
      '<button class="risk-filter" data-filter="critical">Críticos</button>',
      '<button class="risk-filter" data-filter="attention">Atenção</button>',
      '<button class="risk-filter" data-filter="safe">Seguros</button>',
      "</div>",
      !currentDocuments.length && !getSearchQuery()
        ? getDocumentOnboardingMarkup()
        : '<div class="card"><div class="table-empty">' + escapeHtml(message) + "</div></div>"
    ].join("");

    riskFilters = Array.prototype.slice.call(document.querySelectorAll(".risk-filter"));
    bindRiskFilters();
  }

  function renderRisksView(documentItem, result) {
    var riskGroupsRoot = document.getElementById("risk-groups-root");
    var items = buildRiskItems(result);
    var counts = countItemsBySeverity(items);
    var riskCounts = document.querySelectorAll(".risk-count-num");
    var grouped = {};

    if (riskCounts[0]) riskCounts[0].textContent = String(counts.critical);
    if (riskCounts[1]) riskCounts[1].textContent = String(counts.attention);
    if (riskCounts[2]) riskCounts[2].textContent = String(counts.safe);

    items.forEach(function (item) {
      var groupName = item.category || "Outros";
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    });

    if (!riskGroupsRoot) return;

    var markup = [
      '<div class="risk-filters">',
      '<button class="risk-filter' + (currentRiskFilter === "all" ? " active" : "") + '" data-filter="all">Todos</button>',
      '<button class="risk-filter' + (currentRiskFilter === "critical" ? " active" : "") + '" data-filter="critical">Críticos</button>',
      '<button class="risk-filter' + (currentRiskFilter === "attention" ? " active" : "") + '" data-filter="attention">Atenção</button>',
      '<button class="risk-filter' + (currentRiskFilter === "safe" ? " active" : "") + '" data-filter="safe">Seguros</button>',
      "</div>"
    ];

    Object.keys(grouped).forEach(function (groupName) {
      markup.push('<div class="risk-group-title">' + escapeHtml(groupName) + "</div>");
      markup.push('<div class="risk-cards-grid">');
      grouped[groupName].forEach(function (item) {
        markup.push(createRiskCardMarkup(item));
      });
      markup.push("</div>");
    });

    if (!items.length) {
      markup.push('<div class="card"><div class="table-empty">Nenhum risco encontrado para ' + escapeHtml(documentItem.original_name) + ".</div></div>");
    }

    riskGroupsRoot.innerHTML = markup.join("");
    riskFilters = Array.prototype.slice.call(document.querySelectorAll(".risk-filter"));
    bindRiskFilters();
    applyRiskFilter(currentRiskFilter);
  }

  function renderGuidedEmpty(message) {
    var summaryTitle = document.querySelector(".guided-summary-title");
    var summaryMeta = document.querySelector(".guided-summary-meta");
    var summaryText = document.querySelector(".guided-summary-text");
    var summaryRing = document.querySelector("#guided-resumo .ring");
    var summaryValue = document.querySelector("#guided-resumo .ring-val");
    var summaryMax = document.querySelector("#guided-resumo .ring-max");
    var clausesRoot = document.getElementById("guided-clausulas");
    var breakdownBar = document.querySelector(".guided-breakdown-bar");
    var breakdownLegend = document.querySelector(".guided-breakdown-legend");
    var recommendations = document.querySelectorAll(".guided-rec");

    if (summaryTitle) summaryTitle.textContent = "Nenhum documento selecionado";
    if (summaryMeta) summaryMeta.textContent = "";
    if (summaryText) summaryText.textContent = message;
    if (summaryValue) summaryValue.textContent = "--";
    if (summaryMax) summaryMax.textContent = "";
    setRingTone(summaryRing, "ring--warn");
    renderBreakdownBar(breakdownBar, { critical: 0, attention: 0, safe: 0, neutral: 0 });
    renderBreakdownLegend(breakdownLegend, { critical: 0, attention: 0, safe: 0, neutral: 0 });

    Array.prototype.forEach.call(recommendations, function (item, index) {
      if (index > 0) {
        item.remove();
      }
    });

    var firstRecommendation = document.querySelector(".guided-rec");
    if (firstRecommendation) {
      firstRecommendation.innerHTML = "<div>" + escapeHtml(message) + "</div>";
    }

    stopClauseAudio();

    if (clausesRoot) {
      clausesRoot.innerHTML = !currentDocuments.length && !getSearchQuery()
        ? getDocumentOnboardingMarkup()
        : '<div class="card"><div class="table-empty">' + escapeHtml(message) + "</div></div>";
    }

    renderChecklist([
      {
        title: "Aguardar análise disponível",
        text: message
      }
    ]);
  }

  function renderGuidedView(documentItem, result) {
    var analysis = result.analysis || {};
    var counts = buildBreakdown(result);
    var scoreMeta = getRiskScoreMeta(analysis.risk_score);
    var summaryTitle = document.querySelector(".guided-summary-title");
    var summaryMeta = document.querySelector(".guided-summary-meta");
    var summaryText = document.querySelector(".guided-summary-text");
    var summaryRing = document.querySelector("#guided-resumo .ring");
    var summaryValue = document.querySelector("#guided-resumo .ring-val");
    var summaryMax = document.querySelector("#guided-resumo .ring-max");
    var breakdownBar = document.querySelector(".guided-breakdown-bar");
    var breakdownLegend = document.querySelector(".guided-breakdown-legend");
    var clausesRoot = document.getElementById("guided-clausulas");
    var recommendationsMarkup = [];
    var recommendationsTitle = document.querySelector(".guided-rec-title");
    var firstRecommendation = document.querySelector(".guided-rec");
    var risks = Array.isArray(result.risks) ? result.risks : [];

    if (summaryTitle) summaryTitle.textContent = documentItem.original_name || "documento";
    if (summaryMeta) summaryMeta.textContent = (analysis.contract_type || "Contrato") + " · " + (Array.isArray(result.clauses) ? result.clauses.length : 0) + " cláusulas · " + formatDate(analysis.updated_at);
    if (summaryText) summaryText.innerHTML = escapeHtml(analysis.summary || "Sem resumo disponível.");
    if (summaryValue) summaryValue.textContent = formatRiskScore(analysis.risk_score);
    if (summaryMax) summaryMax.textContent = "/100";
    setRingTone(summaryRing, scoreMeta.ringClass);
    renderBreakdownBar(breakdownBar, counts);
    renderBreakdownLegend(breakdownLegend, counts);

    risks.slice(0, 3).forEach(function (risk) {
      var severity = normalizeSeverity(risk.severity);
      var iconClass = severity === "critical" ? "guided-rec-icon--danger" : "guided-rec-icon--warn";
      recommendationsMarkup.push(
        '<div class="guided-rec"><span class="guided-rec-icon ' + iconClass + '"></span><div><strong>' +
          escapeHtml(risk.title || "Ponto importante") +
          "</strong> - " +
          escapeHtml(risk.recommendation || risk.impact_description || risk.simplified_explanation || "Revise este item antes de assinar.") +
          "</div></div>"
      );
    });

    if (recommendationsTitle) {
      var next = recommendationsTitle.nextElementSibling;
      while (next && next.classList.contains("guided-rec")) {
        var current = next;
        next = next.nextElementSibling;
        current.remove();
      }

      recommendationsTitle.insertAdjacentHTML("afterend", recommendationsMarkup.join("") || '<div class="guided-rec"><div>Sem recomendações adicionais.</div></div>');
    } else if (firstRecommendation) {
      firstRecommendation.innerHTML = "<div>Sem recomendações adicionais.</div>";
    }

    if (clausesRoot) {
      clausesRoot.innerHTML = Array.isArray(result.clauses) && result.clauses.length
        ? result.clauses.map(createClauseMarkup).join("")
        : '<div class="card"><div class="table-empty">Sem cláusulas para exibir.</div></div>';
    }

    stopClauseAudio();
    renderChecklist(buildChecklistItems(result));

    var progressText = document.querySelector(".guided-progress-text");
    var progressFill = document.querySelector(".guided-progress-fill");
    var totalClauses = Array.isArray(result.clauses) ? result.clauses.length : 0;
    if (progressText) progressText.textContent = totalClauses ? "1 de " + totalClauses + " revisadas" : "0 de 0 revisadas";
    if (progressFill) progressFill.style.width = totalClauses ? String(Math.max(20, Math.round(100 / totalClauses))) + "%" : "0%";
  }

  function renderResultsEmpty(message) {
    var scoreLabel = document.querySelector(".results-score-label");
    var scoreDesc = document.querySelector(".results-score-desc");
    var scoreRing = document.querySelector("#page-results .ring");
    var scoreValue = document.querySelector("#page-results .ring-val");
    var scoreMax = document.querySelector("#page-results .ring-max");
    var metaValues = document.querySelectorAll(".results-meta-value");
    var executive = document.querySelector(".results-executive p");
    var clausesSection = document.getElementById("results-clauses-section");
    var focusList = document.getElementById("results-focus-list");
    var actionsList = document.getElementById("results-actions-list");
    var deadlinesRoot = document.getElementById("results-deadlines-list");
    var deadlinesTitle = document.getElementById("results-deadlines-title");
    var verdictTitle = document.querySelector(".verdict-title");
    var verdictText = document.querySelector(".verdict-text");

    setResultsFeedback("", "");

    if (scoreLabel) scoreLabel.textContent = "Sem análise";
    if (scoreDesc) scoreDesc.textContent = message;
    if (scoreValue) scoreValue.textContent = "--";
    if (scoreMax) scoreMax.textContent = "";
    setRingTone(scoreRing, "ring--warn");

    Array.prototype.forEach.call(metaValues, function (element, index) {
      element.textContent = index === 0 ? "Nenhum documento" : "--";
    });

    if (executive) executive.textContent = message;

    if (clausesSection) {
      clausesSection.innerHTML = '<div class="analysis-section-title">Clausulas Identificadas</div><div class="table-empty">' + escapeHtml(message) + "</div>";
    }

    if (focusList) {
      focusList.innerHTML = "<li>" + escapeHtml(message) + "</li>";
    }

    if (actionsList) {
      actionsList.innerHTML = "<li>" + escapeHtml(message) + "</li>";
    }

    if (deadlinesTitle) {
      deadlinesTitle.textContent = "Linha do tempo da analise";
    }

    if (deadlinesRoot) {
      deadlinesRoot.innerHTML = !currentDocuments.length && !getSearchQuery()
        ? getDocumentOnboardingMarkup()
        : '<div class="table-empty">' + escapeHtml(message) + "</div>";
    }

    if (verdictTitle) verdictTitle.textContent = "Análise indisponível";
    if (verdictText) verdictText.textContent = message;
  }

  function renderResultsView(documentItem, result) {
    var analysis = result.analysis || {};
    var counts = buildBreakdown(result);
    var scoreMeta = getRiskScoreMeta(analysis.risk_score);
    var scoreRing = document.querySelector("#page-results .ring");
    var scoreValue = document.querySelector("#page-results .ring-val");
    var scoreMax = document.querySelector("#page-results .ring-max");
    var scoreLabel = document.querySelector(".results-score-label");
    var scoreDesc = document.querySelector(".results-score-desc");
    var metaValues = document.querySelectorAll(".results-meta-value");
    var executive = document.querySelector(".results-executive p");
    var executiveBreakdown = document.querySelector("#page-results .analysis-breakdown-bar");
    var executiveLegend = executive && executive.parentElement ? executive.parentElement.querySelector("div[style*='display:flex;gap:16px']") : null;
    var clausesSection = document.getElementById("results-clauses-section");
    var focusList = document.getElementById("results-focus-list");
    var actionsList = document.getElementById("results-actions-list");
    var deadlinesRoot = document.getElementById("results-deadlines-list");
    var deadlinesTitle = document.getElementById("results-deadlines-title");
    var verdictTitle = document.querySelector(".verdict-title");
    var verdictText = document.querySelector(".verdict-text");
    var focusItems = buildFocusItems(result);
    var recommendationItems = buildRecommendationItems(result);

    setResultsFeedback("", "");

    if (scoreValue) scoreValue.textContent = formatRiskScore(analysis.risk_score);
    if (scoreMax) scoreMax.textContent = "/100";
    if (scoreLabel) scoreLabel.textContent = scoreMeta.label;
    if (scoreDesc) scoreDesc.textContent = scoreMeta.description;
    setRingTone(scoreRing, scoreMeta.ringClass);

    if (metaValues[0]) metaValues[0].textContent = documentItem.original_name || "documento";
    if (metaValues[1]) metaValues[1].textContent = formatDate(analysis.updated_at);
    if (metaValues[2]) metaValues[2].textContent = analysis.contract_type || "Contrato";
    if (metaValues[3]) metaValues[3].textContent = String(Array.isArray(result.clauses) ? result.clauses.length : 0) + " identificadas";

    if (executive) {
      executive.textContent = analysis.summary || "Sem resumo executivo disponível.";
    }

    renderBreakdownBar(executiveBreakdown, counts);
    renderBreakdownLegend(executiveLegend, counts);

    if (clausesSection) {
      var title = clausesSection.querySelector(".analysis-section-title");
      clausesSection.innerHTML = '<div class="analysis-section-title">' + (title ? title.textContent : "Clausulas Identificadas") + "</div>" +
        (Array.isArray(result.clauses) && result.clauses.length
          ? result.clauses.map(function (clause) {
              var severity = getSeverityMeta(clause.severity);
              return '<div class="results-clause-row"><span class="results-clause-dot ' + severity.dotClass + '"></span><div style="flex:1"><div class="results-clause-title">' +
                escapeHtml((clause.clause_title || "Clausula") + (clause.clause_number ? " - " + clause.clause_number : "")) +
                '</div><div class="results-clause-desc">' +
                escapeHtml(clause.why_it_matters || clause.simplified_text || "Sem descricao adicional.") +
                '</div></div><span class="badge ' + severity.badgeClass + '"><span class="badge-dot"></span>' + escapeHtml(severity.label) + "</span></div>";
            }).join("")
          : '<div class="table-empty">Sem cláusulas para exibir.</div>');
    }

    if (focusList) {
      focusList.innerHTML = (focusItems.length ? focusItems : ["Nenhum ponto de atenção destacado."])
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("");
    }

    if (actionsList) {
      actionsList.innerHTML = (recommendationItems.length ? recommendationItems : ["Sem recomendações adicionais no momento."])
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("");
    }

    if (deadlinesTitle) {
      deadlinesTitle.textContent = "Linha do tempo da análise";
    }

    if (deadlinesRoot) {
      deadlinesRoot.innerHTML = [
        createDeadlineCard("Documento enviado", formatDate(documentItem.created_at), ""),
        createDeadlineCard("Análise gerada em", formatDate(analysis.updated_at), "danger"),
        createDeadlineCard("Status atual", getStatusMeta(documentItem.processing_status).label, "warn"),
        createDeadlineCard("Próximo passo", recommendationItems[0] || "Revisar recomendações", "")
      ].join("");
    }

    if (verdictTitle) {
      verdictTitle.textContent =
        scoreMeta.label === "Risco Alto"
          ? "Não assine sem negociar"
          : scoreMeta.label === "Risco Moderado"
            ? "Revise antes de seguir"
            : "Documento em melhor estado";
    }

    if (verdictText) {
      verdictText.textContent = analysis.recommendation || analysis.summary || "Sem veredicto adicional.";
    }
  }

  function createDeadlineCard(title, value, tone) {
    var classSuffix =
      tone === "danger" ? " deadline-icon--danger" : tone === "warn" ? " deadline-icon--warn" : "";

    return [
      '<div class="deadline-card">',
      '<div class="deadline-icon' + classSuffix + '"></div>',
      "<div>",
      '<div class="deadline-title">' + escapeHtml(title) + "</div>",
      '<div class="deadline-date">' + escapeHtml(value) + "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function getCurrentAnalysisPayload() {
    if (!currentDocumentId) {
      return null;
    }

    return analysisCache[currentDocumentId] || null;
  }

  function buildResultsShareText() {
    var documentItem = findDocumentById(currentDocumentId);
    var payload = getCurrentAnalysisPayload();
    var analysis = payload && payload.analysis ? payload.analysis : null;
    var focusItems = payload ? buildFocusItems(payload).slice(0, 3) : [];
    var recommendationItems = payload ? buildRecommendationItems(payload).slice(0, 3) : [];
    var scoreMeta = getRiskScoreMeta(analysis && analysis.risk_score);
    var lines = [];

    if (!documentItem || !analysis) {
      return "";
    }

    lines.push("Resumo da analise - " + (documentItem.original_name || "documento"));
    lines.push("Risco: " + scoreMeta.label + " (" + formatRiskScore(analysis.risk_score) + "/100)");
    lines.push("Tipo: " + (analysis.contract_type || "Contrato"));
    lines.push("Atualizado em: " + formatDate(analysis.updated_at));
    lines.push("");
    lines.push("Resumo executivo:");
    lines.push(analysis.summary || "Sem resumo disponivel.");

    if (focusItems.length) {
      lines.push("");
      lines.push("Pontos para revisar:");
      focusItems.forEach(function (item, index) {
        lines.push((index + 1) + ". " + item);
      });
    }

    if (recommendationItems.length) {
      lines.push("");
      lines.push("Acoes recomendadas:");
      recommendationItems.forEach(function (item, index) {
        lines.push((index + 1) + ". " + item);
      });
    }

    return lines.join("\n");
  }

  async function copyResultsSummary() {
    var summary = buildResultsShareText();

    if (!summary) {
      setResultsFeedback("Escolha um documento com analise concluida para copiar o resumo.", "error");
      return;
    }

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      setResultsFeedback("Seu navegador nao permite copiar automaticamente neste ambiente.", "error");
      return;
    }

    setActionLoading(copyResultsBtn, true, "Copiando...", "Copiar resumo");

    try {
      await navigator.clipboard.writeText(summary);
      setResultsFeedback("Resumo copiado para a area de transferencia.", "success");
    } catch (error) {
      setResultsFeedback("Nao foi possivel copiar o resumo agora.", "error");
    } finally {
      setActionLoading(copyResultsBtn, false, "Copiando...", "Copiar resumo");
    }
  }

  async function shareResultsSummary() {
    var documentItem = findDocumentById(currentDocumentId);
    var payload = getCurrentAnalysisPayload();
    var analysis = payload && payload.analysis ? payload.analysis : null;
    var summary = buildResultsShareText();
    var shareUrl = window.location.origin + window.location.pathname + "#page-results";

    if (!documentItem || !analysis || !summary) {
      setResultsFeedback("Escolha um documento com analise concluida para compartilhar.", "error");
      return;
    }

    setActionLoading(shareResultsBtn, true, "Compartilhando...", "Compartilhar");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Resumo da analise - " + (documentItem.original_name || "documento"),
          text: summary,
          url: shareUrl
        });
        setResultsFeedback("Resumo compartilhado com sucesso.", "success");
        return;
      }

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(summary + "\n\n" + shareUrl);
        setResultsFeedback("Seu navegador nao suporta compartilhamento nativo. Copiamos o resumo para voce.", "info");
        return;
      }

      setResultsFeedback("Compartilhamento nao disponivel neste navegador.", "error");
    } catch (error) {
      if (error && error.name === "AbortError") {
        setResultsFeedback("Compartilhamento cancelado.", "info");
      } else {
        setResultsFeedback("Nao foi possivel compartilhar o resumo agora.", "error");
      }
    } finally {
      setActionLoading(shareResultsBtn, false, "Compartilhando...", "Compartilhar");
    }
  }

  function exportResultsAsPdf() {
    var summary = buildResultsShareText();

    if (!summary) {
      setResultsFeedback("Escolha um documento com analise concluida para exportar.", "error");
      return;
    }

    setActionLoading(exportPdfBtn, true, "Preparando...", "Exportar PDF");
    setResultsFeedback("Abrindo a janela de impressao para salvar o resultado em PDF.", "info");

    window.setTimeout(function () {
      window.print();
      setActionLoading(exportPdfBtn, false, "Preparando...", "Exportar PDF");
    }, 120);
  }

  function renderAllAnalysisViews(documentItem, result) {
    renderAnalyzeView(documentItem, result);
    renderRisksView(documentItem, result);
    renderGuidedView(documentItem, result);
    renderResultsView(documentItem, result);
  }

  async function loadDocuments() {
    setDocumentsFeedback("", "");
    renderTableLoading(overviewDocumentsTable, "Carregando documentos recentes...", false);
    renderTableLoading(documentsTable, "Carregando documentos do painel...", true);
    renderOverviewLoadingState();
    renderAnalysisEmptyState(
      "Carregando painel",
      "Buscando seus documentos e as analises mais recentes."
    );

    try {
      var data = await requestJson("/api/documents", { method: "GET" });
      syncDocumentViews(data.documents || []);
      await hydrateDocumentSeverityCache(currentDocuments);
      applySearchFilter();
      await loadOverviewData();
      hydratePendingDeletionBatch();

      if (!currentDocuments.length) {
        renderAnalysisEmptyState(
          "Nenhum contrato enviado",
          "Envie um arquivo TXT, PDF ou DOCX para começar a análise."
        );
      } else if (currentDocumentId) {
        await loadAndRenderDocumentAnalysis(currentDocumentId);
      }
    } catch (error) {
      syncDocumentViews([]);
      await loadOverviewData();
      setDocumentsFeedback(
        error.message || "Nao foi possivel carregar seus documentos agora.",
        "error"
      );
      renderAnalysisEmptyState(
        "Falha ao carregar documentos",
        error.message || "Não foi possível carregar seus documentos agora."
      );
    }
  }

  function resetUploadUi() {
    if (uploadZone) {
      uploadZone.classList.remove("processing", "drag");
      uploadZone.style.display = "";
    }
    if (uploadProgress) {
      uploadProgress.style.display = "none";
    }
    if (progressFill) {
      progressFill.style.width = "0%";
      progressFill.style.background = "var(--blue)";
    }
    if (progressText) {
      progressText.textContent = "Enviando contrato...";
      progressText.style.color = "";
    }
    if (fileInput) {
      fileInput.value = "";
    }
    if (newAnalysisBtn) {
      newAnalysisBtn.style.display = "none";
    }
  }

function readFilePayload(file) {
    return new Promise(function (resolve, reject) {
      var extension = getFileExtension(file && file.name);

      if (!file) {
        reject(new Error("Nenhum arquivo selecionado."));
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        var arrayBuffer = reader.result;
        var base64Content = arrayBufferToBase64(arrayBuffer);
        var textContent = "";

        if (extension === "txt") {
          textContent = new TextDecoder("utf-8").decode(arrayBuffer).slice(0, 200000);
        }

        resolve({
          originalName: file.name,
          mimeType: file.type || guessClientMimeType(extension),
          extension: extension,
          sizeBytes: file.size || 0,
          textContent: textContent,
          base64Content: base64Content
        });
      };
      reader.onerror = function () {
        reject(new Error("Não foi possível ler o arquivo selecionado."));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function arrayBufferToBase64(value) {
    var bytes = new Uint8Array(value || new ArrayBuffer(0));
    var chunkSize = 32768;
    var binary = "";
    var index = 0;

    while (index < bytes.length) {
      var chunk = bytes.subarray(index, index + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
      index += chunkSize;
    }

    return window.btoa(binary);
  }

  function guessClientMimeType(extension) {
    if (extension === "pdf") return "application/pdf";
    if (extension === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (extension === "txt") return "text/plain";
    return "application/octet-stream";
  }

  async function uploadSelectedFile(file) {
    var extension = getFileExtension(file && file.name);

    if (!file) return;
    if (["pdf", "docx", "txt"].indexOf(extension) === -1) {
      renderAnalysisEmptyState("Formato não suportado", "Envie um arquivo PDF, DOCX ou TXT.");
      return;
    }

    if (uploadZone) {
      uploadZone.classList.add("processing");
    }
    if (uploadProgress) {
      uploadProgress.style.display = "block";
    }

    try {
      progressFill.style.width = "20%";
      progressText.textContent = "Preparando contrato...";
      var payload = await readFilePayload(file);
      progressFill.style.width = "60%";
      progressText.textContent = "Enviando contrato...";

      var created = await requestJson("/api/documents", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      progressFill.style.width = "100%";
      progressText.textContent = "Contrato enviado com sucesso.";
        currentDocumentId = created && created.document ? created.document.id : "";
      await loadDocuments();
      if (newAnalysisBtn) {
        newAnalysisBtn.style.display = "";
      }

      setTimeout(function () {
        resetUploadUi();
        switchPage("documents");
      }, 900);
    } catch (error) {
      progressFill.style.width = "100%";
      progressFill.style.background = "var(--danger)";
      progressText.textContent = error.message || "Falha ao enviar o contrato.";
      progressText.style.color = "var(--danger)";

      setTimeout(function () {
        resetUploadUi();
      }, 1400);
    }
  }

  async function ensureAnalysisForDocument(documentId) {
    if (analysisCache[documentId]) {
      return analysisCache[documentId];
    }

    var existing = await requestJsonDetailed(
      "/api/documents/" + encodeURIComponent(documentId) + "/analysis",
      { method: "GET" }
    );

    if (existing.ok) {
      analysisCache[documentId] = existing.payload;
      return existing.payload;
    }

    var message = existing.payload && existing.payload.message
      ? existing.payload.message
      : "";

    if (existing.status === 400 && message === "No analysis found for this document.") {
      var created = await requestJson("/api/analyses", {
        method: "POST",
        body: JSON.stringify({ documentId: documentId })
      });

      analysisCache[documentId] = created;
      return created;
    }

    throw new Error(message || "Não foi possível carregar a análise.");
  }

  async function loadAndRenderDocumentAnalysis(documentId) {
    var documentItem = findDocumentById(documentId);

    if (!documentItem) {
      renderAnalysisEmptyState(
        "Nenhum documento selecionado",
        "Escolha um documento para visualizar a análise."
      );
      return;
    }

    setActiveDocument(documentId);
    renderAnalysisEmptyState(
      documentItem.original_name || "documento",
      "Carregando a análise mais recente deste contrato."
    );

    try {
      var result = await ensureAnalysisForDocument(documentId);
      renderAllAnalysisViews(documentItem, result);
    } catch (error) {
      renderAnalysisEmptyState(
        documentItem.original_name || "documento",
        error.message || "Não foi possível gerar a análise agora."
      );
    }
  }

  function renderSearchEmptyState() {
    var message = getSearchQuery()
      ? 'Nenhum contrato encontrado para "' + currentSearchQuery + '".'
      : "Nenhum documento selecionado";

    renderAnalysisEmptyState(
      "Busca sem resultados",
      message
    );
  }

  function updateSearchQuery(value) {
    var nextQuery = String(value || "").trim();
    var filteredDocuments;
    var activePage;
    var shouldRefreshAnalysis;

    currentSearchQuery = nextQuery;
    filteredDocuments = filterDocuments(currentDocuments);
    activePage = getVisiblePageName();
    shouldRefreshAnalysis = ["analyze", "risks", "guided", "results"].indexOf(activePage) !== -1;

    applySearchFilter();

    if (!shouldRefreshAnalysis) {
      return;
    }

    if (!filteredDocuments.length) {
      renderSearchEmptyState();
      return;
    }

    if (!currentDocumentId || !filteredDocuments.some(function (item) { return item.id === currentDocumentId; })) {
      loadAndRenderDocumentAnalysis(filteredDocuments[0].id);
    }
  }

  function openDocument(documentId, pageName) {
    if (!documentId) return;
    switchPage(pageName || "results");
    loadAndRenderDocumentAnalysis(documentId);
  }

  function openAnalyzeUploadPicker() {
    switchPage("analyze");

    if (fileInput) {
      fileInput.click();
    }
  }

  function startUploadFromDocuments(file) {
    if (!file) {
      return;
    }

    switchPage("analyze");
    uploadSelectedFile(file);
  }

  async function deleteDocument(documentId) {
    var documentItem = findDocumentById(documentId);
    var documentName = documentItem && documentItem.original_name
      ? documentItem.original_name
      : "este documento";

    if (!documentId) {
      return;
    }

    if (!window.confirm('Excluir "' + documentName + '"? Essa ação também remove o documento do banco e não pode ser desfeita.')) {
      return;
    }

    await requestJson("/api/documents/" + encodeURIComponent(documentId), {
      method: "DELETE"
    });

    delete analysisCache[documentId];
    delete overviewActivityCache[documentId];
    delete documentSeverityCache[documentId];

    if (currentDocumentId === documentId) {
      currentDocumentId = "";
    }

    await loadDocuments();
  }

  async function performDocumentDeletion(documentId) {
    await requestJson("/api/documents/" + encodeURIComponent(documentId), {
      method: "DELETE"
    });

    delete analysisCache[documentId];
    delete overviewActivityCache[documentId];
    delete documentSeverityCache[documentId];
    delete selectedDocumentIds[documentId];

    if (currentDocumentId === documentId) {
      currentDocumentId = "";
    }
  }

  async function deleteDocument(documentId, options) {
    var config = options || {};
    var documentItem = findDocumentById(documentId);
    var documentName = documentItem && documentItem.original_name
      ? documentItem.original_name
      : "este documento";

    if (!documentId) {
      return null;
    }

    if (config.confirm !== false && !window.confirm('Excluir "' + documentName + '"? Essa acao tambem remove o documento do banco e nao pode ser desfeita.')) {
      return null;
    }

    deletingDocumentIds[documentId] = true;
    applySearchFilter();

    try {
      await performDocumentDeletion(documentId);

      if (config.reload !== false) {
        await loadDocuments();
      }

      if (config.feedback !== false) {
        setDocumentsFeedback('"' + documentName + '" foi excluido do painel e do banco.', "success");
      }

      return {
        id: documentId,
        name: documentName
      };
    } finally {
      delete deletingDocumentIds[documentId];
      applySearchFilter();
    }
  }

  async function deleteSelectedDocuments() {
    var selectedIds = getSelectedDocumentIds();
    var successCount = 0;
    var failures = [];
    var firstDeletedName = "";

    if (!selectedIds.length) {
      return;
    }

    if (!window.confirm("Excluir " + selectedIds.length + " documento" + (selectedIds.length > 1 ? "s" : "") + "? Essa acao tambem remove os registros do banco e nao pode ser desfeita.")) {
      return;
    }

    isBulkDeletingDocuments = true;
    selectedIds.forEach(function (documentId) {
      deletingDocumentIds[documentId] = true;
    });
    applySearchFilter();
    setDocumentsFeedback("Excluindo documentos selecionados...", "info");

    try {
      for (var index = 0; index < selectedIds.length; index += 1) {
        try {
          var result = await deleteDocument(selectedIds[index], {
            confirm: false,
            reload: false,
            feedback: false
          });
          successCount += 1;
          if (!firstDeletedName && result && result.name) {
            firstDeletedName = result.name;
          }
        } catch (error) {
          failures.push(error && error.message ? error.message : "Falha ao excluir um documento.");
        }
      }

      await loadDocuments();

      if (failures.length) {
        setDocumentsFeedback(
          successCount > 0
            ? successCount + " documento" + (successCount > 1 ? "s foram" : " foi") + " excluido" + (successCount > 1 ? "s" : "") + ", mas ainda houve " + failures.length + " falha" + (failures.length > 1 ? "s" : "") + ". " + failures[0]
            : "Nao foi possivel excluir os documentos selecionados agora. " + failures[0],
          successCount > 0 ? "info" : "error"
        );
        return;
      }

      setDocumentsFeedback(
        successCount === 1 && firstDeletedName
          ? '"' + firstDeletedName + '" foi excluido do painel e do banco.'
          : successCount + " documentos foram excluidos do painel e do banco.",
        "success"
      );
    } finally {
      isBulkDeletingDocuments = false;
      deletingDocumentIds = {};
      applySearchFilter();
    }
  }

  async function undoPendingDeletionBatch() {
    var batch = pendingDeletionBatch;
    var restoredCount = 0;
    var failures = [];

    if (!batch) {
      return;
    }

    if (batch.timerId) {
      window.clearTimeout(batch.timerId);
    }

    pendingDeletionBatch = null;
    clearPendingDeletionStorage();
    setDocumentsFeedback("Restaurando documento(s) da lixeira...", "info");
    renderDocumentsSelectionSummary(filterDocuments(currentDocuments));

    for (var index = 0; index < batch.documentIds.length; index += 1) {
      try {
        await requestJson("/api/documents/" + encodeURIComponent(batch.documentIds[index]) + "/restore", {
          method: "POST"
        });
        restoredCount += 1;
      } catch (error) {
        failures.push(error && error.message ? error.message : "Falha ao restaurar um documento.");
      }
    }

    await loadDocuments();

    if (failures.length) {
      setDocumentsFeedback(
        restoredCount > 0
          ? restoredCount + " documento" + (restoredCount > 1 ? "s foram" : " foi") + " restaurado" + (restoredCount > 1 ? "s" : "") + ", mas ainda houve " + failures.length + " falha" + (failures.length > 1 ? "s" : "") + ". " + failures[0]
          : "Nao foi possivel desfazer a exclusao agora. " + failures[0],
        restoredCount > 0 ? "info" : "error"
      );
      return;
    }

    setDocumentsFeedback(
      restoredCount === 1
        ? '"' + (batch.documentNames[0] || "documento") + '" voltou para o painel.'
        : "Os documentos voltaram da lixeira temporaria para o painel.",
      "success"
    );
  }

  async function scheduleDeletionBatch(documentIds, options) {
    var config = options || {};
    var uniqueIds = [];
    var documentsToDelete = [];
    var label;
    var feedbackMessage;
    var failures = [];
    var successIds = [];

    if (pendingDeletionBatch) {
      setDocumentsFeedback("Finalize ou desfaça a exclusao pendente antes de iniciar outra.", "info");
      return null;
    }

    (Array.isArray(documentIds) ? documentIds : []).forEach(function (documentId) {
      if (documentId && uniqueIds.indexOf(documentId) === -1) {
        uniqueIds.push(documentId);
      }
    });

    documentsToDelete = uniqueIds.map(findDocumentById).filter(Boolean);
    if (!documentsToDelete.length) {
      return null;
    }

    label = documentsToDelete.length === 1
      ? '"' + (documentsToDelete[0].original_name || "este documento") + '"'
      : String(documentsToDelete.length) + " documentos";

    if (config.confirm !== false && !window.confirm("Excluir " + label + "? Voce ainda podera desfazer por alguns segundos antes da remocao definitiva no banco.")) {
      return null;
    }

    isBulkDeletingDocuments = uniqueIds.length > 1;
    uniqueIds.forEach(function (documentId) {
      deletingDocumentIds[documentId] = true;
    });
    applySearchFilter();

    try {
      for (var index = 0; index < uniqueIds.length; index += 1) {
        var documentId = uniqueIds[index];

        try {
          await requestJson("/api/documents/" + encodeURIComponent(documentId), {
            method: "DELETE"
          });
          successIds.push(documentId);
        } catch (error) {
          failures.push(error && error.message ? error.message : "Falha ao enviar um documento para a lixeira.");
        } finally {
          delete deletingDocumentIds[documentId];
        }
      }
    } finally {
      isBulkDeletingDocuments = false;
      applySearchFilter();
    }

    if (!successIds.length) {
      setDocumentsFeedback("Nao foi possivel mover os documentos para a lixeira agora. " + (failures[0] || ""), "error");
      return null;
    }

    documentsToDelete = documentsToDelete.filter(function (documentItem) {
      return successIds.indexOf(documentItem.id) !== -1;
    });

    currentDocuments = currentDocuments.filter(function (documentItem) {
      return successIds.indexOf(documentItem.id) === -1;
    });

    successIds.forEach(function (documentId) {
      delete selectedDocumentIds[documentId];
      if (currentDocumentId === documentId) {
        currentDocumentId = "";
      }
    });

    syncDocumentViews(currentDocuments);

    pendingDeletionBatch = {
      documentIds: successIds,
      documentNames: documentsToDelete.map(function (documentItem) {
        return documentItem.original_name || "documento";
      }),
      expiresAt: Date.now() + pendingDeletionWindowMs,
      timerId: null
    };
    persistPendingDeletionBatch();
    schedulePendingDeletionFeedbackExpiry();
    renderDocumentsSelectionSummary(filterDocuments(currentDocuments));

    feedbackMessage = documentsToDelete.length === 1
      ? label + " saiu do painel. Desfaca em alguns segundos se foi engano."
      : documentsToDelete.length + " documentos sairam do painel. Desfaca em alguns segundos se precisar.";

    setDocumentsUndoFeedback(feedbackMessage, function () {
      undoPendingDeletionBatch();
    });

    if (failures.length) {
      setDocumentsUndoFeedback(feedbackMessage + " Algumas exclusoes falharam: " + failures[0], function () {
        undoPendingDeletionBatch();
      });
    }

    return {
      documentIds: successIds
    };
  }

  function deleteDocument(documentId, options) {
    return Promise.resolve(scheduleDeletionBatch([documentId], options));
  }

  function deleteSelectedDocuments() {
    return Promise.resolve(scheduleDeletionBatch(getSelectedDocumentIds(), { confirm: true }));
  }

  function applyRiskFilter(filter) {
    currentRiskFilter = filter || "all";
    Array.prototype.forEach.call(document.querySelectorAll("#page-risks .risk-card"), function (card) {
      var level = card.getAttribute("data-risk");
      var show = currentRiskFilter === "all" || currentRiskFilter === level;
      card.style.display = show ? "" : "none";
    });

    Array.prototype.forEach.call(document.querySelectorAll("#page-risks .risk-group-title"), function (title) {
      var next = title.nextElementSibling;
      if (!next || !next.classList.contains("risk-cards-grid")) return;

      var visibleCards = Array.prototype.filter.call(next.querySelectorAll(".risk-card"), function (card) {
        return card.style.display !== "none";
      });

      title.style.display = visibleCards.length ? "" : "none";
      next.style.display = visibleCards.length ? "" : "none";
    });
  }

  function bindRiskFilters() {
    riskFilters.forEach(function (button) {
      button.addEventListener("click", function () {
        riskFilters.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        applyRiskFilter(button.getAttribute("data-filter"));
      });
    });
  }

  function activateGuidedTab(tabName) {
    currentGuidedTab = tabName || "resumo";

    guidedTabs.forEach(function (tab) {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === currentGuidedTab);
    });

    Array.prototype.forEach.call(document.querySelectorAll(".guided-content"), function (content) {
      content.classList.toggle("active", content.id === "guided-" + currentGuidedTab);
    });
  }

  async function handleLoginSubmit() {
    hideLoginError();
    setLoginLoading(true);

    try {
      var payload = {
        email: loginEmailInput ? loginEmailInput.value.trim() : "",
        password: loginPasswordInput ? loginPasswordInput.value : "",
        rememberSession: Boolean(loginRememberInput && loginRememberInput.checked)
      };

      if (authMode === "register") {
        payload.fullName = loginNameInput ? loginNameInput.value.trim() : "";
      }

      var route = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      var data = await requestJson(route, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      settingsLoaded = false;
      overviewActivityCache = {};
      overviewActivityItems = [];
      auditHistoryItems = [];
      currentSearchQuery = "";
      currentStatusFilter = "all";
      currentTypeFilter = "all";
      currentSeverityFilter = "all";
      currentPeriodFilter = "all";
      currentAuditEventFilter = "all";
      documentSeverityCache = {};
      if (dashboardSearchInput) {
        dashboardSearchInput.value = "";
      }
      if (dashboardFilterStatus) {
        dashboardFilterStatus.value = "all";
      }
      if (dashboardFilterType) {
        dashboardFilterType.value = "all";
      }
      if (dashboardFilterSeverity) {
        dashboardFilterSeverity.value = "all";
      }
      if (dashboardFilterPeriod) {
        dashboardFilterPeriod.value = "all";
      }
      if (auditEventFilter) {
        auditEventFilter.value = "all";
      }
      setCurrentUser(data.user || null);
      showApp();
      switchPage("overview");
      await loadDocuments();
    } catch (error) {
      showLoginError(error.message || "Não foi possível autenticar.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await requestJson("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Ignore logout errors and still reset UI.
    }

    resetClientState();
    showLogin();
  }

  async function restoreSession() {
    try {
      var data = await requestJson("/api/auth/me", { method: "GET" });
      settingsLoaded = false;
      overviewActivityCache = {};
      overviewActivityItems = [];
      auditHistoryItems = [];
      currentSearchQuery = "";
      currentStatusFilter = "all";
      currentTypeFilter = "all";
      currentSeverityFilter = "all";
      currentPeriodFilter = "all";
      currentAuditEventFilter = "all";
      documentSeverityCache = {};
      if (dashboardSearchInput) {
        dashboardSearchInput.value = "";
      }
      if (dashboardFilterStatus) {
        dashboardFilterStatus.value = "all";
      }
      if (dashboardFilterType) {
        dashboardFilterType.value = "all";
      }
      if (dashboardFilterSeverity) {
        dashboardFilterSeverity.value = "all";
      }
      if (dashboardFilterPeriod) {
        dashboardFilterPeriod.value = "all";
      }
      if (auditEventFilter) {
        auditEventFilter.value = "all";
      }
      setCurrentUser(data.user || null);
      showApp();
      switchPage("overview");
      await loadDocuments();
    } catch (error) {
      setCurrentUser(null);
      showLogin();
    }
  }

  function bindNavigation() {
    if (appSidebar && isMobileNavigation()) {
      appSidebar.setAttribute("aria-hidden", "true");
    }

    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        switchPage(item.getAttribute("data-page"));
      });
    });

    navButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.getAttribute("data-upload-shortcut") === "true") {
          openAnalyzeUploadEntry();
          return;
        }

        switchPage(button.getAttribute("data-nav"));
      });
    });

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-nav]");
      if (!trigger || navButtons.indexOf(trigger) !== -1) {
        return;
      }

      var documentId = trigger.getAttribute("data-document-id");
      var targetPage = trigger.getAttribute("data-target-page") || trigger.getAttribute("data-nav");

      if (documentId) {
        openDocument(documentId, targetPage);
        return;
      }

      if (trigger.getAttribute("data-upload-shortcut") === "true") {
        openAnalyzeUploadEntry();
        return;
      }

      switchPage(trigger.getAttribute("data-nav"));
    });

    if (mobileNavToggle) {
      mobileNavToggle.addEventListener("click", function () {
        var isOpen = document.body.classList.contains("mobile-nav-open");
        setMobileNavOpen(!isOpen);
      });
    }

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener("click", closeMobileNav);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    });

    if (mobileNavBreakpoint && typeof mobileNavBreakpoint.addEventListener === "function") {
      mobileNavBreakpoint.addEventListener("change", function (event) {
        if (!event.matches) {
          closeMobileNav();
          if (appSidebar) {
            appSidebar.removeAttribute("aria-hidden");
          }
        }
      });
    }
  }

  function bindDocumentTables() {
    if (documentsSelectAllBtn) {
      documentsSelectAllBtn.addEventListener("click", function () {
        filterDocuments(currentDocuments).forEach(function (documentItem) {
          selectedDocumentIds[documentItem.id] = true;
        });
        applySearchFilter();
      });
    }

    if (documentsClearSelectionBtn) {
      documentsClearSelectionBtn.addEventListener("click", function () {
        clearSelectedDocuments();
        applySearchFilter();
        setDocumentsFeedback("", "");
      });
    }

    if (documentsBulkDeleteBtn) {
      documentsBulkDeleteBtn.addEventListener("click", async function () {
        try {
          await deleteSelectedDocuments();
        } catch (error) {
          setDocumentsFeedback(error.message || "Nao foi possivel excluir os documentos selecionados agora.", "error");
        }
      });
    }

    [overviewDocumentsTable, documentsTable].forEach(function (tableElement) {
      if (!tableElement) return;

      tableElement.addEventListener("change", function (event) {
        var checkbox = event.target.closest(".table-checkbox");
        var row;
        var documentId;

        if (!checkbox || tableElement !== documentsTable) {
          return;
        }

        row = checkbox.closest(".table-row");
        if (!row) {
          return;
        }

        documentId = row.getAttribute("data-document-id");
        if (!documentId) {
          return;
        }

        if (isBulkDeletingDocuments) {
          checkbox.checked = Boolean(selectedDocumentIds[documentId]);
          return;
        }

        if (checkbox.checked) {
          selectedDocumentIds[documentId] = true;
        } else {
          delete selectedDocumentIds[documentId];
        }

        applySearchFilter();
      });

      tableElement.addEventListener("click", async function (event) {
        var actionButton = event.target.closest("[data-action]");
        var row = event.target.closest(".table-row");
        if (!row) return;
        var documentId = row.getAttribute("data-document-id");

        if (event.target.closest(".table-select")) {
          event.stopPropagation();
          return;
        }

        if (actionButton) {
          event.preventDefault();
          event.stopPropagation();

          if (actionButton.disabled) {
            return;
          }

          if (actionButton.getAttribute("data-action") === "delete") {
            try {
              await deleteDocument(documentId);
            } catch (error) {
              window.alert(error.message || "Nao foi possivel excluir o documento agora.");
            }
            return;
          }

          openDocument(documentId, "results");
          return;
        }

        openDocument(documentId, "results");
      });
    });
  }

  function bindUpload() {
    if (!uploadZone || !fileInput) return;

    uploadZone.addEventListener("click", function () {
      fileInput.click();
    });

    uploadZone.addEventListener("dragover", function (event) {
      event.preventDefault();
      uploadZone.classList.add("drag");
    });

    uploadZone.addEventListener("dragleave", function () {
      uploadZone.classList.remove("drag");
    });

    uploadZone.addEventListener("drop", function (event) {
      event.preventDefault();
      uploadZone.classList.remove("drag");

      if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        uploadSelectedFile(event.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) {
        uploadSelectedFile(fileInput.files[0]);
      }
    });

    if (documentsUploadEntry) {
      documentsUploadEntry.addEventListener("click", function () {
        openAnalyzeUploadPicker();
      });

      documentsUploadEntry.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openAnalyzeUploadPicker();
        }
      });

      documentsUploadEntry.addEventListener("dragover", function (event) {
        event.preventDefault();
        documentsUploadEntry.classList.add("is-drag");
      });

      documentsUploadEntry.addEventListener("dragleave", function () {
        documentsUploadEntry.classList.remove("is-drag");
      });

      documentsUploadEntry.addEventListener("drop", function (event) {
        event.preventDefault();
        documentsUploadEntry.classList.remove("is-drag");

        if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          startUploadFromDocuments(event.dataTransfer.files[0]);
        }
      });
    }

    if (documentsUploadBtn) {
      documentsUploadBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        openAnalyzeUploadPicker();
      });
    }
  }

  function bindSelects() {
    [riskDocSelect, guidedDocSelect, resultsDocSelect].forEach(function (select) {
      if (!select) return;
      select.addEventListener("change", function () {
        if (select.value) {
          loadAndRenderDocumentAnalysis(select.value);
        }
      });
    });
  }

  function bindGuidedTabs() {
    guidedTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateGuidedTab(tab.getAttribute("data-tab"));
      });
    });
  }

  function bindInteractivePanels() {
    document.addEventListener("click", function (event) {
      var audioTrigger = event.target.closest("[data-audio-action]");
      var clauseTrigger = event.target.closest("[data-clause-trigger]");

      if (audioTrigger) {
        event.preventDefault();
        event.stopPropagation();
        speakClauseExplanation(audioTrigger);
        return;
      }

      if (clauseTrigger) {
        var clauseItem = clauseTrigger.closest("[data-clause-item]");
        if (clauseItem) {
          clauseItem.classList.toggle("open");
        }
      }
    });

    document.addEventListener("change", function (event) {
      if (event.target.matches('#checklist-items input[type="checkbox"]')) {
        updateChecklistProgress();
      }
    });
  }

  function bindAuth() {
    if (signupLink) {
      signupLink.addEventListener("click", handleSignupToggle);
    }

    if (loginButton) {
      loginButton.addEventListener("click", handleLoginSubmit);
    }

    [loginEmailInput, loginPasswordInput, loginNameInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          handleLoginSubmit();
        }
      });
    });

    if (logoutButton) {
      logoutButton.addEventListener("click", handleLogout);
    }
  }

  function bindActions() {
    if (newAnalysisBtn) {
      newAnalysisBtn.addEventListener("click", function () {
        currentDocumentId = "";
        analysisCache = {};
        resetUploadUi();
        if (analysisResult) {
          analysisResult.classList.remove("visible");
        }
        if (uploadZone) {
          uploadZone.style.display = "";
        }
      });
    }

    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", exportResultsAsPdf);
    }

    if (shareResultsBtn) {
      shareResultsBtn.addEventListener("click", function () {
        shareResultsSummary();
      });
    }

    if (copyResultsBtn) {
      copyResultsBtn.addEventListener("click", function () {
        copyResultsSummary();
      });
    }

    if (settingsSaveButton) {
      settingsSaveButton.addEventListener("click", function () {
        saveSettingsProfile();
      });
    }

    if (settingsFullNameInput) {
      settingsFullNameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          saveSettingsProfile();
        }
      });
    }

    if (dashboardSearchInput) {
      dashboardSearchInput.addEventListener("input", function () {
        updateSearchQuery(dashboardSearchInput.value);
      });
    }

    if (dashboardFilterStatus) {
      dashboardFilterStatus.addEventListener("change", function () {
        currentStatusFilter = dashboardFilterStatus.value || "all";
        updateSearchQuery(currentSearchQuery);
      });
    }

    if (dashboardFilterType) {
      dashboardFilterType.addEventListener("change", function () {
        currentTypeFilter = dashboardFilterType.value || "all";
        updateSearchQuery(currentSearchQuery);
      });
    }

    if (dashboardFilterSeverity) {
      dashboardFilterSeverity.addEventListener("change", function () {
        currentSeverityFilter = dashboardFilterSeverity.value || "all";
        updateSearchQuery(currentSearchQuery);
      });
    }

    if (dashboardFilterPeriod) {
      dashboardFilterPeriod.addEventListener("change", function () {
        currentPeriodFilter = dashboardFilterPeriod.value || "all";
        updateSearchQuery(currentSearchQuery);
      });
    }

    if (auditEventFilter) {
      auditEventFilter.addEventListener("change", function () {
        currentAuditEventFilter = auditEventFilter.value || "all";
        updateSearchQuery(currentSearchQuery);
      });
    }
  }

  bindNavigation();
  bindDocumentTables();
  bindUpload();
  bindSelects();
  bindGuidedTabs();
  bindInteractivePanels();
  bindAuth();
  bindActions();
  bindRiskFilters();
  activateGuidedTab(currentGuidedTab);
  updateChecklistProgress();
  setAuthMode("login");
  resetUploadUi();
  restoreSession();
})();

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
  var topbarTitle = document.getElementById("topbar-title");
  var dashboardSearchInput = document.getElementById("dashboard-search");
  var dashboardFilterStatus = document.getElementById("dashboard-filter-status");
  var dashboardFilterType = document.getElementById("dashboard-filter-type");
  var dashboardFilterSeverity = document.getElementById("dashboard-filter-severity");
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
  var currentSearchQuery = "";
  var currentStatusFilter = "all";
  var currentTypeFilter = "all";
  var currentSeverityFilter = "all";
  var documentSeverityCache = {};
  var currentDocumentId = "";
  var currentUser = null;
  var currentRiskFilter = "all";
  var currentGuidedTab = "resumo";
  var settingsLoaded = false;
  var pageTitles = {
    overview: "Visão geral",
    documents: "Documentos",
    analyze: "Analisar Contrato",
    risks: "Riscos",
    guided: "Leitura Guiada",
    results: "Resultados",
    settings: "Configurações"
  };

  function buildRequestOptions(options) {
    var config = Object.assign({ credentials: "include" }, options || {});
    config.headers = Object.assign(
      { "Content-Type": "application/json" },
      config.headers || {}
    );
    return config;
  }

  async function requestJsonDetailed(url, options) {
    var response = await fetch(url, buildRequestOptions(options));
    var payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
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

    if (pageName === "settings") {
      loadSettingsProfile(false);
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
      return;
    }

    if (!currentUser && !forceRefresh) {
      populateSettingsFields(null);
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
      renderStorageStatus(healthData && healthData.checks);
    } catch (error) {
      renderStorageStatus(null);
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

  function filterDocuments(documents) {
    return filterDocumentsBySearch(documents).filter(function (documentItem) {
      var status = normalizeStatusFilterValue(documentItem && documentItem.processing_status);
      var typeKey = getDocumentTypeKey(documentItem);
      var severityKey = getDocumentSeverityKey(documentItem);

      if (currentStatusFilter !== "all" && status !== currentStatusFilter) {
        return false;
      }

      if (currentTypeFilter !== "all" && typeKey !== currentTypeFilter) {
        return false;
      }

      if (currentSeverityFilter !== "all" && severityKey !== currentSeverityFilter) {
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

  function createDocumentRowMarkup(documentItem) {
    var status = getStatusMeta(documentItem.processing_status);

    return [
      '<div class="table-row" data-document-id="' + escapeHtml(documentItem.id) + '">',
      '<span class="table-doc">',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      escapeHtml(documentItem.original_name || "documento"),
      "</span>",
      '<span class="table-type">' + escapeHtml(getDocumentTypeLabel(documentItem)) + "</span>",
      '<span class="table-date">' + escapeHtml(formatDate(documentItem.created_at)) + "</span>",
      '<span class="badge ' + status.className + '"><span class="badge-dot"></span>' + escapeHtml(status.label) + "</span>",
      '<span><button class="table-action-btn" type="button" aria-label="Abrir documento"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></span>',
      "</div>"
    ].join("");
  }

  function renderTable(tableElement, documents, limit) {
    if (!tableElement) return;

    var rows = documents;
    if (typeof limit === "number") {
      rows = documents.slice(0, limit);
    }

    var head = '<div class="table-head"><span>Documento</span><span>Tipo</span><span>Data</span><span>Status</span><span></span></div>';
    var body = rows.length
      ? rows.map(createDocumentRowMarkup).join("")
      : '<div class="table-empty">' + getDocumentSearchEmptyMessage() + "</div>";

    tableElement.innerHTML = head + body;
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
    if (!Number.isFinite(totalDocuments) || totalDocuments <= 0) {
      return "Nenhum documento enviado";
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

  function buildOverviewActivityFallback(documents) {
    if (!Array.isArray(documents) || !documents.length) {
      return [
        {
          dotClass: "activity-dot--default",
          html: "Envie seu primeiro contrato para começar a montar o painel.",
          timeLabel: "Sem atividade ainda",
          searchText: "envie seu primeiro contrato",
          statusKey: "all",
          typeKey: "all",
          severityKey: "unknown"
        }
      ];
    }

    return documents.slice(0, 4).map(function (documentItem) {
      var status = getStatusMeta(documentItem.processing_status);
      var normalizedStatus = normalizeStatusFilterValue(documentItem.processing_status);
      var typeKey = getDocumentTypeKey(documentItem);
      return {
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
        searchText: (documentItem.original_name || "") + " " + status.label,
        statusKey: normalizedStatus,
        typeKey: typeKey,
        severityKey: getDocumentSeverityKey(documentItem)
      };
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
        if (hasCritical) {
          return {
            dotClass: "activity-dot--danger",
            html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> com riscos criticos",
            timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
            searchText: (documentItem.original_name || "") + " riscos criticos",
            statusKey: "completed",
            typeKey: typeKey,
            severityKey: "critical"
          };
        }

        if (hasAttention) {
          return {
            dotClass: "activity-dot--warn",
            html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> requer atencao",
            timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
            searchText: (documentItem.original_name || "") + " requer atencao",
            statusKey: "completed",
            typeKey: typeKey,
            severityKey: "attention"
          };
        }

        return {
          dotClass: "activity-dot--safe",
          html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> analisado sem riscos criticos",
          timeLabel: formatRelativeDate(analysisItem.updated_at || documentItem.updated_at || documentItem.created_at),
          searchText: (documentItem.original_name || "") + " analisado seguro",
          statusKey: "completed",
          typeKey: typeKey,
          severityKey: "safe"
        };
      }

      if (status === "analyzing" || status === "uploaded") {
        return {
          dotClass: "activity-dot--default",
          html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> enviado para analise",
          timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
          searchText: (documentItem.original_name || "") + " enviado para analise",
          statusKey: status,
          typeKey: typeKey,
          severityKey: "unknown"
        };
      }

      if (status === "failed") {
        return {
          dotClass: "activity-dot--warn",
          html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> precisa de revisao",
          timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
          searchText: (documentItem.original_name || "") + " precisa de revisao",
          statusKey: "failed",
          typeKey: typeKey,
          severityKey: "unknown"
        };
      }

      return {
        dotClass: "activity-dot--default",
        html: "<strong>" + escapeHtml(documentItem.original_name || "documento") + "</strong> disponivel no painel",
        timeLabel: formatRelativeDate(documentItem.updated_at || documentItem.created_at),
        searchText: (documentItem.original_name || "") + " disponivel no painel",
        statusKey: status || "uploaded",
        typeKey: typeKey,
        severityKey: "unknown"
      };
    });
  }

  function applySearchFilter() {
    var filteredDocuments = filterDocuments(currentDocuments);
    var activeDocument = findDocumentById(currentDocumentId);
    var hasActiveInFilter = activeDocument && filteredDocuments.some(function (item) {
      return item.id === activeDocument.id;
    });

    renderTable(overviewDocumentsTable, filteredDocuments, 5);
    renderTable(documentsTable, filteredDocuments);
    renderSelectOptions(riskDocSelect, filteredDocuments);
    renderSelectOptions(guidedDocSelect, filteredDocuments);
    renderSelectOptions(resultsDocSelect, filteredDocuments);
    renderOverviewActivity(filterOverviewActivityItems(overviewActivityItems));

    setActiveDocument(hasActiveInFilter ? currentDocumentId : (filteredDocuments.length ? filteredDocuments[0].id : ""));
  }

  async function loadOverviewData() {
    try {
      var responses = await Promise.all([
        requestJson("/api/dashboard/overview", { method: "GET" }),
        requestJson("/api/dashboard/risk-distribution", { method: "GET" })
      ]);
      var overviewData = responses[0] || {};
      var riskData = responses[1] || {};
      var recentDocuments = Array.isArray(overviewData.recentDocuments)
        ? overviewData.recentDocuments
        : currentDocuments.slice(0, 5);
      var activityItems;

      renderOverviewKpis(overviewData.kpis || {}, riskData.distribution || {});
      activityItems = await buildOverviewActivityFiltered(recentDocuments);
      overviewActivityItems = activityItems;
      renderOverviewActivity(filterOverviewActivityItems(activityItems));
    } catch (error) {
      renderOverviewKpis({}, { critical: 0, attention: 0, safe: 0 });
      overviewActivityItems = buildOverviewActivityFallback(currentDocuments);
      renderOverviewActivity(filterOverviewActivityItems(overviewActivityItems));
    }
  }

  function syncDocumentViews(documents) {
    currentDocuments = Array.isArray(documents) ? documents : [];
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
      risksEl.innerHTML = '<div class="table-empty">' + escapeHtml(message) + "</div>";
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
      '<div class="card"><div class="table-empty">' + escapeHtml(message) + "</div></div>"
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

    if (clausesRoot) {
      clausesRoot.innerHTML = '<div class="card"><div class="table-empty">' + escapeHtml(message) + "</div></div>";
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
      deadlinesRoot.innerHTML = '<div class="table-empty">' + escapeHtml(message) + "</div>";
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

  function renderAllAnalysisViews(documentItem, result) {
    renderAnalyzeView(documentItem, result);
    renderRisksView(documentItem, result);
    renderGuidedView(documentItem, result);
    renderResultsView(documentItem, result);
  }

  async function loadDocuments() {
    try {
      var data = await requestJson("/api/documents", { method: "GET" });
      syncDocumentViews(data.documents || []);
      await hydrateDocumentSeverityCache(currentDocuments);
      applySearchFilter();
      await loadOverviewData();

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
    filteredDocuments = filterDocumentsBySearch(currentDocuments);
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
    switchPage(pageName || "analyze");
    loadAndRenderDocumentAnalysis(documentId);
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
      currentSearchQuery = "";
      currentStatusFilter = "all";
      currentTypeFilter = "all";
      currentSeverityFilter = "all";
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

    analysisCache = {};
    overviewActivityCache = {};
    currentDocuments = [];
    currentDocumentId = "";
    currentSearchQuery = "";
    currentStatusFilter = "all";
    currentTypeFilter = "all";
    currentSeverityFilter = "all";
    documentSeverityCache = {};
    settingsLoaded = false;
    setSettingsFeedback("", "");
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
    syncDocumentViews([]);
    renderOverviewKpis({}, { critical: 0, attention: 0, safe: 0 });
    renderOverviewActivity(buildOverviewActivityFallback([]));
    resetUploadUi();
    showLogin();
  }

  async function restoreSession() {
    try {
      var data = await requestJson("/api/auth/me", { method: "GET" });
      settingsLoaded = false;
      overviewActivityCache = {};
      overviewActivityItems = [];
      currentSearchQuery = "";
      currentStatusFilter = "all";
      currentTypeFilter = "all";
      currentSeverityFilter = "all";
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
    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        switchPage(item.getAttribute("data-page"));
      });
    });

    navButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        switchPage(button.getAttribute("data-nav"));
      });
    });
  }

  function bindDocumentTables() {
    [overviewDocumentsTable, documentsTable].forEach(function (tableElement) {
      if (!tableElement) return;

      tableElement.addEventListener("click", function (event) {
        var row = event.target.closest(".table-row");
        if (!row) return;
        openDocument(row.getAttribute("data-document-id"), "analyze");
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
      var clauseTrigger = event.target.closest("[data-clause-trigger]");
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
      exportPdfBtn.addEventListener("click", function () {
        window.print();
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

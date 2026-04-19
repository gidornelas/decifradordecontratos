(function () {
  var loginScreen = document.getElementById("login-screen");
  var app = document.getElementById("app");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var loginTitle = document.querySelector(".login__title");
  var loginSubtitle = document.querySelector(".login__subtitle");
  var loginSubmit = document.querySelector(".login__submit");
  var loginSubmitText = document.querySelector(".login__submit-text");
  var signupLink = document.getElementById("signup-link");
  var signupCopy = document.querySelector(".login__signup");
  var nameField = document.getElementById("login-name-field");
  var nameInput = document.getElementById("login-name");
  var emailInput = document.getElementById("login-email");
  var passwordInput = document.getElementById("login-password");
  var rememberInput = document.getElementById("login-remember");
  var forgotLink = document.querySelector(".login__forgot");
  var logoutLink = document.getElementById("logout-link");
  var userNameEl = document.querySelector(".app__user-name");
  var userEmailEl = document.querySelector(".app__user-email");
  var overviewDocumentsTable = document.getElementById("overview-documents-table");
  var documentsTable = document.getElementById("documents-table");
  var documentsTableBody = document.getElementById("documents-table-body");
  var documentsEmptyState = document.getElementById("documents-empty-state");
  var resultsDocSelect = document.getElementById("results-doc-select");
  var uploadZone = document.getElementById("upload-zone");
  var fileInput = document.getElementById("file-input");
  var progress = document.getElementById("upload-progress");
  var progressFill = document.getElementById("progress-fill");
  var progressText = document.getElementById("progress-text");
  var analysisResult = document.getElementById("analysis-result");
  var newAnalysisBtn = document.getElementById("new-analysis-btn");
  var authMode = "login";
  var currentDocuments = [];
  var defaultUserName = userNameEl ? userNameEl.textContent : "Usuario";
  var defaultUserEmail = userEmailEl ? userEmailEl.textContent : "";
  var authRoutes = {
    login: "/api/auth/login",
    register: "/api/auth/register"
  };

  function showApp() {
    if (loginScreen) loginScreen.style.display = "none";
    if (app) app.style.display = "grid";
  }

  function showLogin() {
    if (loginScreen) loginScreen.style.display = "";
    if (app) app.style.display = "none";
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
          : "Acesse seus contratos e analises";
    }

    if (loginSubmitText) {
      loginSubmitText.textContent =
        authMode === "register" ? "Criar conta" : "Entrar";
    }

    if (nameField) {
      nameField.hidden = authMode !== "register";
    }

    if (nameInput) {
      nameInput.required = authMode === "register";
      if (authMode !== "register") {
        nameInput.value = "";
      }
    }

    if (passwordInput) {
      passwordInput.setAttribute(
        "autocomplete",
        authMode === "register" ? "new-password" : "current-password"
      );
    }

    if (forgotLink) {
      forgotLink.hidden = authMode === "register";
    }

    if (signupCopy) {
      signupCopy.innerHTML =
        authMode === "register"
          ? 'Ja tem conta? <a href="#" id="signup-link">Entrar</a>'
          : 'Nao tem conta? <a href="#" id="signup-link">Crie gratis</a>';
      signupLink = document.getElementById("signup-link");
      if (signupLink) {
        signupLink.addEventListener("click", handleSignupToggle);
      }
    }
  }

  function handleSignupToggle(e) {
    e.preventDefault();
    hideError();
    setAuthMode(authMode === "login" ? "register" : "login");
  }

  function setCurrentUser(user) {
    if (userNameEl) {
      userNameEl.textContent = user
        ? user.fullName || user.full_name || user.email || defaultUserName
        : defaultUserName;
    }

    if (userEmailEl) {
      userEmailEl.textContent = user ? user.email || "" : defaultUserEmail;
    }
  }

  async function requestJson(url, options) {
    var response = await fetch(
      url,
      Object.assign(
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        },
        options || {}
      )
    );

    var payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      var message =
        payload && payload.message
          ? payload.message
          : "Nao foi possivel concluir a operacao.";
      throw new Error(message);
    }

    return payload;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getFileExtension(fileName) {
    var parts = String(fileName || "").split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  function getDocumentTypeLabel(documentItem) {
    var extension = getFileExtension(documentItem.original_name);

    if (extension === "pdf") return "PDF";
    if (extension === "doc" || extension === "docx") return "DOCX";
    if (extension === "txt") return "TXT";
    if (documentItem.mime_type === "application/pdf") return "PDF";
    if (documentItem.mime_type && documentItem.mime_type.indexOf("word") !== -1) {
      return "DOCX";
    }

    return "Contrato";
  }

  function getDocumentStatusMeta(status) {
    var normalized = String(status || "").toLowerCase();

    if (normalized === "completed") {
      return { label: "Concluido", badgeClass: "app__badge--safe" };
    }

    if (normalized === "failed" || normalized === "error") {
      return { label: "Erro", badgeClass: "app__badge--critical" };
    }

    if (normalized === "uploaded") {
      return { label: "Enviado", badgeClass: "app__badge--processing" };
    }

    if (normalized === "extracting") {
      return { label: "Extraindo", badgeClass: "app__badge--processing" };
    }

    if (normalized === "analyzing") {
      return { label: "Analisando", badgeClass: "app__badge--processing" };
    }

    return { label: "Pendente", badgeClass: "app__badge--attention" };
  }

  function formatDocumentDate(value) {
    var date = value ? new Date(value) : null;
    var months = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez"
    ];

    if (!date || Number.isNaN(date.getTime())) {
      return "--";
    }

    return [
      String(date.getDate()).padStart(2, "0"),
      months[date.getMonth()],
      date.getFullYear()
    ].join(" ");
  }

  function createDocumentRowMarkup(documentItem) {
    var statusMeta = getDocumentStatusMeta(documentItem.processing_status);
    var fileName = escapeHtml(documentItem.original_name || "documento");

    return [
      '<div class="app__table-row" data-document-id="' +
        escapeHtml(documentItem.id) +
        '">',
      '<span class="app__table-doc">',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      fileName,
      "</span>",
      "<span>" + escapeHtml(getDocumentTypeLabel(documentItem)) + "</span>",
      "<span>" + escapeHtml(formatDocumentDate(documentItem.created_at)) + "</span>",
      '<span class="app__badge ' +
        statusMeta.badgeClass +
        '"><span class="app__badge-dot"></span>' +
        escapeHtml(statusMeta.label) +
        "</span>",
      '<span class="app__table-action"><button class="app__table-action-btn" type="button" aria-label="Ver detalhes"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></span>',
      "</div>"
    ].join("");
  }

  function renderOverviewDocuments(documents) {
    if (!overviewDocumentsTable) return;

    overviewDocumentsTable
      .querySelectorAll(".app__table-row, .app__table-empty")
      .forEach(function (row) {
        row.remove();
      });

    if (!documents.length) {
      overviewDocumentsTable.insertAdjacentHTML(
        "beforeend",
        '<div class="app__table-empty"><strong>Nenhum documento ainda.</strong> Envie seu primeiro contrato para preencher o painel.</div>'
      );
      return;
    }

    documents.slice(0, 5).forEach(function (documentItem) {
      overviewDocumentsTable.insertAdjacentHTML(
        "beforeend",
        createDocumentRowMarkup(documentItem)
      );
    });
  }

  function renderDocumentsPage(documents) {
    if (!documentsTable || !documentsTableBody || !documentsEmptyState) return;

    if (!documents.length) {
      documentsTable.hidden = true;
      documentsEmptyState.hidden = false;
      documentsTableBody.innerHTML = "";
      return;
    }

    documentsTable.hidden = false;
    documentsEmptyState.hidden = true;
    documentsTableBody.innerHTML = documents
      .map(function (documentItem) {
        return createDocumentRowMarkup(documentItem);
      })
      .join("");
  }

  function renderResultsDocumentSelect(documents) {
    if (!resultsDocSelect) return;

    resultsDocSelect.innerHTML = "";

    if (!documents.length) {
      resultsDocSelect.innerHTML =
        '<option value="">Nenhum documento enviado</option>';
      return;
    }

    documents.forEach(function (documentItem) {
      var option = document.createElement("option");
      option.value = documentItem.id;
      option.textContent = documentItem.original_name || "documento";
      resultsDocSelect.appendChild(option);
    });
  }

  function syncDocumentViews(documents) {
    currentDocuments = Array.isArray(documents) ? documents : [];
    renderOverviewDocuments(currentDocuments);
    renderDocumentsPage(currentDocuments);
    renderResultsDocumentSelect(currentDocuments);
  }

  function resetDashboardData() {
    syncDocumentViews([]);
  }

  async function loadDocuments() {
    try {
      var data = await requestJson("/api/documents", {
        method: "GET"
      });

      syncDocumentViews(data.documents || []);
    } catch (error) {
      syncDocumentViews([]);
    }
  }

  function resetUploadUi() {
    if (analysisResult) {
      analysisResult.classList.remove("app__analysis--visible");
    }

    if (uploadZone) {
      uploadZone.style.display = "";
      uploadZone.classList.remove("app__upload-zone--processing");
      uploadZone.classList.remove("app__upload-zone--active");
    }

    if (progress) {
      progress.classList.remove("app__upload-progress--visible");
    }

    if (progressFill) {
      progressFill.classList.remove("app__upload-progress-fill--animated");
      progressFill.style.width = "";
      progressFill.style.background = "";
      progressFill.style.transition = "";
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

  function showUploadProgress(message, isError) {
    if (progressText) {
      progressText.textContent = message;
      progressText.style.color = isError ? "var(--color-danger-600)" : "";
    }
  }

  function readFilePayload(file) {
    return new Promise(function (resolve, reject) {
      var extension = getFileExtension(file && file.name);

      if (!file) {
        reject(new Error("Nenhum arquivo selecionado."));
        return;
      }

      if (extension !== "txt") {
        resolve({
          originalName: file.name,
          mimeType: file.type || guessClientMimeType(extension),
          extension: extension,
          sizeBytes: file.size || 0,
          textContent: ""
        });
        return;
      }

      var reader = new FileReader();

      reader.onload = function () {
        resolve({
          originalName: file.name,
          mimeType: file.type || "text/plain",
          extension: extension,
          sizeBytes: file.size || 0,
          textContent:
            typeof reader.result === "string" ? reader.result.slice(0, 200000) : ""
        });
      };

      reader.onerror = function () {
        reject(new Error("Nao foi possivel ler o arquivo selecionado."));
      };

      reader.readAsText(file);
    });
  }

  function guessClientMimeType(extension) {
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

  async function uploadSelectedFile(file) {
    if (!file || !uploadZone || !progress || !progressFill) {
      return;
    }

    var extension = getFileExtension(file.name);

    if (extension !== "pdf" && extension !== "docx" && extension !== "txt") {
      showError("Envie um arquivo PDF, DOCX ou TXT.");
      return;
    }

    hideError();
    uploadZone.classList.add("app__upload-zone--processing");
    progress.classList.add("app__upload-progress--visible");
    showUploadProgress("Preparando contrato...", false);

    requestAnimationFrame(function () {
      progressFill.classList.add("app__upload-progress-fill--animated");
      progressFill.style.width = "28%";
    });

    try {
      var payload = await readFilePayload(file);
      showUploadProgress("Enviando contrato...", false);
      progressFill.style.width = "62%";

      await requestJson("/api/documents", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      progressFill.style.width = "100%";
      progressFill.style.background = "var(--color-success-500)";
      progressFill.style.transition = "width 0.25s ease-out";
      showUploadProgress("Contrato enviado com sucesso.", false);

      await loadDocuments();

      setTimeout(function () {
        resetUploadUi();
        switchPage("documents");
      }, 900);
    } catch (error) {
      progressFill.style.width = "100%";
      progressFill.style.background = "var(--color-danger-500)";
      progressFill.style.transition = "width 0.2s ease-out";
      showUploadProgress(error.message || "Falha ao enviar o contrato.", true);

      setTimeout(function () {
        resetUploadUi();
      }, 1400);
    }
  }

  async function restoreSession() {
    try {
      var data = await requestJson("/api/auth/me", {
        method: "GET"
      });

      setCurrentUser(data.user || null);
      showApp();
      await loadDocuments();
    } catch (error) {
      setCurrentUser(null);
      resetDashboardData();
      showLogin();
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      var fullName = nameInput ? nameInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";
      var password = passwordInput ? passwordInput.value : "";
      var remember = rememberInput ? rememberInput.checked : false;

      if (!email || !password || (authMode === "register" && !fullName)) {
        showError("Preencha todos os campos obrigatorios.");
        return;
      }

      hideError();

      if (loginSubmit) {
        loginSubmit.disabled = true;
      }

      try {
        var payload = await requestJson(authRoutes[authMode], {
          method: "POST",
          body: JSON.stringify({
            email: email,
            password: password,
            fullName: authMode === "register" ? fullName : undefined,
            rememberSession: remember
          })
        });

        setCurrentUser(payload.user || null);
        showApp();
        await loadDocuments();
      } catch (error) {
        showError(error.message || "Nao foi possivel autenticar.");
      } finally {
        if (loginSubmit) {
          loginSubmit.disabled = false;
        }
      }
    });
  }

  function showError(msg) {
    if (loginError) {
      var text = document.getElementById("login-error-text");
      if (text) text.textContent = msg;
      loginError.hidden = false;
      loginError.classList.add("login__error--visible");
    }
  }

  function hideError() {
    if (loginError) {
      loginError.classList.remove("login__error--visible");
      loginError.hidden = true;
    }
  }

  function openDocumentFromDashboard(documentId) {
    if (!documentId) return;

    switchPage("analyze");

    if (analysisResult) {
      analysisResult.classList.add("app__analysis--visible");
    }

    if (uploadZone) {
      uploadZone.style.display = "none";
    }

    if (newAnalysisBtn) {
      newAnalysisBtn.style.display = "inline-flex";
    }

    if (resultsDocSelect) {
      resultsDocSelect.value = documentId;
    }
  }

  if (nameInput) nameInput.addEventListener("input", hideError);
  if (emailInput) emailInput.addEventListener("input", hideError);
  if (passwordInput) passwordInput.addEventListener("input", hideError);
  hideError();
  setAuthMode("login");
  resetDashboardData();

  if (signupLink) {
    signupLink.addEventListener("click", handleSignupToggle);
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", async function (e) {
      e.preventDefault();

      try {
        await requestJson("/api/auth/logout", {
          method: "POST"
        });
      } catch (error) {
        // Logout stays resilient even if the server request fails.
      } finally {
        if (loginForm) loginForm.reset();
        hideError();
        setAuthMode("login");
        setCurrentUser(null);
        resetDashboardData();
        resetUploadUi();
        showLogin();
      }
    });
  }

  restoreSession();

  function switchPage(pageName) {
    var pages = document.querySelectorAll(".app__page");
    pages.forEach(function (p) {
      p.classList.remove("app__page--active");
    });

    var target = document.getElementById("page-" + pageName);
    if (target) target.classList.add("app__page--active");

    var navItems = document.querySelectorAll(".app__nav-item");
    navItems.forEach(function (item) {
      item.classList.remove("app__nav-item--active");
      if (item.getAttribute("data-page") === pageName) {
        item.classList.add("app__nav-item--active");
      }
    });

    var mobileNavItems = document.querySelectorAll(".app__mobile-nav-item");
    mobileNavItems.forEach(function (item) {
      item.classList.remove("app__mobile-nav-item--active");
      if (item.getAttribute("data-page") === pageName) {
        item.classList.add("app__mobile-nav-item--active");
      }
    });

    var titles = {
      overview: "Painel de Contratos",
      documents: "Meus Documentos",
      analyze: "Analisar Contrato",
      risks: "Visualizador de Riscos",
      guided: "Leitura Guiada",
      results: "Resultados da Analise",
      settings: "Configuracoes"
    };

    var titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = titles[pageName] || "Decodificador";
  }

  document.addEventListener("click", function (e) {
    var navLink = e.target.closest("[data-page]");
    if (navLink) {
      e.preventDefault();
      switchPage(navLink.getAttribute("data-page"));
    }

    var dataNav = e.target.closest("[data-nav]");
    if (dataNav) {
      e.preventDefault();
      switchPage(dataNav.getAttribute("data-nav"));
    }

    var documentRow = e.target.closest("[data-document-id]");
    if (documentRow) {
      e.preventDefault();
      openDocumentFromDashboard(documentRow.getAttribute("data-document-id"));
    }
  });

  if (uploadZone) {
    uploadZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      uploadZone.classList.add("app__upload-zone--active");
    });

    uploadZone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      uploadZone.classList.remove("app__upload-zone--active");
    });

    uploadZone.addEventListener("drop", function (e) {
      e.preventDefault();
      uploadZone.classList.remove("app__upload-zone--active");
      var file = e.dataTransfer && e.dataTransfer.files
        ? e.dataTransfer.files[0]
        : null;
      uploadSelectedFile(file);
    });

    uploadZone.addEventListener("click", function () {
      if (fileInput) fileInput.click();
    });

    uploadZone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (fileInput) fileInput.click();
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) {
        uploadSelectedFile(fileInput.files[0]);
      }
    });
  }

  if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener("click", function () {
      resetUploadUi();
    });
  }

  var riskFilters = document.querySelectorAll("[data-risk-filter]");
  riskFilters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      riskFilters.forEach(function (b) {
        b.classList.remove("app__risk-filter--active");
      });
      btn.classList.add("app__risk-filter--active");

      var filter = btn.getAttribute("data-risk-filter");
      var cards = document.querySelectorAll("[data-risk-level]");

      cards.forEach(function (card) {
        if (filter === "all") {
          card.classList.remove("app__risk-card--hidden");
        } else if (card.getAttribute("data-risk-level") === filter) {
          card.classList.remove("app__risk-card--hidden");
        } else {
          card.classList.add("app__risk-card--hidden");
        }
      });

      document.querySelectorAll(".app__risk-group-title").forEach(function (title) {
        var group = title.nextElementSibling;
        if (!group) return;

        var visibleCards = group.querySelectorAll(
          '[data-risk-level]:not(.app__risk-card--hidden)'
        );
        title.style.display = visibleCards.length ? "" : "none";
      });
    });
  });

  var guidedTabs = document.querySelectorAll("[data-guided-tab]");
  guidedTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      guidedTabs.forEach(function (t) {
        t.classList.remove("app__guided-tab--active");
      });
      tab.classList.add("app__guided-tab--active");

      var tabName = tab.getAttribute("data-guided-tab");
      document.querySelectorAll(".app__guided-content").forEach(function (content) {
        content.classList.remove("app__guided-content--active");
      });

      var target = document.getElementById("guided-" + tabName);
      if (target) target.classList.add("app__guided-content--active");
    });
  });

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".app__guided-clause-trigger");
    if (!trigger) return;

    var clause = trigger.closest(".app__guided-clause");
    if (!clause) return;

    var isOpen = clause.classList.contains("app__guided-clause--open");

    document.querySelectorAll(".app__guided-clause--open").forEach(function (item) {
      item.classList.remove("app__guided-clause--open");
      var openTrigger = item.querySelector(".app__guided-clause-trigger");
      if (openTrigger) {
        openTrigger.setAttribute("aria-expanded", "false");
      }
    });

    if (!isOpen) {
      clause.classList.add("app__guided-clause--open");
      trigger.setAttribute("aria-expanded", "true");

      var clauseIndex = Array.from(
        clause.parentNode.querySelectorAll(".app__guided-clause")
      ).indexOf(clause);

      updateGuidedProgress(clauseIndex);
    }
  });

  function updateGuidedProgress(index) {
    var total = document.querySelectorAll(
      "#guided-clausulas .app__guided-clause"
    ).length;

    if (!total) return;

    var percent = ((index + 1) / total) * 100;
    var fill = document.getElementById("guided-progress-fill");
    if (fill) fill.style.width = percent + "%";

    var text = document.querySelector(".app__guided-progress-text");
    if (text) text.textContent = index + 1 + " de " + total + " revisadas";

    document.querySelectorAll(".app__guided-nav-dot").forEach(function (dot, dotIndex) {
      if (dotIndex <= index) {
        dot.classList.add("app__guided-nav-dot--active");
      } else {
        dot.classList.remove("app__guided-nav-dot--active");
      }
    });
  }

  var checklistInputs = document.querySelectorAll(".app__checklist-input");
  checklistInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      var total = checklistInputs.length;
      var checked = document.querySelectorAll(".app__checklist-input:checked").length;
      var percent = total ? (checked / total) * 100 : 0;

      var fill = document.getElementById("checklist-progress-fill");
      if (fill) fill.style.width = percent + "%";

      var summary = document.querySelector(".app__checklist-summary span");
      if (summary) {
        summary.textContent = checked + " de " + total + " itens concluidos";
      }
    });
  });

  document.addEventListener("click", function (e) {
    var actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;

    var action = actionBtn.getAttribute("data-action");
    var card = actionBtn.closest(".app__risk-card");
    if (!card) return;

    if (action === "negotiate") {
      actionBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Negociando...';
      actionBtn.style.pointerEvents = "none";

      setTimeout(function () {
        actionBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Marcado';
        actionBtn.classList.remove("app__risk-card-action");
        actionBtn.classList.add(
          "app__risk-card-action",
          "app__risk-card-action--approved"
        );
        actionBtn.style.pointerEvents = "";
      }, 1500);
    } else if (action === "review") {
      switchPage("guided");
    } else if (action === "approve") {
      actionBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Aprovado';
    }
  });

  var exportBtn = document.getElementById("export-pdf-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      exportBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Gerando...';
      exportBtn.style.pointerEvents = "none";

      setTimeout(function () {
        exportBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar PDF';
        exportBtn.style.pointerEvents = "";
      }, 2000);
    });
  }
})();

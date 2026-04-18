(function () {
  var loginScreen = document.getElementById("login-screen");
  var app = document.getElementById("app");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var emailInput = document.getElementById("login-email");
  var passwordInput = document.getElementById("login-password");
  var rememberInput = document.getElementById("login-remember");
  var logoutLink = document.getElementById("logout-link");
  var uploadZone = document.getElementById("upload-zone");
  var fileInput = document.getElementById("file-input");
  var progress = document.getElementById("upload-progress");
  var progressFill = document.getElementById("progress-fill");
  var progressText = document.getElementById("progress-text");
  var analysisResult = document.getElementById("analysis-result");
  var newAnalysisBtn = document.getElementById("new-analysis-btn");
  var authStorageKey = "decodificador.auth";

  function setAuthenticatedUser(email, remember) {
    var authState = {
      isAuthenticated: true,
      email: email || ""
    };

    if (remember) {
      localStorage.setItem(authStorageKey, JSON.stringify(authState));
      sessionStorage.removeItem(authStorageKey);
    } else {
      sessionStorage.setItem(authStorageKey, JSON.stringify(authState));
      localStorage.removeItem(authStorageKey);
    }
  }

  function getAuthenticatedUser() {
    var savedAuth =
      localStorage.getItem(authStorageKey) || sessionStorage.getItem(authStorageKey);

    if (!savedAuth) return null;

    try {
      var parsed = JSON.parse(savedAuth);
      return parsed && parsed.isAuthenticated ? parsed : null;
    } catch (error) {
      localStorage.removeItem(authStorageKey);
      sessionStorage.removeItem(authStorageKey);
      return null;
    }
  }

  function clearAuthenticatedUser() {
    localStorage.removeItem(authStorageKey);
    sessionStorage.removeItem(authStorageKey);
  }

  function showApp() {
    if (loginScreen) loginScreen.style.display = "none";
    if (app) app.style.display = "grid";
  }

  function showLogin() {
    if (loginScreen) loginScreen.style.display = "";
    if (app) app.style.display = "none";
  }

  if (getAuthenticatedUser()) {
    showApp();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailInput ? emailInput.value : "";
      var password = passwordInput ? passwordInput.value : "";
      var remember = rememberInput ? rememberInput.checked : false;

      if (!email || !password) {
        showError("Preencha todos os campos.");
        return;
      }

      setAuthenticatedUser(email, remember);
      showApp();
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

  if (emailInput) emailInput.addEventListener("input", hideError);
  if (passwordInput) passwordInput.addEventListener("input", hideError);
  hideError();

  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      clearAuthenticatedUser();
      if (loginForm) loginForm.reset();
      hideError();
      showLogin();
    });
  }

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
      results: "Resultados da Análise",
      settings: "Configurações"
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
      triggerAnalysis();
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
      if (fileInput.files.length) triggerAnalysis();
    });
  }

  function triggerAnalysis() {
    uploadZone.classList.add("app__upload-zone--processing");
    progress.classList.add("app__upload-progress--visible");

    requestAnimationFrame(function () {
      progressFill.classList.add("app__upload-progress-fill--animated");
    });

    setTimeout(function () {
      if (progressText) progressText.textContent = "Analisando claúsulas...";
    }, 1200);

    setTimeout(function () {
      if (progressText) {
        progressText.textContent = "Analise concluida!";
        progressText.style.color = "var(--color-success-600)";
      }
      progressFill.style.width = "100%";
      progressFill.style.background = "var(--color-success-500)";
      progressFill.style.transition = "width 0.4s ease-out";
    }, 3000);

    setTimeout(function () {
      uploadZone.style.display = "none";
      progress.classList.remove("app__upload-progress--visible");
      analysisResult.classList.add("app__analysis--visible");
      if (newAnalysisBtn) newAnalysisBtn.style.display = "inline-flex";
    }, 4200);
  }

  if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener("click", function () {
      analysisResult.classList.remove("app__analysis--visible");
      uploadZone.style.display = "";
      uploadZone.classList.remove("app__upload-zone--processing");
      progressFill.classList.remove("app__upload-progress-fill--animated");
      progressFill.style.width = "";
      progressFill.style.background = "";
      progressFill.style.transition = "";
      if (progressText) {
        progressText.textContent = "Enviando contrato...";
        progressText.style.color = "";
      }
      newAnalysisBtn.style.display = "none";
    });
  }

  var tableRows = document.querySelectorAll(".app__table-row");
  tableRows.forEach(function (row) {
    row.addEventListener("click", function () {
      switchPage("analyze");
      analysisResult.classList.add("app__analysis--visible");
      uploadZone.style.display = "none";
      if (newAnalysisBtn) newAnalysisBtn.style.display = "inline-flex";
    });
  });

  // ===== RISK FILTERING =====
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
        } else {
          if (card.getAttribute("data-risk-level") === filter) {
            card.classList.remove("app__risk-card--hidden");
          } else {
            card.classList.add("app__risk-card--hidden");
          }
        }
      });

      document.querySelectorAll(".app__risk-group-title").forEach(function (title) {
        var group = title.nextElementSibling;
        if (group) {
          var visibleCards = group.querySelectorAll(
            '[data-risk-level]:not(.app__risk-card--hidden)'
          );
          title.style.display = visibleCards.length ? "" : "none";
        }
      });
    });
  });

  // ===== GUIDED READING TABS =====
  var guidedTabs = document.querySelectorAll("[data-guided-tab]");
  guidedTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      guidedTabs.forEach(function (t) {
        t.classList.remove("app__guided-tab--active");
      });
      tab.classList.add("app__guided-tab--active");

      var tabName = tab.getAttribute("data-guided-tab");
      document
        .querySelectorAll(".app__guided-content")
        .forEach(function (c) {
          c.classList.remove("app__guided-content--active");
        });
      var target = document.getElementById("guided-" + tabName);
      if (target) target.classList.add("app__guided-content--active");
    });
  });

  // ===== GUIDED CLAUSE ACCORDION =====
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".app__guided-clause-trigger");
    if (!trigger) return;

    var clause = trigger.closest(".app__guided-clause");
    if (!clause) return;

    var isOpen = clause.classList.contains("app__guided-clause--open");

    document
      .querySelectorAll(".app__guided-clause--open")
      .forEach(function (c) {
        c.classList.remove("app__guided-clause--open");
        var t = c.querySelector(".app__guided-clause-trigger");
        if (t) t.setAttribute("aria-expanded", "false");
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

    document
      .querySelectorAll(".app__guided-nav-dot")
      .forEach(function (dot, i) {
        if (i <= index) {
          dot.classList.add("app__guided-nav-dot--active");
        } else {
          dot.classList.remove("app__guided-nav-dot--active");
        }
      });
  }

  // ===== CHECKLIST =====
  var checklistInputs = document.querySelectorAll(".app__checklist-input");
  checklistInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      var total = checklistInputs.length;
      var checked = document.querySelectorAll(
        ".app__checklist-input:checked"
      ).length;
      var percent = (checked / total) * 100;

      var fill = document.getElementById("checklist-progress-fill");
      if (fill) fill.style.width = percent + "%";

      var summary = document.querySelector(".app__checklist-summary span");
      if (summary)
        summary.textContent = checked + " de " + total + " itens concluídos";
    });
  });

  // ===== RISK CARD ACTIONS =====
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

  // ===== EXPORT PDF (DEMO) =====
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

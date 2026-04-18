(function () {
  var dropzone = document.getElementById("upload-dropzone");
  var fileInput = document.getElementById("upload-input");
  var progress = document.getElementById("upload-progress");
  var progressFill = document.getElementById("upload-progress-fill");
  var pasteToggle = document.getElementById("paste-toggle");

  if (!dropzone) return;

  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropzone.classList.add("upload__dropzone--active");
  });

  dropzone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dropzone.classList.remove("upload__dropzone--active");
  });

  dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropzone.classList.remove("upload__dropzone--active");
    if (e.dataTransfer.files.length) {
      triggerProcessing(e.dataTransfer.files[0].name);
    }
  });

  dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) {
        triggerProcessing(fileInput.files[0].name);
      }
    });
  }

  if (pasteToggle) {
    pasteToggle.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function (text) {
          if (text && text.length > 20) {
            triggerProcessing("texto_coládo");
          }
        }).catch(function () {});
      } else {
        triggerProcessing("texto_coládo");
      }
    });
  }

  function triggerProcessing(filename) {
    dropzone.classList.add("upload__dropzone--processing");
    progress.classList.add("upload__progress--visible");

    var progressText = progress.querySelector(".upload__progress-text");
    if (progressText) {
      progressText.textContent = "Enviando " + (filename || "documento") + "...";
    }

    requestAnimationFrame(function () {
      progressFill.classList.add("upload__progress-fill--animated");
    });

    setTimeout(function () {
      if (progressText) {
        progressText.textContent = "Analisando cláusulas...";
      }
    }, 1200);

    setTimeout(function () {
      if (progressText) {
        progressText.textContent = "Análise concluída! Role para baixo para ver o resultado.";
        progressText.style.color = "var(--color-success-600)";
      }
      progressFill.style.background = "var(--color-success-500)";
      progressFill.style.width = "100%";
      progressFill.style.transition = "width 0.4s ease-out";
    }, 3000);

    setTimeout(function () {
      dropzone.classList.remove("upload__dropzone--processing");
      progress.classList.remove("upload__progress--visible");
      progressFill.classList.remove("upload__progress-fill--animated");
      progressFill.style.width = "0%";
      progressFill.style.background = "";
      progressFill.style.transition = "";
      if (progressText) {
        progressText.textContent = "Analisando contrato...";
        progressText.style.color = "";
      }
      var analysisSection = document.getElementById("analise");
      if (analysisSection) {
        analysisSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 6000);
  }
})();

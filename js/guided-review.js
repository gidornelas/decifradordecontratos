(function () {
  var clauses = document.querySelectorAll(".guided__clause");
  if (!clauses.length) return;

  clauses.forEach(function (clause) {
    var trigger = clause.querySelector(".guided__clause-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", function () {
      var isExpanded = trigger.getAttribute("aria-expanded") === "true";

      clauses.forEach(function (other) {
        var otherTrigger = other.querySelector(".guided__clause-trigger");
        if (otherTrigger && other !== clause) {
          otherTrigger.setAttribute("aria-expanded", "false");
          other.classList.remove("guided__clause--open");
        }
      });

      if (isExpanded) {
        trigger.setAttribute("aria-expanded", "false");
        clause.classList.remove("guided__clause--open");
      } else {
        trigger.setAttribute("aria-expanded", "true");
        clause.classList.add("guided__clause--open");
        updateProgress(clause);
      }
    });
  });

  function updateProgress(activeClause) {
    var items = Array.from(clauses);
    var index = items.indexOf(activeClause) + 1;
    var total = items.length;
    var fill = document.getElementById("guided-progress-fill");
    var progressText = document.querySelector(".guided__progress span");

    if (fill) {
      fill.style.width = Math.round((index / total) * 100) + "%";
    }

    if (progressText) {
      progressText.textContent = index + " de " + total + " revisadas";
    }

    var dots = document.querySelectorAll(".guided__nav-dot");
    dots.forEach(function (dot, i) {
      dot.classList.toggle("guided__nav-dot--active", i === index - 1);
    });
  }
})();

(function () {
  function initAccordion() {
    var items = document.querySelectorAll(".faq-item__question");
    if (!items.length) return;

    items.forEach(function (button) {
      button.addEventListener("click", function () {
        var isExpanded = button.getAttribute("aria-expanded") === "true";
        var answerId = button.getAttribute("aria-controls");
        var answer = document.getElementById(answerId);
        var icon = button.querySelector(".faq-item__icon");

        items.forEach(function (otherBtn) {
          if (otherBtn !== button) {
            otherBtn.setAttribute("aria-expanded", "false");
            var otherId = otherBtn.getAttribute("aria-controls");
            var otherAnswer = document.getElementById(otherId);
            var otherIcon = otherBtn.querySelector(".faq-item__icon");
            if (otherAnswer) otherAnswer.classList.remove("faq-item__answer--open");
            if (otherIcon) otherIcon.classList.remove("faq-item__icon--open");
          }
        });

        if (isExpanded) {
          button.setAttribute("aria-expanded", "false");
          if (answer) answer.classList.remove("faq-item__answer--open");
          if (icon) icon.classList.remove("faq-item__icon--open");
        } else {
          button.setAttribute("aria-expanded", "true");
          if (answer) answer.classList.add("faq-item__answer--open");
          if (icon) icon.classList.add("faq-item__icon--open");
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordion);
  } else {
    initAccordion();
  }
})();

(function () {
  function initDemo() {
    var panel = document.getElementById("demo-panel");
    if (!panel) return;

    var lines = panel.querySelectorAll(".demo__decoded-line");
    var summary = panel.querySelector(".demo__summary");
    var animated = false;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            animateDemo();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(panel);

    function animateDemo() {
      lines.forEach(function (line, i) {
        setTimeout(function () {
          line.classList.add("demo__decoded-line--visible");
        }, 200 + i * 300);
      });

      if (summary) {
        setTimeout(function () {
          summary.classList.add("demo__summary--visible");
        }, 200 + lines.length * 300 + 200);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDemo);
  } else {
    initDemo();
  }
})();

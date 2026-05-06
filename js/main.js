(function () {
  const navbar = document.getElementById("navbar");
  const hero = document.getElementById("hero");
  if (!navbar || !hero) return;

  function updateNavbar() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom <= 80) {
      navbar.classList.add("navbar--scrolled");
      navbar.classList.remove("navbar--transparent");
    } else {
      navbar.classList.remove("navbar--scrolled");
      navbar.classList.add("navbar--transparent");
    }
  }

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  const closeBtn = document.getElementById("mobile-close");

  function openMenu() {
    menu.classList.add("navbar__mobile-menu--open");
    overlay.classList.add("navbar__overlay--visible");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menu.classList.remove("navbar__mobile-menu--open");
    overlay.classList.remove("navbar__overlay--visible");
    document.body.style.overflow = "";
  }

  if (toggle) toggle.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  var mobileLinks = document.querySelectorAll(".navbar__mobile-link");
  mobileLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
})();

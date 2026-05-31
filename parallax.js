/**
 * Parallax scrolling — sticky hero with scroll-linked fade
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  var hero = document.getElementById("hero");
  var heroContent = document.querySelector(".hero-content");
  var heroCanvas = document.getElementById("hero-network-canvas");
  var heroBg = document.querySelector(".hero-bg");
  var heroOverlay = document.querySelector(".hero-overlay");
  var ticking = false;
  var heroHeight = 0;

  function measureHero() {
    if (hero) heroHeight = hero.offsetHeight;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setTransform(el, y) {
    if (!el) return;
    el.style.transform = "translate3d(0, " + y.toFixed(2) + "px, 0)";
  }

  function updateHero(scrollY) {
    if (!hero) return;

    var progress = clamp(scrollY / heroHeight, 0, 1);

    setTransform(heroCanvas, scrollY * 0.35);
    setTransform(heroBg, scrollY * 0.22);
    setTransform(heroOverlay, scrollY * 0.1);

    if (heroContent) {
      var y = scrollY * -0.25;
      heroContent.style.transform = "translate3d(0, " + y.toFixed(2) + "px, 0)";
      heroContent.style.opacity = String(1 - progress * 0.85);
    }

    var indicator = document.querySelector(".scroll-indicator");
    if (indicator) {
      indicator.style.opacity = String(Math.max(0, 1 - progress * 2.5));
    }
  }

  function update() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    updateHero(scrollY);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function init() {
    measureHero();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      measureHero();
      update();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

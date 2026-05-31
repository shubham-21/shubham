/**
 * Parallax scrolling — layered depth, sticky hero, scroll-linked motion
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
  var parallaxItems = document.querySelectorAll("[data-parallax-speed]");
  var parallaxShapes = document.querySelectorAll(".parallax-shape");
  var parallaxSections = document.querySelectorAll(".parallax-main > .parallax-section");
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

    setTransform(heroCanvas, scrollY * 0.42);
    setTransform(heroBg, scrollY * 0.28);
    setTransform(heroOverlay, scrollY * 0.14);

    if (heroContent) {
      var y = scrollY * -0.32;
      var scale = 1 - progress * 0.04;
      heroContent.style.transform =
        "translate3d(0, " + y.toFixed(2) + "px, 0) scale(" + scale.toFixed(3) + ")";
      heroContent.style.opacity = String(1 - progress * 0.92);
    }

    var indicator = document.querySelector(".scroll-indicator");
    if (indicator) {
      indicator.style.opacity = String(1 - progress * 2.5);
    }
  }

  function updateItems() {
    var viewCenter = window.innerHeight * 0.5;

    parallaxItems.forEach(function (el) {
      if (el.closest("#hero")) return;

      var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0;
      var rect = el.getBoundingClientRect();
      var elCenter = rect.top + rect.height * 0.5;
      var offset = (elCenter - viewCenter) * speed;

      setTransform(el, offset);
    });
  }

  function updateShapes() {
    var scrollY = window.scrollY;

    parallaxShapes.forEach(function (shape) {
      var speed = parseFloat(shape.getAttribute("data-parallax-speed")) || 0.15;
      var section = shape.closest("section");
      var base = section ? section.offsetTop : 0;
      var y = (scrollY - base) * speed;

      setTransform(shape, y);
    });
  }

  function updateSectionTransitions() {
    var vh = window.innerHeight;

    parallaxSections.forEach(function (section) {
      var rect = section.getBoundingClientRect();

      if (rect.top < vh && rect.bottom > 0) {
        var progress = clamp(1 - rect.top / vh, 0, 1);
        var lift = (1 - progress) * 56;
        section.style.transform = "translate3d(0, " + lift.toFixed(2) + "px, 0)";
      }
    });
  }

  function update() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    updateHero(scrollY);
    updateItems();
    updateShapes();
    updateSectionTransitions();
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

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) update();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

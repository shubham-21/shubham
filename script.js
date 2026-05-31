/**
 * Shubham Chourasia — Portfolio Scripts
 * Scroll spy, animated counters, reveal animations, navbar effects
 */

(function () {
  "use strict";

  /* ------------------------------------------
     Navbar scroll effect
     ------------------------------------------ */
  const navbar = document.getElementById("mainNav");

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ------------------------------------------
     Close mobile nav on link click
     ------------------------------------------ */
  const navLinks = document.querySelectorAll("#navbarContent .nav-link");
  const navbarCollapse = document.getElementById("navbarContent");

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });

  /* ------------------------------------------
     Animated counters
     ------------------------------------------ */
  function animateCounter(element, target, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;

    const counters = document.querySelectorAll(".stat-number");
    if (counters.length === 0) return;

    countersStarted = true;
    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      if (!isNaN(target)) {
        animateCounter(counter, target, 2000);
      }
    });
  }

  /* ------------------------------------------
     Scroll reveal animations
     ------------------------------------------ */
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ------------------------------------------
     Trigger counters when hero stats visible
     ------------------------------------------ */
  const heroStats = document.querySelector(".hero-stats");

  if (heroStats) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterObserver.observe(heroStats);
  }

  /* ------------------------------------------
     Smooth scroll for anchor links (fallback)
     ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href.length <= 1) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ------------------------------------------
     Active nav link highlight on scroll
     ------------------------------------------ */
  const sections = document.querySelectorAll("section[id], header[id]");

  function highlightNavOnScroll() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightNavOnScroll, { passive: true });
  highlightNavOnScroll();

  /* ------------------------------------------
     Tenure duration (experience roles)
     ------------------------------------------ */
  function formatTenure(startDateStr, endDateStr) {
    var start = new Date(startDateStr + "T00:00:00");
    var end = endDateStr ? new Date(endDateStr + "T00:00:00") : new Date();
    var years = end.getFullYear() - start.getFullYear();
    var months = end.getMonth() - start.getMonth();

    if (end.getDate() < start.getDate()) {
      months -= 1;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) return "";

    var parts = [];
    if (years > 0) {
      parts.push(years + (years === 1 ? " year" : " years"));
    }
    if (months > 0) {
      parts.push(months + (months === 1 ? " month" : " months"));
    }

    if (parts.length === 0) {
      return "Less than 1 month";
    }

    return parts.join(", ");
  }

  document.querySelectorAll(".tenure-duration[data-start]").forEach(function (el) {
    var start = el.getAttribute("data-start");
    var end = el.getAttribute("data-end");
    if (!start) return;

    var duration = formatTenure(start, end || null);
    if (duration) {
      el.textContent = duration;
    }
  });

})();

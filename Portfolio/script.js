/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — MAIN JAVASCRIPT
   Prathamesh Thombare · AI/ML Portfolio
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  //  DOM REFERENCES
  // ─────────────────────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const header      = $('#siteHeader');
  const hamburger   = $('#hamburger');
  const mobileNav   = $('#mobileNavOverlay');
  const cursorGlow  = $('#cursorGlow');
  const footerYear  = $('#footerYear');

  // ─────────────────────────────────────────────────────────────
  //  FOOTER YEAR
  // ─────────────────────────────────────────────────────────────
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ─────────────────────────────────────────────────────────────
  //  SMOOTH CURSOR GLOW  (desktop only)
  // ─────────────────────────────────────────────────────────────
  if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top  = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ─────────────────────────────────────────────────────────────
  //  BUTTON MOUSE TRACKING  (radial highlight)
  // ─────────────────────────────────────────────────────────────
  $$('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--mouse-x', x + '%');
      btn.style.setProperty('--mouse-y', y + '%');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  HEADER — scroll behaviour
  // ─────────────────────────────────────────────────────────────
  let lastScroll = 0;
  const SCROLL_THRESHOLD = 80;

  function onScroll() {
    const currentScroll = window.scrollY;

    // Add / remove "scrolled" background
    if (currentScroll > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Auto-hide on scroll down, show on scroll up
    if (currentScroll > SCROLL_THRESHOLD && currentScroll > lastScroll) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─────────────────────────────────────────────────────────────
  //  ACTIVE NAV LINK — based on scroll position
  // ─────────────────────────────────────────────────────────────
  const navLinks = $$('[data-nav]');
  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.id;

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ─────────────────────────────────────────────────────────────
  //  MOBILE NAV
  // ─────────────────────────────────────────────────────────────
  function toggleMobileNav() {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileNav);
  }

  // Close mobile nav on link click
  $$('[data-mobile-nav]').forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        toggleMobileNav();
      }
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      toggleMobileNav();
    }
  });

  // ─────────────────────────────────────────────────────────────
  //  SCROLL-TRIGGERED ANIMATIONS  (Intersection Observer)
  // ─────────────────────────────────────────────────────────────
  const animateElements = $$('[data-animate]');
  let animateDelay = 0;

  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings that become visible at the same time
          const siblings = entry.target.parentElement
            ? $$('[data-animate]', entry.target.parentElement)
            : [];
          const index = siblings.indexOf(entry.target);
          const delay = index >= 0 ? index * 80 : 0;

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          animateObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  animateElements.forEach((el) => animateObserver.observe(el));

  // ─────────────────────────────────────────────────────────────
  //  COUNTER ANIMATION  (hero stats)
  // ─────────────────────────────────────────────────────────────
  const counters = $$('[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const start = parseInt(el.textContent, 10) || 0;
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ─────────────────────────────────────────────────────────────
  //  SMOOTH ANCHOR SCROLLING  (for browsers that need it)
  // ─────────────────────────────────────────────────────────────
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  PAGE LOAD — trigger hero animations
  // ─────────────────────────────────────────────────────────────
  window.addEventListener('load', () => {
    document.body.classList.remove('loading');
  });

  // ─────────────────────────────────────────────────────────────
  //  CERTIFICATE FILTERING
  // ─────────────────────────────────────────────────────────────
  (function initCertFilters() {
    const filterBtns  = $$('[data-filter]', document);
    const certCards   = $$('.cert-card', document);
    const certEmpty   = $('#certEmpty');

    if (!filterBtns.length || !certCards.length) return;

    function applyFilter(selectedCategory) {
      let visibleCount = 0;

      certCards.forEach((card) => {
        const cardCategory = card.dataset.category || '';
        const matches = selectedCategory === 'all' || cardCategory === selectedCategory;

        if (matches) {
          card.classList.remove('cert-hidden');
          // Trigger re-animation
          card.classList.remove('cert-fade-in');
          // Force reflow to restart animation
          void card.offsetWidth;
          card.classList.add('cert-fade-in');
          visibleCount++;
        } else {
          card.classList.add('cert-hidden');
          card.classList.remove('cert-fade-in');
        }
      });

      // Toggle empty state
      if (certEmpty) {
        if (visibleCount === 0) {
          certEmpty.removeAttribute('hidden');
        } else {
          certEmpty.setAttribute('hidden', '');
        }
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedCategory = btn.dataset.filter;

        // Update active state & aria-pressed
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        applyFilter(selectedCategory);
      });

      // Keyboard: Enter / Space
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Initialise: all visible
    applyFilter('all');
  })();

})();


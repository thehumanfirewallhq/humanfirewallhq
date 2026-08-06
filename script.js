/**
 * @HUMANFIREWALLHQ // OPERATOR PLATFORM VANILLA JS
 * ZERO COOKIES // ZERO TRACKING // STRICT DOM SECURITY (NO INNERHTML WITH USER DATA)
 */

(function () {
  'use strict';

  // Security Check: Enforce Strict Mode and verify DOM loaded
  document.addEventListener('DOMContentLoaded', function () {
    initCEOReviewBanner();
    initMobileDrawer();
    initProductFilters();
    initLinkPlaceholdersModal();
    initNewsletterForm();
    initTerminalTyping();
    initScrollSpy();
  });

  /**
   * 1. CEO REVIEW BANNER DISMISSAL
   */
  function initCEOReviewBanner() {
    const banner = document.getElementById('ceo-review-banner');
    const dismissBtn = document.getElementById('dismiss-ceo-banner');
    if (banner && dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.style.display = 'none';
      });
    }
  }

  /**
   * 2. MOBILE NAVIGATION DRAWER
   */
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const links = drawer ? drawer.querySelectorAll('.mobile-drawer-link') : [];

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', function () {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        drawer.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close drawer when any link is clicked
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * 3. PRODUCT BROWSER - TARGET AUDIENCE FILTER
   */
  function initProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card[data-target]');

    if (!filterButtons.length || !productCards.length) return;

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const selectedFilter = btn.getAttribute('data-filter') || 'all';

        // Update active state on buttons
        filterButtons.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Filter product cards
        productCards.forEach(function (card) {
          const cardTargets = card.getAttribute('data-target') || '';
          const targetArray = cardTargets.split(',').map(function (item) {
            return item.trim().toLowerCase();
          });

          if (selectedFilter === 'all' || targetArray.includes(selectedFilter.toLowerCase())) {
            card.classList.remove('hidden-by-filter');
          } else {
            card.classList.add('hidden-by-filter');
          }
        });
      });
    });
  }

  /**
   * 4. OPERATOR LINK PREVIEW MODAL (HANDLES [PATREON_LINK], [SUBSTACK_LINK], ETC.)
   * Prevents 404s during review and shows Copywriter/CEO exact target destinations.
   */
  function initLinkPlaceholdersModal() {
    const modalBackdrop = document.getElementById('operator-modal-backdrop');
    const modalTitle = document.getElementById('modal-title');
    const modalTargetText = document.getElementById('modal-target-text');
    const modalDescText = document.getElementById('modal-desc-text');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const dismissModalBtn = document.getElementById('dismiss-modal-btn');
    const visitRealUrlBtn = document.getElementById('visit-real-url-btn');

    if (!modalBackdrop) return;

    const placeholderMap = {
      '[PATREON_LINK]': {
        name: 'PATREON MASTERCLASS ACCESS',
        url: 'https://www.patreon.com/c/HumanFirewallHQ',
        desc: 'Direct link to Patreon membership and Masterclass product tier checkouts. Copywriter to verify final Patreon campaign URLs.'
      },
      '[SUBSTACK_LINK]': {
        name: 'SUBSTACK INTEL DISPATCH',
        url: 'https://humanfirewallhq.substack.com/',
        desc: 'Direct link to @HumanFirewallHQ Substack blog and free weekly intelligence newsletter.'
      },
      '[KOFI_LINK]': {
        name: 'KO-FI COMMUNITY & DONATIONS',
        url: 'https://ko-fi.com/humanfirewall',
        desc: 'Direct link to Ko-Fi shop and one-time supporter donations.'
      },
      '[X_LINK]': {
        name: 'X (TWITTER) // @HUMANFIREWALLHQ',
        url: 'https://x.com/HumanFirewallHQ',
        desc: 'Official X/Twitter feed for real-time AI scam alerts and security briefings.'
      },
      '[YOUTUBE_LINK]': {
        name: 'YOUTUBE CHANNEL (NEW)',
        url: 'https://linktr.ee/HumanFirewall',
        desc: 'New official @HumanFirewallHQ YouTube video channel for deep-dive tutorials and scam teardowns.'
      }
    };

    function openModal(placeholderKey) {
      const info = placeholderMap[placeholderKey] || {
        name: 'OPERATOR LINK PLACEHOLDER',
        url: 'https://linktr.ee/HumanFirewall',
        desc: 'This CTA button is marked for copywriter review (' + placeholderKey + ').'
      };

      if (modalTitle) modalTitle.textContent = '// ' + info.name;
      if (modalTargetText) modalTargetText.textContent = info.url;
      if (modalDescText) modalDescText.textContent = info.desc;

      if (visitRealUrlBtn) {
        visitRealUrlBtn.onclick = function () {
          window.open(info.url, '_blank', 'noopener,noreferrer');
        };
      }

      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (dismissModalBtn) dismissModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeModal();
    });

    // Intercept clicks on links whose href or data-placeholder contains square bracket placeholders
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const dataPlaceholder = link.getAttribute('data-placeholder') || '';

      const matchedKey = Object.keys(placeholderMap).find(function (key) {
        return href === key || dataPlaceholder === key || href.indexOf(key) !== -1;
      });

      if (matchedKey) {
        e.preventDefault();
        openModal(matchedKey);
      }
    });
  }

  /**
   * 5. NEWSLETTER FORM HANDLER (SUBSTACK INTEGRATION DEMO)
   */
  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email-input');
    const statusMsg = document.getElementById('newsletter-status-msg');

    if (!form || !input) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        if (statusMsg) {
          statusMsg.textContent = '[ ERROR: PLEASE ENTER A VALID EMAIL ADDRESS ]';
          statusMsg.style.color = '#ef4444';
        }
        return;
      }

      // Show operator dispatch notification and offer Substack link
      if (statusMsg) {
        statusMsg.textContent = '[ OPERATOR DISPATCH: CONNECTING TO SUBSTACK HOST (https://humanfirewallhq.substack.com/) ... ]';
        statusMsg.style.color = '#00ff88';
      }

      setTimeout(function () {
        window.open('https://humanfirewallhq.substack.com/', '_blank', 'noopener,noreferrer');
      }, 900);
    });
  }

  /**
   * 6. HERO TERMINAL TYPEWRITER EFFECT
   */
  function initTerminalTyping() {
    const outputEl = document.getElementById('term-animated-line');
    if (!outputEl) return;

    const messages = [
      "AI_SCAM_DEFENSE_PROTOCOL === ACTIVE",
      "CHECKING SYSTEM STATUS... DEFENSE CONSTRUCT OK",
      "TARGETING: REAL HUMANS // NO TECHNICAL JARGON",
      "COOKIE_TRACKING_AUDIT: 0 COOKIES DETECTED"
    ];

    let msgIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeStep() {
      const currentMsg = messages[msgIndex];
      if (isDeleting) {
        outputEl.textContent = currentMsg.substring(0, charIndex - 1);
        charIndex--;
      } else {
        outputEl.textContent = currentMsg.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 30 : 65;

      if (!isDeleting && charIndex === currentMsg.length) {
        speed = 2500; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        msgIndex = (msgIndex + 1) % messages.length;
        speed = 500;
      }

      setTimeout(typeStep, speed);
    }

    setTimeout(typeStep, 800);
  }

  /**
   * 7. SCROLL SPY FOR NAVBAR ACTIVE STATE
   */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function () {
      let current = '';
      const scrollY = window.pageYOffset;

      sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });
  }

})();

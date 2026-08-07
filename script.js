/**
 * @HUMANFIREWALLHQ // STATIC SITE INTERACTIONS
 * No accounts, passwords, cookies, trackers, or server-side user state.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initCommandPalette();
    initMobileDrawer();
    initProductFilters();
    initProductDetailPage();
    // The cart/selection UI is intentionally disabled while Ko-fi handles checkout.
    initArticleArchive();
    initArticlePage();
    initHomepageArticles();
    initNewsletterForm();
    initChecklistProgress();
    initChecklistPrint();
    initTerminalTyping();
    initThemeToggle();
    initSocialFeed();
  });

  function initCommandPalette() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions || document.getElementById('command-palette')) return;

    const isApplePlatform = /Mac|iPhone|iPad/.test((navigator.platform || '') + ' ' + (navigator.userAgent || ''));
    const shortcutLabel = isApplePlatform ? '⌘K' : 'Ctrl K';
    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'command-launcher';
    launcher.setAttribute('aria-label', 'Open command bar');
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.title = 'Open command bar (' + shortcutLabel + ')';
    launcher.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"></path></svg><span class="command-launcher-label">Command</span>';
    navActions.insertBefore(launcher, navActions.firstChild);

    const palette = document.createElement('dialog');
    palette.id = 'command-palette';
    palette.className = 'command-palette';
    palette.setAttribute('aria-labelledby', 'command-palette-title');
    palette.innerHTML = '<div class="command-palette-shell"><div class="command-palette-header"><div><span class="command-palette-kicker">HUMANFIREWALL / QUICK ACCESS</span><h2 id="command-palette-title">What do you need?</h2></div><button type="button" class="command-palette-close" aria-label="Close command bar">Esc</button></div><label class="command-search-label" for="command-search">Search pages and actions</label><div class="command-search-wrap"><span aria-hidden="true">&gt;</span><input id="command-search" class="command-search" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="command-list" autocomplete="off" spellcheck="false" placeholder="try “checklist” or “theme”"><kbd>↵</kbd></div><div class="command-palette-meta"><span id="command-palette-count">5 destinations</span><span>↑ ↓ navigate</span></div><div id="command-list" class="command-list" role="listbox" aria-label="Available commands"></div><div class="command-palette-footer"><span><i class="command-live-dot" aria-hidden="true"></i> LOCAL / NO TRACKERS</span><span>' + shortcutLabel + ' to reopen</span></div></div>';
    document.body.appendChild(palette);

    const search = palette.querySelector('#command-search');
    const list = palette.querySelector('#command-list');
    const count = palette.querySelector('#command-palette-count');
    const closeButton = palette.querySelector('.command-palette-close');
    const commands = [
      { label: 'Home', detail: 'The calm starting point', hint: 'navigate', href: 'index.html' },
      { label: 'Products & services', detail: 'PDFs, kits, and team resources', hint: 'navigate', href: 'products.html' },
      { label: 'Story archive', detail: 'Investigations without the noise', hint: 'navigate', href: 'blog.html' },
      { label: 'Free checklist', detail: 'A safer setup in 15 minutes', hint: 'navigate', href: 'checklist.html' },
      { label: 'About HumanFirewall', detail: 'Why this exists', hint: 'navigate', href: 'about.html' },
      { label: 'Switch theme', detail: 'Toggle the light / dark view', hint: 'action', action: 'theme' },
      { label: 'Open Substack', detail: 'Read the original dispatches', hint: 'external', href: 'https://humanfirewallhq.substack.com/' }
    ];
    let visibleCommands = commands.slice();
    let activeIndex = 0;
    let opener = launcher;

    const open = function () {
      opener = document.activeElement && document.activeElement !== document.body ? document.activeElement : launcher;
      search.value = '';
      visibleCommands = commands.slice();
      activeIndex = 0;
      renderCommands();
      if (typeof palette.showModal === 'function') palette.showModal();
      else palette.setAttribute('open', '');
      document.body.classList.add('command-open');
      launcher.setAttribute('aria-expanded', 'true');
      search.setAttribute('aria-expanded', 'true');
      window.requestAnimationFrame(function () { if (palette.open) search.focus(); });
    };
    const restoreAfterClose = function () {
      document.body.classList.remove('command-open');
      launcher.setAttribute('aria-expanded', 'false');
      search.setAttribute('aria-expanded', 'false');
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
    const close = function () {
      if (typeof palette.close === 'function' && palette.open) palette.close();
      else {
        palette.removeAttribute('open');
        restoreAfterClose();
      }
    };
    palette.addEventListener('close', restoreAfterClose);
    palette.addEventListener('cancel', function (event) {
      event.preventDefault();
      close();
    });
    const renderCommands = function () {
      list.innerHTML = '';
      if (!visibleCommands.length) {
        list.innerHTML = '<p class="command-empty">No matching command. Try a page name or “theme”.</p>';
        count.textContent = '0 destinations';
        search.removeAttribute('aria-activedescendant');
        return;
      }
      count.textContent = visibleCommands.length + (visibleCommands.length === 1 ? ' destination' : ' destinations');
      search.setAttribute('aria-activedescendant', 'command-option-' + activeIndex);
      visibleCommands.forEach(function (command, index) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'command-item' + (index === activeIndex ? ' is-active' : '');
        item.id = 'command-option-' + index;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
        item.dataset.commandIndex = String(index);
        item.innerHTML = '<span class="command-item-icon" aria-hidden="true">' + (command.action === 'theme' ? '◐' : command.hint === 'external' ? '↗' : '→') + '</span><span class="command-item-copy"><strong></strong><small></small></span><span class="command-item-hint"></span>';
        item.querySelector('strong').textContent = command.label;
        item.querySelector('small').textContent = command.detail;
        item.querySelector('.command-item-hint').textContent = command.hint;
        item.addEventListener('click', function () { execute(command); });
        list.appendChild(item);
      });
    };
    const execute = function (command) {
      if (command.action === 'theme') {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.click();
        close();
        return;
      }
      if (command.href) window.location.href = command.href;
    };
    const moveSelection = function (direction) {
      if (!visibleCommands.length) return;
      activeIndex = (activeIndex + direction + visibleCommands.length) % visibleCommands.length;
      renderCommands();
      const active = list.querySelector('.command-item.is-active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    };

    launcher.addEventListener('click', open);
    closeButton.addEventListener('click', close);
    palette.addEventListener('click', function (event) { if (event.target === palette) close(); });
    search.addEventListener('input', function () {
      const query = search.value.trim().toLowerCase();
      visibleCommands = commands.filter(function (command) {
        return (command.label + ' ' + command.detail + ' ' + command.hint).toLowerCase().includes(query);
      });
      activeIndex = 0;
      renderCommands();
    });
    search.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveSelection(1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); moveSelection(-1); }
      if (event.key === 'Enter' && visibleCommands[activeIndex]) { event.preventDefault(); execute(visibleCommands[activeIndex]); }
    });
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (palette.open) close(); else open();
      }
    });

    renderCommands();
  }

  function initThemeToggle() {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const storageKey = 'humanfirewall-theme';

    let theme = 'light';
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'light' || saved === 'dark') theme = saved;
    } catch (error) {
      // Use the dark default if storage is unavailable.
    }

    function applyTheme(nextTheme) {
      const isLight = nextTheme === 'light';
      root.classList.toggle('light', isLight);
      root.classList.toggle('dark', !isLight);
      if (toggle) {
        toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        toggle.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        toggle.innerHTML = isLight
          ? '<svg class="theme-icon theme-sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg><span class="theme-toggle-label">Theme</span>'
          : '<svg class="theme-icon theme-moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"></path></svg><span class="theme-toggle-label">Theme</span>';
      }
    }

    applyTheme(theme);
    if (toggle) {
      toggle.addEventListener('click', function () {
        theme = root.classList.contains('light') ? 'dark' : 'light';
        applyTheme(theme);
        try { localStorage.setItem(storageKey, theme); } catch (error) { /* optional preference */ }
      });
    }
  }

  function initSocialFeed() {
    const list = document.getElementById('social-feed-list');
    const status = document.getElementById('social-feed-status');
    const fallback = document.getElementById('social-feed-fallback');
    if (!list || !status || !fallback) return;

    const sixHours = 6 * 60 * 60 * 1000;
    const fallbackPosts = [];
    const safeSocialUrl = function (value) {
      try {
        const parsed = new URL(String(value || ''), window.location.href);
        return parsed.protocol === 'https:' && (parsed.hostname === 'x.com' || parsed.hostname === 'twitter.com') ? parsed.href : 'https://x.com/HumanFirewallHQ';
      } catch (error) {
        return 'https://x.com/HumanFirewallHQ';
      }
    };
    const safeSocialImage = function (value) {
      try {
        const parsed = new URL(String(value || ''));
        return parsed.protocol === 'https:' && parsed.hostname === 'pbs.twimg.com' ? parsed.href : '';
      } catch (error) {
        return '';
      }
    };
    const render = function (feed) {
      const posts = Array.isArray(feed.posts)
        ? feed.posts.filter(function (post) {
          return post && typeof post.text === 'string' && post.text.trim() && typeof post.url === 'string' && safeSocialUrl(post.url) !== 'https://x.com/HumanFirewallHQ';
        }).slice(0, 3)
        : [];
      list.innerHTML = '';
      posts.forEach(function (post) {
        const item = document.createElement('article');
        item.className = 'social-post';
        const text = document.createElement('p');
        text.textContent = post.text || '';
        const meta = document.createElement('div');
        meta.className = 'social-post-meta';
        meta.textContent = post.date || '';
        const socialImage = safeSocialImage(post.image);
        if (socialImage) {
          const image = document.createElement('img');
          image.width = 1200;
          image.height = 675;
          image.src = socialImage;
          image.alt = 'Image from @HumanFirewallHQ on X';
          image.loading = 'lazy';
          item.appendChild(image);
        }
        const link = document.createElement('a');
        link.href = safeSocialUrl(post.url);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'View on X →';
        item.append(text, meta, link);
        list.appendChild(item);
      });
      const fetched = Date.parse(feed.fetchedAt || '');
      const age = Date.now() - fetched;
      const fresh = Number.isFinite(fetched) && age >= 0 && age < sixHours;
      list.setAttribute('aria-busy', 'false');
      // A populated feed is useful even when its last refresh is older than six
      // hours. Show the freshness state in the status line, but never show the
      // empty-feed notice alongside real posts.
      fallback.hidden = posts.length > 0;
      status.textContent = fresh
        ? 'UPDATED ' + new Date(fetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : posts.length > 0
          ? 'OLDER UPDATE // SEE X FOR MORE'
          : 'FEED UNAVAILABLE // VIEW X FOR LIVE POSTS';
    };

    window.setTimeout(function () {
      if (list.getAttribute('aria-busy') === 'true') {
        list.setAttribute('aria-busy', 'false');
        list.innerHTML = '';
        fallback.hidden = false;
        status.textContent = 'FEED TIMEOUT // VIEW X FOR LIVE POSTS';
      }
    }, 6000);

    fetch('social-feed.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('feed unavailable'); return response.json(); })
      .then(render)
      .catch(function () { render({ posts: fallbackPosts, fetchedAt: '' }); });
  }

  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (!toggleBtn || !drawer) return;

    const drawerLinks = Array.from(drawer.querySelectorAll('a'));
    const closeDrawer = function (returnFocus) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
      if (returnFocus) toggleBtn.focus();
    };

    toggleBtn.addEventListener('click', function () {
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.classList.toggle('drawer-open', isOpen);
      if (isOpen && drawerLinks[0]) drawerLinks[0].focus();
    });

    drawerLinks.forEach(function (link) {
      link.addEventListener('click', function () { closeDrawer(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (!drawer.classList.contains('open')) return;
      if (event.key === 'Escape') {
        closeDrawer(true);
        return;
      }
      if (event.key !== 'Tab' || !drawerLinks.length) return;
      const first = drawerLinks[0];
      const last = drawerLinks[drawerLinks.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function initProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card[data-target]');
    if (!filterButtons.length || !productCards.length) return;

    function applyFilter(rawFilter) {
      let selectedFilter = (rawFilter || 'all').trim().toLowerCase();
      const knownFilter = Array.prototype.some.call(filterButtons, function (button) {
        return (button.getAttribute('data-filter') || 'all').toLowerCase() === selectedFilter;
      });
      if (!knownFilter) selectedFilter = 'all';

      filterButtons.forEach(function (button) {
        const buttonFilter = (button.getAttribute('data-filter') || 'all').toLowerCase();
        const active = buttonFilter === selectedFilter;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      productCards.forEach(function (card) {
        const targets = (card.getAttribute('data-target') || '').split(',').map(function (target) {
          return target.trim().toLowerCase();
        });
        const visible = selectedFilter === 'all' || targets.includes(selectedFilter);
        card.classList.toggle('hidden-by-filter', !visible);
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-filter'));
      });
    });

    applyFilter(new URLSearchParams(window.location.search).get('filter') || 'all');
  }

  function initProductDetailPage() {
    const detail = document.getElementById('product-detail');
    if (!detail) return;

    const escapeText = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
      });
    };
    const listItems = function (value) {
      return String(value || '').split('|').map(function (item) { return item.trim(); }).filter(Boolean);
    };
    const safeAsset = function (value) {
      const asset = String(value || '').trim();
      return /^images\/products\/[a-z0-9._-]+\.(?:svg|png|jpe?g|webp)$/i.test(asset) ? asset : '';
    };
    const safeProduct = function (card) {
      return card && card.dataset.productName && card.dataset.productDescription;
    };
    const render = function (products, selectedName) {
      const product = products.find(function (item) { return item.dataset.productName === selectedName; });
      if (!safeProduct(product)) {
        detail.innerHTML = '<div class="archive-empty"><h1>Product not found</h1><p>Choose a product from the catalog to see its details.</p><a class="btn btn-primary" href="products.html">Browse products</a></div>';
        return;
      }
      const includes = listItems(product.dataset.productIncludes);
      const bundles = listItems(product.dataset.productBundles);
      const tiers = listItems(product.dataset.productTiers);
      const recommendations = listItems(product.dataset.productRecommend);
      const analysis = listItems(product.dataset.productAnalysis);
      const kofiUrls = listItems(product.dataset.productKofiUrls);
      const productName = product.dataset.productName;
      const optionImages = listItems(product.dataset.productOptionImages).map(safeAsset).filter(Boolean);
      const productImage = safeAsset(product.dataset.productImage);
      const safeKofiUrl = function (value) {
        try {
          const parsed = new URL(String(value || ''), window.location.href);
          return parsed.protocol === 'https:' && (parsed.hostname === 'ko-fi.com' || parsed.hostname.endsWith('.ko-fi.com')) ? parsed.href : 'https://ko-fi.com/humanfirewall/shop';
        } catch (error) {
          return 'https://ko-fi.com/humanfirewall/shop';
        }
      };
      const recommended = recommendations.map(function (name) {
        const target = products.find(function (item) { return item.dataset.productName === name; });
        return target ? '<a class="recommendation-chip" href="product-detail.html?product=' + encodeURIComponent(name) + '">' + escapeText(name) + '</a>' : '';
      }).join('');
      const optionRows = tiers.length ? tiers : [productName + ' · ' + product.dataset.productPrice + ' · ' + product.dataset.productFormat];
      const optionMarkup = '<section class="product-detail-options" aria-labelledby="product-options-title"><div class="product-detail-section-heading"><div><span class="section-eyebrow">Choose what fits</span><h2 id="product-options-title">Available editions</h2></div><span class="selection-note">One-time PDF purchase via Ko-fi</span></div><div class="product-option-grid">' + optionRows.map(function (item, index) {
          const parts = item.split(' · ');
          const title = parts.shift() || productName;
          const detailText = parts.join(' · ');
          const priceMatch = item.match(/€\s*(\d+(?:[.,]\d{1,2})?)/);
          const price = priceMatch ? priceMatch[1].replace(',', '.') : '';
          const isBundle = /bundle|library/i.test(title);
          const image = optionImages[index] || productImage;
          const imageMarkup = image ? '<img class="product-option-image" src="' + escapeText(image) + '" alt="' + escapeText(title) + ' product image" width="1376" height="768" loading="lazy">' : '';
          const destination = safeKofiUrl(kofiUrls[index]);
          return '<article class="product-option-card' + (isBundle ? ' product-option-card-bundle' : '') + '">' + imageMarkup + '<div class="product-option-copy"><span class="product-option-index">EDITION ' + String(index + 1).padStart(2, '0') + '</span><span class="product-option-heading"><strong class="product-option-title">' + escapeText(title) + '</strong><strong class="product-option-price">' + (price ? '€' + escapeText(price) : 'Ask') + '</strong></span>' + (isBundle ? '<span class="product-option-recommended">Best value</span>' : '') + '<span class="product-option-description">' + escapeText(detailText) + '</span><a class="btn btn-primary product-option-link" href="' + escapeText(destination) + '" target="_blank" rel="noopener noreferrer">Open product</a></div></article>';
        }).join('') + '</div><p class="product-detail-purchase-note">Ko-fi is the checkout. Your selected edition opens there directly; this site does not store a cart or payment details.</p></section>';
      const includedMarkup = includes.length ? '<ul class="product-detail-list">' + includes.map(function (item) { return '<li>' + escapeText(item) + '</li>'; }).join('') + '</ul>' : '<p class="product-detail-fallback-copy">Details will be added soon.</p>';
      const bundleMarkup = bundles.length ? '<ul class="product-detail-list">' + bundles.map(function (item) { return '<li>' + escapeText(item) + '</li>'; }).join('') + '</ul>' : '<p class="product-detail-fallback-copy">No bundles are listed for this product.</p>';
      const analysisMarkup = analysis.length ? '<section class="product-detail-analysis" aria-labelledby="product-analysis-title"><div class="section-eyebrow">Read the editions like a product line</div><h2 id="product-analysis-title">What changes at each level</h2><div class="product-analysis-grid">' + analysis.map(function (item) { const parts = item.split(' · '); const title = parts.shift() || 'Edition'; const meta = parts.shift() || ''; const detailText = parts.join(' · '); return '<article class="product-analysis-card"><div class="product-analysis-card-top"><strong>' + escapeText(title) + '</strong><span>' + escapeText(meta) + '</span></div><p>' + escapeText(detailText) + '</p></article>'; }).join('') + '</div></section>' : '';
      detail.innerHTML = '<div class="product-detail-hero product-detail-text-hero"><div class="product-detail-intro"><span class="section-eyebrow">' + escapeText(product.querySelector('.product-tier-name')?.textContent || 'Product details') + '</span><h1 class="product-detail-title">' + escapeText(productName) + '</h1><p class="product-detail-description">' + escapeText(product.dataset.productDescription) + '</p><div class="product-info-meta"><span>' + escapeText(product.dataset.productPrice) + '</span><span>' + escapeText(product.dataset.productFormat) + '</span></div></div></div>' + optionMarkup + analysisMarkup + '<div class="product-detail-content"><section><h2>What is included</h2>' + includedMarkup + '</section><section><h2>Bundle overview</h2>' + bundleMarkup + '</section></div>' + (recommended ? '<section class="product-detail-recommendations"><h2>You may also like</h2><div>' + recommended + '</div></section>' : '') + '<p class="product-detail-footnote">One-time purchase · no recurring membership required.</p>';
      const structuredData = document.getElementById('product-structured-data');
      if (structuredData) {
        const prices = optionRows.map(function (row) { const match = row.match(/€\s*(\d+(?:[.,]\d{1,2})?)/); return match ? Number(match[1].replace(',', '.')) : null; }).filter(function (value) { return Number.isFinite(value); });
        const offer = prices.length > 1 ? { '@type': 'AggregateOffer', lowPrice: String(Math.min.apply(null, prices)), highPrice: String(Math.max.apply(null, prices)), offerCount: prices.length, priceCurrency: 'EUR', availability: 'https://schema.org/InStock' } : { '@type': 'Offer', price: String(prices[0] ?? 0), priceCurrency: 'EUR', availability: 'https://schema.org/InStock' };
        structuredData.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: productName, description: product.dataset.productDescription, image: productImage ? [new URL(productImage, window.location.href).href] : [], brand: { '@type': 'Brand', name: 'HumanFirewall' }, offers: offer });
      }
      const pageHeading = document.querySelector('.detail-page-heading');
      if (pageHeading) pageHeading.textContent = productName === 'Digital Self Defense PDF' ? 'Choose your level of protection.' : 'Choose what fits your situation.';
      document.title = '@HumanFirewallHQ // ' + productName;
    };
    const params = new URLSearchParams(window.location.search);
    const requestedName = params.get('product') || '';
    const legacyNames = { 'Masterclass': 'Digital Self Defense PDF', 'Masterclass Lite': 'Digital Self Defense PDF', 'Enterprise Masterclass': 'Digital Self Defense PDF' };
    const selectedName = legacyNames[requestedName] || requestedName;
    if (legacyNames[requestedName]) {
      params.set('product', selectedName);
      window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
    }
    const fallbackCatalog = function () {
      const dataNode = document.getElementById('product-catalog-fallback');
      if (!dataNode) return [];
      try {
        const data = JSON.parse(dataNode.textContent || '{}');
        return Array.isArray(data.products) ? data.products.map(function (item) {
          const card = document.createElement('article');
          card.dataset.productName = item.name || '';
          card.dataset.productPrice = item.price || '';
          card.dataset.productFormat = item.format || '';
          card.dataset.productDescription = item.description || '';
          card.dataset.productTiers = Array.isArray(item.tiers) ? item.tiers.join('|') : '';
          card.dataset.productIncludes = Array.isArray(item.includes) ? item.includes.join('|') : '';
          card.dataset.productBundles = Array.isArray(item.bundles) ? item.bundles.join('|') : '';
          card.dataset.productAnalysis = Array.isArray(item.analysis) ? item.analysis.join('|') : '';
          card.dataset.productKofiUrls = Array.isArray(item.kofiUrls) ? item.kofiUrls.join('|') : '';
          card.dataset.productRecommend = Array.isArray(item.recommend) ? item.recommend.join('|') : '';
          card.dataset.productImage = item.image || '';
          card.dataset.productOptionImages = Array.isArray(item.optionImages) ? item.optionImages.join('|') : '';
          const label = document.createElement('span');
          label.className = 'product-tier-name';
          label.textContent = item.label || 'Product details';
          card.appendChild(label);
          return card;
        }) : [];
      } catch (error) {
        return [];
      }
    };
    const renderFallback = function () {
      const products = fallbackCatalog();
      if (products.length) render(products, selectedName);
      else detail.innerHTML = '<div class="archive-empty"><h1>Product details unavailable</h1><p>The product overview could not be loaded right now.</p><a class="btn btn-primary" href="products.html">Back to products</a></div>';
    };
    fetch('products.html', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('catalog unavailable'); return response.text(); })
      .then(function (source) {
        const catalog = new DOMParser().parseFromString(source, 'text/html');
        const products = Array.from(catalog.querySelectorAll('.product-card'));
        if (!products.length) throw new Error('catalog empty');
        if (!products.some(function (product) { return product.dataset.productName === selectedName; })) throw new Error('product missing');
        render(products, selectedName);
      })
      .catch(renderFallback);
  }

  function initHomepageArticles() {
    const teasers = document.getElementById('homepage-article-teasers');
    if (!teasers) return;

    const escapeText = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
      });
    };
    const articleAsset = function (value) {
      const asset = String(value || '');
      return /^images\/articles\/[a-z0-9._-]+\.(?:svg|png|jpe?g|webp)$/i.test(asset) ? asset : '';
    };
    const validArticles = function (data) {
      return data && Array.isArray(data.articles) ? data.articles.filter(function (article) {
        return article && typeof article.id === 'string' && article.id && typeof article.title === 'string' && article.title.trim() && typeof article.date === 'string' && article.date.trim() && typeof article.bodyHtml === 'string' && article.bodyHtml.trim() && typeof article.cardImage === 'string' && articleAsset(article.cardImage) && (typeof article.subtitle === 'string' && article.subtitle.trim() || typeof article.summary === 'string' && article.summary.trim());
      }) : [];
    };
    const render = function (articles) {
      const latest = articles.slice().sort(function (left, right) {
        const leftDate = Date.parse(left.date || '') || 0;
        const rightDate = Date.parse(right.date || '') || 0;
        return rightDate - leftDate;
      }).slice(0, 2);
      if (!latest.length) {
        teasers.innerHTML = '<p class="archive-empty">The latest stories are not available right now. <a href="blog.html">Open the story archive.</a></p>';
        return;
      }
      teasers.innerHTML = latest.map(function (article, index) {
        const image = articleAsset(article.cardImage);
        const tone = index % 2 === 0 ? 'btn-outline' : 'btn-secondary';
        const label = article.sourceUrl ? 'Read story' : 'Read here';
        return '<article class="category-card article-teaser-card" data-article-id="' + escapeText(article.id) + '">' +
          (image ? '<img class="category-card-image article-teaser-image" src="' + escapeText(image) + '" alt="' + escapeText(article.title) + '" width="' + escapeText(article.imageWidth || 1200) + '" height="' + escapeText(article.imageHeight || 675) + '" loading="lazy">' : '') +
          '<div><div class="category-header"><span class="category-badge">' + escapeText(article.date) + ' · Investigation</span><span class="text-green font-mono article-teaser-label">FIELD NOTE</span></div><h3 class="category-title">' + escapeText(article.title) + '</h3><p class="category-desc">' + escapeText(article.subtitle || article.summary) + '</p></div><a href="blog.html" class="btn ' + tone + '"><span>' + label + '</span></a></article>';
      }).join('');
    };
    fetch('articles.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('archive unavailable'); return response.json(); })
      .then(function (data) { render(validArticles(data)); })
      .catch(function () { teasers.innerHTML = '<p class="archive-empty">The latest stories are temporarily unavailable. <a href="blog.html">Open the story archive.</a></p>'; });
  }

  function initArticleArchive() {
    const archive = document.getElementById('article-archive');
    if (!archive) return;

    const escapeText = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
      });
    };
    const articleAsset = function (value) {
      const asset = String(value || '');
      return /^images\/articles\/[a-z0-9._-]+\.(?:svg|png|jpe?g|webp)$/i.test(asset) ? asset : '';
    };
    const articleData = function (data) {
      if (!data || !Array.isArray(data.articles)) return [];
      return data.articles.filter(function (article) {
        return article && typeof article.id === 'string' && typeof article.title === 'string' && typeof article.bodyHtml === 'string';
      });
    };
    const sanitizeArticleHtml = function (source) {
      const parsed = new DOMParser().parseFromString(String(source || ''), 'text/html');
      const allowed = new Set(['H2', 'P', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'STRONG', 'EM', 'CODE', 'PRE', 'FIGURE', 'IMG', 'FIGCAPTION', 'A']);
      const attributes = { FIGURE: new Set(['class']), H2: new Set(['id']), A: new Set(['href', 'target', 'rel']), IMG: new Set(['src', 'alt', 'width', 'height', 'loading']) };
      Array.from(parsed.body.querySelectorAll('*')).forEach(function (element) {
        if (!allowed.has(element.tagName)) { element.remove(); return; }
        Array.from(element.attributes).forEach(function (attribute) {
          if (!(attributes[element.tagName] || new Set()).has(attribute.name)) element.removeAttribute(attribute.name);
        });
        if (element.tagName === 'A') {
          try {
            const url = new URL(element.getAttribute('href') || '', window.location.href);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported URL');
            element.setAttribute('href', url.href);
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
          } catch (error) {
            element.removeAttribute('href'); element.removeAttribute('target'); element.removeAttribute('rel');
          }
        }
        if (element.tagName === 'IMG' && !articleAsset(element.getAttribute('src'))) element.remove();
        if (element.tagName === 'H2') {
          const id = (element.getAttribute('id') || '').replace(/^reader-/, '').replace(/[^a-z0-9-]/gi, '');
          if (id) element.setAttribute('id', 'reader-' + id); else element.removeAttribute('id');
        }
      });
      return parsed.body.innerHTML;
    };
    const articleCard = function (article) {
      const image = articleAsset(article.cardImage);
      return '<article class="blog-card archive-card" data-article-id="' + escapeText(article.id) + '">' +
        (image ? '<img class="blog-card-img" src="' + escapeText(image) + '" alt="' + escapeText(article.title) + '" width="' + escapeText(article.imageWidth || 1280) + '" height="' + escapeText(article.imageHeight || 720) + '" loading="lazy">' : '') +
        '<div class="blog-card-body"><span class="blog-date">' + escapeText(article.date) + '</span><h2 class="blog-title">' + escapeText(article.title) + '</h2><p class="blog-excerpt">' + escapeText(article.subtitle || article.summary) + '</p><div class="archive-card-actions"><a class="blog-read-btn" href="article.html?id=' + encodeURIComponent(article.id) + '">Read full article</a></div></div></article>';
    };

    fetch('articles.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('archive unavailable'); return response.json(); })
      .then(function (data) {
        const articles = articleData(data);
        archive.innerHTML = articles.length ? articles.map(articleCard).join('') : '<p class="archive-empty">No articles are available yet.</p>';
      })
      .catch(function () { archive.innerHTML = '<p class="archive-empty">The local archive could not be loaded. <a href="https://humanfirewallhq.substack.com/" target="_blank" rel="noopener noreferrer">Open the original publication.</a></p>'; });
  }

  function initArticlePage() {
    const shell = document.getElementById('article-page');
    if (!shell) return;

    const escapeText = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
      });
    };
    const articleAsset = function (value) {
      const asset = String(value || '');
      return /^images\/articles\/[a-z0-9._-]+\.(?:svg|png|jpe?g|webp)$/i.test(asset) ? asset : '';
    };
    const sectionId = function (value) {
      const normalized = String(value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
      return normalized ? 'reader-' + normalized : '';
    };
    const sanitizeArticleHtml = function (source) {
      const parsed = new DOMParser().parseFromString(String(source || ''), 'text/html');
      const allowed = new Set(['H2', 'P', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'STRONG', 'EM', 'CODE', 'PRE', 'FIGURE', 'IMG', 'FIGCAPTION', 'A']);
      const attributes = { FIGURE: new Set(['class']), H2: new Set(['id']), A: new Set(['href', 'target', 'rel']), IMG: new Set(['src', 'alt', 'width', 'height', 'loading']) };
      Array.from(parsed.body.querySelectorAll('*')).forEach(function (element) {
        if (!allowed.has(element.tagName)) { element.remove(); return; }
        Array.from(element.attributes).forEach(function (attribute) {
          if (!(attributes[element.tagName] || new Set()).has(attribute.name)) element.removeAttribute(attribute.name);
        });
        if (element.tagName === 'A') {
          try {
            const url = new URL(element.getAttribute('href') || '', window.location.href);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported URL');
            element.setAttribute('href', url.href);
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
          } catch (error) {
            element.removeAttribute('href'); element.removeAttribute('target'); element.removeAttribute('rel');
          }
        }
        if (element.tagName === 'IMG' && !articleAsset(element.getAttribute('src'))) element.remove();
        if (element.tagName === 'H2') {
          const id = sectionId(element.getAttribute('id'));
          if (id) element.setAttribute('id', id); else element.removeAttribute('id');
        }
      });
      return parsed.body.innerHTML;
    };
    const renderError = function (title, message) {
      shell.innerHTML = '<div class="archive-empty"><h1>' + escapeText(title) + '</h1><p>' + escapeText(message) + '</p><a class="btn btn-primary" href="blog.html">Back to stories</a></div>';
    };
    const requestedId = new URLSearchParams(window.location.search).get('id') || '';
    if (!/^[a-z0-9-]+$/i.test(requestedId)) {
      renderError('Story not found', 'Choose a story from the archive to open the full article.');
      return;
    }

    fetch('articles.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('archive unavailable'); return response.json(); })
      .then(function (data) {
        const articles = data && Array.isArray(data.articles) ? data.articles : [];
        const article = articles.find(function (item) { return item && item.id === requestedId && typeof item.title === 'string' && typeof item.bodyHtml === 'string'; });
        if (!article) { renderError('Story not found', 'That article is not in the local archive.'); return; }

        const hero = articleAsset(article.cardImage);
        const toc = Array.isArray(article.toc) ? article.toc.map(function (entry) {
          const id = sectionId(entry && entry.id);
          return id && entry && typeof entry.title === 'string' ? { id: id, title: entry.title } : null;
        }).filter(Boolean) : [];
        const tocMarkup = toc.length
          ? '<nav class="article-page-toc" aria-label="Contents"><div class="article-page-toc-label">Contents</div><ol>' + toc.map(function (entry) { return '<li><a href="#' + escapeText(entry.id) + '">' + escapeText(entry.title) + '</a></li>'; }).join('') + '</ol></nav>'
          : '';
        const donationMarkup = '<aside class="article-donation" aria-label="Support The Human Firewall"><strong>Was this useful?</strong><p>If this investigation helped you think more clearly about digital risk, you can support the independent work behind it.</p><a class="btn btn-primary" href="https://ko-fi.com/humanfirewall/donate" target="_blank" rel="noopener noreferrer">Support the Human Firewall</a></aside>';
        shell.innerHTML = '<div class="article-page-top"><a class="back-link" href="blog.html">← Back to stories</a><span class="article-page-date">' + escapeText(article.date) + '</span></div><header class="article-page-header"><span class="section-eyebrow">HumanFirewall investigation</span><h1 class="article-page-title">' + escapeText(article.title) + '</h1><p class="article-page-subtitle">' + escapeText(article.subtitle || article.summary) + '</p>' + (hero ? '<img class="article-page-hero" src="' + escapeText(hero) + '" alt="' + escapeText(article.title) + '" width="' + escapeText(article.imageWidth || 1280) + '" height="' + escapeText(article.imageHeight || 720) + '">' : '') + '</header>' + tocMarkup + '<div class="article-page-body article-body">' + sanitizeArticleHtml(article.bodyHtml || '<p>This article is not available yet.</p>') + '</div>' + donationMarkup + '<footer class="article-page-footer"><a class="btn btn-outline" href="blog.html">Back to stories</a></footer>';
        document.title = '@HumanFirewallHQ // ' + article.title;
      })
      .catch(function () { renderError('Stories unavailable', 'The local article archive could not be loaded right now.'); });
  }

  /* Legacy modal removed: the archive reader is the single article rendering path. */
  /*
  function initBlogReaderModal() {
    const backdrop = document.getElementById('blog-reader-backdrop');
    const closeButton = document.getElementById('close-blog-modal');
    const substackButton = document.getElementById('blog-modal-substack-btn');
    const readButtons = document.querySelectorAll('.blog-read-btn');
    if (!backdrop || !readButtons.length) return;

    const title = document.getElementById('blog-modal-title');
    const date = document.getElementById('blog-modal-date');
    const image = document.getElementById('blog-modal-img');
    const body = document.getElementById('blog-modal-body');
    let lastFocusedElement = null;
    let articleUrl = 'https://humanfirewallhq.substack.com/';

    function closeModal() {
      backdrop.classList.remove('active');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.querySelectorAll('body > *:not(#blog-reader-backdrop)').forEach(function (element) {
        element.inert = false;
      });
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    function openModal(button) {
      const card = button.closest('.blog-card');
      if (!card) return;

      const candidateUrl = card.getAttribute('data-url') || '';
      try {
        const parsedUrl = new URL(candidateUrl, window.location.href);
        articleUrl = parsedUrl.origin === 'https://humanfirewallhq.substack.com'
          ? parsedUrl.href
          : 'https://humanfirewallhq.substack.com/';
      } catch (error) {
        articleUrl = 'https://humanfirewallhq.substack.com/';
      }

      if (title) title.textContent = card.getAttribute('data-title') || '';
      if (date) date.textContent = '// PUBLISHED ON SUBSTACK: ' + (card.getAttribute('data-date') || '');
      if (image) {
        const imageUrl = card.getAttribute('data-img') || '';
        try {
          const parsedImageUrl = new URL(imageUrl, window.location.href);
          image.src = parsedImageUrl.protocol === 'https:' && ['substackcdn.com', 'substack-post-media.s3.amazonaws.com'].some(function (host) { return parsedImageUrl.hostname === host || parsedImageUrl.hostname.endsWith('.' + host); }) ? parsedImageUrl.href : '';
        } catch (error) {
          image.removeAttribute('src');
        }
        image.alt = card.querySelector('img')?.alt || '';
      }
      if (body) body.textContent = card.getAttribute('data-content') || '';

      lastFocusedElement = document.activeElement;
      document.querySelectorAll('body > *:not(#blog-reader-backdrop)').forEach(function (element) {
        element.inert = true;
      });
      backdrop.classList.add('active');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (closeButton) closeButton.focus();
    }

    readButtons.forEach(function (button) {
      button.addEventListener('click', function () { openModal(button); });
    });
    if (closeButton) closeButton.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closeModal();
    });
    if (substackButton) {
      substackButton.addEventListener('click', function () {
        window.open(articleUrl, '_blank', 'noopener,noreferrer');
      });
    }
    document.addEventListener('keydown', function (event) {
      if (!backdrop.classList.contains('active')) return;
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = backdrop.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  }
  */

  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email-input');
    const status = document.getElementById('newsletter-status-msg');
    if (!form || !input) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = input.value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!validEmail) {
        if (status) {
          status.textContent = '[ ERROR: PLEASE ENTER A VALID EMAIL ADDRESS ]';
          status.className = 'newsletter-status is-error';
        }
        input.focus();
        return;
      }

      const openedWindow = window.open('https://humanfirewallhq.substack.com/', '_blank', 'noopener,noreferrer');
      if (status) {
        status.textContent = openedWindow
          ? '[ OPENING THE OFFICIAL SUBSTACK SUBSCRIPTION PAGE ]'
          : '[ BLOCKED: ALLOW POP-UPS TO OPEN SUBSTACK ]';
        status.className = 'newsletter-status ' + (openedWindow ? 'is-success' : 'is-error');
      }
    });
  }

  function initChecklistProgress() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    if (!checkboxes.length) return;

    const storageKey = 'humanfirewall-checklist-v1';
    let saved = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(parsed)) saved = parsed;
    } catch (error) {
      saved = [];
    }

    checkboxes.forEach(function (checkbox, index) {
      checkbox.checked = saved[index] === true;
      checkbox.addEventListener('change', function () {
        const progress = Array.from(checkboxes, function (item) { return item.checked; });
        try {
          localStorage.setItem(storageKey, JSON.stringify(progress));
        } catch (error) {
          // Private browsing or storage restrictions should not break the checklist.
        }
      });
    });
  }

  function initChecklistPrint() {
    const printButton = document.getElementById('print-checklist-btn');
    if (printButton) printButton.addEventListener('click', function () { window.print(); });
  }

  function initTerminalTyping() {
    const output = document.getElementById('term-animated-line');
    if (!output) return;

    const messages = [
      'PAUSE_BEFORE_YOU_CLICK',
      'CALL_BACK_USING_A_TRUSTED_NUMBER',
      'MFA_MAKES_EVERYDAY_ACCOUNTS_STRONGER',
      'YOU_CAN_START_TODAY'
    ];
    let messageIndex = 3;
    let characterIndex = messages[messageIndex].length;
    let deleting = false;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      output.textContent = messages[messageIndex];
      return;
    }

    function typeStep() {
      const message = messages[messageIndex];
      characterIndex += deleting ? -1 : 1;
      output.textContent = message.substring(0, characterIndex);

      let delay = deleting ? 25 : 55;
      if (!deleting && characterIndex >= message.length) {
        characterIndex = message.length;
        deleting = true;
        delay = 2500;
      } else if (deleting && characterIndex <= 0) {
        characterIndex = 0;
        deleting = false;
        messageIndex = (messageIndex + 1) % messages.length;
        delay = 500;
      }
      window.setTimeout(typeStep, delay);
    }

    window.setTimeout(typeStep, 2200);
  }
})();

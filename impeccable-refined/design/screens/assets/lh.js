/* Lighthouse web mockups — shell + board. Mockup tooling only, not product code.

   Opened directly, a screen file shows itself in three iframes (375 / 768 / 1440).
   Inside an iframe (?embed=1) it renders the real responsive page for the chosen
   theme / state / role.

   <body data-states="a,b" data-roles="x,y" data-shell="main" data-nav="home|explore|discover|marketplace|notifications">
   Elements carry data-show="state …" and data-role="role …".
   The navigation shell (tab bar + collapsible menu) is injected here so every
   screen shares one copy. */
(function () {
  var q = new URLSearchParams(location.search), root = document.documentElement, body = document.body;
  var lists = {
    theme: ['light', 'dark'],
    state: (body.dataset.states || 'default').split(','),
    role: (body.dataset.roles || '').split(',').filter(Boolean),
    zoom: ['50', '75', '100']
  };

  /* ---------------------------------------------------------------- shell */
  var SHELLS = {
    main: [
      ['home', 'Home', 'home-05', 'S-20-01-home-tab.html'],
      ['explore', 'Explore', 'compass', 'S-05-01-explore-feed.html'],
      ['discover', 'Discover', 'user-search-01', 'S-08-01-discover.html'],
      ['marketplace', 'Marketplace', 'store-02', 'S-10-01-marketplace-home.html'],
      ['notifications', 'Notifications', 'notification-03', 'S-12-01-notifications.html', true]
    ],
    reseller: [
      ['dashboard', 'Dashboard', 'dashboard-square-01', 'S-18-01-reseller-dashboard.html'],
      ['orders', 'Orders', 'file-02', 'S-19-01-reseller-order-list.html'],
      ['analytics', 'Analytics', 'analytics-up', 'S-18-02-reseller-analytics.html'],
      ['notifications', 'Notifications', 'notification-03', 'S-12-01-notifications.html', true]
    ]
  };
  var ACTIONS = { professional: ['Create', 'plus-sign', 'href="S-09-01-create-gallery.html"'], reseller: ['More actions', 'more-horizontal', 'href="#" data-open="S-04-03-more-actions-sheet.html"'] };
  function icon(n) { return '<i class="ic ic-24 hgi hgi-stroke hgi-' + n + '" aria-hidden="true"></i>'; }
  function logo(kind) { return '<img class="logo-light" src="assets/logo_' + kind + '_light.png" alt=""><img class="logo-dark" src="assets/logo_' + kind + '.png" alt="">'; }

  function buildShell(app, items, active, role, shell) {
    var act = shell === 'reseller' ? ['Switch to normal account', 'user-switch', 'href="S-20-01-home-tab.html"'] : ACTIONS[role];
    var side = document.createElement('nav');
    side.className = 'side glass glass-panel'; side.setAttribute('aria-label', shell === 'reseller' ? 'Reseller' : 'Primary');
    side.innerHTML =
      '<div class="side-head">' +
        '<button class="side-mark press" data-nav-toggle aria-label="Expand menu" aria-expanded="false">' + logo('mark') + '</button><span class="side-tip t-label-xs">Expand menu</span>' +
        '<a class="side-logo logo" href="S-20-01-home-tab.html' + location.search + '" aria-label="Lighthouse home">' + logo('lighthouse') + '</a>' +
        '<button class="ibtn ibtn-36 ibtn-plain side-collapse press" data-nav-toggle aria-label="Collapse menu" aria-expanded="true"><i class="ic hgi hgi-stroke hgi-arrow-left-01" aria-hidden="true"></i></button>' +
      '</div>' +
      '<ul class="side-list"><span class="nav-ind" aria-hidden="true"></span>' +
        items.map(function (it) {
          return '<li><a class="nav-item" data-key="' + it[0] + '" href="' + (it[3] || '#') + '"' + (it[0] === active ? ' aria-current="page"' : '') + '>' +
            '<span class="ic-wrap">' + icon(it[2]) + (it[4] ? '<span class="dot"></span>' : '') + '</span>' +
            '<span class="side-label t-label-s">' + it[1] + (it[4] ? '<span class="sr-only">, unread</span>' : '') + '</span></a>' +
            '<span class="side-tip t-label-xs" aria-hidden="true">' + it[1] + '</span></li>';
        }).join('') +
      '</ul>' +
      (act ? '<ul class="side-action"><li><a class="nav-item glass press" ' + act[2] + (role === 'reseller' ? ' aria-haspopup="menu"' : '') + '>' + icon(act[1]) + '<span class="side-label t-label-s">' + act[0] + '</span></a><span class="side-tip t-label-xs" aria-hidden="true">' + act[0] + '</span></li></ul>' : '') +
      '<div class="side-foot"><a class="side-profile press" href="S-13-01-my-profile.html" aria-label="Profile">' +
        '<img class="avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&q=70" alt="">' +
        '<span class="who"><span class="t-label-s">Aarav Sharma</span><span class="t-paragraph-s text-soft">@aarav.designs</span></span></a></div>';

    var bar = document.createElement('nav');
    bar.className = 'tabbar'; bar.setAttribute('aria-label', shell === 'reseller' ? 'Reseller' : 'Primary');
    bar.innerHTML =
      '<div class="tabbar-pill glass glass-nav"><span class="nav-ind" aria-hidden="true"></span>' +
        items.map(function (it) {
          return '<a class="nav-item press" data-key="' + it[0] + '" href="' + (it[3] || '#') + '"' + (it[0] === active ? ' aria-current="page"' : '') +
            ' aria-label="' + it[1] + (it[4] ? ', unread' : '') + '"><span class="ic-wrap">' + icon(it[2]) + (it[4] ? '<span class="dot"></span>' : '') + '</span></a>';
        }).join('') +
      '</div>' +
      (act ? '<a class="tabbar-action glass glass-nav press" ' + act[2] + ' aria-label="' + act[0] + '"' + (role === 'reseller' ? ' aria-haspopup="menu"' : '') + '>' + icon(act[1]) + '</a>' : '');

    app.prepend(side); app.append(bar);
    return [side.querySelector('.side-list'), bar.querySelector('.tabbar-pill')];
  }

  /* One pill per nav. It stretches over old + new item, then settles on the new one. */
  function box(el, host) { var a = el.getBoundingClientRect(), h = host.getBoundingClientRect(); return { l: a.left - h.left, t: a.top - h.top, w: a.width, h: a.height }; }
  function union(a, b) { var l = Math.min(a.l, b.l), t = Math.min(a.t, b.t); return { l: l, t: t, w: Math.max(a.l + a.w, b.l + b.w) - l, h: Math.max(a.t + a.h, b.t + b.h) - t }; }
  function put(ind, r, mode) { ind.className = 'nav-ind' + (mode ? ' is-' + mode : ''); ind.style.cssText = 'left:' + r.l + 'px;top:' + r.t + 'px;width:' + r.w + 'px;height:' + r.h + 'px'; }
  function ms(token) { return parseFloat(getComputedStyle(root).getPropertyValue(token)) * (/ms/.test(getComputedStyle(root).getPropertyValue(token)) ? 1 : 1000) || 0; }

  function wireNav(hosts, active, from) {
    hosts.forEach(function (host) {
      var ind = host.querySelector('.nav-ind');
      var get = function (k) { return host.querySelector('[data-key="' + k + '"]'); };
      var settle = function (mode) { var el = get(active); if (el && el.offsetWidth) put(ind, box(el, host), mode); else ind.style.display = 'none'; };
      var prev = from && from !== active && get(from);
      if (prev && prev.offsetWidth) {                      // arriving: start stretched, contract onto the new item
        put(ind, union(box(prev, host), box(get(active), host)));
        ind.getBoundingClientRect();
        requestAnimationFrame(function () { settle('settle'); });
      } else settle();
      new ResizeObserver(function () { settle(); }).observe(host);
      host.addEventListener('click', function (e) {
        var a = e.target.closest('.nav-item'); if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href === '#') { e.preventDefault(); return; }
        e.preventDefault();
        a.classList.add('is-target'); var cur = get(active); if (cur) cur.removeAttribute('aria-current');
        ind.style.display = ''; put(ind, cur ? union(box(cur, host), box(a, host)) : box(a, host), 'stretch');   // leaving: stretch, blur content out
        root.classList.add('is-leaving');
        var p = new URLSearchParams(location.search); p.set('from', active); p.set('state', 'default'); p.set('nav', root.dataset.nav || 'collapsed');
        setTimeout(function () { location.href = href + '?' + p; }, ms('--duration-quick'));
      });
    });
  }

  function wireCollapse() {
    var key = 'lh-nav', stored = null;
    try { stored = localStorage.getItem(key); } catch (e) {}
    var set = function (v, save) {
      root.dataset.nav = v;
      document.querySelectorAll('[data-nav-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', String(v === 'expanded')); });
      if (save) try { localStorage.setItem(key, v); } catch (e) {}
    };
    // A menu tap carries the current state in the URL (nav=…), so the menu never changes state on navigation.
    // Otherwise: the remembered choice from 1200 up, collapsed below that.
    set(q.get('nav') || (innerWidth >= 1200 ? (stored || 'expanded') : 'collapsed'));
    document.addEventListener('click', function (e) { if (e.target.closest('[data-nav-toggle]')) set(root.dataset.nav === 'expanded' ? 'collapsed' : 'expanded', true); });
  }

  /* ---------------------------------------------------------------- embed */
  if (q.has('embed')) {
    var isOverlay = q.has('overlay'), isBare = q.has('bare');
    root.classList.add('is-embed'); if (isOverlay) root.classList.add('is-overlay');
    if (q.has('board') || isBare) root.classList.add('no-motion');   // board frames and host backdrops render settled, with no entrance motion
    root.dataset.theme = q.get('theme') || 'light';
    var state = q.get('state') || lists.state[0], role = q.get('role') || lists.role[0];
    if (lists.state.indexOf(state) < 0) state = lists.state[0];
    if (lists.role.length && lists.role.indexOf(role) < 0) role = lists.role[0];
    document.querySelectorAll('[data-show]').forEach(function (el) { if (el.dataset.show.split(' ').indexOf(state) < 0) el.hidden = true; });
    document.querySelectorAll('[data-role]').forEach(function (el) { if (el.dataset.role.split(' ').indexOf(role) < 0) el.hidden = true; });
    // Tabs that switch the screen state (data-go-state on a tab) show the current state as selected.
    var stTabs = document.querySelectorAll('[role="tab"][data-go-state]');
    if ([].some.call(stTabs, function (t) { return t.dataset.goState === state; })) stTabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.goState === state)); });
    var carry = function (extra) {                       // query every in-mockup link keeps
      var p = new URLSearchParams({ embed: 1, theme: root.dataset.theme });
      if (q.get('role')) p.set('role', q.get('role'));
      if (root.dataset.nav) p.set('nav', root.dataset.nav); else if (q.get('nav')) p.set('nav', q.get('nav'));
      Object.keys(extra || {}).forEach(function (k) { p.set(k, extra[k]); });
      return '?' + p;
    };
    var me = location.pathname.split('/').pop();
    var markCurrent = function () { document.querySelectorAll('[data-current-for]').forEach(function (el) { if (el.dataset.currentFor === state) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current'); }); };
    var show = function (st) {                           // switch the screen state in place, with no reload
      state = st;
      document.querySelectorAll('[data-show]').forEach(function (el) { el.hidden = el.dataset.show.split(' ').indexOf(state) < 0 || (!!el.dataset.role && el.dataset.role.split(' ').indexOf(role) < 0); });
      markCurrent(); history.replaceState(null, '', me + carry({ state: state }));
      try { top.postMessage({ lh: 'page', file: me, state: state }, '*'); } catch (err) {}
    };
    markCurrent();
    // Pushed screens (a Back control in the header) have no bottom tab bar under 768, as in the app.
    if (document.querySelector('.top [data-back]') || body.classList.contains('no-tabbar')) root.classList.add('no-tabbar');

    /* navigation shell */
    var app = document.querySelector('.app'), items = SHELLS[body.dataset.shell];
    if (app && items && !isOverlay) { wireCollapse(); wireNav(buildShell(app, items, body.dataset.nav, role, body.dataset.shell), body.dataset.nav, q.get('from')); }

    /* an overlay file viewed on its own: show its host screen behind it */
    if (body.dataset.kind === 'overlay' && !isOverlay && body.dataset.host) {
      var hf = document.createElement('iframe'); hf.className = 'host-frame'; hf.setAttribute('aria-hidden', 'true'); hf.tabIndex = -1;
      hf.src = body.dataset.host + carry(q.has('board') ? { bare: 1, board: 1 } : { bare: 1 }); body.prepend(hf);
    }

    /* toasts: shown by the base page, requested from anywhere */
    var toast = function (kind, title, msg) {
      if (isOverlay) { parent.postMessage({ lh: 'toast', kind: kind, title: title, msg: msg }, '*'); return; }
      var reg = document.querySelector('.toast-region.live');
      if (!reg) { reg = document.createElement('div'); reg.className = 'toast-region live'; reg.setAttribute('aria-live', 'polite'); body.append(reg); }
      var icons = { danger: 'information-circle', success: 'checkmark-circle-01', warning: 'information-circle', neutral: 'information-circle' };
      reg.innerHTML = '<div class="toast toast-' + kind + ' glass glass-panel" role="status"><i class="ic hgi hgi-stroke hgi-' + (icons[kind] || icons.neutral) + '" aria-hidden="true"></i><div class="body"><span class="t-label-s">' + title + '</span>' + (msg ? '<p class="t-paragraph-s">' + msg + '</p>' : '') + '</div></div>';
      clearTimeout(toast.t); toast.t = setTimeout(function () { reg.innerHTML = ''; }, 3000);
    };

    /* overlays: open a sheet / menu / dialog file as a transparent layer */
    var openLayer = function (file, trigger, st) {
      var f = document.createElement('iframe'); f.className = 'layer-frame'; f.setAttribute('allowtransparency', 'true');
      var extra = { overlay: 1, state: st || 'default' };
      if (trigger) { var r = trigger.getBoundingClientRect(); extra.anchor = [r.left, r.top, r.width, r.height].map(Math.round).join(','); }
      f.src = file + carry(extra); body.append(f); f.focus();
      return f;
    };
    var closeSelf = function (all) {
      if (!isOverlay) return;
      root.classList.add('is-closing');
      setTimeout(function () { parent.postMessage({ lh: 'close', all: !!all }, '*'); }, ms('--modal-close-dur'));
    };
    var go = function (href) {                           // leave transition, then navigate the base page
      if (isOverlay) { parent.postMessage({ lh: 'go', href: href }, '*'); return; }
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = href; }, ms('--duration-quick'));
    };
    addEventListener('message', function (e) {
      var d = e.data || {}; if (!d.lh) return;
      var frame = Array.prototype.filter.call(document.querySelectorAll('.layer-frame'), function (f) { return f.contentWindow === e.source; })[0];
      if (d.lh === 'close' && frame) { frame.remove(); if (d.all) closeSelf(true); }
      if (d.lh === 'replace' && frame) { frame.remove(); openLayer(d.file, null, d.state); }
      if (d.lh === 'toast') toast(d.kind, d.title, d.msg);
      if (d.lh === 'go') { if (frame) frame.remove(); go(d.href); }
    });
    if (isOverlay) {
      var pop = document.querySelector('[data-variant="popover"] .sheet'), an = (q.get('anchor') || '').split(',').map(Number);
      if (pop && an.length === 4 && innerWidth >= 768) {  // place the menu against its trigger
        var st = pop.style, below = an[1] + an[3] + 8;
        if (an[0] + an[2] / 2 > innerWidth / 2) { st.setProperty('--pop-right', Math.max(12, innerWidth - an[0] - an[2]) + 'px'); st.setProperty('--pop-left', 'auto'); }
        else { st.setProperty('--pop-left', Math.max(12, an[0]) + 'px'); st.setProperty('--pop-right', 'auto'); }
        st.setProperty('--pop-top', below + 'px');
        requestAnimationFrame(function () { var h = pop.offsetHeight; if (below + h > innerHeight - 12) st.setProperty('--pop-top', Math.max(12, an[1] - h - 8) + 'px'); });
      }
      addEventListener('keydown', function (e) { if (e.key === 'Escape' && !document.querySelector('[data-modal]')) closeSelf(); });
    }

    /* links between screens keep theme / role / menu state and play the page transition */
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) { if (!a.dataset.key) a.dataset.href = a.getAttribute('href'); });
    if (!isOverlay && !isBare) { try { top.postMessage({ lh: 'page', file: me, state: state }, '*'); } catch (e) {} }
    var stickTabs = [].filter.call(document.querySelectorAll('.tabs'), function (t) { return getComputedStyle(t).position === 'sticky'; });
    var onScroll = function () {
      root.classList.toggle('is-scrolled', scrollY > 8);
      stickTabs.forEach(function (t) { t.classList.toggle('is-stuck', t.getBoundingClientRect().top <= parseFloat(getComputedStyle(t).top) + 1); });   // a pinned tab row hides the content scrolling above it
    };   // top bar gets its glass only once content is under it
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-toggle]');
      if (t) t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true'));
      var chk = e.target.closest('[data-check]');
      if (chk) chk.setAttribute('aria-checked', String(chk.getAttribute('aria-checked') !== 'true'));
      var rad = e.target.closest('[data-radio]');
      if (rad) (rad.closest('[role="radiogroup"]') || rad.parentElement).querySelectorAll('[data-radio]').forEach(function (x) { x.setAttribute('aria-checked', String(x === rad)); });
      var sw = e.target.closest('.switch');
      if (sw) sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
      var seg = e.target.closest('.seg > button');
      if (seg) seg.parentElement.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === seg)); });
      var tab = e.target.closest('[role="tab"]');
      if (tab) {
        tab.parentElement.querySelectorAll('[role="tab"]').forEach(function (x) { x.setAttribute('aria-selected', String(x === tab)); });
        var panel = tab.getAttribute('aria-controls') && document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.parentElement.querySelectorAll(':scope > [role="tabpanel"]').forEach(function (x) { x.hidden = x !== panel; });
      }
      var more = e.target.closest('[data-more]');
      if (more) { var cap = more.closest('.fcard-cap'), open = cap.dataset.open !== 'true'; cap.dataset.open = open; more.textContent = open ? 'less' : 'more'; more.setAttribute('aria-expanded', open); }
      var tst = e.target.closest('[data-toast]');
      if (tst) { var parts = tst.dataset.toast.split('|'); toast(parts[0], parts[1] || '', parts[2] || ''); }
      var op = e.target.closest('[data-open]');
      if (op) {
        e.preventDefault();
        if (op.hasAttribute('data-replace') && isOverlay) { root.classList.add('is-closing'); setTimeout(function () { parent.postMessage({ lh: 'replace', file: op.dataset.open, state: op.dataset.openState }, '*'); }, ms('--modal-close-dur')); }
        else openLayer(op.dataset.open, op, op.dataset.openState);
        return;
      }
      var gs = e.target.closest('[data-go-state]');
      if (gs && gs.hasAttribute('data-inplace')) {     // slides: content marked data-fade fades out, the state switches in place, the new content fades in
        e.preventDefault(); if (gs.dataset.goState === state || root.classList.contains('is-fade-out')) return;
        var lab = gs.getAttribute('aria-label'), order = [].map.call(document.querySelectorAll('[data-current-for]'), function (x) { return x.dataset.currentFor; });
        root.dataset.dir = order.indexOf(gs.dataset.goState) < order.indexOf(state) ? 'back' : 'fwd';   // which way the content travels
        root.classList.add('is-fade-out');
        setTimeout(function () {
          show(gs.dataset.goState); root.classList.remove('is-fade-out');
          if (!gs.offsetParent && lab) { var t = [].filter.call(document.querySelectorAll('[aria-label="' + lab + '"]'), function (x) { return x.offsetParent && !x.disabled; })[0] || document.querySelector('[data-inplace]:not([hidden]):not(:disabled)'); if (t) t.focus({ preventScroll: true }); }
        }, ms('--duration-quick'));
        return;
      }
      if (gs && gs.hasAttribute('data-check')) {       // a selection switches state in place: the tick animates on the tapped option, then the matching state takes over unseen
        e.preventDefault(); if (root.classList.contains('is-swapping')) return;
        root.classList.add('is-swap', 'is-swapping');
        setTimeout(function () {
        root.classList.remove('is-swapping'); gs.setAttribute('aria-checked', String(gs.getAttribute('aria-checked') !== 'true'));
        var at = [].indexOf.call(gs.parentElement.children, gs); show(gs.dataset.goState);
        var grp = document.querySelector('main:not([hidden]) [role="group"]'); if (grp && grp.children[at]) grp.children[at].focus({ preventScroll: true });
        }, ms('--select-check-fill') + ms('--select-check-mark') + ms('--select-check-delay'));
        return;
      }
      if (gs) { e.preventDefault(); go(me + carry({ state: gs.dataset.goState })); return; }
      var link = e.target.closest('a[data-href]');
      if (link) { e.preventDefault(); var ex = {}; if (link.dataset.state) ex.state = link.dataset.state; if (link.dataset.as) ex.role = link.dataset.as; go(link.dataset.href + carry(ex)); return; }   // data-state opens the target in that state; data-as opens it as that role (profile type)
      var cl = e.target.closest('[data-close]');
      if (cl) { e.preventDefault(); closeSelf(cl.dataset.close === 'all'); return; }
      if (e.target.closest('[data-back]')) { e.preventDefault(); if (isOverlay) closeSelf(); else history.length > 1 ? history.back() : null; }
    });
    return;
  }

  /* ---------------------------------------------------------------- board */
  var saved = new URLSearchParams(location.hash.slice(1));
  var cur = { theme: saved.get('theme') || 'light', state: saved.get('state') || lists.state[0], role: saved.get('role') || lists.role[0] || '', zoom: saved.get('zoom') || '50' };
  var frames = [['Mobile', 375, 812], ['Tablet', 768, 1024], ['Desktop', 1440, 900]];
  var bar = document.createElement('div'); bar.className = 'mk-bar';
  var wrap = document.createElement('div'); wrap.className = 'mk-frames';
  bar.innerHTML = '<h1 class="t-label-m">' + document.title + '</h1>';
  Object.keys(lists).forEach(function (k) {
    if (lists[k].length < 2) return;
    var g = document.createElement('div'); g.className = 'mk-group t-paragraph-s';
    g.innerHTML = '<span>' + k[0].toUpperCase() + k.slice(1) + '</span><div class="mk-seg" role="group" aria-label="' + k + '">' +
      lists[k].map(function (v) { return '<button class="t-label-xs" data-k="' + k + '" data-v="' + v + '">' + v.replace(/-/g, ' ') + (k === 'zoom' ? '%' : '') + '</button>'; }).join('') + '</div>';
    bar.appendChild(g);
  });
  frames.forEach(function (f) {
    var fig = document.createElement('figure'); fig.className = 'mk-frame';
    fig.innerHTML = '<figcaption class="t-sublabel-s">' + f[0] + ' ' + f[1] + '</figcaption><iframe title="' + f[0] + ' ' + f[1] + '" width="' + f[1] + '" height="' + f[2] + '"></iframe>';
    wrap.appendChild(fig);
  });
  body.prepend(bar, wrap);
  function render() {
    root.dataset.theme = cur.theme;
    wrap.style.zoom = cur.zoom / 100;
    var src = location.href.split(/[?#]/)[0] + '?embed=1&theme=' + cur.theme + '&state=' + cur.state + '&role=' + cur.role;
    wrap.querySelectorAll('iframe').forEach(function (i) { if (i.dataset.src !== src) { i.dataset.src = src; i.src = src; } });
    bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(cur[b.dataset.k] === b.dataset.v)); });
    history.replaceState(null, '', '#' + new URLSearchParams(cur));
  }
  bar.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (b) { cur[b.dataset.k] = b.dataset.v; render(); } });
  render();
})();

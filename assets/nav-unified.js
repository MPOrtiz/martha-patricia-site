(function () {
  function lang() {
    if (typeof window.currentLang === 'string') return window.currentLang;
    return (document.documentElement.lang || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  }
  var labels = {
    es: ['Vista general','Perfil','Trayectoria','Capacidades','Beyond the Desk'],
    en: ['Overview','Profile','Journey','Capabilities','Beyond the Desk']
  };
  var hrefs = ['/sobre-mi/','/sobre-mi/#perfil','/sobre-mi/#trayectoria','/sobre-mi/#capacidades','/sobre-mi/#en-movimiento'];

  function fillMenu(menu) {
    var chosen = labels[lang()] || labels.es;
    menu.innerHTML = hrefs.map(function(href, i) {
      return '<a href="' + href + '"><span class="mp-menu-label">' + chosen[i] + '</span><span class="sub-arrow">→</span></a>';
    }).join('');
  }

  function closeMenu(dropdown, trigger) {
    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded','false');
  }

  function enhance() {
    var navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    var dropdown = navLinks.querySelector('.nav-dropdown, .mp-about-dropdown');
    var trigger, menu;

    if (dropdown) {
      dropdown.classList.add('mp-about-dropdown');
      trigger = dropdown.querySelector('.nav-dropdown-trigger, .mp-about-trigger, #aboutDropdownBtn');
      menu = dropdown.querySelector('.nav-dropdown-menu, .mp-about-menu, #aboutDropdownMenu');
      if (trigger) {
        trigger.classList.add('mp-about-trigger');
        trigger.removeAttribute('onclick');
        trigger.setAttribute('type','button');
      }
      if (menu) menu.classList.add('mp-about-menu');
    } else {
      var aboutLink = Array.prototype.find.call(navLinks.querySelectorAll('a.nav-link'), function(a) {
        return (a.getAttribute('href') || '').indexOf('/sobre-mi') !== -1;
      });
      if (!aboutLink) return;
      dropdown = document.createElement('div');
      dropdown.className = 'nav-dropdown mp-about-dropdown';
      dropdown.id = 'navAboutDropdown';
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = 'aboutDropdownBtn';
      trigger.className = 'nav-dropdown-trigger mp-about-trigger' + (aboutLink.classList.contains('is-active') ? ' is-active' : '');
      trigger.setAttribute('aria-haspopup','true');
      trigger.setAttribute('aria-expanded','false');
      trigger.innerHTML = '<span data-i18n="nav.about">' + (aboutLink.textContent.trim() || 'Sobre mí') + '</span><span class="chevron">▾</span>';
      menu = document.createElement('div');
      menu.id = 'aboutDropdownMenu';
      menu.className = 'nav-dropdown-menu mp-about-menu';
      dropdown.appendChild(trigger); dropdown.appendChild(menu);
      aboutLink.replaceWith(dropdown);

      trigger.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        var open = dropdown.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) closeMenu(dropdown, trigger);
      });
    }

    if (!trigger || !menu) return;
    fillMenu(menu);

    // Existing About page already owns the trigger click handler. For other pages it was added above.
    menu.addEventListener('click', function() {
      closeMenu(dropdown, trigger);
      var navToggle = document.getElementById('navToggle');
      navLinks.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded','false');
    });

    // Refresh submenu labels after the site's language toggle changes currentLang.
    var langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.addEventListener('click', function() { setTimeout(function(){ fillMenu(menu); }, 0); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
})();

/* ───────── Servicios ▾ : menú desplegable con los 6 servicios (todas las páginas) ───────── */
(function () {
  function lang() {
    if (typeof window.currentLang === 'string') return window.currentLang;
    return (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  }
  var ICON = {
    s0: '<path d="M5 12h14M5 6h14M5 18h9"/>',
    s1: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6.5L15.5 11M8.5 17.5L15.5 13"/>',
    s2: '<path d="M6 20V12M12 20V5M18 20v-9"/>',
    s3: '<path d="M3 17l6-6 4 4 8-8"/>',
    s4: '<path d="M4 20l1.5-4A8 8 0 1 1 9 19z"/>',
    s5: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 10v10"/>'
  };
  var COLOR = { s0: '#37352F', s1: '#0E9F75', s2: '#F2B705', s3: '#2F5BFF', s4: '#25D366', s5: '#1E3FD9' };
  var ITEMS = [
    { k: 's0', href: '/enfoque/',
      es: ['Estrategia', 'Qué hacer primero: diagnóstico, prioridades y hoja de ruta.'],
      en: ['Strategy', 'What to do first: diagnosis, priorities and roadmap.'] },
    { k: 's1', href: '/soluciones/#card-integrar',
      es: ['Ingeniería de datos', 'Tus sistemas conectados y tus datos limpios, cada día.'],
      en: ['Data engineering', 'Your systems connected and your data clean, every day.'] },
    { k: 's2', href: '/soluciones/#card-entender',
      es: ['Analítica & BI', 'Tableros e indicadores que se actualizan solos.'],
      en: ['Analytics & BI', 'Dashboards and KPIs that update themselves.'] },
    { k: 's3', href: '/soluciones/#card-anticipar',
      es: ['Ciencia de datos', 'Pronósticos y modelos que explican tus resultados.'],
      en: ['Data science', 'Forecasts and models that explain your results.'] },
    { k: 's4', href: '/soluciones/#card-automatizar',
      es: ['Agentes de IA', 'Agentes y automatizaciones que avisan y ejecutan.'],
      en: ['AI agents', 'Agents and automations that alert and act.'] },
    { k: 's5', href: '/soluciones/#software',
      es: ['Software a la medida', 'Plataformas para operar: pedidos, clientes, inventario.'],
      en: ['Custom software', 'Platforms to run your operation: orders, customers, inventory.'] }
  ];
  var LABEL = { es: ['Servicios', 'Ver todos los servicios'], en: ['Services', 'See all services'] };

  function fill(trigger, menu) {
    var L = lang();
    trigger.querySelector('.mp-svc-label').textContent = LABEL[L][0];
    menu.innerHTML = '<div class="mp-svc-grid">' + ITEMS.map(function (it) {
      var t = it[L] || it.es;
      return '<a href="' + it.href + '" class="mp-svc-item"><span class="mp-svc-ico" style="background:' + COLOR[it.k] + '"><svg viewBox="0 0 24 24"' + (it.k === 's2' ? ' style="stroke:#3B2F00"' : '') + '>' + ICON[it.k] + '</svg></span>' +
        '<span class="mp-svc-txt"><b>' + t[0] + '</b><small>' + t[1] + '</small></span></a>';
    }).join('') + '</div><a class="mp-svc-all" href="/soluciones/">' + LABEL[L][1] + ' <span>→</span></a>';
  }

  function build() {
    var navLinks = document.getElementById('navLinks');
    if (!navLinks || navLinks.querySelector('.mp-svc-dropdown')) return;
    var link = Array.prototype.find.call(navLinks.querySelectorAll('a.nav-link'), function (a) {
      return (a.getAttribute('href') || '').indexOf('/soluciones') === 0;
    });
    if (!link) return;
    var dd = document.createElement('div');
    dd.className = 'nav-dropdown mp-svc-dropdown';
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-dropdown-trigger mp-svc-trigger' + (location.pathname.indexOf('/soluciones') === 0 ? ' is-active' : '');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="mp-svc-label">Servicios</span><span class="chevron">▾</span>';
    var menu = document.createElement('div');
    menu.className = 'nav-dropdown-menu mp-svc-menu';
    dd.appendChild(trigger); dd.appendChild(menu);
    link.replaceWith(dd);
    fill(trigger, menu);

    function close() { dd.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }
    trigger.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var open = dd.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    menu.addEventListener('click', function (e) {
      if (!e.target.closest('a')) return;
      close();
      var t = document.getElementById('navToggle');
      navLinks.classList.remove('open');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    var lt = document.getElementById('langToggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(function () { fill(trigger, menu); }, 0); });
    new MutationObserver(function () { fill(trigger, menu); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

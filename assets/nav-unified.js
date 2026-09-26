(function () {
  function lang() {
    if (typeof window.currentLang === 'string') return window.currentLang;
    return (document.documentElement.lang || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  }
  var labels = {
    es: ['Vista general','Hoy','Perspectiva','Trayectoria','Experiencia','Tecnología','Formación','Beyond the Desk'],
    en: ['Overview','Today','Perspective','Journey','Experience','Technology','Education','Beyond the Desk']
  };
  var hrefs = ['/sobre-mi/','/sobre-mi/#hoy','/sobre-mi/#perspectiva','/sobre-mi/#trayectoria','/sobre-mi/#experiencia','/sobre-mi/#tecnologia','/sobre-mi/#formacion','/sobre-mi/#en-movimiento'];

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

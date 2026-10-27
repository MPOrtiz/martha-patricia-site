/* =========================================================
   Privacidad + Google Analytics 4 (G-2WGSBP2C3C)
   - Banner de cookies (modelo de aviso con opción de rechazo)
   - Enlaces "Preferencias de cookies" [data-cookie-settings]
   - Textos bilingües [data-pv-es] / [data-pv-en]
   - Eventos GA4: contacto (WhatsApp, correo, teléfono),
     redes (LinkedIn, Kaggle) y envío de formularios.
   Nunca se envían a GA datos personales (nombre, correo, etc.).
   ========================================================= */
(function () {
  var GA_ID = window.MP_GA_ID || 'G-2WGSBP2C3C';
  var KEY = 'mp-analytics-consent';
  var PRIVACY_URL = '/aviso-de-privacidad/';

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function isEn() {
    var l = (document.documentElement.lang || '').toLowerCase();
    if (l.indexOf('en') === 0) return true;
    if (l.indexOf('es') === 0) return false;
    try { return localStorage.getItem('mp-lang') === 'en'; } catch (e) { return false; }
  }
  function gtagSafe() { if (typeof window.gtag === 'function') window.gtag.apply(null, arguments); }

  /* ---------- Consentimiento ---------- */
  function grant() {
    setChoice('granted');
    window['ga-disable-' + GA_ID] = false;
    gtagSafe('consent', 'update', { analytics_storage: 'granted' });
    if (!window.MP_GA_CONFIGURED) {
      gtagSafe('js', new Date());
      gtagSafe('config', GA_ID);
      window.MP_GA_CONFIGURED = true;
    }
  }
  function deny() {
    setChoice('denied');
    gtagSafe('consent', 'update', { analytics_storage: 'denied' });
    window['ga-disable-' + GA_ID] = true;
    // Elimina cookies de Google Analytics existentes
    var host = location.hostname, parts = host.split('.'), domains = ['', host];
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    domains.push('.' + host);
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name === '_gat') {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  /* ---------- Banner ---------- */
  var TXT = {
    es: {
      eyebrow: 'COOKIES',
      body: 'Uso cookies de Google Analytics para medir de forma agregada cómo se usa este sitio. No se usan con fines publicitarios. Puedes rechazarlas cuando quieras.',
      more: 'Aviso de privacidad',
      accept: 'Aceptar',
      reject: 'Rechazar'
    },
    en: {
      eyebrow: 'COOKIES',
      body: 'I use Google Analytics cookies to measure, in aggregate, how this site is used. They are not used for advertising. You can decline them at any time.',
      more: 'Privacy notice',
      accept: 'Accept',
      reject: 'Decline'
    }
  };
  var banner;
  function renderBanner() {
    var t = TXT[isEn() ? 'en' : 'es'];
    banner.innerHTML =
      '<p class="mp-cookie-eyebrow"><span class="mp-cookie-dot"></span>' + t.eyebrow + '</p>' +
      '<p class="mp-cookie-body">' + t.body + ' <a href="' + PRIVACY_URL + '#cookies">' + t.more + ' →</a></p>' +
      '<div class="mp-cookie-actions">' +
      '<button type="button" class="mp-cookie-btn mp-cookie-reject" data-mp-choice="denied">' + t.reject + '</button>' +
      '<button type="button" class="mp-cookie-btn mp-cookie-accept" data-mp-choice="granted">' + t.accept + '</button>' +
      '</div>';
  }
  function showBanner() {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'mp-cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-live', 'polite');
      banner.setAttribute('aria-label', 'Cookies');
      banner.addEventListener('click', function (e) {
        var b = e.target.closest('[data-mp-choice]');
        if (!b) return;
        if (b.getAttribute('data-mp-choice') === 'granted') grant(); else deny();
        hideBanner();
      });
      document.body.appendChild(banner);
    }
    renderBanner();
    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add('is-visible'); });
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(function () { if (banner) banner.hidden = true; }, 250);
  }

  /* ---------- Textos bilingües ---------- */
  function applyLang() {
    var en = isEn();
    document.querySelectorAll('[data-pv-es]').forEach(function (el) {
      var html = el.getAttribute(en ? 'data-pv-en' : 'data-pv-es');
      if (html != null && el.innerHTML !== html) el.innerHTML = html;
    });
    document.querySelectorAll('[data-pv-show]').forEach(function (el) {
      el.hidden = el.getAttribute('data-pv-show') !== (en ? 'en' : 'es');
    });
    if (banner && !banner.hidden) renderBanner();
  }

  /* ---------- Eventos GA4 ---------- */
  function linkLocation(el) {
    if (el.closest('footer')) return 'footer';
    if (el.closest('nav')) return 'nav';
    if (el.closest('form')) return 'form';
    return 'body';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) {
      var s = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (s) { e.preventDefault(); showBanner(); }
      return;
    }
    if (a.hasAttribute('data-cookie-settings')) { e.preventDefault(); showBanner(); return; }
    var href = a.getAttribute('href') || '';
    var loc = linkLocation(a);
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
      gtagSafe('event', 'contact_click', { method: 'whatsapp', link_location: loc });
    } else if (/^mailto:/i.test(href)) {
      gtagSafe('event', 'contact_click', { method: 'email', link_location: loc });
    } else if (/^tel:/i.test(href)) {
      gtagSafe('event', 'contact_click', { method: 'phone', link_location: loc });
    } else if (/linkedin\.com/i.test(href)) {
      gtagSafe('event', 'social_click', { network: 'linkedin', link_location: loc });
    } else if (/kaggle\.com/i.test(href)) {
      gtagSafe('event', 'social_click', { network: 'kaggle', link_location: loc });
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM') return;
    var name = f.getAttribute('name') || f.id || 'form';
    var params = { form_name: name, page_path: location.pathname };
    if (f.topic && f.topic.value) params.contact_topic = f.topic.value;
    gtagSafe('event', 'generate_lead', params);
  }, true);

  /* ---------- Init ---------- */
  function init() {
    applyLang();
    new MutationObserver(applyLang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if (!getChoice()) showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MPPrivacy = { open: showBanner, grant: grant, deny: deny };
})();

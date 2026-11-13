/* Hero del inicio: traducciones de los elementos nuevos + cintillo de clientes.
   Clientes: deja el logo (png, svg, webp o jpg, idealmente con fondo transparente) en /clientes.
   En cada deploy, scripts/build-clientes.js regenera content/clientes.json.
   Con menos de MIN_MARQUEE logos se muestran fijos; a partir de ahí desfilan solos. */
(function () {
  var MIN_MARQUEE = 4;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = function () { return document.documentElement.lang === 'en' ? 'en' : 'es'; };
  var esc = function (v) { return String(v || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  /* ---------- Textos ES/EN (atributos data-es / data-en) ---------- */
  function translate() {
    var L = lang();
    document.querySelectorAll('#top [data-es]').forEach(function (el) {
      var t = el.getAttribute('data-' + L) || el.getAttribute('data-es');
      if (el.textContent !== t) el.textContent = t;
    });
  }

  /* ---------- Cintillo de clientes ---------- */
  var band = document.getElementById('mpClients');
  var track = band && band.querySelector('.mp-clients-track');
  function renderClients(logos) {
    if (!band || !track) return;
    logos = (logos || []).filter(function (l) { return l && l.src; });
    var hero = document.getElementById('top');
    if (!logos.length) { band.hidden = true; if (hero) hero.classList.remove('mp-has-clients'); return; }
    var one = logos.map(function (l) {
      return '<span class="mp-client"><img src="' + esc(l.src) + '" alt="' + esc(l.name) + '" loading="lazy" decoding="async" onerror="this.parentElement.remove()"></span>';
    }).join('');
    var moving = logos.length >= MIN_MARQUEE && !reduced;
    track.innerHTML = moving ? one + one : one;
    band.classList.toggle('is-moving', moving);
    track.style.animationDuration = Math.max(24, logos.length * 6) + 's';
    band.hidden = false;
    if (hero) hero.classList.add('mp-has-clients');
  }
  if (band) {
    fetch('/content/clientes.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { renderClients(d.logos); })
      .catch(function () { band.hidden = true; });
  }

  translate();
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

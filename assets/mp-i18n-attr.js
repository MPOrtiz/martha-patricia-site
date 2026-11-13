/* Traducción simple por atributos: cualquier elemento con data-en="…" muestra ese texto
   cuando el sitio está en inglés y vuelve al español original al regresar a ES.
   Se usa en las páginas de servicio (/servicios/…). */
(function () {
  function lang() {
    return (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  }
  function apply() {
    var L = lang();
    var els = document.querySelectorAll('[data-en]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.getAttribute('data-es-orig') === null) el.setAttribute('data-es-orig', el.innerHTML);
      var v = L === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es-orig');
      if (v !== null && el.innerHTML !== v) el.innerHTML = v;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

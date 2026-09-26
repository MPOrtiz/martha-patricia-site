/* Traducción ES/EN de los textos que el diccionario de cada página no cubría.
   Se activa con el mismo interruptor de idioma (html[lang]) y restaura el español al volver. */
(function(){
  'use strict';
  var MAP={
    "Escribir por WhatsApp ↗":"Write on WhatsApp ↗",
    "¿Prefieres WhatsApp?":"Prefer WhatsApp?",
    "Escribirme por WhatsApp ↗":"Message me on WhatsApp ↗",
    "Conectamos estrategia, datos y tecnología para transformar retos complejos en soluciones reales y medibles.":"We connect strategy, data and technology to turn complex challenges into real, measurable solutions.",
    "Sobre mí":"About me",
    "Teléfono":"Phone",
    "5+ años":"5+ years",
    "Data Science · Analytics · Consultoría":"Data Science · Analytics · Consulting",
    "Del problema a la recomendación":"From problem to recommendation",
    "DOE · causa raíz · mejora continua":"DOE · root cause · continuous improvement",
    "Stack aplicado a soluciones analíticas":"Stack applied to analytics solutions",
    "Modelos y análisis orientados a decisión.":"Models and analysis built for decisions.",
    "Proyectos analíticos desde el planteamiento del problema hasta la recomendación. Modelos de churn, propensión y riesgo interpretados con SHAP, pipelines reproducibles en AWS y dbt, y marcos de KPIs para conectar resultados analíticos con estrategia.":"Analytics projects from problem framing to recommendation. Churn, propensity and risk models interpreted with SHAP, reproducible pipelines on AWS and dbt, and KPI frameworks that connect analytical results with strategy.",
    "Churn, propensión y riesgo":"Churn, propensity and risk",
    "Explorar, validar y aterrizar oportunidades.":"Explore, validate and land opportunities.",
    "Dirección de equipos multidisciplinarios, modelado financiero y exploración de oportunidades con base en datos. Uso de EDA y experimentación basada en hipótesis para validar propuestas de valor y conectar análisis con decisiones de negocio.":"Leading multidisciplinary teams, financial modeling and data-driven exploration of opportunities. EDA and hypothesis-based experimentation to validate value propositions and connect analysis with business decisions.",
    "Experimentación por hipótesis":"Hypothesis-based experimentation",
    "Aplicación de Six Sigma, DOE, monitoreo estadístico y análisis de causa raíz en contextos de alta exigencia operativa. Mejora continua enfocada en reducir variabilidad y elevar la calidad del proceso.":"Applying Six Sigma, DOE, statistical monitoring and root-cause analysis in highly demanding operational settings. Continuous improvement focused on reducing variability and raising process quality.",
    "Causa raíz":"Root cause",
    "Comunidad · México · 2026":"Community · Mexico · 2026",
    "Escríbeme ↗":"Write to me ↗",
    "Respuesta en aprox. 2 días hábiles":"Reply in approx. 2 business days",
    "Asesoría / Estrategia":"Advisory / Strategy",
    "Colaboración":"Collaboration",
    "¿Qué destacarías de trabajar conmigo?":"What would you highlight about working with me?",
    "Menú":"Menu",
    "GRACIAS":"THANK YOU",
    "Volver al inicio →":"Back to home →",
    "Gracias por compartir tu experiencia.":"Thank you for sharing your experience.",
    "Recibí tu reseña. La revisaré antes de publicarla y únicamente aparecerá en el sitio si cuenta con tu autorización.":"I received your review. I will read it before publishing it, and it will only appear on the site if you have authorized it."
  };
  var norm=function(s){return s.replace(/\s+/g,' ').trim()};
  var REV={};Object.keys(MAP).forEach(function(k){REV[MAP[k]]=k});
  var orig=new WeakMap();
  function isEN(){
    if((document.documentElement.lang||'').toLowerCase().indexOf('en')===0)return true;
    if(document.querySelector('.lang-toggle,.lang-toggle-text'))return false;
    try{return localStorage.getItem('mp-lang')==='en'}catch(e){return false}
  }
  function apply(){
    var en=isEN();
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode())){
      var p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName))continue;
      var t=norm(n.nodeValue);if(t.length<3)continue;
      var lead=(n.nodeValue.match(/^\s*/)||[''])[0],trail=(n.nodeValue.match(/\s*$/)||[''])[0];
      if(en&&MAP[t]!==undefined){orig.set(n,n.nodeValue);n.nodeValue=lead+MAP[t]+trail}
      else if(!en&&REV[t]!==undefined&&orig.has(n)){n.nodeValue=orig.get(n);orig.delete(n)}
    }
    document.querySelectorAll('[placeholder],[aria-label]').forEach(function(e){
      ['placeholder','aria-label'].forEach(function(a){
        var v=e.getAttribute(a);if(!v)return;
        var k='_es_'+a;
        if(en&&MAP[v]!==undefined){e['_es_'+a]=v;e.setAttribute(a,MAP[v])}
        else if(!en&&e[k]!==undefined){e.setAttribute(a,e[k]);delete e[k]}
      });
    });
  }
  var t=0;function later(){clearTimeout(t);t=setTimeout(apply,80)}
  function init(){
    apply();
    new MutationObserver(later).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.lang-toggle,.lang-toggle-text,[data-lang-toggle]'))setTimeout(apply,250)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.addEventListener('load',function(){setTimeout(apply,300)});
})();

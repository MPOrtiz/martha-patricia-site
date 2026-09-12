(function(){
  var dataCache = null;
  function lang(){ return (typeof window.currentLang === 'string' ? window.currentLang : 'es'); }
  function pick(obj,key){ var v=obj[key+'_'+lang()]; return (v===undefined || v===null || v==='') ? (obj[key+'_es'] || '') : v; }
  function esc(s){ return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function render(data){
    dataCache=data;
    var e=document.getElementById('reviewsEyebrow'), h=document.getElementById('reviewsHeadline'), i=document.getElementById('reviewsIntro'), c=document.getElementById('reviewsCta'), grid=document.getElementById('reviewsGrid'), empty=document.getElementById('reviewsEmpty');
    if(!grid) return;
    if(e) e.textContent=pick(data,'eyebrow'); if(h) h.textContent=pick(data,'headline'); if(i) i.textContent=pick(data,'intro'); if(c) c.firstChild.nodeValue=pick(data,'cta')+' ';
    var items=(data.items||[]).filter(function(x){return x.visible!==false;});
    if(!items.length){ grid.innerHTML=''; grid.style.display='none'; if(empty){empty.style.display='block';empty.textContent=lang()==='es'?'Esta sección se construye con experiencias reales. Las reseñas se publican únicamente con autorización.':'This section is built from real experiences. Testimonials are published only with permission.';} return; }
    if(empty) empty.style.display='none'; grid.style.display='grid';
    grid.innerHTML=items.map(function(x){
      var role=pick(x,'role'), rel=pick(x,'relationship'), quote=pick(x,'quote');
      var meta=[role,x.company||''].filter(Boolean).join(' · ');
      var link=x.linkedin?'<a class="review-link" href="'+esc(x.linkedin)+'" target="_blank" rel="noopener">LinkedIn ↗</a>':'';
      return '<article class="review-card"><div class="review-quote-mark">“</div><p class="review-quote">'+esc(quote)+'</p><div class="review-person">'+esc(x.name)+'</div>'+(meta?'<div class="review-meta">'+esc(meta)+'</div>':'')+(rel?'<div class="review-rel">'+esc(rel)+'</div>':'')+link+'</article>';
    }).join('');
  }
  fetch('/content/resenas.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error();return r.json();}).then(render).catch(function(){var empty=document.getElementById('reviewsEmpty');if(empty){empty.style.display='block';empty.textContent='';}});
  var lt=document.getElementById('langToggle'); if(lt) lt.addEventListener('click',function(){setTimeout(function(){if(dataCache)render(dataCache);},0);});
})();

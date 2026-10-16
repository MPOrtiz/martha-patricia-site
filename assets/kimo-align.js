/* MARTHA PATRICIA · alineación con KIMO — clasificación de secciones (ritmo claro/oscuro)
   y onda senoidal con bolitas alrededor de la línea (Enfoque), basada en makeFlowWaves de KIMO. */
(function(){
  'use strict';
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 ───── Ritmo de secciones: oscura = ink con resplandor; clara alterna paper / blanco ───── */
  const DARK='radial-gradient(circle at 80% 18%,rgba(117,92,246,.17),transparent 30%),radial-gradient(circle at 12% 100%,rgba(78,123,255,.13),transparent 32%),#05070D';
  function classify(){
    const secs=[...document.querySelectorAll('body section, body footer')].filter(e=>!e.parentElement.closest('section'));
    let lastLight=false,flip=false;
    secs.forEach(el=>{
      let tone=el.dataset.mpTone;
      if(!tone){
        const c=getComputedStyle(el),m=(c.backgroundColor.match(/[\d.]+/g)||[]).map(Number),a=m.length>3?m[3]:1;
        if(a<.05) tone=(c.backgroundImage!=='none')?'dark':'light';
        else tone=((.299*m[0]+.587*m[1]+.114*m[2])/255<.42)?'dark':'light';
      }
      el.classList.remove('mp-dark','mp-light','mp-paper','mp-white');
      const keep=el.classList.contains('mp-keep');const setBg=v=>{if(!keep)el.style.setProperty('background',v,'important')};
      if(tone==='dark'){el.classList.add('mp-dark');lastLight=false;flip=false;
        if(!el.classList.contains('mp-hero')||true) setBg(DARK);}
      else{
        el.classList.add('mp-light',flip?'mp-white':'mp-paper');
        setBg(flip?'#FCFDFE':'#F3F6FA');
        flip=!flip;lastLight=true;
      }
    });
    document.documentElement.classList.add('mp-aligned');
  }

  /* 2 ───── Onda senoidal con bolitas (Enfoque) ───── */
  const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
  const smooth=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k)};
  const GRAD=[[130,214,255],[78,123,255],[169,139,255]];              // sobre fondo oscuro: celeste → azul → violeta
  const gcol=u=>{const k=u<.5?u/.5:(u-.5)/.5,a=GRAD[u<.5?0:1],b=GRAD[u<.5?1:2];return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]};
  const CHAOS=[[78,123,255],[117,92,246],[87,216,232],[114,229,192],[169,139,255]];

  function makeWave(tl){
    if(tl.querySelector('.mp-wave'))return;
    const grid=tl.querySelector('.process-timeline-grid');if(!grid)return;
    const wrap=document.createElement('div');wrap.className='mp-wave';wrap.setAttribute('aria-hidden','true');
    const canvas=document.createElement('canvas');wrap.appendChild(canvas);tl.insertBefore(wrap,tl.firstChild);
    const ctx=canvas.getContext('2d');
    let W=1,H=1,DPR=1,t=0,active=false,path=[],total=1,lines=[],dots=[];
    function build(){
      active=getComputedStyle(wrap).display!=='none';if(!active)return;
      const r=wrap.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);
      DPR=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
      // la onda pasa por la parte alta de las 5 tarjetas: 2.5 ciclos a lo ancho
      const cy=H*.56,amp=Math.min(30,H*.16);path=[];let acc=0,px=0,py=0;
      for(let k=0;k<=240;k++){const u=k/240,x=W*.03+u*W*.94,y=cy+Math.sin(u*TAU*2.5-Math.PI/2)*amp;if(k)acc+=Math.hypot(x-px,y-py);path.push({x,y,s:acc});px=x;py=y}
      total=acc||1;
      const offs=[-34,-23,-12,0,12,23,34];
      lines=offs.map(o=>({o,wob:rand(4,11),cy:rand(1.2,2.6),ph:rand(0,TAU),sp:rand(.25,.6)}));
      const n=Math.round(clamp(W/15,40,96));
      dots=Array.from({length:n},()=>({k:(Math.random()*lines.length)|0,u:Math.random(),spd:rand(.028,.055),r0:rand(1.3,3.4),c:CHAOS[(Math.random()*CHAOS.length)|0],j:rand(4,13),ph:rand(0,TAU),fq:rand(.5,1.4)}));
    }
    const q={x:0,y:0,nx:0,ny:1};
    function at(u){
      const target=u*total;let lo=0,hi=path.length-1;
      while(lo<hi-1){const m=(lo+hi)>>1;if(path[m].s<target)lo=m;else hi=m}
      const a=path[lo],b=path[hi],span=(b.s-a.s)||1,k=clamp((target-a.s)/span,0,1);
      q.x=a.x+(b.x-a.x)*k;q.y=a.y+(b.y-a.y)*k;
      const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;q.nx=-dy/l;q.ny=dx/l;
    }
    // abierto y desordenado a la izquierda, unido sobre la línea a la derecha
    const lat=(L,u)=>{const conv=1-smooth(0,.78,u);return (L.o+L.wob*Math.sin(u*TAU*L.cy+L.ph+t*L.sp))*conv};
    function step(dt){t+=dt;if(active)for(const d of dots){d.u+=dt*d.spd;if(d.u>=1){d.u-=1;d.k=(Math.random()*lines.length)|0;d.c=CHAOS[(Math.random()*CHAOS.length)|0]}}}
    function draw(){
      if(!active)return;
      ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.lineJoin='round';ctx.lineCap='round';
      // corrientes tenues
      lines.forEach(L=>{
        if(Math.abs(L.o)<1)return;
        ctx.beginPath();
        for(let s=0;s<=110;s++){const u=s/110;at(u);const o=lat(L,u);const x=q.x+q.nx*o,y=q.y+q.ny*o;if(s)ctx.lineTo(x,y);else ctx.moveTo(x,y)}
        ctx.strokeStyle='rgb(110,140,255)';ctx.lineWidth=.9;ctx.globalAlpha=.12+.07*(1-Math.abs(L.o)/46);ctx.stroke();
      });
      // línea principal con degradado
      ctx.globalAlpha=.9;ctx.lineWidth=2;
      const lg=ctx.createLinearGradient(path[0].x,0,path[path.length-1].x,0);
      lg.addColorStop(0,'rgba(130,214,255,.55)');lg.addColorStop(.5,'rgba(78,123,255,.95)');lg.addColorStop(1,'rgba(169,139,255,.95)');
      ctx.strokeStyle=lg;ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
      // bolitas alrededor de la línea
      for(const d of dots){
        const u=d.u,L=lines[d.k];at(u);
        const conv=1-smooth(0,.78,u),o=lat(L,u)+Math.sin(t*d.fq+d.ph)*d.j*conv;
        const x=q.x+q.nx*o,y=q.y+q.ny*o,ord=smooth(.25,.9,u),gc=gcol(u),r=d.r0+(2.7-d.r0)*ord;
        const col=`${(d.c[0]+(gc[0]-d.c[0])*ord)|0},${(d.c[1]+(gc[1]-d.c[1])*ord)|0},${(d.c[2]+(gc[2]-d.c[2])*ord)|0}`;
        const a=smooth(0,.06,u)*(1-smooth(.97,1,u));
        ctx.fillStyle=`rgb(${col})`;
        ctx.globalAlpha=a*.10;ctx.beginPath();ctx.arc(x,y,r*4.2,0,TAU);ctx.fill();
        ctx.globalAlpha=a*.20;ctx.beginPath();ctx.arc(x,y,r*2.2,0,TAU);ctx.fill();
        ctx.globalAlpha=a*.95;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    build();
    let raf=0,last=0,vis=true;
    const frame=now=>{raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(vis){step(dt);draw()}};
    if(reduced){t=8;for(let i=0;i<80;i++)step(.05);draw()}else raf=requestAnimationFrame(frame);
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(tl);
    new ResizeObserver(()=>{build();if(reduced)draw()}).observe(tl);
  }

  function init(){
    classify();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.addEventListener('load',classify);
})();

/* Motor de animación de KIMO (portal, estrellas, bolitas de heroes, ondas) — copiado de KIMO v12 */
/* KIMO portal system — complexity in, clarity out. */
(function(){
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

  function setupCanvas(canvas){
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(1,rect.width), h=Math.max(1,rect.height);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }

  function pointOnBezier(p0,p1,p2,p3,t){
    const u=1-t,tt=t*t,uu=u*u,uuu=uu*u,ttt=tt*t;
    return {x:uuu*p0.x+3*uu*t*p1.x+3*u*tt*p2.x+ttt*p3.x,y:uuu*p0.y+3*uu*t*p1.y+3*u*tt*p2.y+ttt*p3.y};
  }

  function makePortal(canvas, compact=false, mode="default") {
    let size=setupCanvas(canvas); let raf=0; let start=performance.now();
    const rand=mulberry32(compact?771:4611);
    const round = mode === 'home';
    let inbound=[],outbound=[],stars=[],sparkles=[];
    function build(){
      size=setupCanvas(canvas); const {w,h}=size;
      const cx=w*(compact?0.68:(round?0.72:0.71)), cy=h*0.51;
      const ry=Math.min(h*(compact?0.27:(round?0.22:0.30)),w*(compact?0.165:(round?0.12:0.17)));
      const rx=round ? ry*0.93 : ry*0.52;
      inbound=[]; outbound=[]; stars=[]; sparkles=[];
      const count=compact?34:(round?62:72);
      for(let i=0;i<count;i++){
        const sy=h*(0.08+rand()*0.84), sx=w*(-0.03+rand()*0.18);
        const ey=cy+(rand()-0.5)*ry*1.08, ex=cx-rx*0.94;
        const bend=(rand()-0.5)*h*0.46;
        inbound.push({p0:{x:sx,y:sy},p1:{x:w*(0.16+rand()*0.2),y:sy+bend},p2:{x:cx-rx*(1.4+rand()*0.55),y:cy+(rand()-0.5)*ry*1.62},p3:{x:ex,y:ey},speed:0.03+rand()*0.045,offset:rand(),r:1.5+rand()*2.8,c:i%5,tw:rand()});
      }
      const outCount=compact?18:(round?22:24);
      for(let i=0;i<outCount;i++){
        const angle=-0.30+(i/(Math.max(1,outCount-1)))*0.60;
        const sx=cx+rx*0.98, sy=cy+Math.sin(angle)*ry*0.68;
        const ex=w*(1.02+rand()*0.07), ey=cy+Math.sin(angle)*h*0.36;
        outbound.push({sx,sy,ex,ey,speed:0.048+rand()*0.032,offset:rand(),r:1.6+rand()*2.8,c:i%5});
      }
      for(let i=0;i<(compact?24:42);i++) stars.push({x:w*(0.05+rand()*0.9),y:h*(0.06+rand()*0.88),r:0.7+rand()*1.7,a:0.18+rand()*0.56,c:i%5});
      for(let i=0;i<(compact?24:52);i++){
        sparkles.push({x:w*(compact?0.36+rand()*0.55:0.35+rand()*0.6),y:h*(0.08+rand()*0.84),r:1.2+rand()*2.8,c:i%5,a:0.32+rand()*0.45,p:rand()*Math.PI*2});
      }
      canvas._kimo={cx,cy,rx,ry};
    }
    build();
    const colors=['#5b9cff','#85e7ff','#98f0d2','#9a8cff','#d9f7ff'];

    function draw(now){
      const {ctx,w,h}=size; const geo=canvas._kimo; if(!geo)return;
      const {cx,cy,rx,ry}=geo; const t=(now-start)/1000;
      ctx.clearRect(0,0,w,h);
      const wash=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry)*2.5);wash.addColorStop(0,'rgba(44,135,255,.17)');wash.addColorStop(0.4,'rgba(24,77,160,.09)');wash.addColorStop(1,'rgba(2,6,12,0)');ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);
      stars.forEach((s,i)=>{ctx.globalAlpha=s.a*(0.72+0.28*Math.sin(t*1.1+s.x));ctx.fillStyle=colors[s.c];ctx.shadowBlur=s.r*5;ctx.shadowColor=colors[s.c];ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});ctx.globalAlpha=1;

      inbound.forEach((q,i)=>{
        ctx.beginPath();ctx.moveTo(q.p0.x,q.p0.y);ctx.bezierCurveTo(q.p1.x,q.p1.y,q.p2.x,q.p2.y,q.p3.x,q.p3.y);
        ctx.strokeStyle=i%4===0?'rgba(201,243,255,.44)':i%4===1?'rgba(111,191,255,.38)':i%4===2?'rgba(151,240,214,.32)':'rgba(154,140,255,.28)';
        ctx.lineWidth=i%7===0?1.42:(i%3===0?1.0:0.76);ctx.stroke();
        for(let b=0;b<2;b++){
          const ttStatic=0.18+(((i*(b+2))%58)/100);
          const ps=pointOnBezier(q.p0,q.p1,q.p2,q.p3,Math.min(.96,ttStatic));
          ctx.globalAlpha=0.16+(b*0.08);ctx.fillStyle=colors[(q.c+b)%colors.length];ctx.beginPath();ctx.arc(ps.x,ps.y,Math.max(1,q.r*0.46),0,Math.PI*2);ctx.fill();
        }
        const tt=(t*q.speed+q.offset)%1;const p=pointOnBezier(q.p0,q.p1,q.p2,q.p3,tt);
        ctx.shadowBlur=18;ctx.shadowColor=colors[q.c];ctx.fillStyle=colors[q.c];ctx.globalAlpha=0.72+0.28*Math.sin((tt+i)*Math.PI);ctx.beginPath();ctx.arc(p.x,p.y,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;
      });

      sparkles.forEach((s,i)=>{const alpha=s.a*(0.78+0.22*Math.sin(t*1.8+s.p));ctx.globalAlpha=alpha;ctx.fillStyle=colors[s.c];ctx.shadowBlur=18;ctx.shadowColor=colors[s.c];ctx.beginPath();ctx.arc(s.x+Math.sin(t*0.4+s.p)*3,s.y+Math.cos(t*0.45+s.p)*2,s.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});ctx.globalAlpha=1;

      const ringCount = round ? 4 : 5;
      for(let j=0;j<ringCount;j++){
        ctx.save();ctx.translate(cx,cy);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx*(round ? (0.98+j*0.085) : (0.88+j*0.06)),0,Math.PI*2);ctx.restore();
        ctx.strokeStyle=round ? (j===0?'rgba(239,252,255,.96)':j===1?'rgba(130,211,255,.52)':j===2?'rgba(106,173,255,.26)':'rgba(72,132,250,.14)') : (j===0?'rgba(238,251,255,.92)':j<3?'rgba(115,193,255,.58)':'rgba(79,145,255,.24)');
        ctx.lineWidth=round ? (j===0?3.4:(j===1?1.5:.9)) : (j===0?2.65:(j===1?1.45:1.0));
        ctx.shadowBlur=round ? (j<2?18:8) : (j<2?16:7);ctx.shadowColor='#75c7ff';ctx.stroke();ctx.shadowBlur=0;
      }
      const inner=ctx.createRadialGradient(cx,cy,rx*0.04,cx,cy,ry*(round?0.9:0.7));
      if(round){
        inner.addColorStop(0,'rgba(1,4,10,.88)');inner.addColorStop(0.62,'rgba(2,8,16,.82)');inner.addColorStop(1,'rgba(31,107,204,.11)');
      }else{
        inner.addColorStop(0,'rgba(0,3,8,.99)');inner.addColorStop(0.56,'rgba(0,5,12,.95)');inner.addColorStop(1,'rgba(16,76,155,.13)');
      }
      ctx.fillStyle=inner;ctx.beginPath();ctx.ellipse(cx,cy,rx*(round?0.84:0.74),ry*(round?0.84:0.76),0,0,Math.PI*2);ctx.fill();
      const halo=ctx.createRadialGradient(cx,cy,rx*.62,cx,cy,ry*(round?1.55:1.34));
      if(round){
        halo.addColorStop(0,'rgba(175,232,255,.17)');halo.addColorStop(.38,'rgba(92,173,255,.12)');halo.addColorStop(.74,'rgba(49,108,219,.05)');halo.addColorStop(1,'rgba(44,104,210,0)');
      }else{
        halo.addColorStop(0,'rgba(160,226,255,.16)');halo.addColorStop(.34,'rgba(83,164,255,.12)');halo.addColorStop(.72,'rgba(44,104,210,.05)');halo.addColorStop(1,'rgba(44,104,210,0)');
      }
      ctx.fillStyle=halo;ctx.beginPath();ctx.ellipse(cx,cy,rx*(round?1.6:1.28),ry*(round?1.42:1.18),0,0,Math.PI*2);ctx.fill();

      outbound.forEach((q,i)=>{
        ctx.beginPath();ctx.moveTo(q.sx,q.sy);ctx.lineTo(q.ex,q.ey);ctx.strokeStyle=i%4===0?'rgba(146,238,213,.66)':i%4===1?'rgba(112,191,255,.62)':i%4===2?'rgba(168,145,255,.48)':'rgba(224,248,255,.62)';
        ctx.lineWidth=i%5===0?1.24:0.86;ctx.stroke();
        for(let b=0;b<2;b++){
          const ttStatic=0.26 + ((i+b*5)%9)*0.075;
          const xs=q.sx+(q.ex-q.sx)*ttStatic, ys=q.sy+(q.ey-q.sy)*ttStatic;
          ctx.globalAlpha=0.18+(b*0.1);ctx.fillStyle=colors[(q.c+b)%colors.length];ctx.beginPath();ctx.arc(xs,ys,Math.max(1,q.r*0.44),0,Math.PI*2);ctx.fill();
        }
        const tt=(t*q.speed+q.offset)%1;const x=q.sx+(q.ex-q.sx)*tt,y=q.sy+(q.ey-q.sy)*tt;ctx.shadowBlur=16;ctx.shadowColor=colors[q.c];ctx.fillStyle=colors[q.c];ctx.globalAlpha=0.95;ctx.beginPath();ctx.arc(x,y,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;
      });
      if(!reduced) raf=requestAnimationFrame(draw);
    }
    const ro=new ResizeObserver(()=>{build(); if(reduced) draw(performance.now())});ro.observe(canvas);
    draw(performance.now());
    return ()=>{cancelAnimationFrame(raf);ro.disconnect()};
  }
  /* ── KIMO · agujero de gusano del home ─────────────────────────────
     Versión aprobada (artefacto "del desorden al orden"): información desordenada entra al portal
     y sale ordenada. Izquierda: fragmentos sueltos sobre corrientes enredadas; al acercarse se
     alinean y uniforman. Derecha: filas de bits (trazo = 1, punto = 0) en columnas alineadas.
     Interacción: el portal sigue al puntero y se intensifica cerca; un toque lanza una onda.
     Rendimiento: brillos precalculados (sin shadowBlur), pausa fuera de pantalla,
     y un cuadro fijo si el usuario prefiere movimiento reducido. */
  function makeWormhole(canvas){
    const ctx=canvas.getContext('2d');
    const hero=canvas.closest('.kimo-home-hero')||canvas.parentElement;
    const TAU=Math.PI*2;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const rand=(a,b)=>a+Math.random()*(b-a);
    const smooth=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k)};
    const hash=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x)};

    let W=1,H=1,DPR=1,sc=1,portrait=false,inited=false;
    let baseCx=0,baseCy=0,cx=0,cy=0,rx=1,ry=1,rot=0;
    let t=0,last=0,flowA=1500,raf=0;
    let energy=1,tap=0,shocks=[],nextAuto=1.2;
    const pointer={tx:0,ty:0,x:0,y:0,mx:0,my:0,inside:false};
    let stars=[],filaments=[],bits=[],lanes=[],tunnel=[];

    /* ---------- Sprites ---------- */
    function makeSprite(rgb){
      const s=64,c=document.createElement('canvas');c.width=c.height=s;
      const g=c.getContext('2d'),gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,`rgba(${rgb},.95)`);
      gr.addColorStop(.36,`rgba(${rgb},.24)`);gr.addColorStop(1,`rgba(${rgb},0)`);
      g.fillStyle=gr;g.fillRect(0,0,s,s);return c;
    }
    const PAL=['150,200,255','110,235,230','175,145,255','255,255,255'];
    const SP=PAL.map(makeSprite);
    const PCOL=PAL.map(c=>`rgb(${c})`);
    const ORD='rgb(198,228,255)';
    const pickSprite=()=>{const r=Math.random();return r<.5?0:r<.72?1:r<.92?2:3};
    const GLOW=(()=>{
      const s=256,c=document.createElement('canvas');c.width=c.height=s;
      const g=c.getContext('2d'),gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      gr.addColorStop(0,'rgba(20,60,200,0)');gr.addColorStop(.28,'rgba(30,90,255,.06)');
      gr.addColorStop(.46,'rgba(40,120,255,.34)');gr.addColorStop(.60,'rgba(30,100,255,.14)');
      gr.addColorStop(.82,'rgba(20,70,220,.04)');gr.addColorStop(1,'rgba(10,40,160,0)');
      g.fillStyle=gr;g.fillRect(0,0,s,s);return c;
    })();
    function spr(i,x,y,size,alpha){ctx.globalAlpha=alpha;ctx.drawImage(SP[i],x-size/2,y-size/2,size,size)}

    /* ---------- Layout ---------- */
    function layout(){
      const r=canvas.getBoundingClientRect();
      W=Math.max(1,r.width);H=Math.max(1,r.height);
      DPR=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
      sc=clamp(Math.min(W,H)/800,.7,1.3);
      portrait=W<640;
      baseCx=W*(portrait?.56:.60);baseCy=H*.5;
      ry=portrait?Math.min(H*.36,W*.40):Math.min(H*.34,W*.26);
      rx=ry*.42;
      stars=Array.from({length:Math.round(W*H/9000)},()=>({x:Math.random()*W,y:Math.random()*H,r:rand(.5,1.3),p:rand(0,TAU),s:rand(.4,1.6)}));
      if(!inited){init();inited=true}
      cx=baseCx;cy=baseCy;
    }

    /* ---------- Elementos ---------- */
    const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
    function makeFilament(){
      return {sxr:Math.random(),syr:Math.random(),eyr:clamp(gauss(),-1,1),a1:rand(.03,.14),a2:rand(.005,.03),
        s1:rand(.15,.40),s2:rand(.20,.50),p1:rand(0,TAU),p2:rand(0,TAU),ch:rand(.03,.12),k:rand(.7,1.6),cp:rand(0,TAU),
        sx:0,sy:0,ex:0,ey:0,c1x:0,c1y:0,c2x:0,c2y:0};
    }
    function makeBit(initial){
      return {f:(Math.random()*filaments.length)|0,u:initial?Math.random():0,spd:rand(.7,1.3),sp:pickSprite(),
        len:rand(3,10)*sc,lw:rand(1.2,2.4),ang:rand(0,TAU),spin:rand(-1.6,1.6),J:rand(14,36)*sc,
        a1:rand(.4,1.1),a2:rand(.9,1.9),b1:rand(.4,1.1),b2:rand(.9,1.9),
        p1:rand(0,TAU),p2:rand(0,TAU),q1:rand(0,TAU),q2:rand(0,TAU),fl:rand(2,6)};
    }
    function init(){
      filaments=Array.from({length:portrait?26:40},makeFilament);
      bits=Array.from({length:Math.round(clamp(W*H/6000,80,200))},()=>makeBit(true));
      const L=portrait?22:32;
      lanes=Array.from({length:L},(_,i)=>({a:(i/(L-1))*2-1+rand(-.015,.015),ph:rand(0,TAU),tilt:rand(-.02,.02),sx:0,sy:0,ex:0,ey:0}));
      tunnel=Array.from({length:portrait?70:120},()=>({th:rand(0,TAU),z:Math.random(),spd:rand(.12,.30),r:rand(.6,1.4),sp:Math.random()<.8?0:3}));
    }

    /* ---------- Actualización ---------- */
    function updateFilaments(){
      const sxMax=Math.max(0,(cx-rx)*.55);
      for(const f of filaments){
        f.sx=-W*.05+f.sxr*(sxMax+W*.05);f.sy=-H*.05+f.syr*H*1.1;
        const dyn=f.eyr*.75;
        f.ey=cy+dyn*ry;f.ex=cx-rx*.88*Math.sqrt(1-dyn*dyn);
        const dx=f.ex-f.sx,dy=f.ey-f.sy;
        f.c1x=f.sx+dx*.42;f.c1y=f.sy+dy*.08+Math.sin(t*f.s1+f.p1)*f.a1*H;
        f.c2x=f.sx+dx*.86;f.c2y=f.ey+Math.sin(t*f.s2+f.p2)*f.a2*H;
      }
    }
    function update(dt){
      const k=Math.min(1,dt*3);
      pointer.x+=(pointer.tx-pointer.x)*k;pointer.y+=(pointer.ty-pointer.y)*k;
      cx=baseCx+pointer.x*W*.014;cy=baseCy+pointer.y*H*.02;rot=pointer.x*.05;
      let target=1;
      if(pointer.inside){
        const d=Math.hypot((pointer.mx-cx)/(rx*2.2),(pointer.my-cy)/(ry*1.3));
        target=1+.9*(1-smooth(.4,1.6,d));
      }
      target+=tap;tap=Math.max(0,tap-dt*1.2);
      energy+=(target-energy)*Math.min(1,dt*2.5);
      t+=dt;flowA+=dt*energy*95*sc;
      if(t>nextAuto){shocks.push(t);nextAuto=t+rand(5,7)}
      while(shocks.length&&t-shocks[0]>3)shocks.shift();
      updateFilaments();
      for(const b of bits){
        const o=smooth(.3,.95,b.u),sp=b.spd+(1-b.spd)*o;
        b.u+=dt*energy*sp*(.08+.10*b.u*b.u);
        if(b.u>=1)Object.assign(b,makeBit(false));
      }
      const fan=portrait?H*.36:H*.42;
      for(const l of lanes){
        const q=l.a*.5;
        l.sx=cx+rx*.8*Math.sqrt(1-q*q);l.sy=cy+l.a*ry*.45;l.ex=W*1.08;l.ey=cy+l.a*fan+l.tilt*H;
      }
      for(const d of tunnel){
        d.z+=dt*energy*d.spd*(.25+d.z*1.2);d.th+=dt*.5*d.z;
        if(d.z>=1){d.z=0;d.th=rand(0,TAU)}
      }
    }

    /* ---------- Dibujo ---------- */
    const tmp={x:0,y:0,tx:0,ty:0};
    function basePos(f,u,out){
      const mt=1-u,a=mt*mt*mt,b=3*mt*mt*u,c=3*mt*u*u,d=u*u*u;
      out.x=a*f.sx+b*f.c1x+c*f.c2x+d*f.ex;out.y=a*f.sy+b*f.c1y+c*f.c2y+d*f.ey;
      const tx=mt*mt*(f.c1x-f.sx)+2*mt*u*(f.c2x-f.c1x)+u*u*(f.ex-f.c2x);
      const ty=mt*mt*(f.c1y-f.sy)+2*mt*u*(f.c2y-f.c1y)+u*u*(f.ey-f.c2y);
      const len=Math.hypot(tx,ty)||1;out.tx=tx/len;out.ty=ty/len;
    }
    function flowPos(f,u,out){
      basePos(f,u,out);
      const cd=f.ch*H*Math.pow(1-u,1.5)*Math.sin(TAU*f.k*u+f.cp+t*.22);
      out.x-=out.ty*cd;out.y+=out.tx*cd;
    }
    function drawStars(){
      ctx.fillStyle='rgb(170,200,255)';
      for(const s of stars){ctx.globalAlpha=.18+.5*(.5+.5*Math.sin(t*s.s+s.p));ctx.fillRect(s.x,s.y,s.r,s.r)}
    }
    function drawGlow(){
      const gb=.85+.15*energy+.05*Math.sin(t*1.1);
      ctx.globalAlpha=Math.min(1,gb);
      ctx.drawImage(GLOW,cx-rx*2.2,cy-ry*2.2,rx*4.4,ry*4.4);
    }
    function drawFilaments(){
      const S=portrait?28:40;
      ctx.lineWidth=.8;ctx.lineJoin='round';
      ctx.beginPath();
      for(const f of filaments)for(let i=0;i<=S;i++){flowPos(f,i/S,tmp);if(i)ctx.lineTo(tmp.x,tmp.y);else ctx.moveTo(tmp.x,tmp.y)}
      ctx.strokeStyle='rgb(120,170,255)';ctx.globalAlpha=.10;ctx.stroke();
      ctx.beginPath();
      const i0=Math.floor(S*.55);
      for(const f of filaments)for(let i=i0;i<=S;i++){flowPos(f,i/S,tmp);if(i>i0)ctx.lineTo(tmp.x,tmp.y);else ctx.moveTo(tmp.x,tmp.y)}
      ctx.strokeStyle='rgb(175,218,255)';ctx.globalAlpha=.12;ctx.stroke();
    }
    function seg(x,y,dx,dy,color,lw,alpha){
      ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x+dx,y+dy);
      ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.globalAlpha=alpha;ctx.stroke();
    }
    function drawBits(){
      ctx.lineCap='round';
      const ordLen=7*sc,ordLw=1.6;
      for(const p of bits){
        const u=p.u,a0=smooth(0,.1,u)*(1-smooth(.965,1,u));
        if(a0<.02)continue;
        const o=smooth(.3,.95,u),j=Math.pow(1-u,1.5);
        flowPos(filaments[p.f],u,tmp);
        const x=tmp.x+(Math.sin(t*p.a1+p.p1)+.6*Math.sin(t*p.a2+p.p2))*p.J*j;
        const y=tmp.y+(Math.cos(t*p.b1+p.q1)+.6*Math.cos(t*p.b2+p.q2))*p.J*j;
        const fa=Math.atan2(tmp.ty,tmp.tx),ra=p.ang+t*p.spin;
        const ang=ra+Math.atan2(Math.sin(fa-ra),Math.cos(fa-ra))*o;
        const len=p.len+(ordLen-p.len)*o,lw=p.lw+(ordLw-p.lw)*o;
        const a=a0*(1-(1-o)*.35*(.5+.5*Math.sin(t*p.fl+p.p1)));
        const hx=Math.cos(ang)*len*.5,hy=Math.sin(ang)*len*.5;
        if(o<.98)seg(x,y,hx,hy,PCOL[p.sp],lw,a*(1-o));
        if(o>.02)seg(x,y,hx,hy,ORD,lw,Math.min(1,a*o*1.15));
        spr(p.sp,x,y,8+len*.9,a*.2*(1-o*.5));
      }
    }
    const NBK=6,dashB=Array.from({length:NBK},()=>[]),dotB=Array.from({length:NBK},()=>[]);
    function flush(B,lw){
      ctx.lineWidth=lw;ctx.strokeStyle=ORD;
      for(let b=0;b<NBK;b++){
        const arr=B[b];if(!arr.length)continue;
        ctx.beginPath();for(let k=0;k<arr.length;k+=4){ctx.moveTo(arr[k],arr[k+1]);ctx.lineTo(arr[k+2],arr[k+3])}
        ctx.globalAlpha=((b+.5)/NBK)*.95;ctx.stroke();
      }
    }
    function drawLanes(){
      ctx.lineWidth=.8;
      for(const l of lanes){
        const g=ctx.createLinearGradient(l.sx,l.sy,l.ex,l.ey);
        g.addColorStop(0,'rgba(170,215,255,.55)');g.addColorStop(.35,'rgba(90,150,255,.20)');g.addColorStop(1,'rgba(60,110,255,0)');
        ctx.strokeStyle=g;ctx.globalAlpha=.85*(.65+.35*Math.sin(t*1.2+l.ph));
        ctx.beginPath();ctx.moveTo(l.sx,l.sy);ctx.lineTo(l.ex,l.ey);ctx.stroke();
      }
      ctx.lineCap='round';
      const gap=22*sc,x0=cx+rx*.9,span=Math.max(1,W*1.04-x0);
      const nMin=Math.ceil((flowA-span)/gap),nMax=Math.floor(flowA/gap),dashLen=7*sc;
      for(let b=0;b<NBK;b++){dashB[b].length=0;dotB[b].length=0}
      for(let li=0;li<lanes.length;li++){
        const l=lanes[li],ddx=l.ex-l.sx,ddy=l.ey-l.sy,slope=ddy/ddx,dl=Math.hypot(ddx,ddy)||1,ux=ddx/dl,uy=ddy/dl;
        for(let n=nMin;n<=nMax;n++){
          const x=x0+(flowA-n*gap),frac=(x-x0)/span;
          const al=smooth(0,.05,frac)*(1-smooth(.45,1,frac));
          if(al<.03)continue;
          const a=al*(.7+.3*Math.sin(TAU*(frac*3.2-t*.55)));
          const bi=Math.min(NBK-1,(a*NBK)|0),y=l.sy+slope*(x-l.sx);
          if(hash(li,n)>.5){const h=dashLen*(.8+.5*frac)*.5;dashB[bi].push(x-ux*h,y-uy*h,x+ux*h,y+uy*h)}
          else dotB[bi].push(x,y,x+.01,y);
        }
      }
      flush(dashB,1.6);flush(dotB,2.4);
    }
    function ell(s,off,lw,c,alpha,a0,a1){
      ctx.beginPath();ctx.ellipse(cx+off,cy,rx*s,ry*s,rot,a0||0,a1===undefined?TAU:a1);
      ctx.lineWidth=lw;ctx.strokeStyle=`rgb(${c})`;ctx.globalAlpha=alpha;ctx.stroke();
    }
    const offFor=s=>(1-s)*rx*.3;
    function drawInterior(){
      ctx.save();
      ctx.beginPath();ctx.ellipse(cx+offFor(.9),cy,rx*.9,ry*.9,rot,0,TAU);ctx.clip();
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.scale(rx/ry,1);
      const g=ctx.createRadialGradient(0,0,0,0,0,ry*.9);
      g.addColorStop(0,'rgba(0,1,6,1)');g.addColorStop(.62,'rgba(1,4,16,.98)');
      g.addColorStop(.88,'rgba(6,26,90,.9)');g.addColorStop(1,'rgba(20,70,190,.75)');
      ctx.fillStyle=g;ctx.fillRect(-ry,-ry,ry*2,ry*2);ctx.restore();
      ctx.globalCompositeOperation='lighter';
      for(let k=0;k<5;k++){
        const z=(t*.22+k/5)%1,s=Math.pow(1-z,1.4)*.9;
        ctx.beginPath();ctx.ellipse(cx+(1-s)*rx*.12,cy,rx*s,ry*s,rot,0,TAU);
        ctx.lineWidth=1;ctx.strokeStyle='rgb(70,140,255)';ctx.globalAlpha=Math.sin(Math.PI*z)*.32;ctx.stroke();
      }
      for(const d of tunnel){
        const q=Math.pow(1-d.z,1.2),x=cx+Math.cos(d.th)*rx*.88*q,y=cy+Math.sin(d.th)*ry*.88*q;
        const a=Math.pow(Math.sin(Math.PI*d.z),.8)*.55;
        spr(d.sp,x,y,3+(1-d.z)*7*d.r,a);
      }
      ctx.restore();
    }
    const RINGS=[
      {s:1.17,lw:1,c:'80,140,255',a:.26,w:.9},{s:1.11,lw:1,c:'100,160,255',a:.36,w:1.1},
      {s:1.055,lw:1.2,c:'125,180,255',a:.50,w:1.3},{s:1.005,lw:1.4,c:'165,210,255',a:.70,w:1.5},
      {s:.97,lw:1.4,c:'205,232,255',a:.85,w:1.7},{s:.94,lw:1.7,c:'245,250,255',a:.95,w:1.9},
      {s:.915,lw:1,c:'170,215,255',a:.55,w:2.1}];
    const ARCS=[{s:.94,len:1.3,w:.70,ph:0,c:'235,247,255'},{s:1.0,len:.9,w:-.50,ph:2.1,c:'170,215,255'},{s:1.06,len:1.6,w:.38,ph:4.0,c:'120,175,255'}];
    function drawRings(){
      ctx.globalCompositeOperation='lighter';
      const gb=.9+.1*energy+.06*Math.sin(t*1.3);
      for(let k=0;k<4;k++){const s=1.07+k*.1+.008*Math.sin(t*.8+k*1.9);ell(s,offFor(s),10+k*7,'50,120,255',(.07-k*.012)*gb)}
      ell(1,0,30,'30,100,255',.09*gb);ell(1,0,15,'60,140,255',.17*gb);ell(.955,offFor(.955),7,'150,200,255',.30*gb);
      for(let i=0;i<RINGS.length;i++){const r=RINGS[i],s=r.s*(1+.006*Math.sin(t*r.w+i*1.3));ell(s,offFor(s),r.lw,r.c,r.a)}
      ell(.935,offFor(.935),5,'200,230,255',.22*gb);
      ctx.lineCap='round';
      for(const a of ARCS){
        const a0=t*a.w*(.85+.3*energy)+a.ph,off=offFor(a.s);
        ell(a.s,off,9,a.c,.16*gb,a0,a0+a.len);ell(a.s,off,2.4,a.c,.90,a0,a0+a.len);
        ell(a.s,off,3.2,'255,255,255',.9,a0+a.len*.7,a0+a.len);
      }
      ctx.lineCap='butt';
      ctx.setLineDash([1.4,11]);ctx.lineDashOffset=-t*26;ell(.985,offFor(.985),2,'210,235,255',.7);ctx.setLineDash([]);
      for(const s0 of shocks){
        const p=(t-s0)/2.8;if(p<0||p>1)continue;
        const e=1-Math.pow(1-p,2);
        ell(1+e*.9,0,1+(1-p)*3,'120,180,255',(1-p)*.4);
      }
    }
    function drawFlare(){
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=(.10+.05*Math.sin(t*1.7))*(.8+.2*energy);
      ctx.drawImage(SP[0],cx-ry*1.7,cy-ry*.11,ry*3.4,ry*.22);
      spr(0,cx+rx*.95,cy,ry*.55,.22*(.8+.2*energy));
    }
    function draw(){
      ctx.setTransform(DPR,0,0,DPR,0,0);
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='source-over';drawStars();
      ctx.globalCompositeOperation='lighter';
      drawGlow();drawFilaments();drawLanes();drawBits();
      drawInterior();drawRings();drawFlare();
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    }

    /* ---------- Interacción ---------- */
    function setPointer(e){
      const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      pointer.mx=x;pointer.my=y;
      pointer.tx=clamp(x/r.width*2-1,-1,1);pointer.ty=clamp(y/r.height*2-1,-1,1);
      pointer.inside=true;
    }
    const leave=()=>{pointer.inside=false;pointer.tx=0;pointer.ty=0};
    if(!reduced){
      hero.addEventListener('pointermove',setPointer,{passive:true});
      hero.addEventListener('pointerdown',e=>{
        if(e.target.closest&&e.target.closest('a,button'))return;
        setPointer(e);tap=1;shocks.push(t);
      },{passive:true});
      hero.addEventListener('pointerleave',leave);
      hero.addEventListener('pointercancel',leave);
      hero.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')leave()});
    }

    /* ---------- Bucle ---------- */
    function frame(now){
      raf=requestAnimationFrame(frame);
      const dt=Math.min(.05,(now-last)/1000||0);last=now;
      update(dt);draw();
    }
    const start=()=>{if(reduced||raf)return;last=performance.now();raf=requestAnimationFrame(frame)};
    const stop=()=>{if(raf){cancelAnimationFrame(raf);raf=0}};
    const still=()=>{for(let i=0;i<200;i++)update(.05);draw()};

    layout();
    for(let i=0;i<60;i++)update(.05);
    draw();
    if(reduced)still();
    const ro=new ResizeObserver(()=>{layout();if(reduced)still();else draw()});ro.observe(canvas);
    if('IntersectionObserver' in window){
      new IntersectionObserver(es=>{es[0].isIntersecting?start():stop()},{threshold:0}).observe(canvas);
    }else start();
    return ()=>{stop();ro.disconnect()};
  }

  document.querySelectorAll('[data-kimo-portal] canvas').forEach(c=>makeWormhole(c));

  // Moderate star density: enough movement without the saturated first concept.
  document.querySelectorAll('[data-kimo-stars]').forEach((field,gi)=>{
    const palette=['#6ca9ff','#85e7ff','#96eed1','#9b91ff'];
    for(let i=0;i<12;i++){
      const s=document.createElement('i');s.className='kimo-star';s.style.left=(33+((i*19+gi*7)%66))+'%';s.style.top=(5+((i*37+11)%88))+'%';s.style.setProperty('--s',(i%6===0?6:i%3===0?4:2.5)+'px');s.style.setProperty('--c',palette[i%palette.length]);s.style.setProperty('--o',String(.3+(i%4)*.14));s.style.setProperty('--d',(5+(i%6)*1.3)+'s');field.appendChild(s);
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   KIMO · V11 — bolitas en los heros interiores y ondas en Principios
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const smooth=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k)};

  /* Bucle común: cada campo se pausa solo cuando sale de pantalla */
  function runLoop(canvas,step,draw,still){
    let raf=0,last=0;
    const frame=now=>{raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||0);last=now;step(dt);draw()};
    const start=()=>{if(reduced||raf)return;last=performance.now();raf=requestAnimationFrame(frame)};
    const stop=()=>{if(raf){cancelAnimationFrame(raf);raf=0}};
    if(reduced){still();return {redraw:still}}
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{es[0].isIntersecting?start():stop()},{threshold:0}).observe(canvas);
    else start();
    return {redraw:draw};
  }

  /* ── 1 · Campo de bolitas para los heros interiores ───────────────── */
  const HPAL=['91,156,255','133,231,255','154,140,255','152,240,210','255,255,255'];
  const HSP=HPAL.map(rgb=>{
    const s=64,c=document.createElement('canvas');c.width=c.height=s;
    const g=c.getContext('2d'),gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.14,`rgba(${rgb},.9)`);
    gr.addColorStop(.4,`rgba(${rgb},.22)`);gr.addColorStop(1,`rgba(${rgb},0)`);
    g.fillStyle=gr;g.fillRect(0,0,s,s);return c;
  });

  function makeHeroField(hero){
    if(hero.querySelector('.hero-dots'))return;
    const wrap=document.createElement('div');
    wrap.className='hero-dots';wrap.setAttribute('aria-hidden','true');
    wrap.dataset.align=hero.classList.contains('principles-hero')?'center':'right';
    const canvas=document.createElement('canvas');wrap.appendChild(canvas);
    hero.insertBefore(wrap,hero.firstChild);
    const ctx=canvas.getContext('2d');
    let W=1,H=1,DPR=1,t=0,dots=[],glows=[];
    const pt={tx:0,x:0};

    function build(){
      const r=wrap.getBoundingClientRect();
      W=Math.max(1,r.width);H=Math.max(1,r.height);
      DPR=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
      const center=wrap.dataset.align==='center';
      const n=Math.round(clamp(W*H/4200,46,130));
      dots=Array.from({length:n},()=>{
        // reparto: a la derecha (heros con texto a la izquierda) o a los costados (hero centrado)
        let x;
        if(center){x=Math.random()<.5?Math.random()*W*.34:W*(.66+Math.random()*.34);if(Math.random()<.08)x=Math.random()*W}
        else x=W*(.26+.74*Math.pow(Math.random(),.85));
        const depth=Math.random();
        return {x0:x,y0:Math.random()*H,vx:rand(3,13),ay:rand(4,20),fy:rand(.15,.5),py:rand(0,TAU),
          ax:rand(3,10),fx:rand(.12,.4),px:rand(0,TAU),
          r:1+Math.pow(Math.random(),2.2)*3.3,c:(Math.random()*HPAL.length)|0,
          a:rand(.4,.95),tw:rand(.6,2.2),pt:rand(0,TAU),depth};
      });
      glows=Array.from({length:Math.round(clamp(W/230,4,9))},()=>({
        x0:(center?(Math.random()<.5?Math.random()*.3:.7+Math.random()*.3):.3+Math.random()*.7)*W,
        y0:Math.random()*H,r:rand(16,38),c:(Math.random()*4)|0,a:rand(.05,.1),vx:rand(1.5,5),p:rand(0,TAU)}));
    }

    function step(dt){t+=dt;pt.x+=(pt.tx-pt.x)*Math.min(1,dt*3)}
    function draw(){
      ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';
      const span=W+60;
      for(const g of glows){
        const x=((g.x0+g.vx*t)%span+span)%span-30+pt.x*10;
        ctx.globalAlpha=g.a*(.7+.3*Math.sin(t*.5+g.p));
        const s=g.r*2;ctx.drawImage(HSP[g.c],x-s,g.y0-s+Math.sin(t*.2+g.p)*10,s*2,s*2);
      }
      for(const d of dots){
        const x=(((d.x0+d.vx*t)%span)+span)%span-30+Math.sin(t*d.fx+d.px)*d.ax+pt.x*(6+d.depth*16);
        const y=d.y0+Math.sin(t*d.fy+d.py)*d.ay;
        if(y<-10||y>H+10)continue;
        const edge=smooth(0,.05,(x+30)/span)*(1-smooth(.95,1,(x+30)/span));
        const a=d.a*(.55+.45*Math.sin(t*d.tw+d.pt))*edge;
        if(a<.02)continue;
        const s=6+d.r*7;
        ctx.globalAlpha=a*.55;ctx.drawImage(HSP[d.c],x-s,y-s,s*2,s*2);
        ctx.globalAlpha=Math.min(1,a*1.1);ctx.fillStyle=`rgb(${HPAL[d.c]})`;
        ctx.beginPath();ctx.arc(x,y,d.r*.75,0,TAU);ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    }
    const still=()=>{t=6;draw()};

    build();
    if(!reduced)hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();pt.tx=clamp((e.clientX-r.left)/r.width*2-1,-1,1)},{passive:true});
    const loop=runLoop(canvas,step,draw,still);
    new ResizeObserver(()=>{build();loop.redraw()}).observe(wrap);
  }
  document.querySelectorAll('.page-hero,.mp-hero').forEach(makeHeroField);

  /* ── 2 · Ondas con bolitas en «Cuatro principios» ─────────────────── */
  // Trayectoria idéntica a la línea senoidal del CSS (viewBox 1200×190)
  const SEG=[[6,150,100,150,190,20,285,20],[285,20,380,20,430,150,525,150],[525,150,620,150,670,20,765,20],[765,20,860,20,910,150,1005,150],[1005,150,1080,150,1130,90,1194,60]];
  const bez=(a,b,c,d,u)=>{const m=1-u;return m*m*m*a+3*m*m*u*b+3*m*u*u*c+u*u*u*d};
  // Color de la línea: negro → azul → violeta
  const GRAD=[[10,18,32],[59,91,219],[107,78,230]];
  const gcol=u=>{const k=u<.55?u/.55:(u-.55)/.45,a=GRAD[u<.55?0:1],b=GRAD[u<.55?1:2];return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]};
  const CHAOS=[[78,123,255],[117,92,246],[20,184,166],[34,184,230],[10,18,32]];

  function makeFlowWaves(flow){
    if(flow.querySelector('.flow-waves'))return;
    const track=flow.querySelector('.principles-track');
    if(!track)return;
    const wrap=document.createElement('div');wrap.className='flow-waves';wrap.setAttribute('aria-hidden','true');
    const canvas=document.createElement('canvas');wrap.appendChild(canvas);
    flow.appendChild(wrap);   // al final: no altera el orden de las tarjetas
    const ctx=canvas.getContext('2d');
    let W=1,H=1,DPR=1,t=0,active=false,path=[],total=1,lines=[],dots=[];

    function build(){
      const fr=flow.getBoundingClientRect(),tr=track.getBoundingClientRect();
      active=tr.width>40&&tr.height>20&&getComputedStyle(track).display!=='none';
      wrap.style.display=active?'block':'none';
      if(!active)return;
      const pad=70;
      wrap.style.left='-40px';wrap.style.right='-40px';
      wrap.style.top=(tr.top-fr.top-pad)+'px';wrap.style.height=(tr.height+pad*2)+'px';
      const wr=wrap.getBoundingClientRect();
      W=Math.max(1,wr.width);H=Math.max(1,wr.height);DPR=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
      const ox=tr.left-wr.left,oy=tr.top-wr.top,sx=tr.width/1200,sy=tr.height/190;
      path=[];let acc=0,px=0,py=0;
      SEG.forEach((s,i)=>{
        for(let k=(i?1:0);k<=60;k++){
          const u=k/60,x=ox+bez(s[0],s[2],s[4],s[6],u)*sx,y=oy+bez(s[1],s[3],s[5],s[7],u)*sy;
          if(path.length){acc+=Math.hypot(x-px,y-py)}
          path.push({x,y,s:acc});px=x;py=y;
        }
      });
      total=acc||1;
      const sc=clamp(tr.height/108,.7,1.4);
      const offs=[-34,-23,-12,0,12,23,34];
      lines=offs.map((o,i)=>({o:o*sc,wob:rand(4,11)*sc,cy:rand(1.2,2.6),ph:rand(0,TAU),sp:rand(.25,.6)}));
      const n=Math.round(clamp(tr.width/17,34,84));
      dots=Array.from({length:n},()=>({
        k:(Math.random()*lines.length)|0,u:Math.random(),spd:rand(.028,.055),
        r0:rand(1.3,3.6),c:CHAOS[(Math.random()*CHAOS.length)|0],j:rand(4,14)*sc,ph:rand(0,TAU),fq:rand(.5,1.4)}));
    }

    // punto de la trayectoria a la fracción u (por longitud de arco) + normal
    const q={x:0,y:0,nx:0,ny:1};
    function at(u){
      const target=u*total;let lo=0,hi=path.length-1;
      while(lo<hi-1){const m=(lo+hi)>>1;if(path[m].s<target)lo=m;else hi=m}
      const a=path[lo],b=path[hi],span=(b.s-a.s)||1,k=clamp((target-a.s)/span,0,1);
      q.x=a.x+(b.x-a.x)*k;q.y=a.y+(b.y-a.y)*k;
      const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;q.nx=-dy/l;q.ny=dx/l;
    }
    // desplazamiento lateral: abierto y desordenado a la izquierda, unido en la línea a la derecha
    const lat=(L,u)=>{const conv=1-smooth(0,.78,u);return (L.o+L.wob*Math.sin(u*TAU*L.cy+L.ph+t*L.sp))*conv};

    function step(dt){t+=dt;if(active)for(const d of dots){d.u+=dt*d.spd;if(d.u>=1){d.u-=1;d.k=(Math.random()*lines.length)|0;d.c=CHAOS[(Math.random()*CHAOS.length)|0]}}}
    function draw(){
      if(!active)return;
      ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
      ctx.lineJoin='round';ctx.lineWidth=.9;
      lines.forEach((L,i)=>{
        if(Math.abs(L.o)<1)return;                         // la central ya es la línea del CSS
        ctx.beginPath();
        for(let s=0;s<=90;s++){const u=s/90;at(u);const o=lat(L,u);const x=q.x+q.nx*o,y=q.y+q.ny*o;if(s)ctx.lineTo(x,y);else ctx.moveTo(x,y)}
        ctx.strokeStyle='rgb(70,90,220)';ctx.globalAlpha=.10+.06*(1-Math.abs(L.o)/46);ctx.stroke();
      });
      for(const d of dots){
        const u=d.u,L=lines[d.k];at(u);
        const conv=1-smooth(0,.78,u),o=lat(L,u)+Math.sin(t*d.fq+d.ph)*d.j*conv;
        const x=q.x+q.nx*o,y=q.y+q.ny*o;
        const ord=smooth(.25,.9,u),gc=gcol(u);
        const r=d.r0+(2.7-d.r0)*ord;
        const cr=d.c[0]+(gc[0]-d.c[0])*ord,cg=d.c[1]+(gc[1]-d.c[1])*ord,cb=d.c[2]+(gc[2]-d.c[2])*ord;
        const a=smooth(0,.06,u)*(1-smooth(.97,1,u));
        const col=`${cr|0},${cg|0},${cb|0}`;
        ctx.fillStyle=`rgb(${col})`;
        ctx.globalAlpha=a*.08;ctx.beginPath();ctx.arc(x,y,r*4.2,0,TAU);ctx.fill();
        ctx.globalAlpha=a*.16;ctx.beginPath();ctx.arc(x,y,r*2.2,0,TAU);ctx.fill();
        ctx.globalAlpha=a*.95;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    const still=()=>{t=8;for(let i=0;i<80;i++)step(.05);draw()};

    build();
    const loop=runLoop(canvas,step,draw,still);
    new ResizeObserver(()=>{build();loop.redraw()}).observe(flow);
  }
  document.querySelectorAll('.principles-flow').forEach(makeFlowWaves);
})();

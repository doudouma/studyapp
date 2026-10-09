
(()=>{
'use strict';
/* 已有未销毁的实例时跳过重复执行（React 重新挂载前会先调用 window.__dr.destroy()） */
if(typeof window!=='undefined'&&window.__dr&&!window.__dr.destroyed) return;
/* i18n：由宿主页面在加载本脚本前注入 window.DR_I18N（缺省回退日文） */
const L10N=(typeof window!=='undefined'&&window.DR_I18N)||{};
const __=(k,fb)=>L10N[k]!=null?L10N[k]:fb;
const fmt=(s,o)=>String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!=null?o[k]:m);
/* 宿主已卸载（组件销毁后才加载完成）时中止启动 */
if(typeof document==='undefined'||!document.getElementById('gl')) return;
const T=THREE, $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.random()*a.length|0], clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const INK='#3b2616';

/* ================= config ================= */
const DIFFS={
  easy:   {name:'EASY',   col:'#2fa866',floors:5, time:75, cap:6,spawn:[2.5,3.5],pat:44,speed:3.4,limit:5, special:.12,maxQ:7,grpP:.3,grp:[2,3],ret:[9,13],retMax:2, note:__('diff.easy.note','5階建て・のんびり'),sub:__('diff.easy.sub','初心者向け。特殊配達員は少なめ')},
  normal: {name:'NORMAL', col:'#2f86e0',floors:10,time:90, cap:6,spawn:[1.6,2.4],pat:36,speed:5.2,limit:6, special:.3, maxQ:9,grpP:.45,grp:[2,3],ret:[6,9],retMax:3, note:__('diff.normal.note','10階建て・次々やってくる'),sub:__('diff.normal.sub','まとめ運びの基本戦略が必要')},
  hard:   {name:'HARD',   col:'#f08a24',floors:20,time:105,cap:8,spawn:[1.3,2.0],pat:32,speed:8.2,limit:8, special:.5, maxQ:10,grpP:.55,grp:[2,4],magnet:2.5,heal:true,ret:[4,6.5],retMax:5,note:__('diff.hard.note','20階建て・大量出現'),sub:__('diff.hard.sub','特殊配達員が増える。素早い判断を')},
  extreme:{name:'EXTREME',col:'#e8453c',floors:30,time:120,cap:10,spawn:[1.05,1.6], pat:29,speed:11, limit:10,special:.7, maxQ:12,grpP:.6,grp:[3,5],magnet:3,heal:true,ret:[3,4.6],retMax:6,note:__('diff.extreme.note','30階建て・超ラッシュ'),sub:__('diff.extreme.sub','高度なエレベーター操作が必要')}
};
const TYPES={
  normal:   {name:__('type.normal.name','通常'),    tag:__('type.normal.tag',''),        css:'#2f86e0',size:1,pat:1,   ride:.35,boardT:.22, boardSp:6,  exitT:.22,pts:100,qw:.62,desc:__('type.normal.desc','標準的な配達員。')},
  impatient:{name:__('type.impatient.name','せっかち'),tag:__('type.impatient.tag','せっかち'),css:'#e8453c',size:1,pat:.6,  ride:.35,boardT:.3, boardSp:7,  exitT:.2, pts:150,qw:.62,desc:__('type.impatient.desc','待ちゲージが短い。待たせるとすぐ再配達。')},
  bulk:     {name:__('type.bulk.name','大量'),    tag:__('type.bulk.tag','大量'),     css:'#2fa866',size:2,pat:1.1, ride:.35,boardT:.9,boardSp:2.4,exitT:.5, pts:200,qw:.8, desc:__('type.bulk.desc','段ボール山盛り。乗り降りに時間がかかり2人分。')},
  cart:     {name:__('type.cart.name','台車'),    tag:__('type.cart.tag','台車'),     css:'#f08a24',size:2,pat:1.1, ride:.35,boardT:.4, boardSp:5,  exitT:.3, pts:200,qw:.98,desc:__('type.cart.desc','台車つき。エレベーター内で2人分のスペース。')},
  timed:    {name:__('type.timed.name','時間指定'),tag:__('type.timed.tag','時間指定'),css:'#8a5bd6',size:1,pat:.7,  ride:1,  boardT:.3, boardSp:6,  exitT:.22,pts:250,qw:.62,desc:__('type.timed.desc','制限時間が短い。早めに乗せないとすぐ再配達。')},
  express:  {name:__('type.express.name','超特急'),  tag:__('type.express.tag','超特急'),  css:'#22202c',size:1,pat:.5,  ride:.35,boardT:.2, boardSp:8,  exitT:.18,pts:400,qw:.62,desc:__('type.express.desc','列の先頭に割り込む最優先。届ければ高得点。')},
  ret:      {name:__('type.ret.name','帰り'),    tag:__('type.ret.tag','帰り'),     css:'#0f9f99',size:1,pat:.9,  ride:.35,boardT:.3, boardSp:6,  exitT:.22,pts:150,qw:.62,desc:__('type.ret.desc','配達を終えて上の階で待つ。その階に止まると乗ってきて、1階で降ろせば完了。')}
};
const FH=2.4, D=2.6, BX0=-4.6, BX1=4.2, SX0=.9, SX1=3.3, CABX=2.1, QX=.4, QZ=-1.25, VIEW_CX=-.9, VIEW_W=11.8;

/* ================= audio ================= */
const AU={ctx:null,master:null,on:true,bgm:null,step:0,next:0,fast:false};
function auInit(){ if(AU.ctx) return; try{ const C=window.AudioContext||window.webkitAudioContext; AU.ctx=new C(); AU.master=AU.ctx.createGain(); AU.master.gain.value=AU.on?.9:0; AU.master.connect(AU.ctx.destination);}catch(e){AU.ctx=null} }
function tone(f,dur,type,vol,when,to){ if(!AU.ctx||!AU.on) return; const c=AU.ctx,t=c.currentTime+(when||0),o=c.createOscillator(),g=c.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f,t); if(to) o.frequency.exponentialRampToValueAtTime(to,t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol||.1,t+.008); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(g); g.connect(AU.master); o.start(t); o.stop(t+dur+.03); }
const mf=m=>440*Math.pow(2,(m-69)/12);
const SFX={
  board(){tone(520,.09,'square',.07,0,760)},
  ding(){tone(1175,.3,'sine',.12);tone(880,.4,'sine',.1,.12)},
  deliver(c){const s=Math.min(c,12);tone(mf(79+s),.08,'square',.08);tone(mf(84+s),.2,'square',.08,.07)},
  combo(big){const n=big?[72,76,79,84,88,91]:[72,76,79,84];n.forEach((m,i)=>tone(mf(m),.16,'triangle',.16,i*.065));if(big)tone(mf(96),.5,'square',.07,.4)},
  bonus(){[79,83,86].forEach((m,i)=>tone(mf(m),.12,'triangle',.13,i*.05))},
  miss(){tone(240,.45,'sawtooth',.12,0,90);tone(180,.45,'square',.06,.05,70)},
  tick(){tone(1320,.05,'square',.06)},
  count(go){tone(go?1047:523,go?.5:.15,'square',.1)},
  alert(){tone(1568,.08,'square',.08);tone(1568,.08,'square',.08,.12);tone(2093,.16,'square',.08,.24)},
  end(){[84,79,76,72].forEach((m,i)=>tone(mf(m),.25,'triangle',.15,i*.14))},
  click(){tone(660,.06,'square',.06,0,990)}
};
const BASS=[48,45,41,43], MEL=[[76,79,84,79,76,79,72,0],[76,81,84,81,76,81,72,0],[77,81,84,81,77,81,72,0],[79,83,86,83,79,74,79,0]];
function bgmStart(){ if(!AU.ctx||AU.bgm) return; AU.step=0; AU.next=AU.ctx.currentTime+.1; AU.fast=false;
  AU.bgm=setInterval(()=>{ if(!AU.ctx||AU.ctx.state!=='running') return; const st=AU.fast?.165:.2;
    while(AU.next<AU.ctx.currentTime+.25){ const bar=(AU.step>>3)&3,i=AU.step&7,w=AU.next-AU.ctx.currentTime;
      tone(mf(BASS[bar]+(i%4===2?7:0)-(i%2?0:0)),st*.9,'triangle',i%2?.05:.1,w);
      const m=MEL[bar][i]; if(m) tone(mf(m),st*.8,'square',.03,w);
      if(i%2===1) tone(6000,.03,'square',.012,w);
      AU.step++; AU.next+=st; } },60); }
function bgmStop(){ if(AU.bgm){clearInterval(AU.bgm);AU.bgm=null} }

/* ================= three setup ================= */
const canvas=$('gl');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.outputEncoding=T.sRGBEncoding;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(26,1,1,400);
{ const c=document.createElement('canvas'); c.width=4; c.height=256; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#3fa9f2'); gr.addColorStop(.55,'#9ed9fb'); gr.addColorStop(1,'#eaf9ff'); g.fillStyle=gr; g.fillRect(0,0,4,256);
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; scene.background=t; }
scene.add(new T.HemisphereLight(0xffffff,0xd9cfa8,.78));
const sun=new T.DirectionalLight(0xfff1d6,.72); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
{ const s=sun.shadow.camera; s.left=-17; s.right=17; s.top=17; s.bottom=-17; s.near=1; s.far=90; sun.shadow.bias=-.0006; }
scene.add(sun, sun.target);

const MATS={}, GEO={};
function mat(col,opt){ const k=col+(opt||''); if(MATS[k]) return MATS[k]; const c=new T.Color(col).convertSRGBToLinear();
  return MATS[k]= opt==='basic'? new T.MeshBasicMaterial({color:c}) : new T.MeshLambertMaterial({color:c}); }
function geo(k,f){ return GEO[k]||(GEO[k]=f()); }
function add(parent,g,col,x,y,z,cast,opt){ const m=new T.Mesh(g,typeof col==='object'?col:mat(col,opt)); m.position.set(x,y,z); m.castShadow=!!cast; m.receiveShadow=opt!=='basic'; parent.add(m); return m; }
const B=(p,w,h,d,col,x,y,z,cast,opt)=>add(p,geo('b'+w+'_'+h+'_'+d,()=>new T.BoxGeometry(w,h,d)),col,x,y,z,cast,opt);
const CY=(p,rt,rb,h,col,x,y,z,cast,seg)=>add(p,geo('c'+rt+'_'+rb+'_'+h+'_'+(seg||14),()=>new T.CylinderGeometry(rt,rb,h,seg||14)),col,x,y,z,cast);
const SP=(p,r,col,x,y,z,cast,opt)=>add(p,geo('s'+r,()=>new T.SphereGeometry(r,16,12)),col,x,y,z,cast,opt);

const TEX={};
function textTex(key,w,h,draw){ if(TEX[key]) return TEX[key]; const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.anisotropy=4; return TEX[key]=t; }
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
const FD='"Mochiy Pop One","M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif';
function labelTex(dest,type){ return textTex('L'+dest+type,192,168,(g)=>{ const d=TYPES[type];
  rr(g,8,8,176,130,28); g.fillStyle='#fffdf6'; g.fill();
  if(d.tag){ g.save(); rr(g,8,8,176,130,28); g.clip(); g.fillStyle=d.css; g.fillRect(0,0,192,54); g.restore();
    g.fillStyle=type==='express'?'#ffd23f':'#fff'; g.font='30px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(d.tag,96,33); }
  rr(g,8,8,176,130,28); g.lineWidth=10; g.strokeStyle=type==='express'?'#22202c':d.css; g.stroke();
  g.beginPath(); g.moveTo(74,136); g.lineTo(96,164); g.lineTo(118,136); g.closePath(); g.fillStyle=type==='express'?'#22202c':d.css; g.fill();
  g.fillStyle=INK; g.font=(d.tag?66:84)+'px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(dest+'F',96,d.tag?97:76); }); }
function signTex(n){ return textTex('S'+n,128,80,(g)=>{ rr(g,4,4,120,72,16); g.fillStyle=INK; g.fill(); g.fillStyle='#ffd23f'; g.font='50px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(n+'F',64,43); }); }

/* ================= world ================= */
let world=null, N=10, cfg=DIFFS.normal, diffKey='normal';
let truck=null;
const TRUCK_COLS=['#ff8a1f','#2f86e0','#2fa866'];
function updTruck(dt,time){ const k=truck; if(!k) return;
  if(k.state==='park'){ k.t-=dt; if(k.t<=0){ k.state='out'; k.v=0; burst(k.x+1.7,.35,-1.5,7,'smoke'); } }
  else if(k.state==='out'){ k.v=Math.min(15,k.v+8*dt); k.x-=k.v*dt; if(k.x<-50){ k.state='in'; k.col=(k.col+1)%TRUCK_COLS.length; k.paint.forEach(m=>m.material=mat(TRUCK_COLS[k.col])); } }
  else { const d=-10.3-k.x; k.v=Math.max(1,Math.min(12,d*1.5)); k.x+=k.v*dt; if(k.x>=-10.3){ k.x=-10.3; k.v=0; k.state='park'; k.t=rnd(5,8); } }
  k.g.position.x=k.x; k.g.position.y=k.state==='park'?0:Math.abs(Math.sin(time*26))*.025; }
let floorsFx=[], cab=null, cable=null, cabDoors=[], cabSign=null, cabSignCtx=null, cabSignShown='', clouds=[];
const STYLES={
  easy:   {bname:__('style.easy.bname','コーポひだまり'),   kind:__('style.easy.kind','アパート'),        walls:['#ffe8c9','#fff1d6','#f7dfc0'],doors:['#a8683f','#8a5a3c','#b9773f'],ext:'#f3dcb4',slab:'#c9a57a',wains:'#e9d2ad',rail:'#8a5a3c',shaft:'#9a8f84',roof:'#a5503a',edge:'#8a3f2e',awning:'#3f9c93',rug:'#6ea86f',crown:'gable', signBg:'#fff8e8',signInk:'#8a3f2e'},
  normal: {bname:__('style.normal.bname','メゾン・ラッシュ'), kind:__('style.normal.kind','マンション'),      walls:['#ffe3c2','#d6f0e0','#d9e8fb','#ffe0e6','#fff3c4'],doors:['#c0704a','#5f8fb8','#6ea86f','#d9a441','#a06ab4'],ext:'#f6e7c8',slab:'#d9c4a1',wains:'#fffaf0',rail:'#b9976a',shaft:'#7f8fa3',roof:'#3f9c93',edge:'#2f7d76',awning:'#ef4a3c',rug:'#d8574a',crown:'flat',  signBg:'#fffdf6',signInk:'#ef4a3c'},
  hard:   {bname:__('style.hard.bname','グランドレジデンス'),kind:__('style.hard.kind','大型マンション'),  walls:['#e6eef5','#eef3ea','#f3ece6','#e4ecf3'],doors:['#3f6f9c','#4f7f6f','#8a6f4f','#5f5f8f'],ext:'#e9eef2',slab:'#b8c2cc',wains:'#ffffff',rail:'#8fa3b5',shaft:'#6f8296',roof:'#34506e',edge:'#263c55',awning:'#34506e',rug:'#3f6f9c',crown:'modern',signBg:'#34506e',signInk:'#ffffff'},
  extreme:{bname:__('style.extreme.bname','ザ・スカイタワー'), kind:__('style.extreme.kind','タワーマンション'),walls:['#eef1f5','#e6e9ef','#f4f1ec'],doors:['#2b2f3a','#3a3f4d','#4a3f35'],ext:'#39465a',slab:'#8f99a8',wains:'#f7f7f9',rail:'#c9a44a',shaft:'#4d5a6e',roof:'#2b3445',edge:'#c9a44a',awning:'#2b3445',rug:'#7a2f3a',glass:'#8fd0f2',crown:'tower', signBg:'#1c2230',signInk:'#e8c468'}
};
const WALLS=['#ffe3c2','#d6f0e0','#d9e8fb','#ffe0e6','#fff3c4'], DOORS=['#c0704a','#5f8fb8','#6ea86f','#d9a441','#a06ab4'];

function buildWorld(){
  if(world){ scene.remove(world); floorsFx.forEach(f=>f.mat.dispose()); }
  world=new T.Group(); scene.add(world); floorsFx=[]; clouds=[];
  const st=new T.Group(); world.add(st); // static
  const W=BX1-BX0, cx=(BX0+BX1)/2, top=N*FH, S=STYLES[diffKey]||STYLES.normal;
  // ground
  B(st,240,.2,80,'#8fd06a',0,-.12,-20);
  B(st,240,.12,5.4,'#e6dfd2',0,0,-.9);
  B(st,240,.1,5,'#6f7480',0,-.03,4.3);
  for(let x=-40;x<=40;x+=4) B(st,1.8,.02,.16,'#f4f1e6',x,.03,4.3);
  B(st,240,.16,.3,'#c9c1b1',0,.02,1.85);
  // distant city
  const hazy=['#cfe6f3','#e3def0','#f3e6d8','#d7eedd'];
  for(let i=0;i<16;i++){ const w=rnd(4,8),h=rnd(6,Math.max(14,top*.95)); B(st,w,h,4,pick(hazy),-52+i*7+rnd(-2,2),h/2,-rnd(20,32),false,'basic'); }
  // floors
  const hlGeo=geo('hl',()=>new T.PlaneGeometry(W,FH-.2));
  const signGeo=geo('sg',()=>new T.PlaneGeometry(.72,.45));
  for(let i=0;i<N;i++){ const y=i*FH, wc=S.walls[i%S.walls.length];
    B(st,W+.6,.2,D+.1,S.slab,cx,y-.1,-D/2+.05);
    B(st,SX0-BX0,FH-.2,.1,wc,(BX0+SX0)/2,y+(FH-.2)/2,-D);
    B(st,BX1-SX1,FH-.2,.1,wc,(SX1+BX1)/2,y+(FH-.2)/2,-D);
    B(st,SX1-SX0,FH-.2,.1,S.shaft,(SX0+SX1)/2,y+(FH-.2)/2,-D);
    B(st,SX0-BX0,.5,.06,S.wains,(BX0+SX0)/2,y+.25,-D+.07);
    B(st,W,.07,.08,S.rail,cx,y+.52,-D+.08);
    B(st,.3,FH,D+.1,S.ext,BX1+.15,y+FH/2-.2,-D/2+.05);
    if(S.glass){ B(st,.05,FH-.7,D-.5,S.glass,BX1+.31,y+FH/2-.15,-D/2+.05,false,'basic'); if(i>0) B(st,.05,FH-.7,D-.5,S.glass,BX0-.31,y+FH/2-.15,-D/2+.05,false,'basic'); }
    if(i>0) B(st,.3,FH,D+.1,S.ext,BX0-.15,y+FH/2-.2,-D/2+.05);
    else { B(st,.3,.5,D+.1,S.ext,BX0-.15,FH-.45,-D/2+.05); const aw=B(st,1.7,.1,D+.3,S.awning,BX0-.85,1.98,-D/2+.05,true); aw.rotation.z=.22;
      B(st,.1,2,.1,S.ext,BX0-.15,1,-.05); }
    // doors / lobby
    if(i>0){ [-3.45,-1.35].forEach((dx,k)=>{ B(st,1.02,1.84,.05,'#fffaf0',dx,y+.92,-D+.08); B(st,.88,1.74,.07,S.doors[(i*2+k)%S.doors.length],dx,y+.87,-D+.1);
        SP(st,.06,'#ffd23f',dx+.3,y+.85,-D+.16); B(st,.3,.16,.03,'#fffdf6',dx,y+1.45,-D+.15); });
      B(st,.16,.3,.14,'#ffe9a8',-2.4,y+1.5,-D+.12,false,'basic');
      if(i%3===1){ CY(st,.16,.12,.26,'#c0704a',-.05,y+.13,-D+.4); SP(st,.26,'#4fae5c',-.05,y+.5,-D+.4); }
    } else {
      for(let r=0;r<3;r++) for(let c=0;c<5;c++) B(st,.3,.24,.12,(r+c)%2?'#b7c4d2':'#9fb0c2',-4.0+c*.34,1.0+r*.28,-D+.12);
      B(st,1.9,.1,.16,'#8a5a3c',-3.32,.82,-D+.14);
      CY(st,.2,.15,.34,'#c0704a',-1.1,.17,-D+.45); SP(st,.34,'#4fae5c',-1.1,.66,-D+.45); SP(st,.22,'#6cc46f',-.95,.95,-D+.45);
      B(st,3.4,.02,1.3,S.rug,-2.2,.075,-1.2);
    }
    // right nook: window + sign
    B(st,.74,.9,.05,'#fffaf0',3.75,y+.95,-D+.08); B(st,.6,.76,.06,'#9fd8f7',3.75,y+.95,-D+.1,false,'basic'); B(st,.6,.04,.07,'#fffaf0',3.75,y+.95,-D+.11);
    const sg=new T.Mesh(signGeo,new T.MeshBasicMaterial({map:signTex(i+1)})); sg.position.set(3.75,y+1.85,-D+.12); st.add(sg);
    // highlight
    const hm=new T.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:0,depthWrite:false});
    const h=new T.Mesh(hlGeo,hm); h.position.set(cx,y+(FH-.2)/2,-D+.17); h.visible=false; world.add(h); floorsFx.push({mesh:h,mat:hm,a:0});
  }
  // shaft
  B(st,.08,top,.1,'#56637a',SX0+.12,top/2,-D+.12); B(st,.08,top,.1,'#56637a',SX1-.12,top/2,-D+.12);
  B(st,.07,top,D-.2,'#e9dcc2',SX1+.02,top/2-.1,-D/2-.05);
  // roof（建物タイプごとに形を変える）
  B(st,W+1.2,.3,D+.6,S.roof,cx,top+.05,-D/2+.05);
  let signX=-1.7, signY=top+1.15, signZ=.3, signW=4.2, posts=true;
  if(S.crown!=='tower'){ B(st,2.9,1.3,2.2,S.ext,CABX,top+.85,-D/2); B(st,3.1,.16,2.4,S.awning,CABX,top+1.58,-D/2);
    const pul=CY(st,.32,.32,.2,'#56637a',CABX,top+.9,-.25); pul.rotation.x=Math.PI/2; }
  if(S.crown==='gable'){ // アパート：三角屋根と煙突
    const half=(W+1.6)/2, rise=1.9, L=Math.hypot(half,rise), ang=Math.atan2(rise,half);
    [-1,1].forEach(sg=>{ const r=B(st,L+.15,.16,D+.9,S.roof,cx+sg*half/2,top+.2+rise/2,-D/2+.05,true); r.rotation.z=-sg*ang; });
    const sh=new T.Shape(); sh.moveTo(-half+.3,0); sh.lineTo(half-.3,0); sh.lineTo(0,rise-.1); sh.lineTo(-half+.3,0);
    const gm=new T.Mesh(new T.ShapeGeometry(sh),mat(S.ext)); gm.position.set(cx,top+.2,-D); st.add(gm);
    B(st,.5,1.2,.5,'#b5654a',-3.3,top+1.4,-1.9,true); B(st,.62,.12,.62,S.edge,-3.3,top+2.05,-1.9);
    signX=-2.1; signY=top+.6; signW=3.2; posts=false;
  } else {
    B(st,W+1.2,.34,.14,S.edge,cx,top+.37,.28); B(st,.14,.34,D+.6,S.edge,BX0-.5,top+.37,-D/2+.05); B(st,.14,.34,D+.6,S.edge,BX1+.5,top+.37,-D/2+.05);
    if(S.crown==='flat'){ // マンション：給水タンクとアンテナ
      CY(st,.6,.6,1.1,'#cfd8e3',-3.3,top+1.05,-1.6,false,18); CY(st,.66,.66,.1,'#9aa7b6',-3.3,top+1.62,-1.6,false,18);
      [-.42,.42].forEach(o=>B(st,.08,.5,.08,'#7a8696',-3.3+o,top+.4,-1.2));
      B(st,.06,2.2,.06,'#7a8696',.2,top+1.3,-2); B(st,.7,.05,.05,'#7a8696',.2,top+2.1,-2); B(st,.45,.05,.05,'#7a8696',.2,top+1.8,-2);
    } else if(S.crown==='modern'){ // 大型マンション：ソーラーパネルと屋上庭園
      for(let k=0;k<3;k++){ const pnl=B(st,1.25,.06,1,'#27406b',-3.7+k*1.45,top+.72,-1.7,true); pnl.rotation.x=-.55; B(st,.08,.5,.08,'#7a8696',-3.7+k*1.45,top+.45,-2.0); }
      CY(st,.1,.12,.7,'#8a5a3c',.15,top+.55,-.9,true,8); SP(st,.5,'#4fae5c',.15,top+1.2,-.9,true); SP(st,.3,'#6cc46f',-.55,top+.45,-.7);
      B(st,.06,2.6,.06,'#7a8696',BX1,top+1.5,-2.2); SP(st,.09,'#ff4a3c',BX1,top+2.85,-2.2,false,'basic');
      signY=top+2.05; signX=-1.9;
    } else { // タワーマンション：段々の冠と尖塔、航空障害灯
      B(st,W+.2,1.5,D,S.ext,cx,top+.95,-D/2,true); B(st,W+.26,.55,D+.06,S.glass,cx,top+1.0,-D/2,false,'basic'); B(st,W+.3,.1,D+.1,S.edge,cx,top+1.72,-D/2);
      B(st,W*.6,1.3,D*.7,S.ext,cx,top+2.4,-D/2,true); B(st,W*.64,.12,D*.74,S.edge,cx,top+3.08,-D/2);
      B(st,W*.3,.7,D*.4,S.roof,cx,top+3.45,-D/2); CY(st,.05,.13,4.6,'#aab4c2',cx,top+6.1,-D/2,false,8);
      SP(st,.15,'#ff4a3c',cx,top+8.45,-D/2,false,'basic'); SP(st,.1,'#ff4a3c',BX0+.2,top+1.9,-.3,false,'basic'); SP(st,.1,'#ff4a3c',BX1-.2,top+1.9,-.3,false,'basic');
      signX=cx; signY=top+2.4; signZ=-D/2+D*.35+.03; signW=4.6; posts=false;
    }
  }
  const nm=new T.Mesh(new T.PlaneGeometry(signW,signW*.2),new T.MeshBasicMaterial({map:textTex('name'+diffKey,672,136,(g)=>{ rr(g,5,5,662,126,26); g.fillStyle=S.signBg; g.fill(); g.lineWidth=10; g.strokeStyle=S.crown==='tower'?S.edge:INK; g.stroke();
    g.fillStyle=S.signInk; g.textAlign='center'; g.textBaseline='middle'; let fs=74; do{ fs-=4; g.font=fs+'px '+FD; }while(g.measureText(S.bname).width>610&&fs>30); g.fillText(S.bname,336,72); })}));
  nm.position.set(signX,signY,signZ); st.add(nm);
  if(posts){ B(st,.1,signY-top-.2,.1,'#7a8696',signX-signW/2+.6,top+(signY-top)/2-.05,signZ-.04); B(st,.1,signY-top-.2,.1,'#7a8696',signX+signW/2-.6,top+(signY-top)/2-.05,signZ-.04); }
  // truck
  const tr=new T.Group(); tr.position.set(-10.3,0,-1.5); world.add(tr);
  B(tr,3,1.7,1.7,'#fffdf6',0,1.25,0,true); const trS=B(tr,3.02,.34,1.72,'#ff8a1f',0,.9,0), trC=B(tr,1.05,1.25,1.6,'#ff8a1f',-2.02,.98,0,true);
  truck={g:tr,paint:[trS,trC],state:'park',t:rnd(4,6),x:-10.3,v:0,col:0};
  B(tr,.5,.5,1.4,'#bfe6fb',-2.32,1.25,0,false,'basic'); B(tr,4.2,.14,1.5,'#4b5563',-.5,.36,0);
  [[-2,.85],[-2,-.85],[.7,.85],[.7,-.85]].forEach(p=>{const w=CY(tr,.34,.34,.24,'#2b2b33',p[0],.34,p[1],true);w.rotation.x=Math.PI/2;});
  const lg=new T.Mesh(new T.PlaneGeometry(1.9,.62),new T.MeshBasicMaterial({transparent:true,map:textTex('rush',380,124,(g)=>{ g.fillStyle='#ef4a3c'; g.font='84px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(__('truck.label','RUSH便'),190,66); })}));
  lg.position.set(0,1.55,.86); tr.add(lg);
  // trees & bushes
  [[6.4,-2.2,1],[9.6,-3.4,1.25],[-15.5,-3.2,1.2],[-7.2,-3.6,.9]].forEach(([x,z,s])=>{ CY(st,.16*s,.2*s,1.5*s,'#8a5a3c',x,.75*s,z,true,8); SP(st,.9*s,'#4fae5c',x,2*s,z,true).scale.set(1,.92,1); SP(st,.6*s,'#6cc46f',x+.45*s,2.6*s,z+.2); });
  [5.2,5.9,7.7].forEach((x,i)=>SP(st,.42,i%2?'#6cc46f':'#4fae5c',x,.3,-.9));
  CY(st,.06,.07,3,'#56637a',7.4,1.5,.9,true,8); SP(st,.2,'#fff3c4',7.4,3.05,.9,false,'basic');
  st.traverse(o=>{o.matrixAutoUpdate=false;o.updateMatrix();});
  // clouds
  for(let i=0;i<Math.max(7,N/2|0);i++){ const c=new T.Group(); const s=rnd(1.4,2.8);
    for(let k=0;k<4;k++){ const m=SP(c,1,'#ffffff',(k-1.5)*1.1*s*.6,rnd(-.2,.3)*s,0,false,'basic'); m.scale.set(s*rnd(.7,1.1),s*rnd(.5,.75),.6); }
    c.position.set(rnd(-45,45),rnd(5,top+16),-rnd(34,48)); c.userData.v=rnd(.25,.7); world.add(c); clouds.push(c); }
  // cab
  cab=new T.Group(); world.add(cab); cab.position.x=CABX;
  const cw=2.16, cz=-1.3, cd=2.1;
  B(cab,cw,.1,cd,'#4b5563',0,-.05,cz,true); B(cab,cw+.1,.14,cd+.1,'#ff8a1f',0,2.1,cz,true);
  B(cab,cw,2.04,.06,'#f3ece0',0,1.02,cz-cd/2+.03); B(cab,.05,2.04,cd,'#e7dccb',cw/2-.03,1.02,cz,true);
  B(cab,cw-.2,.06,.06,'#b8c0cb',0,.95,cz-cd/2+.12);
  [[-1,1],[1,1],[-1,-1]].forEach(([sx,sz])=>B(cab,.09,2.04,.09,'#ff8a1f',sx*(cw/2-.04),1.02,cz+sz*(cd/2-.04),true));
  B(cab,cw+.1,.36,.1,'#ff8a1f',0,1.9,cz+cd/2,true);
  cabDoors=[B(cab,.05,1.9,cd/2-.06,'#c7d0da',-cw/2+.02,.97,cz-cd/4),B(cab,.05,1.9,cd/2-.06,'#c7d0da',-cw/2+.02,.97,cz+cd/4)];
  { const c=document.createElement('canvas'); c.width=256; c.height=72; cabSignCtx=c.getContext('2d'); const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding;
    cabSign=new T.Mesh(new T.PlaneGeometry(1.1,.31),new T.MeshBasicMaterial({map:t})); cabSign.position.set(0,1.9,cz+cd/2+.06); cab.add(cabSign); cabSignShown=''; }
  cable=B(world,.06,1,.06,'#3b3f4a',CABX,0,-1.3);
  B(world,.5,.7,.3,'#56637a',CABX+.75,0,-D+.35).name='cw';
}
function drawCabSign(txt){ if(txt===cabSignShown) return; cabSignShown=txt; const g=cabSignCtx; g.fillStyle='#22202c'; g.fillRect(0,0,256,72);
  g.fillStyle='#ffd23f'; g.font='48px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,128,40); cabSign.material.map.needsUpdate=true; }

/* ================= couriers ================= */
const SKIN=['#ffd9b3','#f5c29a','#e0a878','#ffe2c4'];
const UNI={normal:'#2f86e0',impatient:'#e8453c',bulk:'#2fa866',cart:'#f08a24',timed:'#8a5bd6',express:'#2b2a36',ret:'#0f9f99'};
const BOXC=['#d9a066','#cf9458','#e0ad74'];
function parcel(p,w,h,d,x,y,z,col){ const g=new T.Group(); g.position.set(x,y,z); p.add(g); B(g,w,h,d,col||pick(BOXC),0,0,0,true); B(g,w*.2,h+.012,d+.012,'#f3dfb8',0,0,0); return g; }
function buildCourier(type){
  const g=new T.Group(), b=new T.Group(); g.add(b); const u=UNI[type];
  const legL=new T.Group(), legR=new T.Group(); legL.position.set(-.12,.42,0); legR.position.set(.12,.42,0); b.add(legL,legR);
  B(legL,.17,.42,.19,'#2c3a55',0,-.21,0,true); B(legR,.17,.42,.19,'#2c3a55',0,-.21,0,true); B(legL,.18,.1,.26,'#3b2616',0,-.39,.04); B(legR,.18,.1,.26,'#3b2616',0,-.39,.04);
  const up=new T.Group(); b.add(up);
  CY(up,.22,.28,.52,u,0,.68,0,true); B(up,.5,.07,.42,type==='express'?'#ffd23f':'#fffdf6',0,.5,0);
  SP(up,.24,pick(SKIN),0,1.13,0,true); SP(up,.03,'#3b2616',-.09,1.14,.215); SP(up,.03,'#3b2616',.09,1.14,.215);
  const capm=add(up,geo('cap',()=>new T.SphereGeometry(.255,16,8,0,Math.PI*2,0,Math.PI/2)),u,0,1.17,0,true);
  if(type==='express'){ capm.scale.set(1.06,1.15,1.06); B(up,.08,.3,.5,'#ffd23f',0,1.3,0); }
  else { const br=CY(up,.2,.2,.04,u,0,1.2,.2); br.scale.set(1,1,.8); SP(up,.05,'#fffdf6',0,1.3,.2); }
  B(up,.11,.13,.4,u,-.3,.74,.17,true); B(up,.11,.13,.4,u,.3,.74,.17,true);
  let load;
  if(type==='bulk'){ load=new T.Group(); up.add(load); parcel(load,.5,.34,.42,0,.62,.52); parcel(load,.44,.3,.38,.02,.94,.52); parcel(load,.4,.26,.34,-.02,1.22,.52); parcel(load,.3,.2,.28,.03,1.45,.52,'#f3dfb8'); }
  else if(type==='cart'){ load=new T.Group(); b.add(load); B(load,.56,.06,.6,'#56637a',0,.14,.72,true); B(load,.05,1,.05,'#7a8696',-.24,.62,.42); B(load,.05,1,.05,'#7a8696',.24,.62,.42); B(load,.53,.05,.05,'#7a8696',0,1.1,.42);
    [-.27,.27].forEach(x=>{const w=CY(load,.11,.11,.07,'#2b2b33',x,.11,.86,true);w.rotation.z=Math.PI/2;});
    parcel(load,.5,.36,.5,0,.35,.74); parcel(load,.46,.32,.46,.01,.69,.74); parcel(load,.36,.26,.36,-.02,.98,.74); }
  else if(type==='timed'){ load=parcel(up,.42,.36,.34,0,.72,.44,'#eef2fb'); const f=CY(load,.13,.13,.02,'#fffdf6',0,0,.18); f.rotation.x=Math.PI/2; B(load,.02,.1,.02,'#8a5bd6',0,.04,.2); B(load,.08,.02,.02,'#8a5bd6',.03,0,.2); }
  else if(type==='express'){ load=parcel(up,.44,.3,.34,0,.72,.44,'#ef4a3c'); B(up,.5,.1,.06,'#ef4a3c',0,.95,-.2); const sc=B(up,.1,.06,.4,'#ef4a3c',.12,.9,-.42); sc.rotation.x=.4; }
  else if(type==='impatient'){ load=parcel(up,.34,.26,.3,0,.72,.42); }
  else if(type==='ret'){ B(up,.3,.4,.03,'#fffdf6',0,.74,.36,true); }
  else load=parcel(up,.42,.34,.36,0,.72,.44);
  return {g,b,up,legL,legR};
}
const gaugeBgMat=new T.SpriteMaterial({color:0x3b2616,depthTest:false,transparent:true});
function makeCourier(type,dest){
  const def=TYPES[type], v=buildCourier(type);
  const lab=new T.Sprite(new T.SpriteMaterial({map:labelTex(dest,type),depthTest:false,transparent:true})); lab.center.set(.5,0); lab.scale.set(.64,.56,1); lab.position.y=1.5; lab.renderOrder=20;
  const gb=new T.Sprite(gaugeBgMat); gb.scale.set(.52,.085,1); gb.position.y=1.47; gb.renderOrder=21;
  const gm=new T.SpriteMaterial({color:0x35c46a,depthTest:false,transparent:true}); const gf=new T.Sprite(gm); gf.center.set(0,.5); gf.position.set(-.235,1.47,0); gf.scale.set(.47,.05,1); gf.renderOrder=22;
  v.g.add(lab,gb,gf); world.add(v.g);
  const c={type,def,dest,size:def.size,patMax:cfg.pat*def.pat,pat:cfg.pat*def.pat,state:'walk',v,lab,gb,gf,gm,x:-8.6,y:.06,z:QZ+rnd(-.12,.12),tx:0,tz:QZ,speed:4.4,ph:rnd(0,6),face:Math.PI/2,labOff:0,labY:0,t:0,jz:rnd(-.14,.14)};
  v.g.position.set(c.x,c.y,c.z); v.b.rotation.y=c.face; return c;
}
function killCourier(c){ world.remove(c.v.g); c.lab.material.dispose(); c.gm.dispose(); }

/* ================= particles ================= */
const PMAX=420, parts=[];
const pMesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({side:T.DoubleSide,transparent:true,depthWrite:false}),PMAX);
pMesh.frustumCulled=false; pMesh.setColorAt(0,new T.Color(1,1,1)); pMesh.count=0; pMesh.renderOrder=15; scene.add(pMesh);
const _d=new T.Object3D(), _c=new T.Color();
const CONF=['#ff8a1f','#ffd23f','#ef4a3c','#2f86e0','#2fa866','#8a5bd6','#ffffff'];
function burst(x,y,z,n,kind,pow){ for(let i=0;i<n&&parts.length<PMAX;i++){ const a=rnd(0,Math.PI*2),s=rnd(.4,1)*(pow||5);
  if(kind==='smoke') parts.push({x:x+rnd(-.2,.2),y:y+rnd(0,.6),z:z+.3,vx:Math.cos(a)*.8,vy:rnd(.6,1.8),vz:0,g:0,life:rnd(.5,.9),t:0,s:rnd(.25,.5),col:pick(['#8d8d99','#b9b9c4','#6f6f7c']),rot:0,vr:rnd(-2,2),grow:1.2});
  else parts.push({x,y,z:z+.3,vx:Math.cos(a)*s*.7,vy:Math.abs(Math.sin(a))*s+rnd(1,3),vz:rnd(-.5,1.5),g:-13,life:rnd(.7,1.3),t:0,s:rnd(.1,.2),col:pick(CONF),rot:rnd(0,6),vr:rnd(-12,12),grow:0}); } }
function rain(n){ const w=view.h*camera.aspect; for(let i=0;i<n&&parts.length<PMAX;i++) parts.push({x:camT.x+rnd(-w/2,w/2),y:camT.y+view.h/2+rnd(0,6),z:rnd(.5,3),vx:rnd(-1,1),vy:rnd(-9,-4),vz:0,g:-3,life:rnd(1.6,2.6),t:0,s:rnd(.16,.32),col:pick(CONF),rot:rnd(0,6),vr:rnd(-10,10),grow:0}); }
function updParts(dt){ let n=0; for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.t+=dt; if(p.t>=p.life){parts.splice(i,1);continue;}
    p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; p.rot+=p.vr*dt; }
  for(const p of parts){ const k=1-p.t/p.life, s=p.s*(1+p.grow*p.t)*(p.grow?k:Math.min(1,k*3)); _d.position.set(p.x,p.y,p.z); _d.rotation.set(p.grow?0:p.rot*.7,p.grow?0:p.rot,p.rot); _d.scale.set(s,s*(p.grow?1:.6),s); _d.updateMatrix();
    pMesh.setMatrixAt(n,_d.matrix); pMesh.setColorAt(n,_c.set(p.col).convertSRGBToLinear()); n++; }
  pMesh.count=n; pMesh.instanceMatrix.needsUpdate=true; if(pMesh.instanceColor) pMesh.instanceColor.needsUpdate=true; }

/* ================= game state ================= */
let mode='title', demo=true;
let queue=[], riders=[], others=[], returns=[];
const E={pos:0,v:0,mode:'idle',target:0,lastDir:1,lock:0,exitQ:[],stopN:0,queued:0,openT:0,door:1,floor:0};
const G={time:0,delivered:0,missed:0,score:0,combo:0,comboT:0,comboW:6,maxCombo:0,spawnT:0,hot:[],hotT:0,endT:0,over:false,autoWait:0,tickS:-1};
const input={up:false,down:false,last:0};
const held=()=> input.up&&input.down ? input.last : input.up?1 : input.down?-1 : 0;
let dirty=true, shake=0;

function used(){ let s=0; for(const p of riders) s+=p.size; return s; }
function resetGame(isDemo){
  demo=isDemo; [...queue,...riders,...others,...returns].forEach(killCourier); queue=[]; riders=[]; others=[]; returns=[]; parts.length=0;
  Object.assign(E,{pos:0,v:0,mode:'idle',target:0,lastDir:1,lock:0,exitQ:[],stopN:0,queued:0,openT:0,door:1,floor:0});
  Object.assign(G,{time:cfg.time,delivered:0,missed:0,score:0,combo:0,comboT:0,comboW:5+N*.14,maxCombo:0,missAll:0,pend:null,pendT:0,spawnT:.4,retT:cfg.ret[1],retSeen:false,hot:[],hotT:0,endT:0,over:false,autoWait:0,tickS:-1});
  input.up=input.down=false; $('btnUp').classList.remove('on'); $('btnDown').classList.remove('on');
  for(let i=0;i<3;i++){ const c=spawn(true); c.x=QX-i*.7-1.5; }
  $('hot').hidden=demo||!cfg.hotP; $('hot').textContent=''; dirty=true; floorsFx.forEach(f=>f.on=false); buildMisses(); hudForce();
}
function rollDest(){
  return 2+(Math.random()*(N-1)|0);
}
function spawn(plain,dest){
  let type='normal';
  if(!plain&&Math.random()<cfg.special){ const w=diffKey==='extreme'?['impatient','impatient','bulk','bulk','cart','cart','timed','timed','express','express']:['impatient','impatient','impatient','bulk','bulk','cart','cart','timed','timed','express']; type=pick(w); }
  const c=makeCourier(type,dest||rollDest());
  if(type==='express'&&!demo){ queue.unshift(c); c.x=-6; c.speed=6; alertMsg(__('msg.express','⚡ 超特急が割り込み！')); SFX.alert(); }
  else queue.push(c);
  return c;
}

function spawnRet(){
  const fl=1+(Math.random()*(N-1)|0); if(returns.filter(c=>c.fl===fl).length>=2) return;
  const c=makeCourier('ret',1); c.state='rwalk'; c.fl=fl; c.y=fl*FH; c.x=pick([-3.45,-1.35]); c.z=-D+.6; c.speed=2.6; c.v.g.position.set(c.x,c.y,c.z); returns.push(c);
  if(!demo&&!G.retSeen){ G.retSeen=true; alertMsg(fmt(__('msg.ret','↓ {f}Fに帰りの配達員！ 止まって乗せよう'),{f:fl+1})); SFX.alert(); }
}
/* ---------- elevator ---------- */
const START=2.4;
const atBound=d=>(d>0&&E.pos>=N-1)||(d<0&&E.pos<=0);
function autoNext(d){ E.target=clamp(d>0?Math.floor(E.pos+1e-4)+1:Math.ceil(E.pos-1e-4)-1,0,N-1); E.mode='auto'; }
function arrive(f){
  E.tapBase=null; E.pos=f; E.v=0; E.mode='idle'; E.floor=f;
  const list=riders.filter(p=>p.dest===f+1); if(list.length){ E.exitQ=list; E.stopN=list.length; E.lock=.14; E.openT=1; if(!demo) SFX.ding(); }
}
function repack(){
  const cols=cfg.cap/2, sp=cols===3?.62:cols===4?.5:.42, colX=c=>CABX+(c-(cols-1)/2)*sp; let col=cols-1; const singles=[];
  for(const p of riders){ if(p.size===2){ p.sx=colX(col); p.sz=-1.35; p.labOff=.2; col--; } else singles.push(p); }
  let k=0; for(const p of singles){ const c=col-(k>>1), back=!(k&1); p.sx=colX(Math.max(0,c)); p.sz=back?-1.8:-.85; p.labOff=back?.42:0; k++; }
  dirty=true;
}
function board(c){ let i=queue.indexOf(c); if(i>=0) queue.splice(i,1); i=returns.indexOf(c); if(i>=0) returns.splice(i,1); c.bf=E.pos; E.boarder=c; riders.push(c); c.state='board'; c.speed=c.def.boardSp; repack(); c.tx=c.sx; c.tz=c.sz; E.lock=c.def.boardT; if(!demo) SFX.board(); }
function startExit(p){
  riders.splice(riders.indexOf(p),1); others.push(p); repack();
  p.state='exit'; p.y=E.floor*FH; p.tx=pick([-3.45,-1.35]); p.tz=-D+.6; p.speed=p.type==='bulk'?2.2:3.8; if(p.dest===1){ p.y=.06; p.tx=-8.6; p.tz=-.55; p.speed=4.6; } p.lab.visible=p.gb.visible=p.gf.visible=false;
  E.openT=.7; deliver(p);
}
function deliver(p){
  G.delivered++; if(demo) return;
  G.combo=G.comboT>0?G.combo+1:1; G.comboT=G.comboW; G.maxCombo=Math.max(G.maxCombo,G.combo);
  const mult=Math.min(3,1+.1*(G.combo-1)), pts=Math.round(p.def.pts*mult/10)*10; G.score+=pts;
  const wy=E.floor*FH+1.6; popAt(CABX-1.2,wy,0,'+'+pts,''); burst(CABX-1.1,wy-.4,-.6,10,'conf',4); SFX.deliver(G.combo);
  let healed=false; if(cfg.heal&&G.combo%10===0&&G.missed>0){ G.missed--; healed=true; buildMisses(); }
  if(G.combo===3) banner('COMBO!','','combo'), fx(1);
  else if(G.combo===5) banner('SUPER COMBO!','','super'), fx(2);
  else if(G.combo>5&&G.combo%5===0) banner(G.combo+' COMBO!!',healed?__('msg.comboHeal','再配達を1つ取り消し！'):G.combo>=15?__('msg.comboGod','神さばき！'):__('msg.comboGood','その調子！'),'super'), fx(2);
  else if(G.combo>1){ const el=$('combo'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function bonus(n){ if(demo) return; const pts=50*n*n; G.score+=pts; banner2('BONUS! ×'+n); popAt(CABX,E.floor*FH+2.3,0,fmt(__('msg.bonus','まとめ配達 +{n}'),{n:pts}),'info'); burst(CABX,E.floor*FH+1.2,-.5,18,'conf',6); SFX.bonus(); }
function fx(level){ shake=Math.max(shake,level===2?.5:.3); const f=$('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  burst(CABX,E.pos*FH+1.2,0,level===2?50:28,'conf',level===2?9:7); if(level===2) rain(90); SFX.combo(level===2); }
function miss(c){
  let i=queue.indexOf(c); if(i>=0) queue.splice(i,1); i=returns.indexOf(c); if(i>=0) returns.splice(i,1); i=riders.indexOf(c); if(i>=0){ riders.splice(i,1); repack(); }
  others.push(c); c.state='miss'; c.t=.7; c.lab.visible=c.gb.visible=c.gf.visible=false; dirty=true;
  if(demo) return;
  G.missed++; G.missAll++; G.combo=0; G.comboT=0; popAt(c.x,c.y+1.9,c.z,c.type==='ret'?__('msg.missRet','待ちきれない！'):__('msg.miss','再配達！'),'bad'); burst(c.x,c.y+.4,c.z,10,'smoke'); SFX.miss(); shake=Math.max(shake,.25);
  const v=$('vign'); v.classList.remove('go'); void v.offsetWidth; v.classList.add('go'); buildMisses();
  if(G.missed>=cfg.limit&&!G.over) finish(true);
}
function updElev(dt){
  E.openT-=dt;
  if(E.lock>0&&E.pos===0&&!E.exitQ.length&&!demo&&!G.over&&(E.queued>0||held()>0)){ // 出発を優先：乗り込み待ちを打ち切る
    const c=E.boarder; if(c&&c.state==='board'&&c.type==='bulk'){ const i=riders.indexOf(c); if(i>=0){ riders.splice(i,1); queue.unshift(c); c.state='queue'; c.speed=3.4; repack(); } }
    E.lock=0; E.boarder=null; }
  if(E.lock>0){ E.lock-=dt; if(E.lock>0) return; }
  if(E.exitQ.length){ const p=E.exitQ.shift(); if(riders.includes(p)){ startExit(p); E.lock=p.def.exitT; } if(!E.exitQ.length){ if(E.stopN>=2) bonus(E.stopN); E.stopN=0; } return; }
  const h=demo||G.over?0:held(), q=demo||G.over?0:E.queued; E.queued=0;
  if(q){
    if(E.mode==='auto'&&Math.sign(E.target-E.pos)===q){ if(h!==q) E.target=clamp(E.target+q,0,N-1); else { E.tapBase=E.target; E.mode='manual'; E.lastDir=q; } }
    else if(!atBound(q)){ E.mode='manual'; E.lastDir=q; if(Math.sign(E.v)!==q) E.v=q*START; if(h!==q) autoNext(q); }
  } else if(h&&E.mode!=='manual'&&!atBound(h)){ E.mode='manual'; E.lastDir=h; if(Math.sign(E.v)!==h) E.v=h*START; }
  if(E.mode==='manual'){
    if(!h){ const fast=Math.abs(E.v)>START*1.6, hadTap=E.tapBase!=null; autoNext(E.lastDir);
      if(cfg.magnet&&fast&&!hadTap){ const d=E.lastDir; let best=null,bd=99; const fs=[0]; for(const p of riders) fs.push(p.dest-1); for(const c of returns) fs.push(c.fl);
        for(const f of fs){ const dd=(f-E.pos)*d; if(dd>.05&&dd<=cfg.magnet&&dd<bd){ bd=dd; best=f; } } if(best!==null) E.target=best; }
      if(E.tapBase!=null){ E.target=clamp(E.lastDir>0?Math.max(E.target,E.tapBase+1):Math.min(E.target,E.tapBase-1),0,N-1); E.tapBase=null; } }
    else { if(h!==E.lastDir){ E.lastDir=h; E.v=h*START; }
      E.v=h*Math.min(cfg.speed,Math.abs(E.v)+cfg.speed*1.3*dt); E.pos+=E.v*dt;
      if(E.pos>=N-1) arrive(N-1); else if(E.pos<=0) arrive(0); }
  }
  if(E.mode==='auto'){ const dist=E.target-E.pos, ad=Math.abs(dist);
    const sp=Math.min(Math.max(Math.abs(E.v),START)+cfg.speed*1.3*dt,cfg.speed,Math.max(1.6,ad*5.5)), stp=sp*dt;
    if(stp>=ad) arrive(E.target); else { E.pos+=Math.sign(dist)*stp; E.v=Math.sign(dist)*sp; } }
  if(E.mode==='idle'&&E.pos>0&&E.lock<=0&&!h&&!G.over){ const u=used(); for(const c of returns){ if(c.fl===E.pos&&c.state==='wait'&&u+c.size<=cfg.cap){ board(c); E.openT=.6; break; } } }
  if(E.mode==='idle'&&E.pos===0&&E.lock<=0&&!h&&!G.over){
    const u=used(); for(let i=0;i<queue.length;i++){ const c=queue[i]; if(c.x<-4.6) break; if((c.state==='queue'||c.x>-2.6)&&u+c.size<=cfg.cap){ c.state='queue'; board(c); break; } } }
}
function autopilot(dt){
  if(E.mode!=='idle'||E.lock>0||E.exitQ.length) return;
  if(E.pos===0){ const u=used(); const can=queue.slice(0,5).some(c=>u+c.size<=cfg.cap); if(can&&G.autoWait<(riders.length?2.2:99)){ G.autoWait+=dt; return; } if(!riders.length) return; }
  G.autoWait=0; if(riders.some(p=>p.state==='board')) return;
  const u2=used(); if(E.pos>0&&u2<cfg.cap&&returns.some(c=>c.fl===E.pos)) return;
  const ups=riders.filter(p=>p.dest>1).map(p=>p.dest); let t=0;
  if(ups.length) t=Math.min.apply(null,ups)-1; else if(u2<cfg.cap){ const w=returns.filter(c=>c.fl<E.pos).map(c=>c.fl); if(w.length) t=Math.max.apply(null,w); } if(t!==E.pos){ E.target=t; E.mode='auto'; }
}

/* ---------- couriers update ---------- */
function updCourier(c,dt,time){
  const st=c.state; let moving=false;
  if(st==='walk'||st==='queue'||st==='board'||st==='ride'||st==='rwalk'||st==='wait'){
    c.pat-=dt*(st==='ride'||st==='board'?c.def.ride:1)*(demo?.5:1);
    if(c.pat<=0){ c.pat=0; if(st!=='ride'&&st!=='board'&&!G.over&&mode!=='count'){ miss(c); return; } }
  }
  if(st==='ride'){ c.x=lerp(c.x,c.sx,Math.min(1,dt*10)); c.z=lerp(c.z,c.sz,Math.min(1,dt*10)); c.y=E.pos*FH; c.face=0; }
  else if(st==='miss'){ c.t-=dt; const k=Math.max(0,c.t/.7); c.v.g.scale.setScalar(k); c.y+=dt*2.5; c.v.b.rotation.y+=dt*14; if(c.t<=0){ c.dead=true; } }
  else if(st==='gone'){ c.t-=dt; c.v.g.scale.setScalar(Math.max(0,c.t/.3)); if(c.t<=0) c.dead=true; }
  else { if(st==='board'){ c.tx=c.sx; c.tz=c.sz; if(E.pos!==c.bf){ c.state='ride'; } }
    const dx=c.tx-c.x, dz=c.tz-c.z, d=Math.hypot(dx,dz), s=c.speed*dt;
    if(d>.02){ moving=true; if(s>=d){ c.x=c.tx; c.z=c.tz; } else { c.x+=dx/d*s; c.z+=dz/d*s; } if(Math.abs(dx)>.05) c.face=dx>0?Math.PI/2:-Math.PI/2; }
    else { if(st==='walk') c.state='queue'; else if(st==='board') c.state='ride'; else if(st==='exit'){ c.state='gone'; c.t=.3; c.face=Math.PI; } else if(st==='rwalk') c.state='wait'; else if(st==='queue'||st==='wait') c.face=Math.PI/2; }
  }
  // visuals
  const v=c.v; let r=v.b.rotation.y; if(st!=='miss'){ let df=c.face-r; v.b.rotation.y=r+df*Math.min(1,dt*14); }
  const frac=clamp(c.pat/c.patMax,0,1), low=frac<.28&&(st==='queue'||st==='walk'||st==='ride'||st==='wait');
  if(moving){ c.ph+=dt*c.speed*4.2; const sw=Math.sin(c.ph)*.7; v.legL.rotation.x=sw; v.legR.rotation.x=-sw; v.up.position.y=Math.abs(Math.sin(c.ph))*.05; }
  else { v.legL.rotation.x*=.7; v.legR.rotation.x*=.7; const imp=c.type==='impatient'||low; v.up.position.y=imp?Math.abs(Math.sin(time*(low?16:9)+c.ph))*.07:Math.sin(time*3+c.ph)*.012; }
  v.g.position.set(c.x+(low?Math.sin(time*40+c.ph)*.02:0),c.y,c.z);
  if(c.lab.visible){ c.labY=lerp(c.labY,st==='ride'||st==='board'?c.labOff:0,Math.min(1,dt*8)); const y=1.62+c.labY; c.lab.position.y=y+(c.type==='express'?Math.abs(Math.sin(time*8))*.05:0); c.gb.position.y=c.gf.position.y=y-.07;
    c.gf.scale.x=.47*frac+.0001; c.gm.color.setHex(frac>.5?0x35c46a:frac>.28?0xffb81f:(Math.sin(time*18)>0?0xef4a3c:0xffd0c8)); }
}

/* ================= HUD / DOM ================= */
function popAt(x,y,z,txt,cls){ const p=new T.Vector3(x,y,z).project(camera); const el=document.createElement('div'); el.className='pop '+(cls||''); el.textContent=txt;
  el.style.left=clamp((p.x*.5+.5)*vw,50,vw-50)+'px'; el.style.top=clamp((-p.y*.5+.5)*vh,90,vh-60)+'px'; $('pops').appendChild(el); el.addEventListener('animationend',()=>el.remove()); setTimeout(()=>el.remove(),1800); }
function banner(t,s,cls){ const b=$('banner'); b.className='banner'; void b.offsetWidth; b.className='banner show '+cls; b.querySelector('.bt').textContent=t; b.querySelector('.bs').textContent=s||''; clearTimeout(banner.t); banner.t=setTimeout(()=>b.classList.remove('show'),1500); }
function banner2(t){ const b=$('banner2'); b.className='banner small'; void b.offsetWidth; b.className='banner small show'; b.querySelector('.bt').textContent=t; clearTimeout(banner2.t); banner2.t=setTimeout(()=>b.classList.remove('show'),1500); }
function alertMsg(t){ const a=$('alert'); a.textContent=t; a.classList.remove('go'); void a.offsetWidth; a.classList.add('go'); }
function buildMisses(){ let h='<b style="margin-right:3px">'+__('hud.misses','再配達')+'</b>'; for(let i=0;i<cfg.limit;i++) h+='<span class="'+(i<G.missed?'on':'')+'"></span>'; $('misses').innerHTML=h; }
const shown={};
function setTxt(id,v){ if(shown[id]!==v){ shown[id]=v; $(id).textContent=v; } }
function hudForce(){ for(const k in shown) delete shown[k]; }
function updHud(){
  const t=Math.ceil(G.time); setTxt('time',t); $('timePill').classList.toggle('warn',t<=10&&mode==='play');
  setTxt('count',G.delivered); setTxt('score',G.score.toLocaleString());
  setTxt('floorNow',(Math.round(E.pos)+1)+'F');
  const cw=$('comboWrap'); const on=G.combo>=2&&G.comboT>0; if(cw.hidden===on) cw.hidden=!on;
  if(on){ setTxt('combo',G.combo+' COMBO'); $('comboBar').firstElementChild.style.width=(G.comboT/G.comboW*100)+'%'; }
  if(dirty){ dirty=false; const u=used(); $('capText').textContent=u+' / '+cfg.cap; $('capText').classList.toggle('full',u>=cfg.cap);
    const s=riders.slice().sort((a,b)=>a.dest-b.dest); let h=''; for(const p of s) h+='<span class="chip'+(p.size>1?' w':'')+'" style="background:'+p.def.css+'">'+p.dest+'F</span>';
    for(let i=u;i<cfg.cap;i++) h+='<span class="chip empty">0</span>'; $('chips').innerHTML=h;
    const set=new Set(riders.map(p=>p.dest-1)); floorsFx.forEach((f,i)=>{ f.on=set.has(i); }); }
}
const mini=$('mini'), mctx=mini.getContext('2d'); let miniH=0;
function drawMini(){ if(mini.hidden||!miniH) return; const g=mctx, w=30, h=miniH, dpr=Math.min(2,devicePixelRatio||1); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
  rr(g,6,2,18,h-4,9); g.fillStyle='rgba(255,248,232,.92)'; g.fill(); g.lineWidth=2.5; g.strokeStyle=INK; g.stroke();
  const Y=i=>h-14-i/(N-1)*(h-28); g.fillStyle='rgba(59,38,22,.35)'; for(let i=0;i<N;i++){ g.fillRect(i%5===4?9:12,Y(i)-.5,i%5===4?12:6,1); }
  const cnt={}; for(const p of riders) cnt[p.dest-1]=(cnt[p.dest-1]||0)+1;
  g.font='11px '+FD; g.textAlign='center'; g.textBaseline='middle';
  for(const k in cnt){ const y=Y(+k); g.beginPath(); g.arc(15,y,8,0,7); g.fillStyle='#ffd23f'; g.fill(); g.strokeStyle=INK; g.lineWidth=2; g.stroke(); g.fillStyle=INK; g.fillText(cnt[k],15,y+1); }
  for(const c of returns){ const y=Y(c.fl); g.beginPath(); g.moveTo(0,y-6); g.lineTo(9,y); g.lineTo(0,y+6); g.closePath(); g.fillStyle='#0f9f99'; g.fill(); g.strokeStyle=INK; g.lineWidth=1.5; g.stroke(); }
  const ey=Y(E.pos); rr(g,1,ey-7,28,14,5); g.fillStyle='#ff8a1f'; g.fill(); g.lineWidth=2.5; g.strokeStyle=INK; g.stroke(); g.fillStyle='#fff'; g.fillText(Math.round(E.pos)+1,15,ey+1); }

/* ================= camera / resize ================= */
let vw=1,vh=1; const view={h:22}, camT={x:VIEW_CX,y:6}; let camY=6, insetTop=0, insetBot=0;
function resize(){ const a=$('dr-app'); vw=a.clientWidth||1; vh=a.clientHeight||1; const pr=Math.min(2,window.devicePixelRatio||1); renderer.setPixelRatio(pr); renderer.setSize(vw,vh,false);
  camera.aspect=vw/vh; const land=vw/vh>=1.1; view.h=Math.max(VIEW_W/camera.aspect,Math.min(N*FH+6,23));
  const hudOn=!$('hud').hidden; insetTop=hudOn?84/vh:.02; insetBot=hudOn&&!land?($('bottom').offsetHeight+6)/vh:.03;
  camera.updateProjectionMatrix();
  miniH=Math.max(60,land?vh-110:vh-94-(hudOn?$('bottom').offsetHeight:0)-10); const dpr=Math.min(2,devicePixelRatio||1); mini.width=30*dpr; mini.height=miniH*dpr; mini.style.height=miniH+'px'; }
function updCamera(dt,time){
  const H=view.h, lo=-1.3+H/2-insetBot*H, hi=N*FH+3.2-H/2+insetTop*H;
  let ty= hi<=lo ? (mode==='title'||demo? lo : lo) : clamp(E.pos*FH+1.2+(insetTop-insetBot)*H*.5+H*.02,lo,hi);
  if(demo&&hi>lo) ty=clamp(E.pos*FH+1+H*.12,lo,hi);
  camY=lerp(camY,ty,Math.min(1,dt*5)); camT.y=camY;
  const land=camera.aspect>=1.1; camT.x=land?VIEW_CX-(view.h*camera.aspect-VIEW_W)*.12:VIEW_CX;
  const dist=H/2/Math.tan(camera.fov*Math.PI/360);
  let sx=0,sy=0; if(shake>0){ shake-=dt; sx=Math.sin(time*90)*shake*.5; sy=Math.cos(time*77)*shake*.5; }
  const sway=demo?Math.sin(time*.35)*.05:0;
  camera.position.set(camT.x-dist*(.13+sway)+sx,camY+dist*.055+sy,dist); camera.lookAt(camT.x+sx,camY+sy,-1.2);
  sun.position.set(camT.x-11,camY+17,22); sun.target.position.set(camT.x,camY,-1.2);
}

/* ================= main loop ================= */
let last=0;
function frame(ms){
  if(DY) return; /* 已销毁：停止渲染循环 */
  requestAnimationFrame(frame);
  const time=ms/1000; let dt=Math.min(.05,time-last||0); last=time;
  if(mode==='pause'){ renderer.render(scene,camera); return; }
  const sim=mode==='play'||mode==='title'||mode==='count'||mode==='end';
  if(sim){
    if(mode==='play'&&!G.over){ G.time-=dt; if(G.time<=10){ const s=Math.ceil(G.time); if(s!==G.tickS){ G.tickS=s; if(s>0) SFX.tick(); } AU.fast=true; } if(G.time<=0){ G.time=0; finish(false); } }
    if(G.comboT>0){ G.comboT-=dt; if(G.comboT<=0) G.combo=0; }
    if(demo) autopilot(dt);
    if(mode!=='count') updElev(dt);
    // spawn
    if((mode==='play'||demo)&&!G.over){ G.hotT-=dt; if(G.hotT<=0){ G.hotT=rnd(9,14); const k=N<=5?1:N<=10?2:3; const hs=new Set(); for(let i=0;i<k;i++) hs.add(2+(Math.random()*(N-1)|0)); G.hot=[...hs].sort((a,b)=>a-b);
        if(!demo&&cfg.hotP){ const el=$('hot'); el.innerHTML=__('msg.hot','いま人気')+G.hot.map(f=>'<b>'+f+'F</b>').join(''); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
      G.retT-=dt; if(G.retT<=0){ G.retT=rnd(cfg.ret[0],cfg.ret[1])*(demo?1.5:1); if(returns.length<cfg.retMax) spawnRet(); }
      if(G.pend&&G.pend.n>0){ G.pendT-=dt; if(G.pendT<=0){ G.pendT=.38; G.pend.n--; if(queue.length<cfg.maxQ) spawn(false,G.pend.dest); } }
      else { G.spawnT-=dt; if(G.spawnT<=0){ const ramp=demo?1.3:1-.22*(1-G.time/cfg.time); let n=1;
        if(Math.random()<cfg.grpP){ n=cfg.grp[0]+(Math.random()*(cfg.grp[1]-cfg.grp[0]+1)|0); G.pend={dest:rollDest(),n}; G.pendT=0; if(!demo&&n>=3) alertMsg(fmt(__('msg.group','{f}Fへ まとめて{n}人！'),{f:G.pend.dest,n})); }
        else if(queue.length<cfg.maxQ) spawn(false);
        G.spawnT=rnd(cfg.spawn[0],cfg.spawn[1])*ramp*n; } } }
    let qx=QX; for(const c of queue){ c.tx=qx; c.tz=QZ+c.jz; qx-=c.def.qw; if(c.type==='cart') qx-=.0; }
    const perF={}; for(const f of floorsFx) f.w=false;
    for(const c of returns){ const k=perF[c.fl]||0; perF[c.fl]=k+1; c.tx=SX0-.45-k*.64; c.tz=-1.3+c.jz; if(floorsFx[c.fl]) floorsFx[c.fl].w=true; }
    for(const c of queue.slice()) updCourier(c,dt,time);
    for(const c of returns.slice()) updCourier(c,dt,time);
    for(const c of riders.slice()) updCourier(c,dt,time);
    for(let i=others.length-1;i>=0;i--){ const c=others[i]; updCourier(c,dt,time); if(c.dead){ killCourier(c); others.splice(i,1); } }
    if(mode==='end'){ G.endT-=dt; if(G.endT<=0) showResult(); }
  }
  // cab visuals
  cab.position.y=E.pos*FH+.02; const top=N*FH; cable.scale.y=Math.max(.01,top+.8-(cab.position.y+2.1)); cable.position.y=(top+.8+cab.position.y+2.1)/2;
  const cwm=world.getObjectByName('cw'); if(cwm) cwm.position.y=(N-1-E.pos)*FH+1;
  const open=E.mode==='idle'&&(E.pos===0||E.openT>0||E.lock>0)?1:0; E.door=lerp(E.door,open,Math.min(1,dt*12));
  cabDoors[0].scale.z=cabDoors[1].scale.z=1-E.door*.9; cabDoors[0].position.z=-1.3-.525-E.door*.47; cabDoors[1].position.z=-1.3+.525+E.door*.47;
  drawCabSign((E.mode==='idle'?'':E.v>0?'▲ ':'▼ ')+(Math.round(E.pos)+1)+'F');
  for(const f of floorsFx){ const act=f.on||f.w; if(act) f.mat.color.setHex(f.on?0xffc400:0x12c5b8); const ta=act?.3+Math.sin(time*7)*.14:0; f.a=lerp(f.a,ta,Math.min(1,dt*10)); f.mesh.visible=f.a>.01; f.mat.opacity=f.a; }
  updTruck(dt,time);
  for(const c of clouds){ c.position.x+=c.userData.v*dt; if(c.position.x>60) c.position.x=-60; }
  updParts(dt); updCamera(dt,time);
  if(!demo){ updHud(); drawMini(); }
  renderer.render(scene,camera);
}

/* ================= flow ================= */
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('show',s.id===id)); }
function setHud(on){ $('hud').hidden=!on; $('mini').hidden=!(on&&N>=10); resize(); }
function toTitle(){ bgmStop(); mode='title'; setHud(false); resetGame(true); show('title'); $('cd').classList.remove('show'); }
let cdTimers=[];
function startGame(){
  auInit(); if(AU.ctx&&AU.ctx.state==='suspended') AU.ctx.resume();
  cdTimers.forEach(clearTimeout); cdTimers=[]; show(''); resetGame(false); setHud(true); mode='count'; camY=view.h/2-1.3;
  const cd=$('cd'); cd.classList.add('show');
  ['3','2','1','GO!'].forEach((s,i)=>cdTimers.push(setTimeout(()=>{ if(mode!=='count') return; cd.innerHTML='<span>'+s+'</span>'; SFX.count(i===3); if(i===3){ mode='play'; bgmStart(); cdTimers.push(setTimeout(()=>cd.classList.remove('show'),600)); } },i*650)));
}
function finish(over){ if(G.over) return; G.over=true; mode='end'; G.endT=1.9; bgmStop(); SFX.end(); E.queued=0;
  banner(over?'GAME OVER':'TIME UP!',over?__('msg.gameoverSub','再配達が多すぎた…'):__('msg.timeupSub','おつかれさま！'),over?'bad':'info'); if(!over) rain(80); }
function showResult(){
  mode='result'; const tot=G.delivered+G.missAll, eff=tot?Math.round(G.delivered/tot*100):0;
  const expct=cfg.time/((cfg.spawn[0]+cfg.spawn[1])/2*.9), r=G.delivered/expct, failed=G.missed>=cfg.limit;
  const rank=failed?'C':r>=.72&&eff>=92?'S':r>=.55&&eff>=80?'A':r>=.38?'B':'C';
  $('resTitle').textContent=failed?__('res.titleOver','本日の配達結果（再配達オーバーで営業中止）'):__('res.title','本日の配達結果');
  $('resDiff').textContent=fmt(__('res.diff','{d}・{b}'),{d:cfg.name,b:STYLES[diffKey].bname}); $('resDiff').style.background=cfg.col;
  let best=0,isNew=false; try{ best=+localStorage.getItem('dr_best_'+diffKey)||0; if(G.score>best){ localStorage.setItem('dr_best_'+diffKey,G.score); isNew=G.score>0; } }catch(e){}
  const dt=new Date(), ds=dt.getFullYear()+'/'+(dt.getMonth()+1)+'/'+dt.getDate();
  $('resSub').textContent=ds+__('sep.wsp','　')+(isNew?__('res.newBest','★ 自己ベスト更新！'):best?fmt(__('res.best','自己ベスト {n}'),{n:best.toLocaleString()}):'');
  $('rank').textContent=rank; const rk=$('rank'); rk.style.animation='none'; void rk.offsetWidth; rk.style.animation='';
  const vals={rDel:G.delivered,rMiss:G.missAll,rCombo:G.maxCombo,rEff:eff,rScore:G.score}; const t0=performance.now();
  (function cnt(){ const k=Math.min(1,(performance.now()-t0)/900); for(const id in vals) $(id).textContent=Math.round(vals[id]*k).toLocaleString(); if(k<1&&mode==='result') requestAnimationFrame(cnt); })();
  lastRes={k:diffKey,score:G.score,del:G.delivered,combo:G.maxCombo,done:false};
  const can=RANKS.includes(diffKey)&&G.score>0; $('regBox').hidden=!can;
  if(can){ $('regBtn').disabled=false; $('regMsg').textContent=__('rank.canRegister','スコアをランキングに登録できます'); try{ if(!$('nick').value) $('nick').value=localStorage.getItem('dr_nick')||''; }catch(e){}
    caps().then(()=>{ if(!DB||!UID){ $('regBtn').disabled=true; $('regMsg').textContent=__('rank.noStorage','この端末ではランキング登録を利用できません（ブラウザの保存機能がオフです）'); } }); }
  show('result'); if(rank==='S'||rank==='A') SFX.combo(true);
}

/* ================= ranking ================= */
const RANKS=['normal','hard','extreme'];
let DB=null, UID=null, capP=null, lastRes=null, rankTab='hard', rankFrom='title', rankCache={};
function caps(){ return capP||(capP=Promise.resolve().then(()=>{ DB=true; try{ UID=localStorage.getItem('dr_key'); if(!UID){ UID=(crypto.randomUUID?crypto.randomUUID():'k'+Date.now())+'-'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2); localStorage.setItem('dr_key',UID); } }catch(e){ UID=null; } })); }
const api=async(path,opt)=>{ const r=await fetch(path,Object.assign({cache:'no-store'},opt,{headers:Object.assign({},UID?{'X-Player-Key':UID}:{},opt&&opt.headers)})); if(!r.ok){ const e=new Error('http '+r.status); e.status=r.status; throw e; } return r.json(); };
async function loadRank(k){
  const d=await api('/api/rank?diff='+k);
  const top=(d.top||[]).map(r=>({id:r.me?UID:'',score:+r.score||0,del:+r.del||0,combo:+r.combo||0,name:String(r.name||__('rank.defaultName','ななし')).slice(0,12)}));
  return rankCache[k]={top,mine:d.mine||null};
}
const posTxt=m=>!m?__('rank.unregistered','未登録'):m.over?__('rank.beyond','1000位以下'):fmt(__('rank.rankN','{n}位'),{n:m.rank});
function drawRank(){
  const c=rankCache[rankTab], list=$('rlist'); list.textContent=''; $('myJump').hidden=true;
  document.querySelectorAll('.tab').forEach(b=>{ b.classList.toggle('sel',b.dataset.k===rankTab); const cc=rankCache[b.dataset.k]; b.querySelector('small').textContent=cc&&cc.top?__('rank.you','あなた ')+posTxt(cc.mine):''; });
  const msg=t=>{ const d=document.createElement('div'); d.className='rmsg'; d.textContent=t; list.appendChild(d); };
  if(!c){ $('myTxt').textContent=__('rank.loading','よみこみ中…'); msg(__('rank.loading','よみこみ中…')); return; }
  if(c.err){ $('myTxt').textContent=__('rank.myPosDash','あなたの現在地：—'); msg(c.err); return; }
  const m=c.mine, mt=$('myTxt'); mt.textContent=__('rank.myPos','あなたの現在地：');
  const b=document.createElement('b'); b.textContent=posTxt(m); mt.appendChild(b);
  if(m) mt.appendChild(document.createTextNode(__('sep.wsp','　')+fmt(__('rank.points','{n}点'),{n:m.score.toLocaleString()})+(m.inTop?'':__('rank.outOfTop','（100位圏外）')))); else mt.appendChild(document.createTextNode(__('sep.wsp','　')+fmt(__('rank.invite','{d}で遊んで登録しよう'),{d:DIFFS[rankTab].name})));
  if(!c.top.length){ msg(__('rank.empty','まだ登録がありません。最初の1人になろう！')); return; }
  c.top.forEach((r,i)=>{ const row=document.createElement('div'); row.className='rrow'+(i<3?' t'+(i+1):'')+(r.id===UID?' me':''); if(r.id===UID) row.id='meRow';
    const rk=document.createElement('div'); rk.className='rk'; rk.textContent=i+1;
    const nm=document.createElement('div'); nm.className='nm'; nm.textContent=r.name; nm.setAttribute('data-you',__('rank.youTag','あなた')); const sm=document.createElement('small'); sm.textContent=fmt(__('rank.statLine','{del}人・最大{combo}コンボ'),{del:r.del,combo:r.combo}); nm.appendChild(sm);
    const sc=document.createElement('div'); sc.className='sc'; sc.textContent=r.score.toLocaleString();
    row.append(rk,nm,sc); list.appendChild(row); });
  if(m&&m.inTop) $('myJump').hidden=false;
}
async function openRank(k,from){
  rankFrom=from; rankTab=k; rankCache={}; show('rankPanel'); drawRank(); await caps();
  for(const key of RANKS){
    if(!DB){ rankCache[key]={err:__('rank.unavailable','ランキングを利用できません。')}; }
    else { try{ await loadRank(key); }catch(e){ rankCache[key]={err:__('rank.loadError','ランキングを読み込めませんでした。時間をおいて開き直してください。')}; } }
    drawRank(); }
}
async function register(){
  const r=lastRes; if(!r||r.done) return; const btn=$('regBtn'), msg=$('regMsg'); btn.disabled=true; msg.textContent=__('rank.saving','登録中…'); await caps();
  if(!DB||!UID){ msg.textContent=__('rank.noStorage','この端末ではランキング登録を利用できません（ブラウザの保存機能がオフです）'); return; }
  const name=($('nick').value||'').trim().slice(0,10)||__('rank.defaultName','ななし'); try{ localStorage.setItem('dr_nick',name); }catch(e){}
  try{ const d=await api('/api/rank',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({diff:r.k,name,score:r.score,delivered:r.del,combo:r.combo})});
    r.done=true; const pos=d.mine?__('sep.wsp','　')+fmt(__('rank.nowPos','現在 {p}'),{p:posTxt(d.mine)}):'';
    msg.textContent=d.updated?__('rank.saved','登録しました！')+pos:fmt(__('rank.notUpdated','自己ベスト（{n}点）は更新ならず。記録はそのままです'),{n:(+d.best||0).toLocaleString()});
  }catch(e){ btn.disabled=false; msg.textContent=e&&e.status===400?__('rank.invalid','このスコアは登録できませんでした'):__('rank.fail','登録に失敗しました。通信状況を確認して、もう一度お試しください'); }
}
function pause(){ if(mode!=='play') return; mode='pause'; if(AU.ctx) AU.ctx.suspend(); input.up=input.down=false; $('btnUp').classList.remove('on'); $('btnDown').classList.remove('on'); show('pausePanel'); }
function resume(){ if(mode!=='pause') return; mode='play'; if(AU.ctx) AU.ctx.resume(); show(''); }
function setDiff(k){ diffKey=k; cfg=DIFFS[k]; N=cfg.floors; $('diffNow').textContent=cfg.name; try{localStorage.setItem('dr_diff',k)}catch(e){}
  [...queue,...riders,...others,...returns].forEach(killCourier); queue=[]; riders=[]; others=[]; returns=[]; buildWorld(); resize(); resetGame(true); camY=view.h/2-1.3;
  document.querySelectorAll('.diff').forEach(b=>b.classList.toggle('sel',b.dataset.k===k)); }

/* ================= input ================= */
function press(d){ if(mode!=='play') return; if(d>0) input.up=true; else input.down=true; input.last=d; E.queued=d; $(d>0?'btnUp':'btnDown').classList.add('on'); }
function release(d){ if(d>0) input.up=false; else input.down=false; $(d>0?'btnUp':'btnDown').classList.remove('on'); }
[['btnUp',1],['btnDown',-1]].forEach(([id,d])=>{ const b=$(id);
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); try{b.setPointerCapture(e.pointerId)}catch(_){} press(d); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,()=>release(d)));
  b.addEventListener('contextmenu',e=>e.preventDefault()); });
const KEYS={ArrowUp:1,KeyW:1,ArrowDown:-1,KeyS:-1};
const cleanup=[]; /* 窗口级监听，destroy 时统一移除 */
cleanup.push((()=>{ const h=e=>{ if(e.target&&e.target.tagName==='INPUT') return; const d=KEYS[e.code]; if(d){ e.preventDefault(); if(!e.repeat) press(d); } else if(e.code==='KeyP'||e.code==='Escape'){ mode==='play'?pause():resume(); } else if((e.code==='Enter'||e.code==='Space')&&mode==='title'&&$('title').classList.contains('show')&&document.activeElement===document.body){ startGame(); } };
  addEventListener('keydown',h); return ()=>removeEventListener('keydown',h); })());
cleanup.push((()=>{ const h=e=>{ const d=KEYS[e.code]; if(d) release(d); }; addEventListener('keyup',h); return ()=>removeEventListener('keyup',h); })());
cleanup.push((()=>{ const h=()=>{ release(1); release(-1); }; addEventListener('blur',h); return ()=>removeEventListener('blur',h); })());
cleanup.push((()=>{ const h=()=>{ if(document.hidden) pause(); }; document.addEventListener('visibilitychange',h); return ()=>document.removeEventListener('visibilitychange',h); })());
$('dr-app').addEventListener('touchmove',e=>{ if(!e.target.closest('.card')) e.preventDefault(); },{passive:false});
const click=(id,f)=>$(id).addEventListener('click',()=>{ auInit(); SFX.click(); f(); });
click('startBtn',startGame); click('diffBtn',()=>show('diffPanel')); click('howBtn',()=>show('howPanel'));
click('pauseBtn',pause); click('resumeBtn',resume); click('retryBtn',()=>{ if(AU.ctx) AU.ctx.resume(); bgmStop(); startGame(); }); click('quitBtn',()=>{ if(AU.ctx) AU.ctx.resume(); toTitle(); });
click('rankBtn',()=>openRank(RANKS.includes(diffKey)?diffKey:'normal','title'));
click('resRankBtn',()=>openRank(RANKS.includes(diffKey)?diffKey:'normal','result'));
click('rankBack',()=>show(rankFrom)); click('regBtn',register);
$('myJump').addEventListener('click',()=>{ const el=$('meRow'); if(el) el.scrollIntoView({block:'center',behavior:'smooth'}); });
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{ SFX.click(); rankTab=b.dataset.k; drawRank(); }));
document.querySelectorAll('.htab').forEach(b=>b.addEventListener('click',()=>{ SFX.click(); const A=b.dataset.h==='A'; $('howA').hidden=!A; $('typeList').hidden=A; document.querySelectorAll('.htab').forEach(x=>x.classList.toggle('sel',x===b)); }));
click('againBtn',startGame); click('toTitleBtn',toTitle);
click('soundBtn',()=>{ AU.on=!AU.on; if(AU.master) AU.master.gain.value=AU.on?.9:0; $('soundBtn').textContent=AU.on?__('pause.soundOn','サウンド ON'):__('pause.soundOff','サウンド OFF'); });
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{ SFX.click(); show('title'); }));
{ let h=''; for(const k in DIFFS){ const d=DIFFS[k]; h+='<button class="diff" data-k="'+k+'"><b style="background:'+d.col+'">'+d.name+'</b><span>'+STYLES[k].bname+'</span><small><i>'+fmt(__('diff.floors','{n}階建て{k}'),{n:d.floors,k:STYLES[k].kind})+'</i><br><i>'+fmt(__('diff.cap','{s}秒・定員{c}人'),{s:d.time,c:d.cap})+'</i></small></button>'; }
  $('diffs').innerHTML=h; document.querySelectorAll('.diff').forEach(b=>b.addEventListener('click',()=>{ auInit(); SFX.click(); setDiff(b.dataset.k); }));
  let t=''; for(const k in TYPES){ const d=TYPES[k]; t+='<i style="background:'+d.css+'">'+d.name+'</i><span>'+d.desc+'</span>'; } $('typeList').innerHTML=t; }

/* ================= boot ================= */
let DY=false, RO=null, rafId=0, goTimer=0;
function boot(){ let k='normal'; try{ const s=localStorage.getItem('dr_diff'); if(s&&DIFFS[s]) k=s; }catch(e){}
  setDiff(k); caps(); cleanup.push((()=>{ const h=()=>resize(); addEventListener('resize',h); return ()=>removeEventListener('resize',h); })());
  if(window.ResizeObserver){ RO=new ResizeObserver(resize); RO.observe($('dr-app')); }
  rafId=requestAnimationFrame(frame); }
let booted=false; const go=()=>{ if(DY||booted) return; booted=true; boot(); };
try{ Promise.all([document.fonts.load('40px "Mochiy Pop One"','0123456789F▲▼'),document.fonts.load('700 20px "M PLUS Rounded 1c"','0123456789F')]).then(go,go); }catch(e){ go(); }
goTimer=setTimeout(go,2500);
function destroy(){ if(DY) return; DY=true; clearTimeout(goTimer);
  cleanup.forEach(f=>{ try{ f(); }catch(_){}}); cleanup.length=0;
  bgmStop(); cdTimers.forEach(clearTimeout); cdTimers=[];
  if(RO) RO.disconnect(); if(rafId) cancelAnimationFrame(rafId);
  if(AU.ctx){ try{ AU.ctx.close(); }catch(_){} AU.ctx=null; }
  if(window.__dr) window.__dr.destroyed=true; }
window.__dr={G,E,press,release,startGame,setDiff,destroy,get mode(){return mode},riders:()=>riders,returns:()=>returns,queue:()=>queue};
})();

/*
 * Outbreak Delivery — 3D 电梯生存游戏（由 delivery-rush/game.js 派生）。
 *
 * 作为 ES module 加载（宿主使用 <script type="module" src="/games/outbreak/game.js">），
 * 顶部 import 纯规则 ./rules.js。three.min.js 由宿主先以传统 <script> 加载，
 * 本模块通过全局 THREE 使用（不引入打包器）。
 *
 * ── 宿主事件契约（Task 10 React 外壳请据此接入）──────────────────────────
 *  1) window.dispatchEvent(new CustomEvent('od:result', { detail: lastRes }))
 *     · 在结算面板 #result 显示后派发；
 *     · lastRes = { score, delivered, time }（time 为存活整秒数）。
 *  2) 点击 #rankBtn 时派发 window.dispatchEvent(new CustomEvent('od:openrank', { detail:{ diff } }))
 *     · 外壳据此打开 #rankPanel 并请求 /api/outbreak/rank。
 *  3) #regBtn / #nick / #rankBack 等由外壳自行接管点击；game.js 不实现任何排行榜网络请求，
 *     只负责显示/隐藏自身界面与派发上述事件。#regMsg 可供外壳写入提示。
 * ─────────────────────────────────────────────────────────────────────────
 * 感染条样式契约（Task 10 CSS 请据此定义）：
 *  · #infBar 的 style.width 由 game.js 设为 `G.inf%`；
 *  · #infBar 会切换 class `lv1/lv2/lv3/lv4`（绿/黄/橙/红，阈值 50/70/85）；
 *  · #infPill[data-lvl="lv1..lv4"] 同步写入，便于着色胶囊外壳。
 * ─────────────────────────────────────────────────────────────────────────
 */
import {
  infectionPerSecond, SPIT_INFECTION, LUNGE_INFECTION,
  comboMultiplier, packageScore, difficultyAt, rankFor,
} from "./rules.js";

(()=>{
'use strict';
/* 已有未销毁的实例时跳过重复执行（宿主重新挂载前会先调用 window.__od.destroy()） */
if(typeof window!=='undefined'&&window.__od&&!window.__od.destroyed) return;
/* i18n：由宿主页面在加载本模块前注入 window.OD_I18N（缺省回退键名/英文默认） */
const L10N=(typeof window!=='undefined'&&window.OD_I18N)||{};
const __=(k,fb)=>L10N[k]!=null?L10N[k]:fb;
const fmt=(s,o)=>String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!=null?o[k]:m);
/* 宿主已卸载（组件销毁后才加载完成）时中止启动 */
if(typeof document==='undefined'||!document.getElementById('gl')) return;
const T=(typeof THREE!=='undefined')?THREE:(typeof window!=='undefined'?window.THREE:null);
if(!T){ console.error('[outbreak] THREE not loaded before game.js'); return; }
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.random()*a.length|0], clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const INK='#0e1620';

/* ================= config ================= */
/* 难度驱动：楼层数 / 容量 / 刷新间隔 / 电梯速度（沿用 delivery-rush 的 shape）。
   感染难度不在此硬编码，而由 rules.js 的 difficultyAt(elapsed, delivered) 时间曲线驱动。 */
const DIFFS={
  easy:   {name:'EASY',   col:'#2fa866',floors:5, time:120,cap:6, spawn:[2.6,3.6],speed:3.4,maxQ:8, comboW:5.7, note:__('diff.easy.note','5階建て・感染の少ない低層'),sub:__('diff.easy.sub','まずは操作と停車の危険に慣れよう')},
  normal: {name:'NORMAL', col:'#2f86e0',floors:10,time:180,cap:6, spawn:[1.8,2.6],speed:5.2,maxQ:9, comboW:6.4, note:__('diff.normal.note','10階建て・標準的な生存'),sub:__('diff.normal.sub','停車の危険と配達効率を見極めろ')},
  hard:   {name:'HARD',   col:'#f08a24',floors:20,time:240,cap:8, spawn:[1.4,2.1],speed:8.2,maxQ:10,comboW:7.8, note:__('diff.hard.note','20階建て・感染者が多い'),sub:__('diff.hard.sub','噴酸者（Spitter）の遠隔攻撃に注意')},
  extreme:{name:'EXTREME',col:'#e8453c',floors:30,time:300,cap:10,spawn:[1.1,1.7],speed:11, maxQ:12,comboW:9.2, note:__('diff.extreme.note','30階建て・封鎖区域'),sub:__('diff.extreme.sub','生存は至難の業。感染ピークを抑えろ')}
};
/* 包裹类型（V1：normal / bulk）。bulk 占 2 个货位；分值由 rules.js packageScore 决定。 */
const PKG={
  normal:{name:__('pkg.normal.name','標準'),tag:__('pkg.normal.tag',''),    css:'#8fd0f2',size:1,qw:.62,desc:__('pkg.normal.desc','標準的な荷物。1スロット。')},
  bulk:  {name:__('pkg.bulk.name','大型'), tag:__('pkg.bulk.tag','大型'),css:'#e8c468',size:2,qw:.86,desc:__('pkg.bulk.desc','かさばる荷物。2スロットを占有する。')}
};
const FH=2.4, D=2.6, BX0=-4.6, BX1=4.2, SX0=.9, SX1=3.3, CABX=2.1, QX=.4, QZ=-1.25, VIEW_CX=-.9, VIEW_W=11.8;
const THREAT_R=3.6; /* 停車時に脅威判定する水平距離（ドア基準） */
const SPIT_X0=CABX-THREAT_R+.3, SPIT_X1=BX1-1; /* spitter 巡邏範圍：始終保持在可噴酸的對位距離內 */
/* 测试开关：默认强制刷出的僵尸类型（喷酸者等），不受时间解锁曲线限制；置为 [] 恢复常规难度 */
const FORCE_ZOMBIES=['spitter'];
/* 道具类型（V1：针筒 / 棍子）。heal 为针筒回复的感染值；kill 标记棍子。后续道具在此扩展。 */
const ITEMS={
  syringe:{name:__('item.syringe.name','針筒'),css:'#7fe0e0',heal:50,weight:.45},
  stick:  {name:__('item.stick.name','棍子'),  css:'#e8c468',kill:1,weight:.55}
};
const ITEM_MAX=3; /* 场上道具上限 */
const ITEM_SPAWN=[8,16]; /* 刷新间隔（秒） */

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
  spit(){tone(300,.2,'sawtooth',.09,0,110)},
  heart(){tone(58,.16,'sine',.14)},
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
  gr.addColorStop(0,'#0b1220'); gr.addColorStop(.55,'#1b2740'); gr.addColorStop(1,'#33415c'); g.fillStyle=gr; g.fillRect(0,0,4,256);
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; scene.background=t; }
scene.add(new T.HemisphereLight(0x9fb8e0,0x24304a,.62));
const sun=new T.DirectionalLight(0xbcd0ff,.5); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
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
/* 包裹标签：目标楼层数字 */
function pkgLabelTex(dest,type){ return textTex('P'+dest+type,128,128,(g)=>{ const d=PKG[type];
  rr(g,8,8,112,112,24); g.fillStyle='#0e1620'; g.fill();
  if(d.tag){ g.save(); rr(g,8,8,112,112,24); g.clip(); g.fillStyle=d.css; g.fillRect(0,0,128,40); g.restore();
    g.fillStyle='#0e1620'; g.font='26px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(d.tag,64,26); }
  rr(g,8,8,112,112,24); g.lineWidth=9; g.strokeStyle=d.css; g.stroke();
  g.fillStyle='#e8f4ff'; g.font=(d.tag?58:72)+'px '+FD; g.textAlign='center'; g.textBaseline='middle';
  g.fillText(dest+'F',64,d.tag?72:66); }); }
function signTex(n){ return textTex('S'+n,128,80,(g)=>{ rr(g,4,4,120,72,16); g.fillStyle=INK; g.fill(); g.fillStyle='#8fd0f2'; g.font='50px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(n+'F',64,43); }); }

/* ================= world ================= */
let world=null, N=10, cfg=DIFFS.normal, diffKey='normal';
let truck=null;
const TRUCK_COLS=['#6b3f2f','#2f4a5e','#3a4a3f'];
function updTruck(dt,time){ const k=truck; if(!k) return;
  if(k.state==='park'){ k.t-=dt; if(k.t<=0){ k.state='out'; k.v=0; burst(k.x+1.7,.35,-1.5,7,'smoke'); } }
  else if(k.state==='out'){ k.v=Math.min(15,k.v+8*dt); k.x-=k.v*dt; if(k.x<-50){ k.state='in'; k.col=(k.col+1)%TRUCK_COLS.length; k.paint.forEach(m=>m.material=mat(TRUCK_COLS[k.col])); } }
  else { const d=-10.3-k.x; k.v=Math.max(1,Math.min(12,d*1.5)); k.x+=k.v*dt; if(k.x>=-10.3){ k.x=-10.3; k.v=0; k.state='park'; k.t=rnd(5,8); } }
  k.g.position.x=k.x; k.g.position.y=k.state==='park'?0:Math.abs(Math.sin(time*26))*.025; }
let floorsFx=[], cab=null, cable=null, cabDoors=[], cabSign=null, cabSignCtx=null, cabSignShown='', clouds=[];
/* 暗色楼栋风格（沿用 delivery-rush STYLES 的键结构，换成末世暗蓝/暗红调） */
const STYLES={
  easy:   {bname:__('style.easy.bname','月灯りのアパート'),   kind:__('style.easy.kind','低層アパート'),    walls:['#2b3340','#333c4a','#262e3a'],doors:['#4a3f35','#3f4a55','#553f3f'],ext:'#232a34',slab:'#3a4048',wains:'#3f4753',rail:'#4a5560',shaft:'#2a303a',roof:'#1e242c',edge:'#55606b',awning:'#3f6f6a',rug:'#4a3f52',crown:'gable', signBg:'#1a2028',signInk:'#8fd0f2'},
  normal: {bname:__('style.normal.bname','薄暗いメゾン'),     kind:__('style.normal.kind','マンション'),     walls:['#2f3542','#333a48','#2a3038','#383842','#2c333d'],doors:['#4a5568','#3f5a4a','#5a4a3f','#4a3f5a','#3f4a5a'],ext:'#252b35',slab:'#3d434e',wains:'#454c58',rail:'#525d68',shaft:'#2b313b',roof:'#1c222a',edge:'#5a6570',awning:'#7a3a34',rug:'#6a3240',crown:'flat', signBg:'#161c24',signInk:'#9fd8f7'},
  hard:   {bname:__('style.hard.bname','封鎖レジデンス'),     kind:__('style.hard.kind','大型マンション'),  walls:['#2b3038','#30353d','#35302c','#2b3238'],doors:['#3a4a5a','#3a4a3f','#4a4030','#3f3a55'],ext:'#20262e',slab:'#363c46',wains:'#414854',rail:'#4a535e',shaft:'#262c36',roof:'#181d24',edge:'#4a5560',awning:'#5a2f34',rug:'#5a2b33',crown:'modern',signBg:'#141a22',signInk:'#e8c468'},
  extreme:{bname:__('style.extreme.bname','感染タワー'),      kind:__('style.extreme.kind','タワーマンション'),walls:['#2a2e38','#2e323c','#343029','#2b2f3a'],doors:['#2b2f3a','#3a3028','#2a3a2f','#3a2f3a'],ext:'#1c2028',slab:'#30353f',wains:'#3a4049',rail:'#c9a44a',shaft:'#222832',roof:'#151a20',edge:'#7a2f3a',awning:'#5a2028',rug:'#6a2430',glass:'#4a7a9a',crown:'tower', signBg:'#10151c',signInk:'#e8453c'}
};

function buildWorld(){
  if(world){ scene.remove(world); floorsFx.forEach(f=>f.mat.dispose()); }
  world=new T.Group(); scene.add(world); floorsFx=[]; clouds=[];
  const st=new T.Group(); world.add(st); // static
  const W=BX1-BX0, cx=(BX0+BX1)/2, top=N*FH, S=STYLES[diffKey]||STYLES.normal;
  // ground
  B(st,240,.2,80,'#22331f',0,-.12,-20);
  B(st,240,.12,5.4,'#2a2f36',0,0,-.9);
  B(st,240,.1,5,'#1b1f26',0,-.03,4.3);
  for(let x=-40;x<=40;x+=4) B(st,1.8,.02,.16,'#4a5058',x,.03,4.3);
  B(st,240,.16,.3,'#3a3f46',0,.02,1.85);
  // distant city
  const hazy=['#233246','#2a2f45','#3a3038','#243a34'];
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
    if(i>0){ [-3.45,-1.35].forEach((dx,k)=>{ B(st,1.02,1.84,.05,'#1a212b',dx,y+.92,-D+.08); B(st,.88,1.74,.07,S.doors[(i*2+k)%S.doors.length],dx,y+.87,-D+.1);
        SP(st,.06,'#e8c468',dx+.3,y+.85,-D+.16); B(st,.3,.16,.03,'#c9d6e0',dx,y+1.45,-D+.15); });
      B(st,.16,.3,.14,'#8fa0a8',-2.4,y+1.5,-D+.12,false,'basic');
      if(i%3===1){ CY(st,.16,.12,.26,'#4a3f35',-.05,y+.13,-D+.4); SP(st,.26,'#3f6a4a',-.05,y+.5,-D+.4); }
    } else {
      for(let r=0;r<3;r++) for(let c=0;c<5;c++) B(st,.3,.24,.12,(r+c)%2?'#3a4550':'#2e3844',-4.0+c*.34,1.0+r*.28,-D+.12);
      B(st,1.9,.1,.16,'#4a3f35',-3.32,.82,-D+.14);
      CY(st,.2,.15,.34,'#4a3f35',-1.1,.17,-D+.45); SP(st,.34,'#4f7a52',-1.1,.66,-D+.45); SP(st,.22,'#3f6a4a',-.95,.95,-D+.45);
      B(st,3.4,.02,1.3,S.rug,-2.2,.075,-1.2);
    }
    // right nook: window + sign
    B(st,.74,.9,.05,'#1a212b',3.75,y+.95,-D+.08); B(st,.6,.76,.06,'#4a7a9a',3.75,y+.95,-D+.1,false,'basic'); B(st,.6,.04,.07,'#1a212b',3.75,y+.95,-D+.11);
    const sg=new T.Mesh(signGeo,new T.MeshBasicMaterial({map:signTex(i+1)})); sg.position.set(3.75,y+1.85,-D+.12); st.add(sg);
    // highlight
    const hm=new T.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:0,depthWrite:false});
    const h=new T.Mesh(hlGeo,hm); h.position.set(cx,y+(FH-.2)/2,-D+.17); h.visible=false; world.add(h); floorsFx.push({mesh:h,mat:hm,a:0});
  }
  // shaft
  B(st,.08,top,.1,'#3a4456',SX0+.12,top/2,-D+.12); B(st,.08,top,.1,'#3a4456',SX1-.12,top/2,-D+.12);
  B(st,.07,top,D-.2,'#2a3038',SX1+.02,top/2-.1,-D/2-.05);
  // roof
  B(st,W+1.2,.3,D+.6,S.roof,cx,top+.05,-D/2+.05);
  let signX=-1.7, signY=top+1.15, signZ=.3, signW=4.2, posts=true;
  if(S.crown!=='tower'){ B(st,2.9,1.3,2.2,S.ext,CABX,top+.85,-D/2); B(st,3.1,.16,2.4,S.awning,CABX,top+1.58,-D/2);
    const pul=CY(st,.32,.32,.2,'#3a4456',CABX,top+.9,-.25); pul.rotation.x=Math.PI/2; }
  if(S.crown==='gable'){
    const half=(W+1.6)/2, rise=1.9, L=Math.hypot(half,rise), ang=Math.atan2(rise,half);
    [-1,1].forEach(sg=>{ const r=B(st,L+.15,.16,D+.9,S.roof,cx+sg*half/2,top+.2+rise/2,-D/2+.05,true); r.rotation.z=-sg*ang; });
    const sh=new T.Shape(); sh.moveTo(-half+.3,0); sh.lineTo(half-.3,0); sh.lineTo(0,rise-.1); sh.lineTo(-half+.3,0);
    const gm=new T.Mesh(new T.ShapeGeometry(sh),mat(S.ext)); gm.position.set(cx,top+.2,-D); st.add(gm);
    B(st,.5,1.2,.5,'#5a3f35',-3.3,top+1.4,-1.9,true); B(st,.62,.12,.62,S.edge,-3.3,top+2.05,-1.9);
    signX=-2.1; signY=top+.6; signW=3.2; posts=false;
  } else {
    B(st,W+1.2,.34,.14,S.edge,cx,top+.37,.28); B(st,.14,.34,D+.6,S.edge,BX0-.5,top+.37,-D/2+.05); B(st,.14,.34,D+.6,S.edge,BX1+.5,top+.37,-D/2+.05);
    if(S.crown==='flat'){
      CY(st,.6,.6,1.1,'#4a5560',-3.3,top+1.05,-1.6,false,18); CY(st,.66,.66,.1,'#39424e',-3.3,top+1.62,-1.6,false,18);
      [-.42,.42].forEach(o=>B(st,.08,.5,.08,'#39424e',-3.3+o,top+.4,-1.2));
      B(st,.06,2.2,.06,'#39424e',.2,top+1.3,-2); B(st,.7,.05,.05,'#39424e',.2,top+2.1,-2); B(st,.45,.05,.05,'#39424e',.2,top+1.8,-2);
    } else if(S.crown==='modern'){
      for(let k=0;k<3;k++){ const pnl=B(st,1.25,.06,1,'#1e2a40',-3.7+k*1.45,top+.72,-1.7,true); pnl.rotation.x=-.55; B(st,.08,.5,.08,'#39424e',-3.7+k*1.45,top+.45,-2.0); }
      CY(st,.1,.12,.7,'#4a3f35',.15,top+.55,-.9,true,8); SP(st,.5,'#3f6a4a',.15,top+1.2,-.9,true); SP(st,.3,'#4f7a52',-.55,top+.45,-.7);
      B(st,.06,2.6,.06,'#39424e',BX1,top+1.5,-2.2); SP(st,.09,'#ff4a3c',BX1,top+2.85,-2.2,false,'basic');
      signY=top+2.05; signX=-1.9;
    } else {
      B(st,W+.2,1.5,D,S.ext,cx,top+.95,-D/2,true); B(st,W+.26,.55,D+.06,S.glass,cx,top+1.0,-D/2,false,'basic'); B(st,W+.3,.1,D+.1,S.edge,cx,top+1.72,-D/2);
      B(st,W*.6,1.3,D*.7,S.ext,cx,top+2.4,-D/2,true); B(st,W*.64,.12,D*.74,S.edge,cx,top+3.08,-D/2);
      B(st,W*.3,.7,D*.4,S.roof,cx,top+3.45,-D/2); CY(st,.05,.13,4.6,'#5a6570',cx,top+6.1,-D/2,false,8);
      SP(st,.15,'#ff4a3c',cx,top+8.45,-D/2,false,'basic'); SP(st,.1,'#ff4a3c',BX0+.2,top+1.9,-.3,false,'basic'); SP(st,.1,'#ff4a3c',BX1-.2,top+1.9,-.3,false,'basic');
      signX=cx; signY=top+2.4; signZ=-D/2+D*.35+.03; signW=4.6; posts=false;
    }
  }
  const nm=new T.Mesh(new T.PlaneGeometry(signW,signW*.2),new T.MeshBasicMaterial({map:textTex('name'+diffKey,672,136,(g)=>{ rr(g,5,5,662,126,26); g.fillStyle=S.signBg; g.fill(); g.lineWidth=10; g.strokeStyle=S.crown==='tower'?S.edge:INK; g.stroke();
    g.fillStyle=S.signInk; g.textAlign='center'; g.textBaseline='middle'; let fs=74; do{ fs-=4; g.font=fs+'px '+FD; }while(g.measureText(S.bname).width>610&&fs>30); g.fillText(S.bname,336,72); })}));
  nm.position.set(signX,signY,signZ); st.add(nm);
  if(posts){ B(st,.1,signY-top-.2,.1,'#39424e',signX-signW/2+.6,top+(signY-top)/2-.05,signZ-.04); B(st,.1,signY-top-.2,.1,'#39424e',signX+signW/2-.6,top+(signY-top)/2-.05,signZ-.04); }
  // supply truck
  const tr=new T.Group(); tr.position.set(-10.3,0,-1.5); world.add(tr);
  B(tr,3,1.7,1.7,'#2a3038',0,1.25,0,true); const trS=B(tr,3.02,.34,1.72,'#6b3f2f',0,.9,0), trC=B(tr,1.05,1.25,1.6,'#6b3f2f',-2.02,.98,0,true);
  truck={g:tr,paint:[trS,trC],state:'park',t:rnd(4,6),x:-10.3,v:0,col:0};
  B(tr,.5,.5,1.4,'#3a4a5a',-2.32,1.25,0,false,'basic'); B(tr,4.2,.14,1.5,'#2b2f36',-.5,.36,0);
  [[-2,.85],[-2,-.85],[.7,.85],[.7,-.85]].forEach(p=>{const w=CY(tr,.34,.34,.24,'#1b1f26',p[0],.34,p[1],true);w.rotation.x=Math.PI/2;});
  const lg=new T.Mesh(new T.PlaneGeometry(1.9,.62),new T.MeshBasicMaterial({transparent:true,map:textTex('rush',380,124,(g)=>{ g.fillStyle='#e8453c'; g.font='76px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(__('truck.label','補給便'),190,66); })}));
  lg.position.set(0,1.55,.86); tr.add(lg);
  // trees & bushes
  [[6.4,-2.2,1],[9.6,-3.4,1.25],[-15.5,-3.2,1.2],[-7.2,-3.6,.9]].forEach(([x,z,s])=>{ CY(st,.16*s,.2*s,1.5*s,'#4a3f35',x,.75*s,z,true,8); SP(st,.9*s,'#3f6a4a',x,2*s,z,true).scale.set(1,.92,1); SP(st,.6*s,'#4f7a52',x+.45*s,2.6*s,z+.2); });
  [5.2,5.9,7.7].forEach((x,i)=>SP(st,.42,i%2?'#3f6a4a':'#4f7a52',x,.3,-.9));
  CY(st,.06,.07,3,'#3a4456',7.4,1.5,.9,true,8); SP(st,.2,'#cfe0a8',7.4,3.05,.9,false,'basic');
  st.traverse(o=>{o.matrixAutoUpdate=false;o.updateMatrix();});
  // clouds
  for(let i=0;i<Math.max(7,N/2|0);i++){ const c=new T.Group(); const s=rnd(1.4,2.8);
    for(let k=0;k<4;k++){ const m=SP(c,1,'#3a4456',(k-1.5)*1.1*s*.6,rnd(-.2,.3)*s,0,false,'basic'); m.scale.set(s*rnd(.7,1.1),s*rnd(.5,.75),.6); }
    c.position.set(rnd(-45,45),rnd(5,top+16),-rnd(34,48)); c.userData.v=rnd(.25,.7); world.add(c); clouds.push(c); }
  // cab
  cab=new T.Group(); world.add(cab); cab.position.x=CABX;
  const cw=2.16, cz=-1.3, cd=2.1;
  B(cab,cw,.1,cd,'#3a4456',0,-.05,cz,true); B(cab,cw+.1,.14,cd+.1,'#e8453c',0,2.1,cz,true);
  B(cab,cw,2.04,.06,'#2a3038',0,1.02,cz-cd/2+.03); B(cab,.05,2.04,cd,'#333a44',cw/2-.03,1.02,cz,true);
  B(cab,cw-.2,.06,.06,'#4a5560',0,.95,cz-cd/2+.12);
  [[-1,1],[1,1],[-1,-1]].forEach(([sx,sz])=>B(cab,.09,2.04,.09,'#e8453c',sx*(cw/2-.04),1.02,cz+sz*(cd/2-.04),true));
  B(cab,cw+.1,.36,.1,'#e8453c',0,1.9,cz+cd/2,true);
  cabDoors=[B(cab,.05,1.9,cd/2-.06,'#5a6570',-cw/2+.02,.97,cz-cd/4),B(cab,.05,1.9,cd/2-.06,'#5a6570',-cw/2+.02,.97,cz+cd/4)];
  { const c=document.createElement('canvas'); c.width=256; c.height=72; cabSignCtx=c.getContext('2d'); const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding;
    cabSign=new T.Mesh(new T.PlaneGeometry(1.1,.31),new T.MeshBasicMaterial({map:t})); cabSign.position.set(0,1.9,cz+cd/2+.06); cab.add(cabSign); cabSignShown=''; }
  cable=B(world,.06,1,.06,'#2b2f36',CABX,0,-1.3);
  B(world,.5,.7,.3,'#3a4456',CABX+.75,0,-D+.35).name='cw';
  courier=makeCourier(); /* 每个世界（重开/换难度）都新建唯一配送员 */
}
function drawCabSign(txt){ if(txt===cabSignShown) return; cabSignShown=txt; const g=cabSignCtx; g.fillStyle='#0e1620'; g.fillRect(0,0,256,72);
  g.fillStyle='#8fd0f2'; g.font='48px '+FD; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,128,40); cabSign.material.map.needsUpdate=true; }

/* ================= entities ================= */
const BOXC=['#5a4a3a','#4f4234','#63513f'];
function parcel(p,w,h,d,x,y,z,col){ const g=new T.Group(); g.position.set(x,y,z); p.add(g); B(g,w,h,d,col||pick(BOXC),0,0,0,true); B(g,w*.2,h+.012,d+.012,'#8a7a5a',0,0,0); return g; }
/* 包裹网格（V1：normal / bulk） */
function buildPackage(type){
  const g=new T.Group(), b=new T.Group(); g.add(b);
  if(type==='bulk'){ parcel(b,.5,.34,.42,0,.2,0); parcel(b,.44,.3,.38,.02,.5,0); parcel(b,.4,.26,.34,-.02,.78,0); }
  else parcel(b,.42,.32,.36,0,.19,0,'#6a5a44');
  return {g,b};
}
function makePackage(type,dest){
  const def=PKG[type], v=buildPackage(type);
  const lab=new T.Sprite(new T.SpriteMaterial({map:pkgLabelTex(dest,type),depthTest:false,transparent:true}));
  lab.center.set(.5,0); lab.scale.set(.5,.44,1); lab.position.y=type==='bulk'?1.16:.6; lab.renderOrder=20;
  v.g.add(lab); world.add(v.g);
  const p={type,def,dest,size:def.size,state:'queue',v,lab,x:-8.6,y:.02,z:QZ+rnd(-.12,.12),sx:0,sz:0,tx:0,tz:QZ,speed:3.2,bf:0,jw:rnd(-.14,.14)};
  v.g.position.set(p.x,p.y,p.z); return p;
}
function killPkg(p){ world.remove(p.v.g); p.lab.material.dispose(); }

/* 僵尸网格（复用 buildCourier 的人形轮廓 + 暗绿/灰调，非血腥） */
const ZCOL={walker:{skin:'#8a9a7a',cloth:'#3a4a3f',pant:'#2a2f2a'},spitter:{skin:'#9aa878',cloth:'#4a3f5a',pant:'#2e2b3a'}};
function buildZombie(type){
  const g=new T.Group(), b=new T.Group(); g.add(b); const u=ZCOL[type].cloth, skin=ZCOL[type].skin;
  const legL=new T.Group(), legR=new T.Group(); legL.position.set(-.12,.42,0); legR.position.set(.12,.42,0); b.add(legL,legR);
  B(legL,.17,.42,.19,ZCOL[type].pant,0,-.21,0,true); B(legR,.17,.42,.19,ZCOL[type].pant,0,-.21,0,true);
  const up=new T.Group(); b.add(up);
  CY(up,.22,.28,.52,u,0,.68,0,true); B(up,.5,.07,.42,'#c9d6c0',0,.5,0);
  SP(up,.24,skin,0,1.13,0,true);
  SP(up,.05,'#14140f',-.09,1.14,.215); SP(up,.05,'#14140f',.09,1.14,.215);
  B(up,.11,.13,.4,u,-.3,.74,.17,true); B(up,.11,.13,.4,u,.3,.74,.17,true);
  if(type==='spitter'){ SP(up,.2,'#a6d84a',0,.92,.3,true); }
  else { B(up,.4,.02,.3,u,0,.74,.42,true); }
  return {g,b,up,legL,legR};
}
function makeZombie(type){
  const fl=1+(Math.random()*(N-1)|0);
  const v=buildZombie(type);
  const x=type==='walker'?rnd(BX0+1.2,BX1-1.2):rnd(.4,BX1-1.2);
  const z=-D+.6, y=fl*FH;
  v.g.position.set(x,y,z); world.add(v.g);
  return {type,v,floor:fl,x,y,z,dir:Math.random()<.5?-1:1,speed:type==='walker'?rnd(.5,.9):type==='spitter'?rnd(.6,.95):0,ph:rnd(0,6),spitT:rnd(.6,1.4),projT:rnd(.6,1.4)};
}
function killZombie(z){ world.remove(z.v.g); }

/* ================= 道具（针筒 / 棍子） ================= */
function buildItem(type){
  const g=new T.Group();
  if(type==='syringe'){
    const body=CY(g,.06,.06,.4,'#e6fbff',0,0,0,true,12); body.rotation.z=Math.PI/2;
    const liq=CY(g,.045,.045,.28,'#4fd0d0',-.02,0,0,true,12); liq.rotation.z=Math.PI/2;
    const plunger=CY(g,.052,.052,.1,'#9fd0d8',-.26,0,0,true,10); plunger.rotation.z=Math.PI/2;
    const needle=CY(g,.012,.012,.2,'#c9d6e0',.3,0,0,true,8); needle.rotation.z=Math.PI/2;
  } else {
    const baton=CY(g,.052,.058,.82,'#c08a3e',0,0,0,true,10); baton.rotation.z=Math.PI/2;
    const grip=CY(g,.062,.062,.2,'#6a4a2a',-.33,0,0,true,10); grip.rotation.z=Math.PI/2;
    SP(g,.075,'#e8c468',.4,0,0,true);
  }
  return {g};
}
function pickItemType(){ const ks=Object.keys(ITEMS); let tot=0; for(const k of ks) tot+=ITEMS[k].weight||0;
  let r=Math.random()*tot; for(const k of ks){ r-=ITEMS[k].weight||0; if(r<=0) return k; } return ks[0]; }
function spawnItem(type){
  const t=type||pickItemType();
  const fl=1+(Math.random()*(N-1)|0);
  const v=buildItem(t); const x=rnd(BX0+1.2,BX1-1.2), z=-D+.7, y=fl*FH;
  v.g.position.set(x,y+.55,z); world.add(v.g);
  const it={type:t,def:ITEMS[t],floor:fl,x,y,z,v,ph:rnd(0,6),taken:false};
  items.push(it); return it;
}
function killItem(it){ world.remove(it.v.g); }
function updItems(dt,time){ for(const it of items){ it.ph+=dt; it.v.g.rotation.y+=dt*1.8; it.v.g.position.y=it.y+.55+Math.sin(time*2.2+it.ph)*.09; } }

/* ---------- 喷酸者酸液：沿抛物线飞行的液体喷射、锁定配送员 ---------- */
const spits=[];
const SPIT_GRAV=16, SPIT_HIT_R=.6, SPIT_CD=1.4, SPIT_R=.16;
const _zAxis=new T.Vector3(0,0,1), _vDir=new T.Vector3();
const spitMat=new T.MeshBasicMaterial({color:0xa6d84a,transparent:true,opacity:.92});
const spitCoreMat=new T.MeshBasicMaterial({color:0xe6ff9a,transparent:true,opacity:.95});
/* 液滴网格：头大尾小的水滴，沿飞行方向拉长（由 updSpits 朝向速度方向） */
function buildSpitDrop(){
  const g=new T.Group(), geo0=geo('spit',()=>new T.SphereGeometry(SPIT_R,12,10));
  const head=new T.Mesh(geo0,spitMat); head.scale.set(.95,.95,2.2); g.add(head);
  const mid=new T.Mesh(geo0,spitMat); mid.position.z=-SPIT_R*2.2; mid.scale.set(.7,.7,1.4); g.add(mid);
  const tail=new T.Mesh(geo0,spitCoreMat); tail.position.z=-SPIT_R*4.0; tail.scale.set(.42,.42,.9); g.add(tail);
  return g;
}
/* 沿轨迹抛洒的小液滴，形成连续的液流 */
function spitTrail(s){
  for(let k=0;k<2;k++){ if(parts.length>=PMAX) return;
    parts.push({x:s.x+rnd(-.07,.07),y:s.y+rnd(-.07,.07),z:s.z+rnd(-.07,.07),
      vx:rnd(-.5,.5),vy:rnd(-.6,.2),vz:rnd(-.5,.5),g:-3.5,life:rnd(.25,.6),t:0,
      s:rnd(.05,.13),col:pick(['#b6f04a','#8fd83a','#d6ff7a','#a6d84a']),rot:rnd(0,6),vr:rnd(-4,4),grow:0});
  }
}
function fireSpit(z){
  const c=courier; if(!c) return;
  const x0=z.x, y0=z.floor*FH+1.0, z0=z.z+.3;   /* 喷口 */
  const x1=c.x, y1=c.y+1.0, z1=c.z;             /* 瞄准配送员胸口 */
  const dist=Math.hypot(x1-x0,y1-y0,z1-z0);
  const flight=clamp(dist/4.5,.6,1.15);          /* 飞行时间（偏慢，可见的抛物线） */
  const yLead=y1+(E.v||0)*FH*flight;             /* 电梯移动中：预测飞行落点 */
  const vx=(x1-x0)/flight, vz=(z1-z0)/flight, vy=(yLead-y0)/flight+.5*SPIT_GRAV*flight;
  const g=buildSpitDrop(); g.position.set(x0,y0,z0); world.add(g);
  spits.push({g,x:x0,y:y0,z:z0,vx,vy,vz,t:0,T:flight});
}
function killSpit(s){ world.remove(s.g); }
function updSpits(dt){
  for(let i=spits.length-1;i>=0;i--){ const s=spits[i]; s.t+=dt;
    s.vy-=SPIT_GRAV*dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.z+=s.vz*dt; s.g.position.set(s.x,s.y,s.z);
    const vl=Math.hypot(s.vx,s.vy,s.vz)||1; s.g.quaternion.setFromUnitVectors(_zAxis,_vDir.set(s.vx/vl,s.vy/vl,s.vz/vl)); /* 朝向飞行方向 */
    spitTrail(s); /* 抛洒液滴，呈液态 */
    const c=courier, hit=!!c&&Math.hypot(s.x-c.x,s.y-(c.y+1.0),s.z-c.z)<SPIT_HIT_R;
    if(hit||s.t>=s.T){ if(hit&&mode==='play'&&!G.over) addInfection(SPIT_INFECTION); burst(s.x,s.y,s.z,12,'acid',3.5); killSpit(s); spits.splice(i,1); }
  }
}
function killAllSpits(){ spits.forEach(killSpit); spits.length=0; }

/* ================= courier（配送员：唯一的搬运者） ================= */
/* 亮橙马甲 + 深色帽，与暗绿/灰的僵尸形成鲜明对比。复用 buildZombie 的人形结构。 */
const COU={skin:'#e8b98a',vest:'#f0a500',cap:'#2a2f3a',pant:'#2a2f3a'};
function buildCourierPerson(){
  const g=new T.Group(), b=new T.Group(); g.add(b);
  const legL=new T.Group(), legR=new T.Group(); legL.position.set(-.12,.42,0); legR.position.set(.12,.42,0); b.add(legL,legR);
  B(legL,.17,.42,.19,COU.pant,0,-.21,0,true); B(legR,.17,.42,.19,COU.pant,0,-.21,0,true);
  B(legL,.18,.1,.26,'#3b2616',0,-.39,.04,true); B(legR,.18,.1,.26,'#3b2616',0,-.39,.04,true);
  const up=new T.Group(); b.add(up);
  CY(up,.22,.28,.52,COU.vest,0,.68,0,true); B(up,.5,.07,.42,'#fffdf6',0,.5,0);
  B(up,.52,.06,.02,'#e8f4ff',0,.72,.27,true); B(up,.52,.06,.02,'#e8f4ff',0,.6,.27,true); /* 反光条 */
  SP(up,.24,COU.skin,0,1.13,0,true);
  SP(up,.03,'#3b2616',-.09,1.14,.215); SP(up,.03,'#3b2616',.09,1.14,.215);
  add(up,geo('cap',()=>new T.SphereGeometry(.255,16,8,0,Math.PI*2,0,Math.PI/2)),COU.cap,0,1.17,0,true);
  B(up,.24,.05,.3,COU.cap,0,1.17,.22,true); /* 帽檐 */
  B(up,.11,.13,.4,COU.vest,-.3,.74,.17,true); B(up,.11,.13,.4,COU.vest,.3,.74,.17,true);
  return {g,b,up,legL,legR};
}
/* 出生即站在轿厢内（家 = 轿厢），其 y 跟随电梯高度 E.pos*FH */
function makeCourier(){
  const v=buildCourierPerson(), home={x:CABX,z:-1.3};
  v.g.position.set(home.x,E.pos*FH,home.z); world.add(v.g);
  return {v,state:'cab',x:home.x,y:E.pos*FH,z:home.z,face:0,ph:rnd(0,6),speed:3.4,pkg:null,tx:home.x,tz:home.z,home,outFloor:0,sticks:0,item:null,target:null};
}
/* 挂载包裹时的相对偏移（包裹被搬运时的从属位置） */
function attachPkg(p){
  p.state='carried'; p.offY=p.type==='bulk'?.78:.62; p.offZ=-.18;
}

/* ================= particles ================= */
const PMAX=420, parts=[];
const pMesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({side:T.DoubleSide,transparent:true,depthWrite:false}),PMAX);
pMesh.frustumCulled=false; pMesh.setColorAt(0,new T.Color(1,1,1)); pMesh.count=0; pMesh.renderOrder=15; scene.add(pMesh);
const _d=new T.Object3D(), _c=new T.Color();
const CONF=['#a6d84a','#6fae3a','#8fa0a8','#e8c468','#c9d6e0','#7a3a34','#ffffff'];
function burst(x,y,z,n,kind,pow){ for(let i=0;i<n&&parts.length<PMAX;i++){ const a=rnd(0,Math.PI*2),s=rnd(.4,1)*(pow||5);
  if(kind==='smoke') parts.push({x:x+rnd(-.2,.2),y:y+rnd(0,.6),z:z+.3,vx:Math.cos(a)*.8,vy:rnd(.6,1.8),vz:0,g:0,life:rnd(.5,.9),t:0,s:rnd(.25,.5),col:pick(['#5a6570','#8a94a0','#39424e']),rot:0,vr:rnd(-2,2),grow:1.2});
  else parts.push({x,y,z:z+.3,vx:Math.cos(a)*s*.7,vy:Math.abs(Math.sin(a))*s+rnd(1,3),vz:rnd(-.5,1.5),g:-13,life:rnd(.7,1.3),t:0,s:rnd(.1,.2),col:pick(kind==='acid'?['#a6d84a','#6fae3a','#c9e07a']:CONF),rot:rnd(0,6),vr:rnd(-12,12),grow:0}); } }
function rain(n){ const w=view.h*camera.aspect; for(let i=0;i<n&&parts.length<PMAX;i++) parts.push({x:camT.x+rnd(-w/2,w/2),y:camT.y+view.h/2+rnd(0,6),z:rnd(.5,3),vx:rnd(-1,1),vy:rnd(-9,-4),vz:0,g:-3,life:rnd(1.6,2.6),t:0,s:rnd(.16,.32),col:pick(CONF),rot:rnd(0,6),vr:rnd(-10,10),grow:0}); }
function updParts(dt){ let n=0; for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.t+=dt; if(p.t>=p.life){parts.splice(i,1);continue;}
    p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; p.rot+=p.vr*dt; }
  for(const p of parts){ const k=1-p.t/p.life, s=p.s*(1+p.grow*p.t)*(p.grow?k:Math.min(1,k*3)); _d.position.set(p.x,p.y,p.z); _d.rotation.set(p.grow?0:p.rot*.7,p.grow?0:p.rot,p.rot); _d.scale.set(s,s*(p.grow?1:.6),s); _d.updateMatrix();
    pMesh.setMatrixAt(n,_d.matrix); pMesh.setColorAt(n,_c.set(p.col).convertSRGBToLinear()); n++; }
  pMesh.count=n; pMesh.instanceMatrix.needsUpdate=true; if(pMesh.instanceColor) pMesh.instanceColor.needsUpdate=true; }

/* ================= game state ================= */
let mode='title', demo=true;
let packages=[], zombies=[], items=[];
let courier=null; /* 唯一的配送员：包裹的唯一搬运者 */
const E={pos:0,v:0,mode:'idle',target:0,lastDir:1,lock:0,queued:0,openT:0,door:1,floor:0,tapBase:null};
const G={elapsed:0,delivered:0,score:0,combo:0,comboT:0,comboW:6,maxCombo:0,inf:0,peakInf:0,spawnT:.4,zSpawnT:.6,over:false,endT:0,diffT:0,beatT:0,autoWait:0,itemT:6};
const input={up:false,down:false,last:0};
const held=()=> input.up&&input.down ? input.last : input.up?1 : input.down?-1 : 0;
let dirty=true, shake=0, lastRes=null;

const inCab=p=>p.state==='cargo';
const cargoList=()=>packages.filter(inCab);
const lobbyList=()=>packages.filter(p=>p.state==='queue');
function used(){ let s=0; for(const p of cargoList()) s+=p.size; return s; }
function addInfection(amt){ G.inf=clamp(G.inf+amt,0,100); if(G.inf>G.peakInf) G.peakInf=G.inf; }

function rollDest(){ return 2+(Math.random()*(N-1)|0); }
function spawnPkg(){
  const type=Math.random()<.28?'bulk':'normal';
  const p=makePackage(type,rollDest());
  /* 直接生成在等待队列的固定位置：包裹自身永不移动 */
  let qx=QX; for(const q of lobbyList()) qx-=q.def.qw;
  p.x=qx; p.z=QZ+p.jw; p.y=.02; p.tx=qx; p.tz=p.z;
  p.v.g.position.set(p.x,p.y,p.z);
  packages.push(p); return p;
}
function killAll(){ packages.forEach(killPkg); packages=[]; zombies.forEach(killZombie); zombies=[]; items.forEach(killItem); items=[]; }

function resetGame(isDemo){
  demo=isDemo; killAll(); parts.length=0; killAllSpits();
  Object.assign(E,{pos:0,v:0,mode:'idle',target:0,lastDir:1,lock:0,queued:0,openT:0,door:1,floor:0,tapBase:null});
  Object.assign(G,{elapsed:0,delivered:0,score:0,combo:0,comboT:0,comboW:cfg.comboW,maxCombo:0,inf:0,peakInf:0,spawnT:.4,zSpawnT:.6,over:false,endT:0,diffT:0,beatT:0,autoWait:0,itemT:rnd(ITEM_SPAWN[0],ITEM_SPAWN[1])});
  input.up=input.down=false; if($('btnUp'))$('btnUp').classList.remove('on'); if($('btnDown'))$('btnDown').classList.remove('on');
  if(courier){ courier.state='cab'; courier.pkg=null; courier.sticks=0; courier.item=null; courier.target=null; courier.x=courier.home.x; courier.z=courier.home.z; courier.y=E.pos*FH; courier.face=0; courier.ph=rnd(0,6); courier.outFloor=0; courier.v.g.position.set(courier.x,courier.y,courier.z); }
  for(let i=0;i<3;i++) spawnPkg();
  dirty=true; floorsFx.forEach(f=>f.on=false); hudForce();
}

/* ---------- elevator ---------- */
const START=2.4;
const atBound=d=>(d>0&&E.pos>=N-1)||(d<0&&E.pos<=0);
function autoNext(d){ E.target=clamp(d>0?Math.floor(E.pos+1e-4)+1:Math.ceil(E.pos-1e-4)-1,0,N-1); E.mode='auto'; }
function arrive(f){ E.tapBase=null; E.pos=f; E.v=0; E.mode='idle'; E.floor=f; E.openT=1; if(!demo&&mode==='play') SFX.ding(); }

function repack(){
  const cols=Math.max(1,Math.floor(cfg.cap/2)), sp=cols===3?.62:cols===4?.5:.42, colX=c=>CABX+(c-(cols-1)/2)*sp; let col=cols-1; const singles=[];
  for(const p of cargoList()){ if(p.size===2){ p.sx=colX(col); p.sz=-1.35; col--; } else singles.push(p); }
  let k=0; for(const p of singles){ const c=col-(k>>1), back=!(k&1); p.sx=colX(Math.max(0,c)); p.sz=back?-1.8:-.85; k++; }
  dirty=true;
}
/* 装载：配送员从轿厢走向包裹（靠近楼层的门口）。包裹保持静止，等待被搬起。 */
function startLoad(p){
  const c=courier; if(!c||c.state!=='cab'||p.state!=='queue') return;
  c.pkg=p; p.state='toPick'; c.state='toPick'; c.outFloor=E.floor; c.tx=p.x; c.tz=p.z; E.lock=.15; if(!demo) SFX.board();
}
function deliver(p){
  G.delivered++; if(demo) return;
  G.combo=G.comboT>0?G.combo+1:1; G.comboT=cfg.comboW; G.maxCombo=Math.max(G.maxCombo,G.combo);
  const pts=packageScore(p.type,G.combo); G.score+=pts;
  const wy=(courier&&courier.outFloor!=null?courier.outFloor:E.floor)*FH+1.4; popAt(CABX-1.2,wy,0,'+'+pts,'');
  burst(CABX-1.1,wy-.4,-.6,10,'conf',4); SFX.deliver(G.combo);
  if(G.combo===3) banner('COMBO!','','combo');
  else if(G.combo===5) banner('SUPER COMBO!','','super');
  else if(G.combo>5&&G.combo%5===0) banner(G.combo+' COMBO!!','','super');
}
/* 送达：配送员从轿厢把包裹搬到本层门口/边缘，到位后再释放并结算。 */
function startDeliver(p){
  const c=courier; if(!c||c.state!=='cab'||p.state!=='cargo') return;
  c.pkg=p; attachPkg(p);
  c.state='toDrop'; c.outFloor=E.floor; c.tx=pick([-3.45,-1.35]); c.tz=-D+.6;
  E.openT=.7;
}
/* 拾取道具：配送员从轿厢走向本层道具，到位后拾取（针筒即用 / 棍子入包）。 */
function startPickup(it){
  const c=courier; if(!c||c.state!=='cab'||it.taken) return;
  c.item=it; it.taken=true; c.state='toItem'; c.outFloor=it.floor; c.tx=it.x; c.tz=it.z; E.lock=.2;
}
/* 用棍子清僵尸：配送员从轿厢走向本层僵尸，到位后击倒并消耗 1 根棍子。 */
function startKill(z){
  const c=courier; if(!c||c.state!=='cab'||c.sticks<=0) return;
  c.target=z; c.state='toKill'; c.outFloor=z.floor; c.tx=z.x; c.tz=z.z; E.lock=.2;
}
function updElev(dt){
  E.openT-=dt;
  /* 玩家操作可立即打断装载/装卸的短暂锁定：未装满也能随时出发 */
  if(E.lock>0){ E.lock-=dt; const want=(demo||G.over)?0:(E.queued||input.up||input.down); if(E.lock>0&&!want) return; if(E.lock>0) E.lock=0; }
  const h=(demo||G.over)?0:held(), q=(demo||G.over)?0:E.queued; E.queued=0;
  if(q){
    if(E.mode==='auto'&&Math.sign(E.target-E.pos)===q){ if(h!==q) E.target=clamp(E.target+q,0,N-1); else { E.tapBase=E.target; E.mode='manual'; E.lastDir=q; } }
    else if(!atBound(q)){ E.mode='manual'; E.lastDir=q; if(Math.sign(E.v)!==q) E.v=q*START; if(h!==q) autoNext(q); }
  } else if(h&&E.mode!=='manual'&&!atBound(h)){ E.mode='manual'; E.lastDir=h; if(Math.sign(E.v)!==h) E.v=h*START; }
  if(E.mode==='manual'){
    if(!h){ autoNext(E.lastDir); if(E.tapBase!=null){ E.target=clamp(E.lastDir>0?Math.max(E.target,E.tapBase+1):Math.min(E.target,E.tapBase-1),0,N-1); E.tapBase=null; } }
    else { if(h!==E.lastDir){ E.lastDir=h; E.v=h*START; }
      E.v=h*Math.min(cfg.speed,Math.abs(E.v)+cfg.speed*1.3*dt); E.pos+=E.v*dt;
      if(E.pos>=N-1) arrive(N-1); else if(E.pos<=0) arrive(0); }
  }
  if(E.mode==='auto'){ const dist=E.target-E.pos, ad=Math.abs(dist);
    const sp=Math.min(Math.max(Math.abs(E.v),START)+cfg.speed*1.3*dt,cfg.speed,Math.max(1.6,ad*5.5)), stp=sp*dt;
    if(stp>=ad) arrive(E.target); else { E.pos+=Math.sign(dist)*stp; E.v=Math.sign(dist)*sp; } }
  // 停靠自动装卸：仅当配送员空闲在轿厢内时才发起；优先级：送达 > 用棍子清僵尸 > 拾取道具 > 1F 装载
  if(E.mode==='idle'&&E.lock<=0&&!h&&!G.over&&courier&&courier.state==='cab'){
    let done=false;
    if(E.pos!==0){ for(const p of cargoList()){ if(p.dest===E.pos+1){ startDeliver(p); E.lock=.22; done=true; break; } } }
    if(!done&&courier.sticks>0){ const z=zombies.find(z=>z.floor===E.pos); if(z){ startKill(z); done=true; } }
    if(!done){ const it=items.find(it=>it.floor===E.pos&&!it.taken); if(it){ startPickup(it); done=true; } }
    if(!done&&E.pos===0){ const u=used(); for(const p of lobbyList()){ if(u+p.size<=cfg.cap){ startLoad(p); break; } } }
  }
}
function autopilot(dt){
  if(E.mode!=='idle'||E.lock>0) return;
  if(E.pos===0){ if(!lobbyList().length) return; G.autoWait+=dt; if(G.autoWait<1.2) return; G.autoWait=0; }
  G.autoWait=0;
  const ups=cargoList().filter(p=>p.state==='cargo').map(p=>p.dest-1);
  if(ups.length){ const t=Math.min.apply(null,ups); if(t!==E.pos){ E.target=t; E.mode='auto'; } return; }
  if(E.pos!==0){ E.target=0; E.mode='auto'; }
}

/* ---------- package update ----------
 * 包裹是被动对象，自身永不移动：
 *  · queue  → 静止在等待位（生成时即定好坐标）
 *  · carried→ 坐标每帧从配送员 + 偏移量派生（唯一搬运来源）
 *  · cargo  → 位置锁定在轿厢货位，仅 y 跟随电梯
 */
function updPkg(p,dt,time){
  if(p.state==='carried'){
    const c=courier;
    if(c&&c.pkg===p){ p.x=c.x+(p.offX||0); p.z=c.z+(p.offZ||0); p.y=c.y+(p.offY||.6); }
  } else if(p.state==='cargo'){
    if(p.sx!=null){ p.x=p.sx; p.z=p.sz; }
    p.y=lerp(p.y,E.pos*FH,Math.min(1,dt*9));
  }
  p.v.g.position.set(p.x,p.y,p.z);
}

/* ---------- courier update（唯一会移动的搬运者） ---------- */
function updCourier(dt,time){
  const c=courier; if(!c) return;
  const v=c.v, st=c.state;
  /* y：在轿厢内跟随电梯；出轿厢后固定在其作业楼层（等待电梯返回，不随电梯上下滑动） */
  c.y=(st==='cab'?E.pos:(c.outFloor!=null?c.outFloor:E.pos))*FH;
  let moving=false;
  if(st==='toPick'||st==='toCab'||st==='toDrop'||st==='return'||st==='toItem'||st==='toKill'){
    const dx=c.tx-c.x, dz=c.tz-c.z, d=Math.hypot(dx,dz), s=c.speed*dt;
    if(d>.03){ moving=true; if(s>=d){c.x=c.tx;c.z=c.tz;} else {c.x+=dx/d*s;c.z+=dz/d*s;}
      if(Math.abs(dx)>.05) c.face=dx>0?Math.PI/2:-Math.PI/2; else c.face=0; }
    else { const p=c.pkg, cabHere=E.pos===c.outFloor;
      if(st==='toPick'){ if(p) attachPkg(p); c.state='toCab'; c.tx=CABX; c.tz=-.9; }
      else if(st==='toCab'){ if(cabHere){ if(p){ p.state='cargo'; repack(); p.x=p.sx; p.z=p.sz; p.y=E.pos*FH; } c.pkg=null; c.state='return'; c.tx=c.home.x; c.tz=c.home.z; dirty=true; } }
      else if(st==='toDrop'){ if(p){ p.lab.visible=false; p.state='gone'; deliver(p); } c.pkg=null; c.state='return'; c.tx=c.home.x; c.tz=c.home.z; }
      else if(st==='toItem'){ const it=c.item; if(it){ killItem(it); const i=items.indexOf(it); if(i>=0) items.splice(i,1);
          if(it.def.heal){ addInfection(-it.def.heal); popAt(it.x,it.y+1.4,it.z,fmt(__('msg.heal','感染 -{n}'),{n:it.def.heal}),'info'); SFX.heart(); }
          else { c.sticks++; popAt(it.x,it.y+1.4,it.z,fmt(__('msg.gotItem','{name} +1'),{name:it.def.name}),'info'); SFX.bonus(); }
          c.item=null; } c.state='return'; c.tx=c.home.x; c.tz=c.home.z; dirty=true; }
      else if(st==='toKill'){ const z=c.target; if(z){ killZombie(z); const i=zombies.indexOf(z); if(i>=0) zombies.splice(i,1);
          burst(z.x,z.y+1.0,z.z,14,'smoke'); popAt(z.x,z.y+1.6,z.z,__('msg.kill','击倒!'),''); c.sticks--; SFX.miss(); } c.target=null;
        c.state='return'; c.tx=c.home.x; c.tz=c.home.z; dirty=true; }
      else if(st==='return'){ if(cabHere) c.state='cab'; }
    }
  }
  if(c.state==='cab'){ c.x=lerp(c.x,c.home.x,Math.min(1,dt*8)); c.z=lerp(c.z,c.home.z,Math.min(1,dt*8)); }
  const v2=v; if(moving){ c.ph+=dt*c.speed*4.2; const sw=Math.sin(c.ph)*.6; v2.legL.rotation.x=sw; v2.legR.rotation.x=-sw; v2.up.position.y=Math.abs(Math.sin(c.ph))*.04; }
  else { v2.legL.rotation.x*=.7; v2.legR.rotation.x*=.7; v2.up.position.y=Math.sin(time*3+c.ph)*.012; }
  let dr=c.face-v2.b.rotation.y; v2.b.rotation.y+=dr*Math.min(1,dt*12);
  v2.g.position.set(c.x,c.y,c.z);
}

/* ---------- zombie update ---------- */
function updZombie(z,dt,time){
  const v=z.v;
  if(z.type==='walker'){
    z.x+=z.dir*z.speed*dt;
    if(z.x<BX0+1){z.x=BX0+1;z.dir=1;} else if(z.x>BX1-1){z.x=BX1-1;z.dir=-1;}
    z.ph+=dt*(2.2+z.speed*4);
    const sw=Math.sin(z.ph)*.5; v.legL.rotation.x=sw; v.legR.rotation.x=-sw;
    v.b.rotation.y=z.dir>0?Math.PI/2:-Math.PI/2;
    v.up.position.y=Math.sin(time*2+z.ph)*.02;
  } else {
    /* 喷酸者：像 walker 一样巡逻；电梯经过或停靠本层且对位时喷酸 */
    if(z.speed>0){ z.x+=z.dir*z.speed*dt;
      if(z.x<SPIT_X0){z.x=SPIT_X0;z.dir=1;} else if(z.x>SPIT_X1){z.x=SPIT_X1;z.dir=-1;} }
    v.b.rotation.y=z.dir>0?Math.PI/2:-Math.PI/2;
    z.ph+=dt*(2+z.speed*4);
    const sw=Math.sin(z.ph)*.45; v.legL.rotation.x=sw; v.legR.rotation.x=-sw;
    v.up.position.y=Math.sin(time*1.6+z.ph)*.012;
    z.spitT-=dt; /* 冷却始终计时：就绪后只要电梯在其下方（含同层）即向配送员喷酸 */
    const below=!G.over&&(mode==='play'||demo)&&E.pos<z.floor+.5;
    if(below&&z.spitT<=0){ z.spitT=SPIT_CD; fireSpit(z); if(!demo) SFX.spit(); }
  }
  v.g.position.set(z.x,z.y,z.z);
}
function maintainZombies(dt){
  const d=difficultyAt(G.elapsed,G.delivered), target=d.zombieDensity;
  while(zombies.length>target) killZombie(zombies.pop());
  if((mode==='play'||demo)&&!G.over){
    G.zSpawnT-=dt;
    if(zombies.length<target&&G.zSpawnT<=0){ G.zSpawnT=rnd(.7,1.6)/(d.spawnRate||1);       const pool=d.unlocked.filter(t=>t==='walker'||t==='spitter');
      for(const t of FORCE_ZOMBIES){ if(ZCOL[t]&&!pool.includes(t)) pool.push(t); }
      zombies.push(makeZombie(pool.length?pick(pool):'walker')); }
  }
}

/* ================= HUD / DOM ================= */
function popAt(x,y,z,txt,cls){ const el0=$('pops'); if(!el0) return; const p=new T.Vector3(x,y,z).project(camera); const el=document.createElement('div'); el.className='pop '+(cls||''); el.textContent=txt;
  el.style.left=clamp((p.x*.5+.5)*vw,50,vw-50)+'px'; el.style.top=clamp((-p.y*.5+.5)*vh,90,vh-60)+'px'; el0.appendChild(el); el.addEventListener('animationend',()=>el.remove()); setTimeout(()=>el.remove(),1800); }
function banner(t,s,cls){ const b=$('banner'); if(!b) return; b.className='banner'; void b.offsetWidth; b.className='banner show '+cls; const bt=b.querySelector('.bt'), bs=b.querySelector('.bs'); if(bt) bt.textContent=t; if(bs) bs.textContent=s||''; clearTimeout(banner.t); banner.t=setTimeout(()=>b.classList.remove('show'),1500); }
function banner2(t){ const b=$('banner2'); if(!b) return; b.className='banner small'; void b.offsetWidth; b.className='banner small show'; const bt=b.querySelector('.bt'); if(bt) bt.textContent=t; clearTimeout(banner2.t); banner2.t=setTimeout(()=>b.classList.remove('show'),1500); }
function alertMsg(t){ const a=$('alert'); if(!a) return; a.textContent=t; a.classList.remove('go'); void a.offsetWidth; a.classList.add('go'); }
const shown={};
function setTxt(id,v){ const el=$(id); if(!el) return; if(shown[id]!==v){ shown[id]=v; el.textContent=v; } }
function hudForce(){ for(const k in shown) delete shown[k]; }
function infLevel(v){ return v>=85?'lv4':v>=70?'lv3':v>=50?'lv2':'lv1'; }
function setBar(v){ const b=$('infBar'); if(!b) return; b.style.width=clamp(v,0,100)+'%'; const lv=infLevel(v); ['lv1','lv2','lv3','lv4'].forEach(c=>b.classList.toggle(c,c===lv)); const p=$('infPill'); if(p) p.setAttribute('data-lvl',lv); const iv=$('infVal'); if(iv) iv.textContent=Math.round(v)+'%'; }
function updHud(){
  setTxt('time',String(Math.floor(G.elapsed)));
  const tp=$('timePill'); if(tp) tp.classList.toggle('warn',G.inf>=70&&mode==='play');
  setTxt('count',String(G.delivered)); setTxt('score',G.score.toLocaleString());
  setTxt('floorNow',(Math.round(E.pos)+1)+'F');
  setBar(G.inf);
  { const ih=$('itemHud'); const n=courier?courier.sticks:0; if(ih){ ih.hidden=n<=0; if(n>0) setTxt('itemHud',fmt(__('msg.stickCount','{name} ×{n}'),{name:ITEMS.stick.name,n})); } }
  if(dirty){ dirty=false; const u=used(); const ct=$('capText'); if(ct){ ct.textContent=u+' / '+cfg.cap; ct.classList.toggle('full',u>=cfg.cap); }
    const set=new Set(cargoList().map(p=>p.dest-1)); floorsFx.forEach((f,i)=>{ f.on=set.has(i); }); }
}

const miniEl=$('mini'), mctx=miniEl?miniEl.getContext('2d'):null; let miniH=0;
function drawMini(){ if(!mctx||!miniEl||!miniH) return; const g=mctx, w=30, h=miniH, dpr=Math.min(2,devicePixelRatio||1); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
  rr(g,6,2,18,h-4,9); g.fillStyle='rgba(12,20,32,.92)'; g.fill(); g.lineWidth=2.5; g.strokeStyle='#5a6570'; g.stroke();
  const Y=i=>h-14-i/(N-1)*(h-28); g.fillStyle='rgba(140,160,190,.3)'; for(let i=0;i<N;i++){ g.fillRect(i%5===4?9:12,Y(i)-.5,i%5===4?12:6,1); }
  const dest={}; for(const p of cargoList()) dest[p.dest-1]=(dest[p.dest-1]||0)+1;
  g.font='11px '+FD; g.textAlign='center'; g.textBaseline='middle';
  for(const k in dest){ const y=Y(+k); g.beginPath(); g.arc(15,y,8,0,7); g.fillStyle='#8fd0f2'; g.fill(); g.strokeStyle='#0e1620'; g.lineWidth=2; g.stroke(); g.fillStyle='#0e1620'; g.fillText(dest[k],15,y+1); }
  for(const z of zombies){ const y=Y(z.floor); g.beginPath(); g.arc(6+(z.x-BX0)/(BX1-BX0)*18,y,3,0,7); g.fillStyle='#a6d84a'; g.fill(); }
  const ey=Y(E.pos); rr(g,1,ey-7,28,14,5); g.fillStyle='#e8453c'; g.fill(); g.lineWidth=2.5; g.strokeStyle='#0e1620'; g.stroke(); g.fillStyle='#fff'; g.fillText(Math.round(E.pos)+1,15,ey+1); }

/* ================= camera / resize ================= */
let vw=1,vh=1; const view={h:22}, camT={x:VIEW_CX,y:6}; let camY=6, insetTop=0, insetBot=0;
function resize(){ const a=$('od-app'); if(!a) return; vw=a.clientWidth||1; vh=a.clientHeight||1; const pr=Math.min(2,window.devicePixelRatio||1); renderer.setPixelRatio(pr); renderer.setSize(vw,vh,false);
  camera.aspect=vw/vh; const land=vw/vh>=1.1; view.h=Math.max(VIEW_W/camera.aspect,Math.min(N*FH+6,23));
  const hud=$('hud'); const hudOn=!!(hud&&!hud.hidden); const bottom=$('bottom'); const bh=bottom?bottom.offsetHeight:0;
  insetTop=hudOn?84/vh:.02; insetBot=hudOn&&!land?(bh+6)/vh:.03;
  camera.updateProjectionMatrix();
  if(miniEl){ miniH=Math.max(60,land?vh-110:vh-94-(hudOn?bh:0)-10); const dpr=Math.min(2,devicePixelRatio||1); miniEl.width=30*dpr; miniEl.height=miniH*dpr; miniEl.style.height=miniH+'px'; } }
function updCamera(dt,time){
  const H=view.h, lo=-1.3+H/2-insetBot*H, hi=N*FH+3.2-H/2+insetTop*H;
  let ty= hi<=lo ? lo : clamp(E.pos*FH+1.2+(insetTop-insetBot)*H*.5+H*.02,lo,hi);
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
  if(DY) return;
  requestAnimationFrame(frame);
  const time=ms/1000; let dt=Math.min(.05,time-last||0); last=time;
  if(mode==='pause'){ renderer.render(scene,camera); return; }
  const sim=mode==='play'||mode==='title'||mode==='count'||mode==='end';
  if(sim){
    if(mode==='play'&&!G.over){
      G.elapsed+=dt;
      G.diffT-=dt; if(G.diffT<=0){ G.diffT=.5; const d=difficultyAt(G.elapsed,G.delivered); cfg.infectionScale=d.infectionScale; cfg.zombieDensity=d.zombieDensity; cfg.spawnRate=d.spawnRate; cfg.unlocked=d.unlocked; }
      G.beatT-=dt; if(G.inf>=40&&G.beatT<=0){ G.beatT=lerp(.9,.3,G.inf/100); SFX.heart(); }
    }
    if(G.comboT>0){ G.comboT-=dt; if(G.comboT<=0) G.combo=0; }
    if(demo) autopilot(dt);
    if(mode!=='count') updElev(dt);
    if((mode==='play'||demo)&&!G.over){ G.spawnT-=dt; if(G.spawnT<=0){ if(lobbyList().length<cfg.maxQ) spawnPkg(); G.spawnT=rnd(cfg.spawn[0],cfg.spawn[1])*(demo?1.4:1); } }
    maintainZombies(dt);
    if((mode==='play'||demo)&&!G.over){ G.itemT-=dt; if(G.itemT<=0){ G.itemT=rnd(ITEM_SPAWN[0],ITEM_SPAWN[1]); if(items.length<ITEM_MAX) spawnItem(); } }
    updCourier(dt,time); /* 配送员先动，包裹再据此定位 */
    for(const p of packages.slice()) updPkg(p,dt,time);
    for(const z of zombies) updZombie(z,dt,time);
    updItems(dt,time);
    updSpits(dt);
    for(let i=packages.length-1;i>=0;i--){ if(packages[i].state==='gone'){ killPkg(packages[i]); packages.splice(i,1); } }
    if(mode==='play'&&!G.over&&E.mode==='idle'){
      const threat=[]; for(const z of zombies){ if(z.floor===E.floor&&Math.abs(z.x-CABX)<=THREAT_R) threat.push(z.type); }
      addInfection(infectionPerSecond(threat,cfg.infectionScale)*dt);
    }
    if(G.inf>=100&&!G.over) finish(true);
    if(mode==='end'){ G.endT-=dt; if(G.endT<=0) showResult(); }
  }
  // cab visuals
  cab.position.y=E.pos*FH+.02; const top=N*FH; cable.scale.y=Math.max(.01,top+.8-(cab.position.y+2.1)); cable.position.y=(top+.8+cab.position.y+2.1)/2;
  const cwm=world.getObjectByName('cw'); if(cwm) cwm.position.y=(N-1-E.pos)*FH+1;
  const open=E.mode==='idle'?1:0; E.door=lerp(E.door,open,Math.min(1,dt*12));
  cabDoors[0].scale.z=cabDoors[1].scale.z=1-E.door*.9; cabDoors[0].position.z=-1.3-.525-E.door*.47; cabDoors[1].position.z=-1.3+.525+E.door*.47;
  drawCabSign((E.mode==='idle'?'':E.v>0?'▲ ':'▼ ')+(Math.round(E.pos)+1)+'F');
  for(const f of floorsFx){ const act=f.on; if(act) f.mat.color.setHex(0xffc400); const ta=act?.3+Math.sin(time*7)*.14:0; f.a=lerp(f.a,ta,Math.min(1,dt*10)); f.mesh.visible=f.a>.01; f.mat.opacity=f.a; }
  updTruck(dt,time);
  for(const c of clouds){ c.position.x+=c.userData.v*dt; if(c.position.x>60) c.position.x=-60; }
  updParts(dt); updCamera(dt,time);
  if(!demo){ updHud(); drawMini(); }
  renderer.render(scene,camera);
}

/* ================= flow ================= */
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('show',s.id===id)); }
function setHud(on){ const hud=$('hud'); if(hud) hud.hidden=!on; resize(); }
function toTitle(){ bgmStop(); mode='title'; setHud(false); resetGame(true); show('title'); const cd=$('cd'); if(cd) cd.classList.remove('show'); }
function startGame(){
  auInit(); if(AU.ctx&&AU.ctx.state==='suspended') AU.ctx.resume();
  cdTimers.forEach(clearTimeout); cdTimers=[]; show(''); resetGame(false); setHud(true); mode='count'; camY=view.h/2-1.3;
  const cd=$('cd'); if(cd) cd.classList.add('show');
  ['3','2','1','GO!'].forEach((s,i)=>cdTimers.push(setTimeout(()=>{ if(mode!=='count') return; if(cd) cd.innerHTML='<span>'+s+'</span>'; SFX.count(i===3); if(i===3){ mode='play'; bgmStart(); cdTimers.push(setTimeout(()=>{ if(cd) cd.classList.remove('show'); },600)); } },i*650)));
}
let cdTimers=[];
function finish(over){ if(G.over) return; G.over=true; mode='end'; G.endT=1.9; bgmStop(); SFX.end(); E.queued=0; G.score+=Math.round(G.elapsed*5);
  banner(over?'MUTATED!':'SURVIVED',over?__('msg.gameoverSub','感染が限界を超えた…'):__('msg.timeupSub','よく生き延びた！'),over?'bad':'info'); if(!over) rain(80); }
function showResult(){
  mode='result';
  const rank=rankFor(G.delivered);
  const rt=$('resTitle'); if(rt) rt.textContent=__('res.title','生存記録');
  const set=(id,v)=>{ const el=$(id); if(el) el.textContent=v; };
  set('rScore',G.score.toLocaleString()); set('rDel',String(G.delivered)); set('rTime',String(Math.round(G.elapsed)));
  set('rCombo',String(G.maxCombo)); set('rPeak',String(Math.round(G.peakInf)));
  const rk=$('rank'); if(rk){ rk.textContent=rank; rk.style.animation='none'; void rk.offsetWidth; rk.style.animation=''; }
  lastRes={score:G.score,delivered:G.delivered,time:Math.round(G.elapsed)};
  const can=RANKS.includes(diffKey)&&G.score>0; const rb=$('regBox'); if(rb) rb.hidden=!can;
  const rm=$('regMsg'); if(rm) rm.textContent='';
  const nk=$('nick'); if(nk){ try{ if(!nk.value) nk.value=localStorage.getItem('od_nick')||''; }catch(e){} }
  show('result');
  try{ window.dispatchEvent(new CustomEvent('od:result',{detail:lastRes})); }catch(e){}
  if(rank==='S'||rank==='A') SFX.combo(true);
}
const RANKS=['normal','hard','extreme'];
function pause(){ if(mode!=='play') return; mode='pause'; if(AU.ctx) AU.ctx.suspend(); input.up=input.down=false; if($('btnUp'))$('btnUp').classList.remove('on'); if($('btnDown'))$('btnDown').classList.remove('on'); }
function resume(){ if(mode!=='pause') return; mode='play'; if(AU.ctx) AU.ctx.resume(); }
function togglePause(){ if(mode==='play') pause(); else if(mode==='pause') resume(); }
function setDiff(k){ diffKey=k; cfg=DIFFS[k]; N=cfg.floors; const dn=$('diffNow'); if(dn) dn.textContent=cfg.name;
  try{localStorage.setItem('od_diff',k)}catch(e){}
  killAll(); buildWorld(); resize(); resetGame(true); camY=view.h/2-1.3;
  document.querySelectorAll('.diff').forEach(b=>b.classList.toggle('sel',b.dataset.k===k)); }

/* ================= input ================= */
function press(d){ if(mode!=='play') return; if(d>0) input.up=true; else input.down=true; input.last=d; E.queued=d; const b=$(d>0?'btnUp':'btnDown'); if(b) b.classList.add('on'); }
function release(d){ if(d>0) input.up=false; else input.down=false; const b=$(d>0?'btnUp':'btnDown'); if(b) b.classList.remove('on'); }
[['btnUp',1],['btnDown',-1]].forEach(([id,d])=>{ const b=$(id); if(!b) return;
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); try{b.setPointerCapture(e.pointerId)}catch(_){} press(d); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,()=>release(d)));
  b.addEventListener('contextmenu',e=>e.preventDefault()); });
const KEYS={ArrowUp:1,KeyW:1,ArrowDown:-1,KeyS:-1};
const cleanup=[];
cleanup.push((()=>{ const h=e=>{ if(e.target&&e.target.tagName==='INPUT') return; const d=KEYS[e.code]; if(d){ e.preventDefault(); if(!e.repeat) press(d); } else if(e.code==='KeyP'||e.code==='Escape'){ togglePause(); } else if((e.code==='Enter'||e.code==='Space')&&mode==='title'&&$('title')&&$('title').classList.contains('show')&&document.activeElement===document.body){ startGame(); } };
  addEventListener('keydown',h); return ()=>removeEventListener('keydown',h); })());
cleanup.push((()=>{ const h=e=>{ const d=KEYS[e.code]; if(d) release(d); }; addEventListener('keyup',h); return ()=>removeEventListener('keyup',h); })());
cleanup.push((()=>{ const h=()=>{ release(1); release(-1); }; addEventListener('blur',h); return ()=>removeEventListener('blur',h); })());
cleanup.push((()=>{ const h=()=>{ if(document.hidden&&mode==='play') pause(); }; document.addEventListener('visibilitychange',h); return ()=>document.removeEventListener('visibilitychange',h); })());
{ const a=$('od-app'); if(a) a.addEventListener('touchmove',e=>{ if(!e.target.closest('.card')) e.preventDefault(); },{passive:false}); }
const click=(id,f)=>{ const el=$(id); if(el) el.addEventListener('click',()=>{ auInit(); SFX.click(); f(); }); };
click('startBtn',startGame);
click('againBtn',()=>{ if(AU.ctx) AU.ctx.resume(); bgmStop(); startGame(); });
click('pauseBtn',togglePause);
click('diffBtn',()=>show('diffPanel'));
click('howBtn',()=>show('howPanel'));
/* 排行榜：不在此实现网络请求，仅派发事件给外壳（见文件头事件契约） */
click('rankBtn',()=>{ try{ window.dispatchEvent(new CustomEvent('od:openrank',{detail:{diff:diffKey}})); }catch(e){} });
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{ SFX.click(); show('title'); }));
document.querySelectorAll('.htab').forEach(b=>b.addEventListener('click',()=>{ SFX.click(); const A=b.dataset.h==='A'; const ha=$('howA'), tl=$('typeList'); if(ha) ha.hidden=!A; if(tl) tl.hidden=A; document.querySelectorAll('.htab').forEach(x=>x.classList.toggle('sel',x===b)); }));
{ const dd=$('diffs'); if(dd){ let h=''; for(const k in DIFFS){ const d=DIFFS[k];
    h+='<button class="diff" data-k="'+k+'"><b style="background:'+d.col+'">'+d.name+'</b><span>'+STYLES[k].bname+'</span><small><i>'+fmt(__('diff.floors','{n}階建て・{k}'),{n:d.floors,k:STYLES[k].kind})+'</i><br><i>'+fmt(__('diff.cap','定員{c}・感染に耐えて生き延びろ'),{c:d.cap})+'</i></small></button>'; }
    dd.innerHTML=h; document.querySelectorAll('.diff').forEach(b=>b.addEventListener('click',()=>{ auInit(); SFX.click(); setDiff(b.dataset.k); })); } }
{ const tl=$('typeList'); if(tl){ let t=''; for(const k in PKG){ const d=PKG[k]; t+='<i style="background:'+d.css+'">'+d.name+'</i><span>'+d.desc+'</span>'; } tl.innerHTML=t; } }

/* ================= boot ================= */
let DY=false, RO=null, rafId=0, goTimer=0;
function boot(){ let k='normal'; try{ const s=localStorage.getItem('od_diff'); if(s&&DIFFS[s]) k=s; }catch(e){}
  const app=$('od-app'); setDiff(k); if(window.ResizeObserver&&app){ RO=new ResizeObserver(resize); RO.observe(app); }
  cleanup.push((()=>{ const h=()=>resize(); addEventListener('resize',h); return ()=>removeEventListener('resize',h); })());
  rafId=requestAnimationFrame(frame); }
let booted=false; const go=()=>{ if(DY||booted) return; booted=true; boot(); };
try{ Promise.all([document.fonts.load('40px "Mochiy Pop One"','0123456789F▲▼'),document.fonts.load('700 20px "M PLUS Rounded 1c"','0123456789F')]).then(go,go); }catch(e){ go(); }
goTimer=setTimeout(go,2500);
function destroy(){ if(DY) return; DY=true; clearTimeout(goTimer);
  cleanup.forEach(f=>{ try{ f(); }catch(_){}}); cleanup.length=0;
  bgmStop(); cdTimers.forEach(clearTimeout); cdTimers=[];
  if(RO) RO.disconnect(); if(rafId) cancelAnimationFrame(rafId);
  if(AU.ctx){ try{ AU.ctx.close(); }catch(_){} AU.ctx=null; }
  if(window.__od) window.__od.destroyed=true; }
window.__od={G,E,press,release,startGame,setDiff,destroy,zombies:()=>zombies,packages:()=>packages,items:()=>items,spawnItem:(t)=>spawnItem(t),startKill:(z)=>startKill(z),startPickup:(it)=>startPickup(it),courier:()=>courier,spits:()=>spits,parts:()=>parts};
})();

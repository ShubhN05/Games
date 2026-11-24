/* Fighter Game — arenas. All art is drawn in code (original, no image files).
   Every arena is 960x540 and uses the SAME fighting floor line (FLOOR_Y) so fighters stand
   identically in every arena. Names/ids are documented in the Obsidian vault:
   Games/Fighter Game/Arenas/Fighter Game — Arenas.md  (keep them in sync). */
(function () {
'use strict';
const W = 960, H = 540, FLOOR_Y = 450;

/* ---------- helpers ---------- */
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function mix(a,b,k){ const A=parseInt(a.slice(1),16), B=parseInt(b.slice(1),16);
  const f=(s)=>Math.round(((A>>s)&255)+(((B>>s)&255)-((A>>s)&255))*k);
  return 'rgb('+f(16)+','+f(8)+','+f(0)+')'; }
function vgrad(c,x,y,w,h,stops){ const g=c.createLinearGradient(0,y,0,y+h); stops.forEach(([o,col])=>g.addColorStop(o,col)); c.fillStyle=g; c.fillRect(x,y,w,h); }
function poly(c,pts,fill){ c.fillStyle=fill; c.beginPath(); pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill(); }
function glow(c,x,y,r,c0,c1){ const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,c0); g.addColorStop(1,c1||'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
function ell(c,x,y,rx,ry,fill){ c.fillStyle=fill; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,6.2832); c.fill(); }
// draw at low resolution then scale up crisp (pixel-art look)
let _pc = null;
function pixel(ctx, lw, lh, fn){
  if(!_pc) _pc = document.createElement('canvas');
  _pc.width = lw; _pc.height = lh; const p = _pc.getContext('2d'); p.imageSmoothingEnabled = false;
  p.fillStyle = '#000'; p.fillRect(0, 0, lw, lh);
  fn(p, lw, lh); ctx.imageSmoothingEnabled = false; ctx.drawImage(_pc, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
}
function flame(p, x, y, t, s){
  const f = Math.sin(t*14 + s*3), g = Math.sin(t*9 + s*7);
  p.fillStyle='#c8340f'; p.fillRect(x-2, y-6+(f>0?1:0), 5, 6);
  p.fillStyle='#ff8a1a'; p.fillRect(x-1, y-9+(g>0?1:0), 3, 8);
  p.fillStyle='#ffd24a'; p.fillRect(x-1, y-7, 2, 5);
  p.fillStyle='#fff3b0'; p.fillRect(x, y-5, 1, 2);
}
function vignette(c, a){ const g=c.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,'+a+')'); c.fillStyle=g; c.fillRect(0,0,W,H); }

/* ---------- 1. SANDSTONE TEMPLE (pixel, warm dusk) ---------- */
function a1(ctx, t){
  pixel(ctx, 320, 180, (p,w,h) => {
    const r = rng(11);
    for(let y=0;y<112;y+=2){ p.fillStyle = mix('#df7860','#f7c597', y/112); p.fillRect(0,y,w,2); }
    [[60,24,28],[128,16,20],[226,28,30],[268,18,22],[170,42,16],[34,50,16],[296,48,14]].forEach(([x,y,s]) => {
      p.fillStyle='#fbe2c2'; p.fillRect(x,y,s,2); p.fillRect(x+3,y-2,s-8,2); p.fillRect(x-3,y+2,s-3,1);
      p.fillStyle='#e0a98f'; p.fillRect(x+4,y+2,s-6,1); });
    // far mountains
    poly(p,[[0,62],[24,50],[44,64],[62,58],[84,80],[104,98],[0,98]],'#8c5a6a');
    poly(p,[[320,62],[296,50],[276,64],[258,58],[236,80],[216,98],[320,98]],'#8c5a6a');
    poly(p,[[104,98],[126,80],[142,66],[154,74],[164,60],[178,70],[192,66],[204,78],[220,98]],'#9a4a56');
    poly(p,[[96,98],[120,86],[150,92],[170,84],[200,92],[224,98]],'#b0646a');
    for(let y=96;y<142;y++){ p.fillStyle = mix('#cf8060','#8a4a46',(y-96)/46); p.fillRect(0,y,w,1); }   // dusty plain behind the temple
    // temple
    p.fillStyle='#7c4640'; p.fillRect(98,86,124,32);
    p.fillStyle='#b8663f'; p.fillRect(96,82,128,5); p.fillStyle='#d8884a'; p.fillRect(96,82,128,1);
    for(let x=100;x<220;x+=4){ p.fillStyle='#9a5538'; p.fillRect(x,84,2,2); }
    for(let i=0;i<14;i++){ const x=102+i*8.4|0; p.fillStyle='#2e2132'; p.fillRect(x+1,92,5,24); p.fillStyle='#2e2132'; p.fillRect(x+2,90,3,2);
      p.fillStyle='#c27a48'; p.fillRect(x,90,1,26); }
    p.fillStyle='#9ea6cf'; p.fillRect(147,94,26,18); p.fillStyle='#d8def5'; p.fillRect(148,95,24,2); p.fillStyle='#6a729a'; p.fillRect(148,108,24,3);
    p.fillStyle='#c78a46'; p.fillRect(156,114,8,8); p.fillStyle='#7a3a2a'; p.fillRect(158,116,4,4);
    // stairs
    for(let i=0;i<8;i++){ p.fillStyle = i%2?'#7a4650':'#8a525a'; p.fillRect(60-i*3, 114+i*4, 200+i*6, 4); }
    // side pavilions
    [[0,1],[320,-1]].forEach(([x0,d]) => {
      p.fillStyle='#b8663f'; p.fillRect(x0+(d>0?0:-70), 66, 70, 6); p.fillStyle='#d8884a'; p.fillRect(x0+(d>0?0:-70), 66, 70, 1);
      p.fillStyle='#8a4a3a'; p.fillRect(x0+(d>0?0:-70), 72, 70, 4);
      [8,34,58].forEach(o => { const x = x0 + d*o - (d>0?0:3); p.fillStyle='#a85a38'; p.fillRect(x,76,6,48); p.fillStyle='#d8884a'; p.fillRect(x,76,1,48); p.fillStyle='#7a3a2a'; p.fillRect(x-1,120,8,4); p.fillRect(x-1,74,8,3); });
      p.fillStyle='#6a4252'; p.fillRect(x0+(d>0?10:-60), 80, 44, 44); p.fillStyle='#7c5260'; for(let k=0;k<4;k++) p.fillRect(x0+(d>0?10:-60), 84+k*10, 44, 1);
    });
    // floor
    for(let y=140;y<180;y++){ p.fillStyle = mix('#e08a40','#6a2e26',(y-140)/40); p.fillRect(0,y,w,1); }
    for(let y=140;y<176;y+=6){ p.fillStyle='rgba(255,220,150,0.12)'; p.fillRect(40+(y-140),y,w-80-(y-140)*2,2); }
    p.fillStyle='rgba(70,28,24,0.55)';
    for(let i=0;i<12;i++){ p.fillRect(80+i*13,140+(i%3)*10,(i%2)?10:1,(i%2)?1:8); }
    for(let i=0;i<50;i++){ p.fillStyle = r()<0.5?'#f2a45a':'#8c3a2c'; p.fillRect(r()*w|0,142+r()*36|0,2,1); }
    // cave-ceiling drips
    p.fillStyle='#4a2c30'; for(let x=0;x<w;x+=3){ const l=2+((Math.sin(x*0.31)+Math.sin(x*0.07)*2+2)*4|0); p.fillRect(x,0,3,l); }
    for(let i=0;i<9;i++){ const x=20+i*36+(r()*10|0), l=10+(r()*14|0); p.fillRect(x,0,4,l); p.fillRect(x+1,l,2,3); }
  });
  vignette(ctx, 0.45);
}

/* ---------- 2. TORCH COLOSSEUM (pixel, sand pit) ---------- */
function a2(ctx, t){
  pixel(ctx, 320, 180, (p,w,h) => {
    const r = rng(22);
    p.fillStyle='#1c1214'; p.fillRect(0,0,w,h);
    for(let y=0;y<98;y+=6){ const off=((y/6)%2)*6; for(let x=-12;x<w;x+=12){ const v=r(); p.fillStyle = v<0.33?'#634436':v<0.66?'#5a3e32':'#6c4a3a'; p.fillRect(x+off,y,11,5); p.fillStyle='rgba(255,210,160,0.12)'; p.fillRect(x+off,y,11,1); } }
    const arch = (cx, top, hw, bot, frame, inner) => {
      for(let y=top;y<bot;y++){ const d=y-top; const half = d<hw ? Math.sqrt(Math.max(0,hw*hw-(hw-d)*(hw-d))) : hw;
        p.fillStyle=frame; p.fillRect(cx-half-4|0,y,half*2+8|0,1); p.fillStyle=inner; p.fillRect(cx-half|0,y,half*2|0,1); } };
    arch(160, 20, 24, 98, '#8c6c52', '#130b17');
    arch(62, 40, 14, 98, '#8c6c52', '#241620'); arch(258, 40, 14, 98, '#8c6c52', '#241620');
    p.fillStyle='#4a3a3c'; [[54,86,6,12],[64,88,5,10],[250,86,6,12],[261,88,5,10]].forEach(([x,y,a,b]) => { p.fillRect(x,y,a,b); p.fillRect(x+1,y-4,a-2,4); });
    [[106,20],[210,20]].forEach(([x,y]) => { p.fillStyle='#98785a'; p.fillRect(x,y,12,78); p.fillStyle='#b8946e'; p.fillRect(x,y,2,78); p.fillStyle='#6c523f'; p.fillRect(x+10,y,2,78); p.fillRect(x-2,y,16,4); p.fillRect(x-2,y+74,16,4); });
    [[22,50],[104,62],[216,62],[298,50]].forEach(([x,y],i) => { p.fillStyle='#2a2a30'; p.fillRect(x-2,y,5,5); p.fillRect(x-1,y+5,3,5); flame(p,x,y,t,i); });
    p.fillStyle='#4e3626'; p.fillRect(0,96,w,6);
    for(let y=102;y<h;y++){ p.fillStyle = mix('#e29a44','#a85a2e',(y-102)/78); p.fillRect(0,y,w,1); }
    for(let i=0;i<300;i++){ p.fillStyle = r()<0.5?'#f3b85c':'#c47838'; p.fillRect(r()*w|0,104+r()*50|0,2,1); }
    glow(p,160,128,70,'rgba(255,230,160,0.22)');
    for(let i=0;i<22;i++){ const x=r()*w|0, y=108+r()*60|0; p.fillStyle='#4a8a3a'; p.fillRect(x,y,2,1); p.fillRect(x+1,y-1,1,1); p.fillStyle='#6aaa4a'; p.fillRect(x,y-1,1,1); }
    p.fillStyle='#24161a'; p.fillRect(0,160,w,20);
    for(let x=10;x<w;x+=36){ p.fillStyle='#0e080c'; p.fillRect(x,164,18,16); p.fillRect(x+2,162,14,2); }
    p.fillStyle='#4e3a34'; p.fillRect(0,160,w,2);
  });
  vignette(ctx, 0.5);
}

/* ---------- 3. NEON RING (smoky boxing ring) ---------- */
function a3(ctx, t){
  vgrad(ctx,0,0,W,H,[[0,'#07040f'],[0.55,'#0b0719'],[1,'#030208']]);
  const sm = (x,y,r,c) => glow(ctx, x + Math.sin(t*0.5 + x)*14, y, r, c);
  sm(180,170,260,'rgba(255,40,90,0.40)'); sm(780,170,260,'rgba(255,40,90,0.40)');
  sm(300,90,240,'rgba(130,70,255,0.45)'); sm(660,90,240,'rgba(130,70,255,0.45)');
  sm(480,60,260,'rgba(60,120,255,0.38)'); sm(120,260,200,'rgba(255,60,110,0.28)'); sm(840,260,200,'rgba(255,60,110,0.28)');
  sm(480,230,300,'rgba(70,40,150,0.30)');
  const beam = (x0, x1, col) => { const g=ctx.createLinearGradient(0,0,0,360); g.addColorStop(0,col); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=g; poly(ctx,[[x0-8,0],[x0+8,0],[x1+110,380],[x1-110,380]],g); };
  beam(200,330,'rgba(140,170,255,0.30)'); beam(760,630,'rgba(255,120,160,0.28)'); beam(480,480,'rgba(160,120,255,0.20)');
  [[200,8,'#bcd0ff'],[250,6,'#bcd0ff'],[760,8,'#ff9ab8'],[710,6,'#ff9ab8'],[480,5,'#ff3b5c'],[450,4,'#ff3b5c'],[510,4,'#ff3b5c']].forEach(([x,r,c]) => { glow(ctx,x,12,r*5,c); ell(ctx,x,10,r,r*0.6,'#fff'); });
  // ring ropes + posts
  const ropeY = [262, 292, 322];
  ropeY.forEach((y,i) => { const g=ctx.createLinearGradient(0,0,W,0); g.addColorStop(0,'#c0a0ff'); g.addColorStop(0.5,'#3a2a5a'); g.addColorStop(1,'#ff90b0'); ctx.strokeStyle=g; ctx.lineWidth=4-i*0.5; ctx.beginPath(); ctx.moveTo(0,y); ctx.quadraticCurveTo(W/2,y+8,W,y); ctx.stroke(); });
  [[10,34],[300,22],[660,22],[950,34]].forEach(([x,wd]) => { ctx.fillStyle='#17101f'; ctx.fillRect(x-wd/2,236,wd,110); ctx.fillStyle='#3a2a52'; ctx.fillRect(x-wd/2,236,3,110); ctx.fillStyle='#ff4d78'; ctx.fillRect(x-wd/2,262,wd,4); ctx.fillRect(x-wd/2,292,wd,4); ctx.fillRect(x-wd/2,322,wd,4); });
  // floor
  vgrad(ctx,0,346,W,H-346,[[0,'#150d26'],[0.4,'#0b0716'],[1,'#030208']]);
  ctx.save(); ctx.globalAlpha=0.35; vgrad(ctx,0,346,W,40,[[0,'rgba(160,100,255,0.45)'],[1,'rgba(0,0,0,0)']]); ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,0.92)'; ctx.lineWidth=3; ctx.shadowColor='#bcd0ff'; ctx.shadowBlur=18; ctx.beginPath(); ctx.ellipse(480,FLOOR_Y+14,300,34,0,0,6.2832); ctx.stroke(); ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(180,140,255,0.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(480,FLOOR_Y+14,340,40,0,0,6.2832); ctx.stroke();
  for(let i=0;i<5;i++) glow(ctx,120+i*180,H-20,120,'rgba(255,60,110,0.10)');
  vignette(ctx, 0.55);
}

/* ---------- 4. WARBANNER MARSH (sunset battlefield) ---------- */
function a4(ctx, t){
  vgrad(ctx,0,0,W,H,[[0,'#2a1214'],[0.25,'#6a2a1a'],[0.5,'#d8661e'],[0.62,'#ffb35a'],[1,'#3a2018']]);
  glow(ctx,480,285,260,'rgba(255,200,110,0.65)'); glow(ctx,480,285,60,'rgba(255,240,190,0.95)'); ell(ctx,480,285,20,20,'#fff0c0');
  const r = rng(4);
  for(let i=0;i<14;i++){ const x=r()*W, y=30+r()*150; ell(ctx,x,y,120+r()*160,22+r()*26,'rgba(30,14,18,0.55)'); }
  for(let i=0;i<8;i++){ const x=r()*W, y=190+r()*70; ell(ctx,x,y,100+r()*110,14+r()*14,'rgba(120,50,30,0.35)'); }
  const ridge = (base, amp, col, seed, step) => { const q=rng(seed); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,H); let y=base; for(let x=0;x<=W+step;x+=step){ y = base - q()*amp; ctx.lineTo(x,y); } ctx.lineTo(W,H); ctx.fill(); };
  ridge(330,130,'#8a4a3a',31,48); ridge(350,100,'#6a3a34',32,38); ridge(375,70,'#4a2a2c',33,30);
  vgrad(ctx,0,330,W,70,[[0,'rgba(255,190,120,0)'],[1,'rgba(255,200,140,0.45)']]);
  // marsh water + reflection
  vgrad(ctx,0,392,W,H-392,[[0,'#d8782e'],[0.25,'#8a3a22'],[1,'#1e1012']]);
  for(let i=0;i<28;i++){ const y=396+i*5, a=0.35*(1-i/28); ctx.fillStyle='rgba(255,210,140,'+a+')'; ctx.fillRect(380+Math.sin(t*2+i)*8,y,200-i*3,2); }
  for(let i=0;i<22;i++){ const x=40+i*44+((i*7)%13); ctx.fillStyle='#1a0e10'; ctx.fillRect(x,350+((i*5)%9),3,46); poly(ctx,[[x-3,350+((i*5)%9)],[x+1,340+((i*5)%9)],[x+5,350+((i*5)%9)]],'#1a0e10'); }
  ctx.strokeStyle='#1a0e10'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(40,372); ctx.lineTo(300,360); ctx.moveTo(640,362); ctx.lineTo(920,374); ctx.stroke();
  // spears + banners (framing)
  const spear = (x0,y0,x1,y1) => { ctx.strokeStyle='#241618'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    const a=Math.atan2(y1-y0,x1-x0); ctx.save(); ctx.translate(x1,y1); ctx.rotate(a); poly(ctx,[[-6,-14],[40,0],[-6,14],[2,0]],'#3a3036'); ctx.restore(); };
  spear(-20,380,170,40); spear(-10,500,250,200); spear(980,380,780,50); spear(930,520,700,230);
  const banner = (x,y,w,hh,col) => { ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); for(let i=0;i<=5;i++) ctx.lineTo(x+w-i*(w/5)+Math.sin(t*3+i)*3, y+hh-(i%2)*18); ctx.closePath(); ctx.fill(); };
  banner(96,70,52,200,'#7a1818'); banner(200,210,36,120,'#3a3a40'); banner(830,170,60,230,'#6a1616'); banner(740,320,40,130,'#4a4a52');
  ctx.fillStyle='rgba(255,170,60,0.9)'; [[40,430],[920,436]].forEach(([x,y]) => { glow(ctx,x,y,34,'rgba(255,170,60,0.55)'); ell(ctx,x,y,5,9+Math.sin(t*14+x)*2,'#ffd24a'); });
  vgrad(ctx,0,FLOOR_Y-10,W,H-FLOOR_Y+10,[[0,'rgba(20,10,12,0)'],[1,'rgba(20,10,12,0.8)']]);
  vignette(ctx, 0.5);
}

/* ---------- 5. RUINED PLAINS (storm + god rays) ---------- */
function a5(ctx, t){
  vgrad(ctx,0,0,W,H,[[0,'#101316'],[0.35,'#3a4146'],[0.62,'#8a9296'],[1,'#2a3a22']]);
  const r = rng(51);
  glow(ctx,610,150,300,'rgba(255,255,240,0.85)'); glow(ctx,610,150,110,'rgba(255,255,255,0.95)');
  for(let i=0;i<9;i++){ const a0=0.35+i*0.19; ctx.fillStyle='rgba(235,240,225,'+(0.05+0.05*Math.sin(t*0.6+i))+')';
    poly(ctx,[[610+Math.cos(a0)*20,150+Math.sin(a0)*20],[610+Math.cos(a0-0.07)*900,150+Math.sin(a0-0.07)*900],[610+Math.cos(a0+0.07)*900,150+Math.sin(a0+0.07)*900]],ctx.fillStyle); }
  for(let i=0;i<20;i++){ const x=r()*W, y=r()*230; const ring=Math.hypot(x-610,y-150); ell(ctx,x,y,100+r()*150,26+r()*30,'rgba(20,24,28,'+(ring<190?0.15:0.62)+')'); }
  vgrad(ctx,0,250,W,150,[[0,'rgba(190,200,190,0)'],[0.6,'rgba(190,200,190,0.5)'],[1,'rgba(190,200,190,0)']]);
  const ruin = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x,y,w,h); ctx.fillRect(x+w*0.15,y-h*0.25,w*0.3,h*0.3); };
  ruin(80,326,26,66,'rgba(60,70,70,0.55)'); ruin(130,342,50,34,'rgba(60,70,70,0.5)'); ruin(780,330,54,48,'rgba(60,70,70,0.5)');
  ruin(866,336,40,38,'rgba(60,70,70,0.45)'); ruin(430,352,44,24,'rgba(70,80,80,0.4)'); ruin(560,350,60,26,'rgba(70,80,80,0.4)');
  vgrad(ctx,0,372,W,H-372,[[0,'#3a4a2a'],[0.3,'#2a3a1c'],[1,'#0e180c']]);
  for(let i=0;i<650;i++){ const y=376+r()*164, x=r()*W, s=(y-376)/164; ctx.strokeStyle = r()<0.5?'rgba(120,150,70,0.55)':'rgba(70,100,40,0.6)'; ctx.lineWidth=1+s*1.4; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(r()-0.5)*6+Math.sin(t*1.4+x)*2,y-6-s*20); ctx.stroke(); }
  for(let i=0;i<60;i++){ const y=388+r()*140, x=r()*W; ctx.fillStyle='rgba(235,200,70,0.85)'; ctx.fillRect(x,y,2+(y-388)/50,2+(y-388)/50); }
  [[90,470,40,14],[860,480,56,18],[300,500,34,10]].forEach(([x,y,w,h]) => { ell(ctx,x,y,w,h,'#2a2e2a'); ell(ctx,x-4,y-3,w*0.7,h*0.5,'#454a44'); });
  vgrad(ctx,0,FLOOR_Y-30,W,60,[[0,'rgba(190,200,190,0)'],[0.5,'rgba(190,200,190,0.18)'],[1,'rgba(190,200,190,0)']]);
  vignette(ctx, 0.55);
}

/* ---------- 6. OBSIDIAN NIGHT (blocky, night + lava) ---------- */
function a6(ctx, t){
  pixel(ctx, 320, 180, (p,w,h) => {
    const r = rng(66);
    for(let y=0;y<110;y+=2){ p.fillStyle = mix('#04060f','#0e1426',y/110); p.fillRect(0,y,w,2); }
    for(let i=0;i<90;i++){ p.fillStyle = r()<0.2?'#9ab0ff':'#dfe8ff'; p.globalAlpha=0.5+0.5*Math.sin(t*2+i); p.fillRect(r()*w|0,r()*70|0,1,1); } p.globalAlpha=1;
    // tower
    p.fillStyle='#10131a'; p.fillRect(146,22,28,78); p.fillRect(138,78,44,22); p.fillRect(124,100,12,10); p.fillRect(184,100,12,10);
    p.fillStyle='#161a24'; p.fillRect(148,22,6,78); p.fillStyle='#0a0c12'; p.fillRect(168,22,6,78);
    p.fillStyle='#c01a22'; p.fillRect(156,30,8,26); p.fillStyle='#ff5a40'; p.fillRect(158,32,4,22); p.fillStyle='#8a0e18'; p.fillRect(160,32,1,22);
    p.fillStyle='#10131a'; p.fillRect(116,60,88,16); p.fillRect(104,64,12,8); p.fillRect(204,64,12,8); p.fillRect(150,10,20,14); p.fillRect(156,2,8,10);
    p.fillStyle='#c01a22'; [[120,64,16,5],[184,64,16,5],[146,64,8,5],[166,64,8,5]].forEach(([x,y,a,b]) => p.fillRect(x,y,a,b));
    p.fillStyle='#ff5a40'; [[122,65,12,2],[186,65,12,2]].forEach(([x,y,a,b]) => p.fillRect(x,y,a,b));
    p.fillStyle='#c01a22'; p.fillRect(157,12,6,8); p.fillStyle='#ff5a40'; p.fillRect(158,13,4,5);
    // distant wall ring
    for(let x=0;x<w;x+=10){ const hh = 20 + ((Math.abs(x-160)/160)*14|0) + ((x*7)%5); p.fillStyle = (x/10|0)%2?'#14171e':'#191d26'; p.fillRect(x,108-hh,10,hh+2); p.fillStyle='#232834'; p.fillRect(x,108-hh,10,1); }
    [[6,6],[26,4],[64,3],[94,4],[200,4],[246,4],[286,6],[310,6]].forEach(([x,hh]) => { for(let k=0;k<7;k++){ p.fillStyle = r()<0.5?'#2ad0c0':'#188a84'; p.fillRect(x+(k%3),86+(k>>1)*3+((x*3)%5),2,2); } p.fillStyle='#bff7ff'; p.fillRect(x+1,82+((x*3)%7),1,1); });
    [[112,84],[142,86],[178,86],[208,84],[34,82],[286,82]].forEach(([x,y]) => { p.fillStyle='#9ff4ff'; p.fillRect(x,y,1,1); p.fillStyle='rgba(120,230,255,0.35)'; p.fillRect(x-1,y-1,3,3); });
    // slab floor (rows of blocks)
    p.fillStyle='#16181e'; p.fillRect(0,108,w,h-108);
    for(let y=108;y<h;y++){ const row=(y-108)>>2, bw=10+((y-108)>>2), off=(row%2)*bw/2;
      for(let x=-bw;x<w+bw;x+=bw){ const v=r(); p.fillStyle = v<0.33?'#1b1e25':v<0.66?'#23262e':'#16181e'; p.fillRect(x+off|0,y,bw-1,1); } }
    for(let y=108;y<h;y+=4){ p.fillStyle='rgba(8,9,12,0.6)'; p.fillRect(0,y,w,1); }
    // lava pools
    [[0,150,32,6],[58,137,22,3],[100,131,16,2],[210,131,16,2],[240,137,22,3],[288,150,32,6]].forEach(([x,y,a,b],i) => {
      p.fillStyle='#7a1a08'; p.fillRect(x-1,y-1,a+2,b+2); p.fillStyle='#ff8a1a'; p.fillRect(x,y,a,b);
      p.fillStyle = (Math.sin(t*4+i)>0)?'#fff0a0':'#ffd24a'; p.fillRect(x+2,y+1,a-5,Math.max(1,b-3)); });
    // purple crystal pillar
    p.fillStyle='#0a0810'; p.fillRect(150,106,20,34); p.fillStyle='#8a1a30'; p.fillRect(150,106,20,3);
    for(let k=0;k<34;k++){ if(r()<0.55){ p.fillStyle = r()<0.5?'#b030e0':'#6a1a9a'; p.fillRect(151+(r()*18|0),109+(k%30),2+(r()*3|0),1); } }
    p.fillStyle='#e07aff'; p.fillRect(158,112,2,10); p.fillRect(162,124,2,8);
    p.fillStyle='rgba(255,255,255,0.7)'; p.fillRect(159,100+(Math.sin(t*3)*1|0),1,6);
    glow(p,160,124,26,'rgba(176,48,224,0.18)');
  });
  vignette(ctx, 0.35);
}

/* ---------- 7. BLOOD MOON COLISEUM (gothic, lava rivers) ---------- */
function a7(ctx, t){
  vgrad(ctx,0,0,W,H,[[0,'#0a0610'],[0.45,'#2a0e1c'],[0.8,'#6a1a1a'],[1,'#2a0c0c']]);
  const r = rng(77);
  // aurora
  [['70,230,150',0.34,300],['90,200,255',0.24,640]].forEach(([c,al,x]) => { for(let i=0;i<26;i++){
    const env=Math.sin(Math.PI*(i+0.5)/26), top=60+Math.sin(t*0.8+i*0.5+x)*26+Math.sin(i*0.9)*20, sx=x-260+i*20;
    const g=ctx.createLinearGradient(0,top,0,top+170); g.addColorStop(0,'rgba('+c+',0)'); g.addColorStop(0.35,'rgba('+c+','+(al*env)+')'); g.addColorStop(1,'rgba('+c+',0)');
    ctx.fillStyle=g; ctx.fillRect(sx,top,21,170); } });
  // blood moon
  glow(ctx,480,120,220,'rgba(255,60,50,0.40)'); ell(ctx,480,120,82,82,'#b8201c'); glow(ctx,455,95,70,'rgba(255,150,120,0.55)');
  [[-30,-20,16],[24,10,20],[-8,34,14],[34,-34,10],[-40,26,12]].forEach(([dx,dy,rr]) => ell(ctx,480+dx,120+dy,rr,rr*0.8,'rgba(110,10,16,0.35)'));
  // storm clouds
  for(let i=0;i<16;i++){ const x=r()*W, y=r()*190, ring=Math.hypot(x-480,y-120); ell(ctx,x,y,110+r()*150,24+r()*34,'rgba(14,8,22,'+(ring<150?0.25:0.72)+')'); }
  // lightning
  const bolt = (x0,y0) => { ctx.strokeStyle='rgba(190,150,255,'+(0.55+0.4*Math.sin(t*20+x0))+')'; ctx.shadowColor='#b48cff'; ctx.shadowBlur=14; ctx.lineWidth=2; ctx.beginPath(); let x=x0,y=y0; ctx.moveTo(x,y); const q=rng(x0); for(let i=0;i<6;i++){ x+= (q()-0.5)*34; y+=26+q()*14; ctx.lineTo(x,y); } ctx.stroke(); ctx.shadowBlur=0; };
  bolt(90,50); bolt(150,90); bolt(820,60); bolt(880,100);
  // birds
  ctx.strokeStyle='#120a14'; ctx.lineWidth=2; for(let i=0;i<22;i++){ const x=560+r()*220+Math.sin(t+i)*4, y=60+r()*110; ctx.beginPath(); ctx.moveTo(x-5,y-2); ctx.lineTo(x,y+1); ctx.lineTo(x+5,y-2); ctx.stroke(); }
  // mountains
  const mt = (pts,c) => poly(ctx,pts,c);
  mt([[0,380],[0,230],[60,170],[110,250],[170,200],[260,320],[300,380]],'#1a0e22'); mt([[960,380],[960,220],[890,160],[830,240],[770,210],[690,330],[640,380]],'#1a0e22');
  mt([[0,380],[0,300],[80,260],[180,330],[240,380]],'#26122a'); mt([[960,380],[960,290],[880,250],[780,330],[720,380]],'#26122a');
  // coliseum
  const spire = (x,base,w2,hh) => { poly(ctx,[[x-w2,base],[x,base-hh],[x+w2,base]],'#0e0812'); ctx.fillStyle='#0e0812'; ctx.fillRect(x-w2*0.8,base,w2*1.6,hh*0.35); };
  ctx.fillStyle='#0e0812'; ctx.fillRect(400,190,160,140); spire(480,200,22,110); spire(440,200,13,80); spire(520,200,13,80); spire(410,214,9,56); spire(550,214,9,56);
  spire(362,288,11,64); spire(598,288,11,64); spire(320,308,9,46); spire(640,308,9,46);
  ctx.fillStyle='#120a18'; ctx.beginPath(); ctx.ellipse(480,330,250,60,0,0,6.2832); ctx.fill(); ctx.fillStyle='#0e0812'; ctx.fillRect(230,318,500,48);
  ctx.fillStyle='#ffb347'; for(let i=0;i<46;i++){ const x=236+i*10.7, y=326+((i*37)%11); ctx.globalAlpha=0.6+0.4*Math.sin(t*6+i); ctx.fillRect(x,y,2,3); } ctx.globalAlpha=1;
  for(let i=0;i<9;i++){ const x=420+i*15; ctx.fillStyle='#ffa83c'; ctx.globalAlpha=0.7; ctx.fillRect(x,224+((i*5)%9),3,6); ctx.fillRect(x,256+((i*3)%7),3,6); } ctx.globalAlpha=1;
  glow(ctx,480,322,150,'rgba(130,200,255,0.22)');
  // lava rivers
  [[[0,360],[60,350],[120,372],[200,366],[250,386]],[[960,356],[890,350],[820,370],[740,364],[690,384]]].forEach(pts => { ctx.strokeStyle='#ff6a1a'; ctx.shadowColor='#ff8a2a'; ctx.shadowBlur=14; ctx.lineWidth=7; ctx.beginPath(); pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.stroke(); ctx.strokeStyle='#ffd24a'; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0; });
  // floor
  vgrad(ctx,0,378,W,H-378,[[0,'#1c0e1c'],[0.5,'#140a14'],[1,'#080408']]);
  ctx.strokeStyle='rgba(255,90,40,0.55)'; ctx.lineWidth=2; ctx.shadowColor='#ff5a28'; ctx.shadowBlur=10;
  for(let i=0;i<9;i++){ const x=40+i*110, y=FLOOR_Y+20+((i*29)%50); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+30,y+6); ctx.lineTo(x+46,y-4); ctx.stroke(); } ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(120,200,255,0.30)'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(480,FLOOR_Y+14,300,32,0,0,6.2832); ctx.stroke();
  for(let i=0;i<6;i++) glow(ctx,170+i*125+Math.sin(t+i)*12,FLOOR_Y+10,90,'rgba(120,200,255,0.10)');
  vignette(ctx, 0.5);
}

const ARENAS = [
  {id:'sandstone-temple',  name:'Sandstone Temple',    mood:'warm dusk, ancient ruins',      draw:a1},
  {id:'torch-colosseum',   name:'Torch Colosseum',     mood:'sand pit, flaming torches',     draw:a2},
  {id:'neon-ring',         name:'Neon Ring',           mood:'smoky boxing ring, spotlights', draw:a3},
  {id:'warbanner-marsh',   name:'Warbanner Marsh',     mood:'sunset battlefield, spears',    draw:a4},
  {id:'ruined-plains',     name:'Ruined Plains',       mood:'storm clouds, god rays, mist',  draw:a5},
  {id:'obsidian-night',    name:'Obsidian Night',      mood:'blocky night arena, lava',      draw:a6},
  {id:'blood-moon-coliseum', name:'Blood Moon Coliseum', mood:'gothic, red moon, lava rivers', draw:a7}
];
ARENAS.forEach((a,i) => { a.index = i+1; a.floorY = FLOOR_Y; });
window.FIGHTER_ARENAS = ARENAS; window.FIGHTER_FLOOR_Y = FLOOR_Y;
})();

/* WARBANNER MARSH - sunset battlefield, drawn in code on 960 x 540 (ground line y = 450). */
const W = 960, H = 540, FLOOR_Y = 450;

function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function vgrad(c,x,y,w,h,stops){ const g=c.createLinearGradient(0,y,0,y+h); stops.forEach(([o,col])=>g.addColorStop(o,col)); c.fillStyle=g; c.fillRect(x,y,w,h); }
function poly(c,pts,fill){ c.fillStyle=fill; c.beginPath(); pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill(); }
function glow(c,x,y,r,c0,c1){ const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,c0); g.addColorStop(1,c1||'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
function ell(c,x,y,rx,ry,fill){ c.fillStyle=fill; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,6.2832); c.fill(); }
function vignette(c, a){ const g=c.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,'+a+')'); c.fillStyle=g; c.fillRect(0,0,W,H); }

function scene(ctx, t){
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

export default {
  id: 'warbanner-marsh',
  name: 'Warbanner Marsh',
  dim: 0.5,                                // darken the painting so arrows stand out (0 = not at all)
  async paint(ctx){ scene(ctx, 3); }
};

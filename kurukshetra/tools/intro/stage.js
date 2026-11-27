/* Runs inside the game page while the intro video is recorded (see record.py). Not part of the game.
   It stops the game's own clock, adds the captions, and plays short staged scenes one frame (1/30 s) at a time. */
(async () => {
  const at = p => import(new URL(p, location.href).href);
  const THREE = await import('three');
  const S = await at('./src/render/stage.js'), C = await at('./src/core/index.js'), { match } = await at('./src/game/session.js');
  const m = window.__m, $ = id => document.getElementById(id);

  const css = document.createElement('style');
  css.textContent = `*{transition:none!important;animation:none!important}
    .float{opacity:1!important;transform:none!important} #keys,#msg{display:none} #note{top:226px!important}      /* the game's own messages sit under the captions */
    #cap{position:fixed;left:0;right:0;top:104px;z-index:50;text-align:center;opacity:0;font:900 50px Georgia,serif;color:#fff;text-shadow:0 0 18px #ff6a1a,0 3px 8px #000}
    #cap small{display:block;margin-top:6px;font:800 26px system-ui;color:#ffe9b0}
    #title{position:fixed;inset:0;z-index:49;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;background:radial-gradient(circle at 50% 45%,#0000,#05030ad0 78%)}
    #title h1{margin:0;font:900 112px Georgia,serif;letter-spacing:12px;color:#ffd24a;text-shadow:0 0 44px #ff7a1a,0 6px 14px #000}
    #title p{margin:16px 0 0;font:800 30px system-ui;letter-spacing:6px;color:#fff3d8;text-shadow:0 3px 8px #000}
    #card{position:fixed;left:590px;top:240px;z-index:50;opacity:0;text-shadow:0 3px 10px #000}
    #card h2{margin:0;font:900 70px Georgia,serif;letter-spacing:3px;color:#ffd24a;text-shadow:0 0 26px #ff7a1a,0 4px 10px #000}
    #card p{margin:12px 0 0;font:800 32px system-ui;color:#fff3d8}
    #card span{display:block;margin-top:16px;font:700 23px system-ui;color:#ffb866}
    #fade{position:fixed;inset:0;z-index:60;background:#000;opacity:0}`;
  document.head.appendChild(css);
  for (const id of ['cap', 'title', 'card', 'fade']) { const e = document.createElement('div'); e.id = id; document.body.appendChild(e); }
  const lamp = new THREE.DirectionalLight(0xfff0dd, 0); S.scene.add(lamp, lamp.target);       // a soft light for the close-ups

  let before = null;
  /* what just happened, for the sound track */
  function sounds(){
    const d = m.duel, now = { arrows: d.arrows.map(a => a.uid), inc: d.incoming.map(s => s && s.uid), hp: d.f.map(f => f.hp), call: d.f.map(f => !!f.call), counters: d.counters.length };
    const out = [], b = before; before = now; if (!b) return out;
    if (now.arrows.some(u => !b.arrows.includes(u))) out.push('bow');
    now.call.forEach((c, i) => { if (c && !b.call[i]) out.push('charge'); });
    now.inc.forEach((u, i) => { if (u && u !== b.inc[i]) out.push('release'); });
    if (now.counters > b.counters) out.push('counter');
    let hurt = false; now.hp.forEach((h, i) => { const lost = b.hp[i] - h; if (lost > 0) { hurt = true; out.push(lost >= 5 ? 'boom' : 'hit'); } });
    b.inc.forEach((u, i) => { if (u && !now.inc[i] && !hurt) out.push(b.counters ? 'clash' : 'pass'); });
    return out;
  }

  const held = new Set();
  const hold = (code, on) => { if (on === held.has(code)) return; on ? held.add(code) : held.delete(code); m.key(code, !on); };

  window.__intro = {
    /* a fresh scene: two archers, a computer that does nothing by itself */
    async scene(a, b, hud){
      for (const code of [...held]) hold(code, false);
      await m.start(a, 'easy', b);
      Object.assign(m.ai, { superT: 1e9, arrowT: 1e9, L: { ...m.ai.L, dodge: 0, think: [999, 999] } });
      $('hud').style.opacity = hud ? 1 : 0; lamp.intensity = 0; before = null;
      S.camera.position.set(0, 2, 14.7); S.camera.lookAt(0, 1.7, 0); m.step(2); sounds();
    },
    /* the opponent shoots (path) or uses a weapon key */
    foeShoot(kind, path){ C.shoot(m.duel, 1, kind, path); },
    foeKey(key){ C.press(m.duel, 1, key); },
    key(code){ m.key(code); m.key(code, true); },
    hold,
    /* the player jumps and ducks by itself */
    dodge(){
      let duck = false;
      for (const a of m.duel.arrows) if (a.by === 1) {
        const left = C.arrivesIn(a);
        if (a.path === 'low' && left < 0.34 && left > 0.2) this.key('ArrowUp');
        if (a.path === 'straight' && left < 0.55 && left > -0.25) duck = true;
      }
      hold('ArrowDown', duck);
    },
    text(id, html, opacity){ const e = $(id); if (html !== null && e.dataset.h !== html) { e.dataset.h = html; e.innerHTML = html; } e.style.opacity = opacity; },
    fade(opacity){ $('fade').style.opacity = opacity; },
    /* advance one video frame; view = null (the game's camera), {zoom: z} or {close: degrees} */
    frame(view){
      m.step(2);
      if (view && view.zoom) { S.camera.position.set(0, 2, view.zoom); S.camera.lookAt(0, 1.7, 0); S.renderer.render(S.scene, S.camera); }
      if (view && view.close !== undefined) {
        const other = match.actors[1].model; for (const o of [other.root, other.bow.group, other.nock, other.aura, other.shadow]) o.visible = false;
        const me = match.actors[0].x, a = view.close * Math.PI / 180, far = view.far || 4.5;
        const eye = new THREE.Vector3(me + Math.cos(a) * far, 1.3, Math.sin(a) * far), aim = new THREE.Vector3(me, 1.03, 0);
        const side = aim.clone().sub(eye).normalize().cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.85);      // keep him on the left
        eye.add(side); aim.add(side);
        S.camera.position.copy(eye); S.camera.lookAt(aim); lamp.intensity = 1.5; lamp.position.set(eye.x, 3.2, eye.z); lamp.target.position.set(me, 1, 0);
        S.renderer.render(S.scene, S.camera);
      }
      return sounds();
    }
  };
  return true;
})()

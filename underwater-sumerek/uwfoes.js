/* =============================================================================
   30b · Sunken biome: the foes are the sea creatures of the Sunken City (real GLB models).
         The Island's own foe logic (segment chain hitboxes, damageFoe, weapons) is untouched:
         every foe still owns `segs`; a 3D model simply swims along that chain.
============================================================================= */
const UWV = {
  eel:    { model: 'eel', name: 'Угорь', seg: 7, rad: 0.3, spacing: 0.34, hp: 24, wander: 2.0, chase: 4.2, chaseR: 10, hover: 0.8, len: 2.7 },
  jellyT: { model: 'jellyfish_teal', name: 'Медуза', seg: 3, rad: 0.55, spacing: 0.26, hp: 20, wander: 1.2, chase: 2.5, chaseR: 9, hover: 1.5, len: 1.4 },
  jellyV: { model: 'jellyfish_violet', name: 'Фиолетовая медуза', seg: 3, rad: 0.55, spacing: 0.26, hp: 26, wander: 1.2, chase: 2.7, chaseR: 9, hover: 1.5, len: 1.5 },
  drone:  { model: 'scout_drone', name: 'Дрон-разведчик', seg: 3, rad: 0.45, spacing: 0.3, hp: 30, wander: 2.2, chase: 4.4, chaseR: 11, hover: 1.2, len: 1.3 },
  angler: { model: 'angler', name: 'Удильщик', seg: 6, rad: 0.62, spacing: 0.42, hp: 70, wander: 1.8, chase: 3.3, chaseR: 11, hover: 1.0, len: 2.4 },
};
Object.assign(FOE.warden, { model: 'kraken_tentacle', len: 8 });
Object.assign(FOE.imp, { model: 'eel', len: 2.7 });
Object.assign(FOE.shade, { model: 'angler', len: 2.4 });
const uwLoader = new GLTFLoader(), uwCache = {}, uwPending = {};
let uwFail = false;
function loadUW(name) {
  if (uwPending[name]) return uwPending[name];
  return uwPending[name] = fetch('glb/' + name + '.json').then((r) => r.json()).then((j) => {
    const bin = atob(j.glb), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return uwLoader.parseAsync(u8.buffer, '');
  }).then((g) => { uwCache[name] = g; return g; }).catch((e) => { uwFail = true; console.warn('GLB', name, e); });
}
function preloadUW() { for (const k of ['eel', 'jellyfish_teal', 'jellyfish_violet', 'scout_drone', 'angler', 'kraken_tentacle']) loadUW(k); }
const foeModels = new Map(), uwRed = new THREE.Color(1, 0.25, 0.2), uwIce = new THREE.Color(0.3, 0.7, 1), uwFire = new THREE.Color(1, 0.5, 0.1), uwZap = new THREE.Color(0.6, 0.9, 1);
let uwLast = 0;
function makeFoeModel(f) {
  const g = uwCache[f.def.model];
  if (!g) return null;
  const root = new THREE.Group(), inner = g.scene.clone(true);
  const box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const k = f.def.len / Math.max(size.x, size.y, size.z, 1e-3);
  inner.scale.setScalar(k); inner.position.set(-ctr.x * k, -ctr.y * k, -ctr.z * k);
  const mats = [];
  inner.traverse((o) => {
    o.frustumCulled = false;
    if (o.isMesh) {
      o.material = o.material.clone();
      if (o.material.emissive) { o.userData.e0 = o.material.emissive.clone(); mats.push(o); }
    }
  });
  const mixer = new THREE.AnimationMixer(inner);
  const clip = g.animations.find((a) => /idle|swim|pulse|hover|sway/.test(a.name)) || g.animations[0];
  if (clip) { const act = mixer.clipAction(clip); act.play(); act.time = Math.random() * clip.duration; }
  root.add(inner); scene.add(root);
  return { root, inner, mixer, mats, yaw: 0, py: f.segs[0].y, k };
}
function disposeFoeModel(m) { scene.remove(m.root); m.root.traverse((o) => { if (o.isMesh) o.material.dispose(); }); }
function clearFoeModels() { for (const m of foeModels.values()) disposeFoeModel(m); foeModels.clear(); }
function updateFoeModels() {
  const now = performance.now() / 1000, dt = Math.min(0.05, Math.max(0.001, now - uwLast)); uwLast = now;
  for (const [f, m] of foeModels) if (!foes.includes(f)) { disposeFoeModel(m); foeModels.delete(f); }
  for (const f of foes) {
    let m = foeModels.get(f);
    if (!m) { m = makeFoeModel(f); if (!m) continue; foeModels.set(f, m); }
    const boss = !!f.def.boss, h = f.segs[0];
    let cx = 0, cy = 0, cz = 0;
    for (const s of f.segs) { cx += s.x; cy += s.y; cz += s.z; }
    cx /= f.n; cy /= f.n; cz /= f.n;
    if (boss) cy += f.def.len * 0.3;
    const sp = Math.hypot(f.vel.x, f.vel.z);
    let want = boss ? Math.atan2(player.pos.x - cx, player.pos.z - cz) - Math.PI / 2 : m.yaw;
    if (!boss && sp > 0.3) want = -Math.atan2(f.vel.z, f.vel.x);
    let d = want - m.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    m.yaw += d * Math.min(1, dt * 4);
    const vy = (cy - m.py) / dt; m.py = cy;
    const bob = Math.sin(f.t * 1.6 + f.seed) * 0.12;
    m.root.position.set(cx, cy + bob, cz);
    m.root.rotation.set(0, m.yaw, boss ? 0 : clamp(vy * 0.18, -0.5, 0.5) + Math.sin(f.t * 2.2 + f.seed) * 0.05);
    const s = Math.max(1e-3, Math.min(1, f.t * 0.8) * (f.state === 'dissolve' ? Math.max(0, f.alpha) : 1));
    m.root.scale.setScalar(s);
    m.mixer.update(dt * (f.slow > 0 ? 0.35 : 1) * (f.stun > 0 ? 0.2 : 1) * (boss ? 0.6 : 1));
    const tint = f.flash > 0.01 ? uwRed : f.shock > 0 ? uwZap : f.burn > 0 ? uwFire : f.slow > 0 ? uwIce : null;
    const amt = f.flash > 0.01 ? Math.min(1, f.flash) : tint ? 0.45 : 0;
    for (const o of m.mats) { o.material.emissive.copy(o.userData.e0); if (tint) o.material.emissive.lerp(tint, amt); }
    if (f.alpha > 0.2 && f.state !== 'dissolve') {      // lures and eyes glow in the dark water
      const fw = tmpC.set(Math.cos(-m.yaw), 0, Math.sin(-m.yaw));
      if (f.def.model === 'angler') {
        const lx = cx + fw.x * 0.9, ly = cy + 0.75 + Math.sin(f.t * 3) * 0.08, lz = cz + fw.z * 0.9, fl = 0.8 + 0.2 * Math.sin(f.t * 7 + f.seed);
        glow.spark(lx, ly, lz, 0.2, C.orbCore, fl, 1); glow.spark(lx, ly, lz, 1.6, C.orbHalo, 0.5 * fl, 0);
      } else if (!boss) glow.spark(h.x, h.y + 0.1, h.z, f.def.rad * 2.4, C.eyeGlow, 0.18, 0);
    }
  }
}
function spawnUW(type) {
  const list = type === 'shade' ? [UWV.angler] : [UWV.eel, UWV.jellyT, UWV.jellyV, UWV.drone, UWV.eel];
  const v = list[Math.floor(Math.random() * list.length)];
  for (let tries = 0; tries < 14; tries++) {
    const a = Math.random() * TAU, dd = type === 'imp' ? rr(10, 17) : rr(13, 21);
    const x = clamp(player.pos.x + Math.cos(a) * dd, 2, W - 2), z = clamp(player.pos.z + Math.sin(a) * dd, 2, D - 2);
    const y = Math.min(Math.max(terrainTop(x, z) + rr(1.2, 4.5), 3), H - 4);
    if (solidAt(Math.floor(x), Math.floor(y), Math.floor(z)) || Math.hypot(x - player.pos.x, z - player.pos.z) < 7) continue;
    const f = spawnFoe(type, x, y, z, false, { ...FOE[type], ...v });
    if (!f) return;
    f.segs.forEach((sg, k) => sg.set(x - k * v.spacing, y, z));
    f.target.set(player.pos.x, 0, player.pos.z); f.t = 0;
    if (type === 'shade' && !G.firstShade) { G.firstShade = true; toast('Из глубины поднимается удильщик…', 3000, true); }
    return;
  }
}

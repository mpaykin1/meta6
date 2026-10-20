import re
s=open('/home/claude/meta6/island-sumerek-biomes/index.html').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:70])
    s=s.replace(old,new)
atlas=open('sunken_atlas.b64').read()
rep('"structures":"crystal"}};','"structures":"crystal"},"sunken":{"label":"Затонувший город","fog":"#0b4663","tone":"cyan","seed":5150,"cols":[30,30,3,20,4,10,7,30,30,10,20,3],"props":["ruin","monolith","rock","crystal","lantern"],"structures":"gothic"}};')
rep('const BIOME_ATLASES = {','const BIOME_ATLASES = {"sunken":"data:image/webp;base64,'+atlas+'",')
rep(" crystal: {top:'#413587'"," sunken: {top:'#06304d', horizon:'#1f8fb0', fog:'#0b5c7c', lift:[.0,.05,.09], gain:[1.0,1.08,1.14]},\n crystal: {top:'#413587'")
rep("import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';","import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';\nimport { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';\nimport { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';")
rep("const SEA = 3.8;                       // water surface height","let SEA = 3.8;                         // water surface height (far below the world in the sunken biome: everything is underwater)\nlet UW = false;                        // sunken biome: swim physics, 3D sea creatures")
# seabed relief
rep("hgt[ci(x, z)] = Math.max(1, Math.round(1 + mask * (0.42 + 0.8 * hills) * 8.4));",
    "hgt[ci(x, z)] = Math.max(1, Math.round(1 + mask * (0.42 + 0.8 * hills) * 8.4 + (UW ? (1 - mask) * (0.25 + fbm(x * 0.085 + oz + 40, z * 0.085 + ox + 40, 3)) * 6.2 : 0)));")
# fog
rep("  mistColor.copy(pal.mistCol); mistAlpha.value = pal.mist;",
"""  if (UW) { scene.fog.color.copy(atmosphere.fog).multiplyScalar(1.1 - 0.55 * pal.stars); scene.fog.density = 0.055; U.fogD.value = scene.fog.density; hemi.color.set(0xbfe6ee); hemi.groundColor.set(0x1d5a70); hemi.intensity = 2.6; keyLight.color.set(0xb4ecff); mistColor.set(0x0b5f80); skyU.uBottom.value.copy(scene.fog.color); skyU.uHorizon.value.copy(scene.fog.color).lerp(atmosphere.horizon, 0.35); }
  mistColor.copy(pal.mistCol); mistAlpha.value = pal.mist;""")
# fireflies
rep("flyBase[i * 3 + 1] = rr(SEA + 1.5, 13);","flyBase[i * 3 + 1] = rr(Math.max(SEA + 1.5, 2), 13);")
# physics
rep("  v.y = Math.max(-28, v.y - PL.grav * (v.y < 0 ? 1.3 : 1) * h);",
"""  if (UW) v.y += ((player.jumpHeld ? 4.6 : -2.4) - v.y) * Math.min(1, 2.8 * h);      // buoyancy: hold jump to rise, let go to sink slowly
  else v.y = Math.max(-28, v.y - PL.grav * (v.y < 0 ? 1.3 : 1) * h);""")
rep("const speed = PL.speed * (player.inWater ? 0.62 : 1) * mul;","const speed = PL.speed * (UW ? 0.82 : player.inWater ? 0.62 : 1) * mul;")
rep("const f = damp(player.onGround ? PL.accG : PL.accA, dt);","const f = damp(UW ? (player.onGround ? 7 : 3.2) : player.onGround ? PL.accG : PL.accA, dt);")
rep("  if (player.jumpBuf > 0 && player.coyote > 0) {","  if (!UW && player.jumpBuf > 0 && player.coyote > 0) {")
rep("  if (!player.jumpHeld && v.y > 2 && !player.jumpCut) {","  if (!UW && !player.jumpHeld && v.y > 2 && !player.jumpCut) {")
rep("  player.inWater = p.y < SEA - 0.05;",
"""  if (UW) {
    p.x = clamp(p.x, 1.3, W - 1.3); p.z = clamp(p.z, 1.3, D - 1.3);
    if (p.y > H - 5) { p.y = H - 5; if (v.y > 0) v.y = 0; }
    if (Math.random() < dt * (3 + Math.hypot(v.x, v.z) * 1.5)) dust.emit(p.x + rr(-0.25, 0.25), p.y + rr(0.4, 1.3), p.z + rr(-0.25, 0.25), rr(-0.15, 0.15), rr(0.6, 1.2), rr(-0.15, 0.15), rr(1.2, 2.2), 0.05, 0.09, C.spray, 0.75, -1.4, 0.6, 1);
    if (Math.random() < dt * 14) dust.emit(p.x + rr(-9, 9), p.y + rr(-2, 7), p.z + rr(-9, 9), rr(-0.1, 0.1), rr(0.15, 0.5), rr(-0.1, 0.1), rr(2.5, 4), 0.04, 0.07, C.spray, 0.4, -0.2, 0.4, 1);
  }
  player.inWater = p.y < SEA - 0.05;""")
# foes: spawnFoe override def
rep("function spawnFoe(type, x, y, z, rising) {\n  if (foes.length >= MAX_FOES) return null;\n  const def = FOE[type];",
    "function spawnFoe(type, x, y, z, rising, defOverride) {\n  if (foes.length >= MAX_FOES) return null;\n  const def = defOverride || FOE[type];")
rep("""  if (type === 'imp') return G.play < 9 ? 0 : Math.min(4, 1 + Math.floor(c / 5));""",
"""  if (UW) {
    if (type === 'imp') return G.play < 3 ? 0 : Math.min(5, 2 + Math.floor(c / 4));
    if (type === 'shade') return c < 1 ? 0 : Math.min(3, 1 + Math.floor((c - 1) / 4)) + (G.all ? 1 : 0);
    return 0;
  }
  if (type === 'imp') return G.play < 9 ? 0 : Math.min(4, 1 + Math.floor(c / 5));""")
rep("{ spawnFromSea(type); G.spawnT = type === 'imp' ? 3 : 4; break; }","{ if (UW) spawnUW(type); else spawnFromSea(type); G.spawnT = UW ? (type === 'imp' ? 2.2 : 3.2) : type === 'imp' ? 3 : 4; break; }")
rep("        else if (bm === 'recover') ty = gnd + 1.05 + 0.15 * Math.sin(f.t * 3);\n      }",
"""        else if (bm === 'recover') ty = gnd + 1.05 + 0.15 * Math.sin(f.t * 3);
        if (UW && !def.boss) {      // swimmers: hunt at the hero's depth, drift above the seabed otherwise
          ty = f.state === 'chase' || f.state === 'flee' ? py + 0.2 + 0.45 * Math.sin(f.t * 2 + f.seed) : gnd + def.hover + 1.0 + 1.3 * Math.sin(f.t * 0.55 + f.seed);
          ty = Math.min(Math.max(ty, gnd + 0.9), H - 4);
        }
      }""")
# model system inserted before section 31
model_code = open('uwfoes.js').read() + open('city.js').read() + open('portal.js').read()
marker="/* =============================================================================\n   31 · Destruction"
rep(marker, model_code+"\n"+marker)
rep("function renderFoes() {\n  let n = 0;","function renderFoes() {\n  let n = 0;\n  if (UW) updateCity();\n  if (UW && !uwFail) { updateFoeModels(); foeInst.geo.instanceCount = 0; foeBody.visible = foeAura.visible = false; return; }\n  clearFoeModels();")
rep("terrainMat.emissive.set(id==='classic'?0x000000:0x292331);","terrainMat.emissive.set(id==='classic'?0x000000:id==='sunken'?0x04141f:0x292331);")
rep("terrainMat.emissive.set(biome==='classic'?0x000000:0x292331);","terrainMat.emissive.set(biome==='classic'?0x000000:biome==='sunken'?0x04141f:0x292331);")

rep("""    let best = 1e9;
    for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], dx = h.x - ox, dz = h.z - oz, d = Math.hypot(dx, dz);
      if (d > R + f.def.rad) continue;
      const cos = (dx * player.look.x + dz * player.look.z) / (d || 1);
      const score = d * (1.7 - cos);
      if (cos > -0.3 && score < best) { best = score; tgt = f; }
    }
    if (tgt) aim.dir.set(tgt.segs[0].x - ox, 0, tgt.segs[0].z - oz).normalize();
    else aim.dir.copy(player.look);""",
"""    if (!UW) {
    let best = 1e9;
    for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], dx = h.x - ox, dz = h.z - oz, d = Math.hypot(dx, dz);
      if (d > R + f.def.rad) continue;
      const cos = (dx * player.look.x + dz * player.look.z) / (d || 1);
      const score = d * (1.7 - cos);
      if (cos > -0.3 && score < best) { best = score; tgt = f; }
    }
    if (tgt) aim.dir.set(tgt.segs[0].x - ox, 0, tgt.segs[0].z - oz).normalize();
    else aim.dir.copy(player.look);
    } else {
    // ported from three-worlds (combat-facing.mjs): keep the current live enemy, else the closest in weapon range (not filtered by walk direction);
    // the weapon turns toward it with angular inertia instead of snapping
    let bestD = 1e9;
    const cur = aim.target;
    if (cur && foeAlive(cur) && Math.hypot(cur.segs[0].x - ox, cur.segs[0].z - oz) <= R + cur.def.rad) tgt = cur;
    else for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], d = Math.hypot(h.x - ox, h.z - oz);
      if (d <= R + f.def.rad && d < bestD) { bestD = d; tgt = f; }
    }
    if (tgt) {
      const from = Math.atan2(aim.dir.z, aim.dir.x), to = Math.atan2(tgt.segs[0].z - oz, tgt.segs[0].x - ox);
      const a = from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * (1 - Math.exp(-12 * Math.max(0, dt)));
      aim.dir.set(Math.cos(a), 0, Math.sin(a));
    } else aim.dir.copy(player.look);
    }""")
rep("  drawMinimapBase();\n  G.best = readBest();\n}","  drawMinimapBase();\n  G.best = readBest();\n  if (UW) buildCity(); else clearCity();\n}")
rep("    if (p.y > H - 5) { p.y = H - 5; if (v.y > 0) v.y = 0; }","    if (p.y > H - 7.5) travel('classic', 'surface');\n    if (p.y > H - 5) { p.y = H - 5; if (v.y > 0) v.y = 0; }")
rep("  if (p.y < SEA - 1.25 && G.state === 'play') { drown(); return; }","  if (p.y < SEA - 1.25 && G.state === 'play') { if (activeBiome === 'classic') { travel('sunken', 'dive'); return; } drown(); return; }")
rep("  const m = Math.hypot(ix, iz);\n  if (m > 1) { ix /= m; iz /= m; }","  if (portalBusy) { ix = iz = 0; player.jumpHeld = portalMode === 'surface'; }\n  const m = Math.hypot(ix, iz);\n  if (m > 1) { ix /= m; iz /= m; }")
rep('<div class="loading" id="loading">','<style>#portal{position:fixed;inset:0;z-index:8;pointer-events:none;opacity:0;transition:opacity .9s ease}</style>\n<div class="loading" id="loading">')
# biome mode
rep("function changeBiome(id,seed){\n if(!BIOME_DEFS[id])id='classic';","function setBiomeMode(id){\n UW=id==='sunken'; SEA=UW?-200:3.8; waterU.uSea.value=SEA; water.visible=!UW; water.position.y=SEA; for(const m of mists)m.visible=!UW; if(UW)preloadUW();\n}\nfunction changeBiome(id,seed){\n if(!BIOME_DEFS[id])id='classic';\n setBiomeMode(id);")
rep("const biome=BIOME_DEFS[qp.get('biome')]?qp.get('biome'):'classic';\n  activeBiome=biome;","const biome=BIOME_DEFS[qp.get('biome')]?qp.get('biome'):'sunken';\n  setBiomeMode(biome);activeBiome=biome;")
rep("  get coins() { return coins; },","  get coins() { return coins; },\n  get uw() { return { UW, uwFail, models: foeModels.size, city: [CITY.mixers.length, CITY.movers.length, CITY.schools.length, CITY.group && CITY.group.children.length], cache: Object.keys(uwCache), SEA }; },")
open('index.html','w').write(s)
print(len(s))

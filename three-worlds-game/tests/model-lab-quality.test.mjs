import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
test('§21.17 lab scout is a measured 8-direction 8-frame atlas and stays out of game',async()=>{
 const [svg,metrics,index,manifest]=await Promise.all([
  readFile(new URL('models-lab/gpt-rift-scout-v1.svg',root),'utf8'),
  readFile(new URL('models-lab/gpt-rift-scout-v1.metrics.json',root),'utf8').then(JSON.parse),
  readFile(new URL('index.source.html',root),'utf8'),
  readFile(new URL('models/MANIFEST.json',root),'utf8')
 ]);
 const cells=[...svg.matchAll(/<g data-dir="(\d)" data-frame="(\d)"/g)];
 assert.equal(cells.length,64);
 assert.equal(new Set(cells.map(x=>x[1])).size,8);
 assert.equal(new Set(cells.map(x=>x[2])).size,8);
 assert.match(svg,/data-palette-colors="12"/);
 assert.match(svg,/data-parts="15"/);
 assert.equal(metrics.status,'lab-only-unreviewed');
 assert.equal(metrics.gameIntegration,false);
 assert.equal(metrics.candidate.metrics.animationFrames,8);
 assert.equal(metrics.candidate.metrics.viewDirections,8);
 assert.equal(metrics.candidate.metrics.articulatedVisualLayers,15);
 assert.equal(metrics.promotionGate.visualParity,'UNKNOWN');
 assert.equal(metrics.promotionGate.fpsP50P95,'UNKNOWN');
 assert(!index.includes('gpt-rift-scout-v1'),'unreviewed lab asset leaked into game source');
 assert(!manifest.includes('gpt-rift-scout-v1'),'unreviewed lab asset leaked into accepted model manifest');
});

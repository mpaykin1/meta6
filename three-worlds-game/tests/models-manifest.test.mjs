import fs from 'node:fs';import assert from 'node:assert';
const d=new URL('../models/',import.meta.url);
const m=JSON.parse(fs.readFileSync(new URL('MANIFEST.json',d)));
for(const id of m.models){const b=fs.readFileSync(new URL(id+'.glb',d));assert.equal(b.slice(0,4).toString(),'glTF',id);}
console.log('models ok',m.models.length);

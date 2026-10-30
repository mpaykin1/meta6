import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const dir=dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage();page.setDefaultTimeout(10000);await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());const html=readFileSync(resolve(dir,'../source/ilya-copy.html'),'utf8').replace(/<link href="https:\/\/fonts.googleapis.com[^>]*>/,'');await page.setContent(html,{waitUntil:'domcontentloaded',timeout:15000});await page.locator('#mplay').click();const r=await page.evaluate(()=>window.__INV());const out={base:r.base,now:r.now,lost:r.lost,extra:r.ex,sections:r.rows.map(x=>({name:x.name,n:x.n,ok:x.ok}))};writeFileSync(resolve(dir,'inv-baseline.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({now:r.now,lost:r.lost}));}finally{await browser.close()}

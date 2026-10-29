import { WebSocketServer } from 'ws';
import http from 'node:http';import crypto from 'node:crypto';
const rooms=new Map(), MAX=4;
const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify({ok:true,service:'archer-fog-coop',rooms:rooms.size}));});
const wss=new WebSocketServer({server,maxPayload:2048,perMessageDeflate:false});
const send=(c,m)=>{if(c.readyState===1)c.send(JSON.stringify(m))};
function broadcast(r,m,except){for(const c of r.players.keys())if(c!==except)send(c,m)}
const num=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)?Math.max(min,Math.min(max,x)):min;
wss.on('connection',(ws,req)=>{
 const u=new URL(req.url,'http://localhost'),code=(u.searchParams.get('room')||'').toUpperCase();
 if(!/^[A-Z0-9]{4,8}$/.test(code)){ws.close(1008,'Invalid room');return}
 let r=rooms.get(code);if(!r){r={code,host:null,players:new Map(),lastState:null};rooms.set(code,r)}
 if(r.players.size>=MAX){ws.close(1008,'Room full');return}
 const id=crypto.randomBytes(4).toString('hex');if(!r.host)r.host=id;
 const p={id,lastShot:0,lastState:0};r.players.set(ws,p);
 send(ws,{t:'welcome',id,host:r.host,count:r.players.size,peers:[...r.players.values()].filter(x=>x.id!==id).map(x=>x.id),state:r.lastState});
 broadcast(r,{t:'join',id,host:r.host,count:r.players.size},ws);
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw.toString())}catch{return}if(!m||typeof m!=='object')return;
  if(m.t==='shot'&&Date.now()-p.lastShot>=150){p.lastShot=Date.now();broadcast(r,{t:'shot',id,dmg:num(m.dmg,1,2),freeze:!!m.freeze,fire:!!m.fire},ws)}
  else if(m.t==='state'&&r.host===id&&Date.now()-p.lastState>=90){p.lastState=Date.now();r.lastState={level:num(m.level,1,999),depth:num(m.depth,1,999),hits:num(m.hits,0,99),need:num(m.need,1,99),phase:String(m.phase||'fight').slice(0,20),pos:Array.isArray(m.pos)&&m.pos.length===3?m.pos.map(v=>num(v,-10000,10000)):null,rot:Array.isArray(m.rot)&&m.rot.length===4?m.rot.map(v=>num(v,-1,1)):null};broadcast(r,{t:'state',id,...r.lastState},ws)}
  else if(m.t==='ping')send(ws,{t:'pong'});
 });
 const leave=()=>{if(!r.players.has(ws))return;r.players.delete(ws);if(r.host===id)r.host=r.players.values().next().value?.id||null;broadcast(r,{t:'leave',id,host:r.host,count:r.players.size});if(!r.players.size)rooms.delete(code)};
 ws.on('close',leave);ws.on('error',leave);
});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0');
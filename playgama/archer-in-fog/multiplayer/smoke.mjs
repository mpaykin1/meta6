import WebSocket from 'ws';
import assert from 'node:assert/strict';
const base='wss://archer-fog-coop.onrender.com/?room=TEST'+Math.random().toString(36).slice(2,6).toUpperCase();
const timeout=setTimeout(()=>{console.error('NETWORK_SMOKE_TIMEOUT');process.exit(1)},75000);
function connect(){return new Promise((resolve,reject)=>{const ws=new WebSocket(base,{handshakeTimeout:45000});ws.once('error',reject);ws.once('message',raw=>{let msg=JSON.parse(raw);assert.equal(msg.t,'welcome');resolve({ws,msg})});})}
function awaitMessage(ws,kind){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Missing '+kind)),20000);const listener=raw=>{const msg=JSON.parse(raw);if(msg.t===kind){clearTimeout(timer);ws.off('message',listener);resolve(msg)}};ws.on('message',listener)})}
let peers=[];
try{
  peers.push(await connect());console.log('P1 connected');
  peers.push(await connect());console.log('P2 connected');
  peers.push(await connect());console.log('P3 connected');
  peers.push(await connect());console.log('P4 connected');
  assert.equal(peers[3].msg.count,4);
  const over=new WebSocket(base,{handshakeTimeout:45000});const rejected=await new Promise(resolve=>{over.once('close',(code,why)=>resolve({code,reason:String(why)}));over.once('error',()=>resolve({code:'error'}))});
  console.log('MAX_ROOM',rejected);assert.ok([1008,1006].includes(rejected.code),'Fifth client must not receive room access');
  const shoot=awaitMessage(peers[0].ws,'shot');peers[1].ws.send(JSON.stringify({t:'shot',dmg:2}));assert.equal((await shoot).dmg,2);
  console.log('SHOT_SYNC_OK');
  const state=awaitMessage(peers[1].ws,'state');peers[0].ws.send(JSON.stringify({t:'state',level:3,depth:2,hits:1,need:6,phase:'fight',pos:[1,4,5],rot:[0,0,0,1]}));
  const evt=await state;assert.equal(evt.level,3);assert.deepEqual(evt.pos,[1,4,5]);console.log('STATE_SYNC_OK');
  peers.forEach(p=>p.ws.close());clearTimeout(timeout);
  console.log('MULTIPLAYER_SMOKE_PASS');
}catch(e){console.error(e);process.exitCode=1;clearTimeout(timeout);peers.forEach(p=>p.ws.close())}

// Recheck after deploying state-transform synchronization on Render.

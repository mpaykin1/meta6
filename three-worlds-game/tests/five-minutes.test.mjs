import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seabedHeight,landWithin} from '../seabed.mjs';
import {immersionAt,swimVertical,bubbleEmissions,createGuestSchedule,guestScheduleStep,finishGuestSchedule} from '../stage7-simulation.mjs';
test('five virtual player minutes: depth, ascent, bubbles, guests and distant dry land',()=>{
 const sea=3.8,seed=1337,guest=createGuestSchedule(seed),budget={budget:0};
 const player={pos:{y:1},vel:{y:0},jumpHeld:false,onGround:false};
 let alive=false,arrivals=0,bubbles=0,arrivalAt=[],guestStarted=-Infinity;
 for(let i=0;i<9000;i++){
  const phase=i/30;
  player.jumpHeld=phase>=30&&phase<40||phase>=48&&phase<55;
  const floor=seabedHeight(82,32,seed);
  swimVertical(player,1/30,floor,sea);
  const depth=immersionAt(sea,player.pos.y,floor);
  const newBubbles=bubbleEmissions(budget,1/30,depth,player.vel.y);
  bubbles+=newBubbles;
  if(phase>=30&&phase<40||phase>=48&&phase<55)assert(newBubbles>=0);
  if(guestScheduleStep(guest,1/30,alive)){assert(!alive);arrivals++;alive=true;guestStarted=phase;arrivalAt.push(phase)}
  if(alive&&phase-guestStarted>=1.5){alive=false;const delay=finishGuestSchedule(guest);assert(delay>=50&&delay<=70)}
  if(i%300===299){
   assert(player.pos.y>=floor+.08-1e-7&&player.pos.y<=sea+.55+1e-7);
   assert(depth>=0&&depth<=1);
   assert(Number.isFinite(player.vel.y));
   assert(bubbles>0);
   assert(landWithin(500,500,seed,160));
  }

 }
 assert(arrivals>=4&&arrivals<=6,'expected 4-6 arrivals over 300 seconds, got '+arrivals);
 for(let i=1;i<arrivalAt.length;i++)assert(arrivalAt[i]-arrivalAt[i-1]>=50&&arrivalAt[i]-arrivalAt[i-1]<=72);
 assert.equal(9000/30,300);
});

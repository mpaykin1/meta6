import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seabedHeight,landWithin} from '../seabed.mjs';
import {immersionAt,swimVertical,bubbleEmissions,createGuestSchedule,guestScheduleStep,finishGuestSchedule} from '../stage7-simulation.mjs';
test('five virtual player minutes: depth, ascent, bubbles, guests and distant dry land',()=>{
 const sea=3.8,seed=1337,guest=createGuestSchedule(seed),budget={budget:0};
 const player={pos:{y:1},vel:{y:0},jumpHeld:false,onGround:false};
 let alive=false,arrivals=0,bubbles=0;
 for(let i=0;i<1800;i++){
  const phase=i/30;
  player.jumpHeld=phase>=30&&phase<40||phase>=48&&phase<55;
  const floor=seabedHeight(82,32,seed);
  swimVertical(player,1/30,floor,sea);
  const depth=immersionAt(sea,player.pos.y,floor);
  const newBubbles=bubbleEmissions(budget,1/30,depth,player.vel.y);
  bubbles+=newBubbles;
  if(guestScheduleStep(guest,1/30,alive)){arrivals++;alive=true}
  if(i%300===299){
   assert(player.pos.y>=floor+.08-1e-7&&player.pos.y<=sea+.55+1e-7);
   assert(depth>=0&&depth<=1);
   assert(Number.isFinite(player.vel.y));
   assert(bubbles>0);
   assert(landWithin(500,500,seed,160));
  }
  if(alive&&phase>56){alive=false;const delay=finishGuestSchedule(guest);assert(delay>=50&&delay<=70)}
 }
 assert.equal(arrivals,1);
});

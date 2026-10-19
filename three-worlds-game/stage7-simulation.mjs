// Deterministic stage-7 simulation, deliberately independent of DOM, WebGL and wall-clock time.
export const bounded = (n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function immersionAt(surfaceY,heroY,floorY){
 return bounded((surfaceY+1.25-heroY)/2.7,0,1)*bounded((surfaceY-floorY)/.8,0,1);
}
export function swimVertical(player,dt,floorY,seaY){
 const pos=player.pos,vel=player.vel,
  goal=player.jumpHeld?2*bounded((seaY+.55-pos.y)/.8,0,1):-.72;
 vel.y+=(goal-vel.y)*bounded(dt*3.6,0,1);
 pos.y=bounded(pos.y+vel.y*dt,floorY+.08,Math.max(floorY+.08,seaY+.55));
 player.onGround=pos.y<=floorY+.09;
 if(player.onGround)vel.y=Math.max(0,vel.y);
 return pos.y;
}
export function bubbleEmissions(state,dt,immersion,verticalVelocity,capacity=96){
 state.budget+=(immersion>.04?(8+Math.abs(verticalVelocity)*29)*immersion:0)*dt;
 const emit=Math.min(24,capacity,Math.floor(state.budget));
 state.budget-=emit;
 return emit;
}
export function createGuestSchedule(seed=1337,{interval=50}={}){return {seed,cycle:0,remaining:interval};}
export function guestScheduleStep(state,dt,occupied){
 if(occupied)return false;
 state.remaining-=dt;
 if(state.remaining>1e-9)return false;
 state.remaining=Infinity; // one active guest maximum, rearm exclusively on completion
 return true;
}
export function finishGuestSchedule(state){
 state.cycle++;
 const q=Math.sin((state.cycle+state.seed)*12.9898)*43758.5453;
 state.remaining=50+((q%1+1)%1)*20;
 return state.remaining;
}

// Owner §21.5. One deterministic guest-event FSM: complete sequence and explicit choice.
export const RIFT_PHASES=Object.freeze(['idle','warning','opening','emerging','dialogue','closing']);
export const RIFT_WORDS='Что происходит?!!!';
export function frontOfHero(pos,look,distance=2.6){
 let dx=look.x||0,dz=look.z||0,l=Math.hypot(dx,dz);
 if(l<.001){dx=0;dz=-1;l=1}
 return {x:pos.x+dx/l*distance,z:pos.z+dz/l*distance,distance,
  alignment:((dx/l*distance)*dx+(dz/l*distance)*dz)/(Math.max(.001,distance)*l)};
}
export function createRiftEvent(seed=1337,{initial=50,interval=58}={}){
 const state={phase:'idle',remaining:initial,elapsed:0,cycle:0,choice:null,history:[],spot:null};
 const emit=(phase)=>{state.phase=phase;state.elapsed=0;state.history.push(phase)};
 function step(dt,{land=true,battle=false,pos,look}={}){
  if(state.phase==='idle'){
   if(!land||battle)return state;
   state.remaining-=dt;
   if(state.remaining<=1e-8){
    state.spot=frontOfHero(pos,look);
    emit('warning');
   }
  }else if(state.phase==='warning'){state.elapsed+=dt;if(state.elapsed>=.6)emit('opening')}
  else if(state.phase==='opening'){state.elapsed+=dt;if(state.elapsed>=1.2)emit('emerging')}
  else if(state.phase==='emerging'){state.elapsed+=dt;if(state.elapsed>=.9)emit('dialogue')}
  else if(state.phase==='closing'){
   state.elapsed+=dt;
   if(state.elapsed>=.6){
    state.cycle++;
    const wave=Math.sin((seed+state.cycle)*12.9898)*43758.5453;
    state.remaining=interval+(((wave%1)+1)%1-.5)*4;
    emit('idle');
   }
  }
  return state;
 }
 function choose(choice){
  if(state.phase!=='dialogue'||!['help','refuse'].includes(choice))return false;
  state.choice=choice;emit('closing');return true;
 }
 return {state,step,choose,get blocked(){return state.phase!=='idle'},
   get fx(){return ['warning','opening','emerging'].includes(state.phase)},
   get dialogue(){return state.phase==='dialogue'}};
}

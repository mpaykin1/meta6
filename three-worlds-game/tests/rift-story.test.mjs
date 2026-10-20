import {test} from 'node:test';import assert from 'node:assert/strict';import {guestLine,guestHomeFor} from '../rift-story.mjs';
test('guest dialogue reflects source world, predicament and relationship',()=>{assert.match(guestLine('water','island','neutral'),/вода/);assert.match(guestLine('ash','water','neutral'),/огню/);assert.notEqual(guestLine('ash','island','neutral'),guestLine('ash','island','friend'));assert.match(guestLine('ash','ash','home'),/оружие/)});

test('guest comes from a different world',()=>{for(const world of ['water','ash','island'])assert.notEqual(guestHomeFor(world),world)});


import {riftCountdownAllowed} from '../rift-story.mjs';
import {createRiftEvent} from '../rift-event.mjs';
test('audit 055: active helped guest survives 130 virtual seconds; event only rearms after guest finishes',()=>{
 const e=createRiftEvent(1337,{initial:5,interval:58});
 const pose={pos:{x:145,z:32},look:{x:1,z:0},battle:false};
 const step=(seconds,land,guest)=>e.step(seconds,{...pose,land:riftCountdownAllowed(land,guest)});
 assert.equal(riftCountdownAllowed(true,null),true);
 assert.equal(riftCountdownAllowed(true,{}),false);
 assert.equal(riftCountdownAllowed(false,null),false);
 step(5,true,null);assert.equal(e.state.phase,'warning');
 step(.6,true,null);assert.equal(e.state.phase,'opening');
 step(1.2,true,null);assert.equal(e.state.phase,'emerging');
 step(.9,true,null);assert.equal(e.state.phase,'dialogue');
 assert.equal(e.choose('help'),true);
 step(.6,true,{});assert.equal(e.state.phase,'idle');
 const guest={brain:{relation:'friend'},alive:true};
 const remain=e.state.remaining;
 for(let t=0;t<130;t++)step(1,true,guest);
 assert.equal(e.state.phase,'idle','new warning must not despawn helped guest');
 assert.equal(e.state.remaining,remain,'active guest must suspend the event clock');
 assert.equal(guest.alive,true,'guest remains alive until its real completion');
 guest.alive=false;step(65,true,null);
 assert.equal(e.state.phase,'warning','after guest completes the event re-arms in 50–70 s');
 assert.equal(e.state.cycle,1);
});

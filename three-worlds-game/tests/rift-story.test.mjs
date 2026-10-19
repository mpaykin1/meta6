import {test} from 'node:test';import assert from 'node:assert/strict';import {guestLine,guestHomeFor} from '../rift-story.mjs';
test('guest dialogue reflects source world, predicament and relationship',()=>{assert.match(guestLine('water','island','neutral'),/вода/);assert.match(guestLine('ash','water','neutral'),/огню/);assert.notEqual(guestLine('ash','island','neutral'),guestLine('ash','island','friend'));assert.match(guestLine('ash','ash','home'),/оружие/)});

test('guest comes from a different world',()=>{for(const world of ['water','ash','island'])assert.notEqual(guestHomeFor(world),world)});

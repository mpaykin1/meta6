// Owner §21.16: ONLY direct, unmodified source definitions are permissible guests.
// Catalog references owner-provided ash-assets.mjs, not reconstructed GPT geometry.
export const GUEST_ROSTER=Object.freeze([
 Object.freeze({id:'strider_m',origin:'ash',catalog:'ash-assets.mjs',sourceModel:'strider_m'})
]);
export function getOriginalGuestDefinition(factory,id='strider_m'){
 const ref=GUEST_ROSTER.find(entry=>entry.id===id);
 if(!ref||!['island','ash','sunken'].includes(ref.origin))throw Error('unapproved guest '+id);
 if(ref.origin!=='ash'||ref.catalog!=='ash-assets.mjs')throw Error('source factory not connected for '+id);
 const def=factory?.models?.find(m=>m.id===ref.sourceModel);
 if(!def||typeof def.stats!=='function'||typeof factory.instance!=='function')
  throw Error('original guest source definition missing '+ref.sourceModel);
 const original=def.stats();
 if(def.parts.length<5||original.voxels<100)throw Error('original source model unexpectedly degraded '+id);
 return {ref,def,original};
}
export function instantiateOriginalGuest(factory,id='strider_m'){
 const {ref,def,original}=getOriginalGuestDefinition(factory,id);
 const inst=factory.instance(def);
 if(inst.def!==def||inst.p&&Object.keys(inst.p).length<def.parts.length)
  throw Error('original guest animation parts were simplified');
 const actualVoxels=inst.def.stats().voxels,actualParts=inst.def.parts.length;
 if(actualVoxels<original.voxels||actualParts<def.parts.length)
  throw Error('guest detail below source quality');
 return {ref,inst,sourceVoxels:original.voxels,sourceParts:def.parts.length};
}

// Pure, frame-rate-independent camera dead-zone control for phone PERSON mode.
// World position is immutable inside central 40% screen square (NDC ±0.4).
export const DEAD_NDC=.40;
export function cameraSectorDelta(ndcX,ndcY,yaw,dist,aspect,fov,dt){
 const x=Math.abs(ndcX)<=DEAD_NDC?0:ndcX-Math.sign(ndcX)*DEAD_NDC;
 const y=Math.abs(ndcY)<=DEAD_NDC?0:ndcY-Math.sign(ndcY)*DEAD_NDC;
 if(!x&&!y)return {dx:0,dz:0,transition:false};
 const halfHeight=Math.max(1,dist)*Math.tan(fov*Math.PI/360);
 const right=halfHeight*aspect*x,forward=halfHeight*y;
 const c=Math.cos(yaw),s=Math.sin(yaw),k=1-Math.exp(-5*Math.min(.05,Math.max(0,dt)));
 return {dx:(c*right+s*forward)*k,dz:(-s*right+c*forward)*k,transition:true};
}

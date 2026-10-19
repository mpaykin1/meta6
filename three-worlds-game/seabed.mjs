// Seeded continuous sea floor; used by BOTH renderer and collision sampling.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
function hash(x,z,s){let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296}
function noise(x,z,s){const a=Math.floor(x),b=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,z-b);return (hash(a,b,s)*(1-u)+hash(a+1,b,s)*u)*(1-v)+(hash(a,b+1,s)*(1-u)+hash(a+1,b+1,s)*u)*v}
const fbm=(x,z,s)=>noise(x,z,s)*.56+noise(x*2.03,z*2.03,s+9)*.3+noise(x*4.07,z*4.07,s+13)*.14;
export function seabedHeight(x,z,seed=1337){
 const off=Math.max(0,-x,x-64,-z,z-64),gx=Math.round((x-128)/220),gz=Math.round((z-128)/220);
 let y=1+(fbm(x*.10,z*.10,seed)-.5)*.7-smooth(0,30,off)*6.5;
 const deep=smooth(10,25,off);
 y+=deep*(2.6*Math.sin(x*.16+z*.12)+2.2*Math.cos(z*.19-x*.04));
 for(let iz=gz-1;iz<=gz+1;iz++)for(let ix=gx-1;ix<=gx+1;ix++){
  const cx=128+ix*220+(hash(ix,iz,seed)-.5)*60,cz=128+iz*220+(hash(ix,iz,seed+1)-.5)*60;
  y+=smooth(1.5,.05,Math.hypot((x-cx)/25,(z-cz)/25))*12*deep;
 }
 return Math.max(-12,y);
}

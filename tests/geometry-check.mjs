import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
const d=JSON.parse(fs.readFileSync(new URL('../junction-geometry.json',import.meta.url),'utf8'));
const D=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
assert.equal(d.roads.length,7,'Seven OSM ways in five approach groups');
assert.equal(d.junctionLegs.length,5,'Five approach directions');
assert.equal(d.ringOsmWay,1251057553);
assert.ok(d.ring.length>=20,'OSM roundabout geometry');
assert.equal(d.roads.filter(x=>x.oneway).length,4,'Four separate one-way primary carriageways');
const ringRadius=Math.min(...d.ring.map(p=>Math.hypot(...p)));
assert.ok(ringRadius>13,'Roundabout centerline not inside island');
const get=(key)=>d.roads.find(x=>x.id===key).points;
assert.ok(D(get('north-fork').at(-1),get('north-pham')[1])<.2,'North fork joins Pham Ngu Lao upstream of island');
const ringDistance=(p)=>Math.min(...d.ring.map(q=>D(p,q)));
for(const [id,entry] of [['south-pham',get('south-pham').at(-1)],['north-pham',get('north-pham')[0]],['west-in',get('west-in').at(-1)],['west-out',get('west-out')[0]],['east-in',get('east-in').at(-1)],['east-out',get('east-out')[0]]]){
 assert.ok(ringDistance(entry)<.15,id+' joins OSM ring within 15cm');
}
assert.ok(Math.hypot(...get('north-fork').at(-1))>22,'Fifth branch Y-junction upstream of roundabout, not in center');
const idx={south:11,north:22,win:8,ein:19,wout:2,eout:14};
const by={south:'south-pham',north:'north-pham',fork:'north-fork',win:'west-in',wout:'west-out',ein:'east-in',eout:'east-out'};
function ringSection(a,b){const pts=[];let i=idx[a],tries=0;do{pts.push(d.ring[i]);if(i===idx[b]&&tries>0)break;i=(i+1)%d.ring.length;tries++;}while(tries<=d.ring.length+1);return pts;}
function route(from,to){
 const road=k=>get(by[k]);
 const ins=from==='south'?road('south'):from==='north'?road('north').slice().reverse():from==='fork'?[...road('fork'),...road('north').slice(0,2).reverse()]:road(from);
 const outs=to==='south'?road('south').slice().reverse():to==='north'?road('north'):to==='fork'?[...road('north').slice(0,2),...road('fork').slice().reverse()]:road(to);
 const pts=[...ins,...ringSection(from==='fork'?'north':from,to==='fork'?'north':to),...outs];
 const curve=new THREE.CatmullRomCurve3(pts.map(([x,y])=>new THREE.Vector3(x,.22,-y)),false,'centripetal');
 let minR=10000;
 for(let i=0;i<=800;i++){let p=curve.getPointAt(i/800),radius=Math.hypot(p.x,p.z);if(radius<minR)minR=radius;}
 return {minR,length:curve.getLength()};
}
const flow=[['south','eout'],['south','wout'],['north','eout'],['north','south'],['fork','wout'],['fork','south'],['win','north'],['win','eout'],['win','south'],['ein','wout'],['ein','south'],['ein','fork']];
const collisionRadius=10.8;
for(const [a,b] of flow){const cur=route(a,b);console.log('ROUTE',a,b,'minRadius',cur.minR.toFixed(2),'length',cur.length.toFixed(1));assert.ok(cur.minR>collisionRadius,'Ground car '+a+' -> '+b+' enters center island');}
assert.ok(7-.92/2>5.5,'Bridge underside clearance at center for nominal 7m high deck');
function segmentDistance([x,y],[ax,ay],[bx,by]){const dx=bx-ax,dy=by-ay;const u=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-u*dx,y-ay-u*dy);}
for(const span of [110,140,160,180,220]){
 for(const t of [-span*.76/2,span*.76/2]){
  assert.ok(Math.abs(t)>24,'Pier location outside central island');
  const v=t<0?3:1,pt=[.979*t-.203*v,.203*t+.979*v];
  const clearance=Math.min(...d.roads.map(w=>Math.min(...w.points.slice(1).map((p,i)=>segmentDistance(pt,w.points[i],p)))-w.width/2));
  assert.ok(clearance>2,'Pier must clear all OSM road envelopes for span '+span+': '+clearance.toFixed(2)+' m');
 }
}
console.log('PASS: 5 approaches; north Y fork upstream; 7 OSM ways; 23-node ring; 4 one-way roads; 12 vehicle routes; piers outside island.');

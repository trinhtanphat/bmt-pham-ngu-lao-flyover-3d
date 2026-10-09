import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(new URL('../junction-geometry.json',import.meta.url),'utf8'));
function dist([x,y],[ax,ay],[bx,by]){const dx=bx-ax,dy=by-ay;const u=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-u*dx,y-ay-u*dy);}
function nearest(pos){return d.roads.map(w=>({id:w.id,d:Math.min(...w.points.slice(1).map((p,i)=>dist(pos,w.points[i],p)))-w.width/2})).sort((a,b)=>a.d-b.d).slice(0,2);}
for(const t of [-42,-57,-60.8,-84,42,57,60.8,84]){
 for(const v of [-17,-11,-3,-1,0,1,3,8,16]){
 const x=.979*t-.203*v,y=.203*t+.979*v; console.log('t',t,'v',v,'nearest road-edge-clearance',nearest([x,y]).map(w=>w.id+':'+w.d.toFixed(1)).join(' '));
 }
}

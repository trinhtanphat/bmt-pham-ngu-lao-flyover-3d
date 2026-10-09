import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $=s=>document.querySelector(s);
const GEO={lat:12.70036,lng:108.02698};
const s={elev:7,span:160,lanes:4,bridge:true,traffic:true,night:false};
let data,scene,renderer,camera,orbit,sun,sky,ground,bridge,carGroup,cars=[],map,baseLayer,frame=0,last=0,prev=0;
const PI=Math.PI, min=(a,b)=>Math.min(a,b), r=Math.hypot;
const m=(c,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});
const colors={asphalt:m('#354653'),lane:m('#f3e7c7'),shoulder:m('#b7b4a6'),island:m('#7a9e62'),pavement:m('#aaada2'),piers:m('#9faeaf'),guard:m('#d9e5df'),windows:m('#7698a3',.25)};
const V=(p,y=.10)=>new THREE.Vector3(p[0],y,-p[1]);
const travel=(t)=>[t*.979,t*.203]; // surveyed general 10/3 west-east bearing, approximate overpass axis
function box(parent,w,h,d,x,y,z,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function cylinder(parent,radius,height,x,y,z,material,sides=12){const ob=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,sides),material);ob.position.set(x,y,z);parent.add(ob);return ob;}
function lineDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function ringRadius(){return min(...data.ring.map(q=>r(q[0],q[1])));}
function createRoad(parent,points,width,{line=true,curb=true,material=colors.asphalt}={}){
 const pts=points.map(p=>V(p));if(pts.length<2)return;
 const c=new THREE.CatmullRomCurve3(pts,false,'centripetal');
 const samples=c.getSpacedPoints(Math.max(12,Math.ceil(c.getLength()/2.5)));
 const sections=[];
 for(let i=0;i<samples.length;i++){
  const p=samples[i],a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)];
  const dx=b.x-a.x,dz=b.z-a.z,l=r(dx,dz)||1;
  const px=-dz/l,pz=dx/l;
  sections.push({p,px,pz});
 }
 function ribbon(offset,thickness,y,mat){
  const pos=[],uv=[];
  for(let i=0;i<sections.length-1;i++){
   const a=sections[i],b=sections[i+1];
   for(const v of [[a,-1],[b,-1],[a,1],[a,1],[b,-1],[b,1]]){
    const sec=v[0],k=v[1],f=offset+thickness*k/2;
    pos.push(sec.p.x+sec.px*f,y,sec.p.z+sec.pz*f);
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:mat.color,roughness:mat.roughness,side:THREE.DoubleSide}));
  parent.add(mesh);
 }
 if(curb){ribbon(0,width+1.15,.027,colors.shoulder);}
 ribbon(0,width,.063,material);
 if(line){for(const side of [-1,1])ribbon(side*(width/2-.65),.19,.085,colors.lane);
 // dashed centerline by short thin shapes following OSM way direction
 const n=Math.floor(c.getLength()/15);
 for(let i=0;i<n;i++){const dist=(i+.2)/n;const p=c.getPointAt(dist),t=c.getTangentAt(dist);if(p.distanceTo(c.getPointAt(Math.min(1,dist+.014)))<.7)continue;
 const ob=box(parent,6,.035,.18,p.x,.104,p.z,colors.lane);ob.rotation.y=Math.atan2(-t.z,t.x);}
 }
 return {curve:c,length:c.getLength()};
}
function createRing(){
 const pts=data.ring,inner=8.95,width=10.4;
 const center=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);
 const out=pts.map(p=>{const ux=p[0]-center[0],uy=p[1]-center[1],l=r(ux,uy);return [p[0]+(width/2)*ux/l,p[1]+(width/2)*uy/l];});
 const inn=pts.map(p=>{const ux=p[0]-center[0],uy=p[1]-center[1],l=r(ux,uy);return [p[0]-(width/2)*ux/l,p[1]-(width/2)*uy/l];});
 const makeShape=(points)=>{const shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();return shape;};
 const asphalt=makeShape(out),hole=new THREE.Path();
 [...inn].reverse().forEach((p,i)=>i?hole.lineTo(...p):hole.moveTo(...p));hole.closePath();asphalt.holes.push(hole);
 const g=new THREE.ShapeGeometry(asphalt,64),mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:'#364955',side:THREE.DoubleSide}));mesh.rotation.x=-PI/2;mesh.position.y=.12;scene.add(mesh);
 const inside=makeShape(inn),g2=new THREE.ShapeGeometry(inside),green=new THREE.Mesh(g2,new THREE.MeshStandardMaterial({color:'#79a56d',side:THREE.DoubleSide}));green.rotation.x=-PI/2;green.position.y=.143;scene.add(green);
 // Interior stays explicitly traffic-free.
 for(let k=0;k<11;k++){const th=k*2.399,R=2+Math.sqrt(k/11)*5.4;tree(scene,R*Math.cos(th),-R*Math.sin(th),.28+k%3*.06);}
 cylinder(scene,2.5,.4,center[0],.38,-center[1],m('#c0b29a'),32);
 cylinder(scene,.52,3.4,center[0],2.0,-center[1],m('#d2b485',.45,.3));
 const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(p,.16)),true,'centripetal');return curve;
}
function tree(parent,x,z,size=1){
 const wood=m('#72674c'),leaf=m('#397460');
 cylinder(parent,.4*size,2.6*size,x,1.5*size,z,wood,7);
 const ob=new THREE.Mesh(new THREE.IcosahedronGeometry(2.15*size,1),leaf);ob.position.set(x,4*size,z);parent.add(ob);
}
function label(parent,text,pos,color='#d5f3a5'){
 const c=document.createElement('canvas');c.width=640;c.height=112;
 const ctx=c.getContext('2d');ctx.fillStyle='#102d3cdd';ctx.roundRect(2,2,636,108,18);ctx.fill();
 ctx.fillStyle=color;ctx.font='bold 32px system-ui,Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,57,610);
 const tx=new THREE.CanvasTexture(c),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));
 sp.position.copy(V(pos,13));sp.scale.set(47,8.2,1);parent.add(sp);
}
function setupWorld(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#9cbcc8');scene.fog=new THREE.Fog('#9cbcc8',390,820);
 camera=new THREE.PerspectiveCamera(43,1,.4,1700);camera.position.set(235,195,245);
 const root=$('#stage3d');
 renderer=new THREE.WebGLRenderer({canvas:$('#scene'),antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
 orbit=new OrbitControls(camera,$('#scene'));orbit.target.set(0,2,0);orbit.enableDamping=true;orbit.maxPolarAngle=PI/2-.035;orbit.minDistance=33;orbit.maxDistance=580;orbit.update();
 sky=new THREE.HemisphereLight(0xffffff,0x627a80,2.45);scene.add(sky);sun=new THREE.DirectionalLight(0xffe3c7,3);sun.position.set(-120,230,-100);scene.add(sun);
 ground=m('#79946f');box(scene,840,.15,790,0,-.27,0,ground);
 // road strips sourced from OSM node geometry (not axis-aligned boxes).
 for(const road of data.roads)createRoad(scene,road.points,road.width);
 const circle=createRing();window.__junctionRoundaboutCurve=circle;
 // Street lights, buildings and planted verge.
 const walls=['#c8bcad','#dde2d8','#dfc9ae','#e9e2da','#a9bcb8','#d5d1bc'],roofs=['#945f51','#596f70','#8d8280'];
 let seed=7844;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 function clearOfRoad(p,margin){if(r(...p)<42)return false;return data.roads.every(road=>{const q=road.points;for(let j=1;j<q.length;j++)if(lineDistance(p,q[j-1],q[j])<road.width/2+margin)return false;return true;});}
 for(let i=0;i<185;i++){
  const x=(rand()-.5)*700,y=(rand()-.5)*620;
  if(!clearOfRoad([x,y],16))continue;
  if(i%3===0){tree(scene,x,-y,.55+rand()*.4);continue;}
  const w=8+rand()*11,d=10+rand()*13,h=7+rand()*11;
  box(scene,w,h,d,x,h/2-.17,-y,m(walls[i%walls.length]));
  box(scene,w+.6,.65,d+.6,x,h+.16,-y,m(roofs[i%roofs.length]));
  if(i%3===1)box(scene,w-1.5,2.2,.09,x,h*.45,-y+d/2+.06,colors.windows);
 }
 for(const t of [-210,-145,150,235]){const p=travel(t);
 const steel=m('#6a7e82'),light=m('#fff1ad',.6);
 cylinder(scene,.25,9,p[0]+18,4.5,-p[1]+12,steel);
 box(scene,4,.16,.26,p[0]+16,8.6,-p[1]+12,steel);
 box(scene,1.8,.08,.35,p[0]+14,8.5,-p[1]+12,light);
 }
 label(scene,'01 · PHẠM NGŨ LÃO NAM',[12,-185]);
 label(scene,'02 · PHẠM NGŨ LÃO TÂY BẮC',[-110,170]);
 label(scene,'03 · NHÁNH CHỮ Y',[22,92],'#ffd4a3');
 label(scene,'04 · 10/3 TÂY',[-220,-48]);
 label(scene,'05 · 10/3 ĐÔNG',[230,48]);
 bridge=new THREE.Group();scene.add(bridge);carGroup=new THREE.Group();scene.add(carGroup);
 makeBridge();makeTraffic();
 new ResizeObserver(resize).observe(root);resize();requestAnimationFrame(animate);
}
function clearMeshGroup(g){g.traverse(o=>{if(o.isMesh){o.geometry?.dispose();}});g.clear();}
function bridgeY(t){const core=s.span/2,outer=core+145;return Math.abs(t)<=core?s.elev:Math.max(.35,s.elev*(1-(Math.abs(t)-core)/145));}
function blockBetween(parent,xa,ya,za,xb,yb,zb,wide,high,material){
 const from=new THREE.Vector3(xa,ya,za),to=new THREE.Vector3(xb,yb,zb),v=to.clone().sub(from);
 const b=box(parent,v.length(),high,wide,(xa+xb)/2,(ya+yb)/2,(za+zb)/2,material);b.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),v.normalize());return b;
}
function makeBridge(){
 clearMeshGroup(bridge);bridge.visible=s.bridge;
 const width=s.lanes===4?19.5:12.4,cores=s.span/2,edge=cores+145;
 const oldGuard=colors.guard,road=m('#374751'),beam=m('#91a6a9'),safety=m('#c5d9d8');
 for(let t=-edge;t<edge;t+=6){
 const T=Math.min(edge,t+6),p=travel(t),q=travel(T),y1=bridgeY(t),y2=bridgeY(T);
 blockBetween(bridge,p[0],y1,p[1]*-1,q[0],y2,q[1]*-1,width,.92,beam);
 blockBetween(bridge,p[0],y1+.50,-p[1],q[0],y2+.50,-q[1],width-.7,.12,road);
 for(const sign of [-1,1]){
  const offset=width/2-.36;
  blockBetween(bridge,p[0]+sign*(-.203)*offset,y1+1.28,-p[1]+sign*(-.979)*offset,q[0]+sign*(-.203)*offset,y2+1.28,-q[1]+sign*(-.979)*offset,.3,.95,oldGuard);
 }
 if(Math.round((t+edge)/6)%3===0){
  for(const lane of (s.lanes===4?[-width/4,0,width/4]:[0])){
   blockBetween(bridge,p[0]-.203*lane,y1+.59,-p[1]-.979*lane,q[0]-.203*lane,y2+.59,-q[1]-.979*lane,.14,.02,colors.lane);
  }
 }
 }
 for(const t of [-cores*.76,cores*.76]){
  // Median support measured against both separated OSM 10/3 carriageways.
  // Never place a column in a ground traffic lane or on the central island.
  const p=travel(t),height=bridgeY(t)-.65,median=t<0?3:1;
  const bx=p[0]-.203*median,bz=-p[1]-.979*median;
  cylinder(bridge,1.15,height-.6,bx,(height-.6)/2,bz,colors.piers);
  const cap=box(bridge,4,1.0,width*.85,bx,height-.5,bz,safety);
  cap.rotation.y=Math.atan2(.203,.979);
 }
}
function makeVehicle(parent,{truck=false,bike=false,tint='#e2c48e'}={}){
 const group=new THREE.Group();parent.add(group);
 const body=m(tint,.48),glass=m('#84b0b5',.3),rubber=m('#252c33');
 let length=truck?8:bike?2.1:4.7,wide=truck ? 2.5 : (bike ? 0.75 : 2.1);
 box(group,length,truck?2.05:bike ? 0.7 : 1.15,wide,0,truck?1.25:bike ? 0.55 : 0.90,0,body);
 if(truck)box(group,2.8,1.45,wide-.2,length*.27,2.8,0,glass);
 else if(!bike)box(group,2.8,.87,wide-.1,-.25,1.8,0,glass);
 for(const X of (truck?[-2.8,2.5]:bike?[-.72,.72]:[-1.5,1.5])){
  for(const Z of [-wide*.46,wide*.46]){
   const tire=new THREE.Mesh(new THREE.CylinderGeometry(bike ? 0.35 : 0.43,bike ? 0.35 : 0.43,.28,12),rubber);
   tire.rotation.x=PI/2;tire.position.set(X,bike ? 0.35 : 0.43,Z);group.add(tire);
  }
 }
 return group;
}
const named={
 south:'south-pham',north:'north-pham',fork:'north-fork',win:'west-in',wout:'west-out',ein:'east-in',eout:'east-out'
};
function getRoad(id){return data.roads.find(w=>w.id===named[id]).points;}
const idx={south:11,north:22,win:8,ein:19,wout:2,eout:14};
function ringSection(from,to){const o=[],ring=data.ring;let i=idx[from],steps=0;
 while(true){o.push(ring[i]);if(i===idx[to]&&steps>0)break;i=(i+1)%ring.length;if(++steps>ring.length+1)break;}return o;}
function route(from,to){
 const ins=from==='south'?getRoad('south'):from==='north'?getRoad('north').slice().reverse():from==='fork'?[...getRoad('fork').slice(),...getRoad('north').slice(0,2).reverse()]:getRoad(from);
 const outs=to==='south'?getRoad('south').slice().reverse():to==='north'?getRoad('north'):to==='fork'?[...getRoad('north').slice(0,2),...getRoad('fork').slice().reverse()]:getRoad(to);
 let pts=[...ins,...ringSection(from==='fork'?'north':from,to==='fork'?'north':to),...outs];
 // Limit at 240m to keep cars visible. Fork lengths deliberately retained.
 pts=pts.filter((p,i)=>r(...p)<265||i===0||i===pts.length-1);
 const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(p,.22)),false,'centripetal');
 return {curve,length:curve.getLength(),name:from+'-'+to};
}
function makeTraffic(){
 clearMeshGroup(carGroup);cars=[];
 const flow=[['south','eout'],['south','wout'],['north','eout'],['north','south'],['fork','wout'],['fork','south'],['win','north'],['win','eout'],['win','south'],['ein','wout'],['ein','south'],['ein','fork']];
 const shades=['#d8eef0','#e3b66e','#df847c','#8baaba','#ced4bb','#f0e4c4','#b6b7c3','#9bb593'];
 flow.forEach(([a,b],i)=>{try{
  const r=route(a,b);const ob=makeVehicle(carGroup,{tint:shades[i%shades.length],bike:i%5===3});
  cars.push({ob,...r,progress:((i%4)*.23+.06)%1,speed:7+(i%5)*1.7,kind:'round'});
 }catch(err){console.error('Route',a,b,err);}});
 // Two-way elevated traffic, separate lane offsets, fully above the island.
 for(let i=0;i<10;i++){const ob=makeVehicle(carGroup,{truck:i===2||i===8,tint:shades[(i+3)%shades.length]});
  cars.push({ob,kind:'bridge',progress:(i%5)*.198,speed:12+i%3*2,direction:i%2?1:-1,lane:i%2?4:-4});}
}
function animate(timestamp){
 requestAnimationFrame(animate);
 if(document.hidden||timestamp-last<32)return;
 last=timestamp;const dt=min((timestamp-prev)/1000||0,.06);prev=timestamp;const totalBridge=s.span+290;
 for(const o of cars){
  o.ob.visible=s.traffic&&(s.bridge||o.kind!=='bridge');if(!o.ob.visible)continue;
  if(s.traffic)o.progress=(o.progress+dt*o.speed/(o.kind==='bridge'?totalBridge:o.length))%1;
  if(o.kind==='bridge'){
   const t=(o.progress-.5)*totalBridge*o.direction,p=travel(t),py=bridgeY(t)+1.02;
   const bx=p[0]-.203*o.lane,bz=-p[1]-.979*o.lane;
   o.ob.position.set(bx,py,bz);o.ob.rotation.set(0,Math.atan2((o.direction > 0 ? 0.203 : -0.203), (o.direction > 0 ? 0.979 : -0.979)),0);continue;
  }
  const p=o.curve.getPointAt(o.progress),tg=o.curve.getTangentAt(o.progress);
  o.ob.position.copy(p);o.ob.rotation.y=Math.atan2(-tg.z,tg.x);
  // Safety: never let a ground-traffic car center enter the roundabout island.
  const radius=Math.hypot(p.x,p.z);
  if(radius<11.0){const k=11.15/(radius||1);o.ob.position.x*=k;o.ob.position.z*=k;}
 }
 orbit.update();renderer.render(scene,camera);
}
function resize(){if(!renderer)return;const rect=$('#stage3d').getBoundingClientRect();renderer.setSize(Math.max(340,rect.width),Math.max(260,rect.height),false);camera.aspect=Math.max(340,rect.width)/Math.max(260,rect.height);camera.updateProjectionMatrix();}
function view(v){if(v==='top')camera.position.set(1,320,4);else if(v==='road')camera.position.set(-175,24,135);else camera.position.set(235,195,245);orbit.target.set(0,2,0);orbit.update();}
function dark(){scene.background.set(s.night?'#101a30':'#9cbcc8');scene.fog.color.set(s.night?'#101a30':'#9cbcc8');sun.intensity=s.night ? 0.5 : 3;sky.intensity=s.night ? 0.88 : 2.45;ground.color.set(s.night?'#384f43':'#79946f');renderer.toneMappingExposure=s.night?1:1.28;}
function wireControls(){
 $('#elev').addEventListener('input',e=>{s.elev=+e.target.value;$('#elevValue').textContent=s.elev.toFixed(1)+' m';makeBridge();});
 $('#span').addEventListener('input',e=>{s.span=+e.target.value;$('#spanValue').textContent=s.span+' m';makeBridge();});
 $('#lanes').addEventListener('change',e=>{s.lanes=+e.target.value;makeBridge();});
 $('#showBridge').addEventListener('change',e=>{s.bridge=e.target.checked;bridge.visible=s.bridge;});
 $('#traffic').addEventListener('change',e=>{s.traffic=e.target.checked;});
 $('#night').addEventListener('change',e=>{s.night=e.target.checked;dark();});
 document.querySelectorAll('[data-view]').forEach(e=>e.addEventListener('click',()=>view(e.dataset.view)));
 $('#reset').addEventListener('click',()=>{Object.assign(s,{elev:7,span:160,lanes:4,bridge:true,traffic:true,night:false});
  $('#elev').value=7;$('#elevValue').textContent='7.0 m';$('#span').value=160;$('#spanValue').textContent='160 m';$('#lanes').value='4';$('#showBridge').checked=true;$('#traffic').checked=true;$('#night').checked=false;makeBridge();dark();view('iso');});
 $('#snapshot').addEventListener('click',()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='NGA-5-PHAM-NGU-LAO-3D-CONCEPT.png';a.href=renderer.domElement.toDataURL('image/png');a.click();});
 for(const id of ['street','satellite','terrain'])$('#'+id).addEventListener('click',()=>tile(id));
 $('#tab3d').addEventListener('click',()=>tab(false));$('#tabMap').addEventListener('click',()=>tab(true));
}
const layers={
 street:['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png','© OpenStreetMap contributors',19],
 satellite:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}','Imagery © Esri and data partners',19],
 terrain:['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png','© OpenTopoMap / OpenStreetMap / SRTM',17]
};
function tile(name){
 if(!map)return;if(baseLayer)map.removeLayer(baseLayer);
 const [url,atr,max]=layers[name];baseLayer=L.tileLayer(url,{maxZoom:20,maxNativeZoom:max,attribution:atr}).addTo(map);
 document.querySelectorAll('.map-tools button').forEach(b=>b.classList.toggle('active',b.id===name));
}
function geo(point){return [GEO.lat+point[1]/111320,GEO.lng+point[0]/(111320*Math.cos(GEO.lat*PI/180))];}
function initMap(){
 if(map||!window.L)return;
 map=L.map('map',{zoomControl:true,scrollWheelZoom:true}).setView([GEO.lat,GEO.lng],18);tile('street');
 L.circleMarker([GEO.lat,GEO.lng],{radius:6,color:'#142631',weight:3,fillColor:'#c7f465',fillOpacity:1}).addTo(map).bindPopup('Nút giao Phạm Ngũ Lão – Vành đai 10/3<br>5 nhánh nhìn thấy gồm một nhánh dân cư chữ Y nối vào Phạm Ngũ Lão trước vòng xoay.').openPopup();
 // Highlight verified OpenStreetMap way centerlines, NOT an invented flyover alignment.
 for(const road of data.roads)L.polyline(road.points.map(geo),{color:road.leg==='north-fork'?'#eea16c':'#69cedc',weight:road.leg==='north-fork'?5:3,opacity:.84,dashArray:road.leg==='north-fork'?'5,6':null}).addTo(map).bindPopup(road.name+'<br>Way OSM: '+road.osmWayId);
 L.polyline([...data.ring,data.ring[0]].map(geo),{color:'#c7f465',weight:5}).addTo(map).bindPopup('Quỹ đạo vòng xoay thực từ OSM · Way '+data.ringOsmWay);
}
function tab(showMap){
 $('#stage3d').hidden=showMap;$('#mapStage').hidden=!showMap;
 $('#tab3d').classList.toggle('active',!showMap);$('#tabMap').classList.toggle('active',showMap);
 $('#tab3d').setAttribute('aria-selected',String(!showMap));$('#tabMap').setAttribute('aria-selected',String(showMap));
 $('#modeNote').textContent=showMap?'BẢN ĐỒ THỰC / 5 NHÁNH · OSM':'MÔ PHỎNG NGÃ 5 / CẦU VƯỢT GIẢ ĐỊNH';
 if(showMap){initMap();setTimeout(()=>map?.invalidateSize(),20);}else resize();
}
function gallery(){
 const area=$('#galleryGrid');area.replaceChildren();
 const names=['Ngã 5 · mô hình 3D theo tim đường OSM','Ngã 5 · phối cảnh ý tưởng A','Ngã 5 · phối cảnh ý tưởng B'];
 for(let i=1;i<=3;i++){
  const fig=document.createElement('figure');fig.className='gallery-card';const img=document.createElement('img');img.src=['./assets/junction-5-iso.png','./assets/junction-five-way-1.jpg','./assets/junction-five-way-2.jpg'][i-1];
  img.loading='lazy';img.alt=names[i-1]+' — ảnh ý tưởng AI không phải ảnh hoặc bản vẽ chính thức';fig.append(img);
  const cap=document.createElement('figcaption');cap.innerHTML='<strong>'+names[i-1]+'</strong>'+(i===1?'Góc 3D lấy từ bản đồ OSM, cầu giả định':'Phối cảnh AI ý tưởng, không phải bản vẽ thi công');fig.append(cap);area.append(fig);
 }
}
async function boot(){
 wireControls();gallery();
 try{
  const res=await fetch('./junction-geometry.json',{cache:'no-store'});if(!res.ok)throw Error('OSM geometry HTTP '+res.status);data=await res.json();
  if(data.ring.length<12||data.roads.length!==7||data.junctionLegs.length!==5)throw Error('Invalid OSM topology');
  setupWorld();window.__junctionModelReady=true;
 }catch(err){console.error(err);const warning=$('#threeErr');warning.hidden=false;warning.textContent='Không thể dựng mô hình: '+err.message;}
}
boot();
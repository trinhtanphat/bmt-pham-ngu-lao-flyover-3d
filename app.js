import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const GEO = {lat:12.70036, lng:108.02698};
const $ = (sel)=>document.querySelector(sel);
const state = {elev:7, span:160, lanes:2, bridge:true, traffic:true, night:false};
const root=$('#stage3d'), canvas=$('#scene'), warning=$('#threeErr');
let renderer,scene,camera,orbit,bridgeGroup,vehicleGroup,materialGround,skyLight,mainLight,roadMaterial;
let vehicles=[],raf=0,prev=0;const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

function mat(color,roughness=.88,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
function box(parent,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m;}
function disc(parent,r,x,y,z,material){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.14,48),material);m.position.set(x,y,z);parent.add(m);return m;}
function addTree(parent,x,z,s=1){const trunk=mat('#625541'),foliage=mat('#477961'),foliage2=mat('#649e64');
box(parent,.6*s,3*s,.6*s,x,1.5*s,z,trunk);
const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(2.5*s,1),foliage);crown.position.set(x,4*s,z);parent.add(crown);
const crown2=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7*s,1),foliage2);crown2.position.set(x+1.2*s,4.7*s,z+.7*s);parent.add(crown2);
}
function setup(){
scene=new THREE.Scene();scene.background=new THREE.Color('#b1d4d7');scene.fog=new THREE.Fog('#b1d4d7',320,720);
camera=new THREE.PerspectiveCamera(42,1,.3,1400);camera.position.set(215,164,213);
renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.dampingFactor=.055;orbit.target.set(0,2,0);orbit.minDistance=37;orbit.maxDistance=580;orbit.maxPolarAngle=Math.PI/2-.035;orbit.update();
skyLight=new THREE.HemisphereLight(0xffffff,0x6a8679,2.2);scene.add(skyLight);
mainLight=new THREE.DirectionalLight(0xffe2b0,3.3);mainLight.position.set(-100,210,100);scene.add(mainLight);
const ground=mat('#7b9871');materialGround=ground;
box(scene,750,.12,610,0,-.38,0,ground);
const dirt=mat('#996b4b');
for(let i=0;i<35;i++){const x=Math.sin(i*4.28)*315,z=Math.cos(i*2.75)*250;box(scene,8+((i*13)%17),.04,8+((i*11)%18),x,-.22,z,dirt);}
roadMaterial=mat('#394850');
box(scene,710,.16,30,0,-.05,0,roadMaterial);box(scene,18,.17,560,0,-.02,0,roadMaterial);
const shoulder=mat('#c0ae9d'),line=mat('#e7dfbd');
for(const z of [-16.5,16.5])box(scene,705,.1,.45,0,.08,z,shoulder);
for(const x of [-10,10])box(scene,.4,.12,560,x,.13,0,shoulder);
for(let x=-350;x<=350;x+=17){if(Math.abs(x)<30)continue;box(scene,8,.06,.27,x,.11,0,line);}
for(let z=-280;z<=280;z+=16){if(Math.abs(z)<30)continue;box(scene,.25,.07,7,0,.15,z,line);}
const island=mat('#789a54'),ring=mat('#d0a78c');
disc(scene,24,0,.08,0,ring);disc(scene,15,0,.2,0,island);
for(let t=0;t<20;t++){const a=t*Math.PI/10;addTree(scene,Math.cos(a)*11,Math.sin(a)*11,.24+((t*3)%4)*.04);}
const stripes=mat('#e8e6de');
for(let j=-5;j<=5;j++){const x=j*2.4;for(const z of [-42,42])box(scene,1.25,.04,4,x,.21,z,stripes);}
for(let j=-5;j<=5;j++){const z=j*2.4;for(const x of [-45,45])box(scene,4,.04,1.25,x,.18,z,stripes);}
const sidewalk=mat('#b6ada0');
for(const z of [-35,35])box(scene,700,.12,3.8,0,-.09,z,sidewalk);
for(const x of [-27,27])box(scene,3.8,.12,560,x,-.10,0,sidewalk);
// Stylized neighboring urban fabric; expressly not a survey.
const seed=({i:17,random(){this.i=(this.i*16807)%2147483647;return(this.i-1)/2147483646;}});const rnd=()=>seed.random();
const walls=['#d3c4aa','#ece2d5','#cab7a8','#d5dce0','#c0b5a4','#e0c9b1','#a9bebd'];
const roofs=['#b46d4e','#775952','#8b9b9c','#6c7377'];
for(let i=0;i<165;i++){
 const x=(rnd()-.5)*710,z=(rnd()-.5)*540;
 if(Math.abs(z)<56||Math.abs(x)<45||Math.hypot(x/1.4,z/1.3)<45)continue;
 const w=8+rnd()*11,d=9+rnd()*12,h=5+rnd()*15;
 const b=box(scene,w,h,d,x,h/2-.12,z,mat(walls[i%walls.length]));
 box(scene,w+.5,.7,d+.5,x,h+.23,z,mat(roofs[i%roofs.length]));
 if(i%4===0)box(scene,w-.8,1.8,.08,x,h*.46,z+d/2+.03,mat('#8bb0af',.3));
}
for(let i=0;i<100;i++){const x=-340+(i*67)%690;let z=45+(i*49)%180;if(i%2)z=-z;addTree(scene,x,z,.6+rnd()*.55);}
for(let i=0;i<24;i++){const x=-325+i*27;addTree(scene,x,24+(i%3)*3,.45);addTree(scene,x,-24-(i%4)*2,.43);}
const poleMat=mat('#7e8b8b'),lampMat=mat('#edbd64',.4);
for(const x of [-104,-44,44,104]){
 for(const z of [-27,27]){
  box(scene,.36,9,.36,x,4.5,z,poleMat);box(scene,.32,.35,4.7,x,8.6,z+(z>0?-2:2),poleMat);
  box(scene,.5,.1,1.5,x,8.4,z+(z>0?-4:4),lampMat);
 }}
vehicleGroup=new THREE.Group();scene.add(vehicleGroup);
bridgeGroup=new THREE.Group();scene.add(bridgeGroup);buildBridge();buildCars();resize();
new ResizeObserver(resize).observe(root);requestAnimationFrame(animate);
}
function roadY(x){const s=state.span/2,outer=s+95;if(Math.abs(x)<=s)return state.elev;return Math.max(.4,state.elev*(1-(Math.abs(x)-s)/95));}
function makeSlopedDeck(g,x1,y1,x2,y2,width){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);
const m=box(g,L,.8,width,(x1+x2)/2,(y1+y2)/2,0,mat('#89959b'));
m.rotation.z=Math.atan2(dy,dx);return m;}
function buildBridge(){
bridgeGroup.clear();bridgeGroup.visible=state.bridge;
const s=state.span/2,h=state.elev,w=state.lanes===4?25:14;
const road=mat('#343e49'),rail=mat('#d2dad8'),yellow=mat('#f5e4a7'),pier=mat('#8e9695'),accent=mat('#9eaaa7');
for(const a of [[-s-95,.38,-s,h],[-s,h,s,h],[s,h,s+95,.38]]){
 const [x1,y1,x2,y2]=a;makeSlopedDeck(bridgeGroup,x1,y1,x2,y2,w);
 const L=Math.hypot(x2-x1,y2-y1);const angle=Math.atan2(y2-y1,x2-x1);
 const mx=(x1+x2)/2,my=(y1+y2)/2;
 const surface=box(bridgeGroup,L,.09,w-.65,mx,my+.48,0,road);surface.rotation.z=angle;
 for(const z of [-w/2+.35,w/2-.35]){const guard=box(bridgeGroup,L,1.2,.38,mx,my+1.45,z,rail);guard.rotation.z=angle;}
 for(const z of [-w/2+1.1,w/2-1.1]){const edge=box(bridgeGroup,L,.035,.18,mx,my+.57,z,yellow);edge.rotation.z=angle;}
 for(const z of (state.lanes===4?[-w/4,0,w/4]:[0])){
  for(let x=x1+8;x<x2-7;x+=17){
   const xx=clamp(x,x1+3,x2-3),yy=y1+(xx-x1)/(x2-x1)*(y2-y1)+.61;
   const marker=box(bridgeGroup,8,.028,.16,xx,yy,z,yellow);marker.rotation.z=angle;
  }
 }
}
for(const x of [-s*.68,0,s*.68]){
 const underside=h-.85;if(underside<4.5)continue;
 for(const z of [-w*.28,w*.28]){box(bridgeGroup,2.1,underside-.4,2.1,x,(underside-.4)/2,z,pier);box(bridgeGroup,5,.8,4,x,underside-.85,z,accent);}
}
for(const x of [-s-95,s+95]){box(bridgeGroup,5,.8,w+3,x,.2,0,pier);}
}
function makeCar(parent,color){const g=new THREE.Group();parent.add(g);const body=mat(color,.5),glass=mat('#88bfc2',.24),tire=mat('#1f272b');box(g,5.6,1.5,2.5,0,.85,0,body);box(g,2.6,1.3,2.4,-.2,2,0,glass);for(const x of [-1.6,1.65])for(const z of [-1.15,1.15]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.51,.51,.4,12),tire);t.rotation.x=Math.PI/2;t.position.set(x,.45,z);g.add(t);}return g;}
function buildCars(){vehicleGroup.clear();vehicles=[];
const colors=['#f8f3e9','#edbd70','#8dc4c3','#3d6477','#e6a28d','#bdc9a3','#b6c8e1'];
for(let i=0;i<13;i++){const layer=i<8?'bridge':'street',direction=i%2?1:-1,lane=(i%3-1)*(state.lanes===4?4.5:3);
const car=makeCar(vehicleGroup,colors[i%colors.length]);car.scale.setScalar(.75+(i%3)*.1);vehicles.push({obj:car,layer,direction,lane,u:(i*37+10)%380,speed:9+(i%4)*3});}}
function animate(t){raf=requestAnimationFrame(animate);const dt=Math.min((t-prev)/1000||0,.06);prev=t;
if(state.traffic){for(const v of vehicles){v.u=(v.u+dt*v.speed)%440;let x=v.direction*(v.u-220);
if(v.layer==='bridge'){v.obj.visible=state.bridge;v.obj.position.set(x,roadY(x)+.52,v.lane);v.obj.rotation.y=v.direction===1?0:Math.PI;}else{const z=x*1.1;v.obj.visible=true;v.obj.position.set(v.lane*.9,.12,clamp(z,-265,265));v.obj.rotation.y=v.direction===1?Math.PI/2:-Math.PI/2;}}
}else for(const v of vehicles)v.obj.visible=false;
orbit.update();renderer.render(scene,camera);}
function resize(){if(!renderer)return;const r=root.getBoundingClientRect();const w=Math.max(320,r.width),h=Math.max(320,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function setView(name){
 if(name==='top')camera.position.set(2,310,3);
 else if(name==='road')camera.position.set(54,15,100);
 else camera.position.set(215,164,213);
 orbit.target.set(0,2,0);orbit.update();
}
function applyNight(){scene.background=new THREE.Color(state.night?'#101a30':'#b1d4d7');scene.fog.color.set(state.night?'#101a30':'#b1d4d7');mainLight.intensity=state.night?.55:3.3;skyLight.intensity=state.night?.85:2.2;renderer.toneMappingExposure=state.night?1.05:1.45;materialGround.color.set(state.night?'#49624e':'#7b9871');}
$('#elev').addEventListener('input',e=>{state.elev=+e.target.value;$('#elevValue').textContent=state.elev.toFixed(1)+' m';buildBridge();});
$('#span').addEventListener('input',e=>{state.span=+e.target.value;$('#spanValue').textContent=state.span+' m';buildBridge();});
$('#lanes').addEventListener('change',e=>{state.lanes=+e.target.value;buildBridge();buildCars();});
$('#showBridge').addEventListener('change',e=>{state.bridge=e.target.checked;bridgeGroup.visible=state.bridge;});
$('#traffic').addEventListener('change',e=>{state.traffic=e.target.checked;});
$('#night').addEventListener('change',e=>{state.night=e.target.checked;applyNight();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('#reset').addEventListener('click',()=>{for(const [k,v] of Object.entries({elev:7,span:160,lanes:2,bridge:true,traffic:true,night:false}))state[k]=v;
$('#elev').value=7;$('#span').value=160;$('#elevValue').textContent='7.0 m';$('#spanValue').textContent='160 m';$('#lanes').value='2';
$('#showBridge').checked=true;$('#traffic').checked=true;$('#night').checked=false;buildBridge();buildCars();applyNight();setView('iso');});
$('#snapshot').addEventListener('click',()=>{try{renderer.render(scene,camera);const a=document.createElement('a');a.download='Pham-Ngu-Lao-flyover-CONCEPT-3D.png';a.href=renderer.domElement.toDataURL('image/png');a.click();}catch(e){alert('Không thể xuất ảnh trong trình duyệt này.');}});
let map=null,baseLayer=null;const tileOptions={maxZoom:20};
const tiles={
 street:{url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',opts:{...tileOptions,attribution:'&copy; OpenStreetMap contributors',maxNativeZoom:19}},
 satellite:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',opts:{...tileOptions,attribution:'Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',maxNativeZoom:19}},
 terrain:{url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',opts:{...tileOptions,attribution:'&copy; OpenStreetMap contributors, SRTM | OpenTopoMap (CC BY-SA)',maxNativeZoom:17}}
};
function setMapLayer(name){if(!map)return;if(baseLayer)map.removeLayer(baseLayer);baseLayer=L.tileLayer(tiles[name].url,tiles[name].opts).addTo(map);document.querySelectorAll('.map-tools button').forEach(b=>b.classList.toggle('active',b.id===name));}
function initMap(){
 if(map||!window.L)return;
 map=L.map('map',{zoomControl:true,scrollWheelZoom:true}).setView([GEO.lat,GEO.lng],18);
 setMapLayer('street');
 const pin=L.divIcon({className:'',html:'<div class="junction-pin"></div>',iconSize:[22,22],iconAnchor:[11,11]});
 L.marker([GEO.lat,GEO.lng],{icon:pin}).addTo(map).bindPopup('<b>Giao lộ Phạm Ngũ Lão × Vành đai Tây</b><br>Tâm nút giao ước tính từ dữ liệu OSM.<br>Không phải mốc khảo sát địa chính.').openPopup();
 L.circle([GEO.lat,GEO.lng],{radius:27,color:'#c7f465',weight:2,fillColor:'#c7f465',fillOpacity:.1}).addTo(map);
}
const changeTab=(isMap)=>{
$('#tabMap').classList.toggle('active',isMap);$('#tab3d').classList.toggle('active',!isMap);$('#tabMap').setAttribute('aria-selected',String(isMap));$('#tab3d').setAttribute('aria-selected',String(!isMap));
$('#mapStage').hidden=!isMap;$('#stage3d').hidden=isMap;$('#modeNote').textContent=isMap?'BẢN ĐỒ THỰC · TÂM GIAO LỘ ƯỚC TÍNH':'MÔ HÌNH ĐANG HIỂN THỊ: CẦU VƯỢT GIẢ ĐỊNH';
if(isMap){initMap();setTimeout(()=>map?.invalidateSize(),30);}else resize();
};
$('#tab3d').addEventListener('click',()=>changeTab(false));$('#tabMap').addEventListener('click',()=>changeTab(true));
for(const n of ['street','satellite','terrain'])$('#'+n).addEventListener('click',()=>setMapLayer(n));
function initGallery(){const g=$('#galleryGrid');const names=['Phối cảnh tổng thể','Không gian nút giao','Tầm nhìn đô thị'];let loaded=0;
const cards=[1,2,3].map((i)=>{const el=document.createElement('figure');el.className='gallery-card';const im=document.createElement('img');im.loading='lazy';im.alt='Phối cảnh mô phỏng cầu vượt giả định Phạm Ngũ Lão – Vành đai Tây, phương án ý tưởng số '+i;
const src='./assets/concept-'+i+'.jpg';im.src=src;im.onload=()=>{loaded++;};im.onerror=()=>{el.style.display='none';};el.append(im);const cap=document.createElement('figcaption');cap.innerHTML='<strong>'+names[i-1]+'</strong>Concept visualization · Không phải dự án chính thức';el.append(cap);return el;});
g.replaceChildren(...cards);
}
try{setup();}catch(err){console.error('3D init failed',err);warning.hidden=false;}
initGallery();

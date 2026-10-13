/* 활성 2026 PT 17–26쪽의 앞면 사진을 근거로 한 가상 재구성. 실물 조립도는 아니다. */
import * as THREE from '../vendor/three.module.js';
import {makeRenderer,fitStage,makeCamera} from '../vendor/ctm-3d.js';

const stage=document.querySelector('.stage'),canvas=document.createElement('canvas');
canvas.setAttribute('aria-label','브릭으로 만든 동물병원 문 가상 3D 모형');stage.prepend(canvas);
const renderer=makeRenderer(canvas);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xdce3e9);
const {camera,controls}=makeCamera(canvas,{fov:40,minD:3,maxD:22,far:100});
scene.add(new THREE.HemisphereLight(0xffffff,0xb7c5d4,1.6));
const light=new THREE.DirectionalLight(0xfff2de,2.0);light.position.set(-4,8,6);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
const fill=new THREE.DirectionalLight(0xd3e9ff,.85);fill.position.set(4,3,-5);scene.add(fill);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.44});
const M={white:mat(0xf8f9f6),yellow:mat(0xf8d619),red:mat(0xd22d2b),blue:mat(0x00afd3),cyan:mat(0x14c7e5),purple:mat(0x48318b),green:mat(0x6dc930),black:mat(0x152025),gray:mat(0x707f8c),table:mat(0xe5e4df),glass:new THREE.MeshStandardMaterial({color:0xa6dcf1,transparent:true,opacity:.56,metalness:.2,roughness:.13})};
function mesh(parent,geometry,material,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(p,w,h,d,m,x=0,y=0,z=0){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z)}
function cyl(p,r,h,m,x=0,y=0,z=0,n=32){return mesh(p,new THREE.CylinderGeometry(r,r,h,n),m,x,y,z)}
const table=box(scene,30,.15,22,M.table,0,-.33,0);table.castShadow=false;
// PT 17·20쪽의 흰 바닥판, 빨강·노랑 벽돌, 파랑·보라 장식과 열린 가운데 출입구.
const hospital=new THREE.Group();scene.add(hospital);
box(hospital,4.35,.11,2.3,M.white,0,-.12,0);
for(let ix=-10;ix<=10;ix++)for(let iz=-5;iz<=5;iz++)cyl(hospital,.067,.03,M.white,ix*.2,-.042,iz*.2,12);
for(const side of [-1,1]){
 const cx=side*1.42;
 box(hospital,1.22,.33,1.45,M.red,cx,.18,0);
 box(hospital,1.22,.79,1.45,M.yellow,cx,.74,0);
 box(hospital,1.34,.16,1.55,M.purple,cx,1.22,0);
 box(hospital,.55,.32,.72,M.cyan,side*1.84,.71,.63).rotation.z=side*.55;
 for(const x of [cx-.39,cx-.13,cx+.13,cx+.39])for(const z of [-.47,-.16,.16,.47])cyl(hospital,.078,.04,M.yellow,x,1.158,z,14);
 const eye=cyl(hospital,.17,.045,M.white,side*1.42,.99,.78,24);eye.rotation.x=Math.PI/2;
 const pupil=cyl(hospital,.075,.05,M.black,side*1.39,.99,.818,20);pupil.rotation.x=Math.PI/2;
}
box(hospital,.25,1.45,.25,M.yellow,-.55,.66,.58);box(hospital,.25,1.45,.25,M.yellow,.55,.66,.58);
box(hospital,1.46,.21,.35,M.green,0,1.43,.44);
// 문은 상부 피벗 축과 같은 회전 상태를 사용한다. 앞·뒤의 숨은 연결은 모형화하지 않는다.
const door=new THREE.Group();door.position.set(-.45,.03,.62);hospital.add(door);
box(door,.86,1.04,.09,M.white,.43,.54,0);
box(door,.09,1.04,.12,M.gray,.04,.54,0);
box(door,.60,.50,.02,M.glass,.49,.69,.06);
for(const x of [.22,.48,.74])box(door,.08,1.04,.10,M.white,x,.54,.08);
cyl(door,.08,1.6,M.black,0,.93,-.12,20);
const pivotCap=cyl(hospital,.18,.16,M.black,-.45,1.72,.30);cyl(hospital,.06,.05,M.yellow,-.45,1.83,.30,16);
// 병원 지붕 위에 손잡이가 달린 구동 기어와 문 축에 붙은 피동 기어.
let gearRoot=new THREE.Group();hospital.add(gearRoot);let driverGear,drivenGear;
function gear(radius,teeth,material){
 const group=new THREE.Group();cyl(group,radius*.82,.14,material,0,0,0,48);
 for(let i=0;i<teeth;i++){
  const a=i*2*Math.PI/teeth,t=box(group,radius*.23,.16,radius*.24,material,Math.cos(a)*radius*.86,0,Math.sin(a)*radius*.86);
  t.rotation.y=-a;
 }
 for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(group,radius*.085,.026,M.black,Math.cos(a)*radius*.48,.088,Math.sin(a)*radius*.48,14)}
 cyl(group,radius*.18,.20,M.black,0,.10,0,24);return group;
}
function setGears(preset){
 hospital.remove(gearRoot);gearRoot.traverse(o=>o.geometry?.dispose());gearRoot=new THREE.Group();hospital.add(gearRoot);
 const p=CTMDoorModel.presets[preset],driverRadius=p.driver*.056,followerRadius=p.follower*.056;
 driverGear=gear(driverRadius,p.driver,preset==='slow'?M.purple:M.cyan);
 drivenGear=gear(followerRadius,p.follower,preset==='fast'?M.purple:M.cyan);
 const x=-.45-(driverRadius+followerRadius)*.99;
 driverGear.position.set(x,1.83,.30);drivenGear.position.set(-.45,1.83,.30);
 gearRoot.add(driverGear,drivenGear);
 cyl(driverGear,.15,.35,M.black,0,.29,0);
 box(driverGear,.08,.16,.38,M.gray,.19,.34,0);
 cyl(driverGear,.12,.07,M.black,.19,.43,.17,20);
}
const cams={front:{pos:[0,2.3,7],target:[0,.8,0]},angle:{pos:[5,3.5,6.6],target:[0,.8,0]},top:{pos:[0,8,1.5],target:[0,.7,0]}};
function cameraTo(name){const p=cams[name]||cams.angle;camera.position.set(...p.pos);controls.target.set(...p.target);controls.update();document.querySelectorAll('[data-cam]').forEach(b=>b.classList.toggle('on',b.dataset.cam===name))}
document.querySelectorAll('[data-cam]').forEach(b=>b.onclick=()=>cameraTo(b.dataset.cam));cameraTo('angle');
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,startX=0,startTurns=0;
canvas.addEventListener('pointerdown',event=>{
 const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
 if(!driverGear||!raycaster.intersectObject(driverGear,true).length)return;
 dragging=true;startX=event.clientX;startTurns=window.CTMDoorState().turns;controls.enabled=false;canvas.setPointerCapture(event.pointerId);event.preventDefault();
});
canvas.addEventListener('pointermove',event=>{if(dragging)window.CTMSetDoorTurns(startTurns+(event.clientX-startX)/240)});
function endDrag(event){if(!dragging)return;dragging=false;controls.enabled=true;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId)}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
let previousPreset='',last=performance.now();
window.CTMDoor3D=()=>({doorAngle:door.rotation.y,driverAngle:driverGear.rotation.y,followerAngle:drivenGear.rotation.y,driverX:driverGear.position.x});
function tick(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;const s=window.CTMDoorState();
 if(s.preset!==previousPreset){previousPreset=s.preset;setGears(s.preset)}
 const sign=s.direction==='cw'?-1:1;
 driverGear.rotation.y+=((sign*s.turns*Math.PI*2)-driverGear.rotation.y)*Math.min(1,dt*10);
 drivenGear.rotation.y+=((-sign*s.outputTurns*Math.PI*2)-drivenGear.rotation.y)*Math.min(1,dt*10);
 door.rotation.y+=((-sign*s.doorAngle*Math.PI/180)-door.rotation.y)*Math.min(1,dt*8);
 controls.update();fitStage(renderer,camera,stage);renderer.render(scene,camera);requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

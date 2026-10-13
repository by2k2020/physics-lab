/* 활성 PT 12·25쪽 사진의 보이는 모형을 교육용으로 재구성. 숨은 연결·실제 치수는 미검증. */
import * as THREE from '../vendor/three.module.js';
import {makeRenderer,fitStage,makeCamera} from '../vendor/ctm-3d.js';
const stage=document.querySelector('.stage'),canvas=document.createElement('canvas');
canvas.setAttribute('aria-label','보라색 기어와 녹색 X자 링크가 연결된 조절식 침대 3D 가상 모형');stage.prepend(canvas);
const renderer=makeRenderer(canvas);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xdce3e9);
const {camera,controls}=makeCamera(canvas,{fov:40,minD:3,maxD:22,far:100});
scene.add(new THREE.HemisphereLight(0xffffff,0xb8c7d5,1.55));
const light=new THREE.DirectionalLight(0xfff4e3,2);light.position.set(-4,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.45});
const M={white:mat(0xf7f8f5),blue:mat(0x087bb2),cyan:mat(0x00afd3),green:mat(0x39a640),lime:mat(0x73c833),purple:mat(0x49318c),red:mat(0xcc2f32),yellow:mat(0xf5d219),black:mat(0x18222c),gray:mat(0x858b91),dog:mat(0x9b8a75),table:mat(0xe4e2dc)};
function mesh(parent,geometry,material,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const box=(p,w,h,d,m,x=0,y=0,z=0)=>mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
const cyl=(p,r,h,m,x=0,y=0,z=0,n=32)=>mesh(p,new THREE.CylinderGeometry(r,r,h,n),m,x,y,z);
const table=box(scene,30,.15,22,M.table,0,-.35,0);table.castShadow=false;
const model=new THREE.Group();scene.add(model);
box(model,5.4,.1,2.7,M.white,0,-.08,0);
for(let ix=-13;ix<=13;ix++)for(let iz=-6;iz<=6;iz++)cyl(model,.07,.028,M.white,ix*.2,-.014,iz*.2,12);
// 왼쪽 파란 침대판은 녹색 X자 링크 두 개에 매달려 있다.
const bed=new THREE.Group();model.add(bed);
box(bed,2.2,.13,1.16,M.blue,-1.0,0,0);
for(let ix=-5;ix<=5;ix++)for(let iz=-2;iz<=2;iz++)cyl(bed,.075,.035,M.blue,-1+ix*.19,.085,iz*.2,14);
// PT 속 강아지 몰리의 위치를 보여 주는 단순 브릭 모형.
const dog=new THREE.Group();dog.position.set(-1.0,.17,0);bed.add(dog);
box(dog,.53,.21,.23,M.dog,0,.1,0);box(dog,.19,.22,.18,M.dog,-.33,.18,0);
for(const x of [-.17,.17])for(const z of [-.07,.07])box(dog,.075,.2,.07,M.dog,x,-.05,z);
box(dog,.12,.12,.12,M.black,-.44,.16,0);
for(const x of [-.2,.22]){const eye=cyl(dog,.045,.025,M.black,x,.27,.13,14);eye.rotation.x=Math.PI/2}
function link(material,z){const bar=box(model,1.56,.12,.13,material,-1,.52,z);for(const x of [-.7,0,.7]){const pin=cyl(bar,.075,.025,M.black,x,0,.075,14);pin.rotation.x=Math.PI/2}return bar}
const linkA=link(M.green,-.29),linkB=link(M.lime,-.07);
// 아래쪽 랙은 기어의 회전과 같은 단계로 옆으로 움직인다.
const rack=new THREE.Group();model.add(rack);box(rack,1.5,.14,.24,M.green,-1.1,.21,.57);
for(let i=0;i<10;i++)box(rack,.09,.075,.20,M.lime,-1.78+i*.15,.32,.57);
const gear=new THREE.Group();gear.position.set(-1.50,.47,.77);model.add(gear);
const gearFace=cyl(gear,.31,.15,M.purple);gearFace.rotation.x=Math.PI/2;
for(let i=0;i<10;i++){const a=i*2*Math.PI/10,t=box(gear,.13,.16,.16,M.purple,Math.cos(a)*.30,Math.sin(a)*.30,0);t.rotation.z=a}
const axle=cyl(gear,.12,.22,M.black,0,0,.12);axle.rotation.x=Math.PI/2;
box(gear,.08,.38,.09,M.purple,0,.14,.20);const grip=cyl(gear,.11,.11,M.black,0,.31,.20);grip.rotation.x=Math.PI/2;
const pawl=new THREE.Group();pawl.position.set(-1.05,.78,.91);model.add(pawl);
box(pawl,.52,.09,.16,M.red,-.2,0,0).rotation.z=-.45;
cyl(pawl,.11,.12,M.black,0,0,.08);
// 오른쪽 별도 검사대와 스캐너는 PT 사진에 보이는 범위만 나타낸다.
box(model,1.45,.70,.95,M.yellow,1.55,.37,0);
box(model,1.85,.12,1.22,M.blue,1.55,.79,0);
for(let x=.8;x<2.3;x+=.2)for(const z of [-.38,-.16,.06,.28])cyl(model,.065,.035,M.blue,x,.87,z,12);
const scanner=new THREE.Group();scanner.position.set(1.14,1.12,.15);model.add(scanner);
box(scanner,.14,.60,.18,M.gray,0,0,0);box(scanner,.36,.46,.16,M.red,.12,.27,0);
box(scanner,.32,.12,.33,M.black,.17,.48,0);
const cams={front:{pos:[0,2.25,7.4],target:[0,.85,0]},angle:{pos:[4.4,3.1,6.7],target:[0,.85,0]},top:{pos:[0,8,2],target:[0,.5,0]}};
function cameraTo(name){const p=cams[name]||cams.angle;camera.position.set(...p.pos);controls.target.set(...p.target);controls.update();document.querySelectorAll('[data-cam]').forEach(b=>b.classList.toggle('on',b.dataset.cam===name))}
document.querySelectorAll('[data-cam]').forEach(b=>b.onclick=()=>cameraTo(b.dataset.cam));cameraTo('angle');
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,startY=0,startLevel=0;
canvas.addEventListener('pointerdown',event=>{
 const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
 if(!raycaster.intersectObject(gear,true).length)return;
 dragging=true;startY=event.clientY;startLevel=window.CTMBedState().level;controls.enabled=false;canvas.setPointerCapture(event.pointerId);event.preventDefault();
});
canvas.addEventListener('pointermove',event=>{if(dragging)window.CTMSetBedLevel(startLevel+Math.round((startY-event.clientY)/20))});
function endDrag(event){if(!dragging)return;dragging=false;controls.enabled=true;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId)}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
let last=performance.now(),drawLift=CTMBedModel.state(3,false).lift,drawRack=.33,drawGear=0,drawScanner=0;
window.CTMBed3D=()=>({bedY:bed.position.y,linkAngle:linkA.rotation.z,rackX:rack.position.x,gearAngle:gear.rotation.z,pawlVisible:pawl.visible,scannerX:scanner.position.x});
function tick(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;const s=window.CTMBedState(),a=Math.min(1,dt*7);
 drawLift+=(s.lift-drawLift)*a;drawRack+=(s.rack-drawRack)*a;drawGear+=(s.gearTurns*2*Math.PI-drawGear)*a;drawScanner+=(s.scanner*.065-drawScanner)*a;
 const span=Math.sqrt(1.56**2-drawLift**2),angle=Math.atan2(drawLift,span);
 bed.position.y=.24+drawLift;
 for(const [bar,sign] of [[linkA,1],[linkB,-1]]){bar.position.set(-1,.24+drawLift/2,bar===linkA?-.29:-.07);bar.rotation.z=sign*angle}
 rack.position.x=drawRack;gear.rotation.z=drawGear;pawl.visible=s.locked;scanner.position.x=1.14+drawScanner;
 controls.update();if(fitStage(renderer,camera,stage))renderer.render(scene,camera);requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

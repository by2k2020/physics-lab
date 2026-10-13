/* 활성 PT 15·24·27–29쪽 사진을 바탕으로 한 교육용 3D 재구성. 실제 치수·숨은 연결은 미확인. */
import * as THREE from '../vendor/three.module.js';
import {makeRenderer,fitStage,makeCamera} from '../vendor/ctm-3d.js';
const stage=document.querySelector('.stage'),canvas=document.createElement('canvas');canvas.setAttribute('aria-label','캠과 팔로어로 움직이는 토끼 및 애완동물 3D 모형');stage.prepend(canvas);
const renderer=makeRenderer(canvas);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xdce3e9);const {camera,controls}=makeCamera(canvas,{fov:40,minD:3,maxD:20,far:100});
scene.add(new THREE.HemisphereLight(0xffffff,0xb8c7d5,1.5));const light=new THREE.DirectionalLight(0xfff4e3,2);light.position.set(-4,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.44});
const M={white:mat(0xf7f8f6),blue:mat(0x087fba),green:mat(0x45b343),lime:mat(0x8ccf29),red:mat(0xd83c2e),yellow:mat(0xf4c820),purple:mat(0x51338d),black:mat(0x182128),gray:mat(0x8d99a0),rabbit:mat(0xe9e5da),table:mat(0xe4e1db)};
function mesh(p,g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
const box=(p,w,h,d,m,x=0,y=0,z=0)=>mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
const cyl=(p,r,h,m,x=0,y=0,z=0,n=32)=>mesh(p,new THREE.CylinderGeometry(r,r,h,n),m,x,y,z);
const table=box(scene,30,.16,20,M.table,0,-.35,0);table.castShadow=false;
function studs(p,width,depth,y,color){for(let x=-width/2+.12;x<width/2;x+=.22)for(let z=-depth/2+.12;z<depth/2;z+=.22)cyl(p,.07,.03,color,x,y,z,12)}
function gear(parent,r,teeth,color,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const disc=cyl(g,r*.8,.15,color);disc.rotation.x=Math.PI/2;for(let i=0;i<teeth;i++){const a=i*Math.PI*2/teeth,b=box(g,r*.24,r*.22,.16,color,Math.cos(a)*r*.86,Math.sin(a)*r*.86,0);b.rotation.z=a}const hub=cyl(g,r*.21,.2,M.black,0,0,.11);hub.rotation.x=Math.PI/2;return g}
// PT 15쪽의 파란 U형 도입 조립: 손잡이·캠·녹색 판 위 토끼.
const rabbitRoot=new THREE.Group();scene.add(rabbitRoot);
box(rabbitRoot,3.7,.12,2.0,M.blue,0,-.06,0);studs(rabbitRoot,3.7,2,.02,M.blue);
for(const x of [-1.48,1.48]){box(rabbitRoot,.27,1.18,.31,M.yellow,x,.62,-.45);box(rabbitRoot,.30,.35,.38,M.red,x,.21,-.45)}
box(rabbitRoot,3.35,.16,.38,M.blue,0,1.28,-.45);
const rabbitPlate=new THREE.Group();rabbitRoot.add(rabbitPlate);box(rabbitPlate,2.3,.13,.86,M.green,0,0,.26);studs(rabbitPlate,2.3,.86,.08,M.green);
const rabbit=new THREE.Group();rabbit.position.set(.4,.16,.25);rabbitPlate.add(rabbit);
box(rabbit,.42,.28,.28,M.rabbit,0,.12,0);const head=box(rabbit,.23,.26,.23,M.rabbit,.29,.25,0);
for(const z of [-.08,.08])box(rabbit,.07,.29,.08,M.rabbit,.31,.49,z);
box(rabbit,.10,.10,.10,M.black,.43,.23,0);
const rabbitCam=gear(rabbitRoot,.37,10,M.purple,-.1,.51,.81);
const rabbitHandle=cyl(rabbitRoot,.14,.55,M.green,-.92,.53,.79);rabbitHandle.rotation.z=Math.PI/2;
const rabbitFollower=cyl(rabbitRoot,.07,.72,M.gray,-.1,.99,.25);
// PT 24쪽의 검정 몸통·빨간 윗판·눈 달린 본 모형과 3개 기어.
const petRoot=new THREE.Group();scene.add(petRoot);
box(petRoot,2.85,.12,2.05,M.white,0,-.06,0);studs(petRoot,2.85,2.05,.02,M.white);
box(petRoot,1.45,1.55,.68,M.black,.13,.89,-.18);box(petRoot,1.8,.25,.83,M.red,.13,1.68,-.18);
box(petRoot,.42,.38,.71,M.yellow,1.05,.44,.19);box(petRoot,.45,.36,.55,M.purple,-.95,.22,.15);
const petHead=new THREE.Group();petHead.position.set(.13,1.79,-.16);petRoot.add(petHead);
box(petHead,.55,.40,.42,M.lime,0,.18,0);box(petHead,.92,.15,.52,M.blue,0,.45,.03);
for(const x of [-.36,.36]){cyl(petHead,.17,.26,M.black,x,.68,.04);const eye=cyl(petHead,.13,.05,M.white,x,.24,.23);eye.rotation.x=Math.PI/2;const pupil=cyl(petHead,.07,.055,M.black,x,.24,.27);pupil.rotation.x=Math.PI/2}
const petFollower=cyl(petRoot,.07,.72,M.gray,.13,1.72,.48);
const petDriver=gear(petRoot,.28,8,M.yellow,-.75,.35,.72);
const petMid=gear(petRoot,.43,12,M.gray,.02,.35,.73);
const petOutput=gear(petRoot,.27,8,M.yellow,.75,.35,.74);
box(petDriver,.08,.33,.09,M.green,0,.23,.2);
const petCam=gear(petRoot,.26,9,M.purple,.75,.35,.56);
const cams={front:{pos:[0,2.2,6.7],target:[0,.85,0]},angle:{pos:[3.9,2.9,6.0],target:[0,.8,0]},side:{pos:[5.5,2.4,1.5],target:[0,.85,0]}};
function cameraTo(name){const p=cams[name]||cams.angle;camera.position.set(...p.pos);controls.target.set(...p.target);controls.update();document.querySelectorAll('[data-cam]').forEach(b=>b.classList.toggle('on',b.dataset.cam===name))}
document.querySelectorAll('[data-cam]').forEach(b=>b.onclick=()=>cameraTo(b.dataset.cam));cameraTo('angle');
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragging=false,startX=0,startTurns=1;
canvas.addEventListener('pointerdown',event=>{const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const handle=window.CTMPetState().model==='rabbit'?rabbitHandle:petDriver;if(!raycaster.intersectObject(handle,true).length)return;dragging=true;startX=event.clientX;startTurns=window.CTMPetState().turns;controls.enabled=false;canvas.setPointerCapture(event.pointerId);event.preventDefault()});
canvas.addEventListener('pointermove',event=>{if(dragging)window.CTMSetPetTurns(startTurns+(event.clientX-startX)/100)});
function endDrag(event){if(!dragging)return;dragging=false;controls.enabled=true;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId)}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
let drawJump=0,drawProgress=0,last=performance.now();
window.CTMPet3D=()=>({rabbitVisible:rabbitRoot.visible,petVisible:petRoot.visible,jumpY:window.CTMPetState().model==='rabbit'?rabbitPlate.position.y:petHead.position.y-1.79,camAngle:window.CTMPetState().model==='rabbit'?rabbitCam.rotation.z:petCam.rotation.z,driverAngle:petDriver.rotation.z});
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;const s=window.CTMPetState();rabbitRoot.visible=s.model==='rabbit';petRoot.visible=s.model==='pet';
 drawProgress+=(s.progress-drawProgress)*Math.min(1,dt*11);
 const lift=(1-Math.cos(drawProgress*s.jumpsPerTurn*Math.PI*2))*.5*s.height*.42;
 drawJump+=(lift-drawJump)*Math.min(1,dt*15);
 rabbitPlate.position.y=1.48+drawJump;petHead.position.y=1.79+drawJump;
 rabbitCam.scale.set(s.wheel==='large'?1:.72,s.wheel==='large'?1:.72,1);petCam.scale.set(s.wheel==='large'?1:.72,s.wheel==='large'?1:.72,1);
 rabbitCam.rotation.z=-drawProgress*s.jumpsPerTurn*Math.PI*2;petCam.rotation.z=-drawProgress*Math.PI*2;
 petDriver.rotation.z=drawProgress*Math.PI*2;petMid.rotation.z=-drawProgress*.67*Math.PI*2;petOutput.rotation.z=drawProgress*Math.PI*2;
 rabbitFollower.position.y=.99+drawJump;petFollower.position.y=1.72+drawJump;
 controls.update();if(fitStage(renderer,camera,canvas))renderer.render(scene,camera);requestAnimationFrame(tick)}requestAnimationFrame(tick);

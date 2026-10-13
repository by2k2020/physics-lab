/* 브릭큐 에센셜 21차시: 활성 PT 20–25쪽의 사진을 바탕으로 만든 교실용 3D 재구성.
   보이지 않는 뒤쪽 연결·마찰 계수·실물 성능은 추정하지 않는다. */
import * as THREE from '../vendor/three.module.js';
import {makeRenderer,fitStage,makeCamera} from '../vendor/ctm-3d.js';

const $=id=>document.getElementById(id);
const canvas=document.createElement('canvas');
canvas.className='scene-canvas';
canvas.setAttribute('aria-label','PPT 사진을 바탕으로 재구성한 집게 3D 모형. 드래그하여 돌리고 휠 또는 손가락으로 확대할 수 있습니다.');
let renderer;
try{renderer=makeRenderer(canvas)}catch(error){console.warn('3D 장면을 열지 못했습니다.',error);throw error}
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xdfe3e8);
const {camera,controls}=makeCamera(canvas,{fov:40,minD:3,maxD:22,far:100});
controls.target.set(0,0.15,0);
camera.position.set(4.3,2.4,7.8);
controls.update();
scene.add(new THREE.HemisphereLight(0xffffff,0xc6d0dc,1.45));
const key=new THREE.DirectionalLight(0xfff3db,2.0);
key.position.set(-3,7,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;
scene.add(key);
const fill=new THREE.DirectionalLight(0xd7e9ff,.8);fill.position.set(5,3,-3);scene.add(fill);

const mat=(color,roughness=.43,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={white:mat(0xf5f4f1,.58),edge:mat(0xd7dde2,.55),hole:mat(0x25323a,.86),lime:mat(0xb3e52a,.34),green:mat(0x2f9a59,.43),cyan:mat(0x1bbde3,.34),yellow:mat(0xf3c221,.4),purple:mat(0x453190,.4),black:mat(0x141a1d,.7),red:mat(0xd64235,.42),gray:mat(0x858f9b,.58),desk:mat(0xe8e3da,.75),blue:mat(0x4a83bb,.48)};
const mesh=(geo,m,parent,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const box=(parent,w,h,d,m,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);
const cyl=(parent,r,h,m,x=0,y=0,z=0,n=32)=>mesh(new THREE.CylinderGeometry(r,r,h,n),m,parent,x,y,z);
const faceDisc=(parent,r,depth,m,x,y,z,n=40)=>{const o=cyl(parent,r,depth,m,x,y,z,n);o.rotation.x=Math.PI/2;return o};

// 프로펠러 자동차처럼 밝은 교실 탁자 위에 그림자와 플라스틱 표면을 준다.
const tileCanvas=document.createElement('canvas');tileCanvas.width=tileCanvas.height=512;
const tileContext=tileCanvas.getContext('2d');tileContext.fillStyle='#e9e6df';tileContext.fillRect(0,0,512,512);
tileContext.strokeStyle='#cbc8c1';tileContext.lineWidth=2;
for(let n=0;n<=512;n+=64){tileContext.beginPath();tileContext.moveTo(n,0);tileContext.lineTo(n,512);tileContext.moveTo(0,n);tileContext.lineTo(512,n);tileContext.stroke()}
const tileTexture=new THREE.CanvasTexture(tileCanvas);tileTexture.colorSpace=THREE.SRGBColorSpace;
tileTexture.wrapS=tileTexture.wrapT=THREE.RepeatWrapping;tileTexture.repeat.set(2,2);
const table=box(scene,30,.18,22,new THREE.MeshStandardMaterial({map:tileTexture,roughness:.78}),0,-2.56,0);
table.castShadow=false;
const board=box(scene,2.7,3.9,.16,M.white,0,.35,-.35);
box(scene,2.82,.08,.24,M.edge,0,2.33,-.35);
const model=new THREE.Group();scene.add(model);
model.add(board);
// 흰 기술 판의 관통 구멍. 앞면에 어두운 홈과 얇은 밝은 테두리를 겹쳐 표현한다.
for(let col=0;col<7;col++)for(let row=0;row<10;row++){
 const x=-1.12+col*.375,y=-1.35+row*.375;
 faceDisc(model,.105,.014,M.edge,x,y,-.252,16);
 faceDisc(model,.072,.017,M.hole,x,y,-.237,16);
}
// 좌우 노란/파란 연결 블록과 보라색 축 지지대.
for(const side of [-1,1]){
 box(model,.32,.72,.34,M.cyan,side*1.23,-.02,.12);
 box(model,.34,.47,.37,M.yellow,side*1.23,-.31,.3);
 for(let i=0;i<2;i++)faceDisc(model,.074,.026,M.hole,side*1.23,-.17-i*.2,.51,18);
 box(model,.28,.7,.32,M.purple,side*.78,-.58,.08);
}
box(model,.23,2.6,.2,M.purple,0,.65,.02);
box(model,.36,.7,.32,M.purple,0,1.56,.34);

function gear(radius,teeth,color,dotCount){
 const group=new THREE.Group();
 faceDisc(group,radius*.84,.19,color,0,0,0,44);
 for(let i=0;i<teeth;i++){
  const a=i*Math.PI*2/teeth;
  const t=box(group,radius*.22,radius*.26,.21,color,Math.cos(a)*radius*.85,Math.sin(a)*radius*.85,0);
  t.rotation.z=a-Math.PI/2;
 }
 for(let i=0;i<dotCount;i++){
  const a=i*Math.PI*2/dotCount;
  faceDisc(group,radius*.07,.018,M.hole,Math.cos(a)*radius*.53,Math.sin(a)*radius*.53,.111,14);
 }
 faceDisc(group,radius*.24,.05,M.purple,0,0,.14,24);
 box(group,radius*.21,radius*.4,.06,M.purple,0,0,.18);
 return group;
}
const greenGear=gear(.8,12,M.lime,12);greenGear.position.set(0,1.42,.24);model.add(greenGear);
const blueGear=gear(.54,10,M.cyan,8);blueGear.position.set(0,.16,.32);model.add(blueGear);
const auxGears=new THREE.Group();model.add(auxGears);
const third=gear(.27,8,M.purple,4);third.position.set(-.8,.16,.34);auxGears.add(third);
const fourth=gear(.27,8,M.purple,4);fourth.position.set(-.8,-.38,.34);auxGears.add(fourth);

// 사진에 보이는 긴 녹색 테크닉 팔, 앞쪽 구멍, 검정 원형 축 마개.
function arm(side){
 const pivot=new THREE.Group();pivot.position.set(side*.43,-.63,.59);model.add(pivot);
 box(pivot,.34,1.83,.23,M.green,0,-.92,.03);
 faceDisc(pivot,.19,.08,M.green,0,-1.84,.04);
 for(let i=0;i<7;i++)faceDisc(pivot,.095,.025,M.hole,0,-.36-i*.22,.162,16);
 faceDisc(pivot,.25,.15,M.black,0,0,.18,32);
 faceDisc(pivot,.085,.17,M.hole,0,0,.28,20);
 box(pivot,.36,.17,.3,M.black,0,-1.77,.12);
 const pad=box(pivot,.16,.52,.12,M.black,side*.14,-1.51,.2);
 pad.visible=false;
 return {pivot,pad};
}
const left=arm(-1),right=arm(1);
const leftArm=left.pivot,rightArm=right.pivot;
// PPT 30쪽의 받침점 관계를 보이기 위한 반투명 표식. 실제 연결 위치 이동 모델은 아니다.
const pivotMarker=faceDisc(model,.14,.06,mat(0xffa53d,.4),0,-.64,1.02,24);
pivotMarker.visible=false;

// 교실 미션의 출발/도착 영역. 이 영역과 물체 이동은 시각화이며 실물 성공 판정이 아니다.
const trays=new THREE.Group();scene.add(trays);
function tray(x,m){
 const g=new THREE.Group();g.position.set(x,-2.34,.45);trays.add(g);
 box(g,1.55,.12,1.2,m,0,0,0);
 box(g,1.55,.18,.08,m,0,.12,-.56);box(g,1.55,.18,.08,m,0,.12,.56);
 box(g,.08,.18,1.2,m,-.75,.12,0);box(g,.08,.18,1.2,m,.75,.12,0);
}
tray(-1.55,M.blue);tray(1.55,M.green);
let piece;
function makePiece(type){
 if(piece){scene.remove(piece);piece.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 piece=new THREE.Group();scene.add(piece);
 if(type==='wheel'){
  const w=faceDisc(piece,.31,.19,M.yellow,0,0,0,32);w.rotation.x=0;
  cyl(piece,.12,.21,M.hole,0,.03,0,20);
 }else if(type==='brick'){
  box(piece,.52,.18,.31,M.red);
  for(const x of [-.16,0,.16])for(const z of [-.09,.09])cyl(piece,.055,.045,M.red,x,.12,z,12);
 }else if(type==='gear'){
  const g=gear(.29,8,M.gray,4);g.rotation.x=-Math.PI/2;piece.add(g);
 }else{
  const rod=cyl(piece,.07,.72,M.red);rod.rotation.z=Math.PI/2;
  cyl(piece,.12,.1,M.black,-.31,0,0,16).rotation.z=Math.PI/2;
 }
 piece.position.set(-1.55,-2.12,.85);
}

const presets={front:{pos:[0,1.65,8.6],target:[0,.0,0]},angle:{pos:[4.3,2.4,7.8],target:[0,.0,0]},side:{pos:[6.5,1.7,2.4],target:[0,.0,0]}};
function cameraTo(name){const p=presets[name]||presets.angle;camera.position.set(...p.pos);controls.target.set(...p.target);controls.update();document.querySelectorAll('[data-cam]').forEach(b=>b.classList.toggle('on',b.dataset.cam===name))}
for(const sec of document.querySelectorAll('.sim-shell')){
 const art=sec.querySelector('.scene-art');
 const bar=document.createElement('div');bar.className='cam-row';bar.innerHTML='<button data-cam="front">정면</button><button data-cam="angle" class="on">입체</button><button data-cam="side">측면</button>';
 for(const button of bar.querySelectorAll('button'))button.onclick=()=>cameraTo(button.dataset.cam);
 art.append(bar);
 const hint=document.createElement('div');hint.className='hint3d';hint.textContent='드래그: 회전 · 휠/핀치: 확대';art.append(hint);
}
document.querySelector('#gears .scene-art').prepend(canvas);
makePiece('wheel');
cameraTo('angle');
document.documentElement.classList.add('three-ready');
// PT 사진에서 보이는 녹색 입력 기어는 손가락/마우스로 끌어 집게를 개폐할 수 있다.
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
let dragGear=false,dragY=0,dragOpening=100;
canvas.addEventListener('pointerdown',event=>{
 if(window.CTMGrabberSceneState?.().tab!=='gears')return;
 const rect=canvas.getBoundingClientRect();
 pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
 raycaster.setFromCamera(pointer,camera);
 if(!raycaster.intersectObject(greenGear,true).length)return;
 dragGear=true;dragY=event.clientY;dragOpening=Number($('jawInput').value);
 controls.enabled=false;canvas.setPointerCapture(event.pointerId);event.preventDefault();
});
canvas.addEventListener('pointermove',event=>{
 if(!dragGear)return;
 const next=Math.max(0,Math.min(100,dragOpening+(dragY-event.clientY)*.65));
 $('jawInput').value=String(Math.round(next));$('jawInput').dispatchEvent(new Event('input'));
});
function finishDrag(event){if(!dragGear)return;dragGear=false;controls.enabled=true;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId)}
canvas.addEventListener('pointerup',finishDrag);canvas.addEventListener('pointercancel',finishDrag);
let previousTab='gears',previousObject='wheel',jawAngle=.43,last=performance.now();
window.CTMGrabber3D=()=>{
 const point=greenGear.getWorldPosition(new THREE.Vector3()).project(camera),r=canvas.getBoundingClientRect();
 return {jawAngle,modelX:model.position.x,pieceX:piece.position.x,pieceY:piece.position.y,inputGearAngle:greenGear.rotation.z,padVisible:left.pad.visible,gearX:r.left+(point.x+1)*r.width/2,gearY:r.top+(1-point.y)*r.height/2};
};
function tick(now){
 if(!document.querySelector('.sim-shell'))return;
 const dt=Math.min(.05,(now-last)/1000);last=now;
 const state=window.CTMGrabberSceneState?.();
 if(state){
  if(state.tab!==previousTab){
   previousTab=state.tab;
   document.querySelector('#'+state.tab+' .scene-art').prepend(canvas);
   cameraTo(state.tab==='lever'?'front':'angle');
   model.position.x=state.tab==='transfer'?-1.55:0;
  }
  if(state.object!==previousObject){previousObject=state.object;makePiece(state.object)}
  const closed=['gripping','held','moving','moved'].includes(state.phase);
  const targetJaw=state.tab==='gears' ? -.08+state.opening*.51 : closed?-.08:.43;
  jawAngle+=(targetJaw-jawAngle)*Math.min(1,dt*4.2);
  const inputAngle=(state.direction==='cw'?-1:1)*(.43-jawAngle)*1.5;
  greenGear.rotation.z=inputAngle;
  blueGear.rotation.z=-inputAngle*1.48;
  third.rotation.z=inputAngle*2.2;
  fourth.rotation.z=-inputAngle*2.2;
  auxGears.visible=state.tab==='gears';
  trays.visible=state.tab==='transfer';piece.visible=state.tab==='transfer';
  pivotMarker.visible=state.tab==='lever';
  pivotMarker.position.y=-1.16+(state.pivot-1)*.25;
  left.pad.visible=right.pad.visible=state.surface==='pad';
  const slipped=['slipping','slipped'].includes(state.phase);
  const atDestination=['moving','moved','releasing'].includes(state.phase)&&!state.willSlip;
  const targetX=state.tab==='transfer'?(slipped||state.phase==='moving'&&state.willSlip?0:atDestination?1.55:-1.55):0;
  model.position.x+=(targetX-model.position.x)*Math.min(1,dt*5);
  leftArm.rotation.z=-jawAngle;
  rightArm.rotation.z=jawAngle;
  if(state.tab==='transfer'){
   const attached=closed;
   const px=attached?model.position.x:(slipped?0:atDestination||state.landed?1.55:-1.55);
   const py=attached?-1.89:-2.12;
   piece.position.x+=(px-piece.position.x)*Math.min(1,dt*9);
   piece.position.y+=(py-piece.position.y)*Math.min(1,dt*5);
   piece.position.z=.85;
  }
 }
 controls.update();
 const stage=canvas.parentElement;
 if(stage&&fitStage(renderer,camera,stage))renderer.render(scene,camera);
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

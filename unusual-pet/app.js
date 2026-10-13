(()=>{'use strict';
const $=id=>document.getElementById(id),lessonId='ppt-9767e447ed3ffc86347d5b01e95ca221',materialVersion='1766714252000';
let model='rabbit',wheel='large',turns=1,progress=0,running=false,complete=false,latest=null,saved=false,last=performance.now();
const history=[];
window.CTMPetState=()=>({model,wheel,turns,progress,running,complete,...CTMPetModel.outcome(model,wheel,turns)});
function render(){
 const o=CTMPetModel.outcome(model,wheel,turns);
 document.querySelectorAll('[data-model]').forEach(b=>b.classList.toggle('on',b.dataset.model===model));
 document.querySelectorAll('[data-wheel]').forEach(b=>b.classList.toggle('on',b.dataset.wheel===wheel));
 $('turns').value=String(turns);$('inputTurns').textContent=turns+' 회전';$('jumps').textContent=o.jumps+' 회';
 $('height').textContent=wheel==='large'?'높음':'낮음';
 $('motion').textContent=running?'움직이는 중':complete?'관찰 완료':'대기';
 $('modelNote').textContent=model==='rabbit'?'PT 도입 토끼: 손잡이 1회전에 2번 점프합니다.':'PT 본 모형: 손잡이 1회전에 1번 움직입니다.';
 $('run').disabled=running;$('record').disabled=!complete||running;$('save').disabled=!latest||saved;
}
function reset(){running=false;complete=false;progress=0;latest=null;saved=false;$('feedback').textContent='';render()}
document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{model=b.dataset.model;reset()});
document.querySelectorAll('[data-wheel]').forEach(b=>b.onclick=()=>{wheel=b.dataset.wheel;reset()});
$('turns').oninput=()=>{turns=Number($('turns').value);reset()};
for(const [id,step] of [['minus',-1],['plus',1]])$(id).onclick=()=>{turns=Math.max(1,Math.min(3,turns+step));reset()};
window.CTMSetPetTurns=value=>{turns=Math.max(1,Math.min(3,Math.round(value)));reset()};
$('run').onclick=()=>{progress=0;running=true;complete=false;latest=null;saved=false;$('feedback').textContent='기어가 캠을 돌리고 팔로어가 위아래로 움직입니다.';render()};
function tick(now){const dt=Math.min(.08,(now-last)/1000);last=now;if(running){progress=Math.min(turns,progress+dt*.8);if(progress>=turns){running=false;complete=true;$('feedback').textContent='관찰이 끝났습니다. 바퀴 크기와 모형을 바꿔 다시 비교해 보세요.';render()}}requestAnimationFrame(tick)}requestAnimationFrame(tick);
$('record').onclick=()=>{
 if(!complete)return;const o=CTMPetModel.outcome(model,wheel,turns);
 latest={trialId:crypto.randomUUID(),model,wheel,turns,measured:o.jumps};saved=false;
 history.push(`${model==='rabbit'?'도입 토끼':'본 애완동물'} · ${wheel==='large'?'큰':'작은'} 바퀴 · 손잡이 ${turns}회전 → 점프 ${o.jumps}회 · 높이 ${wheel==='large'?'높음':'낮음'}`);
 $('history').replaceChildren();for(const line of history.slice(-5).reverse()){const p=document.createElement('p');p.textContent=line;$('history').append(p)}
 $('feedback').textContent='가상 결과를 비교표에 추가했습니다.';render();
};
$('save').onclick=()=>{
 if(!latest||saved)return;if(parent===window){$('feedback').textContent='학생 수업 화면에서 열면 결과를 저장할 수 있습니다.';return}
 parent.postMessage({type:'ctm.simulation.result.v1',lessonId,materialVersion,experimentId:'bqe03-pet',modelVersion:'bqe03-pet-1',presetVersion:1,mode:'simulation',unit:'회(가상)',condition:`${latest.model==='rabbit'?'도입 토끼':'본 애완동물'} · ${latest.wheel==='large'?'큰':'작은'} 바퀴 · 손잡이 ${latest.turns}회전`,...latest},location.origin);
};
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='ctm.simulation.saved.v1'||event.data.trialId!==latest?.trialId)return;saved=!!event.data.ok;render();$('feedback').textContent=saved?'학생 기록에 가상 결과를 저장했습니다.':'저장되지 않았습니다: '+String(event.data.error||'수업 화면을 확인하세요.')});
render();
})();

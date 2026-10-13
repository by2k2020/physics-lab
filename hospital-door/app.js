(()=>{'use strict';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const lessonId='ppt-140a2a64bf0772a630e77ca8b50a62a4',materialVersion='1764814952000';
let preset='equal',direction='cw',turns=0,latest=null,saved=false;
const history=[];
function outcome(){return CTMDoorModel.outcome(preset,turns,direction)}
window.CTMDoorState=()=>({preset,direction,turns,...outcome()});
function render(){
 const o=outcome(),p=CTMDoorModel.presets[preset];
 document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('on',b.dataset.preset===preset));
 document.querySelectorAll('[data-dir]').forEach(b=>b.classList.toggle('on',b.dataset.dir===direction));
 $('turns').value=String(turns);
 $('driver').textContent=turns.toFixed(2)+' 회전';
 $('follower').textContent=o.outputTurns.toFixed(2)+' 회전';
 $('direction').textContent=o.outputDirection==='cw'?'시계 ↻':'반시계 ↺';
 $('angle').textContent=o.doorAngle+'°';
 $('presetNote').textContent=`구동 ${p.driver} : 피동 ${p.follower} (톱니 수, TG 컬러 기어) · 출력 속도 ${o.ratio.toFixed(2)}배. 문 각도는 가상 값입니다.`;
 $('save').disabled=!latest||saved;
}
function reset(){turns=0;latest=null;saved=false;$('feedback').textContent='';render()}
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{preset=b.dataset.preset;reset()});
document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{direction=b.dataset.dir;reset()});
$('turns').oninput=()=>{turns=Number($('turns').value);latest=null;saved=false;render()};
for(const [id,step] of [['minus',-.05],['plus',.05]])$(id).onclick=()=>{turns=Math.round(Math.max(0,Math.min(1,turns+step))*100)/100;latest=null;saved=false;render()};
window.CTMSetDoorTurns=value=>{turns=Math.round(Math.max(0,Math.min(1,value))*100)/100;latest=null;saved=false;render()};
$('record').onclick=()=>{
 if(turns===0){$('feedback').textContent='먼저 구동 기어를 돌려 주세요.';return}
 const o=outcome();latest={trialId:crypto.randomUUID(),preset,direction,turns,measured:o.doorAngle};saved=false;
 history.push(`${CTMDoorModel.presets[preset].label} · 입력 ${turns.toFixed(2)}회전 · 피동 ${o.outputTurns.toFixed(2)}회전 · 문 ${o.doorAngle}°`);
 $('history').replaceChildren();for(const line of history.slice(-5).reverse()){const p=document.createElement('p');p.textContent=line;$('history').append(p)}
 $('feedback').textContent='가상 결과를 비교표에 추가했습니다.';render();
};
$('save').onclick=()=>{
 if(!latest||saved)return;
 if(parent===window){$('feedback').textContent='학생 수업 화면에서 열면 결과를 저장할 수 있습니다.';return}
 const p=CTMDoorModel.presets[latest.preset];
 parent.postMessage({type:'ctm.simulation.result.v1',lessonId,materialVersion,experimentId:'bqe01-door',modelVersion:'bqe01-door-1',presetVersion:1,mode:'simulation',unit:'°(가상)',condition:`구동 ${p.driver} : 피동 ${p.follower} · ${latest.direction==='cw'?'시계':'반시계'} · 입력 ${latest.turns.toFixed(2)}회전`,...latest},location.origin);
};
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='ctm.simulation.saved.v1'||event.data.trialId!==latest?.trialId)return;
 saved=!!event.data.ok;render();$('feedback').textContent=saved?'학생 수업 기록에 가상 결과를 저장했습니다.':'저장되지 않았습니다: '+String(event.data.error||'수업 화면을 확인하세요.');
});
if(params.get('preview')==='1')$('feedback').textContent='교사용 미리보기입니다. 학생 기록은 저장되지 않습니다.';
render();
})();

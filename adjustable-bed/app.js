(()=>{'use strict';
const $=id=>document.getElementById(id),lessonId='ppt-14e68e3ef2bab7f66d960539df7ab73b',materialVersion='1765438474000';
let level=3,locked=false,scanner=0,latest=null,saved=false;
const history=[];
window.CTMBedState=()=>({...CTMBedModel.state(level,locked),scanner});
function render(){
 const s=CTMBedModel.state(level,locked);
 $('level').value=String(level);$('scanner').value=String(scanner);
 $('height').textContent=level+' 단계';$('rack').textContent=s.rack.toFixed(2)+' 가상';$('gear').textContent=s.gearTurns.toFixed(2)+' 회전';
 $('pawl').textContent=locked?'고정':'해제';
 $('lock').classList.toggle('on',locked);$('unlock').classList.toggle('on',!locked);
 $('lockStatus').textContent=locked?'잠금: 높이 낮추기를 막습니다. 기어 올리기는 가능합니다.':'잠금 해제: 기어를 양방향으로 돌릴 수 있습니다.';
 $('save').disabled=!latest||saved;
}
function changed(){latest=null;saved=false;$('feedback').textContent='';render()}
function crank(direction){const next=CTMBedModel.crank(level,locked,direction);if(next.blocked){$('feedback').textContent='폴·래칫이 역방향 회전을 막습니다. 잠금을 해제해 보세요.';return}level=next.level;changed()}
$('up').onclick=()=>crank(1);$('down').onclick=()=>crank(-1);
$('level').oninput=()=>{const value=Number($('level').value);if(locked&&value<level){$('level').value=String(level);$('feedback').textContent='폴·래칫이 역방향 회전을 막습니다.';return}level=value;changed()};
$('lock').onclick=()=>{locked=true;changed()};$('unlock').onclick=()=>{locked=false;changed()};
$('scanner').oninput=()=>{scanner=Number($('scanner').value);changed()};
$('near').onclick=()=>{scanner=Math.max(0,scanner-1);changed()};$('far').onclick=()=>{scanner=Math.min(10,scanner+1);changed()};
window.CTMSetBedLevel=value=>{const next=Math.max(0,Math.min(10,Math.round(value)));if(locked&&next<level){$('feedback').textContent='잠금장치가 내리기를 막습니다.';return}level=next;changed()};
$('record').onclick=()=>{
 latest={trialId:crypto.randomUUID(),level,locked,scanner,measured:level};saved=false;
 const row=`높이 ${level}단계 · 랙 ${CTMBedModel.state(level,locked).rack.toFixed(2)}(가상) · ${locked?'고정':'해제'} · 스캐너 ${scanner}단계`;
 history.push(row);$('history').replaceChildren();for(const line of history.slice(-5).reverse()){const p=document.createElement('p');p.textContent=line;$('history').append(p)}
 $('feedback').textContent='가상 결과를 비교표에 추가했습니다.';render();
};
$('save').onclick=()=>{
 if(!latest||saved)return;
 if(parent===window){$('feedback').textContent='학생 수업 화면에서 열면 결과를 저장할 수 있습니다.';return}
 parent.postMessage({type:'ctm.simulation.result.v1',lessonId,materialVersion,experimentId:'bqe02-bed',modelVersion:'bqe02-bed-1',presetVersion:1,mode:'simulation',unit:'단계(가상)',condition:`침대 ${latest.level}단계 · ${latest.locked?'폴·래칫 고정':'잠금 해제'} · 스캐너 ${latest.scanner}단계`,...latest},location.origin);
};
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='ctm.simulation.saved.v1'||event.data.trialId!==latest?.trialId)return;
 saved=!!event.data.ok;render();$('feedback').textContent=saved?'학생 기록에 가상 결과를 저장했습니다. 실물 결과는 따로 확인하세요.':'저장되지 않았습니다: '+String(event.data.error||'수업 화면을 확인하세요.');
});
render();
})();

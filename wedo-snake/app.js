'use strict';
(()=>{
 const $=id=>document.getElementById(id),lessonId='ppt-4f1844dfddb85aab356b3acc8158acea',version='1774598125000',names={waiting:'먹이를 기다려요',eat:'냠냠',late:'늦었어!'};
 let latest=null,saved=false,entries=[];
 $('source').textContent='현재 연결된 위두 스크래치 6차시 PT · 자료 버전 '+version+' · 원본 24–50쪽 기준';
 function preview(){try{const r=CTMSnakeModel.evaluate($('distance').value,$('seconds').value);$('bubble').textContent=names[r.result];for(const name of Object.keys(names))$('rule-'+name).classList.toggle('active',name===r.result);$('status').textContent='예상한 뒤 ‘이 조건으로 확인’을 누르세요.';return r}catch(e){$('status').textContent=e.message;return null}}
 for(const [input,slider] of [['distance','distanceSlider'],['seconds','timeSlider']]){$(input).oninput=()=>{const n=Number($(input).value);if(Number.isFinite(n)&&n>=Number($(input).min)&&n<=Number($(input).max))$(slider).value=String(n);preview()};$(slider).oninput=()=>{$(input).value=$(slider).value;preview()}}
 $('random').onclick=()=>{$('seconds').value=CTMSnakeModel.randomSeconds();$('timeSlider').value=$('seconds').value;preview();$('status').textContent='1~10초 난수를 가상 경과 시간에 넣었습니다. 실제 타이머 측정은 아닙니다.'};
 $('run').onclick=()=>{const r=preview();if(!r)return;latest={...r,id:crypto.randomUUID()};saved=false;$('save').disabled=false;entries.push(`거리 ${r.distance} · ${r.seconds.toFixed(1)}초 → ${names[r.result]}`);if(entries.length>10)entries.shift();$('trials').replaceChildren(...entries.map(x=>{const p=document.createElement('p');p.textContent=x;return p}));$('status').textContent=`가상 결과: ${names[r.result]}`};
 $('save').onclick=()=>{if(!latest||saved)return;if(parent===window){$('status').textContent='학생 수업 화면에서 열면 이 가상 결과를 기록할 수 있습니다.';return}parent.postMessage({type:'ctm.wedo.snake.v1',lessonId,materialVersion:version,experimentId:'wedo-scratch-6-snake',modelVersion:1,trialId:latest.id,mode:'simulation',distance:latest.distance,seconds:latest.seconds,result:latest.result},location.origin);$('status').textContent='교실에 저장을 요청했습니다.'};
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const d=event.data;if(d?.type!=='ctm.wedo.snake.saved.v1'||d.trialId!==latest?.id)return;if(d.ok){saved=true;$('save').disabled=true}$('status').textContent=d.ok?'가상 조건 결과를 수업 기록에 저장했습니다. 실제 센서·타이머·모터는 선생님과 확인하세요.':String(d.error||'저장하지 못했습니다.').slice(0,120)});
 preview();
})();

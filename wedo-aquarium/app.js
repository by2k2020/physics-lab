'use strict';
(()=>{
 const $=id=>document.getElementById(id),version='1778747641000',lessonId='ppt-897d545c3f41889a6af6e87a675222fa',names={bottom:'아래',middle:'중간',top:'위'},ys={bottom:260,middle:160,top:60};
 $('source').textContent='업로드된 위두 스크래치 8차시 PPT · 자료 버전 '+version+'. 교사가 원문과 확장 미션을 따로 검토해야 합니다.';
 const entries=[];let latest=null,saved=false;
 function preview(){try{const r=CTMAquariumModel.classify($('sensorValue').value);$('zoneLabel').textContent=names[r.zone];$('valueLabel').textContent=String(r.value);$('fish').setAttribute('transform',`translate(370 ${ys[r.zone]})`);for(const zone of ['bottom','middle','top'])$('rule'+zone[0].toUpperCase()+zone.slice(1)).classList.toggle('active',zone===r.zone);$('status').textContent='예상한 뒤 ‘이 값으로 확인’을 누르세요.';return r}catch(e){$('status').textContent=e.message;return null}}
 $('sensorValue').oninput=()=>{const n=Number($('sensorValue').value);if(Number.isInteger(n)&&n>=0&&n<=100)$('sensorSlider').value=String(n);preview()};
 $('sensorSlider').oninput=()=>{$('sensorValue').value=$('sensorSlider').value;preview()};
 $('run').onclick=()=>{const r=preview();if(!r)return;latest={...r,id:crypto.randomUUID()};saved=false;$('save').disabled=false;entries.push(r);if(entries.length>20)entries.shift();$('trials').replaceChildren(...entries.map((entry,i)=>{const tr=document.createElement('tr');for(const value of [i+1,entry.value,names[entry.zone]]){const td=document.createElement('td');td.textContent=String(value);tr.append(td)}return tr}));$('status').textContent=`가상값 ${r.value}은 ${names[r.zone]} 구간입니다. 실제 센서 반응과는 별도로 비교하세요.`;};
 $('save').onclick=()=>{if(!latest||saved)return;if(parent===window){$('status').textContent='학생 수업 화면에서 열면 이 가상값을 기록할 수 있습니다.';return}parent.postMessage({type:'ctm.wedo.aquarium.v1',lessonId,materialVersion:version,experimentId:'wedo-scratch-8-aquarium',modelVersion:1,trialId:latest.id,mode:'simulation',value:latest.value,zone:latest.zone},location.origin);$('status').textContent='교실에 저장을 요청했습니다. 결과를 기다려 주세요.';};
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const d=event.data;if(d?.type!=='ctm.wedo.aquarium.saved.v1'||d.trialId!==latest?.id)return;if(d.ok){saved=true;$('save').disabled=true}$('status').textContent=d.ok?'가상 센서 값을 수업 기록에 저장했습니다. 실제 센서는 선생님과 확인하세요.':String(d.error||'저장하지 못했습니다.').slice(0,120)});
 preview();
})();

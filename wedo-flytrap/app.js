'use strict';
(()=>{
 const $=id=>document.getElementById(id),lessonId='ppt-0e96eff6e543a3c6ad9966dec6b310e8',version='1776399261000',names={basic:'기본',advanced:'심화'};
 let mode='basic',latest=null,saved=false,entries=[];
 $('source').textContent='현재 연결된 위두 스크래치 7차시 PT · 자료 버전 '+version+' · 원본 34–45쪽 기준';
 function preview(){try{const r=CTMFlytrapModel.evaluate($('value').value,mode);$('result').textContent=r.caught?'참':'거짓';$('mouth').textContent=r.caught?'닫힘':'열림';$('plant').classList.toggle('closed',r.caught);$('plant').setAttribute('aria-label',`가상 파리지옥 입이 ${r.caught?'닫힌':'열린'} 상태`);$('scene').classList.toggle('caught',r.caught);$('rule-basic').classList.toggle('active',mode==='basic');$('rule-advanced').classList.toggle('active',mode==='advanced');$('status').textContent='예상한 뒤 ‘이 값으로 확인’을 누르세요.';return r}catch(e){$('status').textContent=e.message;return null}}
 for(const kind of ['basic','advanced'])$(kind).onclick=()=>{mode=kind;for(const k of ['basic','advanced']){$(k).classList.toggle('active',k===mode);$(k).setAttribute('aria-pressed',String(k===mode))}preview()};
 $('value').oninput=()=>{const n=Number($('value').value);if(Number.isInteger(n)&&n>=0&&n<=100)$('slider').value=String(n);preview()};$('slider').oninput=()=>{$('value').value=$('slider').value;preview()};
 $('run').onclick=()=>{const r=preview();if(!r)return;latest={...r,id:crypto.randomUUID()};saved=false;$('save').disabled=false;entries.push(`${names[r.mode]} · 값 ${r.value} → ${r.caught?'먹이 감지':'감지 안 됨'}`);if(entries.length>10)entries.shift();$('trials').replaceChildren(...entries.map(s=>{const p=document.createElement('p');p.textContent=s;return p}));$('status').textContent=`가상값 ${r.value}: ${r.caught?'조건이 참이어서 입이 닫힙니다.':'조건이 거짓이어서 입이 열려 있습니다.'}`};
 $('save').onclick=()=>{if(!latest||saved)return;if(parent===window){$('status').textContent='학생 수업 화면에서 열면 이 가상값을 기록할 수 있습니다.';return}parent.postMessage({type:'ctm.wedo.flytrap.v1',lessonId,materialVersion:version,experimentId:'wedo-scratch-7-flytrap',modelVersion:1,trialId:latest.id,mode:'simulation',rule:latest.mode,value:latest.value,caught:latest.caught},location.origin);$('status').textContent='교실에 저장을 요청했습니다.'};
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const d=event.data;if(d?.type!=='ctm.wedo.flytrap.saved.v1'||d.trialId!==latest?.id)return;if(d.ok){saved=true;$('save').disabled=true}$('status').textContent=d.ok?'가상 거리 값을 수업 기록에 저장했습니다. 실제 센서와 코드는 선생님과 확인하세요.':String(d.error||'저장하지 못했습니다.').slice(0,120)});
 preview();
})();

'use strict';
(()=>{
 const $=id=>document.getElementById(id),lessonId='ppt-7ac8dd06deadbd6e5266c3caa8123290',materialVersion='1779953575000';
 let direction='clockwise',latest=null,saved=false;
 function renderDirection(){for(const id of ['clockwise','counterclockwise'])$(id).setAttribute('aria-pressed',String(direction===id))}
 function invalidate(){latest=null;saved=false;$('save').disabled=true;$('fan').classList.remove('running')}
 for(const id of ['clockwise','counterclockwise'])$(id).onclick=()=>{direction=id;renderDirection();invalidate();$('status').textContent='방향을 바꿨습니다. 가상 실행을 다시 누르세요.'};
 $('speed').oninput=()=>{$('speedValue').textContent=$('speed').value;invalidate();$('status').textContent='속도를 바꿨습니다. 가상 실행을 다시 누르세요.'};
 $('run').onclick=()=>{const r=CTMWedoFanModel.run(Number($('speed').value),direction);const fan=$('fan');fan.classList.toggle('running',r.moving);fan.style.setProperty('--period',r.periodMs+'ms');fan.style.setProperty('--direction',direction==='clockwise'?'normal':'reverse');fan.setAttribute('aria-label',`가상 선풍기 ${r.moving?'회전':'정지'} · 속도 ${r.speed} · ${direction==='clockwise'?'시계':'반시계'} 방향`);latest={trialId:crypto.randomUUID(),speed:r.speed,direction:r.direction,moving:r.moving};saved=false;$('save').disabled=false;$('status').textContent=r.moving?`가상 속도 ${r.speed} · ${direction==='clockwise'?'시계':'반시계'} 방향으로 회전합니다.`:'속도 0: 가상 선풍기가 움직이지 않습니다.'};
 $('stop').onclick=()=>{$('fan').classList.remove('running');$('status').textContent='가상 회전을 정지했습니다. 새 결과를 기록하려면 다시 실행하세요.';latest=null;$('save').disabled=true};
 $('save').onclick=()=>{if(!latest||saved)return;if(parent===window){$('status').textContent='학생 수업 화면에서 열면 가상 결과를 기록할 수 있습니다.';return}parent.postMessage({type:'ctm.wedo.fan.v1',lessonId,materialVersion,experimentId:'wedo-young-1-fan',modelVersion:1,mode:'simulation',...latest},location.origin)};
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const d=event.data;if(d?.type!=='ctm.wedo.fan.saved.v1'||d.trialId!==latest?.trialId)return;if(d.ok){saved=true;$('save').disabled=true}$('status').textContent=d.ok?'가상 결과를 수업 기록에 저장했습니다. 실물 선풍기는 선생님과 확인하세요.':String(d.error||'저장하지 못했습니다.').slice(0,120)});
})();

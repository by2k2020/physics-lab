'use strict';
(()=>{
 const $=id=>document.getElementById(id),lessonId='ppt-126a766e3a3ac6f084e4568eeac4b3b0',version='1768441065000',names={up:'위',down:'아래',left:'왼쪽',right:'오른쪽'};
 let position={x:0,y:0},latest=null,saved=false;
 $('source').textContent='현재 연결된 위두 스크래치 게임 조종기 PT · 자료 버전 '+version+' · 원본 7–9쪽 기준';
 function render(direction){$('x').textContent=position.x;$('y').textContent=position.y;$('direction').textContent=direction?names[direction]:'—';$('sprite').style.left=`${50+position.x}%`;$('sprite').style.top=`${50-position.y*1.25}%`;for(const dir of Object.keys(CTMWedoController.moves))$('rule-'+dir).classList.toggle('active',dir===direction)}
 document.querySelectorAll('[data-dir]').forEach(button=>button.onclick=()=>{const next=CTMWedoController.move(position,button.dataset.dir);position=next.position;latest={...next,id:crypto.randomUUID()};saved=false;$('save').disabled=false;render(next.direction);$('status').textContent=`가상 ${names[next.direction]} 방향: ${next.axis.toUpperCase()} 좌표가 ${next.delta}만큼 바뀌었습니다.`;});
 $('reset').onclick=()=>{position={x:0,y:0};latest=null;saved=false;$('save').disabled=true;render();$('status').textContent='좌표를 초기화했습니다.';};
 $('save').onclick=()=>{if(!latest||saved)return;if(parent===window){$('status').textContent='학생 수업 화면에서 열면 이 가상 결과를 기록할 수 있습니다.';return}parent.postMessage({type:'ctm.wedo.controller.v1',lessonId,materialVersion:version,experimentId:'wedo-scratch-2-controller',modelVersion:1,trialId:latest.id,mode:'simulation',direction:latest.direction,axis:latest.axis,delta:latest.delta,x:latest.position.x,y:latest.position.y},location.origin);$('status').textContent='교실에 저장을 요청했습니다.';};
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const d=event.data;if(d?.type!=='ctm.wedo.controller.saved.v1'||d.trialId!==latest?.id)return;if(d.ok){saved=true;$('save').disabled=true}$('status').textContent=d.ok?'가상 조종 결과를 수업 기록에 저장했습니다. 실제 센서와 코드는 선생님과 확인하세요.':String(d.error||'저장하지 못했습니다.').slice(0,120)});
 render();
})();

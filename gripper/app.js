'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const lessonId='ppt-6adda9a4aa4e88acf4ddfaf90ba24691';
 const materialVersion='1758183518000';
 const names={wheel:'노란 바퀴',brick:'2×4 브릭',gear:'회색 기어',axle:'빨간 축'};
 const icons={wheel:'🟡',brick:'🧱',gear:'⚙️',axle:'🔴'};
 const riskNames=['낮음','보통','높음'];
 let direction='cw',opening=50,object='wheel',surface='plain',pace='quick',phase='ready',count=0,attempts=0,latest=null,saved=false,trialOutcome=null;
 const history=[];
 let timer=null;
 const activeTab=()=>document.querySelector('.tabs button[aria-selected="true"]')?.dataset.tab||'gears';
 window.CTMGrabberSceneState=()=>({direction,opening:opening/100,object,surface,pace,phase,count,willSlip:trialOutcome?.success===false,landed:!!latest&&latest.measured===1&&phase==='ready',pivot:Number($('pivotInput')?.value??3),tab:activeTab()});

 document.querySelectorAll('.tabs button').forEach(button=>button.onclick=()=>{
  for(const b of document.querySelectorAll('.tabs button'))b.setAttribute('aria-selected',String(b===button));
  for(const id of ['gears','transfer','lever'])$(id).hidden=id!==button.dataset.tab;
 });

 // 회전 방향 관계와 집게 개폐를 따로 조작한다. PT는 열림/닫힘의 절대 입력 방향을 지정하지 않는다.
 const motion=document.createElement('div');
 motion.innerHTML='<hr><p class="eyebrow">집게를 직접 움직여 보기</p><label class="field">집게 벌어짐 <strong id="jawValue">50%</strong><input id="jawInput" type="range" min="0" max="100" value="50" aria-label="집게 벌어짐"></label><div class="actions"><button id="jawOpen">집게 열기</button><button id="jawClose" class="primary">집게 닫기</button></div><p class="note">방향 버튼을 눌러 한 단계씩 돌리거나 3D 기어를 위아래로 드래그해 보세요. 화면에서는 시계방향을 닫힘 쪽으로 설정했습니다. 실제 조립 방향은 교구로 확인합니다.</p>';
 $('gearStatus').after(motion);
 function showGears(){
  const dirs=CTMBricqGrabberModel.gearDirections(direction);
  document.querySelectorAll('[data-gear]').forEach((g,i)=>g.querySelector('em').textContent=dirs[i]==='cw'?'↻':'↺');
  $('gearSequence').textContent=dirs.map((d,i)=>`${i+1}번 ${d==='cw'?'↻':'↺'}`).join('  ·  ');
  $('clockwise').setAttribute('aria-pressed',String(direction==='cw'));
  $('counterclockwise').setAttribute('aria-pressed',String(direction==='ccw'));
  $('gearStatus').textContent=`1번 ${direction==='cw'?'시계':'반시계'}방향 → 3번 같은 방향, 2·4번 반대 방향.`;
 }
 function turnGear(value,delta){direction=value;opening=Math.max(0,Math.min(100,opening+delta));$('jawInput').value=String(opening);$('jawInput').dispatchEvent(new Event('input'));showGears()}
 $('clockwise').onclick=()=>turnGear('cw',-25);
 $('counterclockwise').onclick=()=>turnGear('ccw',25);
 $('jawInput').oninput=()=>{opening=Number($('jawInput').value);$('jawValue').textContent=opening+'%'};
 $('jawOpen').onclick=()=>{$('jawInput').value='100';$('jawInput').dispatchEvent(new Event('input'))};
 $('jawClose').onclick=()=>{$('jawInput').value='0';$('jawInput').dispatchEvent(new Event('input'))};
 showGears();

 function risk(){return CTMBricqGrabberModel.gripRisk(object,surface)}
 const pacePanel=document.createElement('div');
 pacePanel.innerHTML='<p class="eyebrow">같게 두거나 바꿀 조건 · 이동 방식</p><div class="pick"><button id="steady" aria-pressed="false">천천히</button><button id="quick" aria-pressed="true">빠르게</button></div><p class="note">가상 비교 규칙: 낮음은 두 방식 모두 도착, 보통은 천천히만 도착, 높음은 두 방식 모두 이동 중 미끄러집니다. 실물 성공률이나 마찰 계수가 아닙니다.</p>';
 $('pad').parentElement.after(pacePanel);
 const outcomeFact=document.createElement('div');outcomeFact.className='fact';outcomeFact.innerHTML='<small>최근 가상 결과</small><strong id="outcome">아직 실험 전</strong>';
 $('count').parentElement.parentElement.append(outcomeFact);
 const comparison=document.createElement('div');comparison.className='notice';comparison.id='trialHistory';comparison.textContent='같은 부품과 이동 방식으로 기본 면과 미끄럼 방지 부품을 비교해 보세요. 각 결과를 수업 기록에 남기려면 조건을 바꾸기 전에 기록 버튼을 누르세요.';
 $('transferStatus').after(comparison);
 function renderHistory(){
  if(!history.length)return;
  comparison.replaceChildren();
  for(const row of history.slice(-4).reverse()){
   const p=document.createElement('p');p.textContent=`${row.name} · ${row.surface} · ${row.pace} · 주의 ${row.risk} → ${row.result}`;comparison.append(p);
  }
 }
 function transferRender(){
  document.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.object===object)));
  $('plain').setAttribute('aria-pressed',String(surface==='plain'));
  $('pad').setAttribute('aria-pressed',String(surface==='pad'));
  $('piece').textContent=icons[object];
  $('piece').className='piece'+(['gripping','held'].includes(phase)?' held':['moving','moved'].includes(phase)?' moved':'');
  $('grabberVisual').className='grabber-visual'+(['gripping','held'].includes(phase)?' held':['moving','moved'].includes(phase)?' moved':'');
  $('risk').textContent=riskNames[risk()];$('count').textContent=count;
  $('outcome').textContent=latest?(latest.measured===1?'도착 · 1개':'미끄러짐 · 0개'):'아직 실험 전';
  $('steady').setAttribute('aria-pressed',String(pace==='steady'));
  $('quick').setAttribute('aria-pressed',String(pace==='quick'));
  $('grab').disabled=!['ready','slipped'].includes(phase);
  $('move').disabled=phase!=='held';
  $('release').disabled=phase!=='moved';
  $('save').disabled=!latest||saved||!['ready','slipped'].includes(phase);
 }
 function cancelAnimation(){if(timer){clearTimeout(timer);timer=null}}
 function resetTrial(){cancelAnimation();phase='ready';latest=null;trialOutcome=null;saved=false;transferRender()}
 document.querySelectorAll('[data-object]').forEach(b=>b.onclick=()=>{object=b.dataset.object;resetTrial();$('transferStatus').textContent=names[object]+'을 선택했습니다.'});
 $('plain').onclick=()=>{surface='plain';resetTrial();$('transferStatus').textContent='기본 집는 면을 선택했습니다.'};
 $('pad').onclick=()=>{surface='pad';resetTrial();$('transferStatus').textContent='미끄럼 방지 부품을 추가했습니다. 실물 효과는 별도로 확인하세요.'};
 for(const value of ['steady','quick'])$(value).onclick=()=>{pace=value;resetTrial();$('transferStatus').textContent=(value==='steady'?'천천히':'빠르게')+' 옮기기를 선택했습니다.'};
 function finishTrial(success){
  attempts++;if(success)count++;
  latest={trialId:crypto.randomUUID(),object,surface,pace,risk:risk(),measured:success?1:0};
  saved=false;phase=success?'ready':'slipped';timer=null;
  history.push({name:names[object],surface:surface==='pad'?'미끄럼 방지 부품':'기본 면',pace:pace==='quick'?'빠르게':'천천히',risk:riskNames[risk()],result:success?'도착 1개':'미끄러짐 0개'});
  transferRender();renderHistory();
  $('transferStatus').textContent=success?names[object]+'이 가상 도착 칸에 놓였습니다. 실제 결과와 비교하세요.':names[object]+'이 가상 이동 중 미끄러졌습니다. 집는 면이나 이동 방식을 바꿔 다시 해보세요.';
 }
 $('grab').onclick=()=>{
  latest=null;trialOutcome=null;saved=false;
  phase='gripping';transferRender();$('transferStatus').textContent='집게 팔을 닫는 중입니다…';
  timer=setTimeout(()=>{phase='held';timer=null;transferRender();$('transferStatus').textContent=names[object]+'을 가상으로 잡았습니다. 실제 잡힘은 교구로 확인하세요.'},850);
 };
 $('move').onclick=()=>{
  trialOutcome=CTMBricqGrabberModel.transferOutcome(risk(),pace);
  phase='moving';transferRender();$('transferStatus').textContent='집게와 부품을 도착 칸으로 옮기는 중입니다…';
  if(trialOutcome.success){
   timer=setTimeout(()=>{phase='moved';timer=null;transferRender();$('transferStatus').textContent='도착 칸에 도착했습니다. 이제 놓기를 누르세요.'},1350);
  }else{
   timer=setTimeout(()=>{phase='slipping';transferRender();$('transferStatus').textContent='이동 중 부품이 미끄러집니다…';timer=setTimeout(()=>finishTrial(false),650)},650);
  }
 };
 $('release').onclick=()=>{
  phase='releasing';transferRender();$('transferStatus').textContent='집게 팔을 열고 부품을 내려놓는 중입니다…';
  timer=setTimeout(()=>finishTrial(true),700);
 };
 transferRender();
 $('save').onclick=()=>{
  if(!latest||saved||!['ready','slipped'].includes(phase))return;
  if(parent===window){$('transferStatus').textContent='학생 수업 화면에서 열면 가상 결과를 기록할 수 있습니다.';return}
  parent.postMessage({type:'ctm.simulation.result.v1',lessonId,materialVersion,experimentId:'bqe21-grabber',modelVersion:'bqe21-grabber-2',presetVersion:1,mode:'simulation',unit:'개(가상)',condition:`${names[latest.object]} · ${latest.surface==='pad'?'미끄럼 방지 부품':'기본 면'} · ${latest.pace==='quick'?'빠르게':'천천히'} · 주의 ${riskNames[latest.risk]} · ${latest.measured?'도착':'미끄러짐'}`,...latest},location.origin);
 };
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent)return;
  const d=event.data;if(d?.type!=='ctm.simulation.saved.v1'||d.trialId!==latest?.trialId)return;
  if(d.ok){saved=true;$('save').disabled=true}
  $('transferStatus').textContent=d.ok?'가상 결과를 수업 기록에 저장했습니다. 실물 물체 이동은 별도로 확인하세요.':String(d.error||'저장하지 못했습니다.').slice(0,120);
 });
 function leverRender(){const value=Number($('pivotInput').value);$('pivot').style.left=(20+(value-1)*15)+'%';$('leverStatus').textContent=value<3?'받침점이 힘점 쪽에 있습니다.':value>3?'받침점이 작용점 쪽에 있습니다.':'받침점이 가운데에 있습니다.'}
 $('pivotInput').oninput=leverRender;leverRender();
})();

'use strict';
(() => {
 const $=id=>document.getElementById(id);
 const scene=new URLSearchParams(location.search).get('scene')==='ride'?'ride':'wheel';
 const format=(value,digits=2)=>Number(value.toFixed(digits));
 const config={
  wheel:{title:'굴렁쇠 측정자',intro:'실물 바퀴 지름을 자로 재서 넣고, 바퀴가 굴러간 회전 수로 거리를 계산해 보세요. 1M(100cm)보다 짧은 물건이나 병뚜껑 튕기기 거리를 굴렁쇠로 잰 값과 비교합니다.',stage:'21차시 · 바퀴 회전 → 이동 거리',control:'바퀴 지름과 회전 수',materialVersion:'1761886897000',experimentId:'bqp21-wheel',variable:'지름·회전 수·미끄러짐 가정',unit:'cm',inputs:[['diameter','바퀴 지름 (자로 잰 값)','cm',2,40,'',.1],['turns','바퀴 회전 수','회',.25,50,4,.25],['slip','미끄러짐 가정','%',0,30,0,1]],result:r=>r.modelCm,condition:r=>`지름 ${r.diameter}cm · ${r.turns}회 · 미끄러짐 가정 ${r.slip}%`,metrics:r=>[['바퀴 한 바퀴 거리(둘레)',r.circumferenceCm.toFixed(1)+' cm'],['계산한 이동 거리',r.modelCm.toFixed(1)+' cm'],['1M(100cm)까지 회전 수',r.turnsFor1m.toFixed(1)+' 회']],head:['횟수','바퀴 지름','회전 수','미끄러짐 가정','계산 거리']},
  ride:{title:'원심력 회전놀이기구',intro:'기어 구조를 고르고, 피겨가 바깥으로 얼마나 밀릴지 먼저 예상해 보세요. 큰 기어가 작은 기어를 돌리면 더 빨리 돌고, 빨리 돌수록 바깥으로 더 세게 밀립니다. 실제 피겨 모습은 교구로 확인합니다.',stage:'22차시 · 손잡이 → 기어 → 회전',control:'기어 구조와 예상',materialVersion:'1763110439000',experimentId:'bqp22-ride',variable:'기어 구조(가속·같은 크기·감속)',unit:'회',inputs:[['gear','기어 구조','choice',Object.entries(CTMRotationModel.GEARS).map(([k,g])=>[k,g.label]),'up'],['predict','바깥으로 밀리는 정도 예상','choice',[['','먼저 예상을 고르세요'],['약','약하다'],['보통','보통이다'],['강','강하다']],''],['handTurns','손잡이 회전 수','회',1,10,1,1]],result:r=>r.rideTurns,condition:r=>`${r.gearLabel} · 손잡이 ${r.handTurns}바퀴`,metrics:r=>[['놀이기구 회전 수',format(r.rideTurns)+' 회'],['손잡이보다',r.ratio>=1?format(r.ratio)+'배 빠름':format(1/r.ratio)+'배 느림'],['바깥으로 밀리는 정도',r.push],['내 예상',r.predict?(r.predict===r.push?r.predict+' · 맞음':r.predict+' · 다름'):'아직 안 고름']],head:['횟수','기어 구조','손잡이','놀이기구 회전','밀리는 정도']}
 }[scene];
 $('title').textContent=config.title;
 $('intro').textContent=config.intro;
 $('stageLabel').textContent=config.stage;
 $('controlTitle').textContent=config.control;
 $('source').textContent=scene==='wheel'?`수업 PPT 21차시 기준: 1M=100cm, 1M보다 짧은 물건 재기. 바퀴 지름은 PPT에 없어 실물로 잽니다. (자료 버전 ${config.materialVersion})`:`수업 PPT 22차시 14~16쪽 기준: 가속 구조 예 40톱니 → 8톱니 = 5바퀴. 밀리는 정도는 크기 비교만 합니다. (자료 버전 ${config.materialVersion})`;
 $(scene==='wheel'?'wheelStage':'rideStage').removeAttribute('hidden');
 const inputs={},trials=[];
 for(const [key,label,unit,min,max,initial,step] of config.inputs){
  const wrap=document.createElement('div');wrap.className='control';
  if(unit==='choice'){const name=document.createElement('label');name.textContent=label;name.htmlFor='input-'+key;const select=document.createElement('select');select.id='input-'+key;select.className='choice';for(const [value,text] of min){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option)}select.value=max;select.onchange=()=>showPreview();const top=document.createElement('div');top.className='control-top';top.append(name);wrap.append(top,select);$('controls').append(wrap);inputs[key]={number:select,range:null,initial:max};continue;}
  const top=document.createElement('div');top.className='control-top';
  const name=document.createElement('label');name.textContent=label;name.htmlFor='input-'+key;
  const field=document.createElement('span');const number=document.createElement('input');number.type='number';number.id='input-'+key;number.min=min;number.max=max;number.step=step;number.value=initial;number.setAttribute('aria-label',label);
  field.append(number,document.createTextNode(' '+unit));top.append(name,field);
  const range=document.createElement('input');range.type='range';range.min=min;range.max=max;range.step=step;range.value=initial===''?min:initial;range.setAttribute('aria-label',label+' 슬라이더');
  range.oninput=()=>{number.value=range.value;showPreview()};
  number.oninput=()=>{if(number.value!==''&&Number(number.value)>=min&&Number(number.value)<=max)range.value=number.value;showPreview()};
  wrap.append(top,range);$('controls').append(wrap);inputs[key]={number,range,initial};
 }
 function values(){return Object.fromEntries(Object.entries(inputs).map(([key,field])=>[key,field.number.value]));}
  function metricList(result){$('metrics').replaceChildren(...config.metrics(result).map(([label,value])=>{const card=document.createElement('div');card.className='metric';const t=document.createElement('span');t.textContent=label;const v=document.createElement('strong');v.textContent=value;card.append(t,v);return card}));}
 function compute(){const v=values(),r=CTMRotationModel[scene](v);if(scene==='ride')r.predict=v.predict;return r;}
 function showPreview(){try{metricList(compute());$('status').textContent='조건을 바꿨습니다. 실험 버튼으로 기록해 보세요.';}catch(e){$('status').textContent=e.message;}}
 const head=document.createElement('tr');for(const value of config.head){const cell=document.createElement('th');cell.textContent=value;head.append(cell)}$('trialHead').append(head);
 function renderTrials(){const body=$('trialBody');body.replaceChildren();for(const [index,trial] of trials.entries()){const row=document.createElement('tr');const r=trial.result;const cells=scene==='wheel'?[index+1,r.diameter+' cm',r.turns+' 회',r.slip+'%',r.modelCm.toFixed(1)+' cm']:[index+1,r.gearLabel,r.handTurns+' 바퀴',format(r.rideTurns)+' 회',r.push];for(const value of cells){const td=document.createElement('td');td.textContent=value;row.append(td)}body.append(row)}}
 let latest=null,animation=0;
 function move(result){cancelAnimationFrame(animation);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const start=performance.now(),duration=scene==='wheel'?2200:2500;
  const draw=now=>{const progress=Math.min(1,(now-start)/duration);if(scene==='wheel'){const size=Math.max(.45,Math.min(1.4,result.diameter/10)),distance=Math.min(550,result.modelCm*1.4);$('wheelMove').setAttribute('transform',`translate(${120+progress*distance} ${232-66*size}) rotate(${progress*360*result.turns}) scale(${size})`)}else $('rideRotor').setAttribute('transform',`rotate(${progress*360*Math.min(5,result.rideTurns)} 390 146)`);if(progress<1)animation=requestAnimationFrame(draw)};animation=requestAnimationFrame(draw);
 }
 $('run').onclick=()=>{try{if(scene==='ride'&&!values().predict)throw Error('실험 전에 바깥으로 밀리는 정도를 먼저 예상해 고르세요.');const result=compute();latest={id:crypto.randomUUID(),result};trials.push(latest);if(trials.length>20)trials.shift();metricList(result);renderTrials();move(result);$('save').disabled=false;$('status').textContent='가상 실험을 기록했습니다. 실제 교구 결과는 따로 확인하세요.';}catch(e){$('status').textContent=e.message}};
 $('reset').onclick=()=>{cancelAnimationFrame(animation);for(const field of Object.values(inputs)){field.number.value=field.initial;if(field.range)field.range.value=field.initial===''?field.range.min:field.initial}latest=null;trials.length=0;renderTrials();$('save').disabled=true;showPreview();$('status').textContent='처음 조건으로 돌아왔습니다.';};
 $('save').onclick=()=>{if(!latest)return;if(parent===window){$('status').textContent='학생 수업 화면에서 이 실험을 열면 해당 차시에 기록할 수 있습니다.';return}const r=latest.result;const payload={type:'ctm.simulation.result.v1',experimentId:config.experimentId,presetVersion:1,materialVersion:config.materialVersion,trialId:latest.id,mode:'simulation',modelVersion:'ideal-rotation-1',condition:config.condition(r),variable:config.variable,unit:config.unit,predicted:null,measured:format(config.result(r),3),inputs:Object.fromEntries(config.inputs.map(([key])=>[key,r[key]??null]))};parent.postMessage(payload,location.origin);$('status').textContent='교실에 저장을 요청했습니다. 결과를 기다려 주세요.';};
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const data=event.data;if(!data||data.type!=='ctm.simulation.saved.v1'||data.trialId!==latest?.id)return;$('status').textContent=data.ok?'교실 수업 기록에 저장했습니다. 실물 결과는 별도로 확인하세요.':String(data.error||'저장하지 못했습니다.').slice(0,120);});
 showPreview();$('status').textContent=scene==='wheel'?'실물 바퀴 지름을 자로 재서 먼저 입력하세요.':'기어 구조를 고르고 결과를 먼저 예상하세요.';
 if(scene==='wheel')$('wheelMove').setAttribute('transform','translate(120 165)');
})();

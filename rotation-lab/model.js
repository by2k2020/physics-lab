'use strict';
(function(root){
 const finite=(value,min,max,name)=>{const n=Number(value);if(value===''||!Number.isFinite(n)||n<min||n>max)throw Error(name+' 범위를 확인해 주세요.');return n;};
 // 21차시 PPT: 1M(100cm)보다 짧은 거리를 굴렁쇠로 잰다. 바퀴 지름은 교안에 없으므로 학생이 실물을 재서 넣는다.
 function wheel(values){
  if(values.diameter===''||values.diameter==null)throw Error('실물 바퀴 지름을 자로 재서 입력하세요.');
  const diameter=finite(values.diameter,2,40,'바퀴 지름');
  const turns=finite(values.turns,0.25,50,'바퀴 회전 수');
  const slip=finite(values.slip,0,30,'미끄러짐 가정');
  const circumference=Math.PI*diameter,ideal=circumference*turns;
  return {diameter,turns,slip,circumferenceCm:circumference,idealCm:ideal,modelCm:ideal*(1-slip/100),turnsFor1m:100/circumference};
 }
 // 22차시 PPT 14~16쪽: 큰 기어가 작은 기어를 돌리면 빨라진다(예: 40톱니 → 8톱니 = 5바퀴). 바깥으로 밀리는 정도는 정성 비교만 한다.
 const GEARS={up:{label:'가속 · 40톱니 → 8톱니',driver:40,follower:8},same:{label:'같은 크기 기어',driver:1,follower:1},down:{label:'감속 · 8톱니 → 40톱니',driver:8,follower:40}};
 function ride(values){
  const gear=GEARS[values.gear];if(!gear)throw Error('기어 구조를 골라 주세요.');
  const handTurns=finite(values.handTurns,1,10,'손잡이 회전 수');
  const ratio=gear.driver/gear.follower,rideTurns=handTurns*ratio;
  const push=ratio>1?'강':ratio<1?'약':'보통';
  return {gear:values.gear,gearLabel:gear.label,handTurns,ratio,rideTurns,push};
 }
 const api={wheel,ride,GEARS};
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.CTMRotationModel=api;
})(typeof window==='object'?window:globalThis);

'use strict';
const CTMBricqGrabberModel={
 gearDirections(input){
  if(!['cw','ccw'].includes(input))throw Error('1번 기어 방향을 선택하세요.');
  return [input,input==='cw'?'ccw':'cw',input,input==='cw'?'ccw':'cw'];
 },
 gripRisk(object,surface){
  const base={wheel:2,brick:1,gear:2,axle:2};
  if(!Object.hasOwn(base,object)||!['plain','pad'].includes(surface))throw Error('PT에 나온 부품과 집는 면을 선택하세요.');
  return Math.max(0,base[object]-(surface==='pad'?1:0));
 },
 // 비교용 가상 규칙. 실물 마찰 계수나 성공 확률을 추정하지 않는다.
 transferOutcome(risk,pace){
  if(![0,1,2].includes(risk)||!['steady','quick'].includes(pace))throw Error('가상 주의 단계와 이동 조건을 선택하세요.');
  return {success:risk===0||(risk===1&&pace==='steady'),reason:risk===0?'도착':risk===1&&pace==='steady'?'천천히 옮겨 도착':'이동 중 미끄러짐'};
 }
};
if(typeof module!=='undefined')module.exports=CTMBricqGrabberModel;

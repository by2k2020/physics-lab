'use strict';
const CTMDoorModel={
 // 잇수는 TG 26년 1차시: 파란 컬러 기어 10개·보라 컬러 기어 6개(기어비 10:6)
 presets:{equal:{driver:10,follower:10,label:'등속 · 파란 10 : 파란 10'},slow:{driver:6,follower:10,label:'감속 · 보라 6 → 파란 10'},fast:{driver:10,follower:6,label:'가속 · 파란 10 → 보라 6'}},
 outcome(preset,turns,direction){
  const p=this.presets[preset];
  if(!p||!Number.isFinite(turns)||turns<0||turns>1||!['cw','ccw'].includes(direction))throw Error('기어·회전 방향·입력 회전 수를 확인하세요.');
  const ratio=p.driver/p.follower;
  const outputTurns=turns*ratio;
  const doorAngle=Math.min(90,Math.round(outputTurns*90));
  return {driverTeeth:p.driver,followerTeeth:p.follower,ratio,outputTurns,doorAngle,outputDirection:direction==='cw'?'ccw':'cw'};
 }
};
if(typeof module!=='undefined')module.exports=CTMDoorModel;

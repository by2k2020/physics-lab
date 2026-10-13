'use strict';
const CTMBedModel={
 state(level,locked){
  if(!Number.isInteger(level)||level<0||level>10||typeof locked!=='boolean')throw Error('침대 높이와 잠금 상태를 확인하세요.');
  const lift=.48+level*.095,linkLength=1.56,span=Math.sqrt(linkLength**2-lift**2);
  return {level,lift,span,rack:level*.11,gearTurns:level*.125,locked};
 },
 crank(level,locked,direction){
  if(![-1,1].includes(direction))throw Error('회전 방향을 선택하세요.');
  if(direction<0&&locked)return {level,blocked:true};
  return {level:Math.max(0,Math.min(10,level+direction)),blocked:false};
 }
};
if(typeof module!=='undefined')module.exports=CTMBedModel;

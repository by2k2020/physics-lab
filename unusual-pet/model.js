'use strict';
const CTMPetModel={
 outcome(model,wheel,turns){
  if(!['rabbit','pet'].includes(model)||!['large','small'].includes(wheel)||!Number.isInteger(turns)||turns<1||turns>3)throw Error('모형·바퀴·회전 수를 확인하세요.');
  const jumpsPerTurn=model==='rabbit'?2:1;
  const height=wheel==='large'?1:.55;
  return {jumpsPerTurn,jumps:turns*jumpsPerTurn,height,turns,model,wheel};
 }
};
if(typeof module!=='undefined')module.exports=CTMPetModel;

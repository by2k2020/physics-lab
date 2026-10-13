'use strict';
const CTMWedoMiloModel={
 run(speed,forwardSeconds,backwardSeconds){
  if(!Number.isInteger(speed)||speed<0||speed>10)throw Error('가상 속도는 0~10 사이에서 선택하세요.');
  for(const [name,value] of [['전진 시간',forwardSeconds],['후진 시간',backwardSeconds]])if(!Number.isInteger(value)||value<0||value>10)throw Error(name+'은 0~10초 사이에서 선택하세요.');
  const forwardUnits=speed*forwardSeconds,backwardUnits=speed*backwardSeconds;
  return {speed,forwardSeconds,backwardSeconds,forwardUnits,backwardUnits,netUnits:forwardUnits-backwardUnits};
 }
};
if(typeof module!=='undefined')module.exports=CTMWedoMiloModel;

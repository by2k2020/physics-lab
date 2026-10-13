'use strict';
const CTMWedoFanModel={
  run(speed,direction){
    if(!Number.isInteger(speed)||speed<0||speed>10)throw Error('가상 속도는 0부터 10까지 선택하세요.');
    if(!['clockwise','counterclockwise'].includes(direction))throw Error('가상 회전 방향을 선택하세요.');
    return {speed,direction,moving:speed>0,periodMs:speed===0?0:Math.round(3600/(speed+1))};
  }
};
if(typeof module!=='undefined')module.exports=CTMWedoFanModel;

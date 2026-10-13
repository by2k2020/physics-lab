'use strict';
(function(root){
 function evaluate(distance,seconds){
  const d=Number(distance),t=Number(seconds);
  if(distance===''||seconds===''||!Number.isInteger(d)||d<0||d>100||!Number.isFinite(t)||t<0||t>10||Math.round(t*10)!==t*10)throw Error('가상 거리 0~100, 시간 0~10초를 0.1초 단위로 입력하세요.');
  const fed=d<50,result=!fed?'waiting':t>3?'late':'eat';
  return {distance:d,seconds:t,fed,result};
 }
 function randomSeconds(random=Math.random){const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('난수 범위 오류');return 1+Math.floor(v*10)}
 const api={evaluate,randomSeconds};if(typeof module==='object'&&module.exports)module.exports=api;root.CTMSnakeModel=api;
})(typeof window==='object'?window:globalThis);

'use strict';
(function(root){
 function evaluate(value,mode){
  if(value===null||value===undefined||typeof value==='string'&&!value.trim())throw Error('가상 거리 값을 입력하세요.');
  const n=Number(value);if(!Number.isInteger(n)||n<0||n>100)throw Error('가상 거리 값은 0~100 정수여야 합니다.');
  if(!['basic','advanced'].includes(mode))throw Error('실험 조건을 선택하세요.');
  const caught=mode==='basic'?n<30:n>10&&n<50;
  return {value:n,mode,caught,mouth:caught?'closed':'open'};
 }
 const api={evaluate};if(typeof module==='object'&&module.exports)module.exports=api;root.CTMFlytrapModel=api;
})(typeof window==='object'?window:globalThis);

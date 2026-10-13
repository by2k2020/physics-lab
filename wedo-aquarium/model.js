'use strict';
(function(root){
 function classify(value){if(value===null||value===undefined||typeof value==='string'&&!value.trim())throw Error('가상 센서 값을 입력해 주세요.');const n=Number(value);if(!Number.isInteger(n)||n<0||n>100)throw Error('가상 센서 값은 0~100 정수여야 합니다.');return {value:n,zone:n<=30?'bottom':n<=70?'middle':'top',level:n<=30?0:n<=70?1:2};}
 const api={classify};if(typeof module==='object'&&module.exports)module.exports=api;root.CTMAquariumModel=api;
})(typeof window==='object'?window:globalThis);

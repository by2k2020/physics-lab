'use strict';
(function(root){
 function spider(position,direction){
  if(!Number.isInteger(position)||position<0||position>100||!['U','D'].includes(direction))throw Error('가상 높이와 방향을 확인하세요.');
  const next=Math.max(0,Math.min(100,position+(direction==='U'?10:-10)));
  return {position:next,direction,bottom:next===0,change:next-position};
 }
 function frog(repetitions,microphone){
  if(!Number.isInteger(repetitions)||repetitions<1||repetitions>5||!Number.isInteger(microphone)||microphone<0||microphone>10)throw Error('반복 1~5회와 가상 마이크 값 0~10을 입력하세요.');
  return {repetitions,microphone,exampleMatch:microphone===3};
 }
 const api={spider,frog};if(typeof module==='object'&&module.exports)module.exports=api;root.CTMWedoYoungModel=api;
})(typeof window==='object'?window:globalThis);

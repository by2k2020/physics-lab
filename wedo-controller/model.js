'use strict';
(function(root){
 const moves={up:{axis:'y',delta:10},down:{axis:'y',delta:-10},left:{axis:'x',delta:-10},right:{axis:'x',delta:10}};
 function move(position,direction){
  if(!moves[direction])throw Error('방향을 선택하세요.');
  const x=Number(position?.x),y=Number(position?.y);
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<-50||x>50||y<-40||y>40)throw Error('좌표가 범위를 벗어났습니다.');
  const {axis,delta}=moves[direction];
  const next={x,y};next[axis]=Math.max(axis==='x'?-50:-40,Math.min(axis==='x'?50:40,next[axis]+delta));
  return {direction,axis,delta:next[axis]-position[axis],position:next};
 }
 const api={move,moves};if(typeof module==='object'&&module.exports)module.exports=api;root.CTMWedoController=api;
})(typeof window==='object'?window:globalThis);

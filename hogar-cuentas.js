/* Cálculos del hogar. No importa ni sincroniza datos de Mensajería. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  if(root) root.HogarMath=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
  'use strict';
  function sum(items,fn){return items.reduce((acc,x)=>acc+fn(x),0)}
  function calculate(record){
    const home=(record.expenses||[]).filter(e=>e.scope==='Hogar');
    const homeTotal=sum(home,e=>Number(e.amount)||0);
    const personalTotal=sum((record.expenses||[]).filter(e=>e.scope==='Personal'),e=>Number(e.amount)||0);
    const wifeShare=sum(home,e=>(Number(e.amount)||0)-Math.round((Number(e.amount)||0)*(Number(e.luisPct)||0)/100));
    const luisShare=homeTotal-wifeShare;
    const wifePaid=sum(home.filter(e=>e.paidBy==='WIFE'),e=>Number(e.amount)||0);
    const luisPaid=sum(home.filter(e=>e.paidBy==='LUIS'),e=>Number(e.amount)||0);
    const unknownCount=home.filter(e=>e.paidBy==='UNKNOWN').length;
    const settlements=Array.isArray(record.settlements)?record.settlements:[];
    const wifeToLuis=sum(settlements.filter(x=>x.direction==='WIFE_TO_LUIS'),x=>Number(x.amount)||0);
    const luisToWife=sum(settlements.filter(x=>x.direction==='LUIS_TO_WIFE'),x=>Number(x.amount)||0);
    // El pago directo de Maybelin cuenta a su favor. Los envíos entre cónyuges no son ingresos ni gastos.
    const balance=wifeShare-wifePaid-wifeToLuis+luisToWife;
    const hasBudget=record.budgetHome!==null && record.budgetHome!==undefined && record.budgetHome!=='' && Number.isFinite(Number(record.budgetHome));
    const budget=hasBudget?Math.max(0,Math.round(Number(record.budgetHome))):null;
    const target=hasBudget?Math.max(budget,homeTotal):null;
    const pendingProjected=hasBudget?Math.max(0,target-homeTotal):null;
    const projectedBalance=hasBudget?balance+Math.round(pendingProjected/2):null;
    return {homeTotal,personalTotal,wifeShare,luisShare,wifePaid,luisPaid,unknownCount,wifeToLuis,luisToWife,balance,hasBudget,budget,target,pendingProjected,projectedBalance};
  }
  return {calculate};
});

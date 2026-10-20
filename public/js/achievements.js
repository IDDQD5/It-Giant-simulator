/**
 * IT Giant Simulator — Achievements System
 */
(function(){'use strict';window.ITG=window.ITG||{};
const A=[
{id:'first_product',icon:'🚀',nE:'First Launch',nR:'Первый запуск',dE:'Launch your first product',dR:'Выпустить первый продукт',c:gs=>(gs.products||[]).some(p=>(p.totalUnitsSold||p.sales||0)>0||p.lifecycle==='launched'),r:{money:100000}},
{id:'sell_10k',icon:'📦',nE:'First 10K Units',nR:'Первые 10K продаж',dE:'Sell 10,000 total units',dR:'Продать 10 000 единиц',c:gs=>(gs.products||[]).reduce((s,p)=>s+(p.totalUnitsSold||p.sales||0),0)>=10000,r:{money:200000}},
{id:'sell_100k',icon:'🎯',nE:'Mass Market',nR:'Массовый рынок',dE:'Sell 100,000 units',dR:'Продать 100 000 единиц',c:gs=>(gs.products||[]).reduce((s,p)=>s+(p.totalUnitsSold||p.sales||0),0)>=100000,r:{money:500000}},
{id:'sell_1m',icon:'🏆',nE:'Market Dominance',nR:'Господство',dE:'Sell 1,000,000 units',dR:'Продать 1 млн единиц',c:gs=>(gs.products||[]).reduce((s,p)=>s+(p.totalUnitsSold||p.sales||0),0)>=1000000,r:{reputation:20}},
{id:'rev_10m',icon:'💰',nE:'Millionaire',nR:'Миллионер',dE:'Reach $10M total revenue',dR:'Накопить $10 млн выручки',c:gs=>((gs.finance&&gs.finance.totalRevenue)||0)>=10000000,r:{money:250000}},
{id:'rev_50m',icon:'💎',nE:'Tycoon',nR:'Магнат',dE:'Reach $50M total revenue',dR:'Накопить $50 млн выручки',c:gs=>((gs.finance&&gs.finance.totalRevenue)||0)>=50000000,r:{reputation:15}},
{id:'first_tech',icon:'🔬',nE:'First Innovation',nR:'Первая инновация',dE:'Complete first research',dR:'Завершить первое исследование',c:gs=>((gs.company&&gs.company.unlockedTechs||[]).length)>=1,r:{money:50000}},
{id:'three_tech',icon:'🧬',nE:'R&D Pioneer',nR:'Пионер НИОКР',dE:'Complete 3 researches',dR:'Завершить 3 исследования',c:gs=>((gs.company&&gs.company.unlockedTechs||[]).length)>=3,r:{money:100000}},
{id:'five_tech',icon:'🎓',nE:'Tech Scholar',nR:'Учёный',dE:'Complete 5 researches',dR:'Завершить 5 исследований',c:gs=>((gs.company&&gs.company.unlockedTechs||[]).length)>=5,r:{money:200000}},
{id:'share_25',icon:'📊',nE:'Rising Star',nR:'Восходящая звезда',dE:'Reach 25% market share',dR:'Достичь 25% рынка',c:gs=>((gs.company&&gs.company._marketShare)||0)>=25,r:{money:300000}},
{id:'share_50',icon:'🌐',nE:'Market Leader',nR:'Лидер рынка',dE:'Reach 50% market share',dR:'Достичь 50% рынка',c:gs=>((gs.company&&gs.company._marketShare)||0)>=50,r:{reputation:20}},
{id:'capital_10m',icon:'🏦',nE:'Cash Rich',nR:'Богатая казна',dE:'Accumulate $10M cash',dR:'Накопить $10 млн',c:gs=>((gs.company&&gs.company.money)||0)>=10000000,r:{reputation:5}},
{id:'capital_50m',icon:'🏛️',nE:'Corporate Giant',nR:'Корпоративный гигант',dE:'Accumulate $50M cash',dR:'Накопить $50 млн',c:gs=>((gs.company&&gs.company.money)||0)>=50000000,r:{reputation:10}},
{id:'five_products',icon:'🖥️',nE:'Product Lineup',nR:'Линейка продуктов',dE:'Have 5 products on market',dR:'Иметь 5 продуктов на рынке',c:gs=>(gs.products||[]).filter(p=>p.lifecycle==='launched').length>=5,r:{money:150000}},
{id:'big_team',icon:'👥',nE:'Growing Company',nR:'Растущая компания',dE:'Employ 15+ staff',dR:'15+ сотрудников',c:gs=>{const e=gs.company&&gs.company.employees||{};return((e.engineers||0)+(e.designers||0)+(e.marketers||0))>=15;},r:{money:100000}},
{id:'survive_crisis',icon:'🔥',nE:'Crisis Survivor',nR:'Выживший',dE:'Survive 3 negative events',dR:'Пережить 3 кризиса',c:gs=>((gs.market&&gs.market._negativeEventsSurvived)||0)>=3,r:{reputation:10}},
{id:'year_two',icon:'📅',nE:'Second Year',nR:'Второй год',dE:'Reach Year 2',dR:'Достичь 2-го года',c:gs=>((gs.meta&&gs.meta.year)||1)>=2,r:{money:200000}},
{id:'year_four',icon:'🗓️',nE:'Veteran',nR:'Ветеран',dE:'Reach Year 4',dR:'Достичь 4-го года',c:gs=>((gs.meta&&gs.meta.year)||1)>=4,r:{reputation:15}},
{id:'profit_streak',icon:'📈',nE:'Profitable Year',nR:'Прибыльный год',dE:'52 weeks profitable',dR:'52 недели прибыли',c:gs=>((gs.finance&&gs.finance._profitStreak)||0)>=52,r:{money:500000}},
];
let u={};const K='itg_ach';
function init(){try{const r=localStorage.getItem(K);if(r)u=JSON.parse(r)||{};}catch(e){u={};}}
function sv(){try{localStorage.setItem(K,JSON.stringify(u));}catch(e){}}
function checkAll(gs){const n=[];A.forEach(a=>{if(u[a.id])return;try{if(a.c(gs)){u[a.id]={date:Date.now()};n.push(a);if(a.r&&gs.company){if(a.r.money)gs.company.money=(gs.company.money||0)+a.r.money;if(a.r.reputation)gs.company.reputation=Math.min(100,(gs.company.reputation||0)+a.r.reputation);}}}catch(e){}});
if(n.length>0){sv();n.forEach(a=>{if(window.ITG.Sound)window.ITG.Sound.play('achievement');if(window.ITG.EventBus){const isRu=window.ITG.I18n&&window.ITG.I18n.getLanguage()==='ru';const nm=isRu?a.nR:a.nE;window.ITG.EventBus.emit('toast:show',{message:'🏆 '+nm,type:'success'});}});}
return n;}
function getList(){const isRu=window.ITG&&window.ITG.I18n&&window.ITG.I18n.getLanguage()==='ru';return A.map(a=>({id:a.id,icon:a.icon,name:isRu?a.nR:a.nE,desc:isRu?a.dR:a.dE,unlocked:!!u[a.id]}));}
function getUnlockedCount(){return Object.keys(u).length;}
function getTotalCount(){return A.length;}
function isUnlocked(id){return!!u[id];}
function reset(){u={};sv();}
window.ITG.Achievements={init,checkAll,getList,getUnlockedCount,getTotalCount,isUnlocked,reset};
})();

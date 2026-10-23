import test from 'node:test';import assert from 'node:assert/strict';import {loopGain} from '../public/climbing.mjs';import {generatePlan} from '../public/domain.mjs';
const base={start:'2026-12-07',raceDate:'2027-06-05',raceMiles:50,base:30,peak:45,longest:10,longCap:25,runDays:[2,3,4,6,0],longDay:6,quality:true,qualityMinutes:10,focus:'Hilly technical trail',climbing:true,raceGain:7200,currentGain:2000,peakGain:5000,currentLongGain:1000,longGainCap:3000,gainStep:200};
test('four loops calculate total without assuming descent',()=>{assert.equal(loopGain(4,1800),7200);assert.equal(loopGain('',''),null);assert.throws(()=>loopGain(4,''));assert.throws(()=>loopGain(1.5,100));});
test('climbing targets obey weekly and long limits, retain unknown descent and match race gain',()=>{const {items,warnings}=generatePlan(base);for(let i=0;i<items.length-1;i+=7){const week=items.slice(i,Math.min(i+7,items.length-1));assert.ok(week.reduce((s,w)=>s+(w.ascentFeet||0),0)<=5000);assert.ok(week.every(w=>w.ascentFeet<=3000));assert.ok(week.every(w=>w.descentFeet==null));}assert.equal(items.at(-1).ascentFeet,7200);assert.ok(warnings.some(w=>w.includes('144 ft/mi')));assert.ok(items.some(w=>w.kind==='Long'&&w.ascentFeet>1000));assert.ok(items.filter(w=>w.phase==='Taper').every(w=>!w.qualityMinutes));});
test('zero increment holds gain budgets and flat-course reference reduces targets; unknown baseline rejects',()=>{const a=generatePlan({...base,gainStep:0}).items;for(let i=0;i<a.length-1;i+=7)assert.ok(a.slice(i,Math.min(i+7,a.length-1)).reduce((s,w)=>s+(w.ascentFeet||0),0)<=2000);const b=generatePlan({...base,raceGain:1000}).items;assert.ok(b.filter(w=>w.kind==='Long').every(w=>w.ascentFeet<=w.miles*20));assert.throws(()=>generatePlan({...base,currentGain:''}));assert.throws(()=>generatePlan({...base,longGainCap:500}));assert.ok(generatePlan({...base,climbing:false}).items.filter(w=>w.kind==='Long').every(w=>w.ascentFeet==null));});
test('cutbacks do not consume alternating mileage/climbing turns; harder minutes do not cap distance',()=>{
 const input={...base,start:'2026-12-01',base:20,peak:60,longest:9,longCap:22,backToBack:true,secondCap:10,currentGain:1000,currentLongGain:1000,gainStep:200};
 const result=generatePlan({...input,qualityMinutes:12}),other=generatePlan({...input,qualityMinutes:60});
 const turns=result.summary.weeks.filter(w=>w.mileageBuild||w.climbingBuild);
 assert.ok(turns.length>10);
 turns.forEach((w,i)=>{assert.equal(w.mileageBuild,i%2===0);assert.equal(w.climbingBuild,i%2===1);assert.ok(!['Cutback','Taper'].includes(w.phase));});
 assert.deepEqual(result.items.map(w=>w.miles),other.items.map(w=>w.miles));
 assert.ok(Math.max(...result.items.filter(w=>w.kind==='Long').map(w=>w.miles))>13.4);
 assert.ok(result.summary.maxWeeklyGain<=input.peakGain);
 for(const w of result.summary.weeks)assert.ok(w.actualMiles<=w.budget+.01);
});

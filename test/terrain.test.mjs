import test from 'node:test';
import assert from 'node:assert/strict';
import {generatePlan,alternatives,day} from '../public/domain.mjs';
const input={start:'2026-01-05',raceDate:'2026-07-05',base:70,peak:90,longest:25,longCap:30,secondCap:15,raceMiles:100,runDays:[2,3,4,6,0],longDay:6,quality:true,qualityMinutes:12,backToBack:true,focus:'Sustained runnable endurance'};
test('sustained ultra supports deliberate 30/15 pairs with no stacked quality or taper pairs',()=>{
 const {items}=generatePlan(input),pairs=items.filter(x=>x.kind==='Back-to-back');assert.ok(pairs.some(x=>x.miles===15));
 for(const p of pairs){const first=items.find(x=>x.date===day(p.date,-1));assert.equal(first.kind,'Long');assert.ok(first.miles<=30);assert.equal(first.pairDate,p.date);assert.equal(p.phase,'Build');assert.ok(!items.filter(x=>x.date>=day(first.date,-5)&&x.date<=p.date).some(x=>x.qualityMinutes));}
 for(let w=0;w<26;w++){const block=items.filter(x=>x.date>=day(input.start,w*7)&&x.date<day(input.start,(w+1)*7)&&x.kind!=='Race');assert.ok(block.reduce((n,x)=>n+x.miles,0)<=90+.001);}
});
test('trail and sustained plans have different repeatable rotations and quiet taper',()=>{
 const trail=generatePlan({...input,backToBack:false,focus:'Hilly technical trail'}).items;
 for(const k of ['Hill repeats','Sustained climb','Hills','Tempo','Technical trail','Downhill skills'])assert.ok(trail.some(x=>x.kind===k),k);
 assert.ok(trail.filter(x=>['Taper','Cutback'].includes(x.phase)).every(x=>!x.qualityMinutes&&!['Back-to-back','Downhill skills'].includes(x.kind)));
 assert.deepEqual(trail,generatePlan({...input,backToBack:false,focus:'Hilly technical trail'}).items);
 const steady=generatePlan({...input,backToBack:false}).items;assert.ok(steady.some(x=>x.kind==='Progression'));assert.ok(!steady.some(x=>x.kind==='Hill repeats'));
});
test('wheel preserves climbing, terrain, intensity and pair relationship',()=>{
 const w={kind:'Hill repeats',status:'Planned',miles:7,minutes:80,ascentFeet:900,descentFeet:900,qualityMinutes:12,terrain:'Trail',pairDate:'2026-03-01',details:'6 x 2 minutes with easy recovery'};
 for(const a of alternatives(w))for(const k of ['kind','miles','minutes','ascentFeet','descentFeet','qualityMinutes','terrain','pairDate'])assert.equal(a[k],w[k]);
 assert.equal(alternatives({...w,status:'Skipped'}).length,0);
});
test('invalid paired days and quality budgets are rejected; short windows disclose no pair',()=>{
 assert.throws(()=>generatePlan({...input,runDays:[1,2,3,6]}));assert.throws(()=>generatePlan({...input,secondCap:35}));assert.throws(()=>generatePlan({...input,qualityMinutes:0}));
 const draft=generatePlan({...input,raceDate:'2026-02-02'});assert.ok(draft.warnings.some(x=>x.includes('No back-to-back')));
});

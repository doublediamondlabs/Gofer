import test from 'node:test';
import assert from 'node:assert/strict';
import {backyardConfig,STANDARD_YARD} from '../public/backyard.mjs';
import {generatePlan,alternatives} from '../public/domain.mjs';
import {draftSummaryMarkup} from '../public/draft-summary.mjs';
const input={format:'Backyard',raceName:'Answer the bell',start:'2026-12-01',raceDate:'2027-06-05',base:20,peak:50,longest:7,runDays:[2,3,4,6,0],longDay:6,peakYards:6,peakIncreasePercent:10,backyardGoal:24,rehearsalEvery:2};
test('standard yards total exactly 100 miles in 24 hourly intervals, with walking included in moving pace',()=>{
 const c=backyardConfig({});assert.equal(c.goalMiles,100);assert.equal(c.movingPace,'12:00');assert.equal(c.resetMinutes,10);
 assert.equal(backyardConfig({backyardGoalUnit:'hours',backyardGoal:12,restartMinutes:90}).goalYards,8);
 assert.throws(()=>backyardConfig({backyardGoalUnit:'hours',backyardGoal:1,restartMinutes:90}),/whole/);
 for(const v of [60,70,0,NaN])assert.throws(()=>backyardConfig({yardMinutes:v}));
 assert.throws(()=>backyardConfig({yardMiles:Infinity}));assert.throws(()=>backyardConfig({yardGain:-1}));
});
test('Backyard goal does not scale training load; rehearsals replace long runs within budgets',()=>{
 const r=generatePlan(input),more=generatePlan({...input,backyardGoal:48});
 assert.deepEqual(r.items.filter(w=>w.kind!=='Race'),more.items.filter(w=>w.kind!=='Race').map(w=>w.backyard?({...w,backyard:{...w.backyard,goalYards:24,goalHours:24,goalMiles:100}}):w));
 const reps=r.items.filter(w=>w.kind==='Backyard');assert.ok(reps.length>2);assert.equal(reps.at(-1).backyard.yards,6);assert.equal(reps.at(-1).miles,25);assert.equal(reps.at(-1).minutes,300);assert.equal(reps.at(-1).backyard.elapsedMinutes,350);assert.equal(reps.at(-1).backyard.blockMinutes,360);
 assert.ok(reps.every(w=>!['Cutback','Taper'].includes(w.phase)));assert.ok(reps.every(w=>alternatives(w).length===0));
 assert.ok(r.summary.weeks.every(w=>w.actualMiles<=w.budget+.05));
 assert.ok(!r.items.some(w=>w.kind==='Back-to-back'||w.qualityMinutes));
 assert.equal(r.items.at(-1).miles,100);assert.match(r.items.at(-1).details,/not a fixed race finish/);
 assert.match(draftSummaryMarkup(r.items,{input,summary:r.summary}),/Longest rehearsal/);
});
test('custom yards retain precise timing and gain; impossible goals stop instead of silently clipping',()=>{
 const r=generatePlan({...input,yardMiles:4,restartMinutes:90,yardMinutes:65,yardGain:500});
 const peak=r.items.filter(w=>w.kind==='Backyard').at(-1);assert.equal(peak.miles,24);assert.equal(peak.ascentFeet,3000);assert.equal(peak.backyard.elapsedMinutes,515);
 assert.throws(()=>generatePlan({...input,peakYards:30}),/rehearsal yards/);
 assert.throws(()=>generatePlan({...input,backyardGoal:4}),/at or below/);
 assert.throws(()=>generatePlan({...input,peak:22}),/room/);
 assert.throws(()=>generatePlan({...input,raceDate:'2027-01-10'}));
 assert.throws(()=>generatePlan({...input,peakIncreasePercent:1}),/review limit/);
 assert.equal(STANDARD_YARD*6,25);
});

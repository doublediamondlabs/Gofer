import {day,pace,generatePlan} from './domain.mjs';
export const STANDARD_YARD=25/6;
const fail=(field,message)=>{throw Object.assign(Error(message),{field});};
export function backyardConfig(input){
 const yardMiles=Number(input.yardMiles??STANDARD_YARD),restartMinutes=Number(input.restartMinutes??60),yardMinutes=Number(input.yardMinutes??50),goal=Number(input.backyardGoal??24),unit=input.backyardGoalUnit||'yards';
 if(!Number.isFinite(yardMiles)||yardMiles<.1||yardMiles>20)fail('yardMiles','Enter a yard distance from 0.1 to 20 miles.');
 if(!Number.isFinite(restartMinutes)||restartMinutes<10||restartMinutes>180)fail('restartMinutes','Choose a restart interval from 10 to 180 minutes.');
 if(!Number.isFinite(yardMinutes)||yardMinutes<=0||yardMinutes>=restartMinutes)fail('yardMinutes','Your moving time must leave time before the next start.');
 if(!['yards','hours'].includes(unit)||!Number.isFinite(goal)||goal<=0)fail('backyardGoal','Enter a positive goal in yards or hours.');
 const raw=unit==='hours'?goal*60/restartMinutes:goal,yards=Math.round(raw);
 if(Math.abs(raw-yards)>1e-7||yards<1||yards>240)fail('backyardGoal','Choose a goal covering 1–240 complete yards. Hours must divide into whole restart intervals.');
 const gain=input.yardGain===''||input.yardGain==null?null:Number(input.yardGain);
 if(gain!=null&&(!Number.isFinite(gain)||gain<0))fail('yardGain','Yard climbing must be zero or a positive number, or left blank.');
 return {yardMiles,restartMinutes,yardMinutes,resetMinutes:restartMinutes-yardMinutes,goalYards:yards,goalHours:yards*restartMinutes/60,goalMiles:yards*yardMiles,yardGain:gain,movingPace:pace(yardMinutes,yardMiles)};
}
export function generateBackyardPlan(input){
 const c=backyardConfig(input),peakYards=Number(input.peakYards),every=Number(input.rehearsalEvery??2);
 if(!Number.isInteger(peakYards)||peakYards<1||peakYards>24||peakYards*c.yardMiles>60)fail('peakYards','Choose 1–24 rehearsal yards, totaling no more than 60 miles.');
 if(peakYards>c.goalYards)fail('peakYards','Keep your longest rehearsal at or below your race goal.');
 if(![1,2,3].includes(every))fail('rehearsalEvery','Choose a rehearsal every 1, 2 or 3 build weeks.');
 const cap=Math.ceil(peakYards*c.yardMiles*10-1e-8)/10;
 if(Number(input.longest)>cap)fail('peakYards','Your rehearsal goal is shorter than your current long run. Increase the rehearsal goal or revise the starting long run.');
 // Reuse the endurance budget engine, explicitly independent of the open-ended race goal.
 const result=generatePlan({...input,format:'Distance',raceMiles:50,planMode:'goals',peakLongMin:cap,longCap:cap,peakRunCount:1,quality:false,backToBack:false,climbing:false,qualityMinutes:10});
 let eligible=0;const rehearsals=[];
 for(const week of result.summary.weeks){
  const w=result.items.find(w=>w.date===week.longDate&&w.kind==='Long');
  if(!w||!['Base','Build'].includes(week.phase))continue;
  const use=week.goalPeak||eligible++%every===0;
  const count=Math.min(peakYards,Math.floor((w.miles+1e-8)/c.yardMiles));
  if(!use||count<1)continue;
  const miles=count*c.yardMiles,moving=count*c.yardMinutes,elapsed=(count-1)*c.restartMinutes+c.yardMinutes;
  const theme=['Fuel and bottle routine','Walk/run rhythm and even effort','Gear check and restart routine'][rehearsals.length%3];
  Object.assign(w,{kind:'Backyard',title:`Backyard · ${count} yard${count===1?'':'s'} · ${c.restartMinutes}-min starts`,miles:Math.round(miles*1e6)/1e6,minutes:moving,loops:String(count),backyard:{...c,yards:count,elapsedMinutes:elapsed,blockMinutes:count*c.restartMinutes},pace:`${c.movingPace}/mi moving · ${c.yardMinutes} min/yard`,ascentFeet:c.yardGain==null?null:count*c.yardGain,
   details:`${count} × ${c.yardMiles.toFixed(4)} mi. Start at elapsed 0${count>1?`, then every ${c.restartMinutes} minutes through ${(count-1)*c.restartMinutes} minutes`:''}. Aim for ${c.yardMinutes} minutes moving per yard (${c.movingPace}/mi average including walking), leaving ${c.resetMinutes} minutes before the next bell. Finish the final yard by ${elapsed} minutes; reserve ${count*c.restartMinutes} minutes including the final reset. ${theme}: rehearse familiar food, measured fluids and quick checks; note what worked. Match effort to terrain; the pace is your entered timing model, not a fitness-derived prescription. ${input.courseNeeds||''}${week.goalPeak?' Longest planned rehearsal; protect recovery around it.':''}`});
  week.longMiles=w.miles;rehearsals.push({date:w.date,yards:count,miles:w.miles,elapsedMinutes:elapsed,blockMinutes:count*c.restartMinutes,ascentFeet:w.ascentFeet});
 }
 if(!rehearsals.some(w=>w.yards===peakYards))fail('start','The full rehearsal goal does not fit before taper. Start earlier or change the long-run day.');
 for(const week of result.summary.weeks){const from=day(input.start,(week.week-1)*7),to=day(from,7);week.actualMiles=Math.round(result.items.filter(w=>w.kind!=='Race'&&w.date>=from&&w.date<to).reduce((s,w)=>s+(w.miles||0),0)*10)/10;}
 const race=result.items.find(w=>w.kind==='Race');Object.assign(race,{miles:Math.round(c.goalMiles*1e6)/1e6,minutes:null,ascentFeet:c.yardGain==null?null:c.goalYards*c.yardGain,loops:String(c.goalYards),backyard:{...c,yards:c.goalYards,raceGoal:true},title:`${input.raceName||'Backyard race'} · ${c.goalYards}-yard personal goal`,details:`Personal goal: ${c.goalYards} yards / ${c.goalHours} scheduled hours / ${c.goalMiles.toFixed(2)} mi. This is not a fixed race finish or a predicted result. Starts every ${c.restartMinutes} minutes; moving target ${c.yardMinutes} minutes and reset ${c.resetMinutes} minutes. Confirm event rules and cutoffs with the organizer.`});
 result.summary.profile='Backyard endurance';result.summary.backyard={...c,peakYards,rehearsals,every};
 result.summary.goals.peakRuns=result.summary.weeks.filter(w=>w.goalPeak).map(w=>({date:w.longDate,miles:w.longMiles,weeklyMiles:w.actualMiles}));
 result.warnings=[
  'Backyard goals describe your intended number of starts, not a race finish time. Training volume is set independently from that goal.',
  `Endurance budgets build toward your ${peakYards}-yard rehearsal with a three-week taper. Rehearsals replace, rather than add to, selected long runs. Every fourth week is a cutback; cutback and taper long runs stay continuous and easy.`,
  `Whole yards round a rehearsal down within its mileage budget. This can create a noticeable one-yard step; review each rehearsal date, duration and recovery. Build-step limits apply to underlying mileage budgets, not percentage changes in yard counts.`,
  'No speed sessions or back-to-back endurance pairs are added in this mode. Easy terrain practice remains available; night running and sleep deprivation are not automatically scheduled.',
  'Per-yard climbing is an optional route choice you enter, not inferred from race mileage. Other workouts have no automatic climbing targets. Unknown gain stays unknown.',
  `Required budget growth: ${(result.summary.goals.weeklyRate*100).toFixed(1)}% weekly-mileage build steps and up to ${(result.summary.goals.maxLongRate*100).toFixed(1)}% long-run build steps. Review against your experience; this software model is not a fitness assessment.`
 ];
 return result;
}

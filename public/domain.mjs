import {generateBackyardPlan} from './backyard.mjs';
import {raceProfile} from './race-profiles.mjs';
import {peakGoalSchedule} from './peak-goals.mjs';
import {climbingConfig,allocateClimbing} from './climbing.mjs';
export const kinds=['Easy','Long','Recovery','Fartlek','Tempo','Hills','Hill repeats','Sustained climb','Technical trail','Downhill skills','Steady','Progression','Intervals','Back-to-back','Strength','Walk / hike','Backyard','Rest','Race'];
export const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const day=(s,n=0)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d);};
export const daysBetween=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
export const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function duration(s){if(!String(s).trim())return null;if(!/^\d{1,4}:[0-5]\d(?::[0-5]\d)?$/.test(s))throw Error('Use hours:minutes or hours:minutes:seconds, such as 30:00.');const a=s.split(':').map(Number);return a[0]*60+a[1]+(a[2]||0)/60;}
export function pace(minutes,miles){if(!(minutes>0&&miles>0))return '—';let seconds=Math.round(minutes/miles*60);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
export const OZ_ML=29.5735295625;
export function mixNutrition(ingredients){const keys=['calories','carbs','protein','fat','sodium','caffeine'];if(!ingredients.length)throw Error('Choose at least one mix ingredient.');return Object.fromEntries(keys.map(k=>[k,ingredients.some(x=>x.food[k]==null)?null:Math.round(ingredients.reduce((sum,x)=>sum+x.food[k]*x.servings,0)*1000)/1000]));}
export function consumedServings(amount,unit,fluidMl){if(!(amount>0&&Number.isFinite(amount)))throw Error('Enter a positive consumed amount.');if(unit==='servings')return amount;if(!(fluidMl>0))throw Error('This food has no serving volume. Log servings, or set its bottle volume first.');return amount*(unit==='fl oz'?OZ_ML:1)/fluidMl;}
export function heads(records){const unique=new Map();for(const r of records){if(unique.has(r.rev)&&JSON.stringify(unique.get(r.rev))!==JSON.stringify(r))throw Error('Two records use the same revision with different contents.');unique.set(r.rev,r);}const list=[...unique.values()];return list.filter(r=>!list.some(other=>other.rev!==r.rev&&other.ancestors.includes(r.rev)));}
export function mergeRecords(local,remote){const groups=new Map();for(const r of [...local,...remote]){const list=groups.get(r.id)||[];list.push(r);groups.set(r.id,list);}return [...groups.values()].flatMap(heads);}
export function current(records){const groups=new Map();for(const r of records){const list=groups.get(r.id)||[];list.push(r);groups.set(r.id,list);}return {items:[...groups.values()].filter(a=>a.length===1&&!a[0].deleted).map(a=>({...a[0].data,id:a[0].id,rev:a[0].rev})),conflicts:[...groups.entries()].filter(([,a])=>a.length>1).map(([id,choices])=>({id,choices}))};}
export function revise(existing,id,data,deleted=false){const prior=existing.filter(r=>r.id===id);return {id,rev:crypto.randomUUID(),ancestors:[...new Set(prior.flatMap(r=>[r.rev,...r.ancestors]))],data,deleted,at:new Date().toISOString()};}
export function validateRecords(records){if(!Array.isArray(records)||records.length>25000)throw Error('Invalid record list.');const id=/^[a-zA-Z0-9-]{1,80}$/;for(const r of records){if(!r||!id.test(r.id)||!id.test(r.rev)||!Array.isArray(r.ancestors)||r.ancestors.length>20000||!r.ancestors.every(x=>id.test(x))||r.ancestors.includes(r.rev)||typeof r.deleted!=='boolean'||!r.data||typeof r.data!=='object'||Array.isArray(r.data)||!['profile','race','workout','food','intake','gear'].includes(r.data.type))throw Error('Invalid backup record.');}return records;}
export const focusOptions=['Balanced','Sustained runnable endurance','Hilly technical trail'];
export const sessionNotes={
 'Hill repeats':'Repeat a familiar runnable uphill at controlled effort; walk or jog down easily. Keep the same hill grade, repetition duration, recovery and established work budget. No downhill racing.',
 'Sustained climb':'Practice continuous comfortable climbing and purposeful hiking on steeper grades. Choose a route within your established climbing tolerance. Keep descents controlled.',
 'Hills':'Run a rolling route at even effort rather than even pace. Walk steeper climbs if needed; keep downhill running controlled.',
 'Technical trail':'Easy trail practice: look ahead, choose lines and shorten steps over uneven ground. Walk obstacles outside your comfort level. This is skill practice, not a speed test.',
 'Downhill skills':'Short, familiar gentle descents with controlled foot placement, included within an easy run. No downhill sprints. Introduce gradually; shorten if form deteriorates.',
 'Steady':'Practice sustained, comfortable aerobic running on terrain similar to the race. Keep effort controlled; this is not a time trial.',
 'Tempo':'Controlled comfortably-hard blocks with easy recovery. Use your established tempo effort and work budget; do not run the whole session hard.',
 'Intervals':'Controlled repetitions with easy recovery. Use familiar repetition lengths and your established work budget, not all-out speed.',
 'Progression':'Start easy and gradually finish at a controlled steady effort within your established work budget. No sprint finish.',
 'Fartlek':'Controlled pickups separated by easy running. Vary the arrangement, not the total harder-work budget.',
 'Long':'Comfortable sustained effort. Practice race fueling, fluids, gear and planned walking breaks.',
 'Back-to-back':'Second endurance day of a deliberate back-to-back pair. Easy effort on tired legs; this is NOT a recovery run. Shorten or stop if recovery or form is poor.',
 'Recovery':'Short relaxed running; shorten further or rest if needed.',
 'Easy':'Conversational effort. The target is adjustable.',
 'Rest':'Rest or comfortable mobility.'
};
export function alternatives(w){
 if(w.locked||w.status!=='Planned'||['Rest','Race','Strength','Walk / hike','Backyard'].includes(w.kind))return [];
 const choices={
 'Hill repeats':['Same hill, different starting landmark','Comparable hill, same grade and footing'],
 'Sustained climb':['Familiar continuous climb','Comparable sustained climb with the same grade'],
 'Hills':['Comparable rolling loop','Reverse a familiar rolling route only if grades remain suitable'],
 'Technical trail':['Familiar trail with comparable obstacles','Different easy trail with comparable footing'],
 'Downhill skills':['Same gentle descent, different landmarks','Comparable familiar gentle descent'],
 'Fartlek':['Landmark pickups','Timed pickups','Music pickups within the same work budget'],
 'Tempo':['Familiar loop tempo blocks','Out-and-back tempo blocks'],
 'Intervals':['Measured loop repetitions','Measured out-and-back repetitions'],
 'Progression':['Loop progression','Out-and-back progression'],
 'Long':['Race-like loop rehearsal','Race-like out-and-back rehearsal'],
 'Back-to-back':['Familiar easy endurance loop','Comparable easy out-and-back']};
 return (choices[w.kind]||['Comparable familiar loop','Comparable out-and-back']).map(label=>({...w,title:label+' · '+(w.miles!=null?w.miles+' mi':w.minutes!=null?w.minutes+' min':w.kind),details:`${w.details||''}\nAlternate: ${label}. Preserve distance/time, effort, climbing target, footing, harder-work budget and recovery. Keep warmup/cooldown inside the total.`,alternateOf:w.title}));
}
export function generatePlan(input){
 if(input.format==='Backyard')return generateBackyardPlan(input);
 const {start,raceDate}=input;if(!validDate(start)||!validDate(raceDate))throw Error('Choose valid start and race dates.');
 const span=daysBetween(start,raceDate);if(span<28||span>366)throw Error('Use a preparation window of 4–52 weeks.');
 const base=Number(input.base),peak=Number(input.peak),longest=Number(input.longest),raceMiles=Number(input.raceMiles),runDays=[...new Set(input.runDays.map(Number))],longDay=Number(input.longDay);
 if(!(base>=3&&base<=150&&peak>=base&&peak<=180&&longest>0&&longest<=base&&raceMiles>=3&&raceMiles<=200))throw Error('Check current weekly miles, longest run, peak miles, and race distance.');
 if(runDays.length<3||runDays.length>6||!runDays.includes(longDay)||runDays.some(x=>x<0||x>6))throw Error('Choose 3–6 running days including your long-run day.');
 const focus=focusOptions.includes(input.focus)?input.focus:'Balanced',b2b=!!input.backToBack;
 const profile=raceProfile(raceMiles);
 const cap=Number(input.longCap||profile.high),secondCap=Number(input.secondCap||0),qualityMinutes=Number(input.qualityMinutes||0);
 if(!(cap>0&&cap<=60))throw Error('Set a long-run ceiling between 0 and 60 miles.');
 if(b2b&&(!(secondCap>0&&secondCap<=cap)||!runDays.includes((longDay+1)%7)||raceMiles<=27))throw Error('Back-to-backs need an ultra-distance race above 27 miles, the following day selected, and a second-day ceiling no higher than the long-run ceiling.');
 if(input.quality&&!(qualityMinutes>=1&&qualityMinutes<=60))throw Error('Enter an established harder-work budget of 1–60 minutes, or turn quality sessions off.');
 const weeks=Math.ceil(span/7),taper=profile.taper,buildWeeks=Math.max(1,weeks-taper),warnings=['Editable scheduling draft, not an individually validated coaching prescription. Distance, climbing and intensity interact; review all three before adopting.','Long-run ceilings are limits, not promised targets. The weekly budget and gradual build may keep runs below them.'];
 if(b2b)warnings.push('Back-to-backs occur on alternating eligible build weeks only, replace that week’s quality session, and never appear in cutbacks or taper. The second day is endurance, not recovery. Pairs crossing a draft-week boundary are omitted.');
 if(focus==='Hilly technical trail')warnings.push('Trail pace follows effort. Course elevation does not automatically prescribe training elevation; set established ascent/descent limits on individual workouts.');
 const rotations=focus==='Hilly technical trail'?['Hill repeats','Sustained climb','Hills','Tempo']:focus==='Sustained runnable endurance'?['Steady','Tempo','Progression','Fartlek']:profile.rotation;
 const climbing=climbingConfig(input);if(climbing)warnings.push(`Course climbing density: ${Math.round(climbing.density)} ft/mi. Ascent targets use your entered budgets and ceilings. Positive climbing increases alternate with mileage-build weeks; zero climbing increase leaves mileage-build weeks available; these rules are draft scheduling heuristics, not coaching validation. Descent remains unknown.`);
 const growClimbing=!!climbing&&climbing.gainStep>0;
 const growthWeeks=[];let turn=0;
 for(let w=1;w<buildWeeks;w++)if(w%4!==3){if(!growClimbing||turn%2===0)growthWeeks.push(w);turn++;}
 const goals=peakGoalSchedule(input,weeks,buildWeeks,growthWeeks);
 if(goals)warnings.push(`Chosen-peak mode models your requested targets rather than using the fixed 5% mileage rule. Weekly build steps require about ${(goals.weeklyRate*100).toFixed(1)}% growth; review the full schedule, recovery and peak dates. This calculation does not establish that the progression is appropriate for you.`);
 const floor=x=>Math.floor((x+1e-8)*10)/10,items=[];let build=base,rotation=0,pairCount=0,gainBuild=climbing?.currentGain||0,longGainBuild=climbing?.currentLongGain||0;const gainTotals=[],weekStats=[];let growthTurn=0;
 for(let week=0;week<weeks;week++){
  const eligible=week>0&&week<buildWeeks&&week%4!==3;
  const mileageBuild=eligible&&(!growClimbing||growthTurn%2===0),climbingBuild=eligible&&growClimbing&&growthTurn%2===1;
  if(eligible)growthTurn++;
  let target;if(week>=buildWeeks)target=build*[.75,.55,.35][Math.min(2,week-buildWeeks)];else{if(mileageBuild)build=Math.min(peak,build*1.05);target=build*(week%4===3?.8:1);}
  if(goals)target=goals.schedule[week].weekly;
  const weekStartIndex=items.length;if(climbingBuild){gainBuild=Math.min(climbing.peakGain,gainBuild+climbing.gainStep);longGainBuild=Math.min(climbing.longGainCap,longGainBuild+climbing.gainStep*.5);}
  const phase=week>=buildWeeks?'Taper':week%4===3?'Cutback':week<3?'Base':'Build';
  const dates=Array.from({length:7},(_,i)=>day(start,week*7+i)).filter(d=>d<raceDate),weekday=d=>new Date(d+'T12:00:00').getDay();
  const running=dates.filter(d=>runDays.includes(weekday(d))),longDate=running.find(d=>weekday(d)===longDay);
  const paired=b2b&&phase==='Build'&&week%2===0&&longDate&&running.includes(day(longDate,1));if(paired)pairCount++;
  const longBounds={weekly:target*(b2b?.5:.4),progression:longest*Math.pow(1.05,Math.min(week,buildWeeks-1)),limit:cap};
  const longLimit=goals?goals.schedule[week].long:floor(Math.min(...Object.values(longBounds)));
  const second=paired?floor(Math.min(secondCap,longLimit*.5,target*.2)):0;
  const other=floor((target-longLimit-second)/(runDays.length-1-(paired?1:0)));
  const goalPeak=!!goals?.schedule[week].isPeak;
  const ordinaryDays=running.filter(d=>weekday(d)!==longDay&&!(paired&&d===day(longDate,1)));
  const recoveryDate=ordinaryDays.find(d=>weekday(d)===(longDay+1)%7);
  const goalRecovery=recoveryDate?floor(Math.min(other,longLimit*.35)):0;
  const supportCount=ordinaryDays.length-(recoveryDate?1:0);
  const goalOther=goals&&supportCount?floor((target-longLimit-second-goalRecovery)/supportCount):other;
  if(goals&&(goalOther<0||goalOther>longLimit))throw Object.assign(Error('The weekly and long-run goals put too much distance into other runs in week '+(week+1)+'. Adjust the goals or running days.'),{field:'peak'});
  const qualityDay=running.find(d=>weekday(d)!==longDay&&((weekday(d)-longDay+7)%7)>1&&((longDay-weekday(d)+7)%7)>1);
  for(const date of dates){
   const wd=weekday(date),run=runDays.includes(wd),isLong=wd===longDay,isSecond=paired&&date===day(longDate,1);
   let kind=!run?'Rest':isLong?'Long':isSecond?'Back-to-back':wd===(longDay+1)%7?'Recovery':'Easy';
   if(input.quality&&!goalPeak&&!paired&&!climbingBuild&&date===qualityDay&&phase==='Build')kind=rotations[rotation++%rotations.length];
   else if(focus==='Hilly technical trail'&&date===qualityDay&&['Base','Build'].includes(phase)&&!paired)kind=week%2?'Technical trail':'Downhill skills';
   const miles=run?floor(isLong?longLimit:isSecond?second:kind==='Recovery'?(goals?goalRecovery:Math.min(other,longLimit*.35)):(goals?goalOther:other)):0;
   let details=sessionNotes[kind]||sessionNotes.Easy;if(isLong&&goalPeak)details+=' Chosen peak long run. Review recovery before and after this session.';if(isLong&&input.courseNeeds)details+=' Confirmed course practice: '+String(input.courseNeeds).slice(0,2000);
   const quality=rotations.includes(kind)&&!['Easy','Recovery','Long'].includes(kind);
   if(quality)details+=` Harder/steady-work ceiling: ${qualityMinutes} minutes, within the total distance (not extra). Shorten the work if warmup, easy recoveries and cooldown cannot fit. Use only an effort already familiar to you.`;
   if(run&&focus==='Hilly technical trail')details+=' Race focus: technical footing, runnable hills and hiking transitions. Match effort, not flat-road pace; use familiar terrain and controlled descents.';
   if(isLong&&focus==='Sustained runnable endurance')details+=' Race focus: sustained runnable terrain, steady easy rhythm and fueling practice.';
   if(input.terrain==='Trail'&&run)details+=' Use effort rather than road pace on uneven terrain.';
   if(input.strength&&kind==='Easy'&&date===running.find(d=>weekday(d)!==longDay))details+=' Optional familiar strength work; record separately.';
   items.push({type:'workout',date,title:kind==='Rest'?'Rest / mobility':`${kind} · ${miles} mi`,kind,miles,minutes:null,details,phase,focus,terrain:input.terrain||'Road',qualityMinutes:quality?qualityMinutes:null,pairDate:paired&&(isLong||isSecond)?(isLong?day(date,1):longDate):null,pace:!run?'':quality?'Controlled established effort; see instructions':input.easyPace||'Conversational effort',status:'Planned',locked:false,notes:'',actualMiles:null,actualMinutes:null,gear:[]});
  }
  weekStats.push({week:week+1,phase,mileageBuild,climbingBuild,budget:target,longBounds,actualMiles:floor(items.slice(weekStartIndex).reduce((sum,w)=>sum+w.miles,0)),longMiles:longDate?longLimit:0,longDate,goalPeak});
  if(climbing){const factor=phase==='Taper'?[.75,.55,.35][Math.min(2,week-buildWeeks)]:phase==='Cutback'?.8:1;gainTotals.push(allocateClimbing(items.slice(weekStartIndex),climbing,gainBuild*factor,longGainBuild*factor));}
 }
 if(climbing)warnings.push(`Highest drafted weekly ascent: ${Math.max(0,...gainTotals)} ft; highest long-run ascent: ${Math.max(0,...items.filter(w=>w.kind==='Long').map(w=>w.ascentFeet||0))} ft. Targets may stay below your ceilings; unused climbing is not forced into other days.`);
 if(b2b&&!pairCount)warnings.push('No back-to-back pairs fit these dates and days. Adjust the start/long-run day or preparation window.');
 const maxLong=Math.max(...items.filter(x=>x.kind==='Long').map(x=>x.miles),0),maxSecond=Math.max(...items.filter(x=>x.kind==='Back-to-back').map(x=>x.miles),0);
 warnings.push(`Draft maximum long run: ${maxLong} mi; second endurance day: ${maxSecond} mi. Weekly distance excludes the race itself. Chosen-peak mode distributes the remaining budget among other running days; gradual mode leaves unused recovery mileage unassigned.`);
 items.push({type:'workout',date:raceDate,title:input.raceName||'Race day',kind:'Race',miles:raceMiles,ascentFeet:input.raceGain!==''&&input.raceGain!=null?Number(input.raceGain):null,minutes:null,details:'Use your reviewed race strategy. Overall average pace includes stops.',status:'Planned',locked:true,gear:[],notes:''});return {items,warnings,summary:{profile:profile.name,taperWeeks:profile.taper,goals:goals?{weeklyRate:goals.weeklyRate,maxLongRate:goals.maxLongRate,peakRuns:weekStats.filter(w=>w.goalPeak).map(w=>({date:w.longDate,miles:w.longMiles,weeklyMiles:w.actualMiles}))}:null,weeks:weekStats,climbing:!!climbing,maxWeeklyGain:climbing?Math.max(0,...gainTotals):null,maxLongGain:climbing?Math.max(0,...items.filter(w=>w.kind==='Long').map(w=>w.ascentFeet||0)):null}};
}

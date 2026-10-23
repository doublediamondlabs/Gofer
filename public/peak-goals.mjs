// Explicit calendar targets. This models a requested progression; it does not validate fitness.
export function peakGoalSchedule(input, weeks, buildWeeks, growthWeeks) {
 if(input.planMode!=='goals')return null;
 const base=Number(input.base),peak=Number(input.peak),currentLong=Number(input.longest),maxLong=Number(input.longCap),minLong=Number(input.peakLongMin),count=Number(input.peakRunCount);
 const fail=(field,message)=>{throw Object.assign(Error(message),{field});};
 if(!Number.isInteger(count)||count<1||count>3)fail('peakRunCount','Choose 1, 2 or 3 peak long runs.');
 if(!Number.isFinite(minLong)||minLong<=0||minLong>maxLong)fail('peakLongMin','The first peak long run must be positive and no longer than your final peak long run.');
 if(minLong<currentLong)fail('peakLongMin','Choose a first peak run at least as long as your current comfortable long run.');
 if(maxLong>=peak)fail('peak','Your peak week needs room for the long run and your other running days. Increase the weekly goal or reduce the long-run goal.');
 const slots=growthWeeks.filter(w=>w>=3&&w<buildWeeks);
 if(slots.length<count)fail('peakRunCount','Not enough build weeks fit before taper. Choose fewer peak runs or an earlier start date.');
 const peaks=slots.slice(-count),first=peaks[0],last=peaks.at(-1);
 const prior=growthWeeks.filter(w=>w<=first),all=growthWeeks.filter(w=>w<=last);
 if(!prior.length)fail('start','Start earlier to leave room to build toward the first peak run.');
 const weeklyRate=Math.pow(peak/base,1/all.length)-1,longRate=Math.pow(minLong/currentLong,1/prior.length)-1;
 let weekly=base,long=currentLong,step=0,longStep=0;
 const schedule=[];
 const round=x=>Math.round(x*10)/10;
 for(let w=0;w<weeks;w++){
  if(growthWeeks.includes(w)&&w<=last){step++;weekly=base*Math.pow(1+weeklyRate,step);if(w<=first){longStep++;long=currentLong*Math.pow(1+longRate,longStep);}}
  const peakIndex=peaks.indexOf(w);if(peakIndex>=0)long=count===1?maxLong:minLong+(maxLong-minLong)*peakIndex/(count-1);
  // Once peak targets are met, hold the base budget; scheduled cutbacks and taper reduce both.
  const factor=w>=buildWeeks?[.75,.55,.35][Math.min(2,w-buildWeeks)]:w%4===3?.8:1;
  schedule.push({weekly:round(weekly*factor),long:round(long*factor),isPeak:peakIndex>=0});
 }
 // One peak uses the final goal, so its approach must build toward that value.
 if(count===1){const rate=Math.pow(maxLong/currentLong,1/all.length)-1;let n=0,amount=currentLong;for(let w=0;w<weeks;w++){if(growthWeeks.includes(w)&&w<=last){n++;amount=currentLong*Math.pow(1+rate,n);}const factor=w>=buildWeeks?[.75,.55,.35][Math.min(2,w-buildWeeks)]:w%4===3?.8:1;schedule[w].long=round(amount*factor);}}
 for(const [w,s] of schedule.entries())if(s.long>=s.weekly)fail('peak','The requested progression leaves no mileage for other runs in week '+(w+1)+'. Adjust weekly or long-run goals.');
 let maxLongRate=0,prev=currentLong;
 for(const w of growthWeeks){if(w>last)break;maxLongRate=Math.max(maxLongRate,schedule[w].long/prev-1);prev=schedule[w].long;}
 const ceiling=Number(input.peakIncreasePercent??10);
 if(!Number.isFinite(ceiling)||ceiling<1||ceiling>25)fail('peakIncreasePercent','Choose a build-step review limit from 1% to 25%. This software limit is not a safety guarantee.');
 const required=Math.max(weeklyRate,maxLongRate)*100;
 if(required>ceiling+.01)fail('peakIncreasePercent',`These goals need about ${required.toFixed(1)}% growth per build step, above your ${ceiling}% review limit. Lower the goals, allow more time, or explicitly review this limit. No smaller substitute plan was generated.`);
 return {schedule,peakWeeks:peaks,weeklyRate,maxLongRate,firstPeak:minLong,lastPeak:maxLong,count};
}

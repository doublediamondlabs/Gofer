export function loopGain(count,gain){const has=v=>v!==''&&v!=null;if(!has(count)&&!has(gain))return null;if(!has(count)||!has(gain)||!Number.isInteger(Number(count))||Number(count)<1||Number(count)>10000||!Number.isFinite(Number(gain))||Number(gain)<0)throw Error('Enter both a whole-number loop count and gain per loop, or leave both blank.');return Number(count)*Number(gain);}
export function climbingConfig(input){
 if(!input.climbing)return null;
 const names={raceGain:'total race climbing',currentGain:'usual weekly climbing',peakGain:'weekly climbing limit',currentLongGain:'comfortable long-run climbing',longGainCap:'long-run climbing limit',gainStep:'increase per climbing-build week'};
 const c={};const fail=(field,message)=>{throw Object.assign(Error(message),{field});};
 for(const [key,label] of Object.entries(names)){
  c[key]=Number(input[key]);
  if(input[key]===''||input[key]==null||!Number.isFinite(c[key])||c[key]<0||(key!=='gainStep'&&c[key]===0))fail(key,`Enter your ${label} in feet${key==='gainStep'?' (0 keeps climbing steady)':' above 0'}, or choose no feet targets for now.`);
 }
 if(c.currentLongGain>c.currentGain)fail('currentLongGain','Long-run climbing cannot exceed your usual weekly total.');
 if(c.peakGain<c.currentGain)fail('peakGain','Use a weekly climbing limit at least as high as your usual weekly climbing.');
 if(c.longGainCap<c.currentLongGain)fail('longGainCap','Use a long-run limit at least as high as your comfortable long-run climbing.');
 if(c.longGainCap>c.peakGain)fail('longGainCap','Your long-run climbing limit cannot exceed your weekly climbing limit.');
 return {...c,density:c.raceGain/Number(input.raceMiles)};
}
export function allocateClimbing(workouts,c,budget,longAllowance){const floor=x=>Math.floor(Math.max(0,x));const long=workouts.find(w=>w.kind==='Long');let used=0;for(const w of workouts)w.ascentFeet=w.kind==='Rest'?0:null;if(long){long.ascentFeet=floor(Math.min(longAllowance,budget,long.miles*c.density));used=long.ascentFeet;}
 const others=workouts.filter(w=>w.kind!=='Rest'&&w!==long&&w.miles>0);const weight=w=>w.miles*(['Hill repeats','Sustained climb','Hills'].includes(w.kind)?1.5:w.kind==='Recovery'?.25:1);const weights=others.reduce((s,w)=>s+weight(w),0);for(const w of others){w.ascentFeet=floor(Math.min(weights?(budget-used)*weight(w)/weights:0,w.miles*c.density,longAllowance));}
 for(const w of workouts)if(w.kind!=='Rest'&&w.ascentFeet!=null){w.details+=` Ascent target: ${w.ascentFeet} ft within this session, not extra mileage. Use easy uphill effort or hike to keep the target manageable. Descent is not estimated; choose a familiar route and review its downhill load.`;}
 return workouts.reduce((s,w)=>s+(w.ascentFeet||0),0);
}

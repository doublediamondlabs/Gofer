import {duration,pace} from './domain.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function racePacing(r){
 const goal=duration(r.goal||''),miles=Number(r.miles),loops=Number(r.loopCount);
 let stops=Number(r.stops||0);
 if(r.stopMode==='per-stop'){
  const count=Number(r.stopCount),each=Number(r.stopMinutes);
  if(r.stopCount===''||r.stopCount==null||!Number.isInteger(count)||count<0||r.stopMinutes===''||r.stopMinutes==null||!Number.isFinite(each)||each<0)throw Error('Enter a whole-number stop count and minutes per stop (0 is allowed).');
  stops=count*each;
 }
 if(!Number.isFinite(stops)||stops<0)throw Error('Total stop time must be zero or more minutes.');
 if(goal==null)return null;
 if(!Number.isFinite(miles)||miles<=0)throw Error('Enter a positive race distance to calculate pacing.');
 if(goal<=stops)throw Error('Your finish-time target must leave time to move after aid-station stops.');
 const hasLoops=Number.isInteger(loops)&&loops>0;
 return {goal,miles,stops,moving:goal-stops,overallPace:pace(goal,miles),movingPace:pace(goal-stops,miles),loopMiles:hasLoops?miles/loops:null,loopMoving:hasLoops?(goal-stops)/loops:null};
}
export function stopScenarios(r){
 const baseline=racePacing(r);if(!baseline||r.stopMode!=='per-stop')return [];
 const delta=Number(r.stopVariation??5);if(!Number.isFinite(delta)||delta<0)throw Error('Stop-time variation must be zero or more minutes.');
 return [-1,0,1].map(direction=>{
  const each=Math.max(0,Number(r.stopMinutes)+direction*delta),stopped=Number(r.stopCount)*each;
  return {label:direction===0?'Your estimate':direction<0?'Shorter stops':'Longer stops',each,stopped,moving:baseline.goal-stopped,requiredPace:stopped<baseline.goal?pace(baseline.goal-stopped,baseline.miles):null,finishAtBaseline:baseline.moving+stopped};
 });
}
export function elapsed(minutes){const sec=Math.round(minutes*60);return `${Math.floor(sec/3600)}:${String(Math.floor(sec%3600/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
export function racePacingMarkup(r){
 const p=racePacing(r);if(!p)return 'Enter your target finish time and race distance to see the pacing breakdown.';
 const scenarios=stopScenarios(r);
 return `<h3>Your finish-time budget</h3><div class="draft-metrics"><div><small>Finish target</small><strong>${elapsed(p.goal)}</strong><small>Including stops</small></div><div><small>Aid-station time</small><strong>${p.stops.toLocaleString('en-US')} min</strong><small>${r.stopMode==='per-stop'?`${esc(r.stopCount)} stops × ${esc(r.stopMinutes)} min`:'Total planned stop time'}</small></div><div><small>Time moving</small><strong>${elapsed(p.moving)}</strong><small>Running + walking</small></div><div><small>Average moving pace</small><strong>${p.movingPace} /mi</strong><small>${p.overallPace} /mi including stops</small></div></div>${p.loopMiles!=null?`<p>For ${esc(r.loopCount)} equal loops of ${p.loopMiles.toLocaleString('en-US',{maximumFractionDigits:2})} miles: <strong>${elapsed(p.loopMoving)} moving time per loop</strong>, on average.</p>`:''}${scenarios.length?`<details class="stop-scenarios" open><summary>What if my stops take longer or shorter?</summary><p>Same ${esc(r.stopCount)} stops, with a ±${esc(r.stopVariation??5)}-minute change at each stop (minimum 0).</p><table class="preview-table"><thead><tr><th>Per stop</th><th>Total stopped</th><th>Moving pace for ${elapsed(p.goal)}</th><th>Finish at ${p.movingPace} /mi moving</th></tr></thead><tbody>${scenarios.map(s=>`<tr class="${s.label==='Your estimate'?'baseline':''}"><td>${s.each.toLocaleString('en-US')} min<br><small>${s.label}</small></td><td>${s.stopped.toLocaleString('en-US')} min</td><td>${s.requiredPace?s.requiredPace+' /mi':'No moving time left'}</td><td>${elapsed(s.finishAtBaseline)}</td></tr>`).join('')}</tbody></table></details>`:''}<p class="muted">Times are hours:minutes:seconds. This is race-day arithmetic, not a pace to hold on every hill or a training-workout target. Walking uses moving time; aid-station stops use the stop budget. Count only stops before your finish.</p>`;
}

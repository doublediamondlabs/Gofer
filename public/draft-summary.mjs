const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:1});
export function draftSummaryMarkup(items,build){
 if(build?.summary?.backyard)return backyardSummary(build);
 const training=items.filter(w=>w.kind!=='Race'),longs=training.filter(w=>w.kind==='Long'),seconds=training.filter(w=>w.kind==='Back-to-back');
 const max=(xs,key)=>Math.max(0,...xs.map(w=>Number(w[key])||0));
 const input=build?.input,summary=build?.summary;
 const cards=[['Longest run',number(max(longs,'miles'))+' mi',input?`Your ${summary?.goals?'goal':'limit'}: ${number(input.longCap)} mi`:'Training only'],['Second endurance day',seconds.length?number(max(seconds,'miles'))+' mi':'None scheduled',input?.backToBack?`Your limit: ${number(input.secondCap)} mi`:'Back-to-back sessions']];
 if(summary){
  cards.push(['Biggest training week',number(max(summary.weeks,'actualMiles'))+' mi',`Your ${summary.goals?'goal':'limit'}: ${number(input.peak)} mi`]);
  if(summary.climbing){cards.push(['Most weekly climbing',number(summary.maxWeeklyGain)+' ft',`Your limit: ${number(input.peakGain)} ft`]);cards.push(['Most long-run climbing',number(summary.maxLongGain)+' ft',`Your limit: ${number(input.longGainCap)} ft`]);}
 }
 let explanation='';
 if(summary){
  if(summary.goals){
   const g=summary.goals,date=s=>new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
   explanation+=`<p><strong>Chosen peaks · ${esc(summary.profile)}</strong> · ${summary.taperWeeks}-week taper. These are modeled targets, not a fitness assessment.</p><table class="preview-table peak-dates"><thead><tr><th>Peak long run</th><th>Date</th><th>Training week total</th></tr></thead><tbody>${g.peakRuns.map(w=>`<tr><td>${number(w.miles)} mi</td><td>${esc(date(w.date))}</td><td>${number(w.weeklyMiles)} mi</td></tr>`).join('')}</tbody></table><p><strong>Progression to review:</strong> about ${number(g.weeklyRate*100)}% per mileage-build step; largest long-run build step about ${number(g.maxLongRate*100)}%. These compare build levels; returning from a cutback creates a larger week-to-week change. The full weekly totals appear below.</p>`;
  }else{
  const largest=summary.weeks.reduce((best,w)=>w.longMiles>best.longMiles?w:best,summary.weeks[0]);
  const limiting=Object.entries(largest.longBounds).sort((a,b)=>a[1]-b[1])[0][0];
  const reasons={weekly:`The long-run share of the weekly mileage budget (${input.backToBack?'50%':'40%'}) sets the peak long run.`,progression:'The gradual build from your current long run sets the peak long run.',limit:'The peak long run reaches your chosen distance limit.'};
  explanation+=`<p>${esc(reasons[limiting])} Limits are maximums, not goals the draft automatically reaches.</p>`;
  if(max(longs,'miles')<Number(input.longCap)-.1)explanation+=`<p><strong>Below your long-run limit:</strong> this draft reaches ${number(max(longs,'miles'))} of ${number(input.longCap)} miles. Use Adjust plan settings if that differs from your intended build.</p>`;
  }
  if(summary.climbing&&Number(input.gainStep)===0)explanation+='<p><strong>Climbing is held steady:</strong> you chose a 0-foot increase. Cutback and taper weeks can be lower.</p>';
  explanation+=`<p class="muted">${summary.weeks.filter(w=>w.mileageBuild).length} mileage-build weeks${summary.climbing?` and ${summary.weeks.filter(w=>w.climbingBuild).length} climbing-build weeks` : ''}; cutbacks and taper are separate. Training totals exclude race day.</p>`;
 }
 const weekly=summary?`<details class="weekly-draft-totals"><summary>Weekly totals · review the complete build</summary><div class="table-scroll"><table class="preview-table"><thead><tr><th>Week</th><th>Phase</th><th>Total miles</th><th>Long run</th></tr></thead><tbody>${summary.weeks.map(w=>`<tr><td>${w.week}</td><td>${esc(w.goalPeak?'Peak':w.phase)}</td><td>${number(w.actualMiles)}</td><td>${number(w.longMiles)}</td></tr>`).join('')}</tbody></table></div></details>`:'';
 return `<section class="draft-glance"><h3>Your draft at a glance</h3><div class="draft-metrics">${cards.map(([label,value,sub])=>`<div><small>${esc(label)}</small><strong>${esc(value)}</strong><small>${esc(sub)}</small></div>`).join('')}</div>${explanation}${weekly}<small>Review this editable draft against your experience and recovery before adding it.</small></section>`;
}

function backyardSummary(build){
 const {summary,input}=build,c=summary.backyard,g=summary.goals;
 const date=s=>new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
 return `<section class="draft-glance"><h3>Your Backyard draft</h3><div class="draft-metrics"><div><small>Race goal</small><strong>${c.goalYards} yards</strong><small>${number(c.goalMiles)} mi · ${number(c.goalHours)} scheduled hours</small></div><div><small>Longest rehearsal</small><strong>${c.peakYards} yards</strong><small>${number(c.peakYards*c.yardMiles)} mi · ${number(c.peakYards*c.restartMinutes)} min reserved</small></div><div><small>Each yard</small><strong>${c.yardMinutes} + ${c.resetMinutes} min</strong><small>Moving + reset · ${esc(c.movingPace)}/mi</small></div><div><small>Biggest training week</small><strong>${number(Math.max(...summary.weeks.map(w=>w.actualMiles)))} mi</strong><small>Your weekly limit: ${number(input.peak)} mi</small></div></div><p>Your race goal and training rehearsal are separate. Continuous easy long runs fill the other weeks; cutbacks and the three-week taper keep rehearsals off the schedule.</p><details><summary>Answer-the-bell rehearsals · ${c.rehearsals.length} sessions</summary><div class="table-scroll"><table class="preview-table"><thead><tr><th>Date</th><th>Yards / miles</th><th>Finish final yard by</th><th>Reserve with final reset</th></tr></thead><tbody>${c.rehearsals.map(w=>`<tr><td>${esc(date(w.date))}</td><td>${w.yards} / ${number(w.miles)} mi</td><td>${w.elapsedMinutes} min</td><td>${w.blockMinutes} min</td></tr>`).join('')}</tbody></table></div></details><details class="weekly-draft-totals"><summary>Weekly miles & progression</summary><p>Budget growth: ${number(g.weeklyRate*100)}% per weekly-mileage build step; up to ${number(g.maxLongRate*100)}% per long-run build step. Whole-yard jumps can be larger. Review these against your experience and recovery.</p><table class="preview-table"><thead><tr><th>Week</th><th>Phase</th><th>Miles</th><th>Long session · mi</th></tr></thead><tbody>${summary.weeks.map(w=>`<tr><td>${w.week}</td><td>${esc(w.goalPeak?'Peak rehearsal':w.phase)}</td><td>${number(w.actualMiles)}</td><td>${number(w.longMiles)}</td></tr>`).join('')}</tbody></table></details></section>`;
}

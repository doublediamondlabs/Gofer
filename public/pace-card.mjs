import {racePacing,stopScenarios,elapsed} from './race-pacing.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function paceCard(r,counts){
 const baseline=racePacing(r),loops=Number(r.loopCount);
 if(!baseline)throw Error('Save a target finish time in Race details first.');
 if(!Number.isInteger(loops)||loops<1||loops>4)throw Error('This compact loop card supports 1–4 loops. Set your loop count in Race details.');
 if(r.stopMode!=='per-stop')throw Error('In Race details, choose number of stops × minutes each, then save before making a loop pace card.');
 if(counts.length!==loops||counts.some(n=>!Number.isInteger(n)||n<0)||counts.reduce((a,b)=>a+b,0)!==Number(r.stopCount))throw Error(`Distribute all ${r.stopCount} stops among the loops. Count only stops before the finish.`);
 const scenarios=stopScenarios(r);if(scenarios.some(s=>!s.requiredPace))throw Error('One stop scenario leaves no moving time. Reduce the stop budget or variation.');
 let stopsSoFar=0;
 const rows=counts.map((count,i)=>{stopsSoFar+=count;return {loop:i+1,miles:baseline.miles*(i+1)/loops,times:scenarios.map(s=>s.moving*(i+1)/loops+stopsSoFar*s.each)};});
 const html=`<article class="vest-card"><header><strong>Go’fer · ${esc(r.name)}</strong><span>${esc(r.date?new Date(r.date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'')} · ${baseline.miles} mi · ${loops} loops · Goal ${elapsed(baseline.goal)}</span></header><table><thead><tr><th>Stop scenario</th>${scenarios.map(s=>`<th>${s.each} min / stop</th>`).join('')}</tr></thead><tbody><tr><th>Total stopped</th>${scenarios.map(s=>`<td>${s.stopped} min</td>`).join('')}</tr><tr><th>Moving pace /mi</th>${scenarios.map(s=>`<td><strong>${s.requiredPace}</strong></td>`).join('')}</tr></tbody></table><p><strong>Elapsed checkpoints · same finish goal</strong></p><table><thead><tr><th>Loop / miles</th>${scenarios.map(s=>`<th>${s.each}-min stops</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr><th>${row.loop} / ${row.miles.toLocaleString('en-US',{maximumFractionDigits:2})} mi</th>${row.times.map(t=>`<td>${elapsed(t)}</td>`).join('')}</tr>`).join('')}</tbody></table><footer>Stops assigned by loop: ${counts.join(' / ')}. Checkpoints include those stops; last row is the finish. Equal moving time per loop; adjust for terrain and fatigue. All times elapsed, h:mm:ss.<br><strong>One more loop.</strong></footer></article>`;
 return {html,rows,scenarios};
}

import {raceProfile} from './race-profiles.mjs';
import {generatePlan} from './domain.mjs';
import {climbingConfig} from './climbing.mjs';

// Keep one form and its values while moving between short, focused steps.
export function setupBuilder(form, race, saved) {
  if(saved)for(const el of form.querySelectorAll('[name]')){
    if(el.name==='runDays')el.checked=saved.runDays.map(String).includes(el.value);
    else if(el.type==='checkbox')el.checked=!!saved[el.name];
    else if(saved[el.name]!=null)el.value=saved[el.name];
  }
  form.classList.add('plan-builder');
  form.noValidate = true;
  const field = name => form.elements.namedItem(name);
  const sections = ['Your race', 'Your starting line', 'Shape your plan'];
  const old = document.createDocumentFragment();
  while (form.firstChild) old.append(form.firstChild);
  // Detached controls still need to be located before they are reattached.
  const controls = name => old.querySelector(`[name="${name}"]`);
  const labels = {};
  old.querySelectorAll('input[name],select[name]').forEach(el => { if (!labels[el.name]) labels[el.name] = el.closest('label'); });
  const move = (parent, names) => names.forEach(name => parent.append(labels[name]));
  const element = (tag, cls, text) => { const e = document.createElement(tag); if(cls)e.className=cls; if(text)e.textContent=text; return e; };
  const progress = element('div', 'builder-progress'); progress.setAttribute('aria-label','Plan setup progress');
  sections.forEach((text,i) => { const item=element('span','',text); item.dataset.step=i; progress.append(item); });
  form.append(progress);
  const panels = sections.map((text,i) => { const panel=element('section','builder-step'); panel.dataset.step=i; const heading=element('h3','',text);heading.tabIndex=-1;panel.append(heading);form.append(panel);return panel; });
  const grid = parent => { const e=element('div','form-grid');parent.append(e);return e; };
  const details = (parent,title) => {const e=element('details');e.append(element('summary','',title));parent.append(e);return e;};
  const note = (parent,text) => parent.append(element('p','muted',text));
  let updateProfile=()=>{};
  const raceSummary=element('div','builder-race');panels[0].append(raceSummary);
  const raceDetails=details(panels[0], 'Edit race details');raceDetails.open=!race.id;
  move(grid(raceDetails),['raceName','raceMiles','raceDate','terrain']);
  note(panels[0], 'Your destination, at a glance. Edits here change this draft only.');
  note(panels[0], 'Have a race website? Add it in Race details → Have a race website?, then save the details before building.');
  if(race.reviewedCourse?.needs) {const course=details(panels[0],'Reviewed course notes');course.append(element('p','',race.reviewedCourse.needs));}
  function updateRace(){
    raceSummary.replaceChildren(element('strong','',field('raceName').value||'Your next adventure'));
    const date=field('raceDate').value;
    const dateLabel=date?new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'Choose a race date';
    raceSummary.append(element('span','',`${field('raceMiles').value} miles · ${dateLabel} · ${field('terrain').value}`));
    if(race.loopCount)raceSummary.append(element('span','',`${race.loopCount} loops × ${Number(race.gainPerLoop).toLocaleString('en-US')} ft per loop`));
    updateProfile();
    if(race.elevation!=null)raceSummary.append(element('span','',`${Number(race.elevation).toLocaleString('en-US')} ft total race climbing`));
  }
  move(grid(panels[1]),['start','base','longest','longDay']);
  const days=element('div','builder-days');days.append(element('h4','','Which days can you run?'));days.append(old.querySelector('.checks'));panels[1].append(days);
  note(days,'Choose 3–6 days, including your long-run day.');
  move(grid(panels[2]),['focus','peak','longCap']);
  const rename=(name,text)=>{labels[name].firstChild.textContent=text;};
  rename('base','Usual weekly mileage');rename('longest','Comfortable long run · miles');rename('peak','Weekly mileage limit');rename('longCap','Longest training run · mile limit');
  const modeLabel=element('label');modeLabel.append(element('span','','How should this plan build?'));
  const mode=element('select');mode.name='planMode';for(const [value,text] of [['gradual','Build gradually within my limits'],['goals','Plan toward my chosen peaks']]){const option=element('option','',text);option.value=value;mode.append(option);}mode.value=saved?.planMode||'gradual';modeLabel.append(mode);panels[2].insertBefore(modeLabel,panels[2].querySelector('.form-grid'));
  const goalFields=element('div','builder-goals');
  const goalGrid=grid(goalFields);
  for(const [name,text,val,min,max] of [['peakLongMin','First peak long run · miles',saved?.peakLongMin??'',.1,60],['peakRunCount','Number of peak long runs',saved?.peakRunCount??3,1,3],['peakIncreasePercent','Build-step review limit · %',saved?.peakIncreasePercent??10,1,25]]){
    const label=element('label');label.append(element('span','',text));const control=element('input');control.name=name;control.type='number';control.min=min;control.max=max;control.step=name==='peakRunCount'?'1':'.1';control.value=val;control.required=true;label.append(control);goalGrid.append(label);
  }
  note(goalFields,'For example: 26 → 30 miles over 3 peak runs gives 26, 28 and 30. They fit before taper, with cutbacks kept.');
  note(goalFields,'Your review limit catches bigger mileage jumps. Check that the build suits your experience and recovery.');
  note(goalFields,'Chosen peaks can build faster than the gradual mode’s 5% rule. The preview shows the increases and dates to review.');
  panels[2].append(goalFields);
  const profileBox=element('div','builder-profile'),profileText=element('p','muted'),applyProfile=element('button','','Use distance starting points');applyProfile.type='button';profileBox.append(profileText,applyProfile);goalFields.prepend(profileBox);
  updateProfile=()=>{const p=raceProfile(field('raceMiles').value);profileText.textContent=`${p.name} · ${p.low}–${p.high} mile starting range · ${p.count} peak run${p.count===1?'':'s'}. ${p.note} Use these examples only if they fit your plans.`;};
  applyProfile.onclick=()=>{const p=raceProfile(field('raceMiles').value);field('peakLongMin').value=p.low;field('longCap').value=p.high;field('peakRunCount').value=p.count;if(Number(field('raceMiles').value)<=27)field('backToBack').checked=false;clearErrors();form.dispatchEvent(new Event('input',{bubbles:true}));};
  if(!saved){field('longCap').value=raceProfile(field('raceMiles').value).high;field('peakRunCount').value=raceProfile(field('raceMiles').value).count;}

  function planMode(){const on=mode.value==='goals';if(on&&!field('peakLongMin').value)field('peakLongMin').value=raceProfile(field('raceMiles').value).low;goalFields.hidden=!on;goalFields.querySelectorAll('input').forEach(e=>e.disabled=!on);rename('peak',on?'Peak weekly mileage goal / limit':'Weekly mileage limit');rename('longCap',on?'Final peak long run · mile goal / limit':'Longest training run · mile limit');clearErrors();}
  mode.onchange=planMode;
  const sessions=element('div','builder-options');move(sessions,['quality','strength']);panels[2].append(sessions);
  labels.quality.lastChild.textContent='Include varied workouts matched to my race';
  const climb=element('div','builder-climb');climb.append(element('h4','','Do you know how much climbing you currently do?'));
  const choice=element('label','');choice.append(element('span','','Climbing targets'));
  const select=element('select');select.name='climbingMode';
  for(const [v,t] of [['off','Not sure — hill workouts without feet targets'],['on','Yes — add climbing targets']]){const o=element('option','',t);o.value=v;select.append(o);}choice.append(select);climb.append(choice);
  note(climb,'Hills still count, even without counting every foot. Add climbing numbers if you know them.');
  const climbFields=element('div','builder-climb-fields');
  move(grid(climbFields),['raceGain','currentGain','currentLongGain','peakGain','longGainCap','gainStep']);
  rename('raceGain','Total race climbing · feet');rename('currentGain','Usual weekly climbing · feet');rename('currentLongGain','Comfortable long-run climbing · feet');rename('peakGain','Weekly climbing limit · feet');rename('longGainCap','Long-run climbing limit · feet');rename('gainStep','Add per climbing-build week · feet');
  const hints={currentGain:'Use a recent, typical week from your watch or training log.',currentLongGain:'Climbing in one long run you already handle comfortably.',peakGain:'The most climbing you want scheduled in a training week.',longGainCap:'The most climbing you want in one long training run.',gainStep:'Leave at 0 to hold climbing steady. A positive number adds feet on climbing-build weeks.',raceGain:'A course reference, not an amount you must climb in training.'};
  for(const [key,text] of Object.entries(hints))labels[key].append(element('small','',text));
  climb.append(climbFields);panels[2].append(climb);
  const checkbox=controls('climbing');checkbox.hidden=true;form.append(checkbox);
  function climbingMode(){const enabled=select.value==='on';checkbox.checked=enabled;climbFields.hidden=!enabled;climbFields.querySelectorAll('input').forEach(e=>e.disabled=!enabled);clearErrors();}
  select.value=saved?.climbing?'on':'off';select.onchange=climbingMode;
  const fine=details(panels[2],'Fine-tune my plan');
  move(grid(fine),['easyPace','qualityMinutes','secondCap']);move(fine,['backToBack']);
  rename('qualityMinutes','Time spent on harder efforts · minutes');rename('secondCap','Second endurance day · mile limit');
  labels.qualityMinutes.append(element('small','','Combined faster or uphill efforts, excluding warm-up, recovery and cool-down. This is not a total workout duration or a long-run time limit. Use an amount already familiar to you.'));
  labels.backToBack.lastChild.textContent='Include occasional back-to-back endurance days';
  note(fine,'Back-to-backs need an ultra-distance race above 27 miles and the day after your long run selected. The second day is an endurance day, not a recovery run.');
  const limits=details(panels[2],'Behind the plan');
  note(limits,'Your preview shows what actually fits. Gradual plans may stay below your limits. Cutbacks and taper ease things back; paired endurance days replace quality work.');
  note(limits,'Positive climbing increases alternate with mileage-build weeks. A 0-foot increase holds climbing steady without reserving separate climbing-build weeks. Descent is not estimated. Review every draft against your experience and recovery before saving.');
  note(panels[2],'Next stop: a preview. Nothing goes on your calendar until you say so.');
  const actions=old.querySelector('.dialog-actions');
  const submit=actions.querySelector('[type="submit"]');
  const back=element('button','','Back');back.type='button';
  const next=element('button','primary','Continue');next.type='button';actions.insertBefore(back,submit);actions.append(next);form.append(actions);
  let step=0;
  function show(index,focus=true){step=index;panels.forEach((p,i)=>p.hidden=i!==step);progress.querySelectorAll('span').forEach((e,i)=>{e.classList.toggle('active',i===step);if(i===step)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});back.hidden=step===0;next.hidden=step===2;submit.hidden=step!==2;if(focus)panels[step].querySelector('h3').focus();}
  function clearErrors(){form.querySelectorAll('.field-error').forEach(e=>e.remove());form.querySelectorAll('[aria-invalid]').forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');});form.querySelector('.form-error')?.remove();}
  function fail(name,message){
    const el=field(name);const target=el?.length&&!el.tagName?el[0]:el;
    const panel=target.closest('.builder-step');if(panel)show(Number(panel.dataset.step),false);
    for(let parent=target.parentElement;parent&&parent!==form;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    const error=element('small','field-error',message);error.id='builder-error-'+name;error.setAttribute('role','alert');target.closest('label').append(error);target.setAttribute('aria-invalid','true');target.setAttribute('aria-describedby',error.id);target.focus();return false;
  }
  function validate(index){
    clearErrors();
    for(const el of panels[index].querySelectorAll('input,select'))if(!el.disabled&&!el.checkValidity())return fail(el.name,el.validity.valueMissing?'Please fill in this field.':el.validationMessage);
    const value=n=>Number(field(n).value);
    if(index===0&&!field('raceName').value.trim())return fail('raceName','Give your race or plan a name.');
    if(index===1){
      const span=(Date.parse(field('raceDate').value+'T12:00:00Z')-Date.parse(field('start').value+'T12:00:00Z'))/86400000;
      if(span<28||span>366)return fail('start','Choose a start date 4–52 weeks before your race.');
      if(value('longest')>value('base'))return fail('longest','Your long run cannot be longer than your usual total weekly mileage.');
      const days=[...form.querySelectorAll('[name="runDays"]:checked')].map(e=>e.value);
      if(days.length<3||days.length>6)return fail('runDays','Choose between 3 and 6 running days.');
      if(!days.includes(field('longDay').value))return fail('longDay','Also select this day in your running days below.');
    }
    if(index===2){
      if(value('peak')<value('base'))return fail('peak','Use a weekly limit at least as high as your current weekly mileage.');
      if(field('backToBack').checked){
        if(value('raceMiles')<=27)return fail('backToBack','Back-to-back endurance days are available for ultra-distance races above 27 miles. Turn this off for a marathon or shorter race.');
        if(!form.querySelector(`[name="runDays"][value="${(value('longDay')+1)%7}"]:checked`))return fail('longDay','Select the following day as a running day too, or turn off back-to-backs.');
        if(value('secondCap')<=0||value('secondCap')>value('longCap'))return fail('secondCap','Choose a positive distance no higher than your longest training run limit.');
      }
      try{climbingConfig({...Object.fromEntries(new FormData(form)),climbing:checkbox.checked});}catch(e){return fail(e.field||'currentGain',e.message);}
      if(mode.value==='goals'){const values=Object.fromEntries(new FormData(form));try{generatePlan({...values,runDays:new FormData(form).getAll('runDays'),climbing:checkbox.checked,backToBack:field('backToBack').checked,quality:field('quality').checked,strength:field('strength').checked});}catch(e){return fail(e.field||'peak',e.message);}}
    }
    return true;
  }
  back.onclick=()=>show(step-1);next.onclick=()=>{if(validate(step))show(step+1);};
  form.addEventListener('submit',e=>{if(step<2){e.preventDefault();e.stopImmediatePropagation();if(validate(step))show(step+1);return;}for(let i=0;i<3;i++)if(!validate(i)){e.preventDefault();e.stopImmediatePropagation();return;}},true);
  form.addEventListener('input',()=>{clearErrors();updateRace();});
  climbingMode();planMode();updateRace();show(saved?2:0,false);
}

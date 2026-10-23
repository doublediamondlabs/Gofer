// Presentation only: move existing controls without changing their names, values or listeners.
export const pageMood={
 home:['Your training desk','A little planning. A lot of adventure.'],
 races:['Pick your adventure','Finish lines, fresh starts, and a few questionable ideas.'],
 nutrition:['The snack department','Feed the adventure. Remember what agrees with you.'],
 gear:['Good gear. Great stories.','Top to toe. Purple toenails included.'],
 journal:['Miles worth remembering','The good, the gritty, and the “try that differently.”'],
 settings:['Make yourself at home','Your desk, your keepsakes, your backup plan.']
};
function fold(title,children,open=false){const box=document.createElement('details');box.className='friendly-fold';box.open=open;const heading=document.createElement('summary');heading.textContent=title;box.append(heading,...children.filter(Boolean));return box;}
function moveFields(form,names,title,parent,open=false){const labels=names.map(n=>form.querySelector(`[name="${n}"]`)?.closest('label')).filter(Boolean);if(!labels.length)return;const grid=document.createElement('div');grid.className='form-grid';grid.append(...labels);const box=fold(title,[grid],open);(parent||form).append(box);return box;}
function beforeActions(form,node){const actions=form.querySelector(':scope > .dialog-actions');form.insertBefore(node,actions);}
function basicSection(title,element){const h=document.createElement('h3');h.className='form-kicker';h.textContent=title;element.before(h);}
export function polishDialog(root,title){
 const form=root.querySelector('form');
 const context=document.querySelector('#dialog-context');
 if(context){if(form?.classList.contains('workout-editor'))context.textContent='One workout at a time';else if(/watch|Garmin|COROS/i.test(title))context.textContent='Your watch did the counting';else if(/Edition|Tribute/.test(title))context.textContent='A little personality for your desk';else if(/Coffee|weather/i.test(title))context.textContent='Coffee first. Forecast second.';else if(/Fridge|vest/i.test(title))context.textContent='Take the plan with you';}

 // Open collapsed sections when a browser validity check finds a field inside one.
 root.addEventListener('invalid',e=>{for(let p=e.target.parentElement;p&&p!==root;p=p.parentElement){if(p.tagName==='DETAILS')p.open=true;if(p.classList.contains('workout-panel'))root.querySelector(`[data-workout-panel="${p.dataset.panel}"]`)?.click();}},true);
 if(form?.classList.contains('workout-editor'))workoutTabs(form);
 if(form?.querySelector('[name=format]')&&root.querySelector('#race-manual-fields')){
  const fields=root.querySelector('#race-manual-fields'),grid=fields.querySelector('.form-grid');basicSection('The adventure',grid);
  const course=moveFields(form,['terrain','focus','location','elevation','loopCount','gainPerLoop'],'Course & climbing',fields);
  const loop=root.querySelector('#loop-summary');if(loop)course.append(loop);
  const pacing=moveFields(form,['goal','cutoff','stopMode','stops','stopCount','stopMinutes','stopVariation'],'Pace & pit stops',fields);
  const math=root.querySelector('#race-math');const hint=math?.previousElementSibling;if(hint?.tagName==='P')pacing.append(hint);if(math)pacing.append(math);
  const notes=form.querySelector('[name=notes]')?.closest('label');if(notes)fields.append(fold('Course notes & things to remember',[notes],!!form.elements.notes.value));
  const source=form.querySelector('[name=source]')?.closest('.row');if(source){const intro=source.nextElementSibling,status=root.querySelector('#race-fetch-status');const box=fold('Have a race website?',[source,intro,status]);form.prepend(box);}
  const update=()=>{const backyard=form.elements.format.value==='Backyard';pacing.hidden=backyard;course.querySelector('summary').textContent=backyard?'Terrain & location':'Course & climbing';};form.elements.format.addEventListener('change',update);update();
  const backyard=root.querySelector('#backyard-race-settings');if(backyard)grid.after(backyard);
 }
 if(form&&root.querySelector('#label-drop')){
  const photo=root.querySelector('#label-drop'),status=root.querySelector('#scan-status'),box=fold('Read a label photo · optional',[photo,status]);form.prepend(box);
  const grid=form.querySelector('.form-grid');basicSection('What’s on the menu?',grid);
  const more=moveFields(form,['protein','fat','caffeine'],'More label values · protein, fat & caffeine');if(more)beforeActions(form,more);
  const notes=form.elements.notes?.closest('label');if(notes)beforeActions(form,fold('Recipe notes',[notes],!!form.elements.notes.value));
  // Pasted photos can be read while this helper is folded; bring progress into view.
  const observer=new MutationObserver(()=>{if(status.textContent)box.open=true;if(!root.isConnected)observer.disconnect();});observer.observe(status,{childList:true,subtree:true,characterData:true});
 }
 if(form&&root.querySelector('#mix-summary')){
  const extra=[1,2].map(i=>form.querySelector(`[name=ingredient${i}]`)?.closest('.form-grid')).filter(Boolean);
  if(extra.length){const box=fold('Add another ingredient',extra,extra.some(el=>!!el.querySelector('select').value));root.querySelector('#mix-summary').before(box);}
 }
 if(form?.elements.startMiles){const box=moveFields(form,['startMiles','purchased'],'Mileage & first adventures',null,Number(form.elements.startMiles.value)>0);if(box)beforeActions(form,box);}
 if(title==='Your own training desk'&&form){const box=moveFields(form,['easyPace','location'],'Your usual pace & place');if(box)beforeActions(form,box);}
 if(form?.classList.contains('plan-builder')){
  const goals=form.querySelector('.builder-goals');if(goals){const notes=[...goals.children].filter(e=>e.tagName==='P');if(notes.length)goals.append(fold('How the build works',notes));}
 }
 if(!root.querySelector('.dialog-actions')){const row=document.createElement('div');row.className='dialog-actions';const done=document.createElement('button');done.type='button';done.textContent='Back to Go’fer';done.onclick=()=>document.querySelector('#close-dialog').click();row.append(done);root.append(row);}
 root.querySelectorAll('summary').forEach(s=>s.title='Open or fold this section');
}
function workoutTabs(form){
 const panels=['Plan','Results & notes','Gear & watch'].map((name,i)=>{const panel=document.createElement('section');panel.className='workout-panel';panel.dataset.panel=i;panel.id='workout-panel-'+i;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','workout-tab-'+i);return panel;});
 const core=form.querySelector('.workout-core'),extra=form.querySelector('.workout-extra'),instructions=form.querySelector('.form-section'),results=form.querySelector('.workout-results');
 panels[0].append(...[core,extra,instructions].filter(Boolean));if(results){results.open=true;panels[1].append(results);}
 const gear=[...form.children].filter(e=>e.tagName==='DETAILS');panels[2].append(...gear);
 const tabs=document.createElement('div');tabs.className='workout-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Workout sections');
 function show(i,focus=false){panels.forEach((p,j)=>p.hidden=i!==j);[...tabs.children].forEach((b,j)=>{b.classList.toggle('selected',i===j);b.setAttribute('aria-selected',i===j?'true':'false');b.tabIndex=i===j?0:-1;if(i===j&&focus)b.focus();});}
 ['Plan','Results & notes','Gear & watch'].forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.id='workout-tab-'+i;b.dataset.workoutPanel=i;b.textContent=name;b.setAttribute('role','tab');b.setAttribute('aria-controls',panels[i].id);b.onclick=()=>show(i);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();show(e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3,true);}};tabs.append(b);});
 form.querySelector('.workout-banner').after(tabs,...panels);
 if(results){const summary=results.querySelector('summary');summary.textContent='How did it go?';}
 const options=form.querySelector(':scope > .actions');if(options){const next=options.nextSibling;const box=fold('Weather, duplicate or remove',[options]);form.insertBefore(box,next);}
 const status=form.elements.status;status.addEventListener('change',()=>{if(status.value==='Completed')show(1);});show(status.value==='Completed'?1:0);
}

export function polishMain(root,page){
 if(page==='settings'){
  const cards=[...root.querySelectorAll('.grid2 > .card')];
  const about=cards.find(c=>c.querySelector('h2')?.textContent==='Under the hood');
  if(about){const heading=about.querySelector('h2');heading.remove();const box=fold('Under the hood · version & useful details',[...about.children]);about.replaceWith(box);}
  const backup=cards.find(c=>c.querySelector('h2')?.textContent==='Backup & restore');
  if(backup){const paras=backup.querySelectorAll(':scope > p');if(paras.length>1)backup.append(fold('How recovery copies work',[paras[paras.length-1]]));}
 }
}

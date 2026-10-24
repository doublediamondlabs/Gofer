import {mixNutrition} from './domain.mjs';
import {foodCollection,isBottle} from './pantry.mjs';
const nutrientKeys=['calories','carbs','protein','fat','sodium','caffeine'];
const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw Error('Invalid recipe text.');return v;};
const number=(v,max,positive=false)=>{if(v==null&&!positive)return null;if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max||(positive&&v<=0))throw Error('Invalid recipe amount.');return v;};
const key=v=>text(v,240,true);
export function recipeBundle(items,selected,workspace){
 const byId=new Map(items.map(x=>[x.id,x])),out=new Map(),visiting=new Set();
 function add(id){const item=byId.get(id);if(!item||!(item.type==='food'||isBottle(item)))throw Error('A recipe ingredient or bottle is missing. Restore it before sharing.');if(out.has(id))return;if(visiting.has(id))throw Error('Recipe ingredients contain a cycle.');visiting.add(id);
 const record={key:item.sharedOrigin||`${workspace}/${item.id}`,kind:isBottle(item)?'bottle':item.ingredients?'recipe':'food',name:item.name,notes:item.notes||''};
 if(record.kind==='bottle')record.capacityMl=item.capacityMl;
 else{Object.assign(record,{serving:item.serving||'1 serving',fluidMl:item.fluidMl??null,collection:foodCollection(item),...Object.fromEntries(nutrientKeys.map(k=>[k,item[k]??null]))});if(item.ingredients){record.ingredients=item.ingredients.map(i=>{add(i.foodId);return {key:out.get(i.foodId).key,servings:i.servings};});if(item.bottleId){add(item.bottleId);record.bottleKey=out.get(item.bottleId).key;}}}
 visiting.delete(id);out.set(id,record);
 }
 for(const id of selected)add(id);
 if(!out.size)throw Error('Select at least one recipe or bottle.');
 return validateRecipeBundle({format:'gofer-recipes',version:1,exportedAt:new Date().toISOString(),selected:selected.map(id=>out.get(id).key),items:[...out.values()]});
}
export function validateRecipeBundle(bundle){
 if(bundle?.format!=='gofer-recipes'||bundle.version!==1)throw Error('Choose a Go’fer shared-recipes file, not a workspace backup or 2 Live Crew export.');
 if(!Array.isArray(bundle.items)||!bundle.items.length||bundle.items.length>200)throw Error('Share 1–200 items at a time.');
 const seen=new Set();const items=bundle.items.map(raw=>{if(!raw||!['food','recipe','bottle'].includes(raw.kind))throw Error('Invalid shared item type.');const x={key:key(raw.key),kind:raw.kind,name:text(raw.name,160,true),notes:text(raw.notes??'',20000)};if(seen.has(x.key))throw Error('Duplicate shared item identity.');seen.add(x.key);
 if(x.kind==='bottle')x.capacityMl=number(raw.capacityMl,100000,true);
 else{Object.assign(x,{serving:text(raw.serving,500,true),fluidMl:number(raw.fluidMl,100000),collection:raw.collection==='recipes'?'recipes':'foods'});for(const k of nutrientKeys)x[k]=number(raw[k],100000);if(x.kind==='recipe'){x.collection='recipes';if(!Array.isArray(raw.ingredients)||!raw.ingredients.length||raw.ingredients.length>3)throw Error('Recipe needs 1–3 ingredients.');x.ingredients=raw.ingredients.map(i=>({key:key(i.key),servings:number(i.servings,1000,true)}));if(raw.bottleKey)x.bottleKey=key(raw.bottleKey);}}
 return x;});const byKey=new Map(items.map(x=>[x.key,x]));
 for(const x of items){for(const i of x.ingredients||[])if(byKey.get(i.key)?.kind!=='food')throw Error('A recipe ingredient is missing or is not a base food.');if(x.bottleKey&&byKey.get(x.bottleKey)?.kind!=='bottle')throw Error('A recipe bottle preset is missing.');}
 if(!Array.isArray(bundle.selected)||!bundle.selected.length||bundle.selected.some(k=>!byKey.has(k)))throw Error('Invalid recipe selection.');
 return {format:'gofer-recipes',version:1,exportedAt:typeof bundle.exportedAt==='string'?bundle.exportedAt:'',selected:[...new Set(bundle.selected)],items};
}
const kindOf=x=>isBottle(x)?'bottle':x.type==='food'?(x.ingredients?'recipe':'food'):null;
function signature(x,resolve,local=false){const kind=local?kindOf(x):x.kind;const result={kind,name:x.name,notes:x.notes||''};if(kind==='bottle')result.capacityMl=x.capacityMl;else{result.serving=x.serving||'1 serving';result.fluidMl=x.fluidMl??null;result.collection=local?foodCollection(x):x.collection;for(const k of nutrientKeys)result[k]=x[k]??null;if(kind==='recipe'){result.ingredients=(x.ingredients||[]).map(i=>{const f=resolve(local?i.foodId:i.key);return {food:f?signature(f,resolve,local):null,servings:i.servings};});const b=resolve(local?x.bottleId:x.bottleKey);result.bottle=b?signature(b,resolve,local):null;}}return result;}
export function recipeImportReview(bundle,locals){const b=validateRecipeBundle(bundle),byKey=new Map(b.items.map(x=>[x.key,x])),byId=new Map(locals.map(x=>[x.id,x]));return b.items.map(incoming=>{const pool=locals.filter(x=>kindOf(x)===incoming.kind),sig=JSON.stringify(signature(incoming,k=>byKey.get(k))),exact=pool.find(x=>JSON.stringify(signature(x,k=>byId.get(k),true))===sig),origin=pool.filter(x=>x.sharedOrigin===incoming.key),names=pool.filter(x=>x.name.trim().toLocaleLowerCase()===incoming.name.trim().toLocaleLowerCase()),candidates=[...new Map([...origin,...(exact?[exact]:[]),...names].map(x=>[x.id,x])).values()],match=exact||(origin.length===1?origin[0]:names.length===1?names[0]:null);return {incoming,candidates,match:match?.id||'',identical:!!exact,action:match?'keep':'add'};});}
export function applyRecipeImport(bundle,locals,choices,makeId=()=>crypto.randomUUID()){
 const b=validateRecipeBundle(bundle),byId=new Map(locals.map(x=>[x.id,x])),resolved=new Map(),changes=[],reserved=new Set();
 for(const x of b.items){const c=choices[x.key];if(!c||!['keep','add','update'].includes(c.action))throw Error('Choose what to do with every shared item.');if(c.action!=='add'){const target=byId.get(c.target);if(!target||kindOf(target)!==x.kind)throw Error('Choose a matching local item to keep or update.');if(reserved.has(target.id))throw Error('Two incoming items cannot update or reuse the same local item. Import them as separate copies.');reserved.add(target.id);resolved.set(x.key,{id:target.id,data:target,choice:c});}else resolved.set(x.key,{id:makeId(),choice:c});}
 for(const x of [...b.items.filter(x=>x.kind!=='recipe'),...b.items.filter(x=>x.kind==='recipe')]){const r=resolved.get(x.key),c=r.choice;if(c.action==='keep')continue;const prior=c.action==='update'?byId.get(c.target):{},name=text(c.name??x.name,160,true);let data;
 if(x.kind==='bottle')data={...prior,type:'gear',category:'Bottles / hydration',bottlePreset:true,name,notes:x.notes,capacityMl:x.capacityMl};
 else{data={...prior,type:'food',name,notes:x.notes,serving:x.serving,fluidMl:x.fluidMl,foodCollection:x.collection,...Object.fromEntries(nutrientKeys.map(k=>[k,x[k]]))};if(x.kind==='recipe'){const ingredients=x.ingredients.map(i=>({food:resolved.get(i.key).data,servings:i.servings}));Object.assign(data,mixNutrition(ingredients),{ingredients:ingredients.map(i=>({foodId:i.food.id,name:i.food.name,serving:i.food.serving,servings:i.servings}))});const bottle=resolved.get(x.bottleKey)?.data;Object.assign(data,{bottleId:bottle?.id||null,bottleName:bottle?.name||'',bottleCapacityMl:bottle?.capacityMl??null});if(bottle&&data.fluidMl>bottle.capacityMl)throw Error(`${name}: finished volume exceeds the chosen bottle capacity.`);}}
 delete data.rev;data.id=r.id;data.sharedOrigin=x.key;r.data=data;changes.push(data);
 }
 return changes;
}

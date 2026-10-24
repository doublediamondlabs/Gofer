// Collections are derived; existing records do not need a migration.
export function foodCollection(food){return food.ingredients||food.foodCollection==='recipes'?'recipes':'foods';}
export function isBottle(item){return item.type==='gear'&&item.bottlePreset===true;}
export function pantryItems(items,collection,{query='',mode='active',page=0,pageSize=12}={}){
 const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 const all=items.filter(x=>collection==='bottles'?isBottle(x):x.type==='food'&&foodCollection(x)===collection);
 const filtered=all.filter(x=>(mode==='archived'?!!x.pantryArchived:!x.pantryArchived)&&(mode!=='favorites'||x.favorite)&&words.every(w=>[x.name,x.serving,x.notes,...(x.ingredients||[]).map(i=>i.name)].join(' ').toLocaleLowerCase().includes(w))).sort((a,b)=>Number(!!b.favorite)-Number(!!a.favorite)||String(a.name).localeCompare(String(b.name)));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize)),current=Math.min(Math.max(0,page),pages-1);
 return {items:filtered.slice(current*pageSize,(current+1)*pageSize),total:filtered.length,page:current,pages};
}
export function availableFoods(foods,keepIds=[],ingredientsOnly=false){return foods.filter(f=>(!f.pantryArchived||keepIds.includes(f.id))&&(!ingredientsOnly||foodCollection(f)==='foods'||keepIds.includes(f.id))).sort((a,b)=>Number(!!b.favorite)-Number(!!a.favorite)||String(a.name).localeCompare(String(b.name)));}
export function bottleFill(capacity,volume){return capacity>0&&volume>capacity?'The finished drink exceeds this bottle’s capacity. Choose a larger bottle or reduce the volume.':'';}

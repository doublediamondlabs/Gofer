export function fuelBundle(foods,athlete=''){
 if(!Array.isArray(foods)||!foods.length)throw Error('Save a food or bottle recipe first.');
 return {format:'gofer-fuel',version:1,athlete:String(athlete||''),exportedAt:new Date().toISOString(),foods:foods.map(f=>({id:f.id,name:f.name,serving:f.serving||'1 serving',fluidMl:f.fluidMl===0?null:f.fluidMl??null,notes:f.notes||'',nutrients:Object.fromEntries(['calories','carbs','protein','fat','sodium','caffeine'].map(k=>[k,f[k]??null])),ingredients:f.ingredients?.map(x=>({name:x.name,servings:x.servings,serving:x.serving}))||null}))};
}

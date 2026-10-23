// Editable software starting points, not athlete-specific prescriptions.
// Distances are intentionally not a linear percentage of race length.
export function raceProfile(miles){
 const m=Number(miles);
 if(m<=4)return {name:'5K / short race',low:3,high:5,count:1,taper:2,rotation:['Fartlek','Intervals','Hill repeats'],note:'Short-race structure with one editable peak long run and controlled faster work.'};
 if(m<=8)return {name:'10K',low:6,high:8,count:1,taper:2,rotation:['Fartlek','Tempo','Intervals','Hill repeats'],note:'Short-race endurance and controlled quality sessions; no ultra-style peak block by default.'};
 if(m<=16)return {name:'Half marathon',low:10,high:12,count:3,taper:2,rotation:['Tempo','Progression','Hill repeats','Fartlek'],note:'Half-marathon structure with shorter peak runs and a two-week taper.'};
 if(m<=27)return {name:'Marathon',low:18,high:20,count:3,taper:3,rotation:['Tempo','Steady','Progression','Fartlek'],note:'Marathon starting range: 18–20 miles. Race-goal pace is not assigned to every training run.'};
 if(m<=40)return {name:'50K / shorter ultra',low:20,high:24,count:3,taper:3,rotation:['Steady','Tempo','Progression','Hills'],note:'Shorter-ultra starting range: 20–24 miles. Terrain and time on feet can change what is suitable; these are editable distance targets.'};
 return {name:m<75?'50-mile ultra':'100-mile / longer ultra',low:26,high:30,count:3,taper:3,rotation:['Steady','Tempo','Progression','Fartlek'],note:'Shared 26–30-mile endurance starting range for longer ultras; a 100-mile race does not automatically double the long run. Choose weekly volume, paired days and race focus separately.'};
}

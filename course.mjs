export function courseEvidence(html){
 const text=String(html).replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
 const patterns={distance:/\b\d+(?:\.\d+)?\s*(?:miles?|mi\b|km\b|kilomet(?:er|re)s?)\b/gi,elevation:/(?:elevation gain|total ascent|total climbing|vertical gain)\s*(?:of|:|is|approximately|about)?\s*[\d,]+\s*(?:feet|ft|meters|metres|m)\b/gi,cutoff:/\b\d+(?:\.\d+)?[ -]*(?:hour|hr)s?\s*(?:overall\s*)?(?:cut[ -]?off|time limit)\b|(?:cut[ -]?off|time limit)\s*(?:of|:|is)?\s*\d+(?:\.\d+)?\s*(?:hours?|hrs?)\b/gi,terrain:/\b(?:technical trail|technical terrain|singletrack|single-track|steep climbs?|rolling hills?|rail trail|rail-trail|paved|gravel|power hik(?:e|ing))\b/gi};
 const evidence={};for(const [key,re] of Object.entries(patterns)){evidence[key]=[];for(const m of text.matchAll(re)){const excerpt=text.slice(Math.max(0,m.index-70),Math.min(text.length,m.index+m[0].length+90));if(!evidence[key].includes(excerpt))evidence[key].push(excerpt);if(evidence[key].length>=8)break;}}
 return evidence;
}

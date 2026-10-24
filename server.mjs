import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Store} from './store.mjs';
import {publicPage,raceSuggestions,jsonFetch} from './internet.mjs';
import {validDate} from './public/domain.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
export async function createService({root=process.env.GOFER_DATA_DIR||path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'.local','share'),'DoubleDiamondGofer'),port=Number(process.env.GOFER_PORT||43128)}={}){
 const store=await new Store(root).init(),token=randomBytes(32).toString('hex');let origin='';
 const server=http.createServer(async(req,res)=>{const send=(status,value,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'&&!Buffer.isBuffer(value)?JSON.stringify(value):value);};try{
  if(req.headers.host!==origin.slice(7))return send(403,{error:'Untrusted host.'});if(req.headers.origin&&req.headers.origin!==origin)return send(403,{error:'Untrusted origin.'});
  const url=new URL(req.url,origin),route=url.pathname;
  if(route.startsWith('/api/')){
   if(req.headers['x-gofer-token']!==token)return send(403,{error:'Reload Go’fer to reconnect.'});let body={};if(req.method==='POST'){if(!String(req.headers['content-type']).startsWith('application/json'))return send(415,{error:'JSON required.'});let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>20e6)throw Error('File is too large (20 MB limit).');chunks.push(chunk);}body=JSON.parse(Buffer.concat(chunks).toString());}
   if(route==='/api/state'&&req.method==='GET')return send(200,store.snapshot());
   if(route==='/api/save'&&req.method==='POST')return send(200,await store.save(body.version,body.changes));
   if(route==='/api/delete-plan-workouts'&&req.method==='POST')return send(200,await store.deletePlanWorkouts(body.version,body));
   if(route==='/api/settings'&&req.method==='POST')return send(200,await store.settings(body.version,body.settings));
   if(route==='/api/sync'&&req.method==='POST')return send(200,await store.sync(body.version));
   if(route==='/api/resolve'&&req.method==='POST')return send(200,await store.resolve(body.version,body.id,body.rev));
   if(route==='/api/restore'&&req.method==='POST')return send(200,await store.restore(body.version,body.backup));
   if(route==='/api/watch-fit'&&req.method==='POST'){if(typeof body.base64!=='string'||body.base64.length>14e6)throw Error('Choose a FIT file under 10 MB.');const {readFit}=await import('./watch.mjs');return send(200,readFit(Buffer.from(body.base64,'base64'),String(body.name||'activity.fit').slice(0,200)));}
   if(route==='/api/recovery-copy'&&req.method==='POST'){return send(200,await store.recoveryCopy(body.version));}
   if(route==='/api/backup'&&req.method==='POST'){return send(200,await store.prepareBackup(body.version));}
   if(route==='/api/race-page'&&req.method==='POST'){const page=await publicPage(body.url);return send(200,raceSuggestions(page.html,page.url));}
   if(route==='/api/locations'&&req.method==='GET'){const q=url.searchParams.get('q')||'';if(q.length<2||q.length>100)throw Error('Enter a town or city.');return send(200,await jsonFetch('https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&format=json&name='+encodeURIComponent(q)));}
   if(route==='/api/weather'&&req.method==='POST'){const lat=Number(body.lat),lon=Number(body.lon);if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180||!validDate(body.date))throw Error('Choose a valid location and date.');const weatherURL=new URL('https://api.open-meteo.com/v1/forecast');weatherURL.search=new URLSearchParams({latitude:String(lat),longitude:String(lon),start_date:body.date,end_date:body.date,timezone:'auto',temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code',hourly:'temperature_2m,precipitation_probability,wind_speed_10m,weather_code'}).toString();const result=await jsonFetch(weatherURL);return send(200,{...result,fetchedAt:new Date().toISOString(),date:body.date,lat,lon});}
   if(route==='/api/excel'&&req.method==='POST'){const {makeExcel}=await import('./spreadsheet.mjs');const buffer=await makeExcel(store.snapshot(),body.from,body.to);res.writeHead(200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="Gofer-training.xlsx"'});return res.end(buffer);}
   return send(404,{error:'Not found.'});
  }
  if(req.method!=='GET')return send(405,{error:'Method not allowed.'});let relative=decodeURIComponent(route==='/'?'/index.html':route);const file=path.resolve(here,'public','.'+relative);if(!file.startsWith(path.join(here,'public')+path.sep))return send(403,{error:'Invalid path.'});let bytes=await fs.readFile(file);const ext=path.extname(file);if(ext==='.html')bytes=bytes.toString().replace('__TOKEN__',token);
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; worker-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");return send(200,bytes,({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.ico':'image/x-icon','.gz':'application/gzip','.wasm':'application/wasm'})[ext]||'application/octet-stream');
 }catch(error){send(error.code==='ENOENT'?404:400,{error:error.message||'The operation could not finish.'});}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;return {url:origin,store,close:async()=>{await store.queue;await new Promise(resolve=>server.close(resolve));},server};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const service=await createService();console.log('Go’fer is ready: '+service.url+'\nClose this terminal or press Ctrl+C to stop the browser version.');}

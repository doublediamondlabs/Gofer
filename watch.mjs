import {Decoder,Stream} from '@garmin/fitsdk';
import {createHash} from 'node:crypto';
export function readFit(bytes,name='activity.fit'){
 if(!Buffer.isBuffer(bytes)||bytes.length>10*1024*1024||bytes.length<12)throw Error('Choose a FIT activity file under 10 MB.');
 const decoder=new Decoder(Stream.fromBuffer(bytes));if(!decoder.isFIT()||!decoder.checkIntegrity())throw Error('This FIT file is incomplete or failed its integrity check. Export it again from your watch service.');
 const {messages,errors}=decoder.read();if(errors.length)throw Error('The FIT activity could not be decoded cleanly. Try a fresh export or TCX.');
 const sessions=messages.sessionMesgs||[];if(sessions.length!==1)throw Error('Import one activity/session at a time. Multisport and wellness-only FIT files are not supported yet.');
 const s=sessions[0],num=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0?x:null,start=s.startTime instanceof Date?s.startTime.toISOString():null;if(!start)throw Error('The activity has no usable start time.');
 return {format:'FIT',filename:name,hash:createHash('sha256').update(bytes).digest('hex'),start,sport:s.sport||'generic',distanceMeters:num(s.totalDistance),timerSeconds:num(s.totalTimerTime),elapsedSeconds:num(s.totalElapsedTime),averageHeartRate:num(s.avgHeartRate),maxHeartRate:num(s.maxHeartRate),ascentMeters:num(s.totalAscent),calories:num(s.totalCalories),laps:(messages.lapMesgs||[]).slice(0,1000).map(l=>({distanceMeters:num(l.totalDistance),timerSeconds:num(l.totalTimerTime),averageHeartRate:num(l.avgHeartRate)}))};
}

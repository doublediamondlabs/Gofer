import test from 'node:test';
import assert from 'node:assert/strict';
import {exitMode,exitPrompt} from '../public/exit-prompt.mjs';
test('exit theme follows the next race and includes race day without changing race order',()=>{
 const races=[{date:'2027-06-05',format:'Distance'},{date:'2027-02-01',format:'Backyard'}];
 assert.equal(exitMode(races,'2027-01-01'),'backyard');
 assert.equal(exitMode(races,'2027-02-01'),'backyard');
 assert.equal(exitMode(races,'2027-02-02'),'standard');
 assert.equal(races[0].format,'Distance');
 assert.equal(exitMode([{format:'Backyard'},{date:'2026-01-01',format:'Backyard'}],'2027-01-01'),'standard');
 assert.equal(exitMode([],'2027-01-01'),'standard');
});
test('both prompts default and cancel to staying; exit remains the second action',()=>{
 for(const mode of ['standard','backyard']){
  const p=exitPrompt(mode);assert.equal(p.defaultId,0);assert.equal(p.cancelId,0);
  assert.match(p.detail,/Save any open form/);assert.equal(p.buttons.length,2);
 }
 assert.deepEqual(exitPrompt('backyard').buttons,['Answer the bell','The chair wins']);
 assert.equal(exitPrompt('backyard').message,'The chair has accepted you. The bell has not.');
 assert.deepEqual(exitPrompt('standard').buttons,['One more loop','DNF intentionally — exit']);
});

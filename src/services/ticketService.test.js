import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ticketService } from './ticketService.js';
let storage;
beforeEach(()=>{storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};});
test('ticket lifecycle persists creation, assignment, priority, status and replies',async()=>{
 const initial=await ticketService.list();
 const ticket=await ticketService.create({title:'Cannot access learning portal',description:'The portal shows an access error.',category:'Account',priority:'Medium',studentId:'student-1',attachments:[]});
 assert.equal((await ticketService.list()).length,initial.length+1);
 assert.equal(ticket.status,'Open');
 await ticketService.update(ticket.id,{assignedTo:'Alex Morgan',priority:'High',status:'In progress'},'Assigned and started work');
 await ticketService.reply(ticket.id,'We are investigating.','Alex Morgan');
 await ticketService.update(ticket.id,{status:'Resolved'},'Issue resolved');
 const saved=(await ticketService.list()).find(t=>t.id===ticket.id);
 assert.equal(saved.assignedTo,'Alex Morgan');assert.equal(saved.priority,'High');assert.equal(saved.status,'Resolved');assert.equal(saved.replies[0].body,'We are investigating.');assert.equal(saved.activity.length,4);
});
test('unknown tickets reject updates without changing stored tickets',async()=>{
 const initial=await ticketService.list();await assert.rejects(ticketService.update('missing',{status:'Resolved'}),/not be found/);assert.deepEqual(await ticketService.list(),initial);
});
test('corrupt storage reports a load error rather than replacing records',async()=>{storage.set('campusdesk-tickets-v1','broken');await assert.rejects(ticketService.list());assert.equal(storage.get('campusdesk-tickets-v1'),'broken');});

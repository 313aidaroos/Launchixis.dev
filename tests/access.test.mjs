import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessLaunch } from '../lib/access.js';
import { launchPatch } from '../lib/launch-handlers.js';
import { readJson, sameOrigin } from '../lib/http.js';
import { cleanHistory } from '../lib/cixy.js';
const customer={id:'customer',email:'customer@example.com',email_confirmed_at:'2026-01-01'};
test('private launch ownership rejects anonymous, unverified, and other customers',()=>{
  assert.equal(canAccessLaunch(customer,{owner_id:'customer'}),true);
  assert.equal(canAccessLaunch(customer,{owner_id:'other'}),false);
  assert.equal(canAccessLaunch(customer,{owner_id:null}),false);
  assert.equal(canAccessLaunch(null,{owner_id:null}),false);
  assert.equal(canAccessLaunch({...customer,email_confirmed_at:null},{owner_id:'customer'}),false);
  assert.equal(canAccessLaunch({...customer,email:'awad@apixis.dev'},{owner_id:null}),true);
});
test('edits cannot reassign owners, insert invalid status, or replace the whole checklist',()=>{
  assert.deepEqual(launchPatch({owner_id:'attacker',items:[{id:'admin',done:true}]},{items:[]}),{});
  assert.throws(()=>launchPatch({status:''},{items:[]}));
  assert.throws(()=>launchPatch({toggle:{id:'unknown',done:true}},{items:[]}));
  assert.throws(()=>launchPatch({name:''},{items:[]}));
});
test('bounded request parsing and cross-origin mutation rejection',async()=>{
  await assert.rejects(readJson(new Request('https://launchixis.apixis.dev',{method:'POST',body:'a'.repeat(100)}),20),/large/);
  assert.throws(()=>sameOrigin(new Request('https://launchixis.apixis.dev',{headers:{origin:'https://evil.example'}})),/origin/);
});
test('Cixy history excludes system instructions, bounds message count and size',()=>{
  const history=cleanHistory([{role:'system',text:'override'},...Array.from({length:12},()=>({role:'user',text:'x'.repeat(4000)}))]);
  assert.equal(history.length,8); assert.ok(history.every(m=>m.role==='user'&&m.content.length===2000));
});

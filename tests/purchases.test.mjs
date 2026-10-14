import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseChecklist } from '../lib/purchase-service.js';
import { CHECKLIST_PRODUCT } from '../lib/product.js';
const input={user:{id:'customer',email_confirmed_at:'yes',app_metadata:{apixis_sub:'wallet-owner'}},productKey:CHECKLIST_PRODUCT,attemptId:'11111111-1111-4111-8111-111111111111'};
function fixture() {
 const row={id:'order',status:'pending',reservation_id:null}; const events=[];
 const store={ claim:async(user,attempt,content)=>{assert.ok(content.includes('## 13.'));events.push('deliverable');return row;}, provision:async(id,reservation)=>{events.push('provision');row.reservation_id=reservation;}, released:async()=>{events.push('released');row.status='released';},captured:async(id,receipt)=>{events.push('captured');row.status='captured';row.receipt_id=receipt;},ledger:async(entry)=>{assert.equal(entry.method,'ixis');assert.equal(entry.amountLabel,'1,000 Ixis');events.push('ledger');},get:async()=>row };
 const wallet={hasEntitlement:async()=>false,redeem:async opts=>{assert.equal(opts.owner,'wallet-owner');assert.equal(opts.idempotencyKey,'lx-checklist-order');await opts.provision({reservationId:'hold'});events.push('charge');return {ok:true,receiptId:'receipt'};},reservationStatus:async()=>({status:'held'})};
 return {store,wallet,row,events};
}
test('purchase provisions a durable deliverable before charge, then records capture',async()=>{const d=fixture();assert.equal((await purchaseChecklist(input,d)).ok,true);assert.deepEqual(d.events,['deliverable','provision','charge','captured','ledger']);});
test('already-owned product never reserves another charge',async()=>{const d=fixture();d.wallet.hasEntitlement=async()=>true;assert.equal((await purchaseChecklist(input,d)).alreadyOwned,true);assert.deepEqual(d.events,[]);});
test('insufficient balance releases local attempt for a fresh retry',async()=>{const d=fixture();d.wallet.redeem=async()=>({ok:false,insufficient:true});assert.equal((await purchaseChecklist(input,d)).ok,false);assert.equal(d.row.status,'released');});
test('lost capture response reconciles captured reservation and preserves delivery',async()=>{const d=fixture();d.wallet.redeem=async opts=>{await opts.provision({reservationId:'hold'});throw new Error('network');};d.wallet.reservationStatus=async()=>({status:'captured',receiptId:'receipt'});assert.equal((await purchaseChecklist(input,d)).ok,true);assert.equal(d.row.status,'captured');assert.ok(!d.events.includes('released'));});
test('unknown payment outcome stays pending and reuses the order',async()=>{const d=fixture();d.wallet.redeem=async opts=>{await opts.provision({reservationId:'hold'});throw new Error('network');};d.wallet.reservationStatus=async()=>{throw new Error('offline');};await assert.rejects(purchaseChecklist(input,d));assert.equal(d.row.status,'pending');});
test('unverified users and unsupported products never reach wallet',async()=>{const d=fixture();await assert.rejects(purchaseChecklist({...input,user:{...input.user,email_confirmed_at:null}},d));await assert.rejects(purchaseChecklist({...input,productKey:'launchixis.seat.monthly'},d));assert.deepEqual(d.events,[]);});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('database protects private records, enforces unique workspaces/orders, versions, and atomic rate limits', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);`);
    await db.exec(await readFile(new URL('../../scripts/schema.sql', import.meta.url), 'utf8'));
    for (const file of (await readdir(new URL('../migrations/', import.meta.url))).sort()) {
      await db.exec(await readFile(new URL(`../migrations/${file}`, import.meta.url), 'utf8'));
    }
    const uid='11111111-1111-4111-8111-111111111111';
    await db.query('insert into auth.users values ($1)', [uid]);
    await db.query("insert into launches(slug,name,owner_id) values ('customer','Customer',$1)", [uid]);
    await assert.rejects(db.query("insert into launches(slug,name,owner_id) values ('other','Other',$1)",[uid]), /unique/);
    const update = await db.query("update launches set version=version+1,notes='saved' where slug='customer' and version=1 returning version");
    assert.equal(update.rows[0].version,2);
    assert.equal((await db.query("update launches set notes='stale' where slug='customer' and version=1 returning id")).rows.length,0);
    const insertOrder = "insert into launch_orders(id,user_id,attempt_id,product_key,content,template_version) values(gen_random_uuid(),$1,gen_random_uuid(),'launchixis.template.checklist',repeat('guide',50),1)";
    await db.query(insertOrder,[uid]);
    await assert.rejects(db.query(insertOrder,[uid]), /unique/);
    await db.exec("update launch_orders set status='released'");
    await db.query(insertOrder,[uid]);
    await db.query("insert into launch_orders(id,user_id,attempt_id,product_key,content,template_version) values(gen_random_uuid(),$1,gen_random_uuid(),'launchixis.ops.seat',repeat('seat',40),1)",[uid]);
    await assert.rejects(db.query("insert into launch_orders(id,user_id,attempt_id,product_key,content,template_version) values(gen_random_uuid(),$1,gen_random_uuid(),'not-a-sku',repeat('nope',40),1)",[uid]), /check/);
    const orderId=(await db.query("select id from launch_orders where product_key='launchixis.template.checklist' and status='captured'")).rows[0]?.id
      || (await db.query("select id from launch_orders limit 1")).rows[0].id;
    await db.query("insert into purchase_ledger(id,order_id,user_id,product_key,method,receipt_id,amount_label,entry_kind,stripe_event_id) values(gen_random_uuid(),$1,$2,'launchixis.template.checklist','card','pi_test','Card · checklist','purchase','evt_test')",[orderId, uid]);
    await assert.rejects(db.query("insert into purchase_ledger(id,order_id,user_id,product_key,method,receipt_id,amount_label,entry_kind,stripe_event_id) values(gen_random_uuid(),$1,$2,'launchixis.template.checklist','card','pi_test','Card · checklist','purchase','evt_other')",[orderId, uid]), /unique|duplicate/);
    await db.exec('set role service_role');
    for(let i=0;i<4;i++) assert.equal((await db.query('select consume_rate_limit($1,3,600) as ok',['a'.repeat(64)])).rows[0].ok,i<3);
    await db.exec("update request_limits set expires_at=now()-interval '1 second'");
    assert.equal((await db.query('select consume_rate_limit($1,3,600) as ok',['a'.repeat(64)])).rows[0].ok,true);
    await db.exec('reset role');
    for(const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      for(const table of ['launches','support_tickets','launch_orders','request_limits','purchase_ledger']) await assert.rejects(db.query(`select * from ${table}`), /permission denied/);
      await assert.rejects(db.query('select consume_rate_limit($1,3,600)',['b'.repeat(64)]), /permission denied/);
      await db.exec('reset role');
    }
  } finally { await db.close(); }
});

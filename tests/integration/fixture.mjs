import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { emptyItems } from '../../lib/steps.js';
export const users = {
  owner: { id:'10000000-0000-4000-8000-000000000001', email:'awad@apixis.dev', email_confirmed_at:'2026-01-01', app_metadata:{apixis_sub:'20000000-0000-4000-8000-000000000001'} },
  alice: { id:'10000000-0000-4000-8000-000000000002', email:'alice@example.test', email_confirmed_at:'2026-01-01', app_metadata:{apixis_sub:'20000000-0000-4000-8000-000000000002'} },
  bob: { id:'10000000-0000-4000-8000-000000000003', email:'bob@example.test', email_confirmed_at:'2026-01-01', app_metadata:{apixis_sub:'20000000-0000-4000-8000-000000000003'} },
};
export function sessionCookie(user) {
  const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const access_token = `${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})}.fixture-signature`;
  return `sb-127-auth-token=base64-${enc({access_token,refresh_token:'fixture-refresh',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user})}`;
}
export async function fixtureServer() {
  const state={ paid:new Set(), holds:new Map(), charges:0, unavailable:false, failCaptureResponse:false,
    tables:{ launches:[{id:'30000000-0000-4000-8000-000000000001',slug:'internal',name:'Internal company',one_liner:'Internal plan',domain:'',repo:'',vercel_project:'',owner_id:null,version:1,status:'active',notes:'CONFIDENTIAL_INTERNAL_NOTE',items:emptyItems()}], support_tickets:[], launch_orders:[], purchase_ledger:[] } };
  const server=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');let raw='';for await (const chunk of req) raw+=chunk;
    let body={};try{body=JSON.parse(raw||'{}');}catch{}
    const send=(data,status=200,headers={})=>{res.writeHead(status,{'content-type':'application/json',...headers});res.end(JSON.stringify(data));};
    if(url.pathname==='/test-sign-in' && state.previewUrl) {
      const user=users[url.searchParams.get('user')];
      if(!user) return send({error:'unknown fixture user'},400);
      res.writeHead(302,{'set-cookie':sessionCookie(user)+'; Path=/; HttpOnly; SameSite=Lax',location:state.previewUrl});res.end();return;
    }
    if(url.pathname==='/auth/v1/user') {
      let id;try{id=JSON.parse(Buffer.from(req.headers.authorization.split('.')[1],'base64url').toString()).sub;}catch{}
      const user=Object.values(users).find(u=>u.id===id);
      return send(user||{message:'invalid token'},user?200:401);
    }
    if(url.pathname==='/auth/v1/logout') return send({});
    if(url.pathname==='/auth/v1/token') return send({error:'invalid_grant',error_description:'Invalid code'},400);
    if(url.pathname==='/rest/v1/rpc/consume_rate_limit') return send(true);
    if(url.pathname.startsWith('/rest/v1/')) {
      const name=url.pathname.split('/').pop(),rows=state.tables[name];
      if(!rows) return send({message:'missing table'},404);
      const matching=row=>[...url.searchParams].every(([k,v])=>{
        if(['select','order','limit','offset'].includes(k)) return true;
        if(v.startsWith('eq.')) return String(row[k])===v.slice(3);
        if(v.startsWith('neq.')) return String(row[k])!==v.slice(4);
        if(v.startsWith('in.')) return v.slice(4,-1).split(',').includes(String(row[k]));
        return true;
      });
      let result=rows.filter(matching);
      if(req.method==='POST') {
        if(name==='launches'&&body.owner_id&&rows.some(r=>r.owner_id===body.owner_id)) return send({code:'23505'},409);
        if(name==='launch_orders'&&rows.some(r=>r.user_id===body.user_id&&(r.attempt_id===body.attempt_id||(['pending','captured'].includes(r.status)&&r.product_key===body.product_key)))) return send({code:'23505'},409);
        const row={id:randomUUID(),created_at:new Date().toISOString(),updated_at:new Date().toISOString(),version:1,status:name==='launch_orders'?'pending':'new',notes:'',domain:'',repo:'',vercel_project:'',...body};rows.push(row);result=[row];
      }
      if(req.method==='PATCH') result.forEach(r=>Object.assign(r,body));
      const head=req.method==='HEAD';
      const headers={'content-range':`0-${Math.max(result.length-1,0)}/${result.length}`};
      if(head){res.writeHead(200,headers);res.end();return;}
      if(req.headers.accept?.includes('application/vnd.pgrst.object')) {
        return result.length===1?send(result[0],200,headers):send({code:'PGRST116',details:`The result contains ${result.length} rows`},406,headers);
      }
      return send(result,200,headers);
    }
    if(url.pathname==='/api/v1/quotes') return send({productKey:body.productKey,xp:1000,app:'launchixis',name:'Launch Checklist',quoteId:'quote',usdEquivalent:10,expiresAt:'2099-01-01'});
    if(url.pathname==='/api/v1/entitlements') {
      const owner=url.searchParams.get('owner_id')||url.searchParams.get('owner_email');
      return send({entitlements:state.paid.has(owner)?[{product_key:'launchixis.template.checklist',status:'active'}]:[]});
    }
    if(url.pathname==='/api/v1/balance') return send({available:2000,currency:'Ixis'});
    if(url.pathname==='/api/v1/reservations') {
      if(state.unavailable) return send({error:'Wallet unavailable'},503);
      let hold=[...state.holds.values()].find(h=>h.key===body.idempotencyKey);
      if(!hold){hold={reservationId:randomUUID(),status:'held',key:body.idempotencyKey,owner:body.owner_id,ixis:1000,productKey:body.productKey};state.holds.set(hold.reservationId,hold);}
      return send(hold,201);
    }
    const match=url.pathname.match(/^\/api\/v1\/reservations\/([^/]+)(?:\/(capture|release))?$/);
    if(match){const hold=state.holds.get(match[1]);if(!hold)return send({error:'not_found'},404);
      if(match[2]==='capture') {
        if(hold.status==='released')return send({error:'already_released',code:'already_released'},409);
        if(hold.status!=='captured'){state.charges++;hold.status='captured';hold.receiptId=randomUUID();state.paid.add(hold.owner);}
        if(state.failCaptureResponse)return send({error:'response lost'},503);
      }
      if(match[2]==='release'){if(hold.status==='captured')return send({error:'already_captured',code:'already_captured'},409);hold.status='released';}
      return send(hold);
    }
    return send({error:'unknown fixture route'},404);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {state,server,url:`http://127.0.0.1:${server.address().port}`};
}

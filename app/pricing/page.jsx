"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { walletBuyUrl } from "../../lib/wallet.js";
import { CHECKLIST_PRODUCT } from "../../lib/product.js";

const buyHref = walletBuyUrl("/pricing");
export default function PricingPage() {
  const [product,setProduct] = useState(null), [error,setError] = useState(""), [busy,setBusy] = useState(false), [receipts,setReceipts] = useState([]), [notice,setNotice] = useState("");
  const attempt = useRef(null);
  const refresh = useCallback(async()=>{
    try { const res = await fetch("/api/product",{cache:"no-store"}); const data=await res.json(); if(!res.ok) throw new Error(data.error); setProduct(data); setError(""); }
    catch(e){setError(e.message);}
  },[]);
  useEffect(()=>{ void refresh(); },[refresh]);
  useEffect(()=>{
    const flag=new URLSearchParams(window.location.search).get("checkout");
    if(flag==="success") setNotice("Stripe is confirming your card payment. Your receipt appears here when that confirmation arrives.");
    if(flag==="cancel") setNotice("Card checkout was canceled. This attempt was not charged.");
  },[]);
  useEffect(()=>{
    if(!product?.signedIn){ setReceipts([]); return; }
    let active=true;
    fetch("/api/receipts",{cache:"no-store"}).then(r=>r.ok?r.json():{receipts:[]}).then(d=>{ if(active) setReceipts(d.receipts||[]); }).catch(()=>{});
    return ()=>{ active=false; };
  },[product?.signedIn, product?.owned]);
  async function buy() {
    if(busy) return; setBusy(true); setError("");
    try {
      attempt.current ||= sessionStorage.getItem("lx-checklist-attempt") || crypto.randomUUID();
      sessionStorage.setItem("lx-checklist-attempt",attempt.current);
      const res=await fetch("/api/redeem",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({productKey:CHECKLIST_PRODUCT,attemptId:attempt.current})});
      const data=await res.json();
      if(!res.ok){
        if(res.status===402 || (res.status===409 && data.error?.includes("released"))) { sessionStorage.removeItem("lx-checklist-attempt"); attempt.current=null; }
        throw new Error(data.error || "Purchase status is unavailable. Retry to check the same purchase safely.");
      }
      sessionStorage.removeItem("lx-checklist-attempt"); attempt.current=null;
      setProduct(prev=>({...prev,owned:true}));
    } catch(e) {setError(e.message);} finally {setBusy(false);}
  }
  async function payCard(sku) {
    if(busy) return; setBusy(true); setError("");
    try {
      const key=`lx-card-${sku}`;
      const attemptId=sessionStorage.getItem(key) || crypto.randomUUID();
      sessionStorage.setItem(key, attemptId);
      const res=await fetch("/api/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({productKey:sku,attemptId})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error || "Card checkout is unavailable.");
      if(!String(data.url||"").startsWith("https://checkout.stripe.com/")) throw new Error("Card checkout did not return a Stripe page.");
      window.location.assign(data.url);
    } catch(e) { setError(e.message); setBusy(false); }
  }
  const others=(product?.offerings||[]).filter(item=>item.sku!==CHECKLIST_PRODUCT);
  return <main className="shell"><header className="top"><div><div className="logo">LAUNCHIXIS</div><h1>Launch Checklist</h1><p className="lede">One company. A practical plan you can keep and work through.</p></div></header>
    <section className="panel product-panel"><h2>Launch Checklist Template</h2><p className="price">{product ? `${product.price.toLocaleString()} Ixis · one-time purchase` : "Checking price…"}</p>
      <ul><li>Downloadable 13-step launch guide with actions and evidence for every milestone.</li><li>One private company workspace with an editable checklist, status, and notes.</li><li>Launch advice from Cixy and support when you need it.</li></ul>
      <p>This is a planning tool. It does not include an operator, brand design, deployment work, or guaranteed launch results. Your workspace is accessible to you and Launchixis administrators.</p>
      {notice && <p role="status">{notice}</p>}
      {error && <p className="err" role="alert">{error}</p>}
      {product?.owned ? <p role="status">Your checklist is ready. <a className="btn" href="/api/checklist">Download guide</a> <a className="btn ghost" href="/">Open workspace</a></p> : product?.signedIn ? <button className="btn" disabled={busy} onClick={buy}>{busy ? "Checking your purchase…" : `Unlock for ${product.price.toLocaleString()} Ixis`}</button> : product ? <a className="btn" href="/auth/apixis/start?next=%2Fpricing">Sign in with Apixis to purchase</a> : <button className="btn ghost" onClick={refresh}>Retry price check</button>}
      {product?.cardAvailable ? (product.signedIn ? <button className="btn ghost" disabled={busy} onClick={()=>payCard(CHECKLIST_PRODUCT)}>Pay by card</button> : <a className="btn ghost" href="/auth/apixis/start?next=%2Fpricing">Pay by card</a>) : <button className="btn ghost" type="button" disabled>Pay by card</button>}
      <p>Pay with Ixis from your Apixis Wallet, or by card. The card button stays off until a Stripe price is set. Already purchased? <button className="btn ghost" disabled={busy} onClick={refresh}>Refresh access</button></p>
      <a href={buyHref}>Buy Ixis in Apixis Wallet</a>
      {receipts.length>0 && <ul>{receipts.map(item=><li key={item.id}>{item.name} · {item.amountLabel} · {item.method} · {item.receiptId}</li>)}</ul>}
    </section>
    {others.map(item=><section className="panel" key={item.sku}><h2>{item.name}</h2><p className="price">{item.ixis.toLocaleString()} Ixis{item.interval?" a month":" · one-time"}</p><p>{item.interval?"Not on sale in Ixis yet. A card price for this tier uses Stripe subscription mode.":"Not on sale in Ixis yet."}</p>{item.cardAvailable?(product?.signedIn?<button className="btn ghost" disabled={busy} onClick={()=>payCard(item.sku)}>Pay by card</button>:<a className="btn ghost" href="/auth/apixis/start?next=%2Fpricing">Pay by card</a>):<button className="btn ghost" type="button" disabled>Pay by card</button>}</section>)}
    <nav className="row"><a href="/">Workspace</a><a href="/support">Support</a><a href="/feed">Feed</a></nav><footer className="foot">LAUNCHIXIS · A Apixis Company</footer>
  </main>;
}

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ApixisWalletChip } from "./ApixisWalletChip";
import { walletBuyUrl } from "../lib/wallet.js";
const links = [
  ["Overview", "/", "home"], ["My launch", "/#workspace", "launch"],
  ["My checklist", "/#milestones", "check"], ["Files & notes", "/#notes", "file"],
  ["Apixis Companies", "/companies", "grid"], ["Community", "/feed", "people"],
  ["Pricing", "/pricing", "wallet"], ["Support", "/support", "help"],
];
const ixisCompanies = [
  ["Apixis", "https://www.apixis.dev"],
  ["Apixis Wallet", "https://apixis-wallet.vercel.app"],
  ["Socixis", "https://socixis.dev"],
  ["Lyrixis", "https://lyrixis.vercel.app"],
  ["Pinixis", "https://pinixis.vercel.app"],
  ["Renoxis", "https://renoxis.dev"],
  ["Contraxis", "https://contraxis-dev.vercel.app"],
  ["Deduxis", "https://deduxis.vercel.app"],
  ["Rawixis", "https://rawixis.vercel.app"],
  ["Halaxis", "https://halaxis.vercel.app"],
  ["Geoxis", "https://spatial-dashboard-xi.vercel.app"],
  ["Ominix", "https://ominix-app.vercel.app"],
  ["Wattixis", "https://wattixis.vercel.app"],
];
export function Icon({ name }) {
  const glyphs = { home:"⌂", launch:"🚀", check:"✓", file:"📄", grid:"▦", people:"👥", wallet:"💳", help:"?" };
  return <span className="nav-glyph" aria-hidden="true">{glyphs[name] || glyphs.home}</span>;
}
export default function StudioShell({ children }) {
  const pathname = usePathname();
  const [hash,setHash] = useState("");
  const [menu,setMenu] = useState(false);
  const [session,setSession] = useState(null);
  const [error,setError] = useState("");
  useEffect(()=>{const sync=()=>setHash(window.location.hash);sync();window.addEventListener("hashchange",sync);return()=>window.removeEventListener("hashchange",sync);},[]);
  useEffect(()=>{let active=true;fetch("/api/auth/me",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(active)setSession(d);}).catch(()=>{});return()=>{active=false;};},[pathname]);
  useEffect(()=>{const close=e=>{if(e.key==="Escape")setMenu(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[]);
  const current=pathname+hash;
  async function signOut(){const res=await fetch("/api/auth/logout",{method:"POST"}).catch(()=>null);if(res?.ok)window.location.assign("/");else setError("Could not sign out. Please try again.");}
  return <div className="studio-app">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="studio-sidebar">
      <a className="brand" href="/" aria-label="Launchixis home"><img src="/brand/launchixis.png" alt="Launchixis" width="200" height="168" /></a>
      <button className="menu-toggle btn ghost" aria-expanded={menu} aria-controls="studio-nav" onClick={()=>setMenu(!menu)}>{menu?"Close menu":"Menu ☰"}</button>
      <nav id="studio-nav" className={menu?"studio-nav is-open":"studio-nav"} aria-label="Main navigation">
        {links.map(([label,href,icon])=><a key={label} href={href} aria-current={current===href?"page":undefined} onClick={()=>setMenu(false)}><Icon name={icon}/><span>{label}</span></a>)}
        <a href={walletBuyUrl("/")}><Icon name="wallet"/><span>Buy Ixis ↗</span></a>
        {session?.admin&&<a href="/admin/support" aria-current={pathname==="/admin/support"?"page":undefined}><Icon name="help"/><span>Support queue</span></a>}
      </nav>
      <div className="sidebar-end"><span className="family-mark">A</span><span>Apixis Company</span></div>
    </aside>
    <div className="studio-body">
      <header className="studio-topbar"><span className="eyebrow">Your launch studio</span><div className="row">{session?.user&&<ApixisWalletChip/>}{session?.user?<button className="account-button" onClick={signOut}>Sign out</button>:<a className="account-button" href="/login">Sign in</a>}</div></header>
      {error&&<p className="err" role="alert">{error}</p>}
      <div id="main-content" tabIndex={-1}>{children}</div>
      <footer className="studio-footer"><span>Launchixis · An Apixis Company</span><a href="/support">A little help, whenever you need it ↗</a><nav className="ixis-companies" aria-label="Other Ixis companies"><strong>Other Ixis companies</strong>{ixisCompanies.map(([n, u]) => <a key={u} href={u} target="_blank" rel="noopener noreferrer">{n}</a>)}</nav></footer>
    </div>
  </div>;
}

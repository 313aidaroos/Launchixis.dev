"use client";
export function AskCixy({ children = "Talk to Cixy ↗", className = "btn cyan" }) {
  return <button className={className} onClick={()=>window.dispatchEvent(new Event("launchixis:open-cixy"))}>{children}</button>;
}
export default function LaunchHero({ signedIn = false }) {
  return <section className="launch-hero" aria-labelledby="hero-title">
    <img className="hero-art" src="/cixy/cixy-launchixis.webp" alt="Cixy, your launch assistant, at her desk" fetchPriority="high" width="1024" height="1024"/>
    <div className="hero-copy"><p className="eyebrow"><span className="live-dot"/> Every great company starts somewhere</p>
      <h1 id="hero-title">Your idea.<br/>A clear direction.<br/>An extraordinary <em>launch.</em></h1>
      <p className="hero-description">One private workspace to plan, build, and bring your next company to life.</p>
      <div className="hero-actions"><a className="btn" href={signedIn?"#workspace":"/auth/apixis/start?next=%2F"}>{signedIn?"Continue my launch":"Create my workspace"} <span aria-hidden="true">↗</span></a><a href={signedIn?"#milestones":"/pricing"}>Explore the checklist</a></div>
    </div>
    <div className="hero-cixy"><div><strong>Cixy</strong><span>Your launch copilot</span></div><AskCixy/></div>
  </section>;
}

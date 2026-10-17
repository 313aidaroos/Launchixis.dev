export const LAUNCH_STEPS = [
  {
    id: "name",
    label: "Name locked",
    hint: "Choose a name and record who owns the launch.",
  },
  {
    id: "one_liner",
    label: "One-sentence product",
    hint: "What it does, in one line.",
  },
  {
    id: "domain",
    label: "Domain decided",
    hint: "Choose a host and verify HTTPS; use the deployment URL while DNS is pending.",
  },
  {
    id: "repo",
    label: "GitHub repo exists",
    hint: "Create your repository, document setup, and keep secrets out of Git.",
  },
  {
    id: "vercel",
    label: "Vercel project live",
    hint: "Deploy to this company's project. No tokens in chat.",
  },
  {
    id: "waitlist",
    label: "Waitlist before payments",
    hint: "Collect emails. Customers pay by card or with Ixis from the Apixis Wallet.",
  },
  {
    id: "chrome",
    label: "Brand and navigation ready",
    hint: "Make product ownership, navigation, and support easy to find.",
  },
  {
    id: "ixis_pricing",
    label: "Pricing in Ixis points",
    hint: "100 Ixis = $1. Pay by card through the one Apixis Dev LLC Stripe account, or with Ixis from the Apixis Wallet.",
  },
  {
    id: "usable_site",
    label: "Live site is usable",
    hint: "Not a mock. Not a coming-soon page.",
  },
  {
    id: "auth",
    label: "Apixis ID login works",
    hint: "Verify a real first login, return visit, and sign-out.",
  },
  {
    id: "admin",
    label: "Admin account gated",
    hint: "Verify workspace ownership and reject cross-customer reads and writes.",
  },
  {
    id: "support",
    label: "Support intake live",
    hint: "Submit a ticket, verify it reaches the admin queue, and record a resolution.",
  },
  {
    id: "env_isolated",
    label: "Env is this company only",
    hint: "Do not mix another company's env into this launch.",
  },
];

export function emptyItems() {
  return LAUNCH_STEPS.map((s) => ({ id: s.id, done: false }));
}

export function mergeItems(existing) {
  const byId = new Map((existing || []).map((i) => [i.id, i]));
  return LAUNCH_STEPS.map((s) => ({
    id: s.id,
    done: Boolean(byId.get(s.id)?.done),
  }));
}

export const LIVE_HOSTS = {
  launchixis: "launchixis.apixis.dev",
  apixis: "apixis-dev-1iqh-313aidaroos-projects.vercel.app",
  socixis: "socixis-313aidaroos-projects.vercel.app",
  awadbot: "awadbot.vercel.app",
  "awad-command": "awad-command.vercel.app",
  contentbot: "personalcontentbot.vercel.app",
  contraxis: "contraxis-dev.vercel.app",
  geoxis: "spatial-dashboard-xi.vercel.app",
  halaxis: "halaxis.vercel.app",
  lyrixis: "lyrixis.vercel.app",
  nurserytoons: "nurserytoons.vercel.app",
  qahwahworld: "qahwahworld.vercel.app",
  rawixis: "rawixis.vercel.app",
  recovra: "recovra-three.vercel.app",
};

export function hrefForHost(host) {
  const h = String(host || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return h ? `https://${h}` : "";
}

export function liveUrl(launch) {
  return hrefForHost(LIVE_HOSTS[launch?.slug]) || hrefForHost(launch?.domain);
}

export const FAMILY_SEED = [
  {
    slug: "launchixis",
    name: "Launchixis",
    one_liner: "Launch operations for new Apixis-family companies.",
    domain: "launchixis.apixis.dev",
    repo: "313aidaroos/Launchixis",
    vercel_project: "launchixis",
    status: "active",
    notes: "Ops board. One sister company at a time.",
    items: [
      { id: "name", done: true },
      { id: "one_liner", done: true },
      { id: "domain", done: false },
      { id: "repo", done: true },
      { id: "vercel", done: false },
      { id: "waitlist", done: false },
      { id: "chrome", done: false },
      { id: "ixis_pricing", done: false },
      { id: "usable_site", done: false },
      { id: "env_isolated", done: true },
    ],
  },
  {
    slug: "apixis",
    name: "Apixis",
    one_liner: "Virtual world and economy for AI agents.",
    domain: "apixis.dev",
    repo: "313aidaroos/Apixis.dev",
    vercel_project: "apixis-dev-1iqh",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "socixis",
    name: "Socixis",
    one_liner: "AI marketing and social. Cixy lives here only.",
    domain: "socixis.dev",
    repo: "313aidaroos/Socixis",
    vercel_project: "socixis",
    status: "not_started",
    notes: "Cixy stays in Socixis. Do not rebuild her as a cross-company OS.",
    items: emptyItems(),
  },
  {
    slug: "awadbot",
    name: "AwadBot",
    one_liner: "Personal financier for Awad.",
    domain: "awadbot.vercel.app",
    repo: "313aidaroos/AwadBot",
    vercel_project: "awadbot",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "awad-command",
    name: "Awad Command",
    one_liner: "Private 3D dashboard / AI command center.",
    domain: "awad-command.vercel.app",
    repo: "313aidaroos/awad-command",
    vercel_project: "awad-command",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "contentbot",
    name: "PersonalContentBot",
    one_liner: "One-minute social videos.",
    domain: "personalcontentbot.vercel.app",
    repo: "313aidaroos/PersonalContentBot",
    vercel_project: "personalcontentbot",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "contraxis",
    name: "Contraxis",
    one_liner: "Homeowners and contractors matched with AI.",
    domain: "contraxis-dev.vercel.app",
    repo: "313aidaroos/Contraxis.dev",
    vercel_project: "contraxis-dev",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "geoxis",
    name: "Geoxis",
    one_liner: "Live 3D map of company movement in the real world.",
    domain: "spatial-dashboard-xi.vercel.app",
    repo: "313aidaroos/Geoxis",
    vercel_project: "spatial-dashboard",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "halaxis",
    name: "Halaxis",
    one_liner: "Halal and Sharia-compliant hedge fund.",
    domain: "halaxis.vercel.app",
    repo: "313aidaroos/Halaxis.dev",
    vercel_project: "halaxis",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "lyrixis",
    name: "Lyrixis",
    one_liner: "Music metadata, lyrics, catalog intelligence.",
    domain: "lyrixis.vercel.app",
    repo: "313aidaroos/Lyrixis",
    vercel_project: "lyrixis",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "qahwahworld",
    name: "Qahwahworld",
    one_liner: "Specialty coffee marketplace.",
    domain: "qahwahworld.vercel.app",
    repo: "313aidaroos/qahwahworld",
    vercel_project: "qahwahworld",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "rawixis",
    name: "Rawixis",
    one_liner: "B2B market for critical raw materials, import/export, logistics.",
    domain: "rawixis.vercel.app",
    repo: "313aidaroos/Rawixis.dev",
    vercel_project: "rawixis",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "recovra",
    name: "Recovra",
    one_liner: "Overcharge recovery for companies.",
    domain: "recovra-three.vercel.app",
    repo: "313aidaroos/Recovra",
    vercel_project: "recovra",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
  {
    slug: "nurserytoons",
    name: "Nursery Toons",
    one_liner: "Kids cartoons and nursery content.",
    domain: "nurserytoons.vercel.app",
    repo: "313aidaroos/NurseryToons",
    vercel_project: "nurserytoons",
    status: "not_started",
    notes: "",
    items: emptyItems(),
  },
];

"use client";
import { useMemo } from "react";
import { createFeedClient } from "../../feed-client/api.ts";
import { FeedView } from "../../feed-client/FeedView.tsx";

// Launchixis skin: only Launchixis's own classes from app/globals.css (card, btn, pill, lede…). Layout in ./feed.css.
/** @type {import("@/feed-client/FeedView").FeedSkin} */
const skin = {
  tabs: "lx-feed-tabs",
  tab: "pill lx-feed-tab",
  tabActive: "lx-pill-on",
  card: "card lx-feed-card",
  cardHead: "",
  title: "lx-feed-title",
  button: "btn lx-sm",
  buttonSecondary: "btn ghost lx-sm",
  buttonSmall: "",
  chip: "pill lx-feed-chip",
  aiChip: "pill lx-feed-chip lx-feed-ai",
  input: "lx-feed-input",
  label: "lx-feed-label",
  muted: "lede lx-feed-muted",
  alert: "err",
  notice: "save",
  empty: "save",
  listRow: "lx-feed-row",
  signInUrl: "/auth/apixis/start?next=%2Ffeed",
  buyIxisUrl: "https://apixis-wallet.vercel.app/buy?product=launchixis",
};

export default function LaunchixisFeed() {
  const client = useMemo(() => createFeedClient({ client: "launchixis", sessionUrl: "/api/feed-session" }), []);
  return <FeedView client={client} skin={skin} siteName="Launchixis" />;
}

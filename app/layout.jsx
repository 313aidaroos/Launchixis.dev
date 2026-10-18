import "./globals.css";
import Cixy from "./cixy.jsx";
import StudioShell from "../components/StudioShell";
import "./studio.css";
import brand from "../public/brand/brand.json";

export const metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  title: `${brand.name} — ${brand.tagline}`,
  description:
    "Your idea. A clear direction. A private workspace, practical launch checklist, and guidance from Cixy.",
  icons: {
    icon: [
      { url: brand.files.favicon },
      { url: brand.files.favicon32, sizes: "32x32", type: "image/png" },
      { url: brand.files.icon192, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: brand.files.appleTouchIcon, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description:
      "Your idea. A clear direction. A private workspace, practical launch checklist, and guidance from Cixy.",
    images: [brand.files.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [brand.files.ogImage],
  },
};

export const viewport = {
  themeColor: brand.colors.background,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      style={{
        "--brand-primary": brand.colors.primary,
        "--brand-accent": brand.colors.accent,
        "--brand-background": brand.colors.background,
        "--brand-text": brand.colors.text,
      }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StudioShell>{children}</StudioShell>
        <Cixy />
      </body>
    </html>
  );
}

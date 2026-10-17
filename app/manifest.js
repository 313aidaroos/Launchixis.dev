import brand from "../public/brand/brand.json";

export default function manifest() {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: brand.colors.background,
    theme_color: brand.colors.background,
    icons: [
      { src: brand.files.icon192, sizes: "192x192", type: "image/png" },
      { src: brand.files.icon512, sizes: "512x512", type: "image/png" },
    ],
  };
}

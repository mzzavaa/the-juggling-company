import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE_URL = process.env.SITE_URL ?? "https://thejugglingcompany.com";

export default defineConfig({
  site: SITE_URL,
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes("/draft/") && !page.includes("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["maplibre-gl"],
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});

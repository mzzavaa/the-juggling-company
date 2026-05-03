import type { APIContext } from "astro";
import { site } from "@/lib/site";

export function GET(context: APIContext) {
  const sitemapUrl = new URL("/sitemap-index.xml", context.site ?? site.url).toString();
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /404",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}

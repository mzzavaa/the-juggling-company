import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "@/lib/content";
import { site } from "@/lib/site";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: `/blog/${p.id}/`,
    })),
    customData: `<language>en-gb</language>`,
  });
}

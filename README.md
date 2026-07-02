# The Juggling Company

Static site for [The Juggling Company](https://thejugglingcompany.com), built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Tech stack

- **Astro 5** — static site generator with island architecture
- **TypeScript** strict mode throughout
- **Tailwind CSS v4** — design tokens in `src/styles/global.css`
- **React 19** islands for interactive components only (video filter, MapLibre map)
- **MDX** for long-form content (Ideas essays, blog posts)
- **Zod-validated content collections** — broken frontmatter fails the build

## Local development

```sh
nvm use            # Node 20 (see .nvmrc)
npm ci
npm run dev        # http://localhost:4321
npm run typecheck  # astro check
npm run build      # outputs to dist/
npm run preview    # serve dist/ locally
```

## Project layout

```
src/
  components/        # .astro components (no JS shipped by default)
  islands/           # React components hydrated client-side
  content/           # Zod-validated content collections (8 types)
  layouts/           # Page layouts
  pages/             # File-based routing
  styles/            # Tailwind tokens + global CSS
  lib/               # Pure utility functions
public/
  images/            # Static images served as-is
.github/workflows/   # CI, deploy, zizmor
```

## Content collections

All content is Zod-validated at build time. See `src/content/config.ts` for schemas.

| Collection  | Purpose                                          |
| ----------- | ------------------------------------------------ |
| `idea`      | Long-form essays (MDX)                           |
| `video`     | YouTube/TikTok/Instagram references              |
| `talk`      | Speaking engagements (upcoming + past)           |
| `service`   | Bookable offerings                               |
| `product`   | Items linking to external storefronts           |
| `location`  | Map pins (lat/lng) for past + future appearances |
| `press`     | External coverage and mentions                   |
| `post`      | Blog posts (MDX, with RSS feed)                  |

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages. PRs run `.github/workflows/ci.yml` for
typecheck, build, link check, and zizmor scan of workflow files.

## Attribution

**Pattern animations powered by [JugglingLab](https://jugglinglab.org)**, the open-source juggling simulator created by Jack Boyce ([GitHub](https://github.com/jkboyce/jugglinglab)). The animations use JugglingLab's physics engine and siteswap simulation. We adapted the visual rendering to create a custom feminine avatar and a dark theme that matches the design of this site.

Animation engine: JugglingLab (© Jack Boyce), used under its [GPL-2.0 license](https://github.com/jkboyce/jugglinglab/blob/master/LICENSE).

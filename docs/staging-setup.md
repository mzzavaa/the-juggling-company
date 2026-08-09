# Staging site: dev.thejugglingcompany.com

A staging site lets you preview changes at **dev.thejugglingcompany.com**
before they go live on the production site (thejugglingcompany.com).

## Why it's a separate repo

GitHub Pages serves **one custom domain per repository**, and this repo is
already bound to `thejugglingcompany.com`. So staging lives in a second repo
that publishes to the `dev.` subdomain. The staging site builds the **`staging`
branch** of this repo, so production is never affected.

**Preview flow:** push changes to a `staging` branch here → the staging site
rebuilds → review at dev.thejugglingcompany.com → merge to `main` when happy.

## One-time setup (~5 minutes, needs a computer)

Do these when you're back at a working machine - the DNS step in particular
isn't practical from a phone.

1. **Create the staging repo.** New **public** repo named
   `the-juggling-company-staging` (public keeps GitHub Pages free).

2. **Add the deploy workflow.** Copy [`docs/staging/deploy-staging.yml`](./staging/deploy-staging.yml)
   from this repo into the new repo at
   `.github/workflows/deploy-staging.yml`. It needs no secrets - it reads this
   public repo's `staging` branch.

3. **Turn on Pages (Actions source).** In the staging repo:
   Settings → Pages → **Source: GitHub Actions**.

4. **Add the DNS record** at your domain registrar (where thejugglingcompany.com
   is managed):

   | Type  | Name  | Value                |
   | ----- | ----- | -------------------- |
   | CNAME | `dev` | `mzzavaa.github.io.` |

5. **Set the custom domain.** In the staging repo:
   Settings → Pages → Custom domain → `dev.thejugglingcompany.com` → Save,
   then tick **Enforce HTTPS** once the certificate is issued (can take a few
   minutes to an hour).

6. **Create the source branch** in this repo and trigger the first deploy:

   ```sh
   git checkout main && git pull
   git checkout -b staging && git push -u origin staging
   ```

   Then in the staging repo: Actions → **Deploy staging site** → **Run workflow**.

## Notes

- Even **before** the DNS step (4-5), the staging site is viewable at its
  GitHub Pages URL, e.g. `https://mzzavaa.github.io/the-juggling-company-staging/`
  - handy for a phone.
- The staging build sets `SITE_URL=https://dev.thejugglingcompany.com` so
  canonical URLs and the sitemap point at the staging domain, keeping it out of
  production's SEO.
- To refresh staging after pushing to `staging`, run the workflow manually
  (Actions → Run workflow); it also auto-runs hourly.
- `robots.txt`/indexing: consider adding a `noindex` for the staging domain if
  you don't want it crawled. Ask and I can wire that up.

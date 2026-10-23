# Garden State Collective Staff Portal

Static site (HTML, CSS, vanilla JS). No build step, no backend.

## Deploy to GitHub Pages
1. Create a repository and upload every file in this folder (keep the folder layout).
2. Go to **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Choose branch `main`, folder `/ (root)`, then **Save**. The site appears at `https://<user>.github.io/<repo>/` after a minute. All paths are relative, so project sites and custom domains both work.
4. Replace `assets/logo.png` and `assets/favicon.png` (they are 1px placeholders).

## Customize
Edit `config.js`: site name, theme color, nav, banners, priorities, statuses, page size. **Never put webhook URLs or secrets in it.**

## Add or change a report type
Edit `data/report-templates.json`. Add an object to `templates` with `id`, `title`, `description`, `color`, and `fields`. Field `type` can be `text`, `textarea`, `select`, `multiselect`, or `date`. Set `required: true` and, for select types, `options`. "Staff Strike" uses a plain text field for rank so any rank can be typed.

## Discord delivery (secure)
GitHub Pages cannot hide secrets, so webhooks live in a Cloudflare Worker:
1. Create a Worker and add one secret per webhook, for example `WEBHOOK_STAFF`, `WEBHOOK_APPEALS`, `WEBHOOK_DEFAULT` (Worker → Settings → Variables and Secrets).
2. In the Worker, map `templateId` to a secret (server-side), validate the payload, restrict CORS to your site origin, and POST a Discord embed (title, ref, priority, timestamp, fields from `data`, footer "Garden State Collective", color).
3. Put the Worker URL in `config.js` → `integrations.endpoint`.
If you need message authentication, use server-side HMAC-SHA-256 with a secret. SHA-256 alone is a hash, not encryption.

## Demo vs connected mode
- **Demo mode** (`endpoint` empty): reports and dashboard edits live only in your browser's localStorage, with labeled sample records. Not shared, not secure.
- **Connected mode**: Discord delivery works once the endpoint is set.

## Needs an external service
Shared report storage, real staff login and permissions, protected status/assignment changes, audit history, evidence uploads, and private webhooks. Use a service such as Supabase, Cloudflare D1/Workers, or Firebase with server-side rules. The dashboard here is not real access control.

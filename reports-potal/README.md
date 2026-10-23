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
The `worker/` folder holds a Cloudflare Worker that relays reports to Discord and serves a status page. Webhooks live only in Worker secrets.
1. In Cloudflare: Workers & Pages -> Create -> Create Worker -> Deploy, then Edit code, paste all of `worker/worker.js`, and Deploy. (Do not use the Pages upload: it rejects Workers.)
2. Worker -> Settings -> Variables and Secrets. Add `ALLOWED_ORIGIN` (text, your site such as `https://gardenstatecollective.com`; comma-separate extra addresses like the www version) and `WEBHOOK_DEFAULT` (secret). Optional secrets: `WEBHOOK_STAFF`, `WEBHOOK_APPEALS`, `WEBHOOK_INVESTIGATIONS`, `WEBHOOK_DISCORD`, `WEBHOOK_MANAGEMENT`. Optional text `SITE_URL`.
3. Open your `*.workers.dev` URL. The status page should say Operational. `/status` returns the same as JSON.
4. Put the Worker URL in `config.js` -> `integrations.endpoint`. The site then shows a relay status banner and sends reports to Discord.
Terminal alternative: edit `worker/wrangler.toml`, run `wrangler login`, `wrangler secret put WEBHOOK_DEFAULT` (and others), then `wrangler deploy`.
Message authentication, if you ever need it, must use server-side HMAC-SHA-256 with a secret. SHA-256 alone is a hash, not encryption. Add a Cloudflare rate limiting rule on the Worker route.

## Demo vs connected mode
- **Demo mode** (`endpoint` empty): reports and dashboard edits live only in your browser's localStorage, with labeled sample records. Not shared, not secure.
- **Connected mode**: Discord delivery works once the endpoint is set.

## Needs an external service
Shared report storage, real staff login and permissions, protected status/assignment changes, audit history, evidence uploads, and private webhooks. Use a service such as Supabase, Cloudflare D1/Workers, or Firebase with server-side rules. The dashboard here is not real access control.

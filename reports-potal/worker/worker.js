/**
 * Garden State Collective: report relay + status page (Cloudflare Worker)
 *
 * POST  /        Website submits a report. Validated, then sent to Discord as an embed.
 * GET   /        Public status page (HTML) showing whether the relay is online and working.
 * GET   /status  The same status as JSON.
 *
 * Webhook URLs live only in Worker secrets. The status page shows only
 * OK / not OK for each channel. It never shows a webhook URL.
 *
 * SETTINGS (Worker -> Settings -> Variables and Secrets)
 *   ALLOWED_ORIGIN   (text)   your site address, e.g. https://gardenstatecollective.com
 *                    Several allowed, separated by commas (e.g. with and without www).
 *                    A path or trailing slash is ignored.
 *   SITE_URL         (text, optional) dashboard URL used as the embed link
 *   WEBHOOK_DEFAULT  (secret) fallback webhook
 *   WEBHOOK_STAFF, WEBHOOK_APPEALS, WEBHOOK_INVESTIGATIONS, WEBHOOK_DISCORD, WEBHOOK_MANAGEMENT
 *                    (secrets) one per channel; any you skip use WEBHOOK_DEFAULT
 */

const VERSION = "1.2.0";

// templateId -> which secret holds its webhook. Trusted: runs server-side only.
const ROUTES = {
  "investigation":      { hook: "WEBHOOK_INVESTIGATIONS", color: 0x8700ff },
  "staff-movement":     { hook: "WEBHOOK_MANAGEMENT",     color: 0x6a5bff },
  "discord-user":       { hook: "WEBHOOK_DISCORD",        color: 0x5865f2 },
  "strike-demotion":    { hook: "WEBHOOK_STAFF",          color: 0xe5484d },
  "staff-strike":       { hook: "WEBHOOK_STAFF",          color: 0xf76b15 },
  "warning":            { hook: "WEBHOOK_STAFF",          color: 0xffb224 },
  "blacklist":          { hook: "WEBHOOK_MANAGEMENT",     color: 0x7c7c8a },
  "staff-review":       { hook: "WEBHOOK_STAFF",          color: 0x30a46c },
  "promotion-request":  { hook: "WEBHOOK_MANAGEMENT",     color: 0x00a2c7 },
  "ban-appeal":         { hook: "WEBHOOK_APPEALS",        color: 0xab4aba },
  "loa":                { hook: "WEBHOOK_MANAGEMENT",     color: 0x12a594 },
  "staff-suggestion":   { hook: "WEBHOOK_MANAGEMENT",     color: 0xff8dcc }
};

const TITLES = {
  "investigation": "Investigation Report", "staff-movement": "Staff Movement Report",
  "discord-user": "Discord User Report", "strike-demotion": "Strike / Demotion Report",
  "staff-strike": "Staff Strike", "warning": "Warning Report", "blacklist": "Blacklist Report",
  "staff-review": "Staff Review", "promotion-request": "Promotion Request",
  "ban-appeal": "Ban Appeal", "loa": "LOA Notice", "staff-suggestion": "Staff Suggestion"
};

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const MAX_BODY = 20000;
const MAX_FIELD = 1000;
const MAX_FIELDS = 20;
const REF_RE = /^GSC-\d{8}-[A-Z0-9]{4}$/;
const KEY_RE = /^[A-Za-z][A-Za-z0-9]{0,40}$/;
const HOOK_RE = /^https:\/\/(?:discord|discordapp)\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+$/;
const HOOK_NAMES = ["WEBHOOK_DEFAULT"].concat(Array.from(new Set(Object.values(ROUTES).map(r => r.hook))));

let statusCache = { t: 0, data: null };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedList = parseOrigins(env.ALLOWED_ORIGIN);
    const allowed = allowedList.join(", ");
    const cors = {
      "Access-Control-Allow-Origin": allowedList.indexOf(origin) !== -1 ? origin : (allowedList[0] || "null"),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    const reply = (status, obj) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

    // Status page and status JSON (public, read-only)
    if (request.method === "GET" || request.method === "HEAD") {
      if (url.pathname === "/status") {
        const data = await getStatus(env, allowed);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(PAGE, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'"
          }
        });
      }
      return reply(404, { error: "Not found." });
    }

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply(405, { error: "Use POST." });
    if (!allowed) return reply(500, { error: "ALLOWED_ORIGIN is not configured." });
    if (allowedList.indexOf(origin) === -1) return reply(403, { error: "Origin not allowed." });
    if (!(request.headers.get("Content-Type") || "").includes("application/json"))
      return reply(415, { error: "Send JSON." });

    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply(413, { error: "Report is too large." });

    let body;
    try { body = JSON.parse(raw); } catch (e) { return reply(400, { error: "Invalid JSON." }); }
    if (!body || typeof body !== "object") return reply(400, { error: "Invalid JSON." });

    const route = ROUTES[body.templateId];
    if (!route) return reply(400, { error: "Unknown report type." });
    if (typeof body.ref !== "string" || !REF_RE.test(body.ref)) return reply(400, { error: "Invalid reference number." });
    if (PRIORITIES.indexOf(body.priority) === -1) return reply(400, { error: "Invalid priority." });
    if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) return reply(400, { error: "Missing report data." });
    const submittedAt = new Date(body.submittedAt);
    if (isNaN(submittedAt.getTime())) return reply(400, { error: "Invalid timestamp." });

    const webhook = env[route.hook] || env.WEBHOOK_DEFAULT;
    if (!webhook) return reply(500, { error: "No webhook configured for this report type." });

    const fields = [];
    for (const [key, value] of Object.entries(body.data)) {
      if (fields.length >= MAX_FIELDS) break;
      if (!KEY_RE.test(key) || key === "submitter" || key === "priority") continue;
      const text = clean(value);
      if (!text) continue;
      fields.push({
        name: prettify(key),
        value: key === "evidence" ? evidenceLinks(text) : text,
        inline: text.length < 40 && text.indexOf("\n") === -1
      });
    }

    const submitter = clean(body.data.submitter) || "Unknown";
    const siteUrl = safeUrl(env.SITE_URL, allowedList);
    const embed = {
      title: TITLES[body.templateId] + " (" + body.ref + ")",
      description: "**Priority:** " + body.priority + "\n**Submitted by:** " + submitter,
      color: route.color,
      fields: fields,
      timestamp: submittedAt.toISOString(),
      footer: { text: "Garden State Collective" }
    };
    if (siteUrl) embed.url = siteUrl;

    let res;
    try {
      res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "GSC Reports", embeds: [embed], allowed_mentions: { parse: [] } })
      });
    } catch (e) {
      return reply(502, { error: "Could not reach Discord." });
    }
    if (!res.ok) return reply(502, { error: "Discord rejected the message." });
    return reply(200, { ok: true, ref: body.ref });
  }
};

// ---------- status checks ----------

// A GET on a webhook URL returns its info without posting anything.
async function checkWebhook(value) {
  if (!value) return "missing";
  if (!HOOK_RE.test(String(value).trim())) return "invalid";
  try {
    const res = await fetch(String(value).trim(), { method: "GET", signal: AbortSignal.timeout(4000) });
    if (res.ok) return "ok";
    if (res.status === 401 || res.status === 404) return "invalid";
    return "unreachable";
  } catch (e) {
    return "unreachable";
  }
}

async function getStatus(env, allowed) {
  if (statusCache.data && Date.now() - statusCache.t < 60000) return statusCache.data;

  const results = await Promise.all(HOOK_NAMES.map(n => checkWebhook(env[n])));
  const hooks = {};
  HOOK_NAMES.forEach((n, i) => { hooks[n] = results[i]; });

  const types = Object.keys(ROUTES).map(id => {
    const hook = ROUTES[id].hook;
    let state;
    if (hooks[hook] === "ok") state = "ready";
    else if (hooks[hook] === "missing") state = hooks.WEBHOOK_DEFAULT === "ok" ? "default" : "none";
    else state = hooks[hook] === "unreachable" ? "unverified" : "error";
    return { id: id, title: TITLES[id], channel: label(hook), state: state };
  });

  const working = types.filter(t => t.state === "ready" || t.state === "default").length;
  let state, message;
  if (!allowed) { state = "offline"; message = "Setup needed: ALLOWED_ORIGIN is not set."; }
  else if (working === types.length) { state = "operational"; message = "All systems operational."; }
  else if (working === 0) { state = "offline"; message = "No report types can reach Discord. Check the webhook secrets."; }
  else { state = "degraded"; message = working + " of " + types.length + " report types can reach Discord."; }

  const data = {
    state: state,
    message: message,
    version: VERSION,
    checkedAt: new Date().toISOString(),
    origin: allowed || null,
    types: types
  };
  statusCache = { t: Date.now(), data: data };
  return data;
}

function label(hook) {
  const s = hook.replace("WEBHOOK_", "").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- helpers ----------

function clean(v) {
  if (v == null) return "";
  return String(v).trim().slice(0, MAX_FIELD).replace(/@/g, "@\u200b");
}

function prettify(key) {
  const s = key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
  return s.slice(0, 250);
}

function evidenceLinks(text) {
  const links = text.split("\n").map(l => l.trim()).filter(l => /^https?:\/\/\S+$/.test(l));
  return links.length ? links.join("\n").slice(0, MAX_FIELD) : "No valid links provided";
}

function parseOrigins(value) {
  return String(value || "").split(",").map(function (v) {
    v = v.trim();
    if (!v) return "";
    try { return new URL(v).origin; } catch (e) { return v.replace(/\/+$/, ""); }
  }).filter(Boolean);
}

function safeUrl(url, origins) {
  try {
    const u = new URL(url);
    return origins.indexOf(u.origin) !== -1 ? u.toString() : "";
  } catch (e) { return ""; }
}

// ---------- status page ----------

const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Status | Garden State Collective Reports</title>
<style>
:root{color-scheme:dark;--p:#8700FF;--bg:#0B0B10;--sf:#15151F;--bd:#2b2940;--tx:#F5F3FA;--mu:#a29db3;--ok:#30A46C;--wn:#FFB224;--er:#E5484D}
@media(prefers-color-scheme:light){:root{color-scheme:light;--bg:#F6F3FB;--sf:#fff;--bd:#ddd3ee;--tx:#17121f;--mu:#6a6378}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.5 "Segoe UI",system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:40px 20px 64px}
h1{font-size:1.5rem;margin:0 0 4px}
.sub{color:var(--mu);margin:0 0 24px}
.hero{display:flex;align-items:center;gap:16px;background:var(--sf);border:1px solid var(--bd);border-left:6px solid var(--mu);border-radius:12px;padding:20px}
.hero.operational{border-left-color:var(--ok)}.hero.degraded{border-left-color:var(--wn)}.hero.offline{border-left-color:var(--er)}
.dot{width:14px;height:14px;border-radius:50%;background:var(--mu);flex:none}
.operational .dot{background:var(--ok)}.degraded .dot{background:var(--wn)}.offline .dot{background:var(--er)}
.hero h2{margin:0;font-size:1.25rem}.hero p{margin:2px 0 0;color:var(--mu)}
h3{margin:32px 0 10px;font-size:1.05rem}
table{width:100%;border-collapse:collapse;background:var(--sf);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--bd);font-size:.93rem}
tr:last-child td{border-bottom:0}
.pill{display:inline-block;padding:2px 10px;border-radius:99px;font-size:.8rem;border:1px solid var(--bd)}
.pill.ready,.pill.default{color:var(--ok);border-color:var(--ok)}
.pill.unverified{color:var(--wn);border-color:var(--wn)}
.pill.none,.pill.error{color:var(--er);border-color:var(--er)}
.meta{color:var(--mu);font-size:.85rem;margin-top:16px}
button{font:inherit;color:var(--tx);background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:8px 14px;cursor:pointer}
button:hover{border-color:var(--p)}button:focus-visible{outline:2px solid var(--p);outline-offset:2px}
.wrap{overflow-x:auto}
</style></head>
<body><main>
<h1>Garden State Collective report relay</h1>
<p class="sub">Live status of Discord report delivery.</p>
<div class="hero" id="hero" role="status" aria-live="polite"><span class="dot"></span><div><h2 id="title">Checking…</h2><p id="msg">Running checks.</p></div></div>
<h3>Report types</h3>
<div class="wrap"><table><thead><tr><th>Report</th><th>Channel</th><th>Status</th></tr></thead><tbody id="rows"><tr><td colspan="3">Loading…</td></tr></tbody></table></div>
<p class="meta" id="meta"></p>
<button id="refresh" type="button">Check again</button>
<noscript><p class="meta">Turn on JavaScript to see live status, or open /status for the raw JSON.</p></noscript>
</main>
<script>
(function () {
  var LABELS = { ready: "Ready", "default": "Ready (default channel)", unverified: "Could not verify", none: "No webhook", error: "Webhook error" };
  var TITLES = { operational: "Operational", degraded: "Partially working", offline: "Not working" };
  var hero = document.getElementById("hero");
  var rows = document.getElementById("rows");
  var btn = document.getElementById("refresh");

  function td(text, cls) {
    var c = document.createElement("td");
    if (cls) { var s = document.createElement("span"); s.className = "pill " + cls; s.textContent = text; c.appendChild(s); }
    else c.textContent = text;
    return c;
  }

  function render(d) {
    hero.className = "hero " + d.state;
    document.getElementById("title").textContent = TITLES[d.state] || "Unknown";
    document.getElementById("msg").textContent = d.message;
    rows.textContent = "";
    d.types.forEach(function (t) {
      var tr = document.createElement("tr");
      tr.appendChild(td(t.title));
      tr.appendChild(td(t.channel));
      tr.appendChild(td(LABELS[t.state] || t.state, t.state));
      rows.appendChild(tr);
    });
    document.getElementById("meta").textContent =
      "Last checked " + new Date(d.checkedAt).toLocaleString() + " · Version " + d.version +
      (d.origin ? " · Accepts reports from " + d.origin : "");
  }

  function fail() {
    hero.className = "hero offline";
    document.getElementById("title").textContent = "Status check failed";
    document.getElementById("msg").textContent = "Could not load status. Check your connection and try again.";
  }

  function load() {
    btn.disabled = true;
    fetch("/status", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
      .then(render)
      .catch(fail)
      .then(function () { btn.disabled = false; });
  }

  btn.addEventListener("click", load);
  load();
  setInterval(load, 60000);
})();
</script></body></html>`;

// Public settings only. NEVER put Discord webhook URLs or secrets in this file.
window.GSC_CONFIG = {
  siteName: "Garden State Collective",
  tagline: "Staff reporting portal",
  footer: "© Garden State Collective. Internal staff use only.",
  theme: { primary: "#8700FF", background: "#0B0B10", surface: "#15151F", text: "#F5F3FA", defaultMode: "dark" },
  nav: [
    { label: "Home", href: "index.html" },
    { label: "Submit report", href: "submit-report.html", feature: "reports" },
    { label: "Dashboard", href: "dashboard.html", feature: "dashboard" }
  ],
  features: { reports: true, dashboard: true, announcements: true },
  announcement: { show: true, text: "Staff: all reports are reviewed by Management. Include evidence links where possible." },
  maintenance: { show: false, text: "Scheduled maintenance tonight at 11 PM ET." },
  reports: { templatesUrl: "data/report-templates.json", requireDescription: true, allowLocalDrafts: true },
  priorities: ["Low", "Medium", "High", "Critical"],
  statuses: ["Open", "In review", "Resolved", "Closed"],
  pagination: { pageSize: 8 },
  // Leave endpoint empty for demo mode. Set it to your Cloudflare Worker URL for live delivery.
  integrations: { discordEnabled: true, endpoint: "https://gscrp-reports-api.vantixdevelopment.workers.dev", deliveryMode: "serverless" },
  links: { discord: "https://discord.gardenstatecollective.com/", contact: "" }
};

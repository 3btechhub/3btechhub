const ACCOUNT_LAYOUTS = new Map([
  ["login", "login"],
  ["create-account", "signup"],
  ["reset-password", "recovery-start"],
  ["verify", "recovery-verify"],
  ["new-password", "recovery-new-password"],
  ["profile", "profile"]
]);

const DASHBOARD_TABS = new Map([
  ["overview", "overview"],
  ["info", "info"],
  ["media", "media"],
  ["relation", "relation"],
  ["user", "users"],
  ["role", "roles"],
  ["permission", "permissions"],
  ["preference", "preference"],
  ["setting", "setting"]
]);

export function parseSiteRoute(pathname, basePath = "/3btechhub/") {
  const normalizedBase = basePath.endsWith("/") ? basePath : basePath + "/";
  if (!String(pathname || "").startsWith(normalizedBase)) return null;
  const parts = String(pathname).slice(normalizedBase.length).split("/").filter(Boolean);
  if (!parts.length) return { view: "home", layout: "overview" };

  const [page, layout, slug, extra] = parts;
  if (page === "home") {
    if (parts.length === 1 || (parts.length === 2 && layout === "overview")) {
      return { view: "home", layout: "overview" };
    }
    if (parts.length === 3 && layout === "list-view" && slug) {
      return { view: "home", layout: "list-view", recordSlug: slug };
    }
    if (parts.length === 3 && layout === "detail-view" && slug) {
      return { view: "home", layout: "detail-view", recordSlug: slug };
    }
    return { view: "fallback" };
  }

  if (page === "account") {
    if (parts.length === 1) return { view: "account", authMode: "login", layout: "login" };
    if (parts.length !== 2 || !ACCOUNT_LAYOUTS.has(layout)) return { view: "fallback" };
    return { view: "account", authMode: ACCOUNT_LAYOUTS.get(layout), layout };
  }

  if (page === "dashboard") {
    if (parts.length === 1) return { view: "dashboard", dashboardTab: "overview" };
    if (parts.length !== 2 || !DASHBOARD_TABS.has(layout)) return { view: "fallback" };
    return { view: "dashboard", dashboardTab: DASHBOARD_TABS.get(layout) };
  }

  return { view: "fallback" };
}

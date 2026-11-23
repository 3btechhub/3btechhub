// Shared Supabase client and role-based visibility helper.
// The Supabase JS v2 CDN must be loaded before this file.
(() => {
  "use strict";

  if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(
      "https://sburxeuxkrilbfppxylm.supabase.co",
      "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT"
    );
  }

  if (!window.__3bAccess) {
    const access = {
      permissions: new Set(),
      ready: false,

      setPermissions(values) {
        this.permissions = new Set(Array.isArray(values) ? values : []);
        this.ready = true;
        this.apply(document);
        document.dispatchEvent(new Event("3b-access-ready"));
      },

      has(permission) {
        return this.ready && this.permissions.has(permission);
      },

      apply(root = document) {
        if (!root || typeof root.querySelectorAll !== "function") return;
        const elements = [];
        if (root.matches?.("[data-permission]")) elements.push(root);
        elements.push(...root.querySelectorAll("[data-permission]"));

        elements.forEach(element => {
          const visible = this.has(element.getAttribute("data-permission"));
          element.hidden = !visible;
          element.setAttribute("aria-hidden", String(!visible));
        });
      }
    };

    window.__3bAccess = access;
    access.apply(document);
  }

  document.dispatchEvent(new Event("3b-auth-client-ready"));
})();

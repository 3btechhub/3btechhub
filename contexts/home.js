(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.home = async root => {
    const service = window.__3bIntroService;
    if (!service || !root) return;
    const render = (content, imageUrl) => {
      const component = window.__3bComponents?.intro?.render(content || {}, imageUrl || null, { fallback: true });
      if (!component) return;
      const title = root.querySelector(".page-title");
      if (title?.parentNode) title.insertAdjacentElement("afterend", component);
      else root.appendChild(component);
    };
    try {
      const supabase = window.supabaseClient;
      const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!authData?.user) {
        // Unauthenticated requests use the database's anon role, which is
        // treated as the Visitor role by the public-content RLS policy.
        const content = await service.getContent();
        render(content, service.publicImageUrl(content?.image_path));
        return;
      }
      const { data: assignments, error: roleError } = await supabase.from("user_roles")
        .select("role_id").eq("user_id", authData.user.id);
      if (roleError) throw roleError;
      const roleIds = new Set((assignments || []).map(item => item.role_id));
      if (!roleIds.size) {
        render(null, null);
        return;
      }
      const content = await service.getContent();
      if (!content || !Array.isArray(content.visible_role_ids) ||
          !content.visible_role_ids.some(id => roleIds.has(id))) {
        render(null, null);
        return;
      }
      render(content, service.publicImageUrl(content.image_path));
    } catch (error) {
      console.error("[3B TECH HUB] Intro could not be rendered:", error);
      render(null, null);
    }
  };
})();
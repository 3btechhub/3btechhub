(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.home = async root => {
    const supabase = window.supabaseClient;
    const service = window.__3bIntroService;
    if (!supabase || !service || !root) return;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      const { data: assignments, error: roleError } = await supabase.from("user_roles")
        .select("role_id").eq("user_id", authData.user.id);
      if (roleError) throw roleError;
      const roleIds = new Set((assignments || []).map(item => item.role_id));
      if (!roleIds.size) return;
      const content = await service.getContent();
      if (!content || !Array.isArray(content.visible_role_ids) ||
          !content.visible_role_ids.some(id => roleIds.has(id))) return;
      const imageUrl = service.publicImageUrl(content.image_path);
      const component = window.__3bComponents?.intro?.render(content, imageUrl);
      if (!component) return;
      const title = root.querySelector(".page-title");
      if (title?.parentNode) title.insertAdjacentElement("afterend", component);
      else root.appendChild(component);
    } catch (error) {
      console.error("[3B TECH HUB] Intro could not be rendered:", error);
    }
  };
})();
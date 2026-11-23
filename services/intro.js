(() => {
  "use strict";
  const supabase = () => window.supabaseClient;
  const service = {
    getRoles() {
      return window.__3bServices.getActiveRoles();
    },
    async getContent() {
      const { data, error } = await supabase().from("intro_content")
        .select("id,heading,sub_heading,image_path,visible_role_ids").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
    async saveContent(values) {
      const { error } = await supabase().from("intro_content").upsert({
        id: 1,
        heading: values.heading.trim(),
        sub_heading: values.sub_heading.trim(),
        image_path: values.image_path || null,
        visible_role_ids: values.visible_role_ids
      }, { onConflict: "id" });
      if (error) throw error;
    },
    uploadImage(file) {
      return window.__3bServices.uploadPublicImage(file, "intro");
    },
    publicImageUrl(path) {
      return window.__3bServices.publicImageUrl(path);
    }
  };
  window.__3bIntroService = service;
})();

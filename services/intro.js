(() => {
  "use strict";
  const supabase = () => window.supabaseClient;
  const service = {
    async getRoles() {
      const { data, error } = await supabase().from("roles")
        .select("id,name,slug").eq("is_active", true).order("name");
      if (error) throw error;
      return data || [];
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
    async uploadImage(file) {
      if (!file || !/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) {
        throw new Error("Choose a JPG, PNG, WebP, GIF or AVIF image.");
      }
      if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
      const extension = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
      const path = "intro/" + crypto.randomUUID() + "." + extension;
      const { error } = await supabase().storage.from("site-media").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type
      });
      if (error) throw error;
      return path;
    },
    publicImageUrl(path) {
      if (!path) return "";
      return supabase().storage.from("site-media").getPublicUrl(path).data.publicUrl;
    }
  };
  window.__3bIntroService = service;
})();
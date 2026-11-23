(() => {
  "use strict";
  window.__3bServices = window.__3bServices || {};
  const services = window.__3bServices;

  services.getActiveRoles = async () => {
    const { data, error } = await window.supabaseClient.from("roles")
      .select("id,name,slug").eq("is_active", true).order("name");
    if (error) throw error;
    return data || [];
  };

  services.uploadPublicImage = async (file, folder) => {
    if (!file || !/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) {
      throw new Error("Choose a JPG, PNG, WebP, GIF or AVIF image.");
    }
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
    const extension = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
    const path = folder + "/" + crypto.randomUUID() + "." + extension;
    const { error } = await window.supabaseClient.storage.from("site-media").upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type
    });
    if (error) throw error;
    return path;
  };

  services.publicImageUrl = path => {
    if (!path) return "";
    return window.supabaseClient.storage.from("site-media").getPublicUrl(path).data.publicUrl;
  };

  services.createContentModule = config => {
    const supabase = () => window.supabaseClient;
    return {
      getRoles: () => services.getActiveRoles(),
      async listPublic() {
        const { data, error } = await supabase().from(config.table)
          .select("id,name,slug,icon,image_path,visible_role_ids,sort_order")
          .order("sort_order").order("created_at");
        if (error) throw error;
        return data || [];
      },
      async getPublicBySlug(slug) {
        const { data, error } = await supabase().from(config.table)
          .select("id,name,slug,icon,image_path,visible_role_ids")
          .eq("slug", slug).maybeSingle();
        if (error) throw error;
        return data;
      },
      async listManage() {
        const { data, error } = await supabase().from(config.table)
          .select("id,name,slug,icon,image_path,visible_role_ids,sort_order,created_at")
          .order("sort_order").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      },
      async save(values, id = null) {
        const record = {
          name: String(values.name || "").trim(),
          slug: String(values.slug || "").trim().toLowerCase(),
          icon: String(values.icon || "").trim(),
          image_path: values.image_path || null,
          visible_role_ids: Array.isArray(values.visible_role_ids) ? values.visible_role_ids : []
        };
        if (!record.name) throw new Error("Name is required.");
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
          throw new Error("Slug must use lowercase letters, numbers and single hyphens.");
        }
        if (id) {
          const { error } = await supabase().from(config.table).update(record).eq("id", id);
          if (error) throw error;
        } else {
          const { data: auth } = await supabase().auth.getUser();
          const { error } = await supabase().from(config.table).insert({
            ...record, created_by: auth?.user?.id || null
          });
          if (error) throw error;
        }
      },
      async remove(id) {
        const { data: row, error: readError } = await supabase().from(config.table)
          .select("image_path").eq("id", id).maybeSingle();
        if (readError) throw readError;
        const { error } = await supabase().from(config.table).delete().eq("id", id);
        if (error) throw error;
        if (row?.image_path) {
          const { error: storageError } = await supabase().storage.from("site-media").remove([row.image_path]);
          if (storageError) console.warn("[3B TECH HUB] Old " + config.singular.toLowerCase() + " image could not be removed:", storageError);
        }
      },
      uploadImage: file => services.uploadPublicImage(file, config.storageFolder),
      publicImageUrl: path => services.publicImageUrl(path),
      toSlug(value) {
        return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
          .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
    };
  };
})();

import { supabase } from "./supabase-client.js";

const READY_EVENT = "website-intro-ready";

function emitReady(element) {
  element.dataset.ready = "true";
  element.dispatchEvent(new CustomEvent(READY_EVENT, { bubbles: true }));
  document.dispatchEvent(new Event(READY_EVENT));
}

class WebsiteIntro extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.className = "website-intro-card";
    this.setAttribute("aria-labelledby", "website-intro-title");

    const heading = document.createElement("h1");
    heading.id = "website-intro-title";
    heading.className = "website-intro-headline";
    heading.textContent = "";

    const content = document.createElement("p");
    content.className = "website-intro-content";
    content.hidden = true;

    this.replaceChildren(heading, content);

    try {
      const { data, error } = await supabase
        .from("site_preferences")
        .select("preference_value")
        .eq("preference_key", "intro")
        .maybeSingle();

      if (error) throw error;

      const intro = typeof data?.preference_value === "string"
        ? data.preference_value.trim()
        : "";

      if (intro) {
        heading.textContent = intro;
        content.hidden = true;
        this.hidden = false;
      } else {
        this.hidden = true;
      }
    } catch (error) {
      this.hidden = true;
      console.error("Website intro could not be loaded:", error);
    } finally {
      emitReady(this);
    }
  }
}

class WebsiteIntroEditor extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.className = "website-intro-editor-card";

    const title = document.createElement("h2");
    title.textContent = "Website Intro";

    const form = document.createElement("form");
    form.className = "website-intro-form";

    const textarea = document.createElement("textarea");
    textarea.name = "intro";
    textarea.rows = 4;
    textarea.maxLength = 2000;
    textarea.placeholder = "Enter the website introduction";
    textarea.setAttribute("aria-label", "Website Intro");

    const save = document.createElement("button");
    save.type = "submit";
    save.textContent = "Save";

    const status = document.createElement("p");
    status.className = "website-intro-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    form.append(textarea, save, status);
    this.replaceChildren(title, form);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error("Owner session unavailable");

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "Owner")
        .maybeSingle();

      if (roleError) throw roleError;
      if (!roleData) {
        this.hidden = true;
        emitReady(this);
        return;
      }

      const { data: introData, error: introError } = await supabase
        .from("site_preferences")
        .select("preference_value")
        .eq("preference_key", "intro")
        .maybeSingle();

      if (introError) throw introError;
      textarea.value = introData?.preference_value || "";

      form.addEventListener("submit", async event => {
        event.preventDefault();
        save.disabled = true;
        status.textContent = "";

        try {
          const { error } = await supabase
            .from("site_preferences")
            .upsert({
              preference_key: "intro",
              preference_value: textarea.value.trim(),
              updated_at: new Date().toISOString()
            }, { onConflict: "preference_key" });

          if (error) throw error;
          status.textContent = "Saved successfully.";
        } catch (error) {
          console.error("Website intro save failed:", error);
          status.textContent = "Unable to save. Please try again.";
        } finally {
          save.disabled = false;
        }
      });

      this.hidden = false;
    } catch (error) {
      this.hidden = true;
      console.error("Website intro editor could not be initialized:", error);
    } finally {
      emitReady(this);
    }
  }
}

if (!customElements.get("website-intro")) {
  customElements.define("website-intro", WebsiteIntro);
}
if (!customElements.get("website-intro-editor")) {
  customElements.define("website-intro-editor", WebsiteIntroEditor);
}

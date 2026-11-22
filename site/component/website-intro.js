import { supabase } from "./supabase-client.js";

class WebsiteIntro extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    try {
      const { data, error } = await supabase
        .from("website_intro")
        .select("intro_text")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      const introText = data?.intro_text?.trim();
      if (!introText) {
        this.hidden = true;
        return;
      }

      const heading = document.createElement("h2");
      heading.className = "ui-card ui-card--large website-intro__text";
      heading.textContent = introText;
      this.replaceChildren(heading);
      this.hidden = false;
    } catch (error) {
      this.hidden = true;
      console.error("Website intro could not be loaded:", error);
    }
  }
}

class WebsiteIntroEditor extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || userData.user?.app_metadata?.role !== "Owner") {
        this.hidden = true;
        return;
      }

      const { data, error } = await supabase
        .from("website_intro")
        .select("intro_text")
        .eq("id", 1)
        .single();

      if (error) throw error;

      const section = document.createElement("section");
      section.className = "website-intro-editor";

      const heading = document.createElement("h2");
      heading.textContent = "Website Intro";

      const form = document.createElement("form");
      const label = document.createElement("label");
      label.htmlFor = "website-intro-text";
      label.textContent = "Intro Text";

      const textarea = document.createElement("textarea");
      textarea.id = "website-intro-text";
      textarea.name = "intro_text";
      textarea.rows = 4;
      textarea.maxLength = 2000;
      textarea.value = data.intro_text || "";

      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "Save";

      const status = document.createElement("p");
      status.className = "website-intro-editor__status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");

      form.append(label, textarea, saveButton, status);
      section.append(heading, form);
      this.replaceChildren(section);
      this.hidden = false;

      form.addEventListener("submit", async event => {
        event.preventDefault();
        saveButton.disabled = true;
        status.textContent = "Saving…";

        try {
          const { error: updateError } = await supabase
            .from("website_intro")
            .update({
              intro_text: textarea.value.trim(),
              updated_at: new Date().toISOString()
            })
            .eq("id", 1);

          if (updateError) throw updateError;
          status.textContent = "Saved successfully.";
        } catch (updateError) {
          console.error("Website intro save failed:", updateError);
          status.textContent = "Unable to save. Please try again.";
        } finally {
          saveButton.disabled = false;
        }
      });
    } catch (error) {
      this.hidden = true;
      console.error("Website intro editor could not be loaded:", error);
    }
  }
}

if (!customElements.get("website-intro")) {
  customElements.define("website-intro", WebsiteIntro);
}

if (!customElements.get("website-intro-editor")) {
  customElements.define("website-intro-editor", WebsiteIntroEditor);
}

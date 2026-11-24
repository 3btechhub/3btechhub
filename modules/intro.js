import "../components/section-card.js";
import "../components/item-card.js";
import { supabase } from "../components/supabase-client.js";

const mount = document.querySelector("[data-intro-mode]");
if (!mount) throw new Error("Intro mount point is missing.");

const mode = mount.dataset.introMode;

function createSectionCard(showTitle = true) {
  const section = document.createElement("section-card");
  if (showTitle) section.setAttribute("title", "Intro");
  return section;
}

function createHeadingItem(value) {
  const item = document.createElement("item-card");

  const heading = document.createElement("p");
  heading.className = "intro-heading";
  heading.textContent = value || "";
  item.appendChild(heading);

  return { item, heading };
}

async function loadIntro() {
  const { data, error } = await supabase
    .from("intro_content")
    .select("heading")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function renderPublicIntro(headingText) {
  mount.replaceChildren();
  const section = createSectionCard(false);
  mount.appendChild(section);

  const { item } = createHeadingItem(headingText);
  section.appendChild(item);
}

function renderEditorIntro(headingText) {
  mount.replaceChildren();
  const section = createSectionCard();
  mount.appendChild(section);

  const headingItem = document.createElement("item-card");
  headingItem.setAttribute("title", "Heading");

  const form = document.createElement("form");
  form.id = "intro-heading-form";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "heading";
  input.placeholder = "Enter intro heading";
  input.autocomplete = "off";
  input.value = headingText || "";
  input.setAttribute("aria-label", "Intro heading");

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.textContent = "Save";

  const status = document.createElement("p");
  status.id = "intro-save-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  form.append(input, saveButton, status);
  headingItem.appendChild(form);
  section.appendChild(headingItem);

  const previewItem = document.createElement("item-card");
  const previewHeading = createHeadingItem(input.value);
  previewItem.appendChild(previewHeading.item);
  section.appendChild(previewItem);

  input.addEventListener("input", () => {
    previewHeading.heading.textContent = input.value;
    status.textContent = "";
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    saveButton.disabled = true;
    status.textContent = "Saving…";

    try {
      const heading = input.value.trim();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error("Please sign in again.");
      }

      const { error } = await supabase
        .from("intro_content")
        .update({
          heading,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq("id", 1)
        .select("id")
        .single();

      if (error) throw error;
      status.textContent = "Saved.";
    } catch (error) {
      console.error("Intro save failed.", error);
      status.textContent = "Could not save. Check your access and try again.";
    } finally {
      saveButton.disabled = false;
    }
  });
}

async function initialize() {
  try {
    const data = await loadIntro();
    if (mode === "editor") renderEditorIntro(data?.heading || "");
    else renderPublicIntro(data?.heading || "");
  } catch (error) {
    console.error("Intro could not be loaded.", error);
    if (mode === "editor") {
      renderEditorIntro("");
      const status = document.querySelector("#intro-save-status");
      if (status) status.textContent = "Could not load Intro content.";
    }
  }
}

initialize();

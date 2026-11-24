/*
 * ACCOUNT FORM — Component usage
 *
 * Purpose:
 *   Owns the Account details and Logout controls.
 *
 * Used by:
 *   account/index.html only places <account-form> in the page's middle.
 *   The page must not define or control this form's internal fields.
 *
 * Element responsibilities and style sources:
 *   - Heading "Account": .heading from heading.css; heading text is centered.
 *   - Name field: .medium-input from medium-input.css; displays the user's name read-only.
 *   - Email field: .medium-input from medium-input.css; displays the user's email read-only.
 *   - Logout action: .medium-button from medium-button.css; signs the user out.
 *
 * Layout:
 *   This component owns the internal vertical arrangement and uses global
 *   spacing rules. Page positioning remains the responsibility of the page.
 *
 * Theme:
 *   Visual values come from the active theme and the named CSS sources.
 *   Do not hard-code colors, fonts, sizes, or duplicate global styles here.
 *
 * Behavior:
 *   Reads the authenticated user from Supabase and signs out on Logout.
 */

import { supabase } from "./supabase-client.js";

class AccountForm extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.innerHTML = `
      <section class="account-form" aria-label="Account details">
        <h1 class="heading">Account</h1>
        <input
          class="medium-input"
          type="text"
          placeholder="Name"
          autocomplete="name"
          readonly
        >
        <input
          class="medium-input"
          type="email"
          placeholder="Email"
          autocomplete="email"
          readonly
        >
        <button class="medium-button" type="button">Logout</button>
      </section>
    `;

    const [nameInput, emailInput] = this.querySelectorAll("input");
    const logoutButton = this.querySelector("button");

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) return;
      nameInput.value =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        "";
      emailInput.value = user.email || "";
    }).catch(error => {
      console.error("Account details could not be loaded.", error);
    });

    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed.", error);
        logoutButton.disabled = false;
        return;
      }

      window.location.replace(new URL("../login/", window.location.href).href);
    });
  }
}

if (!customElements.get("account-form")) {
  customElements.define("account-form", AccountForm);
}

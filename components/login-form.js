/*
 * LOGIN FORM — Component usage
 *
 * Purpose:
 *   Owns the complete Login form structure and its internal controls.
 *
 * Used by:
 *   login/index.html only places <login-form> in the page's middle.
 *   The page must not define or control this form's internal fields.
 *
 * Element responsibilities and style sources:
 *   - Heading "Login": .heading from heading.css; heading text is centered.
 *   - Email field: .medium-input from medium-input.css; collects a required email.
 *   - Password field: .medium-input from medium-input.css; collects a required password.
 *   - Submit action: .medium-button from medium-button.css; submits credentials.
 *   - Error message: this component's status text; shown only after an auth error.
 *
 * Layout:
 *   The form owns its internal vertical stack and spacing through the existing
 *   global spacing rules. It does not define page positioning or theme styles.
 *
 * Theme:
 *   All visual values come from the active theme and the named CSS sources.
 *   Do not hard-code colors, fonts, sizes, or duplicate global styles here.
 *
 * Behavior:
 *   Uses supabase.auth.signInWithPassword. On success, returns to the requested
 *   same-origin "next" URL when valid; otherwise redirects to Account.
 */

import { supabase } from "./supabase-client.js";

class LoginForm extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.innerHTML = `
      <form class="login-form">
        <h1 class="heading">Login</h1>
        <input
          class="medium-input text-center"
          type="email"
          name="email"
          placeholder="Email"
          autocomplete="email"
          required
        >
        <input
          class="medium-input text-center"
          type="password"
          name="password"
          placeholder="Password"
          autocomplete="current-password"
          required
        >
        <button class="medium-button" type="submit">Login</button>
        <p class="login-message" role="alert" aria-live="polite"></p>
      </form>
    `;

    const form = this.querySelector("form");
    const submitButton = form.querySelector('button[type="submit"]');
    const message = this.querySelector(".login-message");

    form.addEventListener("submit", async event => {
      event.preventDefault();
      message.textContent = "";
      submitButton.disabled = true;

      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const requestedNext = new URLSearchParams(window.location.search).get("next");
        let destination = new URL("../account/", window.location.href);

        if (requestedNext) {
          const candidate = new URL(requestedNext, window.location.href);
          if (
            candidate.origin === window.location.origin &&
            candidate.pathname !== window.location.pathname
          ) {
            destination = candidate;
          }
        }

        window.location.replace(destination.href);
      } catch (error) {
        message.textContent = error?.message || "Login failed. Please try again.";
        submitButton.disabled = false;
      }
    });
  }
}

if (!customElements.get("login-form")) {
  customElements.define("login-form", LoginForm);
}

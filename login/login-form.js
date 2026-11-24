import { supabase } from "../system/supabase-client.js";
import "../cards/large-card.js";

/* Login behavior and fields stay local; shared surface is Large Card + Standard CSS. */
class LoginForm extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.innerHTML = `
      <large-card class="login-card">
        <form class="login-form">
          <h1 class="heading">Login</h1>
          <input class="medium-input text-center" type="email" name="email" placeholder="Email" autocomplete="email" required>
          <input class="medium-input text-center" type="password" name="password" placeholder="Password" autocomplete="current-password" required>
          <button class="medium-button" type="submit">Login</button>
          <p class="login-message" role="alert" aria-live="polite"></p>
        </form>
      </large-card>
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
          if (candidate.origin === window.location.origin && candidate.pathname !== window.location.pathname) destination = candidate;
        }
        window.location.replace(destination.href);
      } catch (error) {
        message.textContent = error?.message || "Login failed. Please try again.";
        submitButton.disabled = false;
      }
    });
  }
}
if (!customElements.get("login-form")) customElements.define("login-form", LoginForm);

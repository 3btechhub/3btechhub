import { supabase } from "../system/supabase-client.js";
import "./large-card.js";

/* Account content and logout behavior stay local; shared surface is Large Card + Standard CSS. */
class AccountForm extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.innerHTML = `
      <large-card class="account-card">
        <section class="account-form" aria-label="Account details">
          <h1 class="heading">Account</h1>
          <input class="medium-input" type="text" placeholder="Name" autocomplete="name" readonly>
          <input class="medium-input" type="email" placeholder="Email" autocomplete="email" readonly>
          <button class="medium-button" type="button">Logout</button>
        </section>
      </large-card>
    `;
    const [nameInput, emailInput] = this.querySelectorAll("input");
    const logoutButton = this.querySelector("button");
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) return;
      nameInput.value = user.user_metadata?.name || user.user_metadata?.full_name || "";
      emailInput.value = user.email || "";
    }).catch(error => console.error("Account details could not be loaded.", error));
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
if (!customElements.get("account-form")) customElements.define("account-form", AccountForm);

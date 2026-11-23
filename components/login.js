import { supabase } from "./supabase-client.js";

const form = document.getElementById("login-form");
const rootUrl = new URL("../", import.meta.url);
const params = new URLSearchParams(location.search);

function getReturnUrl() {
  const requested = params.get("next");
  if (!requested) return new URL("account/", rootUrl);

  try {
    const target = new URL(requested, location.origin);
    if (
      target.origin === location.origin &&
      target.pathname.startsWith(rootUrl.pathname)
    ) {
      return target;
    }
  } catch {
    // Fall back to the Account page.
  }

  return new URL("account/", rootUrl);
}

const returnUrl = getReturnUrl();

const { data: { user } } = await supabase.auth.getUser();
if (user) {
  location.replace(returnUrl.href);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;

  if (submitButton) submitButton.disabled = true;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Login failed. Check your email and password.");
    if (submitButton) submitButton.disabled = false;
    return;
  }

  location.replace(returnUrl.href);
});

import { supabase } from "./supabase-client.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const submitButton = document.getElementById("login-button");
const status = document.getElementById("login-status");

const params = new URLSearchParams(window.location.search);
const dashboardRequested = params.get("next") === "dashboard";
const dashboardUrl = new URL("../../dashboard/overview/", window.location.href);
const profileUrl = new URL("../profile/", window.location.href);

async function hasOwnerAccess(user) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "Owner")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function routeSignedInUser(user) {
  if (dashboardRequested) {
    try {
      if (await hasOwnerAccess(user)) {
        window.location.replace(dashboardUrl.href);
        return;
      }
      profileUrl.searchParams.set("access", "denied");
      window.location.replace(profileUrl.href);
      return;
    } catch {
      status.textContent = "অ্যাকাউন্টের অনুমতি যাচাই করা যাচ্ছে না।";
      return;
    }
  }

  window.location.replace(profileUrl.href);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  status.textContent = "Signing in...";

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    if (error) throw error;

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) throw userError || new Error("Unable to verify account.");

    await routeSignedInUser(data.user);
  } catch {
    status.textContent = "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।";
    submitButton.disabled = false;
  }
});

async function redirectIfAlreadySignedIn() {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) await routeSignedInUser(data.user);
}

redirectIfAlreadySignedIn();

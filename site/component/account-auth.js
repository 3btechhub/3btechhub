import { supabase } from "./supabase-client.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const submitButton = document.getElementById("login-button");
const status = document.getElementById("login-status");

const dashboardUrl = new URL("../dashboard/", window.location.href);

async function hasOwnerAccess(user) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "Owner";
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

    if (!(await hasOwnerAccess(data.user))) {
      status.textContent = "এই অ্যাকাউন্টের Dashboard ব্যবহারের অনুমতি নেই।";
      return;
    }

    window.location.replace(dashboardUrl.href);
  } catch {
    status.textContent = "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।";
  } finally {
    submitButton.disabled = false;
  }
});

async function redirectIfOwnerAlreadySignedIn() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return;

  try {
    if (await hasOwnerAccess(userData.user)) {
      window.location.replace(dashboardUrl.href);
    }
  } catch {
    status.textContent = "অ্যাকাউন্ট যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।";
  }
}

redirectIfOwnerAlreadySignedIn();

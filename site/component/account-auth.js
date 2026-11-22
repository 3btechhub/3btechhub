import { supabase } from "./supabase-client.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const submitButton = document.getElementById("login-button");
const status = document.getElementById("login-status");
const skeleton = document.querySelector(".skeleton-screen");

function setLoading(isLoading) {
  if (skeleton) skeleton.hidden = !isLoading;
  if (status && isLoading) status.textContent = "";
  if (submitButton) submitButton.disabled = isLoading;
}

const params = new URLSearchParams(window.location.search);
const dashboardRequested = params.get("next") === "dashboard";
const dashboardUrl = new URL("../../dashboard/overview/", window.location.href);
const profileUrl = new URL("../profile/", window.location.href);

if (params.get("error") === "verification" && status) {
  status.textContent = "We couldn't verify your account. Please try again.";
}

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
      status.textContent = "Unable to verify Dashboard access. Please try again.";
      setLoading(false);
      document.documentElement.dataset.pageAuthReady = "true";
      document.dispatchEvent(new Event("page-auth-ready"));
      return;
    }
  }

  window.location.replace(profileUrl.href);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  setLoading(true);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value
  });

  if (signInError) {
    const isConnectionError =
      signInError.name === "AuthRetryableFetchError" ||
      !signInError.status ||
      signInError.status >= 500;

    status.textContent = isConnectionError
      ? "Unable to connect. Check your internet connection and try again."
      : "Email or password is incorrect. Please try again.";
    setLoading(false);
    return;
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    status.textContent = "Sign-in succeeded, but your account could not be verified. Please try again.";
    setLoading(false);
    return;
  }

  await routeSignedInUser(data.user);
});

async function redirectIfAlreadySignedIn() {
  const { data, error } = await supabase.auth.getUser();

  if (!error && data.user) {
    await routeSignedInUser(data.user);
    return;
  }

  // A missing session is normal on the Login page; do not show an error.
  document.documentElement.dataset.pageAuthReady = "true";
  document.dispatchEvent(new Event("page-auth-ready"));
}

redirectIfAlreadySignedIn();

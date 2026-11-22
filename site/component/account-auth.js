import { supabase } from "./supabase-client.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const submitButton = document.getElementById("login-button");
const status = document.getElementById("login-status");
const skeleton = document.querySelector(".skeleton-screen");

// The Login page starts with no error state. Messages appear only after
// the visitor submits the form and that specific operation fails.
if (status) {
  status.textContent = "";
  status.hidden = true;
}

function setLoading(isLoading) {
  if (skeleton) skeleton.hidden = !isLoading;
  if (status && isLoading) {
    status.textContent = "";
    status.hidden = true;
  }
  if (submitButton) submitButton.disabled = isLoading;
}

function signalAuthReady() {
  document.documentElement.dataset.pageAuthReady = "true";
  document.dispatchEvent(new Event("page-auth-ready"));
}

const params = new URLSearchParams(window.location.search);
const dashboardRequested = params.get("next") === "dashboard";
const dashboardUrl = new URL("../../dashboard/overview/", window.location.href);
const profileUrl = new URL("../profile/", window.location.href);

// Verification errors are not carried in the URL. They became stale and
// caused the same message to reappear on every visit to the Login page.
params.delete("error");
if (window.location.search.includes("error=")) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("error");
  window.history.replaceState({}, "", cleanUrl.href);
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
    } catch (error) {
      console.error("Dashboard role verification failed:", error);
      status.textContent = "Unable to verify Dashboard access. Please try again.";
      status.hidden = false;
      setLoading(false);
      signalAuthReady();
      return;
    }
  }

  window.location.replace(profileUrl.href);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    if (error) {
      const isConnectionError =
        error.name === "AuthRetryableFetchError" ||
        !error.status ||
        error.status >= 500;

      status.textContent = isConnectionError
        ? "Unable to connect. Check your internet connection and try again."
        : "Email or password is incorrect. Please try again.";
      status.hidden = false;
      setLoading(false);
      return;
    }

    // signInWithPassword already returns the authenticated user and session.
    // Avoid an unnecessary second /user request after a successful login.
    if (!data?.user || !data?.session) {
      status.textContent = "Sign-in could not be completed. Please try again.";
      status.hidden = false;
      setLoading(false);
      return;
    }

    await routeSignedInUser(data.user);
  } catch (error) {
    console.error("Login failed:", error);
    status.textContent = "Unable to complete login. Please try again.";
    status.hidden = false;
    setLoading(false);
  }
});

async function redirectIfAlreadySignedIn() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      signalAuthReady();
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      // Clear only this browser's invalid/stale session; do not show a
      // permanent verification warning to a visitor who simply needs Login.
      await supabase.auth.signOut({ scope: "local" });
      signalAuthReady();
      return;
    }

    await routeSignedInUser(data.user);
  } catch (error) {
    console.error("Initial session check failed:", error);
    signalAuthReady();
  }
}

redirectIfAlreadySignedIn();

import { supabase } from "./supabase-client.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const status = document.getElementById("login-status");

if (status) {
  status.textContent = "";
  status.hidden = true;
}

const params = new URLSearchParams(window.location.search);
const dashboardRequested = params.get("next") === "dashboard";
const dashboardUrl = new URL("../dashboard/", window.location.href);
const profileUrl = new URL("../profile/", window.location.href);

params.delete("error");
if (window.location.search.includes("error=")) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("error");
  window.history.replaceState({}, "", cleanUrl.href);
}

async function hasDashboardAccess(user) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["Owner", "Admin"])
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function routeSignedInUser(user) {
  if (dashboardRequested) {
    try {
      if (await hasDashboardAccess(user)) {
        window.location.replace(dashboardUrl.href);
        return;
      }
      profileUrl.searchParams.set("access", "denied");
      window.location.replace(profileUrl.href);
      return;
    } catch (error) {
      console.error("Dashboard role verification failed:", error);
      if (status) {
        status.textContent = "Unable to verify Dashboard access. Please try again.";
        status.hidden = false;
      }
      return;
    }
  }
  window.location.replace(profileUrl.href);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

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

      if (status) {
        status.textContent = isConnectionError
          ? "Unable to connect. Check your internet connection and try again."
          : "Email or password is incorrect. Please try again.";
        status.hidden = false;
      }
      return;
    }

    if (!data?.user || !data?.session) {
      if (status) {
        status.textContent = "Sign-in could not be completed. Please try again.";
        status.hidden = false;
      }
      return;
    }

    await routeSignedInUser(data.user);
  } catch (error) {
    console.error("Login failed:", error);
    if (status) {
      status.textContent = "Unable to complete login. Please try again.";
      status.hidden = false;
    }
  }
});

async function redirectIfAlreadySignedIn() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) return;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      await supabase.auth.signOut({ scope: "local" });
      return;
    }
    await routeSignedInUser(data.user);
  } catch (error) {
    console.error("Initial session check failed:", error);
  }
}

const initialAuthCheck = redirectIfAlreadySignedIn();
initialAuthCheck.finally(() => {
  document.documentElement.dataset.pageAuthReady = 'true';
  document.dispatchEvent(new Event('page-auth-ready'));
});

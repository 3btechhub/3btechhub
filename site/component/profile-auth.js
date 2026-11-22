import { supabase } from "./supabase-client.js";

const loginUrl = new URL("../login/", window.location.href);
const emailElement = document.getElementById("profile-email");
const roleElement = document.getElementById("profile-role");
const status = document.getElementById("profile-status");

async function verifyProfileAccess() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      window.location.replace(loginUrl.href);
      return;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      await supabase.auth.signOut({ scope: "local" });
      window.location.replace(loginUrl.href);
      return;
    }

    if (emailElement) emailElement.textContent = data.user.email || "";
    if (roleElement) roleElement.textContent = data.user.app_metadata?.role || "No role assigned";

    const page = document.getElementById("page-content");
    if (page) page.hidden = false;
    document.documentElement.dataset.privateAccessGranted = 'true';
    document.dispatchEvent(new Event('private-access-granted'));

    if (new URLSearchParams(window.location.search).get("access") === "denied" && status) {
      status.textContent = "This account does not have permission to access the Dashboard.";
    }
  } catch (error) {
    console.error("Profile session verification failed:", error);
    await supabase.auth.signOut({ scope: "local" });
    window.location.replace(loginUrl.href);
  }
}

supabase.auth.onAuthStateChange(event => {
  if (event === "SIGNED_OUT") {
    window.location.replace(loginUrl.href);
  }
});

const accessTimeout = window.setTimeout(() => {
  console.error("Profile access verification timed out.");
  window.location.replace(loginUrl.href);
}, 12000);

verifyProfileAccess().finally(() => window.clearTimeout(accessTimeout));

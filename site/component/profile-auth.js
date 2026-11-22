import { supabase } from "./supabase-client.js";

const loginUrl = new URL("../login/", window.location.href);
const emailElement = document.getElementById("profile-email");
const status = document.getElementById("profile-status");

async function verifyProfileAccess() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    loginUrl.searchParams.set("error", "verification");
    window.location.replace(loginUrl.href);
    return;
  }

  if (!data.user) {
    window.location.replace(loginUrl.href);
    return;
  }

  if (emailElement) emailElement.textContent = data.user.email || "";
  document.documentElement.dataset.privateAccess = "granted";
  document.dispatchEvent(new Event("private-access-granted"));

  if (new URLSearchParams(window.location.search).get("access") === "denied" && status) {
    status.textContent = "This account does not have permission to access the Dashboard.";
  }
}

supabase.auth.onAuthStateChange(event => {
  if (event === "SIGNED_OUT") {
    window.location.replace(loginUrl.href);
  }
});

verifyProfileAccess();

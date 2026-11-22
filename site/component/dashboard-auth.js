import { supabase } from "./supabase-client.js";

const accountUrl = new URL("../account/", window.location.href);
accountUrl.searchParams.set("access", "denied");

function denyAccess() {
  window.location.replace(accountUrl.href);
}

async function verifyDashboardAccess() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      denyAccess();
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      denyAccess();
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== "Owner") {
      denyAccess();
      return;
    }

    document.documentElement.dataset.privateAccess = "granted";
    document.dispatchEvent(new Event("private-access-granted"));
  } catch {
    denyAccess();
  }
}

supabase.auth.onAuthStateChange(event => {
  if (event === "SIGNED_OUT") denyAccess();
});

verifyDashboardAccess();

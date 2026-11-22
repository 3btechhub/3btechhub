import { supabase } from "./supabase-client.js";

const loginUrl = new URL("./login/", window.location.href);
const profileUrl = new URL("./profile/", window.location.href);

async function routeAccountRoot() {
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

    window.location.replace(profileUrl.href);
  } catch (error) {
    console.error("Account route session check failed:", error);
    await supabase.auth.signOut({ scope: "local" });
    window.location.replace(loginUrl.href);
  }
}

routeAccountRoot();

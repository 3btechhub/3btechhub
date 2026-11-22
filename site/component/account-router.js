import { supabase } from "./supabase-client.js";

const loginUrl = new URL("./login/", window.location.href);
const profileUrl = new URL("./profile/", window.location.href);

async function routeAccountRoot() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    loginUrl.searchParams.set("error", "verification");
    window.location.replace(loginUrl.href);
    return;
  }

  window.location.replace(data.user ? profileUrl.href : loginUrl.href);
}

routeAccountRoot();

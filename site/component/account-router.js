import { supabase } from "./supabase-client.js";

const loginUrl = new URL("./login/", window.location.href);
const profileUrl = new URL("./profile/", window.location.href);

async function navigateAfterSkeletonPaint(url) {
  if (document.documentElement.classList.contains("page-ready")) {
    window.location.replace(url.href);
    return;
  }

  await new Promise(resolve => {
    document.addEventListener("page-ready", resolve, { once: true });
  });

  window.location.replace(url.href);
}

async function routeAccountRoot() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      await navigateAfterSkeletonPaint(loginUrl);
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      await supabase.auth.signOut({ scope: "local" });
      await navigateAfterSkeletonPaint(loginUrl);
      return;
    }

    await navigateAfterSkeletonPaint(profileUrl);
  } catch (error) {
    console.error("Account route session check failed:", error);
    await supabase.auth.signOut({ scope: "local" });
    await navigateAfterSkeletonPaint(loginUrl);
  }
}

routeAccountRoot();

import { useEffect, useState } from "react";
import { detectRegion } from "../components/location-detection/index.js";
import { supabase } from "../database/client.js";

export function useRegion() {
  const [region, setRegion] = useState({ region: "Global", slug: "global", source: "loading" });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function resolve() {
      const detected = await detectRegion();
      let result = detected;
      if (supabase) {
        const { data: auth } = await supabase.auth.getUser();
        if (auth?.user) {
          const { data } = await supabase.from("profiles")
            .select("region:regions(name,slug)")
            .eq("id", auth.user.id).maybeSingle();
          if (data?.region?.slug) {
            result = { region: data.region.name, slug: data.region.slug, source: "profile" };
          }
        }
      }
      if (active) { setRegion(result); setLoading(false); }
    }
    resolve().catch(() => {
      if (active) { setRegion({ region: "Global", slug: "global", source: "fallback" }); setLoading(false); }
    });
    return () => { active = false; };
  }, []);
  return { ...region, loading };
}

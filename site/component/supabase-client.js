import { createClient } from "https://esm.sh/@supabase/supabase-js@2.109.0";

const supabaseUrl = "https://sburxeuxkrilbfppxylm.supabase.co";
const supabasePublishableKey = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

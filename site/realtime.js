export function connectGlobalRealtime(supabase) {
  let debounce = null;
  const channel = supabase
    .channel("3b-global-site-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "site_realtime_signal"
      },
      () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          window.dispatchEvent(new CustomEvent("3b:global-update"));
        }, 180);
      }
    )
    .subscribe();

  return () => {
    clearTimeout(debounce);
    supabase.removeChannel(channel);
  };
}

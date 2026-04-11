import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function usePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const upsertPresence = async (online: boolean) => {
      await supabase.from("user_presence").upsert(
        { user_id: user.id, is_online: online, last_seen: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    };

    upsertPresence(true);

    const interval = setInterval(() => upsertPresence(true), 30000);

    const handleVisibility = () => {
      upsertPresence(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleBeforeUnload = () => upsertPresence(false);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      upsertPresence(false);
    };
  }, [user]);
}

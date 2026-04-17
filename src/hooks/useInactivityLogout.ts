import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logSecurityEvent } from "@/lib/auditLog";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useInactivityLogout(isLoggedIn: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const handleLogout = useCallback(async () => {
    logSecurityEvent("logout_inactivity", {});
    setShowExpiredModal(true);
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isLoggedIn) {
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    }
  }, [isLoggedIn, handleLogout]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isLoggedIn, resetTimer]);

  return { showExpiredModal, setShowExpiredModal };
}

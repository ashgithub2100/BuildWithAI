"use client";

import { useEffect, useRef } from "react";
import { useAnchorStore } from "@/store/useAnchorStore";

export function usePassiveResistance() {
  const { fsmState, recordTabSwitch, setResistanceAutoPrompted } = useAnchorStore();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fsmState !== "ANCHOR_LOCKED") return;

    // 1. Visibility change listener (detect tab switching to YouTube, Twitter, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordTabSwitch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. 45-second idle stall timer (detects staring blankly / cognitive freeze)
    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setResistanceAutoPrompted(true);
      }, 45000); // 45 seconds
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetIdleTimer);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [fsmState, recordTabSwitch, setResistanceAutoPrompted]);
}

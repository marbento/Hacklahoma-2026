// frontend/hooks/useBankedSteps.ts
// GLOBAL hook for banked steps - shared across all components
import { useCallback, useEffect, useState } from "react";
import { getBankedSteps } from "../api/insights";

// Global state for banked steps (shared across all components)
let globalBankedSteps = 0;
let globalListeners: Array<(steps: number) => void> = [];

// Subscribe to banked steps changes
function subscribe(listener: (steps: number) => void) {
  globalListeners.push(listener);
  return () => {
    globalListeners = globalListeners.filter((l) => l !== listener);
  };
}

// Notify all listeners of banked steps change
function notifyAll(steps: number) {
  globalBankedSteps = steps;
  globalListeners.forEach((listener) => listener(steps));
}

// Global refresh function - can be called from ANYWHERE
export async function refreshBankedSteps() {
  try {
    console.log("🔄 Fetching banked steps from API...");
    const data = await getBankedSteps();
    console.log("✅ Banked steps received:", data.banked_steps);
    notifyAll(data.banked_steps);
    return data.banked_steps;
  } catch (e) {
    console.error("❌ Failed to refresh banked steps:", e);
    // Keep the previous value instead of returning 0
    console.log("⚠️ Keeping previous value:", globalBankedSteps);
    return globalBankedSteps;
  }
}

// Hook for using banked steps in components
export function useBankedSteps() {
  const [bankedSteps, setBankedSteps] = useState(globalBankedSteps);
  const [loading, setLoading] = useState(true);

  // Fetch initial banked steps
  const fetch = useCallback(async () => {
    console.log("🎣 useBankedSteps - Starting fetch...");
    setLoading(true);
    try {
      const steps = await refreshBankedSteps();
      console.log("✅ useBankedSteps - Got steps:", steps);
      setBankedSteps(steps);
    } catch (error) {
      console.error("❌ useBankedSteps - Fetch error:", error);
      // On error, show 0 instead of keeping stale data for first load
      if (globalBankedSteps === 0) {
        setBankedSteps(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to global changes
  useEffect(() => {
    const unsubscribe = subscribe((steps) => {
      console.log("📡 useBankedSteps - Received update:", steps);
      setBankedSteps(steps);
      setLoading(false); // Stop loading when we get an update
    });
    return unsubscribe;
  }, []);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    bankedSteps,
    loading,
    refresh: refreshBankedSteps, // Can be called to manually refresh
  };
}

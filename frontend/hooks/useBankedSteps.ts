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
    const data = await getBankedSteps();
    notifyAll(data.banked_steps);
    return data.banked_steps;
  } catch (e) {
    console.error("Failed to refresh banked steps:", e);
    return globalBankedSteps;
  }
}

// Hook for using banked steps in components
export function useBankedSteps() {
  const [bankedSteps, setBankedSteps] = useState(globalBankedSteps);
  const [loading, setLoading] = useState(true);

  // Fetch initial banked steps
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const steps = await refreshBankedSteps();
      setBankedSteps(steps);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to global changes
  useEffect(() => {
    const unsubscribe = subscribe((steps) => {
      setBankedSteps(steps);
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

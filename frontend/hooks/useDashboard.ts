// frontend/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { getDashboard, getNudgeData, getEncouragement, Dashboard, NudgeData } from "../api";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  return { dashboard, loading, refresh: fetch };
}

export function useNudge() {
  const [nudge, setNudge] = useState<NudgeData | null>(null);
  const fetch = useCallback(async () => {
    try { setNudge(await getNudgeData()); } catch {}
  }, []);
  useEffect(() => { fetch(); }, []);
  return { nudge, refresh: fetch };
}

export function useEncouragement() {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEncouragement();
      setText(res.encouragement);
    } catch {} finally { setLoading(false); }
  }, []);
  return { text, loading, fetch };
}

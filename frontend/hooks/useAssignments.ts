// frontend/hooks/useAssignments.ts
import { useState, useEffect, useCallback } from "react";
import { getAssignments, syncCanvas, generateStudyPlan, Assignment, StudyPlan } from "../api";

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [generatingPlanFor, setGeneratingPlanFor] = useState<string | null>(null);

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch {
      if (!silent) setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  const sync = useCallback(async (): Promise<number> => {
    setSyncing(true);
    try {
      const res = await syncCanvas();
      await fetch(true);
      return res.synced;
    } finally {
      setSyncing(false);
    }
  }, [fetch]);

  const makePlan = useCallback(async (id: string): Promise<StudyPlan> => {
    setGeneratingPlanFor(id);
    try {
      const plan = await generateStudyPlan(id);
      await fetch(true);
      return plan;
    } finally {
      setGeneratingPlanFor(null);
    }
  }, [fetch]);

  const refresh = useCallback(() => fetch(), [fetch]);

  return { assignments, loading, syncing, generatingPlanFor, sync, makePlan, refresh };
}

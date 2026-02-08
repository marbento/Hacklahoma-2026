// frontend/hooks/useServices.ts
import { useState, useEffect, useCallback } from "react";
import { getServicesStatus, validateCanvasToken, disconnectCanvas, ServiceStatus, CanvasValidation } from "../api";

export function useServices() {
  const [services, setServices] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await getServicesStatus();
      setServices(data);
    } catch {
      setServices(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  const connectCanvas = useCallback(async (token: string): Promise<CanvasValidation> => {
    const result = await validateCanvasToken(token);
    await fetch();
    return result;
  }, [fetch]);

  const removeCanvas = useCallback(async () => {
    await disconnectCanvas();
    await fetch();
  }, [fetch]);

  return { services, loading, connectCanvas, removeCanvas, refresh: fetch };
}

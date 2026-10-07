// Generic short-interval polling hook, per PRD 4.7: "No WebSockets for
// this build ... frontend re-fetches status on a short interval (e.g.
// every 5-10 seconds) while the relevant screen is open."

import { useCallback, useEffect, useState } from "react";

interface PollingResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 7000
): PollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchFn()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [fetchFn]);

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { data, error, loading, refetch: load };
}

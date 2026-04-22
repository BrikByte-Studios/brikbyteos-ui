import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import { loadMetricsFromJson } from "./loaders/metricsLoader";
import type { MetricsLoadResult } from "./types/metrics";

export default function App() {
  const [result, setResult] = useState<MetricsLoadResult | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const response = await fetch("/weekly.json");
        if (!response.ok) {
          if (!isMounted) return;
          setResult({
            status: "missing",
            records: [],
            latest: null,
            reason: "metrics source is unavailable",
          });
          return;
        }

        const text = await response.text();
        if (!isMounted) return;
        setResult(loadMetricsFromJson(text));
      } catch {
        if (!isMounted) return;
        setResult({
          status: "missing",
          records: [],
          latest: null,
          reason: "metrics source is unavailable",
        });
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return <Dashboard isLoading={!result} result={result} />;
}
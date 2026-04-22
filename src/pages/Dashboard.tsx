import React, { type JSX } from "react";
import type { MetricsLoadResult } from "../types/metrics";
import { MetricsTable } from "../components/metrics/MetricsTable";
import { RunsTrendChart } from "../components/metrics/RunsTrendChart";
import { RejectionsChart } from "../components/metrics/RejectionsChart";
import { EmptyState } from "../components/states/EmptyState";
import { MissingState } from "../components/states/MissingState";
import { InvalidState } from "../components/states/InvalidState";
import { LoadingState } from "../components/states/LoadingState";

export interface DashboardProps {
  readonly isLoading?: boolean;
  readonly result?: MetricsLoadResult;
}

export default function Dashboard(props: DashboardProps): JSX.Element {
  const { isLoading = false, result } = props;

  if (isLoading) {
    return <LoadingState />;
  }

  if (!result) {
    return <MissingState reason="metrics source is unavailable" />;
  }

  switch (result.status) {
    case "missing":
      return <MissingState reason={result.reason} />;

    case "invalid":
      return <InvalidState reason={result.reason} />;

    case "empty":
      return <EmptyState />;

    case "success": {
      const latest = result.latest;

      return (
        <div className="dashboard-shell">
          <main className="dashboard-container">
            <header className="dashboard-header">
              <span className="dashboard-eyebrow">BrikByteOS</span>
              <h1 className="dashboard-title">Read-Only Metrics Dashboard</h1>
              <p className="dashboard-subtitle">
                Deterministic weekly metrics sourced from the approved persisted read model.
              </p>
            </header>

            <section className="summary-strip" aria-label="Latest week summary">
              <article className="summary-card">
                <p className="summary-label">Latest Week</p>
                <p className="summary-value summary-value--accent">{latest.week_start}</p>
              </article>
              <article className="summary-card">
                <p className="summary-label">Runs</p>
                <p className="summary-value">{latest.runs}</p>
              </article>
              <article className="summary-card">
                <p className="summary-label">Gate Usage</p>
                <p className="summary-value">{latest.gate_usage}</p>
              </article>
              <article className="summary-card">
                <p className="summary-label">Rejections</p>
                <p className="summary-value summary-value--danger">{latest.rejections}</p>
              </article>
            </section>

            <div className="dashboard-grid">
              <MetricsTable records={result.records} />

              <div className="dashboard-grid dashboard-grid--charts">
                <RunsTrendChart records={result.records} />
                <RejectionsChart records={result.records} />
              </div>
            </div>
          </main>
        </div>
      );
    }

    default: {
      const exhaustiveCheck: never = result;
      return exhaustiveCheck;
    }
  }
}
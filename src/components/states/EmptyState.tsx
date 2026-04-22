import React, { type JSX } from "react";

export function EmptyState(): JSX.Element {
  return (
    <div className="dashboard-shell">
      <section className="dashboard-container panel state-card state-card--empty">
        <div className="panel-inner">
          <h2 className="state-title">No metrics available</h2>
          <p className="state-copy">
            The metrics source is valid, but it contains no weekly records yet.
          </p>
        </div>
      </section>
    </div>
  );
}
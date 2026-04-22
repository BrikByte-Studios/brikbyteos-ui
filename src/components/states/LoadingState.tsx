import React, { type JSX } from "react";

export function LoadingState(): JSX.Element {
  return (
    <div className="dashboard-shell">
      <section className="dashboard-container panel state-card">
        <div className="panel-inner">
          <h2 className="state-title">Loading metrics…</h2>
          <p className="state-copy">Reading the persisted weekly metrics view.</p>
        </div>
      </section>
    </div>
  );
}
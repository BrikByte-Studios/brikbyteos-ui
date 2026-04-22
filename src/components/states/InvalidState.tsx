import React, { type JSX } from "react";

export interface InvalidStateProps {
  readonly reason: string;
}

export function InvalidState(props: InvalidStateProps): JSX.Element {
  return (
    <div className="dashboard-shell">
      <section className="dashboard-container panel state-card state-card--invalid" role="alert">
        <div className="panel-inner">
          <h2 className="state-title">Metrics data is invalid</h2>
          <p className="state-copy">{props.reason}</p>
        </div>
      </section>
    </div>
  );
}
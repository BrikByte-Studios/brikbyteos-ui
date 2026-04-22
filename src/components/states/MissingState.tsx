import React, { type JSX } from "react";

export interface MissingStateProps {
  readonly reason: string;
}

export function MissingState(props: MissingStateProps): JSX.Element {
  return (
    <div className="dashboard-shell">
      <section className="dashboard-container panel state-card state-card--missing" role="alert">
        <div className="panel-inner">
          <h2 className="state-title">Metrics source unavailable</h2>
          <p className="state-copy">{props.reason}</p>
        </div>
      </section>
    </div>
  );
}
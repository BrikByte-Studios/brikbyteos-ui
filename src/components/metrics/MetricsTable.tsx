import React, { type JSX } from "react";
import type { WeeklyMetricsRecord } from "../../types/metrics";

export interface MetricsTableProps {
  readonly records: ReadonlyArray<WeeklyMetricsRecord>;
}

export function MetricsTable(props: MetricsTableProps): JSX.Element {
  const { records } = props;

  return (
    <section className="panel" aria-labelledby="metrics-table-heading">
      <div className="panel-inner">
        <h2 id="metrics-table-heading" className="panel-title">
          Weekly Metrics
        </h2>
        <p className="panel-subtitle">
          Stable weekly read-model ordered by ascending week start.
        </p>

        <div className="metrics-table-wrap">
          <table className="metrics-table">
            <thead>
              <tr>
                <th scope="col">Week Start</th>
                <th scope="col">Active Users</th>
                <th scope="col">CI Integrations</th>
                <th scope="col">Runs</th>
                <th scope="col">Gate Usage</th>
                <th scope="col">Rejections</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.week_start}>
                  <td>{record.week_start}</td>
                  <td className="metrics-number">{record.active_users}</td>
                  <td className="metrics-number">{record.ci_integrations}</td>
                  <td className="metrics-number">{record.runs}</td>
                  <td className="metrics-number">{record.gate_usage}</td>
                  <td className="metrics-number">{record.rejections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
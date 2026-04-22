import React, { type JSX } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyMetricsRecord } from "../../types/metrics";

export interface RunsTrendChartProps {
  readonly records: ReadonlyArray<WeeklyMetricsRecord>;
}

export function RunsTrendChart(props: RunsTrendChartProps): JSX.Element {
  const { records } = props;

  return (
    <section className="panel" aria-labelledby="runs-trend-heading">
      <div className="panel-inner">
        <h2 id="runs-trend-heading" className="panel-title">
          Runs per Week
        </h2>
        <p className="panel-subtitle">Trend line using week_start on the x-axis and runs on the y-axis.</p>

        <div className="chart-frame">
          <ResponsiveContainer>
            <LineChart data={records}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="week_start" stroke="#aebbdc" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke="#aebbdc" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="runs" stroke="#6ea8fe" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
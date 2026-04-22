import React, { type JSX } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyMetricsRecord } from "../../types/metrics";

export interface RejectionsChartProps {
  readonly records: ReadonlyArray<WeeklyMetricsRecord>;
}

export function RejectionsChart(props: RejectionsChartProps): JSX.Element {
  const { records } = props;

  return (
    <section className="panel" aria-labelledby="rejections-chart-heading">
      <div className="panel-inner">
        <h2 id="rejections-chart-heading" className="panel-title">
          Rejections per Week
        </h2>
        <p className="panel-subtitle">
          Bar chart using week_start on the x-axis and rejections on the y-axis.
        </p>

        <div className="chart-frame">
          <ResponsiveContainer>
            <BarChart data={records}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="week_start" stroke="#aebbdc" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke="#aebbdc" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="rejections" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
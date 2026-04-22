import { describe, expect, it } from "vitest";
import { loadMetricsFromJson, loadMetricsFromUnknown } from "./metricsLoader";

describe("metricsLoader", () => {
  it("returns success for valid metrics JSON and sorts by week_start ascending", () => {
    const input = JSON.stringify([
      {
        week_start: "2026-04-27",
        active_users: 0,
        ci_integrations: 0,
        runs: 5,
        gate_usage: 4,
        rejections: 0,
      },
      {
        week_start: "2026-04-20",
        active_users: 0,
        ci_integrations: 0,
        runs: 1,
        gate_usage: 1,
        rejections: 1,
      },
    ]);

    const result = loadMetricsFromJson(input);

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      throw new Error("expected success result");
    }

    expect(result.records.map((r) => r.week_start)).toEqual([
      "2026-04-20",
      "2026-04-27",
    ]);
    expect(result.latest.week_start).toBe("2026-04-27");
  });

  it("returns empty for a valid empty metrics array", () => {
    const result = loadMetricsFromJson("[]");

    expect(result).toEqual({
      status: "empty",
      records: [],
      latest: null,
    });
  });

  it("returns missing when source is unavailable", () => {
    const result = loadMetricsFromJson(undefined);

    expect(result.status).toBe("missing");
    if (result.status !== "missing") {
      throw new Error("expected missing result");
    }

    expect(result.records).toEqual([]);
    expect(result.latest).toBeNull();
  });

  it("returns invalid for malformed JSON", () => {
    const result = loadMetricsFromJson("{not-json");

    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") {
      throw new Error("expected invalid result");
    }

    expect(result.reason).toContain("invalid JSON");
  });

  it("returns invalid for non-array top-level payload", () => {
    const result = loadMetricsFromUnknown({
      week_start: "2026-04-20",
      active_users: 0,
      ci_integrations: 0,
      runs: 1,
      gate_usage: 1,
      rejections: 0,
    });

    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") {
      throw new Error("expected invalid result");
    }

    expect(result.reason).toContain("JSON array");
  });

  it("returns invalid for schema-invalid record shape", () => {
    const result = loadMetricsFromUnknown([
      {
        week_start: "2026-04-20",
        active_users: 0,
        ci_integrations: 0,
        runs: "1",
        gate_usage: 1,
        rejections: 0,
      },
    ]);

    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") {
      throw new Error("expected invalid result");
    }

    expect(result.reason).toContain("runs must be a non-negative integer");
  });

  it("returns invalid for unexpected fields", () => {
    const result = loadMetricsFromUnknown([
      {
        week_start: "2026-04-20",
        active_users: 0,
        ci_integrations: 0,
        runs: 1,
        gate_usage: 1,
        rejections: 0,
        extra: true,
      },
    ]);

    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") {
      throw new Error("expected invalid result");
    }

    expect(result.reason).toContain('unexpected field "extra"');
  });

  it("returns invalid for non-canonical week_start values", () => {
    const result = loadMetricsFromUnknown([
      {
        week_start: "2026-4-2",
        active_users: 0,
        ci_integrations: 0,
        runs: 1,
        gate_usage: 1,
        rejections: 0,
      },
    ]);

    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") {
      throw new Error("expected invalid result");
    }

    expect(result.reason).toContain("week_start");
  });

  it("produces identical ordered output for identical input", () => {
    const input = JSON.stringify([
      {
        week_start: "2026-04-27",
        active_users: 0,
        ci_integrations: 0,
        runs: 5,
        gate_usage: 4,
        rejections: 0,
      },
      {
        week_start: "2026-04-20",
        active_users: 0,
        ci_integrations: 0,
        runs: 1,
        gate_usage: 1,
        rejections: 1,
      },
    ]);

    const first = loadMetricsFromJson(input);
    const second = loadMetricsFromJson(input);

    expect(first).toEqual(second);
  });
});
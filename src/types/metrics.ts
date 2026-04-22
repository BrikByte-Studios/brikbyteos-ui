/**
 * WeeklyMetricsRecord is the persisted weekly metrics read-model produced by
 * the CLI metrics pipeline and consumed by the static dashboard.
 *
 * This type mirrors the approved JSON contract stored in:
 *   .bb/metrics/weekly.json
 *
 * The UI treats this model as read-only source data.
 */
export interface WeeklyMetricsRecord {
  /**
   * UTC Monday start date of the ISO week in canonical YYYY-MM-DD format.
   */
  week_start: string;

  /**
   * Count of active users for the week.
   *
   * Phase 0 note:
   * This may legitimately be 0 when the upstream telemetry contract does not
   * yet provide the identity signals needed to compute it.
   */
  active_users: number;

  /**
   * Count of CI integrations observed for the week.
   *
   * Phase 0 note:
   * This may legitimately be 0 when the upstream telemetry contract does not
   * yet provide CI provider data.
   */
  ci_integrations: number;

  /**
   * Count of run_executed events for the week.
   */
  runs: number;

  /**
   * Count of gate_evaluated events for the week.
   */
  gate_usage: number;

  /**
   * Count of rejected gate_evaluated events for the week.
   */
  rejections: number;
}

/**
 * MetricsLoaderStatus is the explicit state machine returned by the loader.
 *
 * The UI must distinguish these states rather than guessing:
 *   - success: valid, non-empty metrics data
 *   - empty: valid JSON array with zero records
 *   - missing: no source content was provided by the host layer
 *   - invalid: malformed JSON or schema-invalid content
 */
export type MetricsLoaderStatus =
  | "success"
  | "empty"
  | "missing"
  | "invalid";

/**
 * MetricsLoadSuccess is returned when valid, non-empty metrics data was loaded.
 */
export interface MetricsLoadSuccess {
  status: "success";

  /**
   * Records sorted deterministically ascending by week_start.
   *
   * The returned array is frozen to discourage accidental mutation inside UI
   * components.
   */
  records: ReadonlyArray<WeeklyMetricsRecord>;

  /**
   * Convenience reference to the latest week, always equal to the last element
   * of `records`.
   */
  latest: WeeklyMetricsRecord;
}

/**
 * MetricsLoadEmpty is returned when the source contains a valid empty JSON
 * metrics array (`[]`).
 */
export interface MetricsLoadEmpty {
  status: "empty";
  records: ReadonlyArray<WeeklyMetricsRecord>;
  latest: null;
}

/**
 * MetricsLoadMissing is returned when the host layer indicates the metrics
 * source is unavailable.
 *
 * Examples:
 *   - no file was selected
 *   - static-served metrics artifact was not found
 *   - host shell intentionally passed no content
 */
export interface MetricsLoadMissing {
  status: "missing";
  records: ReadonlyArray<WeeklyMetricsRecord>;
  latest: null;
  reason: string;
}

/**
 * MetricsLoadInvalid is returned when the provided source is malformed or does
 * not match the approved metrics contract.
 */
export interface MetricsLoadInvalid {
  status: "invalid";
  records: ReadonlyArray<WeeklyMetricsRecord>;
  latest: null;
  reason: string;
}

/**
 * MetricsLoadResult is the authoritative bounded output contract of the loader.
 */
export type MetricsLoadResult =
  | MetricsLoadSuccess
  | MetricsLoadEmpty
  | MetricsLoadMissing
  | MetricsLoadInvalid;
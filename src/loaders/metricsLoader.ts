import type {
  MetricsLoadResult,
  WeeklyMetricsRecord,
} from "../types/metrics";

/**
 * WEEK_START_PATTERN validates the canonical persisted week_start shape.
 *
 * Semantic validation is performed separately to ensure the string represents a
 * real UTC date that round-trips correctly.
 */
const WEEK_START_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * loadMetricsFromJson parses and normalizes persisted weekly metrics JSON into
 * a deterministic UI-safe result.
 *
 * Responsibilities:
 *   - accept raw JSON content supplied by a host/transport layer
 *   - parse JSON deterministically
 *   - validate the persisted metrics read-model shape
 *   - sort valid records ascending by week_start
 *   - expose an explicit loader state
 *
 * Non-responsibilities:
 *   - reading local files
 *   - recomputing metrics
 *   - deriving weeks
 *   - fixing corrupt data
 *   - mutating the source
 */
export function loadMetricsFromJson(
  input: string | null | undefined,
): MetricsLoadResult {
  if (input == null) {
    return {
      status: "missing",
      records: [],
      latest: null,
      reason: "metrics source is unavailable",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return {
      status: "invalid",
      records: [],
      latest: null,
      reason: "metrics source contains invalid JSON",
    };
  }

  return loadMetricsFromUnknown(parsed);
}

/**
 * loadMetricsFromUnknown validates and normalizes already-parsed input.
 *
 * This secondary entrypoint is useful for:
 *   - unit tests
 *   - host adapters that already hold parsed JSON
 *   - integration boundaries that separate transport from parsing
 */
export function loadMetricsFromUnknown(input: unknown): MetricsLoadResult {
  if (!Array.isArray(input)) {
    return {
      status: "invalid",
      records: [],
      latest: null,
      reason: "metrics payload must be a JSON array",
    };
  }

  const normalized: WeeklyMetricsRecord[] = [];

  for (let index = 0; index < input.length; index += 1) {
    const candidate = input[index];
    const parsedRecord = parseWeeklyMetricsRecord(candidate);

    if (!parsedRecord.ok) {
      return {
        status: "invalid",
        records: [],
        latest: null,
        reason: `metrics record at index ${index} is invalid: ${parsedRecord.reason}`,
      };
    }

    normalized.push(parsedRecord.value);
  }

  if (normalized.length === 0) {
    return {
      status: "empty",
      records: [],
      latest: null,
    };
  }

  const ordered = [...normalized].sort(compareWeeklyMetricsRecordAsc);

  /**
   * Freeze cloned records so UI components cannot accidentally mutate the
   * loader-owned normalized source of truth.
   */
  const frozenRecords = Object.freeze(
    ordered.map((record) => Object.freeze({ ...record })),
  ) as ReadonlyArray<WeeklyMetricsRecord>;

  return {
    status: "success",
    records: frozenRecords,
    latest: frozenRecords[frozenRecords.length - 1],
  };
}

/**
 * parseWeeklyMetricsRecord validates one candidate object against the persisted
 * weekly metrics contract.
 *
 * The loader uses strict shape-checking:
 *   - top-level record must be a plain object
 *   - no unexpected fields are allowed
 *   - all required fields must be present with valid types
 *   - week_start must be canonical and parseable
 *   - metric values must be finite non-negative integers
 */
function parseWeeklyMetricsRecord(
  input: unknown,
):
  | { ok: true; value: WeeklyMetricsRecord }
  | { ok: false; reason: string } {
  if (!isPlainObject(input)) {
    return { ok: false, reason: "record must be an object" };
  }

  const allowedKeys = new Set([
    "week_start",
    "active_users",
    "ci_integrations",
    "runs",
    "gate_usage",
    "rejections",
  ]);

  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) {
      return { ok: false, reason: `unexpected field "${key}"` };
    }
  }

  const weekStart = input.week_start;
  const activeUsers = input.active_users;
  const ciIntegrations = input.ci_integrations;
  const runs = input.runs;
  const gateUsage = input.gate_usage;
  const rejections = input.rejections;

  if (!isValidWeekStart(weekStart)) {
    return { ok: false, reason: 'week_start must be a valid YYYY-MM-DD date' };
  }
  if (!isNonNegativeInteger(activeUsers)) {
    return { ok: false, reason: "active_users must be a non-negative integer" };
  }
  if (!isNonNegativeInteger(ciIntegrations)) {
    return {
      ok: false,
      reason: "ci_integrations must be a non-negative integer",
    };
  }
  if (!isNonNegativeInteger(runs)) {
    return { ok: false, reason: "runs must be a non-negative integer" };
  }
  if (!isNonNegativeInteger(gateUsage)) {
    return { ok: false, reason: "gate_usage must be a non-negative integer" };
  }
  if (!isNonNegativeInteger(rejections)) {
    return { ok: false, reason: "rejections must be a non-negative integer" };
  }

  return {
    ok: true,
    value: {
      week_start: weekStart,
      active_users: activeUsers,
      ci_integrations: ciIntegrations,
      runs,
      gate_usage: gateUsage,
      rejections,
    },
  };
}

/**
 * compareWeeklyMetricsRecordAsc sorts records deterministically ascending by
 * week_start, with explicit tie-breakers for defensive consistency.
 *
 * Tie-breakers matter because the loader must not depend on raw input order
 * alone when duplicate week_start values appear unexpectedly.
 */
function compareWeeklyMetricsRecordAsc(
  a: WeeklyMetricsRecord,
  b: WeeklyMetricsRecord,
): number {
  if (a.week_start !== b.week_start) {
    return a.week_start.localeCompare(b.week_start);
  }
  if (a.runs !== b.runs) {
    return a.runs - b.runs;
  }
  if (a.gate_usage !== b.gate_usage) {
    return a.gate_usage - b.gate_usage;
  }
  if (a.rejections !== b.rejections) {
    return a.rejections - b.rejections;
  }
  if (a.active_users !== b.active_users) {
    return a.active_users - b.active_users;
  }
  return a.ci_integrations - b.ci_integrations;
}

/**
 * isPlainObject reports whether a value is a non-null, non-array object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * isNonNegativeInteger validates finite non-negative integer metric values.
 */
function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= 0
  );
}

/**
 * isValidWeekStart validates canonical persisted week_start values.
 *
 * Rules:
 *   - must be a string
 *   - must match YYYY-MM-DD
 *   - must parse as a real UTC date
 *   - must round-trip to the same canonical date string
 */
function isValidWeekStart(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  if (!WEEK_START_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === value;
}
# Static Dashboard Metrics Loader

## Purpose

This document defines the authoritative UI-side loader for the persisted weekly
metrics read-model used by the static dashboard.

The loader is:
- read-only
- deterministic
- side-effect-free

## Source of truth

The dashboard consumes only the persisted metrics artifact:

`.bb/metrics/weekly.json`

It does not read:
- telemetry files
- run artifacts
- CLI text output
- dashboard-local cache as source of truth

## Transport boundary

The loader does not read filesystem paths directly.

Approved rule:
- host/application shell acquires the file content
- loader parses and normalizes the provided JSON content

## Public API

Primary API:

```ts
loadMetricsFromJson(input: string | null | undefined): MetricsLoadResult
```

Optional secondary API:
```ts
loadMetricsFromUnknown(input: unknown): MetricsLoadResult
```

## Output states

The loader returns exactly one explicit state:
- `success`
- `empty`
- `missing`
- `invalid`

## Validation

The loader validates:
- top-level array
- required fields
- exact expected field names
- `week_start` format
- non-negative integer metric values

Invalid data is rejected explicitly.

## Ordering

Records are sorted ascending by `week_start`.

The latest week is exposed as the last item and as a convenience `latest` field.

## Read-only guarantee

The loader:
- performs no writes
- triggers no recomputation
- mutates no source files
- does not call `bb metrics build`

## No business logic drift

The loader does not:
- recalculate active users
- derive runs from telemetry
- infer CI providers
- bucket weeks
- repair missing metrics with guesses
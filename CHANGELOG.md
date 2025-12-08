# CHANGELOG

## [Unreleased] - 2025-12-08

### Stabilization Phase 1
- **Fixed Build & Tests**:
  - Resolved `TypeError` in `FinancialsService` by updating unit tests (`financials.test.ts`) to match service logic (renamed `timeCards` to `timeEntries`).
  - Fixed `ReportingService` tests (`reporting.test.ts`) to use `productionEntries` instead of legacy `production` JSON string.
  - Excluded E2E tests (`tests/e2e/**`) from `vitest` configuration to prevent false negatives during unit testing.
  - Confirmed `npm run build` success.
  - Confirmed `npm run test` success (13 files passed).
- **Process**:
  - Established `docs/AGENT_PROTOCOLS.md` for agent stability.
  - Verified `npm install`, `prisma generate`, and `prisma db push` execution.

### Known Issues
- `npm run lint` fails with "Invalid project directory" error. Temporarily bypassed to prioritize build/test stability.

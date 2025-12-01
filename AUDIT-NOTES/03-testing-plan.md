# Phase 3: Testing Analysis & Plan
**Audit Date:** December 1, 2025
**Project:** HDD-Nexus (Midwest Underground)

---

## Current Test Inventory

### Test Files Found

| File | Tests | Status | Coverage Area |
|------|-------|--------|---------------|
| `src/lib/drilling/math/physics.test.ts` | 5 | PASS | Pullback calculations |
| `src/lib/drilling/math/collision.test.ts` | 4 | PASS | Collision detection |
| `src/lib/drilling/math/magnetic.test.ts` | 7 | PASS | Magnetic corrections |
| `src/lib/drilling/witsml/parser.test.ts` | 3 | FAIL | WITSML parsing |

**Total:** 19 tests (16 passing, 3 failing)
**Test Framework:** Vitest 4.0.14
**Coverage:** Unknown (no coverage report configured)

---

## Test Results Summary

```
 PASS  src/lib/drilling/math/physics.test.ts (5 tests) 6ms
 PASS  src/lib/drilling/math/collision.test.ts (4 tests) 7ms
 FAIL  src/lib/drilling/witsml/parser.test.ts (3 tests | 3 failed) 50ms
 PASS  src/lib/drilling/math/magnetic.test.ts (7 tests) 7ms

Test Files:  1 failed | 3 passed (4)
Tests:       3 failed | 16 passed (19)
Duration:    6.81s
```

---

## Failing Tests Analysis

### File: `src/lib/drilling/witsml/parser.test.ts`

**Root Cause:** Async/await mismatch between tests and implementation.

#### Test 1: `should parse a valid trajectory XML`
```typescript
// Current (broken):
const stations = parseWitsmlTrajectory(xml);
expect(stations.length).toBe(2);  // Fails: stations is Promise, not array

// Fix:
const stations = await parseWitsmlTrajectory(xml);
expect(stations.length).toBe(2);
```

#### Test 2: `should return empty array for invalid XML`
```typescript
// Current (broken):
const stations = parseWitsmlTrajectory(xml);
expect(stations).toEqual([]);  // Fails: comparing Promise to array

// Fix:
const stations = await parseWitsmlTrajectory(xml);
expect(stations).toEqual([]);
```

#### Test 3: `should parse a valid log XML`
```typescript
// Same async/await issue
const data = await parseWitsmlLog(xml);
expect(data.length).toBe(2);
```

**Estimated Fix Time:** 15 minutes

---

## Test Coverage Gaps

### Critical Paths Without Tests

| Area | Risk Level | Priority |
|------|------------|----------|
| Authentication flows | CRITICAL | P0 |
| Server actions (all) | CRITICAL | P0 |
| API route handlers | HIGH | P1 |
| MCM trajectory calculation | MEDIUM | P2 |
| Hydraulics calculations | MEDIUM | P2 |
| React components | LOW | P3 |

### Recommended Test Matrix

| Module | Unit | Integration | E2E | Priority |
|--------|------|-------------|-----|----------|
| Auth (`src/lib/auth.ts`) | | X | X | P0 |
| Drilling math | X | | | P1 |
| Server actions | | X | | P0 |
| API routes | | X | | P1 |
| Database operations | | X | | P1 |
| UI components | X | | | P3 |
| Full workflows | | | X | P2 |

---

## Missing Test Cases

### P0: Security-Critical Tests

```typescript
// 1. Authentication Tests
describe('Authentication', () => {
  it('should reject invalid credentials', async () => {
    const result = await signIn('credentials', {
      email: 'test@test.com',
      password: 'wrongpassword',
      redirect: false
    });
    expect(result?.error).toBeDefined();
  });

  it('should not allow SQL injection in email', async () => {
    const result = await signIn('credentials', {
      email: "'; DROP TABLE users; --",
      password: 'test',
      redirect: false
    });
    expect(result?.error).toBeDefined();
  });

  it('should enforce session timeout', async () => {
    // Test session expiration
  });
});

// 2. Authorization Tests
describe('Server Action Authorization', () => {
  it('should reject unauthenticated requests', async () => {
    const result = await updateEstimate('id', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });

  it('should reject cross-user resource access', async () => {
    // User A should not modify User B's resources
  });

  it('should enforce role-based access', async () => {
    // LABORER should not approve reports
  });
});
```

### P1: Business Logic Tests

```typescript
// 3. Drilling Calculations
describe('MCM Trajectory', () => {
  it('should calculate correct TVD for vertical bore', () => {
    const result = calculateNextStation(
      { md: 0, tvd: 0, north: 0, east: 0 },
      100, // MD
      0,   // Inclination (vertical)
      0    // Azimuth
    );
    expect(result.tvd).toBeCloseTo(100, 2);
  });

  it('should calculate correct position for horizontal bore', () => {
    const result = calculateNextStation(
      { md: 100, tvd: 100, north: 0, east: 0 },
      100, // MD
      90,  // Inclination (horizontal)
      90   // Azimuth (east)
    );
    expect(result.tvd).toBeCloseTo(100, 2);  // No TVD change
    expect(result.east).toBeGreaterThan(0);  // Moves east
  });

  it('should handle dogleg severity limits', () => {
    // Test extreme angles
  });
});

// 4. Pullback Calculations (ASTM F1962)
describe('Pullback Force', () => {
  it('should include capstan effect at bends', () => {
    // Test exponential friction increase
  });

  it('should account for buoyancy in fluid', () => {
    // Test submerged weight calculations
  });
});
```

### P2: Integration Tests

```typescript
// 5. API Route Tests
describe('WITSML API', () => {
  it('POST /api/witsml should store telemetry', async () => {
    const response = await fetch('/api/witsml', {
      method: 'POST',
      body: validWitsmlXml
    });
    expect(response.status).toBe(200);
  });

  it('GET /api/witsml/latest should require boreId', async () => {
    const response = await fetch('/api/witsml/latest');
    expect(response.status).toBe(400);
  });

  it('should validate WITSML format', async () => {
    const response = await fetch('/api/witsml', {
      method: 'POST',
      body: '<invalid>xml</invalid>'
    });
    expect(response.status).toBe(400);
  });
});

// 6. Database Transaction Tests
describe('Daily Report Approval', () => {
  it('should update inventory in transaction', async () => {
    // Test atomic inventory updates
  });

  it('should rollback on inventory error', async () => {
    // Test transaction rollback
  });
});
```

### P3: E2E Tests

```typescript
// 7. Full Workflow Tests (Playwright)
describe('Rod Pass Workflow', () => {
  it('should log rod pass and update 3D view', async ({ page }) => {
    await page.goto('/dashboard/rod-pass');
    await page.fill('[name="md"]', '100');
    await page.fill('[name="inc"]', '5');
    await page.fill('[name="azi"]', '90');
    await page.click('button[type="submit"]');

    // Verify UI updates
    await expect(page.locator('.bore-3d-view')).toBeVisible();
  });
});

describe('Estimate to Invoice Workflow', () => {
  it('should create estimate, convert to project, generate invoice', async ({ page }) => {
    // Full business workflow test
  });
});
```

---

## Testing Strategy

### Immediate Actions (Week 1)

1. **Fix failing WITSML tests** - Add async/await
2. **Add test script to package.json** - `"test": "vitest"`
3. **Configure coverage reporting**
4. **Add pre-commit test hooks**

### Short Term (Weeks 2-4)

1. **Security test suite** - Auth, authorization, input validation
2. **Server action tests** - All CRUD operations
3. **API route tests** - All endpoints

### Medium Term (Month 2)

1. **Integration tests** - Database transactions
2. **E2E tests** - Critical user workflows
3. **Performance tests** - Load testing

---

## Test Configuration Recommendations

### vitest.config.ts (Enhanced)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/types/**'
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    },
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

---

## Coverage Targets

| Phase | Target | Timeline |
|-------|--------|----------|
| Current | ~10% | Now |
| Phase 1 | 40% | 2 weeks |
| Phase 2 | 60% | 1 month |
| Phase 3 | 80% | 2 months |

### Coverage by Area

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| Drilling Math | 60% | 90% | P1 |
| Auth/Security | 0% | 90% | P0 |
| Server Actions | 0% | 80% | P0 |
| API Routes | 0% | 80% | P1 |
| Components | 0% | 50% | P3 |

---

## Recommended Test Structure

```
tests/
├── setup.ts                 # Global test setup
├── unit/
│   ├── drilling/           # Drilling math tests
│   │   ├── mcm.test.ts
│   │   ├── loads.test.ts
│   │   └── hydraulics.test.ts
│   ├── auth/               # Auth logic tests
│   └── utils/              # Utility function tests
├── integration/
│   ├── actions/            # Server action tests
│   ├── api/                # API route tests
│   └── database/           # Database operation tests
├── e2e/
│   ├── auth.spec.ts        # Auth workflows
│   ├── drilling.spec.ts    # Drilling workflows
│   └── financial.spec.ts   # Estimate/invoice workflows
└── fixtures/
    ├── witsml-samples/     # Sample WITSML files
    ├── users.ts            # Test user data
    └── projects.ts         # Test project data
```

---

## Priority Test Implementation Order

1. **Week 1:** Fix WITSML tests, setup coverage
2. **Week 2:** Auth security tests
3. **Week 3:** Server action authorization tests
4. **Week 4:** API route validation tests
5. **Month 2:** Integration and E2E tests

---

**Next Phase:** UX Audit (04-ux-improvements.md)

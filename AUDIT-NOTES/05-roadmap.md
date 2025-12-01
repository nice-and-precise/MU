# Phase 6: Prioritized Roadmap
**Audit Date:** December 1, 2025
**Project:** HDD-Nexus (Midwest Underground)

---

## Sprint Planning Overview

| Sprint | Focus | Duration | Outcome |
|--------|-------|----------|---------|
| Sprint 1 | Critical Security | 1 week | Credentials secure |
| Sprint 2 | Authorization | 1 week | RBAC enforced |
| Sprint 3 | UX Critical | 1 week | Mobile functional |
| Sprint 4 | Testing | 1 week | 40% coverage |
| Sprint 5-6 | Polish & E2E | 2 weeks | Production ready |

---

## Sprint 1: Critical Security (Week 1)

### Goal: Eliminate data breach risk

| Task | Priority | Effort | Assignee |
|------|----------|--------|----------|
| Rotate Supabase credentials | P0 | 1h | DevOps |
| Generate secure NEXTAUTH_SECRET | P0 | 30m | DevOps |
| Remove .env from git history | P0 | 2h | DevOps |
| Add .env to .gitignore | P0 | 5m | DevOps |
| Create .env.example template | P0 | 30m | Backend |
| Disable debug mode in auth | P0 | 15m | Backend |
| Add rate limiting to auth | P1 | 4h | Backend |

**Sprint 1 Total:** ~8 hours

### Acceptance Criteria
- [ ] No credentials in git history
- [ ] NEXTAUTH_SECRET is 256-bit random
- [ ] Rate limiting: 5 attempts per 15 minutes
- [ ] Debug mode off in production

---

## Sprint 2: Authorization (Week 2)

### Goal: Enforce ownership and role-based access

| Task | Priority | Effort | Assignee |
|------|----------|--------|----------|
| Create authorization helper functions | P0 | 4h | Backend |
| Add ownership checks to estimating actions | P0 | 4h | Backend |
| Add ownership checks to report actions | P0 | 4h | Backend |
| Add ownership checks to drilling actions | P0 | 4h | Backend |
| Add authorization to WITSML API routes | P0 | 3h | Backend |
| Add security event logging | P1 | 4h | Backend |
| Create unauthorized access audit trail | P1 | 2h | Backend |

**Sprint 2 Total:** ~25 hours

### Acceptance Criteria
- [ ] All server actions check ownership
- [ ] Role-based access enforced
- [ ] Security events logged
- [ ] IDOR vulnerabilities eliminated

---

## Sprint 3: UX Critical (Week 3)

### Goal: Make app usable on mobile devices

| Task | Priority | Effort | Assignee |
|------|----------|--------|----------|
| Add mobile hamburger menu | P0 | 4h | Frontend |
| Create Sheet-based mobile navigation | P0 | 4h | Frontend |
| Replace all browser alerts with AlertDialog | P1 | 8h | Frontend |
| Add proper form labels to all inputs | P1 | 3h | Frontend |
| Add loading skeletons to async pages | P1 | 4h | Frontend |
| Add empty state components | P2 | 2h | Frontend |

**Sprint 3 Total:** ~25 hours

### Acceptance Criteria
- [ ] Mobile navigation functional
- [ ] No browser alert() or confirm()
- [ ] All inputs have labels
- [ ] Loading states visible

---

## Sprint 4: Testing (Week 4)

### Goal: Reach 40% test coverage

| Task | Priority | Effort | Assignee |
|------|----------|--------|----------|
| Configure vitest coverage reporting | P0 | 1h | QA |
| Add auth security tests | P0 | 6h | QA |
| Add authorization tests for server actions | P0 | 8h | QA |
| Add API route validation tests | P1 | 6h | QA |
| Add MCM trajectory calculation tests | P1 | 4h | QA |
| Add pullback calculation tests | P1 | 4h | QA |
| Set up Playwright for E2E | P2 | 4h | QA |

**Sprint 4 Total:** ~33 hours

### Acceptance Criteria
- [ ] Coverage report generated
- [ ] Auth tests passing
- [ ] Authorization tests passing
- [ ] 40% line coverage achieved

---

## Sprint 5-6: Polish & Production Prep (Weeks 5-6)

### Goal: Production-ready deployment

| Task | Priority | Effort | Assignee |
|------|----------|--------|----------|
| Form validation with react-hook-form + Zod | P1 | 12h | Frontend |
| Add breadcrumb navigation | P2 | 4h | Frontend |
| Color contrast accessibility fixes | P2 | 2h | Frontend |
| Add skip links and ARIA labels | P2 | 4h | Frontend |
| E2E tests for critical workflows | P1 | 12h | QA |
| Performance optimization pass | P2 | 8h | Full Stack |
| Security re-audit | P0 | 4h | Security |
| Production deployment prep | P0 | 8h | DevOps |

**Sprint 5-6 Total:** ~54 hours

### Acceptance Criteria
- [ ] Form validation on all forms
- [ ] Lighthouse accessibility > 90
- [ ] E2E tests for login, rod pass, estimate workflows
- [ ] Security re-audit passed
- [ ] Production environment configured

---

## Backlog (Future Sprints)

### P3: Nice to Have
| Task | Effort | Value |
|------|--------|-------|
| Unit tests for React components | 20h | Medium |
| Add keyboard shortcuts | 8h | Low |
| List virtualization for large datasets | 12h | Medium |
| Bulk operations (multi-select delete) | 8h | Low |
| Advanced reporting dashboard | 20h | Medium |

### P4: Technical Debt
| Task | Effort | Value |
|------|--------|-------|
| Normalize JSON fields in database | 16h | High |
| Add database enums for status fields | 8h | Medium |
| Remove deprecated collision.ts wrapper | 1h | Low |
| Clean up console.log statements | 2h | Low |

---

## Resource Requirements

### Team Composition
| Role | FTE | Sprints |
|------|-----|---------|
| Backend Developer | 1.0 | 1-4 |
| Frontend Developer | 1.0 | 3-6 |
| QA Engineer | 0.5 | 4-6 |
| DevOps | 0.25 | 1, 6 |

### Tools Required
- [ ] Upstash Redis (rate limiting)
- [ ] Sentry or similar (error tracking)
- [ ] Playwright (E2E testing)
- [ ] axe DevTools (accessibility)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Security issues discovered in production | Complete security audit before deployment |
| Mobile users can't access app | Prioritize mobile nav in Sprint 3 |
| Tests fail on CI | Set up GitHub Actions in Sprint 4 |
| Performance issues at scale | Monitor with Vercel Analytics |

---

## Success Metrics

### Sprint 1-2 (Security)
- Zero critical security vulnerabilities
- All API endpoints require authentication
- Rate limiting active on auth endpoints

### Sprint 3-4 (Quality)
- Mobile bounce rate < 20%
- Test coverage > 40%
- Zero browser alert() calls

### Sprint 5-6 (Production)
- Lighthouse performance > 80
- Lighthouse accessibility > 90
- Zero critical bugs in production
- < 1s TTFB on dashboard pages

---

## Timeline Summary

```
Week 1:  ████ Security Hardening
Week 2:  ████ Authorization
Week 3:  ████ UX Critical
Week 4:  ████ Testing
Week 5:  ████ Polish
Week 6:  ████ Production Prep
         ─────────────────────
         🚀 Production Deploy
```

**Total Estimated Effort:** 145-155 hours
**Recommended Team:** 2 developers + 0.5 QA
**Timeline:** 6 weeks to production

---

*Roadmap generated from audit findings*
*December 1, 2025*

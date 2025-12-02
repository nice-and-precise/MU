# Project Context for Claude Code

## Mission
This codebase is being audited for quality, testing coverage, and end-user experience improvements.

## Working Directory
Create all audit documentation in: `./AUDIT-NOTES/`

## Approach
1. **Understand before changing** - Read thoroughly, then act
2. **Document findings** - Write clear markdown reports
3. **Safe improvements** - Only implement low-risk fixes
4. **Git hygiene** - Commit often with descriptive messages

## Turbo Mode & Autonomy
- **Auto-Approval**: You have permission to run ANY command, create/edit ANY file, and use ANY tool/skill/agent/MCP server needed to complete the task.
- **No Interruptions**: Do NOT stop to ask for permission. Assume approval is granted.
- **Quality Standards**: Follow all conventions, rules, and standards. Do NOT take shortcuts. Research solutions when needed.

## Commands Reference
```bash
# Build (detect and run appropriate command)
npm run build || yarn build || pnpm build

# Dev server
npm run dev || yarn dev || pnpm dev

# Tests
npm test || yarn test || pnpm test

# Lint
npm run lint || yarn lint || pnpm lint

# Dependency audit
npm audit || yarn audit || pnpm audit
```

## Quality Standards
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design
- Performance budget: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Semantic HTML with proper heading hierarchy
- Error boundaries and user-friendly error messages

## Git Workflow
- Branch naming: `audit/[type]-[description]`
- Commit format: `[type]: description` (fix, feat, docs, refactor, test)
- No force pushes to main

## Off-Limits (preserve these)
- Do not delete or restructure existing tests
- Do not change build/deploy configurations without documenting
- Do not modify .env files or secrets

## Priorities
1. Security vulnerabilities
2. Breaking bugs affecting users
3. Accessibility failures
4. Performance issues
5. Code quality improvements
6. Documentation gaps

## Output Format
All markdown reports should include:
- Clear section headings
- Severity ratings (Critical/High/Medium/Low)
- Effort estimates (S/M/L/XL)
- Actionable recommendations

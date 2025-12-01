# Claude Code Autonomous Audit Prompt for MU

## Quick Start Command

```bash
cd "C:\Users\Owner\Desktop\MU"
claude --dangerously-skip-permissions
```

Then paste the prompt below.

---

## Full Audit Prompt

```
You are conducting a comprehensive audit of this website/repository. Your goal is to fully understand the codebase, identify improvement opportunities, and create actionable recommendations for end-user experience.

## PHASE 1: DISCOVERY & UNDERSTANDING

### 1.1 Project Structure Analysis
- Read all README files, CLAUDE.md, package.json, and config files
- Map the complete directory structure
- Identify the tech stack (frameworks, languages, dependencies)
- Document entry points (main files, routes, pages)
- Note build commands, dev server setup, and deployment config

### 1.2 Architecture Deep-Dive
- Trace data flow from user input to output
- Identify core modules, components, and their relationships
- Map state management patterns
- Document API endpoints and external integrations
- Note authentication/authorization patterns

### 1.3 Create Understanding Document
Write your findings to `AUDIT-NOTES/01-understanding.md`:
- Tech stack summary
- Architecture diagram (mermaid)
- Key file locations
- Critical dependencies

## PHASE 2: CODE QUALITY AUDIT

### 2.1 Code Review Checklist
Evaluate and document:
- [ ] Code consistency and style
- [ ] Error handling patterns
- [ ] Security vulnerabilities (XSS, injection, auth issues)
- [ ] Performance bottlenecks
- [ ] Accessibility compliance (WCAG)
- [ ] Mobile responsiveness
- [ ] SEO considerations
- [ ] Dead code and unused dependencies
- [ ] Type safety and validation
- [ ] API design quality

### 2.2 Dependency Analysis
- Check for outdated packages
- Identify security vulnerabilities (`npm audit` or equivalent)
- Note heavy/unnecessary dependencies
- Check for license compliance issues

### 2.3 Create Quality Report
Write findings to `AUDIT-NOTES/02-code-quality.md`:
- Critical issues (must fix)
- High priority improvements
- Technical debt inventory
- Dependency recommendations

## PHASE 3: TESTING ASSESSMENT

### 3.1 Existing Test Analysis
- Inventory existing tests (unit, integration, e2e)
- Check test coverage
- Identify untested critical paths
- Review test quality and reliability

### 3.2 Testing Gaps
Document:
- Missing test categories
- Uncovered edge cases
- Flaky or unreliable tests
- Performance testing needs

### 3.3 Create Testing Plan
Write to `AUDIT-NOTES/03-testing-plan.md`:
- Proposed test strategy
- Priority test cases to add
- Testing tools recommendations
- Coverage targets

## PHASE 4: USER EXPERIENCE AUDIT

### 4.1 UX Analysis
If this is a web application, evaluate:
- Page load performance
- Navigation and information architecture
- Form usability and validation
- Error messages and user feedback
- Loading states and transitions
- Mobile experience
- Accessibility (keyboard nav, screen readers)

### 4.2 End-User Journey Mapping
- Identify primary user flows
- Document friction points
- Note confusing UI patterns
- Evaluate call-to-action effectiveness

### 4.3 Create UX Report
Write to `AUDIT-NOTES/04-ux-improvements.md`:
- User flow diagrams
- Friction point inventory
- Quick wins (easy improvements)
- Strategic improvements (larger effort)

## PHASE 5: IMPROVEMENT IMPLEMENTATION

### 5.1 Quick Wins (Implement These)
Fix issues that:
- Have clear solutions
- Low risk of breaking changes
- High impact on UX or code quality
- Can be completed confidently

For each fix:
1. Create a git branch: `audit/fix-[description]`
2. Implement the fix
3. Test the change
4. Commit with descriptive message
5. Document what was changed

### 5.2 Create Implementation Roadmap
Write to `AUDIT-NOTES/05-roadmap.md`:
- Prioritized improvement backlog
- Effort estimates (S/M/L)
- Dependencies between tasks
- Recommended implementation order

## PHASE 6: FINAL DELIVERABLES

Create the following in `AUDIT-NOTES/`:

1. **`00-executive-summary.md`** - High-level findings and recommendations
2. **`01-understanding.md`** - Project structure and architecture
3. **`02-code-quality.md`** - Code review findings
4. **`03-testing-plan.md`** - Testing strategy and gaps
5. **`04-ux-improvements.md`** - User experience recommendations
6. **`05-roadmap.md`** - Prioritized action plan
7. **`CHANGELOG.md`** - All changes made during audit

## WORKING RULES

1. **READ BEFORE WRITING**: Always understand existing patterns before making changes
2. **GIT HYGIENE**: Commit frequently with clear messages
3. **PRESERVE FUNCTIONALITY**: Never break existing working features
4. **DOCUMENT EVERYTHING**: Leave clear notes for future developers
5. **TEST CHANGES**: Verify fixes work before moving on
6. **THINK HARD**: Use extended thinking for complex decisions

## START NOW

Begin with Phase 1. Create the `AUDIT-NOTES/` directory immediately. Read through the entire codebase systematically before making any changes. Use subagents to investigate specific questions deeply.

DO NOT ASK FOR PERMISSION. DO NOT STOP UNTIL ALL PHASES ARE COMPLETE.

Start by running: `mkdir -p AUDIT-NOTES && ls -la && cat package.json 2>/dev/null || cat Cargo.toml 2>/dev/null || cat requirements.txt 2>/dev/null || cat go.mod 2>/dev/null`
```

---

## Alternative: Focused Quick Audit

For a faster, targeted audit:

```
Perform a rapid audit of this codebase focusing on end-user impact:

1. **5-minute scan**: Read README, package.json, main entry points. Understand what this is.

2. **Code smell detection**: Find the top 5 issues affecting users:
   - Performance problems
   - Security vulnerabilities  
   - Broken or confusing UX
   - Missing error handling
   - Accessibility failures

3. **Quick fixes**: Implement any low-risk improvements you can confidently make.

4. **Report**: Create `QUICK-AUDIT.md` with:
   - What this project does
   - Top 5 issues found
   - Fixes applied
   - Recommended next steps

Work autonomously until complete. Commit all changes with descriptive messages.
```

---

## Usage Notes

### Permission Flags
The `--dangerously-skip-permissions` flag enables:
- All file edits
- All bash commands
- Autonomous operation

### Safety Considerations
Per Anthropic docs, this mode should ideally run in a container without internet access for safety. For trusted codebases like your own project, running directly is acceptable but be aware Claude will execute any commands it deems necessary.

### Monitoring Progress
- Watch the terminal for Claude's progress
- Claude will create the AUDIT-NOTES folder with findings
- Check git log for changes: `git log --oneline -20`

### If Claude Gets Stuck
- Type `Escape` to interrupt and redirect
- Use `/clear` to reset context if it loops
- Add specific guidance if a phase is unclear

---

## Customization Ideas

Add to the prompt based on your project:

```
ADDITIONAL CONTEXT:
- This is a [Next.js / React / Vue / etc.] application
- Primary users are [description]
- Key user flows include: [list flows]
- Known pain points: [list issues you're aware of]
- Don't modify: [files or folders to avoid]
- Prioritize: [specific concerns]
```

---

*Generated based on Anthropic's Claude Code Best Practices*
*https://www.anthropic.com/engineering/claude-code-best-practices*

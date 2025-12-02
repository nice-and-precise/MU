# MU Repository Audit - Quick Start Guide

## Files Included

| File | Purpose |
|------|---------|
| `COPY-PASTE-PROMPT.txt` | Ready-to-use prompt - paste directly into Claude Code |
| `MU-Audit-Prompt.md` | Full documentation with variants and customization options |
| `CLAUDE.md` | Drop into MU folder for persistent context across sessions |

## Setup Steps

### 1. Add CLAUDE.md to Your Project
```bash
copy CLAUDE.md "C:\Users\Owner\Desktop\MU\CLAUDE.md"
```
This gives Claude Code persistent context every time you start it in that folder.

### 2. Launch Claude Code in Autonomous Mode
```bash
cd "C:\Users\Owner\Desktop\MU"
claude --dangerously-skip-permissions
```

### 3. Paste the Prompt
Open `COPY-PASTE-PROMPT.txt`, copy everything below "PASTE THIS PROMPT:", and paste it into Claude Code.

### 4. Let It Run
Claude will:
- Create an `AUDIT-NOTES/` folder
- Systematically analyze the codebase
- Document findings in markdown
- Implement safe improvements
- Commit changes with clear messages

## What You'll Get

After completion, check `AUDIT-NOTES/` for:

```
AUDIT-NOTES/
├── 00-executive-summary.md   # Start here - key findings
├── 01-understanding.md       # Architecture & structure
├── 02-code-quality.md        # Code review results
├── 03-testing-plan.md        # Testing recommendations
├── 04-ux-improvements.md     # User experience fixes
├── 05-roadmap.md             # Prioritized action plan
└── CHANGELOG.md              # All changes made
```

## Monitoring Progress

While Claude works:
- Watch terminal output for progress
- Check `git log --oneline` for commits
- Press `Escape` to interrupt if needed
- Type `/clear` to reset context if stuck

## Customization

Add project-specific context to the prompt:

```
ADDITIONAL CONTEXT:
- Framework: [Next.js / React / Vue / etc.]
- Primary users: [who uses this]
- Key user flows: [main features]
- Known issues: [problems you're aware of]
- Don't modify: [protected files]
```

## Safety Notes

Per Anthropic's documentation, `--dangerously-skip-permissions` should ideally run in a container for untrusted code. For your own projects, it's acceptable but Claude will execute commands autonomously.

If concerned:
- Run in a Docker container
- Use a fresh git branch: `git checkout -b audit-run`
- Review commits after: `git diff main..audit-run`

---

Built following Anthropic's Claude Code Best Practices:
https://www.anthropic.com/engineering/claude-code-best-practices

# Agent Instructions & Best Practices

## 1. Cascading Memory Strategy
To maintain context across long sessions and multiple agents, use a "Cascading Memory" approach:
- **Level 1: `task.md`**: The immediate tactical checklist. Update this frequently (every task boundary).
- **Level 2: `status.md`**: High-level project status. Update this at the end of major features.
- **Level 3: `decisions.md`**: Log of key technical decisions (ADRs). Why did we choose X over Y?
- **Level 4: `handoff.md`**: The bridge between sessions. Summarize what was done and what is next.
- **Level 5: `README.md`**: The public face. Keep it sync'd with reality.

## 2. Agentic Mode & Task Boundaries
- **Granularity**: Break tasks down into small, verifiable chunks (e.g., "Create Component", "Update API", "Verify Build").
- **Communication**: Use `task_boundary` to signal intent. Use `notify_user` ONLY when blocked or finished with a major chunk.
- **Turbo Mode**: You have permission to run ANY command, create/edit ANY file, and use ANY tool/skill/agent/MCP server needed. Do NOT stop to ask for permission. Assume approval is granted. Research solutions when needed.

## 3. Verification First
- **Build Often**: Run `npm run build` (or `npm run build -- --webpack`) frequently to catch type errors early.
- **Simulate**: If real hardware isn't available (like a drill rig), build a simulator (e.g., `simulateData` in `page.tsx`) to verify the pipeline.

## 4. Tech Stack Specifics
- **Next.js 16**: Use Server Actions for data mutation and fetching. Avoid API routes for internal data unless necessary (like WITSML ingestion).
- **Prisma**: Remember to run `npx prisma generate` after schema changes. If it fails due to locking, try restarting the dev server or running in a separate process.
- **Rust**: For heavy math, defer to the Rust engine (future integration).

## 5. User Preferences
- **Aesthetics**: "Modern Professional Construction" (Deep Blues, Safety Yellow).
- **UX**: High Contrast Day Mode for field apps. Big buttons.
- **Documentation**: Keep it updated. The user values a clean `README` and `walkthrough`.

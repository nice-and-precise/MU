# Agent Instructions & Best Practices

## Level 0: Turbo Mode Protocols (Override)
- **Bias for Action, Not Haste**: "Turbo" means you have *permission* to act without asking, not permission to rush. Take the time to do it right.
- **Autonomous Error Handling**: If a command fails (e.g., build error, missing file), **FIX IT**. Do not stop to report the error unless you are stuck after 3 distinct attempts.
- **Methodical Rigor (No Shortcuts)**:
    -   **Context First**: Read the *entire* file and understand its imports/scope before applying edits.
    -   **Verify Everything**: You are not "Done" until you have verified your changes (e.g., `npm run build`, `tsc`, or running a test). **Autonomous action requires autonomous verification.**
    -   **Completeness**: Do not leave "TODOs" or placeholders unless explicitly instructed. Implement the full solution.
- **Logical Chaining**: If Task A is done and Task B is the obvious next step (e.g., "Build" after "Refactor"), **DO IT**. But do not proceed if Task A is broken. 
- **Persistence**: These rules apply to ALL future sessions. Always check `.agent/instructions.md` at the start.

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

## 6. Coding Hygiene & Tool Safety (CRITICAL)
- **Large Refactors**: **NEVER** use `replace_file_content` to rewrite >50% of a file or an entire file. It is prone to "fuzzy match" corruption. Use `write_to_file` with `Overwrite: true` instead.
- **Context Verification**: Before editing a file, VERIFY that new variables (e.g., `session`) and components (e.g., `Link`) are defined/imported in the specific scope you are actively touching. Do not rely on "it's probably there".
- **Tool Arguments**: Double-check that `IsArtifact: true` is ALWAYS accompanied by `ArtifactMetadata`. Use absolute paths for all search/file tools.

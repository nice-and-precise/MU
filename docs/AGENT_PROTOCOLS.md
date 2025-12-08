# Agent Stability Protocols

This document outlines the protocols and guidelines for the AI agent to ensure system stability, prevent crashes, and maintain efficient operations.

## 1. Command Execution Safety
- **Blocking Commands**: Never run blocking commands (e.g., `npm run dev`, `wait`, `sleep`) in the foreground without a clear timeout or async strategy.
- **Output Management**: When running commands that produce large amounts of output (e.g., build logs, test results), always use pagination or limit the output view. Do not attempt to consume megabytes of terminal output in a single turn.
- **Verification**: After running a command, always verify its status using `command_status` before assuming success, especially for background processes.

## 2. File Operations
- **Large Files**: When reading files, check the size first. For files larger than 1000 lines, use partial reads (`StartLine`, `EndLine`) or `view_file_outline` to navigate.
- **Atomic Writes**: Ensure file writes are atomic where possible. When modifying critical configuration files, have a backup or quick rollback strategy.

## 3. Loop Prevention
- **Error Handling**: If a tool call fails, **STOP** and analyze the error. Do not blindly retry the same command more than once.
- **Recursive Logic**: When performing recursive tasks (e.g., traversing directories), strictly limit the depth to avoid infinite loops.

## 4. Resource Management
- **Terminal Instances**: Clean up unused terminal instances. Do not leave multiple `npm run dev` servers running simultaneously if they block ports.
- **Memory**: Be mindful of context window usage. Summarize large inputs rather than dumping them raw into the context.

## 5. User Communication
- **Clear Status**: Keep `task_boundary` updated with accurate status.
- **Failure Notification**: If a critical failure occurs (e.g., build persistently failing), notify the user immediately rather than spinning in a fix loop.

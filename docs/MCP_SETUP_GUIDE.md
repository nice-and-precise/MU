# AI Tools & MCP Server Guide

This project is equipped with **Model Context Protocol (MCP)** servers to provide advanced capabilities to AI agents (like Claude, Antigravity, etc.).

## Installed MCP Servers

### 1. PostgreSQL Database (`postgres`)
*   **Purpose**: Direct access to the local application database.
*   **Connection**: Connects to the Dockerized PostgreSQL instance (`hdd-nexus-db`).
*   **Capabilities**:
    *   Read database schema.
    *   Execute SQL queries (SELECT, INSERT, UPDATE, etc.).
    *   Debug data issues without manual API calls.

### 2. GitHub Integration (`github`)
*   **Purpose**: Interaction with the project's GitHub repository.
*   **Capabilities**:
    *   Read issues and pull requests.
    *   Create new issues and PRs.
    *   Search repository history.
    *   Push changes directly (via PRs).
*   **Configuration**: Uses a Personal Access Token (PAT) configured in the MCP client settings.

### 3. Browser Automation (`puppeteer`)
*   **Purpose**: Headless browser control for testing and scraping.
*   **Capabilities**:
    *   Navigate to pages.
    *   Click elements and fill forms.
    *   Take screenshots.
    *   Extract data from web pages.
    *   Run end-to-end tests.

## How to Use
These servers are configured in your local MCP client configuration (e.g., `claude_desktop_config.json`). When you start a session with an MCP-enabled AI:

1.  **Database**: Ask the AI to "check the latest user in the database" or "schema of the Project table".
2.  **GitHub**: Ask the AI to "check open issues" or "create a PR for these changes".
3.  **Browser**: Ask the AI to "visit localhost:3000 and take a screenshot".

## Troubleshooting
If tools are not showing up:
1.  Ensure `npm install` has been run to install the server packages.
2.  Restart your AI client (Claude Desktop, etc.).
3.  Check `claude_desktop_config.json` for correct paths.

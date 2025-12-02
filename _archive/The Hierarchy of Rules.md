The Hierarchy of Rules

To understand how Antigravity makes decisions, it helps to know the hierarchy of instructions it follows:

System Rules (Immutable): These are the core directives from Google Deepmind. They define the agent's identity (e.g., "Always plan before coding," "Create premium designs"). You cannot change these.
User Rules (Customizable): These are your instructions. They sit on top of the system rules and allow you to override defaults or add specific constraints.
Types of User Rules
You can define rules at two different levels:

1. Global Rules
These rules apply to all your projects. They are perfect for your personal preferences that don't change from project to project.

"Always use TypeScript."
"Be concise in your explanations."
"Never use `var`, always use `const` or `let`."
How to set them: These are typically configured in your editor's AI settings (often under "General" or "AI Rules").

2. Workspace Rules
These rules apply only to the current project. They are essential for enforcing team standards or project-specific architectural patterns.

"Use `shadcn/ui` for all new components."
"Follow the Container/Presenter pattern."
"This project uses Next.js 14 App Router."
How to set them: Create a specific configuration file in the root of your project (e.g., .cursorrules or similar). Antigravity reads this file to understand the context of your codebase.

How to Add Rules (The Easy Way)
You don't need to be a coding wizard to add rules. Antigravity has a built-in interface that makes it super simple. Just follow these steps:

Step 1: Open the Menu
Look for the three dots (•••) in the top-right corner of the Agent Manager and click on them.

Clicking the three dots menu
Step 2: Select Additional Options
A menu will pop up. Click on the "Additional options" button.

Selecting Additional options
Step 3: Go to Customizations
In the new menu, click on "Customizations". This is your control center for configuring the agent.

Clicking on Customizations
Step 4: Choose Your Rule Type
Now you're in! You can see the Rules tab. Simply click + Globalto set rules for all your projects, or + Workspace for just this one.

Selecting Global or Workspace rules

What Can You Customize?
You can control almost every aspect of how Antigravity works. Here are the main categories:

A. Tech Stack & Libraries
Don't let the AI guess. Tell it exactly what tools you want to use.

# Example Rule - Framework: Next.js 14 - Styling: Tailwind CSS - State Management: Zustand
B. Coding Style
Enforce your linting rules and stylistic preferences naturally.

# Example Rule - Prefer functional components over classes. - Use named exports for components. - Always add JSDoc comments to exported functions.
C. Behavior
Adjust how the agent interacts with you.

# Example Rule - If you see a potential bug, stop and ask me before proceeding. - Explain complex logic, but skip the basics. - Always respond in Spanish.
Deep Customization: Hacking the System
Beyond basic rules, you can tap into Antigravity's core "Agentic" features. Here is what's happening under the hood and how you can control it.

1. Agentic Mode & Artifacts
Antigravity operates in a loop: Plan → Execute → Verify. It tracks this state using specific files called "Artifacts". You can create rules to change how these artifacts are used.

task.md: The living checklist.Rule idea: "Always break tasks down into granular sub-tasks of no more than 1 hour."
implementation_plan.md: The technical blueprint.Rule idea: "Always include a 'Security Implications' section in the plan."
walkthrough.md: The proof of work.Rule idea: "Always include a GIF recording of the UI in the walkthrough."
2. Design Philosophy
By default, Antigravity is hard-coded to prioritize "Premium, Dynamic, and Aesthetic" designs. It avoids basic MVPs and leans towards glassmorphism, animations, and modern typography.

Want something else? Override it.

# Example: Brutalist Design Rule - Design Style: Brutalist, raw, and high-contrast. - Avoid: Gradients, shadows, and rounded corners. - Use: Monospace fonts and thick borders.
# Example: Enterprise Minimalist Rule - Design Style: Clean, professional, and accessible. - Priority: Information density and readability over flashiness. - Use: Standard Tailwind utility classes only.
3. Workflows & Turbo Mode
You can script Antigravity's behavior using Workflows. These are Markdown files stored in .agent/workflows/ that define step-by-step recipes.

Turbo Mode (// turbo): Place this comment above a command to let the agent run it automatically without asking for approval.
Tip: Create a `setup_project.md` workflow with turbo commands to automate your repo initialization!

Troubleshooting Common Issues
Even with perfect rules, you might run into occasional hiccups. Here is how to handle the most common ones:

Infinite Loading
Is the agent stuck on "Working..."? This often happens when the context is too large or a rule is conflicting.

See the Fix → Do Research 
Quota Limit Exceeded
Seeing a quota error? This means you've hit the rate limit for the current model.

Learn More → Do Research 

Server Crash Issues
💥
Antigravity server crashed unexpectedly
"Antigravity server crashed unexpectedly. Please restart to restore full AI functionality"
Symptoms: IDE becomes unresponsive, agent tasks terminate suddenly, or features stop working mid-operation.

Solution 1: Restart Antigravity (Primary Fix)
Success Rate: ~85% of server crashes are resolved with a simple restart.

Close Antigravity completely (Cmd+Q on macOS, File > Exit on Windows).
Wait 30 seconds before reopening to allow ports to clear.
Relaunch Antigravity and verify the agent manager loads.
Solution 2: Clear Application Cache
If restart doesn't work, run these commands in your terminal:

macOS:

rm -rf ~/Library/Application\ Support/Antigravity/Cache
rm -rf ~/Library/Application\ Support/Antigravity/GPUCache
Windows:

rd /s /q "%APPDATA%\Antigravity\Cache"
rd /s /q "%APPDATA%\Antigravity\GPUCache"
Linux:

rm -rf ~/.config/Antigravity/Cache
rm -rf ~/.config/Antigravity/GPUCache
Solution 3: Check System Resources
RAM: Minimum 4GB required (8GB recommended).
CPU: If at 100%, wait for background processes.
Disk: Ensure at least 2GB free storage.
Solution 4: Disable Hardware Acceleration (Advanced)
For persistent crashes, this may improve stability at the cost of performance.

Open Settings → Application → Performance.
Uncheck "Use hardware acceleration".
Restart Antigravity.

Infinite Loading/Generating Issues
⏳
Antigravity Stuck on "Generating..." or "Working..."
Agent shows infinite loading with no response or progress
Symptoms: The agent displays "Generating...", "Working...", or "Loading..." indefinitely without producing any output or completing the task. This is one of the most common issues users encounter.

Understanding Why This Happens
Antigravity is a tool-based AI agent built by Google DeepMind. Unlike simple chatbots, Antigravity executes actions using specialized tools (like view_file, run_command, browser_subagent, etc.). When users see infinite loading, it typically means one of these tools hasn't returned a response, blocking the entire execution flow.

Common Technical Causes:

Tool Execution Timeout: A command or tool call is waiting for input, hanging, or taking too long to complete (e.g., running npm install without the -y flag).
Browser Subagent Stuck: The browser automation tool spawned by Antigravity hasn't returned due to page loading issues, JavaScript errors, or navigation problems.
Background Command Not Monitored: A command was sent to the background but Antigravity isn't properly checking its status.
Parallel Tool Deadlock: Multiple tools were called in parallel, and one is blocking the others from completing.
Token Budget Exhaustion: The conversation has used too many tokens (Antigravity has a 200,000 token budget), causing slow processing or hanging.
Network/API Issues: Communication between the UI and Antigravity's backend has failed or timed out.
Solution 1: Cancel the Current Operation (Primary Fix)
Success Rate: ~80% of infinite loading cases are resolved by canceling the stuck operation.

Look for a Cancel/Stop button in the Antigravity interface (usually near the "Generating..." message or in the agent panel).
Click Cancel to send a termination signal to the execution thread.
Wait 5-10 seconds for the cancellation to process and the agent to return to idle state.
Try a simpler request to verify the agent is responsive (e.g., "What files are in the current directory?").
Why this works: Canceling sends a termination signal that stops Antigravity from waiting for blocked tools, cleans up the execution state, and returns control to the user.

Solution 2: Check for Hanging Background Processes
If Antigravity started terminal commands or browser sessions, they might be waiting for user input or stuck in an error state.

Check the Terminal panel in Antigravity for any commands that are waiting for input (password prompts, confirmations, etc.).
Look for browser windows that Antigravity opened - they might be stuck on a loading page or showing an error.
Close browser windows that appear stuck or frozen.
Terminate hanging commands in the terminal if you see any waiting for input.
Cancel the agent operation after cleaning up these processes.
Solution 3: Refresh or Restart the Antigravity Interface
If canceling doesn't work, the UI connection might be broken.

Save any important work in your editor first.
Close the Antigravity panel/window completely (not just minimizing it).
Wait 10-15 seconds for the session to fully terminate.
Reopen Antigravity from your IDE/editor.
Test with a simple request to verify it's working (e.g., "Hello" or "List files").
Solution 4: Start a New Conversation
If the issue persists, the conversation might have accumulated too much context or hit token limits.

Cancel the current operation if it's still running.
Start a new conversation in Antigravity (look for "New Chat" or similar option).
Rephrase your request more simply and specifically.
Break down complex tasks into smaller, individual steps.
Why this works: Antigravity has a 200,000 token budget per conversation. Very long conversations with many file views or tool calls can approach this limit, causing slowdowns or hangs. A fresh conversation resets the token count.

Solution 5: Simplify Your Request
Complex or open-ended requests are more likely to cause hangs because they require many tool calls.

High-Risk Requests (Likely to Hang):

"Build and deploy the entire application"
"Run all tests and fix any failures"
"Search the entire codebase for X and refactor everything"
"Open browser and complete the entire checkout flow"
"Install all dependencies and configure everything"
Better Alternatives (Less Likely to Hang):

"Create a new React component called UserProfile"
"Fix the syntax error in src/app/page.tsx"
"Show me the contents of the package.json file"
"Run npm run build and show me the output"
"Add error handling to the login function"
Solution 6: Check Network Connection
Network issues can cause Antigravity's responses to fail to reach the UI.

Verify internet connectivity by opening a website in your browser.
Check if you're behind a firewall or VPN that might be blocking Antigravity's API calls.
Wait 1-2 minutes if you suspect a temporary network issue.
Cancel and retry the request after confirming network stability.
Solution 7: Restart Antigravity Completely
If none of the above solutions work, a full restart clears all state.

Save all your work in the editor.
Close Antigravity completely (Cmd+Q on macOS, File > Exit on Windows).
Wait 30 seconds for all processes to terminate.
Relaunch Antigravity and open your project.
Start a new conversation and test with a simple request.
Solution 8: Disable Planning Mode
Planning Mode can sometimes cause longer processing times or hangs, especially with complex requests.

Check if Planning Mode is active - Look for indicators in the Antigravity interface showing planning is enabled.
Disable Planning Mode in Settings or by toggling it off in the agent panel.
Avoid using /plan command if you're experiencing frequent hangs.
Try your request again without planning mode enabled.
Why this works: Planning Mode adds an extra layer of processing where Antigravity creates a plan before executing. This can increase the number of tool calls and processing time, potentially leading to timeouts or hangs on complex tasks.

Solution 9: Switch to a Different AI Model
Different AI models have different performance characteristics and availability. Switching models can resolve hangs caused by model-specific issues.

Click the model selector in the bottom-right corner of the Antigravity interface.
Try switching models:
If using Gemini 3 Pro (High), switch to Gemini 3 Pro (Low)
If using Claude Sonnet 4.5 (Thinking), try Claude Sonnet 4.5 for faster responses
Try alternating between Gemini and Claude models to find the most stable option
Generally, "Low" or non-"Thinking" variants are faster and less prone to hangs
Cancel the stuck operation first, then switch models.
Retry your request with the new model.
Why this works: Higher-tier models (like Gemini 3 Pro High or Claude Sonnet 4.5 Thinking) may experience more demand and rate limiting. Lower-tier or standard models often have better availability and faster response times, reducing the chance of hangs.

Solution 10: Use a Different Google Account (Token Reset)
If you've hit token limits or quota restrictions, signing in with a different Google account provides a fresh token budget.

Sign out of Antigravity (Settings > Account > Sign Out).
Close Antigravity completely and wait 30 seconds.
Relaunch Antigravity and sign in with a different Gmail account that has access to Antigravity.
Open your project and try your request again.
Why this works: Each Google account has its own token budget (200,000 tokens per conversation) and quota limits. Switching accounts gives you a fresh allocation, which can resolve issues caused by token exhaustion or rate limiting on your primary account.

Note: Make sure the alternate Google account is also eligible for Antigravity (in a supported region). You can switch back to your primary account once the issue is resolved or after waiting for quota refresh.

Prevention: Best Practices to Avoid Infinite Loading
Break down complex tasks into smaller, specific steps instead of one large request.
Be specific and clear in your prompts (include file names, exact changes needed, etc.). Learn more about writing effective prompts with custom rules.
Avoid open-ended requests that require many iterations or tool calls.
Monitor terminal output when Antigravity runs commands to catch hanging processes early.
Close unnecessary browser tabs/windows before using browser automation features.
Cancel early if you see no progress after 30-60 seconds.
Keep conversations focused - start a new chat for unrelated tasks instead of continuing a very long conversation.
Update Antigravity regularly to get bug fixes and performance improvements. Check the download page for the latest version.
Advanced: Understanding Antigravity's Execution Flow
For users who want to understand the technical details, here's how Antigravity processes requests:

User sends a request → Antigravity's AI brain (LLM) receives it.
Antigravity decides which tools to call → It might call view_file, run_command, browser_subagent, etc.
Tools execute → Each tool performs its action (reading files, running commands, controlling browser).
Antigravity receives tool results → It analyzes the results to determine next steps.
Antigravity formulates response → It generates a response based on tool results.
User sees the response → The UI displays the output and any file changes.
Where it gets stuck: If any tool in step 3 doesn't return (command waiting for input, browser stuck loading, file operation hanging), Antigravity remains blocked at that step, causing the infinite "Generating..." state. Canceling sends a termination signal that breaks this waiting state.

When to Report an Issue
If the infinite loading persists after trying all solutions above, it may be a bug. Report it to Antigravity support with:

What you were trying to do (exact prompt or task).
When it got stuck (immediately, after a few seconds, etc.).
Any error messages in the Antigravity logs (View > Output > Antigravity Agent).
Your environment (OS, IDE version, Antigravity version).
Whether canceling worked or if you had to restart completely.
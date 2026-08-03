# Playwright & Agentic AI: Building Autonomous Test Frameworks

This course is hosted on [Test Automation University (TAU)](https://testautomationu.applitools.com/) — free test automation courses with videos, transcripts, quizzes, credits, ranks, badges, and certificates!

Playwright + TypeScript end-to-end test automation suite for [ui.rexjones2.com](https://ui.rexjones2.com/login), built around an **agentic AI** workflow (Claude Code skills and GitHub agent definitions) that plans, generates, and heals tests, with a two-way integration into **Inflectra SpiraPlan** for requirements and test-run tracking.

SpiraPlan is used here as a representative Application Lifecycle Management (ALM) tool for demonstration purposes — the same Model Context Protocol (MCP) architecture works equally well with GitHub Issues, Jira, or Azure DevOps.

## Tech stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Chromium (see [playwright.config.ts](playwright.config.ts))
- Model Context Protocol (MCP) servers for agentic tooling
- Inflectra SpiraPlan (ALM / requirements & test management)

## Project structure

```
page_objects/    Page Object Model classes (LoginPage, HomePage, RegistrationPage, AddBookPage)
tests/           Playwright specs — login, registration_form, add_book, plus example/seed specs
specs/           Test plans (markdown) produced by the planning workflow
.github/agents/  Agent definitions: playwright-test-planner, -generator, -healer
.claude/skills/  Claude Code skills, including playwright-cli and core POM/API/assertion skills
.vscode/mcp.json MCP server configuration for VS Code
```

## Setup

```bash
npm install
npx playwright install
```

## Running tests

```bash
npx playwright test          # run the suite
npx playwright show-report   # view the last HTML report
```

## ALM Integration Setup

> **Note:** Setting up a SpiraPlan account is optional. You can follow along with the video demonstrations without creating a trial account.

This project integrates with [Inflectra SpiraPlan](https://www.inflectra.com/SpiraPlan/) via the `mcp-server-spira` MCP server, so an agent can read/write requirements, test cases, and test runs directly. [SpiraPlan](https://www.inflectra.com/Products/SpiraPlan/) also maintains a requirements traceability matrix linking requirements to their test coverage, defects, and releases, which the MCP server can query for coverage and status reporting.

### 1. Install the package and dependencies

Requires Python 3.12, and explicitly includes the FastMCP CLI modules to avoid missing-subpackage errors:

```bash
py -3.12 -m pip install "mcp<2.0.0" fastmcp mcp-server-spira
```

### 2. Register the server with the Claude CLI

```powershell
$json = @'
{
  "command": "py",
  "args": ["-3.12", "-m", "mcp_server_spira"],
  "env": {
    "INFLECTRA_SPIRA_BASE_URL": "YOUR_URL",
    "INFLECTRA_SPIRA_USERNAME": "YOUR_USER",
    "INFLECTRA_SPIRA_API_KEY": "YOUR_KEY"
  }
}
'@
claude mcp add-json inflectra-spira $json
```

### 3. Verify the connection

```powershell
claude mcp list
```

### 4. Configure the VS Code MCP extension

Open the Command Palette (`Ctrl+Shift+P`) → **MCP: Edit Configuration**, then merge in the `playwright` and `inflectra-spira` servers (this repo's [.vscode/mcp.json](.vscode/mcp.json) already includes `playwright-test` and `playwright`):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "inflectra-spira": {
      "command": "py",
      "args": ["-3.12", "-m", "mcp_server_spira"],
      "env": {
        "INFLECTRA_SPIRA_BASE_URL": "YOUR_URL",
        "INFLECTRA_SPIRA_USERNAME": "YOUR_USER",
        "INFLECTRA_SPIRA_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

Find your Python executable path with `py -3.12 -c "import sys; print(sys.executable)"` if you need it, and remember to double-escape backslashes (`\\`) in JSON paths.

> **Security note:** `YOUR_URL`, `YOUR_USER`, and `YOUR_KEY` are placeholders. Fill in your own SpiraPlan instance credentials **locally only** — never commit real values to source control.

## Playwright MCP vs. Playwright Test MCP vs. Playwright CLI

This project can be driven by three different Playwright-related tools. They overlap in capability but serve different purposes:

| Tool | What it is | Best for |
|---|---|---|
| **Playwright MCP** (`@playwright/mcp`) | General-purpose browser-automation MCP server. Drives any browser via accessibility-tree snapshots (click, type, navigate, screenshot), independent of any test framework. | Ad-hoc browsing/automation tasks not tied to this project's test suite. |
| **Playwright Test MCP** (`npx playwright run-test-mcp-server`, pre-configured in `.vscode/mcp.json`, installed via VS Code) | Exposes this project's actual Playwright test runner over MCP. Ships with 3 dedicated agents — [playwright-test-planner](.github/agents/playwright-test-planner.agent.md), [-generator](.github/agents/playwright-test-generator.agent.md), and [-healer](.github/agents/playwright-test-healer.agent.md) — to **plan**, **generate**, and **heal** tests, with awareness of this codebase's existing page objects and specs. | Working directly on `tests/*.spec.ts` in this repo — generating new coverage or fixing failures. |
| **Playwright CLI** ([.claude/skills/playwright-cli](.claude/skills/playwright-cli/)) | A Claude Code skill (not an MCP server) that gives direct terminal-style browser commands. Built for token efficiency (`--raw` output, depth-limited/searchable snapshots, mobile emulation for lighter pages), and can perform much the same browser-automation operations as Playwright MCP — plus, via its own documented plan → generate → heal workflow, much of what Playwright Test MCP's agents do, driven manually through skill instructions rather than dedicated bundled agents. | Interactive, token-conscious browser automation and test authoring inside a Claude Code session. |

## Connect

- LinkedIn: [linkedin.com/in/rexjones34](https://www.linkedin.com/in/rexjones34/)
- YouTube: [@RexJonesII](https://www.youtube.com/@RexJonesII)
- Facebook: [facebook.com/JonesRexII](https://www.facebook.com/JonesRexII)
- Test Application: [ui.rexjones2.com/](https://ui.rexjones2.com/)
- Website: [rexjones2.com/](https://www.rexjones2.com/)

## License

MIT — see [LICENSE](LICENSE).

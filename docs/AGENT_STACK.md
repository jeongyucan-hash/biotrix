# BIOTRIX Agent Stack

This branch bootstraps the external agent stack requested for BIOTRIX HQ.

## Layers

- Design judgment: Emil Kowalski Skills, Taste Skill, Impeccable
- Visual workspaces: Canva, Figma
- Browser/visual QA: Playwright MCP, Browser Use
- Memory/context: AgentMemory, OpenViking
- Diagrams: Diagram Design
- Scientific domain skills: Scientific Agent Skills
- Security domain skills: Anthropic Cybersecurity Skills
- Harness references: Awesome Harness Engineering
- Model/API layer: NVIDIA NIM/API via `NVIDIA_API_KEY`
- Media: Runway

## Windows bootstrap

From the repository root in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-agent-stack.ps1
```

The script intentionally continues after individual failures so the complete stack can be attempted in one pass. Read all warnings at the end.

## Secrets

Never commit API keys. Use `.env.local` only for local development and keep it ignored. Production secrets belong in the deployment provider. GitHub Actions secrets are only needed when Actions themselves call the provider.

Expected server-only environment variable:

```
NVIDIA_API_KEY=
```

## Validation

Installation is not considered complete until each layer is callable:

1. `npx impeccable detect` runs and Codex approves the Impeccable hook.
2. `codex mcp list` shows Playwright.
3. Browser Use can open a test page.
4. AgentMemory demo/recall succeeds.
5. `openviking-server doctor` passes.
6. Installed skills are visible to the active agent host.
7. Canva/Figma/Runway connector status is confirmed independently.
8. NVIDIA NIM is tested with a newly issued key; never reuse a key exposed in chat or source control.

## Known constraints

- AgentMemory native Windows currently requires its pinned iii-engine executable; WSL2/Docker are supported alternatives.
- OpenViking requires Python 3.10+ plus model/embedding configuration.
- Impeccable has had recent installer regressions; use the latest installer and verify generated skill/hook files rather than trusting exit code alone.
- Account connectors cannot be installed by a repository bootstrap script.

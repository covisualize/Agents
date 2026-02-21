# Agents

AI-agent skills, configuration, and a small Node.js monorepo for solo-founder project ideas.

## Repository layout

```text
.agents/          # Repo-local skill notes (convenience copies)
.claude/
  Claude.md       # Workflow rules & model-routing guidance
  skills/         # Oz-discoverable skills (claude-code)
.codex/
  skills/         # Oz-discoverable skills (codex, firecrawl, ta-screener, …)
.copilot/
  skills/         # GitHub Copilot agent skills
Ideas/            # npm-workspaces monorepo (Node.js, ESM)
  packages/
    shared-core/  # Shared authz / billing / idempotency / audit modules
  projects/
    blueprints/           # Design docs & acceptance criteria
    certified-payroll/    # B2B SaaS — certified-payroll service
    pickleball-directory/ # Directory / SEO site
```

## Quick start

```powershell
# Install dependencies (from Ideas/)
npm install --prefix Ideas

# Run all tests
npm test --prefix Ideas

# Start services
npm run start:payroll  --prefix Ideas
npm run start:directory --prefix Ideas
```

See [`Ideas/README.md`](Ideas/README.md) for project-specific details.

## Launching Oz skills

Oz can run a skill as the base prompt for a cloud agent:

```powershell
# Claude Code skill — general coding assistant
oz agent run --skill claude-code --cwd . --prompt "<task description>"

# Codex skill — focused, minimal-diff changes
oz agent run --skill codex --cwd . --prompt "<task description>"
```

## License

Private — not licensed for redistribution.

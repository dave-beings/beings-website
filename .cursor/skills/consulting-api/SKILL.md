---
name: consulting-api
description: "Fast stateless API call to Gemini/Claude/GPT for code generation, logic checks, syntax verification, and cross-model validation. Costs API tokens. Use second-opinion for live web search, red-team-gemini-loop for adversarial review."
---

# LLM API Consultation (v3.0)

Stateless, single-turn API bridge for cross-model consultation. Designed to be called programmatically by AI agents in Cursor IDE — not an interactive chat client.

## Contract

### Inputs

| Flag | Required | Description |
|------|----------|-------------|
| `--send "prompt"` | Yes* | Inline prompt |
| `--file path` | Yes* | Read prompt from file (use for large context — avoids shell escaping) |
| `--provider name` | No | `google` (default), `anthropic`, `azure`, `openai` |
| `--model name` | No | Override default model. Auto-detects provider from model name. |
| `--system "text"` | No | System prompt / role context |
| `--image path` | No | Attach image (repeatable). All providers support vision. |
| `--max-tokens N` | No | Max output tokens (default: 8192, max: 65536 for Gemini 3.1 Pro) |
| `--thinking level` | No | `low` (default for 3.x), `medium`, `high` — Gemini 3.x only. See Thinking Levels. |
| `--json` | No | Output JSON envelope instead of plain text |
| `--json-schema path` | No | Structured output matching schema file (implies `--json`) |
| `--grounded section` | No | Auto-prepend grounding block from llms.txt section (e.g. "System Reference", "Concepts") |
| `--list` | — | List providers and models, then exit |

*One of `--send` or `--file` is required.

### Outputs

| Channel | Default mode | `--json` / `--json-schema` mode |
|---------|-------------|-------------------------------|
| **stdout** | Response text only | JSON envelope (see below) |
| **stderr** | Diagnostics, heartbeat dots, reasoning summaries | Same |

**JSON envelope shape:**
```json
{
  "response": "text or structured object",
  "model": "gemini-3.1-pro-preview",
  "provider": "google",
  "latencyMs": 2172,
  "usage": { "inputTokens": 12, "outputTokens": 73, "totalTokens": 85 },
  "finishReason": "stop",
  "reasoning": "optional thinking summary"
}
```

Key fields for agents:
- `finishReason`: `"stop"` = complete, `"length"` = truncated (increase `--max-tokens` or request continuation)
- `usage`: Token counts for budget tracking. Shape varies by provider but always includes totals.
- `reasoning`: Present only when `--thinking` is used with Google models.

### Exit Codes

| Code | Meaning | Agent action |
|------|---------|-------------|
| 0 | Success | Proceed |
| 1 | Bad input (missing args, file not found) | Fix arguments, don't retry |
| 2 | Auth error (missing/invalid API key) | Alert user — check Infisical injection |
| 3 | Rate limit or timeout | Retry after backoff |
| 4 | Context window exceeded | Truncate prompt, retry |
| 5 | Safety/content filter | Rewrite prompt or abort |
| 6 | Schema validation failed | Simplify schema |
| 7 | Unknown error | Do not retry — investigate and alert user |

## Providers

| Key | Name | Default Model | Env Vars |
|-----|------|---------------|----------|
| `google` | Google Gemini | `gemini-3.1-pro-preview` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| `anthropic` | Anthropic Claude | `claude-sonnet-4-5-20250929` | `ANTHROPIC_API_KEY` |
| `azure` | Azure OpenAI (UK South) | `gpt-4o` | `AZURE_RESOURCE_NAME`, `AZURE_API_KEY` |
| `openai` | OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY` |

Run `--list` for current models. Keys injected via Infisical (`infisical run --env=dev`).

## Thinking Levels (Gemini 3.x only)

Gemini 3.x models are reasoning models — they always think internally. The `--thinking` flag controls the reasoning budget and exposes the reasoning log. **If omitted, consult.ts defaults to `low` for Gemini 3.x to prevent silent cost blowout.** Gemini 2.5 models use a different API parameter and are not affected.

### Level Guide

| Level | Cost (tokens) | Latency | Use when |
|-------|--------------|---------|----------|
| `low` (default) | ~3K total | ~30-40s | Summarising, formatting, simple code, CRUD, bash commands, simple Q&A |
| `medium` | ~5-6K total | ~60s | Multi-file orchestration, code review, standard refactors, planning sequences |
| `high` | ~20-25K total | ~3-5min | Strict constraints, complex algorithms, advanced type inference, architectural bugs |

**CRITICAL: Never omit `--thinking` for Gemini 3.x models.** The API defaults to uncapped HIGH internally, costing 20K+ tokens with zero reasoning visibility. consult.ts protects against this by defaulting to `low`.

### Level Characteristics

- **`low`** = dumb and fast. Grabs memorised patterns, no deep reasoning. Will take shortcuts on hard problems (e.g. using `any` casts). Perfect for high-throughput simple tasks.
- **`medium`** = the orchestration level. Enough budget to hold multi-file context and plan standard refactors. Fails on strict negative constraints ("do NOT use X") — it starts the hard path but can't finish, falling back to shortcuts. Use for breadth, not depth.
- **`high`** = deep reasoning. The model argues with itself, backtracks, and self-corrects. The only level that reliably follows strict negative constraints. Costs 6-7x more than `low` — use deliberately.

### Decision Heuristic for Agents

Before calling consult.ts with a Gemini 3.x model, check:

1. Does the task involve **strict negative constraints** ("must not use X", "forbidden from using Y")? → `--thinking high`
2. Does it require **complex type inference**, recursive generics, or advanced algorithms? → `--thinking high`
3. Are you processing **multi-step sequences**, reviewing multiple files, or planning a refactor? → `--thinking medium`
4. Is it a **standard single-step task** (summarise, format, generate straightforward code)? → `--thinking low` (or omit flag)

When in doubt, start with `low`. If the response is shallow or takes shortcuts, retry with `high`. Use `medium` for orchestration tasks where context breadth matters more than constraint depth.

## Agentic Usage Patterns

### Basic consultation
```bash
npx tsx consult.ts --send "Review this error and suggest a fix: [error text]"
```

### Large context via file (avoids shell escaping)
```bash
# Agent writes context to temp file, then passes it
npx tsx consult.ts --file /tmp/context.md --system "You are an adversarial code reviewer"
```

### Structured output for programmatic use
```bash
npx tsx consult.ts --send "Compare options A and B" --json-schema ./comparison-schema.json
```

### Cross-model validation
```bash
# Get a second opinion from a different model family
npx tsx consult.ts --send "Is this approach correct? [details]" --provider anthropic --json
```

### Grounded consultation (beings only)
```bash
npx tsx consult.ts --grounded "System Reference" --send "Review this sync logic for vulnerabilities"
```

### Deep reasoning for complex problems
```bash
npx tsx consult.ts --send "Find the bug in this algorithm" --thinking high --max-tokens 16000
```

## Limitations

- **No live web search.** API models cannot browse. Use Gemini Web UI for current data.
- **Stateless.** Each call starts fresh. The calling agent manages context.
- **Shell string limits.** Use `--file` for prompts over ~50 lines to avoid escaping issues and ARG_MAX.
- **Thinking is Google-only.** `--thinking` is silently ignored for other providers.
- **Schema adherence varies.** Complex nested schemas may fail with some models. Start simple.

## Setup

1. `pnpm install` in workspace root
2. API keys via Infisical: `infisical run --env=dev --domain https://eu.infisical.com -- npx tsx consult.ts --list`
3. Or set keys in `.env.local` at project root as fallback

## References

- `scripts/consult.ts` — The bridge script
- `references/providers.md` — Provider details and env vars
- `references/prompt-templates.md` — Adversarial prompt templates for agentic use

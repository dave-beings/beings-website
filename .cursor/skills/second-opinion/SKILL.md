---
name: second-opinion
description: "Gemini Web UI consultation with live Google Search for architecture validation, freshness checks, and sovereign audits. Single-turn sounding board. Use consulting-api for fast code checks, red-team-gemini-loop for adversarial review loops."
---

# Second Opinion — The Auditor

You are **The Architect (Opus)**. This skill summons **The Auditor** — Gemini via the Web UI with live Google Search.

Use this for **single consultations**: one question, one answer, synthesis. For multi-turn adversarial loops that iterate to PASS/FAIL, use `red-team-gemini-loop` instead.

See `30-agentic-build-loop.mdc` for the full routing table (Consultant vs Auditor). For fast, stateless API checks, use `consulting-api` instead.

## When to Use (vs Alternatives)

| Need | Tool | Transport |
|------|------|-----------|
| Quick code check, logic validation | `consulting-api` | API (stateless, fast) |
| Architecture validation, freshness check, sovereign audit | **This skill** | Gemini Web UI (live search) |
| Multi-turn adversarial review with PASS/FAIL verdict | `red-team-gemini-loop` | Gemini Web UI (bounded loop) |

## Escalation Triggers

| Trigger | Example |
|---------|---------|
| **Explicit user request** | "Second opinion", "validate this", "check with Gemini" |
| **Circular logic** | Stuck on the same bug for 3+ attempts |
| **Cutoff risk** | APIs or libraries changed after late 2025 |
| **Sovereign audit** | Any data egress code (mandatory under DUAA 2025) |
| **Google ecosystem** | GCP, Go, Android, Angular, Chrome Extensions |
| **Architecture question** | "Will this scale?" or "What did I miss?" |

## Skip Gemini (Opus Handles These)

- Standard code review, internal refactoring, variable renaming
- Context-heavy debugging (50+ local files — Opus's native access is faster)
- Creative/stylistic decisions (causes style clash, not useful)
- Standard boilerplate (nothing to catch)

## Anti-Patterns

| Anti-Pattern | Instead Do |
|--------------|------------|
| "Is this good?" (triggers agreement) | "What is wrong with this?" |
| Style debates | Accept Opus's style choices |
| Missing context | Include all relevant files/types |
| Vague "review this" | Use adversarial templates |

**Never** frame as validation ("Opus thinks X, agree?"). Frame as adversarial ("Find the bug", "Why will this fail?").

## Workflow

### 1. Prime New Threads

For new Gemini threads, send a project primer first (e.g. `AGENTS.md` or
`docs/architecture.md`) so Gemini has shared context:

```bash
npx tsx .cursor/skills/_shared/gemini-bridge.ts --file AGENTS.md --thread CHAT_ID
```

Only needed once per thread.

### 2. Generate Grounding Block

Gemini cannot see the codebase. Use the Context Packer:

```bash
npx tsx .cursor/skills/_shared/context-packer.ts --domain architecture
npx tsx .cursor/skills/_shared/context-packer.ts --domain security
npx tsx .cursor/skills/_shared/context-packer.ts --list  # all domains
```

The Context Packer reads from committed files. Include any uncommitted code manually in the prompt body.

### 3. Formulate the Prompt

- Prepend the grounding block
- Inline relevant interfaces/types (don't dump entire type files)
- Replace real secrets with placeholders (`SK_XXXX`)
- Prefix with `[FROM CURSOR - VALIDATION REQUEST]`

### 4. Execute Bridge

```bash
# Always use --thread to target the right conversation
npx tsx .cursor/skills/_shared/gemini-bridge.ts --send "YOUR_PROMPT" --thread CHAT_ID
npx tsx .cursor/skills/_shared/gemini-bridge.ts --file ./prompt.txt --thread CHAT_ID
npx tsx .cursor/skills/_shared/gemini-bridge.ts --read --thread CHAT_ID
```

### 5. Synthesise

Analyse Gemini's response against your own judgment:

- **Fact check:** Did Gemini catch a hallucination or deprecated API?
- **Tradeoff analysis:** Is the alternative *better* or just *different*?
- **Deadlock:** If you strongly disagree, don't blindly yield — verify via web search.

If Gemini says "NO ISSUES FOUND" — that's signal too. Move forward.

### 6. Verify Assumptions

If Gemini listed "ASSUMPTIONS MADE": check each against your codebase knowledge. False assumptions invalidate the advice.

### 7. Present Results

```
### Second Opinion Results (The Auditor)

**The Consensus:** [What you both agree on]

**The Debate:**
- **Opus (Me):** I suggested X because [Reason].
- **Gemini:** Suggests Y because [Reason].

**Verdict:** [Unified recommendation]
```

## Prompt Templates

### Sovereign Audit
```
[FROM CURSOR - SOVEREIGN AUDIT]
Audit the following data egress logic against UK DUAA 2025 strict purpose limitation.
Flag any reusable consent risks.
[Grounding Block]
[Code]
```

### Red Team Architecture
```
[FROM CURSOR - RED TEAM]
Act as a hostile senior engineer. Destroy this proposed architecture.
Find race conditions, state desync risks, and edge cases Opus missed.
[Grounding Block]
[Code/Design]
```

### Freshness Check
```
[FROM CURSOR - FRESHNESS CHECK]
Check the current status of [API/Library].
Have there been breaking changes or deprecations between late 2025 and now?
Verify against live documentation.
```

## Security & Privacy

This skill uses the Gemini **Web UI**, not the Vertex API. Google may use inputs for training.

**Safe to send:** Public architectural patterns, invariant IDs, code with secrets replaced, generic type definitions.

**NOT safe to send:** Proprietary algorithms, real API keys, customer data/PII, trade secrets.

## Session Strategy

- **Same session** for related topics (design → implement → debug in same domain)
- **New session** when the domain language changes
- Do NOT trigger automatically unless user explicitly requested it

## Prerequisites

- Chrome running with `--remote-debugging-port=9222`
- Gemini tab open and signed in

## Error Handling

| Error | Response |
|-------|----------|
| Timeout (>90s) | Try `--read` to check status |
| Connection refused | Is Chrome running with `--remote-debugging-port=9222`? |
| No Gemini tab | Open gemini.google.com in Chrome first |
| Send button disabled | Text insertion may have failed — retry |

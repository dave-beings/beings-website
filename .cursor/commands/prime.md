---
description: "Prime a fresh Gemini thread with marketing-site architecture context, optionally scoped to a spec"
---

# /prime — Gemini Thread Primer (beings-website)

Start a fresh Gemini conversation primed with the marketing-site architecture
and triad framing. Optionally scope the session to a specific planning spec.

## Invocation

- `/prime` — general-purpose prime with the full architecture payload.
- `/prime 0001` — scoped prime for a specific spec
  (`planning/0001-*.xml`). Recommended for build sessions.

## Pre-flight

1. Build a fresh payload by concatenating `llms.txt` + `docs/architecture.md`
   (plus the scoped spec when `/prime <N>` is used).
2. `git status` — warn (do not block) if the working tree has uncommitted
   changes.
3. If a `planning/<N>*.xml` glob matches more than one file, list them and
   confirm with the user before proceeding.

## Payload Selection

### Scoped mode (`/prime <N>`)

Build a focused payload that pins Gemini's attention to one spec:

```bash
cat llms.txt docs/architecture.md \
    planning/<N>*.xml \
    > /tmp/<N>-prime-payload.txt
```

Confirm the matched spec file with the user. Warn if the resulting payload
exceeds 500 KB — large payloads dilute Gemini's focus.

### General mode (`/prime`)

Use the full architecture context — `llms.txt` plus `docs/architecture.md`
plus every active spec in `planning/`:

```bash
cat llms.txt docs/architecture.md planning/*.xml \
    > /tmp/prime-payload.txt
```

## Execution

Transport defaults to the Gemini CLI. Set `GEMINI_TRANSPORT=bridge` to use the
CDP bridge instead.

### CLI transport (default)

```bash
cat /tmp/<N>-prime-payload.txt | gemini \
  -p "[FROM CURSOR]

The attached file contains the full architecture context for the Beings
marketing site: an Astro 5 SSG public marketing site (project name
'beings-marketing'), React 19 used only as interactive islands, Tailwind
CSS 4 styling driven by brand tokens in src/styles/brand-tokens.css, hosted
on Cloudflare Pages at https://website.beings.com. The site uses the
'Canvas + Card' visual language so it looks and feels like the Beings
product itself.

SCOPE: This session is about spec <N> — <spec title>.

WORKING RELATIONSHIP:
- Dave (human, founder): brand vision, product positioning, final decisions.
- Gemini (you): Lead Architect — architecture, design, and trade-off analysis.
- Cursor/Composer-2 (sending this message): implementation, frontend craft,
  shipping pixel-perfect accessible HTML.

GEMINI CODE BOUNDARY:
You write blueprints, not patches.
Allowed: component interfaces, TypeScript type signatures, Astro page
structure outlines, Tailwind class composition examples, accessibility
patterns (ARIA, focus management, keyboard interactions), brand-token
usage examples, layout/grid sketches in pseudocode.
Not allowed: drop-in component files, complete .astro or .tsx files meant
to be copy-pasted, full CSS rule sets meant to replace existing styles.

Review the attached spec(s). Summarise the scope in your own words,
confirm readiness, and flag any concerns — especially around brand-token
discipline, performance budget (Lighthouse 95+), accessibility, or the
static-by-default constraint." \
  --approval-mode plan \
  -m gemini-3.1-pro-preview \
  -o text
```

### Bridge transport (`GEMINI_TRANSPORT=bridge`)

```bash
npx tsx .cursor/skills/_shared/gemini-bridge.ts \
  --new-thread \
  --label "<N>-prime" \
  --attach /tmp/<N>-prime-payload.txt \
  "<same prompt as above>"
```

## Post-flight

1. Display Gemini's response in the chat.
2. Report the session identifier so the user can resume the thread:
   - **CLI transport** — print the session file path that the Gemini CLI
     prints on completion.
   - **Bridge transport** — print the thread ID returned by
     `gemini-bridge.ts`.
3. If `/build` runs next, it layers its own protocol on top of this primed
   thread — no need to re-prime.

## Notes

- The marketing site is a **GREEN workspace**. There is no PII in this
  repo; Gemini may receive the full payload without redaction.
- The marketing site is **static by default**. If Gemini proposes SSR,
  a CMS, or a backend, treat that as a signal to revisit the PRD
  (`docs/bw-prd-01-rebrand.xml`), not to silently introduce the capability.
- The brand tokens in `src/styles/brand-tokens.css` are mirrored from the
  product workspace. Token changes require coordination, not unilateral
  edits.

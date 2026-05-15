---
name: red-team-gemini-loop
description: "Bounded adversarial Gemini review loop (max 10 turns) with BLOCKERS/HIGH-RISK/PASS/FAIL verdicts. Use ONLY at end of feature builds or for security/architecture audits. Use second-opinion for single questions, consulting-api for code checks."
---

# Red Team Gemini Loop

Multi-turn adversarial review that iterates to a verdict. Use when you need Gemini to review code or architecture changes with explicit PASS/FAIL outcomes and a bounded turn cap.

**Boundary:** This skill runs a structured loop (send artifacts → get verdict → fix → resubmit). For single-turn questions ("is this approach right?"), use `second-opinion` instead. For fast stateless API checks, use `consulting-api`.

## Core Contract

- Gemini is **The Auditor** in hostile review mode.
- Gemini has **no repository access**. It only sees what is pasted.
- Gemini must request missing context explicitly; no guessing.
- Default loop cap: **10 turns maximum**.

## Start Prompt (Protocol Lock)

Send this first:

```text
[FROM CURSOR - RED TEAM PROTOCOL]
You are The Auditor in red-team mode.
Rules:
1) You do NOT have local repo access.
2) If context is missing, ask explicitly for files/snippets/output.
3) Review for blockers and failure modes, not style.
4) We run a bounded loop with max 10 turns.
5) At cap, return final verdict with unresolved risks.
Return findings as:
- BLOCKERS
- HIGH-RISK
- MEDIUM
- PASS/FAIL
```

## Loop Algorithm

For each turn:

1. Paste full artifacts to Gemini: complete changed source file(s), test file(s), raw test output.
2. Ask for red-team review and explicit verdict.
3. Apply required fixes.
4. Repeat until one stop condition is met.

## Stop Conditions

- **PASS:** zero blockers and zero high-risk issues.
- **HALT:** Gemini says critical context is missing; gather and resend.
- **CAP REACHED (10):** stop debate and present unresolved risk matrix.

## Turn Message Template

```text
[REVIEW - TURN X OF 10]
Reminder: You do not have repo access; ask for anything missing.

Artifacts:
1) <full source file(s)>
2) <full test file(s)>
3) <raw test output>

Review every changed line in red-team mode.
Return: BLOCKERS, HIGH-RISK, MEDIUM, PASS/FAIL.
```

## Guardrails

- Do not claim Gemini validated unseen code.
- Do not proceed on partial snippets when transaction boundaries are relevant.
- Keep prompts free of secrets and PII.
- For RED workspaces, share only sanitised metadata and architecture-level context.

## Prerequisites

- Chrome running with `--remote-debugging-port=9222`
- Gemini tab open and signed in
- Use `--thread CHAT_ID` to target the correct conversation

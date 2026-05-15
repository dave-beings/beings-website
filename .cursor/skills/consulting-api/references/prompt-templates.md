# Prompt Templates for Agentic Consultation

Templates for cross-model consultation via `consult.ts`. Designed to be constructed programmatically by the calling agent. Use adversarial framing — never ask "is this good?", ask "what's wrong with this?"

## Code Review

```
You are an adversarial code reviewer. Find functional bugs, security flaws, or edge cases.

Rules:
- IGNORE style, formatting, and comments
- If the code is solid, respond ONLY with "NO ISSUES FOUND"
- If issues exist, list as [BUG], [SECURITY], [PERF]
- End with "ASSUMPTIONS MADE: [list]"

Code to review:
[code]
```

Best with: `--provider anthropic` or `--provider google`

## Architecture Red Team

```
Act as a hostile senior engineer. Destroy this proposed architecture.
Find race conditions, state desync risks, scaling bottlenecks, and edge cases.
Do NOT suggest alternatives unless asked — just find problems.

Architecture:
[design]
```

Best with: `--thinking high` for deep analysis

## Structured Comparison

```
Compare the following options. Return a structured analysis.

Options:
[A description]
[B description]

Consider: complexity, cost, maintainability, risk.
```

Best with: `--json-schema comparison.json` for parseable output

## Freshness Check

```
Check your knowledge of [API/Library/Service].
What is the latest version you know about?
What are the key breaking changes since [version]?
Are there known deprecations?

State your training cutoff clearly.
```

Note: API models cannot browse live docs. If the response hedges or cites old versions, escalate to Gemini Web UI which has live search.

## Type Safety Check

```
Simulate a TypeScript compiler. Will this code throw a compile error?
Respond: "COMPILES" or "ERROR at line X: [reason]"

Code:
[code]
```

Best with: `--provider anthropic` (strong at type reasoning)

## Summarise and Extract

```
Summarise the following content. Extract:
- Key decisions made
- Open questions
- Action items

Content:
[text]
```

Best with: `--json-schema` for structured extraction

## Anti-Patterns

| Don't | Why | Do instead |
|-------|-----|-----------|
| "Is this good?" | Models are biased to agree | "What is wrong with this?" |
| "Opus thinks X, agree?" | Triggers yes-man behaviour | "Find the flaw in this approach" |
| Missing context | Model hallucinates fixes for code it can't see | Include all relevant types and files |
| Vague prompts ("review this") | Produces style nitpicks | Use specific adversarial templates |
| Inline huge code in `--send` | Shell escaping breaks | Write to file, use `--file` |

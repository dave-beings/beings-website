# Auditor Prompt Templates

Use these patterns to get the highest quality output from Gemini.

**Key Principle:** Force structured output. Don't ask "what do you think?" — that produces platitudes.

## 1. The Adversarial Reviewer (Default Template)

Use this as the base for most validation requests. Forces actionable output.

```
You are an adversarial code reviewer. Your goal is to find functional bugs, security flaws, or edge cases in the following solution.

Rules:
- IGNORE style, formatting, and comments.
- Assume the user is an expert; do not explain basic concepts.
- If the code is solid, respond ONLY with "NO ISSUES FOUND".
- If issues exist, list them as bullet points starting with [BUG], [SECURITY], or [PERF].

CODE:
[Insert Code]
```

## 2. The "Red Team" Review (Security Focus)

Use when the user asks "Are you sure?" or "Validate this" on security-sensitive code.

```
Find 3 security vulnerabilities or race conditions in this code. Ignore style.

CODE:
[Insert Code]

Format: [CRITICAL], [HIGH], [MEDIUM] with one-line description.
```

## 3. The "Compiler Simulation" (Type Safety)

Use for TypeScript/type system validation.

```
Simulate a TypeScript compiler. Will this code throw a compile error? If so, where?

CODE:
[Insert Code]

Respond: "COMPILES" or "ERROR at line X: [reason]"
```

## 4. The "Devil's Advocate" (Architecture)

Use when comparing approaches or validating a decision.

```
Opus suggests [Architecture A].
Give me the strongest argument for why Architecture A will fail at scale, and why Architecture B would be better.
Be specific about failure modes and thresholds.
```

## 5. The "Lateral Thinking" (Ideation)

Use when the user asks for alternatives or feels stuck.

```
I need to solve [Problem Description].
My current constraint is [Constraint, e.g., "Must be serverless"].

Propose 2 radically different architectural approaches to solve this.
Focus on unique or modern patterns I might have missed.
Do not just repeat standard boilerplate.
```

## 6. The "Edge Case Hunter" (Testing)

Use when you need adversarial test inputs.

```
Generate 5 inputs that will break this parser/validator/function.
Focus on: null, empty, unicode, injection, overflow.

CODE:
[Insert Code]

Format: JSON array of test inputs with expected failure reason.
```

## 7. The "Library Check" (Anti-Hallucination)

Use when using obscure libraries or new APIs. Gemini has search access, so it can verify recent releases.

```
Verify this API usage for [Library Name] version [Version].
Does the method `[Method Name]` actually exist with this signature?

Code Snippet:
[Snippet]

Respond: "VALID" or "INVALID: [correct signature]"
```

## 8. Architecture Review (High Level)

Use for broad design questions.

```
Review this architectural decision:
[Description of Decision]

What are the scale/maintenance tradeoffs?
What would you do differently if you were building this from scratch today?

Be specific about failure thresholds (e.g., "breaks at 10k RPS").
```

## 9. The "Live-Doc Pinner" (Version/Migration Validation)

Use when validating code against recent library versions, breaking changes, or migration guides. Forces Gemini to read a specific documentation page as ground truth.

**Why this exists:** Opus's training data has a cutoff. Gemini can browse live docs but is lazy — it often returns generic search results. Pinning a URL forces it to read the exact page you need.

```
[FROM CURSOR - LIBRARY VALIDATION]

Using the documentation at:
[SPECIFIC_URL]

Validate this code for [Library/Framework] [Version] compatibility:

CODE:
[Insert Code]

Flag any:
- Deprecated patterns
- Removed/renamed APIs
- Required migration changes
- Breaking behavior differences

Respond: "COMPATIBLE" or list issues as [BREAKING], [DEPRECATED], [MIGRATION].
```

**Example URLs to pin:**

| Scenario | URL Pattern |
|----------|-------------|
| Next.js upgrade | `nextjs.org/docs/app/building-your-application/upgrading/version-15` |
| React 19 changes | `react.dev/blog/2024/12/05/react-19` |
| Chrome Extension MV3 | `developer.chrome.com/docs/extensions/develop/migrate` |
| AWS SDK v3 | `docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating.html` |
| Node.js deprecations | `nodejs.org/api/deprecations.html` |

**When NOT to use:**
- Stable, well-known APIs (Array.map doesn't need doc pinning)
- Auth-walled documentation (Gemini can't log in)
- Internal/proprietary docs (not publicly accessible)

---

## Gemini's Domain Strengths

Prefer Gemini over Opus for these domains:

| Domain | Why Gemini |
|--------|------------|
| Google Cloud (GCP) | Native ecosystem knowledge |
| Go (Golang) | Google-style idioms |
| Android/Kotlin | Platform expertise |
| Angular | Framework depth |
| Chrome Extensions | API accuracy |
| C++/Systems | Performance-oriented, Abseil-style |
| Recent APIs (< 12 months) | Search access, fresher cutoff |

---

## Prefix Convention

Always prefix prompts with identity marker:

```
[FROM CURSOR - VALIDATION REQUEST]

<your prompt here>
```

This maintains context in ongoing Gemini threads.

---

## Anti-Patterns (Avoid These)

| Prompt | Problem |
|--------|---------|
| "Review this code" | Too vague, produces nitpicks |
| "What do you think?" | Generic platitudes |
| "Is this good?" | Yes/no without actionable feedback |
| Long internal context | Gemini will hallucinate missing details |

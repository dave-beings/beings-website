# Beings Marketing Site — Architecture

> Narrative architecture for the public marketing site (`https://website.beings.com`).
> For the codebase routing map and section index, see `llms.txt` at the repo root.
> For the canonical component inventory and integration spec, see
> `docs/bw-prd-01-rebrand.xml`.

This document explains the **why** behind the technical decisions. The PRD
defines what to build; the rules define how to write the code; this document
explains the architecture those choices express.

---

## 1. North Star

The marketing site exists to make one promise believable:

> **Beings gives knowledge workers their time and attention back by doing
> digital chores privately, securely, and under their control — locally
> deployed, with zero-retention enterprise cloud for complex reasoning,
> never on a SaaS data-extraction model.**

Before the site asks a visitor for trust, it has to communicate three things:

1. **What chores Beings handles.** Email follow-up, calendar coordination,
   CRM cleanup, spreadsheet reconciliation, contract review, and Intelligent
   Document Processing (IDP) — the daily friction that drowns SMB and
   mid-market teams.
2. **Why local-first sovereignty matters.** Customer memory, context, and
   data live inside the customer's environment. Beings is locally deployed
   to that environment ("Air-Gapped Sovereignty"); nothing is exfiltrated
   to a vendor's training pipeline.
3. **Why we refuse the surveillance patterns common in workplace AI.** No
   employee scoring, no productivity dashboards for managers, no sentiment
   monitoring. Beings serves the worker first; the buyer's interest is met
   through measurable revenue, cost, and friction outcomes — not through
   monitoring people.

Visual fidelity to the product remains a tactic in service of that promise:
the site uses the same Canvas + Card language, the same sidebar rail, the
same typography, so that the experience feels like the product the moment
it loads. That fidelity supports the message; it is no longer the message.

Every architectural decision in this repo — brand-token sharing, the
dual-layout system, the static-by-default posture, the React-island
discipline — flows from the promise above.

---

## 2. Product Narrative Contract

> **Positioning status (May 2026, pre-workshop):** This contract reflects
> the working hypothesis as of May 2026, ahead of a positioning workshop
> with Beth Gladstone (marketing lead, w/c 25 May). Treat the narrative
> below as a v1 working draft. Expect a v2 narrative pass after the
> workshop — particularly around the lead message ("beyond the chatbot"
> framing, the "mapping operations" explainer, the offer ladder, and the
> qualifying motion). The architectural and trust-model commitments
> (sections 3 onward, especially §13 Sovereignty And Trust Model and §14
> Lines We Don't Cross) are settled and will not change in v2.

The site is allowed to make exactly the claims listed here. Anything outside
this contract requires a PRD revision and an update to
`beings-local/docs/vision.md` (the positioning source of truth for what the
product *is*; the PRD remains the source of truth for what the website
*ships*).

### What Beings Is

Beings is sovereign agent infrastructure that does **digital chores** and
**Intelligent Document Processing (IDP)** for SMB and mid-market teams.
The product runs locally inside the customer's environment and orchestrates
narrowly-scoped agentic workflows against the systems those teams already
use (email, calendars, CRM, spreadsheets, contract repositories, document
stores).

### Beyond The Chatbot

The most common misperception we will encounter is that Beings is "a better
chatbot." We have already seen this in the field: an enterprise prospect
(Steve at DCR) literally asked us for "a better chatbot," having watched a
chatbot fail at AZ. That request is the modal first reaction from a
non-technical buyer who has been told for two years that "AI" means a chat
window. The site has to defuse it on the homepage.

Chatbots give text. Beings gives **completed work**. You don't chat with
your PDFs; agents read every PDF in the business and act on what they find.
The deliverable is a reconciled spreadsheet, a sent follow-up, a flagged
contract clause, an updated CRM record — not a transcript of a conversation
with a model.

The deeper differentiator is that **we map operations, we don't plug
ChatGPT into files.** Use the canonical phrasing verbatim:

> We don't just plug ChatGPT into your files. We map your operations so
> the AI understands who approves invoices, what a compliant contract
> looks like, and who needs to be CC'd.

Treat **"mapping operations"** as a canonical phrase alongside
**"Air-Gapped Sovereignty"** and **"Zero-Retention Enterprise Cloud"**.
Sales conversations, site copy, demo voiceovers, and decks should reuse
it word-for-word so the phrase becomes ours.

The site's job on this dimension is to make every visitor leave knowing
Beings is *not a chatbot* and *not "ChatGPT for your docs"* — it is
operations-aware agent infrastructure that produces finished work inside
the systems the customer already runs.

### Who It Is For

The site is written for two audiences in parallel:

- **Operators** — SMB and mid-market team leads, ops managers, founders,
  and individual knowledge workers drowning in inbox triage, CRM hygiene,
  spreadsheet reconciliation, and document handling.
- **Approvers** — the **CISOs, Data Protection Officers, and Heads of
  Digital Transformation** who must sign off on any tool that touches
  internal data. Every page that an operator might forward to their
  security team must survive that read.

The site is explicitly **not** written for solo consumers, academic
researchers, journalists, or interview-transcription users. That positioning
is dead.

### What We Promise

Every promise made on the site must reduce to one of three outcomes:

- **Revenue generated** — pipeline progressed, follow-ups sent, deals
  unblocked.
- **Cost reduced** — hours of manual work eliminated, headcount avoided,
  vendor consolidation enabled.
- **Friction removed** — context restored across systems, swivel-chair work
  ended, hand-offs absorbed.

If a section of copy cannot point to one of those three outcomes, it does
not belong on the page.

### Buyer-Grade Framing

The framing throughout is **enterprise-grade**, not consumer-grade. The
buyer reads the homepage as a procurement candidate, not as an app-store
listing. Tone is plain, specific, and technically literate. We avoid
hype, emoji, and consumer-app verbiage; we do not avoid concrete claims
about sovereignty, deployment model, and data handling.

The posture is also **premium and high-touch**. Beings is sold like a
Palantir-style deployment, not like a self-serve tool — that means amazing
support, hand-holding through deployment, and a high-trust commercial
relationship. Copy throughout the site should match a buyer expecting a
deployment partner, not a buyer comparison-shopping a SaaS product. Free
trials, "starts at £X / month," and self-serve onboarding all sit outside
this posture and are explicitly forbidden (see §15 Out of Scope and §16
Revenue Model And Pilot Motion).

---

## 3. The Canvas + Card Philosophy

The product's UI is built on a simple visual metaphor:

- The **canvas** is a calm, neutral background — white in light mode, deep
  navy (`#12121E`) in dark mode. It fills the viewport edge to edge.
- **Cards** are white floating panels that contain content and float above
  the canvas with subtle M3 elevation.
- **Depth** is communicated only through the elevation scale
  (`--elevation-1` … `--elevation-4`). Not through gradients, not through
  glassmorphism, not through heavy drop-shadows.

The marketing site adopts this language verbatim. A homepage hero is a card.
A pricing tier is a card. A blog post is a card on canvas. The visual
vocabulary is consistent so that the cognitive load of switching between
website and product is near zero.

### What This Forbids

- **No glassmorphism.** `backdrop-filter: blur` is banned from production
  components.
- **No heavy gradients.** Brand backgrounds are flat tokens, not radial or
  conic gradients.
- **No over-rounded buttons.** Buttons are 8px radius. Pill buttons (~9999px)
  are reserved for chips and stadium toggles.
- **No card-in-card on white.** Cards float on the canvas, not on top of
  other cards. Nest with `padding` and `border`, not stacked surfaces.

### What This Enables

A small set of components composes into every page. Adding a new section
rarely requires inventing new visual primitives — it composes from `Card`,
`Heading`, `Text`, `Button`, and the marketing section components in
`src/components/marketing/`. That cuts review time, eliminates style drift,
and keeps Lighthouse scores high (smaller CSS surface, fewer custom paint
ops).

---

## 4. SSG Architecture and Trade-offs

The site is generated by **Astro 5** with `output: 'static'`. Every page is
HTML at build time; there is no Node/Cloudflare Worker handling requests at
runtime.

### Narrative Fit

Static delivery is not just a performance choice — it carries the trust
story. Because the marketing site has no backend, no account system, no
session store, and no per-visitor personalization layer, there is nothing
in this repo that *could* extract user data even if we wanted it to.
Form submissions go directly to external systems (HubSpot); demos run on
synthetic data generated at build time; analytics, when added, run as
visitor-consented client-side scripts with no server-side join. The
absence of a backend is itself an argument for the product's promise:
*we don't collect what we don't need*. Visitors auditing the site (and
their security teams) can read the deployed HTML and verify that no user
data flows through `website.beings.com`.

### Why Static

- **Performance.** HTML served from Cloudflare's edge cache is the fastest
  possible delivery path. No cold starts, no DB round trips.
- **Reliability.** A static site has effectively zero runtime failure modes.
  If the edge can serve files, the site works.
- **Security.** No server, no auth, no database means no API surface to
  attack, no secrets to leak.
- **Cost.** Cloudflare Pages is free at our scale.
- **Authoring.** Content is git. PR diffs show exactly what changed. No CMS
  to manage, no editorial workflow to maintain.

### What We Give Up

- **Personalisation at request time.** We can do edge-side personalisation
  later via Pages Functions if needed, but the default is "the same HTML for
  every visitor."
- **Live data without a build.** Updating copy requires a deploy. For a
  marketing site this is desirable (changes are reviewed), not a limitation.
- **Server-only secrets in page rendering.** Anything in HTML is public.
  HubSpot/analytics IDs are public anyway; real secrets stay in the product
  workspace.

### When We'd Reconsider

If we ever need true server-rendered personalisation (e.g. logged-in pricing
for enterprise customers), we would introduce a small set of Cloudflare Pages
Functions for *those routes only*, keeping the rest of the site SSG. We do
not anticipate this in the foreseeable roadmap.

---

## 5. Two Layout Systems

The site has **two coexisting layouts**, each chosen per-page. The choice is
editorial first, technical second.

### 5.1 `AppShell` — Product-Feeling Pages

Lives in `src/components/app-shell/`. The shell is a pixel-precise replica of
the product's main window:

- **`AppShell.astro`** — root CSS-grid layout (`80px sidebar | 1fr main`).
- **`SidebarRail.astro`** — 80px navigation rail with product-style icons.
- **`MainPanel.astro`** — the floating white panel that holds page content.

Use `AppShell` for any page whose job is to **demonstrate control,
locality, agent workspaces, or realistic chore execution**. In practice
that means: the homepage hero, product-tour pages, and demo routes that
show an agent doing one of the canonical synthetic SMB workflows
(inbox triage and email follow-up, calendar coordination across teams,
CRM cleanup, spreadsheet reconciliation, contract review, IDP). Whenever
a visitor needs to see the agent at work — locally, in a product-shaped
surface — the page lives in `AppShell`.

### 5.2 `Layout` — Trust, Pricing, Legal, Narrative

Lives in `src/components/layout/`:

- **`Layout.astro`** — header + main + footer scaffold.
- **`Header.astro`** — full-width navigation.
- **`Footer.astro`** — full-width footer with links and legal.
- **`MobileMenu.tsx`** — React island for the mobile hamburger.

Use `Layout` for **trust, pricing, legal, and company-narrative pages**:
the Trust & Governance page (CISO/DPO read), the "Book a Pilot" page that
replaces traditional pricing, privacy, terms, security disclosures,
about/company copy, and blog posts. These pages carry weight by being
calm, documentary, and easy to print or forward — not by performing the
product.

### Choosing Between Them

Ask: *Is this page demonstrating the agent doing real work, or making a
documentary claim about what Beings is and how it behaves?* The first
case is `AppShell`; the second is `Layout`.

You do **not** nest the two. A page picks one and lives inside it.

---

## 6. Component Organisation

The component tree is layered by abstraction level:

```
src/components/
├── app-shell/      Layout primitives that mirror the product shell
├── layout/         Traditional marketing scaffold (Layout/Header/Footer)
├── marketing/      Composed marketing sections (HeroCard, BentoCards, …)
├── islands/        React-only interactive components (forms, calculators)
├── demos/          Product-look demos used inside marketing sections
└── ui/             Shared primitives (buttons, headings, etc.)
```

### Composition Strategy

1. **Primitives** (in `ui/`) — single-purpose elements. A button, a heading,
   a divider. Used everywhere.
2. **Sections** (in `marketing/`) — composed blocks like a hero, a feature
   grid, a pricing table. Take props for content, render the layout.
3. **Pages** (in `src/pages/`) — assemble sections inside a layout
   (`AppShell` or `Layout`). Define SEO metadata in frontmatter.

A page should be readable top-to-bottom as a list of sections. If a page
file is doing real layout work beyond composition, the section is missing
and should be extracted.

### Authoring Rule

When in doubt, write `.astro`. Reach for `.tsx` (React island) only when the
component genuinely needs interactivity that cannot be expressed in HTML/CSS
plus minimal vanilla JS.

### Demo-Content Rule

Every component in `demos/` (and any component that depicts the product
in `marketing/`) operates under two hard constraints:

1. **Synthetic data only.** Names, email addresses, company names,
   account IDs, and document contents shown in demos are fictional.
   We never use real customer data, anonymised customer data, screenshots
   from the founder's own inbox, or scraped public data with identifying
   detail. The demos must be reproducible from data files in this repo
   so that any reviewer can verify there is no leakage.
2. **User-benefiting workflows only.** Demos depict the agent helping
   the worker get a chore done — drafting a follow-up, reconciling a
   spreadsheet, summarising a contract clause, prepping a meeting brief.
   The user is the protagonist; the agent is the helper.

**Forbidden categories** of demo (never build these, never accept them in a
PR):

- Employer / manager dashboards that aggregate worker activity.
- Productivity scoring, ranking, or leaderboards.
- Sentiment analysis on employee communication.
- Surveillance UI of any kind ("see what your team is doing today").
- Compliance or HR-style monitoring panels.

If a demo concept fails the demo-content rule, the answer is to redesign
the demo, not to soften the rule.

---

## 7. React Island Strategy

React is a JavaScript cost we pay deliberately, per component, with full
awareness of the bundle and hydration impact. The discipline is to pick the
**narrowest possible** client directive:

| Directive                          | Use For                                                | Default? |
|------------------------------------|--------------------------------------------------------|----------|
| `client:visible`                   | Below-the-fold islands (forms, calculators, demos)     | **Yes**  |
| `client:media="(max-width: 767px)"`| Mobile-only widgets (e.g. `MobileMenu`)                | When relevant |
| `client:idle`                      | Non-critical chat widgets, late-loaded analytics       | Rare     |
| `client:load`                      | Above-the-fold interactive elements that must respond before scroll | **Only when justified** |
| `client:only="react"`              | Components that read browser-only APIs on first paint  | Last resort |

### When to Use React at All

Use React for:

- Forms with client-side validation (`ContactForm`, newsletter signup).
- Calculators with dynamic computation (`CostCalculator`).
- Interactive widgets (carousels with animation, accordions).
- Third-party integrations that require JS (HubSpot embeds).

**Do not** use React for:

- Static content display — that is `.astro`.
- Navigation — Astro page links with View Transitions are faster and more
  accessible.
- Simple show/hide — CSS `:checked` patterns or a few lines of vanilla JS
  beat shipping React.

### Passing Data In

Data is fetched at build time in the `.astro` frontmatter and passed as
props to the React island. Islands do **not** fetch their own content unless
the content is genuinely user-input-driven.

```astro
---
const tiers = await fetchPricing();
---
<CostCalculator client:visible tiers={tiers} currency="USD" />
```

---

## 8. Brand Token System

### Source of Truth

`src/styles/brand-tokens.css` is the **only** place where colour, type,
radius, elevation, motion, and breakpoint values are defined. Everything
else references those tokens by name.

### Token Categories

- **Colours** — primary/secondary palettes, surface roles
  (`--color-background`, `--color-surface`, `--color-surface-elevated`),
  text (`--color-text-primary`, `--color-text-secondary`), divider, status
  (success / warning / error / info).
- **Typography** — `--font-family` (Roboto Flex stack), `--font-size-xs`
  … `--font-size-5xl`, weights, line heights.
- **Spacing** — 8px grid (`--space-1` … `--space-32`).
- **Radius** — M3 scale (`--radius-sm` 8px through `--radius-xl` 28px and
  `--radius-full`).
- **Elevation** — M3 shadow scale (`--elevation-0` … `--elevation-4`).
- **Motion** — easing curves, duration tokens.
- **Breakpoints** — M3 window-size class references.
- **Z-index** — semantic layers (dropdown, sticky, modal, popover, tooltip).

### Dark Mode

Dark mode is a single toggle. Setting `data-theme="dark"` on `<html>`
activates the `[data-theme="dark"]` selector in `brand-tokens.css`, which
overrides every relevant token. Components never branch on theme — they
reference token names and the theme decides what those names resolve to.

### Tailwind Integration

`tailwind.config.mjs` aliases the most-used tokens to utility class names
(`bg-primary`, `bg-surface`, `text-primary`, `rounded-sm`, etc.) so that
component authors can use idiomatic Tailwind without breaking the SSOT.
Arbitrary-value escapes (`bg-[var(--color-divider)]`) are accepted for
tokens that do not yet have a Tailwind alias, but the preference is to
extend the config.

### Sync Discipline

`brand-tokens.css` mirrors the product design system. Do **not** modify it
unilaterally. Adding a new token is fine; changing an existing value
requires coordination with the product workspace so the marketing site and
the product do not visually drift.

---

## 9. Content Workflow

Content is code. There is no CMS.

- Page-level copy lives in `.astro` files in `src/pages/`.
- Component-level copy lives in the component files themselves or in props
  passed from page frontmatter.
- Long-form content (blog posts, when added) lives in `.mdx` files under
  `src/content/` with typed schemas defined in `src/content/config.ts`.
- Asset references (images, icons) live in `src/assets/` (build-time) or
  `public/` (raw, served at the URL as-is).

### Positioning Source of Truth

Product positioning copy — anything that makes a claim about *what Beings
is*, *who it serves*, or *what it promises* — must be checked against
`beings-local/docs/vision.md` before merge. That file is the source of
truth for the product narrative. The PRD (`docs/bw-prd-01-rebrand.xml`)
remains the source of truth for **website components, integrations,
pages, and priorities**, but it deliberately does not own the product
story. When the two appear to disagree, the vision doc wins on positioning
and the PRD is updated to match.

In practice this means:

- New marketing sections begin with a check against the vision doc.
- Copy that introduces a new claim ("we do X", "we never do Y") is a
  vision-doc change, not a PRD change.
- Implementation details (which page, which component, what priority)
  remain a PRD change.

### Why No CMS

A team of three optimising for an AI-first workflow is faster editing copy
in Cursor than logging into a CMS. PRs surface every change. There is no
content/code drift because there is no separate content store.

### When We'd Add One

If non-technical stakeholders need to publish independently of the dev
loop, we would introduce a headless CMS (Sanity, Contentful, or a git-backed
solution like Tina) — but that decision is a PRD revision, not a tactical
choice.

---

## 10. Deployment Pipeline

### Build

```bash
npm run build
```

Astro generates `dist/` with one HTML file per route, static assets fingerprinted
for cache-busting, and CSS optionally inlined (`inlineStylesheets: 'auto'` in
`astro.config.mjs`).

### Deploy

```bash
npx wrangler pages deploy dist
```

Wrangler uploads `dist/` to the Cloudflare Pages project `beings-marketing`.

- **Production URL:** `https://website.beings.com` (custom domain).
- **Pages alias:** `https://beings-marketing.pages.dev`.
- **Preview deploys:** one per PR, configured at the Pages project level.

### Environment Variables

Anything secret (HubSpot portal IDs, analytics container IDs) is set in the
Cloudflare Pages dashboard, **not** committed to the repo and **not** placed
in `.dev.vars`. The marketing site has very few secrets because it does no
authenticated backend work; what looks like a secret (e.g. HubSpot portal ID)
is typically public anyway.

---

## 11. Performance Budget

- **Lighthouse 95+** on Performance, Accessibility, Best Practices, and SEO
  for every public page (PRD goal G3).
- **SSG by default** — pages render as inert HTML; no JS runs unless an
  island opts in.
- **Narrowest client directive wins** — `client:visible` over `client:load`
  whenever possible.
- **Critical CSS inlined** via Astro's automatic inline strategy.
- **No render-blocking third-party scripts** — load analytics with
  `client:idle` or `defer` attribute, never blocking first paint.
- **Image discipline** — modern formats (AVIF/WebP), responsive `srcset`,
  explicit `width`/`height` to prevent layout shift.
- **No client-side data fetching** for build-time-resolvable content.

If a change risks Lighthouse regression (large new dependency, new always-on
island, new render-blocking script), the change must be justified in the PR
description.

---

## 12. Accessibility Commitments

Accessibility is non-negotiable. Every page must:

- Use **semantic HTML** (`<header>`, `<nav>`, `<main>`, `<section>`,
  `<footer>`).
- Provide **ARIA labels** for interactive controls without visible text.
- Support **keyboard navigation** for every interactive surface (links,
  buttons, menus, dialogs, forms).
- Render **visible focus rings** using brand tokens
  (`focus:ring-2 focus:ring-primary-light`). Never `outline: none` without
  a replacement.
- Meet **WCAG AA contrast** against `--color-background` and `--color-surface`
  in both light and dark modes.
- Honour **`prefers-reduced-motion`** — animations are decorative, never
  load-bearing for understanding the content.
- Use **descriptive link text** — never "click here", never "read more"
  without context.

Forms additionally must:

- Label every input with `<label for="…">` (or `aria-label`).
- Surface validation errors via `aria-describedby` and `aria-invalid`.
- Preserve user-entered data across error states.

---

## 13. Sovereignty And Trust Model

The product's value proposition is sovereignty. The website's job is to make
that proposition legible, honest, and inspectable. The trust model the site
must communicate has six parts.

### 13.1 Locally Deployed To The Customer's Environment

Beings is **locally deployed to your environment**. The product is delivered
as a binary that runs on customer-controlled hardware (a workstation, a
managed laptop fleet, or an on-premise host). Memory, context, working
data, document indices, and agent state all sit inside the customer's
network boundary. We use the phrase **"Air-Gapped Sovereignty"** as the
canonical name for this property.

We deliberately **downplay "desktop app"** as the lead framing. The desktop
binary is the technical delivery mechanism; the value proposition is
sovereign infrastructure deployed locally. A CISO reading "desktop app"
hears "consumer tool"; the same CISO reading "locally deployed" hears
"on-prem appliance," which is the correct mental model.

### 13.2 User-Owned Memory

The user's working memory belongs to the user (or their organisation).
There is no vendor copy of the corpus. There is no "we keep an
anonymised version for product improvement" footnote. If the customer
uninstalls Beings, their data does not persist on our infrastructure
because it never reached our infrastructure.

### 13.3 No Training On Customer Data

Customer data is never used to train Beings models, and we do not derive
training datasets from customer corpora — directly or indirectly. The
website states this plainly and links to the contractual terms that
back it.

### 13.4 Consent Before Telemetry

Any telemetry the product emits is opt-in, scoped, and explained in
plain language at the moment of consent. The website mirrors that
posture: analytics on `website.beings.com` run only with explicit
visitor consent (cookie banner), and the marketing site never collects
PII.

### 13.5 Zero-Retention Enterprise Cloud For Complex Reasoning

This is the single most important claim on the site, and it must be
made honestly. Verbatim framing:

> Your memory, context, and data live locally and never leave your
> firewall. For complex reasoning, Beings orchestrates queries via
> zero-data-retention enterprise APIs (Claude / GPT-4) that legally
> cannot use your data for training. As your local hardware upgrades,
> those cloud workloads seamlessly shift to local models.

The site is not allowed to say "all inference is local today." The site
is required to say "the data stays local; some reasoning is delegated
to zero-retention enterprise endpoints, and that surface area is
explicitly bounded and shrinking." This is the **honesty constraint**
on every page that touches AI/inference claims.

### 13.6 Progressive Migration To Local

The destination is more local inference, not less. As local hardware
capability rises (Apple Silicon, on-prem accelerators, customer-side
GPU), Beings shifts more reasoning workloads from cloud orchestration to
local models without changing the customer-facing surface. The site
should describe this as a trajectory the customer benefits from as
hardware improves, not a future product they have to buy.

---

## 14. Lines We Don't Cross

The trust model translates into editorial and product constraints on the
website. These are hard rules; they apply to every page, every component,
and every demo. They also drive a **dedicated homepage section** ("Lines
We Don't Cross") that links to a **dedicated Trust & Governance page**
designed for CISOs, DPOs, and Heads of Digital Transformation to read,
forward, and approve. (The actual page and homepage section are
component-level work tracked in the PRD; this section is the authoritative
content brief for both.)

### Hard Rules

1. **No employer surveillance framing.** The site never depicts Beings as
   a tool managers use to watch their teams. We do not show "see what
   your team is working on" hero copy, manager dashboards, or activity
   timelines aggregated by employee.
2. **No productivity scoring.** No leaderboards, no scoring of individual
   workers, no "Beings makes your team 27% more productive" claims tied
   to per-employee output metrics.
3. **No sentiment monitoring.** The product does not, and the website
   does not advertise, analysis of employee mood, tone, or wellbeing
   from communication content.
4. **No manager-dashboard demos.** Demos depict a worker getting their
   own chores done, not a manager monitoring others.
5. **No SaaS data extraction.** We do not say "the more you use Beings,
   the better it gets for everyone" if that implies cross-customer
   training. We do not advertise "anonymised product improvement"
   loops on customer corpora.
6. **No covert telemetry.** Anything the product or site emits is
   surfaced clearly to the user before it runs.

### Why We State Them Publicly

These rules are also our moat. Stating them on the homepage, and again
on the Trust & Governance page, gives a CISO the artefact they need to
greenlight a pilot. It also forces us to keep the rules — once a claim
is on the homepage, walking it back is a public event.

---

## 15. Out of Scope

The architecture explicitly excludes the following at the technical layer:

- **Server-side rendering.** `output: 'static'`. No exceptions without PRD
  revision.
- **A CMS.** Content stays in git.
- **A database.** No D1, no Postgres, no KV.
- **Authentication.** The site is fully public.
- **PII processing.** This is a GREEN workspace. Forms POST to external
  systems (HubSpot); nothing is persisted locally.
- **`.dev.vars`.** Diskless dev — secrets live in Cloudflare Pages env vars.

It also excludes the following at the **messaging** layer. These are not
technical constraints; they are content rules that apply to every page,
component, and PR.

- **Surveillance positioning.** No productivity tracking, sentiment
  surveillance, employee scoring, or management-reporting narratives.
  See "Lines We Don't Cross."
- **User-data demos.** All demos use synthetic data. No real customer
  data, no anonymised customer corpora, no founder-inbox screenshots.
- **Overclaiming locality.** The site presents Beings as locally
  deployed with **Zero-Retention Enterprise Cloud** orchestration for
  complex reasoning today, progressively migrating to local as hardware
  allows. The site never claims "all inference is local today."
- **Generic cloud-AI positioning.** Beings is sovereign infrastructure,
  not another cloud AI vendor. We do not compete on "we have the best
  model"; we compete on "your data never leaves your firewall."
- **SaaS pricing language.** No per-seat tiers, no self-serve checkout,
  no "free trial," no "starting at £X / user / month." The revenue
  model is **Productized Deployment** — see section 16.
- **Consumer "desktop app" framing.** The desktop binary is the technical
  delivery mechanism; the value prop is **locally deployed sovereign
  infrastructure**. Headlines, navigation, and feature copy lead with
  the latter.
- **Legacy researcher / CloudLab / Aida / Interview Transcription
  positioning — burn the boats.** None of these survive into the new
  site. A CISO reading "interview transcription" mentally files Beings
  next to consumer SaaS; we cannot afford that. If legacy components,
  pages, or copy referencing them still exist, they must be removed or
  rewritten before launch.

If a future requirement appears to need any of the above, that is a signal
to revisit the PRD and the vision doc, not to silently introduce the
capability.

---

## 16. Revenue Model And Pilot Motion

The website's commercial surface is a **Productized Deployment** motion in
the Palantir-for-the-mid-market mould. There are no SaaS tiers on the site.
Instead, the commercial offer is a three-step ladder, each step productized:

### 16.1 Three-Tier Offer Ladder

1. **Workshop** — a half-day educational engagement that helps a prospect
   understand where Beings can take chores off their plate. Carries a
   qualifying function: not every workshop attendee is a Beings customer,
   and the workshop itself is the screen. Working price hypothesis:
   ~£1,200. *(Pricing is exploratory and not canonical until validated
   post-workshop with Beth.)*
2. **Pilot / Deployment Bootcamp** — a focused, time-boxed engagement
   (working name: **6-Week Deployment Bootcamp**) on a specific chore or
   document workflow the customer is already paying a cost to do badly.
   Deliverable includes a working deployment plus an **AI Strategy
   artefact** the customer keeps. Working price hypothesis: ~£5k as a
   baseline, with bespoke pricing for larger or more complex scopes.
   *(Pricing exploratory.)*
3. **Annual License** — productized deployment under a multi-year
   contract. Working price hypothesis: ~£24k/year baseline.
   *(Pricing exploratory.)*

### 16.2 Two Pilot Motivations

The Bootcamp covers two distinct buyer motivations:

- **Education-led** — buyers who understand AI is coming for their
  workflows but do not yet know which chores are highest-value to
  automate. The Workshop and the early Bootcamp days qualify and orient
  them.
- **Problem-led** — buyers who already know the pain (e.g., "we drown in
  supplier contracts every month"). For these, the Workshop is brief or
  skipped and the Bootcamp goes straight at the chore.

The site's CTAs should support both paths: a primary "Book a Pilot" /
"Book a Discovery Call" CTA for problem-led buyers, and a secondary
"Book a Workshop" / "Apply for the Bootcamp" CTA for education-led
buyers.

### 16.3 Qualifying Motion

Beings is not for everyone, and the site reflects that. The Workshop and
Bootcamp both include qualifying steps so we are not selling AI to
organisations that lack the data, the chores, or the buy-in to make it
work. The "Book a Pilot" page should include the qualification criteria
up front (size, sector, system access, sponsor seniority) so the form/CTA
acts as a screen, not a lead capture.

### 16.4 Page-Level Implications

- The page that would have been "Pricing" is **"Book a Pilot."** Its
  primary CTA is to apply for the Bootcamp.
- There is a separate "Workshop" page (or section) for the
  education-led entry point.
- Both pages communicate the qualifying criteria explicitly.
- There is no self-serve checkout, no per-seat counter, no free trial,
  and no Stripe integration.

### 16.5 Stability

The ladder structure (Workshop → Pilot/Bootcamp → Annual License) is
settled. The **specific price points are exploratory** and will be
validated with Beth at the May workshop and against early-pilot reality.
Any feature that drifts the site back toward self-serve SaaS is a
regression on the strategy, not a feature.

---

## 17. How This Document Stays Current

This file is the narrative companion to `llms.txt` (routing) and
`docs/bw-prd-01-rebrand.xml` (PRD). The full sync chain in priority order:

1. **`beings-local/docs/vision.md`** — authoritative source for *what
   Beings is, who it serves, and which promises the site may make*.
   Positioning and narrative changes start here.
2. **`docs/bw-prd-01-rebrand.xml`** — authoritative source for *which
   pages and components ship, with which priorities and integrations*.
   Update when the deliverable surface changes.
3. **This document (`docs/architecture.md`)** — authoritative source for
   the *reasoning* behind the architectural and editorial decisions.
   Update when a decision changes the why.
4. **`llms.txt`** — routing map and section anchors for AI agents.
   Update when the file/directory map or canonical references change.

Keep these four artefacts in sync; treat any drift as a bug. When the
vision doc and the PRD disagree, the vision doc wins on positioning and
the PRD is updated to match — not the other way around.

# Brief: Product Landing Page as Homepage

## Goal

Replace the current `src/pages/index.astro` (Phase 2 placeholder) with the product use case landing page. This will be the future main website at `website.beings.com`.

## Site Structure

| URL | Page | Status |
|---|---|---|
| `website.beings.com/` | Product landing page (this brief) | TODO — currently shows placeholder |
| `website.beings.com/chat` | "Talk to Aida" WhatsApp landing page | Done |

## Reference

The target design is live at `https://d72f7156.beings-marketing.pages.dev/`. This was a previous deployment that has no source code — it needs to be rebuilt as a proper Astro page.

Fetch that URL to see the full content and layout. Key sections:

1. **Hero**: "Research transcription you can trust" — Fast, accurate transcripts from any recording or meeting — free
2. **Feature cards** (4): Live transcription, Unlimited uploads, Unlimited recordings, Traceable insights
3. **Detail sections** (4):
   - "High-fidelity research transcripts"
   - "Unlimited uploads, transcription & AI-indexing"
   - "Build your research intelligence" (with testimonial quote from Jessica Baxter, SBC)
   - "Secure, compliant, and built for professional research"
4. **How it works**: 6-step process (Invite → Store → Analyse → Synthesise → Knowledge base → Reports)
5. **CTA**: "The first step to automated, reliable research intelligence" — Get started / Talk to our team
6. **Footer**: Platform links, Solutions, Learning, About/Legal

## Requirements

1. Use the existing `Layout.astro` component (header + footer + SEO meta) — NOT the AppShell layout
2. Use brand tokens from `src/styles/brand-tokens.css` — no hardcoded colours
3. Follow `.cursor/rules/brand.mdc` design guidelines (Canvas+Card, M3 elevation, 8px button radius, no heavy gradients)
4. Astro components only — no React islands needed for this page (it's static content)
5. Responsive: mobile-first, works at all breakpoints
6. SEO: proper title, description, OG tags for social sharing
7. The header nav links from `Header.astro` should work: Product, Pricing, Research Hub, Blog (can be placeholder hrefs for now)

## What NOT to do

- Don't recreate the live transcription demo (interactive feature) — use a static illustration or screenshot placeholder
- Don't connect to any backend or API
- Don't modify the `/chat` page
- Don't modify brand-tokens.css

## Deploy

After building, deploy and verify:

```bash
npm run build
npx wrangler pages deploy dist --project-name beings-marketing
```

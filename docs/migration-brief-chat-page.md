# Migration Brief: Chat Landing Page → beings-website

## Context

The "Talk to Aida" landing page currently lives as an inline HTML string in the `beings/` workspace (`src/chat-page.ts`), served by the `beings-os` Cloudflare Worker at `/chat`. It needs to move here to `beings-website` as a proper Astro page using the shared design system.

## Source Material

The original page is at `/Users/glassbox/_dev/beings/src/chat-page.ts`. Key elements to preserve:

- **Headline:** "Your memory. Getting smarter while you sleep."
- **Body:** "Aida is your sovereign active memory. She lives in WhatsApp. She remembers everything you tell her."
- **Edge line:** "She will remember everything. Choose your words." (italic, dimmed)
- **CTA:** "Start talking to Aida" → `https://wa.me/442045720044?text=Hey%20Aida%2C%20I%27m%20new%20here.%20My%20name%20is%20`
- **Status indicator:** pulsing dot + "Online" (top-right of card)
- **QR code:** Desktop only, links to same WhatsApp URL (uses qrserver.com API)
- **OG tags:** title "Talk to Aida", description "Your memory. Getting smarter while you sleep."
- **Visual:** Canvas+Card layout (gray bg `#F0F4F9`, white card `12px` radius, M3 elevation-2 shadow)
- **Brand:** "Beings" in header, `beings.com` link in footer

## Phase 1 — Build the page in beings-website

Replace `src/pages/index.astro` (currently a Phase 2 placeholder) with the landing page content.

**Requirements:**
1. Use the existing `Layout.astro` component (has SEO meta, header, footer, dark mode) OR create a minimal standalone page — the original is a single centered card, no nav header needed
2. Use CSS custom properties from `src/styles/brand-tokens.css` — do NOT hardcode hex colours. Map from the original:
   - `--bg` → `--color-background` (`#F0F4F9`)
   - `--surface` → `--color-surface` (`#FFFFFF`)
   - `--text` → `--color-text-primary` (`#1A1D2E`)
   - `--muted` → `--color-text-secondary` (`#4A5568`)
   - `--primary` → `--color-primary` (`#5B6FCC`)
   - `--primary-hover` → `--color-primary-dark` (`#3E4B99`)
   - `--secondary` → `--color-secondary` (`#7E57C2`)
   - `--divider` → `--color-divider` (`#E2E8F0`)
   - `--radius-card` → `--radius-md` (`12px`)
   - `--radius-btn` → `--radius-sm` (`8px`)
   - `--shadow` → `--elevation-2`
3. Keep the QR code (desktop only, `display: none` on mobile, `display: flex` on `≥768px`)
4. Keep the pulsing status dot animation
5. Import `global.css` for base typography
6. No React islands needed — this is pure HTML/CSS
7. Astro page should be SSG (no client-side JS except the QR code script)

## Phase 2 — Deploy and verify

```bash
npm run build
npx wrangler pages deploy dist --project-name beings-marketing
```

Verify at `https://website.beings.com` — should show the landing page.

## Phase 3 — Redirect the Worker route

In the `beings/` workspace (`/Users/glassbox/_dev/beings/`), update `src/index.ts`:

Replace:
```typescript
if (url.pathname === '/chat' && request.method === 'GET') {
  return new Response(CHAT_HTML, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
```

With:
```typescript
if (url.pathname === '/chat' && request.method === 'GET') {
  return Response.redirect('https://website.beings.com', 301);
}
```

Then remove the `CHAT_HTML` import from the top of `index.ts`.

## Phase 4 — Clean up

Delete `src/chat-page.ts` from the `beings/` workspace entirely. Commit both workspaces.

## What NOT to change

- The WhatsApp deep link URL — keep exactly as-is
- The copy/messaging — preserve the tone
- The `beings/` Worker routes other than `/chat` — leave everything else untouched
- The beings-os Worker itself — only the landing page HTML moves out

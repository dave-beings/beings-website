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

## Phase 1 — Build the page in beings-website ✅

**Done** (2026-03-03). Built as `src/pages/chat.astro` — a standalone page (not replacing `index.astro`) using brand tokens from `brand-tokens.css`. Pure HTML/CSS, SSG, QR code on desktop, pulsing status dot.

## Phase 2 — Deploy and verify ✅

**Done** (2026-03-03). Deployed to Cloudflare Pages. Live at `https://website.beings.com/chat`.

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
  return Response.redirect('https://website.beings.com/chat', 301);
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

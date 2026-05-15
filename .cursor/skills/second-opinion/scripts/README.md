# Scripts Moved

The scripts have been moved to the shared infrastructure directory for DRY compliance.

**New locations:**
- `../_shared/gemini-bridge.ts` — CDP bridge for Gemini
- `../_shared/context-packer.ts` — Context packer for grounding blocks
- `../_shared/domains/` — Domain-specific invariants

**Usage:**
```bash
# Context packing
npx tsx .cursor/skills/_shared/context-packer.ts --domain storage

# Gemini bridge
npx tsx .cursor/skills/_shared/gemini-bridge.ts --send "prompt"
npx tsx .cursor/skills/_shared/gemini-bridge.ts --file ./prompt.txt
```

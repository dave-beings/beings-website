# Provider Reference

## Choose by Capability

| Scenario | Recommended | Why |
|----------|-------------|-----|
| Deep research / reasoning | `--provider google` (default) | Strong reasoning, 1M context window |
| Structured analysis | `--provider anthropic` | Best at detailed breakdowns, fastest |
| Quick sanity check | `--model gemini-2.5-flash` | Fast + cheap |
| General purpose | `--provider openai` | Solid all-rounder |
| UK-hosted | `--provider azure` | Data stays in UK South |
| Freshness verification | Use Gemini bridge (web UI) | API models can't browse live |

## Models

Run `--list` to see current defaults and available models per provider. To list all Google models available on your API key:

```bash
infisical run --env=dev --domain https://eu.infisical.com -- bash -c 'curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_GENERATIVE_AI_API_KEY" | python3 -c "import sys,json; [print(m[\"name\"].split(\"/\")[1]) for m in json.load(sys.stdin)[\"models\"]]"'
```

## Environment Variables

Injected via Infisical (`infisical run --env=dev --domain https://eu.infisical.com`):

| Provider | Required Variables |
|----------|--------------------|
| google | `GOOGLE_GENERATIVE_AI_API_KEY` |
| anthropic | `ANTHROPIC_API_KEY` |
| azure | `AZURE_RESOURCE_NAME`, `AZURE_API_KEY` |
| openai | `OPENAI_API_KEY` |

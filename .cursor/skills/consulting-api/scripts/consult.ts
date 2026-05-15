#!/usr/bin/env npx tsx
/**
 * API Consult Bridge v3.0
 *
 * Stateless cross-model consultation tool for agentic workflows.
 * Called programmatically by AI agents in Cursor IDE.
 *
 * API keys injected via Infisical at runtime:
 *   infisical run --env=dev --domain https://eu.infisical.com -- npx tsx consult.ts --send "prompt"
 *
 * Outputs:
 *   stdout — Response text (default) or JSON envelope (--json / --json-schema)
 *   stderr — Diagnostics, heartbeat, reasoning summaries
 *
 * Exit codes: 0=success, 1=bad input, 2=auth, 3=rate limit, 4=context overflow, 5=safety filter, 6=schema error, 7=unknown
 */

import { generateText, generateObject, jsonSchema as aiJsonSchema, type LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../../../..');

// =============================================================================
// EXIT CODES & ERROR HANDLING
// =============================================================================

const EXIT = {
  SUCCESS: 0,
  BAD_INPUT: 1,
  AUTH: 2,
  RATE_LIMIT: 3,
  CONTEXT_OVERFLOW: 4,
  SAFETY_FILTER: 5,
  SCHEMA_ERROR: 6,
  UNKNOWN: 7,
} as const;

class ConsultError extends Error {
  constructor(message: string, public exitCode: number) {
    super(message);
  }
}

function classifyError(err: unknown): number {
  if (err instanceof ConsultError) return err.exitCode;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  const name = err instanceof Error ? err.constructor?.name || '' : '';

  if (msg.includes('api key') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('authentication'))
    return EXIT.AUTH;
  if (msg.includes('rate limit') || msg.includes('429') || msg.includes('quota exceeded') || msg.includes('too many requests') || msg.includes('timeout'))
    return EXIT.RATE_LIMIT;
  if (msg.includes('context length') || msg.includes('maximum context') || msg.includes('too many tokens') || msg.includes('token limit') || msg.includes('content size'))
    return EXIT.CONTEXT_OVERFLOW;
  if (msg.includes('safety') || msg.includes('content filter') || msg.includes('blocked') || msg.includes('harmful') || msg.includes('recitation'))
    return EXIT.SAFETY_FILTER;
  if (name === 'TypeValidationError' || name === 'NoObjectGeneratedError' || msg.includes('schema') || msg.includes('does not match'))
    return EXIT.SCHEMA_ERROR;

  return EXIT.UNKNOWN;
}

// =============================================================================
// HEARTBEAT (prevents parent process from killing long-running calls)
// =============================================================================

function startHeartbeat(): () => void {
  const interval = setInterval(() => process.stderr.write('.'), 5000);
  return () => clearInterval(interval);
}

// =============================================================================
// ENV LOADING
// =============================================================================

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (value) env[key] = value;
  }

  const envPath = resolve(PROJECT_ROOT, '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx);
      if (!env[key]) env[key] = trimmed.slice(eqIdx + 1).trim();
    }
  }

  return env;
}

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================

interface ProviderConfig {
  name: string;
  defaultModel: string;
  models: string[];
  createModel: (env: Record<string, string>, modelName: string) => LanguageModel;
  requiredEnvVars: string[];
}

const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    name: 'Google Gemini',
    defaultModel: 'gemini-3.1-pro-preview',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-3.1-pro-preview'],
    createModel: (env, model) => {
      const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
      return google(model);
    },
    requiredEnvVars: ['GOOGLE_GENERATIVE_AI_API_KEY'],
  },
  anthropic: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-sonnet-4-5-20250929',
    models: [
      'claude-opus-4-5-20251101',
      'claude-sonnet-4-5-20250929',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
    ],
    createModel: (env, model) => {
      const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
      return anthropic(model);
    },
    requiredEnvVars: ['ANTHROPIC_API_KEY'],
  },
  azure: {
    name: 'Azure OpenAI (UK South)',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o'],
    createModel: (env, model) => {
      const azure = createAzure({
        resourceName: env.AZURE_RESOURCE_NAME,
        apiKey: env.AZURE_API_KEY,
      });
      return azure(model);
    },
    requiredEnvVars: ['AZURE_RESOURCE_NAME', 'AZURE_API_KEY'],
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-5.4', 'gpt-5.4-pro', 'gpt-5.3-codex', 'o3', 'o4-mini'],
    createModel: (env, model) => {
      const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
      return openai(model);
    },
    requiredEnvVars: ['OPENAI_API_KEY'],
  },
};

const DEFAULT_PROVIDER = 'google';

// =============================================================================
// IMAGE SUPPORT
// =============================================================================

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function loadImage(imagePath: string): { data: Buffer; mimeType: string } {
  const resolved = resolve(imagePath);
  if (!existsSync(resolved)) {
    throw new ConsultError(`Image not found: ${resolved}`, EXIT.BAD_INPUT);
  }
  const ext = extname(resolved).toLowerCase();
  const mimeType = MIME_MAP[ext];
  if (!mimeType) {
    throw new ConsultError(`Unsupported image format: ${ext}. Supported: ${Object.keys(MIME_MAP).join(', ')}`, EXIT.BAD_INPUT);
  }
  return { data: readFileSync(resolved), mimeType };
}

// =============================================================================
// GROUNDING BLOCK INTEGRATION
// =============================================================================

async function getGroundingBlock(sectionOrDomain: string): Promise<string> {
  const { execSync } = await import('child_process');
  const packerPath = resolve(PROJECT_ROOT, '.cursor/skills/_shared/context-packer.ts');
  const result = execSync(`npx tsx "${packerPath}" --section "${sectionOrDomain}"`, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    timeout: 30000,
  });
  return result.trim();
}

// =============================================================================
// CORE: SEND AND RECEIVE
// =============================================================================

interface ConsultOptions {
  prompt: string;
  provider?: string;
  model?: string;
  images?: string[];
  system?: string;
  maxTokens?: number;
  thinking?: 'low' | 'medium' | 'high';
  jsonSchema?: string;
  groundingDomain?: string;
}

interface ConsultResult {
  text: string;
  object?: unknown;
  reasoning?: string;
  latencyMs: number;
  provider: string;
  model: string;
  usage: Record<string, unknown>;
  finishReason: string;
}

function extractReasoning(reasoning: unknown): string | undefined {
  if (!reasoning) return undefined;
  if (typeof reasoning === 'string') return reasoning;
  if (Array.isArray(reasoning)) {
    return reasoning
      .filter((r: any) => r.text)
      .map((r: any) => r.text)
      .join('\n')
      .trim() || undefined;
  }
  return undefined;
}

function inferProvider(modelName: string): string | undefined {
  for (const [key, config] of Object.entries(PROVIDERS)) {
    if (config.models.includes(modelName)) return key;
  }
  if (modelName.startsWith('gemini')) return 'google';
  if (modelName.startsWith('claude')) return 'anthropic';
  if (modelName.startsWith('gpt-') || modelName.startsWith('o1') || modelName.startsWith('o3')) return 'openai';
  return undefined;
}

function resolveProvider(opts: ConsultOptions): { providerKey: string; providerConfig: ProviderConfig; modelName: string; env: Record<string, string> } {
  const env = loadEnv();

  let providerKey = opts.provider || DEFAULT_PROVIDER;
  if (!opts.provider && opts.model) {
    const inferred = inferProvider(opts.model);
    if (inferred) {
      if (inferred !== DEFAULT_PROVIDER) {
        console.error(`[Consult] Auto-detected provider '${inferred}' from model '${opts.model}'`);
      }
      providerKey = inferred;
    }
  }

  const providerConfig = PROVIDERS[providerKey];
  if (!providerConfig) {
    const available = Object.keys(PROVIDERS).join(', ');
    throw new ConsultError(`Unknown provider: '${providerKey}'. Available: ${available}`, EXIT.BAD_INPUT);
  }

  for (const envVar of providerConfig.requiredEnvVars) {
    if (!env[envVar]) {
      throw new ConsultError(`Missing ${envVar}. Run with: infisical run --env=dev --domain https://eu.infisical.com -- npx tsx consult.ts`, EXIT.AUTH);
    }
  }

  const modelName = opts.model || providerConfig.defaultModel;
  if (!providerConfig.models.includes(modelName) && providerKey === (opts.provider || DEFAULT_PROVIDER)) {
    console.error(`Warning: '${modelName}' not in known models for ${providerKey}. Proceeding anyway.`);
  }

  return { providerKey, providerConfig, modelName, env };
}

function isGemini3x(modelName: string): boolean {
  return modelName.startsWith('gemini-3');
}

function buildProviderOptions(opts: ConsultOptions, providerKey: string, modelName: string): Record<string, unknown> {
  const extra: Record<string, unknown> = {};
  if (opts.maxTokens) {
    extra.maxTokens = opts.maxTokens;
    console.error(`[Consult] Max tokens: ${opts.maxTokens}`);
  }
  if (providerKey === 'google' && isGemini3x(modelName)) {
    const level = opts.thinking || 'low';
    extra.providerOptions = {
      google: {
        thinkingConfig: {
          thinkingLevel: level,
          includeThoughts: true,
        },
      },
    };
    if (!opts.thinking) {
      console.error(`[Consult] Thinking: low (default — use --thinking high for complex tasks)`);
    } else {
      console.error(`[Consult] Thinking: ${level}`);
    }
  } else if (providerKey === 'google' && opts.thinking) {
    console.error(`[Consult] Warning: --thinking level only supported for Gemini 3.x models, ignoring for ${modelName}`);
  } else if (opts.thinking) {
    console.error(`[Consult] Warning: --thinking only supported for Google models, ignoring`);
  }
  return extra;
}

function buildMessages(opts: ConsultOptions): Array<{ type: 'text'; text: string } | { type: 'image'; image: Buffer }> | null {
  if (!opts.images?.length) return null;
  const parts: Array<{ type: 'text'; text: string } | { type: 'image'; image: Buffer }> = [];
  for (const imgPath of opts.images) {
    const { data } = loadImage(imgPath);
    parts.push({ type: 'image', image: data });
  }
  parts.push({ type: 'text', text: opts.prompt });
  return parts;
}

function normalizeSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  if (schema.type === 'object') {
    schema.additionalProperties = false;
    if (schema.properties) {
      schema.required = Object.keys(schema.properties);
      for (const key of schema.required) {
        schema.properties[key] = normalizeSchema(schema.properties[key]);
      }
    }
  }
  if (schema.type === 'array' && schema.items) {
    schema.items = normalizeSchema(schema.items);
  }
  return schema;
}

async function checkGitDirty(): Promise<void> {
  try {
    const { execSync } = await import('child_process');
    const status = execSync('git status --porcelain', { encoding: 'utf-8', timeout: 5000 }).trim();
    if (status.length > 0) {
      const changedCount = status.split('\n').length;
      console.error(`⚠  WARNING: ${changedCount} uncommitted change(s). External LLMs will see stale context. Commit first.`);
    }
  } catch {}
}

async function consult(opts: ConsultOptions): Promise<ConsultResult> {
  await checkGitDirty();
  if (opts.groundingDomain) {
    const grounding = await getGroundingBlock(opts.groundingDomain);
    opts = { ...opts, prompt: `${grounding}\n\n${opts.prompt}` };
  }

  const { providerKey, providerConfig, modelName, env } = resolveProvider(opts);
  const model = providerConfig.createModel(env, modelName);
  const extra = buildProviderOptions(opts, providerKey, modelName);

  console.error(`[Consult] ${providerConfig.name} / ${modelName}`);
  if (opts.groundingDomain) console.error(`[Consult] Grounding: ${opts.groundingDomain}`);
  if (opts.images?.length) console.error(`[Consult] Images: ${opts.images.length} attached`);
  if (opts.jsonSchema) console.error(`[Consult] Structured output: schema loaded`);

  const stopHeartbeat = startHeartbeat();
  const start = Date.now();

  try {
    if (opts.jsonSchema) {
      const schemaPath = resolve(opts.jsonSchema);
      if (!existsSync(schemaPath)) {
        throw new ConsultError(`Schema file not found: ${schemaPath}`, EXIT.BAD_INPUT);
      }
      const rawSchema = normalizeSchema(JSON.parse(readFileSync(schemaPath, 'utf-8')));
      const contentParts = buildMessages(opts);

      const baseOpts: Record<string, unknown> = {
        model,
        schema: aiJsonSchema(rawSchema),
        ...extra,
      };

      if (contentParts || opts.system) {
        baseOpts.system = opts.system;
        baseOpts.messages = [{ role: 'user', content: contentParts || [{ type: 'text' as const, text: opts.prompt }] }];
      } else {
        baseOpts.prompt = opts.prompt;
      }

      const { object, usage, finishReason } = await generateObject(baseOpts as any);
      const latencyMs = Date.now() - start;
      console.error(`[Consult] Response received (${latencyMs}ms)`);
      return {
        text: JSON.stringify(object),
        object,
        latencyMs,
        provider: providerKey,
        model: modelName,
      usage: usage ?? {},
      finishReason: finishReason ?? 'unknown',
    };
  }

    const contentParts = buildMessages(opts);
    const baseOpts: Record<string, unknown> = { model, ...extra };

    if (contentParts || opts.system) {
      baseOpts.system = opts.system;
      baseOpts.messages = [{ role: 'user', content: contentParts || [{ type: 'text' as const, text: opts.prompt }] }];
    } else {
      baseOpts.prompt = opts.prompt;
    }

    const { text, reasoning, usage, finishReason } = await generateText(baseOpts as any);
    const latencyMs = Date.now() - start;
    console.error(`[Consult] Response received (${latencyMs}ms)`);
    return {
      text,
      reasoning: extractReasoning(reasoning),
      latencyMs,
      provider: providerKey,
      model: modelName,
      usage: usage ?? {},
      finishReason: finishReason ?? 'unknown',
    };
  } finally {
    stopHeartbeat();
  }
}

// =============================================================================
// CLI
// =============================================================================

const args = process.argv.slice(2);
const KNOWN_FLAGS = ['--send', '--file', '--provider', '--model', '--image', '--system', '--max-tokens', '--thinking', '--json', '--json-schema', '--list', '--grounded'];

function isKnownFlag(val: string): boolean {
  return KNOWN_FLAGS.includes(val);
}

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  const val = args[idx + 1];
  if (!val || isKnownFlag(val)) return undefined;
  return val;
}

function getArgs(flag: string): string[] {
  const results: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1] && !isKnownFlag(args[i + 1])) {
      results.push(args[i + 1]);
    }
  }
  return results;
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function buildConsultOpts(prompt: string): ConsultOptions {
  const maxTokensRaw = getArg('--max-tokens');
  return {
    prompt,
    provider: getArg('--provider'),
    model: getArg('--model'),
    images: getArgs('--image').length ? getArgs('--image') : undefined,
    system: getArg('--system'),
    maxTokens: maxTokensRaw ? parseInt(maxTokensRaw, 10) : undefined,
    thinking: getArg('--thinking') as ConsultOptions['thinking'],
    jsonSchema: getArg('--json-schema'),
    groundingDomain: getArg('--grounded') || undefined,
  };
}

function outputResult(result: ConsultResult, jsonMode: boolean): void {
  if (jsonMode) {
    const envelope: Record<string, unknown> = {
      response: result.object ?? result.text,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
      usage: result.usage,
      finishReason: result.finishReason,
    };
    if (result.reasoning) envelope.reasoning = result.reasoning;
    console.log(JSON.stringify(envelope));
  } else {
    if (result.reasoning) console.error(`\n[Thinking]\n${result.reasoning}\n`);
    console.log(result.text);
  }
}

async function run(): Promise<void> {
  const jsonMode = hasFlag('--json') || hasFlag('--json-schema');

  if (hasFlag('--send') && hasFlag('--file')) {
    throw new ConsultError('Cannot use both --send and --file. Pick one.', EXIT.BAD_INPUT);
  }

  if (hasFlag('--list')) {
    console.log('Available providers:\n');
    for (const [key, config] of Object.entries(PROVIDERS)) {
      const isDefault = key === DEFAULT_PROVIDER ? ' (default)' : '';
      console.log(`  ${key.padEnd(12)} ${config.name}${isDefault}`);
      console.log(`  ${''.padEnd(12)} Models: ${config.models.join(', ')}`);
      console.log(`  ${''.padEnd(12)} Default: ${config.defaultModel}\n`);
    }
    return;
  }

  if (hasFlag('--send')) {
    const prompt = getArg('--send');
    if (!prompt) throw new ConsultError('--send requires a prompt argument', EXIT.BAD_INPUT);
    const result = await consult(buildConsultOpts(prompt));
    outputResult(result, jsonMode);
    return;
  }

  if (hasFlag('--file')) {
    const filePath = getArg('--file');
    if (!filePath) throw new ConsultError('--file requires a file path argument', EXIT.BAD_INPUT);
    if (!existsSync(filePath)) throw new ConsultError(`File not found: ${filePath}`, EXIT.BAD_INPUT);
    const prompt = readFileSync(filePath, 'utf-8');
    const result = await consult(buildConsultOpts(prompt));
    outputResult(result, jsonMode);
    return;
  }

  console.log(`API Consult Bridge v3.0 — Stateless cross-model consultation

Usage:
  consult.ts --send "prompt"                           Default: Gemini 3.1 Pro
  consult.ts --send "prompt" --provider anthropic      Use specific provider
  consult.ts --send "prompt" --model gemini-2.5-flash  Use specific model
  consult.ts --file ./prompt.txt                       Read prompt from file
  consult.ts --image ./ui.png --send "What's this?"    Attach image to prompt
  consult.ts --system "You are an expert" --send "..."  Set system/role context
  consult.ts --send "prompt" --max-tokens 32000        Set max output tokens
  consult.ts --send "prompt" --thinking high           Deep reasoning (Google 3.x)
  consult.ts --send "prompt" --json                    Output as JSON envelope
  consult.ts --send "prompt" --json-schema schema.json Structured output via schema
  consult.ts --grounded "System Reference" --send "..."  Auto-prepend llms.txt section
  consult.ts --list                                    List providers and models

Output Modes:
  (default)        Plain text to stdout, diagnostics to stderr
  --json           JSON envelope: { response, model, provider, latencyMs, usage, finishReason }
  --json-schema F  Structured output matching schema file F (implies --json)

Thinking (Gemini 3.x only — defaults to low if omitted):
  --thinking low       Fast reasoning (~30s, ~3K tokens). Default for 3.x.
  --thinking medium    Orchestration (~60s, ~5K tokens). Multi-file context.
  --thinking high      Deep reasoning (~3-5min, ~20K+ tokens). Strict constraints.

Exit Codes:
  0  Success
  1  Bad input (missing args, invalid flags, file not found)
  2  Auth error (missing or invalid API key)
  3  Rate limit or timeout (retryable — back off and retry)
  4  Context window exceeded (truncate prompt and retry)
  5  Safety/content filter (rewrite prompt or abort)
  6  Schema validation failed (simplify schema)
  7  Unknown error (do not retry — investigate)

Keys:
  Injected via Infisical: infisical run --env=dev --domain https://eu.infisical.com
`);
}

run().catch(err => {
  const code = classifyError(err);
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error [exit ${code}]: ${msg}`);
  process.exitCode = code;
});

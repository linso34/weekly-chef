import { getApiKey, getSettings, DEFAULTS } from './settings.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const RETRYABLE = new Set([429, 500, 503]);
const MAX_RETRIES = 3;
const TIMEOUT_MS = 60_000;

export class GeminiError extends Error {
  // code: no_key | bad_key | rate_limited | blocked | empty | bad_json | network | http
  constructor(message, { code = 'http', status } = {}) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.status = status;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(body, { model, signal } = {}) {
  const key = getApiKey();
  if (!key) throw new GeminiError('No Gemini API key set. Add one in Settings.', { code: 'no_key' });
  const url = `${BASE}/${model ?? getSettings().model ?? DEFAULTS.model}:generateContent`;

  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await sleep(800 * 2 ** attempt);
        continue;
      }
      throw new GeminiError(`Network error: ${err.message}`, { code: 'network' });
    }

    if (res.ok) return res.json();

    if (RETRYABLE.has(res.status) && attempt < MAX_RETRIES) {
      await sleep(800 * 2 ** attempt + Math.random() * 300);
      continue;
    }

    const detail = await res.json().catch(() => null);
    const message = detail?.error?.message ?? res.statusText;
    const code =
      res.status === 403 || (res.status === 400 && /api key/i.test(message))
        ? 'bad_key'
        : res.status === 429
          ? 'rate_limited'
          : 'http';
    throw new GeminiError(message, { code, status: res.status });
  }
}

function extractText(data) {
  const candidate = data.candidates?.[0];
  if (!candidate) {
    const reason = data.promptFeedback?.blockReason;
    throw new GeminiError(reason ? `Prompt blocked: ${reason}` : 'No response from model', { code: 'blocked' });
  }
  const text = (candidate.content?.parts ?? []).map((p) => p.text ?? '').join('');
  if (!text) throw new GeminiError(`Empty response (${candidate.finishReason ?? 'unknown'})`, { code: 'empty' });
  return text;
}

function buildBody({ prompt, system, schema, json, temperature }) {
  const generationConfig = { temperature };
  if (json || schema) {
    generationConfig.responseMimeType = 'application/json';
    if (schema) generationConfig.responseSchema = schema;
  }
  return {
    ...(system && { systemInstruction: { parts: [{ text: system }] } }),
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  };
}

/** Plain text completion. */
export async function generateText({ prompt, system, temperature = 0.7, model, signal }) {
  return extractText(await request(buildBody({ prompt, system, temperature }), { model, signal }));
}

/** Structured completion. Pass a Gemini responseSchema (OpenAPI subset) to get validated JSON back. */
export async function generateJSON({ prompt, system, schema, temperature = 0.7, model, signal }) {
  const text = extractText(await request(buildBody({ prompt, system, schema, json: true, temperature }), { model, signal }));
  try {
    return JSON.parse(text);
  } catch {
    throw new GeminiError('Model returned invalid JSON', { code: 'bad_json' });
  }
}

/** Cheap connectivity/key check for the Settings screen. */
export async function ping() {
  const out = await generateText({ prompt: 'Reply with the single word: ok', temperature: 0 });
  return out.trim();
}

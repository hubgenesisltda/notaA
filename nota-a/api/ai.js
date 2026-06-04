// ═══════════════════════════════════════════════════════════════════════════
// NOTA A — EDGE FUNCTION: /api/ai
// Proxy seguro da Gemini API (validação gratuita)
//
// Variáveis de ambiente necessárias (Vercel Dashboard → Settings → Env Vars):
//   GEMINI_API_KEY         — chave do Google AI Studio (gratuita)
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE
//
// Como obter a chave:
//   aistudio.google.com → Get API Key → criar projeto → copiar chave
// ═══════════════════════════════════════════════════════════════════════════

export const config = { runtime: 'edge' };

import { getUserFromRequest } from '../lib/supabase.js';
import { verificarLimite, registrarUso } from '../lib/ratelimit.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

const MODEL   = 'gemini-2.0-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const MAX_TOKENS_POR_MODULO = {
  quiz:      600,
  socratica: 400,
  redacao:   1000,
  insight:   400,
  simulado:  600,
  default:   800,
};

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';

  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405, origin);
  }

  if (!process.env.GEMINI_API_KEY) {
    return json({ error: 'GEMINI_API_KEY não configurada no servidor.' }, 500, origin);
  }

  // Auth
  const { user, error: authError } = await getUserFromRequest(req);
  if (authError) return json({ error: authError }, 401, origin);

  // Parse body
  let body;
  try { body = await req.json(); }
  catch { return json({ error: 'Body JSON inválido.' }, 400, origin); }

  if (!Array.isArray(body.messages) || !body.messages.length) {
    return json({ error: '"messages" é obrigatório.' }, 400, origin);
  }

  const modulo    = body.modulo || 'default';
  const maxTokens = MAX_TOKENS_POR_MODULO[modulo] || MAX_TOKENS_POR_MODULO.default;

  // Rate limit
  const limite = await verificarLimite(user.id, modulo);
  if (!limite.ok) {
    return json({ error: limite.motivo, restantes: 0 }, 429, origin);
  }

  // Converter mensagens para formato Gemini
  // Anthropic: [{role:'user'|'assistant', content:'...'}]
  // Gemini:    [{role:'user'|'model',     parts:[{text:'...'}]}]
  let contents = body.messages.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Gemini rejeita histórico que começa com 'model'
  if (contents[0]?.role === 'model') contents = contents.slice(1);

  const geminiBody = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  };

  // System instruction (campo separado no Gemini)
  if (body.system) {
    geminiBody.systemInstruction = { parts: [{ text: body.system }] };
  }

  const endpoint = `${BASE_URL}/${MODEL}:generateContent?key=${import.meta.env.GEMINI_API_KEY}`;

  let geminiRes;
  try {
    geminiRes = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiBody),
    });
  } catch {
    return json({ error: 'Serviço de IA temporariamente indisponível.' }, 503, origin);
  }

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    return json({ error: err.error?.message || 'Erro na API Gemini.' }, 502, origin);
  }

  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Registrar uso (sem tokens exatos — Gemini retorna usageMetadata)
  const tokensIn  = data.usageMetadata?.promptTokenCount     || 0;
  const tokensOut = data.usageMetadata?.candidatesTokenCount || 0;

  registrarUso(user.id, modulo, tokensIn, tokensOut).catch(() => {});

  // Retornar no mesmo formato que o Anthropic retornava
  // para não precisar mudar nada no frontend
  return json({
    content: [{ type: 'text', text }],
    usage:   { input_tokens: tokensIn, output_tokens: tokensOut },
  }, 200, origin, {
    'X-RateLimit-Remaining': String(limite.restantes - 1),
  });
}

function json(data, status = 200, origin = '', extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), ...extra },
  });
}

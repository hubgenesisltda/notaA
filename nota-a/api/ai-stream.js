// ═══════════════════════════════════════════════════════════════════════════
// NOTA A — EDGE FUNCTION: /api/ai-stream
// Versão com streaming (SSE) para a IA Socrática
//
// Uso: quando o usuário está aguardando resposta da socrática e queremos
// mostrar o texto sendo gerado progressivamente (melhor UX).
//
// O frontend recebe eventos SSE:
//   data: {"type":"delta","text":"..."}
//   data: {"type":"done","usage":{"input_tokens":N,"output_tokens":N}}
//   data: {"type":"error","message":"..."}
// ═══════════════════════════════════════════════════════════════════════════

export const config = { runtime: 'edge' };

import { getUserFromRequest } from '../lib/supabase.js';
import { verificarLimite, registrarUso } from '../lib/ratelimit.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

const MODELO = 'claude-sonnet-4-20250514';

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';

  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return errorResponse('Método não permitido.', 405, origin);
  }

  // Auth
  const { user, error: authError } = await getUserFromRequest(req);
  if (authError) return errorResponse(authError, 401, origin);

  // Rate limit
  const limite = await verificarLimite(user.id, 'socratica');
  if (!limite.ok) return errorResponse(limite.motivo, 429, origin);

  let body;
  try { body = await req.json(); }
  catch { return errorResponse('Body JSON inválido.', 400, origin); }

  if (!body.messages?.length) {
    return errorResponse('"messages" é obrigatório.', 400, origin);
  }

  const anthropicBody = {
    model:      MODELO,
    max_tokens: 400,
    stream:     true,
    messages:   body.messages,
  };
  if (body.system) anthropicBody.system = body.system;

  // Chamar Anthropic com streaming
  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         import.meta.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    });
  } catch {
    return errorResponse('Serviço de IA indisponível.', 503, origin);
  }

  if (!anthropicRes.ok) {
    return errorResponse('Erro da API de IA.', 502, origin);
  }

  // Transformar o stream SSE da Anthropic em SSE para o cliente
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (data) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Processar stream em background
  (async () => {
    const reader = anthropicRes.body.getReader();
    const dec = new TextDecoder();
    let buffer = '';
    let tokensIn = 0, tokensOut = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;

          try {
            const evt = JSON.parse(raw);

            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              await sendEvent({ type: 'delta', text: evt.delta.text });
            }
            if (evt.type === 'message_delta' && evt.usage) {
              tokensOut = evt.usage.output_tokens || 0;
            }
            if (evt.type === 'message_start' && evt.message?.usage) {
              tokensIn = evt.message.usage.input_tokens || 0;
            }
          } catch { /* linha malformada — ignorar */ }
        }
      }

      await sendEvent({ type: 'done', usage: { input_tokens: tokensIn, output_tokens: tokensOut } });
      registrarUso(user.id, 'socratica', tokensIn, tokensOut).catch(() => {});
    } catch (err) {
      await sendEvent({ type: 'error', message: 'Erro durante o streaming.' });
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      ...corsHeaders(origin),
    },
  });
}

function errorResponse(message, status, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

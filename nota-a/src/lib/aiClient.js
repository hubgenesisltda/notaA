const MODEL   = 'gemini-2.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const MAX_TOKENS = {
  quiz:      600,
  socratica: 400,
  redacao:   1000,
  insight:   400,
  simulado:  600,
  previsao:  800,
  narrativa: 800,
  default:   800,
};

class GeminiClient {
  constructor(model = MODEL) {
    this.model = model;
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      console.error('[GeminiClient] VITE_GEMINI_API_KEY não está definida no .env');
    }
  }

  async call({ messages, system, modulo = 'default' }) {
    if (!this.apiKey) throw new Error('VITE_GEMINI_API_KEY não configurada.');

    // Anthropic format → Gemini format
    let contents = messages.map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Gemini rejeita histórico que começa com 'model'
    if (contents[0]?.role === 'model') contents = contents.slice(1);

    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: MAX_TOKENS[modulo] ?? MAX_TOKENS.default,
        temperature: 0.7,
      },
    };

    if (system?.trim()) {
      body.systemInstruction = { parts: [{ text: system }] };
    }

    let res;
    try {
      res = await fetch(
        `${BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
      );
    } catch (networkErr) {
      console.error('[GeminiClient] Erro de rede:', networkErr);
      throw networkErr;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${res.status}`;
      console.error('[GeminiClient] Erro da API Gemini:', msg, err);
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      console.warn('[GeminiClient] Resposta vazia. Candidatos recebidos:', JSON.stringify(data.candidates));
    }

    return { content: [{ type: 'text', text }] };
  }
}

export const gemini = new GeminiClient();

export async function callAI(opts) {
  return gemini.call(opts);
}

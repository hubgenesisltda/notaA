const MODEL   = 'gemini-2.0-flash';
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
  }

  async call({ messages, system, modulo = 'default' }) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY não configurada.');

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

    if (system) {
      body.systemInstruction = { parts: [{ text: system }] };
    }

    const res = await fetch(
      `${BASE_URL}/${this.model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Retorna no mesmo formato que o frontend já espera (content[0].text)
    return { content: [{ type: 'text', text }] };
  }
}

export const gemini = new GeminiClient();

export async function callAI(opts) {
  return gemini.call(opts);
}

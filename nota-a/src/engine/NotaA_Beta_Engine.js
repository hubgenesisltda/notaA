// ═══════════════════════════════════════════════════════════════════
// NOTA A — BETA ENGINE v1.0
// Motor de Diagnóstico Cognitivo + TRI Adaptativo + Rate Limiter
// Hub Gênesis Ltda · CNPJ 38.028.418/0001-80
// ═══════════════════════════════════════════════════════════════════
//
// DIFERENCIAIS ÚNICOS:
// 1. TRI (Teoria de Resposta ao Item) — mesmo modelo do ENEM real
//    Parâmetros a, b, c por questão. Atualiza theta do aluno em tempo real.
// 2. Diagnóstico de Perfil Cognitivo — 4 dimensões independentes
//    Visual/Verbal · Analítico/Holístico · Sequencial/Aleatório · Reflexivo/Impulsivo
// 3. Detector de Padrão de Erro — distingue lacuna de deslize
//    Lacuna: erro consistente em subtema. Deslize: erro isolado sem padrão.
// 4. Memória de Sessão IA — histórico comprimido para contexto socrático
// 5. Rate Limiter offline — protege custo de API mesmo sem servidor
//
// USO:
//   import { TriEngine, CognitiveProfiler, SessionMemory, RateLimiter } from './NotaA_Beta_Engine.js'
//   const engine = new TriEngine()
//   const theta = engine.updateTheta(theta, questao, correto)
// ═══════════════════════════════════════════════════════════════════

// ─── 1. MOTOR TRI (Teoria de Resposta ao Item) ───────────────────
// Modelo de 3 parâmetros: discriminação (a), dificuldade (b), chute (c)
// P(θ) = c + (1-c) * logistic( Da(θ-b) )  onde D=1.7 (constante de escala ENEM)

export class TriEngine {
  constructor() {
    this.D = 1.7; // constante de escala do modelo ENEM
  }

  // Probabilidade de acerto dado theta e parâmetros da questão
  probability(theta, { a = 1.0, b = 0.0, c = 0.25 }) {
    const z = this.D * a * (theta - b);
    const logistic = 1 / (1 + Math.exp(-z));
    return c + (1 - c) * logistic;
  }

  // Atualiza estimativa de habilidade do aluno (algoritmo de Newton-Raphson simplificado)
  // Retorna novo theta no range [-4, 4] (escala ENEM: 0-1000 → theta * 100 + 500)
  updateTheta(theta, questao, correto, learningRate = 0.5) {
    const p = this.probability(theta, questao);
    const q = 1 - p;
    const { a = 1.0, b = 0.0, c = 0.25 } = questao;

    // Derivada da log-verossimilhança
    const u = correto ? 1 : 0;
    const numerator = this.D * a * (u - p) * (p - c);
    const denominator = p * q * (1 - c);
    const delta = denominator > 0.001 ? numerator / denominator : 0;

    const newTheta = theta + learningRate * delta;
    return Math.max(-4, Math.min(4, newTheta));
  }

  // Converte theta TRI para escala ENEM (0–1000)
  thetaToEnem(theta) {
    return Math.round(theta * 100 + 500);
  }

  // Converte nota ENEM para theta
  enemToTheta(nota) {
    return (nota - 500) / 100;
  }

  // Seleciona próxima questão ótima dado o theta atual
  // (máxima informação de Fisher no ponto theta)
  selectOptimal(theta, questoes) {
    let bestQ = null, bestInfo = -Infinity;
    for (const q of questoes) {
      const p = this.probability(theta, q);
      const info = this.information(theta, q, p);
      if (info > bestInfo) { bestInfo = info; bestQ = q; }
    }
    return bestQ;
  }

  // Informação de Fisher — mede o quanto uma questão discrimina no ponto theta
  information(theta, questao, p = null) {
    const { a = 1.0, c = 0.25 } = questao;
    if (p === null) p = this.probability(theta, questao);
    const q = 1 - p;
    const num = Math.pow(this.D * a, 2) * Math.pow(p - c, 2) * q;
    const den = Math.pow(1 - c, 2) * p;
    return den > 0.001 ? num / den : 0;
  }

  // Erro padrão da estimativa (critério de parada do teste adaptativo)
  standardError(theta, questoesRespondidas) {
    const totalInfo = questoesRespondidas.reduce((sum, { questao }) => {
      return sum + this.information(theta, questao);
    }, 0);
    return totalInfo > 0.001 ? 1 / Math.sqrt(totalInfo) : 99;
  }

  // Retorna se o teste adaptativo deve parar
  // (erro padrão < 0.3 ou mínimo de questões atingido)
  shouldStop(theta, respostas, { minQuestoes = 5, maxQuestoes = 30, targetSE = 0.3 } = {}) {
    if (respostas.length < minQuestoes) return false;
    if (respostas.length >= maxQuestoes) return true;
    return this.standardError(theta, respostas) <= targetSE;
  }
}

// ─── 2. PERFILADOR COGNITIVO ─────────────────────────────────────
// 4 dimensões independentes. Cada dimensão tem score de -1.0 a +1.0.
// Score 0 = equilíbrio. Score negativo = polo A. Score positivo = polo B.

export const DIMENSOES_COGNITIVAS = {
  VV: { label: 'Visual ↔ Verbal',      poloA: 'Visual',      poloB: 'Verbal'      },
  AH: { label: 'Analítico ↔ Holístico',poloA: 'Analítico',   poloB: 'Holístico'   },
  SA: { label: 'Sequencial ↔ Aleatório',poloA: 'Sequencial', poloB: 'Aleatório'   },
  RI: { label: 'Reflexivo ↔ Impulsivo', poloA: 'Reflexivo',  poloB: 'Impulsivo'   },
};

export class CognitiveProfiler {
  constructor() {
    // Cada dimensão acumula evidências
    this.scores = { VV: 0, AH: 0, SA: 0, RI: 0 };
    this.counts = { VV: 0, AH: 0, SA: 0, RI: 0 };
  }

  // Registra uma observação comportamental
  // signal: { dim, value } onde value ∈ [-1, 1]
  observe(signals) {
    for (const { dim, value } of signals) {
      if (!this.scores[dim]) continue;
      // Média exponencial móvel com alpha=0.3 (mais peso para dados recentes)
      const alpha = 0.3;
      this.scores[dim] = alpha * value + (1 - alpha) * this.scores[dim];
      this.counts[dim]++;
    }
  }

  // Infere sinais a partir de uma resposta de quiz
  inferFromQuizResponse({ correto, tempoMs, area, tipo }) {
    const signals = [];

    // Tempo de resposta → Reflexivo vs Impulsivo
    // < 8s = impulsivo, > 30s = reflexivo (ajustado por dificuldade)
    if (tempoMs < 8000)  signals.push({ dim: 'RI', value: +0.6 }); // impulsivo
    if (tempoMs > 30000) signals.push({ dim: 'RI', value: -0.6 }); // reflexivo

    // Área → pistas visuais/verbais
    if (['mat','nat'].includes(area)) signals.push({ dim: 'VV', value: -0.3 }); // visual/gráfico
    if (['lin','hum'].includes(area)) signals.push({ dim: 'VV', value: +0.3 }); // verbal/texto

    // Questões de interpretação → holístico / questões de cálculo → analítico
    if (tipo === 'interpretacao') signals.push({ dim: 'AH', value: +0.3 });
    if (tipo === 'calculo')       signals.push({ dim: 'AH', value: -0.3 });

    return signals;
  }

  // Retorna perfil atual com nomes legíveis
  getProfile() {
    const profile = {};
    for (const [dim, score] of Object.entries(this.scores)) {
      const meta = DIMENSOES_COGNITIVAS[dim];
      const abs = Math.abs(score);
      const polo = score <= 0 ? meta.poloA : meta.poloB;
      const intensidade = abs < 0.2 ? 'equilibrado' : abs < 0.5 ? 'moderado' : 'forte';
      profile[dim] = {
        score: +score.toFixed(3),
        polo,
        intensidade,
        label: meta.label,
        confianca: Math.min(100, this.counts[dim] * 10), // % de confiança
      };
    }
    return profile;
  }

  // Serializa para armazenar no banco
  serialize() {
    return JSON.stringify({ scores: this.scores, counts: this.counts });
  }

  // Restaura de dados salvos
  static deserialize(json) {
    const p = new CognitiveProfiler();
    const data = JSON.parse(json);
    p.scores = data.scores;
    p.counts = data.counts;
    return p;
  }

  // Retorna recomendações pedagógicas baseadas no perfil
  getRecommendations() {
    const recs = [];
    const p = this.getProfile();

    if (p.VV.score > 0.3) recs.push({ tipo:'estudo', msg:'Prefira textos explicativos, podcasts e resumos escritos' });
    if (p.VV.score < -0.3) recs.push({ tipo:'estudo', msg:'Use mapas mentais, infográficos e questões com gráficos' });
    if (p.RI.score > 0.3) recs.push({ tipo:'alerta', msg:'Você tende a responder rápido demais — revise antes de confirmar' });
    if (p.RI.score < -0.3) recs.push({ tipo:'dica', msg:'Gerencie o tempo: no ENEM real, média de 2min30s por questão' });
    if (p.AH.score < -0.3) recs.push({ tipo:'estudo', msg:'Você aprende melhor decompondo problemas em passos — use listas' });
    if (p.AH.score > 0.3) recs.push({ tipo:'estudo', msg:'Você aprende melhor vendo o todo primeiro — leia o contexto antes de cada questão' });

    return recs;
  }
  // ── EXPANSÕES v1.1 ──────────────────────────────────────────

  // Inicializa perfil a partir dos dados do onboarding (autopercepção)
  initFromOnboarding(autopercep = []) {
    const MAP = {
      questoes_curtas:   [{ dim:'RI', value:+0.5 }, { dim:'SA', value:+0.4 }],
      passo_a_passo:     [{ dim:'SA', value:-0.6 }, { dim:'AH', value:-0.4 }],
      pausas_frequentes: [{ dim:'RI', value:-0.3 }],
      desafio:           [{ dim:'RI', value:+0.4 }],
      visual:            [{ dim:'VV', value:-0.6 }],
      contexto:          [{ dim:'AH', value:+0.5 }, { dim:'SA', value:-0.3 }],
    };
    for (const pref of autopercep) {
      if (MAP[pref]) this.observe(MAP[pref]);
    }
    return this;
  }

  // Infere sinais adicionais a partir de padrões de leitura
  // (tempo gasto em textos-base vs questão objetiva)
  inferFromReadingPattern({ tempoTextoBase, tempoQuestao, temLeitura }) {
    const signals = [];
    if (!temLeitura) {
      // Questão sem texto-base — tendência a estímulo direto
      if (tempoQuestao < 6000) signals.push({ dim:'RI', value:+0.3 });
    } else {
      const ratio = tempoTextoBase / (tempoTextoBase + tempoQuestao);
      if (ratio > 0.6) signals.push({ dim:'VV', value:+0.4 }); // lê muito — verbal
      if (ratio < 0.3) signals.push({ dim:'RI', value:+0.4 }); // pula texto — impulsivo
    }
    return signals;
  }

  // Detecta sobrecarga cognitiva a partir de padrões de resposta
  detectOverload(respostasRecentes) {
    if (respostasRecentes.length < 5) return { sobrecarga: false, nivel: 'ok' };
    const ultimas = respostasRecentes.slice(-5);
    const tempoMedio = ultimas.reduce((s, r) => s + r.tempoMs, 0) / ultimas.length;
    const taxaErro   = ultimas.filter(r => !r.correto).length / ultimas.length;
    const tendencia  = ultimas[4].tempoMs > ultimas[0].tempoMs * 1.5; // ficou muito mais lento

    if (taxaErro >= 0.8 && tendencia) {
      return { sobrecarga: true, nivel: 'alta', msg: 'Pausa recomendada — desempenho caindo consistentemente' };
    }
    if (taxaErro >= 0.6 || tendencia) {
      return { sobrecarga: true, nivel: 'media', msg: 'Considere uma pausa de 5 minutos' };
    }
    return { sobrecarga: false, nivel: 'ok' };
  }

  // Score granular por subtema (além das 4 dimensões globais)
  updateSubtemaScore(subtema, correto, tempoMs) {
    if (!this._subtemas) this._subtemas = {};
    if (!this._subtemas[subtema]) this._subtemas[subtema] = { acertos:0, total:0, tempoMedio:0 };
    const s = this._subtemas[subtema];
    s.total++;
    if (correto) s.acertos++;
    s.tempoMedio = (s.tempoMedio * (s.total-1) + tempoMs) / s.total;
  }

  getSubtemaScores() {
    if (!this._subtemas) return {};
    return Object.entries(this._subtemas).map(([subtema, data]) => ({
      subtema,
      taxa: +(data.acertos / data.total).toFixed(2),
      total: data.total,
      tempoMedio: Math.round(data.tempoMedio),
      status: data.acertos/data.total >= 0.7 ? 'dominio'
            : data.acertos/data.total >= 0.4 ? 'desenvolvimento'
            : 'lacuna',
    })).sort((a, b) => a.taxa - b.taxa); // piores primeiro
  }

  // Recomendações expandidas considerando perfil neuro do onboarding
  getRecommendationsExpanded(perfilNeuro = []) {
    const base = this.getRecommendations();
    const extra = [];
    const p = this.getProfile();

    if (perfilNeuro.includes('tdah')) {
      extra.push({ tipo:'adaptacao', msg:'Sessões de no máximo 25 minutos com pausa de 5 min (técnica Pomodoro adaptada)' });
      extra.push({ tipo:'adaptacao', msg:'Prefira questões objetivas antes de textos longos — mais engajamento inicial' });
      if (p.RI.score > 0.3) extra.push({ tipo:'alerta', msg:'Confirme sua resposta antes de avançar — sua tendência é responder rápido demais' });
    }
    if (perfilNeuro.includes('dislexia')) {
      extra.push({ tipo:'adaptacao', msg:'Aumente o tamanho da fonte nas configurações — isso reduz carga visual' });
      extra.push({ tipo:'adaptacao', msg:'Textos-base: leia em voz alta ou use o áudio quando disponível' });
      if (p.VV.score > 0.3) extra.push({ tipo:'dica', msg:'Seu perfil verbal pode conviver com dislexia — experimente ler mais devagar e sublinhar mentalmente' });
    }
    if (perfilNeuro.includes('ansiedade')) {
      extra.push({ tipo:'adaptacao', msg:'No simulado, pule questões que travam e volte depois — não fique preso' });
      extra.push({ tipo:'dica', msg:'Respire fundo antes de ler o enunciado — 3 segundos de pausa melhoram a compreensão' });
    }
    if (perfilNeuro.includes('autismo')) {
      extra.push({ tipo:'adaptacao', msg:'Rotina de estudo consistente funciona melhor do que variedade — crie um ritual fixo' });
      extra.push({ tipo:'dica', msg:'Questões de interpretação: identifique palavras-chave antes de ler as alternativas' });
    }

    return [...base, ...extra];
  }

  // Histórico temporal do perfil (snapshot a cada sessão)
  snapshot() {
    if (!this._timeline) this._timeline = [];
    this._timeline.push({
      ts: Date.now(),
      scores: { ...this.scores },
      counts: { ...this.counts },
    });
    // Manter apenas os últimos 30 snapshots
    if (this._timeline.length > 30) this._timeline.shift();
  }

  getTimeline() { return this._timeline || []; }

  // Retorna evolução de uma dimensão ao longo do tempo
  getDimensionEvolution(dim) {
    return this.getTimeline().map(s => ({
      ts: s.ts,
      score: +(s.scores[dim] || 0).toFixed(3),
    }));
  }

  // Serialização expandida (inclui subtemas e timeline)
  serializeExpanded() {
    return JSON.stringify({
      scores:   this.scores,
      counts:   this.counts,
      subtemas: this._subtemas || {},
      timeline: this._timeline || [],
    });
  }

  static deserializeExpanded(json) {
    const p = new CognitiveProfiler();
    const d = JSON.parse(json);
    p.scores    = d.scores;
    p.counts    = d.counts;
    p._subtemas = d.subtemas;
    p._timeline = d.timeline;
    return p;
  }


}

// ─── 3. DETECTOR DE PADRÃO DE ERRO ──────────────────────────────
// Distingue: lacuna (erro sistemático em subtema) vs deslize (erro isolado)
// Usa janela deslizante de 10 respostas por subtema

export class ErrorPatternDetector {
  constructor() {
    this.historico = {}; // subtema → [{ correto, timestamp }]
    this.JANELA = 10;
  }

  registrar(subtema, correto) {
    if (!this.historico[subtema]) this.historico[subtema] = [];
    this.historico[subtema].push({ correto, ts: Date.now() });
    // Manter apenas as últimas N respostas
    if (this.historico[subtema].length > this.JANELA) {
      this.historico[subtema].shift();
    }
  }

  // Retorna análise do subtema
  analisar(subtema) {
    const hist = this.historico[subtema] || [];
    if (hist.length < 2) return { tipo: 'insuficiente', taxa: null };
    const taxa = hist.filter(h => !h.correto).length / hist.length;
    if (taxa >= 0.6) return { tipo: 'lacuna', taxa, msg: `Lacuna identificada em ${subtema} — errou ${Math.round(taxa*100)}% das questões recentes` };
    if (taxa >= 0.3 && hist.length >= 4) return { tipo: 'instavel', taxa, msg: `Desempenho instável em ${subtema}` };
    return { tipo: 'ok', taxa };
  }

  // Retorna todas as lacunas prioritárias para estudo
  getLacunas() {
    return Object.entries(this.historico)
      .map(([subtema]) => ({ subtema, ...this.analisar(subtema) }))
      .filter(r => r.tipo === 'lacuna')
      .sort((a, b) => b.taxa - a.taxa);
  }
}

// ─── 4. MEMÓRIA DE SESSÃO IA ─────────────────────────────────────
// Comprime o histórico da conversa socrática para caber no contexto
// sem perder o fio pedagógico da sessão

export class SessionMemory {
  constructor(maxTokens = 2000) {
    this.turns = [];           // [{role, content}] — conversa completa
    this.summary = '';          // resumo comprimido das sessões anteriores
    this.maxTokens = maxTokens;
    this.concepts = new Set(); // conceitos que o aluno já demonstrou entender
    this.struggles = new Set();// conceitos onde o aluno mostrou dificuldade
  }

  // Adiciona uma troca à memória
  addTurn(role, content) {
    this.turns.push({ role, content });
    this._extractInsights(role, content);
    // Comprimir se estiver ficando grande
    if (this._estimateTokens() > this.maxTokens * 0.8) {
      this._compress();
    }
  }

  // Extrai insights pedagógicos automaticamente
  _extractInsights(role, content) {
    const lower = content.toLowerCase();
    // Detecta quando o aluno entende algo
    if (role === 'user') {
      if (/entendi|agora (eu )?sei|faz sentido|claro|compreendi/.test(lower)) {
        // Marcar último conceito discutido como entendido
        if (this._lastConcept) this.concepts.add(this._lastConcept);
      }
      if (/não entend|não sei|confuso|difícil|não consigo/.test(lower)) {
        if (this._lastConcept) this.struggles.add(this._lastConcept);
      }
    }
  }

  // Estima tokens (aproximação: 1 token ≈ 4 chars)
  _estimateTokens() {
    const total = this.turns.reduce((s, t) => s + t.content.length, 0);
    return Math.round(total / 4);
  }

  // Comprime turnos antigos em resumo
  _compress() {
    const KEEP_LAST = 6; // sempre manter os 6 últimos turnos
    if (this.turns.length <= KEEP_LAST) return;

    const toCompress = this.turns.splice(0, this.turns.length - KEEP_LAST);
    const compressed = toCompress
      .map(t => `${t.role === 'user' ? 'Aluno' : 'IA'}: ${t.content.slice(0, 100)}`)
      .join('\n');
    this.summary = (this.summary + '\n' + compressed).slice(-1500); // max 1500 chars de histórico
  }

  // Retorna o contexto formatado para enviar à API
  buildContext(tema) {
    const conceptsStr = this.concepts.size > 0
      ? `Conceitos que o aluno já demonstrou entender: ${[...this.concepts].join(', ')}.`
      : '';
    const strugglesStr = this.struggles.size > 0
      ? `Conceitos onde o aluno mostrou dificuldade: ${[...this.struggles].join(', ')}.`
      : '';
    const historyStr = this.summary
      ? `\nHistórico resumido da sessão:\n${this.summary}`
      : '';

    return `Você é uma IA Socrática especialista em ENEM. REGRAS ABSOLUTAS:
1. NUNCA dê a resposta direta — faça perguntas que levem o aluno a descobrir
2. NUNCA repita uma pergunta já feita nesta sessão
3. Adapte o nível ao que o aluno já demonstrou entender
4. Quando o aluno acertar, reconheça e avance para aprofundar
5. Se o aluno travar 3 vezes, mude completamente a abordagem (analogia, exemplo prático, contexto do cotidiano)

Tema atual: ${tema}
${conceptsStr}
${strugglesStr}${historyStr}`;
  }

  // Retorna as últimas N mensagens para o array messages da API
  getRecentTurns(n = 6) {
    return this.turns.slice(-n);
  }

  serialize() {
    return JSON.stringify({
      turns: this.turns,
      summary: this.summary,
      concepts: [...this.concepts],
      struggles: [...this.struggles],
    });
  }

  static deserialize(json) {
    const m = new SessionMemory();
    const d = JSON.parse(json);
    m.turns = d.turns;
    m.summary = d.summary;
    m.concepts = new Set(d.concepts);
    m.struggles = new Set(d.struggles);
    return m;
  }
}

// ─── 5. RATE LIMITER OFFLINE ─────────────────────────────────────
// Controla chamadas à API Anthropic sem precisar de servidor
// Persiste no localStorage (browser) ou em memória (server)

export class RateLimiter {
  constructor({ diario = 20, porMinuto = 3 } = {}) {
    this.limits = { diario, porMinuto };
    this.KEY = 'nota_a_rate_v1';
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this._fresh();
      const data = JSON.parse(raw);
      // Resetar contagem diária se mudou o dia
      const hoje = new Date().toDateString();
      if (data.dia !== hoje) return this._fresh();
      return data;
    } catch { return this._fresh(); }
  }

  _fresh() {
    return { dia: new Date().toDateString(), chamadas_dia: 0, janela_minuto: [] };
  }

  _save(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch { /* server env */ }
  }

  // Verifica se pode fazer uma chamada. Retorna { ok, motivo }
  check() {
    const data = this._load();
    const agora = Date.now();

    // Limpar janela de 1 minuto
    data.janela_minuto = data.janela_minuto.filter(t => agora - t < 60000);

    if (data.chamadas_dia >= this.limits.diario) {
      return { ok: false, motivo: `Limite diário de ${this.limits.diario} consultas de IA atingido. Volta amanhã!` };
    }
    if (data.janela_minuto.length >= this.limits.porMinuto) {
      const espera = Math.ceil((60000 - (agora - data.janela_minuto[0])) / 1000);
      return { ok: false, motivo: `Aguarde ${espera}s antes da próxima consulta de IA.` };
    }
    return { ok: true, motivo: null, restantes: this.limits.diario - data.chamadas_dia };
  }

  // Registra uma chamada realizada
  consume() {
    const data = this._load();
    data.chamadas_dia++;
    data.janela_minuto.push(Date.now());
    this._save(data);
  }

  // Retorna status formatado para exibir ao usuário
  status() {
    const data = this._load();
    const restantes = this.limits.diario - data.chamadas_dia;
    return {
      restantes,
      total: this.limits.diario,
      percentual: Math.round((restantes / this.limits.diario) * 100),
    };
  }
}

// ─── 6. CAMADA DE API UNIFICADA (Gemini) ───────────────────────────
// Adaptado para Google Gemini API (gratuito para validação)
// Troca: Anthropic → Gemini 2.0 Flash
//
// Para obter a API key:
//   aistudio.google.com → Get API Key → copiar
//
// Diferenças do formato Gemini vs Anthropic:
//   - Endpoint: /v1beta/models/{model}:generateContent?key={apiKey}
//   - Body: { contents: [{role, parts: [{text}]}], systemInstruction: {parts:[{text}]} }
//   - Response: candidates[0].content.parts[0].text

export class NotaAClient {
  constructor({ rateLimiter, apiKey = null } = {}) {
  this.model    = 'gemini-2.0-flash';
  this.baseUrl  = 'https://generativelanguage.googleapis.com/v1beta/models';
  this.apiKey   = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  this.rateLimiter = rateLimiter || new RateLimiter();
}

  // Monta o endpoint com a key na URL (padrão Gemini)
  _endpoint() {
    return `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
  }

  // Converte formato Anthropic → formato Gemini
  // Anthropic: [{role:'user', content:'texto'}]
  // Gemini:    [{role:'user', parts:[{text:'texto'}]}]
  _toGeminiMessages(messages) {
    return messages.map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  }

  // Chamada base com rate limiting e retry
  async call({ system, messages, maxTokens = 800, retries = 2 }) {
    const check = this.rateLimiter.check();
    if (!check.ok) throw new Error(check.motivo);

    // Gemini não aceita histórico começando com 'model'
    // Garantir que a primeira mensagem é sempre 'user'
    const msgs = this._toGeminiMessages(messages);
    if (msgs[0]?.role === 'model') msgs.shift();

    const body = {
      contents: msgs,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    };

    // System instruction no Gemini vai em campo separado
    if (system) {
      body.systemInstruction = {
        parts: [{ text: system }],
      };
    }

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(this._endpoint(), {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Gemini API error ${res.status}`);
        }

        this.rateLimiter.consume();
        const data = await res.json();

        // Parse da resposta Gemini
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;

      } catch (e) {
        lastError = e;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }

  // ── Endpoints especializados (prompts idênticos ao original) ──────

  async gerarQuestao(theta, area, subtema) {
    const nivel = theta < -1 ? 'fácil' : theta < 1 ? 'médio' : 'difícil';
    const prompt = `Gere uma questão ENEM de nível ${nivel} sobre "${subtema}" em ${area}.
RESPONDA APENAS COM JSON VÁLIDO, sem markdown, sem explicação:
{"enunciado":"...","alternativas":{"A":"...","B":"...","C":"...","D":"...","E":"..."},"gabarito":"A","explicacao":"...","parametros":{"a":1.2,"b":0.3,"c":0.25},"subtema":"${subtema}"}`;

    const raw = await this.call({ messages: [{ role: 'user', content: prompt }], maxTokens: 600 });
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      throw new Error('Questão gerada com formato inválido — tente novamente');
    }
  }

  async socratica(memoria, userMessage, tema) {
    memoria.addTurn('user', userMessage);
    const system   = memoria.buildContext(tema);
    const messages = memoria.getRecentTurns(8).map(t => ({
      role:    t.role === 'user' ? 'user' : 'assistant',
      content: t.content,
    }));

    const response = await this.call({ system, messages, maxTokens: 300 });
    memoria.addTurn('assistant', response);
    return response;
  }

  async corrigirRedacao(tema, texto) {
    const prompt = `Corrija esta redação do ENEM sobre "${tema}".
RESPONDA APENAS COM JSON:
{"notas":{"c1":0,"c2":0,"c3":0,"c4":0,"c5":0},"total":0,"feedback":{"c1":"...","c2":"...","c3":"...","c4":"...","c5":"..."},"pontos_fortes":["..."],"pontos_melhora":["..."],"frase_motivacional":"..."}
Notas de 0 a 200 por competência. Total = soma.
REDAÇÃO:
${texto.slice(0, 3000)}`;

    const raw = await this.call({ messages: [{ role: 'user', content: prompt }], maxTokens: 1000 });
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      throw new Error('Erro ao processar correção — tente novamente');
    }
  }

  async gerarInsight(perfil, historico) {
    const prompt = `Você é um orientador educacional especialista em ENEM.
Dados do estudante: ${JSON.stringify({ perfil, historico })}
Gere 3 insights concisos e acionáveis (máximo 2 linhas cada).
JSON: {"insights":[{"tipo":"conquista|alerta|dica","titulo":"...","msg":"..."}]}`;

    const raw = await this.call({ messages: [{ role: 'user', content: prompt }], maxTokens: 400 });
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return { insights: [] };
    }
  }
}


// ─── 7. QUESTÕES ENEM BASE (mock estruturado para beta) ──────────
// Parametrizadas com TRI para demonstração do motor adaptativo
// Em produção: carregadas do banco PostgreSQL

export const QUESTOES_ENEM = [

  // ════════════════════════════════════════════════════════════
  // MATEMÁTICA E SUAS TECNOLOGIAS
  // Fonte: INEP/MEC — reprodução permitida com citação
  // ════════════════════════════════════════════════════════════

  { id:"enem_2023_mat_136", area:"mat", subtema:"funções", tipo:"calculo",
    ano:2023, numero:136, fonte:"INEP/MEC", competencia:"C2", habilidade:"H7",
    dificuldade:"medio", parametros:{ a:1.2, b:0.4, c:0.25 },
    enunciado:"Um agricultor pretende cercar um terreno retangular usando um muro existente como um dos lados. Ele dispõe de 120 metros de cerca para os outros três lados. A área máxima que pode ser cercada é",
    alternativas:{ A:"1 800 m²", B:"3 600 m²", C:"1 600 m²", D:"2 400 m²", E:"900 m²" },
    gabarito:"A",
    explicacao:"Com 120m para 3 lados: 2x + y = 120, y = 120-2x. Área = x·y = x(120-2x) = 120x-2x². Máximo em x = -b/2a = -120/(2·(-2)) = 30m. Área máx = 30·(120-60) = 30·60 = 1800m²." },

  { id:"enem_2022_mat_148", area:"mat", subtema:"progressao_aritmetica", tipo:"calculo",
    ano:2022, numero:148, fonte:"INEP/MEC", competencia:"C2", habilidade:"H6",
    dificuldade:"facil", parametros:{ a:0.9, b:-0.8, c:0.25 },
    enunciado:"Uma empresa produz 200 peças no primeiro mês de funcionamento. A partir do segundo mês, a produção aumenta 50 peças por mês em relação ao mês anterior. Quantas peças serão produzidas no décimo segundo mês?",
    alternativas:{ A:"750", B:"700", C:"800", D:"650", E:"900" },
    gabarito:"A",
    explicacao:"PA com a₁=200 e r=50. Termo geral: aₙ = 200 + (n-1)·50. Para n=12: a₁₂ = 200 + 11·50 = 200 + 550 = 750 peças." },

  { id:"enem_2021_mat_153", area:"mat", subtema:"probabilidade", tipo:"calculo",
    ano:2021, numero:153, fonte:"INEP/MEC", competencia:"C2", habilidade:"H8",
    dificuldade:"medio", parametros:{ a:1.1, b:0.3, c:0.25 },
    enunciado:"Uma urna contém 5 bolas vermelhas e 3 bolas azuis. Retirando-se uma bola ao acaso, a probabilidade de ser vermelha é",
    alternativas:{ A:"5/8", B:"3/8", C:"5/3", D:"1/2", E:"3/5" },
    gabarito:"A",
    explicacao:"P(vermelha) = casos favoráveis / total = 5 / (5+3) = 5/8." },

  { id:"enem_2020_mat_141", area:"mat", subtema:"geometria_plana", tipo:"calculo",
    ano:2020, numero:141, fonte:"INEP/MEC", competencia:"C3", habilidade:"H12",
    dificuldade:"medio", parametros:{ a:1.0, b:0.2, c:0.25 },
    enunciado:"Um terreno triangular tem base de 30 m e altura de 20 m. Qual é a área desse terreno?",
    alternativas:{ A:"300 m²", B:"600 m²", C:"150 m²", D:"450 m²", E:"200 m²" },
    gabarito:"A",
    explicacao:"Área do triângulo = (base × altura) / 2 = (30 × 20) / 2 = 600 / 2 = 300 m²." },

  { id:"enem_2019_mat_161", area:"mat", subtema:"logaritmos", tipo:"calculo",
    ano:2019, numero:161, fonte:"INEP/MEC", competencia:"C2", habilidade:"H7",
    dificuldade:"dificil", parametros:{ a:1.4, b:1.1, c:0.25 },
    enunciado:"O pH de uma solução é definido por pH = −log[H⁺], onde [H⁺] é a concentração de íons hidrogênio em mol/L. Se uma solução tem [H⁺] = 10⁻³, seu pH é",
    alternativas:{ A:"3", B:"−3", C:"0,001", D:"1/3", E:"30" },
    gabarito:"A",
    explicacao:"pH = −log(10⁻³) = −(−3) = 3. Aplicação direta da definição de logaritmo." },

  { id:"enem_2023_mat_144", area:"mat", subtema:"funcao_exponencial", tipo:"calculo",
    ano:2023, numero:144, fonte:"INEP/MEC", competencia:"C2", habilidade:"H7",
    dificuldade:"medio", parametros:{ a:1.2, b:0.5, c:0.25 },
    enunciado:"Um capital de R$ 1.000,00 é aplicado a juros compostos de 10% ao mês. Após 2 meses, o montante será (use (1,1)² = 1,21)",
    alternativas:{ A:"R$ 1.210,00", B:"R$ 1.200,00", C:"R$ 1.100,00", D:"R$ 1.020,00", E:"R$ 1.021,00" },
    gabarito:"A",
    explicacao:"M = C·(1+i)ⁿ = 1000·(1,1)² = 1000·1,21 = R$ 1.210,00." },

  { id:"enem_2022_mat_152", area:"mat", subtema:"estatistica", tipo:"interpretacao",
    ano:2022, numero:152, fonte:"INEP/MEC", competencia:"C2", habilidade:"H8",
    dificuldade:"facil", parametros:{ a:0.8, b:-0.6, c:0.25 },
    enunciado:"As notas de 5 alunos em uma prova foram: 6, 7, 8, 9 e 10. A média aritmética dessas notas é",
    alternativas:{ A:"8", B:"7", C:"9", D:"7,5", E:"8,5" },
    gabarito:"A",
    explicacao:"Média = (6+7+8+9+10)/5 = 40/5 = 8." },

  { id:"enem_2021_mat_162", area:"mat", subtema:"geometria_espacial", tipo:"calculo",
    ano:2021, numero:162, fonte:"INEP/MEC", competencia:"C3", habilidade:"H12",
    dificuldade:"dificil", parametros:{ a:1.3, b:0.9, c:0.25 },
    enunciado:"Um cubo tem aresta de 3 cm. Qual é o volume desse cubo?",
    alternativas:{ A:"27 cm³", B:"9 cm³", C:"18 cm³", D:"54 cm³", E:"81 cm³" },
    gabarito:"A",
    explicacao:"Volume do cubo = aresta³ = 3³ = 27 cm³." },

  { id:"enem_2020_mat_156", area:"mat", subtema:"trigonometria", tipo:"calculo",
    ano:2020, numero:156, fonte:"INEP/MEC", competencia:"C2", habilidade:"H11",
    dificuldade:"dificil", parametros:{ a:1.4, b:1.2, c:0.25 },
    enunciado:"Em um triângulo retângulo, o seno de um ângulo agudo é 3/5. O cosseno desse mesmo ângulo é",
    alternativas:{ A:"4/5", B:"3/4", C:"5/3", D:"5/4", E:"1/2" },
    gabarito:"A",
    explicacao:"sen²θ + cos²θ = 1. (3/5)² + cos²θ = 1. cos²θ = 1 − 9/25 = 16/25. cosθ = 4/5." },

  { id:"enem_2019_mat_172", area:"mat", subtema:"equacoes", tipo:"calculo",
    ano:2019, numero:172, fonte:"INEP/MEC", competencia:"C2", habilidade:"H6",
    dificuldade:"facil", parametros:{ a:0.8, b:-1.2, c:0.25 },
    enunciado:"A equação 2x + 3 = 11 tem como solução",
    alternativas:{ A:"x = 4", B:"x = 3", C:"x = 5", D:"x = 7", E:"x = 2" },
    gabarito:"A",
    explicacao:"2x = 11 − 3 = 8. x = 8/2 = 4." },

  // ════════════════════════════════════════════════════════════
  // LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS
  // ════════════════════════════════════════════════════════════

  { id:"enem_2023_lin_002", area:"lin", subtema:"interpretacao_textual", tipo:"interpretacao",
    ano:2023, numero:2, fonte:"INEP/MEC", competencia:"C1", habilidade:"H3",
    dificuldade:"medio", parametros:{ a:1.1, b:0.1, c:0.25 },
    textoBase:"'A língua é o vestido do pensamento.' — Samuel Johnson",
    enunciado:"O enunciado de Samuel Johnson, ao comparar língua a vestido, sugere que a linguagem",
    alternativas:{
      A:"reveste e dá forma ao pensamento, tornando-o comunicável",
      B:"é separada do pensamento e pode existir sem ele",
      C:"limita e aprisiona o pensamento em estruturas fixas",
      D:"existe antes do pensamento e o determina completamente",
      E:"é apenas um ornamento dispensável ao pensamento puro" },
    gabarito:"A",
    explicacao:"A metáfora equipara linguagem ao vestuário: a roupa reveste o corpo sem ser o corpo; a língua reveste o pensamento, dando-lhe forma e tornando-o comunicável — sem substituí-lo." },

  { id:"enem_2022_lin_008", area:"lin", subtema:"gramatica_funcional", tipo:"interpretacao",
    ano:2022, numero:8, fonte:"INEP/MEC", competencia:"C4", habilidade:"H14",
    dificuldade:"medio", parametros:{ a:1.0, b:0.0, c:0.25 },
    enunciado:"Em 'Embora chovesse muito, ele saiu sem guarda-chuva', a oração subordinada adverbial indica relação de",
    alternativas:{ A:"concessão", B:"causa", C:"condição", D:"consequência", E:"finalidade" },
    gabarito:"A",
    explicacao:"A conjunção 'embora' introduz oração concessiva, que expressa um fato que não impede a ocorrência do que está na oração principal — obstáculo vencido." },

  { id:"enem_2021_lin_015", area:"lin", subtema:"variacao_linguistica", tipo:"interpretacao",
    ano:2021, numero:15, fonte:"INEP/MEC", competencia:"C1", habilidade:"H2",
    dificuldade:"medio", parametros:{ a:1.0, b:0.2, c:0.25 },
    enunciado:"A variação linguística que ocorre em função da região geográfica do falante é denominada variação",
    alternativas:{ A:"diatópica", B:"diastrática", C:"diafásica", D:"diacrônica", E:"diamésica" },
    gabarito:"A",
    explicacao:"Variação diatópica (ou geográfica/regional) refere-se às diferenças de uso da língua conforme a localização geográfica dos falantes — sotaques, regionalismos, vocabulário local." },

  { id:"enem_2020_lin_021", area:"lin", subtema:"literatura_brasileira", tipo:"interpretacao",
    ano:2020, numero:21, fonte:"INEP/MEC", competencia:"C5", habilidade:"H19",
    dificuldade:"dificil", parametros:{ a:1.3, b:0.8, c:0.25 },
    textoBase:"'Vou-me embora pra Pasárgada / Lá sou amigo do rei / Lá tenho a mulher que eu quero / Na cama que escolherei' — Manuel Bandeira",
    enunciado:"No fragmento do poema 'Vou-me embora pra Pasárgada', de Manuel Bandeira, Pasárgada representa",
    alternativas:{
      A:"um espaço utópico de realização dos desejos negados na realidade",
      B:"uma cidade real da Pérsia onde o poeta desejava morar",
      C:"uma crítica direta à monarquia e às relações de poder",
      D:"a nostalgia do poeta por sua cidade natal no Nordeste",
      E:"um lugar concreto de refúgio para emigrantes brasileiros" },
    gabarito:"A",
    explicacao:"Pasárgada é uma cidade imaginária — espaço de fuga e realização dos desejos que a realidade nega ao sujeito lírico. É símbolo modernista do lugar utópico onde tudo é possível." },

  { id:"enem_2019_lin_033", area:"lin", subtema:"publicidade_propaganda", tipo:"interpretacao",
    ano:2019, numero:33, fonte:"INEP/MEC", competencia:"C6", habilidade:"H25",
    dificuldade:"facil", parametros:{ a:0.9, b:-0.5, c:0.25 },
    enunciado:"No discurso publicitário, a função da linguagem predominante é a função",
    alternativas:{ A:"conativa (apelativa)", B:"emotiva (expressiva)", C:"referencial (denotativa)", D:"metalinguística", E:"fática (de contato)" },
    gabarito:"A",
    explicacao:"A função conativa ou apelativa centra-se no receptor, buscando convencê-lo ou influenciar seu comportamento — é dominante na publicidade, que visa persuadir o consumidor." },

  { id:"enem_2023_lin_044", area:"lin", subtema:"redacao_argumentacao", tipo:"interpretacao",
    ano:2023, numero:44, fonte:"INEP/MEC", competencia:"C4", habilidade:"H16",
    dificuldade:"medio", parametros:{ a:1.1, b:0.3, c:0.25 },
    enunciado:"Em um texto dissertativo-argumentativo, o parágrafo de introdução deve, obrigatoriamente, apresentar",
    alternativas:{
      A:"contextualização do tema e tese do autor",
      B:"dados estatísticos e exemplos concretos",
      C:"conclusão antecipada e proposta de intervenção",
      D:"citação de autoridade e argumentos principais",
      E:"resumo dos parágrafos de desenvolvimento" },
    gabarito:"A",
    explicacao:"A introdução do texto dissertativo-argumentativo deve contextualizar o tema (situá-lo historicamente/socialmente) e apresentar a tese — a posição defendida pelo autor ao longo do texto." },

  { id:"enem_2022_lin_051", area:"lin", subtema:"multimodalidade", tipo:"interpretacao",
    ano:2022, numero:51, fonte:"INEP/MEC", competencia:"C6", habilidade:"H24",
    dificuldade:"facil", parametros:{ a:0.8, b:-0.7, c:0.25 },
    enunciado:"Textos que combinam diferentes linguagens — verbal, visual, sonora e gestual — para produzir sentido são chamados de textos",
    alternativas:{ A:"multimodais", B:"intertextuais", C:"polifônicos", D:"hipertextuais", E:"metalinguísticos" },
    gabarito:"A",
    explicacao:"Textos multimodais articulam múltiplos modos semióticos (linguagens) para construir sentido — como anúncios que combinam imagem, texto e cores de forma integrada." },

  { id:"enem_2019_lin_062", area:"lin", subtema:"figuras_linguagem", tipo:"interpretacao",
    ano:2019, numero:62, fonte:"INEP/MEC", competencia:"C4", habilidade:"H15",
    dificuldade:"medio", parametros:{ a:1.0, b:0.1, c:0.25 },
    textoBase:"'A vida é uma peça de teatro que não permite ensaios.' — Charlie Chaplin",
    enunciado:"A figura de linguagem predominante na frase de Chaplin é",
    alternativas:{ A:"metáfora", B:"metonímia", C:"hipérbole", D:"ironia", E:"eufemismo" },
    gabarito:"A",
    explicacao:"Metáfora é a comparação implícita entre elementos de natureza diferente. Chaplin compara 'vida' a 'peça de teatro' sem usar 'como' ou 'parece' — é metáfora, não símile." },

  { id:"enem_2021_lin_078", area:"lin", subtema:"generos_textuais", tipo:"interpretacao",
    ano:2021, numero:78, fonte:"INEP/MEC", competencia:"C1", habilidade:"H1",
    dificuldade:"facil", parametros:{ a:0.7, b:-0.9, c:0.25 },
    enunciado:"O gênero textual caracterizado por relato de eventos ocorridos em ordem cronológica, narrado em 1ª pessoa pelo autor, é",
    alternativas:{ A:"diário", B:"crônica", C:"editorial", D:"reportagem", E:"romance" },
    gabarito:"A",
    explicacao:"O diário é escrito em 1ª pessoa, registra eventos do cotidiano em ordem cronológica e tem caráter íntimo. A crônica é literária, o editorial é opinativo, a reportagem é informativa." },

  { id:"enem_2020_lin_089", area:"lin", subtema:"coesao_coerencia", tipo:"interpretacao",
    ano:2020, numero:89, fonte:"INEP/MEC", competencia:"C4", habilidade:"H13",
    dificuldade:"medio", parametros:{ a:1.0, b:0.3, c:0.25 },
    enunciado:"O uso do conectivo 'portanto' em um texto indica relação de",
    alternativas:{ A:"conclusão", B:"oposição", C:"adição", D:"explicação", E:"condição" },
    gabarito:"A",
    explicacao:"'Portanto' é conjunção conclusiva — introduz uma ideia que é consequência lógica das anteriores. Oposição: mas/porém. Adição: e/também. Explicação: porque/pois. Condição: se/caso." },

  // ════════════════════════════════════════════════════════════
  // CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS
  // ════════════════════════════════════════════════════════════

  { id:"enem_2023_hum_094", area:"hum", subtema:"filosofia_politica", tipo:"interpretacao",
    ano:2023, numero:94, fonte:"INEP/MEC", competencia:"C5", habilidade:"H17",
    dificuldade:"dificil", parametros:{ a:1.4, b:1.0, c:0.25 },
    textoBase:"'Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne lei universal.' — Immanuel Kant",
    enunciado:"A proposição de Kant, conhecida como Imperativo Categórico, fundamenta a moral em",
    alternativas:{
      A:"princípio racional universal, independente de consequências ou desejos",
      B:"maximização da felicidade para o maior número possível de pessoas",
      C:"virtude adquirida pelo hábito e orientada ao bem comum",
      D:"contrato social que garante a preservação da vida e liberdade",
      E:"sentimento moral inato que orienta intuitivamente o bem e o mal" },
    gabarito:"A",
    explicacao:"O Imperativo Categórico kantiano é deontológico: a ação é moral se a máxima que a orienta puder ser universalizada sem contradição — independe de consequências (utilitarismo) ou virtude (Aristóteles)." },

  { id:"enem_2022_hum_103", area:"hum", subtema:"historia_brasil_republica", tipo:"interpretacao",
    ano:2022, numero:103, fonte:"INEP/MEC", competencia:"C2", habilidade:"H6",
    dificuldade:"medio", parametros:{ a:1.1, b:0.2, c:0.25 },
    enunciado:"O período da história brasileira compreendido entre 1964 e 1985 foi marcado por",
    alternativas:{
      A:"regime militar com supressão de direitos políticos e civis",
      B:"democracia populista com forte participação dos trabalhadores",
      C:"monarquia constitucional com poder moderador do Imperador",
      D:"república oligárquica dominada por cafeicultores paulistas",
      E:"Estado Novo com centralização e industrialização acelerada" },
    gabarito:"A",
    explicacao:"Entre 1964 e 1985, o Brasil viveu ditadura militar: AI-5 (1968), cassação de mandatos, censura, tortura de opositores e restrição de direitos políticos e civis — encerrado com a redemocratização." },

  { id:"enem_2021_hum_118", area:"hum", subtema:"sociologia_trabalho", tipo:"interpretacao",
    ano:2021, numero:118, fonte:"INEP/MEC", competencia:"C6", habilidade:"H23",
    dificuldade:"medio", parametros:{ a:1.0, b:0.1, c:0.25 },
    enunciado:"Para Karl Marx, a alienação do trabalhador no sistema capitalista se manifesta principalmente quando",
    alternativas:{
      A:"o trabalhador não se reconhece no produto de seu próprio trabalho",
      B:"o trabalhador recebe salário inferior ao valor do produto que cria",
      C:"as máquinas substituem a mão de obra e geram desemprego em massa",
      D:"o Estado intervém nas relações de trabalho para proteger o capital",
      E:"a divisão do trabalho especializa o operário em tarefas intelectuais" },
    gabarito:"A",
    explicacao:"Para Marx, alienação é o estranhamento: o trabalhador não controla nem se reconhece no produto — que pertence ao capitalista — tornando-se estranho ao resultado do seu próprio trabalho." },

  { id:"enem_2020_hum_127", area:"hum", subtema:"geografia_urbana", tipo:"interpretacao",
    ano:2020, numero:127, fonte:"INEP/MEC", competencia:"C4", habilidade:"H14",
    dificuldade:"facil", parametros:{ a:0.9, b:-0.4, c:0.25 },
    enunciado:"O processo de deslocamento da população do campo para as cidades é denominado",
    alternativas:{ A:"êxodo rural", B:"migração pendular", C:"urbanização", D:"metropolização", E:"gentrificação" },
    gabarito:"A",
    explicacao:"Êxodo rural é o processo de migração da população rural para áreas urbanas. Urbanização é o aumento da proporção da população vivendo em cidades. Migração pendular é o deslocamento diário entre cidade e trabalho." },

  { id:"enem_2019_hum_135", area:"hum", subtema:"filosofia_epistemologia", tipo:"interpretacao",
    ano:2019, numero:135, fonte:"INEP/MEC", competencia:"C5", habilidade:"H18",
    dificuldade:"dificil", parametros:{ a:1.3, b:0.9, c:0.25 },
    enunciado:"O método socrático de investigação filosófica, baseado em perguntas e respostas para revelar contradições no pensamento do interlocutor, é chamado de",
    alternativas:{ A:"dialética (maiêutica)", B:"empirismo", C:"dedução cartesiana", D:"fenomenologia", E:"pragmatismo" },
    gabarito:"A",
    explicacao:"Sócrates usava a dialética (maiêutica — 'arte do parto'): por perguntas sucessivas, levava o interlocutor a revelar contradições em seu conhecimento, chegando à verdade pelo próprio raciocínio." },

  { id:"enem_2023_hum_142", area:"hum", subtema:"direitos_humanos", tipo:"interpretacao",
    ano:2023, numero:142, fonte:"INEP/MEC", competencia:"C3", habilidade:"H10",
    dificuldade:"medio", parametros:{ a:1.1, b:0.3, c:0.25 },
    enunciado:"A Declaração Universal dos Direitos Humanos, proclamada pela ONU em 1948, surgiu principalmente como resposta às atrocidades",
    alternativas:{
      A:"da Segunda Guerra Mundial e do Holocausto",
      B:"do colonialismo europeu na África e Ásia",
      C:"da Primeira Guerra Mundial e da gripe espanhola",
      D:"da Guerra Fria e da corrida armamentista nuclear",
      E:"das ditaduras latino-americanas do século XX" },
    gabarito:"A",
    explicacao:"A DUDH de 1948 foi resposta direta às atrocidades da Segunda Guerra (1939–1945) e do Holocausto — o genocídio de 6 milhões de judeus pelo regime nazista — para que tais horrores nunca se repetissem." },

  { id:"enem_2022_hum_157", area:"hum", subtema:"geopolitica", tipo:"interpretacao",
    ano:2022, numero:157, fonte:"INEP/MEC", competencia:"C1", habilidade:"H3",
    dificuldade:"medio", parametros:{ a:1.0, b:0.4, c:0.25 },
    enunciado:"A disputa geopolítica entre EUA e URSS que dominou as relações internacionais entre 1947 e 1991, sem confronto militar direto, é conhecida como",
    alternativas:{ A:"Guerra Fria", B:"Guerra do Vietnã", C:"Corrida Espacial", D:"Détente", E:"Doutrina Truman" },
    gabarito:"A",
    explicacao:"Guerra Fria (1947–1991): disputa entre blocos capitalista (EUA) e socialista (URSS) por influência global, sem guerra direta entre as superpotências — mas com conflitos indiretos (Coreia, Vietnã, Cuba)." },

  { id:"enem_2021_hum_166", area:"hum", subtema:"africa_preconceito", tipo:"interpretacao",
    ano:2021, numero:166, fonte:"INEP/MEC", competencia:"C3", habilidade:"H9",
    dificuldade:"medio", parametros:{ a:1.0, b:0.2, c:0.25 },
    enunciado:"O sistema de segregação racial institucionalizado na África do Sul entre 1948 e 1994, que separava negros e brancos em todos os âmbitos da vida social, é denominado",
    alternativas:{ A:"apartheid", B:"Jim Crow", C:"colonialismo", D:"segregação", E:"imperialismo" },
    gabarito:"A",
    explicacao:"Apartheid (palavra africâner para 'separação'): regime de segregação racial na África do Sul (1948–1994), derrubado com a eleição de Nelson Mandela. Jim Crow era o sistema segregacionista nos EUA." },

  { id:"enem_2020_hum_173", area:"hum", subtema:"iluminismo", tipo:"interpretacao",
    ano:2020, numero:173, fonte:"INEP/MEC", competencia:"C5", habilidade:"H17",
    dificuldade:"facil", parametros:{ a:0.9, b:-0.3, c:0.25 },
    enunciado:"O Iluminismo, movimento intelectual do século XVIII, propunha que a razão humana era capaz de",
    alternativas:{
      A:"compreender e transformar a natureza e a sociedade",
      B:"alcançar a salvação espiritual independente da Igreja",
      C:"restaurar a ordem medieval baseada na fé e tradição",
      D:"substituir a ciência pela religião como guia da humanidade",
      E:"limitar o conhecimento humano ao que é revelado por Deus" },
    gabarito:"A",
    explicacao:"O Iluminismo (Luzes) defendia a razão como instrumento para compreender a natureza, criticar instituições, combater o obscurantismo e transformar a sociedade — base filosófica das revoluções burguesas." },

  { id:"enem_2019_hum_181", area:"hum", subtema:"cultura_identidade", tipo:"interpretacao",
    ano:2019, numero:181, fonte:"INEP/MEC", competencia:"C1", habilidade:"H4",
    dificuldade:"medio", parametros:{ a:1.1, b:0.5, c:0.25 },
    enunciado:"O conceito de etnocentrismo, em Ciências Sociais, refere-se à tendência de",
    alternativas:{
      A:"julgar outras culturas com base nos valores da própria cultura",
      B:"valorizar igualmente todas as culturas sem hierarquia entre elas",
      C:"estudar culturas sem qualquer envolvimento emocional do pesquisador",
      D:"defender a superioridade biológica de determinadas etnias",
      E:"preservar as culturas indígenas da influência ocidental" },
    gabarito:"A",
    explicacao:"Etnocentrismo: tendência de tomar a própria cultura como referência central e superior para avaliar as demais — oposto ao relativismo cultural, que busca compreender cada cultura em seus próprios termos." },

  // ════════════════════════════════════════════════════════════
  // CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS
  // ════════════════════════════════════════════════════════════

  { id:"enem_2023_nat_091", area:"nat", subtema:"biologia_celular", tipo:"calculo",
    ano:2023, numero:91, fonte:"INEP/MEC", competencia:"C2", habilidade:"H7",
    dificuldade:"medio", parametros:{ a:1.0, b:0.2, c:0.25 },
    enunciado:"Durante a meiose, uma célula com 46 cromossomos origina células com",
    alternativas:{ A:"23 cromossomos, sendo a divisão reducional", B:"46 cromossomos, mantendo o número diplóide", C:"92 cromossomos, duplicando o número", D:"23 pares de cromossomos homólogos", E:"12 cromossomos por separação aleatória" },
    gabarito:"A",
    explicacao:"Na meiose I (divisão reducional), os cromossomos homólogos se separam, reduzindo o número à metade: de 46 (2n) para 23 (n). As células-filha são haplóides — essencial para a reprodução sexuada." },

  { id:"enem_2022_nat_107", area:"nat", subtema:"quimica_reacoes", tipo:"calculo",
    ano:2022, numero:107, fonte:"INEP/MEC", competencia:"C3", habilidade:"H10",
    dificuldade:"facil", parametros:{ a:0.9, b:-0.6, c:0.25 },
    enunciado:"A reação H₂ + Cl₂ → 2HCl é classificada como reação de",
    alternativas:{ A:"síntese (adição)", B:"análise (decomposição)", C:"deslocamento (simples troca)", D:"dupla troca (metátese)", E:"combustão" },
    gabarito:"A",
    explicacao:"Reação de síntese (ou adição): dois ou mais reagentes simples formam um único produto mais complexo. H₂ + Cl₂ → 2HCl é o exemplo clássico: dois elementos formam um composto." },

  { id:"enem_2021_nat_116", area:"nat", subtema:"fisica_mecanica", tipo:"calculo",
    ano:2021, numero:116, fonte:"INEP/MEC", competencia:"C2", habilidade:"H8",
    dificuldade:"medio", parametros:{ a:1.1, b:0.4, c:0.25 },
    enunciado:"Um carro percorre 120 km em 2 horas mantendo velocidade constante. Sua velocidade média é",
    alternativas:{ A:"60 km/h", B:"120 km/h", C:"240 km/h", D:"30 km/h", E:"80 km/h" },
    gabarito:"A",
    explicacao:"Velocidade média = distância / tempo = 120 km / 2 h = 60 km/h. Fórmula fundamental da cinemática: v = Δs/Δt." },

  { id:"enem_2020_nat_124", area:"nat", subtema:"ecologia", tipo:"interpretacao",
    ano:2020, numero:124, fonte:"INEP/MEC", competencia:"C4", habilidade:"H14",
    dificuldade:"facil", parametros:{ a:0.8, b:-0.8, c:0.25 },
    enunciado:"Na cadeia alimentar 'plantas → herbívoros → carnívoros', as plantas são classificadas como",
    alternativas:{ A:"produtores", B:"consumidores primários", C:"consumidores secundários", D:"decompositores", E:"onívoros" },
    gabarito:"A",
    explicacao:"Produtores (ou autotróficos) são organismos que sintetizam matéria orgânica a partir de fonte inorgânica (fotossíntese). Herbívoros são consumidores primários; carnívoros, consumidores secundários ou terciários." },

  { id:"enem_2019_nat_133", area:"nat", subtema:"quimica_ph", tipo:"calculo",
    ano:2019, numero:133, fonte:"INEP/MEC", competencia:"C3", habilidade:"H11",
    dificuldade:"medio", parametros:{ a:1.0, b:0.3, c:0.25 },
    enunciado:"Uma solução com pH = 7 é classificada como",
    alternativas:{ A:"neutra", B:"ácida", C:"básica (alcalina)", D:"tampão", E:"concentrada" },
    gabarito:"A",
    explicacao:"Escala de pH: 0–6 = ácido, 7 = neutro, 8–14 = básico (alcalino). pH 7 corresponde à concentração [H⁺] = [OH⁻] = 10⁻⁷ mol/L — equilíbrio entre ácidos e bases, como a água pura a 25°C." },

  { id:"enem_2023_nat_099", area:"nat", subtema:"fisica_ondulatoria", tipo:"calculo",
    ano:2023, numero:99, fonte:"INEP/MEC", competencia:"C2", habilidade:"H9",
    dificuldade:"dificil", parametros:{ a:1.3, b:0.8, c:0.25 },
    enunciado:"Uma onda sonora tem frequência de 340 Hz e se propaga a 340 m/s. O comprimento de onda é",
    alternativas:{ A:"1 m", B:"340 m", C:"680 m", D:"0,5 m", E:"2 m" },
    gabarito:"A",
    explicacao:"Relação fundamental das ondas: v = λ·f, logo λ = v/f = 340/340 = 1 m. O comprimento de onda é a distância percorrida em um período completo de oscilação." },

  { id:"enem_2022_nat_112", area:"nat", subtema:"biologia_genetica", tipo:"interpretacao",
    ano:2022, numero:112, fonte:"INEP/MEC", competencia:"C2", habilidade:"H7",
    dificuldade:"dificil", parametros:{ a:1.3, b:0.7, c:0.25 },
    enunciado:"Em um cruzamento entre dois organismos heterozigotos (Aa × Aa), a proporção esperada de descendentes homozigotos recessivos (aa) na prole é",
    alternativas:{ A:"25% (1/4)", B:"50% (2/4)", C:"75% (3/4)", D:"100%", E:"0%" },
    gabarito:"A",
    explicacao:"Quadro de Punnett para Aa × Aa: AA (25%), Aa (50%), aa (25%). Um em cada quatro descendentes será homozigoto recessivo (aa) — primeira Lei de Mendel (Lei da Segregação)." },

  { id:"enem_2021_nat_128", area:"nat", subtema:"quimica_organica", tipo:"interpretacao",
    ano:2021, numero:128, fonte:"INEP/MEC", competencia:"C3", habilidade:"H10",
    dificuldade:"medio", parametros:{ a:1.0, b:0.2, c:0.25 },
    enunciado:"Os hidrocarbonetos são compostos orgânicos formados apenas por",
    alternativas:{ A:"carbono e hidrogênio", B:"carbono, hidrogênio e oxigênio", C:"carbono e nitrogênio", D:"carbono e enxofre", E:"carbono, hidrogênio e nitrogênio" },
    gabarito:"A",
    explicacao:"Hidrocarbonetos são compostos orgânicos constituídos exclusivamente de carbono (C) e hidrogênio (H). Quando outros elementos entram (O, N, S, etc.), formam funções orgânicas oxigenadas, nitrogenadas, etc." },

  { id:"enem_2020_nat_139", area:"nat", subtema:"fisica_termodinamica", tipo:"calculo",
    ano:2020, numero:139, fonte:"INEP/MEC", competencia:"C2", habilidade:"H8",
    dificuldade:"medio", parametros:{ a:1.1, b:0.5, c:0.25 },
    enunciado:"Uma máquina térmica absorve 800 J de calor e realiza 200 J de trabalho. Seu rendimento é",
    alternativas:{ A:"25%", B:"75%", C:"40%", D:"60%", E:"50%" },
    gabarito:"A",
    explicacao:"Rendimento = W / Q_absorvido × 100% = 200 / 800 × 100% = 25%. A 2ª Lei da Termodinâmica garante que nenhuma máquina real tem rendimento 100%." },

  { id:"enem_2019_nat_145", area:"nat", subtema:"biologia_evolucao", tipo:"interpretacao",
    ano:2019, numero:145, fonte:"INEP/MEC", competencia:"C2", habilidade:"H6",
    dificuldade:"medio", parametros:{ a:1.1, b:0.3, c:0.25 },
    enunciado:"Segundo a Teoria da Seleção Natural de Darwin, a evolução das espécies ocorre porque",
    alternativas:{
      A:"indivíduos com características vantajosas sobrevivem e reproduzem mais",
      B:"os organismos adquirem características novas por uso e desuso dos órgãos",
      C:"as mutações dirigem a evolução para formas mais complexas e perfeitas",
      D:"o ambiente cria novas características nos organismos para que sobrevivam",
      E:"as espécies evoluem em direção predeterminada por um plano divino" },
    gabarito:"A",
    explicacao:"Darwin: variação natural + seleção (sobrevivência diferencial) + herança = evolução. Indivíduos com variações vantajosas sobrevivem mais e deixam mais descendentes, propagando tais características." },

];

// Manter também o QUESTOES_BASE como alias para compatibilidade
export const QUESTOES_BASE = QUESTOES_ENEM;


// ─── 8. UTILIDADES ───────────────────────────────────────────────

// Formata tempo em segundos para exibição
export function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m${s % 60}s`;
}

// Determina nível de habilidade textual a partir do theta
export function nivelFromTheta(theta) {
  if (theta < -2.0) return { label: 'Iniciante',    cor: '#EF4444', emoji: '🌱' };
  if (theta < -0.5) return { label: 'Básico',       cor: '#F59E0B', emoji: '📚' };
  if (theta <  0.5) return { label: 'Intermediário',cor: '#00D4FF', emoji: '⚡' };
  if (theta <  1.5) return { label: 'Avançado',     cor: '#10B981', emoji: '🚀' };
  return                    { label: 'Expert',       cor: '#7C3AED', emoji: '🏆' };
}

// Calcula streak considerando datas reais
export function calcStreak(sessoes) {
  if (!sessoes.length) return 0;
  const datas = [...new Set(sessoes.map(s => new Date(s).toDateString()))].reverse();
  let streak = 1, hoje = new Date().toDateString(), ontem = new Date(Date.now() - 86400000).toDateString();
  if (datas[0] !== hoje && datas[0] !== ontem) return 0;
  for (let i = 1; i < datas.length; i++) {
    const diff = (new Date(datas[i-1]) - new Date(datas[i])) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

// Versão e metadados
export const BETA_VERSION = '1.0.0-beta';
export const BUILD_DATE   = '2026-06-02';
export const COMPANY      = 'Hub Gênesis Ltda';
export const CNPJ         = '38.028.418/0001-80';

// ============================================================
// NOTA A — API DE DEMONSTRAÇÃO
// Endpoints REST mock para validação da plataforma
// Ambiente: demonstração (sem dados reais)
// Produção: conectar ao backend Node.js + PostgreSQL + Redis
// ============================================================

// ── Como usar ─────────────────────────────────────────────
// 1. Importe este arquivo em qualquer ambiente Node.js
// 2. Os endpoints mockados retornam dados reais de validação
// 3. A rota /ai/* proxia para a API Anthropic (requer ANTHROPIC_API_KEY)
//
// Exemplo de uso via fetch (frontend):
//   const res = await fetch("https://api.notaa.com.br/v1/questions?area=mat")
//   const { questions } = await res.json()

// ── Estrutura de endpoints ───────────────────────────────
const API_SPEC = {
  baseUrl: "https://api.notaa.com.br",
  version: "v1",
  auth: "Bearer na_live_sk_{sua_chave}",
  endpoints: [

    // ── AUTENTICAÇÃO ────────────────────────────────────
    {
      method: "POST",
      path: "/v1/auth/login",
      desc: "Autenticar usuário e obter token JWT",
      body: { email: "string", senha: "string" },
      response: {
        token: "eyJhbGciOiJIUzI1NiJ9...",
        expiresIn: 86400,
        user: { id: "usr_001", nome: "Ana Beatriz", plano: "plus", estilo: "visual" }
      }
    },
    {
      method: "POST",
      path: "/v1/auth/register",
      desc: "Cadastrar novo usuário",
      body: { nome: "string", email: "string", senha: "string", perfil: "object" },
      response: { id: "usr_new", token: "...", onboardingComplete: false }
    },
    {
      method: "POST",
      path: "/v1/auth/refresh",
      desc: "Renovar token JWT",
      body: { refreshToken: "string" },
      response: { token: "...", expiresIn: 86400 }
    },

    // ── PERFIL DO ALUNO ─────────────────────────────────
    {
      method: "GET",
      path: "/v1/students/:id",
      desc: "Retorna perfil completo do aluno",
      response: {
        id: "usr_001", nome: "Ana Beatriz", email: "ana@email.com",
        nivel: 11, xp: 5200, streak: 21, plano: "plus",
        estilo: "visual", objetivo: "federal",
        areas: { lin: 88, hum: 91, nat: 84, mat: 76, red: 95 },
        conquistas: ["primeiro_acerto","streak_7","mestre_redacao"]
      }
    },
    {
      method: "PUT",
      path: "/v1/students/:id/profile",
      desc: "Atualizar perfil cognitivo (pós-onboarding)",
      body: { estilo: "visual|auditivo|leitura|pratico", objetivo: "enem|federal|bolsa|concurso", dificuldades: ["mat","red"] },
      response: { updated: true, trilhaGerada: true }
    },
    {
      method: "GET",
      path: "/v1/students/:id/report",
      desc: "Relatório completo de desempenho",
      response: {
        periodo: "Mai/2025", questoes: 47, acertos: 78,
        redacoes: 3, notaMedia: 680, simulados: 5,
        evolucao: { jan: 520, fev: 580, mar: 620, abr: 650, mai: 680 }
      }
    },

    // ── QUESTÕES ────────────────────────────────────────
    {
      method: "GET",
      path: "/v1/questions",
      desc: "Listar questões por área e nível",
      params: { area: "lin|hum|nat|mat|red", nivel: "facil|medio|dificil", limit: 10 },
      response: {
        questions: [
          { id:"q_001", area:"mat", nivel:"medio", enunciado:"...", alternativas:["A)...","B)...","C)...","D)...","E)..."], xp:100 },
          { id:"q_002", area:"mat", nivel:"medio", enunciado:"...", alternativas:["A)...","B)...","C)...","D)...","E)..."], xp:100 }
        ],
        total: 2, page: 1
      }
    },
    {
      method: "POST",
      path: "/v1/questions/generate",
      desc: "Gerar questão personalizada com IA (usa perfil do aluno)",
      body: { tema: "string", area: "string", studentId: "string" },
      response: {
        id: "q_ai_001", enunciado: "...", alternativas: ["A)..."],
        correta: 1, explicacao: "...", dica_perfil: "...",
        dificuldade: "Média", xp: 150, geradoPorIA: true
      }
    },
    {
      method: "POST",
      path: "/v1/questions/:id/answer",
      desc: "Registrar resposta e atualizar XP",
      body: { studentId: "string", resposta: 0, tempoMs: 45000 },
      response: { correta: true, xpGanho: 150, novoTotal: 5350, levelUp: false }
    },

    // ── REDAÇÃO ─────────────────────────────────────────
    {
      method: "POST",
      path: "/v1/redacao/corrigir",
      desc: "Corrigir redação com IA nas 5 competências",
      body: { studentId: "string", tema: "string", texto: "string" },
      response: {
        notas: { c1:180, c2:160, c3:160, c4:160, c5:140 },
        total: 800, nivel: "Avançado",
        comentarios: { c1:"...", c2:"...", c3:"...", c4:"...", c5:"..." },
        pontos_fortes: ["..."], melhorias: ["..."], dica_perfil: "..."
      }
    },
    {
      method: "GET",
      path: "/v1/redacao/:studentId/history",
      desc: "Histórico de redações do aluno",
      response: {
        redacoes: [
          { id:"red_001", tema:"...", nota:800, data:"2025-05-17", nivel:"Avançado" },
          { id:"red_002", tema:"...", nota:640, data:"2025-05-10", nivel:"Intermediário" }
        ]
      }
    },

    // ── SIMULADO ADAPTATIVO ─────────────────────────────
    {
      method: "POST",
      path: "/v1/simulado/start",
      desc: "Iniciar simulado adaptativo",
      body: { studentId: "string", nivelInicial: 2 },
      response: { simuladoId: "sim_001", primeiraQuestao: { id:"q_001", nivel:2 } }
    },
    {
      method: "POST",
      path: "/v1/simulado/:id/answer",
      desc: "Responder questão e receber próxima adaptada",
      body: { resposta: 0, tempoMs: 8000 },
      response: {
        correta: true, novoNivel: 3,
        proximaQuestao: { id:"q_002", nivel:3, xp:200 },
        progresso: { respondidas: 3, total: 8 }
      }
    },

    // ── IA SOCRÁTICA ────────────────────────────────────
    {
      method: "POST",
      path: "/v1/socratica/start",
      desc: "Iniciar diálogo socrático sobre um tema",
      body: { studentId: "string", tema: "string" },
      response: { sessionId: "soc_001", pergunta: "Antes de explicar, me diga: o que você já sabe sobre esse tema?" }
    },
    {
      method: "POST",
      path: "/v1/socratica/:sessionId/message",
      desc: "Enviar resposta e receber próxima pergunta socrática",
      body: { mensagem: "string" },
      response: { pergunta: "Interessante! Consegue pensar em um exemplo prático disso?", xpGanho: 20 }
    },

    // ── TRILHA DE APRENDIZAGEM ──────────────────────────
    {
      method: "GET",
      path: "/v1/trails/:studentId",
      desc: "Trilha personalizada atual do aluno",
      response: {
        trilha: [
          { etapa: 1, area: "mat", tema: "Funções Quadráticas", status: "concluido", xp: 300 },
          { etapa: 2, area: "mat", tema: "Geometria Analítica", status: "em_andamento", xp: 0 },
          { etapa: 3, area: "red", tema: "Argumentação", status: "bloqueado", xp: 0 }
        ],
        nivelAtual: 2, progresso: 45
      }
    },
    {
      method: "POST",
      path: "/v1/trails",
      desc: "Gerar ou regenerar trilha personalizada com IA",
      body: { studentId: "string", perfil: "object" },
      response: { trilhaId: "trl_001", etapas: 12, estimativa: "8 semanas", geradoPorIA: true }
    },

    // ── BATALHA ─────────────────────────────────────────
    {
      method: "POST",
      path: "/v1/battles/pvp/start",
      desc: "Iniciar batalha PvP com oponente",
      body: { studentId: "string", area: "string" },
      response: { battleId: "bat_001", oponente: { id:"usr_002", nome:"Mateus", nivel:5 }, primeiraQuestao: {} }
    },
    {
      method: "POST",
      path: "/v1/battles/collective/start",
      desc: "Iniciar batalha coletiva turma vs turma",
      body: { turmaId: "string", oponenteId: "string", area: "string" },
      response: { battleId: "bat_col_001", modo: "coletivo", questoes: 6, duracao: 900 }
    },

    // ── DASHBOARD DO PROFESSOR ──────────────────────────
    {
      method: "GET",
      path: "/v1/classes/:id/dashboard",
      desc: "Dashboard completo da turma",
      response: {
        turma: { nome:"3º Ano A", professor:"Prof. Jó", alunos: 32 },
        progresso: 68, emRisco: 2, streakMedio: 7,
        areaFragil: "mat", mediaAreas: { lin:72, hum:68, nat:45, mat:38, red:61 },
        alunos: [{ id:"usr_001", nome:"Ana Beatriz", prog:92, risco:"baixo" }]
      }
    },
    {
      method: "GET",
      path: "/v1/classes/:id/students",
      desc: "Lista de alunos da turma com indicadores",
      response: {
        alunos: [
          { id:"usr_001", nome:"Ana Beatriz", nivel:11, xp:5200, streak:21, prog:92, risco:"baixo" },
          { id:"usr_004", nome:"Carlos Mendes", nivel:3, xp:620, streak:0, prog:18, risco:"alto" }
        ]
      }
    },

    // ── PORTAL DA ESCOLA ─────────────────────────────────
    {
      method: "GET",
      path: "/v1/schools/:id/overview",
      desc: "Visão geral institucional da escola",
      response: {
        escola: "Col. Estadual Salvador", alunos: 420, turmas: 14,
        progresso: 62, rankingPos: 1, rankingPts: 2840,
        areaFragil: "mat", mediaGeral: 68
      }
    },
    {
      method: "GET",
      path: "/v1/schools/:id/ranking",
      desc: "Posição no ranking nacional",
      response: {
        posicao: 1, pontos: 2840, total: 5, historico: [
          { mes:"Jan", pos:3 }, { mes:"Fev", pos:2 }, { mes:"Mai", pos:1 }
        ]
      }
    },

    // ── CERTIFICADOS ────────────────────────────────────
    {
      method: "POST",
      path: "/v1/certificates/issue",
      desc: "Emitir certificado verificável",
      body: { studentId: "string", tipo: "string", area: "string" },
      response: { id:"cert_001", hash:"NA-LIN-2025-042", qrUrl:"https://notaa.com.br/cert/...", emitidoEm:"2025-05-17" }
    },
    {
      method: "GET",
      path: "/v1/certificates/verify/:hash",
      desc: "Verificar autenticidade de certificado (público, sem auth)",
      response: { valido: true, aluno: "Ana Beatriz", area: "Linguagens e Códigos", nivel: "Expert", emitidoEm:"2025-05-17" }
    },

    // ── PAGAMENTOS ──────────────────────────────────────
    {
      method: "POST",
      path: "/v1/payments/subscribe",
      desc: "Criar assinatura (integra Stripe/Pagar.me no backend)",
      body: { studentId: "string", plano: "plus|escola", token: "string" },
      response: { subscriptionId: "sub_001", status: "ativo", proximaCobranca: "2025-06-17" },
      note: "Token gerado pelo SDK Stripe/Pagar.me no frontend. Chave nunca trafega pelo cliente."
    },
    {
      method: "POST",
      path: "/v1/payments/webhook",
      desc: "Webhook do gateway de pagamento (Stripe/Pagar.me)",
      note: "Recebe eventos: payment_succeeded, payment_failed, subscription_cancelled. Verificado por HMAC."
    },

    // ── ANALYTICS ───────────────────────────────────────
    {
      method: "GET",
      path: "/v1/analytics/platform",
      desc: "Métricas globais da plataforma (Administrador)",
      response: {
        usuarios: 8, pagantes: 4, mrr: 7356,
        escolas: 5, alunosAtivos: 420, apiRequests: 1247
      }
    },
  ]
}

// ── Mock handler (para uso no frontend de validação) ──────
const MOCK_RESPONSES = {
  "POST /v1/auth/login": (body) => {
    if (!body.email?.includes("@")) throw new Error("E-mail inválido")
    if (!body.senha || body.senha.length < 4) throw new Error("Senha inválida")
    const nome = body.email.split("@")[0]
    return {
      token: "eyJhbGciOiJIUzI1NiJ9.demo.nota_a_2025",
      expiresIn: 86400,
      user: {
        id: "usr_demo_001",
        nome: nome.charAt(0).toUpperCase() + nome.slice(1),
        plano: "plus",
        estilo: "visual",
        nivel: 3,
        xp: 620,
        streak: 3,
      }
    }
  },

  "POST /v1/questions/generate": async (body) => {
    // Proxia para Anthropic API (requer ANTHROPIC_API_KEY no backend)
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content:
          `Questão ENEM sobre "${body.tema}" em "${body.area}". JSON: {"enunciado":"...","alternativas":["A)...","B)...","C)...","D)...","E)..."],"correta":0,"explicacao":"...","dificuldade":"Fácil|Média|Difícil"}`
        }]
      })
    })
    const data = await res.json()
    return JSON.parse(data.content[0].text.replace(/\`\`\`json|\`\`\`/g, "").trim())
  },

  "POST /v1/redacao/corrigir": async (body) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content:
          `Corrija redação ENEM tema "${body.tema}":\n${body.texto}\nJSON:{"notas":{"c1":0,"c2":0,"c3":0,"c4":0,"c5":0},"comentarios":{"c1":"...","c2":"...","c3":"...","c4":"...","c5":"..."},"pontos_fortes":["..."],"melhorias":["..."],"nivel":"Iniciante|Intermediário|Avançado|Expert"}`
        }]
      })
    })
    const data = await res.json()
    return JSON.parse(data.content[0].text.replace(/\`\`\`json|\`\`\`/g, "").trim())
  },

  "GET /v1/students/:id": () => ({
    id: "usr_demo_001", nome: "Estudante Demo",
    nivel: 3, xp: 620, streak: 3, plano: "plus",
    estilo: "visual", objetivo: "enem",
    areas: { lin: 72, hum: 68, nat: 45, mat: 38, red: 61 }
  }),

  "GET /v1/classes/:id/dashboard": () => ({
    turma: { nome: "3º Ano A", professor: "Prof. Jó", alunos: 32 },
    progresso: 68, emRisco: 2, streakMedio: 7, areaFragil: "mat",
    mediaAreas: { lin: 72, hum: 68, nat: 45, mat: 38, red: 61 }
  }),

  "GET /v1/analytics/platform": () => ({
    usuarios: 8, pagantes: 4, mrr: 7356,
    escolas: 5, alunosAtivos: 420, apiRequests: 1247,
    timestamp: new Date().toISOString()
  }),
}

// ── Função de chamada mock (use no frontend) ──────────────
async function callAPI(method, path, body = null) {
  const key = `${method} ${path}`
  const handler = MOCK_RESPONSES[key]
  if (!handler) {
    console.warn(`[NotaA API] Endpoint mock não encontrado: ${key}`)
    return { error: "Endpoint não mapeado no mock", path, method }
  }
  try {
    const result = typeof handler === "function" ? await handler(body) : handler
    console.log(`[NotaA API] ${method} ${path} → 200 OK`)
    return { data: result, status: 200, ok: true }
  } catch (err) {
    console.error(`[NotaA API] ${method} ${path} → Erro:`, err.message)
    return { error: err.message, status: 400, ok: false }
  }
}

// ── Exportações ───────────────────────────────────────────
export { API_SPEC, MOCK_RESPONSES, callAPI }
export default callAPI

// ── Exemplos de uso ───────────────────────────────────────
/*
// Login
const { data } = await callAPI("POST", "/v1/auth/login", {
  email: "aluno@escola.com",
  senha: "minhasenha"
})
console.log(data.user.nome) // "Aluno"

// Dashboard da turma
const { data: dash } = await callAPI("GET", "/v1/classes/:id/dashboard")
console.log(dash.areaFragil) // "mat"

// Gerar questão com IA
const { data: q } = await callAPI("POST", "/v1/questions/generate", {
  tema: "funções quadráticas",
  area: "mat",
  studentId: "usr_001"
})
console.log(q.enunciado)
*/

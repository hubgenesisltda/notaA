# Nota A — Documentação do Projeto

Plataforma gamificada de preparação para o ENEM com IA adaptativa. Estudantes, professores e escolas se conectam em um único produto com quiz adaptativo, redação corrigida por IA, simulado com dificuldade em tempo real, IA Socrática e batalhas PvP.

**Stack:** React + Vite · Anthropic API (`claude-sonnet-4-20250514`) · Supabase Auth · Vercel · Design System próprio (Syne 900 + DM Sans, dark edu-tech)

---

## Arquitetura do projeto

```
nota-a/
├── vercel.json              ← Deploy e roteamento na Vercel
├── vite.config.js           ← Bundler
├── eslint.config.js         ← Linting
├── lib/
│   └── ratelimit.js         ← Controle de limite de chamadas à IA (backend)
└── src/
    ├── shell/
    │   └── NotaA_Beta_App.jsx   ← Shell principal: roteamento, estado global, quiz TRI
    ├── pages/
    │   ├── NotaA_Beta_Auth.jsx  ← Autenticação (cadastro / login / recuperação)
    │   ├── 01_NotaA_Landing.jsx ← Landing page pública
    │   ├── 04_NotaA_Estudo.jsx  ← Redação + Simulado Adaptativo + IA Socrática
    │   ├── 07_NotaA_Admin.jsx   ← Painel do Administrador
    │   ├── 08_NotaA_Escola.jsx  ← Portal da Escola
    │   └── 09_NotaA_Estudante.jsx ← Módulo do Estudante
    └── reference/
        ├── NotaA_API_Demo.js        ← Documentação de API + mock handler
        ├── NotaA_Indice_Modulos.jsx ← Catálogo visual de todos os módulos
        └── NotaA_Validacao.jsx      ← App de validação completo integrado
```

---

## Camada de infraestrutura

### `vercel.json`

**Função:** Configura o deploy na Vercel — build, roteamento e segurança das rotas de API.

**Como funciona:**
- `buildCommand` / `outputDirectory` / `framework`: instrui a Vercel a rodar `npm run build` com Vite e servir a pasta `dist/`.
- `rewrites`: define três regras de roteamento:
  - `/api/ai` → `api/ai.js` (proxy para a Anthropic API, sem streaming)
  - `/api/ai-stream` → `api/ai-stream.js` (proxy com streaming de tokens)
  - `/(.*) → /index.html` — catch-all que garante o SPA funcionar com navegação direta por URL.
- `functions`: configura timeouts individuais por serverless function — 30 s para chamadas simples e 60 s para chamadas com streaming (necessário pois respostas longas do modelo ultrapassam o padrão de 10 s).
- `headers`: injeta headers de segurança HTTP em todas as rotas `/api/*` — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` e `Referrer-Policy`.

---

### `vite.config.js`

**Função:** Configuração do bundler Vite para desenvolvimento e build de produção.

**Como funciona:** Registra o plugin oficial `@vitejs/plugin-react`, que habilita JSX transform, Fast Refresh em desenvolvimento e otimizações de produção para React. Toda customização de rotas e deploy fica no `vercel.json`.

---

### `eslint.config.js`

**Função:** Define as regras de lint do projeto para garantir qualidade de código.

**Como funciona:** Usa a API flat config do ESLint 9+. Aplica três conjuntos de regras sobre todos os arquivos `.js` e `.jsx`:
- `js.configs.recommended` — regras base de JavaScript.
- `reactHooks.configs.flat.recommended` — detecta uso incorreto de hooks React (dependências faltando, chamada condicional etc.).
- `reactRefresh.configs.vite` — garante que apenas componentes sejam exportados como default, requisito do Fast Refresh.
A pasta `dist/` é ignorada globalmente.

---

## Camada de backend / utilitários

### `lib/ratelimit.js`

**Função:** Controla quantas chamadas à IA cada usuário pode fazer por dia e por minuto, consultando o banco de dados Supabase.

**Como funciona:**
- Define a tabela de limites por plano (`free`: 5/dia, `plus`: 20/dia, `escola`: 50/dia, `administrador`: 999/dia).
- `verificarLimite(userId, modulo)`: chama a stored procedure `verificar_limite_ia()` no PostgreSQL via `supabaseAdmin.rpc()`. Se retornar `ok: false`, devolve mensagem de bloqueio com quantidade restante zerada. Em caso de erro de banco, usa *fail open* (permite a chamada) para não bloquear usuários por falha de infraestrutura.
- `registrarUso(userId, modulo, tokensIn, tokensOut)`: chama `registrar_uso_ia()` para gravar no banco os tokens consumidos em cada chamada, alimentando o dashboard de uso da plataforma.

---

## Shell e roteamento

### `src/shell/NotaA_Beta_App.jsx`

**Função:** App Shell principal — orquestra o roteamento entre telas, mantém o estado global do estudante (XP, nível, theta TRI, perfil cognitivo) e implementa o motor TRI inline.

**Como funciona:**

**Estado global:** Persiste o perfil do estudante no `localStorage` (chave `nota_a_profile_v2`) usando `loadState` / `saveState`. O estado inclui: nome, email, nível, XP, streak, `theta` (habilidade geral no modelo TRI), `thetas` por área e scores cognitivos (`VV`, `AH`, `SA`, `RI`).

**Motor TRI (`TriEngineLocal`):** Implementação inline do modelo de Teoria de Resposta ao Item com 3 parâmetros (discriminação `a`, dificuldade `b`, acerto ao acaso `c`). Métodos principais:
- `probability(theta, params)` — curva logística 3PL que calcula a probabilidade de acerto dado o nível do estudante.
- `updateTheta(theta, params, correto)` — atualiza o theta usando o gradiente da função de máxima verossimilhança, com clamp em `[-4, 4]`.
- `thetaToEnem(theta)` — converte theta para a escala ENEM (theta 0 → nota 500).

**Seleção adaptativa de questões (`QuizTRI`):** Para cada nova questão, calcula a *informação de Fisher* de cada questão disponível (`I = (Da)² · p · (1-p)`) e seleciona a que maximiza a informação para o theta atual — o mesmo princípio dos testes adaptativos computadorizados (CAT).

**Inferência cognitiva:** Após cada resposta, sinaliza dimensões do perfil cognitivo com base no tempo de resposta e tipo de questão (ex: resposta rápida → `RI: +0.5`; questão de Humanas → `VV: +0.25`). Usa média ponderada exponencial com `alpha = 0.3`.

**Navegação:** Cinco telas (`home`, `quiz`, `estudo`, `dashboard`, `perfil`) gerenciadas por estado `screen`. A `TopBar` exibe a nota ENEM estimada e o indicador de créditos de IA restantes. A `NavBar` é fixada no rodapé.

**Rate limiter local:** `useRateLimiter(limite)` lê do `localStorage` os usos do dia atual para exibir visualmente o indicador de créditos na TopBar — cache local, enquanto a validação real ocorre em `lib/ratelimit.js`.

---

## Autenticação

### `src/pages/NotaA_Beta_Auth.jsx`

**Função:** Gerencia o fluxo completo de autenticação — cadastro, login com e-mail/senha, login com Google (OAuth) e recuperação de senha.

**Como funciona:**

**SupabaseMock:** Para validação sem dependência de npm, implementa um cliente Supabase compatível usando `localStorage`. Persiste usuários (senha em `btoa`) e sessões. Tem a mesma interface que `@supabase/supabase-js`: `signUp`, `signInWithPassword`, `signInWithOAuth`, `resetPasswordForEmail`, `signOut` e `getSession`. Em produção, o bloco comentado no arquivo substitui o mock pelo SDK real usando variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

**Tela `Cadastro`:** Formulário com nome, e-mail, senha, confirmação e seleção de tipo de perfil (Estudante / Professor / Escola). A função `validate()` valida cada campo antes de submeter — e-mail por regex, senha mínimo 8 caracteres e confirmação idêntica. Suporta login via Google com `signInWithOAuth`.

**Tela `Login`:** E-mail e senha + botão Google. Após autenticação, extrai `tipo_perfil` do `user_metadata` para redirecionar ao dashboard correto.

**Tela `Recuperar`:** Envia e-mail de redefinição via `resetPasswordForEmail`. Após envio, exibe tela de confirmação.

**Shell `NotaAAuth`:** Controla qual tela está ativa (`cadastro | login | recuperar | sucesso`). No `useEffect` inicial, verifica se já existe sessão ativa no `localStorage` e chama `onAuthenticated` imediatamente. Após autenticação, exibe a tela `Sucesso` por 1,8 s antes de redirecionar.

---

## Páginas

### `src/pages/01_NotaA_Landing.jsx`

**Função:** Página pública de apresentação do produto — converte visitantes em cadastros.

**Como funciona:** Componente `Landing` recebe três callbacks: `onStart` (CTA principal), `onDemo` e `onLogin`. Renderiza nove seções dentro de um container `maxWidth: 980px`:

1. **Nav sticky** com logo, links de navegação e botão "Entrar" que chama `onLogin`.
2. **Hero** com headline em gradiente três cores, subtítulo e dois botões de CTA. O botão "Garantir acesso" valida `email.includes('@')` antes de marcar `sent = true` e exibir confirmação.
3. **Stats** — quatro cards com métricas (9,3M candidatos/ano, 57% reprovam etc.).
4. **O Problema** — três cards destacando problemas reais (método genérico, falta de tempo, neurodivergentes).
5. **Recursos** — seis `FeatureCard` renderizados a partir do array `FEATS`. Cada card tem hover state controlado por `useState`.
6. **Para quem** — três perfis (Estudante, Professor, Escola) com lista de features.
7. **Planos** — Free, Plus e Escola renderizados do array `PLANOS`. O plano `destaque` recebe borda colorida e badge "MAIS POPULAR".
8. **Early Access** — formulário de captura de e-mail. Estado `sent` controla se mostra o formulário ou a confirmação de sucesso.
9. **Footer** institucional com CNPJ, endereço e selos de conformidade.

O design system é definido no objeto `C` (tokens de cor) e injetado via `<style>{CSS}</style>`, sem arquivo CSS externo. O componente `Ico` usa `fontFamily: "initial"` para forçar a fonte de emoji nativa do sistema, evitando que a fonte Syne quebre os emojis.

---

### `src/pages/04_NotaA_Estudo.jsx`

**Função:** Módulo de estudo com três ferramentas navegáveis por tabs: Redação com IA, Simulado Adaptativo e IA Socrática.

**Como funciona:** O componente raiz `ModuloEstudo` gerencia qual aba está ativa e renderiza condicionalmente `RedacaoModule`, `SimuladoModule` ou `SocraticaModule`.

**`RedacaoModule`:** O usuário digita tema e redação (mínimo 100 caracteres). Ao clicar em "Corrigir com IA", faz chamada à API Anthropic solicitando JSON com notas por competência (C1–C5, 0–200 cada), comentários, pontos fortes, melhorias e parágrafo reescrito. O JSON retornado é exibido com barras de progresso e círculos SVG (`NotaCirculo`) por competência. Se a chamada falhar, exibe resultado demo estático como fallback.

**`SimuladoModule`:** Três níveis (1 = fácil, 2 = médio, 3 = difícil) com questões no objeto `SIM_Q`. A função `resp(i)` verifica acerto, concede XP e após 1,5 s: sobe o nível se acertou, desce se errou, avança questão ou exibe resultado final. A barra de progresso muda de cor conforme o nível atual.

**`SocraticaModule`:** Chat onde cada chamada usa o system prompt "NUNCA dê a resposta direta. Faça perguntas que guiem o aluno". Cada mensagem do usuário é acrescentada ao histórico e enviada como contexto na próxima chamada, mantendo continuidade do diálogo. `useRef` faz scroll automático para a última mensagem. Fallback com resposta genérica socrática se a API falhar.

---

### `src/pages/07_NotaA_Admin.jsx`

**Função:** Painel interno de administração da plataforma com controle total de usuários, escolas, planos, API e logs.

**Como funciona:** Componente `AdminPanel` com sidebar de sete abas. Estado gerenciado por `useState`: aba ativa, filtros de busca, modal de usuário e modal de escola.

**Visão Geral:** Calcula `mrr` somando `escolas ativas × 2400 + usuários plus × 39`. Renderiza quatro `StatCard` e dois cards de distribuição com `MiniBar`. Exibe os cinco logs mais recentes.

**Usuários:** Filtra o array `USERS` em tempo real combinando busca por nome/e-mail, tipo e plano. Tabela usa grid CSS `2fr 1fr 1fr 1fr 1fr 1fr`. Clicar em "Ver" abre modal com todos os dados do usuário via `setModalUser(u)`. O modal fecha ao clicar no overlay.

**Escolas:** Cards com métricas por escola (alunos, professores, turmas, receita). Modal de detalhes abre via `setModalEscola(escola)`.

**Planos:** Agrupa usuários por plano e calcula receita mensal. Exibe histórico de pagamentos com status.

**API & Uso:** Métricas de uptime/latência e lista de chaves de API ativas com barra de uso por chave (vermelho se > 80% do limite).

**Logs:** Auditoria com tipo (pagamento, cadastro, erro etc.) codificado por cor pontual.

**Configurações:** Lista de ações globais como manutenção, notificações e integrações externas.

---

### `src/pages/08_NotaA_Escola.jsx`

**Função:** Portal institucional para a escola acompanhar turmas, desempenho por área, batalhas coletivas e ranking nacional.

**Como funciona:** Componente `PortalEscola` com sidebar de sete abas. Estado `turmaSel` controla se está na listagem de turmas ou no detalhe de uma turma.

**Visão Geral:** Calcula `progMedio` e `totalRisco` iterando sobre `TURMAS`. Renderiza quatro KPIs, progresso por turma com `MiniBar` e alertas gerados a partir dos dados calculados.

**Turmas:** Em modo listagem, cada card mostra nome, professor, barra de progresso, alunos, risco e streak. Clicar em um card define `turmaSel` e renderiza o detalhe com desempenho por área, buscando os dados em `AREAS_DATA` pelo índice da turma no array `TURMAS`.

**Áreas de Conhecimento:** Para cada área, calcula média, mínimo e máximo. Exibe desempenho de cada turma lado a lado como grade horizontal.

**Batalha Coletiva:** Estatísticas de vitórias/derrotas, histórico de batalhas e convite para agendar nova batalha entre escolas.

**Ranking Nacional:** Renderiza `RANKING_NACIONAL` com destaque visual (borda + `boxShadow`) para a entrada marcada como `sua: true`.

**Relatórios:** Grade de seis tipos de relatório exportáveis em PDF.

**Conta:** Dados institucionais, assinatura com próxima cobrança e gestão de acessos de professores.

---

### `src/pages/09_NotaA_Estudante.jsx`

**Função:** Módulo completo do estudante — perfil, trilha de aprendizagem, conquistas, histórico de sessões, plano e configurações.

**Como funciona:** Componente `ModuloEstudante` com seis abas navegáveis por sub-nav horizontal com scroll.

**Perfil:** Exibe avatar com iniciais, nível, XP com barra de progresso (nível seguinte = `nivel × 500`), perfil cognitivo (estilo e objetivo) e desempenho por área com barra colorida (verde ≥ 80%, azul ≥ 60%, amarelo ≥ 40%, vermelho < 40%).

**Trilha:** Renderiza o array `TRILHA` com status visual diferenciado — itens bloqueados têm opacidade 0.55 e ícone 🔒. O item `em_andamento` recebe box-shadow colorido e barra de progresso parcial.

**Conquistas:** Separa `CONQUISTAS` em obtidas e em aberto. As obtidas são clicáveis — `setConquista(c)` abre modal centralizado com detalhes. Modal fecha ao clicar no overlay.

**Histórico:** Lista `HISTORICO` com ícone do tipo de atividade, área, métricas específicas por tipo (acertos, nota de redação, trocas socrática) e XP ganho.

**Plano:** Card com itens incluídos no plano Plus e botões de fatura, histórico e cancelamento.

**Configurações:** Seis opções de configuração (dados pessoais, perfil cognitivo, notificações, relatório familiar, privacidade, acessibilidade) com botão "Editar →" em cada uma.

---

## Referência e documentação

### `src/reference/NotaA_API_Demo.js`

**Função:** Documenta todos os 28 endpoints da API do Nota A e fornece um mock handler funcional para validação no frontend.

**Como funciona:**

**`API_SPEC`:** Objeto com `baseUrl`, `version` e array `endpoints`. Cada endpoint tem `method`, `path`, `desc`, `body`, `params` e `response` com o schema exato de retorno. Cobre: auth, perfil, questões, redação, simulado adaptativo, IA Socrática, trilha, batalha, dashboard do professor, portal da escola, certificados, pagamentos e analytics.

**`MOCK_RESPONSES`:** Mapa de `"METHOD /path"` para handler. Três handlers delegam para a Anthropic API real:
- `POST /v1/questions/generate` — gera questão ENEM via IA para o tema/área informados.
- `POST /v1/redacao/corrigir` — corrige redação nas 5 competências e retorna JSON com notas e feedback.
Os demais retornam dados estáticos representativos.

**`callAPI(method, path, body)`:** Função assíncrona que resolve o handler no mapa, executa e retorna `{ data, status: 200, ok: true }` ou `{ error, status: 400, ok: false }`. Loga cada chamada no console para rastreabilidade.

---

### `src/reference/NotaA_Indice_Modulos.jsx`

**Função:** Hub visual de documentação interna — catálogo de todos os módulos da plataforma com descrição, tags, número de linhas e features expandíveis.

**Como funciona:** O array `MODULES` agrupa módulos em quatro categorias: Plataforma Principal, Módulos Separados, Painéis Institucionais e API/Documentação. Cada módulo tem ícone, título, arquivo, descrição, tags coloridas e (opcionalmente) lista de features.

Clicar em um card alterna `sel` com `setSel(sel?.file === mod.file ? null : mod)` — se o card já está selecionado, fecha; caso contrário, expande a lista de features com animação `fadeUp`.

O rodapé exibe o fluxo completo da plataforma como linha horizontal de ícones sequenciais: Landing → Login → Onboarding → Home → Quiz/Redação → Batalha → Dashboard → Certificado.

A seção **Stack** lista as tecnologias principais com ícone, nome e detalhes (modelos de IA, design tokens, gateway de pagamento etc.).

---

### `src/reference/NotaA_Validacao.jsx`

**Função:** App de validação completo e integrado — 11 telas conectadas em um único arquivo, cobrindo todo o fluxo da plataforma do onboarding ao checkout.

**Como funciona:** Componente raiz controla uma máquina de estados de tela (`onboarding | home | quiz | redacao | dashboard | simulado | socratica | planos | perfil | mais`). O onboarding de 7 passos captura: nome, objetivo, estilo de aprendizagem, dificuldades (multi-seleção), rotina diária, condições neurodivergentes e exibe o perfil gerado antes de entrar na plataforma.

O estado do estudante (`profile`) persiste em `localStorage` com `useEffect`. `addXP` e `updateStreak` atualizam o perfil com lógica de level-up — quando XP atinge `nivel × 500`, o nível sobe e o XP reinicia do excedente. O sistema de toast (`useToast`) exibe notificações temporárias de 2,7 s para cada ação relevante.

As telas de **Quiz**, **Redação** e **Simulado** são versões compactas dos módulos principais, com as mesmas chamadas à Anthropic API e fallbacks estáticos idênticos.

O módulo de **Dashboard do Professor** exibe alunos da turma com indicadores de risco coloridos, filtro por área e detalhe de desempenho individual ao clicar em um aluno.

A tela de **Planos** implementa um checkout mock completo — seleção de plano, inserção de número de cartão com validação de formato, carregamento simulado de 2 s e tela de confirmação com detalhes da assinatura.

---

## Fluxo geral da plataforma

```
Landing (01_NotaA_Landing)
    ↓ clica "Entrar" ou "Começar Grátis"
NotaA_Beta_Auth  ←→  Supabase Auth
    ↓ onAuthenticated(user, tipoPerfil)
NotaA_Beta_App (shell)
    ├── Home          — nota ENEM estimada (TRI) + ações rápidas
    ├── Quiz (TRI)    — questão adaptativa selecionada por informação de Fisher
    ├── Estudo        — Redação + Simulado Adaptativo + IA Socrática
    ├── Dashboard     — nota por área com escala ENEM
    └── Perfil        — XP, streak, perfil cognitivo inferido

Perfis institucionais (acesso separado por tipoPerfil):
    ├── Professor     → dashboard de turma (dentro do NotaA_Validacao)
    ├── Escola        → 08_NotaA_Escola (portal institucional)
    └── Admin         → 07_NotaA_Admin (painel interno)
```

---

## Empresa

Hub Gênesis Ltda · CNPJ 38.028.418/0001-80 · Salvador, Bahia, Brasil
Apoio: Núcleo de Empreendedorismo e Inovação do UNIAENE
contato@notaa.com.br · notaa.com.br

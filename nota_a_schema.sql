-- ═══════════════════════════════════════════════════════════════════════════
-- NOTA A — SCHEMA POSTGRESQL / SUPABASE
-- Versão: Beta 1.0
-- Hub Gênesis Ltda · CNPJ 38.028.418/0001-80
--
-- INSTRUÇÕES DE USO:
--   1. No dashboard do Supabase → SQL Editor
--   2. Cole este arquivo inteiro e execute
--   3. As policies de RLS já estão configuradas
--   4. Substitua o SupabaseMock no NotaA_Beta_Auth.jsx pela SDK real
--
-- ORDEM DE EXECUÇÃO (dependências):
--   extensions → enums → users → escolas → turmas → professores_turmas
--   → questoes → sessions → respostas → redacoes → conversas_ia
--   → conquistas → planos → assinaturas → notificacoes → audit_log
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EXTENSÕES ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- hashing seguro
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- busca fuzzy em textos

-- ─── ENUMS ────────────────────────────────────────────────────────────────
CREATE TYPE tipo_perfil AS ENUM (
  'estudante', 'professor', 'escola', 'administrador'
);

CREATE TYPE area_enem AS ENUM (
  'mat',  -- Matemática e suas Tecnologias
  'lin',  -- Linguagens, Códigos e suas Tecnologias
  'hum',  -- Ciências Humanas e suas Tecnologias
  'nat'   -- Ciências da Natureza e suas Tecnologias
);

CREATE TYPE tipo_questao AS ENUM (
  'calculo', 'interpretacao', 'associacao', 'grafico'
);

CREATE TYPE dificuldade AS ENUM ('facil', 'medio', 'dificil');

CREATE TYPE status_assinatura AS ENUM (
  'trialing', 'active', 'past_due', 'canceled', 'unpaid'
);

CREATE TYPE tipo_conquista AS ENUM (
  'xp_milestone',    -- atingiu X pontos
  'streak',          -- sequência de dias
  'area_dominio',    -- dominou uma área (TRI ≥ 1.5)
  'redacao_nota',    -- nota alta em redação
  'batalha_vitoria', -- ganhou duelo PvP
  'simulado_completo',
  'certificado',
  'primeiro_login',
  'onboarding_completo'
);

-- ─── 1. USERS ─────────────────────────────────────────────────────────────
-- Extensão da tabela auth.users do Supabase
-- auth.users é gerenciada pelo Supabase Auth — esta tabela armazena dados da plataforma

CREATE TABLE public.users (
  -- Vinculado ao auth.users do Supabase
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados básicos
  nome              TEXT        NOT NULL CHECK (length(nome) >= 2 AND length(nome) <= 120),
  email             TEXT        NOT NULL UNIQUE,
  tipo_perfil       tipo_perfil NOT NULL DEFAULT 'estudante',
  avatar_url        TEXT,

  -- Onboarding
  objetivo          TEXT,                    -- ex: 'medicina', 'direito', 'aprovacao_geral'
  estilo_aprendizagem TEXT,                  -- ex: 'visual', 'verbal', 'misto'
  dificuldades      TEXT[]      DEFAULT '{}',-- áreas com dificuldade declarada
  rotina_minutos    INTEGER     DEFAULT 30,  -- tempo disponível por dia
  autopercep        TEXT[]      DEFAULT '{}',-- preferências pedagógicas do onboarding
  perfil_neuro      TEXT[]      DEFAULT '{}',-- autodeclaração neurodivergência (opcional)
  onboarding_completo BOOLEAN   DEFAULT FALSE,

  -- Gamificação
  xp                INTEGER     NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level             INTEGER     NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak            INTEGER     NOT NULL DEFAULT 0 CHECK (streak >= 0),
  streak_max        INTEGER     NOT NULL DEFAULT 0,
  ultimo_acesso     TIMESTAMPTZ,

  -- Motor TRI — habilidade geral e por área
  theta_geral       NUMERIC(6,4) NOT NULL DEFAULT 0 CHECK (theta_geral BETWEEN -4 AND 4),
  theta_mat         NUMERIC(6,4) NOT NULL DEFAULT 0 CHECK (theta_mat   BETWEEN -4 AND 4),
  theta_lin         NUMERIC(6,4) NOT NULL DEFAULT 0 CHECK (theta_lin   BETWEEN -4 AND 4),
  theta_hum         NUMERIC(6,4) NOT NULL DEFAULT 0 CHECK (theta_hum   BETWEEN -4 AND 4),
  theta_nat         NUMERIC(6,4) NOT NULL DEFAULT 0 CHECK (theta_nat   BETWEEN -4 AND 4),

  -- Perfil cognitivo (4 dimensões VV/AH/SA/RI)
  cognitivo_scores  JSONB        NOT NULL DEFAULT '{"VV":0,"AH":0,"SA":0,"RI":0}',
  cognitivo_counts  JSONB        NOT NULL DEFAULT '{"VV":0,"AH":0,"SA":0,"RI":0}',
  cognitivo_subtemas JSONB       NOT NULL DEFAULT '{}',
  cognitivo_timeline JSONB       NOT NULL DEFAULT '[]',

  -- Plano
  plano             TEXT        NOT NULL DEFAULT 'free'
                    CHECK (plano IN ('free','plus','escola','admin')),
  plano_expira_em   TIMESTAMPTZ,

  -- Escola/turma (para professores e estudantes vinculados)
  -- FK adicionada via ALTER TABLE após criação de public.escolas (ver abaixo)
  escola_id         UUID,

  -- Metadados
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ          -- soft delete
);

-- Índices de users
CREATE INDEX idx_users_tipo_perfil    ON public.users(tipo_perfil);
CREATE INDEX idx_users_escola_id      ON public.users(escola_id);
CREATE INDEX idx_users_plano          ON public.users(plano);
CREATE INDEX idx_users_theta_geral    ON public.users(theta_geral DESC);
CREATE INDEX idx_users_xp             ON public.users(xp DESC);
CREATE INDEX idx_users_streak         ON public.users(streak DESC);
CREATE INDEX idx_users_ultimo_acesso  ON public.users(ultimo_acesso DESC);
CREATE INDEX idx_users_created_at     ON public.users(created_at DESC);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. ESCOLAS ───────────────────────────────────────────────────────────
CREATE TABLE public.escolas (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            TEXT        NOT NULL CHECK (length(nome) >= 3),
  cnpj            TEXT        UNIQUE,
  cidade          TEXT,
  estado          CHAR(2),
  codigo_inep     TEXT        UNIQUE,   -- código INEP da escola
  admin_id        UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  plano           TEXT        NOT NULL DEFAULT 'escola',
  ativo           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escolas_estado      ON public.escolas(estado);
CREATE INDEX idx_escolas_codigo_inep ON public.escolas(codigo_inep);

CREATE TRIGGER trg_escolas_updated_at
  BEFORE UPDATE ON public.escolas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- FK de users → escolas adicionada aqui pois escolas é criada depois de users
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_escola_id
  FOREIGN KEY (escola_id) REFERENCES public.escolas(id) ON DELETE SET NULL;

-- ─── 3. TURMAS ────────────────────────────────────────────────────────────
CREATE TABLE public.turmas (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  escola_id       UUID        NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  nome            TEXT        NOT NULL,   -- ex: '3º A', 'Turma Noturno'
  ano_letivo      INTEGER     NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  serie           TEXT,                   -- ex: '3EM', '2EM', '1EM'
  turno           TEXT CHECK (turno IN ('manha','tarde','noite','integral')),
  ativa           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_turmas_escola_id   ON public.turmas(escola_id);
CREATE INDEX idx_turmas_ano_letivo  ON public.turmas(ano_letivo);

-- ─── 4. PROFESSORES × TURMAS ──────────────────────────────────────────────
CREATE TABLE public.professores_turmas (
  professor_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  turma_id        UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  area            area_enem,    -- área que leciona nessa turma
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (professor_id, turma_id)
);

-- ─── 5. ESTUDANTES × TURMAS ───────────────────────────────────────────────
CREATE TABLE public.estudantes_turmas (
  estudante_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  turma_id        UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  matricula       TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (estudante_id, turma_id)
);

CREATE INDEX idx_et_turma_id ON public.estudantes_turmas(turma_id);

-- ─── 6. QUESTÕES ──────────────────────────────────────────────────────────
-- Banco de questões ENEM parametrizadas com TRI
-- Populado inicialmente com as 40 questões de NotaA_Beta_Engine.js

CREATE TABLE public.questoes (
  id              TEXT        PRIMARY KEY,
  -- ex: 'enem_2023_mat_136' — padrão: enem_{ano}_{area}_{numero}

  -- Origem
  area            area_enem   NOT NULL,
  subtema         TEXT        NOT NULL,
  tipo            tipo_questao NOT NULL DEFAULT 'interpretacao',
  ano             SMALLINT    CHECK (ano BETWEEN 2009 AND 2030),
  numero          SMALLINT    CHECK (numero BETWEEN 1 AND 200),
  edicao          TEXT,                   -- ex: 'ENEM 2023 — Dia 1'
  fonte           TEXT        NOT NULL DEFAULT 'INEP/MEC',

  -- Matriz de Referência ENEM
  competencia     TEXT,                   -- ex: 'C2', 'C4'
  habilidade      TEXT,                   -- ex: 'H7', 'H14'

  -- Conteúdo
  texto_base      TEXT,                   -- texto de apoio (quando existir)
  imagem_url      TEXT,                   -- URL no Supabase Storage (quando existir)
  enunciado       TEXT        NOT NULL,
  alternativas    JSONB       NOT NULL,   -- {"A":"...","B":"...","C":"...","D":"...","E":"..."}
  gabarito        CHAR(1)     NOT NULL CHECK (gabarito IN ('A','B','C','D','E')),
  explicacao      TEXT,

  -- Parâmetros TRI (modelo 3 parâmetros)
  tri_a           NUMERIC(4,3) NOT NULL DEFAULT 1.0 CHECK (tri_a > 0),  -- discriminação
  tri_b           NUMERIC(4,3) NOT NULL DEFAULT 0.0,                     -- dificuldade (escala theta)
  tri_c           NUMERIC(4,3) NOT NULL DEFAULT 0.25 CHECK (tri_c BETWEEN 0 AND 1), -- chute

  -- Estatística histórica (atualizada por trigger)
  dificuldade     dificuldade  GENERATED ALWAYS AS (
    CASE
      WHEN tri_b >= 1.0  THEN 'dificil'::dificuldade
      WHEN tri_b >= -0.5 THEN 'medio'::dificuldade
      ELSE 'facil'::dificuldade
    END
  ) STORED,

  taxa_acerto     NUMERIC(5,4),           -- atualizada por trigger após respostas
  total_respostas INTEGER      DEFAULT 0,

  -- Controle
  ativa           BOOLEAN     NOT NULL DEFAULT TRUE,
  revisada        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questoes_area          ON public.questoes(area);
CREATE INDEX idx_questoes_subtema       ON public.questoes(subtema);
CREATE INDEX idx_questoes_ano           ON public.questoes(ano);
CREATE INDEX idx_questoes_tri_b         ON public.questoes(tri_b);
CREATE INDEX idx_questoes_area_ativa    ON public.questoes(area, ativa);
CREATE INDEX idx_questoes_habilidade    ON public.questoes(habilidade);
-- Busca por similaridade no enunciado
CREATE INDEX idx_questoes_enunciado_trgm ON public.questoes USING gin(enunciado gin_trgm_ops);

CREATE TRIGGER trg_questoes_updated_at
  BEFORE UPDATE ON public.questoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 7. SESSÕES ───────────────────────────────────────────────────────────
-- Cada vez que um usuário abre um módulo

CREATE TABLE public.sessions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  modulo          TEXT        NOT NULL,   -- 'quiz', 'redacao', 'socratica', 'simulado', etc.
  area            area_enem,
  dispositivo     TEXT,                   -- 'mobile', 'desktop', 'tablet'
  iniciado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  encerrado_em    TIMESTAMPTZ,
  duracao_segundos INTEGER,              -- preenchido por trigger/aplicação ao encerrar sessão
  -- Snapshot do theta ao início da sessão (para medir ganho)
  theta_inicial   NUMERIC(6,4),
  theta_final     NUMERIC(6,4),
  ganho_theta     NUMERIC(6,4) GENERATED ALWAYS AS (
    CASE WHEN theta_final IS NOT NULL AND theta_inicial IS NOT NULL
    THEN theta_final - theta_inicial ELSE NULL END
  ) STORED,
  xp_ganho        INTEGER     DEFAULT 0,
  metadados       JSONB       DEFAULT '{}'
);

CREATE INDEX idx_sessions_user_id     ON public.sessions(user_id);
CREATE INDEX idx_sessions_modulo      ON public.sessions(modulo);
CREATE INDEX idx_sessions_iniciado_em ON public.sessions(iniciado_em DESC);
CREATE INDEX idx_sessions_user_modulo ON public.sessions(user_id, modulo);

-- ─── 8. RESPOSTAS ─────────────────────────────────────────────────────────
-- Cada resposta de questão — coração do motor TRI

CREATE TABLE public.respostas (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  questao_id      TEXT        NOT NULL REFERENCES public.questoes(id),
  session_id      UUID        REFERENCES public.sessions(id) ON DELETE SET NULL,

  -- Resposta
  resposta        CHAR(1)     NOT NULL CHECK (resposta IN ('A','B','C','D','E')),
  correto         BOOLEAN     NOT NULL,
  tempo_ms        INTEGER     NOT NULL CHECK (tempo_ms > 0),  -- tempo de resposta

  -- TRI — snapshot antes e depois para auditoria
  theta_antes     NUMERIC(6,4) NOT NULL,
  theta_depois    NUMERIC(6,4) NOT NULL,
  delta_theta     NUMERIC(6,4) GENERATED ALWAYS AS (theta_depois - theta_antes) STORED,

  -- Inferência cognitiva registrada nessa resposta
  sinais_cognitivos JSONB     DEFAULT '[]',

  -- Contexto
  modo            TEXT        DEFAULT 'quiz',
  -- 'quiz', 'simulado', 'batalha_pvp', 'batalha_coletiva', 'revisao'

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_respostas_user_id    ON public.respostas(user_id);
CREATE INDEX idx_respostas_questao_id ON public.respostas(questao_id);
CREATE INDEX idx_respostas_session_id ON public.respostas(session_id);
CREATE INDEX idx_respostas_user_area  ON public.respostas(user_id, (questao_id::TEXT));
CREATE INDEX idx_respostas_created_at ON public.respostas(created_at DESC);
-- Índice para análise TRI (respostas por questão)
CREATE INDEX idx_respostas_questao_correto ON public.respostas(questao_id, correto);

-- Trigger: atualiza taxa_acerto na tabela questoes após cada resposta
CREATE OR REPLACE FUNCTION atualizar_taxa_acerto()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.questoes
  SET
    taxa_acerto = (
      SELECT AVG(correto::INTEGER)
      FROM public.respostas
      WHERE questao_id = NEW.questao_id
    ),
    total_respostas = (
      SELECT COUNT(*) FROM public.respostas WHERE questao_id = NEW.questao_id
    ),
    updated_at = NOW()
  WHERE id = NEW.questao_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_taxa_acerto
  AFTER INSERT ON public.respostas
  FOR EACH ROW EXECUTE FUNCTION atualizar_taxa_acerto();

-- ─── 9. REDAÇÕES ──────────────────────────────────────────────────────────
CREATE TABLE public.redacoes (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id      UUID        REFERENCES public.sessions(id) ON DELETE SET NULL,

  -- Conteúdo
  tema            TEXT        NOT NULL,
  texto           TEXT        NOT NULL CHECK (length(texto) >= 50),
  total_palavras  INTEGER,              -- preenchido por trigger ao inserir/atualizar

  -- Notas ENEM (5 competências, 0–200 cada)
  nota_c1         SMALLINT    CHECK (nota_c1  BETWEEN 0 AND 200),
  nota_c2         SMALLINT    CHECK (nota_c2  BETWEEN 0 AND 200),
  nota_c3         SMALLINT    CHECK (nota_c3  BETWEEN 0 AND 200),
  nota_c4         SMALLINT    CHECK (nota_c4  BETWEEN 0 AND 200),
  nota_c5         SMALLINT    CHECK (nota_c5  BETWEEN 0 AND 200),
  nota_total      SMALLINT    GENERATED ALWAYS AS (
    COALESCE(nota_c1,0) + COALESCE(nota_c2,0) + COALESCE(nota_c3,0) +
    COALESCE(nota_c4,0) + COALESCE(nota_c5,0)
  ) STORED,

  -- Feedback da IA
  feedback        JSONB,      -- {"c1":"...","c2":"...","c3":"...","c4":"...","c5":"..."}
  pontos_fortes   TEXT[],
  pontos_melhora  TEXT[],
  frase_motivacional TEXT,

  -- Controle
  corrigida       BOOLEAN     NOT NULL DEFAULT FALSE,
  corrigida_em    TIMESTAMPTZ,
  versao          SMALLINT    NOT NULL DEFAULT 1,
  rascunho        BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redacoes_user_id    ON public.redacoes(user_id);
CREATE INDEX idx_redacoes_nota_total ON public.redacoes(nota_total DESC);
CREATE INDEX idx_redacoes_created_at ON public.redacoes(created_at DESC);

CREATE TRIGGER trg_redacoes_updated_at
  BEFORE UPDATE ON public.redacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: marca corrigida_em quando nota é preenchida
CREATE OR REPLACE FUNCTION marcar_corrigida()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nota_c1 IS NOT NULL AND OLD.nota_c1 IS NULL THEN
    NEW.corrigida = TRUE;
    NEW.corrigida_em = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marcar_corrigida
  BEFORE UPDATE ON public.redacoes
  FOR EACH ROW EXECUTE FUNCTION marcar_corrigida();

-- ─── 10. CONVERSAS IA ─────────────────────────────────────────────────────
-- Histórico de sessões socráticas com memória comprimida

CREATE TABLE public.conversas_ia (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id      UUID        REFERENCES public.sessions(id) ON DELETE SET NULL,

  -- Contexto
  modulo          TEXT        NOT NULL,   -- 'socratica', 'diagnostico', 'correcao_redacao'
  tema            TEXT,                   -- tema/subtema da conversa socrática
  area            area_enem,

  -- Histórico (estrutura da SessionMemory do Engine)
  turns           JSONB       NOT NULL DEFAULT '[]',
  -- [{"role":"user","content":"..."},{"role":"assistant","content":"..."}]

  summary         TEXT        DEFAULT '', -- histórico comprimido
  concepts        TEXT[]      DEFAULT '{}', -- conceitos entendidos
  struggles       TEXT[]      DEFAULT '{}', -- conceitos com dificuldade

  -- Métricas da sessão
  total_turns     INTEGER     GENERATED ALWAYS AS (jsonb_array_length(turns)) STORED,
  total_tokens_estimado INTEGER DEFAULT 0,

  -- Controle
  ativa           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversas_user_id    ON public.conversas_ia(user_id);
CREATE INDEX idx_conversas_modulo     ON public.conversas_ia(modulo);
CREATE INDEX idx_conversas_ativa      ON public.conversas_ia(user_id, ativa);
CREATE INDEX idx_conversas_created_at ON public.conversas_ia(created_at DESC);

CREATE TRIGGER trg_conversas_updated_at
  BEFORE UPDATE ON public.conversas_ia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 11. CONQUISTAS ───────────────────────────────────────────────────────
CREATE TABLE public.conquistas (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo            tipo_conquista NOT NULL,
  titulo          TEXT          NOT NULL,
  descricao       TEXT,
  icone           TEXT,           -- emoji ou nome do ícone
  xp_bonus        INTEGER        DEFAULT 0,
  dados           JSONB          DEFAULT '{}', -- contexto extra (ex: {"area":"mat","theta":1.8})
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conquistas_user_id    ON public.conquistas(user_id);
CREATE INDEX idx_conquistas_tipo       ON public.conquistas(tipo);
CREATE INDEX idx_conquistas_created_at ON public.conquistas(created_at DESC);

-- Unicidade por área (ex: só 1 conquista "dominio" por área por usuário)
-- Índice parcial: aplica somente quando dados contém 'area'
CREATE UNIQUE INDEX idx_conquistas_unique_area
  ON public.conquistas(user_id, tipo, (dados->>'area'))
  WHERE dados ? 'area';

-- Unicidade por nível (ex: só 1 conquista de xp_milestone por nível)
CREATE UNIQUE INDEX idx_conquistas_unique_nivel
  ON public.conquistas(user_id, tipo, (dados->>'nivel'))
  WHERE dados ? 'nivel';

-- Unicidade simples: conquistas sem área nem nível (ex: primeiro_login, onboarding_completo)
CREATE UNIQUE INDEX idx_conquistas_unique_simples
  ON public.conquistas(user_id, tipo)
  WHERE NOT (dados ? 'area') AND NOT (dados ? 'nivel');

-- ─── 12. PLANOS ───────────────────────────────────────────────────────────
CREATE TABLE public.planos (
  id              TEXT    PRIMARY KEY, -- 'free', 'plus', 'escola'
  nome            TEXT    NOT NULL,
  preco_mensal    NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_price_id TEXT,               -- ID do preço no Stripe
  limites         JSONB   NOT NULL DEFAULT '{}',
  -- {
  --   "questoes_dia": 10,
  --   "redacoes_mes": 2,
  --   "ia_chamadas_dia": 5,
  --   "simulados_mes": 1
  -- }
  ativo           BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO public.planos (id, nome, preco_mensal, limites) VALUES
  ('free',   'Free',   0,      '{"questoes_dia":10,"redacoes_mes":2,"ia_chamadas_dia":5,"simulados_mes":1}'),
  ('plus',   'Plus',   39.00,  '{"questoes_dia":999,"redacoes_mes":999,"ia_chamadas_dia":20,"simulados_mes":999}'),
  ('escola', 'Escola', 2400.00,'{"questoes_dia":999,"redacoes_mes":999,"ia_chamadas_dia":50,"simulados_mes":999}');

-- ─── 13. ASSINATURAS ──────────────────────────────────────────────────────
CREATE TABLE public.assinaturas (
  id                  UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID              NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plano_id            TEXT              NOT NULL REFERENCES public.planos(id),
  status              status_assinatura NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT           UNIQUE,
  stripe_customer_id     TEXT,
  periodo_inicio      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  periodo_fim         TIMESTAMPTZ,
  cancelado_em        TIMESTAMPTZ,
  motivo_cancelamento TEXT,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assinaturas_user_id ON public.assinaturas(user_id);
CREATE INDEX idx_assinaturas_status  ON public.assinaturas(status);

CREATE TRIGGER trg_assinaturas_updated_at
  BEFORE UPDATE ON public.assinaturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 14. USO DE API IA ────────────────────────────────────────────────────
-- Controle de consumo da Anthropic API por usuário/dia
-- Espelha o RateLimiter do NotaA_Beta_Engine.js no servidor

CREATE TABLE public.uso_api_ia (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  data            DATE        NOT NULL DEFAULT CURRENT_DATE,
  modulo          TEXT        NOT NULL,  -- 'quiz', 'socratica', 'redacao', 'simulado'
  chamadas        INTEGER     NOT NULL DEFAULT 1,
  tokens_input    INTEGER     DEFAULT 0,
  tokens_output   INTEGER     DEFAULT 0,
  custo_usd       NUMERIC(10,6) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, data, modulo)
);

CREATE INDEX idx_uso_api_user_data ON public.uso_api_ia(user_id, data);
CREATE INDEX idx_uso_api_data      ON public.uso_api_ia(data DESC);

-- ─── 15. BATALHAS PVP ─────────────────────────────────────────────────────
CREATE TABLE public.batalhas (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  jogador_1_id    UUID        NOT NULL REFERENCES public.users(id),
  jogador_2_id    UUID        REFERENCES public.users(id), -- NULL = IA adversário
  area            area_enem   NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'aguardando'
                  CHECK (status IN ('aguardando','em_andamento','concluida','cancelada')),
  vencedor_id     UUID        REFERENCES public.users(id),
  pontuacao_j1    INTEGER     DEFAULT 0,
  pontuacao_j2    INTEGER     DEFAULT 0,
  xp_j1           INTEGER     DEFAULT 0,
  xp_j2           INTEGER     DEFAULT 0,
  questoes        JSONB       DEFAULT '[]',  -- IDs das questões usadas
  respostas_j1    JSONB       DEFAULT '{}',
  respostas_j2    JSONB       DEFAULT '{}',
  modo            TEXT        DEFAULT 'pvp'
                  CHECK (modo IN ('pvp','ia','coletiva')),
  turma_id        UUID        REFERENCES public.turmas(id),
  iniciada_em     TIMESTAMPTZ,
  encerrada_em    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batalhas_j1         ON public.batalhas(jogador_1_id);
CREATE INDEX idx_batalhas_j2         ON public.batalhas(jogador_2_id);
CREATE INDEX idx_batalhas_status     ON public.batalhas(status);
CREATE INDEX idx_batalhas_created_at ON public.batalhas(created_at DESC);

-- ─── 16. NOTIFICAÇÕES ─────────────────────────────────────────────────────
CREATE TABLE public.notificacoes (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo            TEXT        NOT NULL,
  -- 'streak_risco','level_up','conquista','resultado_redacao','relatorio_semanal',
  -- 'batalha_convite','batalha_resultado','plano_expirando'
  titulo          TEXT        NOT NULL,
  mensagem        TEXT        NOT NULL,
  dados           JSONB       DEFAULT '{}',
  lida            BOOLEAN     NOT NULL DEFAULT FALSE,
  lida_em         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_lida    ON public.notificacoes(user_id, lida);
CREATE INDEX idx_notif_created_at   ON public.notificacoes(created_at DESC);

-- ─── 17. AUDIT LOG ────────────────────────────────────────────────────────
-- Rastreabilidade de ações críticas (LGPD + segurança)
CREATE TABLE public.audit_log (
  id              BIGSERIAL   PRIMARY KEY,
  user_id         UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  acao            TEXT        NOT NULL,
  -- 'login','logout','cadastro','redefinicao_senha','exclusao_conta',
  -- 'alteracao_plano','exportacao_dados','acesso_admin'
  tabela          TEXT,
  registro_id     TEXT,
  dados_antes     JSONB,
  dados_depois    JSONB,
  ip              INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id    ON public.audit_log(user_id);
CREATE INDEX idx_audit_acao       ON public.audit_log(acao);
CREATE INDEX idx_audit_created_at ON public.audit_log(created_at DESC);


-- ─── TRIGGERS COMPLEMENTARES ──────────────────────────────────────────────
-- Substitui colunas GENERATED removidas por compatibilidade com Supabase

-- Calcula duracao_segundos ao encerrar sessão
CREATE OR REPLACE FUNCTION calcular_duracao_sessao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.encerrado_em IS NOT NULL AND OLD.encerrado_em IS NULL THEN
    NEW.duracao_segundos = EXTRACT(EPOCH FROM (NEW.encerrado_em - NEW.iniciado_em))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_duracao
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION calcular_duracao_sessao();

-- Calcula total_palavras ao inserir/atualizar redação
CREATE OR REPLACE FUNCTION calcular_total_palavras()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_palavras = array_length(string_to_array(trim(NEW.texto), ' '), 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_palavras
  BEFORE INSERT OR UPDATE OF texto ON public.redacoes
  FOR EACH ROW EXECUTE FUNCTION calcular_total_palavras();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — SUPABASE
-- Cada usuário só acessa seus próprios dados
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redacoes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas_ia       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uso_api_ia         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batalhas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes       ENABLE ROW LEVEL SECURITY;

-- users: cada usuário vê e edita apenas o próprio perfil
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.tipo_perfil IN ('administrador','professor')
  ));
CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_insert ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- sessions: apenas o próprio usuário
CREATE POLICY sessions_own ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

-- respostas: apenas o próprio usuário
CREATE POLICY respostas_own ON public.respostas
  FOR ALL USING (auth.uid() = user_id);

-- redações: próprio usuário (professor pode ver as da turma)
CREATE POLICY redacoes_own ON public.redacoes
  FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.estudantes_turmas et
      JOIN public.professores_turmas pt ON et.turma_id = pt.turma_id
      WHERE et.estudante_id = redacoes.user_id AND pt.professor_id = auth.uid()
    )
  );
CREATE POLICY redacoes_own_write ON public.redacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY redacoes_own_update ON public.redacoes
  FOR UPDATE USING (auth.uid() = user_id);

-- conversas_ia: apenas o próprio usuário
CREATE POLICY conversas_own ON public.conversas_ia
  FOR ALL USING (auth.uid() = user_id);

-- conquistas: próprio usuário (e professores da turma podem ver)
CREATE POLICY conquistas_own ON public.conquistas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY conquistas_insert ON public.conquistas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- assinaturas: apenas o próprio usuário
CREATE POLICY assinaturas_own ON public.assinaturas
  FOR ALL USING (auth.uid() = user_id);

-- uso_api_ia: apenas o próprio usuário
CREATE POLICY uso_api_own ON public.uso_api_ia
  FOR ALL USING (auth.uid() = user_id);

-- batalhas: participantes da batalha
CREATE POLICY batalhas_participantes ON public.batalhas
  FOR SELECT USING (
    auth.uid() = jogador_1_id OR auth.uid() = jogador_2_id
  );
CREATE POLICY batalhas_criar ON public.batalhas
  FOR INSERT WITH CHECK (auth.uid() = jogador_1_id);
CREATE POLICY batalhas_atualizar ON public.batalhas
  FOR UPDATE USING (
    auth.uid() = jogador_1_id OR auth.uid() = jogador_2_id
  );

-- notificações: apenas o próprio usuário
CREATE POLICY notificacoes_own ON public.notificacoes
  FOR ALL USING (auth.uid() = user_id);

-- questões: públicas para leitura (sem RLS restritivo)
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY questoes_public_read ON public.questoes
  FOR SELECT USING (ativa = TRUE);
CREATE POLICY questoes_admin_write ON public.questoes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
    AND tipo_perfil = 'administrador'
  ));

-- escolas e turmas: leitura pelos membros
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
CREATE POLICY escolas_membros ON public.escolas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND escola_id = escolas.id)
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo_perfil = 'administrador')
  );

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY turmas_membros ON public.turmas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estudantes_turmas WHERE estudante_id = auth.uid() AND turma_id = turmas.id
      UNION
      SELECT 1 FROM public.professores_turmas WHERE professor_id = auth.uid() AND turma_id = turmas.id
    )
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo_perfil = 'administrador')
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS ÚTEIS
-- ═══════════════════════════════════════════════════════════════════════════

-- Ranking geral de estudantes (para o Dashboard e Batalha)
CREATE OR REPLACE VIEW public.ranking_geral AS
  SELECT
    u.id,
    u.nome,
    u.avatar_url,
    u.xp,
    u.level,
    u.streak,
    u.theta_geral,
    ROUND((u.theta_geral * 100 + 500)::NUMERIC, 0) AS nota_enem_estimada,
    u.escola_id,
    RANK() OVER (ORDER BY u.xp DESC) AS posicao_xp,
    RANK() OVER (ORDER BY u.theta_geral DESC) AS posicao_tri
  FROM public.users u
  WHERE u.tipo_perfil = 'estudante'
    AND u.deleted_at IS NULL;

-- Desempenho do estudante por área
CREATE OR REPLACE VIEW public.desempenho_por_area AS
  SELECT
    r.user_id,
    q.area,
    COUNT(*)                                       AS total_respostas,
    SUM(r.correto::INTEGER)                        AS total_acertos,
    ROUND(AVG(r.correto::INTEGER) * 100, 1)        AS taxa_acerto_pct,
    ROUND(AVG(r.tempo_ms) / 1000.0, 1)            AS tempo_medio_seg,
    MAX(r.theta_depois)                            AS theta_atual,
    ROUND((MAX(r.theta_depois) * 100 + 500)::NUMERIC, 0) AS nota_estimada,
    MAX(r.created_at)                              AS ultima_resposta
  FROM public.respostas r
  JOIN public.questoes q ON r.questao_id = q.id
  GROUP BY r.user_id, q.area;

-- Painel do professor — turma
CREATE OR REPLACE VIEW public.painel_professor AS
  SELECT
    pt.professor_id,
    et.turma_id,
    t.nome          AS turma_nome,
    u.id            AS estudante_id,
    u.nome          AS estudante_nome,
    u.xp,
    u.streak,
    u.theta_geral,
    ROUND((u.theta_geral * 100 + 500)::NUMERIC, 0) AS nota_enem_estimada,
    u.ultimo_acesso
  FROM public.professores_turmas pt
  JOIN public.estudantes_turmas et ON pt.turma_id = et.turma_id
  JOIN public.turmas t ON t.id = et.turma_id
  JOIN public.users u ON u.id = et.estudante_id
  WHERE pt.ativo AND et.ativo AND u.deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNÇÕES UTILITÁRIAS
-- ═══════════════════════════════════════════════════════════════════════════

-- Atualiza theta do usuário após uma sequência de respostas
CREATE OR REPLACE FUNCTION atualizar_theta_usuario(
  p_user_id UUID,
  p_area    area_enem,
  p_theta   NUMERIC
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE public.users SET theta_%I = $1, theta_geral = (
       SELECT AVG(v) FROM (VALUES (theta_mat),(theta_lin),(theta_hum),(theta_nat)) AS t(v)
     ), updated_at = NOW() WHERE id = $2',
    p_area
  ) USING p_theta, p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Concede conquista (idempotente — ignora duplicatas)
CREATE OR REPLACE FUNCTION conceder_conquista(
  p_user_id    UUID,
  p_tipo       tipo_conquista,
  p_titulo     TEXT,
  p_descricao  TEXT,
  p_xp_bonus   INTEGER DEFAULT 0,
  p_dados      JSONB   DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.conquistas (user_id, tipo, titulo, descricao, xp_bonus, dados)
  VALUES (p_user_id, p_tipo, p_titulo, p_descricao, p_xp_bonus, p_dados)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND p_xp_bonus > 0 THEN
    UPDATE public.users SET xp = xp + p_xp_bonus WHERE id = p_user_id;
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registra uso da API IA (upsert diário por módulo)
CREATE OR REPLACE FUNCTION registrar_uso_ia(
  p_user_id     UUID,
  p_modulo      TEXT,
  p_tokens_in   INTEGER DEFAULT 0,
  p_tokens_out  INTEGER DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE v_chamadas INTEGER;
BEGIN
  INSERT INTO public.uso_api_ia (user_id, data, modulo, chamadas, tokens_input, tokens_output)
  VALUES (p_user_id, CURRENT_DATE, p_modulo, 1, p_tokens_in, p_tokens_out)
  ON CONFLICT (user_id, data, modulo)
  DO UPDATE SET
    chamadas      = uso_api_ia.chamadas + 1,
    tokens_input  = uso_api_ia.tokens_input + EXCLUDED.tokens_input,
    tokens_output = uso_api_ia.tokens_output + EXCLUDED.tokens_output
  RETURNING chamadas INTO v_chamadas;
  RETURN v_chamadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se usuário atingiu limite diário de IA
CREATE OR REPLACE FUNCTION verificar_limite_ia(
  p_user_id UUID,
  p_modulo  TEXT DEFAULT 'quiz'
)
RETURNS JSONB AS $$
DECLARE
  v_chamadas INTEGER;
  v_limite   INTEGER;
  v_plano    TEXT;
BEGIN
  SELECT plano INTO v_plano FROM public.users WHERE id = p_user_id;
  v_limite := CASE v_plano
    WHEN 'plus'   THEN 20
    WHEN 'escola' THEN 50
    WHEN 'admin'  THEN 999
    ELSE 5
  END;

  SELECT COALESCE(SUM(chamadas), 0) INTO v_chamadas
  FROM public.uso_api_ia
  WHERE user_id = p_user_id AND data = CURRENT_DATE;

  RETURN jsonb_build_object(
    'ok',         v_chamadas < v_limite,
    'chamadas',   v_chamadas,
    'limite',     v_limite,
    'restantes',  GREATEST(0, v_limite - v_chamadas)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- DADOS INICIAIS
-- ═══════════════════════════════════════════════════════════════════════════

-- Questões ENEM (as 40 do NotaA_Beta_Engine.js)
-- Execute o INSERT das questões separadamente após rodar este schema
-- Script disponível em: /scripts/seed_questoes_enem.sql

-- Comentário: as questões estão em NotaA_Beta_Engine.js → QUESTOES_ENEM
-- Converta o array JS para INSERT SQL com o conversor em /scripts/convert_questions.py


-- ─── RLS ADICIONAL — tabelas de relacionamento e logs ─────────────────────

ALTER TABLE public.professores_turmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY pt_membros ON public.professores_turmas
  FOR SELECT USING (
    auth.uid() = professor_id OR EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid()
      AND tipo_perfil IN ('administrador','escola')
    )
  );
CREATE POLICY pt_admin_write ON public.professores_turmas
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
    AND tipo_perfil IN ('administrador','escola')
  ));

ALTER TABLE public.estudantes_turmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY et_proprio ON public.estudantes_turmas
  FOR SELECT USING (
    auth.uid() = estudante_id OR EXISTS (
      SELECT 1 FROM public.professores_turmas
      WHERE professor_id = auth.uid() AND turma_id = estudantes_turmas.turma_id
    ) OR EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid()
      AND tipo_perfil IN ('administrador','escola')
    )
  );
CREATE POLICY et_admin_write ON public.estudantes_turmas
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
    AND tipo_perfil IN ('administrador','escola')
  ));

ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY planos_public_read ON public.planos
  FOR SELECT USING (ativo = TRUE);
CREATE POLICY planos_admin_write ON public.planos
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
    AND tipo_perfil = 'administrador'
  ));

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin_only ON public.audit_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
    AND tipo_perfil = 'administrador'
  ));
CREATE POLICY audit_insert_own ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ═══════════════════════════════════════════════════════════════════════════
-- CONFIGURAÇÕES SUPABASE
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar Realtime para ranking e batalhas (no dashboard Supabase):
-- Database → Replication → Tables to replicate:
--   public.batalhas ✓
--   public.notificacoes ✓
--   public.users (apenas colunas: xp, level, streak, theta_geral) ✓

-- Storage buckets necessários (no dashboard Supabase → Storage):
--   avatars      — imagens de perfil (público)
--   redacoes     — textos de redação (privado, acesso por RLS)
--   questoes-img — imagens das questões ENEM (público)
--   certificados — PDFs gerados (privado, acesso por RLS)

-- ═══════════════════════════════════════════════════════════════════════════
-- ÍNDICES DE PERFORMANCE (executar após carga inicial de dados)
-- ═══════════════════════════════════════════════════════════════════════════

-- Para análise TRI em lote (calibração dos parâmetros a,b,c)
CREATE INDEX IF NOT EXISTS idx_respostas_tri_analysis
  ON public.respostas(questao_id, correto, theta_antes, tempo_ms);

-- Para relatórios do professor (desempenho de turma por período)
CREATE INDEX IF NOT EXISTS idx_respostas_periodo
  ON public.respostas(user_id, created_at DESC, correto);


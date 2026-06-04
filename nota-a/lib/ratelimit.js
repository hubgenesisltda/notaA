// lib/ratelimit.js — verificação e registro de limite de IA no banco

import { supabaseAdmin } from './supabase.js';

// Limites por plano (espelha verificar_limite_ia() no PostgreSQL)
const LIMITES = {
  free:         { dia: 5,   minuto: 2 },
  plus:         { dia: 20,  minuto: 3 },
  escola:       { dia: 50,  minuto: 5 },
  administrador:{ dia: 999, minuto: 20 },
};

/**
 * Verifica se o usuário pode fazer mais uma chamada à IA.
 * Usa a função verificar_limite_ia() do banco (mais confiável que localStorage).
 */
export async function verificarLimite(userId, modulo = 'quiz') {
  const { data, error } = await supabaseAdmin.rpc('verificar_limite_ia', {
    p_user_id: userId,
    p_modulo:  modulo,
  });

  if (error) {
    // Falha silenciosa — permite a chamada (fail open) para não bloquear usuários
    console.error('[ratelimit] Erro ao verificar limite:', error.message);
    return { ok: true, restantes: -1, motivo: null };
  }

  if (!data.ok) {
    return {
      ok: false,
      restantes: 0,
      motivo: `Limite diário de ${data.limite} consultas de IA atingido. Volta amanhã!`,
    };
  }

  return { ok: true, restantes: data.restantes, motivo: null };
}

/**
 * Registra uma chamada realizada (atualiza uso_api_ia no banco).
 */
export async function registrarUso(userId, modulo, tokensIn = 0, tokensOut = 0) {
  const { error } = await supabaseAdmin.rpc('registrar_uso_ia', {
    p_user_id:    userId,
    p_modulo:     modulo,
    p_tokens_in:  tokensIn,
    p_tokens_out: tokensOut,
  });

  if (error) {
    console.error('[ratelimit] Erro ao registrar uso:', error.message);
  }
}

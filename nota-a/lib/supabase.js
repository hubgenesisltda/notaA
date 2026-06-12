// lib/supabase.js — cliente Supabase server-side (service role)
// Usado apenas dentro das Edge Functions — nunca exposto ao cliente

import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.SUPABASE_URL)          throw new Error('SUPABASE_URL não definida');
if (!import.meta.env.SUPABASE_SERVICE_ROLE) throw new Error('SUPABASE_SERVICE_ROLE não definida');

// Service role ignora RLS — usado apenas server-side para registrar uso e verificar limites
export const supabaseAdmin = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }
);

// Cliente anon para validar JWT do usuário
export const supabaseAnon = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

/**
 * Extrai e valida o usuário a partir do JWT no header Authorization.
 * @param {Request} req
 * @returns {{ user: object, error: string|null }}
 */
export async function getUserFromRequest(req) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return { user: null, error: 'Token de autenticação ausente.' };
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data?.user) {
    return { user: null, error: 'Token inválido ou expirado.' };
  }

  return { user: data.user, error: null };
}

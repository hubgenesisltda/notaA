import { useState, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// NOTA A BETA — AUTENTICAÇÃO
// Componente de auth real: cadastro / login / recuperação / perfil
// Integração: Supabase Auth (JWT + Google OAuth)
// ═══════════════════════════════════════════════════════════════════

const C = {
  bg:"#0A0E1A", surface:"#111827", card:"#1A2235", border:"#1E2D45",
  primary:"#00D4FF", secondary:"#7C3AED", accent:"#F59E0B",
  success:"#10B981", danger:"#EF4444", text:"#E2E8F0", muted:"#64748B",
};
const GP = `linear-gradient(135deg,${C.primary},${C.secondary})`;
const GG = `linear-gradient(135deg,${C.accent},#F97316)`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden;}
button,input,select,textarea{font-family:inherit;cursor:pointer;border:none;background:none;outline:none;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes glow{0%,100%{opacity:.35;}50%{opacity:.7;}}
@keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}
.fu{animation:fadeUp .4s ease both;}
.spin{animation:spin .8s linear infinite;}
.shake{animation:shake .3s ease;}
`;

// ── Supabase client ───────────────────────────────────────────────

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Primitivos UI ─────────────────────────────────────────────────
function Spin() {
  return (
    <div className="spin" style={{
      width:20, height:20, borderRadius:'50%',
      border:`2px solid ${C.border}`,
      borderTopColor: C.primary,
      display:'inline-block',
    }}/>
  );
}

function Input({ label, type='text', value, onChange, placeholder, autoFocus, error, hint }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:'block', fontSize:11, fontWeight:700,
        color: error ? C.danger : C.muted, marginBottom:5, letterSpacing:.5}}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width:'100%', padding:'12px 14px',
          background: C.surface,
          border:`1.5px solid ${error ? C.danger : focus ? C.primary : C.border}`,
          borderRadius:11, color:C.text, fontSize:14,
          transition:'border-color .2s',
        }}
      />
      {hint && !error && <div style={{fontSize:11,color:C.muted,marginTop:4}}>{hint}</div>}
      {error && <div style={{fontSize:11,color:C.danger,marginTop:4}}>⚠ {error}</div>}
    </div>
  );
}

function Btn({ children, onClick, loading, full, ghost, danger }) {
  const [h, sH] = useState(false);
  const bg = danger ? C.danger : ghost ? 'transparent' : GP;
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => sH(true)}
      onMouseLeave={() => sH(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        width: full ? '100%' : 'auto',
        padding:'13px 24px', borderRadius:12,
        background: bg,
        border: ghost ? `1.5px solid ${h ? C.primary : C.border}` : 'none',
        color: ghost ? (h ? C.primary : C.muted) : '#fff',
        fontSize:14, fontWeight:800, fontFamily:"'Syne',sans-serif",
        opacity: loading ? .7 : 1,
        transform: h && !loading ? 'scale(1.02)' : 'scale(1)',
        boxShadow: !ghost && !danger && h ? `0 8px 28px ${C.primary}44` : 'none',
        transition:'all .2s', cursor: loading ? 'wait' : 'pointer',
      }}
    >
      {loading ? <Spin /> : children}
    </button>
  );
}

function Divider({ label }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, margin:'18px 0'}}>
      <div style={{flex:1, height:1, background:C.border}}/>
      <span style={{fontSize:12, color:C.muted}}>{label}</span>
      <div style={{flex:1, height:1, background:C.border}}/>
    </div>
  );
}

function GoogleBtn({ onClick, loading }) {
  const [h, sH] = useState(false);
  return (
    <button
      onClick={onClick} disabled={loading}
      onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        width:'100%', padding:'12px', borderRadius:12,
        background: h ? `${C.surface}` : C.card,
        border:`1.5px solid ${h ? C.primary : C.border}`,
        color:C.text, fontSize:14, fontWeight:600,
        transition:'all .2s', cursor:'pointer',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" style={{fontFamily:'initial'}}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? <Spin /> : 'Continuar com Google'}
    </button>
  );
}

// ── Validações ────────────────────────────────────────────────────
function validate(fields) {
  const errors = {};
  if ('nome' in fields && !fields.nome?.trim()) errors.nome = 'Informe seu nome completo.';
  if ('email' in fields && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = 'E-mail inválido.';
  if ('senha' in fields && fields.senha?.length < 8) errors.senha = 'Mínimo 8 caracteres.';
  if ('confirma' in fields && fields.confirma !== fields.senha) errors.confirma = 'As senhas não coincidem.';
  return errors;
}

// ── Tela de Cadastro ──────────────────────────────────────────────
function Cadastro({ onSuccess, onLogin }) {
  const [f, setF] = useState({ nome:'', email:'', senha:'', confirma:'', tipoPerfil:'estudante' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [shake, setShake] = useState(false);

  const set = k => v => setF(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    const errs = validate(f);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: f.email,
      password: f.senha,
      options: { data: { full_name: f.nome, tipo_perfil: f.tipoPerfil } },
    });
    setLoading(false);
    if (error) { setErrors({ email: error.message }); return; }
    onSuccess(data.user, f.tipoPerfil);
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) { setLoadingGoogle(false); setErrors({ email: error.message }); }
    // em caso de sucesso o Supabase redireciona para o Google automaticamente
  };

  const PERFIS = [
    { id:'estudante', icon:'🎓', label:'Estudante',  sub:'Quero me preparar para o ENEM' },
    { id:'professor', icon:'👨‍🏫',label:'Professor',   sub:'Acompanho turmas e alunos' },
    { id:'escola',    icon:'🏛️', label:'Escola',      sub:'Acesso institucional completo' },
  ];

  return (
    <div className={shake ? 'shake' : ''}>
      <GoogleBtn onClick={handleGoogle} loading={loadingGoogle} />
      <Divider label="ou cadastre-se com e-mail" />

      <Input label="NOME COMPLETO" value={f.nome} onChange={set('nome')} placeholder="Seu nome" autoFocus error={errors.nome} />
      <Input label="E-MAIL" type="email" value={f.email} onChange={set('email')} placeholder="seu@email.com" error={errors.email} />
      <Input label="SENHA" type="password" value={f.senha} onChange={set('senha')} placeholder="Mínimo 8 caracteres" hint="Use letras, números e símbolos" error={errors.senha} />
      <Input label="CONFIRMAR SENHA" type="password" value={f.confirma} onChange={set('confirma')} placeholder="Repita a senha" error={errors.confirma} />

      <div style={{marginBottom:18}}>
        <label style={{display:'block', fontSize:11, fontWeight:700, color:C.muted, marginBottom:10, letterSpacing:.5}}>
          TIPO DE PERFIL
        </label>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {PERFIS.map(p => (
            <div key={p.id} onClick={() => set('tipoPerfil')(p.id)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 14px', borderRadius:12, cursor:'pointer',
                border:`1.5px solid ${f.tipoPerfil===p.id ? C.primary : C.border}`,
                background: f.tipoPerfil===p.id ? `${C.primary}10` : C.surface,
                transition:'all .15s',
              }}>
              <span style={{fontSize:20, fontFamily:'initial'}}>{p.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color: f.tipoPerfil===p.id ? C.primary : C.text}}>{p.label}</div>
                <div style={{fontSize:11, color:C.muted}}>{p.sub}</div>
              </div>
              {f.tipoPerfil===p.id && (
                <div style={{width:18, height:18, borderRadius:'50%', background:C.primary,
                  display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{color:'#fff', fontSize:10}}>✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Btn onClick={handleSubmit} loading={loading} full>
        Criar minha conta gratuita →
      </Btn>

      <div style={{textAlign:'center', marginTop:14, fontSize:12, color:C.muted}}>
        Ao criar uma conta, você aceita os{' '}
        <span style={{color:C.primary, cursor:'pointer'}}>Termos de Uso</span>
        {' '}e a{' '}
        <span style={{color:C.primary, cursor:'pointer'}}>Política de Privacidade</span>.
      </div>

      <div style={{textAlign:'center', marginTop:12}}>
        <span style={{fontSize:13, color:C.muted}}>Já tem conta? </span>
        <span style={{fontSize:13, color:C.primary, cursor:'pointer', fontWeight:700}}
          onClick={onLogin}>Entrar</span>
      </div>
    </div>
  );
}

// ── Tela de Login ─────────────────────────────────────────────────
function Login({ onSuccess, onCadastro, onRecuperar }) {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading]       = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleSubmit = async () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido.';
    if (!senha) errs.senha = 'Informe sua senha.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) { setErrors({ senha: error.message }); return; }
    onSuccess(data.user, data.user.user_metadata?.tipo_perfil || 'estudante');
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) { setLoadingGoogle(false); setErrors({ senha: error.message }); }
    // em caso de sucesso o Supabase redireciona para o Google automaticamente
  };

  return (
    <div>
      <GoogleBtn onClick={handleGoogle} loading={loadingGoogle} />
      <Divider label="ou entre com e-mail" />

      <Input label="E-MAIL" type="email" value={email} onChange={setEmail}
        placeholder="seu@email.com" autoFocus error={errors.email} />
      <Input label="SENHA" type="password" value={senha} onChange={setSenha}
        placeholder="Sua senha" error={errors.senha} />

      <div style={{textAlign:'right', marginTop:-8, marginBottom:14}}>
        <span style={{fontSize:12, color:C.primary, cursor:'pointer'}}
          onClick={onRecuperar}>Esqueci minha senha</span>
      </div>

      <Btn onClick={handleSubmit} loading={loading} full>Entrar →</Btn>

      <div style={{textAlign:'center', marginTop:14}}>
        <span style={{fontSize:13, color:C.muted}}>Não tem conta? </span>
        <span style={{fontSize:13, color:C.primary, cursor:'pointer', fontWeight:700}}
          onClick={onCadastro}>Criar conta grátis</span>
      </div>
    </div>
  );
}

// ── Tela de Recuperação de Senha ─────────────────────────────────
function Recuperar({ onVoltar }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('E-mail inválido.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  if (sent) return (
    <div style={{textAlign:'center', padding:'24px 0'}}>
      <div style={{fontSize:48, marginBottom:16, fontFamily:'initial'}}>📧</div>
      <div style={{fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:C.success, marginBottom:8}}>
        E-mail enviado!
      </div>
      <p style={{fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:20}}>
        Enviamos um link de recuperação para <strong style={{color:C.text}}>{email}</strong>.
        Verifique sua caixa de entrada (e a pasta de spam).
      </p>
      <Btn onClick={onVoltar} ghost full>← Voltar ao login</Btn>
    </div>
  );

  return (
    <div>
      <p style={{fontSize:14, color:C.muted, lineHeight:1.65, marginBottom:20}}>
        Informe o e-mail cadastrado. Enviaremos um link para criar uma nova senha.
      </p>
      <Input label="E-MAIL" type="email" value={email} onChange={setEmail}
        placeholder="seu@email.com" autoFocus error={error} />
      <Btn onClick={handleSubmit} loading={loading} full>Enviar link de recuperação</Btn>
      <div style={{textAlign:'center', marginTop:14}}>
        <span style={{fontSize:13, color:C.primary, cursor:'pointer'}} onClick={onVoltar}>
          ← Voltar ao login
        </span>
      </div>
    </div>
  );
}

// ── Tela de Sucesso / Boas-vindas ─────────────────────────────────
function Sucesso({ user, tipoPerfil }) {
  const nome = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudante';
  const icones = { estudante:'🎓', professor:'👨‍🏫', escola:'🏛️' };
  return (
    <div style={{textAlign:'center', padding:'28px 0'}}>
      <div style={{
        width:72, height:72, borderRadius:'50%',
        background:`${C.primary}18`, border:`2px solid ${C.primary}44`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:36, margin:'0 auto 18px', fontFamily:'initial',
      }}>
        {icones[tipoPerfil] || '🎓'}
      </div>
      <div style={{fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:900, color:C.text, marginBottom:6}}>
        Bem-vindo, {nome.split(' ')[0]}!
      </div>
      <div style={{fontSize:14, color:C.muted, marginBottom:24, lineHeight:1.6}}>
        Sua conta foi criada com sucesso.<br/>
        Preparando sua experiência personalizada...
      </div>
      <div style={{display:'flex', justifyContent:'center'}}>
        <div style={{
          width:32, height:32, borderRadius:'50%',
          border:`3px solid ${C.border}`,
          borderTopColor:C.primary,
          animation:'spin .8s linear infinite',
        }}/>
      </div>
    </div>
  );
}

// ── Shell principal de Auth ───────────────────────────────────────
export default function NotaAAuth({ onAuthenticated }) {
  const [tela, setTela] = useState('cadastro'); // cadastro | login | recuperar | sucesso
  const [user, setUser]           = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('estudante');

  // Verificar sessão existente ao montar (inclui retorno pós-OAuth)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        const tp = u.user_metadata?.tipo_perfil || 'estudante';
        onAuthenticated?.(u, tp);
      }
    });
  }, []);

  const handleSuccess = useCallback((u, tp) => {
    setUser(u);
    setTipoPerfil(tp);
    setTela('sucesso');
    setTimeout(() => onAuthenticated?.(u, tp), 1800);
  }, [onAuthenticated]);

  const TITLES = {
    cadastro:  { title: 'Crie sua conta', sub: 'Comece grátis — sem cartão' },
    login:     { title: 'Bem-vindo de volta', sub: 'Entre na sua conta' },
    recuperar: { title: 'Recuperar senha', sub: 'Vamos te ajudar a entrar' },
    sucesso:   { title: '', sub: '' },
  };
  const { title, sub } = TITLES[tela];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>

        {/* Orb de fundo */}
        <div style={{ position:'fixed', top:-160, left:-160, width:480, height:480, borderRadius:'50%',
          background:`radial-gradient(circle,${C.primary}09,transparent 65%)`,
          pointerEvents:'none', animation:'glow 7s ease infinite' }}/>
        <div style={{ position:'fixed', bottom:-160, right:-160, width:440, height:440, borderRadius:'50%',
          background:`radial-gradient(circle,${C.secondary}09,transparent 65%)`,
          pointerEvents:'none', animation:'glow 9s ease infinite 3s' }}/>

        <div className="fu" style={{ width:'100%', maxWidth:400 }}>

          {/* Card */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:28 }}>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                {/* Logo */}
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:20, marginBottom:4 }}>
                  <span style={{ color:C.primary }}>Nota</span>
                  <span style={{ background:GG, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}> A</span>
                  <span style={{ fontSize:10, fontWeight:700, color:C.accent, background:`${C.accent}18`,
                    border:`1px solid ${C.accent}44`, borderRadius:99, padding:'2px 7px', marginLeft:8, verticalAlign:'middle' }}>
                    BETA
                  </span>
                </div>
                {tela !== 'sucesso' && (
                  <>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:900, color:C.text }}>{title}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{sub}</div>
                  </>
                )}
              </div>
            </div>

            {/* Tabs Cadastro / Login */}
            {(tela === 'cadastro' || tela === 'login') && (
              <div style={{ display:'flex', background:C.surface, padding:3, borderRadius:10,
                border:`1px solid ${C.border}`, marginBottom:22 }}>
                {[['cadastro','Criar conta'],['login','Entrar']].map(([id,lbl]) => (
                  <button key={id} onClick={() => setTela(id)}
                    style={{ flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer',
                      background: tela===id ? `${C.primary}22` : 'transparent',
                      color: tela===id ? C.primary : C.muted,
                      fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif",
                      transition:'all .2s' }}>{lbl}</button>
                ))}
              </div>
            )}

            {/* Conteúdo por tela */}
            {tela === 'cadastro'  && <Cadastro onSuccess={handleSuccess} onLogin={() => setTela('login')} />}
            {tela === 'login'     && <Login onSuccess={handleSuccess} onCadastro={() => setTela('cadastro')} onRecuperar={() => setTela('recuperar')} />}
            {tela === 'recuperar' && <Recuperar onVoltar={() => setTela('login')} />}
            {tela === 'sucesso'   && <Sucesso user={user} tipoPerfil={tipoPerfil} />}

          </div>

          {/* Selos de segurança */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16, flexWrap:'wrap' }}>
            {[['🔒','SSL/TLS'],['🛡️','LGPD'],['🔐','JWT']].map(([ic,lb]) => (
              <div key={lb} style={{ display:'flex', alignItems:'center', gap:4,
                background:`${C.surface}88`, border:`1px solid ${C.border}`,
                borderRadius:8, padding:'4px 10px', fontSize:10, color:C.muted }}>
                <span style={{fontFamily:'initial'}}>{ic}</span> {lb}
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:C.muted }}>
            Hub Gênesis Ltda · CNPJ 38.028.418/0001-80
          </div>
        </div>
      </div>
    </>
  );
}

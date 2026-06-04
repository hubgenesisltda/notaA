import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════
// NOTA A BETA — APP SHELL v1.0
// Roteamento, estado global, guards de auth, diagnóstico cognitivo
// Integra: NotaA_Beta_Engine.js + NotaA_Beta_Auth.jsx
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
button,input{font-family:inherit;cursor:pointer;border:none;background:none;outline:none;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.05);}}
@keyframes glow{0%,100%{opacity:.3;}50%{opacity:.65;}}
.fu{animation:fadeUp .4s ease both;}
.fu2{animation:fadeUp .4s .08s ease both;}
`;

// ─── Estado Global (Context) ──────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// Persiste no localStorage — sobrevive a reloads
function loadState(key, defaultVal) {
  try { const v = localStorage.getItem(`nota_a_${key}`); return v ? JSON.parse(v) : defaultVal; }
  catch { return defaultVal; }
}
function saveState(key, val) {
  try { localStorage.setItem(`nota_a_${key}`, JSON.stringify(val)); } catch {}
}

// ─── Motor TRI inline (sem import externo para funcionar no Artifacts) ──
class TriEngineLocal {
  constructor() { this.D = 1.7; }
  probability(theta, { a=1.0, b=0.0, c=0.25 }) {
    return c + (1-c) / (1 + Math.exp(-this.D * a * (theta - b)));
  }
  updateTheta(theta, q, correto, lr=0.5) {
    const p = this.probability(theta, q);
    const { a=1.0, c=0.25 } = q;
    const u = correto ? 1 : 0;
    const num = this.D * a * (u - p) * (p - c);
    const den = p * (1-p) * (1-c);
    return Math.max(-4, Math.min(4, theta + lr * (den > 0.001 ? num/den : 0)));
  }
  thetaToEnem(theta) { return Math.round(theta * 100 + 500); }
}
const triEngine = new TriEngineLocal();

function nivelFromTheta(theta) {
  if (theta < -2.0) return { label:'Iniciante',     cor:C.danger,    emoji:'🌱' };
  if (theta < -0.5) return { label:'Básico',        cor:C.accent,    emoji:'📚' };
  if (theta <  0.5) return { label:'Intermediário', cor:C.primary,   emoji:'⚡' };
  if (theta <  1.5) return { label:'Avançado',      cor:C.success,   emoji:'🚀' };
  return                    { label:'Expert',        cor:C.secondary, emoji:'🏆' };
}

// ─── Primitivos UI ────────────────────────────────────────────────
function Spin({ size=20, color=C.primary }) {
  return <div style={{ width:size, height:size, borderRadius:'50%',
    border:`2px solid ${C.border}`, borderTopColor:color,
    animation:'spin .8s linear infinite', display:'inline-block' }}/>;
}

function XPBar({ xp, max, level, color=C.primary }) {
  const pct = Math.min(100, Math.round((xp / max) * 100));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:C.muted }}>Nível {level}</span>
        <span style={{ fontSize:11, color:C.muted }}>{xp}/{max} XP</span>
      </div>
      <div style={{ height:4, background:C.border, borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color,
          borderRadius:2, transition:'width .6s ease' }}/>
      </div>
    </div>
  );
}

function Pill({ children, color=C.primary }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:`${color}18`, border:`1px solid ${color}40`,
      borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:700, color }}>
      {children}
    </span>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────
function TopBar({ profile, onMenu, rateLimiter }) {
  const nivel = nivelFromTheta(profile.theta || 0);
  const nota  = triEngine.thetaToEnem(profile.theta || 0);
  const rl    = rateLimiter || { restantes:20, total:20 };
  const rlPct = Math.round((rl.restantes / rl.total) * 100);

  return (
    <div style={{ position:'sticky', top:0, zIndex:100,
      background:`${C.surface}F0`, backdropFilter:'blur(20px)',
      borderBottom:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'0 16px',
        height:56, display:'flex', alignItems:'center', gap:12 }}>

        {/* Logo compacto */}
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:18, flexShrink:0 }}>
          <span style={{ color:C.primary }}>N</span>
          <span style={{ background:GG, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>A</span>
          <span style={{ fontSize:9, fontWeight:700, color:C.accent, background:`${C.accent}18`,
            border:`1px solid ${C.accent}44`, borderRadius:99, padding:'1px 5px', marginLeft:5,
            verticalAlign:'middle' }}>β</span>
        </div>

        {/* Nota TRI */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8,
          padding:'4px 10px', display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:9, color:C.muted, fontWeight:700 }}>ENEM</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:900,
            color:nivel.cor }}>{nota}</span>
          <span style={{ fontSize:10, fontFamily:'initial' }}>{nivel.emoji}</span>
        </div>

        {/* Streak */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:14, fontFamily:'initial' }}>🔥</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800,
            color:C.accent }}>{profile.streak || 0}</span>
        </div>

        {/* Créditos IA */}
        <div title={`${rl.restantes} consultas de IA restantes hoje`}
          style={{ display:'flex', alignItems:'center', gap:5, marginLeft:'auto', cursor:'help' }}>
          <div style={{ width:28, height:4, background:C.border, borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${rlPct}%`,
              background: rlPct > 50 ? C.success : rlPct > 20 ? C.accent : C.danger,
              borderRadius:2, transition:'width .4s' }}/>
          </div>
          <span style={{ fontSize:10, color:C.muted }}>{rl.restantes} IA</span>
        </div>

        {/* Avatar */}
        <div onClick={onMenu} style={{ width:32, height:32, borderRadius:'50%',
          background:GP, display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', flexShrink:0 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:900, color:'#fff' }}>
            {(profile.nome || 'U')[0].toUpperCase()}
          </span>
        </div>
      </div>

      {/* Barra XP */}
      <div style={{ maxWidth:520, margin:'0 auto', padding:'0 16px 8px' }}>
        <XPBar xp={profile.xp || 0} max={(profile.level || 1) * 500} level={profile.level || 1} />
      </div>
    </div>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────
const NAV = [
  { id:'home',      emoji:'🏠', label:'Início'    },
  { id:'quiz',      emoji:'⚡', label:'Quiz'       },
  { id:'estudo',    emoji:'📚', label:'Estudo'     },
  { id:'dashboard', emoji:'📊', label:'Resultado'  },
  { id:'perfil',    emoji:'👤', label:'Perfil'     },
];

function NavBar({ screen, onNav }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      background:`${C.surface}F8`, backdropFilter:'blur(20px)',
      borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:520, margin:'0 auto', display:'flex' }}>
        {NAV.map(n => {
          const active = screen === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)}
              style={{ flex:1, padding:'10px 4px 12px', display:'flex',
                flexDirection:'column', alignItems:'center', gap:3,
                background:'none', border:'none', cursor:'pointer',
                transition:'all .15s' }}>
              <span style={{ fontSize:active ? 20 : 18, fontFamily:'initial',
                filter: active ? 'none' : 'grayscale(60%) opacity(0.6)',
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition:'all .2s' }}>{n.emoji}</span>
              <span style={{ fontSize:9, fontWeight:700,
                color: active ? C.primary : C.muted,
                fontFamily:"'Syne',sans-serif",
                letterSpacing:.3 }}>{n.label}</span>
              {active && <div style={{ width:16, height:2, background:C.primary,
                borderRadius:1, marginTop:1 }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Telas ───────────────────────────────────────────────────────

// HOME — Dashboard pessoal com insights IA
function Home({ profile, onNav }) {
  const nivel = nivelFromTheta(profile.theta || 0);
  const nota  = triEngine.thetaToEnem(profile.theta || 0);
  const areas = [
    { id:'mat', label:'Matemática',   theta: profile.thetas?.mat || 0 },
    { id:'lin', label:'Linguagens',   theta: profile.thetas?.lin || 0 },
    { id:'hum', label:'Humanas',      theta: profile.thetas?.hum || 0 },
    { id:'nat', label:'Natureza',     theta: profile.thetas?.nat || 0 },
  ];

  return (
    <div style={{ padding:'16px 16px 88px' }}>

      {/* Boas-vindas */}
      <div className="fu" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:900,
          color:C.text, marginBottom:4 }}>
          Olá, {profile.nome?.split(' ')[0] || 'Estudante'}!
        </div>
        <div style={{ fontSize:14, color:C.muted }}>
          {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}
        </div>
      </div>

      {/* Nota ENEM estimada */}
      <div className="fu" style={{ background:C.card, border:`1px solid ${C.border}`,
        borderRadius:20, padding:'20px', marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, marginBottom:6 }}>
              NOTA ENEM ESTIMADA (TRI)
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:48, fontWeight:900,
              color:nivel.cor, lineHeight:1 }}>{nota}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>
              <span style={{ fontFamily:'initial' }}>{nivel.emoji}</span> {nivel.label}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>SEQUÊNCIA</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:900,
              color:C.accent }}>
              <span style={{ fontFamily:'initial' }}>🔥</span> {profile.streak || 0}
            </div>
            <div style={{ fontSize:11, color:C.muted }}>dias</div>
          </div>
        </div>
      </div>

      {/* Notas por área */}
      <div className="fu2" style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10 }}>
          DESEMPENHO POR ÁREA
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {areas.map(a => {
            const nv = nivelFromTheta(a.theta);
            const nota_a = triEngine.thetaToEnem(a.theta);
            const pct = Math.min(100, Math.round(((a.theta + 4) / 8) * 100));
            return (
              <div key={a.id} onClick={() => onNav('quiz', a.id)}
                style={{ background:C.card, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:'14px', cursor:'pointer',
                  transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = nv.cor; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{a.label}</span>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14,
                    fontWeight:900, color:nv.cor }}>{nota_a}</span>
                </div>
                <div style={{ height:3, background:C.border, borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${pct}%`,
                    background:nv.cor, borderRadius:2, transition:'width .6s' }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10 }}>CONTINUAR ESTUDANDO</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {[
          { label:'Quiz Adaptativo', sub:'Próxima questão calibrada para o seu nível', icon:'⚡', screen:'quiz', cor:C.primary },
          { label:'IA Socrática',    sub:'Aprenda descobrindo — sem decoreba',          icon:'🧠', screen:'estudo', cor:C.secondary },
          { label:'Minha Redação',   sub:'Corrija e evolua com feedback da IA',         icon:'✍️', screen:'estudo', cor:C.accent },
        ].map(a => (
          <div key={a.label} onClick={() => onNav(a.screen)}
            style={{ background:C.card, border:`1px solid ${C.border}`,
              borderRadius:14, padding:'14px 16px', cursor:'pointer',
              display:'flex', alignItems:'center', gap:12, transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = a.cor; e.currentTarget.style.background = `${a.cor}08`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
            <div style={{ width:40, height:40, borderRadius:12,
              background:`${a.cor}18`, border:`1px solid ${a.cor}40`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, fontFamily:'initial', flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>{a.label}</div>
              <div style={{ fontSize:12, color:C.muted }}>{a.sub}</div>
            </div>
            <div style={{ color:C.muted, fontSize:16 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// QUIZ — Adaptativo TRI com geração por IA
function QuizTRI({ profile, onUpdateProfile, showToast }) {
  const [area, setArea]       = useState(null);
  const [fase, setFase]       = useState('selecao'); // selecao | questao | feedback | resultado
  const [questao, setQuestao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState(null);
  const [correto, setCorreto]   = useState(null);
  const [tempo, setTempo]       = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [theta, setTheta]     = useState(0);

  const AREAS = [
    { id:'mat', label:'Matemática',  emoji:'📐', desc:'Funções, geometria, probabilidade' },
    { id:'lin', label:'Linguagens',  emoji:'📖', desc:'Interpretação, gramática, literatura' },
    { id:'hum', label:'Humanas',     emoji:'🌍', desc:'História, geografia, filosofia' },
    { id:'nat', label:'Natureza',    emoji:'🔬', desc:'Biologia, química, física' },
  ];

  const QUESTOES_MOCK = {
    mat: [
      { id:'m1', enunciado:'Uma função f(x)=2x²-3x+1. Para qual valor de x a função é mínima?',
        alternativas:{A:'x=0,75',B:'x=1,0',C:'x=1,5',D:'x=0,5',E:'x=2,0'}, gabarito:'A',
        parametros:{a:1.2,b:0.5,c:0.25}, explicacao:'Mínimo em x=-b/2a = 3/4 = 0,75', subtema:'funções' },
      { id:'m2', enunciado:'Catetos 3cm e 4cm. Qual a hipotenusa?',
        alternativas:{A:'5cm',B:'6cm',C:'7cm',D:'4,5cm',E:'√25cm'}, gabarito:'A',
        parametros:{a:0.8,b:-1.0,c:0.25}, explicacao:'Pitágoras: √(9+16)=5cm', subtema:'geometria' },
      { id:'m3', enunciado:'log₂(8) = ?',
        alternativas:{A:'3',B:'2',C:'4',D:'1',E:'5'}, gabarito:'A',
        parametros:{a:1.3,b:0.8,c:0.25}, explicacao:'log₂(2³)=3', subtema:'logaritmos' },
    ],
    lin: [
      { id:'l1', enunciado:'"A língua é o vestido do pensamento." Essa metáfora sugere que a linguagem:',
        alternativas:{A:'Expressa o pensamento',B:'É separada do pensamento',C:'Limita o pensamento',D:'Precede o pensamento',E:'É desnecessária'}, gabarito:'A',
        parametros:{a:1.1,b:0.2,c:0.25}, explicacao:'A roupa veste o corpo; a língua veste o pensamento.', subtema:'interpretação' },
      { id:'l2', enunciado:'"Embora chovesse, ele saiu." A oração subordinada indica:',
        alternativas:{A:'Concessão',B:'Causa',C:'Condição',D:'Consequência',E:'Finalidade'}, gabarito:'A',
        parametros:{a:0.9,b:0.0,c:0.25}, explicacao:'"Embora" = conjunção concessiva', subtema:'gramática' },
    ],
    hum: [
      { id:'h1', enunciado:'O Imperativo Categórico de Kant afirma: aja segundo a máxima que possa ser:',
        alternativas:{A:'Lei universal',B:'Lei hipotética',C:'Princípio utilitário',D:'Norma relativa',E:'Regra particular'}, gabarito:'A',
        parametros:{a:1.4,b:1.2,c:0.25}, explicacao:'Kant: máxima universalizável = lei moral.', subtema:'filosofia' },
      { id:'h2', enunciado:'O lema da Revolução Francesa (1789) era:',
        alternativas:{A:'Liberdade, Igualdade, Fraternidade',B:'Paz, Terra, Pão',C:'Trabalho, Família, Pátria',D:'Ordem e Progresso',E:'Liberdade ou Morte'}, gabarito:'A',
        parametros:{a:0.7,b:-1.5,c:0.25}, explicacao:'Liberté, Égalité, Fraternité — síntese do iluminismo.', subtema:'história' },
    ],
    nat: [
      { id:'n1', enunciado:'Célula com 46 cromossomos sofre meiose. Cada filha terá:',
        alternativas:{A:'23',B:'46',C:'92',D:'12',E:'24'}, gabarito:'A',
        parametros:{a:1.0,b:-0.3,c:0.25}, explicacao:'Meiose divide o número à metade: 46→23.', subtema:'biologia' },
      { id:'n2', enunciado:'H₂ + Cl₂ → 2HCl é uma reação de:',
        alternativas:{A:'Síntese',B:'Análise',C:'Deslocamento',D:'Dupla troca',E:'Combustão'}, gabarito:'A',
        parametros:{a:0.9,b:-0.8,c:0.25}, explicacao:'Síntese: dois reagentes → um produto.', subtema:'química' },
    ],
  };

  const gerarQuestao = useCallback(async (areaId, thetaAtual) => {
    setLoading(true);
    setResposta(null);
    setCorreto(null);
    setTempo(0);
    // Selecionar questão mais informativa para o theta atual (TRI)
    const pool = QUESTOES_MOCK[areaId] || [];
    const respondidas = historico.map(h => h.id);
    const disponiveis = pool.filter(q => !respondidas.includes(q.id));
    if (!disponiveis.length) { setFase('resultado'); setLoading(false); return; }

    // Encontrar questão com maior informação de Fisher
    let melhor = disponiveis[0], melhorInfo = -Infinity;
    for (const q of disponiveis) {
      const p = triEngine.probability(thetaAtual, q.parametros);
      const info = Math.pow(1.7 * (q.parametros.a||1), 2) * p * (1-p);
      if (info > melhorInfo) { melhorInfo = info; melhor = q; }
    }

    setQuestao(melhor);
    setFase('questao');
    setLoading(false);

    // Iniciar timer
    if (timerRef) clearInterval(timerRef);
    const ref = setInterval(() => setTempo(t => t + 1), 1000);
    setTimerRef(ref);
  }, [historico, timerRef]);

  const handleResposta = useCallback((alt) => {
    if (resposta || !questao) return;
    clearInterval(timerRef);
    setResposta(alt);
    const ok = alt === questao.gabarito;
    setCorreto(ok);

    // Atualizar theta com TRI
    const novoTheta = triEngine.updateTheta(theta, questao.parametros, ok);
    setTheta(novoTheta);

    // Atualizar perfil cognitivo por inferência comportamental
    if (questao.subtema) {
      const sinais = [
        tempo < 8000  ? { dim:'RI', value:+0.5 } : null,
        tempo > 30000 ? { dim:'RI', value:-0.5 } : null,
        ['mat','nat'].includes(questao.area) ? { dim:'VV', value:-0.25 } : null,
        ['lin','hum'].includes(questao.area) ? { dim:'VV', value:+0.25 } : null,
        questao.tipo === 'interpretacao' ? { dim:'AH', value:+0.25 } : null,
        questao.tipo === 'calculo'       ? { dim:'AH', value:-0.25 } : null,
      ].filter(Boolean);
      onUpdateProfile(p => {
        const cog = { ...p.cognitivo };
        const alpha = 0.3;
        for (const { dim, value } of sinais) {
          cog.scores[dim] = alpha * value + (1 - alpha) * (cog.scores[dim] || 0);
          cog.counts[dim] = (cog.counts[dim] || 0) + 1;
        }
        const sub = { ...p.subtemas };
        if (!sub[questao.subtema]) sub[questao.subtema] = { acertos:0, total:0 };
        sub[questao.subtema].total++;
        if (ok) sub[questao.subtema].acertos++;
        return { ...p, cognitivo: cog, subtemas: sub };
      });
    }

    // Atualizar perfil global
    const xpGanho = ok ? (tempo < 10 ? 15 : tempo < 30 ? 20 : 25) : 5;
    onUpdateProfile(p => {
      const nx = (p.xp || 0) + xpGanho;
      const max = (p.level || 1) * 500;
      const novoLevel = nx >= max ? (p.level || 1) + 1 : (p.level || 1);
      if (nx >= max) showToast(`🎉 Nível ${novoLevel}!`);
      return {
        ...p,
        xp: nx >= max ? nx - max : nx,
        level: novoLevel,
        theta: novoTheta,
        thetas: { ...(p.thetas || {}), [area]: novoTheta },
      };
    });

    setHistorico(h => [...h, { ...questao, correto:ok, tempo, thetaAntes:theta, thetaDepois:novoTheta }]);
    setTimeout(() => setFase('feedback'), 300);
  }, [resposta, questao, theta, timerRef, tempo, area, onUpdateProfile, showToast]);

  const proximaQuestao = () => gerarQuestao(area, theta);

  // Tela de seleção de área
  if (fase === 'selecao') return (
    <div style={{ padding:'20px 16px 88px' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:900,
        color:C.text, marginBottom:4 }}>Quiz Adaptativo</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>
        Questões calibradas ao seu nível real usando TRI — o mesmo modelo do ENEM
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {AREAS.map(a => (
          <div key={a.id} onClick={() => { setArea(a.id); gerarQuestao(a.id, theta); }}
            style={{ background:C.card, border:`1px solid ${C.border}`,
              borderRadius:16, padding:'18px 14px', cursor:'pointer', transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
            <div style={{ fontSize:30, marginBottom:10, fontFamily:'initial' }}>{a.emoji}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:900,
              color:C.text, marginBottom:4 }}>{a.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{a.desc}</div>
            <div style={{ marginTop:10 }}>
              <Pill color={C.primary}>
                Nota {triEngine.thetaToEnem(profile.thetas?.[a.id] || 0)}
              </Pill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div style={{ textAlign:'center' }}>
        <Spin size={32} />
        <div style={{ marginTop:12, fontSize:13, color:C.muted }}>Selecionando questão ideal...</div>
      </div>
    </div>
  );

  if (fase === 'resultado') {
    const acertos = historico.filter(h => h.correto).length;
    const total = historico.length;
    const notaFinal = triEngine.thetaToEnem(theta);
    return (
      <div style={{ padding:'20px 16px 88px', textAlign:'center' }}>
        <div style={{ fontSize:60, fontFamily:'initial', marginBottom:16 }}>
          {acertos/total >= 0.7 ? '🏆' : acertos/total >= 0.4 ? '📈' : '💪'}
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:900,
          color:C.text, marginBottom:8 }}>Sequência encerrada!</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:20 }}>
          {acertos}/{total} corretas · Nota estimada: {notaFinal}
        </div>
        <button onClick={() => { setFase('selecao'); setHistorico([]); setArea(null); }}
          style={{ padding:'14px 32px', borderRadius:12, border:'none',
            background:GP, color:'#fff', fontSize:14, fontWeight:800,
            fontFamily:"'Syne',sans-serif", cursor:'pointer' }}>
          Nova sequência
        </button>
      </div>
    );
  }

  if (!questao) return null;

  // Tela da questão
  return (
    <div style={{ padding:'16px 16px 88px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <button onClick={() => setFase('selecao')}
          style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8,
            padding:'6px 12px', fontSize:12, color:C.muted, cursor:'pointer' }}>
          ← Áreas
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <Pill color={C.primary}>{historico.length + 1}ª questão</Pill>
          <Pill color={tempo > 30 ? C.danger : C.muted}>
            <span style={{fontFamily:'initial'}}>⏱</span> {tempo}s
          </Pill>
        </div>
      </div>

      {/* Enunciado */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`,
        borderRadius:18, padding:'20px', marginBottom:16, fontSize:15,
        color:C.text, lineHeight:1.7 }}>
        {questao.enunciado}
      </div>

      {/* Alternativas */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        {Object.entries(questao.alternativas).map(([letra, texto]) => {
          let borderColor = C.border, bg = C.card, textColor = C.text;
          if (fase === 'feedback' || resposta) {
            if (letra === questao.gabarito) { borderColor = C.success; bg = `${C.success}10`; }
            else if (letra === resposta && !correto) { borderColor = C.danger; bg = `${C.danger}10`; }
          }
          if (resposta === letra && !correto && letra !== questao.gabarito) textColor = C.danger;
          if (letra === questao.gabarito && (fase === 'feedback' || resposta)) textColor = C.success;

          return (
            <div key={letra} onClick={() => handleResposta(letra)}
              style={{ display:'flex', gap:12, alignItems:'flex-start',
                padding:'13px 16px', borderRadius:14,
                border:`1.5px solid ${borderColor}`,
                background: bg, cursor: resposta ? 'default' : 'pointer',
                transition:'all .2s' }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:14,
                color: resposta ? (letra === questao.gabarito ? C.success : letra === resposta ? C.danger : C.muted) : C.muted,
                flexShrink:0, marginTop:1 }}>{letra}</span>
              <span style={{ fontSize:14, color:textColor, lineHeight:1.5 }}>{texto}</span>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {fase === 'feedback' && (
        <div style={{ background: correto ? `${C.success}10` : `${C.danger}08`,
          border:`1px solid ${correto ? C.success : C.danger}33`,
          borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700,
            color:correto ? C.success : C.danger, marginBottom:6 }}>
            <span style={{fontFamily:'initial'}}>{correto ? '✅' : '❌'}</span>{' '}
            {correto ? 'Correto! +' + (tempo < 10 ? 15 : tempo < 30 ? 20 : 25) + ' XP' : 'Incorreto — estude esse ponto!'}
          </div>
          <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{questao.explicacao}</div>
          <div style={{ marginTop:10, fontSize:11, color:C.muted }}>
            Nota estimada: {triEngine.thetaToEnem(theta)}
            {' · '}Δ {correto ? '+' : ''}{(theta - (historico[historico.length-2]?.thetaDepois || 0)).toFixed(2)}θ
          </div>
        </div>
      )}

      {fase === 'feedback' && (
        <button onClick={proximaQuestao}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none',
            background:GP, color:'#fff', fontSize:14, fontWeight:800,
            fontFamily:"'Syne',sans-serif", cursor:'pointer' }}>
          Próxima questão →
        </button>
      )}
    </div>
  );
}

// DASHBOARD — Resultados reais
function Dashboard({ profile }) {
  const areas = ['mat','lin','hum','nat'];
  const labels = { mat:'Matemática', lin:'Linguagens', hum:'Humanas', nat:'Natureza' };
  const total = areas.reduce((s, a) => s + triEngine.thetaToEnem(profile.thetas?.[a] || 0), 0) / areas.length;

  return (
    <div style={{ padding:'16px 16px 88px' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:900,
        color:C.text, marginBottom:4 }}>Meu Desempenho</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>
        Estimativa baseada no modelo TRI do ENEM
      </div>

      {/* Nota geral */}
      <div style={{ background:C.card, border:`1px solid ${C.primary}44`,
        borderRadius:20, padding:'20px', marginBottom:16, textAlign:'center' }}>
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, marginBottom:8 }}>NOTA GERAL ESTIMADA</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:56, fontWeight:900,
          color:C.primary, lineHeight:1 }}>{Math.round(total)}</div>
        <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>
          Média das 4 áreas do ENEM
        </div>
      </div>

      {/* Por área */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {areas.map(a => {
          const nota = triEngine.thetaToEnem(profile.thetas?.[a] || 0);
          const nivel = nivelFromTheta(profile.thetas?.[a] || 0);
          const pct = Math.min(100, Math.round(((nota - 300) / 500) * 100));
          return (
            <div key={a} style={{ background:C.card, border:`1px solid ${C.border}`,
              borderRadius:14, padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{labels[a]}</span>
                  <Pill color={nivel.cor} style={{ marginLeft:8 }}>{nivel.label}</Pill>
                </div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18,
                  fontWeight:900, color:nivel.cor }}>{nota}</span>
              </div>
              <div style={{ height:6, background:C.border, borderRadius:3 }}>
                <div style={{ height:'100%', width:`${pct}%`,
                  background:nivel.cor, borderRadius:3, transition:'width .8s' }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// PERFIL — Dados do usuário
function Perfil({ profile, onLogout }) {
  const nivel = nivelFromTheta(profile.theta || 0);
  return (
    <div style={{ padding:'16px 16px 88px' }}>
      {/* Avatar */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:GP,
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 12px', fontSize:32, fontFamily:"'Syne',sans-serif",
          fontWeight:900, color:'#fff' }}>
          {(profile.nome || 'U')[0].toUpperCase()}
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:C.text }}>
          {profile.nome || 'Estudante'}
        </div>
        <div style={{ fontSize:13, color:C.muted }}>{profile.email}</div>
        <div style={{ marginTop:8 }}>
          <Pill color={nivel.cor}>
            <span style={{fontFamily:'initial'}}>{nivel.emoji}</span> {nivel.label} · Nível {profile.level || 1}
          </Pill>
        </div>
      </div>

      <XPBar xp={profile.xp || 0} max={(profile.level || 1) * 500} level={profile.level || 1} />

      <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:10 }}>
        {/* Insights cognitivos */}
      {profile.cognitivo && Object.entries(profile.cognitivo.scores).some(([,v]) => Math.abs(v) > 0.15) && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10 }}>PERFIL DE APRENDIZAGEM</div>
          {[
            ['Visual ↔ Verbal',       'VV', ['Visual','Verbal']],
            ['Analítico ↔ Holístico', 'AH', ['Analítico','Holístico']],
            ['Sequencial ↔ Aleatório','SA', ['Sequencial','Aleatório']],
            ['Reflexivo ↔ Impulsivo', 'RI', ['Reflexivo','Impulsivo']],
          ].map(([label, dim, [poloA, poloB]]) => {
            const score = profile.cognitivo?.scores?.[dim] || 0;
            const pct   = Math.round(((score + 1) / 2) * 100);
            const polo  = score < -0.2 ? poloA : score > 0.2 ? poloB : 'Equilibrado';
            const cor   = Math.abs(score) > 0.5 ? C.primary : C.muted;
            return (
              <div key={dim} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:C.muted }}>{label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:cor }}>{polo}</span>
                </div>
                <div style={{ height:4, background:C.border, borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:cor, borderRadius:2, transition:'width .6s' }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {[
          ['Nota ENEM estimada', triEngine.thetaToEnem(profile.theta || 0)],
          ['Sequência atual',    `${profile.streak || 0} dias 🔥`],
          ['XP total',          profile.xp || 0],
          ['Perfil cognitivo',  profile.tipoPerfil || 'estudante'],
        ].map(([label, val]) => (
          <div key={label} style={{ background:C.card, border:`1px solid ${C.border}`,
            borderRadius:12, padding:'13px 16px',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:C.muted }}>{label}</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14,
              fontWeight:800, color:C.text }}>{val}</span>
          </div>
        ))}
      </div>

      <button onClick={onLogout}
        style={{ width:'100%', padding:'13px', marginTop:24, borderRadius:12,
          border:`1.5px solid ${C.danger}44`, background:`${C.danger}08`,
          color:C.danger, fontSize:14, fontWeight:700, cursor:'pointer' }}>
        Sair da conta
      </button>
    </div>
  );
}

// ESTUDO — Placeholder
function Estudo() {
  return (
    <div style={{ padding:'20px 16px 88px', textAlign:'center' }}>
      <div style={{ fontSize:48, fontFamily:'initial', marginBottom:16 }}>🧠</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:C.text, marginBottom:8 }}>
        IA Socrática & Redação
      </div>
      <div style={{ fontSize:14, color:C.muted, lineHeight:1.7 }}>
        Integração completa disponível no módulo<br/>
        <code style={{ color:C.primary }}>04_NotaA_Estudo.jsx</code>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', top:70, left:'50%', transform:'translateX(-50%)',
      background:C.card, border:`1px solid ${C.primary}44`, borderRadius:12,
      padding:'10px 20px', fontSize:13, color:C.text, fontWeight:600,
      zIndex:9999, whiteSpace:'nowrap',
      boxShadow:`0 4px 20px ${C.primary}22` }}>
      {msg}
    </div>
  );
}

function useToast() {
  const [state, setState] = useState({ msg:'', visible:false });
  const show = useCallback((msg) => {
    setState({ msg, visible:true });
    setTimeout(() => setState(s => ({ ...s, visible:false })), 2500);
  }, []);
  return [state, show];
}

// ─── Rate Limiter simples ─────────────────────────────────────────
function useRateLimiter(limite=20) {
  const [status, setStatus] = useState({ restantes:limite, total:limite });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nota_a_rl') || '{}');
      const hoje = new Date().toDateString();
      if (saved.dia === hoje) {
        setStatus({ restantes: limite - (saved.usado || 0), total:limite });
      }
    } catch {}
  }, []);
  return status;
}

// ─── App Shell Principal ──────────────────────────────────────────
export default function NotaABetaApp({ user: userProp, tipoPerfil: tipoPerfilProp }) {
  const [screen, setScreen]   = useState('home');
  const [quizArea, setQuizArea] = useState(null);
  const [toast, showToast]    = useToast();
  const rl = useRateLimiter();

  // Estado do perfil — persiste no localStorage
  const [profile, setProfile] = useState(() => {
    const saved = loadState('profile_v2', null);
    if (saved) return saved;
    return {
      nome:       userProp?.user_metadata?.full_name || userProp?.email?.split('@')[0] || 'Estudante',
      email:      userProp?.email || '',
      tipoPerfil: tipoPerfilProp || 'estudante',
      perfilNeuro: [],
      autopercep:  [],
      level: 1, xp: 0, streak: 0,
      theta:  0,
      thetas: { mat:0, lin:0, hum:0, nat:0 },
      cognitivo: { scores:{ VV:0, AH:0, SA:0, RI:0 }, counts:{ VV:0, AH:0, SA:0, RI:0 } },
      subtemas: {},
    };
  });

  // Persistir perfil
  useEffect(() => { saveState('profile_v2', profile); }, [profile]);

  const updateProfile = useCallback((fn) => {
    setProfile(prev => {
      const next = typeof fn === 'function' ? fn(prev) : { ...prev, ...fn };
      return next;
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nota_a_session');
    window.location.reload();
  };

  const onNav = useCallback((sc, area=null) => {
    setScreen(sc);
    if (area) setQuizArea(area);
  }, []);

  const screens = {
    home:      <Home profile={profile} onNav={onNav} />,
    quiz:      <QuizTRI profile={profile} onUpdateProfile={updateProfile} showToast={showToast} initialArea={quizArea} />,
    estudo:    <Estudo />,
    dashboard: <Dashboard profile={profile} />,
    perfil:    <Perfil profile={profile} onLogout={handleLogout} />,
  };

  return (
    <>
      <style>{CSS}</style>
      <Toast {...toast} />
      <div style={{ background:C.bg, minHeight:'100vh' }}>
        <TopBar profile={profile} rateLimiter={rl} onMenu={() => onNav('perfil')} />
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          {screens[screen] || screens.home}
        </div>
        <NavBar screen={screen} onNav={onNav} />
      </div>
    </>
  );
}

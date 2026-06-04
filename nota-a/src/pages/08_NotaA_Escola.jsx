import { useState } from "react";

// ============================================================
// NOTA A — PORTAL DA ESCOLA
// Visão institucional: turmas, alunos, desempenho, rankings,
// batalha coletiva, relatórios IDEB/ENEM e gestão da conta
// ============================================================

const C = {
  bg: "#0A0E1A", surface: "#111827", card: "#1A2235", border: "#1E2D45",
  primary: "#00D4FF", secondary: "#7C3AED", accent: "#F59E0B",
  success: "#10B981", danger: "#EF4444", warning: "#F97316",
  text: "#E2E8F0", muted: "#64748B",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
button, input, select { font-family: inherit; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.surface}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.fu { animation: fadeUp 0.3s ease both; }
`;

// ── Dados mock da escola ──────────────────────────────────
const ESCOLA = {
  nome: "Col. Estadual Salvador",
  cidade: "Salvador, BA",
  cnpj: "12.345.678/0001-99",
  plano: "Escola",
  desde: "Janeiro 2025",
  contato: "diretoria@ces.edu.br",
};

const TURMAS = [
  { id:"t1", nome:"3º Ano A", prof:"Prof. Jó",    alunos:32, prog:68, risco:2, melhor:"Linguagens", fragil:"Matemática", streak:14, ativa:true  },
  { id:"t2", nome:"3º Ano B", prof:"Prof. Ana",   alunos:28, prog:61, risco:3, melhor:"Humanas",    fragil:"Redação",    streak:9,  ativa:true  },
  { id:"t3", nome:"3º Ano C", prof:"Prof. Pedro", alunos:30, prog:55, risco:5, melhor:"Natureza",   fragil:"Matemática", streak:6,  ativa:true  },
  { id:"t4", nome:"2º Ano A", prof:"Prof. Laura", alunos:35, prog:44, risco:4, melhor:"Linguagens", fragil:"Natureza",   streak:11, ativa:true  },
  { id:"t5", nome:"2º Ano B", prof:"Prof. Carlos",alunos:33, prog:38, risco:6, melhor:"Matemática", fragil:"Redação",    streak:3,  ativa:false },
];

const AREAS_DATA = {
  lin: { label: "Linguagens e Códigos",          cor: C.primary,   notas: [72, 64, 68, 55, 50] },
  hum: { label: "Ciências Humanas",              cor: C.secondary, notas: [68, 72, 60, 48, 44] },
  nat: { label: "Ciências da Natureza",          cor: C.success,   notas: [45, 55, 72, 40, 38] },
  mat: { label: "Matemática e suas Tecnologias", cor: C.accent,    notas: [38, 46, 42, 52, 65] },
  red: { label: "Redação",                       cor: C.danger,    notas: [61, 45, 58, 40, 36] },
};

const RANKING_NACIONAL = [
  { pos:1, nome:"Col. Estadual Salvador", cidade:"Salvador, BA",   pts:2840, cor:C.accent,   av:"CES", sua:true  },
  { pos:2, nome:"CEFET Rio de Janeiro",   cidade:"Rio de Janeiro", pts:2760, cor:C.secondary,av:"CFT"              },
  { pos:3, nome:"IFBA Salvador",          cidade:"Salvador, BA",   pts:2590, cor:C.success,  av:"IFB"              },
  { pos:4, nome:"Col. Militar SP",        cidade:"São Paulo, SP",  pts:2510, cor:C.warning,  av:"CMS"              },
  { pos:5, nome:"EEFM João Pessoa",       cidade:"João Pessoa, PB",pts:2280, cor:C.danger,   av:"JPS"              },
];

const HISTORICO_BATALHAS = [
  { data:"Hoje",   turmas:"3º A vs 3º B",     area:"Matemática",   resultado:"Vitória",  placar:"5×2", xp:750  },
  { data:"Ontem",  turmas:"3º A vs CEFET",    area:"Linguagens",   resultado:"Vitória",  placar:"4×3", xp:600  },
  { data:"23/Mai", turmas:"3º B vs Col. Mil.", area:"Natureza",     resultado:"Derrota",  placar:"2×5", xp:200  },
  { data:"22/Mai", turmas:"2º A vs IFBA",      area:"Humanas",      resultado:"Vitória",  placar:"6×1", xp:900  },
];

// ── Componentes base ──────────────────────────────────────
function Card({ children, style: s }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, ...s }}>{children}</div>;
}
function Pill({ children, color = C.primary }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, color }}>{children}</span>;
}
function SBtn({ children, onClick, color = C.primary }) {
  return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: `${color}22`, cursor: "pointer", fontSize: 12, fontWeight: 700, color, fontFamily: "inherit", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = `${color}33`} onMouseLeave={e => e.currentTarget.style.background = `${color}22`}>{children}</button>;
}
function MiniBar({ value, color, max = 100 }) {
  return <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: "hidden", flex: 1 }}><div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 99 }} /></div>;
}

// ── Portal Principal ──────────────────────────────────────
export default function PortalEscola() {
  const [tab, setTab] = useState("visao");
  const [turmaSel, setTurmaSel] = useState(null);

  const totalAlunos = TURMAS.reduce((s, t) => s + t.alunos, 0);
  const progMedio   = Math.round(TURMAS.reduce((s, t) => s + t.prog, 0) / TURMAS.length);
  const totalRisco  = TURMAS.reduce((s, t) => s + t.risco, 0);
  const turmaMelhor = [...TURMAS].sort((a, b) => b.prog - a.prog)[0];
  const turmaFraca  = [...TURMAS].sort((a, b) => a.prog - b.prog)[0];

  const TABS = [
    ["visao",    "📊", "Visão Geral"],
    ["turmas",   "🏫", "Turmas"],
    ["areas",    "📐", "Áreas de Conhecimento"],
    ["batalha",  "⚔️", "Batalha Coletiva"],
    ["ranking",  "🏆", "Ranking Nacional"],
    ["relatorio","📄", "Relatórios"],
    ["conta",    "⚙️", "Conta"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 18 }}>
              <span style={{ color: C.primary }}>Nota</span>
              <span style={{ background: `linear-gradient(135deg,${C.accent},#F97316)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> A</span>
            </div>
            <div style={{ height: 20, width: 1, background: C.border }} />
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.muted }}>🏫 Portal da Escola</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Pill color={C.success}>Plano Escola · Ativo</Pill>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${C.success},#059669)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "'Syne',sans-serif" }}>C</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>

        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0, padding: "24px 0", borderRight: `1px solid ${C.border}`, minHeight: "calc(100vh - 58px)", position: "sticky", top: 58, height: "fit-content" }}>
          <div style={{ padding: "0 16px 18px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>{ESCOLA.nome}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{ESCOLA.cidade}</div>
          </div>
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ width: "100%", padding: "11px 20px", border: "none", background: tab === id ? `${C.success}18` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? C.success : C.muted, borderLeft: `3px solid ${tab === id ? C.success : "transparent"}`, transition: "all .2s", fontFamily: "inherit" }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, padding: "24px 28px" }}>

          {/* ── VISÃO GERAL ── */}
          {tab === "visao" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Visão Geral — {ESCOLA.nome}</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Painel institucional completo · Atualizado em tempo real</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                [totalAlunos, "Alunos ativos",    `${TURMAS.filter(t=>t.ativa).length} turmas`, C.primary,   "👥"],
                [`${progMedio}%`, "Progresso médio",  "nas trilhas ENEM",          C.success,   "📈"],
                [totalRisco,  "Alunos em risco",  "requerem atenção",              C.danger,    "⚠️"],
                ["#1",        "Ranking nacional", `${RANKING_NACIONAL[0].pts.toLocaleString()} pontos`,   C.accent,    "🏆"],
              ].map(([v,l,s,c,i]) => (
                <Card key={l} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: c, lineHeight: 1.1, marginBottom: 4 }}>{v}</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s}</div>
                  </div>
                  <div style={{ fontSize: 26 }}>{i}</div>
                </Card>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Card>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>📊 Progresso por Turma</div>
                {TURMAS.map(t => (
                  <div key={t.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>{t.nome} · {t.prof}</span>
                      <span style={{ color: t.prog >= 60 ? C.success : t.prog >= 40 ? C.accent : C.danger, fontWeight: 700 }}>{t.prog}%</span>
                    </div>
                    <MiniBar value={t.prog} color={t.prog >= 60 ? C.success : t.prog >= 40 ? C.accent : C.danger} />
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>🎯 Alertas e Destaques</div>
                {[
                  { cor: C.success, msg: `${turmaMelhor.nome} lidera com ${turmaMelhor.prog}% de progresso` },
                  { cor: C.danger,  msg: `${totalRisco} alunos identificados em risco de evasão` },
                  { cor: C.warning, msg: `Área mais frágil na escola: Matemática (média 46%)` },
                  { cor: C.primary, msg: `Escola em 1º lugar no ranking nacional — 2.840 pts` },
                  { cor: C.accent,  msg: `3 batalhas coletivas disponíveis esta semana` },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 9 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.cor, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{a.msg}</div>
                  </div>
                ))}
              </Card>
            </div>

            <Card>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>📐 Desempenho Médio por Área (todas as turmas)</div>
              {Object.entries(AREAS_DATA).map(([k, area]) => {
                const med = Math.round(area.notas.reduce((s, n) => s + n, 0) / area.notas.length);
                return (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: C.text }}>{area.label}</span>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: C.danger, fontSize: 10 }}>Mín: {Math.min(...area.notas)}%</span>
                        <span style={{ color: C.success, fontSize: 10 }}>Máx: {Math.max(...area.notas)}%</span>
                        <span style={{ color: area.cor, fontWeight: 700 }}>{med}%</span>
                      </div>
                    </div>
                    <MiniBar value={med} color={area.cor} />
                  </div>
                );
              })}
            </Card>
          </div>}

          {/* ── TURMAS ── */}
          {tab === "turmas" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>Turmas Cadastradas</div>
            {turmaSel ? (
              <div>
                <button onClick={() => setTurmaSel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>← Todas as turmas</button>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{turmaSel.nome}</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>{turmaSel.prof} · {turmaSel.alunos} alunos</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[[`${turmaSel.prog}%`,"Progresso",C.success],[`${turmaSel.alunos}`,"Alunos",C.primary],[`${turmaSel.risco}`,"Em risco",C.danger],[turmaSel.melhor,"Melhor área",C.success],[turmaSel.fragil,"Área frágil",C.danger],[`${turmaSel.streak}d`,"Streak médio",C.accent]].map(([v,l,c])=>(
                    <Card key={l} style={{textAlign:"center",padding:"12px 8px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:c,lineHeight:1.2,marginBottom:3}}>{v}</div><div style={{fontSize:10,color:C.muted}}>{l}</div></Card>
                  ))}
                </div>
                <Card>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>📐 Desempenho por Área</div>
                  {Object.entries(AREAS_DATA).map(([k, area]) => {
                    const idx = TURMAS.findIndex(t => t.id === turmaSel.id);
                    const val = area.notas[idx] || 0;
                    const cor = val < 50 ? C.danger : val < 70 ? C.accent : C.success;
                    return (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                          <span style={{ color: C.text }}>{area.label}</span>
                          <span style={{ color: cor, fontWeight: 700 }}>{val}%</span>
                        </div>
                        <MiniBar value={val} color={cor} />
                      </div>
                    );
                  })}
                </Card>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TURMAS.map(t => (
                  <Card key={t.id} style={{ padding: "14px 16px", cursor: "pointer" }}
                    onClick={() => setTurmaSel(t)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: `${C.primary}22`, border: `1px solid ${C.primary}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 900, color: C.primary, flexShrink: 0 }}>
                        {t.nome.split(" ").slice(-1)[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{t.nome}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{t.prof}</div>
                          <Pill color={t.ativa ? C.success : C.muted}>{t.ativa ? "Ativa" : "Inativa"}</Pill>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <MiniBar value={t.prog} color={t.prog >= 60 ? C.success : t.prog >= 40 ? C.accent : C.danger} />
                          <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{t.prog}%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 20, textAlign: "center", marginRight: 12 }}>
                        {[[t.alunos,"Alunos",C.primary],[t.risco,"Em risco",C.danger],[`${t.streak}d`,"Streak",C.accent]].map(([v,l,c])=>(
                          <div key={l}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 10, color: C.muted }}>{l}</div></div>
                        ))}
                      </div>
                      <span style={{ color: C.muted, fontSize: 16 }}>→</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>}

          {/* ── ÁREAS ── */}
          {tab === "areas" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>Áreas de Conhecimento</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(AREAS_DATA).map(([k, area]) => {
                const med = Math.round(area.notas.reduce((s, n) => s + n, 0) / area.notas.length);
                return (
                  <Card key={k} style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: C.text }}>{area.label}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 900, color: area.cor }}>{med}%</div>
                    </div>
                    <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                      <div style={{ height: "100%", width: `${med}%`, background: area.cor, borderRadius: 99, transition: "width .8s" }} />
                    </div>
                    <div style={{ display: "flex", gap: 0 }}>
                      {TURMAS.map((t, i) => {
                        const val = area.notas[i] || 0;
                        const cor = val < 50 ? C.danger : val < 70 ? C.accent : C.success;
                        return (
                          <div key={t.id} style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRight: i < TURMAS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: cor }}>{val}%</div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{t.nome.split(" ").slice(-2).join(" ")}</div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>}

          {/* ── BATALHA COLETIVA ── */}
          {tab === "batalha" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>⚔️ Batalha Coletiva</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["8","Vitórias",C.success],["2","Derrotas",C.danger],["75%","Win rate",C.primary]].map(([v,l,c])=>(
                <Card key={l} style={{textAlign:"center",padding:"16px 12px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,color:c,marginBottom:4}}>{v}</div><div style={{fontSize:12,color:C.muted}}>{l}</div></Card>
              ))}
            </div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>📋 Histórico de Batalhas</div>
              {HISTORICO_BATALHAS.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 20 }}>{h.resultado === "Vitória" ? "🏆" : "💪"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: h.resultado === "Vitória" ? C.success : C.danger }}>{h.resultado}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{h.turmas}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Pill color={C.secondary} style={{ fontSize: 9 }}>{h.area}</Pill>
                      <Pill color={C.accent} style={{ fontSize: 9 }}>+{h.xp} XP</Pill>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 900, color: C.text }}>{h.placar}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{h.data}</div>
                  </div>
                </div>
              ))}
            </Card>
            <div style={{ background: `${C.warning}11`, border: `1px solid ${C.warning}33`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>⚔️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.warning, marginBottom: 3 }}>Agendar Nova Batalha Coletiva</div>
                <div style={{ fontSize: 12, color: C.text }}>Desafie CEFET Rio ou IFBA Salvador para uma batalha entre escolas.</div>
              </div>
              <SBtn color={C.warning} onClick={() => {}}>Agendar →</SBtn>
            </div>
          </div>}

          {/* ── RANKING ── */}
          {tab === "ranking" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 4 }}>🏆 Ranking Nacional de Escolas</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Atualizado após cada batalha coletiva · {RANKING_NACIONAL.length} escolas participantes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {RANKING_NACIONAL.map(escola => (
                <div key={escola.pos} style={{
                  background: escola.sua ? `${C.primary}0A` : C.card,
                  border: `2px solid ${escola.sua ? C.primary : C.border}`,
                  borderRadius: 16, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: escola.sua ? `0 0 20px ${C.primary}18` : "none",
                }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, color: escola.pos === 1 ? C.accent : escola.pos === 2 ? "#C0C0C0" : escola.pos === 3 ? "#CD7F32" : C.muted, width: 30 }}>
                    {escola.pos === 1 ? "🥇" : escola.pos === 2 ? "🥈" : escola.pos === 3 ? "🥉" : `#${escola.pos}`}
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${escola.cor}22`, border: `1px solid ${escola.cor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 800, color: escola.cor, flexShrink: 0 }}>{escola.av}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{escola.nome}</div>
                      {escola.sua && <Pill color={C.primary} style={{ fontSize: 9 }}>NOSSA ESCOLA</Pill>}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{escola.cidade}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, color: escola.cor }}>{escola.pts.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>pontos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* ── RELATÓRIOS ── */}
          {tab === "relatorio" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>📄 Relatórios</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { icon:"📊", title:"Relatório Geral da Escola",    desc:"Visão completa de todas as turmas, áreas e progressos. Exportável em PDF.",     color:C.primary   },
                { icon:"🎯", title:"Relatório IDEB / ENEM",        desc:"Projeção de desempenho no ENEM com base no histórico de simulados da escola.",   color:C.success   },
                { icon:"⚠️", title:"Alunos em Risco",              desc:"Lista completa com indicadores de risco, histórico de acesso e recomendações.",  color:C.danger    },
                { icon:"📐", title:"Desempenho por Área",          desc:"Análise detalhada de cada área do ENEM por turma, com mínimo, máximo e média.",  color:C.secondary },
                { icon:"🏆", title:"Relatório de Batalhas",        desc:"Histórico de todas as batalhas coletivas com placar, XP e impacto no ranking.",  color:C.accent    },
                { icon:"👨‍👩‍👧", title:"Relatório para Responsáveis", desc:"Resumo semanal de cada aluno para envio automático às famílias.",               color:C.warning   },
              ].map(r => (
                <Card key={r.title} style={{ padding: "18px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: `${r.color}22`, border: `1px solid ${r.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{r.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{r.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <SBtn color={r.color} onClick={() => {}}>📥 Exportar PDF</SBtn>
                    <SBtn color={C.muted} onClick={() => {}}>Visualizar</SBtn>
                  </div>
                </Card>
              ))}
            </div>
          </div>}

          {/* ── CONTA ── */}
          {tab === "conta" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>⚙️ Conta da Escola</div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>🏫 Dados Institucionais</div>
              {[["Nome",ESCOLA.nome],["Cidade",ESCOLA.cidade],["CNPJ",ESCOLA.cnpj],["Plano","Escola · Ativo"],["Desde",ESCOLA.desde],["Contato",ESCOLA.contato]].map(([k,v])=>(
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>💳 Assinatura</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, color: C.success }}>Plano Escola</div>
                  <div style={{ fontSize: 13, color: C.muted }}>R$ 2.400/mês · Próxima cobrança: 01/Jun/2025</div>
                </div>
                <Pill color={C.success}>✓ Ativo</Pill>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <SBtn color={C.primary} onClick={() => {}}>📥 Baixar Fatura</SBtn>
                <SBtn color={C.muted} onClick={() => {}}>Histórico de Pagamentos</SBtn>
                <SBtn color={C.danger} onClick={() => {}}>Cancelar plano</SBtn>
              </div>
            </Card>
            <Card>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>👥 Gestão de Acessos</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.muted }}>Professores com acesso ao portal: <strong style={{ color: C.text }}>18 ativos</strong></div>
                <SBtn color={C.primary} onClick={() => {}}>+ Convidar professor</SBtn>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                Cada professor convidado recebe acesso ao dashboard da sua turma e ao relatório dos seus alunos.
              </div>
            </Card>
          </div>}

        </div>
      </div>
    </div>
  );
}

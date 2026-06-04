import { useState } from "react";

// ============================================================
// NOTA A — PAINEL DO ADMINISTRADOR
// Gestão completa: usuários, planos, métricas, escolas, logs
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
button, input, select, textarea { font-family: inherit; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.surface}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
.fu { animation: fadeUp 0.3s ease both; }
`;

// ── Dados mock ────────────────────────────────────────────
const USERS = [
  { id:1, nome:"Ana Beatriz",     email:"ana@email.com",    tipo:"estudante", plano:"plus",   status:"ativo",    escola:"Col. Est. Salvador", join:"02/Jan/2025",  xp:5200,  streak:21 },
  { id:2, nome:"Prof. Jó",        email:"jo@escola.com",    tipo:"professor", plano:"escola", status:"ativo",    escola:"Col. Est. Salvador", join:"15/Jan/2025",  xp:0,     streak:0  },
  { id:3, nome:"Lara Oliveira",   email:"lara@email.com",   tipo:"estudante", plano:"plus",   status:"ativo",    escola:"Col. Est. Salvador", join:"20/Jan/2025",  xp:3420,  streak:12 },
  { id:4, nome:"Carlos Mendes",   email:"carlos@email.com", tipo:"estudante", plano:"free",   status:"inativo",  escola:"Col. Est. Salvador", join:"05/Fev/2025",  xp:620,   streak:0  },
  { id:5, nome:"Sofia Lima",      email:"sofia@email.com",  tipo:"estudante", plano:"plus",   status:"ativo",    escola:"Col. Est. Salvador", join:"10/Fev/2025",  xp:2910,  streak:7  },
  { id:6, nome:"Rafael Nunes",    email:"rafael@email.com", tipo:"estudante", plano:"free",   status:"ativo",    escola:"CEFET Rio",          join:"15/Fev/2025",  xp:3900,  streak:14 },
  { id:7, nome:"Diretora Maria",  email:"maria@cefet.com",  tipo:"escola",    plano:"escola", status:"ativo",    escola:"CEFET Rio",          join:"01/Jan/2025",  xp:0,     streak:0  },
  { id:8, nome:"Mateus Santos",   email:"mateus@email.com", tipo:"estudante", plano:"free",   status:"ativo",    escola:"IFBA Salvador",      join:"22/Fev/2025",  xp:1840,  streak:3  },
];

const ESCOLAS_LIST = [
  { id:"e1", nome:"Col. Estadual Salvador", cidade:"Salvador, BA", alunos:420, professores:18, plano:"escola", receita:2400, status:"ativo",   desde:"Jan/2025", turmas:14 },
  { id:"e2", nome:"CEFET Rio de Janeiro",   cidade:"Rio de Janeiro", alunos:380, professores:22, plano:"escola", receita:2400, status:"ativo",   desde:"Jan/2025", turmas:12 },
  { id:"e3", nome:"IFBA Salvador",          cidade:"Salvador, BA", alunos:360, professores:16, plano:"escola", receita:2400, status:"ativo",   desde:"Fev/2025", turmas:11 },
  { id:"e4", nome:"Col. Militar SP",        cidade:"São Paulo, SP", alunos:500, professores:28, plano:"escola", receita:2400, status:"ativo",   desde:"Mar/2025", turmas:18 },
  { id:"e5", nome:"EEFM João Pessoa",       cidade:"João Pessoa, PB", alunos:290, professores:14, plano:"escola", receita:2400, status:"trial",   desde:"Abr/2025", turmas:9  },
  { id:"e6", nome:"E.E. São Paulo",         cidade:"São Paulo, SP", alunos:0,   professores:0,  plano:"escola", receita:0,    status:"prospect",desde:"—",         turmas:0  },
];

const LOGS = [
  { id:1, tipo:"pagamento", msg:"Pagamento confirmado — Ana Beatriz — Plano Plus R$39",      time:"14:32 — 17/Mai", cor:C.success },
  { id:2, tipo:"cadastro",  msg:"Novo cadastro — Mateus Santos — Plano Free",                time:"13:55 — 17/Mai", cor:C.primary },
  { id:3, tipo:"escola",    msg:"Nova escola contratante — IFBA Salvador",                   time:"11:20 — 17/Mai", cor:C.secondary },
  { id:4, tipo:"sistema",   msg:"Backup automático concluído — 98.7% dados íntegros",        time:"04:00 — 17/Mai", cor:C.muted },
  { id:5, tipo:"alerta",    msg:"3 usuários inativos há +15 dias — reengajamento recomendado",time:"09:00 — 17/Mai", cor:C.warning },
  { id:6, tipo:"pagamento", msg:"Pagamento confirmado — Col. Est. Salvador — Plano Escola",  time:"08:15 — 17/Mai", cor:C.success },
  { id:7, tipo:"erro",      msg:"Falha na geração de certificado — ID: cert_4921 — reprocessado", time:"07:42 — 17/Mai", cor:C.danger },
  { id:8, tipo:"api",       msg:"API Educacional — 1.247 requisições hoje — dentro do limite", time:"00:00 — 17/Mai", cor:C.accent },
];

// ── Componentes base ──────────────────────────────────────
function Card({ children, style: s }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, ...s }}>{children}</div>;
}
function Pill({ children, color = C.primary }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, color }}>{children}</span>;
}
function SBtn({ children, onClick, color = C.primary, size = "sm" }) {
  return <button onClick={onClick} style={{ padding: size === "sm" ? "6px 12px" : "10px 18px", borderRadius: 8, border: "none", background: `${color}22`, cursor: "pointer", fontSize: 12, fontWeight: 700, color, fontFamily: "inherit", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = `${color}33`; }} onMouseLeave={e => { e.currentTarget.style.background = `${color}22`; }}>{children}</button>;
}
function PBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.primary},${C.secondary})`, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: `0 4px 16px ${C.primary}33`, transition: "transform .15s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{children}</button>;
}
function StatCard({ icon, label, value, sub, color }) {
  return <Card style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
    <div style={{ fontSize: 26 }}>{icon}</div>
  </Card>;
}

function MiniBar({ value, color, max = 100 }) {
  return <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: "hidden", flex: 1 }}><div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 99, transition: "width .8s" }} /></div>;
}

// ── Painel Principal ──────────────────────────────────────
export default function AdminPanel() {
  const [tab, setTab] = useState("visao");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPlan, setFiltroPlan] = useState("todos");
  const [modalUser, setModalUser] = useState(null);
  const [modalEscola, setModalEscola] = useState(null);

  const totalUsers = USERS.length;
  const ativos = USERS.filter(u => u.status === "ativo").length;
  const pagantes = USERS.filter(u => u.plano !== "free").length;
  const mrr = ESCOLAS_LIST.filter(e => e.status === "ativo").length * 2400 + USERS.filter(u => u.plano === "plus").length * 39;

  const usuariosFiltrados = USERS.filter(u => {
    const matchBusca = !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase());
    const matchTipo  = filtroTipo === "todos" || u.tipo === filtroTipo;
    const matchPlan  = filtroPlan === "todos" || u.plano === filtroPlan;
    return matchBusca && matchTipo && matchPlan;
  });

  const TABS = [["visao","📊","Visão Geral"],["usuarios","👥","Usuários"],["escolas","🏫","Escolas"],["planos","💳","Planos"],["api","⚡","API & Uso"],["logs","📋","Logs"],["config","⚙️","Configurações"]];

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
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.muted }}>⚙️ Painel do Administrador</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, animation: "pulse 2s infinite" }} />
            <div style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>Sistema operacional</div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},#F97316)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000", fontFamily: "'Syne',sans-serif" }}>A</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>

        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0, padding: "24px 0", borderRight: `1px solid ${C.border}`, minHeight: "calc(100vh - 58px)", position: "sticky", top: 58, height: "fit-content" }}>
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ width: "100%", padding: "11px 20px", border: "none", background: tab === id ? `${C.primary}18` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? C.primary : C.muted, borderLeft: `3px solid ${tab === id ? C.primary : "transparent"}`, transition: "all .2s", fontFamily: "inherit" }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>

          {/* ── VISÃO GERAL ── */}
          {tab === "visao" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Visão Geral da Plataforma</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Última atualização: hoje, {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
              <StatCard icon="👥" label="Usuários cadastrados" value={totalUsers} sub={`${ativos} ativos`} color={C.primary} />
              <StatCard icon="💳" label="Usuários pagantes"    value={pagantes}   sub={`${Math.round(pagantes/totalUsers*100)}% conversão`} color={C.success} />
              <StatCard icon="🏫" label="Escolas ativas"       value={ESCOLAS_LIST.filter(e=>e.status==="ativo").length} sub={`${ESCOLAS_LIST.reduce((s,e)=>s+e.alunos,0).toLocaleString()} alunos`} color={C.secondary} />
              <StatCard icon="💰" label="MRR estimado"         value={`R$ ${(mrr).toLocaleString("pt-BR")}`} sub="receita mensal recorrente" color={C.accent} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {/* Distribuição de planos */}
              <Card>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>📊 Distribuição de Planos</div>
                {[
                  ["Free",   USERS.filter(u=>u.plano==="free").length,   C.muted],
                  ["Plus",   USERS.filter(u=>u.plano==="plus").length,   C.primary],
                  ["Escola", USERS.filter(u=>u.plano==="escola").length, C.success],
                ].map(([plan, count, color]) => (
                  <div key={plan} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: C.text, width: 46 }}>{plan}</div>
                    <MiniBar value={count} color={color} max={totalUsers} />
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color, width: 28, textAlign: "right" }}>{count}</div>
                  </div>
                ))}
              </Card>

              {/* Status de usuários */}
              <Card>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>⚡ Status dos Usuários</div>
                {[
                  ["Ativos",    USERS.filter(u=>u.status==="ativo").length,   C.success],
                  ["Inativos",  USERS.filter(u=>u.status==="inativo").length, C.danger],
                  ["Estudantes",USERS.filter(u=>u.tipo==="estudante").length, C.primary],
                  ["Professores",USERS.filter(u=>u.tipo==="professor").length,C.secondary],
                  ["Escola",    USERS.filter(u=>u.tipo==="escola").length,    C.success],
                ].map(([label, count, color]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: C.text, width: 88 }}>{label}</div>
                    <MiniBar value={count} color={color} max={totalUsers} />
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color, width: 28, textAlign: "right" }}>{count}</div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Logs recentes */}
            <Card>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>📋 Atividade Recente</div>
              {LOGS.slice(0,5).map(log => (
                <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.cor, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, fontSize: 12, color: C.text, lineHeight: 1.4 }}>{log.msg}</div>
                  <div style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{log.time}</div>
                </div>
              ))}
              <div style={{ marginTop: 10 }}><SBtn onClick={() => setTab("logs")}>Ver todos os logs →</SBtn></div>
            </Card>
          </div>}

          {/* ── USUÁRIOS ── */}
          {tab === "usuarios" && <div className="fu">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 2 }}>Gestão de Usuários</div>
                <div style={{ fontSize: 13, color: C.muted }}>{usuariosFiltrados.length} usuários encontrados</div>
              </div>
              <PBtn onClick={() => {}}>+ Novo Usuário</PBtn>
            </div>
            {/* Filtros */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar por nome ou e-mail..." style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13, outline: "none" }} onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border} />
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ padding: "9px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 12, outline: "none", cursor: "pointer" }}>
                <option value="todos">Todos os tipos</option>
                <option value="estudante">Estudante</option>
                <option value="professor">Professor</option>
                <option value="escola">Escola</option>
              </select>
              <select value={filtroPlan} onChange={e => setFiltroPlan(e.target.value)} style={{ padding: "9px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 12, outline: "none", cursor: "pointer" }}>
                <option value="todos">Todos os planos</option>
                <option value="free">Free</option>
                <option value="plus">Plus</option>
                <option value="escola">Escola</option>
              </select>
            </div>
            {/* Tabela */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", background: C.surface, padding: "10px 14px" }}>
                {["USUÁRIO","TIPO","PLANO","STATUS","ESCOLA","AÇÕES"].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 800, color: C.muted, fontFamily: "'Syne',sans-serif" }}>{h}</div>)}
              </div>
              {usuariosFiltrados.map((u, ri) => (
                <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 14px", background: ri % 2 === 0 ? C.card : `${C.surface}88`, alignItems: "center", borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.text }}>{u.nome}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                  </div>
                  <div><Pill color={u.tipo==="professor"?C.secondary:u.tipo==="escola"?C.success:C.primary}>{u.tipo}</Pill></div>
                  <div><Pill color={u.plano==="plus"?C.primary:u.plano==="escola"?C.success:C.muted}>{u.plano}</Pill></div>
                  <div><Pill color={u.status==="ativo"?C.success:C.danger}>{u.status}</Pill></div>
                  <div style={{ fontSize: 12, color: C.muted }}>{u.escola || "—"}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <SBtn onClick={() => setModalUser(u)}>Ver</SBtn>
                    <SBtn color={C.danger} onClick={() => {}}>✕</SBtn>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* ── ESCOLAS ── */}
          {tab === "escolas" && <div className="fu">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 2 }}>Gestão de Escolas</div>
                <div style={{ fontSize: 13, color: C.muted }}>{ESCOLAS_LIST.length} instituições cadastradas</div>
              </div>
              <PBtn onClick={() => {}}>+ Nova Escola</PBtn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ESCOLAS_LIST.map(escola => (
                <Card key={escola.id} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: `${C.success}22`, border: `1px solid ${C.success}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏫</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{escola.nome}</div>
                        <Pill color={escola.status==="ativo"?C.success:escola.status==="trial"?C.accent:C.muted}>{escola.status}</Pill>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>{escola.cidade} · Desde {escola.desde}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, textAlign: "center", marginRight: 16 }}>
                      {[[escola.alunos,"Alunos",C.primary],[escola.professores,"Profs.",C.secondary],[escola.turmas,"Turmas",C.success],[`R$ ${escola.receita.toLocaleString("pt-BR")}`,"/mês",C.accent]].map(([v,l,c])=>(
                        <div key={l}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 10, color: C.muted }}>{l}</div></div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                      <SBtn onClick={() => setModalEscola(escola)}>Ver detalhes</SBtn>
                      <SBtn color={C.secondary} onClick={() => {}}>Portal</SBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>}

          {/* ── PLANOS ── */}
          {tab === "planos" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>Gestão de Planos e Receita</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                {nome:"Free",     qtd:USERS.filter(u=>u.plano==="free").length,   receita:0,    color:C.muted,  conv:"—"},
                {nome:"Plus",     qtd:USERS.filter(u=>u.plano==="plus").length,   receita:USERS.filter(u=>u.plano==="plus").length*39,   color:C.primary, conv:"R$ 39/mês"},
                {nome:"Escola",   qtd:ESCOLAS_LIST.filter(e=>e.status==="ativo").length, receita:ESCOLAS_LIST.filter(e=>e.status==="ativo").length*2400, color:C.success, conv:"R$ 2.400/mês"},
              ].map(p => (
                <Card key={p.nome} style={{ textAlign: "center", padding: "20px 16px" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, color: p.color, marginBottom: 6 }}>{p.nome}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 900, color: C.text, lineHeight: 1.1, marginBottom: 4 }}>{p.qtd}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>usuários ativos</div>
                  <div style={{ height: 1, background: C.border, marginBottom: 10 }} />
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: p.receita > 0 ? C.success : C.muted }}>R$ {p.receita.toLocaleString("pt-BR")}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>receita mensal</div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>💰 Histórico de Pagamentos Recentes</div>
              {[
                {usuario:"Ana Beatriz",   plano:"Plus",   valor:39,    data:"17/Mai",  status:"aprovado"},
                {usuario:"Sofia Lima",    plano:"Plus",   valor:39,    data:"17/Mai",  status:"aprovado"},
                {usuario:"Col. Est. Salvador", plano:"Escola", valor:2400, data:"01/Mai", status:"aprovado"},
                {usuario:"CEFET Rio",     plano:"Escola", valor:2400,  data:"01/Mai",  status:"aprovado"},
                {usuario:"IFBA Salvador", plano:"Escola", valor:2400,  data:"01/Mai",  status:"aprovado"},
                {usuario:"Pedro Rocha",   plano:"Plus",   valor:39,    data:"15/Abr",  status:"cancelado"},
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.text }}>{p.usuario}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Plano {p.plano} · {p.data}</div>
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: p.status==="aprovado"?C.success:C.danger }}>R$ {p.valor.toLocaleString("pt-BR")}</div>
                  <Pill color={p.status==="aprovado"?C.success:C.danger}>{p.status}</Pill>
                </div>
              ))}
            </Card>
          </div>}

          {/* ── API & USO ── */}
          {tab === "api" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>API Educacional & Uso</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {[["1.247","Req. hoje",C.primary],["847K","Req. no mês",C.secondary],["99.8%","Uptime",C.success],["142ms","Latência média",C.accent]].map(([v,l,c])=>(
                <Card key={l} style={{textAlign:"center",padding:"16px 12px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,color:c,marginBottom:4}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{l}</div></Card>
              ))}
            </div>
            <Card>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>🔑 Chaves de API Ativas</div>
              {[
                {escola:"Col. Est. Salvador",key:"na_live_sk_ces_••••••••••••••••",plano:"Escola",req:342,limite:50000},
                {escola:"CEFET Rio",         key:"na_live_sk_cft_••••••••••••••••",plano:"Escola",req:218,limite:50000},
                {escola:"IFBA Salvador",     key:"na_live_sk_ifb_••••••••••••••••",plano:"Escola",req:156,limite:50000},
                {escola:"Integração Teste",  key:"na_test_sk_tst_••••••••••••••••",plano:"Starter",req:531,limite:1000},
              ].map((k, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{k.escola}</div>
                    <Pill color={k.plano==="Escola"?C.success:C.muted}>{k.plano}</Pill>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: C.primary, marginBottom: 6 }}>{k.key}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: C.muted }}>Req. hoje: {k.req}/{k.limite}</div>
                    <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${(k.req/k.limite)*100}%`, background: (k.req/k.limite) > .8 ? C.danger : C.success, borderRadius: 99 }} /></div>
                  </div>
                </div>
              ))}
            </Card>
          </div>}

          {/* ── LOGS ── */}
          {tab === "logs" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>Logs e Auditoria</div>
            <Card>
              {LOGS.map(log => (
                <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.cor, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{log.msg}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{log.tipo.toUpperCase()}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{log.time}</div>
                </div>
              ))}
            </Card>
          </div>}

          {/* ── CONFIGURAÇÕES ── */}
          {tab === "config" && <div className="fu">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 18 }}>Configurações Globais</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {titulo:"Manutenção programada", desc:"Agendar janela de manutenção", icon:"🛠️"},
                {titulo:"Notificações globais",  desc:"Enviar aviso a todos os usuários", icon:"📢"},
                {titulo:"Limite de API",         desc:"Ajustar rate limit por plano", icon:"⚡"},
                {titulo:"Configurações de IA",   desc:"Tokens, modelos e fallbacks", icon:"🤖"},
                {titulo:"Integrações externas",  desc:"Stripe, Pagar.me, SendGrid, WhatsApp", icon:"🔗"},
                {titulo:"Backup e exportação",   desc:"Exportar dados em CSV/JSON", icon:"💾"},
                {titulo:"Política de LGPD",      desc:"Gerenciar solicitações de dados", icon:"🛡️"},
              ].map(item => (
                <Card key={item.titulo} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 22 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: C.text }}>{item.titulo}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{item.desc}</div>
                    </div>
                  </div>
                  <SBtn onClick={() => {}} color={C.primary}>Configurar →</SBtn>
                </Card>
              ))}
            </div>
          </div>}

        </div>
      </div>

      {/* Modal usuário */}
      {modalUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setModalUser(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 20, padding: 24, maxWidth: 380, width: "100%", border: `1px solid ${C.border}` }} className="fu">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 900 }}>Detalhes do Usuário</div>
              <button onClick={() => setModalUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${C.primary},${C.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{modalUser.nome[0]}</div>
              <div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: C.text }}>{modalUser.nome}</div><div style={{ fontSize: 12, color: C.muted }}>{modalUser.email}</div></div>
            </div>
            {[["Tipo",modalUser.tipo],["Plano",modalUser.plano],["Status",modalUser.status],["Escola",modalUser.escola||"—"],["Desde",modalUser.join],["XP Total",modalUser.xp.toLocaleString()],["Streak",`${modalUser.streak} dias`]].map(([k,v])=>(
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <SBtn onClick={() => setModalUser(null)}>Fechar</SBtn>
              <SBtn color={C.danger} onClick={() => {}}>Suspender usuário</SBtn>
            </div>
          </div>
        </div>
      )}

      {/* Modal escola */}
      {modalEscola && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setModalEscola(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 20, padding: 24, maxWidth: 400, width: "100%", border: `1px solid ${C.border}` }} className="fu">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 900 }}>Detalhes da Escola</div>
              <button onClick={() => setModalEscola(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18 }}>✕</button>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: C.success, marginBottom: 4 }}>{modalEscola.nome}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{modalEscola.cidade}</div>
            {[["Alunos",modalEscola.alunos],["Professores",modalEscola.professores],["Turmas",modalEscola.turmas],["Plano","Escola"],["Status",modalEscola.status],["Receita",`R$ ${modalEscola.receita.toLocaleString("pt-BR")}/mês`],["Desde",modalEscola.desde]].map(([k,v])=>(
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <SBtn onClick={() => setModalEscola(null)}>Fechar</SBtn>
              <SBtn color={C.secondary} onClick={() => {}}>Abrir Portal da Escola →</SBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import NavBar from "../components/NavBar.jsx";

// ============================================================
// NOTA A — ONBOARDING COGNITIVO
// 7 passos: Boas-vindas · Objetivo · Estilo · Dificuldades
//           Rotina · Neurodivergência · Perfil Gerado
// Correções: navegação funcional, pulo da etapa neuro,
//            botão Começar com onClick, Voltar em todos os passos
// ============================================================

const C = {
  bg: "#0A0E1A", surface: "#111827", card: "#1A2235", border: "#1E2D45",
  primary: "#00D4FF", secondary: "#7C3AED", accent: "#F59E0B",
  success: "#10B981", danger: "#EF4444", text: "#E2E8F0", muted: "#64748B",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
button, input { font-family: inherit; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
.fu { animation: fadeUp 0.35s ease both; }
.pop { animation: pop 0.45s cubic-bezier(.4,2,.6,1) both; }
`;

// ── Botão primário ────────────────────────────────────────
function PBtn({ children, onClick, disabled, full, size = "md" }) {
  const pad = size === "lg" ? "15px 28px" : "11px 20px";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: pad, borderRadius: 13, border: "none",
      background: disabled ? C.card : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: size === "lg" ? 15 : 13, fontWeight: 700,
      color: disabled ? C.muted : "#fff", fontFamily: "'Syne', sans-serif",
      opacity: disabled ? .5 : 1, width: full ? "100%" : "auto",
      boxShadow: disabled ? "none" : `0 4px 20px ${C.primary}33`,
      transition: "transform .15s",
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >{children}</button>
  );
}

// ── Botão secundário ──────────────────────────────────────
function SBtn({ children, onClick, full }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "11px 20px", borderRadius: 13,
      border: `1px solid ${C.border}`, background: "transparent",
      cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.muted,
      width: full ? "100%" : "auto", transition: "all .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
    >{children}</button>
  );
}

// ── Card de opção ─────────────────────────────────────────
function OCard({ icon, label, desc, selected, onClick, color, row }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? `${color}14` : C.card,
      border: `2px solid ${selected ? color : C.border}`,
      borderRadius: 14, padding: row ? "13px 16px" : "15px 12px",
      cursor: "pointer", transition: "all .18s", width: "100%",
      textAlign: row ? "left" : "center",
      display: "flex", flexDirection: row ? "row" : "column",
      alignItems: "center", gap: row ? 12 : 8,
    }}>
      <span style={{ fontSize: row ? 22 : 26, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: row ? 1 : "unset" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>}
      </div>
      {row && selected && <span style={{ color, fontSize: 16, flexShrink: 0 }}>✓</span>}
    </button>
  );
}

function Pill({ children, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700, color }}>{children}</span>
  );
}

function PRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>{label}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{value || "—"}</div>
      </div>
    </div>
  );
}

// ── Perfis cognitivos ─────────────────────────────────────
const PERFIS = {
  visual:   { tipo: "👁️ Aprendiz Visual",   desc: "Você absorve melhor com mapas mentais, infográficos e esquemas. Sua trilha priorizará recursos gráficos e diagramas.", cor: C.primary },
  auditivo: { tipo: "🎧 Aprendiz Auditivo",  desc: "Você aprende ouvindo. Videoaulas e podcasts serão seus aliados. A IA vai sugerir conteúdos em formato de áudio e vídeo.", cor: C.secondary },
  leitura:  { tipo: "📖 Aprendiz Analítico", desc: "Você processa melhor lendo e escrevendo. Resumos, textos e anotações são o centro da sua aprendizagem.", cor: C.success },
  pratico:  { tipo: "✏️ Aprendiz Prático",   desc: "Você aprende fazendo. Exercícios, questões comentadas e simulados são a base da sua trilha personalizada.", cor: C.accent },
};

const NEURO_LBL = { tdah: "TDAH", dislexia: "Dislexia", autismo: "Autismo (TEA)", ansiedade: "Ansiedade" };

// ── Componente principal ──────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [data, setData] = useState({ nome: "", objetivo: "", estilo: "", dificuldades: [], rotina: "", neuro: [] , autopercep: [] });

  const STEPS = 8; // índices 0–6
  const next = () => setStep(s => Math.min(s + 1, STEPS - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const setF = (f, v) => setData(d => ({ ...d, [f]: v }));
  const toggleF = (f, v) => setData(d => ({
    ...d, [f]: d[f].includes(v) ? d[f].filter(x => x !== v) : [...d[f], v],
  }));

  const pct = (step / (STEPS - 1)) * 100;
  const perfil = PERFIS[data.estilo] || null;
  const objLbl = { enem: "Passar no ENEM", federal: "Universidade Federal", bolsa: "Bolsa ProUni / FIES", concurso: "Concurso / Militar" };
  const estLbl = { visual: "Visual — mapas e esquemas", auditivo: "Auditivo — vídeos e podcasts", leitura: "Analítico — textos e resumos", pratico: "Prático — exercícios e simulados" };
  const rotLbl = { "15": "15 min/dia", "30": "30 min/dia", "60": "1 hora/dia", "120": "2+ horas/dia" };

  // ── Tela final ────────────────────────────────────────
  // ── Tela do App após conclusão do onboarding ─────────────
  if (concluido) {
    const AREAS_APP = [
      { id:"lin", label:"Linguagens e Códigos",            icon:"📚", color:C.primary },
      { id:"hum", label:"Ciências Humanas",                icon:"🌍", color:C.secondary },
      { id:"nat", label:"Ciências da Natureza",            icon:"⚗️", color:C.success },
      { id:"mat", label:"Matemática e suas Tecnologias",   icon:"📐", color:C.accent },
      { id:"red", label:"Redação",                         icon:"✍️", color:C.danger },
    ];
    const OBJ_LBL = { enem:"ENEM", federal:"Univ. Federal", bolsa:"ProUni/FIES", concurso:"Concurso" };
    const EST_LBL = { visual:"Visual", auditivo:"Auditivo", leitura:"Analítico", pratico:"Prático" };
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight:"100vh", background:C.bg }}>

          {/* TopBar */}
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px", position:"sticky", top:0, zIndex:100 }}>
            <div style={{ maxWidth:480, margin:"0 auto", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:18 }}>
                <span style={{ color:C.primary }}>Nota</span>
                <span style={{ background:`linear-gradient(135deg,${C.accent},#F97316)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}> A</span>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:12, color:C.accent, fontWeight:700 }}>🔥 0</span>
                <span style={{ fontSize:11, color:C.primary, fontWeight:700, background:`${C.primary}18`, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.primary}33` }}>⚡ 0 XP</span>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div style={{ maxWidth:480, margin:"0 auto", padding:"22px 20px 100px" }}>

            {/* Saudação */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:13, color:C.muted, marginBottom:2 }}>Bem-vindo(a) ao Nota A 🎉</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:900, color:C.text, letterSpacing:-0.5 }}>Olá, {data.nome}!</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:"#fff" }}>
                {(data.nome[0] || "E").toUpperCase()}
              </div>
            </div>

            {/* Card perfil + XP */}
            <div style={{ background:`linear-gradient(135deg,${C.primary}18,${C.secondary}18)`, border:`1px solid ${C.primary}33`, borderRadius:18, padding:"16px 18px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:C.primary, background:`${C.primary}22`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Nível 1</span>
                  <span style={{ fontSize:11, color:C.accent, background:`${C.accent}22`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{OBJ_LBL[data.objetivo] || "ENEM"}</span>
                  <span style={{ fontSize:11, color:C.success, background:`${C.success}22`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{EST_LBL[data.estilo] || "Padrão"}</span>
                </div>
                <span style={{ fontSize:12, color:C.primary, fontWeight:700 }}>0 XP</span>
              </div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:5, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700 }}>Nível 1</span>
                <span>0 / 500 XP</span>
              </div>
              <div style={{ height:6, background:`${C.primary}22`, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:"0%", background:`linear-gradient(90deg,${C.primary},${C.secondary})`, borderRadius:99 }} />
              </div>
              {data.dificuldades.length > 0 && (
                <div style={{ marginTop:10, fontSize:11, color:C.muted }}>
                  📌 Foco em: {data.dificuldades.slice(0,3).map(d => ({mat:"Matemática",port:"Linguagens",hist:"História",geo:"Geografia",bio:"Biologia",qui:"Química",fis:"Física",red:"Redação"})[d]).filter(Boolean).join(", ")}{data.dificuldades.length > 3 ? ` +${data.dificuldades.length-3}` : ""}
                </div>
              )}
            </div>

            {/* Sequência semanal */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:10, letterSpacing:.5 }}>SEQUÊNCIA SEMANAL</div>
              <div style={{ display:"flex", gap:5 }}>
                {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i) => (
                  <div key={d} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ height:30, borderRadius:8, marginBottom:3, background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }} />
                    <div style={{ fontSize:9, color:C.muted }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:8, textAlign:"center" }}>Comece hoje e construa sua sequência! 🔥</div>
            </div>

            {/* Áreas do ENEM */}
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:10, letterSpacing:.5 }}>ESCOLHA UMA ÁREA PARA COMEÇAR</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
              {AREAS_APP.map(area => (
                <div key={area.id}
                  style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = area.color; e.currentTarget.style.background = `${area.color}0A`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:`${area.color}22`, border:`1px solid ${area.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{area.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.text }}>{area.label}</div>
                    <div style={{ fontSize:11, color:C.muted }}>Questões com IA · +XP ao acertar</div>
                  </div>
                  <span style={{ fontSize:11, color:area.color, fontWeight:700, background:`${area.color}22`, padding:"3px 10px", borderRadius:20 }}>+XP</span>
                </div>
              ))}
            </div>

            {/* CTA Redação */}
            <div style={{ background:`linear-gradient(135deg,${C.danger}18,${C.secondary}18)`, border:`1px solid ${C.danger}33`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", marginBottom:16 }}>
              <div style={{ fontSize:28 }}>✍️</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.text }}>Treinar Redação com IA</div>
                <div style={{ fontSize:11, color:C.muted }}>Correção nas 5 competências do ENEM</div>
              </div>
              <div style={{ fontSize:14, color:C.danger }}>→</div>
            </div>

            {/* Link rever perfil */}
            <button onClick={() => { setStep(6); setConcluido(false); }} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 14px", cursor:"pointer", fontSize:12, color:C.muted, fontFamily:"inherit", transition:"all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              ← Rever meu perfil
            </button>
          </div>

          <NavBar active="inicio" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>

        {/* Header fixo */}
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: `${C.surface}EE`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 540, margin: "0 auto", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 19 }}>
              <span style={{ color: C.primary }}>Nota</span>
              <span style={{ background: `linear-gradient(135deg,${C.accent},#F97316)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> A</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>Passo {step + 1} de {STEPS}</div>
          </div>
          <div style={{ height: 3, background: C.border, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.primary},${C.secondary})`, transition: "width .5s" }} />
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "28px 22px 80px" }}>
          {step > 0 && (
            <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, marginBottom: 22, display: "flex", alignItems: "center", gap: 6 }}>
              ← Voltar
            </button>
          )}

          {/* ─ PASSO 0: Nome ─ */}
          {step === 0 && (
            <div className="fu">
              <div style={{ fontSize: 52, marginBottom: 14 }}>👋</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>
                Olá! Eu sou o<br/><span style={{ color: C.primary }}>Nota A.</span>
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.6, maxWidth: 380 }}>
                Vou criar uma trilha de estudos completamente personalizada para você. Leva menos de 2 minutos.
              </div>
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>QUAL É O SEU NOME?</div>
                <input
                  autoFocus value={data.nome}
                  onChange={e => setF("nome", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && data.nome.trim() && next()}
                  placeholder="Seu primeiro nome"
                  style={{ width: "100%", padding: "15px 18px", background: C.card, border: `2px solid ${data.nome ? C.primary : C.border}`, borderRadius: 13, color: C.text, fontSize: 16, outline: "none", transition: "border-color .2s" }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = data.nome ? C.primary : C.border}
                />
              </div>
              <PBtn onClick={next} disabled={!data.nome.trim()} full size="lg">Começar meu perfil →</PBtn>
            </div>
          )}

          {/* ─ PASSO 1: Objetivo ─ */}
          {step === 1 && (
            <div className="fu">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Qual é o seu objetivo, {data.nome}?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Sua trilha será calibrada para isso.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["enem",    "🎯","Passar no ENEM",          "Foco nas 5 áreas e na redação"],
                  ["federal", "🏛️","Universidade Federal",     "Alta pontuação + redação nota 1000"],
                  ["bolsa",   "📜","Bolsa ProUni / FIES",      "Estratégia para maximizar sua nota"],
                  ["concurso","⚔️","Concurso / Militar",       "Conteúdo e raciocínio direcionados"],
                ].map(([id, icon, label, desc]) => (
                  <OCard key={id} icon={icon} label={label} desc={desc} row
                    color={C.primary} selected={data.objetivo === id}
                    onClick={() => { setF("objetivo", id); setTimeout(next, 200); }} />
                ))}
              </div>
            </div>
          )}

          {/* ─ PASSO 2: Estilo ─ */}
          {step === 2 && (
            <div className="fu">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Como você aprende melhor?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Sem resposta certa — seja honesto consigo mesmo!</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["visual",  "👁️","Visual",    "Mapas, esquemas\ne infográficos"],
                  ["auditivo","🎧","Auditivo",  "Vídeos, podcasts\ne áudio"],
                  ["leitura", "📖","Analítico", "Textos, resumos\ne anotações"],
                  ["pratico", "✏️","Prático",   "Exercícios e\nquestões"],
                ].map(([id, icon, label, desc]) => (
                  <OCard key={id} icon={icon} label={label} desc={desc}
                    color={C.secondary} selected={data.estilo === id}
                    onClick={() => { setF("estilo", id); setTimeout(next, 200); }} />
                ))}
              </div>
            </div>
          )}

          {/* ─ PASSO 3: Dificuldades ─ */}
          {step === 3 && (
            <div className="fu">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Onde você tem mais dificuldade?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Selecione quantas quiser — sem julgamentos!</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {[
                  ["mat","📐","Matemática"],["port","📝","Linguagens"],
                  ["hist","🏺","História"],["geo","🌍","Geografia"],
                  ["bio","🧬","Biologia"],["qui","⚗️","Química"],
                  ["fis","🔭","Física"],["red","✍️","Redação"],
                ].map(([id, icon, label]) => (
                  <OCard key={id} icon={icon} label={label}
                    color={C.danger} selected={data.dificuldades.includes(id)}
                    onClick={() => toggleF("dificuldades", id)} />
                ))}
              </div>
              <PBtn onClick={next} disabled={!data.dificuldades.length} full size="lg">
                {!data.dificuldades.length
                  ? "Selecione ao menos uma área"
                  : `Continuar com ${data.dificuldades.length} área${data.dificuldades.length > 1 ? "s" : ""} →`}
              </PBtn>
            </div>
          )}

          {/* ─ PASSO 4: Rotina ─ */}
          {step === 4 && (
            <div className="fu">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Quanto tempo você consegue estudar por dia?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Vamos montar sua rotina ideal — sem pressão!</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["15", "⚡","15 minutos",     "Estudante ocupado — foco no essencial"],
                  ["30", "🌤️","30 minutos",    "Ritmo leve — consistência é o segredo"],
                  ["60", "🔥","1 hora",          "Ritmo sólido — progresso visível"],
                  ["120","🚀","2 horas ou mais", "Foco total — para quem quer a vaga"],
                ].map(([id, icon, label, desc]) => (
                  <OCard key={id} icon={icon} label={label} desc={desc} row
                    color={C.accent} selected={data.rotina === id}
                    onClick={() => { setF("rotina", id); setTimeout(next, 200); }} />
                ))}
              </div>
            </div>
          )}

          {/* ─ PASSO 5: Como você prefere estudar? (Autopercepção) ─ */}
          {step === 5 && (
            <div className="fu">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>
                Como você prefere estudar?
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                Escolha quantas quiser — adaptamos sua trilha para você.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { id: "questoes_curtas",   icon: "⚡", label: "Questões curtas e objetivas",     sub: "Prefiro responder rápido, sem textos longos" },
                  { id: "passo_a_passo",     icon: "📋", label: "Explicações passo a passo",        sub: "Preciso entender cada etapa antes de avançar" },
                  { id: "pausas_frequentes", icon: "⏸️", label: "Sessões curtas com pausas",        sub: "Concentro melhor em blocos de 15–20 minutos" },
                  { id: "desafio",           icon: "🏆", label: "Desafios e competição",            sub: "Fico mais motivado quando há ranking ou meta" },
                  { id: "visual",            icon: "🗺️", label: "Esquemas, mapas e imagens",        sub: "Aprendo melhor com recursos visuais" },
                  { id: "contexto",          icon: "💡", label: "Contexto antes da questão",        sub: "Preciso entender o porquê antes de praticar" },
                ].map(({ id, icon, label, sub }) => {
                  const sel = data.autopercep.includes(id);
                  return (
                    <div key={id}
                      onClick={() => setData(d => ({
                        ...d,
                        autopercep: d.autopercep.includes(id)
                          ? d.autopercep.filter(x => x !== id)
                          : [...d.autopercep, id],
                      }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 13, cursor: "pointer",
                        border: `1.5px solid ${sel ? C.primary : C.border}`,
                        background: sel ? `${C.primary}0F` : C.card,
                        transition: "all .15s",
                      }}>
                      <span style={{ fontSize: 22, fontFamily: "initial", flexShrink: 0 }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700,
                          color: sel ? C.primary : C.text, lineHeight: 1.3 }}>{label}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
                      </div>
                      {sel && (
                        <div style={{ width: 18, height: 18, borderRadius: "50%",
                          background: C.primary, display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "#fff", fontSize: 10 }}>✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <PBtn onClick={next} full size="lg">
                {data.autopercep.length > 0
                  ? `Continuar com ${data.autopercep.length} preferência${data.autopercep.length > 1 ? "s" : ""} →`
                  : "Pular esta etapa →"}
              </PBtn>
              {data.autopercep.length === 0 && (
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.muted }}>
                  Não é obrigatório — você pode pular.
                </div>
              )}
            </div>
          )}

          {/* ─ PASSO 6: Neurodivergência (opcional) ─ */}
          {step === 6 && (
            <div className="fu">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Alguma condição que devemos considerar?</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Esta etapa é opcional. Ajuda a adaptar sua experiência.</div>
              <div style={{ background: `${C.primary}11`, border: `1px solid ${C.primary}33`, borderRadius: 12, padding: "11px 14px", marginBottom: 20, fontSize: 12, color: C.primary, lineHeight: 1.5 }}>
                🔒 Informação confidencial — usada somente para personalizar seu estudo.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {[
                  ["tdah","⚡","TDAH"],["dislexia","🔤","Dislexia"],
                  ["autismo","🧩","Autismo (TEA)"],["ansiedade","💭","Ansiedade"],
                ].map(([id, icon, label]) => (
                  <OCard key={id} icon={icon} label={label}
                    color={C.success} selected={data.neuro.includes(id)}
                    onClick={() => setData(d => ({
                      ...d,
                      neuro: d.neuro.includes(id)
                        ? d.neuro.filter(x => x !== id)
                        : [...d.neuro.filter(x => x !== "nenhum"), id],
                    }))} />
                ))}
                <div style={{ gridColumn: "1 / -1" }}>
                  <OCard icon="✓" label="Nenhuma das opções acima" row
                    color={C.muted} selected={data.neuro.includes("nenhum")}
                    onClick={() => setData(d => ({ ...d, neuro: d.neuro.includes("nenhum") ? [] : ["nenhum"] }))} />
                </div>
              </div>
              {/* Avança com ou sem seleção */}
              <PBtn onClick={next} full size="lg">
                {data.neuro.length > 0 ? "Gerar meu perfil →" : "Pular e gerar meu perfil →"}
              </PBtn>
              {data.neuro.length === 0 && (
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.muted }}>
                  Não é obrigatório — você pode pular esta etapa.
                </div>
              )}
            </div>
          )}

          {/* ─ PASSO 6: Perfil gerado ─ */}
          {step === 7 && (
            <div className="fu" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 68, marginBottom: 12 }} className="pop">🧠</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 900, color: C.primary, marginBottom: 6 }}>
                Perfil criado com sucesso!
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
                A IA gerou sua trilha personalizada com base nas suas respostas.
              </div>

              {/* Estilo cognitivo */}
              {perfil && (
                <div style={{ background: `${perfil.cor}14`, border: `1px solid ${perfil.cor}44`, borderRadius: 16, padding: "18px 16px", marginBottom: 20, textAlign: "left" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: perfil.cor, marginBottom: 6 }}>{perfil.tipo}</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{perfil.desc}</div>
                </div>
              )}

              {/* Resumo */}
              <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 20, textAlign: "left", overflow: "hidden" }}>
                <PRow icon="👤" label="Nome" value={data.nome} />
                <PRow icon="🎯" label="Objetivo" value={objLbl[data.objetivo]} />
                <PRow icon="🧠" label="Estilo de Aprendizagem" value={estLbl[data.estilo]} />
                {data.autopercep.length > 0 && (
                  <PRow icon="🎯" label="Como prefere estudar"
                    value={`${data.autopercep.length} preferência${data.autopercep.length > 1 ? "s" : ""} registrada${data.autopercep.length > 1 ? "s" : ""}`} />
                )}
                <PRow icon="⏱️" label="Rotina Diária" value={rotLbl[data.rotina]} />
                <PRow icon="📌" label="Áreas em Foco" value={
                  data.dificuldades.length
                    ? `${data.dificuldades.length} área${data.dificuldades.length > 1 ? "s" : ""} identificada${data.dificuldades.length > 1 ? "s" : ""}`
                    : null
                } />
                <PRow icon="🧩" label="Adaptações Pedagógicas" value={
                  data.neuro.length && !data.neuro.includes("nenhum")
                    ? data.neuro.map(n => NEURO_LBL[n] || n).join(", ")
                    : "Perfil padrão"
                } />
              </div>

              {/* Áreas de foco */}
              {data.dificuldades.length > 0 && (
                <div style={{ marginBottom: 22, textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: .5 }}>SUAS ÁREAS DE FOCO</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {data.dificuldades.map(d => (
                      <Pill key={d} color={C.danger}>
                        {({ mat:"Matemática",port:"Linguagens e Códigos",hist:"História",geo:"Geografia",bio:"Biologia",qui:"Química",fis:"Física",red:"Redação" })[d] || d}
                      </Pill>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 22 }}>
                <Pill color={C.accent}>✨ Trilha personalizada gerada pela IA</Pill>
              </div>

              <PBtn onClick={() => {
                  setConcluido(true);
                  if (onComplete) onComplete({
                    nome:         data.nome,
                    objetivo:     data.objetivo,
                    estiloAprendizagem: data.estilo,
                    dificuldades: data.dificuldades,
                    rotina:       data.rotina,
                    perfil:       data.neuro,
                    autopercepção: data.autopercep,
                  });
                }} full size="lg">
                🚀 Começar Minha Jornada no Nota A
              </PBtn>
              <div style={{ marginTop: 10 }}>
                <SBtn onClick={prev} full>← Revisar respostas</SBtn>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

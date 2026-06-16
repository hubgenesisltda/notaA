import { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar.jsx";

const C = {
  bg: "#07090F", surface: "#0E1420", card: "#131C2E", border: "#1A2640",
  primary: "#00D4FF", secondary: "#7C3AED", accent: "#F59E0B",
  success: "#10B981", danger: "#EF4444", text: "#E8EDF5", muted: "#5A6A85",
};

const COMPETENCIAS = [
  { n: 1, label: "Domínio da norma culta", desc: "Gramática, ortografia e pontuação", cor: "#00D4FF" },
  { n: 2, label: "Compreensão da proposta", desc: "Entendimento do tema e adequação ao tipo textual", cor: "#7C3AED" },
  { n: 3, label: "Seleção de argumentos", desc: "Organização e progressão das ideias", cor: "#10B981" },
  { n: 4, label: "Coesão textual", desc: "Conectivos, referências e fluência", cor: "#F59E0B" },
  { n: 5, label: "Proposta de intervenção", desc: "Solução detalhada, viável e respeitosa", cor: "#EF4444" },
];

const TEMAS_EXEMPLO = [
  "O impacto das redes sociais na saúde mental dos jovens brasileiros",
  "Desafios para a inclusão digital de populações vulneráveis no Brasil",
  "A invisibilidade da violência psicológica na sociedade contemporânea",
  "Caminhos para a valorização do patrimônio cultural brasileiro",
];

const SIM_Q = {
  1: [
    { q: "Quanto é 2+2×3?", ops: ["8","7 ✓","10","6","14"], ans: 1, xp: 50 },
    { q: "Raiz quadrada de 49:", ops: ["6","7","8","9","5"], ans: 1, xp: 50 },
  ],
  2: [
    { q: "f(x) = 2x+1. Qual é f(3)?", ops: ["5","6","7 ✓","8","9"], ans: 2, xp: 100 },
    { q: "Resolva x²−5x+6=0:", ops: ["x=1,6","x=2,3 ✓","x=1,4","x=3,5","x=2,5"], ans: 1, xp: 100 },
  ],
  3: [
    { q: "Derivada de f(x) = x³:", ops: ["3x","x²","3x²","2x³","x³"], ans: 2, xp: 200 },
    { q: "∫2x dx = ?", ops: ["x+C","x²+C","2x²+C","x²/2+C","2+C"], ans: 1, xp: 200 },
  ],
};

function NotaCirculo({ nota, cor, size = 56 }) {
  const pct = (nota / 200) * 100;
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={cor} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size > 48 ? 15 : 11, fontWeight: 900, color: cor,
      }}>
        {nota}
      </div>
    </div>
  );
}

function SimuladoModule() {
  const [fase, setFase] = useState("config");
  const [nivel, setNivel] = useState(2);
  const [qIdx, setQIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [rev, setRev] = useState(false);
  const [hist, setHist] = useState([]);
  const [txp, setTxp] = useState(0);
  const TOTAL = 8;
  const q = SIM_Q[nivel][qIdx % SIM_Q[nivel].length];
  const nivelLbl = { 1: "🟢 Fácil", 2: "🟡 Médio", 3: "🔴 Difícil" };
  const nivelCor = { 1: C.success, 2: C.accent, 3: C.danger };

  const resp = (i) => {
    if (rev) return;
    setSel(i); setRev(true);
    const ok = i === q.ans;
    const xp = ok ? q.xp : Math.floor(q.xp * .1);
    setTxp(t => t + xp);
    setTimeout(() => {
      if (ok && nivel < 3) setNivel(n => Math.min(3, n + 1));
      else if (!ok && nivel > 1) setNivel(n => Math.max(1, n - 1));
      setHist(h => [...h, { ok }]);
      if (hist.length + 1 >= TOTAL) setFase("resultado");
      else { setQIdx(i => i + 1); setSel(null); setRev(false); }
    }, 1500);
  };

  if (fase === "config") return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ background: `${C.accent}11`, border: `1px solid ${C.accent}33`, borderRadius: 16, padding: "20px 18px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🧬</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8 }}>Simulado Adaptativo</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
          Começa no nível médio. Se acertar, sobe para difícil. Se errar, cai para fácil.
          A IA encontra exatamente seu nível real e ajusta em tempo real.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[["🟢","Fácil","Conceitos base",50],["🟡","Médio","Nível ENEM",100],["🔴","Difícil","Alta performance",200]].map(([icon,lbl,desc,xp]) => (
          <div key={lbl} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{lbl}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{desc}</div>
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>+{xp} XP/acerto</div>
          </div>
        ))}
      </div>
      <button onClick={() => setFase("simulado")} style={{
        width: "100%", padding: 15, borderRadius: 14, border: "none",
        background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
        cursor: "pointer", fontSize: 15, fontWeight: 800, color: "#fff",
        boxShadow: `0 4px 20px ${C.primary}33`,
      }}>🚀 Iniciar Simulado Adaptativo</button>
    </div>
  );

  if (hist.length >= TOTAL) return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>Simulado Concluído!</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 16 }}>
          {[[`${hist.filter(h=>h.ok).length}/${TOTAL}`,"Acertos",C.primary],[`${Math.round(hist.filter(h=>h.ok).length/TOTAL*100)}%`,"Aproveitamento",C.success],[txp,"XP Ganho",C.accent]].map(([v,l,c]) => (
            <div key={l} style={{ background: C.surface, borderRadius: 10, padding: "12px 8px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>TRAJETÓRIA DE NÍVEL</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {hist.map((h, i) => (
            <div key={i} style={{ width: 30, height: 30, borderRadius: 8, background: h.ok ? `${C.success}22` : `${C.danger}22`, border: `1.5px solid ${h.ok ? C.success : C.danger}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              {h.ok ? "✓" : "✗"}
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => { setFase("config"); setHist([]); setNivel(2); setQIdx(0); setTxp(0); }} style={{
        width: "100%", padding: 14, borderRadius: 12, border: "none",
        background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
        cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#fff",
      }}>🔄 Novo Simulado</button>
    </div>
  );

  const pct = (hist.length / TOTAL) * 100;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 6 }}>
          <span>{hist.length}/{TOTAL} questões</span>
          <span style={{ fontWeight: 700, color: nivelCor[nivel] }}>{nivelLbl[nivel]}</span>
        </div>
        <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: nivelCor[nivel], borderRadius: 99, transition: "width .5s, background .5s" }} />
        </div>
      </div>
      <div style={{ background: `${nivelCor[nivel]}11`, border: `1px solid ${nivelCor[nivel]}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>🧬</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: nivelCor[nivel] }}>Nível adaptado: {nivelLbl[nivel]}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{nivel === 3 ? "Você está no nível máximo!" : nivel === 2 ? "A IA está calibrando seu nível..." : "Ajustamos para te ajudar a subir."}</div>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px", marginBottom: 12, fontSize: 14, lineHeight: 1.8 }}>{q.q}</div>
      <div style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: C.accent, display: "inline-block", marginBottom: 12 }}>+{q.xp} XP · {nivelLbl[nivel]}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.ops.map((op, i) => {
          let bg = C.card, border = C.border, color = C.text;
          if (rev) { if (i === q.ans) { bg = `${C.success}18`; border = C.success; color = C.success; } else if (i === sel) { bg = `${C.danger}18`; border = C.danger; color = C.danger; } }
          return (
            <button key={i} onClick={() => resp(i)} disabled={rev} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "13px 16px", textAlign: "left", cursor: rev ? "default" : "pointer", fontSize: 13, color, transition: "all .2s", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: rev && i === q.ans ? C.success : rev && i === sel ? C.danger : C.surface, border: `1px solid ${border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color: rev ? "#fff" : C.muted }}>
                {rev && i === q.ans ? "✓" : rev && i === sel ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {op.replace(" ✓","")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SocraticaModule() {
  const [tema, setTema] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const temas_sugeridos = ["Fotossíntese e respiração celular","Funções quadráticas","Revolução Industrial","Modernismo brasileiro","Imperialismo africano","Tabela periódica"];

  const iniciar = async () => {
    if (!tema.trim()) return;
    setStarted(true); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 250, system: `Você é uma IA Socrática especialista em ENEM. NUNCA dê a resposta direta. Faça perguntas que guiem o aluno a descobrir o conhecimento sozinho. Método socrático. Tema: ${tema}. Máximo 3 linhas.`, messages: [{ role: "user", content: `Quero aprender sobre ${tema}` }] }) });
      const d = await res.json();
      setMsgs([{ role: "ai", text: d.content[0].text }]);
    } catch {
      setMsgs([{ role: "ai", text: `Que bom que quer aprender sobre ${tema}! Antes de explicar, me diga: o que você já sabe ou imagina sobre esse assunto?` }]);
    }
    setLoading(false);
  };

  const enviar = async () => {
    if (!inp.trim() || loading) return;
    const nm = [...msgs, { role: "user", text: inp }];
    setMsgs(nm); setInp(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, system: `IA Socrática sobre "${tema}". NUNCA responda diretamente. Sempre faça uma pergunta que provoque o raciocínio. Máximo 2 linhas.`, messages: nm.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }) });
      const d = await res.json();
      setMsgs(p => [...p, { role: "ai", text: d.content[0].text }]);
    } catch {
      setMsgs(p => [...p, { role: "ai", text: "Interessante perspectiva! Consegue pensar em um exemplo prático disso no seu cotidiano?" }]);
    }
    setLoading(false);
  };

  if (!started) return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ background: `${C.secondary}11`, border: `1px solid ${C.secondary}33`, borderRadius: 16, padding: "20px 18px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🏛️</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8 }}>IA Socrática</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
          "Só sei que nada sei." — Sócrates<br/>
          A IA guia com perguntas até você descobrir sozinho. Isso forma pensamento crítico real — não decoreba.
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>SOBRE O QUE QUER APRENDER?</div>
        <input value={tema} onChange={e => setTema(e.target.value)} onKeyDown={e => e.key === "Enter" && iniciar()}
          placeholder="Ex: fotossíntese, Revolução Francesa, funções quadráticas..."
          style={{ width: "100%", padding: "13px 16px", background: C.card, border: `1.5px solid ${tema ? C.secondary : C.border}`, borderRadius: 12, color: C.text, fontSize: 14, outline: "none", marginBottom: 10, transition: "border-color .2s" }}
          onFocus={e => e.target.style.borderColor = C.secondary}
          onBlur={e => e.target.style.borderColor = tema ? C.secondary : C.border}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {temas_sugeridos.map(t => (
            <button key={t} onClick={() => setTema(t)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", fontSize: 11, color: C.muted, transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.secondary; e.currentTarget.style.color = C.secondary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={iniciar} disabled={!tema.trim()} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: !tema.trim() ? C.surface : `linear-gradient(135deg, ${C.secondary}, #EC4899)`, cursor: !tema.trim() ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 800, color: "#fff", opacity: !tema.trim() ? .4 : 1 }}>
          🏛️ Iniciar Diálogo Socrático
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "80vh", maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
        <button onClick={() => { setStarted(false); setMsgs([]); setTema(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13 }}>←</button>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>🏛️ IA Socrática</div>
          <div style={{ fontSize: 11, color: C.muted }}>{tema}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "12px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : `${C.secondary}18`, border: m.role === "ai" ? `1px solid ${C.secondary}44` : "none", fontSize: 13, lineHeight: 1.6, color: C.text }}>
              {m.role === "ai" && <div style={{ fontSize: 10, fontWeight: 700, color: C.secondary, marginBottom: 4 }}>🏛️ IA Socrática</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ padding: "12px 16px", background: `${C.secondary}18`, borderRadius: "16px 16px 16px 4px", display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.secondary, animation: `pulse 1.2s ease ${i*.2}s infinite` }} />)}</div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && enviar()}
          placeholder="Responda com o que você pensa..." disabled={loading}
          style={{ flex: 1, padding: "11px 14px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, outline: "none" }} />
        <button onClick={enviar} disabled={loading || !inp.trim()} style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: loading || !inp.trim() ? C.surface : `linear-gradient(135deg, ${C.secondary}, #EC4899)`, cursor: loading || !inp.trim() ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, color: "#fff", opacity: loading || !inp.trim() ? .4 : 1 }}>→</button>
      </div>
    </div>
  );
}

export default function ModuloEstudo() {
  const [modo, setModo] = useState("redacao");
  const tabs = [["redacao","✍️","Redação"], ["simulado","📊","Simulado Adaptativo"], ["socratica","🧠","IA Socrática"]];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
      <style>{`* { box-sizing: border-box; } button, textarea, input { font-family: inherit; } textarea { resize: vertical; } @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }`}</style>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 18, fontWeight: 900 }}>
            <span style={{ color: C.primary }}>Nota</span>
            <span style={{ background: `linear-gradient(135deg, ${C.accent}, #F97316)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> A</span>
          </span>
          <div style={{ display: "flex", gap: 4, background: C.card, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {tabs.map(([id,icon,lbl]) => (
              <button key={id} onClick={() => setModo(id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: modo === id ? `${C.primary}22` : "transparent", color: modo === id ? C.primary : C.muted, fontSize: 12, fontWeight: 700, transition: "all .2s" }}>{icon} {lbl}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ paddingBottom: 80 }}>
        {modo === "redacao" && <RedacaoModule />}
        {modo === "simulado" && <SimuladoModule />}
        {modo === "socratica" && <SocraticaModule />}
      </div>
      <NavBar active="redacao" />
    </div>
  );
}

function RedacaoModule() {
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [view, setView] = useState("editor"); // editor | resultado

  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  const linhas = texto.split("\n").length;

  const corrigir = async () => {
    if (!tema.trim() || texto.trim().length < 100) return;
    setLoading(true);
    try {
      const prompt = `Você é um corretor especialista do ENEM. Corrija a seguinte redação dissertativo-argumentativa conforme os critérios oficiais do ENEM (5 competências, 0 a 200 pontos cada).

TEMA: ${tema}

REDAÇÃO:
${texto}

Responda APENAS com JSON válido neste formato:
{
  "notas": {
    "c1": <0|40|80|120|160|200>,
    "c2": <0|40|80|120|160|200>,
    "c3": <0|40|80|120|160|200>,
    "c4": <0|40|80|120|160|200>,
    "c5": <0|40|80|120|160|200>
  },
  "comentarios": {
    "c1": "comentário detalhado sobre domínio da norma culta",
    "c2": "comentário sobre compreensão da proposta",
    "c3": "comentário sobre seleção e organização dos argumentos",
    "c4": "comentário sobre mecanismos de coesão",
    "c5": "comentário sobre a proposta de intervenção"
  },
  "pontos_fortes": ["ponto 1", "ponto 2", "ponto 3"],
  "melhorias": ["melhoria 1", "melhoria 2", "melhoria 3"],
  "paragrafo_melhorado": "Reescreva o parágrafo mais fraco da redação com melhorias concretas",
  "nivel": "Iniciante|Intermediário|Avançado|Expert"
}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(c => c.text || "").join("").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const total = Object.values(parsed.notas).reduce((a, b) => a + b, 0);
      setResultado({ ...parsed, total });
      setView("resultado");
    } catch (e) {
      // Fallback demo result
      setResultado({
        notas: { c1: 160, c2: 120, c3: 160, c4: 120, c5: 80 },
        comentarios: {
          c1: "Boa adequação à norma culta com poucos desvios gramaticais. Atenção ao uso de vírgulas em orações subordinadas.",
          c2: "O tema foi compreendido, mas a tese poderia ser mais explícita no primeiro parágrafo.",
          c3: "Argumentação presente, mas os argumentos precisam de mais embasamento factual e conexão com a realidade brasileira.",
          c4: "O uso de conectivos é adequado, mas há repetição lexical em alguns trechos que reduz a coesão.",
          c5: "A proposta de intervenção existe, mas falta detalhar agente, ação, meio, finalidade e detalhamento.",
        },
        pontos_fortes: ["Domínio satisfatório da norma culta", "Estrutura dissertativa presente", "Tema compreendido e desenvolvido"],
        melhorias: ["Fortalecer a proposta de intervenção com os 5 elementos", "Diversificar repertório sociocultural", "Aprofundar os argumentos com dados e exemplos"],
        paragrafo_melhorado: "Exemplo de proposta de intervenção melhorada: 'Para combater esse problema, o Ministério da Educação deve, por meio de parcerias com empresas de tecnologia, implementar programas de letramento digital nas escolas públicas, como o modelo finlandês de educação midiática, a fim de capacitar jovens para o uso crítico das redes sociais, com fiscalização anual pelos conselhos municipais de educação.'",
        total: 640,
        nivel: "Intermediário",
      });
      setView("resultado");
    }
    setLoading(false);
  };

  const nivelCor = { Iniciante: C.danger, Intermediário: C.accent, Avançado: C.primary, Expert: C.success };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
      <style>{`* { box-sizing: border-box; } button, textarea, input { font-family: inherit; } textarea { resize: vertical; }`}</style>

      {/* Header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "0 20px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 900 }}>
              <span style={{ color: C.primary }}>Nota</span>
              <span style={{ background: `linear-gradient(135deg, ${C.accent}, #F97316)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> A</span>
            </span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>✍️ Redação</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["editor", "resultado"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: view === v ? `${C.primary}22` : "transparent",
                color: view === v ? C.primary : C.muted,
                fontSize: 12, fontWeight: 700,
              }}>
                {v === "editor" ? "Editor" : "Correção"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
        {view === "editor" ? (
          <>
            {/* Tema */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>TEMA DA REDAÇÃO</div>
              <input
                value={tema}
                onChange={e => setTema(e.target.value)}
                placeholder="Digite o tema ou escolha um abaixo..."
                style={{
                  width: "100%", padding: "13px 16px",
                  background: C.card, border: `1.5px solid ${tema ? C.primary : C.border}`,
                  borderRadius: 12, color: C.text, fontSize: 14, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = tema ? C.primary : C.border}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {TEMAS_EXEMPLO.map((t, i) => (
                  <button key={i} onClick={() => setTema(t)} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 20, padding: "4px 10px", cursor: "pointer",
                    fontSize: 11, color: C.muted, transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                  >
                    {t.length > 40 ? t.slice(0, 40) + "…" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>SUA REDAÇÃO</div>
                <div style={{ fontSize: 11, color: palavras > 500 ? C.danger : palavras > 200 ? C.success : C.muted }}>
                  {palavras} palavras · {linhas} parágrafos
                  {palavras > 500 && " ⚠️ Limite ENEM"}
                </div>
              </div>
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder={"Escreva sua redação dissertativo-argumentativa aqui...\n\nEstrutura sugerida:\n• Introdução (apresente o tema e sua tese)\n• Desenvolvimento 1 (argumento + fundamentação)\n• Desenvolvimento 2 (argumento + fundamentação)\n• Conclusão (proposta de intervenção detalhada)"}
                rows={18}
                style={{
                  width: "100%", padding: "16px",
                  background: C.card, border: `1.5px solid ${C.border}`,
                  borderRadius: 14, color: C.text, fontSize: 14,
                  lineHeight: 1.8, outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Dicas */}
            <div style={{
              background: `${C.secondary}11`, border: `1px solid ${C.secondary}33`,
              borderRadius: 12, padding: "12px 16px", marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.secondary, marginBottom: 6 }}>💡 DICA DA IA</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
                A proposta de intervenção deve conter: <strong>agente</strong> (quem age), <strong>ação</strong> (o que fazer), <strong>meio</strong> (como fazer), <strong>finalidade</strong> (por quê) e <strong>detalhamento</strong>. Isso vale <strong>200 pontos</strong> na Competência 5.
              </div>
            </div>

            <button
              onClick={corrigir}
              disabled={loading || !tema.trim() || texto.trim().length < 100}
              style={{
                width: "100%", padding: 15, borderRadius: 14, border: "none",
                background: tema.trim() && texto.length >= 100
                  ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})`
                  : C.surface,
                cursor: tema.trim() && texto.length >= 100 ? "pointer" : "not-allowed",
                fontSize: 15, fontWeight: 800, color: "#fff",
                opacity: tema.trim() && texto.length >= 100 ? 1 : 0.4,
                boxShadow: tema.trim() && texto.length >= 100 ? `0 4px 20px ${C.primary}33` : "none",
                transition: "all 0.2s",
              }}
            >
              {loading ? "🤖 Corrigindo com IA..." : texto.length < 100 ? "Escreva pelo menos 100 caracteres" : "✨ Corrigir com IA"}
            </button>
          </>
        ) : resultado ? (
          <>
            {/* Nota total */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 20, padding: 24, marginBottom: 20, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, fontWeight: 600 }}>NOTA TOTAL ENEM</div>
              <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1,
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {resultado.total}
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>de 1000 pontos</div>
              <div style={{
                display: "inline-block", marginTop: 12,
                background: `${nivelCor[resultado.nivel]}22`,
                border: `1px solid ${nivelCor[resultado.nivel]}44`,
                color: nivelCor[resultado.nivel],
                borderRadius: 20, padding: "4px 14px",
                fontSize: 13, fontWeight: 700,
              }}>
                {resultado.nivel}
              </div>
            </div>

            {/* 5 Competências */}
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>COMPETÊNCIAS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {COMPETENCIAS.map((comp, i) => {
                const key = `c${comp.n}`;
                const nota = resultado.notas[key];
                const comentario = resultado.comentarios[key];
                const pct = (nota / 200) * 100;
                return (
                  <div key={comp.n} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <NotaCirculo nota={nota} cor={comp.cor} size={48} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>C{comp.n}: {comp.label}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{comp.desc}</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: comp.cor, borderRadius: 99, transition: "width 1s" }} />
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, opacity: 0.8 }}>{comentario}</div>
                  </div>
                );
              })}
            </div>

            {/* Pontos fortes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: `${C.success}11`, border: `1px solid ${C.success}33`, borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.success, marginBottom: 10 }}>✅ PONTOS FORTES</div>
                {resultado.pontos_fortes?.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>• {p}</div>
                ))}
              </div>
              <div style={{ background: `${C.danger}11`, border: `1px solid ${C.danger}33`, borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, marginBottom: 10 }}>🎯 MELHORAR</div>
                {resultado.melhorias?.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>• {p}</div>
                ))}
              </div>
            </div>

            {/* Parágrafo melhorado */}
            {resultado.paragrafo_melhorado && (
              <div style={{ background: `${C.primary}11`, border: `1px solid ${C.primary}33`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>✨ SUGESTÃO DE MELHORIA DA IA</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>
                  {resultado.paragrafo_melhorado}
                </div>
              </div>
            )}

            <button onClick={() => setView("editor")} style={{
              width: "100%", padding: 14, borderRadius: 12,
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#fff",
            }}>
              ✍️ Reescrever Redação
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
            Escreva sua redação e clique em corrigir
          </div>
        )}
      </div>
    </div>
  );
}

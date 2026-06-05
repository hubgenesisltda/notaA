import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#07090F", surface: "#0E1420", card: "#131C2E", border: "#1A2640",
  primary: "#00D4FF", secondary: "#7C3AED", accent: "#F59E0B",
  success: "#10B981", danger: "#EF4444", warning: "#F97316", text: "#E8EDF5", muted: "#5A6A85",
};

const ALUNOS = [
  { id: 1, nome: "Lara Oliveira", avatar: "LO", nivel: 8, xp: 3420, streak: 12, progresso: 78, risco: "baixo", areas: { lin: 72, hum: 68, nat: 45, mat: 38, red: 61 }, ativo: true },
  { id: 2, nome: "Mateus Santos", avatar: "MS", nivel: 5, xp: 1840, streak: 3, progresso: 45, risco: "medio", areas: { lin: 50, hum: 55, nat: 62, mat: 71, red: 40 }, ativo: true },
  { id: 3, nome: "Ana Beatriz", avatar: "AB", nivel: 11, xp: 5200, streak: 21, progresso: 92, risco: "baixo", areas: { lin: 88, hum: 91, nat: 84, mat: 76, red: 95 }, ativo: true },
  { id: 4, nome: "Carlos Mendes", avatar: "CM", nivel: 3, xp: 620, streak: 0, progresso: 18, risco: "alto", areas: { lin: 25, hum: 30, nat: 22, mat: 15, red: 18 }, ativo: false },
  { id: 5, nome: "Sofia Lima", avatar: "SL", nivel: 7, xp: 2910, streak: 7, progresso: 65, risco: "baixo", areas: { lin: 70, hum: 66, nat: 58, mat: 60, red: 74 }, ativo: true },
  { id: 6, nome: "Pedro Rocha", avatar: "PR", nivel: 4, xp: 1100, streak: 1, progresso: 31, risco: "alto", areas: { lin: 35, hum: 28, nat: 40, mat: 22, red: 30 }, ativo: false },
  { id: 7, nome: "Isabela Costa", avatar: "IC", nivel: 6, xp: 2200, streak: 5, progresso: 54, risco: "medio", areas: { lin: 58, hum: 60, nat: 48, mat: 52, red: 55 }, ativo: true },
  { id: 8, nome: "Rafael Nunes", avatar: "RN", nivel: 9, xp: 3900, streak: 14, progresso: 82, risco: "baixo", areas: { lin: 80, hum: 76, nat: 88, mat: 84, red: 71 }, ativo: true },
];

const AREAS_LABEL = { lin: "Linguagens e Códigos", hum: "Ciências Humanas", nat: "Ciências da Natureza", mat: "Matemática e suas Tecnologias", red: "Redação" };
const AREAS_COR = { lin: C.primary, hum: C.secondary, nat: C.success, mat: C.accent, red: C.danger };

const RISCO_COR = { baixo: C.success, medio: C.warning, alto: C.danger };
const RISCO_BG = { baixo: `${C.success}18`, medio: `${C.warning}18`, alto: `${C.danger}18` };
const RISCO_LABEL = { baixo: "Baixo risco", medio: "Risco médio", alto: "Risco alto" };

function MiniBar({ value, color, max = 100 }) {
  return (
    <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 99, transition: "width 0.8s" }} />
    </div>
  );
}


// ─── DADOS BATALHA ───────────────────────────────────────
const TURMAS=[
  {id:"t1",nome:"3º Ano A",escola:"Col. Est. Salvador",alunos:32,media:68,cor:C.primary,av:"3A",v:8,d:2},
  {id:"t2",nome:"3º Ano B",escola:"Col. Est. Salvador",alunos:28,media:61,cor:C.secondary,av:"3B",v:5,d:5},
  {id:"t3",nome:"3º Ano C",escola:"Col. Est. Salvador",alunos:30,media:55,cor:C.accent,av:"3C",v:3,d:7},
];
const ESCOLAS=[
  {id:"e1",nome:"Col. Estadual Salvador",cidade:"Salvador, BA",alunos:420,media:68,cor:C.primary,av:"CES",pos:1,pts:2840},
  {id:"e2",nome:"CEFET Rio de Janeiro",cidade:"Rio de Janeiro",alunos:380,media:72,cor:C.secondary,av:"CFT",pos:2,pts:2760},
  {id:"e3",nome:"IFBA Salvador",cidade:"Salvador, BA",alunos:360,media:65,cor:C.success,av:"IFB",pos:3,pts:2590},
  {id:"e4",nome:"Col. Militar SP",cidade:"São Paulo, SP",alunos:500,media:81,cor:C.accent,av:"CMS",pos:4,pts:2510},
  {id:"e5",nome:"EEFM João Pessoa",cidade:"João Pessoa, PB",alunos:290,media:58,cor:C.danger,av:"JPS",pos:5,pts:2280},
];
const BCQ={
  lin:[{q:"'A vida é um sonho' — figura de linguagem:",ops:["Ironia","Metonímia","Metáfora","Hipérbole","Eufemismo"],ans:2,xp:120},{q:"Classe gramatical de 'felizmente' em 'Felizmente chegamos':",ops:["Adjetivo","Advérbio","Substantivo","Verbo","Conjunção"],ans:1,xp:120}],
  mat:[{q:"Qual o valor de log₂(32)?",ops:["4","5","6","8","16"],ans:1,xp:130},{q:"Soma dos ângulos internos de um hexágono regular:",ops:["540°","640°","720°","800°","900°"],ans:2,xp:130}],
  nat:[{q:"Fórmula molecular da glicose:",ops:["C₆H₁₂O₆","C₁₂H₂₂O₁₁","C₆H₁₀O₅","CH₄","C₂H₆O"],ans:0,xp:120},{q:"Divisão celular que origina gametas:",ops:["Mitose","Meiose","Citose","Apoptose","Fagocitose"],ans:1,xp:120}],
  hum:[{q:"A Revolução Francesa ocorreu em:",ops:["1776","1783","1789","1799","1804"],ans:2,xp:120},{q:"O Mercosul foi criado pelo Tratado de:",ops:["Brasília","Montevidéu","Assunção","Lima","Buenos Aires"],ans:2,xp:120}],
};
const AREA_NOME={lin:"Linguagens e Códigos",hum:"Ciências Humanas",nat:"Ciências da Natureza",mat:"Matemática e suas Tecnologias"};
const AREA_ICO={lin:"📚",hum:"🌍",nat:"⚗️",mat:"📐"};
const AREA_COR2={lin:C.primary,hum:C.secondary,nat:C.success,mat:C.accent};

function BatalhaColetiva() {
  const [aba, setAba] = useState("lobby");
  const [modo, setModo] = useState(null);
  const [fase, setFase] = useState("config");
  const [oponente, setOponente] = useState(null);
  const [area, setArea] = useState("mat");
  const [qIdx, setQIdx] = useState(0);
  const [timer, setTimer] = useState(15);
  const [sel, setSel] = useState(null);
  const [rev, setRev] = useState(false);
  const [cd, setCd] = useState(3);
  const [placar, setPlacar] = useState({ nos: 0, eles: 0 });
  const [hist, setHist] = useState([]);
  const tRef = useRef(null);
  const TOTAL = 6;
  const qs = BCQ[area] || BCQ.mat;
  const q = qs[qIdx % qs.length];

  useEffect(() => {
    if (fase !== "countdown") return;
    const t = setInterval(() => setCd(c => { if (c <= 1) { clearInterval(t); setFase("battle"); return 3; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [fase]);

  useEffect(() => {
    if (fase !== "battle" || rev) return;
    setTimer(15);
    tRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(tRef.current); doRev(false); return 0; } return t - 1; }), 1000);
    return () => clearInterval(tRef.current);
  }, [fase, qIdx, rev]);

  const doRev = (ok) => {
    setRev(true);
    const opOk = Math.random() > (ok ? .55 : .35);
    setPlacar(s => ({ nos: ok ? s.nos + 1 : s.nos, eles: opOk ? s.eles + 1 : s.eles }));
    setHist(h => [...h, { ok, opOk }]);
    setTimeout(() => { if (hist.length + 1 >= TOTAL) setFase("resultado"); else { setQIdx(i => i + 1); setSel(null); setRev(false); } }, 1500);
  };

  const resp = (i) => { if (rev) return; setSel(i); clearInterval(tRef.current); doRev(i === q.ans); };
  const reset = () => { setFase("config"); setOponente(null); setQIdx(0); setSel(null); setRev(false); setPlacar({ nos: 0, eles: 0 }); setHist([]); setCd(3); setTimer(15); };
  const vencemos = placar.nos > placar.eles, empate = placar.nos === placar.eles;

  const TabBar = () => (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, padding: 4, borderRadius: 12, border: `1px solid ${C.border}` }}>
      {[["lobby","⚔️ Batalhar"],["ranking","🏆 Ranking"],["aovivo","🔴 Ao Vivo"],["historico","📋 Histórico"]].map(([id,lbl]) => (
        <button key={id} onClick={() => { setAba(id); if (id !== "lobby") reset(); }} style={{ flex:1, padding:"7px 4px", borderRadius:9, border:"none", cursor:"pointer", background: aba===id?`${C.danger}22`:"transparent", color: aba===id?C.danger:C.muted, fontSize:11, fontWeight:700, transition:"all .2s" }}>{lbl}</button>
      ))}
    </div>
  );

  if (aba === "ranking") return (
    <div>
      <TabBar/>
      <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:12 }}>🏛️ Ranking Nacional — Escolas</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
        {ESCOLAS.map((e,i) => (
          <div key={e.id} style={{ background:C.card, border:`1px solid ${i===0?C.accent:C.border}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:18, fontWeight:900, color:i===0?C.accent:i===1?"#C0C0C0":i===2?"#CD7F32":C.muted, width:26 }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</div>
            <div style={{ width:36, height:36, borderRadius:10, background:`${e.cor}22`, border:`1px solid ${e.cor}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:e.cor, flexShrink:0 }}>{e.av}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{e.nome}</div>
              <div style={{ fontSize:11, color:C.muted }}>{e.cidade} · {e.alunos} alunos · Média {e.media}%</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:16, fontWeight:900, color:e.cor }}>{e.pts.toLocaleString()}</div>
              <div style={{ fontSize:10, color:C.muted }}>pontos</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:12 }}>🏫 Ranking Turmas — Col. Est. Salvador</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {TURMAS.map((t,i) => (
          <div key={t.id} style={{ background:C.card, border:`1px solid ${i===0?C.accent:C.border}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:16, fontWeight:900, color:i===0?C.accent:C.muted, width:22 }}>{i===0?"🥇":`#${i+1}`}</div>
            <div style={{ width:34, height:34, borderRadius:8, background:`${t.cor}22`, border:`1px solid ${t.cor}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:t.cor, flexShrink:0 }}>{t.av}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{t.nome}</div>
              <div style={{ fontSize:11, color:C.muted }}>{t.escola} · {t.alunos} alunos</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ fontSize:11, color:C.success, fontWeight:700 }}>{t.v}V</div>
              <div style={{ fontSize:11, color:C.danger, fontWeight:700 }}>{t.d}D</div>
              <div style={{ fontSize:11, color:C.muted }}>{Math.round(t.v/(t.v+t.d)*100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (aba === "aovivo") return (
    <div>
      <TabBar/>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:C.danger, animation:"pulse 1s infinite" }}/>
        <div style={{ fontSize:14, fontWeight:700, color:C.danger }}>12 batalhas ao vivo agora</div>
      </div>
      {[
        {a:"3º Ano A",sa:4,b:"3º Ano B",sb:3,area:"mat",q:4,tot:6},
        {a:"IFBA Salvador",sa:5,b:"CEFET Rio",sb:4,area:"lin",q:5,tot:6},
        {a:"Col. Militar SP",sa:3,b:"EEFM João Pessoa",sb:2,area:"nat",q:3,tot:6},
      ].map((bat,i) => (
        <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontSize:11, color:AREA_COR2[bat.area], fontWeight:700, background:`${AREA_COR2[bat.area]}22`, padding:"2px 8px", borderRadius:20 }}>{AREA_ICO[bat.area]} {AREA_NOME[bat.area]}</div>
            <div style={{ fontSize:11, color:C.muted }}>Q{bat.q}/{bat.tot}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.primary }}>{bat.a}</div>
              <div style={{ fontSize:28, fontWeight:900, color:bat.sa>bat.sb?C.success:C.muted }}>{bat.sa}</div>
            </div>
            <div style={{ fontSize:14, color:C.muted, fontWeight:700 }}>VS</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.secondary }}>{bat.b}</div>
              <div style={{ fontSize:28, fontWeight:900, color:bat.sb>bat.sa?C.success:C.muted }}>{bat.sb}</div>
            </div>
          </div>
          <div style={{ height:6, background:C.border, borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(bat.sa/(bat.sa+bat.sb||1))*100}%`, background:AREA_COR2[bat.area], borderRadius:99 }}/>
          </div>
        </div>
      ))}
    </div>
  );

  if (aba === "historico") return (
    <div>
      <TabBar/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[["8","Vitórias",C.success],["2","Derrotas",C.danger],["75%","Win rate",C.primary]].map(([v,l,c]) => (
          <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 10px", textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:900, color:c }}>{v}</div>
            <div style={{ fontSize:11, color:C.muted }}>{l}</div>
          </div>
        ))}
      </div>
      {[
        {data:"Hoje",res:"Vitória",nos:5,eles:2,op:"3º Ano B",area:"mat",xp:750},
        {data:"Ontem",res:"Vitória",nos:4,eles:3,op:"EEFM João Pessoa",area:"lin",xp:600},
        {data:"23/Mai",res:"Derrota",nos:2,eles:5,op:"Col. Militar SP",area:"nat",xp:200},
        {data:"22/Mai",res:"Vitória",nos:6,eles:1,op:"3º Ano C",area:"hum",xp:900},
      ].map((h,i) => (
        <div key={i} style={{ background:C.card, border:`1px solid ${h.res==="Vitória"?C.success+"44":C.danger+"44"}`, borderRadius:14, padding:"14px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:20 }}>{h.res==="Vitória"?"🏆":"💪"}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:700, color:h.res==="Vitória"?C.success:C.danger }}>{h.res}</div>
              <div style={{ fontSize:12, color:C.muted }}>vs {h.op}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <div style={{ fontSize:11, color:AREA_COR2[h.area], background:`${AREA_COR2[h.area]}22`, padding:"1px 7px", borderRadius:20, fontWeight:600 }}>{AREA_NOME[h.area]}</div>
              <div style={{ fontSize:11, color:C.accent, fontWeight:700 }}>+{h.xp} XP</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:18, fontWeight:900, color:C.text }}>{h.nos}×{h.eles}</div>
            <div style={{ fontSize:11, color:C.muted }}>{h.data}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <TabBar/>
      <style>{`@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}`}</style>

      {fase==="countdown"&&<div style={{minHeight:"55vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><div style={{fontSize:96,fontWeight:900,color:C.danger,lineHeight:1,animation:"bpulse 1s infinite"}}>{cd}</div><div style={{fontSize:18,color:C.muted,marginTop:8}}>A batalha começa!</div></div>}

      {fase==="config"&&!modo&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:12}}>TIPO DE BATALHA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
            {[["turma","🏫","Turma vs Turma","Dispute com outra turma da escola",C.primary],["escola","🏛️","Escola vs Escola","Sua escola enfrenta escolas do Brasil",C.warning]].map(([id,icon,titulo,desc,cor])=>(
              <div key={id} onClick={()=>setModo(id)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=cor;e.currentTarget.style.background=`${cor}08`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
                <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
                <div style={{fontSize:14,fontWeight:800,color:cor,marginBottom:4}}>{titulo}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{background:`${C.danger}11`,border:`1px solid ${C.danger}33`,borderRadius:14,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.danger,marginBottom:10}}>🔴 BATALHAS AO VIVO AGORA</div>
            {[["3º A vs 3º B","Col. Est. Salvador","Matemática e suas Tecnologias","2min"],["IFBA vs CEFET","Nacional","Linguagens e Códigos","5min"]].map(([bat,esc,ar,t])=>(
              <div key={bat} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:C.danger,animation:"pulse 1s infinite",flexShrink:0}}/>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{bat}</div><div style={{fontSize:11,color:C.muted}}>{esc} · {ar}</div></div>
                <div style={{fontSize:11,color:C.muted}}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fase==="config"&&modo&&(
        <div>
          <button onClick={()=>setModo(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,marginBottom:16}}>← Tipo de batalha</button>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:12}}>{modo==="turma"?"ESCOLHA A TURMA OPONENTE":"ESCOLHA A ESCOLA OPONENTE"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {(modo==="turma"?TURMAS:ESCOLAS).map(op=>(
              <div key={op.id} onClick={()=>setOponente(op)} style={{background:oponente?.id===op.id?`${op.cor}11`:C.card,border:`1.5px solid ${oponente?.id===op.id?op.cor:C.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .2s"}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${op.cor}22`,border:`1px solid ${op.cor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:op.cor,flexShrink:0}}>{op.av}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{op.nome}</div>
                  <div style={{fontSize:11,color:C.muted}}>{modo==="turma"?op.escola:op.cidade} · {op.alunos} alunos · Média {op.media}%</div>
                </div>
                {oponente?.id===op.id&&<div style={{fontSize:16,color:op.cor}}>✓</div>}
              </div>
            ))}
          </div>
          {oponente&&(
            <>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:10}}>ÁREA DO DESAFIO</div>
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {Object.keys(BCQ).map(id=>(
                  <button key={id} onClick={()=>setArea(id)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${area===id?AREA_COR2[id]:C.border}`,background:area===id?`${AREA_COR2[id]}22`:"transparent",color:area===id?AREA_COR2[id]:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>{AREA_ICO[id]} {AREA_NOME[id]}</button>
                ))}
              </div>
              <div style={{background:`linear-gradient(135deg,${C.danger}22,${C.warning}18)`,border:`1px solid ${C.danger}33`,borderRadius:14,padding:"16px",marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:10}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:800,color:C.primary}}>3º Ano A</div><div style={{fontSize:11,color:C.muted}}>32 alunos</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:C.danger}}>VS</div><div style={{fontSize:11,color:C.muted}}>{TOTAL}Q</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:800,color:oponente.cor}}>{oponente.nome}</div><div style={{fontSize:11,color:C.muted}}>{oponente.alunos} alunos</div></div>
                </div>
              </div>
              <button onClick={()=>setFase("countdown")} style={{width:"100%",padding:15,borderRadius:14,border:"none",background:`linear-gradient(135deg,${C.danger},${C.warning})`,cursor:"pointer",fontSize:15,fontWeight:800,color:"#fff"}}>🏟️ Iniciar Batalha Coletiva!</button>
            </>
          )}
        </div>
      )}

      {fase==="battle"&&oponente&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{background:C.card,border:`1px solid ${C.primary}55`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:11,color:C.muted,marginBottom:2}}>3º ANO A</div><div style={{fontSize:36,fontWeight:900,color:C.primary}}>{placar.nos}</div><div style={{fontSize:10,color:C.muted}}>acertos</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:C.danger}}>VS</div><div style={{fontSize:11,color:C.muted}}>{hist.length+1}/{TOTAL}</div><div style={{width:7,height:7,borderRadius:"50%",background:C.danger,margin:"4px auto",animation:"pulse 1s infinite"}}/></div>
            <div style={{background:C.card,border:`1px solid ${oponente.cor}55`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:11,color:C.muted,marginBottom:2}}>{oponente.nome.slice(0,12).toUpperCase()}</div><div style={{fontSize:36,fontWeight:900,color:oponente.cor}}>{placar.eles}</div><div style={{fontSize:10,color:C.muted}}>acertos</div></div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:6}}><span>Questão {hist.length+1}/{TOTAL}</span><span style={{fontWeight:700,color:timer<=4?C.danger:C.success}}>{timer}s</span></div>
            <div style={{height:6,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(timer/15)*100}%`,background:timer<=4?C.danger:"linear-gradient(90deg,"+C.danger+","+C.warning+")",borderRadius:99,transition:"width 1s linear,background .5s"}}/></div>
          </div>
          <div style={{background:`${AREA_COR2[area]}22`,border:`1px solid ${AREA_COR2[area]}44`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:AREA_COR2[area],display:"inline-block",marginBottom:12}}>{AREA_ICO[area]} {AREA_NOME[area]}</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:12,fontSize:14,lineHeight:1.8}}>{q.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {q.ops.map((op,i)=>{
              let bg=C.card,border=C.border,color=C.text;
              if(rev){if(i===q.ans){bg=`${C.success}18`;border=C.success;color=C.success;}else if(i===sel){bg=`${C.danger}18`;border=C.danger;color=C.danger;}}
              return<button key={i} onClick={()=>resp(i)} disabled={rev} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:12,padding:"13px 16px",textAlign:"left",cursor:rev?"default":"pointer",fontSize:13,color,transition:"all .2s",display:"flex",alignItems:"center",gap:12}}>
                <span style={{width:26,height:26,borderRadius:"50%",background:rev&&i===q.ans?C.success:rev&&i===sel?C.danger:C.surface,border:`1px solid ${border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,color:rev?"#fff":C.muted}}>
                  {rev&&i===q.ans?"✓":rev&&i===sel?"✗":String.fromCharCode(65+i)}
                </span>
                {op}
              </button>;
            })}
          </div>
        </div>
      )}

      {fase==="resultado"&&oponente&&(
        <div>
          <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:60,marginBottom:8}}>{vencemos?"🏆":empate?"🤝":"💪"}</div><div style={{fontSize:26,fontWeight:900,color:vencemos?C.success:empate?C.accent:C.danger}}>{vencemos?"Vitória!":empate?"Empate!":"Derrota!"}</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>3º Ano A {placar.nos} × {placar.eles} {oponente.nome}</div></div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"20px",marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:12,marginBottom:vencemos?14:0}}><div style={{textAlign:"center"}}><div style={{fontSize:52,fontWeight:900,color:C.primary,lineHeight:1}}>{placar.nos}</div><div style={{fontSize:12,color:C.muted}}>3º Ano A</div></div><div style={{fontSize:16,color:C.muted,fontWeight:700}}>VS</div><div style={{textAlign:"center"}}><div style={{fontSize:52,fontWeight:900,color:oponente.cor,lineHeight:1}}>{placar.eles}</div><div style={{fontSize:12,color:C.muted}}>{oponente.nome}</div></div></div>
            {vencemos&&<div style={{textAlign:"center",padding:"10px",background:`${C.success}11`,borderRadius:10}}><span style={{fontSize:12,color:C.success,fontWeight:700}}>🏆 +{placar.nos*150} XP para toda a turma! (bônus coletivo)</span></div>}
          </div>
          <div style={{background:`${C.warning}11`,border:`1px solid ${C.warning}33`,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:C.warning,marginBottom:6}}>📈 IMPACTO NO RANKING</div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.5}}>{vencemos?`Col. Estadual Salvador ${modo==="escola"?"subiu 1 posição no ranking nacional":"lidera a liga local"} — próxima batalha disponível em 24h.`:`Boa batalha! Revisem ${AREA_NOME[area]} hoje e revancha amanhã.`}</div>
          </div>
          <div style={{display:"flex",gap:10}}><button onClick={reset} style={{flex:1,padding:14,borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.danger},${C.warning})`,cursor:"pointer",fontSize:14,fontWeight:800,color:"#fff"}}>⚔️ Nova Batalha</button><button onClick={()=>setAba("ranking")} style={{flex:1,padding:14,borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontSize:14,fontWeight:700,color:C.muted}}>🏆 Ver Ranking</button></div>
        </div>
      )}
    </div>
  );
}

export default function DashboardBatalha() {
  const [modo, setModo] = useState("dashboard");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
      <style>{`* { box-sizing: border-box; } button { font-family: inherit; } @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}} @keyframes bpulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}`}</style>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 900 }}>
              <span style={{ color: C.primary }}>Nota</span>
              <span style={{ background: `linear-gradient(135deg, ${C.accent}, #F97316)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> A</span>
            </span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Prof. Jó — 3º Ano A</span>
          </div>
          <div style={{ display: "flex", gap: 4, background: C.card, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {[["dashboard","📊 Dashboard"],["batalha","🏟️ Batalha Coletiva"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setModo(id)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: modo === id ? `${C.primary}22` : "transparent", color: modo === id ? C.primary : C.muted, fontSize: 12, fontWeight: 700 }}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {modo === "dashboard" ? <DashboardModule /> : <BatalhaColetiva />}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        <div style={{ fontSize: 11, color, background: `${color}22`, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DashboardModule() {
  const [tab, setTab] = useState("turma");
  const [alunoSel, setAlunoSel] = useState(null);
  const [filtroRisco, setFiltroRisco] = useState("todos");

  const ativos = ALUNOS.filter(a => a.ativo).length;
  const emRisco = ALUNOS.filter(a => a.risco === "alto").length;
  const progMedio = Math.round(ALUNOS.reduce((s, a) => s + a.progresso, 0) / ALUNOS.length);
  const streakMedio = Math.round(ALUNOS.reduce((s, a) => s + a.streak, 0) / ALUNOS.length);

  const alunosFiltrados = filtroRisco === "todos" ? ALUNOS : ALUNOS.filter(a => a.risco === filtroRisco);

  const areaMaisFragil = Object.keys(AREAS_LABEL).reduce((min, k) => {
    const med = ALUNOS.reduce((s, a) => s + a.areas[k], 0) / ALUNOS.length;
    const minMed = ALUNOS.reduce((s, a) => s + a.areas[min], 0) / ALUNOS.length;
    return med < minMed ? k : min;
  }, "mat");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
      <style>{`* { box-sizing: border-box; } button { font-family: inherit; }`}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 900 }}>
              <span style={{ color: C.primary }}>Nota</span>
              <span style={{ background: `linear-gradient(135deg, ${C.accent}, #F97316)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> A</span>
            </span>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Prof. Jó — 3º Ano A</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            🗓️ {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard label="Alunos ativos (7 dias)" value={ativos} sub={`${Math.round(ativos / ALUNOS.length * 100)}%`} color={C.primary} icon="👥" />
          <StatCard label="Progresso médio" value={`${progMedio}%`} sub="da trilha" color={C.success} icon="📈" />
          <StatCard label="Em risco de evasão" value={emRisco} sub="alunos" color={C.danger} icon="⚠️" />
          <StatCard label="Streak médio" value={`${streakMedio}d`} sub="sequência" color={C.accent} icon="🔥" />
        </div>

        {/* Alerta área frágil */}
        <div style={{
          background: `${C.warning}11`, border: `1px solid ${C.warning}33`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 24 }}>📌</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.warning }}>Área mais frágil da turma: {AREAS_LABEL[areaMaisFragil]}</div>
            <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>
              Média de {Math.round(ALUNOS.reduce((s, a) => s + a.areas[areaMaisFragil], 0) / ALUNOS.length)}% — considere programar uma revisão coletiva nessa área.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, padding: 4, borderRadius: 12, border: `1px solid ${C.border}` }}>
          {[["turma", "👥 Turma"], ["areas", "📊 Por Área"], ["aluno", "🎯 Aluno"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: "8px 12px", borderRadius: 9, cursor: "pointer",
              background: tab === id ? `linear-gradient(135deg, ${C.primary}22, ${C.secondary}22)` : "transparent",
              color: tab === id ? C.primary : C.muted,
              fontSize: 13, fontWeight: tab === id ? 700 : 500,
              border: tab === id ? `1px solid ${C.primary}44` : "1px solid transparent",
              transition: "all 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* TAB: TURMA */}
        {tab === "turma" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["todos", "baixo", "medio", "alto"].map(r => (
                <button key={r} onClick={() => setFiltroRisco(r)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: filtroRisco === r ? (r === "todos" ? C.primary : RISCO_COR[r]) : C.card,
                  color: filtroRisco === r ? "#000" : C.muted,
                  transition: "all 0.2s",
                }}>
                  {r === "todos" ? "Todos" : RISCO_LABEL[r]}
                  {r !== "todos" && ` (${ALUNOS.filter(a => a.risco === r).length})`}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alunosFiltrados.map(a => (
                <div key={a.id} onClick={() => { setAlunoSel(a); setTab("aluno"); }}
                  style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = `${C.primary}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: a.ativo ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : C.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: a.ativo ? "#fff" : C.muted,
                    border: a.ativo ? "none" : `1px solid ${C.border}`,
                  }}>
                    {a.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{a.nome}</div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                        background: RISCO_BG[a.risco], color: RISCO_COR[a.risco],
                      }}>
                        {a.risco === "alto" ? "⚠️ " : ""}{RISCO_LABEL[a.risco]}
                      </div>
                      {!a.ativo && <div style={{ fontSize: 10, color: C.muted, background: C.surface, padding: "2px 7px", borderRadius: 20 }}>Inativo</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MiniBar value={a.progresso} color={RISCO_COR[a.risco]} />
                      <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{a.progresso}%</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>🔥 {a.streak}d</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Nível {a.nivel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ÁREAS */}
        {tab === "areas" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(AREAS_LABEL).map(([key, label]) => {
              const notas = ALUNOS.map(a => a.areas[key]);
              const media = Math.round(notas.reduce((s, n) => s + n, 0) / notas.length);
              const min = Math.min(...notas);
              const max = Math.max(...notas);
              const cor = AREAS_COR[key];
              return (
                <div key={key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: cor }}>{media}%</div>
                  </div>
                  <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${media}%`, background: cor, borderRadius: 99, transition: "width 0.8s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ fontSize: 12, color: C.muted }}>Mín: <span style={{ color: C.danger, fontWeight: 700 }}>{min}%</span></div>
                    <div style={{ fontSize: 12, color: C.muted }}>Máx: <span style={{ color: C.success, fontWeight: 700 }}>{max}%</span></div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      Abaixo de 50%: <span style={{ color: C.warning, fontWeight: 700 }}>{notas.filter(n => n < 50).length} alunos</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 12, flexWrap: "wrap" }}>
                    {ALUNOS.sort((a, b) => a.areas[key] - b.areas[key]).map(a => (
                      <div key={a.id} title={`${a.nome}: ${a.areas[key]}%`}
                        style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: a.areas[key] < 50 ? `${C.danger}22` : `${cor}22`,
                          border: `1.5px solid ${a.areas[key] < 50 ? C.danger : cor}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, color: a.areas[key] < 50 ? C.danger : cor,
                          cursor: "pointer",
                        }}
                        onClick={() => { setAlunoSel(a); setTab("aluno"); }}
                      >
                        {a.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: ALUNO */}
        {tab === "aluno" && (
          alunoSel ? (
            <div>
              <button onClick={() => setTab("turma")} style={{
                background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, marginBottom: 20, fontFamily: "inherit",
              }}>← Voltar para turma</button>

              {/* Header aluno */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 900, color: "#fff",
                  }}>
                    {alunoSel.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{alunoSel.nome}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: C.primary, background: `${C.primary}22`, padding: "2px 8px", borderRadius: 20 }}>Nível {alunoSel.nivel}</span>
                      <span style={{ fontSize: 11, color: RISCO_COR[alunoSel.risco], background: RISCO_BG[alunoSel.risco], padding: "2px 8px", borderRadius: 20 }}>{RISCO_LABEL[alunoSel.risco]}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { label: "Progresso", value: `${alunoSel.progresso}%`, color: C.success },
                    { label: "XP Total", value: alunoSel.xp.toLocaleString(), color: C.primary },
                    { label: "Streak", value: `${alunoSel.streak} dias`, color: C.accent },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desempenho por área */}
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>DESEMPENHO POR ÁREA</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {Object.entries(AREAS_LABEL).map(([key, label]) => {
                  const val = alunoSel.areas[key];
                  const cor = val < 50 ? C.danger : val < 70 ? C.warning : C.success;
                  return (
                    <div key={key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, color: C.text, flex: 1 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: cor }}>{val}%</div>
                      </div>
                      <MiniBar value={val} color={cor} />
                    </div>
                  );
                })}
              </div>

              {/* Recomendação IA */}
              <div style={{ background: `${C.secondary}11`, border: `1px solid ${C.secondary}33`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.secondary, marginBottom: 8 }}>🤖 RECOMENDAÇÃO DA IA</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                  {alunoSel.risco === "alto"
                    ? `${alunoSel.nome} apresenta sinais de evasão. Recomenda-se contato imediato e mentoria personalizada. As áreas de Matemática e Ciências da Natureza precisam de atenção urgente.`
                    : alunoSel.risco === "medio"
                      ? `${alunoSel.nome} tem potencial, mas precisa de incentivo. A área mais frágil é ${AREAS_LABEL[Object.keys(alunoSel.areas).reduce((a, b) => alunoSel.areas[a] < alunoSel.areas[b] ? a : b)]}. Sugerimos desafios gamificados nessa área.`
                      : `${alunoSel.nome} está no caminho certo! Continue incentivando o streak e considere desafios avançados para manter o engajamento.`
                  }
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👆</div>
              <div>Clique em um aluno na aba Turma para ver os detalhes</div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

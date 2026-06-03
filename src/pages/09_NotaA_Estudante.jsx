import { useState } from "react";

// ============================================================
// NOTA A — MÓDULO DO ESTUDANTE
// Perfil completo, trilha de aprendizagem, conquistas,
// histórico de sessões, configurações e plano
// ============================================================

const C = {
  bg:"#0A0E1A", surface:"#111827", card:"#1A2235", border:"#1E2D45",
  primary:"#00D4FF", secondary:"#7C3AED", accent:"#F59E0B",
  success:"#10B981", danger:"#EF4444", text:"#E2E8F0", muted:"#64748B",
};
const G = {
  primary:`linear-gradient(135deg,${C.primary},${C.secondary})`,
  gold:`linear-gradient(135deg,${C.accent},#F97316)`,
  success:`linear-gradient(135deg,${C.success},#059669)`,
};
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
button{font-family:inherit;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:${C.surface};}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes pop{0%{transform:scale(.8);opacity:0;}60%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;}}
@keyframes spin{to{transform:rotate(360deg);}}
.fu{animation:fadeUp .35s ease both;}
.pop{animation:pop .4s cubic-bezier(.4,2,.6,1) both;}
`;

// ── Dados mock do estudante ───────────────────────────────
const ESTUDANTE = {
  nome: "Lara Sophia",
  email: "lara.sophia@email.com",
  avatar: "LS",
  nivel: 11,
  xp: 5200,
  xpProximo: 5500,
  streak: 21,
  plano: "plus",
  estilo: "visual",
  objetivo: "federal",
  desde: "Janeiro 2025",
  areas: { lin:88, hum:91, nat:84, mat:76, red:95 },
};

const AREAS = [
  {id:"lin", label:"Linguagens e Códigos",          icon:"📚", color:C.primary},
  {id:"hum", label:"Ciências Humanas",              icon:"🌍", color:C.secondary},
  {id:"nat", label:"Ciências da Natureza",          icon:"⚗️", color:C.success},
  {id:"mat", label:"Matemática e suas Tecnologias", icon:"📐", color:C.accent},
  {id:"red", label:"Redação",                       icon:"✍️", color:C.danger},
];

const ESTILO_LBL = {
  visual:   { icon:"👁️", label:"Visual",    desc:"Mapas, esquemas e infográficos" },
  auditivo: { icon:"🎧", label:"Auditivo",  desc:"Vídeos, podcasts e áudio" },
  leitura:  { icon:"📖", label:"Analítico", desc:"Textos, resumos e anotações" },
  pratico:  { icon:"✏️", label:"Prático",   desc:"Exercícios e questões" },
};

const OBJETIVO_LBL = {
  enem:     "Passar no ENEM",
  federal:  "Universidade Federal",
  bolsa:    "Bolsa ProUni / FIES",
  concurso: "Concurso / Militar",
};

const CONQUISTAS = [
  {id:"c1",  icon:"⭐", label:"Primeiro acerto",      desc:"Respondeu sua primeira questão",     ganho:true,  data:"Jan/2025"},
  {id:"c2",  icon:"🔥", label:"7 dias seguidos",      desc:"Manteve streak por 7 dias",          ganho:true,  data:"Fev/2025"},
  {id:"c3",  icon:"🔥", label:"21 dias seguidos",     desc:"Manteve streak por 21 dias",         ganho:true,  data:"Mai/2025"},
  {id:"c4",  icon:"💎", label:"Simulado perfeito",    desc:"100% de acertos em um simulado",     ganho:true,  data:"Mar/2025"},
  {id:"c5",  icon:"✍️", label:"Redação 900+",         desc:"Nota acima de 900 na redação",       ganho:true,  data:"Abr/2025"},
  {id:"c6",  icon:"⚔️", label:"10 vitórias PvP",      desc:"Ganhou 10 batalhas individuais",     ganho:true,  data:"Abr/2025"},
  {id:"c7",  icon:"🏆", label:"Mestre da área",       desc:"Domínio +90% em qualquer área",      ganho:true,  data:"Mai/2025"},
  {id:"c8",  icon:"🎯", label:"100 questões",         desc:"Respondeu 100 questões com IA",      ganho:false, data:null},
  {id:"c9",  icon:"📚", label:"Todas as áreas",       desc:"Estudou todas as 5 áreas do ENEM",   ganho:false, data:null},
  {id:"c10", icon:"🌟", label:"Nível 15",             desc:"Atingiu o nível 15",                 ganho:false, data:null},
  {id:"c11", icon:"🤝", label:"Modo colaborativo",    desc:"Participou de Batalha Coletiva",     ganho:false, data:null},
  {id:"c12", icon:"🧠", label:"Socrático dedicado",  desc:"30 sessões de IA Socrática",         ganho:false, data:null},
];

const TRILHA = [
  {etapa:1,  area:"lin", tema:"Interpretação de texto",    status:"concluido",    xp:300,  dif:"Médio"},
  {etapa:2,  area:"hum", tema:"Revolução Francesa",        status:"concluido",    xp:250,  dif:"Médio"},
  {etapa:3,  area:"red", tema:"Dissertação argumentativa", status:"concluido",    xp:400,  dif:"Difícil"},
  {etapa:4,  area:"nat", tema:"Fotossíntese e respiração", status:"em_andamento", xp:200,  dif:"Médio"},
  {etapa:5,  area:"mat", tema:"Funções quadráticas",       status:"bloqueado",    xp:300,  dif:"Difícil"},
  {etapa:6,  area:"lin", tema:"Figuras de linguagem",      status:"bloqueado",    xp:200,  dif:"Fácil"},
  {etapa:7,  area:"hum", tema:"Imperialismo",              status:"bloqueado",    xp:250,  dif:"Médio"},
  {etapa:8,  area:"red", tema:"Competência 5 — C5 perfeita",status:"bloqueado",  xp:500,  dif:"Difícil"},
];

const HISTORICO = [
  {tipo:"quiz",     area:"red", desc:"Quiz IA — Redação",           acertos:3, total:3, xp:450, data:"Hoje,   14:32"},
  {tipo:"redacao",  area:"red", desc:"Redação — Redes sociais",     nota:880,         xp:88,  data:"Hoje,   11:15"},
  {tipo:"simulado", area:"mat", desc:"Simulado Adaptativo",         acertos:6, total:8, xp:320, data:"Ontem,  16:40"},
  {tipo:"quiz",     area:"hum", desc:"Quiz IA — Revolução Russa",   acertos:2, total:3, xp:200, data:"Ontem,  09:10"},
  {tipo:"socratica",area:"nat", desc:"IA Socrática — Evolução",     sessao:12,         xp:80,  data:"Seg,    15:20"},
  {tipo:"batalha",  area:"lin", desc:"Batalha PvP — Vitória!",      acertos:5, total:5, xp:750, data:"Dom,    20:45"},
];

// ── Componentes ──────────────────────────────────────────
function Card({ children, style:s, glow }) {
  return <div style={{background:C.card,border:`1px solid ${glow?C.primary:C.border}`,borderRadius:16,padding:16,boxShadow:glow?`0 0 20px ${C.primary}18`:"none",...s}}>{children}</div>;
}
function Pill({ children, color=C.primary }) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:`${color}22`,border:`1px solid ${color}44`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color}}>{children}</span>;
}
function XPBar({ xp, max }) {
  const pct = Math.min((xp / max) * 100, 100);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:4}}>
      <span>{xp.toLocaleString()} XP</span>
      <span>{max.toLocaleString()} XP</span>
    </div>
    <div style={{height:6,background:C.border,borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${pct}%`,background:G.primary,borderRadius:99,transition:"width 1s ease"}}/>
    </div>
  </div>;
}
function SBtn({ children, onClick, color=C.primary }) {
  return <button onClick={onClick} style={{padding:"7px 14px",borderRadius:9,border:"none",background:`${color}22`,cursor:"pointer",fontSize:12,fontWeight:700,color,fontFamily:"inherit",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background=`${color}33`} onMouseLeave={e=>e.currentTarget.style.background=`${color}22`}>{children}</button>;
}
function PBtn({ children, onClick, full }) {
  return <button onClick={onClick} style={{padding:"13px 22px",borderRadius:12,border:"none",background:G.primary,cursor:"pointer",fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif",width:full?"100%":"auto",boxShadow:`0 4px 20px ${C.primary}33`,transition:"transform .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{children}</button>;
}

// ── Módulo principal ──────────────────────────────────────
export default function ModuloEstudante() {
  const [tab, setTab] = useState("perfil");
  const [conquista, setConquista] = useState(null);
  const estilo = ESTILO_LBL[ESTUDANTE.estilo];

  const xpParaNivel = ESTUDANTE.nivel * 500;
  const xpRestante  = xpParaNivel - ESTUDANTE.xp;
  const statusColor = { concluido:"success", em_andamento:"primary", bloqueado:"muted" };
  const statusLabel = { concluido:"✓ Concluído", em_andamento:"▶ Em andamento", bloqueado:"🔒 Bloqueado" };
  const tipoIcon    = { quiz:"⚡", redacao:"✍️", simulado:"📊", socratica:"🏛️", batalha:"⚔️" };

  const TABS = [
    ["perfil",    "👤", "Perfil"],
    ["trilha",    "🗺️", "Trilha"],
    ["conquistas","🏆", "Conquistas"],
    ["historico", "📋", "Histórico"],
    ["plano",     "⭐", "Plano"],
    ["config",    "⚙️", "Config."],
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <style>{css}</style>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:700,margin:"0 auto",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18}}>
            <span style={{color:C.primary}}>Nota</span>
            <span style={{background:G.gold,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {estilo && <span title={`Perfil: ${estilo.label}`} style={{fontSize:16}}>{estilo.icon}</span>}
            <span style={{fontSize:11,color:C.accent,fontWeight:700}}>🔥 {ESTUDANTE.streak}</span>
            <Pill color={C.primary} style={{fontSize:10}}>⚡ {ESTUDANTE.xp.toLocaleString()} XP</Pill>
          </div>
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"0 0 80px"}}>

        {/* Sub-nav */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto",whiteSpace:"nowrap",padding:"0 16px"}}>
          <div style={{display:"inline-flex",gap:2,padding:"6px 0"}}>
            {TABS.map(([id,icon,lbl])=>(
              <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 12px",borderRadius:8,border:tab===id?`1px solid ${C.primary}44`:"1px solid transparent",cursor:"pointer",background:tab===id?`${C.primary}18`:"transparent",color:tab===id?C.primary:C.muted,fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap",transition:"all .2s"}}>
                {icon} {lbl}
              </button>
            ))}
          </div>
        </div>

        <div style={{padding:"22px 20px"}} className="fu">

          {/* ── PERFIL ── */}
          {tab==="perfil" && (
            <div>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{width:72,height:72,borderRadius:"50%",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",margin:"0 auto 12px",boxShadow:`0 0 24px ${C.primary}44`}}>
                  {ESTUDANTE.avatar}
                </div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:4}}>{ESTUDANTE.nome}</div>
                <div style={{fontSize:13,color:C.muted,marginBottom:12}}>{ESTUDANTE.email}</div>
                <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
                  <Pill color={C.primary}>⚡ Nível {ESTUDANTE.nivel}</Pill>
                  <Pill color={C.accent}>🔥 {ESTUDANTE.streak} dias</Pill>
                  <Pill color={C.success}>📅 Desde {ESTUDANTE.desde}</Pill>
                  {ESTUDANTE.plano==="plus" && <Pill color={C.secondary}>⭐ Plus</Pill>}
                </div>
              </div>

              <Card glow style={{marginBottom:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:C.muted,marginBottom:12,letterSpacing:.5}}>PROGRESSO — NÍVEL {ESTUDANTE.nivel}</div>
                <XPBar xp={ESTUDANTE.xp} max={xpParaNivel}/>
                <div style={{fontSize:11,color:C.muted,marginTop:8,textAlign:"center"}}>
                  Faltam <strong style={{color:C.primary}}>{xpRestante.toLocaleString()} XP</strong> para o Nível {ESTUDANTE.nivel+1}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
                  {[["47","Questões",C.primary],["3","Redações",C.secondary],["78%","Acertos",C.success]].map(([v,l,c])=>(
                    <div key={l} style={{background:C.surface,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{marginBottom:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:C.muted,marginBottom:12,letterSpacing:.5}}>PERFIL COGNITIVO</div>
                {[
                  ["🧠","Estilo de aprendizagem",`${estilo?.icon} ${estilo?.label} — ${estilo?.desc}`],
                  ["🎯","Objetivo",OBJETIVO_LBL[ESTUDANTE.objetivo]||"—"],
                  ["📌","Áreas em foco","Matemática, Ciências da Natureza"],
                ].map(([icon,lbl,val])=>(
                  <div key={lbl} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{icon}</span>
                    <div>
                      <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{lbl}</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{val}</div>
                    </div>
                  </div>
                ))}
              </Card>

              <Card style={{marginBottom:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:C.muted,marginBottom:12,letterSpacing:.5}}>DESEMPENHO POR ÁREA</div>
                {AREAS.map(area=>{
                  const v=ESTUDANTE.areas[area.id];
                  const c=v>=80?C.success:v>=60?C.primary:v>=40?C.accent:C.danger;
                  return <div key={area.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:C.text}}>{area.icon} {area.label}</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:c}}>{v}%</span>
                    </div>
                    <div style={{height:4,background:C.border,borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${v}%`,background:c,borderRadius:99,transition:"width .8s"}}/>
                    </div>
                  </div>;
                })}
              </Card>

              <SBtn onClick={()=>setTab("config")} color={C.muted}>⚙️ Editar perfil →</SBtn>
            </div>
          )}

          {/* ── TRILHA ── */}
          {tab==="trilha" && (
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>Minha Trilha</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Personalizada pela IA com base no seu perfil cognitivo</div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                {[["concluido",3,C.success],["em_andamento",1,C.primary],["bloqueado",4,C.muted]].map(([st,n,c])=>(
                  <div key={st} style={{background:`${c}18`,border:`1px solid ${c}33`,borderRadius:10,padding:"6px 12px",display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,color:c}}>{n}</span>
                    <span style={{fontSize:11,color:C.muted}}>{statusLabel[st]}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {TRILHA.map(item=>{
                  const area=AREAS.find(a=>a.id===item.area);
                  const sCor=statusColor[item.status];
                  const sC=C[sCor]||C.muted;
                  const ativo=item.status!=="bloqueado";
                  return (
                    <div key={item.etapa} style={{background:ativo?C.card:`${C.surface}88`,border:`1px solid ${item.status==="em_andamento"?C.primary:C.border}`,borderRadius:14,padding:"13px 16px",opacity:item.status==="bloqueado"?.55:1,boxShadow:item.status==="em_andamento"?`0 0 16px ${C.primary}18`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:36,height:36,borderRadius:10,background:`${area?.color||C.muted}22`,border:`1px solid ${area?.color||C.muted}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                          {item.status==="bloqueado"?"🔒":area?.icon}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontFamily:"'Syne',sans-serif",fontSize:9,color:C.muted}}>ETAPA {item.etapa}</span>
                            <span style={{fontSize:9,fontWeight:700,color:sC,background:`${sC}18`,padding:"1px 6px",borderRadius:99}}>{statusLabel[item.status]}</span>
                            <span style={{fontSize:9,color:C.muted}}>{item.dif}</span>
                          </div>
                          <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:ativo?C.text:C.muted}}>{item.tema}</div>
                          <div style={{fontSize:11,color:C.muted}}>{area?.label}</div>
                        </div>
                        <Pill color={C.accent} style={{fontSize:10,flexShrink:0}}>+{item.xp} XP</Pill>
                      </div>
                      {item.status==="em_andamento" && (
                        <div style={{marginTop:10}}>
                          <div style={{height:3,background:C.border,borderRadius:99,overflow:"hidden"}}>
                            <div style={{height:"100%",width:"35%",background:G.primary,borderRadius:99}}/>
                          </div>
                          <div style={{fontSize:10,color:C.muted,marginTop:4}}>35% concluído</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CONQUISTAS ── */}
          {tab==="conquistas" && (
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>Conquistas</div>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <Pill color={C.success}>{CONQUISTAS.filter(c=>c.ganho).length} obtidas</Pill>
                <Pill color={C.muted}>{CONQUISTAS.filter(c=>!c.ganho).length} em aberto</Pill>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                {CONQUISTAS.filter(c=>c.ganho).map(c=>(
                  <div key={c.id} onClick={()=>setConquista(c)} style={{background:`${C.primary}10`,border:`1px solid ${C.primary}33`,borderRadius:14,padding:"14px 10px",textAlign:"center",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.boxShadow=`0 0 16px ${C.primary}22`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=`${C.primary}33`;e.currentTarget.style.boxShadow="none";}}>
                    <div style={{fontSize:28,marginBottom:6}} className="pop">{c.icon}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.primary,lineHeight:1.3}}>{c.label}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:4}}>{c.data}</div>
                  </div>
                ))}
              </div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:C.muted,marginBottom:10,letterSpacing:.5}}>EM ABERTO</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {CONQUISTAS.filter(c=>!c.ganho).map(c=>(
                  <div key={c.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center",opacity:.45}}>
                    <div style={{fontSize:28,marginBottom:6}}>{c.icon}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.muted,lineHeight:1.3}}>{c.label}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:4}}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HISTÓRICO ── */}
          {tab==="historico" && (
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>Histórico de Estudos</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Últimas sessões · XP total: <strong style={{color:C.accent}}>{HISTORICO.reduce((s,h)=>s+h.xp,0)} XP</strong></div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {HISTORICO.map((h,i)=>{
                  const area=AREAS.find(a=>a.id===h.area);
                  return (
                    <Card key={i} style={{padding:"12px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:40,height:40,borderRadius:11,background:`${area?.color||C.muted}22`,border:`1px solid ${area?.color||C.muted}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                          {tipoIcon[h.tipo]}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{h.desc}</div>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{fontSize:10,color:area?.color||C.muted,fontWeight:600}}>{area?.label}</span>
                            {h.acertos!=null && <span style={{fontSize:10,color:C.muted}}>· {h.acertos}/{h.total} acertos</span>}
                            {h.nota!=null && <span style={{fontSize:10,color:C.muted}}>· Nota {h.nota}</span>}
                            {h.sessao!=null && <span style={{fontSize:10,color:C.muted}}>· {h.sessao} trocas</span>}
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <Pill color={C.accent} style={{fontSize:10,marginBottom:4}}>+{h.xp} XP</Pill>
                          <div style={{fontSize:10,color:C.muted}}>{h.data}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PLANO ── */}
          {tab==="plano" && (
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:16}}>Meu Plano</div>
              <Card style={{background:`${C.primary}0A`,border:`1px solid ${C.primary}33`,marginBottom:16,padding:"20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:C.primary}}>Plus</div>
                    <div style={{fontSize:13,color:C.muted}}>R$ 39/mês · Próxima cobrança: 17/Jun/2025</div>
                  </div>
                  <Pill color={C.success}>✓ Ativo</Pill>
                </div>
                {["Questões ilimitadas com IA","Trilhas adaptativas","Redações ilimitadas + feedback","Simulado Adaptativo","Modo Batalha PvP","IA Socrática","Relatório familiar automático"].map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
                    <span style={{color:C.primary,fontWeight:800,flexShrink:0}}>✓</span>
                    <span style={{fontSize:13,color:C.text}}>{item}</span>
                  </div>
                ))}
              </Card>
              <div style={{display:"flex",gap:8}}>
                <SBtn color={C.primary} onClick={()=>{}}>📥 Baixar fatura</SBtn>
                <SBtn color={C.muted} onClick={()=>{}}>Histórico de pagamentos</SBtn>
                <SBtn color={C.danger} onClick={()=>{}}>Cancelar plano</SBtn>
              </div>
            </div>
          )}

          {/* ── CONFIGURAÇÕES ── */}
          {tab==="config" && (
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:16}}>Configurações</div>
              {[
                {titulo:"Dados pessoais",          desc:"Nome, e-mail, senha",                 icon:"👤"},
                {titulo:"Perfil cognitivo",         desc:"Reajustar estilo e objetivo",          icon:"🧠"},
                {titulo:"Notificações",             desc:"E-mail, push e resumo semanal",        icon:"🔔"},
                {titulo:"Relatório familiar",       desc:"Configurar envio para responsáveis",   icon:"👨‍👩‍👧"},
                {titulo:"Privacidade",              desc:"Dados, LGPD e exclusão de conta",      icon:"🛡️"},
                {titulo:"Acessibilidade",           desc:"Tamanho de fonte, contraste, TTS",     icon:"♿"},
              ].map(item=>(
                <Card key={item.titulo} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",marginBottom:10}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:22}}>{item.icon}</span>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{item.titulo}</div>
                      <div style={{fontSize:11,color:C.muted}}>{item.desc}</div>
                    </div>
                  </div>
                  <SBtn onClick={()=>{}} color={C.primary}>Editar →</SBtn>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modal conquista */}
      {conquista && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setConquista(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.primary}`,borderRadius:20,padding:28,maxWidth:340,width:"100%",textAlign:"center",boxShadow:`0 0 40px ${C.primary}33`}} className="pop">
            <div style={{fontSize:64,marginBottom:12}}>{conquista.icon}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:C.primary,marginBottom:6}}>{conquista.label}</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.5}}>{conquista.desc}</div>
            <Pill color={C.accent} style={{marginBottom:20}}>📅 Obtida em {conquista.data}</Pill><br/>
            <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center"}}>
              <SBtn onClick={()=>setConquista(null)}>Fechar</SBtn>
              <SBtn color={C.primary} onClick={()=>{}}>📤 Compartilhar</SBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

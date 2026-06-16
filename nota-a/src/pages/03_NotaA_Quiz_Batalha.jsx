import { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar.jsx";
import { callAI } from "../lib/aiClient.js";

const C = {
  bg:"#03050E", surface:"#070B18", card:"#0A0F20", border:"#131D35",
  cyan:"#00F0FF", violet:"#8B5CF6", amber:"#FFAB00",
  green:"#00E5A0", red:"#FF3366", text:"#E8EEFF", muted:"#3D4F70",
};
const G = {
  primary:`linear-gradient(135deg,${C.cyan},${C.violet})`,
  battle:`linear-gradient(135deg,${C.red},#FF6B00)`,
};
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
button,input,textarea{font-family:inherit;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes bpulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
.fu{animation:fadeUp .35s ease both;}
`;

const AREAS = [
  {id:"lin",label:"Linguagens e Códigos",icon:"📚",color:C.cyan},
  {id:"hum",label:"Ciências Humanas",icon:"🌍",color:C.violet},
  {id:"nat",label:"Ciências da Natureza",icon:"⚗️",color:C.green},
  {id:"mat",label:"Matemática",icon:"📐",color:C.amber},
  {id:"red",label:"Redação",icon:"✍️",color:"#F000B8"},
];
const SAMPLES = {
  lin:{enunciado:"Sobre o conceito de língua em Saussure:",alternativas:["A) Expressão espontânea","B) Convenção social","C) Produção de sons","D) Comunicação escrita","E) Ausência de regras"],correta:1,explicacao:"Língua é fato social — convenção coletiva que organiza a comunicação.",xp:150,dificuldade:"Média"},
  mat:{enunciado:"240 peças em 8h. Para 450 peças:",alternativas:["A) 12h","B) 13h","C) 15h","D) 16h","E) 18h"],correta:2,explicacao:"Regra de três: x = (450×8)/240 = 15h.",xp:100,dificuldade:"Fácil"},
  nat:{enunciado:"Principal consequência do aumento de CO₂ na atmosfera:",alternativas:["A) Redução do ozônio","B) Aumento da temperatura","C) Menos chuva ácida","D) Mais UV","E) Menos vento"],correta:1,explicacao:"Gases de efeito estufa retêm calor, elevando a temperatura global.",xp:100,dificuldade:"Fácil"},
  hum:{enunciado:"Principal consequência social da Revolução Industrial:",alternativas:["A) Fim da agricultura","B) Formação do proletariado","C) Fim das desigualdades","D) Jornada de 8h","E) Nobreza fortalecida"],correta:1,explicacao:"Criou o proletariado em condições precárias de trabalho.",xp:150,dificuldade:"Média"},
  red:{enunciado:"A Competência 5 do ENEM exige na proposta de intervenção:",alternativas:["A) Tema, tese, argumento, contra-arg, conclusão","B) Agente, ação, meio, finalidade, detalhamento","C) Intro, desenv., exemplos, dados, conclusão","D) Problema, causa, efeito, solução, resultado","E) Contexto, diagnóstico, proposta, impacto, avaliação"],correta:1,explicacao:"C5 exige: AGENTE + AÇÃO + MEIO + FINALIDADE + DETALHAMENTO — vale 200 pontos!",xp:150,dificuldade:"Média"},
};
const BQ = [
  {q:"Resultado de 2+2×3:",ops:["8","7","10","6","14"],ans:2,area:"mat"},
  {q:"'Dom Casmurro' foi escrito por:",ops:["José de Alencar","Machado de Assis","Eça de Queirós","Lima Barreto","Clarice Lispector"],ans:1,area:"lin"},
  {q:"pH de solução ácida:",ops:["maior que 7","igual a 7","menor que 7","igual a 14","maior que 14"],ans:2,area:"nat"},
  {q:"Revolução Francesa ocorreu em:",ops:["1776","1789","1799","1815","1848"],ans:1,area:"hum"},
  {q:"Área do círculo:",ops:["2πr","πr²","πd","2πr²","πr"],ans:1,area:"mat"},
];

function Pill({children,color=C.cyan}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:`${color}18`,border:`1px solid ${color}44`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color}}>{children}</span>;
}
function Spin({size=28}){
  return <div style={{width:size,height:size,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:C.cyan,animation:"spin .8s linear infinite",flexShrink:0}}/>;
}
function AltBtn({alt,idx,correta,selecionada,revealed,onClick}){
  let bg=C.card,border=C.border,color=C.text;
  if(revealed){if(idx===correta){bg=`${C.green}18`;border=C.green;color=C.green;}else if(idx===selecionada){bg=`${C.red}18`;border=C.red;color=C.red;}}
  return <button onClick={onClick} disabled={revealed} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:11,padding:"12px 14px",textAlign:"left",cursor:revealed?"default":"pointer",fontSize:13,color,transition:"all .22s",display:"flex",alignItems:"center",gap:10,width:"100%"}}>
    <span style={{width:22,height:22,borderRadius:"50%",background:revealed&&idx===correta?C.green:revealed&&idx===selecionada?C.red:C.surface,border:`1px solid ${border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,color:revealed?"#fff":C.muted,fontFamily:"'Syne',sans-serif"}}>
      {revealed&&idx===correta?"✓":revealed&&idx===selecionada?"✗":String.fromCharCode(65+idx)}
    </span>
    {alt}
  </button>;
}

// ── QUIZ ─────────────────────────────────────────────
function QuizModule() {
  const [area, setArea] = useState(null);
  const [tema, setTema] = useState("");
  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const [rev, setRev] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);

  const gerar = async () => {
    if (!tema.trim()) return;
    setLoading(true); setQ(null); setRev(false); setSel(null);
    try {
      const d = await callAI({
        messages: [{ role: "user", content: `Questão ENEM sobre "${tema}" em "${area.label}". APENAS JSON:\n{"enunciado":"...","alternativas":["A) ...","B) ...","C) ...","D) ...","E) ..."],"correta":0,"explicacao":"...","dificuldade":"Fácil|Média|Difícil"}` }],
        modulo: 'quiz',
      });
      const p = JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim());
      setQ({...p, xp:p.dificuldade==="Difícil"?200:p.dificuldade==="Média"?150:100, id:Date.now()});
    } catch {
      setQ({...SAMPLES[area.id]||SAMPLES.mat, id:Date.now()});
    }
    setLoading(false);
  };

  const resp = (i) => {
    if (rev || !q) return;
    setSel(i); setRev(true);
    const ok = i === q.correta;
    const xp = ok ? q.xp : Math.floor(q.xp * .2);
    setXpTotal(t => t + xp);
  };

  if (!area) return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>⚡ Quiz com IA</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Escolha uma área — questão exclusiva gerada por IA</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {AREAS.map(a => (
          <button key={a.id} onClick={()=>setArea(a)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:"13px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all .2s",textAlign:"left"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.background=`${a.color}0F`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
            <div style={{width:40,height:40,borderRadius:11,background:`${a.color}20`,border:`1px solid ${a.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{a.icon}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700}}>{a.label}</div><div style={{fontSize:11,color:C.muted}}>IA cria questão exclusiva</div></div>
            <Pill color={a.color} style={{fontSize:10}}>+XP</Pill>
          </button>
        ))}
      </div>
      {xpTotal > 0 && <div style={{marginTop:16,textAlign:"center"}}><Pill color={C.amber}>⚡ Total desta sessão: {xpTotal} XP</Pill></div>}
    </div>
  );

  return (
    <div>
      <button onClick={()=>{setArea(null);setQ(null);setTema("");}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:4}}>← Áreas</button>
      <Pill color={area.color} style={{marginBottom:14}}>{area.icon} {area.label}</Pill>
      {!q ? (
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,marginBottom:5}}>Gerar Questão Personalizada</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Digite um tema e a IA cria uma questão estilo ENEM exclusiva.</div>
          <textarea value={tema} onChange={e=>setTema(e.target.value)} rows={2}
            placeholder={`Tema (ex: ${area.id==="mat"?"funções quadráticas":area.id==="nat"?"fotossíntese":area.id==="hum"?"Revolução Francesa":"figuras de linguagem"})...`}
            style={{width:"100%",padding:"12px 14px",background:C.card,border:`1.5px solid ${tema?C.cyan:C.border}`,borderRadius:11,color:C.text,fontSize:14,outline:"none",resize:"none",marginBottom:10,boxSizing:"border-box",transition:"border-color .2s"}}
            onFocus={e=>e.target.style.borderColor=C.cyan} onBlur={e=>e.target.style.borderColor=tema?C.cyan:C.border}
          />
          <button onClick={gerar} disabled={loading||!tema.trim()} style={{width:"100%",padding:"14px",borderRadius:12,background:loading||!tema.trim()?C.border:G.primary,cursor:loading||!tema.trim()?"not-allowed":"pointer",fontSize:14,fontWeight:700,color:loading||!tema.trim()?C.muted:"#fff",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading ? <><Spin size={16}/>Gerando questão...</> : "✨ Gerar com IA"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px",marginBottom:10,fontSize:13,lineHeight:1.75}}>{q.enunciado}</div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <Pill color={C.muted} style={{fontSize:10}}>{q.dificuldade}</Pill>
            <Pill color={C.amber} style={{fontSize:10}}>+{q.xp} XP</Pill>
            <Pill color={C.cyan} style={{fontSize:10}}>🤖 IA</Pill>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:10}}>
            {q.alternativas.map((alt,i) => <AltBtn key={i} alt={alt.substring(3)} idx={i} correta={q.correta} selecionada={sel} revealed={rev} onClick={()=>resp(i)}/>)}
          </div>
          {rev && (
            <>
              <div style={{background:`${C.cyan}0D`,border:`1px solid ${C.cyan}33`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.cyan,marginBottom:5}}>💡 EXPLICAÇÃO</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{q.explicacao}</div>
              </div>
              <div style={{textAlign:"center",marginBottom:10}}><Pill color={sel===q.correta?C.green:C.red}>{sel===q.correta?`✅ Correto! +${q.xp} XP`:`❌ Errou. +${Math.floor(q.xp*.2)} XP`}</Pill></div>
              <button onClick={()=>{setQ(null);setTema("");}} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:G.primary,cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>✨ Nova Questão</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── BATALHA PvP ──────────────────────────────────────
function BatalhaModule() {
  const [fase, setFase] = useState("lobby");
  const [idx, setIdx] = useState(0);
  const [timer, setTimer] = useState(10);
  const [sel, setSel] = useState(null);
  const [rev, setRev] = useState(false);
  const [scores, setScores] = useState({p:0,o:0});
  const [hist, setHist] = useState([]);
  const [cd, setCd] = useState(3);
  const tRef = useRef(null);
  const q = BQ[idx];
  const OPO = {nome:"Ana Beatriz",av:"AB",nivel:11};

  useEffect(()=>{
    if(fase!=="countdown") return;
    const t=setInterval(()=>setCd(c=>{if(c<=1){clearInterval(t);setFase("battle");return 3;}return c-1;}),1000);
    return()=>clearInterval(t);
  },[fase]);

  useEffect(()=>{
    if(fase!=="battle"||rev) return;
    setTimer(10);
    tRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(tRef.current);doReveal(false);return 0;}return t-1;}),1000);
    return()=>clearInterval(tRef.current);
  },[fase,idx,rev]);

  const doReveal = (ok) => {
    setRev(true);
    const opOk = Math.random() > .45;
    setScores(s=>({p:ok?s.p+1:s.p,o:opOk?s.o+1:s.o}));
    setHist(h=>[...h,{ok,opOk}]);
    setTimeout(()=>{if(idx+1>=BQ.length)setFase("resultado");else{setIdx(i=>i+1);setSel(null);setRev(false);}},1500);
  };

  const resp = (i) => {
    if(rev) return;
    setSel(i); clearInterval(tRef.current);
    doReveal(i===q.ans);
  };

  const reset = () => {setFase("lobby");setIdx(0);setSel(null);setRev(false);setScores({p:0,o:0});setHist([]);setCd(3);setTimer(10);};
  const aObj = AREAS.find(a=>a.id===q?.area)||AREAS[0];

  if(fase==="lobby") return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>⚔️ Modo Batalha</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Duela em tempo real — quem acerta mais rápido ganha XP duplo</div>
      <div style={{background:G.battle,borderRadius:14,padding:"18px 16px",marginBottom:14,textAlign:"center",border:"none"}}>
        <div style={{fontSize:36,marginBottom:6}}>🏆</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:900,color:"#fff",marginBottom:3}}>Duelo Ranqueado</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>5 questões · 10s cada · XP duplo ao vencer</div>
      </div>
      <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>OPONENTE ENCONTRADO</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{OPO.av}</div>
          <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700}}>{OPO.nome}</div><div style={{fontSize:11,color:C.muted}}>Nível {OPO.nivel} · 🔥 21 dias</div></div>
        </div>
      </div>
      <button onClick={()=>setFase("countdown")} style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:G.battle,cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>⚔️ Iniciar Batalha!</button>
    </div>
  );

  if(fase==="countdown") return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:96,fontWeight:900,color:C.red,lineHeight:1,animation:"bpulse 1s infinite"}}>{cd}</div>
      <div style={{fontSize:16,color:C.muted,marginTop:8,fontFamily:"'Syne',sans-serif"}}>Prepara!</div>
    </div>
  );

  if(fase==="resultado") return (
    <div className="fu">
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:52,marginBottom:6}}>{scores.p>scores.o?"🏆":scores.p===scores.o?"🤝":"💪"}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:scores.p>scores.o?C.green:scores.p===scores.o?C.amber:C.red}}>
          {scores.p>scores.o?"Você venceu!":scores.p===scores.o?"Empate!":"Você perdeu!"}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px",marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:10,marginBottom:scores.p>scores.o?12:0}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:900,color:C.cyan,lineHeight:1}}>{scores.p}</div><div style={{fontSize:10,color:C.muted}}>Você</div></div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,color:C.muted,fontWeight:700}}>VS</div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:900,color:C.red,lineHeight:1}}>{scores.o}</div><div style={{fontSize:10,color:C.muted}}>{OPO.nome}</div></div>
        </div>
        {scores.p>scores.o&&<div style={{textAlign:"center",padding:"8px",background:`${C.green}15`,borderRadius:8}}><Pill color={C.green}>🏆 +{scores.p*100} XP (bônus duplo!)</Pill></div>}
      </div>
      <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>RESULTADO POR QUESTÃO</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {hist.map((h,i)=><div key={i} style={{flex:"0 0 calc(50% - 3px)",background:C.surface,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:C.text}}>Q{i+1}</div><div style={{display:"flex",gap:8}}><span style={{fontSize:13,color:h.ok?C.green:C.red}}>{h.ok?"✓":"✗"}</span><span style={{fontSize:10,color:C.muted}}>vs</span><span style={{fontSize:13,color:h.opOk?C.red:C.green}}>{h.opOk?"✓":"✗"}</span></div></div>)}
        </div>
      </div>
      <button onClick={reset} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:G.battle,cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>⚔️ Nova Batalha</button>
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{background:C.card,border:`1px solid ${C.cyan}55`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontFamily:"'Syne',sans-serif"}}>VOCÊ</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:900,color:C.cyan}}>{scores.p}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:900,color:C.red}}>VS</div><div style={{fontSize:10,color:C.muted}}>{idx+1}/{BQ.length}</div></div>
        <div style={{background:C.card,border:`1px solid ${C.red}55`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,fontFamily:"'Syne',sans-serif"}}>ANA B.</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:900,color:C.red}}>{scores.o}</div></div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:4}}><span>Tempo</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:timer<=3?C.red:C.green}}>{timer}s</span></div>
        <div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(timer/10)*100}%`,background:timer<=3?C.red:G.battle,borderRadius:99,transition:"width 1s linear,background .5s"}}/></div>
      </div>
      <Pill color={aObj.color} style={{marginBottom:10,fontSize:10}}>{aObj.icon} {aObj.label}</Pill>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"13px",marginBottom:10,fontSize:13,lineHeight:1.75}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {q.ops.map((op,i)=><AltBtn key={i} alt={op} idx={i} correta={q.ans} selecionada={sel} revealed={rev} onClick={()=>resp(i)}/>)}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────
export default function QuizBatalha() {
  const [modo, setModo] = useState("quiz");

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:480,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17}}>
              <span style={{color:C.cyan}}>Nota</span>
              <span style={{background:`linear-gradient(135deg,${C.amber},#F97316)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
            </div>
            <div style={{display:"flex",gap:4,background:C.card,padding:3,borderRadius:8,border:`1px solid ${C.border}`}}>
              {[["quiz","⚡ Quiz IA"],["batalha","⚔️ Batalha"]].map(([id,lbl])=>(
                <button key={id} onClick={()=>setModo(id)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",background:modo===id?`${id==="quiz"?C.cyan:C.red}20`:"transparent",color:modo===id?id==="quiz"?C.cyan:C.red:C.muted,fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif",transition:"all .2s"}}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{maxWidth:480,margin:"0 auto",padding:"20px 20px 80px"}} className="fu">
          {modo==="quiz" ? <QuizModule/> : <BatalhaModule/>}
        </div>
        <NavBar active="praticar" />
      </div>
    </>
  );
}

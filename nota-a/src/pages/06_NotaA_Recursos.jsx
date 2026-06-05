import { useState } from "react";

const C={bg:"#03050E",surface:"#070B18",card:"#0A0F20",border:"#131D35",cyan:"#00F0FF",violet:"#8B5CF6",pink:"#F000B8",amber:"#FFAB00",green:"#00E5A0",red:"#FF3366",blue:"#3B82F6",text:"#E8EEFF",muted:"#3D4F70"};
const G={primary:`linear-gradient(135deg,${C.cyan},${C.violet})`,accent:`linear-gradient(135deg,${C.violet},${C.pink})`,full:`linear-gradient(135deg,${C.cyan} 0%,${C.violet} 50%,${C.pink} 100%)`};
const css=`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
button,input,textarea{font-family:inherit;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.fu{animation:fadeUp .35s ease both;}
`;

const AREA_LBL={lin:"Linguagens e Códigos",hum:"Ciências Humanas",nat:"Ciências da Natureza",mat:"Matemática e suas Tecnologias",red:"Redação"};
const AREA_COR={lin:C.cyan,hum:C.violet,nat:C.green,mat:C.amber,red:C.pink};
const AREA_ICO={lin:"📚",hum:"🌍",nat:"⚗️",mat:"📐",red:"✍️"};
const CERTS=[{id:"c1",titulo:"Mestre em Linguagens",area:"lin",nivel:"Avançado",data:"Mar 2025",pts:850,hash:"NA-LIN-2025-001",ok:true},{id:"c2",titulo:"Competência 5 — Redação",area:"red",nivel:"Expert",data:"Abr 2025",pts:960,hash:"NA-RED-2025-042",ok:true},{id:"c3",titulo:"Matemática Aplicada",area:"mat",nivel:"Intermediário",data:"—",pts:0,hash:"—",ok:false},{id:"c4",titulo:"Mestre em Humanas",area:"hum",nivel:"Avançado",data:"—",pts:0,hash:"—",ok:false}];
const CONCEITOS={mat:[{id:"func",label:"Funções",dom:85,pre:[]},{id:"geom",label:"Geometria",dom:72,pre:["func"]},{id:"prob",label:"Probabilidade",dom:45,pre:["func"]},{id:"trig",label:"Trigonometria",dom:30,pre:["geom"]},{id:"stat",label:"Estatística",dom:60,pre:["prob"]}],lin:[{id:"gram",label:"Gramática",dom:80,pre:[]},{id:"text",label:"Interpretação",dom:75,pre:["gram"]},{id:"lit",label:"Literatura",dom:55,pre:["text"]},{id:"arg",label:"Argumentação",dom:65,pre:["gram","text"]}]};
const NODEPOS={mat:{func:{x:150,y:70},geom:{x:70,y:170},prob:{x:230,y:170},trig:{x:100,y:270},stat:{x:240,y:270}},lin:{gram:{x:150,y:70},text:{x:150,y:170},lit:{x:70,y:270},arg:{x:230,y:270}}};
const API_EPS=[{m:"GET",path:"/v1/questions",desc:"Listar questões por área",cor:C.green},{m:"POST",path:"/v1/questions",desc:"Criar questão personalizada",cor:C.blue},{m:"GET",path:"/v1/students/:id/report",desc:"Relatório do aluno",cor:C.green},{m:"POST",path:"/v1/trails",desc:"Criar trilha de aprendizagem",cor:C.blue},{m:"GET",path:"/v1/analytics/class",desc:"Analytics da turma",cor:C.green},{m:"POST",path:"/v1/certificates/issue",desc:"Emitir certificado",cor:C.amber}];

function Pill({children,color=C.cyan}){return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:`${color}18`,border:`1px solid ${color}44`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color}}>{children}</span>;}
function Spin(){return <div style={{width:18,height:18,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:C.cyan,animation:"spin .8s linear infinite",flexShrink:0}}/>;}

// ═══════════════════════════════════════════
// PREVISÃO DE NOTA
// ═══════════════════════════════════════════
function Previsao(){
  const[loading,setLoading]=useState(false);const[res,setRes]=useState(null);const[horas,setHoras]=useState({lin:1,hum:1,nat:1,mat:2,red:1});
  const notas={lin:620,hum:580,nat:510,mat:480,red:640};
  const calcular=async()=>{setLoading(true);try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`Especialista ENEM. Notas atuais: lin:${notas.lin},hum:${notas.hum},nat:${notas.nat},mat:${notas.mat},red:${notas.red}. Horas extras/sem: lin:${horas.lin},hum:${horas.hum},nat:${horas.nat},mat:${horas.mat},red:${horas.red}. Meta:700. JSON:{"projecoes":{"lin":0,"hum":0,"nat":0,"mat":0,"red":0},"mediaAtual":0,"mediaProjetada":0,"probabilidadeMeta":0,"estrategia":"...","areaFoco":"...","prazo":"..."}`}]})});const d=await r.json();setRes(JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim()));}catch{setRes({projecoes:{lin:680,hum:650,nat:590,mat:560,red:700},mediaAtual:566,mediaProjetada:636,probabilidadeMeta:72,estrategia:"Foque em Matemática e Natureza nas próximas 4 semanas. Mantenha a redação acima de 700.",areaFoco:"Matemática",prazo:"8 semanas"});}setLoading(false);};
  return(
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🎯 Previsão de Nota</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:14}}>IA projeta sua nota com base no ritmo de estudo</div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>NOTAS ATUAIS</div>
        {Object.entries(notas).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{fontSize:10,color:C.text,width:72}}>{AREA_LBL[k]}</div><div style={{flex:1,height:4,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(v/1000)*100}%`,background:AREA_COR[k],borderRadius:99}}/></div><div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:AREA_COR[k],width:30,textAlign:"right"}}>{v}</div></div>)}
      </div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>HORAS EXTRAS/SEMANA</div>
        {Object.entries(horas).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{fontSize:10,color:C.text,width:72}}>{AREA_LBL[k]}</div><input type="range" min={0} max={10} value={v} onChange={e=>setHoras(h=>({...h,[k]:+e.target.value}))} style={{flex:1,accentColor:AREA_COR[k]}}/><div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:AREA_COR[k],width:22,textAlign:"right"}}>{v}h</div></div>)}
      </div>
      <button onClick={calcular} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:12,background:loading?C.border:G.primary,cursor:loading?"not-allowed":"pointer",fontSize:14,fontWeight:700,color:loading?C.muted:"#fff",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {loading?<><Spin/>Calculando...</>:"🔮 Gerar Previsão com IA"}
      </button>
      {res&&<div className="fu" style={{marginTop:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"13px 10px",textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,color:C.muted,marginBottom:3}}>MÉDIA ATUAL</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:900,color:C.red}}>{res.mediaAtual}</div></div>
          <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.cyan}44`,boxShadow:`0 0 20px ${C.cyan}22`,padding:"13px 10px",textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,color:C.muted,marginBottom:3}}>PROJEÇÃO</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:900,color:C.green}}>{res.mediaProjetada}</div></div>
        </div>
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"14px",marginBottom:10,textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Probabilidade de atingir 700 pontos</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:46,fontWeight:900,background:res.probabilidadeMeta>=70?G.primary:G.accent,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{res.probabilidadeMeta}%</div>
          <div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden",margin:"8px 0"}}><div style={{height:"100%",width:`${res.probabilidadeMeta}%`,background:res.probabilidadeMeta>=70?G.primary:G.accent,borderRadius:99,transition:"width 1s"}}/></div>
          <Pill color={C.cyan} style={{fontSize:10}}>📅 {res.prazo}</Pill>
        </div>
        <div style={{background:`${C.violet}0D`,border:`1px solid ${C.violet}33`,borderRadius:12,padding:"12px 13px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.violet,marginBottom:4}}>🧠 ESTRATÉGIA DA IA</div><div style={{fontSize:12,color:C.text,lineHeight:1.5,marginBottom:8}}>{res.estrategia}</div><Pill color={C.red} style={{fontSize:10}}>🎯 Foco: {res.areaFoco}</Pill></div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAPA DE CONHECIMENTO
// ═══════════════════════════════════════════
function Mapa(){
  const[areaId,setAreaId]=useState("mat");const[sel,setSel]=useState(null);
  const conceitos=CONCEITOS[areaId]||CONCEITOS.mat;const pos=NODEPOS[areaId]||NODEPOS.mat;
  return(
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🗺️ Mapa de Conhecimento</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:12}}>Visualize lacunas e pré-requisitos no grafo</div>
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:3}}>
        {["mat","lin"].map(id=><button key={id} onClick={()=>{setAreaId(id);setSel(null);}} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${areaId===id?AREA_COR[id]:C.border}`,background:areaId===id?`${AREA_COR[id]}18`:"transparent",color:areaId===id?AREA_COR[id]:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif"}}>{AREA_ICO[id]} {AREA_LBL[id]}</button>)}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {[[C.green,"✅ >70%"],[C.amber,"⚠️ 40-70%"],[C.red,"❌ <40%"]].map(([c,l])=><Pill key={l} color={c} style={{fontSize:9}}>{l}</Pill>)}
      </div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:10}}>
        <svg width="100%" viewBox="0 0 300 320" style={{display:"block"}}>
          <rect width="300" height="320" fill={C.card}/>
          {conceitos.map(c=>c.pre.map(pId=>{const f=pos[pId],t=pos[c.id];if(!f||!t)return null;return <line key={`${pId}-${c.id}`} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={C.border} strokeWidth="1.5" strokeDasharray="4,4"/>;})).flat()}
          {conceitos.map(c=>{const p=pos[c.id];if(!p)return null;const cor=c.dom>=70?C.green:c.dom>=40?C.amber:C.red;const isS=sel?.id===c.id;return(
            <g key={c.id} onClick={()=>setSel(c)} style={{cursor:"pointer"}}>
              <circle cx={p.x} cy={p.y} r={isS?30:24} fill={`${cor}22`} stroke={cor} strokeWidth={isS?2.5:1.5}/>
              <circle cx={p.x} cy={p.y} r={(c.dom/100)*20} fill={`${cor}44`}/>
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={cor} fontSize="9" fontWeight="700">{c.dom}%</text>
              <text x={p.x} y={p.y+15} textAnchor="middle" fill={C.text} fontSize="8">{c.label}</text>
            </g>
          );})}
          <text x="150" y="305" textAnchor="middle" fill={AREA_COR[areaId]} fontSize="10" fontWeight="700">{AREA_LBL[areaId]}</text>
        </svg>
      </div>
      {sel
        ?<div className="fu" style={{background:`${AREA_COR[areaId]}0D`,border:`1px solid ${AREA_COR[areaId]}33`,borderRadius:13,padding:"13px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800}}>{sel.label}</div><Pill color={sel.dom>=70?C.green:sel.dom>=40?C.amber:C.red}>{sel.dom}% dominado</Pill></div>
          <div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${sel.dom}%`,background:sel.dom>=70?C.green:sel.dom>=40?C.amber:C.red,borderRadius:99}}/></div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{sel.dom<40?"⚠️ Ponto crítico — priorize agora.":sel.dom<70?"📈 Em progresso — 2-3 sessões mais.":"✅ Dominado! Avance para o próximo."}</div>
        </div>
        :<div style={{background:C.card,borderRadius:12,border:`1px dashed ${C.border}`,padding:"16px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>👆</div><div style={{fontSize:12,color:C.muted}}>Toque em um conceito para ver detalhes</div></div>
      }
    </div>
  );
}

// ═══════════════════════════════════════════
// NARRATIVA PESSOAL
// ═══════════════════════════════════════════
function Narrativa(){
  const[sonho,setSonho]=useState("");const[narrativa,setNarrativa]=useState(null);const[loading,setLoading]=useState(false);
  const gerar=async()=>{if(!sonho.trim())return;setLoading(true);try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`Orientador educacional. Sonho: "${sonho}". Conecte cada área ENEM ao sonho de forma inspiradora. JSON:{"frase":"...","conexoes":{"lin":"...","hum":"...","nat":"...","mat":"...","red":"..."},"proximo":"...","mensagem":"..."}`}]})});const d=await r.json();setNarrativa(JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim()));}catch{setNarrativa({frase:`Sua jornada para ser ${sonho} começa no ENEM.`,conexoes:{lin:"Comunicação é fundamental na sua profissão",hum:"Entender o mundo social é essencial",nat:"A ciência move o progresso na sua área",mat:"O raciocínio lógico é seu diferencial",red:"Expressar ideias com clareza é poder"},proximo:"Estude 1 hora hoje.",mensagem:`Cada questão é um tijolo na construção do seu futuro como ${sonho}.`});}setLoading(false);};
  return(
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>📖 Minha Narrativa</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Conecte seu sonho ao conteúdo — aprendizagem com propósito real</div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:6,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>QUAL É O SEU SONHO?</div>
        <input value={sonho} onChange={e=>setSonho(e.target.value)} placeholder="Ex: médica, engenheiro aeronáutico, jornalista..." style={{width:"100%",padding:"12px 13px",background:C.surface,border:`1.5px solid ${sonho?C.pink:C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",marginBottom:12,boxSizing:"border-box",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=C.pink} onBlur={e=>e.target.style.borderColor=sonho?C.pink:C.border}/>
        <button onClick={gerar} disabled={loading||!sonho.trim()} style={{width:"100%",padding:"13px",borderRadius:11,background:loading||!sonho.trim()?C.border:G.accent,cursor:loading||!sonho.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:700,color:loading||!sonho.trim()?C.muted:"#fff",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<><Spin/>Criando narrativa...</>:"✨ Criar Minha Narrativa"}
        </button>
      </div>
      {narrativa&&<div className="fu">
        <div style={{background:G.full,border:"none",borderRadius:13,padding:"18px 14px",marginBottom:10,textAlign:"center"}}><div style={{fontSize:20,marginBottom:6}}>💫</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",lineHeight:1.5,fontStyle:"italic"}}>"{narrativa.frase}"</div></div>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>COMO CADA ÁREA CONECTA AO SEU SONHO</div>
        {Object.entries(narrativa.conexoes).map(([k,v])=>(
          <div key={k} style={{background:`${AREA_COR[k]}0D`,border:`1px solid ${AREA_COR[k]}33`,borderRadius:11,padding:"11px 13px",marginBottom:7,display:"flex",alignItems:"flex-start",gap:9}}>
            <span style={{fontSize:16,flexShrink:0}}>{AREA_ICO[k]}</span>
            <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:AREA_COR[k],marginBottom:3}}>{AREA_LBL[k]}</div><div style={{fontSize:12,color:C.text,lineHeight:1.4}}>{v}</div></div>
          </div>
        ))}
        <div style={{background:`${C.violet}0D`,border:`1px solid ${C.violet}33`,borderRadius:12,padding:"14px",textAlign:"center",marginBottom:10}}><div style={{fontSize:18,marginBottom:6}}>🌟</div><div style={{fontSize:12,color:C.text,lineHeight:1.5,fontStyle:"italic",marginBottom:8}}>{narrativa.mensagem}</div><Pill color={C.cyan} style={{fontSize:10}}>📌 {narrativa.proximo}</Pill></div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// CERTIFICADOS
// ═══════════════════════════════════════════
function Certificados(){
  const[sel,setSel]=useState(null);
  const nivelGrad={Expert:G.full,Avançado:G.primary,Intermediário:`linear-gradient(135deg,${C.amber},#F97316)`};
  return(
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🏆 Certificados</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:12}}>Conquistas verificáveis que comprovam seu domínio</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {[[CERTS.filter(c=>c.ok).length,"Obtidos",C.green],[CERTS.filter(c=>!c.ok).length,"Disponíveis",C.muted],["QR","Verificável",C.cyan]].map(([v,l,c])=>(
          <div key={l} style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,padding:"10px 8px",textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {CERTS.map(cert=>(
          <div key={cert.id} onClick={()=>cert.ok&&setSel(cert)} style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"13px",display:"flex",alignItems:"center",gap:11,opacity:cert.ok?1:.6,cursor:cert.ok?"pointer":"default",transition:"all .2s"}} onMouseEnter={e=>cert.ok&&(e.currentTarget.style.borderColor=C.cyan)} onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
            <div style={{width:46,height:46,borderRadius:11,background:cert.ok?nivelGrad[cert.nivel]||G.primary:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{cert.ok?"🏆":"🔒"}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:cert.ok?C.text:C.muted}}>{cert.titulo}</div><div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}><Pill color={AREA_COR[cert.area]||C.cyan} style={{fontSize:9}}>{AREA_LBL[cert.area]}</Pill><Pill color={cert.ok?C.green:C.muted} style={{fontSize:9}}>{cert.nivel}</Pill>{cert.ok&&<Pill color={C.amber} style={{fontSize:9}}>{cert.pts} pts</Pill>}</div></div>
            {cert.ok&&<span style={{color:C.muted}}>→</span>}
          </div>
        ))}
      </div>
      {sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setSel(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:18,padding:22,maxWidth:340,width:"100%",border:`1px solid ${C.border}`}} className="fu">
            <div style={{background:nivelGrad[sel.nivel]||G.primary,borderRadius:12,padding:"20px 14px",textAlign:"center",marginBottom:14}}><div style={{fontSize:36,marginBottom:6}}>🏆</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.7)",letterSpacing:2,marginBottom:3}}>CERTIFICADO DE COMPETÊNCIA</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:"#fff",marginBottom:3}}>{sel.titulo}</div><div style={{fontSize:10,color:"rgba(255,255,255,.8)"}}>{sel.nivel} · {sel.pts} pts · {sel.data}</div></div>
            <div style={{background:C.surface,borderRadius:9,padding:"10px 12px",marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:C.muted,marginBottom:3,fontFamily:"'Syne',sans-serif"}}>🔐 HASH DE VERIFICAÇÃO</div><div style={{fontSize:10,color:C.green,fontFamily:"monospace",wordBreak:"break-all"}}>{sel.hash}</div></div>
            <div style={{background:"#fff",borderRadius:9,padding:10,textAlign:"center",marginBottom:12}}><div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:1,maxWidth:110,margin:"0 auto"}}>{Array.from({length:64}).map((_,i)=><div key={i} style={{height:8,background:Math.random()>.5?"#000":"#fff",borderRadius:1}}/>)}</div><div style={{fontSize:8,color:"#666",marginTop:5}}>Escaneie para verificar</div></div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setSel(null)} style={{flex:1,padding:"10px",borderRadius:9,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:C.muted,fontFamily:"'Syne',sans-serif"}}>Fechar</button>
              <button style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:G.primary,cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>📤 Compartilhar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// API EDUCACIONAL
// ═══════════════════════════════════════════
function APIEdu(){
  const[tab,setTab]=useState("docs");const[testR,setTestR]=useState(null);const[testing,setTesting]=useState(false);const[ep,setEp]=useState("/v1/questions?area=mat&nivel=medio");
  const mcor={GET:C.green,POST:C.blue,DELETE:C.red,PATCH:C.amber};
  const testar=async()=>{setTesting(true);await new Promise(r=>setTimeout(r,900));setTestR({status:200,data:{questions:[{id:"q_001",area:"mat",nivel:"medio",enunciado:"log₂(32) = ?",correta:1,xp:130},{id:"q_002",area:"mat",nivel:"medio",enunciado:"Área do hexágono...",correta:2,xp:130}],total:2}});setTesting(false);};
  return(
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>⚡ API Educacional</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:12}}>Integre o Nota A à sua plataforma ou escola</div>
      <div style={{display:"flex",gap:3,background:C.surface,padding:3,borderRadius:9,border:`1px solid ${C.border}`,marginBottom:12}}>
        {[["docs","📚 Docs"],["test","🧪 Testar"],["chave","🔑 Chave"]].map(([id,lbl])=><button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"6px",borderRadius:7,border:tab===id?`1px solid ${C.cyan}44`:"1px solid transparent",cursor:"pointer",background:tab===id?`${C.cyan}18`:"transparent",color:tab===id?C.cyan:C.muted,fontSize:10,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{lbl}</button>)}
      </div>
      {tab==="docs"&&<div>
        {API_EPS.map(e=><div key={e.path} style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,padding:"11px 13px",marginBottom:7,display:"flex",alignItems:"flex-start",gap:9}}>
          <span style={{background:`${mcor[e.m]}22`,color:mcor[e.m],fontSize:9,fontWeight:900,padding:"2px 6px",borderRadius:5,fontFamily:"monospace",flexShrink:0,marginTop:1}}>{e.m}</span>
          <div><div style={{fontFamily:"monospace",fontSize:11,color:C.text,marginBottom:2}}>{e.path}</div><div style={{fontSize:10,color:C.muted}}>{e.desc}</div></div>
        </div>)}
        <div style={{background:`${C.cyan}0D`,border:`1px solid ${C.cyan}33`,borderRadius:12,padding:"12px 13px",marginTop:10}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.cyan,marginBottom:7}}>📦 EXEMPLO</div><div style={{background:"#000",borderRadius:7,padding:"10px",fontSize:10,fontFamily:"monospace",color:"#00FF88",lineHeight:1.6}}>{`fetch('https://api.notaa.com.br/v1/questions', {\n  headers: {\n    'Authorization': 'Bearer na_live_sk_...'\n  }\n})`}</div></div>
      </div>}
      {tab==="test"&&<div>
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"13px",marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:7,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>ENDPOINT</div>
          <div style={{display:"flex",gap:7}}>
            <span style={{padding:"9px 10px",background:`${C.green}22`,color:C.green,borderRadius:8,fontSize:9,fontWeight:900,fontFamily:"monospace",whiteSpace:"nowrap"}}>GET</span>
            <input value={ep} onChange={e=>setEp(e.target.value)} style={{flex:1,padding:"9px 11px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:11,outline:"none",fontFamily:"monospace"}}/>
          </div>
          <button onClick={testar} disabled={testing} style={{width:"100%",padding:"11px",borderRadius:9,background:testing?C.border:G.primary,cursor:testing?"not-allowed":"pointer",fontSize:12,fontWeight:700,color:testing?C.muted:"#fff",fontFamily:"'Syne',sans-serif",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>{testing?<><Spin/>Testando...</>:"▶ Enviar Requisição"}</button>
        </div>
        {testR&&<div className="fu" style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:"12px 13px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1}}>RESPOSTA</div><Pill color={C.green} style={{fontSize:9}}>✓ {testR.status} OK</Pill></div><div style={{background:"#000",borderRadius:7,padding:"10px",fontSize:10,fontFamily:"monospace",color:"#00FF88",lineHeight:1.5,overflowX:"auto",maxHeight:160,overflow:"auto"}}>{JSON.stringify(testR.data,null,2)}</div></div>}
      </div>}
      {tab==="chave"&&<div>
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"13px",marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:7,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>SUA API KEY</div>
          <div style={{background:C.surface,borderRadius:8,padding:"11px 13px",fontFamily:"monospace",fontSize:11,color:C.amber,marginBottom:10,wordBreak:"break-all"}}>na_live_sk_•••••••••••••••••••••••••</div>
          <div style={{display:"flex",gap:7}}><button style={{flex:1,padding:"9px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontSize:11,fontWeight:700,color:C.muted,fontFamily:"'Syne',sans-serif"}}>📋 Copiar</button><button style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:G.accent,cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>🔄 Regenerar</button></div>
        </div>
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"13px"}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>PLANOS</div>
          {[["Starter","Gratuito","1.000 req/mês",C.green],["Pro","R$99/mês","50.000 req/mês",C.cyan],["Enterprise","Custom","Ilimitado + SLA",C.violet]].map(([plano,preco,limite,cor])=>(
            <div key={plano} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text}}>{plano}</div><div style={{fontSize:10,color:C.muted}}>{limite}</div></div><Pill color={cor} style={{fontSize:9}}>{preco}</Pill></div>
          ))}
        </div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// RELATÓRIO FAMILIAR
// ═══════════════════════════════════════════
function Pais(){
  const[email,setEmail]=useState("");const[enviado,setEnviado]=useState(false);const[freq,setFreq]=useState("semanal");
  const semana={questoes:47,horas:8.5,acertos:78,streak:3,melhor:"Linguagens",reforco:"Matemática"};
  const preview=`Olá!\n\nRelatório ${freq} de Estudante:\n\n📊 ESTA SEMANA\n• ${semana.questoes} questões respondidas\n• ${semana.horas}h de estudo\n• ${semana.acertos}% de acertos\n• 🔥 ${semana.streak} dias seguidos\n\n✅ Melhor área: ${semana.melhor}\n⚠️ Reforço: ${semana.reforco}\n\nEquipe Nota A`;
  return(
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>👨‍👩‍👧 Relatório Familiar</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:12}}>Mantenha sua família informada automaticamente</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[[semana.questoes,"Questões",C.cyan,"⚡"],[`${semana.horas}h`,"Horas",C.green,"⏱️"],[`${semana.acertos}%`,"Acertos",C.violet,"🎯"],[`${semana.streak}d`,"Sequência",C.amber,"🔥"]].map(([v,l,c,i])=>(
          <div key={l} style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,padding:"11px 8px",textAlign:"center"}}><div style={{fontSize:16,marginBottom:3}}>{i}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"13px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:7,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>PRÉVIA DO E-MAIL</div>
        <div style={{background:C.surface,borderRadius:8,padding:"11px",fontSize:11,color:C.text,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:140,overflow:"auto",fontFamily:"monospace"}}>{preview}</div>
      </div>
      <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:"13px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>CONFIGURAR ENVIO</div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="e-mail dos responsáveis" style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1.5px solid ${email?C.green:C.border}`,borderRadius:9,color:C.text,fontSize:12,outline:"none",marginBottom:10,boxSizing:"border-box",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=email?C.green:C.border}/>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {["semanal","quinzenal","mensal"].map(f=><button key={f} onClick={()=>setFreq(f)} style={{flex:1,padding:"7px",borderRadius:8,border:`1.5px solid ${freq===f?C.green:C.border}`,background:freq===f?`${C.green}18`:"transparent",color:freq===f?C.green:C.muted,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif",textTransform:"capitalize"}}>{f}</button>)}
        </div>
        {!enviado
          ?<button onClick={()=>email.includes("@")&&setEnviado(true)} disabled={!email.includes("@")} style={{width:"100%",padding:"12px",borderRadius:10,background:!email.includes("@")?C.border:G.primary,cursor:!email.includes("@")?"not-allowed":"pointer",fontSize:13,fontWeight:700,color:!email.includes("@")?C.muted:"#fff",fontFamily:"'Syne',sans-serif"}}>📧 Ativar Relatório {freq}</button>
          :<div style={{textAlign:"center",padding:"11px",background:`${C.green}15`,borderRadius:9,border:`1px solid ${C.green}44`}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>✅ Relatório ativado!</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Próximo envio: {freq==="semanal"?"próxima segunda":freq==="quinzenal"?"em 2 semanas":"no 1º do mês"}</div></div>}
      </div>
      <div style={{background:`${C.green}0D`,border:`1px solid ${C.green}33`,borderRadius:12,padding:"13px",textAlign:"center"}}><div style={{fontSize:22,marginBottom:4}}>💬</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.green,marginBottom:3}}>Também via WhatsApp</div><div style={{fontSize:10,color:C.muted,marginBottom:8}}>Atualizações direto no celular da família</div><button style={{padding:"8px 16px",borderRadius:9,border:"none",background:C.green,cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>Conectar WhatsApp</button></div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PERFIL
// ═══════════════════════════════════════════
function PerfilModule(){
  const badges=[{icon:"⭐",label:"1º Acerto",e:true},{icon:"🔥",label:"3 dias",e:true},{icon:"💎",label:"Perfeito",e:true},{icon:"🏆",label:"Mestre",e:false},{icon:"🎯",label:"100 Questões",e:false},{icon:"📚",label:"Todas Áreas",e:false}];
  const hist=[{area:"Linguagens",icon:"📚",acertos:3,total:3,xp:450,data:"Hoje"},{area:"Matemática",icon:"📐",acertos:2,total:3,xp:200,data:"Ontem"},{area:"Redação",icon:"✍️",acertos:1,total:1,xp:150,data:"Seg"}];
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{width:66,height:66,borderRadius:"50%",margin:"0 auto 10px",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",boxShadow:`0 0 20px ${C.cyan}44`}}>E</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900}}>Estudante</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2}}>Estudante ENEM</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10,flexWrap:"wrap"}}><Pill color={C.cyan}>⚡ Nível 3</Pill><Pill color={C.amber}>🔥 3 dias</Pill><Pill color={C.green}>💰 620 XP</Pill></div>
      </div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>PROGRESSO — NÍVEL 3</div>
        <div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:4}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:700}}>Nível 3</span><span>620/1500 XP</span></div><div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:"41%",background:G.primary,borderRadius:99}}/></div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
          {[["47","Questões",C.cyan],["3","Redações",C.violet],["78%","Acertos",C.green]].map(([v,l,c])=><div key={l} style={{background:C.surface,borderRadius:8,padding:"9px",textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>)}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>CONQUISTAS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
          {badges.map(b=><div key={b.label} style={{textAlign:"center",padding:"9px 6px",borderRadius:9,background:b.e?`${C.cyan}10`:C.surface,border:`1px solid ${b.e?C.cyan:C.border}`,opacity:b.e?1:.4}}><div style={{fontSize:22,marginBottom:3}}>{b.icon}</div><div style={{fontSize:9,color:b.e?C.cyan:C.muted,fontWeight:b.e?700:400,lineHeight:1.2}}>{b.label}</div></div>)}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px"}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>HISTÓRICO RECENTE</div>
        {hist.map((h,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:i<hist.length-1?`1px solid ${C.border}`:"none"}}><div style={{fontSize:20}}>{h.icon}</div><div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text}}>{h.area}</div><div style={{fontSize:10,color:C.muted}}>{h.data} · {h.acertos}/{h.total} acertos</div></div><Pill color={C.amber} style={{fontSize:10}}>+{h.xp} XP</Pill></div>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP
// ═══════════════════════════════════════════
const TABS=[
  {id:"previsao",icon:"🎯",label:"Previsão"},
  {id:"mapa",icon:"🗺️",label:"Mapa"},
  {id:"narrativa",icon:"📖",label:"Narrativa"},
  {id:"certs",icon:"🏆",label:"Certs"},
  {id:"api",icon:"⚡",label:"API"},
  {id:"pais",icon:"👨‍👩‍👧",label:"Família"},
  {id:"perfil",icon:"👤",label:"Perfil"},
];

export default function RecursosAvancados(){
  const[modo,setModo]=useState("previsao");
  return(
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",background:C.bg}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 18px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:540,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17}}><span style={{color:C.cyan}}>Nota</span><span style={{background:G.accent,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span></div>
            <div style={{fontSize:11,color:C.muted}}>Recursos Avançados</div>
          </div>
        </div>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto",whiteSpace:"nowrap",padding:"0 16px"}}>
          <div style={{display:"inline-flex",gap:2,padding:"6px 0"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setModo(t.id)} style={{padding:"6px 10px",borderRadius:8,border:modo===t.id?`1px solid ${C.cyan}44`:"1px solid transparent",cursor:"pointer",background:modo===t.id?`${C.cyan}18`:"transparent",color:modo===t.id?C.cyan:C.muted,fontSize:10,fontWeight:700,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap",transition:"all .2s"}}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>
        <div style={{maxWidth:480,margin:"0 auto",padding:"18px 18px 60px"}} className="fu">
          {modo==="previsao"&&<Previsao/>}
          {modo==="mapa"&&<Mapa/>}
          {modo==="narrativa"&&<Narrativa/>}
          {modo==="certs"&&<Certificados/>}
          {modo==="api"&&<APIEdu/>}
          {modo==="pais"&&<Pais/>}
          {modo==="perfil"&&<PerfilModule/>}
        </div>
      </div>
    </>
  );
}

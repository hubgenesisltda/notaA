import{useState,useEffect,useRef,useCallback}from"react";

import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg:"#050810", surface:"#090D1A", card:"#0F1628", card2:"#131D30",
  border:"#182038", border2:"#1E2A45",
  primary:"#00E5FF", secondary:"#8B5CF6", accent:"#F59E0B",
  success:"#10B981", danger:"#F43F5E", blue:"#3B82F6",
  text:"#EEF2FF", muted:"#4B5A7A",
};
const grad = (a,b) => `linear-gradient(135deg,${a},${b})`;
const G = {
  primary: grad(C.primary, C.secondary),
  gold:    grad(C.accent, "#F97316"),
  danger:  grad(C.danger, C.secondary),
  success: grad(C.success, "#059669"),
};

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;overflow-x:hidden;}button,input,textarea,select{font-family:inherit;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:${C.surface};}::-webkit-scrollbar-thumb{background:${C.border2};border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}@keyframes pop{0%{transform:scale(.8);opacity:0;}60%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;}}@keyframes shimmer{0%{opacity:.6;}50%{opacity:1;}100%{opacity:.6;}}.fu{animation:fadeUp .38s ease both;}.pop{animation:pop .4s cubic-bezier(.4,2,.6,1) both;}`;

const AREAS = [
  {id:"lin",label:"Linguagens e Códigos",          icon:"📚",color:C.primary},
  {id:"hum",label:"Ciências Humanas",              icon:"🌍",color:C.secondary},
  {id:"nat",label:"Ciências da Natureza",          icon:"⚗️",color:C.success},
  {id:"mat",label:"Matemática e suas Tecnologias", icon:"📐",color:C.accent},
  {id:"red",label:"Redação",                       icon:"✍️",color:C.danger},
];

const SAMPLE_Q = {
  lin:{enunciado:"Leia:\n\"A língua é um sistema de signos que exprime ideias...\"\n(Saussure)\n\nO conceito de língua é caracterizado pela:",alternativas:["A) Expressão espontânea e individual","B) Convenção social que organiza a comunicação","C) Capacidade inata de produção de sons","D) Exclusividade da comunicação escrita","E) Ausência de regras gramaticais"],correta:1,explicacao:"Para Saussure, língua é fato social — convenção coletiva que organiza a comunicação.",xp:150,dificuldade:"Média"},
  hum:{enunciado:"A Revolução Industrial do séc. XVIII trouxe como principal consequência social:",alternativas:["A) Extinção do trabalho agrícola","B) Formação do proletariado e exploração do trabalho","C) Eliminação das desigualdades sociais","D) Redução da jornada para 8 horas","E) Fortalecimento da nobreza feudal"],correta:1,explicacao:"A Rev. Industrial criou o proletariado em condições precárias de trabalho — base das análises marxistas.",xp:150,dificuldade:"Média"},
  nat:{enunciado:"O aumento de CO₂ e CH₄ na atmosfera intensifica o efeito estufa. A principal consequência direta é:",alternativas:["A) Redução da camada de ozônio","B) Aumento da temperatura média global","C) Diminuição das chuvas ácidas","D) Aumento da radiação ultravioleta","E) Redução dos ventos alísios"],correta:1,explicacao:"Gases de efeito estufa retêm calor, elevando a temperatura global. É diferente do buraco na camada de ozônio.",xp:100,dificuldade:"Fácil"},
  mat:{enunciado:"Uma empresa produz 240 peças em 8 horas. Para produzir 450 peças no mesmo ritmo:",alternativas:["A) 12 horas","B) 13 horas","C) 15 horas","D) 16 horas","E) 18 horas"],correta:2,explicacao:"Regra de três: x = (450×8)/240 = 15 horas.",xp:100,dificuldade:"Fácil"},
  red:{enunciado:"Na Competência 5 do ENEM, a proposta de intervenção deve conter:",alternativas:["A) Tema, tese, argumento, contra-arg., conclusão","B) Agente, ação, meio, finalidade, detalhamento","C) Introdução, desenvolvimento, exemplos, dados, conclusão","D) Problema, causa, efeito, solução, resultado","E) Contexto, diagnóstico, proposta, impacto, avaliação"],correta:1,explicacao:"C5 exige: AGENTE + AÇÃO + MEIO + FINALIDADE + DETALHAMENTO — vale 200 pontos!",xp:150,dificuldade:"Média"},
};

const TEMAS_RED = [
  "O impacto das redes sociais na saúde mental dos jovens brasileiros",
  "Desafios para a inclusão digital de populações vulneráveis no Brasil",
  "A invisibilidade da violência psicológica na sociedade contemporânea",
  "Caminhos para a valorização do patrimônio cultural brasileiro",
];

const ALUNOS = [
  {id:1,nome:"Lara Oliveira",av:"LO",nivel:8,xp:3420,streak:12,prog:78,risco:"baixo",areas:{lin:72,hum:68,nat:45,mat:38,red:61},ativo:true},
  {id:2,nome:"Mateus Santos",av:"MS",nivel:5,xp:1840,streak:3,prog:45,risco:"medio",areas:{lin:50,hum:55,nat:62,mat:71,red:40},ativo:true},
  {id:3,nome:"Ana Beatriz",av:"AB",nivel:11,xp:5200,streak:21,prog:92,risco:"baixo",areas:{lin:88,hum:91,nat:84,mat:76,red:95},ativo:true},
  {id:4,nome:"Carlos Mendes",av:"CM",nivel:3,xp:620,streak:0,prog:18,risco:"alto",areas:{lin:25,hum:30,nat:22,mat:15,red:18},ativo:false},
  {id:5,nome:"Sofia Lima",av:"SL",nivel:7,xp:2910,streak:7,prog:65,risco:"baixo",areas:{lin:70,hum:66,nat:58,mat:60,red:74},ativo:true},
  {id:6,nome:"Pedro Rocha",av:"PR",nivel:4,xp:1100,streak:1,prog:31,risco:"alto",areas:{lin:35,hum:28,nat:40,mat:22,red:30},ativo:false},
];

const SIM_Q = {
  1:[{q:"2 + 2 × 3 = ?",ops:["8","7","10","6","14"],ans:1,xp:50},{q:"Raiz quadrada de 49:",ops:["6","7","8","9","5"],ans:1,xp:50}],
  2:[{q:"f(x)=2x+1. Qual é f(3)?",ops:["5","6","7","8","9"],ans:2,xp:100},{q:"Resolva x²−5x+6=0:",ops:["x=1 e 6","x=2 e 3","x=1 e 4","x=3 e 5","x=2 e 5"],ans:1,xp:100}],
  3:[{q:"Derivada de f(x)=x³:",ops:["3x","x²","3x²","2x³","x³"],ans:2,xp:200},{q:"∫2x dx = ?",ops:["x+C","x²+C","2x²+C","x²/2+C","2+C"],ans:1,xp:200}],
};

const RISCO_COR = {baixo:C.success,medio:C.accent,alto:C.danger};
const RISCO_LBL = {baixo:"Baixo risco",medio:"Atenção",alto:"⚠️ Risco alto"};

function useToast(){
  const [t,setT]=useState({msg:"",type:"success",vis:false});
  const show=useCallback((msg,type="success")=>{
    setT({msg,type,vis:true});
    setTimeout(()=>setT(p=>({...p,vis:false})),2700);
  },[]);
  return [t,show];
}

function Toast({msg,type,vis}){
  const bg=type==="error"?C.danger:type==="warn"?C.accent:C.success;
  return <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:bg,color:"#fff",borderRadius:12,padding:"12px 20px",fontWeight:700,fontSize:13,fontFamily:"'Syne',sans-serif",boxShadow:`0 8px 32px ${bg}55`,transform:vis?"translateY(0) scale(1)":"translateY(-16px) scale(.95)",opacity:vis?1:0,transition:"all .3s cubic-bezier(.4,2,.6,1)",pointerEvents:"none"}}>{msg}</div>;
}

function Spin({size=24,color=C.primary}){
  return <div style={{width:size,height:size,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:color,animation:"spin .8s linear infinite",flexShrink:0}}/>;
}

function Pill({children,color=C.primary,style:s}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:`${color}22`,border:`1px solid ${color}44`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color,...s}}>{children}</span>;
}

function Card({children,style:s,glow,onClick}){
  const [hov,setHov]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:C.card,border:`1px solid ${hov&&onClick?C.primary:glow?C.primary:C.border}`,borderRadius:16,padding:16,transition:"all .2s",cursor:onClick?"pointer":"default",boxShadow:glow?`0 0 24px ${C.primary}22`:hov&&onClick?`0 4px 20px ${C.primary}11`:"none",...s}}>{children}</div>;
}

function Btn({children,onClick,variant="primary",disabled,full,size="md",style:s}){
  const [hov,setHov]=useState(false);
  const bg=disabled?C.border:variant==="primary"?G.primary:variant==="gold"?G.gold:variant==="danger"?G.danger:variant==="success"?G.success:"transparent";
  const pad=size==="sm"?"8px 16px":size==="lg"?"16px 28px":"12px 22px";
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,padding:pad,borderRadius:12,border:variant==="ghost"?`1px solid ${C.border2}`:"none",background:bg,cursor:disabled?"not-allowed":"pointer",fontSize:size==="sm"?12:size==="lg"?15:13,fontWeight:700,color:disabled?C.muted:"#fff",fontFamily:"'Syne',sans-serif",opacity:disabled?.5:1,width:full?"100%":"auto",transform:hov&&!disabled?"scale(1.02)":"scale(1)",transition:"all .15s",boxShadow:!disabled&&variant==="primary"?`0 4px 20px ${C.primary}33`:"none",...s}}>{children}</button>;
}

function XPBar({xp,level}){
  const max=level*500,pct=Math.min((xp/max)*100,100);
  return <div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:4}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:700}}>Nível {level}</span><span>{xp}/{max} XP</span></div><div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:G.primary,borderRadius:99,transition:"width 1s ease"}}/></div></div>;
}

function AltBtn({alt,idx,correta,selecionada,revealed,onClick}){
  let bg=C.card,border=C.border,color=C.text;
  if(revealed){if(idx===correta){bg=`${C.success}18`;border=C.success;color=C.success;}else if(idx===selecionada){bg=`${C.danger}18`;border=C.danger;color=C.danger;}}
  return <button onClick={onClick} disabled={revealed} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:11,padding:"11px 14px",textAlign:"left",cursor:revealed?"default":"pointer",fontSize:13,color,transition:"all .2s",display:"flex",alignItems:"center",gap:10,width:"100%",fontFamily:"inherit"}}>
    <span style={{width:22,height:22,borderRadius:"50%",background:revealed&&idx===correta?C.success:revealed&&idx===selecionada?C.danger:C.surface,border:`1px solid ${border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0,color:revealed?"#fff":C.muted,fontFamily:"'Syne',sans-serif"}}>
      {revealed&&idx===correta?"✓":revealed&&idx===selecionada?"✗":String.fromCharCode(65+idx)}
    </span>
    {alt}
  </button>;
}

const NAV = [
  {id:"home",icon:"🏠",label:"Início"},
  {id:"quiz",icon:"⚡",label:"Quiz"},
  {id:"redacao",icon:"✍️",label:"Redação"},
  {id:"dashboard",icon:"📊",label:"Turma"},
  {id:"mais",icon:"⋯",label:"Mais"},
];
const MAIS_SCREENS = ["simulado","socratica","planos","perfil"];

function NavBar({screen,onNav}){
  const isMais = MAIS_SCREENS.includes(screen);
  return <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:`${C.surface}F0`,backdropFilter:"blur(16px)",borderTop:`1px solid ${C.border}`,display:"flex",maxWidth:520,margin:"0 auto"}}>
    {NAV.map(t=>{
      const active = screen===t.id || (t.id==="mais"&&isMais);
      return <button key={t.id} onClick={()=>onNav(t.id==="mais"?"mais":t.id)} style={{flex:1,padding:"9px 0 7px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all .2s"}}>
        <span style={{fontSize:18,opacity:active?1:.3}}>{t.icon}</span>
        <span style={{fontSize:9,fontWeight:active?800:500,color:active?C.primary:C.muted,fontFamily:"'Syne',sans-serif"}}>{t.label}</span>
        {active&&<div style={{width:16,height:2,borderRadius:99,background:C.primary}}/>}
      </button>;
    })}
  </nav>;
}

function TopBar({screen,profile}){
  const labels={home:"Nota A",quiz:"Quiz com IA",redacao:"Redação",dashboard:"Turma — Prof. Jó",simulado:"Simulado Adaptativo",socratica:"IA Socrática",planos:"Planos e Pagamento",perfil:"Meu Perfil",mais:"Explorar"};
  return <header style={{position:"sticky",top:0,zIndex:100,background:`${C.surface}EE`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"0 18px"}}>
    <div style={{maxWidth:520,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17,letterSpacing:-.5}}><span style={{color:C.primary}}>Nota</span><span style={{background:G.gold,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span></div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.muted}}>{labels[screen]}</div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.accent,fontWeight:700}}>🔥{profile.streak}</span>
        <Pill color={C.primary} style={{fontSize:10}}>⚡{profile.xp} XP</Pill>
      </div>
    </div>
  </header>;
}

// TELA 1 — LANDING
function Onboarding({onComplete}){
  const [step,setStep]=useState(0);
  const [data,setData]=useState({nome:"",objetivo:"",estilo:"",dificuldades:[],rotina:"",neuro:[]});
  const TOTAL=7;
  const next=()=>setStep(s=>Math.min(s+1,TOTAL-1));
  const prev=()=>setStep(s=>Math.max(s-1,0));
  const setF=(f,v)=>setData(d=>({...d,[f]:v}));
  const toggleF=(f,v)=>setData(d=>({...d,[f]:d[f].includes(v)?d[f].filter(x=>x!==v):[...d[f],v]}));
  const pct=(step/(TOTAL-1))*100;

  function OCard({icon,label,desc,selected,onClick,color,row}){
    return <button onClick={onClick} style={{background:selected?`${color}14`:C.card,border:`2px solid ${selected?color:C.border}`,borderRadius:14,padding:row?"12px 16px":"14px 12px",cursor:"pointer",transition:"all .18s",width:"100%",textAlign:row?"left":"center",display:"flex",flexDirection:row?"row":"column",alignItems:"center",gap:row?12:8,fontFamily:"inherit"}}>
      <span style={{fontSize:row?22:26,flexShrink:0}}>{icon}</span>
      <div style={{flex:row?1:"unset"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:selected?color:C.text}}>{label}</div>
        {desc&&<div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{desc}</div>}
      </div>
      {row&&selected&&<span style={{color,fontSize:16,flexShrink:0}}>✓</span>}
    </button>;
  }

  const PERFIS={visual:{tipo:"👁️ Aprendiz Visual",desc:"Mapas mentais, infográficos e esquemas visuais.",cor:C.primary},auditivo:{tipo:"🎧 Aprendiz Auditivo",desc:"Videoaulas, podcasts e explicações em áudio.",cor:C.secondary},leitura:{tipo:"📖 Aprendiz Analítico",desc:"Textos, resumos e anotações.",cor:C.success},pratico:{tipo:"✏️ Aprendiz Prático",desc:"Exercícios, questões e simulados.",cor:C.accent}};
  const perfil=PERFIS[data.estilo]||null;
  const objLbl={enem:"Passar no ENEM",federal:"Universidade Federal",bolsa:"Bolsa ProUni/FIES",concurso:"Concurso/Militar"};
  const estLbl={visual:"Visual — mapas e esquemas",auditivo:"Auditivo — vídeos e podcasts",leitura:"Analítico — textos e resumos",pratico:"Prático — exercícios e simulados"};
  const rotLbl={"15":"15 min/dia","30":"30 min/dia","60":"1 hora/dia","120":"2+ horas/dia"};
  const difLbl={mat:"Matemática",port:"Linguagens",hist:"História",geo:"Geografia",bio:"Biologia",qui:"Química",fis:"Física",red:"Redação"};

  return <div style={{minHeight:"100vh",background:C.bg}}>
    {/* Header */}
    <div style={{position:"sticky",top:0,zIndex:100,background:`${C.surface}EE`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`}}>
      <div style={{maxWidth:540,margin:"0 auto",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18}}><span style={{color:C.primary}}>Nota</span><span style={{background:G.gold,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span></div>
        <div style={{fontSize:12,color:C.muted}}>Passo {step+1} de {TOTAL}</div>
      </div>
      <div style={{height:3,background:C.border,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:G.primary,transition:"width .5s"}}/></div>
    </div>
    <div style={{maxWidth:540,margin:"0 auto",padding:"26px 22px 60px"}}>
      {step>0&&<button onClick={prev} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>← Voltar</button>}

      {step===0&&<div className="fu"><div style={{fontSize:48,marginBottom:12}}>👋</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,marginBottom:6,lineHeight:1.1}}>Olá! Eu sou o<br/><span style={{color:C.primary}}>Nota A.</span></div><div style={{fontSize:14,color:C.muted,marginBottom:26,lineHeight:1.6,maxWidth:360}}>Vou criar uma trilha de estudos completamente personalizada. Leva menos de 2 minutos.</div><div style={{marginBottom:20}}><div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:8}}>QUAL É O SEU NOME?</div><input autoFocus value={data.nome} onChange={e=>setF("nome",e.target.value)} onKeyDown={e=>e.key==="Enter"&&data.nome.trim()&&next()} placeholder="Seu primeiro nome" style={{width:"100%",padding:"14px 16px",background:C.card,border:`2px solid ${data.nome?C.primary:C.border}`,borderRadius:12,color:C.text,fontSize:16,outline:"none",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=data.nome?C.primary:C.border}/></div><Btn onClick={next} disabled={!data.nome.trim()} full size="lg">Começar meu perfil →</Btn></div>}

      {step===1&&<div className="fu"><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:6}}>Qual é o seu objetivo, {data.nome}?</div><div style={{fontSize:13,color:C.muted,marginBottom:20}}>Sua trilha será calibrada para isso.</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{[["enem","🎯","Passar no ENEM","Foco nas 5 áreas e na redação"],["federal","🏛️","Universidade Federal","Alta pontuação + redação nota 1000"],["bolsa","📜","Bolsa ProUni / FIES","Estratégia para maximizar nota"],["concurso","⚔️","Concurso / Militar","Conteúdo e raciocínio direcionados"]].map(([id,icon,label,desc])=><OCard key={id} icon={icon} label={label} desc={desc} row color={C.primary} selected={data.objetivo===id} onClick={()=>{setF("objetivo",id);setTimeout(next,200);}}/>)}</div></div>}

      {step===2&&<div className="fu"><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:6}}>Como você aprende melhor?</div><div style={{fontSize:13,color:C.muted,marginBottom:20}}>Sem resposta certa — seja honesto!</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["visual","👁️","Visual","Mapas e esquemas"],["auditivo","🎧","Auditivo","Vídeos e podcasts"],["leitura","📖","Analítico","Textos e resumos"],["pratico","✏️","Prático","Exercícios e questões"]].map(([id,icon,label,desc])=><OCard key={id} icon={icon} label={label} desc={desc} color={C.secondary} selected={data.estilo===id} onClick={()=>{setF("estilo",id);setTimeout(next,200);}}/>)}</div></div>}

      {step===3&&<div className="fu"><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:6}}>Onde você tem mais dificuldade?</div><div style={{fontSize:13,color:C.muted,marginBottom:20}}>Selecione quantas quiser.</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>{[["mat","📐","Matemática"],["port","📝","Linguagens"],["hist","🏺","História"],["geo","🌍","Geografia"],["bio","🧬","Biologia"],["qui","⚗️","Química"],["fis","🔭","Física"],["red","✍️","Redação"]].map(([id,icon,label])=><OCard key={id} icon={icon} label={label} color={C.danger} selected={data.dificuldades.includes(id)} onClick={()=>toggleF("dificuldades",id)}/>)}</div><Btn onClick={next} disabled={!data.dificuldades.length} full size="lg">{!data.dificuldades.length?"Selecione ao menos uma":`Continuar com ${data.dificuldades.length} área${data.dificuldades.length>1?"s":""} →`}</Btn></div>}

      {step===4&&<div className="fu"><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:6}}>Quanto tempo você consegue estudar?</div><div style={{fontSize:13,color:C.muted,marginBottom:20}}>Vamos montar sua rotina ideal.</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{[["15","⚡","15 minutos","Estudante ocupado — foco no essencial"],["30","🌤️","30 minutos","Ritmo leve — consistência é o segredo"],["60","🔥","1 hora","Ritmo sólido — progresso visível"],["120","🚀","2 horas ou mais","Foco total — para quem quer a vaga"]].map(([id,icon,label,desc])=><OCard key={id} icon={icon} label={label} desc={desc} row color={C.accent} selected={data.rotina===id} onClick={()=>{setF("rotina",id);setTimeout(next,200);}}/>)}</div></div>}

      {step===5&&<div className="fu"><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:6}}>Alguma condição que devemos considerar?</div><div style={{fontSize:13,color:C.muted,marginBottom:10}}>Opcional — ajuda a adaptar sua experiência.</div><div style={{background:`${C.primary}11`,border:`1px solid ${C.primary}33`,borderRadius:11,padding:"10px 14px",marginBottom:18,fontSize:12,color:C.primary}}>🔒 Informação confidencial — usada apenas para personalizar seu estudo.</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>{[["tdah","⚡","TDAH"],["dislexia","🔤","Dislexia"],["autismo","🧩","Autismo (TEA)"],["ansiedade","💭","Ansiedade"]].map(([id,icon,label])=><OCard key={id} icon={icon} label={label} color={C.success} selected={data.neuro.includes(id)} onClick={()=>setData(d=>({...d,neuro:d.neuro.includes(id)?d.neuro.filter(x=>x!==id):[...d.neuro.filter(x=>x!=="nenhum"),id]}))}/>)}<div style={{gridColumn:"1 / -1"}}><OCard icon="✓" label="Nenhuma das opções acima" row color={C.muted} selected={data.neuro.includes("nenhum")} onClick={()=>setData(d=>({...d,neuro:d.neuro.includes("nenhum")?[]:["nenhum"]}))}/></div></div><Btn onClick={next} full size="lg">{data.neuro.length?"Gerar meu perfil →":"Pular e gerar meu perfil →"}</Btn></div>}

      {step===6&&<div className="fu" style={{textAlign:"center"}}><div style={{fontSize:60,marginBottom:10}} className="pop">🧠</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:C.primary,marginBottom:6}}>Perfil criado com sucesso!</div><div style={{fontSize:13,color:C.muted,marginBottom:20}}>Sua trilha personalizada está pronta.</div>
        {perfil&&<div style={{background:`${perfil.cor}14`,border:`1px solid ${perfil.cor}44`,borderRadius:14,padding:"16px",marginBottom:18,textAlign:"left"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:perfil.cor,marginBottom:4}}>{perfil.tipo}</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{perfil.desc}</div></div>}
        <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:20,textAlign:"left",overflow:"hidden"}}>
          {[["👤","Nome",data.nome],["🎯","Objetivo",objLbl[data.objetivo]||"—"],["🧠","Estilo",estLbl[data.estilo]||"—"],["⏱️","Rotina",rotLbl[data.rotina]||"—"],["📌","Foco",data.dificuldades.length?data.dificuldades.slice(0,3).map(d=>difLbl[d]).join(", ")+(data.dificuldades.length>3?` +${data.dificuldades.length-3}`:""):"—"]].map(([icon,lbl,val])=><div key={lbl} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:16}}>{icon}</span><div><div style={{fontSize:10,color:C.muted}}>{lbl}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{val}</div></div></div>)}
        </div>
        <Pill color={C.accent} style={{marginBottom:18}}>✨ Trilha personalizada gerada pela IA</Pill><br/>
        <Btn onClick={()=>onComplete(data)} full size="lg" style={{marginTop:10}}>🚀 Entrar na Plataforma</Btn>
        <div style={{marginTop:10}}><button onClick={prev} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:12,color:C.muted,fontFamily:"inherit"}}>← Revisar respostas</button></div>
      </div>}
    </div>
  </div>;
}

// TELA 3 — HOME
function Home({profile,onNav}){
  const streak=Array.from({length:7},(_,i)=>i<Math.min(profile.streak,7));
  const dias=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const DESTAQUE=[
    {icon:"⚡",title:"Quiz com IA",desc:"Questão personalizada por tema",screen:"quiz",color:C.primary,hot:false},
    {icon:"✍️",title:"Redação",desc:"Correção nas 5 competências",screen:"redacao",color:C.danger,hot:false},
    {icon:"📊",title:"Simulado Adaptativo",desc:"Dificuldade calibrada em tempo real",screen:"simulado",color:C.accent,hot:true},
    {icon:"🏛️",title:"IA Socrática",desc:"Aprenda descobrindo sozinho",screen:"socratica",color:C.secondary,hot:true},
  ];
  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:12,color:C.muted}}>Olá, {profile.name} 👋</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,letterSpacing:-.5}}>Missão ENEM</div></div>
      <div style={{width:44,height:44,borderRadius:"50%",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",boxShadow:`0 0 16px ${C.primary}44`}}>{profile.name[0]}</div>
    </div>
    <Card glow style={{marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><Pill color={C.accent}>⚡ Nível {profile.level}</Pill><span style={{fontSize:11,color:C.muted}}>🔥 {profile.streak}d</span><span style={{marginLeft:"auto",fontFamily:"'Syne',sans-serif",fontSize:11,color:C.primary,fontWeight:700}}>{profile.xp} XP</span></div><XPBar xp={profile.xp} level={profile.level}/></Card>
    <Card style={{marginBottom:14}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1}}>SEQUÊNCIA DA SEMANA</div><div style={{display:"flex",gap:5}}>{dias.map((d,i)=><div key={d} style={{flex:1,textAlign:"center"}}><div style={{height:28,borderRadius:7,marginBottom:2,background:streak[i]?G.gold:C.surface,border:`1px solid ${streak[i]?C.accent:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{streak[i]?"🔥":""}</div><div style={{fontSize:9,color:C.muted}}>{d}</div></div>)}</div></Card>
    <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1}}>ÁREAS DO ENEM</div>
    <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
      {AREAS.map(a=><Card key={a.id} onClick={()=>onNav("quiz",a)} style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:38,height:38,borderRadius:10,background:`${a.color}22`,border:`1px solid ${a.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.icon}</div><div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{a.label}</div><div style={{fontSize:10,color:C.muted}}>Questão com IA · +XP</div></div><Pill color={a.color} style={{fontSize:10}}>+XP</Pill></div></Card>)}
    </div>
    <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1}}>RECURSOS</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      {DESTAQUE.map(f=><Card key={f.screen} onClick={()=>onNav(f.screen)} style={{padding:"12px 11px",position:"relative",overflow:"hidden"}}>
        {f.hot&&<div style={{position:"absolute",top:7,right:7,background:C.danger,color:"#fff",fontSize:8,fontWeight:900,padding:"2px 5px",borderRadius:99,fontFamily:"'Syne',sans-serif"}}>NOVO</div>}
        <div style={{fontSize:24,marginBottom:6}}>{f.icon}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{f.title}</div>
        <div style={{fontSize:10,color:C.muted,lineHeight:1.3}}>{f.desc}</div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${f.color},transparent)`}}/>
      </Card>)}
    </div>
    <Btn onClick={()=>onNav("planos")} full variant="gold">⭐ Ver Planos — Upgrade para Plus</Btn>
  </div>;
}

// TELA 4 — QUIZ COM IA
function Quiz({addXP,showToast,initialArea}){
  const [area,setArea]=useState(initialArea||null);
  const [tema,setTema]=useState("");
  const [q,setQ]=useState(null);
  const [loading,setLoading]=useState(false);
  const [sel,setSel]=useState(null);
  const [rev,setRev]=useState(false);
  const [timer,setTimer]=useState(60);
  const tRef=useRef(null);

  useEffect(()=>{if(!rev&&q){setTimer(60);tRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(tRef.current);setRev(true);return 0;}return t-1;}),1000);return()=>clearInterval(tRef.current);}},[ q,rev]);

  const gerar=async()=>{
    if(!tema.trim())return;setLoading(true);setQ(null);setRev(false);setSel(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`Questão ENEM sobre "${tema}" em "${area.label}". APENAS JSON:\n{"enunciado":"...","alternativas":["A) ...","B) ...","C) ...","D) ...","E) ..."],"correta":0,"explicacao":"...","dificuldade":"Fácil|Média|Difícil"}`}]})});
      const d=await res.json();const p=JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim());
      setQ({...p,xp:p.dificuldade==="Difícil"?200:p.dificuldade==="Média"?150:100,id:Date.now()});
    }catch{setQ({...SAMPLE_Q[area.id]||SAMPLE_Q.mat,id:Date.now()});}
    setLoading(false);
  };

  const resp=(i)=>{
    if(rev||!q)return;clearInterval(tRef.current);setSel(i);setRev(true);
    const ok=i===q.correta,xp=ok?q.xp:Math.floor(q.xp*.2);
    addXP(xp);showToast(ok?`✅ Correto! +${xp} XP`:`❌ Errou. +${xp} XP`,ok?"success":"error");
  };

  if(!area)return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>⚡ Quiz com IA</div>
    <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Escolha uma área — questão exclusiva gerada por IA</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {AREAS.map(a=><Card key={a.id} onClick={()=>setArea(a)} style={{padding:"13px 14px"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:11,background:`${a.color}22`,border:`1px solid ${a.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{a.icon}</div><div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700}}>{a.label}</div><div style={{fontSize:11,color:C.muted}}>IA cria questão exclusiva</div></div><Pill color={a.color} style={{fontSize:10}}>+XP</Pill></div></Card>)}
    </div>
  </div>;

  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}}>
    <button onClick={()=>{setArea(null);setQ(null);setTema("");}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>← Áreas</button>
    <Pill color={area.color} style={{marginBottom:14}}>{area.icon} {area.label}</Pill>
    {!q?<div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,marginBottom:4}}>Gerar Questão Personalizada</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Digite um tema e a IA cria uma questão estilo ENEM exclusiva.</div>
      <textarea value={tema} onChange={e=>setTema(e.target.value)} rows={2} placeholder={`Tema (ex: ${area.id==="mat"?"funções quadráticas":area.id==="nat"?"fotossíntese":area.id==="hum"?"Revolução Francesa":"figuras de linguagem"})...`} style={{width:"100%",padding:"12px 14px",background:C.card,border:`1.5px solid ${tema?C.primary:C.border}`,borderRadius:11,color:C.text,fontSize:14,outline:"none",resize:"none",marginBottom:10,boxSizing:"border-box",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=tema?C.primary:C.border}/>
      <Btn onClick={gerar} disabled={loading||!tema.trim()} full size="lg">{loading?<><Spin size={16}/>Gerando...</>:"✨ Gerar com IA"}</Btn>
    </div>:<div>
      {!rev&&<div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:4}}><span>Tempo restante</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:timer<=15?C.danger:C.success}}>{timer}s</span></div><div style={{height:4,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(timer/60)*100}%`,background:timer<=15?C.danger:G.primary,borderRadius:99,transition:"width 1s linear"}}/></div></div>}
      <Card style={{marginBottom:10,fontSize:13,lineHeight:1.75,padding:"14px",whiteSpace:"pre-wrap"}}>{q.enunciado}</Card>
      <div style={{display:"flex",gap:6,marginBottom:10}}><Pill color={C.muted} style={{fontSize:10}}>{q.dificuldade}</Pill><Pill color={C.accent} style={{fontSize:10}}>+{q.xp} XP</Pill><Pill color={C.primary} style={{fontSize:10}}>🤖 IA</Pill></div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:10}}>
        {q.alternativas.map((alt,i)=><AltBtn key={i} alt={alt.substring(3)} idx={i} correta={q.correta} selecionada={sel} revealed={rev} onClick={()=>resp(i)}/>)}
      </div>
      {rev&&<><Card style={{background:`${C.primary}0D`,border:`1px solid ${C.primary}33`,marginBottom:10}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.primary,marginBottom:4}}>💡 EXPLICAÇÃO DA IA</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{q.explicacao}</div></Card><Btn onClick={()=>{setQ(null);setTema("");}} full>✨ Nova Questão</Btn></>}
    </div>}
  </div>;
}

// TELA 5 — REDAÇÃO
function Redacao({addXP,showToast}){
  const [tema,setTema]=useState(""),[ texto,setTexto]=useState(""),[ loading,setLoading]=useState(false),[resultado,setResultado]=useState(null),[view,setView]=useState("editor");
  const palavras=texto.trim().split(/\s+/).filter(Boolean).length;
  const COMPS=[{n:1,label:"Domínio da norma culta",desc:"Gramática, ortografia e pontuação",cor:C.primary},{n:2,label:"Compreensão da proposta",desc:"Entendimento do tema",cor:C.secondary},{n:3,label:"Seleção de argumentos",desc:"Organização e progressão das ideias",cor:C.success},{n:4,label:"Coesão textual",desc:"Conectivos e fluência",cor:C.accent},{n:5,label:"Proposta de intervenção",desc:"Solução detalhada e viável",cor:C.danger}];
  const nivelCor={Iniciante:C.danger,Intermediário:C.accent,Avançado:C.primary,Expert:C.success};

  const corrigir=async()=>{
    if(!tema.trim()||texto.length<100)return;setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Corrija redação ENEM tema "${tema}":\n${texto}\nJSON:{"notas":{"c1":0,"c2":0,"c3":0,"c4":0,"c5":0},"comentarios":{"c1":"...","c2":"...","c3":"...","c4":"...","c5":"..."},"pontos_fortes":["..."],"melhorias":["..."],"nivel":"Iniciante|Intermediário|Avançado|Expert"}`}]})});
      const d=await res.json();const p=JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim());
      const total=Object.values(p.notas).reduce((a,b)=>a+b,0);setResultado({...p,total});addXP(Math.floor(total/10));showToast(`✍️ +${Math.floor(total/10)} XP`);setView("resultado");
    }catch{
      const fb={notas:{c1:160,c2:120,c3:160,c4:120,c5:80},comentarios:{c1:"Boa adequação à norma culta.",c2:"Tema compreendido, tese pode ser mais explícita.",c3:"Argumentação presente, mas carece de embasamento.",c4:"Conectivos adequados, há repetição lexical.",c5:"Proposta existe, mas falta detalhar os 5 elementos."},pontos_fortes:["Domínio da norma culta","Estrutura dissertativa presente"],melhorias:["Fortalecer C5 com os 5 elementos","Diversificar repertório"],nivel:"Intermediário",total:640};
      setResultado(fb);addXP(64);showToast("✍️ +64 XP");setView("resultado");
    }setLoading(false);
  };

  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900}}>✍️ Redação</div>
      <div style={{display:"flex",gap:3,background:C.surface,padding:3,borderRadius:8,border:`1px solid ${C.border}`}}>{["editor","resultado"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",background:view===v?`${C.danger}20`:"transparent",color:view===v?C.danger:C.muted,fontSize:10,fontWeight:700,fontFamily:"inherit"}}>{v==="editor"?"Editor":"Correção"}</button>)}</div>
    </div>
    {view==="editor"?<>
      <div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:5,letterSpacing:1}}>TEMA</div><input value={tema} onChange={e=>setTema(e.target.value)} placeholder="Tema da redação..." style={{width:"100%",padding:"11px 13px",background:C.card,border:`1.5px solid ${tema?C.danger:C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=C.danger} onBlur={e=>e.target.style.borderColor=tema?C.danger:C.border}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>{TEMAS_RED.map((t,i)=><button key={i} onClick={()=>setTema(t)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 8px",cursor:"pointer",fontSize:10,color:C.muted,fontFamily:"inherit",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>{t.length>38?t.slice(0,38)+"…":t}</button>)}</div>
      </div>
      <div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1}}>SUA REDAÇÃO</div><div style={{fontSize:10,color:palavras>500?C.danger:palavras>150?C.success:C.muted}}>{palavras} palavras{palavras>500?" ⚠️":""}</div></div><textarea value={texto} onChange={e=>setTexto(e.target.value)} rows={11} placeholder={"Introdução (apresente o tema e sua tese)\n\nDesenvolvimento 1 (argumento + fundamentação)\n\nDesenvolvimento 2 (argumento + fundamentação)\n\nConclusão (proposta de intervenção com os 5 elementos)"} style={{width:"100%",padding:"13px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,lineHeight:1.75,outline:"none",resize:"vertical",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.danger} onBlur={e=>e.target.style.borderColor=C.border}/></div>
      <Card style={{background:`${C.secondary}0F`,border:`1px solid ${C.secondary}33`,marginBottom:10}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.secondary,marginBottom:4}}>💡 COMPETÊNCIA 5 — Vale 200 pontos</div><div style={{fontSize:11,color:C.text,lineHeight:1.5}}>Inclua: <strong>agente</strong> + <strong>ação</strong> + <strong>meio</strong> + <strong>finalidade</strong> + <strong>detalhamento</strong></div></Card>
      <Btn onClick={corrigir} disabled={loading||!tema.trim()||texto.length<100} full size="lg">{loading?<><Spin size={16}/>Corrigindo...</>:texto.length<100?"Escreva mais para corrigir":"✨ Corrigir com IA"}</Btn>
    </>:resultado?<>
      <div style={{textAlign:"center",marginBottom:14}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:64,fontWeight:900,background:G.primary,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>{resultado.total}</div><div style={{fontSize:11,color:C.muted}}>de 1000 pontos</div><Pill color={nivelCor[resultado.nivel]||C.primary} style={{marginTop:8}}>{resultado.nivel}</Pill></div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {COMPS.map(comp=>{const n=resultado.notas[`c${comp.n}`]||0;return <Card key={comp.n} style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{width:34,height:34,borderRadius:"50%",background:`${comp.cor}20`,border:`2px solid ${comp.cor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:900,color:comp.cor,flexShrink:0}}>{n}</div><div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,marginBottom:3}}>C{comp.n}: {comp.label}</div><div style={{height:3,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(n/200)*100}%`,background:comp.cor,borderRadius:99}}/></div></div></div><div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{resultado.comentarios[`c${comp.n}`]}</div></Card>;})}
      </div>
      {resultado.pontos_fortes&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}><Card style={{background:`${C.success}0F`,border:`1px solid ${C.success}33`,padding:12}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.success,marginBottom:6}}>✅ PONTOS FORTES</div>{resultado.pontos_fortes.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,marginBottom:4}}>• {p}</div>)}</Card><Card style={{background:`${C.danger}0F`,border:`1px solid ${C.danger}33`,padding:12}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.danger,marginBottom:6}}>🎯 MELHORAR</div>{resultado.melhorias?.map((p,i)=><div key={i} style={{fontSize:10,color:C.text,marginBottom:4}}>• {p}</div>)}</Card></div>}
      <Btn onClick={()=>{setView("editor");setResultado(null);}} full>✍️ Reescrever</Btn>
    </>:<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>Escreva e corrija com IA</div>}
  </div>;
}

// TELA 6 — SIMULADO ADAPTATIVO
function Simulado({addXP,showToast}){
  const [fase,setFase]=useState("config"),[nivel,setNivel]=useState(2),[qIdx,setQIdx]=useState(0),[sel,setSel]=useState(null),[rev,setRev]=useState(false),[hist,setHist]=useState([]),[txp,setTxp]=useState(0);
  const TOTAL=8;const q=SIM_Q[nivel][qIdx%SIM_Q[nivel].length];
  const nivelLbl={1:"🟢 Fácil",2:"🟡 Médio",3:"🔴 Difícil"};const nivelCor={1:C.success,2:C.accent,3:C.danger};
  const resp=(i)=>{if(rev)return;setSel(i);setRev(true);const ok=i===q.ans;const xp=ok?q.xp:Math.floor(q.xp*.1);addXP(xp);setTxp(t=>t+xp);if(ok)showToast(`✅ +${xp} XP · ${nivelLbl[nivel]}`);else showToast(`❌ Ajustando nível...`,"warn");setTimeout(()=>{if(ok&&nivel<3)setNivel(n=>Math.min(3,n+1));else if(!ok&&nivel>1)setNivel(n=>Math.max(1,n-1));setHist(h=>[...h,{ok}]);if(hist.length+1>=TOTAL)setFase("resultado");else{setQIdx(i=>i+1);setSel(null);setRev(false);}},1400);};
  if(fase==="config")return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>📊 Simulado Adaptativo</div>
    <div style={{fontSize:13,color:C.muted,marginBottom:16}}>A dificuldade muda em tempo real conforme você responde.</div>
    <Card style={{marginBottom:14,padding:"18px",background:`${C.accent}0F`,border:`1px solid ${C.accent}33`,textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>🧬</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:5}}>Avaliação Adaptativa</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Começa no nível médio. Acertou → sobe para difícil. Errou → cai para fácil. A IA encontra seu nível real.</div></Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>{[[C.success,"🟢 Fácil","50 XP"],[C.accent,"🟡 Médio","100 XP"],[C.danger,"🔴 Difícil","200 XP"]].map(([c,l,x])=><Card key={l} style={{textAlign:"center",padding:"12px 8px"}}><div style={{fontSize:20,marginBottom:4}}>{l.split(" ")[0]}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:c}}>{l.split(" ").slice(1).join(" ")}</div><div style={{fontSize:10,color:C.accent,fontWeight:700,marginTop:2}}>{x}/acerto</div></Card>)}</div>
    <Btn onClick={()=>setFase("simulado")} full size="lg">🚀 Iniciar Simulado</Btn>
  </div>;
  if(hist.length>=TOTAL)return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:48,marginBottom:6}}>📊</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900}}>Concluído!</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{[[`${hist.filter(h=>h.ok).length}/${TOTAL}`,"Acertos",C.primary],[`${Math.round(hist.filter(h=>h.ok).length/TOTAL*100)}%`,"Aproveit.",C.success],[txp,"XP Total",C.accent],[nivelLbl[nivel].split(" ").slice(1).join(" "),"Nível final",nivelCor[nivel]]].map(([v,l,c])=><Card key={l} style={{textAlign:"center",padding:"12px 8px"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:c,lineHeight:1.2}}>{v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{l}</div></Card>)}</div>
    <Card style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1}}>TRAJETÓRIA DE NÍVEL</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{hist.map((h,i)=><div key={i} style={{width:28,height:28,borderRadius:7,background:h.ok?`${C.success}22`:`${C.danger}22`,border:`1.5px solid ${h.ok?C.success:C.danger}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{h.ok?"✓":"✗"}</div>)}</div></Card>
    <Btn onClick={()=>{setFase("config");setHist([]);setNivel(2);setQIdx(0);setTxp(0);}} full>🔄 Novo Simulado</Btn>
  </div>;
  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}}>
    <div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:4}}><span>{hist.length}/{TOTAL} questões</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:nivelCor[nivel]}}>{nivelLbl[nivel]}</span></div><div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(hist.length/TOTAL)*100}%`,background:nivelCor[nivel],borderRadius:99,transition:"width .5s,background .5s"}}/></div></div>
    <Card style={{background:`${nivelCor[nivel]}0D`,border:`1px solid ${nivelCor[nivel]}33`,marginBottom:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🧬</span><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:nivelCor[nivel]}}>Nível: {nivelLbl[nivel]}</div><div style={{fontSize:9,color:C.muted}}>{nivel===3?"Nível máximo!":nivel===2?"Calibrando...":"Ajustamos para te ajudar"}</div></div></Card>
    <Card style={{marginBottom:9,fontSize:13,lineHeight:1.75,padding:"13px"}}>{q.q}</Card>
    <Pill color={C.accent} style={{marginBottom:9,fontSize:10}}>+{q.xp} XP · {nivelLbl[nivel]}</Pill>
    <div style={{display:"flex",flexDirection:"column",gap:7}}>{q.ops.map((op,i)=><AltBtn key={i} alt={op} idx={i} correta={q.ans} selecionada={sel} revealed={rev} onClick={()=>resp(i)}/>)}</div>
  </div>;
}

// TELA 7 — IA SOCRÁTICA
function Socratica({addXP,showToast}){
  const [tema,setTema]=useState(""),[msgs,setMsgs]=useState([]),[inp,setInp]=useState(""),[loading,setLoading]=useState(false),[started,setStarted]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const temas=["Fotossíntese","Funções quadráticas","Revolução Francesa","Imperialismo","Modernismo brasileiro","Tabela periódica"];
  const iniciar=async()=>{if(!tema.trim())return;setStarted(true);setLoading(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,system:`Você é uma IA Socrática. NUNCA dê a resposta direta. Faça perguntas que guiem o aluno a descobrir. Tema: ${tema}. Máx 3 linhas.`,messages:[{role:"user",content:`Quero aprender sobre ${tema}`}]})});const d=await res.json();setMsgs([{role:"ai",text:d.content[0].text}]);}catch{setMsgs([{role:"ai",text:`Ótimo! Sobre ${tema}... antes de explicar, me diga: o que você já sabe ou imagina sobre esse assunto?`}]);}setLoading(false);};
  const enviar=async()=>{if(!inp.trim()||loading)return;const nm=[...msgs,{role:"user",text:inp}];setMsgs(nm);setInp("");setLoading(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,system:`IA Socrática sobre "${tema}". NUNCA responda diretamente. Sempre faça uma pergunta provocativa. Máx 2 linhas.`,messages:nm.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))})});const d=await res.json();setMsgs(p=>[...p,{role:"ai",text:d.content[0].text}]);if(nm.length%4===0){addXP(20);showToast("🧠 +20 XP por raciocínio!");}}catch{setMsgs(p=>[...p,{role:"ai",text:"Interessante! Você consegue pensar em um exemplo prático disso no cotidiano?"}]);}setLoading(false);};
  if(!started)return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🏛️ IA Socrática</div>
    <div style={{fontSize:13,color:C.muted,marginBottom:14}}>A IA não responde — ela te faz pensar e descobrir sozinho.</div>
    <Card style={{marginBottom:14,padding:"18px",textAlign:"center",background:`${C.secondary}0F`,border:`1px solid ${C.secondary}33`}}><div style={{fontSize:36,marginBottom:8}}>🏛️</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>Método Socrático</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>"Só sei que nada sei." — Sócrates<br/>A IA guia com perguntas até você descobrir sozinho.</div></Card>
    <Card style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:7,letterSpacing:1}}>SOBRE O QUE QUER APRENDER?</div><input value={tema} onChange={e=>setTema(e.target.value)} onKeyDown={e=>e.key==="Enter"&&iniciar()} placeholder="Ex: fotossíntese, funções quadráticas..." style={{width:"100%",padding:"12px 13px",background:C.surface,border:`1.5px solid ${tema?C.secondary:C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",marginBottom:10,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.secondary} onBlur={e=>e.target.style.borderColor=tema?C.secondary:C.border}/><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{temas.map(t=><button key={t} onClick={()=>setTema(t)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 9px",cursor:"pointer",fontSize:10,color:C.muted,fontFamily:"inherit",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.secondary;e.currentTarget.style.color=C.secondary;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>{t}</button>)}</div><Btn onClick={iniciar} disabled={!tema.trim()} full variant="primary" size="lg">🏛️ Iniciar Diálogo Socrático</Btn></Card>
  </div>;
  return <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:520,margin:"0 auto"}}>
    <div style={{padding:"10px 18px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
      <button onClick={()=>{setStarted(false);setMsgs([]);setTema("");}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,fontFamily:"inherit"}}>←</button>
      <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700}}>🏛️ IA Socrática</div><div style={{fontSize:10,color:C.muted}}>{tema}</div></div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:10,paddingBottom:80}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"82%",padding:"11px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?G.primary:`${C.secondary}18`,border:m.role==="ai"?`1px solid ${C.secondary}44`:"none",fontSize:13,lineHeight:1.6,color:C.text}}>{m.role==="ai"&&<div style={{fontFamily:"'Syne',sans-serif",fontSize:9,fontWeight:700,color:C.secondary,marginBottom:3}}>🏛️ IA Socrática</div>}{m.text}</div></div>)}
      {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{padding:"11px 14px",background:`${C.secondary}18`,borderRadius:"14px 14px 14px 4px",display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.secondary,animation:`pulse 1.2s ease ${i*.2}s infinite`}}/>)}</div></div>}
      <div ref={endRef}/>
    </div>
    <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"10px 18px",background:`${C.surface}F0`,backdropFilter:"blur(16px)",borderTop:`1px solid ${C.border}`,maxWidth:520,margin:"0 auto"}}>
      <div style={{display:"flex",gap:8}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enviar()} placeholder="Responda com o que você pensa..." disabled={loading} style={{flex:1,padding:"10px 13px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/><Btn onClick={enviar} disabled={loading||!inp.trim()} size="sm">→</Btn></div>
    </div>
  </div>;
}

// TELA 8 — DASHBOARD DO PROFESSOR
function Dashboard(){
  const [tab,setTab]=useState("turma"),[alunoSel,setAlunoSel]=useState(null),[filtro,setFiltro]=useState("todos");
  const ativos=ALUNOS.filter(a=>a.ativo).length,emRisco=ALUNOS.filter(a=>a.risco==="alto").length,progMed=Math.round(ALUNOS.reduce((s,a)=>s+a.progresso||a.prog,0)/ALUNOS.length);
  const areaFrag=Object.keys({lin:0,hum:0,nat:0,mat:0,red:0}).reduce((min,k)=>{const med=ALUNOS.reduce((s,a)=>s+a.areas[k],0)/ALUNOS.length;const minMed=ALUNOS.reduce((s,a)=>s+a.areas[min],0)/ALUNOS.length;return med<minMed?k:min;},"mat");
  const areaFrag2={lin:"Linguagens e Códigos",hum:"Ciências Humanas",nat:"Ciências da Natureza",mat:"Matemática",red:"Redação"};
  const areaCorMap={lin:C.primary,hum:C.secondary,nat:C.success,mat:C.accent,red:C.danger};
  const filtrado=filtro==="todos"?ALUNOS:ALUNOS.filter(a=>a.risco===filtro);
  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:2}}>📊 Dashboard</div>
    <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Prof. Jó — 3º Ano A</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      {[[ativos,`/${ALUNOS.length} ativos`,C.primary,"👥"],[`${progMed}%`,"progresso médio",C.success,"📈"],[emRisco,"em risco",C.danger,"⚠️"],["3d","streak médio",C.accent,"🔥"]].map(([v,l,c,i])=><Card key={l} style={{padding:"11px 12px"}}><div style={{fontSize:18,marginBottom:2}}>{i}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:c,lineHeight:1.1}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></Card>)}
    </div>
    <Card style={{background:`${C.accent}0D`,border:`1px solid ${C.accent}33`,marginBottom:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>📌</span><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.accent}}>Área mais frágil da turma: {areaFrag2[areaFrag]}</div><div style={{fontSize:11,color:C.text,marginTop:2}}>Média de {Math.round(ALUNOS.reduce((s,a)=>s+a.areas[areaFrag],0)/ALUNOS.length)}% — considere programar uma revisão coletiva.</div></div></Card>
    <div style={{display:"flex",gap:3,background:C.surface,padding:3,borderRadius:10,border:`1px solid ${C.border}`,marginBottom:10}}>
      {[["turma","👥 Turma"],["areas","📊 Áreas"],["aluno","🎯 Aluno"]].map(([id,lbl])=><button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"7px",borderRadius:8,border:tab===id?`1px solid ${C.primary}44`:"1px solid transparent",cursor:"pointer",background:tab===id?`${C.primary}18`:"transparent",color:tab===id?C.primary:C.muted,fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif",transition:"all .2s"}}>{lbl}</button>)}
    </div>
    {tab==="turma"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>{[["todos","Todos"],["baixo","Baixo risco"],["medio","Atenção"],["alto","Risco alto"]].map(([id,lbl])=><button key={id} onClick={()=>setFiltro(id)} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:filtro===id?(id==="todos"?C.primary:RISCO_COR[id]):C.card,color:filtro===id?"#000":C.muted,fontFamily:"inherit",transition:"all .2s"}}>{lbl}{id!=="todos"?` (${ALUNOS.filter(a=>a.risco===id).length})`:""}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>{filtrado.map(a=><Card key={a.id} onClick={()=>{setAlunoSel(a);setTab("aluno");}} style={{padding:"11px 13px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:a.ativo?G.primary:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:a.ativo?"#fff":C.muted,fontFamily:"'Syne',sans-serif"}}>{a.av}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text}}>{a.nome}</div><span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:20,background:`${RISCO_COR[a.risco]}18`,color:RISCO_COR[a.risco]}}>{RISCO_LBL[a.risco]}</span>{!a.ativo&&<span style={{fontSize:9,color:C.muted,background:C.surface,padding:"1px 6px",borderRadius:20}}>Inativo</span>}</div><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{flex:1,height:3,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${a.prog}%`,background:RISCO_COR[a.risco],borderRadius:99}}/></div><span style={{fontSize:9,color:C.muted}}>{a.prog}%</span></div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:10,color:C.accent,fontWeight:700}}>🔥{a.streak}d</div><div style={{fontSize:9,color:C.muted}}>Nv{a.nivel}</div></div></div></Card>)}</div>
    </div>}
    {tab==="areas"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {Object.entries(areaFrag2).map(([k,label])=>{const vals=ALUNOS.map(a=>a.areas[k]),med=Math.round(vals.reduce((s,v)=>s+v,0)/vals.length),cor=areaCorMap[k];return <Card key={k} style={{padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700}}>{label}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:cor}}>{med}%</div></div><div style={{height:5,background:C.border,borderRadius:99,overflow:"hidden",marginBottom:7}}><div style={{height:"100%",width:`${med}%`,background:cor,borderRadius:99}}/></div><div style={{display:"flex",gap:12,fontSize:11,color:C.muted}}><span>Mín: <strong style={{color:C.danger}}>{Math.min(...vals)}%</strong></span><span>Máx: <strong style={{color:C.success}}>{Math.max(...vals)}%</strong></span><span>Abaixo 50%: <strong style={{color:C.accent}}>{vals.filter(v=>v<50).length}</strong></span></div></Card>;})}
    </div>}
    {tab==="aluno"&&(alunoSel?<div>
      <button onClick={()=>setTab("turma")} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:12,marginBottom:12,display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>← Turma</button>
      <Card style={{marginBottom:10}}><div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}><div style={{width:46,height:46,borderRadius:"50%",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif"}}>{alunoSel.av}</div><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:C.text}}>{alunoSel.nome}</div><div style={{display:"flex",gap:5,marginTop:4}}><Pill color={C.primary} style={{fontSize:9}}>Nv{alunoSel.nivel}</Pill><Pill color={RISCO_COR[alunoSel.risco]} style={{fontSize:9}}>{RISCO_LBL[alunoSel.risco]}</Pill></div></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>{[[`${alunoSel.prog}%`,"Progresso",C.success],[alunoSel.xp.toLocaleString(),"XP Total",C.primary],[`${alunoSel.streak}d`,"Streak",C.accent]].map(([v,l,c])=><div key={l} style={{background:C.surface,borderRadius:8,padding:"8px",textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>)}</div></Card>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1}}>DESEMPENHO POR ÁREA</div>
      {Object.entries(areaFrag2).map(([k,label])=>{const v=alunoSel.areas[k],cor=v<50?C.danger:v<70?C.accent:C.success;return <Card key={k} style={{marginBottom:6,padding:"10px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{fontSize:11,flex:1}}>{label}</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:cor}}>{v}%</div></div><div style={{height:3,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${v}%`,background:cor,borderRadius:99}}/></div></Card>;})}
      <Card style={{background:`${C.secondary}0D`,border:`1px solid ${C.secondary}33`,padding:"12px 13px",marginTop:8}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:C.secondary,marginBottom:4}}>🤖 RECOMENDAÇÃO DA IA</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{alunoSel.risco==="alto"?`${alunoSel.nome} apresenta risco de evasão — contato imediato recomendado.`:alunoSel.risco==="medio"?`${alunoSel.nome} tem potencial. Incentive desafios nas áreas mais fracas.`:`${alunoSel.nome} está no caminho certo! Desafios avançados para manter o engajamento.`}</div></Card>
    </div>:<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}><div style={{fontSize:32,marginBottom:10}}>👆</div>Selecione um aluno na aba Turma</div>)}
  </div>;
}

// TELA 9 — PLANOS E PAGAMENTO (mock validado)
function Planos({showToast}){
  const [planSel,setPlanSel]=useState(null);
  const [step,setStep]=useState("planos"); // planos | checkout | processando | confirmado
  const [form,setForm]=useState({nome:"",email:"",cpf:"",cartao:"",validade:"",cvv:"",parcelas:"1"});
  const [errors,setErrors]=useState({});

  const PLANOS=[
    {id:"plus",name:"Plus",price:39,per:"mês",desc:"Para o estudante",color:C.primary,destaque:true,items:["Questões ilimitadas + IA","Trilhas adaptativas","Redações ilimitadas","Simulado Adaptativo","Modo Batalha PvP","IA Socrática","Relatório familiar"]},
    {id:"escola",name:"Escola",price:2400,per:"mês",desc:"Para professores",color:C.success,items:["Turmas ilimitadas","Dashboard pedagógico","API Educacional Aberta","Batalha Coletiva","Suporte dedicado"]},
  ];

  const formatCartao=v=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatValidade=v=>v.replace(/\D/g,"").slice(0,4).replace(/^(\d{2})(\d)/,"$1/$2");
  const formatCPF=v=>v.replace(/\D/g,"").slice(0,11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");

  const validate=()=>{const e={};if(!form.nome.trim())e.nome="Nome obrigatório";if(!form.email.includes("@"))e.email="E-mail inválido";if(form.cpf.replace(/\D/g,"").length<11)e.cpf="CPF inválido";if(form.cartao.replace(/\D/g,"").length<16)e.cartao="Número inválido";if(form.validade.replace(/\D/g,"").length<4)e.validade="Data inválida";if(form.cvv.length<3)e.cvv="CVV inválido";setErrors(e);return Object.keys(e).length===0;};

  const pagar=()=>{if(!validate())return;setStep("processando");setTimeout(()=>{setStep("confirmado");showToast(`✅ Pagamento confirmado! Plano ${planSel?.name} ativo.`);},2200);};

  const Field=({label,field,placeholder,format,maxLen,half})=><div style={{marginBottom:12,gridColumn:half?"auto":"1/-1"}}><div style={{fontSize:11,fontWeight:700,color:errors[field]?C.danger:C.muted,marginBottom:5,letterSpacing:.3}}>{label}{errors[field]&&<span style={{color:C.danger,marginLeft:6,fontWeight:400,fontSize:10}}>— {errors[field]}</span>}</div><input value={form[field]} onChange={e=>{const v=format?format(e.target.value):e.target.value.slice(0,maxLen||100);setForm(f=>({...f,[field]:v}));if(errors[field])setErrors(er=>({...er,[field]:""}));}} placeholder={placeholder} style={{width:"100%",padding:"12px 14px",background:C.card,border:`1.5px solid ${errors[field]?C.danger:form[field]?C.primary:C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=errors[field]?C.danger:C.primary} onBlur={e=>e.target.style.borderColor=errors[field]?C.danger:form[field]?C.primary:C.border}/></div>;

  if(step==="confirmado")return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{textAlign:"center",padding:"40px 0"}}>
      <div style={{fontSize:72,marginBottom:14}} className="pop">🎉</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,color:C.success,marginBottom:8}}>Pagamento Confirmado!</div>
      <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.6}}>Seu plano <strong style={{color:C.primary}}>{planSel?.name}</strong> está ativo.<br/>Aproveite todos os recursos desbloqueados!</div>
      <Card style={{background:`${C.success}0F`,border:`1px solid ${C.success}33`,marginBottom:20,padding:"16px",textAlign:"left"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.success,marginBottom:10}}>✅ RESUMO DA COMPRA</div>
        {[["Plano",planSel?.name],["Valor",`R$ ${planSel?.price.toLocaleString("pt-BR")}/mês`],["Titular",form.nome],["E-mail",form.email],["Cartão",`•••• •••• •••• ${form.cartao.replace(/\D/g,"").slice(-4)}`],["Status","Aprovado ✓"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}><span style={{color:C.muted}}>{k}</span><span style={{color:C.text,fontWeight:600}}>{v}</span></div>)}
      </Card>
      <Card style={{background:`${C.primary}0D`,border:`1px solid ${C.primary}33`,padding:"12px 14px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.primary,marginBottom:4}}>📧 COMPROVANTE ENVIADO</div>
        <div style={{fontSize:11,color:C.text}}>Um e-mail de confirmação foi enviado para <strong>{form.email}</strong> com o recibo e instruções de acesso.</div>
      </Card>
      <Btn onClick={()=>{setStep("planos");setPlanSel(null);setForm({nome:"",email:"",cpf:"",cartao:"",validade:"",cvv:"",parcelas:"1"});}} full variant="ghost">← Voltar aos planos</Btn>
    </div>
  </div>;

  if(step==="processando")return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}}>
    <div style={{textAlign:"center",padding:"80px 0"}}>
      <Spin size={48} color={C.primary}/><br/><br/>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Processando pagamento...</div>
      <div style={{fontSize:13,color:C.muted}}>Aguarde, estamos confirmando com a operadora.</div>
    </div>
  </div>;

  if(step==="checkout"&&planSel)return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <button onClick={()=>setStep("planos")} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>← Voltar</button>
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,marginBottom:4}}>💳 Checkout</div>
    <Card style={{background:`${planSel.color}0D`,border:`1px solid ${planSel.color}33`,marginBottom:16,padding:"12px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:planSel.color}}>Plano {planSel.name}</div><div style={{fontSize:11,color:C.muted}}>{planSel.desc}</div></div><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:C.text}}>R$ {planSel.price}<span style={{fontSize:12,color:C.muted}}>/{planSel.per}</span></div></div>
    </Card>
    {/* Aviso ambiente de teste */}
    <div style={{background:`${C.accent}11`,border:`1px solid ${C.accent}33`,borderRadius:10,padding:"10px 13px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
      <div style={{fontSize:11,color:C.accent,lineHeight:1.5}}><strong>Ambiente de validação</strong> — Nenhuma cobrança real será efetuada. Use dados fictícios para testar o fluxo. Em produção, este módulo conecta-se ao gateway Stripe/Pagar.me com PCI DSS.</div>
    </div>
    <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:.5}}>DADOS PESSOAIS</div>
    <Field label="Nome completo" field="nome" placeholder="Seu nome completo" maxLen={80}/>
    <Field label="E-mail" field="email" placeholder="seu@email.com" maxLen={100}/>
    <Field label="CPF" field="cpf" placeholder="000.000.000-00" format={formatCPF}/>
    <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:.5,marginTop:4}}>DADOS DO CARTÃO</div>
    <Field label="Número do cartão" field="cartao" placeholder="0000 0000 0000 0000" format={formatCartao}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
      <div><div style={{fontSize:11,fontWeight:700,color:errors.validade?C.danger:C.muted,marginBottom:5}}>Validade{errors.validade&&<span style={{color:C.danger,marginLeft:4,fontSize:10}}>— {errors.validade}</span>}</div><input value={form.validade} onChange={e=>setForm(f=>({...f,validade:formatValidade(e.target.value)}))} placeholder="MM/AA" style={{width:"100%",padding:"11px 12px",background:C.card,border:`1.5px solid ${errors.validade?C.danger:C.border}`,borderRadius:9,color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border}/></div>
      <div><div style={{fontSize:11,fontWeight:700,color:errors.cvv?C.danger:C.muted,marginBottom:5}}>CVV{errors.cvv&&<span style={{color:C.danger,marginLeft:4,fontSize:10}}>— {errors.cvv}</span>}</div><input value={form.cvv} onChange={e=>setForm(f=>({...f,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="123" style={{width:"100%",padding:"11px 12px",background:C.card,border:`1.5px solid ${errors.cvv?C.danger:C.border}`,borderRadius:9,color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border}/></div>
      <div><div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5}}>Parcelas</div><select value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))} style={{width:"100%",padding:"11px 10px",background:C.card,border:`1.5px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}>{["1","2","3","6","12"].map(p=><option key={p} value={p}>{p}x {p==="1"?"sem juros":p==="2"?"sem juros":p==="3"?"sem juros":"com juros"}</option>)}</select></div>
    </div>
    <div style={{background:`${C.success}0D`,border:`1px solid ${C.success}33`,borderRadius:10,padding:"10px 13px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>🔒</span><div style={{fontSize:11,color:C.success}}>Pagamento <strong>100% seguro</strong> · Criptografia SSL · PCI DSS Nível 1 · Dados protegidos</div></div>
    <Btn onClick={pagar} full size="lg" variant="success">🔒 Pagar R$ {planSel.price.toLocaleString("pt-BR")}/{planSel.per}</Btn>
    <div style={{textAlign:"center",marginTop:8,fontSize:11,color:C.muted}}>Ao pagar, você concorda com os <span style={{color:C.primary,cursor:"pointer"}}>Termos de Uso</span> e <span style={{color:C.primary,cursor:"pointer"}}>Política de Privacidade</span>.</div>
  </div>;

  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>⭐ Planos e Pagamento</div>
    <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Escolha o plano ideal e desbloqueie todos os recursos.</div>
    {/* Free */}
    <Card style={{marginBottom:10,padding:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:C.muted}}>Free</div><div style={{fontSize:11,color:C.muted}}>Para começar</div></div><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:C.text}}>R$ 0<span style={{fontSize:12,color:C.muted}}>/mês</span></div></div>
      {["10 questões/dia","Gamificação básica","2 redações/mês","Diagnóstico cognitivo"].map((i,k)=><div key={k} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:C.success}}>✓</span><span style={{fontSize:12,color:C.muted}}>{i}</span></div>)}
      <div style={{marginTop:10,background:`${C.border}`,height:1,marginBottom:10}}/>
      <Btn onClick={()=>showToast("✅ Você já está no plano Free!")} full variant="ghost" size="sm">Plano atual</Btn>
    </Card>
    {PLANOS.map(p=><Card key={p.id} style={{marginBottom:10,padding:"14px",border:`2px solid ${p.destaque?p.color:C.border}`,boxShadow:p.destaque?`0 8px 32px ${p.color}22`:"none",position:"relative"}}>
      {p.destaque&&<div style={{position:"absolute",top:-12,left:16,background:G.primary,color:"#fff",borderRadius:99,padding:"3px 12px",fontSize:10,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>⭐ MAIS POPULAR</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:p.color}}>{p.name}</div><div style={{fontSize:11,color:C.muted}}>{p.desc}</div></div><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:C.text}}>R$ {p.price.toLocaleString("pt-BR")}<span style={{fontSize:12,color:C.muted}}>/{p.per}</span></div></div>
      {p.items.map((i,k)=><div key={k} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:p.color,fontWeight:700}}>✓</span><span style={{fontSize:12,color:C.text}}>{i}</span></div>)}
      <div style={{marginTop:10,background:C.border,height:1,marginBottom:10}}/>
      <Btn onClick={()=>{setPlanSel(p);setStep("checkout");}} full variant={p.destaque?"primary":"success"} size="sm">Assinar {p.name} →</Btn>
    </Card>)}
    <div style={{background:`${C.muted}11`,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginTop:4}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>ℹ️ SOBRE A MODALIDADE DE PAGAMENTO</div>
      <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>
        • <strong style={{color:C.text}}>Pagamento recorrente</strong> mensal via cartão de crédito<br/>
        • <strong style={{color:C.text}}>Cancelamento</strong> a qualquer momento, sem multa<br/>
        • <strong style={{color:C.text}}>Gateway</strong>: Stripe / Pagar.me (produção) — PCI DSS Nível 1<br/>
        • <strong style={{color:C.text}}>NF-e</strong> emitida automaticamente após confirmação<br/>
        • <strong style={{color:C.text}}>Reembolso</strong> integral em até 7 dias (art. 49 CDC)<br/>
        • <strong style={{color:C.text}}>Ambiente atual</strong>: validação — sem cobranças reais
      </div>
    </div>
  </div>;
}

// TELA 10 — PERFIL
function Perfil({profile,onNav}){
  const badges=[{icon:"⭐",label:"Primeiro Acerto",e:true},{icon:"🔥",label:"3 dias seguidos",e:true},{icon:"💎",label:"Perfeito",e:true},{icon:"🏆",label:"Mestre da Área",e:false},{icon:"🎯",label:"100 Questões",e:false},{icon:"📚",label:"Todas as Áreas",e:false}];
  const hist=[{area:"Linguagens e Códigos",icon:"📚",acertos:3,total:3,xp:450,data:"Hoje"},{area:"Matemática",icon:"📐",acertos:2,total:3,xp:200,data:"Ontem"},{area:"Redação",icon:"✍️",acertos:1,total:1,xp:150,data:"Seg"}];
  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{textAlign:"center",marginBottom:22}}>
      <div style={{width:70,height:70,borderRadius:"50%",margin:"0 auto 10px",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Syne',sans-serif",boxShadow:`0 0 20px ${C.primary}44`}}>{profile.name[0]}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900}}>{profile.name}</div>
      <div style={{fontSize:12,color:C.muted,marginTop:2}}>Estudante ENEM</div>
      <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10,flexWrap:"wrap"}}><Pill color={C.primary}>⚡ Nível {profile.level}</Pill><Pill color={C.accent}>🔥 {profile.streak} dias</Pill><Pill color={C.success}>💰 {profile.xp} XP</Pill></div>
    </div>
    <Card style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:8,letterSpacing:1}}>PROGRESSO</div><XPBar xp={profile.xp} level={profile.level}/><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>{[["47","Questões",C.primary],["3","Redações",C.secondary],["78%","Acertos",C.success]].map(([v,l,c])=><div key={l} style={{background:C.surface,borderRadius:8,padding:"9px",textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>)}</div></Card>
    <Card style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1}}>CONQUISTAS</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>{badges.map(b=><div key={b.label} style={{textAlign:"center",padding:"10px 6px",borderRadius:9,background:b.e?`${C.primary}10`:C.surface,border:`1px solid ${b.e?C.primary:C.border}`,opacity:b.e?1:.4}}><div style={{fontSize:22,marginBottom:3}}>{b.icon}</div><div style={{fontSize:9,color:b.e?C.primary:C.muted,fontWeight:b.e?700:400,lineHeight:1.2}}>{b.label}</div></div>)}</div></Card>
    <Card style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,letterSpacing:1}}>HISTÓRICO RECENTE</div>{hist.map((h,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<hist.length-1?`1px solid ${C.border}`:"none"}}><div style={{fontSize:20}}>{h.icon}</div><div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text}}>{h.area}</div><div style={{fontSize:10,color:C.muted}}>{h.data} · {h.acertos}/{h.total} acertos</div></div><Pill color={C.accent} style={{fontSize:10}}>+{h.xp} XP</Pill></div>)}</Card>
    <Btn onClick={()=>onNav("planos")} full variant="gold">⭐ Upgrade para Plus — R$39/mês</Btn>
  </div>;
}

// TELA 11 — MAIS (menu)
function Mais({onNav}){
  const itens=[
    {icon:"📊",title:"Simulado Adaptativo",screen:"simulado",color:C.accent,desc:"Dificuldade em tempo real",hot:true},
    {icon:"🏛️",title:"IA Socrática",screen:"socratica",color:C.secondary,desc:"Aprenda descobrindo sozinho",hot:true},
    {icon:"⭐",title:"Planos e Pagamento",screen:"planos",color:C.accent,desc:"Upgrade para Plus"},
    {icon:"👤",title:"Meu Perfil",screen:"perfil",color:C.primary,desc:"XP, conquistas e histórico"},
  ];
  return <div style={{padding:"18px 18px 90px",maxWidth:520,margin:"0 auto"}} className="fu">
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:16}}>⋯ Explorar</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {itens.map(item=><Card key={item.screen} onClick={()=>onNav(item.screen)} style={{padding:"13px 14px",position:"relative"}}>
        {item.hot&&<div style={{position:"absolute",top:10,right:10,background:C.danger,color:"#fff",fontSize:8,fontWeight:900,padding:"2px 6px",borderRadius:99,fontFamily:"'Syne',sans-serif"}}>NOVO</div>}
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:11,background:`${item.color}20`,border:`1px solid ${item.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{item.icon}</div><div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{item.title}</div><div style={{fontSize:10,color:C.muted}}>{item.desc}</div></div><span style={{color:C.muted}}>→</span></div>
      </Card>)}
    </div>
  </div>;
}

// APP ROOT — máquina de estados completa

function Landing({ onStart, onDemo, onLogin }) {
  const feats = [
    ["🧠","IA Diagnóstica","Mapeia seu perfil e adapta cada questão ao seu nível real."],
    ["⚔️","Batalha PvP","Duelos em tempo real — XP duplo ao vencer."],
    ["✍️","Redação com IA","Correção nas 5 competências do ENEM com nota e feedback."],
    ["📊","Simulado Adaptativo","Dificuldade calibrada em tempo real conforme você responde."],
    ["🏛️","IA Socrática","Aprenda descobrindo — a IA te faz pensar, não decora."],
    ["🏆","Certificados","Conquistas com QR code e hash criptográfico."],
  ];
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <div style={{ position:"fixed", top:-150, left:-150, width:500, height:500, borderRadius:"50%",
        background:`radial-gradient(circle,${C.primary}0A,transparent 65%)`, pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:-150, right:-150, width:450, height:450, borderRadius:"50%",
        background:`radial-gradient(circle,${C.secondary}0A,transparent 65%)`, pointerEvents:"none" }}/>

      {/* Nav minimalista */}
      <nav style={{ position:"sticky", top:0, zIndex:200, background:`${C.surface}EC`,
        backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"0 20px",
          height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:22, letterSpacing:-.5 }}>
            <span style={{ color:C.primary }}>Nota</span>
            <span style={{ background:`linear-gradient(135deg,${C.accent},#F97316)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}> A</span>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Pill color={C.success}>🟢 MVP ao vivo</Pill>
            <button onClick={onLogin} style={{ padding:"8px 20px", borderRadius:10,
              border:`1.5px solid ${C.border}`, fontSize:13, fontWeight:700, color:C.muted,
              background:"transparent", transition:"all .2s", cursor:"pointer" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              Entrar
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 20px" }}>
        {/* Hero */}
        <div style={{ textAlign:"center", padding:"80px 0 88px" }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif",
            fontSize:"clamp(36px,6vw,64px)", fontWeight:900,
            lineHeight:1.03, letterSpacing:-2.5, marginBottom:24, color:C.text }}>
            Aprenda jogando.<br/>
            <span style={{ background:`linear-gradient(135deg,${C.primary},${C.secondary},${C.accent})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Evolua estudando.
            </span>
          </h1>
          <p style={{ fontSize:18, color:C.muted, lineHeight:1.8,
            maxWidth:560, margin:"0 auto 48px" }}>
            A plataforma que entende como você aprende, adapta o conteúdo ao seu perfil
            e transforma sua preparação para o ENEM em uma jornada épica.
          </p>
          {/* Botões hero com design premium */}
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:18 }}>
            <button onClick={onStart}
              style={{ padding:"17px 40px", borderRadius:14, border:"none",
                background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
                fontSize:17, fontWeight:800, color:"#fff",
                fontFamily:"'Syne',sans-serif", letterSpacing:.3,
                boxShadow:`0 6px 28px ${C.primary}44`, cursor:"pointer",
                transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow=`0 12px 40px ${C.primary}55`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 6px 28px ${C.primary}44`;}}>
              ✨ Começar Grátis
            </button>
            <button onClick={onDemo}
              style={{ padding:"16px 32px", borderRadius:14,
                border:`1.5px solid ${C.border}`, background:"transparent",
                fontSize:16, fontWeight:700, color:C.muted,
                cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary;e.currentTarget.style.background=`${C.primary}0A`;e.currentTarget.style.transform="scale(1.02)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent";e.currentTarget.style.transform="scale(1)";}}>
              Ver demonstração →
            </button>
          </div>
          <p style={{ fontSize:13, color:C.muted }}>Sem cartão · 100% gratuito · Cancele quando quiser</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:80 }}>
          {[["9,3M","candidatos/ano",C.primary],["57%","reprovam",C.danger],["R$ 0","para começar",C.success],["IA","adaptativa",C.secondary]].map(([v,l,c])=>(
            <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`,
              borderRadius:18, padding:"22px 14px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:900, color:c, marginBottom:6 }}>{v}</div>
              <div style={{ fontSize:12, color:C.muted }}>{l}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function AuthModal({mode,onClose,onComplete}){
  const[tab,setTab]=useState(mode||"cadastro");
  const[step,setStep]=useState("form");
  const[nome,setNome]=useState("");
  const[email,setEmail]=useState("");
  const[senha,setSenha]=useState("");
  const[conf,setConf]=useState("");
  const[tipo,setTipo]=useState("estudante");
  const[err,setErr]=useState("");

  const reset=(t)=>{setTab(t);setStep("form");setErr("");setNome("");setEmail("");setSenha("");setConf("");setTipo("estudante");};
  const IS=(v)=>({width:"100%",padding:"12px 14px",background:C.surface,border:`1.5px solid ${v?C.primary:C.border}`,borderRadius:11,color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"});
  const FO=(e)=>e.target.style.borderColor=C.primary;
  const FB=(e,v)=>e.target.style.borderColor=v?C.primary:C.border;

  const doLogin=()=>{
    if(!email.includes("@"))return setErr("E-mail inválido.");
    if(senha.length<6)return setErr("Senha deve ter ao menos 6 caracteres.");
    setStep("ok");
    setTimeout(()=>onComplete({tipo:"login",nome:email.split("@")[0],tipoPerfil:"estudante"}),900);
  };
  const doCadastro=()=>{
    if(!nome.trim())return setErr("Informe seu nome.");
    if(!email.includes("@"))return setErr("E-mail inválido.");
    if(senha.length<6)return setErr("Senha deve ter ao menos 6 caracteres.");
    if(senha!==conf)return setErr("As senhas não coincidem.");
    setStep("ok");
    setTimeout(()=>onComplete({tipo:"cadastro",nome:nome.trim(),tipoPerfil:tipo}),900);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.76)",zIndex:9000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,
        borderRadius:22,padding:28,maxWidth:380,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>

        {step==="ok"?(
          <div style={{textAlign:"center",padding:"28px 0"}}>
            <div style={{fontSize:52,marginBottom:12}}>✅</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:C.success,marginBottom:6}}>
              {tab==="login"?"Login realizado!":"Conta criada!"}
            </div>
            <div style={{fontSize:13,color:C.muted}}>{tab==="login"?"Acessando...":"Preparando perfil..."}</div>
          </div>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18}}>
                  <span style={{color:C.primary}}>Nota</span>
                  <span style={{background:`linear-gradient(135deg,${C.accent},#F97316)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
                </div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{tab==="login"?"Acesse sua conta":"Crie sua conta gratuita"}</div>
              </div>
              <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,
                background:"none",color:C.muted,fontSize:16,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>

            <div style={{display:"flex",background:C.surface,padding:3,borderRadius:10,
              border:`1px solid ${C.border}`,marginBottom:20}}>
              {[["cadastro","Criar conta"],["login","Entrar"]].map(([id,lbl])=>(
                <button key={id} onClick={()=>reset(id)} style={{flex:1,padding:"8px",borderRadius:8,
                  border:"none",cursor:"pointer",background:tab===id?`${C.primary}22`:"transparent",
                  color:tab===id?C.primary:C.muted,fontSize:13,fontWeight:700,
                  fontFamily:"'Syne',sans-serif",transition:"all .2s"}}>{lbl}</button>
              ))}
            </div>

            {tab==="login"&&(<>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5}}>E-MAIL</div>
              <input autoFocus type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="seu@email.com" style={IS(email)} onFocus={FO} onBlur={e=>FB(e,email)}/>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,marginTop:10}}>SENHA</div>
              <input type="password" value={senha} onChange={e=>{setSenha(e.target.value);setErr("");}} placeholder="Sua senha" style={IS(senha)} onFocus={FO} onBlur={e=>FB(e,senha)}/>
              {err&&<div style={{background:`${C.danger}15`,border:`1px solid ${C.danger}44`,borderRadius:9,padding:"8px 12px",marginTop:10,fontSize:12,color:C.danger}}>⚠️ {err}</div>}
              <button onClick={doLogin} style={{width:"100%",padding:"14px",marginTop:14,borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.primary},${C.secondary})`,cursor:"pointer",fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>Entrar →</button>
              <div style={{textAlign:"center",marginTop:12}}>
                <span style={{fontSize:12,color:C.primary,cursor:"pointer"}} onClick={()=>reset("cadastro")}>Não tem conta? Criar agora</span>
              </div>
            </>)}

            {tab==="cadastro"&&(<>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5}}>NOME COMPLETO</div>
              <input autoFocus type="text" value={nome} onChange={e=>{setNome(e.target.value);setErr("");}} placeholder="Seu nome" style={IS(nome)} onFocus={FO} onBlur={e=>FB(e,nome)}/>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,marginTop:10}}>E-MAIL</div>
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="seu@email.com" style={IS(email)} onFocus={FO} onBlur={e=>FB(e,email)}/>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,marginTop:10}}>SENHA <span style={{fontWeight:400,fontSize:10}}>(mín. 6 car.)</span></div>
              <input type="password" value={senha} onChange={e=>{setSenha(e.target.value);setErr("");}} placeholder="Crie uma senha" style={IS(senha)} onFocus={FO} onBlur={e=>FB(e,senha)}/>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,marginTop:10}}>CONFIRMAR SENHA</div>
              <input type="password" value={conf} onChange={e=>{setConf(e.target.value);setErr("");}} placeholder="Repita a senha" style={IS(conf&&conf===senha)} onFocus={FO} onBlur={e=>FB(e,false)}/>

              <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:10,marginTop:14}}>TIPO DE PERFIL</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {[{id:"estudante",icon:"🎓",label:"Estudante",desc:"Quero me preparar para o ENEM"},
                  {id:"professor",icon:"👨‍🏫",label:"Professor",desc:"Acompanho turmas e alunos"},
                  {id:"escola",icon:"🏛️",label:"Escola",desc:"Acesso institucional"}
                ].map(p=>(
                  <div key={p.id} onClick={()=>setTipo(p.id)} style={{display:"flex",alignItems:"center",
                    gap:10,padding:"11px 13px",borderRadius:11,cursor:"pointer",
                    border:`1.5px solid ${tipo===p.id?C.primary:C.border}`,
                    background:tipo===p.id?`${C.primary}10`:C.surface,transition:"all .18s"}}>
                    <span style={{fontSize:20}}>{p.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,
                        color:tipo===p.id?C.primary:C.text}}>{p.label}</div>
                      <div style={{fontSize:11,color:C.muted}}>{p.desc}</div>
                    </div>
                    {tipo===p.id&&<span style={{color:C.primary}}>✓</span>}
                  </div>
                ))}
              </div>
              {err&&<div style={{background:`${C.danger}15`,border:`1px solid ${C.danger}44`,borderRadius:9,padding:"8px 12px",marginBottom:10,fontSize:12,color:C.danger}}>⚠️ {err}</div>}
              <button onClick={doCadastro} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.primary},${C.secondary})`,cursor:"pointer",fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif"}}>✨ Criar minha conta →</button>
              <div style={{textAlign:"center",marginTop:12}}>
                <span style={{fontSize:12,color:C.primary,cursor:"pointer"}} onClick={()=>reset("login")}>Já tenho conta — Entrar</span>
              </div>
            </>)}
          </>
        )}
      </div>
    </div>
  );
}


export default function NotaAValidacao() {
  const[appState,setAppState]=useState("landing");
  const[screen,setScreen]=useState("home");
  const[quizArea,setQuizArea]=useState(null);
  const[profile,setProfile]=useState({name:"Estudante",level:3,xp:620,streak:3,tipoPerfil:"estudante"});
  const[toast,showToast]=useToast();
  const[modal,setModal]=useState(null);

  const addXP = useCallback((amount) => {
    setProfile(p => {
      const nx = p.xp + amount, max = p.level * 500;
      if (nx >= max) { showToast(`🎉 Subiu para Nível ${p.level+1}!`); return {...p, xp:nx-max, level:p.level+1}; }
      return {...p, xp:nx};
    });
  }, [showToast]);

  const onNav = useCallback((s, area=null) => {
    setScreen(s);
    if (s === "quiz" && area) setQuizArea(area);
    else if (s !== "quiz") setQuizArea(null);
  }, []);

  const handleAuthComplete = useCallback((data) => {
    setModal(null);
    const nome = data.nome || "Estudante";
    setProfile(p => ({ ...p, name:nome, tipoPerfil:data.tipoPerfil || "estudante" }));
      if (data.tipoPerfil === "estudante" && data.tipo === "cadastro") {
      setAppState("onboarding");
    } else {
      setAppState("app");
      setScreen("home");
    }
  }, []);

  const handleDemo = useCallback(() => {
    setProfile(p => ({ ...p, name:"Estudante" }));
    setAppState("app");
    setScreen("home");
    showToast("👀 Modo demo!");
  },[showToast]);

  const onComplete = useCallback((data) => {
    setProfile(p => ({ ...p, name: data.nome || p.name }));
    setAppState("app");
    setScreen("home");
  }, []);

  if (appState === "landing") return (
    <>
      <style>{CSS}</style>
      <Toast {...toast}/>
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onComplete={handleAuthComplete}/>}
      <Landing
        onStart={() => setModal("cadastro")}
        onDemo={handleDemo}
        onLogin={() => setModal("login")}
      />
    </>
  );

  if (appState === "onboarding") return (
    <><style>{CSS}</style><Toast {...toast}/><Onboarding onComplete={onComplete}/></>
  );

  const screens = {
    home:      <Home      profile={profile} onNav={onNav}/>,
    quiz:      <Quiz      addXP={addXP} showToast={showToast} initialArea={quizArea}/>,
    redacao:   <Redacao   addXP={addXP} showToast={showToast}/>,
    dashboard: <Dashboard/>,
    simulado:  <Simulado  addXP={addXP} showToast={showToast}/>,
    socratica: <Socratica addXP={addXP} showToast={showToast}/>,
    planos:    <Planos    showToast={showToast}/>,
    perfil:    <Perfil    profile={profile} onNav={onNav}/>,
    mais:      <Mais      onNav={onNav}/>,
  };

  return (
    <>
      <style>{CSS}</style>
      <Toast {...toast}/>
      <div style={{ background:C.bg, minHeight:"100vh" }}>
        <TopBar screen={screen} profile={profile}/>
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          {screens[screen] || screens.home}
        </div>
        <NavBar screen={screen} onNav={onNav}/>
      </div>
    </>
  );
}

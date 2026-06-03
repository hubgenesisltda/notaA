import { useState } from "react";

// ── Tokens ──────────────────────────────────────────────────
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
html{scroll-behavior:smooth;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden;}
button,input{font-family:inherit;cursor:pointer;border:none;background:none;outline:none;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes glow{0%,100%{opacity:.4;}50%{opacity:.85;}}
.fu{animation:fadeUp .5s ease both;}
.fu2{animation:fadeUp .5s .12s ease both;}
.fu3{animation:fadeUp .5s .24s ease both;}
@media(max-width:640px){
  .g4{grid-template-columns:1fr 1fr!important;}
  .g3{grid-template-columns:1fr!important;}
  .g2{grid-template-columns:1fr!important;}
  .fg{grid-template-columns:1fr!important;}
  .hbtns{flex-direction:column!important;align-items:stretch!important;}
  .hnav{display:none!important;}
.em{font-family:initial!important;}
}
`;

// ── UI atoms ────────────────────────────────────────────────
function Tag({ children, color = C.primary }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,
      background:`${color}18`,border:`1px solid ${color}40`,
      borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:700,color}}>
      {children}
    </span>
  );
}

function CTA({ children, onClick, ghost, full }) {
  const [h,sH] = useState(false);
  if (ghost) return (
    <button onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
        padding:"16px 32px",borderRadius:14,
        border:`1.5px solid ${h?C.primary:C.border}`,
        fontSize:15,fontWeight:700,color:h?C.primary:C.muted,
        background:h?`${C.primary}0A`:"transparent",
        width:full?"100%":"auto",transform:h?"scale(1.02)":"scale(1)",
        transition:"all .2s"}}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
        padding:"17px 38px",borderRadius:14,border:"none",background:GP,
        fontSize:16,fontWeight:800,color:"#fff",fontFamily:"'Syne',sans-serif",
        letterSpacing:.3,width:full?"100%":"auto",
        transform:h?"scale(1.03)":"scale(1)",
        boxShadow:h?`0 12px 40px ${C.primary}55`:`0 5px 24px ${C.primary}33`,
        transition:"all .2s"}}>
      {children}
    </button>
  );
}

// Ícone isolado: fontFamily:"initial" garante que o sistema use a fonte de emoji nativa
function Ico({ children, size=32 }) {
  return (
    <span style={{fontFamily:"initial",fontSize:size,lineHeight:1,
      display:"inline-block",userSelect:"none"}}>
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  const [h,sH] = useState(false);
  return (
    <div onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{background:h?`${color}08`:C.card,border:`1px solid ${h?color:C.border}`,
        borderRadius:20,padding:"26px 22px",transition:"all .25s"}}>
      <div style={{marginBottom:14}}><Ico size={32}>{icon}</Ico></div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,
        color:C.text,marginBottom:9}}>{title}</div>
      <div style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{desc}</div>
    </div>
  );
}

// ── Dados ───────────────────────────────────────────────────
const FEATS = [
  ["🧠","IA Diagnóstica","Mapeia seu perfil cognitivo e adapta cada questão ao seu nível real.",C.primary],
  ["⚔️","Batalha PvP","Duelos em tempo real — quem acerta mais rápido ganha XP duplo.",C.danger],
  ["✍️","Redação com IA","Correção instantânea nas 5 competências do ENEM com nota e feedback.",C.secondary],
  ["📊","Simulado Adaptativo","Dificuldade sobe ou desce em tempo real conforme você responde.",C.accent],
  ["🏛️","IA Socrática","Aprenda descobrindo — a IA te faz pensar, não responde diretamente.",C.secondary],
  ["🏆","Certificados","Conquistas com QR code e hash criptográfico, compartilháveis em qualquer rede.",C.success],
];

// Sem perfil Administrador — interno ao sistema
const PERFIS = [
  {icon:"🎓",title:"Estudante",color:C.primary,
   desc:"Trilha personalizada, quiz com IA, batalhas e certificados.",
   items:["Quiz com IA por tema livre","Redação corrigida (5 comp.)","Batalha PvP ranqueada","Simulado Adaptativo","IA Socrática"]},
  {icon:"👨‍🏫",title:"Professor",color:C.secondary,
   desc:"Dashboard da turma, indicadores de risco e recomendações da IA.",
   items:["Dashboard em tempo real","Indicadores de risco","Filtros por área","Recomendação da IA","Relatório familiar"]},
  {icon:"🏛️",title:"Escola",color:C.success,
   desc:"Portal institucional, ranking e visão de todas as turmas.",
   items:["Todas as turmas integradas","Ranking institucional","Batalha entre turmas","API Educacional","Relatório IDEB/ENEM"]},
];

const PLANOS = [
  {name:"Free",price:"R$ 0",per:"/mês",color:C.muted,
   items:["10 questões/dia","Gamificação básica","2 redações/mês","Diagnóstico cognitivo"]},
  {name:"Plus",price:"R$ 39",per:"/mês",color:C.primary,destaque:true,
   items:["Questões ilimitadas + IA","Trilhas adaptativas","Redações ilimitadas","Simulado Adaptativo","Batalha PvP e Coletiva","IA Socrática","Relatório familiar"]},
  {name:"Escola",price:"R$ 2.400",per:"/mês",color:C.success,
   items:["Portal institucional","Licença por turma","Dashboard pedagógico","Batalha entre turmas","API Educacional","Suporte dedicado"]},
];

// ── Seção header ────────────────────────────────────────────
function SH({ title, sub }) {
  return (
    <div style={{textAlign:"center",marginBottom:52}}>
      <div style={{fontFamily:"'Syne',sans-serif",
        fontSize:"clamp(22px,2.8vw,30px)",
        fontWeight:900,color:C.text,marginBottom:12,lineHeight:1.1}}
        dangerouslySetInnerHTML={{__html:title}}/>
      {sub&&<p style={{fontSize:16,color:C.muted,maxWidth:540,margin:"0 auto",lineHeight:1.7}}>{sub}</p>}
    </div>
  );
}

// ── Export principal ─────────────────────────────────────────
export default function Landing({ onStart=()=>{}, onDemo=()=>{}, onLogin=()=>{} }) {
  const [email,setEmail] = useState("");
  const [focus,setFocus] = useState(false);
  const [sent,setSent]   = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:C.bg}}>

        {/* Orbs */}
        <div style={{position:"fixed",top:-180,left:-180,width:560,height:560,borderRadius:"50%",
          background:`radial-gradient(circle,${C.primary}0C,transparent 65%)`,
          pointerEvents:"none",zIndex:0,animation:"glow 7s ease infinite"}}/>
        <div style={{position:"fixed",bottom:-180,right:-180,width:500,height:500,borderRadius:"50%",
          background:`radial-gradient(circle,${C.secondary}0C,transparent 65%)`,
          pointerEvents:"none",zIndex:0,animation:"glow 9s ease infinite 3s"}}/>

        {/* ── NAV — minimalista ──────────────────────────── */}
        <nav style={{position:"sticky",top:0,zIndex:200,
          background:`${C.surface}EC`,backdropFilter:"blur(20px)",
          borderBottom:`1px solid ${C.border}`}}>
          <div style={{maxWidth:980,margin:"0 auto",padding:"0 20px",
            height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>

            {/* Logo */}
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,letterSpacing:-.5}}>
              <span style={{color:C.primary}}>Nota</span>
              <span style={{background:GG,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
            </div>

            {/* Links centro — ocultos no mobile */}
            <div className="hnav" style={{display:"flex",gap:32}}>
              {["Recursos","Planos","Para Escolas"].map(l=>(
                <span key={l} style={{fontSize:14,color:C.muted,cursor:"pointer",fontWeight:500,transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.text}
                  onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{l}</span>
              ))}
            </div>

            {/* Direita: tag + botão Entrar */}
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Tag color={C.success}><span className="em">🟢</span> MVP ao vivo</Tag>
              <button onClick={onLogin}
                style={{padding:"9px 22px",borderRadius:11,
                  border:`1.5px solid ${C.border}`,fontSize:13,fontWeight:700,
                  color:C.muted,background:"transparent",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                Entrar
              </button>
            </div>
          </div>
        </nav>

        <div style={{maxWidth:980,margin:"0 auto",padding:"0 20px",position:"relative",zIndex:1}}>

          {/* ── HERO ──────────────────────────────────────── */}
          <div className="fu" style={{textAlign:"center",padding:"84px 0 92px"}}>
            <h1 style={{fontFamily:"'Syne',sans-serif",
              fontSize:"clamp(38px,6.2vw,68px)",fontWeight:900,
              lineHeight:1.02,letterSpacing:-3,marginBottom:26,color:C.text}}>
              Aprenda jogando.<br/>
              <span style={{background:`linear-gradient(135deg,${C.primary},${C.secondary},${C.accent})`,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                Evolua estudando.
              </span>
            </h1>
            <p style={{fontSize:18,color:C.muted,lineHeight:1.8,
              maxWidth:560,margin:"0 auto 50px"}}>
              A plataforma que entende como você aprende, adapta o conteúdo ao seu perfil
              e transforma sua preparação para o ENEM em uma jornada épica.
            </p>

            {/* Botões hero */}
            <div className="hbtns"
              style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:18}}>
              <CTA onClick={onStart}><span className="em">✨</span> Começar Grátis</CTA>
              <CTA onClick={onDemo} ghost>Ver demonstração →</CTA>
            </div>
            <p style={{fontSize:13,color:C.muted}}>Sem cartão · 100% gratuito · Cancele quando quiser</p>
          </div>

          {/* ── STATS ─────────────────────────────────────── */}
          <div style={{marginBottom:100}}>
            <div className="fu2 g4"
              style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {[["9,3M","candidatos/ano no ENEM",C.primary],
                ["57%","reprovam sem prep adequada",C.danger],
                ["R$ 0","para começar agora",C.success],
                ["IA","100% adaptativa ao aluno",C.secondary]].map(([v,l,c])=>(
                <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,
                  borderRadius:20,padding:"26px 16px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:34,fontWeight:900,
                    color:c,marginBottom:8,lineHeight:1}}>{v}</div>
                  <div style={{fontSize:13,color:C.muted,lineHeight:1.45}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── O PROBLEMA ────────────────────────────────── */}
          <div style={{marginBottom:100}}>
            <SH title={`O problema é <span style="color:${C.danger}">real</span>`}
              sub="Milhões de estudantes estudam sem direcionamento, sem feedback e sem motivação."/>
            <div className="g3"
              style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {[["😔","Método genérico","Preparação igual para todos ignora perfis cognitivos, ritmos e objetivos individuais."],
                ["🕐","Sem tempo","Estudantes ocupados abandonam por falta de um plano adaptável à sua rotina."],
                ["🧩","Neurodivergentes","TDAH, dislexia, autismo — sem suporte pedagógico adequado nas plataformas atuais."]].map(([ic,ti,de])=>(
                <div key={ti} style={{background:`${C.danger}07`,border:`1px solid ${C.danger}22`,
                  borderRadius:20,padding:"28px 22px"}}>
                  <div style={{marginBottom:16}}><Ico size={34}>{ic}</Ico></div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,
                    color:C.text,marginBottom:10}}>{ti}</div>
                  <div style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{de}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RECURSOS ──────────────────────────────────── */}
          <div style={{marginBottom:100}}>
            <SH title={`A solução <span style="background:${GP};-webkit-background-clip:text;-webkit-text-fill-color:transparent">completa</span>`}
              sub="11 recursos que nenhuma outra plataforma brasileira oferece juntos."/>
            <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {FEATS.map(([ic,ti,de,co])=>(
                <FeatureCard key={ti} icon={ic} title={ti} desc={de} color={co}/>
              ))}
            </div>
          </div>

          {/* ── PARA QUEM — sem admin ─────────────────────── */}
          <div style={{marginBottom:100}}>
            <SH title={`Para quem é o <span style="color:${C.primary}">Nota A</span>?`}
              sub="Três perfis, uma plataforma integrada."/>
            <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {PERFIS.map(p=>(
                <div key={p.title} style={{background:C.card,border:`1px solid ${C.border}`,
                  borderRadius:22,padding:"28px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                    <div style={{width:54,height:54,borderRadius:15,background:`${p.color}18`,
                      border:`1px solid ${p.color}40`,display:"flex",alignItems:"center",
                      justifyContent:"center",flexShrink:0}}><Ico size={26}>{p.icon}</Ico></div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:p.color}}>{p.title}</div>
                  </div>
                  <p style={{fontSize:14,color:C.muted,lineHeight:1.65,marginBottom:18}}>{p.desc}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {p.items.map((item,i)=>(
                      <div key={i} style={{display:"flex",gap:10}}>
                        <span style={{color:p.color,fontWeight:800,flexShrink:0,marginTop:2}}>✓</span>
                        <span style={{fontSize:13,color:C.text}}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PLANOS ────────────────────────────────────── */}
          <div style={{marginBottom:100}}>
            <SH title="Planos e preços" sub="Comece grátis. Evolua quando quiser."/>
            <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {PLANOS.map(p=>(
                <div key={p.name} style={{background:p.destaque?`${p.color}0A`:C.card,
                  border:`2px solid ${p.destaque?p.color:C.border}`,
                  borderRadius:24,padding:"30px 24px",position:"relative",
                  boxShadow:p.destaque?`0 10px 44px ${p.color}22`:"none"}}>
                  {p.destaque&&(
                    <div style={{position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",
                      background:GP,color:"#fff",borderRadius:99,padding:"5px 18px",
                      fontSize:11,fontWeight:800,whiteSpace:"nowrap",fontFamily:"'Syne',sans-serif"}}>
                      ⭐ MAIS POPULAR
                    </div>
                  )}
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:p.color,marginBottom:10}}>{p.name}</div>
                  <div style={{marginBottom:22}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:900,color:C.text}}>{p.price}</span>
                    <span style={{fontSize:14,color:C.muted}}>{p.per}</span>
                  </div>
                  <div style={{height:1,background:C.border,marginBottom:22}}/>
                  {p.items.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
                      <span style={{color:p.color,fontWeight:800,flexShrink:0,marginTop:2}}>✓</span>
                      <span style={{fontSize:13,color:C.text,lineHeight:1.4}}>{item}</span>
                    </div>
                  ))}
                  <div style={{marginTop:24}}>
                    <CTA onClick={onStart} ghost={!p.destaque} full>
                      {p.price==="R$ 0"?"Começar de graça":`Assinar ${p.name}`} →
                    </CTA>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── EARLY ACCESS ──────────────────────────────── */}
          <div style={{marginBottom:100}}>
            <div style={{background:`linear-gradient(135deg,${C.primary}10,${C.secondary}10)`,
              border:`1px solid ${C.primary}28`,borderRadius:30,
              padding:"clamp(36px,6vw,64px) clamp(24px,5vw,56px)",textAlign:"center"}}>
              <Tag color={C.accent}><span className="em">🎯</span> Acesso Antecipado · Vagas Limitadas</Tag>
              <div style={{fontFamily:"'Syne',sans-serif",
                fontSize:"clamp(26px,4vw,40px)",fontWeight:900,
                color:C.text,margin:"18px 0 14px",lineHeight:1.08}}>
                Primeiros 1.000 estudantes<br/>entram de graça
              </div>
              <p style={{fontSize:15,color:C.muted,maxWidth:420,margin:"0 auto 36px",lineHeight:1.7}}>
                Sem pagamento, sem cartão. Só seu e-mail e sua vontade de passar no ENEM.
              </p>
              {!sent?(
                <div style={{display:"flex",gap:10,maxWidth:480,margin:"0 auto",
                  flexWrap:"wrap",justifyContent:"center"}}>
                  <input value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&setSent(true)}
                    onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
                    placeholder="seu@email.com"
                    style={{flex:1,minWidth:200,padding:"15px 20px",
                      background:C.card,border:`2px solid ${focus?C.primary:C.border}`,
                      borderRadius:13,color:C.text,fontSize:14,transition:"border-color .2s"}}/>
                  <CTA onClick={()=>email.includes("@")&&setSent(true)}>Garantir acesso →</CTA>
                </div>
              ):(
                <div style={{background:`${C.success}16`,border:`1px solid ${C.success}40`,
                  borderRadius:18,padding:"22px 36px",display:"inline-block"}}>
                  <div style={{fontSize:30,marginBottom:8}}><span className="em">🎉</span></div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,
                    color:C.success,marginBottom:5}}>Você está na lista!</div>
                  <div style={{fontSize:13,color:C.muted}}>Enviaremos o link de acesso em breve.</div>
                </div>
              )}
              <p style={{fontSize:12,color:C.muted,marginTop:20}}><span className="em">🔒</span> Sem spam · LGPD · Cancele quando quiser</p>
            </div>
          </div>

          {/* ── RODAPÉ ────────────────────────────────────── */}
          <footer style={{borderTop:`1px solid ${C.border}`,paddingTop:56,paddingBottom:48}}>
            <div className="fg" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:36,marginBottom:48}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:24,letterSpacing:-.5,marginBottom:14}}>
                  <span style={{color:C.primary}}>Nota</span>
                  <span style={{background:GG,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
                </div>
                <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:18,maxWidth:260}}>
                  Preparação gamificada para o ENEM com inteligência adaptativa. Para estudantes, professores e escolas.
                </p>
              </div>
              {[["PRODUTO",["Recursos","Planos","Para Escolas","API Educacional","Changelog"]],
                ["EMPRESA",["Sobre nós","Blog","Carreiras","Imprensa","Contato"]],
                ["LEGAL",  ["Termos de Uso","Privacidade","LGPD","Cookies","Cancelamento"]]
              ].map(([title,items])=>(
                <div key={title}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,
                    color:C.text,marginBottom:16,letterSpacing:1}}>{title}</div>
                  {items.map(item=>(
                    <div key={item} style={{fontSize:13,color:C.muted,marginBottom:11,cursor:"pointer",transition:"color .2s"}}
                      onMouseEnter={e=>e.currentTarget.style.color=C.primary}
                      onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{item}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{height:1,background:C.border,marginBottom:28}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:20}}>
              <div>
                <div style={{fontSize:13,color:C.muted,marginBottom:4}}>
                  © 2025 <strong style={{color:C.text}}>Hub Gênesis Ltda</strong> — Todos os direitos reservados.
                </div>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>
                  CNPJ: <strong style={{color:C.text}}>38.028.418/0001-80</strong> · Salvador, Bahia, Brasil
                </div>
                <div style={{fontSize:12,color:C.muted}}>Apoio: Núcleo de Empreendedorismo e Inovação do UNIAENE</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,color:C.muted,marginBottom:10}}>
                  <span className="em">📧</span> <span style={{color:C.primary}}>contato@notaa.com.br</span>
                  {" · "}<span className="em">🌐</span> <span style={{color:C.primary}}>notaa.com.br</span>
                </div>
                <div style={{display:"flex",gap:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
                  {[["🔒","PCI DSS"],["🛡️","LGPD"],["⭐","SOC 2"]].map(([ic,lb])=>(
                    <div key={lb} style={{background:C.card,border:`1px solid ${C.border}`,
                      borderRadius:8,padding:"4px 10px",fontSize:10,color:C.muted,
                      display:"flex",alignItems:"center",gap:4}}><span className="em">{ic}</span> {lb}</div>
                  ))}
                </div>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}

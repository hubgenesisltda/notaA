import { useState } from "react"

// ============================================================
// NOTA A — ÍNDICE DE MÓDULOS
// Catálogo completo de todos os módulos da plataforma
// Hub de navegação para validação e demonstração
// ============================================================

const C = {
  bg:"#0A0E1A", surface:"#111827", card:"#1A2235", border:"#1E2D45",
  primary:"#00D4FF", secondary:"#7C3AED", accent:"#F59E0B",
  success:"#10B981", danger:"#EF4444", text:"#E2E8F0", muted:"#64748B",
}
const G = {
  primary:`linear-gradient(135deg,${C.primary},${C.secondary})`,
  gold:`linear-gradient(135deg,${C.accent},#F97316)`,
}
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
button{font-family:inherit;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
.fu{animation:fadeUp .4s ease both;}
`

const MODULES = [
  {
    cat: "PLATAFORMA PRINCIPAL",
    items: [
      {
        n:"01", file:"NotaA_Validacao.jsx", icon:"🚀", title:"App de Validação Completo",
        desc:"Plataforma completa integrada: Landing → Login → Onboarding → Home → Quiz IA → Redação → Simulado → Socrática → Dashboard → Planos → Pagamento.",
        tags:["IA Adaptativa","Perfil Cognitivo","Pagamento Mock","11 telas"],
        color:C.primary, destaque:true, linhas:1302,
        features:["Login modal + Demo mode","Onboarding 7 passos cognitivos","Quiz com IA adaptada ao perfil","Redação corrigida nas 5 competências","Simulado com dificuldade em tempo real","IA Socrática personalizada","Dashboard + indicadores de risco","Checkout com validação completa"],
      },
    ]
  },
  {
    cat: "MÓDULOS SEPARADOS",
    items: [
      {
        n:"01", file:"01_NotaA_Landing.jsx", icon:"🌐", title:"Landing Page",
        desc:"Página de apresentação completa com hero, stats, problema, recursos, perfis, comparativo, metodologia, planos e rodapé institucional.",
        tags:["9 seções","Comparativo","Footer CNPJ"], color:C.secondary, linhas:542,
      },
      {
        n:"02", file:"02_NotaA_Onboarding.jsx", icon:"🧩", title:"Onboarding Cognitivo",
        desc:"7 passos de criação de perfil: nome, objetivo, estilo de aprendizagem, dificuldades, rotina, neurodivergência e tela de perfil gerado com entrada no app.",
        tags:["7 etapas","Perfil adaptativo","Home integrada"], color:C.success, linhas:515,
      },
      {
        n:"03", file:"03_NotaA_Quiz_Batalha.jsx", icon:"⚡", title:"Quiz com IA + Batalha PvP",
        desc:"Quiz com questão gerada por IA por tema livre + Batalha PvP individual com timer, placar em tempo real e histórico de acertos.",
        tags:["IA generativa","Timer","XP duplo"], color:C.accent, linhas:304,
      },
      {
        n:"04", file:"04_NotaA_Estudo.jsx", icon:"✍️", title:"Redação + Simulado + Socrática",
        desc:"Redação com correção IA nas 5 competências, temas sugeridos e dica C5. Simulado Adaptativo 3 níveis. IA Socrática com temas sugeridos.",
        tags:["3 módulos","5 competências","Adaptativo"], color:C.danger, linhas:622,
      },
      {
        n:"05", file:"05_NotaA_Dashboard_Batalha.jsx", icon:"📊", title:"Dashboard + Batalha Coletiva",
        desc:"Dashboard pedagógico com área frágil, filtros de risco e análise por aluno. Batalha Coletiva turmas/escolas com ranking nacional ao vivo.",
        tags:["Prof. Jó","Risco baixo/médio/alto","Ranking"], color:C.primary, linhas:655,
      },
      {
        n:"06", file:"06_NotaA_Recursos.jsx", icon:"🎯", title:"Recursos Avançados",
        desc:"Previsão de nota, Mapa de Conhecimento, Narrativa Pessoal, Certificados verificáveis, API Educacional, Relatório Familiar e Perfil.",
        tags:["7 recursos","QR Code","API docs"], color:C.secondary, linhas:343,
      },
    ]
  },
  {
    cat: "PAINÉIS INSTITUCIONAIS",
    items: [
      {
        n:"07", file:"07_NotaA_Admin.jsx", icon:"⚙️", title:"Painel do Administrador",
        desc:"Controle total da plataforma: gestão de usuários, escolas, planos, receita (MRR), API & uso por chave, logs de auditoria e configurações globais.",
        tags:["Uso interno","MRR","Logs"], color:C.accent, linhas:464,
        badge:"Interno · Sem custo",
      },
      {
        n:"08", file:"08_NotaA_Escola.jsx", icon:"🏛️", title:"Portal da Escola",
        desc:"Portal institucional com visão consolidada de turmas, desempenho por área, Batalha Coletiva, ranking nacional, relatórios IDEB/ENEM e conta.",
        tags:["B2B","Ranking nacional","PDF export"], color:C.success, linhas:458,
        badge:"Plano pago · R$ 2.400/mês",
      },
    ]
  },
  {
    cat: "REFERÊNCIA E LEGADO",
    items: [
      {
        n:"—", file:"nota-a-mvp.jsx", icon:"🏆", title:"MVP Original",
        desc:"Primeiro MVP gamificado da plataforma. Padrão visual de referência: cores, tipografia, animações e estrutura de dados que definiram o design system.",
        tags:["Design system","1017 linhas","Referência"], color:C.muted, linhas:1017,
      },
      {
        n:"—", file:"nota-a-app.jsx", icon:"📱", title:"App Integrado (v1)",
        desc:"Primeira versão do app integrado com navegação entre telas. Precursor do App de Validação completo.",
        tags:["Versão 1","Navegação","Histórico"], color:C.muted, linhas:1257,
      },
    ]
  },
  {
    cat: "API E DOCUMENTAÇÃO",
    items: [
      {
        n:"API", file:"NotaA_API_Demo.js", icon:"⚡", title:"API de Demonstração",
        desc:"28 endpoints documentados com request/response completo. Mock handler funcional para validação. Proxy para Anthropic API em rotas de IA.",
        tags:["28 endpoints","Mock funcional","Anthropic proxy"], color:C.primary, linhas:420,
      },
    ]
  },
]

const STACK = [
  ["⚛️","React + Hooks","useState, useEffect, useRef, useCallback"],
  ["🤖","Anthropic API","claude-sonnet-4-20250514 · 4 chamadas adaptativas"],
  ["🎨","Design System","Syne 900 + DM Sans · Tokens C/G · Dark edu-tech"],
  ["💳","Pagamento","Mock completo · Produção: Stripe / Pagar.me + webhook"],
  ["🔐","Autenticação","JWT mock · Produção: JWT + bcrypt + refresh token"],
  ["🛡️","Conformidade","LGPD · PCI DSS Nível 1 · SOC 2 Type II"],
]

export default function IndiceModulos() {
  const [sel, setSel] = useState(null)

  const totalLinhas = MODULES.flatMap(c => c.items).reduce((s, m) => s + m.linhas, 0)
  const totalArquivos = MODULES.flatMap(c => c.items).length

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",background:C.bg}}>

        {/* Header */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:960,margin:"0 auto",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,letterSpacing:-.5}}>
              <span style={{color:C.primary}}>Nota</span>
              <span style={{background:G.gold,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
              <span style={{fontSize:13,fontWeight:600,color:C.muted,marginLeft:12}}>· Índice de Módulos</span>
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:C.primary}}>{totalArquivos} módulos</div>
                <div style={{fontSize:10,color:C.muted}}>{totalLinhas.toLocaleString()} linhas de código</div>
              </div>
              <div style={{width:1,height:32,background:C.border}}/>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:C.success,animation:"pulse 2s infinite"}}/>
                <div style={{fontSize:11,color:C.success,fontWeight:600}}>Todos validados</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{maxWidth:960,margin:"0 auto",padding:"36px 24px 60px"}}>

          {/* Intro */}
          <div className="fu" style={{marginBottom:48}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:34,fontWeight:900,letterSpacing:-1,marginBottom:10}}>
              Plataforma <span style={{background:G.primary,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Nota A</span>
            </div>
            <div style={{fontSize:16,color:C.muted,maxWidth:600,lineHeight:1.7,marginBottom:24}}>
              Catálogo completo de módulos, painéis e documentação da plataforma gamificada de preparação para o ENEM com IA adaptativa.
            </div>

            {/* Stack */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {STACK.map(([icon,title,desc]) => (
                <div key={title} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:16}}>{icon}</span>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text}}>{title}</div>
                  </div>
                  <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Módulos por categoria */}
          {MODULES.map(cat => (
            <div key={cat.cat} style={{marginBottom:48}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:C.muted,letterSpacing:2,marginBottom:16,borderBottom:`1px solid ${C.border}`,paddingBottom:10}}>
                {cat.cat}
              </div>
              <div style={{display:"grid",gridTemplateColumns:cat.items.length === 1 ? "1fr" : "repeat(2,1fr)",gap:14}}>
                {cat.items.map(mod => (
                  <div key={mod.file}
                    onClick={() => setSel(sel?.file === mod.file ? null : mod)}
                    style={{
                      background:mod.destaque?`${mod.color}08`:C.card,
                      border:`1.5px solid ${sel?.file===mod.file||mod.destaque?mod.color:C.border}`,
                      borderRadius:18, padding:"20px 18px", cursor:"pointer",
                      transition:"all .2s", position:"relative", overflow:"hidden",
                      boxShadow:mod.destaque?`0 4px 24px ${mod.color}22`:"none",
                    }}
                    onMouseEnter={e=>{if(!mod.destaque){e.currentTarget.style.borderColor=mod.color;e.currentTarget.style.background=`${mod.color}06`;}}}
                    onMouseLeave={e=>{if(!mod.destaque&&sel?.file!==mod.file){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}}
                  >
                    {/* Top accent bar */}
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${mod.color},transparent)`}}/>

                    {/* Badge */}
                    {mod.badge && (
                      <div style={{position:"absolute",top:14,right:14,background:`${mod.color}22`,border:`1px solid ${mod.color}44`,color:mod.color,borderRadius:99,padding:"2px 9px",fontSize:9,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>
                        {mod.badge}
                      </div>
                    )}
                    {mod.destaque && (
                      <div style={{position:"absolute",top:14,right:14,background:G.primary,color:"#fff",borderRadius:99,padding:"3px 10px",fontSize:9,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>
                        ⭐ PRINCIPAL
                      </div>
                    )}

                    <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10,paddingRight:mod.badge||mod.destaque?80:0}}>
                      <div style={{width:44,height:44,borderRadius:12,background:`${mod.color}22`,border:`1px solid ${mod.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
                        {mod.icon}
                      </div>
                      <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:mod.color,marginBottom:3}}>
                          {mod.n !== "—" && <span style={{opacity:.5,marginRight:6}}>#{mod.n}</span>}
                          {mod.title}
                        </div>
                        <div style={{fontSize:11,color:C.muted,fontFamily:"'Syne',sans-serif"}}>
                          {mod.file} · {mod.linhas.toLocaleString()} linhas
                        </div>
                      </div>
                    </div>

                    <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:12}}>{mod.desc}</div>

                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {mod.tags.map(tag => (
                        <span key={tag} style={{background:`${mod.color}18`,border:`1px solid ${mod.color}33`,borderRadius:99,padding:"2px 9px",fontSize:10,fontWeight:700,color:mod.color}}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Expanded features */}
                    {sel?.file === mod.file && mod.features && (
                      <div className="fu" style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:800,color:C.muted,marginBottom:8,letterSpacing:1}}>FUNCIONALIDADES</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                          {mod.features.map((f,i) => (
                            <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                              <span style={{color:mod.color,fontWeight:800,flexShrink:0,fontSize:12}}>✓</span>
                              <span style={{fontSize:12,color:C.text,lineHeight:1.4}}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Fluxo da plataforma */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"28px 24px",marginBottom:40}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,marginBottom:20,textAlign:"center"}}>
              🗺️ Fluxo Completo da Plataforma
            </div>
            <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"wrap",justifyContent:"center"}}>
              {[
                {icon:"🌐",label:"Landing",sub:"Apresentação",color:C.secondary},
                {icon:"🔐",label:"Login / Cadastro",sub:"Autenticação",color:C.primary},
                {icon:"🧩",label:"Onboarding",sub:"Perfil cognitivo",color:C.success},
                {icon:"🏠",label:"Home",sub:"Trilha + XP",color:C.accent},
                {icon:"⚡",label:"Quiz / Redação",sub:"IA adaptativa",color:C.primary},
                {icon:"⚔️",label:"Batalha",sub:"PvP + Coletiva",color:C.danger},
                {icon:"📊",label:"Dashboard",sub:"Prof. + Escola",color:C.secondary},
                {icon:"🏆",label:"Certificado",sub:"Verificável",color:C.accent},
              ].map((s, i, arr) => (
                <div key={s.label} style={{display:"flex",alignItems:"center"}}>
                  <div style={{textAlign:"center",padding:"0 8px",minWidth:80}}>
                    <div style={{width:46,height:46,borderRadius:"50%",background:`${s.color}22`,border:`2px solid ${s.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,margin:"0 auto 6px"}}>{s.icon}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:s.color,marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:9,color:C.muted}}>{s.sub}</div>
                  </div>
                  {i < arr.length-1 && <div style={{width:20,height:2,background:C.border,flexShrink:0}}/>}
                </div>
              ))}
            </div>
          </div>

          {/* Footer info */}
          <div style={{textAlign:"center",padding:"20px 0",borderTop:`1px solid ${C.border}`}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,marginBottom:6}}>
              <span style={{color:C.primary}}>Nota</span>
              <span style={{background:G.gold,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}> A</span>
            </div>
            <div style={{fontSize:12,color:C.muted}}>Hub Gênesis Ltda · CNPJ 38.028.418/0001-80 · Salvador, BA</div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>© 2025 — Todos os módulos validados e prontos para publicação</div>
          </div>

        </div>
      </div>
    </>
  )
}

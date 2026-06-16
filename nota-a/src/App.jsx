import React from 'react'
import {Routes, Route } from 'react-router-dom'
import Landing from './pages/01_NotaA_Landing.jsx'
import Onboarding from './pages/02_NotaA_Onboarding.jsx'
import QuizBatalha from './pages/03_NotaA_Quiz_Batalha.jsx'
import ModuloEstudo from './pages/04_NotaA_Estudo.jsx'
import DashboardBatalha from './pages/05_NotaA_Dashboard_Batalha.jsx'
import RecursosAvancados from './pages/06_NotaA_Recursos.jsx'
import AdminPanel from './pages/07_NotaA_Admin.jsx'
import PortalEscola from './pages/08_NotaA_Escola.jsx'
import ModuloEstudante from './pages/09_NotaA_Estudante.jsx'
import NotaAAuth from './pages/NotaA_Beta_Auth.jsx'

function App() {
  return (
    <Routes>
        <Route path="/" element={<Landing onLogin={navigate('/login')} />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/quiz" element={<QuizBatalha />} />
        <Route path="/estudo" element={<ModuloEstudo />} />
        <Route path="/dashboard" element={<DashboardBatalha />} />
        <Route path="/recursos" element={<RecursosAvancados />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/escola" element={<PortalEscola />} />
        <Route path="/estudante" element={<ModuloEstudante />} />
        <Route path="/login" element={<NotaAAuth />} />
      </Routes>
  )
}

export default App
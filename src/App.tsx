import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@med/components/navigation/AppShell'
import { HomePage } from '@med/pages/HomePage'
import { CapturaDuvida } from '@core/components/ui/CapturaDuvida'
import { BuscaGlobal } from '@core/components/ui/BuscaGlobal'
import { Onboarding } from '@core/components/ui/Onboarding'
import { PersonalizacaoBridge } from '@core/components/ui/PersonalizacaoBridge'
import { Anuncios } from '@core/components/ui/Anuncios'
import { FundoVivo } from '@core/components/ui/FundoVivo'
import { AtualizacaoPWA } from '@core/components/ui/AtualizacaoPWA'
import { RitualPassagem } from '@core/components/ui/RitualPassagem'

// Rotas carregadas sob demanda (code-splitting) — só a Home + a casca entram no
// bundle inicial; o resto chega quando visitado. HomePage fica eager (é a porta).
const ExplorarPage = lazy(() => import('@med/pages/ExplorarPage').then((m) => ({ default: m.ExplorarPage })))
const SemestrePage = lazy(() => import('@med/pages/SemestrePage').then((m) => ({ default: m.SemestrePage })))
const DisciplinaPage = lazy(() => import('@med/pages/DisciplinaPage').then((m) => ({ default: m.DisciplinaPage })))
const TemaPage = lazy(() => import('@med/pages/TemaPage').then((m) => ({ default: m.TemaPage })))
const BlocoPage = lazy(() => import('@med/pages/BlocoPage').then((m) => ({ default: m.BlocoPage })))
const EstudarPage = lazy(() => import('@med/pages/EstudarPage').then((m) => ({ default: m.EstudarPage })))
const StudioPage = lazy(() => import('@med/pages/StudioPage').then((m) => ({ default: m.StudioPage })))
const ConfigPage = lazy(() => import('@med/pages/ConfigPage').then((m) => ({ default: m.ConfigPage })))
const ProgressoPage = lazy(() => import('@med/pages/ProgressoPage').then((m) => ({ default: m.ProgressoPage })))
const CorpoPage = lazy(() => import('@med/pages/CorpoPage').then((m) => ({ default: m.CorpoPage })))
const SinaisPage = lazy(() => import('@med/pages/SinaisPage').then((m) => ({ default: m.SinaisPage })))
const LeechWardPage = lazy(() => import('@med/pages/LeechWardPage').then((m) => ({ default: m.LeechWardPage })))
const RespirarPage = lazy(() => import('@med/pages/RespirarPage').then((m) => ({ default: m.RespirarPage })))
const ProvasPage = lazy(() => import('@med/pages/ProvasPage').then((m) => ({ default: m.ProvasPage })))
const GrafoPage = lazy(() => import('@med/pages/GrafoPage').then((m) => ({ default: m.GrafoPage })))
const DiarioPage = lazy(() => import('@med/pages/DiarioPage').then((m) => ({ default: m.DiarioPage })))
const SintesePage = lazy(() => import('@med/pages/SintesePage').then((m) => ({ default: m.SintesePage })))
const SinteseCanvasPage = lazy(() => import('@med/pages/SinteseCanvasPage').then((m) => ({ default: m.SinteseCanvasPage })))
const ClinicaPage = lazy(() => import('@med/pages/ClinicaPage').then((m) => ({ default: m.ClinicaPage })))
const CalculadoraPage = lazy(() => import('@med/pages/CalculadoraPage').then((m) => ({ default: m.CalculadoraPage })))
const LacunasPage = lazy(() => import('@med/pages/LacunasPage').then((m) => ({ default: m.LacunasPage })))
const TutoriaPage = lazy(() => import('@med/pages/TutoriaPage').then((m) => ({ default: m.TutoriaPage })))
const QuestoesPage = lazy(() => import('@med/pages/QuestoesPage').then((m) => ({ default: m.QuestoesPage })))
const JardimPage = lazy(() => import('@med/pages/JardimPage').then((m) => ({ default: m.JardimPage })))
const EuPassadoPage = lazy(() => import('@med/pages/EuPassadoPage').then((m) => ({ default: m.EuPassadoPage })))
const MemoriaPage = lazy(() => import('@med/pages/MemoriaPage').then((m) => ({ default: m.MemoriaPage })))

export default function App() {
  return (
    <>
      <FundoVivo />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="explorar" element={<ExplorarPage />} />
          <Route path="explorar/:num" element={<SemestrePage />} />
          <Route path="explorar/:num/:disc" element={<DisciplinaPage />} />
          <Route path="explorar/:num/:disc/:tema" element={<TemaPage />} />
          <Route path="bloco/:id" element={<BlocoPage />} />
          <Route path="estudar" element={<EstudarPage />} />
          <Route path="questoes" element={<QuestoesPage />} />
          <Route path="progresso" element={<ProgressoPage />} />
          <Route path="corpo" element={<CorpoPage />} />
          <Route path="jardim" element={<JardimPage />} />
          <Route path="eu-passado" element={<EuPassadoPage />} />
          <Route path="memoria" element={<MemoriaPage />} />
          <Route path="sinais" element={<SinaisPage />} />
          <Route path="leech" element={<LeechWardPage />} />
          <Route path="respirar" element={<RespirarPage />} />
          <Route path="provas" element={<ProvasPage />} />
          <Route path="grafo" element={<GrafoPage />} />
          <Route path="diario" element={<DiarioPage />} />
          <Route path="sintese" element={<SintesePage />} />
          <Route path="sintese/:id" element={<SinteseCanvasPage />} />
          <Route path="clinica" element={<ClinicaPage />} />
          <Route path="clinica/:id" element={<ClinicaPage />} />
          <Route path="calculadora" element={<CalculadoraPage />} />
          <Route path="lacunas" element={<LacunasPage />} />
          <Route path="tutoria" element={<TutoriaPage />} />
          <Route path="studio" element={<StudioPage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>
      </Routes>
      <CapturaDuvida />
      <BuscaGlobal />
      <Onboarding />
      <PersonalizacaoBridge />
      <Anuncios />
      <AtualizacaoPWA />
      <RitualPassagem />
    </>
  )
}

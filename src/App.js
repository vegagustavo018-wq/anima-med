import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@med/components/navigation/AppShell';
import { HomePage } from '@med/pages/HomePage';
import { CapturaDuvida } from '@core/components/ui/CapturaDuvida';
import { BuscaGlobal } from '@core/components/ui/BuscaGlobal';
import { Onboarding } from '@core/components/ui/Onboarding';
import { PersonalizacaoBridge } from '@core/components/ui/PersonalizacaoBridge';
import { Anuncios } from '@core/components/ui/Anuncios';
import { FundoVivo } from '@core/components/ui/FundoVivo';
import { AtualizacaoPWA } from '@core/components/ui/AtualizacaoPWA';
import { RitualPassagem } from '@core/components/ui/RitualPassagem';
// Rotas carregadas sob demanda (code-splitting) — só a Home + a casca entram no
// bundle inicial; o resto chega quando visitado. HomePage fica eager (é a porta).
const ExplorarPage = lazy(() => import('@med/pages/ExplorarPage').then((m) => ({ default: m.ExplorarPage })));
const SemestrePage = lazy(() => import('@med/pages/SemestrePage').then((m) => ({ default: m.SemestrePage })));
const DisciplinaPage = lazy(() => import('@med/pages/DisciplinaPage').then((m) => ({ default: m.DisciplinaPage })));
const TemaPage = lazy(() => import('@med/pages/TemaPage').then((m) => ({ default: m.TemaPage })));
const BlocoPage = lazy(() => import('@med/pages/BlocoPage').then((m) => ({ default: m.BlocoPage })));
const EstudarPage = lazy(() => import('@med/pages/EstudarPage').then((m) => ({ default: m.EstudarPage })));
const StudioPage = lazy(() => import('@med/pages/StudioPage').then((m) => ({ default: m.StudioPage })));
const ConfigPage = lazy(() => import('@med/pages/ConfigPage').then((m) => ({ default: m.ConfigPage })));
const ProgressoPage = lazy(() => import('@med/pages/ProgressoPage').then((m) => ({ default: m.ProgressoPage })));
const CorpoPage = lazy(() => import('@med/pages/CorpoPage').then((m) => ({ default: m.CorpoPage })));
const SinaisPage = lazy(() => import('@med/pages/SinaisPage').then((m) => ({ default: m.SinaisPage })));
const LeechWardPage = lazy(() => import('@med/pages/LeechWardPage').then((m) => ({ default: m.LeechWardPage })));
const RespirarPage = lazy(() => import('@med/pages/RespirarPage').then((m) => ({ default: m.RespirarPage })));
const ProvasPage = lazy(() => import('@med/pages/ProvasPage').then((m) => ({ default: m.ProvasPage })));
const GrafoPage = lazy(() => import('@med/pages/GrafoPage').then((m) => ({ default: m.GrafoPage })));
const DiarioPage = lazy(() => import('@med/pages/DiarioPage').then((m) => ({ default: m.DiarioPage })));
const SintesePage = lazy(() => import('@med/pages/SintesePage').then((m) => ({ default: m.SintesePage })));
const SinteseCanvasPage = lazy(() => import('@med/pages/SinteseCanvasPage').then((m) => ({ default: m.SinteseCanvasPage })));
const ClinicaPage = lazy(() => import('@med/pages/ClinicaPage').then((m) => ({ default: m.ClinicaPage })));
const CalculadoraPage = lazy(() => import('@med/pages/CalculadoraPage').then((m) => ({ default: m.CalculadoraPage })));
const LacunasPage = lazy(() => import('@med/pages/LacunasPage').then((m) => ({ default: m.LacunasPage })));
const TutoriaPage = lazy(() => import('@med/pages/TutoriaPage').then((m) => ({ default: m.TutoriaPage })));
const QuestoesPage = lazy(() => import('@med/pages/QuestoesPage').then((m) => ({ default: m.QuestoesPage })));
const JardimPage = lazy(() => import('@med/pages/JardimPage').then((m) => ({ default: m.JardimPage })));
const EuPassadoPage = lazy(() => import('@med/pages/EuPassadoPage').then((m) => ({ default: m.EuPassadoPage })));
const MemoriaPage = lazy(() => import('@med/pages/MemoriaPage').then((m) => ({ default: m.MemoriaPage })));
export default function App() {
    return (_jsxs(_Fragment, { children: [_jsx(FundoVivo, {}), _jsx(Routes, { children: _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "explorar", element: _jsx(ExplorarPage, {}) }), _jsx(Route, { path: "explorar/:num", element: _jsx(SemestrePage, {}) }), _jsx(Route, { path: "explorar/:num/:disc", element: _jsx(DisciplinaPage, {}) }), _jsx(Route, { path: "explorar/:num/:disc/:tema", element: _jsx(TemaPage, {}) }), _jsx(Route, { path: "bloco/:id", element: _jsx(BlocoPage, {}) }), _jsx(Route, { path: "estudar", element: _jsx(EstudarPage, {}) }), _jsx(Route, { path: "questoes", element: _jsx(QuestoesPage, {}) }), _jsx(Route, { path: "progresso", element: _jsx(ProgressoPage, {}) }), _jsx(Route, { path: "corpo", element: _jsx(CorpoPage, {}) }), _jsx(Route, { path: "jardim", element: _jsx(JardimPage, {}) }), _jsx(Route, { path: "eu-passado", element: _jsx(EuPassadoPage, {}) }), _jsx(Route, { path: "memoria", element: _jsx(MemoriaPage, {}) }), _jsx(Route, { path: "sinais", element: _jsx(SinaisPage, {}) }), _jsx(Route, { path: "leech", element: _jsx(LeechWardPage, {}) }), _jsx(Route, { path: "respirar", element: _jsx(RespirarPage, {}) }), _jsx(Route, { path: "provas", element: _jsx(ProvasPage, {}) }), _jsx(Route, { path: "grafo", element: _jsx(GrafoPage, {}) }), _jsx(Route, { path: "diario", element: _jsx(DiarioPage, {}) }), _jsx(Route, { path: "sintese", element: _jsx(SintesePage, {}) }), _jsx(Route, { path: "sintese/:id", element: _jsx(SinteseCanvasPage, {}) }), _jsx(Route, { path: "clinica", element: _jsx(ClinicaPage, {}) }), _jsx(Route, { path: "clinica/:id", element: _jsx(ClinicaPage, {}) }), _jsx(Route, { path: "calculadora", element: _jsx(CalculadoraPage, {}) }), _jsx(Route, { path: "lacunas", element: _jsx(LacunasPage, {}) }), _jsx(Route, { path: "tutoria", element: _jsx(TutoriaPage, {}) }), _jsx(Route, { path: "studio", element: _jsx(StudioPage, {}) }), _jsx(Route, { path: "config", element: _jsx(ConfigPage, {}) })] }) }), _jsx(CapturaDuvida, {}), _jsx(BuscaGlobal, {}), _jsx(Onboarding, {}), _jsx(PersonalizacaoBridge, {}), _jsx(Anuncios, {}), _jsx(AtualizacaoPWA, {}), _jsx(RitualPassagem, {})] }));
}

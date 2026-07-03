// ═══════════════════════════════════════════════════════════════════════════
// CURRÍCULO NAVEGÁVEL — a árvore macro da ANIMA Med.
// Semestre → Disciplina → Tema. Cada Tema aponta para um prefixo de blocos;
// o fluxograma carrega todos os blocos com aquele prefixo e monta a árvore
// a partir dos ponteiros no_pai_id (robusto a lacunas).
// ═══════════════════════════════════════════════════════════════════════════

import { DISCIPLINAS_S1 } from './curriculo-s1'
import { DISCIPLINAS_S2 } from './curriculo-s2'
import { DISCIPLINAS_S3 } from './curriculo-s3'
import { DISCIPLINAS_S4 } from './curriculo-s4'
import { DISCIPLINAS_S5 } from './curriculo-s5'
import { DISCIPLINAS_S6 } from './curriculo-s6'
import { DISCIPLINAS_S7 } from './curriculo-s7'
import { DISCIPLINAS_S8 } from './curriculo-s8'
import { DISCIPLINAS_S9 } from './curriculo-s9'
import { DISCIPLINAS_S10 } from './curriculo-s10'
import { DISCIPLINAS_S11 } from './curriculo-s11'
import { DISCIPLINAS_S12 } from './curriculo-s12'

export interface Tema {
  id: string
  titulo: string
  prefixo: string // resumo_ids que começam com isto pertencem ao tema
  descricao?: string
}

export interface Disciplina {
  id: string
  titulo: string
  cor: string // variável CSS de cor da disciplina
  temas: Tema[]
}

export interface Semestre {
  numero: number
  titulo: string
  disciplinas: Disciplina[]
}

// Cores de disciplina agora vêm de curriculo-s1.ts (gerado do blueprint mestre).

export const CURRICULO: Semestre[] = [
  {
    numero: 1,
    titulo: 'Fundamentos I',
    disciplinas: DISCIPLINAS_S1 as unknown as Disciplina[],
  },
  {
    numero: 2,
    titulo: 'Sistemas Integrados I',
    disciplinas: DISCIPLINAS_S2 as unknown as Disciplina[],
  },
  {
    numero: 3,
    titulo: 'Bases Bioquímicas, Microbianas e Sociais da Doença',
    disciplinas: DISCIPLINAS_S3 as unknown as Disciplina[],
  },
  {
    numero: 4,
    titulo: 'Patologia Geral e Farmacologia Fundamental',
    disciplinas: DISCIPLINAS_S4 as unknown as Disciplina[],
  },
  {
    numero: 5,
    titulo: 'Patologia Sistêmica e Início da Clínica',
    disciplinas: DISCIPLINAS_S5 as unknown as Disciplina[],
  },
  {
    numero: 6,
    titulo: 'Neurociências e Especialidades Iniciais',
    disciplinas: DISCIPLINAS_S6 as unknown as Disciplina[],
  },
  {
    numero: 7,
    titulo: 'Clínica Médica I',
    disciplinas: DISCIPLINAS_S7 as unknown as Disciplina[],
  },
  {
    numero: 8,
    titulo: 'Clínica Médica II',
    disciplinas: DISCIPLINAS_S8 as unknown as Disciplina[],
  },
  {
    numero: 9,
    titulo: 'Clínica Médica III e Especialidades',
    disciplinas: DISCIPLINAS_S9 as unknown as Disciplina[],
  },
  {
    numero: 10,
    titulo: 'Internato I — Medicina Interna e Pediatria',
    disciplinas: DISCIPLINAS_S10 as unknown as Disciplina[],
  },
  {
    numero: 11,
    titulo: 'Internato II — Cirurgia e Ginecologia-Obstetrícia',
    disciplinas: DISCIPLINAS_S11 as unknown as Disciplina[],
  },
  {
    numero: 12,
    titulo: 'Internato III — Emergência, Saúde da Família e Eletivas',
    disciplinas: DISCIPLINAS_S12 as unknown as Disciplina[],
  },
]

export function getSemestre(n: number): Semestre | undefined {
  return CURRICULO.find((s) => s.numero === n)
}

export function getDisciplina(sem: number, discId: string): Disciplina | undefined {
  return getSemestre(sem)?.disciplinas.find((d) => d.id === discId)
}

export function getTema(sem: number, discId: string, temaId: string): Tema | undefined {
  return getDisciplina(sem, discId)?.temas.find((t) => t.id === temaId)
}

export interface Calculadora {
  id: string
  nome: string
  formula: string
  campos: { chave: string; label: string; unidade: string }[]
  extras?: { chave: string; label: string; opcoes: { v: string; label: string }[] }[]
  calcular: (valores: Record<string, number>, opcoes: Record<string, string>) => { valor: number; unidade: string; interpretacao?: string } | null
}

/** Bancada de Cálculo Clínico (bloco 5) — fórmulas padrão para prática, não conduta real. */
export const CALCULADORAS: Calculadora[] = [
  {
    id: 'imc',
    nome: 'Índice de Massa Corporal',
    formula: 'peso (kg) / altura (m)²',
    campos: [
      { chave: 'peso', label: 'Peso', unidade: 'kg' },
      { chave: 'altura', label: 'Altura', unidade: 'm' },
    ],
    calcular: (v) => {
      if (!v.peso || !v.altura) return null
      const imc = v.peso / (v.altura * v.altura)
      let interpretacao = 'peso adequado'
      if (imc < 18.5) interpretacao = 'abaixo do peso'
      else if (imc >= 25 && imc < 30) interpretacao = 'sobrepeso'
      else if (imc >= 30) interpretacao = 'obesidade'
      return { valor: imc, unidade: 'kg/m²', interpretacao }
    },
  },
  {
    id: 'clearance-creatinina',
    nome: 'Clearance de Creatinina (Cockcroft-Gault)',
    formula: '[(140 − idade) × peso] / (72 × creatinina) × (0.85 se mulher)',
    campos: [
      { chave: 'idade', label: 'Idade', unidade: 'anos' },
      { chave: 'peso', label: 'Peso', unidade: 'kg' },
      { chave: 'creatinina', label: 'Creatinina sérica', unidade: 'mg/dL' },
    ],
    extras: [{ chave: 'sexo', label: 'Sexo', opcoes: [{ v: 'm', label: 'Masculino' }, { v: 'f', label: 'Feminino' }] }],
    calcular: (v, o) => {
      if (!v.idade || !v.peso || !v.creatinina) return null
      let clcr = ((140 - v.idade) * v.peso) / (72 * v.creatinina)
      if (o.sexo === 'f') clcr *= 0.85
      return { valor: clcr, unidade: 'mL/min' }
    },
  },
  {
    id: 'pam',
    nome: 'Pressão Arterial Média',
    formula: 'PAD + 1/3 × (PAS − PAD)',
    campos: [
      { chave: 'pas', label: 'PA sistólica', unidade: 'mmHg' },
      { chave: 'pad', label: 'PA diastólica', unidade: 'mmHg' },
    ],
    calcular: (v) => {
      if (!v.pas || !v.pad) return null
      const pam = v.pad + (v.pas - v.pad) / 3
      return { valor: pam, unidade: 'mmHg', interpretacao: pam < 65 ? 'abaixo da perfusão-alvo usual (65)' : undefined }
    },
  },
  {
    id: 'anion-gap',
    nome: 'Ânion Gap',
    formula: 'Na⁺ − (Cl⁻ + HCO₃⁻)',
    campos: [
      { chave: 'na', label: 'Sódio', unidade: 'mEq/L' },
      { chave: 'cl', label: 'Cloreto', unidade: 'mEq/L' },
      { chave: 'hco3', label: 'Bicarbonato', unidade: 'mEq/L' },
    ],
    calcular: (v) => {
      if (!v.na || !v.cl || !v.hco3) return null
      const ag = v.na - (v.cl + v.hco3)
      return { valor: ag, unidade: 'mEq/L', interpretacao: ag > 12 ? 'ânion gap elevado' : 'dentro da faixa usual (8–12)' }
    },
  },
  {
    id: 'sodio-corrigido',
    nome: 'Sódio Corrigido (hiperglicemia)',
    formula: 'Na medido + 1.6 × [(glicose − 100) / 100]',
    campos: [
      { chave: 'na', label: 'Sódio medido', unidade: 'mEq/L' },
      { chave: 'glicose', label: 'Glicose', unidade: 'mg/dL' },
    ],
    calcular: (v) => {
      if (!v.na || !v.glicose) return null
      const corrigido = v.na + 1.6 * ((v.glicose - 100) / 100)
      return { valor: corrigido, unidade: 'mEq/L' }
    },
  },
]

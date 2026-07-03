import type { VinhetaClinica } from '@core/types/schema'

/**
 * Vinhetas Ramificadas (bloco 5) — casos com decisões reais, não só leitura
 * passiva. Testam RACIOCÍNIO sobre mecanismo, não memorização de protocolo.
 * Semente inicial; mais vinhetas nascem conforme o acervo cresce.
 */
export const VINHETAS_SEED: VinhetaClinica[] = [
  {
    vinheta_id: 'vin-epitelio-queimadura',
    bloco_id: 's1-hist-02-001',
    titulo: 'A pele que falhou',
    disciplina: 'histologia',
    no_inicial_id: 'apresentacao',
    nos: [
      {
        no_id: 'apresentacao',
        tipo: 'decisao',
        narrativa:
          'Paciente de 34 anos chega ao pronto-socorro 40 minutos após queimadura de 2º grau profundo em 30% da superfície corporal, causada por líquido em ebulição. Está consciente, orientado, com dor intensa nas áreas afetadas. Antes de qualquer conduta: qual é o risco imediato mais grave para esse paciente nas próximas horas?',
        opcoes: [
          {
            texto: 'Perda da função de barreira epitelial → fuga de líquido e choque hipovolêmico',
            proximo_no_id: 'segunda_decisao',
            feedback: 'Exato. A pele é, antes de tudo, um epitélio de barreira — e você reconheceu a consequência direta de perdê-lo.',
            correta: true,
          },
          {
            texto: 'Infecção da área queimada',
            proximo_no_id: 'desfecho_infeccao',
            feedback: 'Infecção é um risco real — mas não é o que mata nas primeiras horas.',
            correta: false,
          },
          {
            texto: 'Dor insuportável levando a choque álgico',
            proximo_no_id: 'desfecho_dor',
            feedback: 'A dor é intensa e deve ser tratada, mas não é o mecanismo que ameaça a vida aqui.',
            correta: false,
          },
        ],
      },
      {
        no_id: 'segunda_decisao',
        tipo: 'decisao',
        narrativa:
          'Você identificou o mecanismo certo: sem epitélio íntegro, a pele para de funcionar como barreira e o corpo perde líquido continuamente pela superfície exposta. Nas próximas horas, qual sinal clínico evidencia mais diretamente esse mecanismo em progresso?',
        opcoes: [
          {
            texto: 'Taquicardia progressiva, queda da pressão arterial e extremidades frias',
            proximo_no_id: 'desfecho_bom',
            feedback: 'Isso. São os sinais clássicos de hipovolemia se instalando — a consequência direta e mensurável da barreira perdida.',
            correta: true,
          },
          {
            texto: 'Febre alta',
            proximo_no_id: 'desfecho_febre',
            feedback: 'Febre pode aparecer depois, ligada à resposta inflamatória sistêmica ou infecção — não é o primeiro sinal do mecanismo hipovolêmico.',
            correta: false,
          },
        ],
      },
      {
        no_id: 'desfecho_bom',
        tipo: 'desfecho',
        desfecho_bom: true,
        narrativa:
          'Você seguiu a cadeia correta: epitélio rompido → perda da barreira → fuga de líquido intersticial e plasmático pela superfície → hipovolemia → taquicardia e hipotensão compensatórias. É por isso que, no tecido epitelial, "avascular e de renovação contínua" não é só uma curiosidade histológica — é a razão pela qual queimaduras extensas matam por desidratação antes de matar por infecção. A reposição volêmica precoce, não o antibiótico, é a prioridade das primeiras horas.',
      },
      {
        no_id: 'desfecho_infeccao',
        tipo: 'desfecho',
        desfecho_bom: false,
        narrativa:
          'A infecção é uma complicação real de queimaduras extensas — mas ela se instala em dias, não em horas, porque depende de tempo para os micro-organismos colonizarem o tecido exposto. Nas primeiras horas, o que mata é mais rápido e mais silencioso: a perda contínua de líquido pela barreira rompida, levando a choque hipovolêmico. Vale revisitar por que o epitélio funciona como uma barreira ativa, não passiva.',
      },
      {
        no_id: 'desfecho_dor',
        tipo: 'desfecho',
        desfecho_bom: false,
        narrativa:
          '"Choque álgico" isolado por dor não é um mecanismo fisiopatológico bem estabelecido nesse contexto — a dor deve ser tratada por humanidade e porque agrava o estresse fisiológico, mas o que ameaça a vida é mensurável e mecânico: fuga de volume pela barreira epitelial perdida. Vale revisitar a função de barreira do tecido epitelial.',
      },
      {
        no_id: 'desfecho_febre',
        tipo: 'desfecho',
        desfecho_bom: false,
        narrativa:
          'Febre alta nas primeiras horas não é o sinal mais direto da perda de barreira — ela tende a aparecer depois, associada à resposta inflamatória sistêmica. O sinal mais precoce e direto de perda contínua de volume é hemodinâmico: taquicardia, queda de pressão, extremidades frias. Vale reconectar esse raciocínio à fisiologia do choque hipovolêmico.',
      },
    ],
  },
]

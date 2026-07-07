// Script genérico de contabilidade de produção — funciona para QUALQUER semestre (1 a 12).
//
// Uso 1 — visão geral do semestre (todas as disciplinas, completos/total):
//   node scripts/status-semestre.mjs <N>
//   Ex: node scripts/status-semestre.mjs 3
//
// Uso 2 — próximos blocos pendentes de UMA disciplina, em ordem DFS (pai-antes-de-filhos):
//   node scripts/status-semestre.mjs <N> <disciplina_id> <quantidade>
//   Ex: node scripts/status-semestre.mjs 3 bioet 6
//
// Fonte da verdade: blueprint/_MESTRE-s<N>.json (lista consolidada de todas as disciplinas
// e todos os blocos do semestre, já na ordem DFS correta) cruzado com o status real
// (metadata.status) de cada arquivo em public/blocos/<disciplina_id>/<id>.json.

import fs from 'fs';
import path from 'path';

const semestre = process.argv[2];
const disciplina = process.argv[3];
const n = parseInt(process.argv[4] || '6', 10);

if (!semestre) {
  console.error('Uso: node status-semestre.mjs <N> [disciplina_id] [quantidade]');
  process.exit(1);
}

const medRoot = 'C:\\Users\\vegag\\.claude\\anima\\med';
const mestrePath = path.join(medRoot, 'blueprint', `_MESTRE-s${semestre}.json`);

if (!fs.existsSync(mestrePath)) {
  console.error(`Não achei ${mestrePath}. Semestres válidos: 1 a 12.`);
  process.exit(1);
}

const mestre = JSON.parse(fs.readFileSync(mestrePath, 'utf8'));

// IMPORTANTE: o nome da pasta em public/blocos/ NEM SEMPRE bate com o disciplina_id
// do blueprint (ex.: blueprint usa "histmed", a pasta real é "historia-medicina";
// blueprint usa "saude-avancada", a pasta real é "savan"). Por isso, em vez de assumir
// public/blocos/<disciplina_id>/<id>.json, construímos um índice global id -> caminho
// varrendo TODAS as subpastas uma única vez, e buscamos cada bloco por id exato.
const blocosRoot = path.join(medRoot, 'public', 'blocos');
const indiceGlobal = new Map();
for (const entry of fs.readdirSync(blocosRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(blocosRoot, entry.name);
  for (const fn of fs.readdirSync(dir)) {
    if (fn.endsWith('.json')) {
      indiceGlobal.set(fn.slice(0, -5), path.join(dir, fn));
    }
  }
}

function statusDoBloco(discId, blocoId) {
  const fp = indiceGlobal.get(blocoId);
  if (!fp) return 'FALTA_ARQUIVO';
  try {
    const f = JSON.parse(fs.readFileSync(fp, 'utf8'));
    return (f.metadata && f.metadata.status) || 'SEM_STATUS';
  } catch (e) {
    return 'ERRO_JSON: ' + e.message;
  }
}

if (!disciplina) {
  // Modo 1: visão geral do semestre inteiro
  console.log(`Semestre ${mestre.semestre} — total planejado: ${mestre.total} blocos\n`);
  let totalCompleto = 0;
  for (const d of mestre.disciplinas) {
    const blocosDaDisc = mestre.blocos.filter(b => b.disciplina_id === d.id);
    let completo = 0;
    for (const b of blocosDaDisc) {
      if (statusDoBloco(d.id, b.id) === 'completo') completo++;
    }
    totalCompleto += completo;
    console.log(`${d.id.padEnd(10)} ${d.nome.padEnd(55)} ${completo}/${blocosDaDisc.length}`);
  }
  console.log(`\nTOTAL SEMESTRE ${semestre}: ${totalCompleto}/${mestre.total} completos (${Math.round(100 * totalCompleto / mestre.total)}%)`);
} else {
  // Modo 2: próximos N pendentes de uma disciplina específica
  const blocosDaDisc = mestre.blocos.filter(b => b.disciplina_id === disciplina);
  if (blocosDaDisc.length === 0) {
    console.error(`Disciplina "${disciplina}" não encontrada no semestre ${semestre}. Disciplinas disponíveis: ${mestre.disciplinas.map(d => d.id).join(', ')}`);
    process.exit(1);
  }
  const pendentes = [];
  for (const b of blocosDaDisc) {
    const status = statusDoBloco(disciplina, b.id);
    if (status !== 'completo') {
      const caminhoReal = indiceGlobal.get(b.id) || '(ARQUIVO NÃO EXISTE — precisa gerar esqueleto antes de produzir conteúdo)';
      pendentes.push({ ...b, status_atual: status, caminho_arquivo: caminhoReal });
    }
    if (pendentes.length >= n) break;
  }
  console.log(JSON.stringify(pendentes, null, 2));
  console.log('---');
  const totalCompleto = blocosDaDisc.length - blocosDaDisc.filter(b => statusDoBloco(disciplina, b.id) !== 'completo').length;
  console.log(`Disciplina ${disciplina}: ${totalCompleto}/${blocosDaDisc.length} completos, próximos ${pendentes.length} pendentes listados acima.`);
}

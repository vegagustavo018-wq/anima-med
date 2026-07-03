// Gera public/blocos/manifesto.json — lista de blocos com hash de conteúdo.
// O app fetcha só o que mudou (escala para milhares de blocos sem bundle).
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const RAIZ = 'public/blocos'

function hashConteudo(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function listarJson(dir) {
  const out = []
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) out.push(...listarJson(caminho))
    else if (nome.endsWith('.json') && nome !== 'manifesto.json') out.push(caminho)
  }
  return out
}

const arquivos = listarJson(RAIZ)
const blocos = []
for (const caminho of arquivos) {
  const texto = readFileSync(caminho, 'utf8')
  let json
  try {
    json = JSON.parse(texto)
  } catch (e) {
    console.error(`[manifesto] JSON inválido: ${caminho}`)
    continue
  }
  if (!json.resumo_id) {
    console.warn(`[manifesto] sem resumo_id: ${caminho}`)
    continue
  }
  // caminho relativo à pasta public (vira URL): /blocos/...
  const url = '/' + relative('public', caminho).split('\\').join('/')
  blocos.push({ id: json.resumo_id, arquivo: url, hash: hashConteudo(texto) })
}

blocos.sort((a, b) => a.id.localeCompare(b.id))
const manifesto = { versao: 1, gerado_em: new Date().toISOString(), blocos }
writeFileSync(join(RAIZ, 'manifesto.json'), JSON.stringify(manifesto, null, 2))
console.log(`[manifesto] ${blocos.length} blocos → ${RAIZ}/manifesto.json`)

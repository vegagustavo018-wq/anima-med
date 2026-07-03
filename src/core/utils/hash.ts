// Hash determinístico e rápido (FNV-1a 32-bit em hex).
// Usado para detectar se o conteúdo de um bloco mudou entre ingestões.
export function hashConteudo(obj: unknown): string {
  const str = JSON.stringify(obj)
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  // >>> 0 força unsigned
  return (h >>> 0).toString(16).padStart(8, '0')
}

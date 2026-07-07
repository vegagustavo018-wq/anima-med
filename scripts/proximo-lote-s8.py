#!/usr/bin/env python3
# Seleciona o proximo lote de blocos PRONTOS para produzir (pai ja produzido/raiz) de uma disciplina do Semestre 8.
# Uso: python scripts/proximo-lote-s8.py <disciplina_id> <tamanho_lote>
import json, sys, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
disc = sys.argv[1]
tamanho = int(sys.argv[2]) if len(sys.argv) > 2 else 10

mestre = json.load(open(os.path.join(RAIZ, 'blueprint', '_MESTRE-s8.json'), encoding='utf-8'))
blocos = [b for b in mestre['blocos'] if b['disciplina_id'] == disc]
byid = {b['id']: b for b in blocos}

nomes_disc = {
    'anest': 'Anestesiologia', 'cir1': 'Cirurgia I', 'go2': 'Ginecologia-Obstetrícia II (Obstetrícia)',
    'infecto': 'Infectologia', 'mi2': 'Medicina Interna II', 'ped1': 'Pediatria I',
}
notas_disc = {
    'anest': 'Anestesiologia: quando o escopo permitir, priorize a lente de procedimento/conduta (indicacao, passos, complicacoes).',
    'cir1': 'Cirurgia I: quando o escopo permitir, priorize a lente de procedimento/conduta (indicacao, passos, complicacoes).',
    'go2': 'Obstetricia: explique a fisiologia da gestacao/parto antes da doenca/complicacao.',
    'ped1': 'Pediatria I: explique a fisiologia do desenvolvimento antes da doenca.',
    'infecto': 'Infectologia: raciocinio clinico + microbiologia causal antes do tratamento.',
    'mi2': 'Medicina Interna II: raciocinio clinico e fisiopatologia antes do tratamento.',
}

def caminho(id):
    return os.path.join(RAIZ, 'public', 'blocos', disc, id + '.json').replace('\\', '/')

def produzido(id):
    p = caminho(id)
    if not os.path.exists(p):
        return False
    try:
        j = json.load(open(p, encoding='utf-8'))
    except Exception:
        return False
    return isinstance(j.get('narrativa'), list) and len(j.get('narrativa')) > 0

# ordena por profundidade (pai antes de filho) e depois pela ordem original do blueprint
ordem = {b['id']: i for i, b in enumerate(blocos)}
blocos_ordenados = sorted(blocos, key=lambda b: (b.get('profundidade', 0), ordem[b['id']]))

prontos = []
for b in blocos_ordenados:
    if produzido(b['id']):
        continue
    pai = b.get('no_pai_id')
    if pai and pai not in byid:
        continue  # pai fora dessa disciplina (nao deveria acontecer) -- pula por seguranca
    if pai and not produzido(pai):
        continue  # pai ainda nao produzido -- nao pode fazer o filho ainda
    prontos.append(b)
    if len(prontos) >= tamanho:
        break

saida = []
for b in prontos:
    saida.append({
        'id': b['id'],
        'titulo': b['titulo'],
        'escopo': b['escopo'],
        'lentes': b.get('lentes', []),
        'nivel': b.get('nivel', ''),
        'disciplinaId': disc,
        'disciplinaNome': nomes_disc.get(disc, disc),
        'semestre': 8,
        'path': caminho(b['id']),
        'parentId': b.get('no_pai_id'),
        'parentPath': caminho(b['no_pai_id']) if b.get('no_pai_id') else None,
        'depth': 0,
        'notaDisciplina': notas_disc.get(disc, ''),
    })

total = len(blocos)
feitos = sum(1 for b in blocos if produzido(b['id']))
saida_path = sys.argv[3] if len(sys.argv) > 3 else None
if saida_path:
    with open(saida_path, 'w', encoding='utf-8') as f:
        json.dump({'blocks': saida}, f, ensure_ascii=False)
else:
    sys.stdout.reconfigure(encoding='utf-8')
    print(json.dumps({'blocks': saida}, ensure_ascii=False))
print(f"# progresso {disc}: {feitos}/{total} produzidos, {len(saida)} selecionados neste lote", file=sys.stderr)

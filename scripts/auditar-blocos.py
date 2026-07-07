# -*- coding: utf-8 -*-
"""
ANIMA — Auditoria de conformidade dos blocos produzidos.
Aplica o GATE do 05-CHECKLIST-QUALIDADE.md. Separa violacao de SCHEMA (reparavel)
de violacao de CONTEUDO (exige regeneracao).
Uso: python scripts/auditar-blocos.py [disciplina]   (sem arg = todas)
"""
import json, os, glob, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FILTRO = sys.argv[1] if len(sys.argv) > 1 else None

FC = {'por_que','mecanismo','contrafactual','clinico','comparacao','armadilha','sintese_transdisciplinar','etimologia'}
NARR = {'texto','secao','analogia','highlight','pausa','imagem','passo_a_passo','tabela_comparativa','etimologia','contrafactual','controversia'}
LAT = {'ANALOGIA','CONTRASTE','EXEMPLO_PARALELO'}
FUT = {'CASCATA_CAUSAL','ALVO_TERAPEUTICO','RECONHECIMENTO_CLINICO','MECANISMO_COMPARTILHADO'}
PROIB = ['o que é ','o que e ','defina ','cite os','cite as','liste os','liste as','qual o nome de']

def load(f):
    try:
        with open(f, encoding='utf-8-sig') as fp: return json.load(fp), None
    except Exception as e: return None, str(e)

def produzido(d):
    return isinstance(d, dict) and isinstance(d.get('narrativa'), list) and len(d['narrativa']) > 0 and isinstance(d.get('flashcards'), list)

res = []
for f in sorted(glob.glob('public/blocos/**/*.json', recursive=True)):
    if os.path.basename(f) == 'manifesto.json': continue
    disc = os.path.basename(os.path.dirname(f))
    if FILTRO and disc != FILTRO: continue
    d, err = load(f)
    if err:
        res.append({'id': os.path.basename(f), 'disc': disc, 'schema': ['JSON invalido: '+err[:60]], 'conteudo': []}); continue
    if not produzido(d): continue
    bid = d.get('resumo_id', os.path.basename(f))
    S, C = [], []  # schema, conteudo

    narr = d['narrativa']; fcs = d['flashcards']
    conx = d.get('conexoes', {}) if isinstance(d.get('conexoes'), dict) else {}

    # --- SCHEMA ---
    for fc in fcs:
        if isinstance(fc, dict):
            if fc.get('tipo') not in FC: S.append(f'flashcard tipo "{fc.get("tipo")}"')
            p = (fc.get('pergunta') or '').lower()
            if any(p.startswith(x) for x in PROIB): C.append('flashcard decoreba')
    for it in narr:
        if isinstance(it, dict) and it.get('tipo') not in NARR: S.append(f'narrativa tipo "{it.get("tipo")}"')
    for l in (conx.get('laterais') or []):
        if isinstance(l, dict) and l.get('tipo_relacao') not in LAT: S.append(f'lateral "{l.get("tipo_relacao")}"')
    for fu in (conx.get('futuras') or []):
        if isinstance(fu, dict):
            if fu.get('tipo') not in FUT: S.append(f'futura "{fu.get("tipo")}"')
            if fu.get('confianca') not in {'consenso_didatico','hipotese_pedagogica'}: S.append('futura sem confianca')

    # --- CONTEUDO (Nivel 1/2) ---
    resumo = (d.get('resumo_conciso') or '')
    pal = len(resumo.split())
    if not (150 <= pal <= 400): C.append(f'resumo {pal} palavras (fora 150-400)')
    if not (narr and isinstance(narr[0], dict) and narr[0].get('tipo') == 'texto'): C.append('nao abre com texto/cena')
    if len(narr) < 5: C.append(f'narrativa curta ({len(narr)} itens)')
    midia = d.get('midia', {})
    imgs = midia.get('imagens', []) if isinstance(midia, dict) else []
    if len(imgs) < 1: C.append('zero imagens')
    if not any(isinstance(it, dict) and it.get('tipo') == 'analogia' for it in narr): C.append('sem analogia')
    prereqs = conx.get('prerequisitos') or []
    if len(prereqs) < 1 and d.get('no_pai_id') is not None: C.append('sem pre-requisito')
    if fcs:
        if not (3 <= len(fcs) <= 8): S.append(f'flashcards={len(fcs)} (fora 3-8)')
        if not any(isinstance(fc, dict) and fc.get('tipo') == 'contrafactual' for fc in fcs): C.append('sem contrafactual')
    # cascata: conta 5 etapas com descricao (rotulo livre)
    for caso in (d.get('casos_clinicos') or []):
        if not isinstance(caso, dict) or caso.get('status') == 'ausente_justificado': continue
        casc = caso.get('cascata') or []
        etapas_ok = sum(1 for c in casc if isinstance(c, dict) and c.get('etapa') and c.get('descricao'))
        if etapas_ok < 5: C.append(f'cascata {etapas_ok}/5 etapas')
        if not caso.get('diagnostico_revelado'): C.append('caso sem diagnostico_revelado')

    res.append({'id': bid, 'disc': disc, 'schema': S, 'conteudo': C})

# --- relatorio ---
total = len(res)
limpos = [r for r in res if not r['schema'] and not r['conteudo']]
so_schema = [r for r in res if r['schema'] and not r['conteudo']]
so_cont = [r for r in res if r['conteudo'] and not r['schema']]
ambos = [r for r in res if r['schema'] and r['conteudo']]
print('='*60)
print(f'AUDITORIA ANIMA' + (f' — {FILTRO}' if FILTRO else '') + f'  ({total} blocos produzidos)')
print('='*60)
print(f'  Limpos (aprovados):          {len(limpos)}')
print(f'  So violacao de SCHEMA:       {len(so_schema)}  (auto-reparavel)')
print(f'  So violacao de CONTEUDO:     {len(so_cont)}  (regenerar/editar)')
print(f'  Schema + Conteudo:           {len(ambos)}')
from collections import Counter
cs, cc = Counter(), Counter()
for r in res:
    for v in r['schema']: cs[v.split('"')[0].strip()] += 1
    for v in r['conteudo']: cc[v.split('(')[0].strip()] += 1
print('\n  Top violacoes de SCHEMA:')
for k,n in cs.most_common(8): print(f'    {n:4d}  {k}')
print('  Top violacoes de CONTEUDO:')
for k,n in cc.most_common(10): print(f'    {n:4d}  {k}')

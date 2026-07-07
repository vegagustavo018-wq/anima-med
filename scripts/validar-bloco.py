# -*- coding: utf-8 -*-
"""
ANIMA — Validador de UM bloco (o GATE executavel).
Aplica o 05-CHECKLIST-QUALIDADE.md e retorna veredito JSON com a ACAO recomendada.
Uso:  python scripts/validar-bloco.py <caminho.json> [--id <resumo_id_esperado>]
Saida (stdout): JSON { valido, nivel, acao, schema[], conteudo[] }
  acao ∈ aceitar | reparar | regenerar | devolver
Codigo de saida: 0 = aceitar/reparar, 1 = regenerar/devolver, 2 = erro de leitura
"""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FC = {'por_que','mecanismo','contrafactual','clinico','comparacao','armadilha','sintese_transdisciplinar','etimologia'}
NARR = {'texto','secao','analogia','highlight','pausa','imagem','passo_a_passo','tabela_comparativa','etimologia','contrafactual','controversia'}
LAT = {'ANALOGIA','CONTRASTE','EXEMPLO_PARALELO'}
FUT = {'CASCATA_CAUSAL','ALVO_TERAPEUTICO','RECONHECIMENTO_CLINICO','MECANISMO_COMPARTILHADO'}
CONF = {'consenso_didatico','hipotese_pedagogica'}
PROIB = ['o que é ','o que e ','defina ','cite os','cite as','liste os','liste as','qual o nome de']

def main():
    args = sys.argv[1:]
    if not args:
        print(json.dumps({'erro': 'uso: validar-bloco.py <arquivo> [--id X]'})); sys.exit(2)
    path = args[0]
    esperado = None
    if '--id' in args:
        esperado = args[args.index('--id')+1]
    try:
        with open(path, encoding='utf-8-sig') as f:
            d = json.load(f)
    except Exception as e:
        print(json.dumps({'valido': False, 'acao': 'reparar', 'schema': [f'JSON invalido: {e}'], 'conteudo': []}, ensure_ascii=False))
        sys.exit(0)

    S, C = [], []
    if not isinstance(d, dict):
        print(json.dumps({'valido': False, 'acao': 'regenerar', 'schema': ['nao e objeto'], 'conteudo': []})); sys.exit(1)

    # Bloqueadores
    if esperado and d.get('resumo_id') != esperado:
        S.append(f'resumo_id "{d.get("resumo_id")}" != esperado "{esperado}"')
    narr = d.get('narrativa')
    if not (isinstance(narr, list) and len(narr) > 0):
        print(json.dumps({'valido': False, 'acao': 'regenerar', 'schema': [], 'conteudo': ['narrativa vazia (esqueleto?)']}, ensure_ascii=False)); sys.exit(1)
    fcs = d.get('flashcards') or []
    conx = d.get('conexoes') if isinstance(d.get('conexoes'), dict) else {}

    # SCHEMA (reparavel)
    for fc in fcs:
        if isinstance(fc, dict) and fc.get('tipo') not in FC: S.append(f'flashcard.tipo "{fc.get("tipo")}"')
    for it in narr:
        if isinstance(it, dict) and it.get('tipo') not in NARR: S.append(f'narrativa.tipo "{it.get("tipo")}"')
    for l in (conx.get('laterais') or []):
        if isinstance(l, dict) and l.get('tipo_relacao') not in LAT: S.append(f'lateral.tipo_relacao "{l.get("tipo_relacao")}"')
    for fu in (conx.get('futuras') or []):
        if isinstance(fu, dict):
            if fu.get('tipo') not in FUT: S.append(f'futura.tipo "{fu.get("tipo")}"')
            if fu.get('confianca') not in CONF: S.append('futura.confianca ausente')

    # CONTEUDO (regenerar)
    pal = len((d.get('resumo_conciso') or '').split())
    if not (150 <= pal <= 400): C.append(f'resumo {pal} palavras (ideal 200-300)')
    if not (isinstance(narr[0], dict) and narr[0].get('tipo') == 'texto'): C.append('nao abre com cena/texto')
    if len(narr) < 5: C.append(f'narrativa curta ({len(narr)} itens; 8 etapas?)')
    midia = d.get('midia') if isinstance(d.get('midia'), dict) else {}
    if len(midia.get('imagens') or []) < 1: C.append('zero imagens')
    if not any(isinstance(it, dict) and it.get('tipo') == 'analogia' for it in narr): C.append('sem analogia')
    if len(conx.get('prerequisitos') or []) < 1 and d.get('no_pai_id') is not None: C.append('sem pre-requisito')
    if fcs:
        if not (3 <= len(fcs) <= 8): S.append(f'flashcards={len(fcs)} (fora 3-8)')
        if not any(isinstance(fc, dict) and fc.get('tipo') == 'contrafactual' for fc in fcs): C.append('sem flashcard contrafactual')
        for fc in fcs:
            if isinstance(fc, dict) and any((fc.get('pergunta') or '').lower().startswith(x) for x in PROIB):
                C.append('flashcard decoreba (Cite/Defina/O que e)'); break
    for caso in (d.get('casos_clinicos') or []):
        if not isinstance(caso, dict) or caso.get('status') == 'ausente_justificado': continue
        casc = caso.get('cascata') or []
        ok = sum(1 for c in casc if isinstance(c, dict) and c.get('etapa') and c.get('descricao'))
        if ok < 5: C.append(f'cascata {ok}/5 etapas')
        if not caso.get('diagnostico_revelado'): C.append('caso sem diagnostico_revelado')

    # Decisao
    if S and not C: acao, valido = 'reparar', False
    elif not S and not C: acao, valido = 'aceitar', True
    elif not narr or 'narrativa vazia' in ' '.join(C): acao, valido = 'regenerar', False
    else: acao, valido = ('reparar' if S else 'devolver'), False
    nivel = 'completo' if (valido and not C) else ('minimo' if valido else '-')

    print(json.dumps({'valido': valido, 'nivel': nivel, 'acao': acao, 'schema': S, 'conteudo': C}, ensure_ascii=False, indent=2))
    sys.exit(0 if acao in ('aceitar', 'reparar') else 1)

main()

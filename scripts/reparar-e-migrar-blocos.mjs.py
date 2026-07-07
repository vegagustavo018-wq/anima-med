# -*- coding: utf-8 -*-
"""
ANIMA — Reparo + Migracao de blocos produzidos.
Torna todos os blocos VALIDOS e conformes ao schema v3.1 atual.

Garantias:
- Nunca grava JSON invalido (valida com json.loads antes de escrever).
- Idempotente (rodar 2x = no-op na 2a vez).
- So mexe em conteudo/rotulos; NAO altera a arvore (resumo_id, no_pai_id, etc.).
- Remove BOM. Normaliza enums. Converte schemas antigos de caso/narrativa.
Uso: python scripts/reparar-e-migrar-blocos.mjs.py [--dry-run]
"""
import io, sys, re, json, glob, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
DRY = '--dry-run' in sys.argv
RAIZ = 'public/blocos'

# ---------------- MAPAS DE MIGRACAO ----------------
LATERAL_VALIDO = {'ANALOGIA', 'CONTRASTE', 'EXEMPLO_PARALELO'}
FUTURA_VALIDO = {'CASCATA_CAUSAL', 'ALVO_TERAPEUTICO', 'RECONHECIMENTO_CLINICO', 'MECANISMO_COMPARTILHADO'}
FC_VALIDO = {'por_que', 'mecanismo', 'contrafactual', 'clinico', 'comparacao', 'armadilha', 'sintese_transdisciplinar', 'etimologia'}
NARR_VALIDO = {'texto', 'secao', 'analogia', 'highlight', 'pausa', 'imagem', 'passo_a_passo', 'tabela_comparativa', 'etimologia', 'contrafactual', 'controversia'}

FC_MAP = {
    'definicao': 'por_que', 'definicao_funcional': 'por_que',
    'sintese': 'sintese_transdisciplinar', 'integracao_sistemas': 'sintese_transdisciplinar',
    'aplicacao': 'clinico', 'aplicacao_pratica': 'clinico', 'funcao_pratica': 'clinico',
    'conduta': 'clinico', 'calculo': 'clinico', 'reconhecimento_visual': 'clinico',
    'caso_clinico_mini': 'clinico', 'contraste': 'comparacao', 'etimologia_aplicada': 'etimologia',
}
FUT_MAP = {
    'decomposicao': 'MECANISMO_COMPARTILHADO', 'desdobramento': 'MECANISMO_COMPARTILHADO',
    'mecanismo_aprofundado': 'MECANISMO_COMPARTILHADO', 'cascata_causal': 'CASCATA_CAUSAL',
    'alvo_terapeutico': 'ALVO_TERAPEUTICO', 'reconhecimento_clinico': 'RECONHECIMENTO_CLINICO',
    'mecanismo_compartilhado': 'MECANISMO_COMPARTILHADO',
}
NARR_MAP = {
    'text': 'texto', 'subsecao': 'secao', 'destaque_clinico': 'highlight',
    'lista_causal': 'texto', 'armadilha': 'highlight', 'subsection': 'secao',
}
CASCATA_ETAPAS = ['Causa', 'Estrutura Afetada', 'Disfunção', 'Sintoma', 'Consequência']

rel = {'reparados_json': [], 'migrados': [], 'ja_ok': [], 'ainda_quebrado': [], 'erro': []}
contadores = {}
def bump(k, n=1): contadores[k] = contadores.get(k, 0) + n

# ---------------- REPARO DE JSON QUEBRADO ----------------
def reparar_texto(txt):
    """Aplica correcoes de sintaxe conhecidas, retornando texto reparado."""
    # 1. '},' prematuro fechando flashcard antes de "tipo"
    txt = re.sub(r'"\r?\n(\s*)\},\r?\n(\s*)"tipo"\s*:', r'",\n\2"tipo":', txt)
    # 2. '},' prematuro fechando caso antes de "etapa_1"
    txt = re.sub(r'"\r?\n(\s*)\},\r?\n(\s*)"etapa_1"\s*:', r'",\n\2"etapa_1":', txt)
    return txt

def norm_lateral(tr):
    if tr in LATERAL_VALIDO: return tr, False
    if tr is None: return 'EXEMPLO_PARALELO', True
    u = str(tr).upper()
    if 'CONTRAST' in u or 'OPOS' in u: return 'CONTRASTE', True
    if 'ANALOG' in u or 'SEMELH' in u: return 'ANALOGIA', True
    return 'EXEMPLO_PARALELO', True

def norm_fc(t):
    if t in FC_VALIDO: return t, False
    if t is None: return 'por_que', True
    return FC_MAP.get(str(t).lower(), 'por_que'), True

def norm_fut(t):
    if t in FUTURA_VALIDO: return t, False
    if t is None: return 'MECANISMO_COMPARTILHADO', True
    return FUT_MAP.get(str(t).lower(), 'MECANISMO_COMPARTILHADO'), True

def norm_narr(t):
    if t in NARR_VALIDO: return t, False
    if t is None: return None, False  # tratado a parte (formato etapa/titulo/conteudo)
    return NARR_MAP.get(str(t).lower(), 'texto'), True

def migrar_dict(d):
    """Migra o dict in-place. Retorna True se mudou algo."""
    mudou = False
    conx = d.get('conexoes')
    if isinstance(conx, dict):
        for lat in conx.get('laterais', []) or []:
            if isinstance(lat, dict):
                novo, ch = norm_lateral(lat.get('tipo_relacao'))
                if ch: lat['tipo_relacao'] = novo; mudou = True; bump('lateral_tipo_relacao')
        for fut in conx.get('futuras', []) or []:
            if isinstance(fut, dict):
                novo, ch = norm_fut(fut.get('tipo'))
                if ch: fut['tipo'] = novo; mudou = True; bump('futura_tipo')
                if fut.get('confianca') not in ('consenso_didatico', 'hipotese_pedagogica'):
                    fut['confianca'] = 'hipotese_pedagogica'; mudou = True; bump('futura_confianca_norm')
    # flashcards
    for fc in d.get('flashcards', []) or []:
        if isinstance(fc, dict):
            novo, ch = norm_fc(fc.get('tipo'))
            if ch: fc['tipo'] = novo; mudou = True; bump('flashcard_tipo')
    # narrativa
    narr = d.get('narrativa')
    if isinstance(narr, list):
        nova = []
        rebuild = False
        for item in narr:
            if not isinstance(item, dict):
                nova.append(item); continue
            # formato antigo {etapa, titulo, conteudo} sem tipo
            if 'tipo' not in item and 'etapa' in item and 'conteudo' in item:
                if item.get('titulo'):
                    nova.append({'tipo': 'secao', 'titulo': item['titulo']})
                nova.append({'tipo': 'texto', 'conteudo': item['conteudo']})
                rebuild = True; mudou = True; bump('narrativa_etapa_convertida')
                continue
            novo, ch = norm_narr(item.get('tipo'))
            if ch: item['tipo'] = novo; mudou = True; bump('narrativa_tipo')
            nova.append(item)
        if rebuild:
            d['narrativa'] = nova
    # casos_clinicos: schema antigo etapa_1..etapa_5 -> cascata array
    for caso in d.get('casos_clinicos', []) or []:
        if not isinstance(caso, dict): continue
        if 'caso_id' not in caso and 'id' in caso:
            caso['caso_id'] = caso.pop('id'); mudou = True; bump('caso_id_renomeado')
        if 'cascata' not in caso and any(f'etapa_{i}' in caso for i in range(1, 6)):
            cascata = []
            for i in range(1, 6):
                et = caso.pop(f'etapa_{i}', None)
                if isinstance(et, dict):
                    cascata.append({'etapa': et.get('titulo', CASCATA_ETAPAS[i-1] if i-1 < len(CASCATA_ETAPAS) else str(i)),
                                    'descricao': et.get('conteudo', '')})
            caso['cascata'] = cascata; mudou = True; bump('cascata_convertida')
        # schema PLANO: {causa, estrutura_afetada, disfuncao, sintomas, diagnostico} -> cascata
        if not caso.get('cascata') and all(caso.get(k) for k in ('causa', 'estrutura_afetada', 'disfuncao', 'sintomas')):
            cascata = [
                {'etapa': 'Causa', 'descricao': caso.get('causa', '')},
                {'etapa': 'Estrutura Afetada', 'descricao': caso.get('estrutura_afetada', '')},
                {'etapa': 'Disfunção', 'descricao': caso.get('disfuncao', '')},
                {'etapa': 'Sintoma', 'descricao': caso.get('sintomas', '')},
            ]
            if caso.get('diagnostico'):
                cascata.append({'etapa': 'Consequência', 'descricao': caso.get('diagnostico', '')})
            caso['cascata'] = cascata
            if not caso.get('diagnostico_revelado'):
                caso['diagnostico_revelado'] = caso.get('titulo', '')
            for k in ('causa', 'estrutura_afetada', 'disfuncao', 'sintomas', 'diagnostico'):
                caso.pop(k, None)
            mudou = True; bump('caso_plano_convertido')
        if 'conexao_com_bloco' not in caso and caso.get('ensino_chave'):
            caso['conexao_com_bloco'] = caso['ensino_chave']; mudou = True; bump('ensino_chave_migrado')
    return mudou

# ---------------- LOOP PRINCIPAL ----------------
for path in sorted(glob.glob(os.path.join(RAIZ, '**', '*.json'), recursive=True)):
    if os.path.basename(path) == 'manifesto.json': continue
    with open(path, 'rb') as fb:
        rawbytes = fb.read()
    tinha_bom = rawbytes.startswith(b'\xef\xbb\xbf')
    if tinha_bom: bump('bom_removido')
    raw = rawbytes.decode('utf-8-sig')
    # tenta carregar; se falhar, repara
    reparado = False
    try:
        d = json.loads(raw)
    except json.JSONDecodeError:
        raw2 = reparar_texto(raw)
        try:
            d = json.loads(raw2)
            reparado = True
            raw = raw2
        except json.JSONDecodeError as e:
            rel['ainda_quebrado'].append((path, f'{e.msg} @ L{e.lineno}'))
            continue
    if not isinstance(d, dict):
        continue
    # so migra blocos produzidos (tem narrativa); mas esqueleto com BOM/quebra tambem e reescrito
    narr = d.get('narrativa')
    if not (isinstance(narr, list) and len(narr) > 0):
        if not (reparado or tinha_bom):
            continue
    mudou = migrar_dict(d)
    if reparado:
        rel['reparados_json'].append(path)
    if not (mudou or reparado or tinha_bom):
        rel['ja_ok'].append(path); continue
    # valida serializacao
    try:
        saida = json.dumps(d, ensure_ascii=False, indent=2)
        json.loads(saida)  # sanity
    except Exception as e:
        rel['erro'].append((path, str(e)[:80])); continue
    if not DRY:
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(saida)
    rel['migrados'].append(path)

# ---------------- RELATORIO ----------------
print('=' * 64)
print('REPARO + MIGRACAO' + (' (DRY-RUN)' if DRY else ''))
print('=' * 64)
print(f'JSONs reparados (voltaram a carregar): {len(rel["reparados_json"])}')
for p in rel['reparados_json']: print(f'   OK {os.path.basename(p)}')
print(f'Blocos migrados/normalizados: {len(rel["migrados"])}')
print(f'Ja estavam OK (sem mudanca): {len(rel["ja_ok"])}')
print(f'AINDA QUEBRADOS: {len(rel["ainda_quebrado"])}')
for p, e in rel['ainda_quebrado']: print(f'   X {os.path.basename(p)}: {e}')
print(f'Erros de serializacao: {len(rel["erro"])}')
for p, e in rel['erro']: print(f'   X {os.path.basename(p)}: {e}')
print('\n--- Contadores de correcoes aplicadas ---')
for k, n in sorted(contadores.items(), key=lambda x: -x[1]):
    print(f'   {n:5d}  {k}')

# Conteúdo órfão de alta qualidade — precisa de decisão de conteúdo, não só reorganização

Estes 12 arquivos estavam soltos na raiz do projeto. Todos são **conteúdo completo e bem escrito** (não lixo), mas nenhum pôde ser integrado automaticamente porque cada um tem um problema estrutural que exige julgamento humano — arriscar integrar errado teria corrompido o currículo real. Verificado em 06/07/2026 durante a reorganização do acervo (Fase 5).

## Grupo 1 — Colisão de ID (9 arquivos)

O `resumo_id` do arquivo já existe em `public/blocos/`, mas pertence a um **tópico completamente diferente** do esqueleto vazio que ocupa esse slot no blueprint. Não são a mesma versão em estágios diferentes — são produções independentes que usaram a mesma numeração por coincidência (provavelmente geradas fora do fluxo oficial do blueprint). Sobrescrever o esqueleto destruiria o tópico real planejado; descartar jogaria fora conteúdo completo e de boa qualidade.

| Arquivo | Tópico real do arquivo | Slot com quem colide | Tópico do esqueleto |
|---|---|---|---|
| `s11-int2go-06-001.json` | Near-miss cardiológico (infarto anterior silencioso, ECG ignorado) — na verdade "Internato II — Análise de Erros", não é conteúdo de GO | `public/blocos/int2go/s11-int2go-06-001.json` | Hemorragia pós-parto |
| `s9-onco-01-001.json` | Biologia Tumoral Essencial | `public/blocos/onco/s9-onco-01-001.json` | O Câncer na Prática Clínica |
| `s9-onco-01-002.json` | Oncogenes e Genes Supressores | `public/blocos/onco/s9-onco-01-002.json` | Comportamento Biológico do Tumor |
| `s9-savan-03-000-telemedicina-principios.json` | Telemedicina — Princípios e Aplicações | `public/blocos/savan/s9-savan-03-000.json` | Comunicação Intercultural |
| `s9-savan-03-002-e-saude-digital.json` | E-saúde e Saúde Digital | `public/blocos/savan/s9-savan-03-002.json` | Hierarquia Comunitária e Consentimento |
| `s6-neuro-01-000-metodo-neurologico.json` | Método do exame neurológico completo | `public/blocos/neuro/s6-neuro-01-000.json` | Anatomia Funcional do SNC |
| `s9-emerg-01-001-triagem-manchester.json` | Triagem de Manchester | `public/blocos/emerg/s9-emerg-01-001.json` | Sequência ABCDE |
| `s9-savan-03-001-zona-rural-remota.json` | Telemedicina em zona rural | `public/blocos/savan/s9-savan-03-001.json` | Uso de Intérpretes |
| `s9-savan-04-000-cuidados-culturalmente-sensiveis.json` | Cuidados culturalmente sensíveis | `public/blocos/savan/s9-savan-04-000.json` | Política de Atenção à Saúde Indígena |

**Nota sobre onco:** a pasta `onco` já está 100% completa e os dois temas destes arquivos (biologia tumoral, oncogenes) já são cobertos por blocos existentes mais específicos (`s9-onco-01-003-*`, "Hallmarks do Câncer"). Provavelmente descartáveis por redundância — mas quem decide isso é você, não uma heurística de arquivo.

**Decisão pendente:** para cada um, ou (a) encontrar/criar o slot correto no blueprint da disciplina e integrar lá, ou (b) confirmar que o tema já está coberto e descartar.

## Grupo 2 — ID fora da convenção real da pasta / schema legado (3 arquivos)

| Arquivo | Problema |
|---|---|
| `s4-farma1-001.json` | Convenção real de `farma1` é `s4-farma1-{MM}-{SSS}` (dois dígitos de módulo). Este arquivo usa `s4-farma1-001` (sem módulo) e aponta para um `no_pai_id` que não existe. |
| `s6-derm-x00114.json` | Nenhum arquivo com prefixo `x00*` existe na pasta `derm` — convenção real é `s6-derm-{MM}-{SSS}`. `no_pai_id` declarado não existe. |
| `s9-onco-04-001-cuidados-paliativos.json` | Schema legado pré-v3.1 (usa `id`/`pai`/`caso_clinico` em vez de `resumo_id`/`metadata`/`casos_clinicos`). Módulo "04" ainda não existe em `onco` (só 00 e 01) — seria um módulo novo (Cuidados Paliativos), não uma correção de bug. |

**Decisão pendente:** migrar schema + decidir o ID/módulo correto antes de integrar.

## Corrigidos e recuperados nesta rodada (não precisam de mais nada, exceto a decisão de destino acima)

4 destes 9 arquivos do Grupo 1 estavam com JSON sintaticamente corrompido (chaves trocadas, aspas sem escape) e foram **recuperados sem perda de conteúdo**: `s6-neuro-01-000-metodo-neurologico.json`, `s9-emerg-01-001-triagem-manchester.json`, `s9-savan-03-001-zona-rural-remota.json`, `s9-savan-04-000-cuidados-culturalmente-sensiveis.json`.

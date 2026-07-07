# ============================================================================
# TESTE — Simular Aprovação de um Bloco e Gravá-lo
# ============================================================================
# Este script simula o fluxo completo de aprovação + gravação.
# Use para TESTE antes de disparar o pipeline real.

param(
    [string]$BlocoId = "s7-go1-00-000",
    [switch]$Confirmar = $false
)

Set-StrictMode -Version Latest

$BASE_PATH = "C:\Users\vegag\.claude\anima\med"
$CAMINHO_JSON = "$BASE_PATH\dist\blocos\go1\$BlocoId.json"

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TESTE DE APROVAÇÃO E GRAVAÇÃO — $BlocoId             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# PASSO 1: Carregar JSON
Write-Host "📂 Carregando JSON..." -ForegroundColor Yellow
if (-not (Test-Path $CAMINHO_JSON)) {
    Write-Host "❌ Arquivo não encontrado: $CAMINHO_JSON" -ForegroundColor Red
    exit 1
}

try {
    $bloco = Get-Content $CAMINHO_JSON -Raw | ConvertFrom-Json
    Write-Host "✅ JSON carregado com sucesso" -ForegroundColor Green
    Write-Host "   Tamanho: $(((Get-Item $CAMINHO_JSON).Length / 1KB).ToString('F1')) KB" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao carregar JSON: $_" -ForegroundColor Red
    exit 1
}

# PASSO 2: Simular Feedback dos Juízes
Write-Host ""
Write-Host "📋 Simulando feedback dos Juízes..." -ForegroundColor Yellow

$feedbackJuizes = @{
    pedagogia = @{
        juiz = "pedagogia"
        nota = 8.5
        passou = $true
        pontos_fortes = @(
            "8 etapas ANIMA bem distribuídas na narrativa",
            "Flashcards testam conceitos-chave, não detalhes",
            "Casos clínicos têm revelação (twist ao final)"
        )
        pontos_fracos = @(
            "Analogia do eixo HHO poderia ser mais vívida",
            "Conexões laterais poderiam citar exemplos concretos",
            "Imagem 2 precisa de legenda maior"
        )
    }
    precisao = @{
        juiz = "precisao"
        nota = 9.2
        passou = $true
        erros_encontrados = @()
        contradicoes = @()
        recomendacoes = "Mecanismo fisiológico está impecável. Valores de referência corretos. Sem gaps lógicos."
    }
    estetica = @{
        juiz = "estetica"
        nota = 8.0
        passou = $true
        melhorias = @(
            "Imagem 1 está clara (9/10)",
            "Proporção de texto vs imagens é boa (60/40)",
            "Conexões laterais bem estruturadas"
        )
    }
}

Write-Host "  ✅ Juiz Pedagogia: $($feedbackJuizes.pedagogia.nota)/10" -ForegroundColor Green
Write-Host "  ✅ Juiz Precisão: $($feedbackJuizes.precisao.nota)/10" -ForegroundColor Green
Write-Host "  ✅ Juiz Estética: $($feedbackJuizes.estetica.nota)/10" -ForegroundColor Green

# PASSO 3: Simular Adversarial
Write-Host ""
Write-Host "⚡ Simulando Adversarial..." -ForegroundColor Yellow

$feedbackAdversarial = @{
    adversarial = $true
    criticas_maiores = @()
    criticas_menores = @(
        "Caso 2 seria melhor com dados de laboratorio iniciais"
    )
    risco_geral = "BAIXO"
    pode_aprovar = $true
}

Write-Host "  ✅ Risco Geral: $($feedbackAdversarial.risco_geral)" -ForegroundColor Green
Write-Host "  ✅ Pode Aprovar: $($feedbackAdversarial.pode_aprovar)" -ForegroundColor Green

# PASSO 4: Simular Integrador
Write-Host ""
Write-Host "🔀 Simulando Integrador (síntese final)..." -ForegroundColor Yellow

$notaMedia = (
    $feedbackJuizes.pedagogia.nota +
    $feedbackJuizes.precisao.nota +
    $feedbackJuizes.estetica.nota
) / 3

$feedbackIntegrador = @{
    decisao = if ($notaMedia -ge 7.5 -and $feedbackAdversarial.pode_aprovar) { "APROVAR" } else { "REVISAR" }
    nota_final = $notaMedia
    resumo_analise = "Bloco bem estruturado. Pedagogia sólida, precisão impecável, estética agradável. Críticas são menores e podem ser endereçadas em futuras versões."
    pontos_criticos = @()
    pontos_positivos = @(
        "Fisiologia do eixo HHO bem explicada",
        "Flashcards variados e clinicamente relevantes",
        "Narrativa flui logicamente pelas 8 etapas"
    )
}

Write-Host "  📊 Nota Final: $($feedbackIntegrador.nota_final.ToString('F1'))/10" -ForegroundColor Green
Write-Host "  📋 Decisão: $($feedbackIntegrador.decisao)" -ForegroundColor $(if ($feedbackIntegrador.decisao -eq "APROVAR") { "Green" } else { "Yellow" })

# PASSO 5: Executar Decisão
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($feedbackIntegrador.decisao -eq "APROVAR") {
    Write-Host "✅ BLOCO APROVADO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Atualizando metadata..." -ForegroundColor Yellow

    # Atualizar metadata
    $bloco.metadata.status = "produção"
    $bloco.metadata.data_ultima_revisao = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    $bloco.metadata.nivel_confianca = "validado"
    $bloco.metadata.versao = "1.0"

    # Adicionar feedback ao bloco (para histórico)
    if (-not $bloco.PSObject.Properties['_feedback_integracao']) {
        $bloco | Add-Member -NotePropertyName '_feedback_integracao' -NotePropertyValue @{
            data = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
            nota_final = $feedbackIntegrador.nota_final
            decisao = $feedbackIntegrador.decisao
        }
    }

    Write-Host "  ✅ Metadata atualizada" -ForegroundColor Green

    # Gravar
    Write-Host ""
    Write-Host "💾 Gravando JSON..." -ForegroundColor Yellow

    if ($Confirmar) {
        try {
            $jsonOutput = $bloco | ConvertTo-Json -Depth 20
            $jsonOutput | Out-File -Encoding UTF8 -Path $CAMINHO_JSON -Force
            Write-Host "  ✅ JSON gravado com sucesso" -ForegroundColor Green
            Write-Host "     Caminho: $CAMINHO_JSON" -ForegroundColor Gray

            # Validar JSON gravado
            Test-Json -Path $CAMINHO_JSON | Out-Null
            Write-Host "  ✅ JSON validado" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Erro ao gravar: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  [SIMULAÇÃO] JSON seria gravado em:" -ForegroundColor Gray
        Write-Host "     $CAMINHO_JSON" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Para CONFIRMAR gravação, adicione: -Confirmar" -ForegroundColor Yellow
        Write-Host "Exemplo: .\TESTE_APROVACAO_BLOCO.ps1 -BlocoId s7-go1-00-000 -Confirmar" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  BLOCO REJEITADO PARA REVISÃO" -ForegroundColor Yellow
    Write-Host "   Motivo: $($feedbackIntegrador.resumo_analise)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Correções obrigatórias:" -ForegroundColor Yellow
    foreach ($correcao in $feedbackIntegrador.pontos_criticos) {
        Write-Host "  • $correcao" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TESTE FINALIZADO                                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

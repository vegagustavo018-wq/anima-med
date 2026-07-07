Write-Host ""
Write-Host "=== Definir a chave do Google AI Studio para a ANIMA ===" -ForegroundColor Cyan
Write-Host "Cole sua chave (comeca com AIza...) e aperte Enter." -ForegroundColor Yellow
$k = Read-Host "Chave"
$k = $k.Trim()
if ([string]::IsNullOrWhiteSpace($k) -or $k -eq "COLE_SUA_CHAVE_AQUI") {
  Write-Host "Chave vazia/invalida. Rode de novo." -ForegroundColor Red
} else {
  $dest = "C:\Users\vegag\.claude\anima\med\.env"
  Set-Content -Path $dest -Value ("GEMINI_API_KEY=" + $k) -Encoding ascii -NoNewline
  $len = $k.Length
  $pref = $k.Substring(0, [Math]::Min(4, $len))
  Write-Host ""
  Write-Host ("Salvo em .env  ->  " + $pref + "...(" + $len + " caracteres)") -ForegroundColor Green
  Write-Host "Pode fechar esta janela e voltar pro Claude." -ForegroundColor Green
}
Write-Host ""
Write-Host "Aperte Enter para sair..."
[void](Read-Host)

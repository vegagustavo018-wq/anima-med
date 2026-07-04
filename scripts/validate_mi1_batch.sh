#!/bin/bash
# Validador de batch MI1
# Verifica completude estrutural dos blocos

DIR="C:\Users\vegag\.claude\anima\med\dist\blocos\mi1"
TOTAL=0
COMPLETOS=0
VAZIOS=0

for file in "$DIR"/s7-mi1-*.json; do
    TOTAL=$((TOTAL + 1))
    
    # Verifica se narrativa tem conteúdo
    if grep -q '"narrativa":\s*\[\]' "$file"; then
        VAZIOS=$((VAZIOS + 1))
    else
        COMPLETOS=$((COMPLETOS + 1))
    fi
done

echo "MI1 Status:"
echo "Total: $TOTAL"
echo "Completos: $COMPLETOS"
echo "Vazios: $VAZIOS"
echo "Progresso: $(( COMPLETOS * 100 / TOTAL ))%"

#!/usr/bin/env bash
# dgclaw usuario e o final de dgclaw senha: usuario e endereco do painel, nunca senha nem hash.
set -uo pipefail
# shellcheck source=tests/cli/_comum.sh
. "$(dirname "$0")/_comum.sh"
preparar

printf "DGCLAW_PANEL_USER=dono\nDGCLAW_PANEL_PASSWORD_HASH='scrypt\$velho\$velho'\n" >"$ETC/web.env"
chmod 600 "$ETC/web.env"
ESPERADO=$'Usuário do painel: dono\nEndereço do painel: https://teste.exemplo.org/'

echo "usuario"
dgclaw usuario >"$TMP/o.txt" 2>"$TMP/e.txt"
igual "usuario sai 0" "0" "$?"
igual "saida exata" "$ESPERADO" "$(cat "$TMP/o.txt")"
nega "nao mostra o hash nem a senha" grep -qi 'scrypt\|senha' "$TMP/o.txt"
dgclaw usuario extra >/dev/null 2>"$TMP/e.txt"
igual "opcao sobrando sai 1" "1" "$?"
mv "$ETC/web.env" "$ETC/web.env.guardado"
nega "sem web.env recusa" dgclaw usuario
mv "$ETC/web.env.guardado" "$ETC/web.env"

echo "senha trocar termina com o usuario"
export DGCLAW_SENHA_HASH_CMD="cat >/dev/null; echo 'scrypt\$novo\$novo'"
printf '%s\n' "uma senha bem grande" | dgclaw senha trocar >"$TMP/o.txt" 2>/dev/null
igual "as duas ultimas linhas sao o usuario e o endereco" "$ESPERADO" "$(tail -n 2 "$TMP/o.txt")"
nega "a senha nao aparece na saida" grep -q "uma senha bem grande" "$TMP/o.txt"
unset DGCLAW_SENHA_HASH_CMD

echo "porta invalida sem dominio: nao imprime endereco quebrado"
cp "$ETC/dgclaw.env" "$ETC/dgclaw.env.guardado"
printf 'DGCLAW_PORTA_PAINEL=abc\n' >"$ETC/dgclaw.env"
dgclaw usuario >"$TMP/o.txt" 2>"$TMP/e.txt"
afirma "mostra o usuario" grep -q 'Usuário do painel: dono' "$TMP/o.txt"
nega "nao imprime http://127.0.0.1:/" grep -q 'http://' "$TMP/o.txt"
afirma "avisa que a porta nao esta configurada" grep -q 'porta do painel não está configurada' "$TMP/o.txt"
mv "$ETC/dgclaw.env.guardado" "$ETC/dgclaw.env"

echo "web.env sem usuario: senha trocar confere antes e nao troca"
printf "DGCLAW_PANEL_PASSWORD_HASH='scrypt\$velho\$velho'\n" >"$ETC/web.env"
export DGCLAW_SENHA_HASH_CMD="cat >/dev/null; echo 'scrypt\$novo\$novo'"
printf '%s\n' "uma senha bem grande" | dgclaw senha trocar >"$TMP/o.txt" 2>"$TMP/e.txt"
igual "sai 1" "1" "$?"
afirma "diz para rodar o instalador" grep -q 'rode o instalador de novo' "$TMP/e.txt"
afirma "a senha antiga continua" grep -q 'scrypt\$velho\$velho' "$ETC/web.env"
nega "a senha nova nao foi gravada" grep -q 'scrypt\$novo' "$ETC/web.env"
unset DGCLAW_SENHA_HASH_CMD
printf "DGCLAW_PANEL_USER=dono\nDGCLAW_PANEL_PASSWORD_HASH='scrypt\$velho\$velho'\n" >"$ETC/web.env"

echo "ajuda"
afirma "a ajuda lista dgclaw usuario" bash -c "'$CLI' ajuda | grep -q 'dgclaw usuario'"

echo "sem root"
if [ "$(id -u)" -ne 0 ]; then
    (unset DGCLAW_RAIZ; "$CLI" usuario >"$TMP/o.txt" 2>"$TMP/e.txt")
    igual "sem root sai 1" "1" "$?"
    afirma "manda usar sudo" grep -q 'sudo dgclaw usuario' "$TMP/e.txt"
    nega "sem root nao imprime usuario" grep -q 'Usuário' "$TMP/o.txt"
else
    echo "  pulado: esta maquina roda como root"
fi
fim

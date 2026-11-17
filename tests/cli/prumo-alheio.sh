#!/usr/bin/env bash
# `prumo` alheio: o status avisa e o botao de emergencia passa a dizer dgclaw. Tres casos, sem root:
# sem `prumo` no PATH, com o nosso atalho e com um `prumo` de outro programa.
set -uo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_comum.sh
. "$AQUI/_comum.sh"
preparar

BIN="$DGCLAW_RAIZ/usr/local/bin"
mkdir -p "$BIN" "$TMP/outro"
PATH_BASE="$PATH"
AVISO="o comando 'prumo' deste servidor nao e o do Prumo da Locadora"

# prog_da_emergencia: o PROG que o lib/emergencia.sh usa (aparece na ajuda).
prog_da_emergencia() { bash "$REPO/lib/emergencia.sh" --help 2>&1 | sed -n 's/^  \(.*\) estado .*/\1/p' | head -n 1; }

echo "sem prumo no PATH"
dgclaw status >"$TMP/o.txt" 2>&1
nega "nenhum prumo: status nao avisa" grep -q "$AVISO" "$TMP/o.txt"
igual "nenhum prumo: PROG segue prumo" "prumo emergencia" "$(prog_da_emergencia)"

echo "o nosso atalho"
printf '#!/bin/sh\nexec %s/dgclaw "$@"\n' "$BIN" >"$BIN/prumo"; chmod 755 "$BIN/prumo"
PATH="$BIN:$PATH_BASE"; export PATH
dgclaw status >"$TMP/o.txt" 2>&1
nega "atalho nosso: status nao avisa" grep -q "$AVISO" "$TMP/o.txt"
igual "atalho nosso: PROG segue prumo" "prumo emergencia" "$(prog_da_emergencia)"

echo "prumo alheio no PATH"
printf '#!/bin/sh\necho outro programa\n' >"$TMP/outro/prumo"; chmod 755 "$TMP/outro/prumo"
PATH="$TMP/outro:$BIN:$PATH_BASE"; export PATH
dgclaw status >"$TMP/o.txt" 2>&1
afirma "alheio antes do nosso: status avisa" grep -q "$AVISO" "$TMP/o.txt"
afirma "o aviso manda usar sudo dgclaw" grep -q "use 'sudo dgclaw ...'" "$TMP/o.txt"
igual "alheio: PROG vira dgclaw" "dgclaw emergencia" "$(prog_da_emergencia)"
rm -f "$BIN/prumo"; PATH="$TMP/outro:$PATH_BASE"; export PATH
dgclaw status >"$TMP/o.txt" 2>&1
afirma "alheio e nenhum atalho nosso: status avisa" grep -q "$AVISO" "$TMP/o.txt"
printf '#!/bin/sh\necho outro\n' >"$BIN/prumo"; chmod 755 "$BIN/prumo"; PATH="$BIN:$PATH_BASE"; export PATH
dgclaw status >"$TMP/o.txt" 2>&1
afirma "prumo nosso caminho, conteudo diferente: status avisa" grep -q "$AVISO" "$TMP/o.txt"

fim

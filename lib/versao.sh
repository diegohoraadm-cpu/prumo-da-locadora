#!/usr/bin/env bash
# lib/versao.sh: a versao e o commit que estao INSTALADOS, lidos do dgclaw.env (o install.sh
# grava DGCLAW_VERSAO a partir do arquivo VERSION e DGCLAW_COMMIT do clone).
#
# Carregado com `source` pelo bin/dgclaw, nunca executado. Quem chama ja rodou carregar_env_dgclaw.

# versao_texto: "1.0.5 (commit abc123def456)"; sai com 1 e nao imprime nada se a versao nao foi registrada.
versao_texto() {
    local v="${DGCLAW_VERSAO:-}" c="${DGCLAW_COMMIT:-}"
    [ -n "$v" ] || return 1
    if [ -n "$c" ]; then printf '%s (commit %s)' "$v" "${c:0:12}"; else printf '%s' "$v"; fi
}

# versao_linha: a primeira linha do `prumo status`.
versao_linha() {
    local t
    if t="$(versao_texto)"; then printf 'Prumo da Locadora %s\n' "$t"
    else printf 'Prumo da Locadora: versao nao registrada: rode sudo prumo atualizar ou ./install.sh de novo\n'; fi
}

# versao_main: `prumo versao`, so a versao e o commit.
versao_main() {
    [ $# -eq 0 ] || falha "'versao' nao tem opcoes (recebi: $*)." "use: prumo versao"
    carregar_env_dgclaw
    local t
    t="$(versao_texto)" || falha "o Prumo da Locadora nao registrou a versao instalada (falta DGCLAW_VERSAO em $DG_ETC/dgclaw.env)." \
        "rode sudo prumo atualizar ou ./install.sh de novo dentro do clone; o instalador anota a versao."
    printf '%s\n' "$t"
}

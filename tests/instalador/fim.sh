# shellcheck shell=bash
# Fim da instalacao (lote C4): agentes `created` ligados e `exited` nunca, aviso da 1.0.5 so por leitura,
# atalho `prumo`, primeiro backup. Carregado com source por rodar.sh; tudo em raiz falsa.

# dgclaw de mentira: registra cada chamada no log dos stubs; `versao` responde um texto fixo.
fim_dgclaw_falso() {
    cat >"$FALSO/bin/dgclaw" <<'SH'
#!/bin/sh
echo "dgclaw $*" >>"$DGCLAW_STUB_LOG"
[ "${1:-}" = versao ] && echo "versao-falsa"
exit 0
SH
    chmod +x "$FALSO/bin/dgclaw"
}

# fim_com_agentes <slug:estado>...: instala, registra os agentes (com o estado do container) e instala de novo.
fim_com_agentes() {
    local par slug estado
    fim_dgclaw_falso
    instalacao_basica >/dev/null || return 1
    mkdir -p "$TMP/estado"
    for par in "$@"; do
        slug="${par%%:*}"; estado="${par#*:}"
        jq --arg s "$slug" '.agentes += [{slug:$s, tipo:"agente", runner:"http://127.0.0.1:4401"}]' "$RAIZ/etc/dgclaw/agentes.json" >"$TMP/a.json" \
            && cp "$TMP/a.json" "$RAIZ/etc/dgclaw/agentes.json"
        [ "$estado" = ausente ] || echo "$estado" >"$TMP/estado/c-dgclaw-$slug"
    done
    : >"$STUB_LOG"
    instalacao_basica
}

caso_fim_liga_so_agente_created() {
    novo_cenario
    afirma "a instalacao termina com sucesso" fim_com_agentes ana:created bia:exited cai:running dia:ausente
    afirma "agente created ganha um agente iniciar" tem "$STUB_LOG" "dgclaw agente iniciar ana"
    nega "agente exited nunca e iniciado" tem "$STUB_LOG" "dgclaw agente iniciar bia"
    nega "agente running nao e iniciado" tem "$STUB_LOG" "dgclaw agente iniciar cai"
    nega "agente sem container nao e iniciado" tem "$STUB_LOG" "dgclaw agente iniciar dia"
    igual "$(contar "$STUB_LOG" 'dgclaw agente iniciar')" 1 || { echo "      FALHOU: devia haver exatamente 1 agente iniciar"; FALHAS=$((FALHAS + 1)); }
}

caso_fim_aviso_da_versao_so_sem_manifesto() {
    novo_cenario
    afirma "a instalacao termina com sucesso" fim_com_agentes ana:running bia:running
    afirma "sem manifesto: o aviso aparece" tem "$SAIDA" "AVISO DA VERSÃO 1.0.5"
    afirma "o aviso traz o comando de cada agente" tem "$SAIDA" "sudo prumo agente recriar bia --forcar"
    afirma "o aviso diz que a tela termina INCOMPLETA" tem "$SAIDA" "Atualizacao INCOMPLETA"
    local h="$RAIZ/var/lib/dgclaw/agentes"
    mkdir -p "$h/ana/home/.dgclaw" "$h/bia/home/.dgclaw"
    echo abc >"$h/ana/home/.dgclaw/unidades-padrao.sha256"
    echo abc >"$h/bia/home/.dgclaw/unidades-padrao.sha256"
    afirma "reinstala com manifesto" instalacao_basica
    nega "com manifesto em todos: o aviso some" tem "$SAIDA" "AVISO DA VERSÃO 1.0.5"
    # um link no lugar do manifesto nao vale como manifesto, e nada e gravado atraves dele
    echo alvo >"$TMP/alvo-do-link"
    rm "$h/bia/home/.dgclaw/unidades-padrao.sha256"
    ln -s "$TMP/alvo-do-link" "$h/bia/home/.dgclaw/unidades-padrao.sha256"
    afirma "reinstala com link no lugar do manifesto" instalacao_basica
    afirma "link no manifesto: o aviso volta" tem "$SAIDA" "AVISO DA VERSÃO 1.0.5"
    igual "$(cat "$TMP/alvo-do-link")" alvo || { echo "      FALHOU: o alvo do link foi escrito"; FALHAS=$((FALHAS + 1)); }
    # link na pasta .dgclaw da casa: tambem conta como sem manifesto
    rm "$h/bia/home/.dgclaw/unidades-padrao.sha256"; rmdir "$h/bia/home/.dgclaw"
    mkdir "$TMP/fora"; echo abc >"$TMP/fora/unidades-padrao.sha256"; ln -s "$TMP/fora" "$h/bia/home/.dgclaw"
    afirma "reinstala com link na pasta .dgclaw" instalacao_basica
    afirma "link na pasta: o aviso volta" tem "$SAIDA" "AVISO DA VERSÃO 1.0.5"
}

caso_fim_atalho_prumo_igual_ao_dgclaw() {
    novo_cenario
    fim_dgclaw_falso
    afirma "a instalacao termina com sucesso" instalacao_basica
    local p="$RAIZ/usr/local/bin/prumo"
    afirma "prumo e um arquivo comum executavel (nao um link)" bash -c "[ -f '$p' ] && [ ! -L '$p' ] && [ -x '$p' ]"
    afirma "prumo faz exec do dgclaw" tem "$p" "exec $RAIZ/usr/local/bin/dgclaw \"\$@\""
    igual "$(env DGCLAW_STUB_LOG="$STUB_LOG" "$p" versao)" "$(env DGCLAW_STUB_LOG="$STUB_LOG" "$RAIZ/usr/local/bin/dgclaw" versao)" || { echo "      FALHOU: prumo versao difere de prumo versao"; FALHAS=$((FALHAS + 1)); }
    igual "$(env DGCLAW_STUB_LOG="$STUB_LOG" "$p" versao)" "versao-falsa" || { echo "      FALHOU: prumo versao nao rodou o dgclaw"; FALHAS=$((FALHAS + 1)); }
    afirma "o atalho nasce antes de o Admin ser ligado" bash -c "a=\$(grep -n 'comando prumo' '$SAIDA' | head -1 | cut -d: -f1); b=\$(grep -n 'Ligando o Admin' '$SAIDA' | head -1 | cut -d: -f1); [ -n \"\$a\" ] && [ -n \"\$b\" ] && [ \"\$a\" -lt \"\$b\" ]"
    afirma "reinstalar nao reclama do proprio atalho" instalacao_basica
    nega "reinstalar: sem aviso de prumo alheio" tem "$SAIDA" "que nao e o nosso"
}

caso_fim_prumo_alheio_fica_intocado() {
    novo_cenario
    fim_dgclaw_falso
    mkdir -p "$RAIZ/usr/local/bin"
    printf '#!/bin/sh\necho prumo-alheio\n' >"$RAIZ/usr/local/bin/prumo"; chmod +x "$RAIZ/usr/local/bin/prumo"
    afirma "a instalacao termina com sucesso" instalacao_basica
    igual "$(env DGCLAW_STUB_LOG="$STUB_LOG" "$RAIZ/usr/local/bin/prumo")" "prumo-alheio" || { echo "      FALHOU: o prumo alheio foi trocado"; FALHAS=$((FALHAS + 1)); }
    afirma "sai o aviso" tem "$SAIDA" "que nao e o nosso"
    # um link (mesmo quebrado) tambem e alheio e nao e seguido
    rm "$RAIZ/usr/local/bin/prumo"; ln -s "$TMP/nao-existe" "$RAIZ/usr/local/bin/prumo"
    afirma "reinstala com link no lugar" instalacao_basica
    afirma "o link continua sendo o link" test "$(readlink "$RAIZ/usr/local/bin/prumo")" = "$TMP/nao-existe"
    nega "nada foi escrito atraves do link" test -e "$TMP/nao-existe"
    afirma "sai o aviso do link" tem "$SAIDA" "que nao e o nosso"
}

caso_fim_primeiro_backup_so_sem_backup() {
    novo_cenario
    fim_dgclaw_falso
    afirma "instalacao nova termina com sucesso" instalacao_basica
    igual "$(contar "$STUB_LOG" 'dgclaw backup')" 1 || { echo "      FALHOU: instalacao nova sem backup devia fazer o primeiro"; FALHAS=$((FALHAS + 1)); }
    : >"$STUB_LOG"
    mkdir -p "$RAIZ/var/backups/dgclaw/20261101-000000"
    afirma "reinstalacao com backup existente termina" instalacao_basica
    nega "com backup existente nao faz outro" tem "$STUB_LOG" "dgclaw backup"
    : >"$STUB_LOG"
    rm -rf "$RAIZ/var/backups"
    afirma "ensaio termina" instalacao_basica --ensaio
    nega "o ensaio nao faz backup" tem "$STUB_LOG" "dgclaw backup"
}

caso_fim_aviso_separa_exited_de_quem_vira_falhou() {
    novo_cenario
    afirma "a instalacao termina com sucesso" fim_com_agentes ana:exited bia:created cai:running
    afirma "o aviso aparece" tem "$SAIDA" "AVISO DA VERSÃO 1.0.5"
    nega "nada e iniciado no exited" tem "$STUB_LOG" "dgclaw agente iniciar ana"
    afirma "o created (ligado agora) e o running vao para a lista do FALHOU" tem "$SAIDA" "FALHOU e a tela vai terminar com"
    afirma "o --forcar e comandado para o bia" tem "$SAIDA" "sudo prumo agente recriar bia --forcar"
    afirma "o --forcar e comandado para o cai" tem "$SAIDA" "sudo prumo agente recriar cai --forcar"
    nega "o exited nao recebe comando de --forcar" tem "$SAIDA" "sudo prumo agente recriar ana --forcar"
    afirma "o exited aparece como desligado que fica como esta" grep -qE "estao desligados e ficam como estao.*: ana\$" "$SAIDA"
    afirma "o aviso diz o que o --forcar perde" tem "$SAIDA" "perde o que foi instalado so dentro dela"
    afirma "o aviso diz onde fica a lista" tem "$SAIDA" "/var/lib/dgclaw/agentes/<nome do agente>/perdido-no-recriar-<data>.txt"
    # so exited sem manifesto: nada de promessa de FALHOU
    novo_cenario
    afirma "instalacao so com exited" fim_com_agentes ana:exited
    nega "so exited: o aviso nao promete FALHOU" tem "$SAIDA" "vao aparecer como FALHOU"
    nega "so exited: nada de --forcar" tem "$SAIDA" "recriar ana --forcar"
    afirma "so exited: diz que fica desligado" tem "$SAIDA" "estao desligados e ficam como estao"
    nega "so exited: nada iniciado" tem "$STUB_LOG" "dgclaw agente iniciar"
}

caso_fim_agente_sem_container_nao_manda_iniciar() {
    novo_cenario
    afirma "a instalacao termina com sucesso" fim_com_agentes ana:exited dia:ausente cai:running
    afirma "o aviso aparece" tem "$SAIDA" "AVISO DA VERSÃO 1.0.5"
    afirma "o agente sem container tem lista propria" grep -qE "sem container .*: dia\$" "$SAIDA"
    afirma "diz que o iniciar nao funciona sem container" tem "$SAIDA" "O \"agente iniciar\" nao funciona sem container"
    afirma "o comando certo e o recriar --forcar" tem "$SAIDA" "sudo prumo agente recriar <nome do agente> --forcar"
    nega "o agente sem container nao cai na lista dos desligados" grep -qE "estao desligados e ficam como estao.*dia" "$SAIDA"
    afirma "o desligado de verdade segue na lista dos desligados" grep -qE "estao desligados e ficam como estao.*: ana\$" "$SAIDA"
    nega "nada e iniciado no agente sem container" tem "$STUB_LOG" "dgclaw agente iniciar dia"
    afirma "o aviso dos desligados diz que a etapa so vale na atualizacao seguinte" tem "$SAIDA" "Na atualizacao SEGUINTE a esta"
    novo_cenario
    afirma "instalacao so com agente sem container" fim_com_agentes dia:ausente
    nega "so sem container: nao promete FALHOU" tem "$SAIDA" "vao aparecer como FALHOU"
    nega "so sem container: nao manda iniciar" tem "$SAIDA" "ligue com: sudo prumo agente iniciar"
}

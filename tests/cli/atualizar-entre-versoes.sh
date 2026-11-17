#!/usr/bin/env bash
# `dgclaw atualizar` ENTRE DUAS VERSOES REAIS: instalado no commit anterior, atualizar para o candidato.
#
#   bash tests/cli/atualizar-entre-versoes.sh <commit anterior> <commit candidato>
#   (da raiz do repositorio; sempre pela caixa: bin/caixa-testes.sh bash tests/cli/atualizar-entre-versoes.sh <a> <b>)
#
# Diferente de tests/cli/atualizar.sh (que atualiza um repositorio de mentira), aqui o install.sh e o
# lib/atualizar.sh sao os de verdade, saidos do git: o aluno roda o atualizar ANTIGO, que instala o instalador
# NOVO, constroi a imagem e chama o `agente recriar` NOVO. Tudo numa raiz falsa, com podman, systemctl e curl de
# mentira (tests/cli/stubs). Prova a LOGICA do caminho (ordem, decisoes, mensagens, o que e gravado e o que e
# preservado); nao prova podman, systemd nem imagem de verdade.
#
# Etapas: 1) instala o anterior e cria 4 agentes (comum, em "created", com pacote instalado a mao, com rotina
# padrao editada); 2) enche de dados do dono e fotografa; 3) 1a atualizacao com o atualizar.sh antigo; 4) --voltar
# e a 1a de novo; 5) `agente recriar <slug> --forcar` em cada agente; 6) 2a atualizacao, para um commit trivial
# novo, ja com o atualizar.sh novo (parecer antes do --ok-do-dono).
#
# LIMITES DECLARADOS (o aceite repete os dois na saida):
#  - O manifesto das rotinas padrao (.dgclaw/unidades-padrao.sha256) e EMULADO pelo embrulho do podman abaixo.
#    `forcar_com_manifesto=4` conta o EMBRULHO gravando uma linha por unidade, nao o container de verdade gravando
#    o manifesto: nao prova hash, nem o caminho ABS_CONFIG, nem o que roda dentro do container.
#  - A fotografia nao cobre /opt/dgclaw/admin, /etc/dgclaw/marca nem home/.claude/skills (ver fotografar()).
#
# Imprime, alem do que as verificacoes dizem, as linhas `R1 nome=valor` que o aceite
# (aceite/juncao-e-marca.mjs --bloco R1) le. Uma verificacao que falha deixa o codigo de saida != 0.
set -uo pipefail
# shellcheck source=tests/cli/_comum.sh
. "$(dirname "$0")/_comum.sh"
[ $# -eq 2 ] || { echo "uso: bash tests/cli/atualizar-entre-versoes.sh <commit anterior> <commit candidato>" >&2; exit 2; }
ANT="$(git -C "$REPO" rev-parse --verify "$1^{commit}")" || exit 2
CAND="$(git -C "$REPO" rev-parse --verify "$2^{commit}")" || exit 2
preparar

# O podman de mentira da suite so tem UM estado de pacotes para todos os containers e nao executa o script que o
# `agente reparar` manda para dentro do container. Este embrulho acrescenta as duas coisas que o R1 precisa, sem
# mexer no stub compartilhado: (1) lista de pacotes por container (estado/pacotes-de-<container>); (2) quando o
# script do vida_script chega ao container (`exec -i <c> bash -s` com "unidades-padrao.sha256"), grava na casa o
# manifesto que ele gravaria la dentro, uma linha "HASH-FIXO  <arquivo>" por unidade padrao do diff do container
# (a mesma convencao do stub `sha256sum`). Quem prova que o script traz a linha que grava o manifesto e o grep no
# STUB_LOG.stdin mais abaixo; o que roda dentro do container de verdade fica sem prova.
STUBS_R1="$TMP/stubs-r1"; mkdir -p "$STUBS_R1"
cat >"$STUBS_R1/podman" <<EOF
#!/usr/bin/env bash
est="\${STUB_ESTADO:?}"
if [ "\${1:-}" = exec ] && printf '%s ' "\$@" | grep -q dpkg-query && [ -f "\$est/pacotes-de-\${2:-}" ]; then
    echo "podman \$*" >>"\${STUB_LOG:?}"; cat "\$est/pacotes-de-\${2}"; exit 0
fi
if [ "\${1:-}" = exec ] && printf '%s ' "\$@" | grep -q -- ' -i '; then
    ent="\$(cat)"
    printf '%s\n' "\$ent" | "$AQUI/stubs/podman" "\$@"; rc=\$?
    if grep -q 'unidades-padrao.sha256' <<<"\$ent"; then
        c=""; for a in "\$@"; do case "\$a" in dgclaw-*) c="\$a"; break ;; esac; done
        slug="\${c#dgclaw-}"; casa="\${DGCLAW_RAIZ:?}/var/lib/dgclaw/agentes/\$slug/home"
        mkdir -p "\$casa/.dgclaw"
        sed -n 's/^A //p' "\$est/diff-\$c" 2>/dev/null | grep -E '/dgclaw-[^/]*\.(service|timer)\$' | grep -v -- '-self-' \\
            | sed 's/^/HASH-FIXO  /' >"\$casa/.dgclaw/unidades-padrao.sha256"
    fi
    exit \$rc
fi
exec "$AQUI/stubs/podman" "\$@"
EOF
chmod +x "$STUBS_R1/podman"

# Os stubs do instalador completam o que a CLI nao usa (apt-get, dpkg, ufw...); os da CLI vem antes (podman,
# systemctl, curl com estado proprio) e o embrulho acima vem na frente de todos.
PATH="$STUBS_R1:$AQUI/stubs:$REPO/tests/instalador/stubs:$PATH"
export PATH
export DGCLAW_STUB_LOG="$TMP/instalador.log" DGCLAW_STUB_ESTADO="$TMP/estado-instalador"
export DGCLAW_PULAR_CHECAGENS=1 DGCLAW_ESPERA_CERT=5 DGCLAW_ATUALIZAR_LIVRE_MIN_MB=1 DGCLAW_TEMPO_PARADA=3
export DGCLAW_SENHA_HASH_CMD="$REPO/tests/instalador/senha-hash-falso.sh"
export GIT_AUTHOR_NAME=teste GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=teste GIT_COMMITTER_EMAIL=t@t
: >"$DGCLAW_STUB_LOG"
RAIZ="$DGCLAW_RAIZ"
ADMIN="$RAIZ/opt/dgclaw/admin"
BACKUPS="$RAIZ/var/backups/dgclaw"
INST="$RAIZ/usr/local/bin/dgclaw"      # o dgclaw INSTALADO (link para o app da raiz falsa), nao o do repositorio
dg() { "$INST" "$@"; }
AGENTES=(ana caio bia edu)             # comum, em created, com pacote a mao, com rotina padrao editada
R1() { printf 'R1 %s=%s\n' "$1" "$2"; }

# --- o "GitHub": repositorio nu com o candidato na main; o clone do aluno esta no anterior ---------------
git clone -q --bare "$REPO" "$TMP/origem.git"
git -C "$TMP/origem.git" update-ref refs/heads/main "$CAND"
git -C "$TMP/origem.git" symbolic-ref HEAD refs/heads/main
git clone -q "$TMP/origem.git" "$TMP/clone"
git -C "$TMP/clone" checkout -q -B main "$ANT"
git -C "$TMP/clone" branch -q --set-upstream-to=origin/main main
CLONE="$TMP/clone"

# --- 1. instala o anterior e cria os 4 agentes -------------------------------------------------------------
mkdir -p "$RAIZ/var/lib/dgclaw/web"
echo ok >"$RAIZ/var/lib/dgclaw/web/admin-saudado"
echo active >"$STUB_ESTADO/svc-caddy"; echo active >"$STUB_ESTADO/svc-dgclaw-web"; echo active >"$STUB_ESTADO/svc-dgclaw-admin"
echo imagem-v1 >"$STUB_ESTADO/imagem-id"
if printf '%s\n' 'uma-frase-comprida-123' | bash "$CLONE/install.sh" --usuario maria --provedor claude --dominio teste.exemplo.org >"$TMP/instalar.txt" 2>&1; then
    ok "install.sh de ${ANT:0:7} instalou o Admin"
else
    mal "install.sh de ${ANT:0:7} falhou: $(tail -n 5 "$TMP/instalar.txt" | tr '\n' ' ')"
fi
afirma "o dgclaw.env anota o commit instalado ($ANT)" grep -qx "DGCLAW_COMMIT=$ANT" "$ETC/dgclaw.env"
AT_ANTIGO_BLOB="$(git hash-object "$RAIZ/opt/dgclaw/app/lib/atualizar.sh")"
for s in "${AGENTES[@]}"; do dg agente criar "$s" --nome "$s" --dono "Marta" >"$TMP/criar-$s.txt" 2>&1 || mal "agente criar $s: $(tail -n 3 "$TMP/criar-$s.txt" | tr '\n' ' ')"; done
igual "4 agentes criados" "4" "$(jq '[.agentes[] | select(.tipo=="agente")] | length' "$ETC/agentes.json")"
# estados: ana, bia, edu ligados; caio em created (container que nao subiu)
for s in ana bia edu; do echo running >"$STUB_ESTADO/c-dgclaw-$s"; done
echo created >"$STUB_ESTADO/c-dgclaw-caio"
IMG_VELHA="$(cat "$STUB_ESTADO/imagem-id")"
for s in "${AGENTES[@]}"; do cat "$STUB_ESTADO/imagem-id" >"$STUB_ESTADO/img-dgclaw-$s"; done
# o que existe so dentro de cada container: as rotinas padrao (todas as versoes sem manifesto caem na lista),
# e, no "bia", um pacote instalado a mao; no "edu", uma rotina padrao com o conteudo editado
for s in "${AGENTES[@]}"; do
    printf 'A /etc/systemd/system/dgclaw-%s-reflection.service\nA /etc/systemd/system/dgclaw-%s-reflection.timer\nA /etc/systemd/system/dgclaw-%s-heartbeat.service\nA /etc/systemd/system/dgclaw-%s-heartbeat.timer\n' "$s" "$s" "$s" "$s" >"$STUB_ESTADO/diff-dgclaw-$s"
done
printf 'base-files\nbash\nhtop-extra\n' >"$STUB_ESTADO/pacotes-de-dgclaw-bia"
printf '/etc/systemd/system/dgclaw-edu-heartbeat.timer\n' >"$STUB_ESTADO/unidade-editada"

# --- 2. dados do dono + fotografia -------------------------------------------------------------------------------
printf 'GROQ_API_KEY=gsk_chave_da_marta\nQUALQUER_COISA=1\n' >>"$ETC/web.env"
printf 'LINHA_DA_MARTA=oi\n' >>"$ETC/dgclaw.env"
for s in "${AGENTES[@]}"; do
    casa="$LIB/agentes/$s"; h="$casa/home"
    mkdir -p "$h/memory" "$h/.dgclaw" "$h/.claude/projects/-home-agente"
    printf '# AGENT.md de %s\nVoce e %s, a assistente da Marta. Sempre me chame de Dona Marta.\n' "$s" "$s" >"$h/AGENT.md"
    for n in 1 2 3; do printf 'nota %s de %s: a Marta prefere cafe sem acucar.\n' "$n" "$s" >"$h/memory/nota-$n.md"; done
    printf 'OPENAI_API_KEY=sk-%s-da-marta\n' "$s" >"$casa/cofre/cofre.env"
    printf '{"crons":[{"name":"lembrete-agua","calendar":"*-*-* 09:00:00"}]}\n' >"$h/.dgclaw/self-crons.json"
    printf '[{"id":"p1","titulo":"ligar para o fornecedor","estado":"aberta"}]\n' >"$h/.dgclaw/pendencias.json"
    printf '{"msg":"conversa de %s com a Marta"}\n' "$s" >"$h/.claude/projects/-home-agente/sessao1.jsonl"
done
printf '[{"id":"c1","email":"joana@exemplo.org","agente":"ana","estado":"ativo"}]\n' >"$LIB/web/colaboradores.json"
printf '{"principal":"ana"}\n' >"$LIB/web/principal.json"
printf '{"c_ana":{"sessao":"abc"}}\n' >"$LIB/web/sessoes.json"

# LIMITE: nao cobre /opt/dgclaw/admin (o instalador regrava o AGENT.md e as skills do Admin de proposito),
# /etc/dgclaw/marca nem home/.claude/skills/* das casas (o instalador as regrava): uma skill que o dono criou la
# e sumisse nao seria vista por esta fotografia.
# O que NAO pode mudar na 1a atualizacao: o dgclaw.env sem as duas chaves que mudam por definicao, o web.env
# (usuario e hash do painel, chaves), o cofre, as casas, o principal.json e o resto do que e do dono.
fotografar() {
    local f
    # web.env: o instalador novo pode ACRESCENTAR linhas; o que se confere e que toda linha de antes continua la.
    printf '%s  web.env (so as linhas que o dono ja tinha)\n' "$(grep -Fxf "$TMP/webenv-antes.txt" "$ETC/web.env" | LC_ALL=C sort | sha256sum | cut -d' ' -f1)"
    for f in "$ETC/registro.tsv" "$ETC/portas.tsv" "$ETC"/runner/*.token "$ETC"/proxy/*.segredo \
             "$LIB"/web/*.json "$LIB"/agentes/*/cofre/cofre.env; do
        [ -f "$f" ] && printf '%s  %s\n' "$(sha256sum <"$f" | cut -d' ' -f1)" "${f#"$RAIZ"}"
    done
    printf '%s  dgclaw.env sem versao e commit\n' "$(grep -vE '^DGCLAW_(VERSAO|COMMIT)=' "$ETC/dgclaw.env" | sha256sum | cut -d' ' -f1)"
    printf '%s  agentes.json (so os agentes)\n' "$(jq -cS '[.agentes[] | select(.tipo=="agente")] | sort_by(.slug)' "$ETC/agentes.json" | sha256sum | cut -d' ' -f1)"
    (cd "$LIB/agentes" && find . -path '*/home/*' -type f \
        ! -path '*/home/.claude/skills/*' ! -path '*/home/.dgclaw/unidades-padrao.sha256' ! -path '*/home/.plataforma/*' -print0 | sort -z | xargs -0 sha256sum)
}
casas_lista() { (cd "$LIB/agentes" && find . \( -path '*/home/*' -o -path '*/cofre/*' \) -type f | sort); }
casas_apagadas() { comm -23 "$TMP/casas-antes.txt" <(casas_lista) | wc -l; }   # existiam e sumiram
LC_ALL=C sort "$ETC/web.env" >"$TMP/webenv-antes.txt"
fotografar >"$TMP/foto-antes.txt"
casas_lista >"$TMP/casas-antes.txt"
afirma "a fotografia pegou os arquivos do dono" test "$(wc -l <"$TMP/foto-antes.txt")" -ge 40

# Commits e arquivos do clone no momento da primeira atualizacao
agentes_img() { # <slug> -> id da imagem com que o container foi criado
    cat "$STUB_ESTADO/img-dgclaw-$1" 2>/dev/null || echo ausente
}
de_fora_ligados() {
    local s n=0
    for s in "${AGENTES[@]}"; do
        if [ "$(cat "$STUB_ESTADO/c-dgclaw-$s" 2>/dev/null)" = running ] && [ "$(agentes_img "$s")" = "$IMG_VELHA" ]; then n=$((n + 1)); fi
    done
    echo "$n"
}
TEM_C4=nao; git -C "$REPO" show "$CAND:install.sh" | grep -q 'criar_atalho_prumo' && TEM_C4=sim

# --- 3. primeira atualizacao: o atualizar.sh ANTIGO, o instalador e o recriar NOVOS ----------------------------
echo imagem-v2 >"$STUB_ESTADO/imagem-id"   # a imagem "mudou"
: >"$STUB_LOG"
dg atualizar --ok-do-dono >"$TMP/p1.txt" 2>&1; rc1=$?
if grep -q 'Atualizacao INCOMPLETA' "$TMP/p1.txt"; then PRIMEIRA=INCOMPLETA
elif grep -q 'Atualizacao concluida' "$TMP/p1.txt"; then PRIMEIRA=concluida; else PRIMEIRA=indefinida; fi
[ "$PRIMEIRA" = INCOMPLETA ] || sed 's/^/      | /' "$TMP/p1.txt" | tail -n 40
igual "1a atualizacao: a tela diz Atualizacao INCOMPLETA (esperado nesta versao)" "INCOMPLETA" "$PRIMEIRA"
nega "1a atualizacao: nao termina com 0 (ha agente de fora)" test "$rc1" -eq 0
igual "1a atualizacao: o clone foi para o candidato" "$CAND" "$(git -C "$CLONE" rev-parse HEAD)"
DE_FORA_N="$(sed -n 's/.*FALHOU  *nao consegui recriar: *\([^(]*\)(.*/\1/p' "$TMP/p1.txt" | tr ' ' '\n' | grep -c .)"
afirma "1a atualizacao: o fim lista os agentes de fora e o comando de cada um" grep -q 'agente recriar <slug> --forcar' "$TMP/p1.txt"
for s in ana bia edu; do
    afirma "agente $s: a 1a nao o trocou (continua na imagem anterior)" test "$(agentes_img "$s")" = "$IMG_VELHA"
    afirma "agente $s: tem a lista perdido-no-recriar-*.txt" bash -c "ls '$LIB'/agentes/$s/perdido-no-recriar-*.txt >/dev/null 2>&1"
done
if [ "$TEM_C4" = sim ]; then
    afirma "agente caio (created): ligado pelo instalador novo e de fora como os outros" test "$(cat "$STUB_ESTADO/c-dgclaw-caio")" = running
    afirma "agente caio: tambem tem a lista" bash -c "ls '$LIB'/agentes/caio/perdido-no-recriar-*.txt >/dev/null 2>&1"
else
    afirma "agente caio (created): intocado, sem C4 o instalador nao o liga" test "$(cat "$STUB_ESTADO/c-dgclaw-caio")" = created
fi
afirma "agente bia: a lista cita o pacote instalado a mao" bash -c "grep -q 'htop-extra' '$LIB'/agentes/bia/perdido-no-recriar-*.txt"
afirma "agente edu: a lista cita a rotina padrao editada" bash -c "grep -q 'dgclaw-edu-heartbeat.timer' '$LIB'/agentes/edu/perdido-no-recriar-*.txt"
AVISO_REAL=nao; grep -q 'AVISO DA VERSÃO' "$TMP/p1.txt" && AVISO_REAL=sim
fotografar >"$TMP/foto-depois1.txt"
FOTO_DIF="$(diff "$TMP/foto-antes.txt" "$TMP/foto-depois1.txt" | grep -c '^[<>]')"
igual "1a atualizacao: os dados do dono ficaram iguais (fotografia)" "0" "$FOTO_DIF"
[ "$FOTO_DIF" -eq 0 ] || diff "$TMP/foto-antes.txt" "$TMP/foto-depois1.txt" | head -n 12 | sed 's/^/      | /'
CASAS_APAGADAS="$(casas_apagadas)"
igual "1a atualizacao: nenhum arquivo das casas foi apagado" "0" "$CASAS_APAGADAS"
afirma "1a atualizacao: as linhas do dono no dgclaw.env sobreviveram" grep -qx 'LINHA_DA_MARTA=oi' "$ETC/dgclaw.env"
afirma "1a atualizacao: o dgclaw.env anota o candidato" grep -qx "DGCLAW_COMMIT=$CAND" "$ETC/dgclaw.env"
AT_BLOB_REAL="$(git -C "$REPO" rev-parse "$ANT:lib/atualizar.sh")"
VERSAO_CAND="$(git -C "$REPO" show "$CAND:VERSION" | tr -d '[:space:]')"
afirma "1a atualizacao: rodou com o lib/atualizar.sh do anterior (blob igual ao do commit)" test "$AT_ANTIGO_BLOB" = "$AT_BLOB_REAL"
CREATED_DEPOIS="$(cat "$STUB_ESTADO/c-dgclaw-caio")"
DE_FORA_LIG="$(de_fora_ligados)"
BACKUP="$(sed -n 's|.*atualizar --voltar \(/[^ ]*\).*|\1|p' "$TMP/p1.txt" | head -n 1)"
afirma "1a atualizacao: imprime a pasta do backup para voltar" test -n "$BACKUP"
afirma "1a atualizacao: o backup existe" test -d "$BACKUP"

# --- 4. voltar e a primeira de novo ---------------------------------------------------------------------------------
: >"$STUB_LOG"
dg atualizar --voltar "$BACKUP" >"$TMP/v1.txt" 2>&1; rcv=$?
igual "--voltar termina com 0" "0" "$rcv"
[ "$rcv" -eq 0 ] || sed 's/^/      | /' "$TMP/v1.txt" | tail -n 30
VOLTAR_COMMIT="$(sed -n 's/^DGCLAW_COMMIT=//p' "$ETC/dgclaw.env" | tail -n 1)"
fotografar >"$TMP/foto-voltar.txt"
VOLTAR_DIF="$(diff "$TMP/foto-antes.txt" "$TMP/foto-voltar.txt" | grep -c '^[<>]')"
igual "--voltar: os dados do dono iguais aos de antes (fotografia)" "0" "$VOLTAR_DIF"
[ "$VOLTAR_DIF" -eq 0 ] || diff "$TMP/foto-antes.txt" "$TMP/foto-voltar.txt" | head -n 12 | sed 's/^/      | /'
igual "--voltar: o commit instalado volta a ser o anterior" "$ANT" "$VOLTAR_COMMIT"
igual "--voltar: nenhum arquivo das casas foi apagado" "0" "$(casas_apagadas)"
# DEFEITO HERDADO DO ORIGINAL (nao corrigido aqui, a decisao e do dono): o --voltar deixa o clone numa branch
# temporaria (dgclaw-volta-<data>, lib/atualizar.sh:863) SEM upstream, e o atualizar seguinte recusa branch sem
# upstream (lib/atualizar.sh:790-792) e para em "baixando a versao nova". Ja era assim em 4be8b2f. O `git checkout
# main` abaixo CONTORNA o defeito para a suite seguir; nao o testa. Aqui so REGISTRA o estado atual (sem upstream
# = sim); no dia em que o --voltar for corrigido a chave vira nao e o aceite avisa, para tirar o contorno.
VOLTAR_RAMO="$(git -C "$CLONE" rev-parse --abbrev-ref HEAD)"
git -C "$CLONE" rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1 && VOLTAR_SEM_UPSTREAM=nao || VOLTAR_SEM_UPSTREAM=sim
echo "  (registro, nao verificacao: depois do --voltar o clone esta em '$VOLTAR_RAMO' e sem upstream = $VOLTAR_SEM_UPSTREAM)"
# O --voltar tambem recriou os containers (com o recriar do codigo antigo, sem conferencia) na imagem de entao;
# a 1a de novo constroi uma imagem nova, que e a imagem "velha" dos containers que ficarem de fora.
git -C "$CLONE" checkout -q main
IMG_VELHA="$(cat "$STUB_ESTADO/imagem-id")"
echo imagem-v3 >"$STUB_ESTADO/imagem-id"
: >"$STUB_LOG"
dg atualizar --ok-do-dono >"$TMP/p2.txt" 2>&1
grep -q 'Atualizacao INCOMPLETA' "$TMP/p2.txt" && R_P2=INCOMPLETA || R_P2=outro
igual "a 1a atualizacao de novo da o mesmo resultado (INCOMPLETA)" "INCOMPLETA" "$R_P2"
igual "a 1a de novo: os mesmos agentes de fora" "$DE_FORA_LIG" "$(de_fora_ligados)"

# --- 5. recriar --forcar em cada agente ------------------------------------------------------------------------------
for s in "${AGENTES[@]}"; do
    : >"$STUB_LOG"; rm -f "$STUB_LOG.stdin"
    dg agente recriar "$s" --forcar >"$TMP/f-$s.txt" 2>&1; rcf=$?
    igual "agente $s: recriar --forcar termina com 0" "0" "$rcf"
    [ "$rcf" -eq 0 ] || sed 's/^/      | /' "$TMP/f-$s.txt" | tail -n 12
    afirma "agente $s: o script que grava o manifesto chegou ao container" grep -q 'unidades-padrao.sha256' "$STUB_LOG.stdin"
done
rm -f "$STUB_ESTADO/unidade-editada" "$STUB_ESTADO/pacotes-de-dgclaw-bia"   # o container novo nasce da imagem
NA_NOVA=0; COM_MANIFESTO=0
for s in "${AGENTES[@]}"; do
    [ "$(agentes_img "$s")" = "$(cat "$STUB_ESTADO/imagem-id")" ] && NA_NOVA=$((NA_NOVA + 1))
    [ -s "$LIB/agentes/$s/home/.dgclaw/unidades-padrao.sha256" ] && COM_MANIFESTO=$((COM_MANIFESTO + 1))
done
FORCAR_PCT=$((NA_NOVA * 100 / ${#AGENTES[@]}))
igual "depois do --forcar, 100% dos agentes na imagem nova" "100" "$FORCAR_PCT"
igual "depois do --forcar, cada agente tem o manifesto das rotinas padrao" "${#AGENTES[@]}" "$COM_MANIFESTO"
igual "depois do --forcar, nenhum arquivo das casas apagado" "0" "$(casas_apagadas)"
VERSAO_INST="$(sed -n 's/^DGCLAW_VERSAO=//p' "$ETC/dgclaw.env" | tail -n 1)"
igual "DGCLAW_VERSAO e o VERSION do candidato" "$VERSAO_CAND" "$VERSAO_INST"
if [ "$TEM_C4" = sim ]; then
    PRUMO_IGUAL=nao
    [ -x "$RAIZ/usr/local/bin/prumo" ] && [ "$("$RAIZ/usr/local/bin/prumo" versao 2>&1)" = "$(dg versao 2>&1)" ] && PRUMO_IGUAL=sim
else PRUMO_IGUAL=na; fi

# --- 6. segunda atualizacao: commit trivial novo, atualizar.sh NOVO, parecer antes do --ok-do-dono ------------
git clone -q "$TMP/origem.git" "$TMP/trab"
git -C "$TMP/trab" checkout -q -B main "$CAND"
echo "R1: commit trivial para a segunda atualizacao" >"$TMP/trab/NOVIDADE-R1.md"
git -C "$TMP/trab" add -A; git -C "$TMP/trab" commit -q -m "R1: commit trivial"; git -C "$TMP/trab" push -q origin main
echo imagem-v4 >"$STUB_ESTADO/imagem-id"
: >"$STUB_LOG"
# o #76: antes do --ok-do-dono vem o relatorio (--simular) e o parecer sobre o commit DESTINO dele
dg atualizar --simular >"$TMP/simular2.txt" 2>&1
DESTINO="$(sed -n 's/^DESTINO=//p' "$TMP/simular2.txt" | head -n 1)"
igual "o relatorio da 2a atualizacao aponta o commit trivial como destino" "$(git -C "$TMP/origem.git" rev-parse main)" "$DESTINO"
dg atualizar --parecer segura --commit "$DESTINO" --motivo "R1: commit trivial conferido" >"$TMP/parecer2.txt" 2>&1
dg atualizar --ok-do-dono >"$TMP/p3.txt" 2>&1; rc3=$?
if grep -q 'Atualizacao concluida' "$TMP/p3.txt"; then SEGUNDA=concluida
elif grep -q 'Atualizacao INCOMPLETA' "$TMP/p3.txt"; then SEGUNDA=INCOMPLETA; else SEGUNDA=indefinida; fi
[ "$SEGUNDA" = concluida ] || sed 's/^/      | /' "$TMP/p3.txt" | tail -n 30
igual "2a atualizacao: Atualizacao concluida" "concluida" "$SEGUNDA"
igual "2a atualizacao: termina com 0" "0" "$rc3"
SEGUNDA_DE_FORA="$(sed -n 's/.*FALHOU  *nao consegui recriar: *\([^(]*\)(.*/\1/p' "$TMP/p3.txt" | tr ' ' '\n' | grep -c .)"
igual "2a atualizacao: nenhum agente de fora" "0" "$SEGUNDA_DE_FORA"
igual "2a atualizacao: o clone foi para o commit novo" "$(git -C "$TMP/origem.git" rev-parse main)" "$(git -C "$CLONE" rev-parse HEAD)"
for s in "${AGENTES[@]}"; do
    afirma "2a atualizacao: o agente $s esta na imagem nova" test "$(agentes_img "$s")" = "$(cat "$STUB_ESTADO/imagem-id")"
done
igual "2a atualizacao: nenhum arquivo das casas apagado" "0" "$(casas_apagadas)"

# --- as chaves que o aceite le ------------------------------------------------------------------------------------------
echo
R1 atualizar_sh_blob "$AT_ANTIGO_BLOB"
R1 fotografia_diferencas "$FOTO_DIF"
R1 casas_arquivos_apagados "$CASAS_APAGADAS"
R1 primeira_resultado "$PRIMEIRA"
R1 primeira_de_fora "$DE_FORA_N"
R1 created_depois_primeira "$CREATED_DEPOIS"
R1 aviso_c4_impresso "$AVISO_REAL"
for s in ana:comum bia:pacote edu:editado; do
    L=nao; ls "$LIB/agentes/${s%%:*}"/perdido-no-recriar-*.txt >/dev/null 2>&1 && L=sim
    R1 "lista_${s##*:}" "$L"
done
C=nao; grep -q 'htop-extra' "$LIB"/agentes/bia/perdido-no-recriar-*.txt 2>/dev/null && C=sim
R1 lista_pacote_cita_pacote "$C"
R1 de_fora_ligados "$DE_FORA_LIG"
R1 voltar_fotografia_diferencas "$VOLTAR_DIF"
R1 voltar_commit "$VOLTAR_COMMIT"
R1 forcar_na_versao_nova_pct "$FORCAR_PCT"
R1 forcar_com_manifesto "$COM_MANIFESTO"
R1 manifesto_emulado sim   # forcar_com_manifesto conta o embrulho do podman, nao o container
R1 voltar_sem_upstream "$VOLTAR_SEM_UPSTREAM"   # defeito herdado do original, so registrado
R1 versao_instalada "$VERSAO_INST"
R1 prumo_igual_dgclaw "$PRUMO_IGUAL"
R1 segunda_resultado "$SEGUNDA"
R1 segunda_de_fora "$SEGUNDA_DE_FORA"
# R1_GUARDAR=<pasta>: copia as saidas de cada etapa (p1, v1, p2, f-<slug>, p3...) para quem for ler o que aconteceu.
if [ -n "${R1_GUARDAR:-}" ]; then mkdir -p "$R1_GUARDAR" && cp "$TMP"/*.txt "$R1_GUARDAR"/; fi
fim

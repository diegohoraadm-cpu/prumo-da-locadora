#!/usr/bin/env bash
# Teste do dgclaw-sentinela numa raiz falsa, com podman, dgclaw, runner, Admin e Telegram falsos.
# Uso: bash bin/test/dgclaw-sentinela.test.sh
set -uo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$AQUI/../dgclaw-sentinela"
T="$(mktemp -d)"
trap 'kill $SRV 2>/dev/null; rm -rf "$T"' EXIT
FALHAS=0; N=0
ok() { N=$((N+1)); if [ "$2" = 0 ]; then echo "ok   $1"; else echo "FALHOU $1"; FALHAS=$((FALHAS+1)); fi; }

BOT="123456789:AAFakeFakeFakeFakeFakeFakeFakeFake_x1"
export REQ="$T/req.jsonl" SAUDE="$T/saude.json" PORTA_ARQ="$T/porta"
: >"$REQ"
# Servidor falso: /api/saude devolve $SAUDE (500 se ausente); o resto (Telegram, Admin) responde 200. Grava tudo.
node -e '
const http = require("http"), fs = require("fs");
http.createServer((q, s) => { let c = ""; q.on("data", (d) => c += d); q.on("end", () => {
  fs.appendFileSync(process.env.REQ, JSON.stringify({ url: q.url, corpo: c, auth: q.headers.authorization || null }) + "\n");
  if (q.url === "/api/saude") { try { s.end(fs.readFileSync(process.env.SAUDE)); } catch { s.writeHead(500); s.end(); } return; }
  s.end("{\"ok\":true}"); }); }).listen(0, "127.0.0.1", function () { fs.writeFileSync(process.env.PORTA_ARQ, String(this.address().port)); });' & SRV=$!
for _ in $(seq 50); do [ -s "$PORTA_ARQ" ] && break; sleep 0.1; done
PORTA="$(cat "$PORTA_ARQ")"

export DGCLAW_RAIZ="$T/raiz" DGCLAW_TEMPO_ESPERA=0 DGCLAW_TELEGRAM_API="http://127.0.0.1:$PORTA" DGCLAW_ADMIN_URL="http://127.0.0.1:$PORTA"
H="$T/raiz/var/lib/dgclaw/agentes/ana/home"; TD="$H/.claude/projects/-home-agente"
mkdir -p "$DGCLAW_RAIZ/etc/dgclaw/runner" "$TD" "$H/.dgclaw/telegram" "$H/.claude/plugins" "$T/bin"
printf 'tok-admin-teste\n' >"$DGCLAW_RAIZ/etc/dgclaw/runner/admin.token"
jq -n --arg r "http://127.0.0.1:$PORTA" --arg h "$H" --arg td "$TD" \
  '{versao: 1, agentes: [{slug: "ana", nome: "Ana", tipo: "agente", runner: $r, home_host: $h, transcripts_dir: $td, provedor: "claude", cofre_arquivo: "/nao/existe"}]}' \
  >"$DGCLAW_RAIZ/etc/dgclaw/agentes.json"

# podman falso: estado do container em $T/estado; `exec ... grep` do bot.pid passa se existir $T/bun-vivo.
cat >"$T/bin/podman" <<'SH'
#!/usr/bin/env bash
case "$1" in inspect) cat "$T/estado" ;; exec) [ -e "$T/bun-vivo" ] ;; esac
SH
# dgclaw falso: grava o pedido; com $T/conserta, o reparo deixa a saude boa.
cat >"$T/bin/dgclaw" <<'SH'
#!/usr/bin/env bash
echo "$*" >>"$T/dgclaw.log"
[ -e "$T/conserta" ] && { printf '{"ok":true,"agente":{"status":"idle","ptyVivo":true},"sessionId":"s1","ultimaSaidaEm":null}' >"$SAUDE"; touch "$T/bun-vivo"; }
exit 0
SH
chmod +x "$T/bin/"*; export T PATH="$T/bin:$PATH"
LOGF="$DGCLAW_RAIZ/var/log/dgclaw/sentinela.log"
SAO='{"ok":true,"agente":{"status":"idle","ptyVivo":true},"sessionId":"s1","ultimaSaidaEm":null}'
rodar() { : >"$REQ"; : >"$T/dgclaw.log"; bash "$BIN"; }
tg() { grep -c '/sendMessage' "$REQ"; }

# 1. Tudo bem: nada de reparo nem aviso.
echo running >"$T/estado"; printf '%s' "$SAO" >"$SAUDE"
printf '{"claudeAiOauth":{"refreshToken":"x"}}' >"$H/.claude/.credentials.json"
rodar; ok "saudavel: nenhum pedido alem do /api/saude" "$([ "$(grep -vc /api/saude "$REQ")" = 0 ] && [ ! -s "$T/dgclaw.log" ] && echo 0 || echo 1)"

# 2. Runner em erro: reinicia uma vez, nao resolve, avisa o Admin (sem Telegram ligado: nada no bot).
printf '{"ok":true,"agente":{"status":"errored","ptyVivo":false},"sessionId":"s1"}' >"$SAUDE"
rodar
ok "runner em erro: dgclaw agente reiniciar ana" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"
ok "recado ao Admin com o token e o codigo do problema" "$(grep '/api/agents/admin/input' "$REQ" | grep -q "Bearer tok-admin-teste.*" && grep -q "problema 'runner' no agente ana" "$REQ"; echo $?)"
ok "sem Telegram ligado, nada vai ao bot" "$([ "$(tg)" = 0 ] && echo 0 || echo 1)"
grep -q "Tentei consertar sozinho" "$LOGF" 2>/dev/null || true
ok "o log conta o reparo e o aviso" "$(grep -q "tentando uma vez: dgclaw agente reiniciar ana" "$LOGF" && grep -q "avisando o dono (runner, reparo: reiniciar, nao resolveu)" "$LOGF"; echo $?)"

ok "a Sentinela nao cria as chaves do aviso no aparelho" "$([ ! -e "$DGCLAW_RAIZ/var/lib/dgclaw/web/push/vapid.json" ] && echo 0 || echo 1)"

# 3. Mesma falha na rodada seguinte: nem reparo nem aviso (janela de 6 h).
rodar
ok "repetido em menos de 6 h: sem reparo e sem aviso" "$([ ! -s "$T/dgclaw.log" ] && ! grep -q admin/input "$REQ" && echo 0 || echo 1)"
# ... e depois de 6 h volta a tratar.
envelhece() { echo $(( $(date +%s) - 7 * 3600 )) >"$1"; touch -d '7 hours ago' "$1"; }
envelhece "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/ana.runner"
node -e 'require(process.argv[1]).criarPush({ dataDir: process.argv[2], log() {} }).enviar({ titulo: "x" })' "$AQUI/../../web/lib/push.js" "$DGCLAW_RAIZ/var/lib/dgclaw/web"
rodar; ok "passadas 6 h: trata de novo" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"

ok "com as chaves do Web, tenta o aviso no aparelho" "$(grep -q 'aviso no aparelho: 0 de 0 aparelhos' "$LOGF"; echo $?)"
ok "recado ao Admin diz o resultado do reparo" "$(grep -q 'dgclaw agente reiniciar nao resolveu' "$REQ"; echo $?)"

# 4. Cai, volta e cai de novo em menos de 6 h: a marca fica e segura reparo e aviso.
printf '%s' "$SAO" >"$SAUDE"; rodar
ok "voltou: a marca recente fica" "$([ -f "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/ana.runner" ] && echo 0 || echo 1)"
printf '{"ok":true,"agente":{"status":"errored","ptyVivo":false},"sessionId":"s1"}' >"$SAUDE"; rodar
ok "caiu de novo em menos de 6 h: sem reparo e sem aviso" "$([ ! -s "$T/dgclaw.log" ] && ! grep -q admin/input "$REQ" && echo 0 || echo 1)"
# ... e saudavel com a marca de mais de 6 h: a marca sai.
printf '%s' "$SAO" >"$SAUDE"; envelhece "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/ana.runner"; rodar
ok "bom e marca velha: estado limpo" "$([ -z "$(ls "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela")" ] && echo 0 || echo 1)"

# 4b. Atualizacao em andamento (pid vivo na marca): nao confere nada. Pid morto: segue.
bash -c 'exec -a "dgclaw atualizar" sleep 60' & ATU=$!
sleep 0.2; echo $ATU >"$DGCLAW_RAIZ/var/lib/dgclaw/atualizando"
printf '{"ok":true,"agente":{"status":"errored","ptyVivo":false},"sessionId":"s1"}' >"$SAUDE"; rodar
ok "durante o dgclaw atualizar: nenhum pedido e nenhum reparo" "$([ ! -s "$REQ" ] && [ ! -s "$T/dgclaw.log" ] && echo 0 || echo 1)"
touch -d '3 hours ago' "$DGCLAW_RAIZ/var/lib/dgclaw/atualizando"; rodar
ok "marca do atualizar com mais de 2 h (pid vivo, cmdline certo): confere normal" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"
rm -f "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*
kill $ATU 2>/dev/null; wait $ATU 2>/dev/null
# pid reaproveitado (depois de um reboot): vivo, mas nao e um atualizar
sleep 60 & OUTRO=$!; echo $OUTRO >"$DGCLAW_RAIZ/var/lib/dgclaw/atualizando"; rodar; kill $OUTRO 2>/dev/null; wait $OUTRO 2>/dev/null
ok "marca com pid vivo de outro processo: confere normal" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"
rm -f "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*
echo 999999 >"$DGCLAW_RAIZ/var/lib/dgclaw/atualizando"; rodar
ok "marca de atualizacao com pid morto: confere normal" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"
rm -f "$DGCLAW_RAIZ/var/lib/dgclaw/atualizando" "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*; printf '%s' "$SAO" >"$SAUDE"

# 5. Telegram ligado, plugin vivo nao: reinicia, o reparo conserta, aviso de "consertei" pelo bot.
jq -n --arg e /home/agente/.dgclaw/tg2 '{versao: 1, telegram: {ligado: true, estado_dir: $e}}' >"$H/.dgclaw/canais.json"
mkdir -p "$H/.dgclaw/tg2"; printf 'TELEGRAM_BOT_TOKEN=%s\n' "$BOT" >"$H/.dgclaw/tg2/.env"
printf '{"allowFrom":["555111"]}' >"$H/.dgclaw/tg2/access.json"
printf '{"allowFrom":["999"]}' >"$H/.dgclaw/telegram/access.json"
printf '{"plugins":{"telegram@claude-plugins-official":[{}]}}' >"$H/.claude/plugins/installed_plugins.json"
echo 4242 >"$H/.dgclaw/tg2/bot.pid"; touch "$T/conserta"
( for _ in $(seq 300); do ps -eo args | grep -F "$BOT" | grep -v grep >>"$T/ps.txt"; sleep 0.01; done ) & MON=$!
rodar; kill $MON 2>/dev/null; wait $MON 2>/dev/null
ok "plugin parado: reiniciar" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"
ok "aviso pelo bot do agente, para o chat do dono (.env e access.json do estado_dir do canal)" "$(grep "/bot$BOT/sendMessage" "$REQ" | grep -q 'chat_id=555111'; echo $?)"
ok "o aviso diz que consertou" "$(grep sendMessage "$REQ" | grep -q 'consertei'; echo $?)"
ok "o token nao aparece no ps" "$([ ! -s "$T/ps.txt" ] && echo 0 || echo 1)"
ok "o token nao aparece no log" "$(! grep -qF "$BOT" "$LOGF"; echo $?)"
rm -f "$T/conserta"; touch "$T/bun-vivo"; rm -f "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*

# 6. Plugin desinstalado: reparar.
echo '{}' >"$H/.claude/plugins/installed_plugins.json"; rodar
ok "plugin ausente: dgclaw agente reparar" "$(grep -qx 'agente reparar ana' "$T/dgclaw.log"; echo $?)"
printf '{"plugins":{"telegram@claude-plugins-official":[{}]}}' >"$H/.claude/plugins/installed_plugins.json"

# 7. Bot do Telegram morto e o reinicio nao resolve: avisa, sem prometer o caso do outro computador.
rm -f "$T/bun-vivo" "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*; rodar
ok "telegram mudo: reinicia e avisa que nao resolveu" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log" && grep sendMessage "$REQ" | grep -q 'n%C3%A3o+resolveu' && ! grep sendMessage "$REQ" | grep -q 'outro+computador'; echo $?)"
touch "$T/bun-vivo"; rm -f "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*

# 7b. Turno sem resposta: reinicia, a saude volta, mas o turno continua; o aviso pede uma mensagem nova.
python3 - "$TD/s1.jsonl" <<'PY'
import json, sys
from datetime import datetime, timezone, timedelta
t = lambda m: (datetime.now(timezone.utc) - timedelta(minutes=m)).isoformat().replace("+00:00", "Z")
regs = [{"type": "user", "timestamp": t(60), "message": {"role": "user", "content": "oi"}},
        {"type": "assistant", "timestamp": t(59), "message": {"model": "x", "role": "assistant", "stop_reason": "end_turn", "content": [{"type": "text", "text": "ola"}]}},
        {"type": "user", "timestamp": t(30), "message": {"role": "user", "content": '<dgchat from="Dono" chat="c_x" msg="p1" ts="%s">tudo bem?</dgchat>' % t(30)}}]
open(sys.argv[1], "w").write("\n".join(json.dumps(r) for r in regs) + "\n")
PY
touch -d '30 minutes ago' "$TD/s1.jsonl"; touch "$T/conserta"; rodar; rm -f "$T/conserta"
ok "turno sem resposta: reiniciar" "$(grep -qx 'agente reiniciar ana' "$T/dgclaw.log"; echo $?)"
ok "erro segue no turno: pede mensagem nova, nao diz consertei" "$(grep sendMessage "$REQ" | grep -q 'erro+continua' && ! grep sendMessage "$REQ" | grep -q 'consertei'; echo $?)"
rm -f "$TD/s1.jsonl" "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*

# 8. Login vencido no ultimo turno: aviso com a frase do saude_sessao, sem reiniciar.
python3 - "$TD/s1.jsonl" <<'PY'
import json, sys
from datetime import datetime, timezone, timedelta
t = lambda m: (datetime.now(timezone.utc) - timedelta(minutes=m)).isoformat().replace("+00:00", "Z")
regs = [{"type": "user", "timestamp": t(20), "message": {"role": "user", "content": "oi"}},
        {"type": "assistant", "timestamp": t(19), "isApiErrorMessage": True, "error": "authentication_failed",
         "message": {"model": "<synthetic>", "role": "assistant", "content": [{"type": "text", "text": "Login expired · Please run /login"}]}}]
open(sys.argv[1], "w").write("\n".join(json.dumps(r) for r in regs) + "\n")
PY
rodar
ok "login vencido no turno: sem reiniciar" "$([ ! -s "$T/dgclaw.log" ] && echo 0 || echo 1)"
ok "login vencido no turno: avisa pelo bot" "$(grep -q "problema 'turno'" "$REQ" && [ "$(tg)" = 1 ] && echo 0 || echo 1)"
rm -f "$TD/s1.jsonl" "$DGCLAW_RAIZ/var/lib/dgclaw/sentinela/"*

# 9. Sem credencial: login, sem reparo. Container parado: aviso, sem reparo.
rm -f "$H/.claude/.credentials.json"; rodar
ok "sem credencial: aviso de login, sem reparo" "$([ ! -s "$T/dgclaw.log" ] && grep sendMessage "$REQ" | grep -q 'Entrar+com+a+assinatura' && echo 0 || echo 1)"
echo exited >"$T/estado"; rodar
ok "container parado: aviso, sem reparo" "$([ ! -s "$T/dgclaw.log" ] && grep -q "problema 'parado'" "$REQ" && echo 0 || echo 1)"

# 10. Sem agente nenhum: sai sem conferir nada.
echo '{"versao": 1, "agentes": []}' >"$DGCLAW_RAIZ/etc/dgclaw/agentes.json"; rodar
ok "agentes.json vazio: nenhum pedido" "$([ ! -s "$REQ" ] && echo 0 || echo 1)"

echo "$((N - FALHAS)) de $N ok"
[ "$FALHAS" = 0 ]

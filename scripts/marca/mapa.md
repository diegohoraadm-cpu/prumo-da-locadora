# Mapa da marca (saida do `aplicar.mjs --dry`)

Gerado sem escrever nada. Ocorrencia = um achado da regra; "troca" so acontece em contexto de texto.

## 1. Contagem por lote

| Lote | Arquivos que mudam | Trocaria | Fica por excecao | Pede decisao ou reescrita manual |
| --- | ---: | ---: | ---: | ---: |
| M1 | 75 | 202 | 75 | 16 |
| M3 | 41 | 120 | 8 | 52 |
| M4 | 159 | 783 | 86 | 56 |
| M5 | 91 | 661 | 165 | 21 |
| sem-lote | 0 | 0 | 33 | 0 |
| **total** | 366 | 1766 | 367 | 145 |

Por regra (todos os lotes):

| Regra | Trocaria | Excecao | Manual |
| --- | ---: | ---: | ---: |
| barra | 21 | 7 | 71 |
| comando | 1014 | 173 | 12 |
| frase | 731 | 94 | 57 |
| sem-regra | 0 | 93 | 5 |

Manual, por motivo:

| Motivo | Ocorrencias |
| --- | ---: |
| barra-generica | 4 |
| barra-inexistente | 15 |
| barra-nao-ligada | 44 |
| comando-no-inicio-de-string | 6 |
| comparacao-de-logica | 2 |
| fora-de-contexto | 44 |
| sem-regra | 5 |
| tipo-nao-coberto | 25 |

Arquivos sem lote no plano (o Teia atribui a um lote):

| Arquivo | Trocaria | Excecao | Manual |
| --- | ---: | ---: | ---: |
| NOTICE.md | 0 | 1 | 0 |
| aceite/juncao-e-marca.mjs | 0 | 18 | 0 |
| aceite/juncao-excecoes.json | 0 | 14 | 0 |

## 2. Ocorrencias de `/dgclaw:` (decisao de cada uma)

Regra do plano: skill ligada vira `/x`; skill que existe mas nao e ligada, reescrever a frase a mao; inexistente, a frase sai.

| Arquivo | Ocorrencia | Lote | Decisao |
| --- | --- | --- | --- |
| CHANGELOG.md | `/dgclaw:setup` (linha 1175) | M5 | fica por excecao |
| aceite/juncao-e-marca.mjs | `/dgclaw:` (linha 456) | sem-lote | fica por excecao |
| aceite/juncao-e-marca.mjs | `/dgclaw:` (linha 566) | sem-lote | fica por excecao |
| aceite/juncao-e-marca.mjs | `/dgclaw:` (linha 575) | sem-lote | fica por excecao |
| docs/MEMORIA-SEMANTICA.md | `/dgclaw:setup` (linha 27) | M5 | sair (a skill nao existe) |
| docs/MEMORIA-SEMANTICA.md | `/dgclaw:doctor` (linha 69) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/MESA-DE-TAREFAS.md | `/dgclaw:mesa` (linha 29) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/MESA-DE-TAREFAS.md | `/dgclaw:doctor` (linha 40) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/PARIDADE-CODEX.md | `/dgclaw:*` (linha 75) | M5 | reescrever a mao (nome generico ou placeholder) |
| docs/PARIDADE-CODEX.md | `/dgclaw:x` (linha 113) | M5 | reescrever a mao (nome generico ou placeholder) |
| docs/PROVEDORES.md | `/dgclaw:cards` (linha 195) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/TELA-DO-AGENTE.md | `/dgclaw:tela` (linha 166) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/manual/provedores.md | `/dgclaw:*` (linha 47) | M5 | reescrever a mao (nome generico ou placeholder) |
| panel/public/js/app.js | `/dgclaw:powers` (linha 2450) | M1 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/crm/POWER.md | `/dgclaw:powers` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/crm/POWER.md | `/dgclaw:powers` (linha 20) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/meetings/POWER.md | `/dgclaw:powers` (linha 4) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/meetings/POWER.md | `/dgclaw:powers` (linha 22) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/secretary/POWER.md | `/dgclaw:powers` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/secretary/POWER.md | `/dgclaw:connect` (linha 17) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/secretary/POWER.md | `/dgclaw:powers` (linha 21) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| scripts/doctor.sh | `/dgclaw:setup` (linha 222) | M4 | sair (a skill nao existe) |
| scripts/doctor.sh | `/dgclaw:panel` (linha 535) | M4 | reescrever a mao (skill existe, nao e ligada ao agente) |
| scripts/doctor.sh | `/dgclaw:powers` (linha 582) | M4 | revisar (fora de texto) |
| scripts/doctor.sh | `/dgclaw:report` (linha 792) | M4 | trocar por `/report` (mecanico) |
| scripts/gerar-instrucoes.sh | `/dgclaw:nome` (linha 11) | M3 | sair (a skill nao existe) |
| scripts/gerar-instrucoes.sh | `/dgclaw:` (linha 42) | M3 | revisar (fora de texto) |
| scripts/install-core.sh | `/dgclaw:setup` (linha 4) | M4 | sair (a skill nao existe) |
| scripts/install-core.sh | `/dgclaw:setup` (linha 202) | M4 | revisar (fora de texto) |
| scripts/install-timers.sh | `/dgclaw:setup` (linha 112) | M4 | sair (a skill nao existe) |
| scripts/launch.sh | `/dgclaw:setup` (linha 18) | M4 | sair (a skill nao existe) |
| scripts/materialize-identity.sh | `/dgclaw:doctor` (linha 44) | M4 | fica por excecao |
| scripts/powers.py | `/dgclaw:powers` (linha 105) | M4 | reescrever a mao (skill existe, nao e ligada ao agente) |
| scripts/report.py | `/dgclaw:report` (linha 301) | M4 | trocar por `/report` (mecanico) |
| scripts/uninstall.sh | `/dgclaw:setup` (linha 153) | M4 | sair (a skill nao existe) |
| scripts/watchdog.py | `/dgclaw:doctor` (linha 273) | M4 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/agenda/SKILL.md | `/dgclaw:agenda` (linha 7) | M3 | trocar por `/agenda` (mecanico) |
| skills/agenda/SKILL.md | `/dgclaw:lembretes` (linha 106) | M3 | trocar por `/lembretes` (mecanico) |
| skills/aprender/SKILL.md | `/dgclaw:aprender` (linha 3) | M3 | trocar por `/aprender` (mecanico) |
| skills/aprender/SKILL.md | `/dgclaw:aprender` (linha 7) | M3 | trocar por `/aprender` (mecanico) |
| skills/aprender/SKILL.md | `/dgclaw:*` (linha 140) | M3 | reescrever a mao (nome generico ou placeholder) |
| skills/avatar/SKILL.md | `/dgclaw:avatar` (linha 3) | M3 | trocar por `/avatar` (mecanico) |
| skills/avatar/SKILL.md | `/dgclaw:avatar` (linha 7) | M3 | trocar por `/avatar` (mecanico) |
| skills/avisos/SKILL.md | `/dgclaw:avisos` (linha 7) | M3 | trocar por `/avisos` (mecanico) |
| skills/cards/SKILL.md | `/dgclaw:cards` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/cards/SKILL.md | `/dgclaw:cards` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/connect/SKILL.md | `/dgclaw:connect` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/doctor/SKILL.md | `/dgclaw:doctor` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/doctor/SKILL.md | `/dgclaw:doctor` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/doctor/SKILL.md | `/dgclaw:socorro` (linha 10) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/doctor/SKILL.md | `/dgclaw:setup` (linha 60) | M3 | sair (a skill nao existe) |
| skills/doctor/SKILL.md | `/dgclaw:socorro` (linha 124) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/foco/SKILL.md | `/dgclaw:foco` (linha 7) | M3 | trocar por `/foco` (mecanico) |
| skills/guardiao-do-sgl/SKILL.md | `/dgclaw:guardiao-do-sgl` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/importar/SKILL.md | `/dgclaw:importar` (linha 3) | M3 | fica por excecao |
| skills/importar/SKILL.md | `/dgclaw:importar` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/importar/SKILL.md | `/dgclaw:setup` (linha 104) | M3 | sair (a skill nao existe) |
| skills/lembretes/SKILL.md | `/dgclaw:lembretes` (linha 7) | M3 | trocar por `/lembretes` (mecanico) |
| skills/memory/SKILL.md | `/dgclaw:memory` (linha 7) | M3 | trocar por `/memory` (mecanico) |
| skills/mesa/SKILL.md | `/dgclaw:mesa` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/mesa/SKILL.md | `/dgclaw:mesa` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/panel/SKILL.md | `/dgclaw:panel` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/panel/SKILL.md | `/dgclaw:panel` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/powers/SKILL.md | `/dgclaw:powers` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/powers/SKILL.md | `/dgclaw:powers` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/powers/SKILL.md | `/dgclaw:instagram` (linha 43) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/report/SKILL.md | `/dgclaw:report` (linha 3) | M3 | trocar por `/report` (mecanico) |
| skills/report/SKILL.md | `/dgclaw:report` (linha 7) | M3 | trocar por `/report` (mecanico) |
| skills/service/SKILL.md | `/dgclaw:service` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/socorro/SKILL.md | `/dgclaw:socorro` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/socorro/SKILL.md | `/dgclaw:socorro` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/tela/SKILL.md | `/dgclaw:tela` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/tela/SKILL.md | `/dgclaw:tela` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/uninstall/SKILL.md | `/dgclaw:uninstall` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/uninstall/SKILL.md | `/dgclaw:uninstall` (linha 7) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| skills/uninstall/SKILL.md | `/dgclaw:setup` (linha 66) | M3 | sair (a skill nao existe) |
| templates/AGENT.md.tmpl | `/dgclaw:connect` (linha 32) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| templates/AGENT.md.tmpl | `/dgclaw:agenda` (linha 91) | M3 | trocar por `/agenda` (mecanico) |
| templates/CLAUDE.md.tmpl | `/dgclaw:aprender` (linha 78) | M3 | trocar por `/aprender` (mecanico) |
| templates/CLAUDE.md.tmpl | `/dgclaw:connect` (linha 263) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| templates/CLAUDE.md.tmpl | `/dgclaw:tela` (linha 286) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| templates/CLAUDE.md.tmpl | `/dgclaw:agenda` (linha 291) | M3 | trocar por `/agenda` (mecanico) |
| templates/CLAUDE.md.tmpl | `/dgclaw:lembretes` (linha 305) | M3 | trocar por `/lembretes` (mecanico) |
| templates/CLAUDE.md.tmpl | `/dgclaw:mesa` (linha 330) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| templates/CLAUDE.md.tmpl | `/dgclaw:foco` (linha 411) | M3 | trocar por `/foco` (mecanico) |
| templates/CREATOR.md.tmpl | `/dgclaw:awaken` (linha 2) | M3 | sair (a skill nao existe) |
| templates/LAWS.md.tmpl | `/dgclaw:awaken` (linha 65) | M3 | sair (a skill nao existe) |
| templates/MEMORY.md.tmpl | `/dgclaw:awaken` (linha 1) | M3 | sair (a skill nao existe) |
| templates/powers.json.tmpl | `/dgclaw:powers` (linha 19) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
| templates/report-config.json.tmpl | `/dgclaw:report` (linha 2) | M3 | trocar por `/report` (mecanico) |
| tests/instrucoes/rodar.sh | `/dgclaw:` (linha 61) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 62) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 63) | M3 | sair (a skill nao existe) |
| tests/instrucoes/rodar.sh | `/dgclaw:` (linha 64) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 64) | M3 | sair (a skill nao existe) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 64) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:mesa` (linha 76) | M3 | revisar (fora de texto) |
| web/docs/COMANDOS-DE-BARRA.md | `/dgclaw:aprender` (linha 26) | M5 | trocar por `/aprender` (mecanico) |
| web/test/casca.test.js | `/dgclaw:agente` (linha 55) | M1 | fica por excecao |

Total: 99 ocorrencias em 52 arquivos.

## 3. Testes que citam a marca como texto esperado

Estes mudam junto com o texto. Linhas = linhas com alguma ocorrencia.

| Arquivo | Linhas | Trocaria | Manual |
| --- | ---: | ---: | ---: |
| aceite/juncao-e-marca.mjs | 15 | 0 | 0 |
| aceite/juncao-excecoes.json | 13 | 0 | 0 |
| bin/test/dgclaw-agente.test.sh | 1 | 0 | 1 |
| bin/test/dgclaw-sentinela.test.sh | 5 | 5 | 0 |
| panel/test-agents-seletor.mjs | 2 | 2 | 0 |
| panel/test-auth.mjs | 1 | 1 | 0 |
| panel/test-cofre-host.mjs | 5 | 3 | 4 |
| panel/test-operacoes.mjs | 1 | 0 | 0 |
| panel/test-sessoes-local.mjs | 1 | 0 | 0 |
| panel/test-sessoes.mjs | 12 | 0 | 0 |
| panel/test-tela.mjs | 1 | 1 | 0 |
| panel/test-tutoriais.mjs | 1 | 1 | 0 |
| qa/montar-ambiente.mjs | 2 | 2 | 0 |
| qa/roteiro-navegacao.mjs | 2 | 1 | 1 |
| scripts/dgchat-mcp/test-server.mjs | 4 | 3 | 1 |
| scripts/test-canal-dgchat.sh | 3 | 0 | 3 |
| scripts/test-falas-personalidade.sh | 1 | 1 | 0 |
| tests/ambiente/rodar.sh | 2 | 2 | 0 |
| tests/aviso-atualizacao/rodar.sh | 2 | 0 | 0 |
| tests/changelog/rodar.sh | 2 | 2 | 0 |
| tests/cli/atualizar-entre-versoes.sh | 1 | 1 | 0 |
| tests/cli/atualizar.sh | 3 | 1 | 2 |
| tests/cli/aviso-atualizacao.sh | 3 | 3 | 2 |
| tests/cli/backup.sh | 1 | 3 | 0 |
| tests/cli/chave-api.sh | 1 | 1 | 0 |
| tests/cli/cofre.sh | 1 | 1 | 0 |
| tests/cli/colaborador.sh | 1 | 1 | 0 |
| tests/cli/criar.sh | 1 | 1 | 0 |
| tests/cli/dominio.sh | 3 | 1 | 1 |
| tests/cli/inotify.sh | 1 | 1 | 0 |
| tests/cli/instalacao-remota.sh | 2 | 1 | 1 |
| tests/cli/personalizacoes.sh | 2 | 1 | 1 |
| tests/cli/recriar.sh | 1 | 1 | 0 |
| tests/cli/restricoes.sh | 1 | 1 | 0 |
| tests/cli/stubs/curl | 1 | 1 | 0 |
| tests/cli/stubs/ss | 1 | 1 | 0 |
| tests/cli/stubs/ssh | 1 | 1 | 0 |
| tests/cli/suporte.sh | 3 | 4 | 0 |
| tests/cli/usuario.sh | 1 | 2 | 0 |
| tests/cli/versao.sh | 1 | 3 | 0 |
| tests/docs-em-dia/checar.mjs | 2 | 2 | 0 |
| tests/docs-em-dia/rodar.sh | 1 | 1 | 0 |
| tests/emergencia/rodar.sh | 2 | 2 | 0 |
| tests/instalador/ffmpeg.sh | 1 | 1 | 0 |
| tests/instalador/fim.sh | 1 | 1 | 0 |
| tests/instrucoes/rodar.sh | 5 | 0 | 7 |
| tests/rodar.sh | 3 | 3 | 0 |
| tests/ronda/test_ronda.py | 10 | 7 | 3 |
| web/test/casca.test.js | 1 | 0 | 0 |
| web/test/colaborador-painel.test.js | 2 | 2 | 0 |
| web/test/colaboradores-correcoes3.test.js | 2 | 3 | 0 |
| web/test/colaboradores.test.js | 1 | 1 | 0 |
| web/test/conectar-puro.test.js | 3 | 3 | 0 |
| web/test/diagnostico-runner-prazo.test.js | 4 | 2 | 2 |
| web/test/diagnostico-suporte.test.js | 1 | 1 | 0 |
| web/test/email.test.js | 4 | 3 | 1 |
| web/test/escopo.test.js | 2 | 2 | 0 |
| web/test/grava-anexo.test.js | 1 | 1 | 0 |
| web/test/socket-admin.test.js | 1 | 1 | 0 |

Total: 153 linhas em 59 arquivos de teste.

## 4. O que ficou manual, por lote (nao trocado; inclui as barras)

### M1 (16)

| Arquivo | Motivo | Linha | Trecho |
| --- | --- | ---: | --- |
| panel/lib/operacoes.js | fora-de-contexto | 114 | `DG Claw` |
| panel/public/css/main.css | tipo-nao-coberto | 1 | `DG Claw` |
| panel/public/css/main.css | tipo-nao-coberto | 158 | `sem o DG Alive` |
| panel/public/css/main.css | tipo-nao-coberto | 324 | `com o DG Alive` |
| panel/public/css/main.css | tipo-nao-coberto | 324 | `DG Claw` |
| panel/public/js/app.js | barra-nao-ligada | 2450 | `/dgclaw:powers` |
| panel/test-cofre-host.mjs | comparacao-de-logica | 57 | `DG Claw` |
| panel/test-cofre-host.mjs | fora-de-contexto | 71 | `DG Claw` |
| panel/test-cofre-host.mjs | fora-de-contexto | 71 | `DG Claw` |
| panel/test-cofre-host.mjs | fora-de-contexto | 95 | `DG Claw` |
| qa/roteiro-navegacao.mjs | comparacao-de-logica | 191 | `DG Claw` |
| web/public/chat.css | tipo-nao-coberto | 1 | `DG Claw` |
| web/public/dgvis.js | sem-regra | 508 | `DG Telegram` |
| web/test/diagnostico-runner-prazo.test.js | comando-no-inicio-de-string | 130 | `dgclaw` |
| web/test/diagnostico-runner-prazo.test.js | comando-no-inicio-de-string | 133 | `dgclaw` |
| web/test/email.test.js | fora-de-contexto | 99 | `DG Claw` |

### M3 (52)

| Arquivo | Motivo | Linha | Trecho |
| --- | --- | ---: | --- |
| powers/crm/POWER.md | barra-nao-ligada | 3 | `/dgclaw:powers` |
| powers/crm/POWER.md | barra-nao-ligada | 20 | `/dgclaw:powers` |
| powers/meetings/POWER.md | barra-nao-ligada | 4 | `/dgclaw:powers` |
| powers/meetings/POWER.md | barra-nao-ligada | 22 | `/dgclaw:powers` |
| powers/secretary/POWER.md | barra-nao-ligada | 3 | `/dgclaw:powers` |
| powers/secretary/POWER.md | barra-nao-ligada | 17 | `/dgclaw:connect` |
| powers/secretary/POWER.md | barra-nao-ligada | 21 | `/dgclaw:powers` |
| scripts/gerar-instrucoes.sh | barra-inexistente | 11 | `/dgclaw:nome` |
| scripts/gerar-instrucoes.sh | fora-de-contexto | 42 | `/dgclaw:` |
| skills/aprender/SKILL.md | barra-generica | 140 | `/dgclaw:*` |
| skills/cards/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:cards` |
| skills/cards/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:cards` |
| skills/connect/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:connect` |
| skills/doctor/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:doctor` |
| skills/doctor/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:doctor` |
| skills/doctor/SKILL.md | barra-nao-ligada | 10 | `/dgclaw:socorro` |
| skills/doctor/SKILL.md | barra-inexistente | 60 | `/dgclaw:setup` |
| skills/doctor/SKILL.md | barra-nao-ligada | 124 | `/dgclaw:socorro` |
| skills/doctor/SKILL.md | sem-regra | 128 | `DG Telegram` |
| skills/guardiao-do-sgl/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:guardiao-do-sgl` |
| skills/importar/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:importar` |
| skills/importar/SKILL.md | barra-inexistente | 104 | `/dgclaw:setup` |
| skills/mesa/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:mesa` |
| skills/mesa/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:mesa` |
| skills/panel/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:panel` |
| skills/panel/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:panel` |
| skills/powers/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:powers` |
| skills/powers/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:powers` |
| skills/powers/SKILL.md | barra-nao-ligada | 43 | `/dgclaw:instagram` |
| skills/service/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:service` |
| skills/socorro/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:socorro` |
| skills/socorro/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:socorro` |
| skills/tela/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:tela` |
| skills/tela/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:tela` |
| skills/uninstall/SKILL.md | barra-nao-ligada | 3 | `/dgclaw:uninstall` |
| skills/uninstall/SKILL.md | barra-nao-ligada | 7 | `/dgclaw:uninstall` |
| skills/uninstall/SKILL.md | barra-inexistente | 66 | `/dgclaw:setup` |
| templates/AGENT.md.tmpl | barra-nao-ligada | 32 | `/dgclaw:connect` |
| templates/CLAUDE.md.tmpl | barra-nao-ligada | 263 | `/dgclaw:connect` |
| templates/CLAUDE.md.tmpl | barra-nao-ligada | 286 | `/dgclaw:tela` |
| templates/CLAUDE.md.tmpl | barra-nao-ligada | 330 | `/dgclaw:mesa` |
| templates/CREATOR.md.tmpl | barra-inexistente | 2 | `/dgclaw:awaken` |
| templates/LAWS.md.tmpl | barra-inexistente | 65 | `/dgclaw:awaken` |
| templates/MEMORY.md.tmpl | barra-inexistente | 1 | `/dgclaw:awaken` |
| templates/powers.json.tmpl | barra-nao-ligada | 19 | `/dgclaw:powers` |
| tests/instrucoes/rodar.sh | fora-de-contexto | 61 | `/dgclaw:` |
| tests/instrucoes/rodar.sh | fora-de-contexto | 62 | `/dgclaw:nome` |
| tests/instrucoes/rodar.sh | barra-inexistente | 63 | `/dgclaw:nome` |
| tests/instrucoes/rodar.sh | fora-de-contexto | 64 | `/dgclaw:` |
| tests/instrucoes/rodar.sh | barra-inexistente | 64 | `/dgclaw:nome` |
| tests/instrucoes/rodar.sh | fora-de-contexto | 64 | `/dgclaw:nome` |
| tests/instrucoes/rodar.sh | fora-de-contexto | 76 | `/dgclaw:mesa` |

### M4 (56)

| Arquivo | Motivo | Linha | Trecho |
| --- | --- | ---: | --- |
| .trivyignore.yaml | tipo-nao-coberto | 6 | `DG Claw` |
| bin/test/dgclaw-agente.test.sh | fora-de-contexto | 130 | `DG Claw` |
| container/Containerfile | tipo-nao-coberto | 1 | `DG Claw` |
| container/Containerfile | tipo-nao-coberto | 37 | `DG Claw` |
| container/Containerfile | tipo-nao-coberto | 50 | `DG Claw` |
| container/Containerfile | tipo-nao-coberto | 104 | `dgclaw` |
| container/Containerfile | tipo-nao-coberto | 109 | `dgclaw` |
| container/Containerfile | tipo-nao-coberto | 115 | `dgclaw` |
| container/Containerfile | tipo-nao-coberto | 116 | `dgclaw` |
| container/Containerfile | tipo-nao-coberto | 216 | `DG Claw` |
| container/Containerfile | tipo-nao-coberto | 222 | `dgclaw` |
| lib/emergencia.sh | fora-de-contexto | 252 | `DG Claw` |
| lib/emergencia.sh | fora-de-contexto | 256 | `DG Claw` |
| lib/reiniciar-admin.sh | fora-de-contexto | 50 | `DG Claw` |
| runner/src/sessao/ciclo.ts | comando-no-inicio-de-string | 524 | `dgclaw` |
| scripts/bootstrap-identity.sh | fora-de-contexto | 69 | `DG Claw` |
| scripts/dgchat-mcp/test-server.mjs | fora-de-contexto | 304 | `DG Claw` |
| scripts/doctor.sh | barra-inexistente | 222 | `/dgclaw:setup` |
| scripts/doctor.sh | barra-nao-ligada | 535 | `/dgclaw:panel` |
| scripts/doctor.sh | fora-de-contexto | 582 | `/dgclaw:powers` |
| scripts/doctor.sh | sem-regra | 650 | `DG Telegram` |
| scripts/install-channel-fix.sh | fora-de-contexto | 48 | `DG Claw` |
| scripts/install-channel-watchdog.sh | fora-de-contexto | 52 | `DG Claw` |
| scripts/install-channel-watchdog.sh | fora-de-contexto | 66 | `DG Claw` |
| scripts/install-consolidate-timer.sh | fora-de-contexto | 23 | `DG Claw` |
| scripts/install-consolidate-timer.sh | fora-de-contexto | 35 | `DG Claw` |
| scripts/install-core.sh | barra-inexistente | 4 | `/dgclaw:setup` |
| scripts/install-core.sh | fora-de-contexto | 202 | `DG Claw` |
| scripts/install-core.sh | fora-de-contexto | 202 | `/dgclaw:setup` |
| scripts/install-ig-timers.sh | fora-de-contexto | 124 | `DG Claw` |
| scripts/install-ig-timers.sh | fora-de-contexto | 136 | `DG Claw` |
| scripts/install-ig-timers.sh | fora-de-contexto | 165 | `DG Claw` |
| scripts/install-panel-service.sh | fora-de-contexto | 400 | `DG Claw` |
| scripts/install-service.sh | fora-de-contexto | 90 | `DG Claw` |
| scripts/install-timers.sh | barra-inexistente | 112 | `/dgclaw:setup` |
| scripts/install-timers.sh | fora-de-contexto | 120 | `DG Claw` |
| scripts/install-timers.sh | fora-de-contexto | 177 | `DG Claw` |
| scripts/launch.sh | barra-inexistente | 18 | `/dgclaw:setup` |
| scripts/notify-owner.sh | fora-de-contexto | 161 | `do DG Chat` |
| scripts/notify-owner.sh | fora-de-contexto | 169 | `canal DG Chat` |
| scripts/powers.py | barra-nao-ligada | 105 | `/dgclaw:powers` |
| scripts/test-canal-dgchat.sh | fora-de-contexto | 117 | `do DG Chat` |
| scripts/test-canal-dgchat.sh | fora-de-contexto | 151 | `DG Claw` |
| scripts/test-canal-dgchat.sh | fora-de-contexto | 184 | `canal DG Chat` |
| scripts/uninstall.sh | barra-inexistente | 153 | `/dgclaw:setup` |
| scripts/watchdog.py | barra-nao-ligada | 273 | `/dgclaw:doctor` |
| tests/cli/atualizar.sh | fora-de-contexto | 44 | `DG Claw` |
| tests/cli/atualizar.sh | fora-de-contexto | 305 | `DG Claw` |
| tests/cli/aviso-atualizacao.sh | fora-de-contexto | 37 | `DG Claw` |
| tests/cli/aviso-atualizacao.sh | fora-de-contexto | 37 | `DG Claw` |
| tests/cli/dominio.sh | fora-de-contexto | 66 | `DG Claw` |
| tests/cli/instalacao-remota.sh | fora-de-contexto | 20 | `DG Claw` |
| tests/cli/personalizacoes.sh | fora-de-contexto | 44 | `DG Claw` |
| tests/ronda/test_ronda.py | comando-no-inicio-de-string | 1137 | `dgclaw` |
| tests/ronda/test_ronda.py | comando-no-inicio-de-string | 1158 | `dgclaw` |
| tests/ronda/test_ronda.py | comando-no-inicio-de-string | 2170 | `dgclaw` |

### M5 (21)

| Arquivo | Motivo | Linha | Trecho |
| --- | --- | ---: | --- |
| .github/ISSUE_TEMPLATE/bug.yml | tipo-nao-coberto | 2 | `DG Claw` |
| .github/ISSUE_TEMPLATE/bug.yml | tipo-nao-coberto | 39 | `DG Claw` |
| .github/ISSUE_TEMPLATE/bug.yml | tipo-nao-coberto | 55 | `dgclaw` |
| .github/ISSUE_TEMPLATE/ideia.yml | tipo-nao-coberto | 2 | `DG Claw` |
| .github/ISSUE_TEMPLATE/ideia.yml | tipo-nao-coberto | 29 | `DG Claw` |
| .github/workflows/ci.yml | tipo-nao-coberto | 1 | `DG Claw` |
| .github/workflows/ci.yml | tipo-nao-coberto | 74 | `DG Claw` |
| .github/workflows/seguranca.yml | tipo-nao-coberto | 1 | `DG Claw` |
| docs/MEMORIA-SEMANTICA.md | barra-inexistente | 27 | `/dgclaw:setup` |
| docs/MEMORIA-SEMANTICA.md | barra-nao-ligada | 69 | `/dgclaw:doctor` |
| docs/MESA-DE-TAREFAS.md | barra-nao-ligada | 29 | `/dgclaw:mesa` |
| docs/MESA-DE-TAREFAS.md | barra-nao-ligada | 40 | `/dgclaw:doctor` |
| docs/PARIDADE-CODEX.md | barra-generica | 75 | `/dgclaw:*` |
| docs/PARIDADE-CODEX.md | barra-generica | 113 | `/dgclaw:x` |
| docs/PROVEDORES.md | barra-nao-ligada | 195 | `/dgclaw:cards` |
| docs/TELA-DO-AGENTE.md | barra-nao-ligada | 166 | `/dgclaw:tela` |
| docs/manual/pendencias.md | sem-regra | 20 | `DG Telegram` |
| docs/manual/provedores.md | barra-generica | 47 | `/dgclaw:*` |
| docs/revisao-adversarial-prompt.txt | tipo-nao-coberto | 1 | `DG Claw` |
| docs/revisao-adversarial-prompt.txt | tipo-nao-coberto | 1 | `DG Claw` |
| web/docs/MODO-FOCO.md | sem-regra | 15 | `DG Telegram` |


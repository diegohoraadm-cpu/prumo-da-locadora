# Mapa da marca (saida do `aplicar.mjs --dry`)

Gerado sem escrever nada. Ocorrencia = um achado da regra; "troca" so acontece em contexto de texto.

## 1. Contagem por lote

| Lote | Arquivos que mudam | Trocaria | Fica por excecao | Pede decisao ou reescrita manual |
| --- | ---: | ---: | ---: | ---: |
| M1 | 84 | 285 | 3 | 33 |
| M3 | 44 | 270 | 0 | 43 |
| M4 | 151 | 815 | 11 | 79 |
| M5 | 85 | 640 | 4 | 15 |
| sem-lote | 22 | 54 | 173 | 17 |
| **total** | 386 | 2064 | 191 | 187 |

Por regra (todos os lotes):

| Regra | Trocaria | Excecao | Manual |
| --- | ---: | ---: | ---: |
| barra | 21 | 2 | 79 |
| comando | 1228 | 110 | 27 |
| frase | 666 | 78 | 62 |
| variante | 149 | 1 | 19 |

Manual, por motivo:

| Motivo | Ocorrencias |
| --- | ---: |
| barra-generica | 6 |
| barra-inexistente | 14 |
| barra-nao-ligada | 44 |
| comando-no-inicio-de-string | 21 |
| comparacao-de-logica | 2 |
| fora-de-contexto | 74 |
| tipo-nao-coberto | 26 |

Arquivos sem lote no plano (o Teia atribui a um lote):

| Arquivo | Trocaria | Excecao | Manual |
| --- | ---: | ---: | ---: |
| .github/ISSUE_TEMPLATE/bug.yml | 0 | 0 | 3 |
| .github/ISSUE_TEMPLATE/ideia.yml | 0 | 0 | 2 |
| .github/workflows/ci.yml | 0 | 0 | 2 |
| .github/workflows/seguranca.yml | 0 | 0 | 1 |
| .trivyignore.yaml | 0 | 0 | 1 |
| AGENTS.md | 6 | 0 | 0 |
| CHANGELOG.md | 2 | 154 | 0 |
| CLAUDE.md | 7 | 0 | 0 |
| CONTRIBUTING.md | 2 | 0 | 0 |
| NOTICE.md | 0 | 1 | 0 |
| SECURITY.md | 6 | 0 | 0 |
| aceite/juncao-e-marca.mjs | 0 | 9 | 0 |
| aceite/juncao-excecoes.json | 0 | 9 | 0 |
| anonimizar/motor.py | 1 | 0 | 0 |
| eslint.config.js | 2 | 0 | 0 |
| package.json | 1 | 0 | 0 |
| panel/bin/instalar-aba-sessoes.py | 4 | 0 | 0 |
| panel/package.json | 1 | 0 | 0 |
| panel/rotas/nucleo.js | 2 | 0 | 0 |
| powers/crm/POWER.md | 1 | 0 | 2 |
| powers/instagram/POWER.md | 1 | 0 | 0 |
| powers/meetings/POWER.md | 1 | 0 | 2 |
| powers/secretary/POWER.md | 2 | 0 | 3 |
| qa/montar-ambiente.mjs | 2 | 0 | 0 |
| qa/roteiro-navegacao.mjs | 1 | 0 | 1 |
| runner/README.md | 5 | 0 | 0 |
| runner/package.json | 1 | 0 | 0 |
| web/README.md | 3 | 0 | 0 |
| web/bin/chave-api.js | 2 | 0 | 0 |
| web/bin/cofre.js | 1 | 0 | 0 |

## 2. Ocorrencias de `/dgclaw:` (decisao de cada uma)

Regra do plano: skill ligada vira `/x`; skill que existe mas nao e ligada, reescrever a frase a mao; inexistente, a frase sai.

| Arquivo | Ocorrencia | Lote | Decisao |
| --- | --- | --- | --- |
| CHANGELOG.md | `/dgclaw:setup` (linha 1175) | sem-lote | fica por excecao |
| aceite/juncao-e-marca.mjs | `/dgclaw:` (linha 322) | sem-lote | fica por excecao |
| bin/README.md | `/dgclaw:` (linha 1) | M4 | reescrever a mao (nome generico ou placeholder) |
| docs/MEMORIA-SEMANTICA.md | `/dgclaw:setup` (linha 27) | M5 | sair (a skill nao existe) |
| docs/MEMORIA-SEMANTICA.md | `/dgclaw:doctor` (linha 69) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/MESA-DE-TAREFAS.md | `/dgclaw:mesa` (linha 29) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/MESA-DE-TAREFAS.md | `/dgclaw:doctor` (linha 40) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/PARIDADE-CODEX.md | `/dgclaw:` (linha 74) | M5 | reescrever a mao (nome generico ou placeholder) |
| docs/PARIDADE-CODEX.md | `/dgclaw:*` (linha 75) | M5 | reescrever a mao (nome generico ou placeholder) |
| docs/PARIDADE-CODEX.md | `/dgclaw:x` (linha 113) | M5 | reescrever a mao (nome generico ou placeholder) |
| docs/PROVEDORES.md | `/dgclaw:cards` (linha 195) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/TELA-DO-AGENTE.md | `/dgclaw:tela` (linha 166) | M5 | reescrever a mao (skill existe, nao e ligada ao agente) |
| docs/manual/provedores.md | `/dgclaw:*` (linha 47) | M5 | reescrever a mao (nome generico ou placeholder) |
| panel/public/js/app.js | `/dgclaw:powers` (linha 2450) | M1 | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/crm/POWER.md | `/dgclaw:powers` (linha 3) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/crm/POWER.md | `/dgclaw:powers` (linha 20) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/meetings/POWER.md | `/dgclaw:powers` (linha 4) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/meetings/POWER.md | `/dgclaw:powers` (linha 22) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/secretary/POWER.md | `/dgclaw:powers` (linha 3) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/secretary/POWER.md | `/dgclaw:connect` (linha 17) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| powers/secretary/POWER.md | `/dgclaw:powers` (linha 21) | sem-lote | reescrever a mao (skill existe, nao e ligada ao agente) |
| scripts/doctor.sh | `/dgclaw:setup` (linha 222) | M4 | revisar (fora de texto) |
| scripts/doctor.sh | `/dgclaw:panel` (linha 535) | M4 | revisar (fora de texto) |
| scripts/doctor.sh | `/dgclaw:powers` (linha 582) | M4 | revisar (fora de texto) |
| scripts/doctor.sh | `/dgclaw:report` (linha 792) | M4 | trocar por `/report` (mecanico) |
| scripts/gerar-instrucoes.sh | `/dgclaw:nome` (linha 11) | M4 | sair (a skill nao existe) |
| scripts/gerar-instrucoes.sh | `/dgclaw:` (linha 42) | M4 | revisar (fora de texto) |
| scripts/install-core.sh | `/dgclaw:setup` (linha 4) | M4 | sair (a skill nao existe) |
| scripts/install-core.sh | `/dgclaw:setup` (linha 202) | M4 | revisar (fora de texto) |
| scripts/install-timers.sh | `/dgclaw:setup` (linha 112) | M4 | sair (a skill nao existe) |
| scripts/launch.sh | `/dgclaw:setup` (linha 18) | M4 | sair (a skill nao existe) |
| scripts/materialize-identity.sh | `/dgclaw:doctor` (linha 44) | M4 | revisar (fora de texto) |
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
| skills/importar/SKILL.md | `/dgclaw:importar` (linha 3) | M3 | reescrever a mao (skill existe, nao e ligada ao agente) |
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
| tests/docs-em-dia/rodar.sh | `/dgclaw:` (linha 55) | M5 | revisar (fora de texto) |
| tests/docs-em-dia/rodar.sh | `/dgclaw:` (linha 103) | M5 | revisar (fora de texto) |
| tests/docs-em-dia/rodar.sh | `/dgclaw:` (linha 105) | M5 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:` (linha 61) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 62) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 63) | M3 | sair (a skill nao existe) |
| tests/instrucoes/rodar.sh | `/dgclaw:` (linha 64) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 64) | M3 | sair (a skill nao existe) |
| tests/instrucoes/rodar.sh | `/dgclaw:nome` (linha 64) | M3 | revisar (fora de texto) |
| tests/instrucoes/rodar.sh | `/dgclaw:mesa` (linha 76) | M3 | revisar (fora de texto) |
| web/docs/COMANDOS-DE-BARRA.md | `/dgclaw:aprender` (linha 26) | M5 | trocar por `/aprender` (mecanico) |
| web/test/casca.test.js | `/dgclaw:agente` (linha 55) | M1 | revisar (fora de texto) |

Total: 102 ocorrencias em 54 arquivos.

## 3. Testes que citam a marca como texto esperado

Estes mudam junto com o texto. Linhas = linhas com alguma ocorrencia.

| Arquivo | Linhas | Trocaria | Manual |
| --- | ---: | ---: | ---: |
| aceite/juncao-e-marca.mjs | 8 | 0 | 0 |
| aceite/juncao-excecoes.json | 8 | 0 | 0 |
| bin/test/dgclaw-agente.test.sh | 1 | 0 | 1 |
| bin/test/dgclaw-sentinela.test.sh | 5 | 5 | 0 |
| panel/test-agents-seletor.mjs | 2 | 2 | 0 |
| panel/test-auth.mjs | 1 | 1 | 0 |
| panel/test-cofre-host.mjs | 5 | 3 | 4 |
| panel/test-operacoes.mjs | 1 | 1 | 0 |
| panel/test-sessoes-local.mjs | 1 | 1 | 0 |
| panel/test-sessoes.mjs | 12 | 11 | 2 |
| panel/test-tela.mjs | 1 | 1 | 0 |
| panel/test-tutoriais.mjs | 1 | 1 | 0 |
| qa/montar-ambiente.mjs | 2 | 2 | 0 |
| qa/roteiro-navegacao.mjs | 2 | 1 | 1 |
| scripts/dgchat-mcp/test-server.mjs | 4 | 3 | 1 |
| scripts/test-canal-dgchat.sh | 3 | 0 | 3 |
| scripts/test-falas-personalidade.sh | 1 | 1 | 0 |
| tests/ambiente/rodar.sh | 2 | 2 | 0 |
| tests/aviso-atualizacao/rodar.sh | 2 | 0 | 3 |
| tests/changelog/rodar.sh | 2 | 2 | 0 |
| tests/cli/atualizar-entre-versoes.sh | 1 | 1 | 0 |
| tests/cli/atualizar.sh | 3 | 1 | 2 |
| tests/cli/aviso-atualizacao.sh | 3 | 3 | 2 |
| tests/cli/backup.sh | 1 | 3 | 0 |
| tests/cli/chave-api.sh | 1 | 1 | 0 |
| tests/cli/cofre.sh | 1 | 1 | 0 |
| tests/cli/colaborador.sh | 1 | 1 | 0 |
| tests/cli/criar.sh | 1 | 1 | 0 |
| tests/cli/dominio.sh | 3 | 1 | 2 |
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
| tests/docs-em-dia/rodar.sh | 4 | 1 | 3 |
| tests/emergencia/rodar.sh | 2 | 2 | 0 |
| tests/instalador/ffmpeg.sh | 1 | 1 | 0 |
| tests/instalador/fim.sh | 1 | 1 | 0 |
| tests/instrucoes/rodar.sh | 5 | 0 | 7 |
| tests/rodar.sh | 3 | 3 | 0 |
| tests/ronda/test_ronda.py | 10 | 7 | 3 |
| web/test/casca.test.js | 1 | 0 | 1 |
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

Total: 144 linhas em 59 arquivos de teste.

## 4. Pede decisao humana (nao trocado), por arquivo

| Arquivo | Lote | Motivo | Linha | Trecho |
| --- | --- | --- | ---: | --- |
| .github/ISSUE_TEMPLATE/bug.yml | sem-lote | tipo-nao-coberto | 2 | `DG Claw` |
| .github/ISSUE_TEMPLATE/bug.yml | sem-lote | tipo-nao-coberto | 39 | `DG Claw` |
| .github/ISSUE_TEMPLATE/bug.yml | sem-lote | tipo-nao-coberto | 55 | `dgclaw` |
| .github/ISSUE_TEMPLATE/ideia.yml | sem-lote | tipo-nao-coberto | 2 | `DG Claw` |
| .github/ISSUE_TEMPLATE/ideia.yml | sem-lote | tipo-nao-coberto | 29 | `DG Claw` |
| .github/workflows/ci.yml | sem-lote | tipo-nao-coberto | 1 | `DG Claw` |
| .github/workflows/ci.yml | sem-lote | tipo-nao-coberto | 74 | `DG Claw` |
| .github/workflows/seguranca.yml | sem-lote | tipo-nao-coberto | 1 | `DG Claw` |
| .trivyignore.yaml | sem-lote | tipo-nao-coberto | 6 | `DG Claw` |
| bin/dgclaw-agente | M4 | fora-de-contexto | 125 | `DG Claw` |
| bin/dgclaw-agente | M4 | fora-de-contexto | 126 | `DG Claw` |
| bin/dgclaw-mesa | M4 | fora-de-contexto | 130 | `DG Claw` |
| bin/test/dgclaw-agente.test.sh | M4 | fora-de-contexto | 130 | `DG Claw` |
| container/Containerfile | M4 | tipo-nao-coberto | 1 | `DG Claw` |
| container/Containerfile | M4 | tipo-nao-coberto | 37 | `DG Claw` |
| container/Containerfile | M4 | tipo-nao-coberto | 50 | `DG Claw` |
| container/Containerfile | M4 | tipo-nao-coberto | 104 | `dgclaw` |
| container/Containerfile | M4 | tipo-nao-coberto | 109 | `dgclaw` |
| container/Containerfile | M4 | tipo-nao-coberto | 115 | `dgclaw` |
| container/Containerfile | M4 | tipo-nao-coberto | 116 | `dgclaw` |
| container/Containerfile | M4 | tipo-nao-coberto | 216 | `DG Claw` |
| container/Containerfile | M4 | tipo-nao-coberto | 222 | `dgclaw` |
| docs/revisao-adversarial-prompt.txt | M5 | tipo-nao-coberto | 1 | `DG Claw` |
| docs/revisao-adversarial-prompt.txt | M5 | tipo-nao-coberto | 1 | `DG Claw` |
| install.sh | M4 | fora-de-contexto | 1408 | `DG Claw` |
| lib/emergencia.sh | M4 | fora-de-contexto | 252 | `DG Claw` |
| lib/emergencia.sh | M4 | fora-de-contexto | 256 | `DG Claw` |
| lib/reiniciar-admin.sh | M4 | fora-de-contexto | 50 | `DG Claw` |
| panel/lib/operacoes.js | M1 | fora-de-contexto | 114 | `DG Claw` |
| panel/public/css/main.css | M1 | tipo-nao-coberto | 1 | `DG Claw` |
| panel/public/css/main.css | M1 | tipo-nao-coberto | 158 | `DG Alive` |
| panel/public/css/main.css | M1 | tipo-nao-coberto | 324 | `DG Alive` |
| panel/public/css/main.css | M1 | tipo-nao-coberto | 324 | `DG Claw` |
| panel/test-cofre-host.mjs | M1 | comparacao-de-logica | 57 | `DG Claw` |
| panel/test-cofre-host.mjs | M1 | fora-de-contexto | 71 | `DG Claw` |
| panel/test-cofre-host.mjs | M1 | fora-de-contexto | 71 | `DG Claw` |
| panel/test-cofre-host.mjs | M1 | fora-de-contexto | 95 | `DG Claw` |
| panel/test-sessoes.mjs | M1 | fora-de-contexto | 238 | `DG Telegram` |
| panel/test-sessoes.mjs | M1 | fora-de-contexto | 238 | `DG Telegram` |
| qa/roteiro-navegacao.mjs | sem-lote | comparacao-de-logica | 191 | `DG Claw` |
| runner/src/sessao/ciclo.ts | M4 | comando-no-inicio-de-string | 524 | `dgclaw` |
| scripts/bootstrap-identity.sh | M4 | fora-de-contexto | 69 | `DG Claw` |
| scripts/dgchat-mcp/test-server.mjs | M4 | fora-de-contexto | 304 | `DG Claw` |
| scripts/doctor.sh | M4 | fora-de-contexto | 615 | `DG Alive` |
| scripts/doctor.sh | M4 | fora-de-contexto | 623 | `DG Claw` |
| scripts/doctor.sh | M4 | fora-de-contexto | 625 | `DG Claw` |
| scripts/doctor.sh | M4 | fora-de-contexto | 650 | `DG Telegram` |
| scripts/doctor.sh | M4 | fora-de-contexto | 660 | `DG Telegram` |
| scripts/doctor.sh | M4 | fora-de-contexto | 662 | `DG Telegram` |
| scripts/doctor.sh | M4 | fora-de-contexto | 663 | `DG Telegram` |
| scripts/doctor.sh | M4 | fora-de-contexto | 716 | `DG Claw` |
| scripts/doctor.sh | M4 | fora-de-contexto | 763 | `DG Alive` |
| scripts/doctor.sh | M4 | fora-de-contexto | 764 | `DG Alive` |
| scripts/install-channel-fix.sh | M4 | fora-de-contexto | 48 | `DG Claw` |
| scripts/install-channel-watchdog.sh | M4 | fora-de-contexto | 52 | `DG Claw` |
| scripts/install-channel-watchdog.sh | M4 | fora-de-contexto | 66 | `DG Claw` |
| scripts/install-consolidate-timer.sh | M4 | fora-de-contexto | 23 | `DG Claw` |
| scripts/install-consolidate-timer.sh | M4 | fora-de-contexto | 35 | `DG Claw` |
| scripts/install-core.sh | M4 | fora-de-contexto | 202 | `DG Claw` |
| scripts/install-core.sh | M4 | fora-de-contexto | 226 | `DG Telegram` |
| scripts/install-core.sh | M4 | fora-de-contexto | 226 | `DG Telegram` |
| scripts/install-core.sh | M4 | fora-de-contexto | 229 | `DG Telegram` |
| scripts/install-ig-timers.sh | M4 | fora-de-contexto | 124 | `DG Claw` |
| scripts/install-ig-timers.sh | M4 | fora-de-contexto | 136 | `DG Claw` |
| scripts/install-ig-timers.sh | M4 | fora-de-contexto | 165 | `DG Claw` |
| scripts/install-panel-service.sh | M4 | fora-de-contexto | 400 | `DG Claw` |
| scripts/install-service.sh | M4 | fora-de-contexto | 90 | `DG Claw` |
| scripts/install-timers.sh | M4 | fora-de-contexto | 120 | `DG Claw` |
| scripts/install-timers.sh | M4 | fora-de-contexto | 177 | `DG Claw` |
| scripts/notify-owner.sh | M4 | fora-de-contexto | 161 | `DG Chat` |
| scripts/notify-owner.sh | M4 | fora-de-contexto | 169 | `DG Chat` |
| scripts/test-canal-dgchat.sh | M4 | fora-de-contexto | 117 | `DG Chat` |
| scripts/test-canal-dgchat.sh | M4 | fora-de-contexto | 151 | `DG Claw` |
| scripts/test-canal-dgchat.sh | M4 | fora-de-contexto | 184 | `DG Chat` |
| tests/aviso-atualizacao/rodar.sh | M4 | fora-de-contexto | 137 | `DG Claw` |
| tests/aviso-atualizacao/rodar.sh | M4 | fora-de-contexto | 148 | `DG Claw` |
| tests/aviso-atualizacao/rodar.sh | M4 | fora-de-contexto | 148 | `DG Claw` |
| tests/cli/atualizar.sh | M4 | fora-de-contexto | 44 | `DG Claw` |
| tests/cli/atualizar.sh | M4 | fora-de-contexto | 305 | `DG Claw` |
| tests/cli/aviso-atualizacao.sh | M4 | fora-de-contexto | 37 | `DG Claw` |
| tests/cli/aviso-atualizacao.sh | M4 | fora-de-contexto | 37 | `DG Claw` |
| tests/cli/dominio.sh | M4 | fora-de-contexto | 11 | `DG Claw` |
| tests/cli/dominio.sh | M4 | fora-de-contexto | 66 | `DG Claw` |
| tests/cli/instalacao-remota.sh | M4 | fora-de-contexto | 20 | `DG Claw` |
| tests/cli/personalizacoes.sh | M4 | fora-de-contexto | 44 | `DG Claw` |
| tests/ronda/test_ronda.py | M4 | comando-no-inicio-de-string | 1137 | `dgclaw` |
| tests/ronda/test_ronda.py | M4 | comando-no-inicio-de-string | 1158 | `dgclaw` |
| tests/ronda/test_ronda.py | M4 | comando-no-inicio-de-string | 2170 | `dgclaw` |
| web/lib/diagnostico/agente.js | M1 | comando-no-inicio-de-string | 55 | `dgclaw` |
| web/lib/diagnostico/agente.js | M1 | comando-no-inicio-de-string | 56 | `dgclaw` |
| web/lib/diagnostico/agente.js | M1 | comando-no-inicio-de-string | 94 | `dgclaw` |
| web/lib/diagnostico/agente.js | M1 | comando-no-inicio-de-string | 118 | `dgclaw` |
| web/lib/diagnostico/agente.js | M1 | comando-no-inicio-de-string | 127 | `dgclaw` |
| web/lib/diagnostico/cron.js | M1 | comando-no-inicio-de-string | 135 | `dgclaw` |
| web/lib/diagnostico/index.js | M1 | comando-no-inicio-de-string | 141 | `dgclaw` |
| web/lib/diagnostico/maquina.js | M1 | comando-no-inicio-de-string | 58 | `dgclaw` |
| web/lib/diagnostico/maquina.js | M1 | comando-no-inicio-de-string | 84 | `dgclaw` |
| web/lib/diagnostico/maquina.js | M1 | comando-no-inicio-de-string | 140 | `dgclaw` |
| web/lib/diagnostico/maquina.js | M1 | comando-no-inicio-de-string | 141 | `dgclaw` |
| web/lib/diagnostico/maquina.js | M1 | comando-no-inicio-de-string | 159 | `dgclaw` |
| web/lib/diagnostico/sessao.js | M1 | comando-no-inicio-de-string | 14 | `dgclaw` |
| web/lib/diagnostico/versao.js | M1 | comando-no-inicio-de-string | 54 | `dgclaw` |
| web/lib/diagnostico/versao.js | M1 | comando-no-inicio-de-string | 60 | `dgclaw` |
| web/public/chat.css | M1 | tipo-nao-coberto | 1 | `DG Claw` |
| web/public/dgvis.css | M1 | tipo-nao-coberto | 1 | `DG Telegram` |
| web/test/diagnostico-runner-prazo.test.js | M1 | comando-no-inicio-de-string | 130 | `dgclaw` |
| web/test/diagnostico-runner-prazo.test.js | M1 | comando-no-inicio-de-string | 133 | `dgclaw` |
| web/test/email.test.js | M1 | fora-de-contexto | 99 | `DG Claw` |

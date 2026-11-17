# Marca própria: a ferramenta que troca "DG Claw" por "Prumo da Locadora"

O Prumo da Locadora nasceu do DG Claw e continua recebendo atualizações do projeto original. Trocar o nome à mão em cada
junção gera conflito em dezenas de arquivos. Esta ferramenta troca o nome por regra, sempre do mesmo jeito, e o
procedimento da seção 5 faz o nome deixar de gerar conflito.

Arquivos: `scripts/marca/aplicar.mjs` (a ferramenta), `scripts/marca/regras.json` (o que troca), `scripts/marca/excecoes.txt`
(o que fica, com o motivo), `scripts/marca/aplicar.test.mjs` (os testes) e `scripts/marca/mapa.md` (o mapa do estado atual).

## 1. Como usar

    node scripts/marca/aplicar.mjs --dry                      # só lista; não escreve nada
    node scripts/marca/aplicar.mjs --dry --detalhe            # uma linha por ocorrência
    node scripts/marca/aplicar.mjs --mapa > scripts/marca/mapa.md   # o mapa em Markdown
    node scripts/marca/aplicar.mjs --pasta templates --pasta skills # só estas pastas (cada lote roda a sua)
    node scripts/marca/aplicar.mjs                            # aplica

A segunda passada muda 0 arquivos (o teste `idempotente` confere). Rode os testes da ferramenta pela caixa de memória:
`bin/caixa-testes.sh node --test scripts/marca/aplicar.test.mjs`.

Cada ocorrência sai com um destes estados:

| Estado | O que significa |
| --- | --- |
| troca | está em contexto de texto e a regra se aplica; é trocada |
| excecao | está protegida por uma linha de `excecoes.txt`; não é trocada |
| manual | a ferramenta não pode decidir sozinha; não é trocada e vai para o mapa (motivos abaixo) |

## 2. O que a ferramenta troca, e só onde há texto

| Regra | De | Para |
| --- | --- | --- |
| frase | `DG Claw` | `Prumo da Locadora` |
| frase | `suporte DG` / `Suporte DG` | `suporte` / `Suporte` |
| variante (a decidir) | `DG Chat`, `DG Telegram`, `DG Alive` | `Prumo Chat`, `Prumo Telegram`, `Prumo Alive` (provisório: o plano não definiu; ver `regras.json`) |
| comando | `dgclaw <subcomando>` mostrado ao dono | `prumo <subcomando>` (o `dgclaw` continua existindo) |
| barra | `/dgclaw:x` com `x` ligado ao agente | `/x` |

O comando só é trocado quando a palavra seguinte é um subcomando conhecido (lista em `regras.json`) ou uma opção `--...`.
Assim "o usuário dgclaw" e "o dgclaw tem permissão" ficam como estão.

Onde há texto, por tipo de arquivo:

| Tipo | É texto | Nunca é texto |
| --- | --- | --- |
| Markdown (`.md`, `.tmpl`) | tudo, inclusive blocos de código | |
| HTML | nó de texto, comentário, atributos `title`, `alt`, `placeholder`, `aria-label`, e os literais do `<script>` | `href`, `class`, `id`, `style`, `on...` |
| JS e TS | literal de string, template (a parte fora do `${}`) e comentário | identificador, regex, chave de objeto, comparação com a string de qualquer lado, `.includes(`, `.startsWith(`, `.get(`, `.has(` (é lógica) |
| Python | literal de string, docstring, comentário | string logo depois de `.startswith(`, `==` etc. |
| JSON | valor de string | chave |
| Shell | o que vem depois de `printf`, `echo`, `falha`, `aviso`, `info`, `ok`, `passo` (até o `;`, `&&`, `\|\|` ou o fim da linha), comentário, e `cat <<EOF` que vai para a tela | `grep "DG Claw"`, variável, caminho, nome de serviço, `printf ... > arquivo`, `printf ... \| tee` (isso é dado) |
| `.service`, `.path` | o valor de `Description=` | o resto |
| outros (`.yml`, `.css`, `Containerfile`...) | nada | tudo (vira "manual: tipo-nao-coberto" no mapa) |

Dentro de string de JS e Python, um comando que aparece **no começo** da string (`'dgclaw agente listar'`) pode ser executado de
verdade, então não é trocado ("manual: comando-no-inicio-de-string"). Com `sudo` ou depois de outra palavra, é texto ao dono e
é trocado.

Motivos de "manual" no mapa: `barra-nao-ligada` (a skill existe mas o agente não a recebe: reescrever a frase a mão),
`barra-inexistente` (a skill não existe: a frase sai), `barra-generica` (`/dgclaw:*`, `/dgclaw:x`), `fora-de-contexto` (o nome está
em código, regex, `grep`, `die`, `W`/`I`/`B` do doctor...), `comparacao-de-logica`, `comando-no-inicio-de-string`, `tipo-nao-coberto`.

As regras `/dgclaw:x` seguem o plano F4: `x` na lista `barra.ligadas` de `regras.json` (as skills que o `bin/dgclaw` liga aos agentes
mais `criar-agente` e `trocar-dominio` do Admin) vira `/x`. Se o original passar a ligar outra skill, acrescente o nome na lista.

## 3. Exceções

Uma linha de `excecoes.txt` por exceção, com três campos separados por TAB: `arquivo`, `trecho`, `motivo`. O motivo é obrigatório
(sem ele a ferramenta se recusa a rodar). O `trecho` é um texto literal que, se estiver na linha, protege a linha; `*` protege o
arquivo todo; `secao:REGEX` protege as seções `## ...` do Markdown cujo título casa. Nada depende de número de linha: a exceção
continua valendo depois que o arquivo muda de tamanho.

Ficam de fora, por motivo registrado: `LICENSE`, `NOTICE`, `NOTICE.md` e o crédito do `README.md` (a MIT exige o aviso, e o
`install.sh` copia LICENSE e NOTICE para a instalação), as seções antigas do `CHANGELOG.md` (o digest de cada item é o sha1 do
texto; reescrever faria o item voltar como novidade) e as exceções de lógica (Caddyfile antigo em `lib/comum.sh`, o campo `onde`
da ronda).

A própria ferramenta (`scripts/marca/`) e este documento citam o nome antigo de propósito; ficam na lista `ignorar` do
`regras.json`, que a ferramenta nem lê.

Atenção ao fechar a versão seguinte: a regra do CHANGELOG protege tudo, menos a seção `[1.0.5]`. Quando sair a 1.0.6, ajuste o
`1\.0\.5` da exceção para a seção que ainda é nossa.

## 3b. Arquivos gerados, pares teste x origem e comandos deixados

- **Gerados** (`regras.json`, `gerados`): `templates/CLAUDE.md.tmpl`, `AGENTS.md.tmpl` e os dois de `templates/admin/` saem de
  `scripts/gerar-instrucoes.sh`. A ferramenta não os toca; troca-se a fonte (`instrucoes-*.md.tmpl`) e roda-se o gerador.
- **Par desencontrado:** o `--dry` imprime e o mapa lista (seção 6) o teste que a ferramenta troca enquanto o arquivo de origem de mesmo
  nome (`dgclaw-sentinela.test.sh` e `bin/dgclaw-sentinela`) deixa texto do mesmo tipo para trás. Regra: produto e teste mudam
  juntos ou ficam juntos; quem recebe o lote resolve cada par.
- **Comando em código:** `dgclaw <sub>` que está em código (invocação de verdade) não se troca, mas é contado ("deixado" no mapa).
  Se vier depois de `sudo `, é texto ao dono em função que a ferramenta não lê: aparece como `sudo-fora-de-zona` (manual).

## 4. O que a ferramenta NÃO faz

- Não renomeia nada por baixo: caminhos (`/etc/dgclaw`), serviços (`dgclaw-web.service`), variáveis (`DGCLAW_*`), cookie,
  `localStorage`, servidor MCP e nome de ferramenta continuam como estão.
- Não corrige texto que o original escreveu em código que ela não lê (`die "..."`, `W "..."` no doctor, `.yml`, `Containerfile`).
  Esses casos aparecem no mapa como "manual".
- Uma troca de `Description=` em unidade do systemd tem um acoplamento: `panel/lib/operacoes.js` tira o prefixo `DG Claw` da
  descrição por regex. Trocar a descrição e esse regex precisa andar junto (lotes M1 e M4).

## 5. As próximas junções com o original, sem o nome gerar conflito

O problema: o original escreve texto novo com "DG Claw"; o nosso já está com "Prumo da Locadora". O `git merge` vê as duas
versões da mesma linha como mudança e acusa conflito. A saída é aplicar a ferramenta também à **base** (o último commit do original
que já juntamos) e ao **commit novo do original**, e fazer a mistura de três vias entre esses dois. Assim a diferença de nome some
dos dois lados e só sobra a mudança de verdade.

Regras que valem sempre: nada de `rebase`, nada de `squash`, nada de `push`. O resultado é um merge commit com dois pais.
Trabalhe com o ramo nosso limpo (`git status` sem nada), de dentro do repositório, com `ORIGINAL` = o commit novo do original e
`BASE` = o último commit do original já incluído (`git merge-base HEAD ORIGINAL`, ou o último `(cherry picked from commit ...)`
do original, se a junção anterior foi por cherry-pick).

    BASE=<último commit do original já juntado>
    ORIGINAL=<commit novo do original>

    # 0. a ferramenta mora no NOSSO ramo, mas não existe no checkout da base nem do original: copie-a para fora
    FERR=$(mktemp -d)/marca && cp -r scripts/marca "$FERR"
    REPO=$PWD

    # 1. a base e o original com a marca, em ramos temporários (--raiz aponta o repositório; a ferramenta roda da cópia)
    git switch -c marca-base "$BASE"           && node "$FERR/aplicar.mjs" --raiz "$REPO" && git commit -qam "temp: base com a marca"
    git switch -c marca-original "$ORIGINAL"   && node "$FERR/aplicar.mjs" --raiz "$REPO" && git commit -qam "temp: original com a marca"
    git switch -                               # volta ao nosso ramo

    # 2. a mistura de três vias, escolhendo a base marcada
    TREE=$(git merge-tree --write-tree --merge-base=marca-base HEAD marca-original)

    # 3. sem conflito (o comando acima saiu com 0): o merge commit tem como pais o nosso HEAD e o ORIGINAL de verdade
    NOVO=$(git commit-tree "$TREE" -p HEAD -p "$ORIGINAL" -m "Junção com o original até ${ORIGINAL:0:7}")
    git merge --ff-only "$NOVO"

    # 4. conferir e limpar
    node scripts/marca/aplicar.mjs --dry       # o que sobrou de nome antigo; troque e comite "Marca: ..."
    git branch -D marca-base marca-original

(O `git commit -qam` falha se a ferramenta não mudar nada; nesse caso a base já estava com a marca e o passo é desnecessário.)

Se o passo 2 acusar conflito (saída 1), o `$TREE` já traz os arquivos com marcas `<<<<<<<` só onde a mudança é de verdade. Resolva
num ramo temporário limpo:

    git switch -c juncao && git read-tree --reset -u "$TREE"
    # edite os arquivos com <<<<<<<, depois:
    git add -A
    NOVO=$(git commit-tree "$(git write-tree)" -p HEAD -p "$ORIGINAL" -m "Junção com o original até ${ORIGINAL:0:7}")

(O `HEAD` do ramo `juncao` é o mesmo commit do nosso ramo. Depois, volte ao nosso ramo, rode `git merge --ff-only "$NOVO"` e apague `juncao`.)

Por que isso funciona: o `merge-base` é só uma indicação de qual versão é "a de antes". Usar a base com a marca aplicada faz o "DG
Claw" de antes e o "Prumo da Locadora" de agora serem a mesma coisa, e o original com a marca aplicada diz "Prumo da Locadora" onde
o nosso diz. O merge commit final tem o `ORIGINAL` verdadeiro como pai, então na junção seguinte o `git merge-base` já aponta para ele.

Depois da junção:

1. Rode `node scripts/marca/aplicar.mjs --dry`. O que ficou como `manual` no texto novo do original é decisão de gente.
2. Rode os testes pela caixa de memória (`bin/caixa-testes.sh bash tests/rodar.sh`).
3. Se o original criou comando, skill ou subcomando novo: acrescente em `regras.json` (`subcomandos`, `barra.ligadas`) e rode de novo.

Observação: este procedimento foi ensaiado num repositório de brinquedo com a ferramenta copiada para fora (com e sem conflito) e, pelo QA, numa junção de verdade até o `merge-tree` (448 arquivos trocados em cada lado); ainda não houve uma junção real fechada com ele.

## 6. docs-em-dia

O manual (`docs/manual`) pode citar `prumo agente criar` ou `dgclaw agente criar`: o inventário de `scripts/docs-inventario.mjs`
declara `apelidos_de_comando: { prumo: "dgclaw" }` e o `tests/docs-em-dia/checar.mjs` trata os dois como o mesmo comando. Os
nomes `dgclaw-agente` e `dgclaw-card` não têm apelido (são nomes internos).

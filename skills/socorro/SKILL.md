---
name: socorro
description: Socorro do agente Prumo da Locadora para o dono leigo: descobre por que o agente parou de responder ou ficou estranho, explica em uma frase, propõe o conserto, pede licença e confere que voltou. Use quando alguém disser "meu agente parou", "ele não responde", "não está respondendo", "deu problema no agente", "aconteceu alguma coisa com meu agente, vê aí", "o bot morreu", "ele ficou mudo", "o agente sumiu", "ele esqueceu tudo", ou quando a sessão de socorro do painel for aberta. Serve para a instalação v1 (cada agente num container, o Admin no servidor). Para uma checagem geral sem queixa, prefira rodar `dgclaw status`.
user-invocable: true
---

# socorro: o agente parou, e agora?

Quem pede socorro quase nunca é técnico e está preocupado. O seu trabalho é achar a causa
rápido, explicar sem jargão, consertar só com licença e provar que voltou.

## Passo 1: carregue o manual

Leia o manual de emergência inteiro antes do primeiro comando. Ele tem o mapa de todas as
peças, a árvore de decisão na ordem certa e o que NÃO fazer:

```bash
M="${CLAUDE_PLUGIN_ROOT:-}/docs/EMERGENCIA.md"
[ -f "$M" ] || M=/opt/dgclaw/app/docs/EMERGENCIA.md
[ -f "$M" ] && echo "$M" || echo "manual não encontrado"
```

O app fica em `/opt/dgclaw/app`, tanto no servidor quanto dentro do container do agente.
Leia o arquivo com a ferramenta Read. Se não achar, siga os passos abaixo e use
`dgclaw status` e `dgclaw agente listar` como mapa.
Ao dono, escreva o comando como `sudo prumo …` (é o mesmo `dgclaw`); para executar, use `dgclaw`.

## Passo 2: uma pergunta só, e investigue

Pergunte ao dono: "Por onde você fala com ele e desde quando ele não responde?". Depois siga o
manual na ordem: qual é o agente (seção 1), o mapa das peças (seção 2), o site abre (3.1), o
container e o runner estão de pé (3.2), o ÚLTIMO turno foi erro (3.3: login vencido,
sobrecarga, limite de uso, recusa), o canal está vivo (3.5), a conversa está envenenada (3.6),
a sessão travou (3.7), a memória parou (3.9). Para o último turno, o `saude_sessao.py` já diz o
tipo do problema e o que fazer (manual 2.3).

Quatro queixas têm capítulo próprio no manual. "Não consigo entrar" e "um agente ficou de fora"
se resolvem pelo terminal do servidor, com o "posso?" antes de mudar qualquer coisa; o Face ID se
resolve na tela, e o Cofre é só olhar o painel:

- **"Não consigo entrar no painel"** (manual 3.1.1): quase nunca é a senha. Veja primeiro se foi
  bloqueio por tentativas e se a pessoa usou e-mail em vez do usuário. `sudo prumo usuario` mostra o
  usuário e o endereço do painel; `sudo prumo senha` troca a senha (nunca a escreva no chat).
- **"Travou no Face ID"** (manual 3.1.2): o Face ID nunca faz login, então a saída é o botão
  **Entrar com a senha** na tela travada. Se a pessoa esqueceu a senha, `sudo prumo senha`.
- **"Um agente ficou de fora da atualização"** (manual 3.2.1): na primeira atualização para a 1.0.5 a
  tela termina com "Atualizacao INCOMPLETA" e uma linha FALHOU por agente. É esperado nesta versão. Leia
  o aviso da 1.0.5 e a lista `perdido-no-recriar-*.txt` do agente, diga ao dono o que o `--forcar`
  perde (só o que foi instalado à mão dentro da caixa; as rotinas padrão voltam ao padrão) e, com o
  sim dele, rode `sudo dgclaw agente recriar <nome do agente> --forcar`.
- **"Onde fica o Cofre?"** (manual 3.1.3): no menu da conversa (ícone de três traços), grupo
  **Segurança**, item **Cofre (chaves)**, que só o dono vê; no painel do agente, a aba **Cofre**, que o
  colaborador vê mas não consegue abrir.

Os comandos `sudo prumo ...` (entrar no painel) o dono digita no terminal do servidor, o mesmo da instalação (manual
3.1.1, "Como chegar ao terminal do servidor"): quem não entra no painel não fala com o Admin. Se ele
não sabe chegar lá, peça o acesso a quem instalou; não invente outro caminho.

Agente sem container (`ausente`): `agente iniciar` não funciona. A receita é uma só, com o sim do dono:
`sudo dgclaw agente recriar <nome do agente> --forcar` (manual 3.2.1). Como não existe caixa, não há
lista nem nada a perder. Para conferir, veja se
`/var/lib/dgclaw/agentes/<nome do agente>/home/.dgclaw/unidades-padrao.sha256` passou a existir
(`sudo ls -l` nesse caminho); o `dgclaw status` não prova isso.

No caso do agente de fora da atualização, a lista se lê assim, sempre com o `sh -c` (a pasta é fechada
para o usuário comum, e o `*` seria expandido antes do `sudo`):
`sudo sh -c 'ls /var/lib/dgclaw/agentes/<nome do agente>/perdido-no-recriar-*.txt'`. Aparece o nome do
arquivo: há algo a perder, leia com `sudo sh -c 'cat ...'`. "No such file": nada a perder. A rotina
padrão que o dono desligou volta a rodar.

Agente que ficou parado logo depois de criado (`created`) agora liga sozinho: o instalador liga no fim
da instalação e da atualização, e a Sentinela tenta uma vez a cada 6 horas. Só se ele continuar
parado é que se liga à mão com `sudo dgclaw agente iniciar <nome do agente>`. O agente desligado (`exited`) nunca
liga sozinho: pode ter sido de propósito.

Enquanto investiga, não narre comando. No máximo: "estou olhando, um minuto".

## Passo 3: explique, proponha, pergunte

- Uma frase do que aconteceu, na língua dele: "o login do Claude dele venceu na quarta, por isso
  ele parou de pensar".
- O conserto e quanto tempo leva: "eu reconecto, leva dois minutos, ele não perde a memória".
- "Posso?" e espere o sim.

Quando a conversa em si está envenenada (resposta cortada pelo filtro de segurança da
Anthropic, ou conversa grande demais), reiniciar normal traz o problema de volta: o conserto é
o modo de segurança (botão na faixa de aviso do painel, ou `scripts/modo-seguro.sh`, manual
3.6), que começa uma conversa nova e guarda a antiga. Explique isso ao dono antes do "posso?":
ele perde o fio daquela conversa, não a memória.

Duas exceções em que o conserto é esperar, e você diz isso com a hora de testar de novo:
**sobrecarga da Anthropic (529, overloaded)** e **limite de uso da assinatura**. Reiniciar
nesses casos só piora (zera o cache e o próximo turno sai mais caro).

## Passo 4: conserte com cuidado

- Uma mudança por vez, com cópia antes (`<arquivo>.antes-socorro-AAAAMMDD-HHMM`). Nada se apaga.
- Nunca faça login com a sessão do agente de pé: pare o runner antes (manual 3.4).
- Nunca remova o container do agente para "limpar" (`podman rm`, `dgclaw agente remover`): para
  desligar, `sudo dgclaw agente parar <nome do agente>`. Para reiniciar só o runner, `sudo dgclaw agente reiniciar <nome do agente>`.
- Para refazer a parte de dentro de um agente (tarefas agendadas, runner e painel): `sudo dgclaw agente reparar <nome do agente>`.

## Passo 5: prove que voltou

`dgclaw agente listar` mostrando `running` e `ok`, `/api/saude` do runner em `idle` (manual
seção 5), e o principal: peça ao dono para mandar "oi" pelo canal dele e espere a resposta
chegar LÁ. Só então diga "voltou".

Feche registrando uma linha no diário do agente (`memory/<hoje>.md`, que na casa dele fica em
`/var/lib/dgclaw/agentes/<slug>/home/memory/`): o que houve e o que foi feito, para ele saber
depois por que ficou fora do ar. Se nada explicou o problema, diga com franqueza, junte a saída
de `dgclaw status` e os últimos logs e entregue a quem cuida do servidor.

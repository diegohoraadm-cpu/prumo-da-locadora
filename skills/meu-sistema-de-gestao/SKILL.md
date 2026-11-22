---
name: meu-sistema-de-gestao
description: Recebe o PDF "Sistema de Gestão" do dono (um arquivo só, em duas partes: Parte 1 com os documentos APROVADOS, Parte 2 com registros e o que ainda está em elaboração, NÃO aprovado), guarda uma cópia de trabalho na memória, organizada por documento, com código, revisão e data de vigência, e passa a responder as perguntas do dia a dia da empresa citando o documento e a revisão. Diz com todas as letras quando a regra não está escrita ou quando só aparece na parte não aprovada, e nunca inventa regra. Quando chega um PDF novo, compara com o guardado, diz o que mudou de revisão e substitui. Diz a data da cópia que tem e avisa quando ela parece velha. Use SEMPRE que o dono mandar o PDF do Sistema de Gestão, disser "guarda meu sistema de gestão", "atualiza meu sistema de gestão", "ative a habilidade meu sistema de gestão", e quando o dono ou alguém da equipe perguntar uma regra da empresa ("qual é a regra de desconto", "qual o prazo de pagamento", "quando bloqueia o cliente", "quem pode liberar", "quem decide isso", "como é a rotina de entrega", "isso está no nosso sistema de gestão?", "qual a revisão da folha", "de quando é a sua cópia"). NÃO use para aprovar, escrever ou corrigir documento, nem para explicar o método do curso ou da consultoria do dono.
user-invocable: true
---

# meu-sistema-de-gestao, as regras aprovadas da empresa na ponta da língua

O dono tem um Sistema de Gestão: os documentos que dizem como a empresa dele funciona (preço, desconto,
cobrança, quem decide o quê, rotinas). O lugar onde esses documentos vivem entrega tudo num PDF só,
dividido em duas partes. Você guarda uma **cópia de trabalho** desse PDF e responde por ela.

A regra que vale em toda resposta desta habilidade:

**Só é regra o que está na Parte 1 (aprovado). Parte 2 é registro, não é regra. O que não está escrito,
você diz que não está escrito. Nunca invente, complete nem "melhore" uma regra.**

## O que esta habilidade NÃO faz

- **Não aprova nem altera documento.** Quem aprova é a pessoa que a configuração indica (seção
  seguinte), no lugar onde o original vive. Você nunca diz "pode considerar aprovado" e nunca reescreve
  o texto de um documento na cópia.
- **Não ensina método.** Se perguntarem como se faz a conta, como se preenche uma folha ou o porquê de
  uma etapa do curso ou da consultoria, diga que isso é do curso e mande procurar lá. Você responde o
  que a empresa do dono decidiu e escreveu, e só.
- **Não manda nada a cliente nem a funcionário sem o dono ver.** Texto que cita uma regra para alguém de
  fora da conversa você entrega ao dono, e ele manda.
- **Não guarda senha, chave nem dado de acesso.** Se o dono mandar a senha do sistema junto com o PDF,
  não grave e avise que não precisa dela.
- **Não espalha a cópia.** Ela fica só na sua memória. Não vai para o quadro de avisos, para outro
  agente nem para a pasta de documentos do dono.

## Primeira vez: a configuração (`memory/sistema-de-gestao/config.md`)

Antes de guardar o primeiro PDF, confira se `memory/sistema-de-gestao/config.md` existe. Se o dono
mandou um texto de configuração pronto (o curso ou a consultoria dele pode ter um), leia, mostre em 3
linhas o que entendeu e grave. Se não mandou, pergunte de uma vez só:

1. **Onde o original vive e onde se baixa o PDF?** (o nome do sistema e o caminho até o botão).
   Se já existir `memory/sgl-config.md`, da habilidade `guardiao-do-sgl`, use o lugar que está lá e
   não pergunte de novo.
2. **Quem aprova os documentos?** (a função: "o mentor", "o consultor", "o diretor").
3. **Com quantos dias a cópia é velha?** Sem resposta: 30 dias, e diga que dá para mudar.

O arquivo guarda as respostas, uma por linha, com a data. Configuração nova substitui a antiga.

## Como reconhecer o PDF (pelo que está escrito, nunca pela posição)

A aparência do PDF pode mudar (texto corrido, tabela, outra letra). Por isso você se guia só por estes
dizeres, onde quer que apareçam na página:

- **Capa:** o título "Sistema de Gestão", o nome da empresa, "Emitido em DD/MM/AAAA" e duas linhas que
  começam por "Parte 1" e "Parte 2". A linha da Parte 1 diz quantos documentos aprovados existem.
- **Lista mestra:** sob o título "PARTE 1 · DOCUMENTOS APROVADOS", um item numerado (1.1, 1.2, ...) por
  documento, com título, códigos (ex.: SGL-021), "rev.", "em vigor desde" e "revisar até".
- **Cada documento aprovado:** um cabeçalho de controle com os rótulos **Código, Revisão, Em vigor
  desde, Páginas e Situação**, e a Situação escrita **"Vigente"**. Perto dele: "item 1.N da lista
  mestra", "Códigos do SGL:" e, no fim do documento, "Histórico de revisões".
- **Parte 2:** o título "PARTE 2", a Situação **"Não aprovado"** e o aviso de que aquilo é prova do
  que aconteceu, não regra.
- **Rodapé:** "página X de Y".

Três situações que você precisa separar:

| O que a linha da Parte 1 traz, na capa | O que é | O que você faz |
|---|---|---|
| um número de 1 para cima ("9 documentos aprovados...") | cópia completa | guarda as duas partes |
| o número 0, e a lista mestra diz "Nenhum documento aprovado ainda" | completa, mas sem nada aprovado | guarda e diz ao dono que nesta cópia ainda não há regra aprovada |
| nenhum número, e a frase "**não puderam ser lidos**" | **cópia parcial** | não existe Parte 1 neste arquivo: veja a seção 5 |

**Se você não achar esses dizeres** (nem "Parte 1", nem "Situação", nem a lista mestra), não chute.
Leia o texto inteiro, do começo ao fim. Trate como aprovado **só** o trecho que disser, ele mesmo, que
está aprovado ou vigente. Tudo o mais entra como "não confirmado" e vale como Parte 2. Diga ao dono, em
uma linha, o que você não reconheceu. Se o arquivo não for um Sistema de Gestão, diga isso e pare.

## 1. Receber o PDF e tirar o texto

1. Rode `date +%d/%m/%Y` para saber o dia de hoje.
2. Ache o arquivo. Se o PDF chegou como um arquivo que você consegue ler (pelo painel, o caminho vem
   na mensagem, como `[anexo: /home/agente/uploads/AAAA-MM-DD/nome.pdf]`), leia. Se chegou só um aviso
   de anexo, baixe pelo recurso do seu canal. Se não conseguir ler, diga ao dono para mandar o PDF pelo
   painel e pare. Nunca altere nem apague o original.
3. Tire o texto com `pdftotext -layout "$ARQUIVO" /tmp/sistema-de-gestao.txt` e leia o resultado
   **inteiro**, em pedaços se for grande. Se o comando falhar, leia o PDF com a sua leitura de arquivo,
   todas as páginas.
   Apague o arquivo de texto de `/tmp` quando terminar de guardar.
4. **Confira que leu tudo:** o último rodapé "página X de Y" tem de ter X igual a Y. Se não bater, diga
   ao dono que o arquivo veio incompleto e não guarde.
5. Se o texto vier com nomes trocados por marcadores, como `[PESSOA_1]` ou `[CPF_1]`, o arquivo passou
   pela anonimização de documentos. **Não guarde:** a cópia ficaria sem os nomes de quem decide o quê.
   Avise o dono, em uma linha, que o PDF chegou com marcadores no lugar dos nomes, e pare.
6. Título ou lista de códigos cortado com "…" não se completa de cabeça: use a forma inteira que aparece
   na lista mestra ou na linha "Códigos do SGL:". Código escrito abreviado ("SGL-013 · 014 · 018") quer
   dizer SGL-013, SGL-014 e SGL-018.

## 2. Guardar a cópia de trabalho (`memory/sistema-de-gestao/`)

Três arquivos, sempre os três, e nada mais nessa pasta além da configuração:

**`indice.md`**, o que você lê antes de qualquer resposta:

```markdown
# Sistema de Gestão: índice da cópia

Empresa: ...
Emitido em: DD/MM/AAAA | Recebido em: DD/MM/AAAA | Páginas: N
Arquivo: <o caminho do PDF recebido>
Estado da cópia: completa | completa, sem documento aprovado | PARCIAL (sem Parte 1)

## Parte 1: documentos APROVADOS (N)
| Item | Documento | Códigos | Revisão | Em vigor desde | Revisar até | Situação |
|---|---|---|---|---|---|---|
| 1.4 | Folha 3: ... | SGL-021, SGL-022 | 00 | 10/11/2026 | 10/11/2027 | Vigente |

## Parte 2: NÃO APROVADO (registro, não é regra)
- um por linha: os títulos numerados da Parte 2 e, dentro de cada um, as entregas que têm data
- se a Parte 2 vier vazia, uma linha só: `nada nesta cópia`

## Cópias anteriores
- emitida em DD/MM/AAAA, substituída em DD/MM/AAAA: o que mudou, em uma linha
```

**`parte-1-aprovados.md`**: uma seção `## ` por documento, na ordem da lista mestra. A primeira linha
da seção repete código, revisão, em vigor desde, revisar até e situação. Depois vem o texto do
documento **como está escrito**, com os títulos dos itens e o histórico de revisões. Não resuma, não
corrija, não troque palavra. Sem documento aprovado, o arquivo tem uma linha só: `Nenhum documento
aprovado nesta cópia.`

**`parte-2-nao-aprovado.md`**: começa pela linha `NÃO APROVADO: registro do que aconteceu, não é regra
da empresa.` e traz o texto da Parte 2, com os mesmos títulos do PDF.

Nos dois arquivos, tire só o que se repete em toda página (cabeçalho e rodapé). A capa e a lista mestra
não se copiam: o que elas dizem já está no índice.

**Confira antes de dizer que guardou.** Os quatro números têm de ser iguais: o da capa ("N documentos
aprovados"), os itens da lista mestra, os documentos com Situação "Vigente" (conte cada documento uma
vez: o cabeçalho se repete em toda página dele) e as linhas da tabela do índice. Se um não bater, diga qual e não diga que está guardado. Quatro zeros também valem, desde que
a lista mestra diga, ela mesma, que não há documento aprovado. Na cópia parcial a capa não traz número:
a conferência é a da seção 5.

Depois, acrescente **uma** linha em "Regras aprendidas" do `MEMORY.md` (troque a linha antiga, se
houver): `Regra da empresa eu respondo pela cópia em memory/sistema-de-gestao/ (emitida em DD/MM/AAAA),
seguindo a habilidade meu-sistema-de-gestao.` Se a cópia for parcial, a linha é outra: `Ainda não tenho
os documentos aprovados da empresa: o PDF de DD/MM/AAAA veio parcial. Regra eu só respondo depois do PDF
completo.`

Diga ao dono, em poucas linhas: a data de emissão, quantos documentos aprovados entraram, a revisão de
cada um e que a Parte 2 ficou guardada como não aprovada.

## 3. Responder as perguntas do dia a dia

Leia o `indice.md` e procure no arquivo da parte certa **antes** de responder. Nunca responda de
cabeça nem pelo que lembra da conversa. A resposta sai de um destes quatro jeitos:

1. **Está na Parte 1.** Dê a regra na primeira linha, com as palavras do documento. Na linha seguinte,
   a fonte: `Fonte: <documento>, item "<título do item>", rev. NN, em vigor desde DD/MM/AAAA (cópia
   emitida em DD/MM/AAAA).` Se o próprio documento disser a partir de quando a regra vale, ou até
   quando, diga também. Não estenda a regra a um caso que o texto não cobre: diga até onde ele vai.
   Regra que aparece em mais de um documento aprovado leva uma linha "Fonte:" para cada um.
2. **Só está na Parte 2.** Comece por: "Isso **ainda não é regra aprovada**." Depois diga o que o
   registro traz e de quando é, e feche com: "Para virar regra, precisa ser aprovado por <quem aprova>,
   em <onde o original vive>." Se dois trechos da Parte 2 disserem coisas diferentes, mostre os dois.
3. **Não está em lugar nenhum.** "Isso não está escrito no seu Sistema de Gestão (cópia emitida em
   DD/MM/AAAA)." Se houver um trecho vizinho, aponte: "O mais perto é <documento, item>, que trata de
   <assunto>, mas não responde isso." Não preencha o vazio com costume do mercado nem com bom senso.
   Feche com: "Se você escreveu ou aprovou isso depois de DD/MM/AAAA, baixe o PDF de novo e me mande."
   Lembre que quem decide é o dono, e que a decisão só vira regra depois de escrita e aprovada.
4. **A Parte 1 e a Parte 2 dizem coisas diferentes.** Vale a Parte 1. Diga as duas e avise o dono da
   diferença.

Dois cuidados:

- **Quem pergunta.** Regra de trabalho (desconto, prazo, cobrança, quem decide, rotina) você responde
  ao dono e a quem da equipe estiver na conversa. Resultado em dinheiro, avaliação de pessoa e o que
  está na Parte 2 você responde só ao dono. Na dúvida, pergunte a ele antes.
- **Pergunta sobre a própria cópia** ("de quando é?", "qual a revisão da folha de preço?"): responda
  pelo índice, com a data de emissão e a de recebimento.

## 4. Chegou um PDF novo: comparar e substituir

1. Tire o texto e monte o índice novo, **sem gravar ainda** (seções 1 e 2).
2. Se o PDF novo for parcial, não siga esta seção: vá para a seção 5. Pare e pergunte ao dono, sem
   substituir, se o nome da empresa for outro ou se a data de emissão for **mais antiga** que a da
   cópia guardada.
3. Compare com o índice guardado, documento por documento, pelo título e pelos códigos:
   - **revisão que subiu:** "Folha X: da rev. 00 para a rev. 01, em vigor desde DD/MM", com o motivo
     que estiver no histórico de revisões;
   - **documento novo na Parte 1** (diga se ele estava antes na Parte 2);
   - **documento que saiu** da Parte 1;
   - **mesma revisão com texto diferente:** não é para acontecer; avise o dono;
   - **sem mudança:** só conte quantos.
4. Grave os três arquivos por cima dos antigos. **Fica uma versão só valendo.** Do que saiu, guarde só
   uma linha em "Cópias anteriores" do índice. O texto antigo não fica em lugar nenhum.
5. Faça a conferência dos quatro números (seção 2), atualize a linha do `MEMORY.md` e diga ao dono o
   que mudou. Se nada mudou: "Mesmo conteúdo; atualizei só a data da cópia para DD/MM."

## 5. PDF parcial (os documentos aprovados não puderam ser lidos)

Quando a capa disser que os documentos aprovados não puderam ser lidos, **este arquivo não tem Parte
1**. Não é que a empresa não tenha documento aprovado: é que a leitura falhou na hora de gerar o PDF.

- **Não havia cópia guardada:** grave o índice com `Estado da cópia: PARCIAL (sem Parte 1)`, o arquivo
  da Parte 2 e o da Parte 1 só com a linha `Sem documentos aprovados nesta cópia: o PDF veio parcial.`
- **Já havia uma cópia completa:** **não substitua.** A cópia antiga continua valendo, com a data dela.
  Anote só uma linha em "Cópias anteriores" do índice: `PDF parcial recebido em DD/MM/AAAA: não
  substituiu nada.`
- Nos dois casos, diga ao dono: "O PDF veio parcial: os documentos aprovados não puderam ser lidos.
  Baixe de novo em <onde se baixa> e me mande."
- A conferência da cópia parcial: último rodapé com X igual a Y, nenhum cabeçalho com Situação
  "Vigente" no texto e nenhuma linha na tabela do índice. O título da tabela fica `## Parte 1:
  documentos APROVADOS (não lidos nesta cópia)`.
- Enquanto a cópia for parcial, toda pergunta de regra começa por: "Não tenho os seus documentos
  aprovados: a cópia que recebi em DD/MM veio parcial. Baixe o PDF de novo e me mande." Se o assunto
  aparecer na Parte 2, acrescente: "Na parte não aprovada aparece <o trecho, com a data>. Não sei dizer
  se isso já está aprovado, porque os documentos aprovados não vieram." Nunca responda uma regra pela
  Parte 2 como se fosse aprovada, e nunca diga que algo "não é aprovado" sem ter a Parte 1.

## 6. A data da cópia e a cópia velha

Toda resposta com fonte leva a data de emissão da cópia. Além disso, avise o dono e peça um PDF novo,
uma vez por conversa, quando:

- a cópia passou do número de dias da configuração (30, se ele não disse outro): "A minha cópia é de
  DD/MM (N dias). Se algo foi aprovado depois, baixe de novo e me mande.";
- a data "revisar até" do documento que você está citando já passou: responda e avise que a revisão
  dele está vencida;
- o dono contar que um documento foi aprovado ou mudou depois da data de emissão: aí a cópia está
  velha de certeza. Diga que a sua resposta é pela versão antiga e peça o PDF novo.

## Verificação

Nunca diga "guardado", "atualizado" ou "é essa a regra" sem uma conferência que falharia se estivesse
errado: página X de Y, os quatro números iguais, a releitura do trecho citado no arquivo da Parte 1.
Diga em uma linha, entre parênteses, como conferiu e o que ficou sem conferir.

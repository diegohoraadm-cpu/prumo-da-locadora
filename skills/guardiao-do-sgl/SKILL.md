---
name: guardiao-do-sgl
description: Guarda o ÍNDICE do sistema de gestão do dono (lista mestra de documentos) e cuida das cópias datadas desses documentos. Monta e mantém memory/sgl-indice.md a partir da lista mestra que o dono mandar; dá nome a um documento recebido e diz em qual pasta ele vai; responde "qual versão vale" e "onde está o documento X"; avisa quando uma cópia passa de 30 dias; cria os lembretes do registro da semana, do encontro do mês e da próxima revisão de um documento; prepara o texto do registro para o dono colar no sistema onde o original vive. Use SEMPRE que o dono falar de sistema de gestão, SGL, lista mestra, código de documento, procedimento, rotina, registro semanal, reunião do mês, "qual versão vale", "onde está o procedimento", "onde guardo este documento", "monta meu registro da semana", "ative o guardião do SGL", e quando chegar um recado [LEMBRETE] cujo texto comece por "SGL:". NÃO use para calcular nada que o sistema do dono calcula nem para preencher telas de outro sistema.
user-invocable: true
---

# /dgclaw:guardiao-do-sgl, o índice do sistema de gestão do dono

O dono tem um sistema de gestão: uma lista mestra de documentos (procedimentos, rotinas, registros) e um
lugar onde o original de cada um vive (um sistema na internet, uma pasta, um caderno). Você guarda só o
**índice** (código, status, versão, data, onde está, próxima revisão) e ajuda a manter as **cópias
datadas** na pasta de documentos dele. A regra que vale em toda resposta desta habilidade:

**O original vive no lugar que o dono disse. A cópia é datada. Na dúvida, vale o original.**

## O que esta habilidade NÃO faz

- **Não entra no sistema onde o original vive.** Você prepara o texto; o dono cola.
- **Não traz lista mestra, modelo de documento nem método de ninguém.** Você sempre lê o arquivo que o
  dono mandou e monta o índice a partir dele.
- **Não guarda dado pessoal.** Nome, telefone, CPF, endereço, valor devido por cliente, salário ou
  avaliação de funcionário nunca entram no índice nem na memória (LGPD; o dono é o responsável por
  esse dado). Documento que tem esse tipo de dado entra no índice só com código, status, versão, data
  e local.
- **Não grava na pasta do Drive por conta própria.** Você diz o nome e a pasta; o dono salva. Só grave
  pelo conector se o dono pedir com todas as letras, e confira abrindo o arquivo depois.

## Primeira vez: as perguntas da configuração (`memory/sgl-config.md`)

Antes de montar o índice, confira se `memory/sgl-config.md` existe. Se não existir, faça as perguntas
abaixo. Se o dono mandar um arquivo de configuração pronto (o curso ou a consultoria dele pode ter um),
leia, mostre em 5 linhas o que entendeu e grave depois do "ok" dele.

1. **Onde vive o original?** (o nome do sistema ou lugar; vai na frase "vale a do ___").
2. **Quais são as pastas de documentos e qual área vai em cada uma?** Grave a ligação **pelo nome da
   área** (ex.: Compras -> pasta "Suprimentos"). Nunca ligue pelo número: a numeração da lista e a das
   pastas podem ser diferentes.
3. **Na lista mestra, quais colunas são** o código, o título, a área e o status? Tem uma coluna de
   código interno que diz quando um documento vive dentro de outro? Se tiver: qual a regra? (ex.:
   "DOC-0N fica dentro do documento cujo título começa por 'Parte N'").
4. **Que status quer dizer que o documento ainda não existe**, e de onde sai a etapa em que ele chega?
   (ex.: status "SÓ TÍTULO (chega na etapa 5)": a etapa é o trecho depois de "chega na").
5. **Registro da semana:** que dia e hora? **Encontro do mês:** que dia (ex.: 1º dia útil, dia 5)?
   Sem resposta: segunda às 8h e 1º dia útil às 8h, e diga que dá para mudar.

`memory/sgl-config.md` guarda as respostas, uma por linha, com a data. A configuração nova substitui a
antiga: nunca deixe as duas.

## O arquivo do índice: `memory/sgl-indice.md`

```markdown
# Índice do sistema de gestão

Lista mestra usada: Rev. N, recebida em DD/MM/AAAA (arquivo: /home/agente/uploads/AAAA-MM-DD/nome.xlsx)
Atualizado em: DD/MM/AAAA

## Lembretes
Registro da semana: id ... | Encontro do mês: ids ... | Revisões: DOC-0xx id ...

## Campos do registro (do print de DD/MM)
campo 1; campo 2; ...

## Documentos
| Código | Título | Área | Dentro de | Status | Versão da cópia | Data da cópia | Onde está a cópia | Próxima revisão | Dado pessoal |
|---|---|---|---|---|---|---|---|---|---|
| DOC-014 | ... | Compras | DOC-010 (Parte 2) | PROVISÓRIO | Rev. 1 | 20/11/2026 | Suprimentos / DOC-014 ... .pdf | 20/05/2027 | não |

## Saíram da lista
| Código | Título | Saiu na | Última cópia |
```

Campo vazio leva `—`. "Dado pessoal" é só `sim` ou `não`.

## 1. Montar o índice a partir da lista mestra

1. Rode `date +%d/%m/%Y`.
2. Leia a planilha com o leitor desta habilidade, passando os nomes de coluna que estão na configuração:

   ```bash
   python3 .dgclaw/plugin/skills/guardiao-do-sgl/scripts/ler_lista.py "$ARQUIVO" \
     "Código" "Título" "Área" "Status" \
     "Código interno" 'DOC-0?(\d+)' "Parte {n}"
   ```

   As três últimas são opcionais (coluna de código interno, o padrão com o número entre parênteses e o
   começo do título do documento que contém). Sai uma linha por documento: código, título, área, código
   interno, dentro de, status; o total sai no fim. PDF ou print: leia e monte as mesmas colunas à mão.
3. Copie para o índice só essas colunas. Nenhuma outra (observação, responsável por nome, evidência).
4. **Lista nova:** refaça sem perder nada do dono. Código que continua mantém versão, data, onde está e
   próxima revisão; status vem da lista nova. Código novo entra com `—`. Código que sumiu vai para
   "Saíram da lista", com a última cópia; nunca apague.
5. **Confira antes de dizer que terminou:** o total do leitor tem de bater com as linhas da tabela.
   Diga: "Índice montado da Rev. N: X documentos na lista, X no índice."

## 2. Receber um documento e dar nome

1. Descubra o código. Se não estiver no documento, pergunte; não adivinhe.
2. Pergunte a revisão se não estiver escrita. A data da cópia é a do dia em que ele baixou o original;
   sem resposta, use hoje e escreva `Premissa: cópia de hoje`.
3. Nome: `DOC-0xx Título curto - Rev. N - AAAA-MM-DD`. Sem nome de cliente nem de funcionário.
4. Pasta: a da área do documento, **pelo nome** que está na configuração ("pasta Suprimentos"), nunca
   pelo número.
5. Atualize a linha no índice. Se o documento tiver dado pessoal, marque `sim` e não transcreva nada
   dele para a memória.
6. Se o dono disser a data da próxima revisão, grave e crie o lembrete (seção 5, item 3).
7. Confira relendo a linha gravada e diga o que gravou, em uma linha.

## 3. "Qual versão vale?" e "onde está?"

Leia o índice antes de responder. Nunca responda de cabeça. A resposta segue o **status**:

- **Ainda não existe** (status que a configuração marca assim): "O DOC-0xx ainda não existe; chega na
  etapa N." Nunca diga "vale a do ___" de documento que ainda não existe.
- **Existe, com cópia:** "Vale a do ___; a cópia é de DD/MM." Depois, em uma frase, a revisão e a pasta.
  Status provisório: acrescente "(provisório até ___)".
- **Existe, sem cópia:** "Vale a do ___; não tenho cópia guardada."
- **Dentro de outro:** comece por "O DOC-0xx fica dentro do DOC-0yy (Parte N)" e siga a regra acima
  com o status do próprio DOC-0xx.
- Código fora do índice: diga que não está na Rev. N da lista e pergunte se há lista mais nova.

## 4. Cópia com mais de 30 dias

Toda vez que ler uma linha do índice para responder, compare a data da cópia com hoje. Passou de 30
dias: "A cópia do DOC-0xx é de DD/MM (N dias). Se mudou no original, baixe de novo e me mande."
No primeiro aviso do registro da semana (seção 5, item 4), confira o índice inteiro: até 5 códigos
pelo nome; passou disso, diga quantos são os outros.

## 5. Lembretes

Use a habilidade `lembretes` (`dgclaw-api POST /api/v1/lembretes`). Todo texto começa por `SGL:`.

1. **Registro da semana**, no dia e hora da configuração:

   ```bash
   dgclaw-api POST /api/v1/lembretes '{"titulo":"SGL","texto":"SGL: registro da semana","regra":{"tipo":"semanal","dias":["seg"],"hora":"08:00"}}'
   ```

2. **Encontro do mês.** Não há regra mensal, e "a cada 30 dias" escorrega. Crie um `unico` para cada um
   dos próximos 3 meses, no dia da configuração (1º dia útil = segunda a sexta; feriado o dono ajusta):

   ```bash
   dgclaw-api POST /api/v1/lembretes '{"titulo":"SGL","texto":"SGL: encontro do mês e registro","regra":{"tipo":"unico","data":"2026-12-01","hora":"08:00"}}'
   ```

3. **Próxima revisão de um documento:** um `unico` na data que o dono disser, 8h se ele não disser a
   hora, com o texto `SGL: revisar DOC-0xx`.
4. **Quando chegar `[LEMBRETE] envio 1` com texto que começa por `SGL:`:** avise o dono como manda a
   habilidade `lembretes`. Se for o da semana, faça também a conferência das cópias (seção 4) e rode
   `dgclaw-api GET "/api/v1/lembretes?estado=ativo"`: restando menos de 2 do encontro do mês, crie o
   próximo. Nos envios seguintes, só o aviso.

**Quando um lembrete conta como marcado:** só quando o comando volta com código 0. Aí confirme ao dono
com a `regra_texto` e a `proxima` da resposta e grave o id no índice. Outro código: o lembrete não foi
criado; siga a tabela de códigos da habilidade `lembretes` e diga isso ao dono.

## 6. Preparar o texto do registro

Serve para o registro da semana, o do mês e uma ocorrência.

1. **Campos:** na primeira vez, peça um print da tela do registro no lugar onde o original vive e grave
   os nomes dos campos no índice, com a data. Use esses campos, na mesma ordem. Sem print: período (de
   DD/MM a DD/MM), os números como o dono contou, o que aconteceu, ações (o quê, quem, até quando).
2. Número que o dono não disse fica `[falta: ...]`; nunca estime. Não calcule o que o sistema dele calcula.
3. Nome de cliente ou funcionário: troque pela função ("o motorista", "um cliente").
4. Uma linha antes ("Texto do registro de DD/MM, para colar:") e o texto sozinho na mensagem seguinte.
5. Não grave o texto na memória. No índice, só "Último registro preparado: DD/MM".

## Verificação

Nunca diga "feito" sem uma conferência que falharia se estivesse errado: total do leitor contra linhas
do índice, releitura da linha gravada, código 0 e `proxima` do lembrete. Diga em uma linha, entre
parênteses, como conferiu e o que ficou sem conferir.

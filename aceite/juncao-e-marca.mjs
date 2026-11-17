#!/usr/bin/env node
// Aceite da junção #96–#129 e da marca própria (plano em
// /home/prumo/entregas/prumo-da-locadora-juncao-e-marca-2026-11-16/PLANO.md).
// Escrito pelo Teia ANTES do código. Fora do build: nada em web/, panel/, runner/ importa daqui,
// e nenhum arquivo desta pasta se chama *.test.*. O install.sh copia o repositório inteiro
// (menos .git, node_modules, tests e qa), então ele vai junto para a instalação, mas
// ninguém executa: é só um script de conferência.
//
// Uso, da raiz do repositório e sempre pela caixa de memória:
//   /home/prumo/AgentePrumo/bin/caixa-testes.sh node aceite/juncao-e-marca.mjs --bloco F1
//   /home/prumo/AgentePrumo/bin/caixa-testes.sh node aceite/juncao-e-marca.mjs --bloco R1
//   /home/prumo/AgentePrumo/bin/caixa-testes.sh node aceite/juncao-e-marca.mjs --bloco F2
//   ... --bloco F4 [--lote M1|M3|M4|M5]   (marca própria; com --lote, só os arquivos daquele lote)
//   ... --bloco tudo            (F1, F2, R1 e F4 em sequência)
// Opções:
//   --commit <rev>   confere o conteúdo de um commit em vez da árvore de trabalho (útil ao QA)
//   --mostrar <n>    quantos exemplos listar por critério que falhou (padrão 15)
// Saída: uma linha por critério, "OK" ou "FALHA", com o número medido. Código 0 = tudo OK;
// 1 = algum critério falhou; 2 = uso errado ou bloco ainda não escrito (F3 e F4 vêm depois).
//
// Exceções justificadas: aceite/juncao-excecoes.json (o dev cria quando precisar), no formato
//   { "original_ausentes":  [ { "arquivo": "x", "linha": "<linha exata, sem espaços nas pontas>" | "*", "motivo": "..." } ],
//     "nossas_ausentes":    [ mesmo formato ],
//     "emergencia_novas":   [ mesmo formato ] }
// "motivo" com 15 caracteres ou mais; "linha": "*" vale para o arquivo inteiro. Cada exceção é
// listada na saída, para o QA ler uma por uma.
//
// CONTRATO COM O TESTE DO R1 (o dev escreve o teste; este aceite só lê o que ele imprime).
// tests/cli/atualizar-entre-versoes.sh <commit anterior> <commit candidato> monta a raiz falsa em <anterior>,
// cria 4 agentes (comum, created, com pacote instalado à mão, com rotina padrão editada), fotografa os dados
// do dono e roda, nesta ordem: 1ª atualização com o lib/atualizar.sh ANTIGO; --voltar; 1ª atualização de novo;
// `agente recriar <slug> --forcar` em cada agente; 2ª atualização para um commit trivial novo (com --parecer
// segura antes do --ok-do-dono). Imprime, além do que quiser, estas linhas:
//   R1 atualizar_sh_blob=<git rev-parse <anterior>:lib/atualizar.sh>   prova que a 1ª rodou o atualizar ANTIGO
//   R1 fotografia_diferencas=<n>          dados do dono que mudaram na 1ª, fora DGCLAW_VERSAO e DGCLAW_COMMIT
//   R1 casas_arquivos_apagados=<n>        arquivos que existiam nas casas e sumiram, em qualquer etapa
//   R1 primeira_resultado=INCOMPLETA|concluida
//   R1 primeira_de_fora=<n>               agentes com linha FALHOU na 1ª
//   R1 created_depois_primeira=created|running
//   R1 aviso_c4_impresso=sim|nao          o "AVISO DA VERSÃO 1.0.5" do install.sh novo saiu antes do recriar
//   R1 lista_comum|lista_pacote|lista_editado=sim|nao   perdido-no-recriar-*.txt existe para o agente
//   R1 lista_pacote_cita_pacote=sim|nao   a lista do agente com pacote cita o nome do pacote
//   R1 de_fora_ligados=<n>                agentes de fora que seguem running na imagem anterior depois da 1ª
//   R1 voltar_fotografia_diferencas=<n>
//   R1 voltar_commit=<40 hex do DGCLAW_COMMIT depois do --voltar>
//   R1 forcar_na_versao_nova_pct=<0..100> agentes na imagem nova depois do --forcar em cada um
//   R1 forcar_com_manifesto=<n>           agentes com .dgclaw/unidades-padrao.sha256 depois do --forcar
//                                         ATENCAO: conta o EMBRULHO do podman falso gravando o manifesto, não o container
//   R1 manifesto_emulado=sim              declara o limite acima (o manifesto é emulado)
//   R1 voltar_sem_upstream=sim|nao        defeito herdado do original: depois do --voltar o clone fica sem upstream
//                                         (lib/atualizar.sh:790-792 e :863). "sim" = defeito ainda presente (registro, não falha de produto)
//   R1 versao_instalada=<DGCLAW_VERSAO depois>
//   R1 prumo_igual_dgclaw=sim|nao|na      "na" só enquanto o install.sh não cria /usr/local/bin/prumo (lote C4)
//   R1 segunda_resultado=INCOMPLETA|concluida
//   R1 segunda_de_fora=<n>
// Enquanto o C4 não estiver no candidato (detectado por `criar_atalho_prumo` no install.sh), o agente em
// created fica created e não entra na conta de "de fora"; com o C4, ele é ligado pelo install.sh novo ANTES
// do recriar e fica de fora como os outros.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

// ---- fatos fixos do plano ---------------------------------------------------------------------
const ANTERIOR = '4be8b2f7e9a5b2fa2db615479c59e7879ea1c47c';   // nossa main publicada (14/11)
const BASE_ORIGINAL = 'c38d399d2a606d97fd7c070c85f92785c8404d17'; // #123 do original, última já absorvida
const FIM_ORIGINAL = 'f4efccc32c79ef5809a4b5f73c5864c312f5c9fc';  // #129 do original
const PR12 = '1c7992d32568372e157ba88092f52fff70f50a51';          // manual de socorro, ramo docs/socorro-nao-consigo-entrar
const DEZ = [
  ['#104', '24915863bb41254e90d0c7a0a2d5a63e11366622'],
  ['#99', '93439a79771621657cb9bc46bcee894a8f5bdd54'],
  ['#63', '58513416913ff5f9528998dcaf02350171700366'],
  ['#125', '06e024ddb01a1cb354ce5f5a1e760b9e346b4a1a'],
  ['#126', '5d2e3eb7bcde9fffd8033f9133c3e19b4b531b3e'],
  ['#76', '494ecb8d05a5f1890adc1191cb5b3f20aec206f8'],
  ['#96', '90ea81d7f9263b262bf757eb1b8ebfb7f9f10db0'],
  ['#127', '28cd63ba2625bdee6fcc57d22c193b8d72d84724'],
  ['#128', '16c6b33d7ca0e85d66359bfde79d129894143a78'],
  ['#129', FIM_ORIGINAL],
];
const SO_NOSSOS = [
  'NOTICE.md', 'bin/dgclaw-sentinela', 'bin/test/dgclaw-sentinela.test.sh', 'docs/BOTAO-DE-EMERGENCIA.md',
  'docs/assets/logo-locaacao.png', 'skills/guardiao-do-sgl/SKILL.md', 'skills/guardiao-do-sgl/scripts/ler_lista.py',
  'web/public/equipe.js', 'web/test/equipe-tela.test.js', 'web/test/fixtures/papel-fifo.js', 'web/test/principal.test.js',
];
const NOSSO_REPO = 'diegohoraadm-cpu/prumo-da-locadora';

// ---- argumentos ---------------------------------------------------------------------------------
const args = process.argv.slice(2);
function opcao(nome, padrao) { const i = args.indexOf(nome); return i >= 0 && args[i + 1] ? args[i + 1] : padrao; }
const BLOCO = opcao('--bloco', '');
const COMMIT = opcao('--commit', '');
const MOSTRAR = Number(opcao('--mostrar', '15')) || 15;
const LOTE = opcao('--lote', '');   // só no F4: M1|M3|M4|M5 confere apenas os arquivos daquele lote
const BLOCOS_VALIDOS = ['F1', 'F2', 'R1', 'F4', 'tudo'];
if (!BLOCOS_VALIDOS.includes(BLOCO) || (LOTE && !['M1', 'M3', 'M4', 'M5'].includes(LOTE)) || (LOTE && BLOCO !== 'F4')) {
  if (BLOCO === 'F3') {
    console.error(`O bloco ${BLOCO} ainda não foi escrito: o Teia escreve antes do lote correspondente.`);
  } else {
    console.error('Uso: node aceite/juncao-e-marca.mjs --bloco F1|F2|R1|F4|tudo [--lote M1|M3|M4|M5 (só F4)] [--commit <rev>] [--mostrar <n>]');
  }
  process.exit(2);
}
if (BLOCO === 'F4' && COMMIT) {
  console.error('O bloco F4 lê a árvore de trabalho (usa a ferramenta scripts/marca, que lê o disco). Faça checkout do commit e rode sem --commit.');
  process.exit(2);
}

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const ALVO = COMMIT || 'HEAD';
const sha256 = (t) => createHash('sha256').update(t).digest('hex');
const git = (a, opts = {}) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, ...opts });
const gitOk = (a) => spawnSync('git', ['-C', REPO, ...a], { encoding: 'utf8' }).status === 0;

/** Conteúdo do arquivo no alvo: árvore de trabalho (padrão) ou o commit pedido. null se não existe. */
function ler(rel) {
  if (COMMIT) {
    const r = spawnSync('git', ['-C', REPO, 'show', `${COMMIT}:${rel}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return r.status === 0 ? r.stdout : null;
  }
  const p = path.join(REPO, rel);
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}
const existe = (rel) => (COMMIT ? gitOk(['cat-file', '-e', `${COMMIT}:${rel}`]) : fs.existsSync(path.join(REPO, rel)));

// ---- saída ---------------------------------------------------------------------------------------
let falhas = 0;
function criterio(ok, texto, exemplos = []) {
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${texto}`);
  if (!ok) {
    falhas++;
    for (const e of exemplos.slice(0, MOSTRAR)) console.log(`        - ${e}`);
    if (exemplos.length > MOSTRAR) console.log(`        ... e mais ${exemplos.length - MOSTRAR}`);
  }
}
function info(t) { console.log(`      ${t}`); }

// ---- exceções -----------------------------------------------------------------------------------
function lerExcecoes() {
  const bruto = ler('aceite/juncao-excecoes.json');
  if (bruto == null) return { original_ausentes: [], nossas_ausentes: [], emergencia_novas: [], erros: [] };
  let j;
  try { j = JSON.parse(bruto); } catch (e) { return { original_ausentes: [], nossas_ausentes: [], emergencia_novas: [], erros: [`aceite/juncao-excecoes.json não é JSON válido: ${e.message}`] }; }
  const erros = [];
  const lista = (k) => (Array.isArray(j[k]) ? j[k] : []).filter((x, i) => {
    const bom = x && typeof x.arquivo === 'string' && typeof x.linha === 'string' && typeof x.motivo === 'string' && x.motivo.trim().length >= 15;
    if (!bom) erros.push(`${k}[${i}] precisa de arquivo, linha e motivo com 15 caracteres ou mais`);
    return bom;
  });
  return { original_ausentes: lista('original_ausentes'), nossas_ausentes: lista('nossas_ausentes'), emergencia_novas: lista('emergencia_novas'), erros };
}
const casaExcecao = (lista, arquivo, linhaCrua) => lista.find((x) => x.arquivo === arquivo && (x.linha === '*' || x.linha === linhaCrua.trim()));

// ---- normalização de marca ----------------------------------------------------------------------
// As duas pontas passam pela mesma troca, então "DG Claw" do original e "Prumo da Locadora" nosso, ou
// o {{MARCA_NOME}} do #104, contam como a mesma linha. Só nome; nada de lógica.
// Normalização da marca, igual nos DOIS lados (linha do original e linha nossa): só mapeia nome antigo
// para nome novo, nunca apaga linha. Uma linha que sumiu continua sumida depois da normalização, então
// o F1 segue acusando linha ausente (provado por sabotagem em 17/11: ver TEIA-F4-e-despachos.md).
// As frases vêm do scripts/marca/regras.json (as mesmas que a ferramenta troca), sem a leitura de
// contexto da ferramenta: a regra é textual e não depende de zona, para não esconder diferença de código.
const FRASES_MARCA = (() => {
  let r = null;
  try { r = JSON.parse(ler('scripts/marca/regras.json') || 'null'); } catch { r = null; }
  const fr = ((r && r.frases) || []).filter((f) => f.de && typeof f.para === 'string').sort((a, b) => b.de.length - a.de.length);
  if (!fr.length) return null;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mapa = new Map(fr.map((f) => [f.de, f.para]));
  return { rx: new RegExp(`(?<![\\w])(?:${fr.map((f) => esc(f.de)).join('|')})(?![\\w])`, 'g'), mapa };
})();
function norm(l) {
  // "Suporte DG"/"suporte DG" vira "suporte" ANTES das frases: as nossas strings antigas já usavam "suporte" minúsculo.
  let t = l.trim().replace(/[Ss]uporte DG\b/g, 'suporte');
  if (FRASES_MARCA) t = t.replace(FRASES_MARCA.rx, (m) => FRASES_MARCA.mapa.get(m));
  return t
    .replace(/DGatoM\/DG-Claw|diegohoraadm-cpu\/prumo-da-locadora/g, '§REPO§')
    .replace(/\{\{MARCA_NOME\}\}|Prumo da Locadora|DG Claw/g, '§M§')
    .replace(/\b[Ss]uporte\b/g, 'suporte')
    .replace(/(?<![\w.-])\/dgclaw:([a-z][a-z0-9-]*)/g, '/$1')
    .replace(/(?<![\w/.$=-])(dgclaw|prumo)(?= (?:[a-z<.]|--))/g, '§CLI§')
    .replace(/\s+/g, ' ');
}
const trivial = (l) => norm(l).length < 4;

/** Linhas acrescentadas por arquivo num diff (sem binários, sem linhas triviais). */
function acrescentadas(de, para) {
  const saida = git(['diff', '--no-color', '--no-renames', '-U0', de, para]);
  const porArquivo = new Map();
  let atual = null;
  for (const l of saida.split('\n')) {
    if (l.startsWith('+++ ')) { atual = l === '+++ /dev/null' ? null : l.slice(6); if (atual && !porArquivo.has(atual)) porArquivo.set(atual, []); continue; }
    if (l.startsWith('Binary files')) { atual = null; continue; }
    if (atual && l.startsWith('+') && !l.startsWith('+++')) {
      const linha = l.slice(1);
      if (!trivial(linha)) porArquivo.get(atual).push(linha);
    }
  }
  return porArquivo;
}
/** Conjunto das linhas normalizadas de um arquivo num commit (ou no alvo). */
const cacheAlvo = new Map();
function linhasAlvo(rel) {
  if (!cacheAlvo.has(rel)) { const t = ler(rel); cacheAlvo.set(rel, t == null ? null : new Set(t.split('\n').map(norm))); }
  return cacheAlvo.get(rel);
}
function linhasDe(rev, rel) {
  const r = spawnSync('git', ['-C', REPO, 'show', `${rev}:${rel}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? new Set(r.stdout.split('\n').map(norm)) : new Set();
}

/** Corpo de uma função de shell (da linha "nome() {" até a primeira "}" na coluna 0). */
function funcaoShell(texto, nome) {
  if (texto == null) return null;
  const ls = texto.split('\n');
  const i = ls.findIndex((l) => l.startsWith(`${nome}() {`));
  if (i < 0) return null;
  const j = ls.findIndex((l, k) => k > i && l === '}');
  return j < 0 ? null : ls.slice(i, j + 1).map(norm).join('\n');
}

// ================================================================================================
function blocoF1() {
  console.log('\n== F1: junção dos 10 commits do original ==');
  const exc = lerExcecoes();
  criterio(exc.erros.length === 0, `aceite/juncao-excecoes.json válido (${exc.erros.length} erro(s))`, exc.erros);

  criterio(gitOk(['merge-base', '--is-ancestor', ANTERIOR, ALVO]), `o alvo descende de ${ANTERIOR.slice(0, 7)} (as instalações avançam por --ff-only)`);
  criterio(gitOk(['merge-base', '--is-ancestor', PR12, ALVO]), `o PR 12 (${PR12.slice(0, 7)}) está incluído`);
  criterio(!gitOk(['merge-base', '--is-ancestor', FIM_ORIGINAL, ALVO]), 'nenhum merge do original (o #129 não é ancestral: a junção foi por cherry-pick)');

  const corpo = git(['log', '--format=%B', `${ANTERIOR}..${ALVO}`]);
  const faltam = DEZ.filter(([, sha]) => !corpo.includes(`(cherry picked from commit ${sha})`)).map(([n, sha]) => `${n} ${sha.slice(0, 7)}`);
  criterio(faltam.length === 0, `${DEZ.length - faltam.length} de ${DEZ.length} commits do original com o rodapé "(cherry picked from commit <sha>)"`, faltam);

  // marcadores de conflito
  const g = spawnSync('git', ['-C', REPO, 'grep', '-n', '-I', '-E', '^(<<<<<<<|>>>>>>>)( |$)', ...(COMMIT ? [COMMIT] : []), '--', '.', ':!aceite/'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const marc = g.stdout.split('\n').filter(Boolean);
  criterio(marc.length === 0, `${marc.length} marcador(es) de conflito <<<<<<< ou >>>>>>> no repositório`, marc);

  // linhas do original
  const doOriginal = acrescentadas(BASE_ORIGINAL, FIM_ORIGINAL);
  let total = 0; let justificadas = 0; const ausentes = [];
  for (const [arq, linhas] of doOriginal) {
    const alvo = linhasAlvo(arq);
    for (const l of linhas) {
      total++;
      if (alvo && alvo.has(norm(l))) continue;
      if (casaExcecao(exc.original_ausentes, arq, l)) { justificadas++; continue; }
      ausentes.push(`${arq}: ${l.trim().slice(0, 140)}${alvo ? '' : '   [ARQUIVO AUSENTE]'}`);
    }
  }
  criterio(ausentes.length === 0, `linhas que o original acrescentou de #123 a #129: ${total}; ausentes sem justificativa: ${ausentes.length}; justificadas: ${justificadas}`, ausentes);

  // linhas nossas (tudo que difere de #123 em 4be8b2f)
  const nossas = acrescentadas(BASE_ORIGINAL, ANTERIOR);
  let totalN = 0; let seguiu = 0; let justN = 0; const ausN = [];
  const cacheFim = new Map(); const cacheBase = new Map();
  const de = (cache, rev, arq) => { if (!cache.has(arq)) cache.set(arq, linhasDe(rev, arq)); return cache.get(arq); };
  for (const [arq, linhas] of nossas) {
    const alvo = linhasAlvo(arq);
    for (const l of linhas) {
      totalN++;
      const n = norm(l);
      if (alvo && alvo.has(n)) continue;
      // Linha nossa que era só a troca de nome de uma linha do original, e o próprio original mudou essa
      // linha entre #123 e #129: seguir o original é o certo (regra do F1). Conta à parte, sem exceção.
      if (de(cacheBase, BASE_ORIGINAL, arq).has(n) && !de(cacheFim, FIM_ORIGINAL, arq).has(n)) { seguiu++; continue; }
      if (casaExcecao(exc.nossas_ausentes, arq, l)) { justN++; continue; }
      ausN.push(`${arq}: ${l.trim().slice(0, 140)}${alvo ? '' : '   [ARQUIVO AUSENTE]'}`);
    }
  }
  criterio(ausN.length === 0, `linhas nossas (diferença de 4be8b2f para o #123): ${totalN}; ausentes sem justificativa: ${ausN.length}; seguiram o original: ${seguiu}; justificadas: ${justN}`, ausN);

  for (const lista of ['original_ausentes', 'nossas_ausentes']) {
    for (const x of exc[lista]) info(`exceção ${lista}: ${x.arquivo} | ${x.linha.slice(0, 80)} | ${x.motivo}`);
  }

  const semNossos = SO_NOSSOS.filter((f) => !existe(f));
  criterio(semNossos.length === 0, `${SO_NOSSOS.length - semNossos.length} de ${SO_NOSSOS.length} arquivos que só existem aqui presentes`, semNossos);

  // marca de fábrica
  const mj = ler('web/marca-padrao.json');
  let nomeFab = null;
  try { nomeFab = JSON.parse(mj).nome; } catch { /* abaixo */ }
  criterio(nomeFab === 'Prumo da Locadora', `web/marca-padrao.json: nome de fábrica = ${JSON.stringify(nomeFab)}`);
  let marcaOk = false; let marcaMsg = 'web/lib/marca.js ausente ou não carregou';
  if (!COMMIT && existe('web/lib/marca.js') && existe('web/public/login.html')) {
    try {
      const req = createRequire(path.join(REPO, 'web', 'lib', 'x.js'));
      const { criarMarca } = req('./marca.js');
      const vazia = fs.mkdtempSync(path.join(os.tmpdir(), 'aceite-marca-'));
      const m = criarMarca({ dir: path.join(vazia, 'nao-existe'), padraoJson: path.join(REPO, 'web/marca-padrao.json'), padraoDir: path.join(REPO, 'web/public/ds/marca-padrao'), log: () => {} });
      const login = m.html(fs.readFileSync(path.join(REPO, 'web/public/login.html'), 'utf8'));
      const titulo = (/<title>([^<]*)<\/title>/.exec(login) || [])[1] || '';
      marcaOk = m.obter().nome === 'Prumo da Locadora' && login.includes('Prumo da Locadora') && !login.includes('DG Claw') && !login.includes('{{MARCA_');
      marcaMsg = `marca de fábrica = ${JSON.stringify(m.obter().nome)}; título do /login = ${JSON.stringify(titulo)}; "DG Claw" no /login: ${login.includes('DG Claw') ? 'sim' : 'não'}; {{MARCA_ sobrando: ${login.includes('{{MARCA_') ? 'sim' : 'não'}`;
      fs.rmSync(vazia, { recursive: true, force: true });
    } catch (e) { marcaMsg = `web/lib/marca.js não carregou: ${e.message}`; }
  } else if (COMMIT) {
    marcaMsg = 'com --commit este critério não roda (precisa carregar o módulo da árvore de trabalho)';
    marcaOk = false;
  }
  criterio(marcaOk, `/login servido com a marca de fábrica: ${marcaMsg}`);

  // ponteiros de repositório
  const pont = [
    ['scripts/checar-atualizacao.mjs', (t) => t.includes(`const REPO_PADRAO = '${NOSSO_REPO}'`)],
    ['scripts/checar-boletins.mjs', (t) => t.includes(`${NOSSO_REPO}/main/seguranca/boletins.json`) && !t.includes('DGatoM')],
    ['lib/atualizar.sh', (t) => t.includes(`git clone https://github.com/${NOSSO_REPO}`) && !t.includes('github.com/DGatoM')],
    ['web/public/manual.js', (t) => /REPO_DOCS\s*=\s*'[^']*diegohoraadm-cpu\/prumo-da-locadora/.test(t)],
  ];
  const ruins = pont.filter(([f, ok]) => { const t = ler(f); return t == null || !ok(t); }).map(([f]) => f);
  criterio(ruins.length === 0, `${pont.length - ruins.length} de ${pont.length} ponteiros de repositório no nosso`, ruins);

  // socorro x botão de emergência
  const em = ler('docs/EMERGENCIA.md');
  criterio(em != null && em.split('\n')[0] === '# EMERGÊNCIA: o agente parou ou está estranho', 'docs/EMERGENCIA.md continua o manual de socorro (1ª linha)');
  criterio(existe('docs/BOTAO-DE-EMERGENCIA.md'), 'docs/BOTAO-DE-EMERGENCIA.md existe');
  const cli = ler('bin/dgclaw') || '';
  criterio(cli.includes('Guia: docs/BOTAO-DE-EMERGENCIA.md') && !cli.includes('Guia: docs/EMERGENCIA.md'), 'ajuda do "dgclaw emergencia" aponta para BOTAO-DE-EMERGENCIA.md');
  const soc = [ler('skills/socorro/SKILL.md') || '', ler('panel/lib/socorro.js') || ''];
  criterio(soc.every((t) => t.includes('EMERGENCIA.md')), 'skill socorro e panel/lib/socorro.js carregam docs/EMERGENCIA.md');
  // Referência NOVA a EMERGENCIA.md (sem ser BOTAO-DE-) que não existia em 4be8b2f: provável botão apontando para o socorro.
  const refsAlvo = spawnSync('git', ['-C', REPO, 'grep', '-n', '-I', 'EMERGENCIA\\.md', ...(COMMIT ? [COMMIT] : []), '--', '.', ':!aceite/', ':!CHANGELOG.md'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout.split('\n').filter(Boolean);
  const antes = new Set(spawnSync('git', ['-C', REPO, 'grep', '-h', '-I', 'EMERGENCIA\\.md', ANTERIOR, '--', '.'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout.split('\n').map(norm));
  const novas = [];
  for (const r of refsAlvo) {
    const semCommit = COMMIT ? r.slice(COMMIT.length + 1) : r;
    const m = /^([^:]+):\d+:(.*)$/.exec(semCommit);
    if (!m) continue;
    const [, arq, linha] = m;
    if (/BOTAO-DE-EMERGENCIA\.md/.test(linha) && !/(^|[^-])EMERGENCIA\.md/.test(linha.replace(/BOTAO-DE-EMERGENCIA\.md/g, ''))) continue;
    if (antes.has(norm(linha))) continue;
    if (casaExcecao(exc.emergencia_novas, arq, linha)) { info(`exceção emergencia_novas: ${arq} | ${linha.trim().slice(0, 80)}`); continue; }
    novas.push(`${arq}: ${linha.trim().slice(0, 140)}`);
  }
  criterio(novas.length === 0, `${novas.length} referência(s) nova(s) a EMERGENCIA.md sem justificativa (cada uma: é socorro ou é o botão?)`, novas);

  // O código do original que decide a primeira atualização fica intocado (decisão do plano r2, AZ1).
  const nossoCli = ler('bin/dgclaw');
  const origCli = git(['show', `${FIM_ORIGINAL}:bin/dgclaw`]);
  for (const f of ['agente_recriar', 'agente_reparar', 'inventario_container', 'vida_script']) {
    const a = funcaoShell(nossoCli, f); const b = funcaoShell(origCli, f);
    criterio(a != null && a === b, `bin/dgclaw: ${f}() igual ao do original #129, nome normalizado (${a == null ? 'função não achada' : a === b ? 'igual' : 'DIFERENTE'})`);
  }
}

// ================================================================================================
/** CHANGELOG em partes: o cabeçalho (antes do 1º "## ") e uma parte por "## ", do título até o título seguinte. */
function secoesChangelog(texto) {
  const partes = new Map();
  let titulo = '(cabeçalho)';
  let corpo = [];
  for (const l of texto.split('\n')) {
    if (l.startsWith('## ')) { partes.set(titulo, corpo.join('\n')); titulo = l.trim(); corpo = []; }
    corpo.push(l);
  }
  partes.set(titulo, corpo.join('\n'));
  return partes;
}

function blocoF2() {
  console.log('\n== F2: versão própria 1.0.5 ==');
  criterio((ler('VERSION') || '').trim() === '1.0.5', `VERSION = ${(ler('VERSION') || '(não existe)').trim()} (esperado 1.0.5)`);

  const antigo = secoesChangelog(git(['show', `${ANTERIOR}:CHANGELOG.md`]));
  const novo = secoesChangelog(ler('CHANGELOG.md') || '');
  const faltam = [];
  let iguais = 0;
  for (const [titulo, texto] of antigo) {
    if (titulo === '## [Não lançado]') {
      // a seção aberta cresce a cada junção: confere linha por linha (nenhuma linha antiga pode sumir)
      const nas = new Set((novo.get(titulo) || '').split('\n'));
      const sumidas = texto.split('\n').filter((l) => l.trim() && !nas.has(l));
      if (sumidas.length === 0) iguais++; else faltam.push(`${titulo}: ${sumidas.length} linha(s) antiga(s) sumiram, a 1ª: ${sumidas[0].slice(0, 100)}`);
    } else if (novo.has(titulo) && sha256(novo.get(titulo)) === sha256(texto)) {
      iguais++;
    } else if (titulo === '(cabeçalho)' && novo.has(titulo) && sha256(novo.get(titulo)) === sha256(texto.replaceAll('DG Claw', 'Prumo da Locadora'))) {
      // Decisão 4 do PLANO-marca-M1-M5.md: o preâmbulo troca o nome. Ele não tem item "- ", então não entra no
      // digest de novidades; aceita só a troca exata do nome, nada mais. As seções "## " seguem exigindo digest idêntico.
      iguais++;
    } else {
      faltam.push(`${titulo}: ${novo.has(titulo) ? 'digest diferente (o texto mudou, até num espaço)' : 'seção ausente'}`);
    }
  }
  criterio(faltam.length === 0, `CHANGELOG: ${iguais} de ${antigo.size} partes de ${ANTERIOR.slice(0, 7)} presentes com o mesmo digest (cabeçalho e seções; [Não lançado] por linha)`, faltam);
  criterio([...novo.keys()].some((t) => t.startsWith('## [1.0.5]')), 'CHANGELOG tem a seção [1.0.5]');

  if (COMMIT) { criterio(false, 'o recado do F2 roda um teste; use sem --commit'); return; }
  const t = 'tests/aviso-atualizacao/rodar.sh';
  info(`rodando: bash ${t}`);
  const r = spawnSync('bash', [t], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 10 * 60000 });
  const saida = `${r.stdout || ''}\n${r.stderr || ''}`;
  criterio(r.status === 0, `${t} terminou com código ${r.status}`, saida.split('\n').filter((l) => /FALHOU/.test(l)).slice(0, 20));
  const exigidos = [
    '1.0.0 -> 1.0.5: o recado cita a instalada 1.0.0',
    '1.0.0 -> 1.0.5: o recado cita a publicada 1.0.5',
    '1.0.0 -> 1.0.5: o recado fala do Prumo da Locadora',
    '1.0.0 -> 1.0.5: o recado nao diz DG Claw',
    '1.0.0 -> 1.0.5: a tela mostra 1.0.0 -> 1.0.5',
  ];
  const linhas = new Set(saida.split('\n').map((l) => l.trim()));
  const ausentes = exigidos.filter((e) => !linhas.has(`ok     ${e}`));
  criterio(ausentes.length === 0, `recado 1.0.0 -> 1.0.5 sem "DG Claw": ${exigidos.length - ausentes.length} de ${exigidos.length} verificações nomeadas passaram`, ausentes);
}

// ================================================================================================
function rodarTeste(cmd, rotulo, tetoMs) {
  info(`rodando: ${cmd.join(' ')}`);
  const r = spawnSync(cmd[0], cmd.slice(1), { cwd: REPO, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: tetoMs });
  const saida = `${r.stdout || ''}\n${r.stderr || ''}`;
  const motivo = r.error ? ` (${r.error.code === 'ETIMEDOUT' ? `passou de ${tetoMs / 60000} min` : r.error.message})` : '';
  criterio(r.status === 0, `${rotulo} terminou com código ${r.status}${motivo}`, saida.split('\n').filter((l) => /FALH|erro|Error/i.test(l)).slice(-20));
  const chaves = new Map();
  for (const l of saida.split('\n')) {
    const m = /^R1 ([a-z0-9_]+)=(\S*)$/.exec(l.trim());
    if (m) chaves.set(m[1], m[2]);
  }
  return chaves;
}
function confereChaves(chaves, esperado, prefixo) {
  for (const [k, v] of Object.entries(esperado)) {
    const veio = chaves.has(k) ? chaves.get(k) : '(não impresso)';
    criterio(veio === v, `${prefixo} ${k} = ${veio} (esperado ${v})`);
  }
}

function blocoR1() {
  console.log('\n== R1: caminho "instalado em 4be8b2f -> atualizar para o candidato", em raiz falsa ==');
  if (COMMIT) { criterio(false, 'o bloco R1 roda testes; use sem --commit'); return; }
  const f = 'tests/cli/atualizar-entre-versoes.sh';
  criterio(existe(f), `${f} existe`);
  if (!existe(f)) return;
  const candidato = git(['rev-parse', 'HEAD']).trim();
  const sujo = git(['status', '--porcelain', '--untracked-files=no']).trim();
  if (sujo) info('atenção: há mudança não commitada; o teste instala o COMMIT candidato, não a árvore de trabalho');
  const blob = git(['rev-parse', `${ANTERIOR}:lib/atualizar.sh`]).trim();
  const versao = (ler('VERSION') || '').trim();
  const temPrumo = (ler('install.sh') || '').includes('criar_atalho_prumo');
  const ch = rodarTeste(['bash', f, ANTERIOR, candidato], `${f} ${ANTERIOR.slice(0, 7)} ${candidato.slice(0, 7)}`, 30 * 60000);
  const deFora = temPrumo ? '4' : '3';
  confereChaves(ch, {
    atualizar_sh_blob: blob,
    fotografia_diferencas: '0',
    casas_arquivos_apagados: '0',
    primeira_resultado: 'INCOMPLETA',
    primeira_de_fora: deFora,
    created_depois_primeira: temPrumo ? 'running' : 'created',
    aviso_c4_impresso: temPrumo ? 'sim' : 'nao',
    lista_comum: 'sim', lista_pacote: 'sim', lista_editado: 'sim',
    lista_pacote_cita_pacote: 'sim',
    de_fora_ligados: deFora,
    voltar_fotografia_diferencas: '0',
    voltar_commit: ANTERIOR,
    forcar_na_versao_nova_pct: '100',
    forcar_com_manifesto: '4',
    manifesto_emulado: 'sim',
    voltar_sem_upstream: 'sim',
    versao_instalada: versao,
    prumo_igual_dgclaw: temPrumo ? 'sim' : 'na',
    segunda_resultado: 'concluida',
    segunda_de_fora: '0',
  }, 'R1');
  info('LIMITE: o manifesto das rotinas padrão é EMULADO pelo embrulho do podman; forcar_com_manifesto=4 conta o embrulho, não o container (sem prova de hash, de ABS_CONFIG nem do que roda dentro do container).');
  info('LIMITE: a fotografia não cobre /opt/dgclaw/admin, /etc/dgclaw/marca nem home/.claude/skills das casas.');
  info('REGISTRO: voltar_sem_upstream=sim é defeito do original (--voltar deixa o clone sem upstream; o atualizar seguinte para). O teste contorna com git checkout main. Não corrigido aqui.');
}

// ================================================================================================
// F4: marca própria (plano PLANO-marca-M1-M5.md, seção "Aceite do bloco F4"). Escrito pelo Teia em
// 17/11/2026, antes dos lotes M1, M3, M4 e M5. Usa a própria ferramenta (scripts/marca/aplicar.mjs) para
// saber o que é exceção e de que lote é cada arquivo, e a mesma impressão digital do CHANGELOG
// (scripts/novidades-lib.mjs). Com --lote MX, cada critério só olha os arquivos daquele lote; sem --lote,
// o repositório inteiro (é a prova final, com os quatro lotes juntos).
const RX_NOME = /DG (Claw|Chat|Telegram|Alive)|suporte DG/i;
const RX_BARRA = /(?<![\w.-])\/dgclaw:([a-z][a-z0-9-]*|\*)?/g;

/** Linhas do CHANGELOG (índice 0-based) que podem citar a marca: item cujo digest já existia na base, ou linha fora de item idêntica a uma linha da base. */
function changelogTolerado(texto, digital) {
  const base = git(['show', `${ANTERIOR}:CHANGELOG.md`]);
  const linhasBase = new Set(base.split('\n'));
  const itens = (t) => {   // mesma regra de itensDoChangelog (novidades-lib.mjs:12-30), guardando as linhas
    const out = []; let atual = null;
    const fecha = () => { if (atual) out.push({ ...atual, texto: atual.partes.join(' ').replace(/\s+/g, ' ').trim() }); atual = null; };
    t.split(/\r?\n/).forEach((linha, i) => {
      if (/^##\s+/.test(linha) || /^#{3,}\s/.test(linha)) { fecha(); return; }
      if (/^-\s+/.test(linha)) { fecha(); atual = { linhas: [i], partes: [linha.replace(/^-\s+/, '')] }; return; }
      if (atual && /^\s+\S/.test(linha)) { atual.partes.push(linha.trim()); atual.linhas.push(i); return; }
      fecha();
    });
    fecha();
    return out;
  };
  const digBase = new Set(itens(base).map((x) => digital(x.texto)));
  const ok = new Set();
  const emItem = new Set();
  for (const it of itens(texto)) {
    for (const i of it.linhas) emItem.add(i);
    if (digBase.has(digital(it.texto))) for (const i of it.linhas) ok.add(i);
  }
  texto.split('\n').forEach((l, i) => { if (!emItem.has(i) && linhasBase.has(l)) ok.add(i); });
  return ok;
}

async function blocoF4() {
  console.log(`\n== F4: marca própria${LOTE ? ` (só o lote ${LOTE})` : ' (repositório inteiro)'} ==`);
  const M = await import(path.join(REPO, 'scripts/marca/aplicar.mjs'));
  const { digital } = await import(path.join(REPO, 'scripts/novidades-lib.mjs'));
  const regras = M.carregarRegras(path.join(REPO, 'scripts/marca/regras.json'));
  const excs = M.lerExcecoes(fs.readFileSync(path.join(REPO, 'scripts/marca/excecoes.txt'), 'utf8'));
  const doLote = (rel) => !LOTE || M.loteDe(rel, regras.lotes) === LOTE;
  const arquivos = M.listarArquivos(REPO, [], regras.ignorar).filter((r) => !r.startsWith('aceite/') && doLote(r));
  const fonte = new Map();
  for (const rel of arquivos) { const s = fs.readFileSync(path.join(REPO, rel), 'utf8'); if (!s.includes('\0')) fonte.set(rel, s); }
  const clTexto = fonte.get('CHANGELOG.md');
  const clOk = clTexto ? changelogTolerado(clTexto, digital) : new Set();
  info(`${fonte.size} arquivo(s) de texto conferido(s)`);

  // 1. Nome antigo fora de exceção. Linha protegida por trecho só vale se, tirado o trecho, não sobrar nome antigo.
  const sobra = [];
  let protegidasN = 0;
  for (const [rel, src] of fonte) {
    const linhas = src.split('\n');
    const prot = M.protegidas(excs, rel, src);
    if (prot === 'todas') continue;
    const trechos = excs.filter((e) => (e.arquivo.endsWith('/') ? rel.startsWith(e.arquivo) : e.arquivo === rel) && e.trecho !== '*' && !e.trecho.startsWith('secao:')).map((e) => e.trecho);
    const porSecao = excs.some((e) => e.arquivo === rel && e.trecho.startsWith('secao:'));
    linhas.forEach((l, i) => {
      if (!RX_NOME.test(l)) return;
      if (rel === 'CHANGELOG.md') { if (clOk.has(i)) { protegidasN++; return; } sobra.push(`${rel}:${i + 1}: ${l.trim().slice(0, 110)}`); return; }
      if (prot.has(i)) {
        let resto = l;
        for (const t of trechos) resto = resto.split(t).join(' ');
        const soPorTrecho = trechos.some((t) => l.includes(t));
        if (!soPorTrecho && porSecao) { protegidasN++; return; }   // protegida por seção inteira (ex.: mesa antiga)
        if (!RX_NOME.test(resto)) { protegidasN++; return; }
        sobra.push(`${rel}:${i + 1} (protegida, mas o nome sobra fora do trecho): ${l.trim().slice(0, 100)}`);
        return;
      }
      sobra.push(`${rel}:${i + 1}: ${l.trim().slice(0, 110)}`);
    });
  }
  criterio(sobra.length === 0, `F4.1 nome antigo (DG Claw/Chat/Telegram/Alive, suporte DG) fora de exceção: ${sobra.length} linha(s) (esperado 0; ${protegidasN} protegida(s) por exceção ou por item antigo do CHANGELOG)`, sobra);

  // 2. Crédito e licença (arquivos do M5 e de fora de lote).
  if (!LOTE || LOTE === 'M5') {
    const igualBase = (rel) => { const r = spawnSync('git', ['-C', REPO, 'show', `${ANTERIOR}:${rel}`], { encoding: 'utf8' }); return r.status === 0 && r.stdout === ler(rel); };
    criterio(igualBase('LICENSE'), 'F4.2 LICENSE igual a 4be8b2f byte a byte');
    criterio(igualBase('NOTICE.md'), 'F4.2 NOTICE.md igual a 4be8b2f byte a byte');
    const nb = git(['show', `${ANTERIOR}:NOTICE`]).split('\n');
    const na = (ler('NOTICE') || '').split('\n');
    criterio(na[0] === 'Prumo da Locadora' && na.slice(1).join('\n') === nb.slice(1).join('\n'), `F4.2 NOTICE: linha 1 = "Prumo da Locadora" (veio ${JSON.stringify(na[0])}) e o resto igual a 4be8b2f`);
    const rd = ler('README.md') || '';
    const cred = ['[DG Claw](https://github.com/DGatoM/DG-Claw), de DG Medeiros', 'sobre o DG Claw, de DG Medeiros'];
    criterio(cred.every((c) => rd.includes(c)), 'F4.2 README.md mantém os dois trechos de crédito', cred.filter((c) => !rd.includes(c)));
  }

  // 3. Exceções de lógica vivas: o trecho continua no arquivo (uma edição à mão não pode sumir com ele).
  const LOGICA_SEM_PREFIXO = new Set(['lib/comum.sh', 'seguranca/ronda/ronda.py', 'web/public/ronda-comum.js']);
  const logicas = excs.filter((e) => (/^logica:/.test(e.motivo) || LOGICA_SEM_PREFIXO.has(e.arquivo)) && !e.arquivo.endsWith('/') && doLote(e.arquivo));
  const mortas = logicas.filter((e) => { const s = ler(e.arquivo); return s === null || (e.trecho !== '*' && !e.trecho.startsWith('secao:') && !s.includes(e.trecho)); }).map((e) => `${e.arquivo}: trecho ${JSON.stringify(e.trecho)} não está no arquivo`);
  criterio(mortas.length === 0, `F4.3 exceções de lógica com o trecho presente: ${logicas.length - mortas.length} de ${logicas.length}`, mortas);

  // 4. Comando: texto ao dono diz `prumo`; o que é executado segue `dgclaw`.
  const ficaEm = (rel) => (regras.comando.fica_em || []).some((p) => rel === p || rel.startsWith(p.endsWith('/') ? p : `${p}/`));
  const textoAoDono = (rel) => /^(docs\/manual\/|templates\/|skills\/)/.test(rel) || ['docs/EMERGENCIA.md', 'README.md', 'INSTALL.md'].includes(rel);
  const sudo = [];
  for (const [rel, src] of fonte) if (textoAoDono(rel) && !ficaEm(rel)) src.split('\n').forEach((l, i) => { if (l.includes('sudo dgclaw ')) sudo.push(`${rel}:${i + 1}: ${l.trim().slice(0, 100)}`); });
  criterio(sudo.length === 0, `F4.4 "sudo dgclaw " em manual, EMERGENCIA, README, INSTALL, templates e skills (fora de comando.fica_em): ${sudo.length} (esperado 0)`, sudo);
  if (!LOTE || LOTE === 'M4') {
    const r = M.rodar({ raiz: REPO, pastas: ['bin', 'lib', 'install.sh'], dry: true, regras, excs });
    const falta = r.flatMap((a) => a.ocorrencias.filter((o) => o.regra === 'comando' && o.estado === 'troca').map((o) => `${a.rel}:${o.linha}`));
    criterio(falta.length === 0, `F4.4 comando ao dono ainda "dgclaw" em string de bin, lib e install.sh: ${falta.length} (esperado 0)`, falta);
  }
  if (!LOTE || LOTE === 'M3') {
    const fixos = ['templates/ambiente/admin.md', 'skills/criar-agente/SKILL.md'].filter((f) => !(ler(f) || '').includes('dgclaw colaborador criar'));
    criterio(fixos.length === 0, 'F4.4 o que o Admin executa segue "dgclaw colaborador criar" (templates/ambiente/admin.md e skills/criar-agente)', fixos);
  }
  if (!LOTE || LOTE === 'M1') {
    const diag = [];
    for (const [rel, src] of fonte) if (rel.startsWith('web/lib/diagnostico/')) src.split('\n').forEach((l, i) => { if (/\bprumo (agente|status|atualizar|seguranca|emergencia)\b/.test(l)) diag.push(`${rel}:${i + 1}`); });
    criterio(diag.length === 0, `F4.4 web/lib/diagnostico sem "prumo <comando>" (lista fechada de util.js:288): ${diag.length}`, diag);
  }

  // 5. Comandos com barra.
  const casca = new Set(excs.filter((e) => /dgclaw:/.test(e.trecho)).map((e) => e.arquivo));
  const barras = [];
  for (const [rel, src] of fonte) {
    if (casca.has(rel)) continue;
    src.split('\n').forEach((l, i) => {
      if (rel === 'CHANGELOG.md' && clOk.has(i)) return;
      for (const m of l.matchAll(RX_BARRA)) barras.push(`${rel}:${i + 1}: ${m[0]}`);
    });
  }
  criterio(barras.length === 0, `F4.5 "/dgclaw:" restante (mesmo em linha de exceção): ${barras.length} (esperado 0)`, barras);
  const ligadas = new Set(regras.barra.ligadas);
  const existentes = new Set(fs.readdirSync(path.join(REPO, 'skills'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name));
  // "/mesa" também é tela do Web: rota de tela (inventário do docs-em-dia) não é comando de skill.
  let telas = new Set();
  try {
    const inv = JSON.parse(execFileSync('node', [path.join(REPO, 'scripts/docs-inventario.mjs')], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    telas = new Set(inv.telas.map((t) => t.id).filter((x) => /^\/[a-z0-9-]+$/.test(x)).map((x) => x.slice(1)));
  } catch (e) { criterio(false, `F4.5 não consegui ler as telas do inventário (scripts/docs-inventario.mjs): ${e.message.slice(0, 120)}`); }
  const mortos = [];
  for (const [rel, src] of fonte) {
    if (!(rel === 'templates/CLAUDE.md.tmpl' || rel === 'templates/admin/CLAUDE.md' || /^skills\/[^/]+\/SKILL\.md$/.test(rel))) continue;
    src.split('\n').forEach((l, i) => { for (const m of l.matchAll(/(?<![\w./-])\/([a-z][a-z0-9-]*)(?![\w/.-])/g)) if (existentes.has(m[1]) && !ligadas.has(m[1]) && !telas.has(m[1])) mortos.push(`${rel}:${i + 1}: /${m[1]}`); });
  }
  criterio(mortos.length === 0, `F4.5 "/x" de skill que existe mas não é ligada, em templates e skills: ${mortos.length} (esperado 0)`, mortos);

  // 6. Idempotência e gerador.
  const pass = M.rodar({ raiz: REPO, dry: true, regras, excs, lote: LOTE }).filter((a) => a.muda && !a.rel.startsWith('aceite/'));
  criterio(pass.length === 0, `F4.6 a ferramenta ainda mudaria ${pass.length} arquivo(s)${LOTE ? ` do lote ${LOTE}` : ''} (esperado 0: troca aplicada e idempotente)`, pass.map((a) => a.rel));
  if (!LOTE || LOTE === 'M3') {
    const g = spawnSync('bash', [path.join(REPO, 'scripts/gerar-instrucoes.sh'), '--conferir'], { cwd: REPO, encoding: 'utf8' });
    criterio(g.status === 0, `F4.6 gerar-instrucoes.sh --conferir sai com 0 (saiu ${g.status})`, (g.stdout + g.stderr).split('\n').filter(Boolean));
  }

  // 7. Suíte: não roda aqui (pesada). Fica com o tests/rodar.sh parte por parte, pela caixa, contra a base.
  info('F4.7 suíte: rode as partes do lote pela caixa (bin/caixa-testes.sh) e compare com a base de 4be8b2f; este bloco não a executa.');
}

console.log(`Aceite juncao-e-marca: bloco ${BLOCO}${LOTE ? ` --lote ${LOTE}` : ''}, alvo ${COMMIT || 'árvore de trabalho'} (${git(['rev-parse', '--short', ALVO]).trim()}), repositório ${REPO}`);
if (BLOCO === 'F1' || BLOCO === 'tudo') blocoF1();
if (BLOCO === 'F2' || BLOCO === 'tudo') blocoF2();
if (BLOCO === 'R1' || BLOCO === 'tudo') blocoR1();
if (BLOCO === 'F4' || BLOCO === 'tudo') await blocoF4();
console.log(`\n${falhas === 0 ? 'ACEITE OK' : `ACEITE COM ${falhas} FALHA(S)`}`);
process.exit(falhas === 0 ? 0 : 1);

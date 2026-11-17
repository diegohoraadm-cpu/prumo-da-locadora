#!/usr/bin/env node
// aplicar.mjs: troca o nome "DG Claw" (e variantes) por "Prumo da Locadora" SO em contexto de texto.
// Node 22, sem dependencias, sem rede. Regras em regras.json, excecoes em excecoes.txt, uso em
// docs/MARCA-PROPRIA.md.
//
// Uso: node scripts/marca/aplicar.mjs [--dry] [--pasta <caminho>]... [--raiz <pasta>] [--detalhe] [--mapa]
//   sem --dry   grava os arquivos; --dry so lista (nada e escrito).
//   --pasta     so esta pasta ou arquivo (relativo a raiz; repete); e como cada lote M1..M5 roda a sua.
//   --detalhe   uma linha por ocorrencia.   --mapa  tabela em Markdown (o scripts/marca/mapa.md).
// Saida: 0 = ok. 2 = uso errado ou regra/excecao mal escrita.
//
// Como decide: cada tipo de arquivo tem um leitor que devolve as "zonas de texto" (Markdown inteiro,
// no de texto e atributos de tela do HTML, literal de string e comentario em JS/Python, argumento de
// printf/echo/falha/aviso/info/ok/passo em shell). Ocorrencia fora de zona de texto nunca e trocada:
// vira "manual". Nada depende de numero de linha.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ------------------------------------------------------------------ leitores de zona
// Cada leitor devolve [{ini, fim, modo}] (fim exclusivo). modo 'prosa' = texto lido por gente;
// 'string' = literal de codigo (um comando no INICIO dele pode ser executado, entao nao e trocado).

// Em JS e Python, a string logo depois de comparacao ou busca e logica, nao texto.
const LOGICA_JS = /(?:\.(?:includes|startsWith|endsWith|indexOf|lastIndexOf|match|split|test|replace|replaceAll)\(\s*|[!=]==?\s*|\bcase\s+)$/;
const LOGICA_PY = /(?:\.(?:startswith|endswith|find|rfind|count|index|split|replace)\(\s*|[!=]=\s*|\bin\s+)$/;

function zonasJs(src, { json = false } = {}) {
  const z = [];
  const n = src.length;
  const addStr = (ini, fim, antes) => {
    if (json && /^\s*:/.test(src.slice(fim + 1, fim + 40))) return; // chave de JSON
    z.push({ ini, fim, modo: 'string', logica: LOGICA_JS.test(antes) });
  };
  // codigo(i, aninhado): le ate o fim do arquivo ou, se aninhado (dentro de ${}), ate a } que fecha.
  function codigo(i, aninhado) {
    let prof = 0, ult = '', palavra = '';
    while (i < n) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/' && !json) { const f = src.indexOf('\n', i); const e = f < 0 ? n : f; z.push({ ini: i + 2, fim: e, modo: 'prosa' }); i = e; continue; }
      if (c === '/' && src[i + 1] === '*' && !json) { const f = src.indexOf('*/', i + 2); const e = f < 0 ? n : f; z.push({ ini: i + 2, fim: e, modo: 'prosa' }); i = e + 2; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < n && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
        addStr(i + 1, j, src.slice(Math.max(0, i - 40), i));
        i = j + 1; ult = c; continue;
      }
      if (c === '`') { i = template(i + 1); ult = '`'; continue; }
      if (c === '/' && !json) {
        const divisao = /[\w)\]]/.test(ult) && !/^(return|typeof|case|in|of|delete|void|throw|new|else|do)$/.test(palavra);
        if (!divisao) { // literal de regex: pula (nao e texto)
          let j = i + 1, classe = false;
          while (j < n && src[j] !== '\n' && (classe || src[j] !== '/')) { if (src[j] === '\\') j++; else if (src[j] === '[') classe = true; else if (src[j] === ']') classe = false; j++; }
          i = j + 1; ult = '/'; continue;
        }
      }
      if (aninhado) { if (c === '{') prof++; else if (c === '}') { if (prof === 0) return i + 1; prof--; } }
      if (/\s/.test(c)) { i++; continue; }
      if (/[\w$]/.test(c)) { palavra = /[\w$]/.test(ult) ? palavra + c : c; } else palavra = '';
      ult = c; i++;
    }
    return n;
  }
  function template(i) {
    let ini = i;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        z.push({ ini, fim: i, modo: 'string', logica: false });
        i = codigo(i + 2, true); ini = i; continue;
      }
      i++;
    }
    z.push({ ini, fim: i, modo: 'string', logica: false });
    return i + 1;
  }
  codigo(src.startsWith('#!') ? src.indexOf('\n') : 0, false);
  return z.filter((x) => x.fim > x.ini);
}

function zonasPy(src) {
  const z = [];
  const n = src.length;
  let i = src.startsWith('#!') ? src.indexOf('\n') : 0;
  while (i < n) {
    const c = src[i];
    if (c === '#') { const f = src.indexOf('\n', i); const e = f < 0 ? n : f; z.push({ ini: i + 1, fim: e, modo: 'prosa' }); i = e; continue; }
    if (c === '"' || c === "'") {
      const tri = src.startsWith(c.repeat(3), i);
      const ab = tri ? 3 : 1;
      let j = i + ab;
      while (j < n && !(tri ? src.startsWith(c.repeat(3), j) : (src[j] === c || src[j] === '\n'))) j += src[j] === '\\' ? 2 : 1;
      z.push({ ini: i + ab, fim: j, modo: 'string', logica: LOGICA_PY.test(src.slice(Math.max(0, i - 40), i)) });
      i = j + ab; continue;
    }
    i++;
  }
  return z.filter((x) => x.fim > x.ini);
}

// Shell: so e texto o que vem depois de printf/echo/falha/aviso/info/ok/passo (ate o fim do comando)
// e o corpo de `cat <<EOF` que vai para a tela. Comentario de linha inteira ou depois de espaco tambem.
function zonasSh(src, chamadas) {
  const z = [];
  const n = src.length;
  const CHAMADAS = new Set(chamadas);
  const PALAVRAS = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', '{', 'sudo', 'time']);
  let i = 0, inicio = true, chamada = -1, cmd = '';
  const heredocs = [];
  const fecha = (e) => { if (chamada >= 0 && e > chamada) z.push({ ini: chamada, fim: e, modo: 'prosa' }); chamada = -1; };
  while (i < n) {
    const c = src[i];
    if (c === '\n') {
      if (heredocs.length) {
        i++;
        for (const h of heredocs) {
          const ini = i;
          for (;;) {
            if (i >= n) break;
            const f = src.indexOf('\n', i); const e = f < 0 ? n : f;
            const linha = src.slice(i, e);
            if ((h.tab ? linha.replace(/^\t+/, '') : linha) === h.palavra) { if (h.texto) z.push({ ini, fim: i, modo: 'prosa' }); i = e + 1; break; }
            i = e + 1;
          }
        }
        heredocs.length = 0;
        fecha(i); inicio = true; continue;
      }
      if (src[i - 1] !== '\\') { fecha(i); inicio = true; }
      i++; continue;
    }
    if (c === '\\') { i += 2; continue; }
    if (c === '#' && (i === 0 || /[\s;&|()]/.test(src[i - 1])) && !(i === 0 && src[1] === '!')) {
      const f = src.indexOf('\n', i); const e = f < 0 ? n : f;
      if (chamada >= 0) { fecha(i); } else z.push({ ini: i + 1, fim: e, modo: 'prosa' });
      i = e; continue;
    }
    if (c === "'") { const f = src.indexOf("'", i + 1); i = f < 0 ? n : f + 1; if (inicio) inicio = false; continue; }
    if (c === '"') { let j = i + 1; while (j < n && src[j] !== '"') j += src[j] === '\\' ? 2 : 1; i = j + 1; if (inicio) inicio = false; continue; }
    // `cmd ... | outro` e `printf ... > arquivo` mandam o texto para um programa ou arquivo: e dado, nao tela.
    if (c === '|' && src[i + 1] !== '|' && src[i - 1] !== '|') { chamada = -1; inicio = true; i++; continue; }
    if (c === ';' || c === '|' || c === '(' || c === ')' || (c === '&' && !/[<>]/.test(src[i - 1] || ''))) { fecha(i); inicio = true; i++; continue; }
    if (c === '>') { if (src[i + 1] === '&' || src[i - 1] === '&') fecha(i); else chamada = -1; i++; continue; }
    if (c === '<') {
      const m = /^<<(-?)\s*(['"]?)([A-Za-z_]\w*)\2/.exec(src.slice(i, i + 80));
      if (m && src[i + 2] !== '<') {
        const f = src.indexOf('\n', i); const resto = src.slice(i + m[0].length, f < 0 ? n : f);
        heredocs.push({ palavra: m[3], tab: m[1] === '-', texto: cmd === 'cat' && !/[>|]/.test(resto) });
        i += m[0].length; continue;
      }
      i++; continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    let j = i;
    while (j < n && !/[\s;|&<>()'"\\#]/.test(src[j])) j++;
    if (j === i) { i++; continue; }
    const t = src.slice(i, j);
    if (inicio) {
      if (PALAVRAS.has(t) || /^[A-Za-z_]\w*=/.test(t)) { /* continua no inicio do comando */ } else {
        inicio = false; cmd = t;
        if (CHAMADAS.has(t)) chamada = j;
      }
    }
    i = j;
  }
  fecha(n);
  return z;
}

// HTML: no de texto e atributos de tela (title, alt, placeholder, aria-label). <script> vira JS.
function zonasHtml(src) {
  const z = [];
  const n = src.length;
  const ATRIBUTOS = /\b(?:title|alt|placeholder|aria-label)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let i = 0;
  while (i < n) {
    if (src.startsWith('<!--', i)) { const f = src.indexOf('-->', i + 4); const e = f < 0 ? n : f; z.push({ ini: i + 4, fim: e, modo: 'prosa' }); i = e + 3; continue; }
    if (src[i] === '<' && /[A-Za-z/!]/.test(src[i + 1] || '')) {
      const f = src.indexOf('>', i); const e = f < 0 ? n : f;
      const tag = src.slice(i, e);
      for (const m of tag.matchAll(ATRIBUTOS)) {
        const ini = i + m.index + m[0].indexOf(m[1] !== undefined ? m[1] : m[2], m[0].indexOf('=')) ;
        z.push({ ini, fim: ini + (m[1] ?? m[2]).length, modo: 'prosa' });
      }
      const nome = /^<([A-Za-z0-9]+)/.exec(tag)?.[1]?.toLowerCase();
      i = e + 1;
      if (nome === 'script' || nome === 'style') {
        const fim = src.toLowerCase().indexOf(`</${nome}`, i);
        const e2 = fim < 0 ? n : fim;
        if (nome === 'script' && !/type\s*=\s*["'](?!module|text\/javascript)/i.test(tag)) {
          for (const x of zonasJs(src.slice(i, e2))) z.push({ ...x, ini: x.ini + i, fim: x.fim + i });
        }
        i = e2;
      }
      continue;
    }
    const f = src.indexOf('<', i + 1);
    const e = f < 0 ? n : f;
    z.push({ ini: i, fim: e, modo: 'prosa' });
    i = e;
  }
  return z;
}

// Unidades do systemd: so o texto depois de Description=.
function zonasIni(src) {
  const z = [];
  for (const m of src.matchAll(/^Description=(.*)$/gm)) z.push({ ini: m.index + 12, fim: m.index + m[0].length, modo: 'prosa' });
  return z;
}

const TUDO = (src) => [{ ini: 0, fim: src.length, modo: 'prosa' }];

export function tipoDe(rel, src) {
  const ext = path.extname(rel).toLowerCase();
  if (['.md', '.tmpl'].includes(ext)) return 'md';
  if (ext === '.html') return 'html';
  if (['.js', '.mjs', '.cjs', '.ts'].includes(ext)) return 'js';
  if (ext === '.json') return 'json';
  if (ext === '.py') return 'py';
  if (ext === '.sh') return 'sh';
  if (['.service', '.path', '.timer'].includes(ext)) return 'ini';
  if (ext === '') {
    const l1 = src.slice(0, src.indexOf('\n') < 0 ? 80 : src.indexOf('\n'));
    if (/^#!.*\b(ba)?sh\b/.test(l1)) return 'sh';
    if (/^#!.*\bpython/.test(l1)) return 'py';
    if (/^#!.*\bnode\b/.test(l1)) return 'js';
  }
  return 'outro';
}

function zonasDe(tipo, src, regras) {
  switch (tipo) {
    case 'md': return TUDO(src);
    case 'html': return zonasHtml(src);
    case 'js': return zonasJs(src);
    case 'json': return zonasJs(src, { json: true });
    case 'py': return zonasPy(src);
    case 'sh': return zonasSh(src, regras.shell_chamadas);
    case 'ini': return zonasIni(src);
    default: return [];
  }
}

// ------------------------------------------------------------------ regras e excecoes
export function carregarRegras(arq = path.join(AQUI, 'regras.json')) {
  const r = JSON.parse(fs.readFileSync(arq, 'utf8'));
  for (const k of ['frases', 'comando', 'barra', 'shell_chamadas', 'lotes']) if (!r[k]) throw new Error(`regras.json sem "${k}"`);
  return r;
}

export function lerExcecoes(texto) {
  const out = [];
  texto.split('\n').forEach((linha, i) => {
    if (!linha.trim() || linha.trim().startsWith('#')) return;
    const [arquivo, trecho, ...resto] = linha.split('\t');
    const motivo = resto.join(' ').trim();
    if (!arquivo || !trecho || !motivo) throw new Error(`excecoes.txt linha ${i + 1}: use arquivo<TAB>trecho<TAB>motivo (o motivo e obrigatorio).`);
    out.push({ arquivo: arquivo.trim(), trecho, motivo });
  });
  return out;
}

const casaArquivo = (e, rel) => (e.arquivo.endsWith('/') ? rel.startsWith(e.arquivo) : e.arquivo === rel);

// Linhas protegidas por excecao no arquivo: Set de indices de linha (0-based) ou 'todas'.
function protegidas(excs, rel, src) {
  const minhas = excs.filter((e) => casaArquivo(e, rel));
  if (minhas.some((e) => e.trecho === '*')) return 'todas';
  const linhas = src.split('\n');
  const set = new Set();
  for (const e of minhas) {
    if (e.trecho.startsWith('secao:')) {
      const rx = new RegExp(e.trecho.slice(6));
      let dentro = false;
      linhas.forEach((l, i) => { if (/^## /.test(l)) dentro = rx.test(l); if (dentro) set.add(i); });
    } else linhas.forEach((l, i) => { if (l.includes(e.trecho)) set.add(i); });
  }
  return set;
}

// ------------------------------------------------------------------ analise de um arquivo
// Devolve {novo, ocorrencias:[{linha, regra, de, para, estado, motivo}]}. estado: troca | excecao | manual.
export function analisar(rel, src, ctx) {
  const { regras, excs, skillsExistentes } = ctx;
  const tipo = tipoDe(rel, src);
  const zonas = zonasDe(tipo, src, regras);
  const prot = protegidas(excs, rel, src);
  const linhaDe = (pos) => src.slice(0, pos).split('\n').length - 1;
  const zonaDe = (pos) => zonas.find((x) => pos >= x.ini && pos < x.fim);
  const cands = [];

  for (const f of regras.frases) for (const m of src.matchAll(new RegExp(`(?<![\\w])${esc(f.de)}(?![\\w])`, 'g'))) cands.push({ pos: m.index, len: m[0].length, regra: f.variante ? 'variante' : 'frase', de: m[0], para: f.para });

  const cmd = regras.comando;
  const subs = cmd.subcomandos.map(esc).join('|');
  const rxCmd = new RegExp(`(?<![\\w/.\\-=$])${esc(cmd.de)}(?= (?:${subs})(?![\\w-])| --[a-z])`, 'g');
  for (const m of src.matchAll(rxCmd)) cands.push({ pos: m.index, len: m[0].length, regra: 'comando', de: m[0], para: cmd.para });

  const ligadas = new Set(regras.barra.ligadas);
  for (const m of src.matchAll(new RegExp(`${esc(regras.barra.prefixo)}([a-z][a-z0-9-]*|\\*)?`, 'g'))) {
    const nome = m[1] || '';
    const sk = nome && skillsExistentes.has(nome);
    const aqui = { pos: m.index, len: m[0].length, regra: 'barra', de: m[0], para: null, nome };
    if (ligadas.has(nome)) aqui.para = `/${nome}`;
    else aqui.manual = !nome || nome === '*' || nome === 'x' ? 'barra-generica' : sk ? 'barra-nao-ligada' : 'barra-inexistente';
    cands.push(aqui);
  }

  cands.sort((a, b) => a.pos - b.pos || b.len - a.len);
  const ocorrencias = [];
  const trocas = [];
  let fimAnterior = -1;
  for (const c of cands) {
    if (c.pos < fimAnterior) continue; // sobreposta a outra regra
    fimAnterior = c.pos + c.len;
    const linha = linhaDe(c.pos);
    const o = { linha: linha + 1, regra: c.regra, de: c.de, para: c.para, estado: 'troca', motivo: '' };
    const zona = zonaDe(c.pos);
    if (prot === 'todas' || (prot !== 'todas' && prot.has(linha))) { o.estado = 'excecao'; }
    else if (tipo === 'outro') { o.estado = 'manual'; o.motivo = 'tipo-nao-coberto'; }
    else if (!zona) { if (c.regra !== 'comando') { o.estado = 'manual'; o.motivo = 'fora-de-contexto'; } else continue; } // comando em codigo e invocacao de verdade
    else if (zona.logica) { o.estado = 'manual'; o.motivo = 'comparacao-de-logica'; }
    else if (c.manual) { o.estado = 'manual'; o.motivo = c.manual; }
    else if (c.regra === 'comando' && zona.modo === 'string' && c.pos === zona.ini) { o.estado = 'manual'; o.motivo = 'comando-no-inicio-de-string'; }
    if (o.estado === 'troca') trocas.push(c);
    ocorrencias.push(o);
  }

  let novo = '';
  let p = 0;
  for (const t of trocas) { novo += src.slice(p, t.pos) + t.para; p = t.pos + t.len; }
  novo += src.slice(p);
  return { tipo, novo, ocorrencias };
}

// ------------------------------------------------------------------ varredura do repositorio
const IGNORAR_DIR = new Set(['.git', 'node_modules', 'dist']);
const BINARIO = /\.(png|jpe?g|gif|ico|webp|pdf|woff2?|ttf|zip|gz|lock|wasm|svg)$/i;

export function listarArquivos(raiz, pastas) {
  let rels;
  try { rels = execFileSync('git', ['-C', raiz, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean); } catch { rels = null; }
  if (!rels) { // pasta que nao e repositorio git (testes): anda na arvore
    rels = [];
    const anda = (d) => { for (const e of fs.readdirSync(path.join(raiz, d), { withFileTypes: true })) { if (e.isDirectory()) { if (!IGNORAR_DIR.has(e.name)) anda(path.join(d, e.name)); } else rels.push(path.join(d, e.name)); } };
    anda('');
  }
  rels = rels.filter((r) => !BINARIO.test(r) && fs.existsSync(path.join(raiz, r)) && fs.lstatSync(path.join(raiz, r)).isFile());
  if (pastas?.length) rels = rels.filter((r) => pastas.some((p) => r === p || r.startsWith(p.endsWith('/') ? p : `${p}/`)));
  return rels.sort();
}

export function loteDe(rel, lotes) {
  for (const [nome, prefixos] of Object.entries(lotes)) if (prefixos.some((p) => rel === p || rel.startsWith(p.endsWith('/') ? p : `${p}/`) || (p.endsWith('*') && rel.startsWith(p.slice(0, -1))))) return nome;
  return 'sem-lote';
}

export function rodar({ raiz, pastas = [], dry = true, regras, excs }) {
  const skillsDir = path.join(raiz, 'skills');
  const skillsExistentes = new Set(fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []);
  const arquivos = [];
  for (const rel of listarArquivos(raiz, pastas)) {
    const src = fs.readFileSync(path.join(raiz, rel), 'utf8');
    if (src.includes('\0')) continue;
    const r = analisar(rel, src, { regras, excs, skillsExistentes });
    if (!r.ocorrencias.length) continue;
    const muda = r.novo !== src;
    if (muda && !dry) fs.writeFileSync(path.join(raiz, rel), r.novo);
    arquivos.push({ rel, tipo: r.tipo, lote: loteDe(rel, regras.lotes), muda, ocorrencias: r.ocorrencias });
  }
  return arquivos;
}

// ------------------------------------------------------------------ relatorios
const conta = (arqs, f) => arqs.reduce((s, a) => s + a.ocorrencias.filter(f).length, 0);

export function resumo(arqs) {
  const lotes = [...new Set(arqs.map((a) => a.lote))].sort();
  const linhas = [];
  for (const l of lotes) {
    const a = arqs.filter((x) => x.lote === l);
    linhas.push({
      lote: l,
      arquivos: a.filter((x) => x.muda).length,
      trocaria: conta(a, (o) => o.estado === 'troca'),
      excecao: conta(a, (o) => o.estado === 'excecao'),
      manual: conta(a, (o) => o.estado === 'manual'),
    });
  }
  return linhas;
}

const TESTE = /(^|\/)(tests?|test-[^/]*|[^/]*\.test\.[a-z]+|test_[^/]*|[^/]*-test\.[a-z]+)(\/|$)|^qa\/|^aceite\//;
export const ehTeste = (rel) => TESTE.test(rel);

export function mapaMarkdown(arqs, regras) {
  const out = [];
  const r = resumo(arqs);
  out.push('# Mapa da marca (saida do `aplicar.mjs --dry`)', '', 'Gerado sem escrever nada. Ocorrencia = um achado da regra; "troca" so acontece em contexto de texto.', '');
  out.push('## 1. Contagem por lote', '', '| Lote | Arquivos que mudam | Trocaria | Fica por excecao | Pede decisao ou reescrita manual |', '| --- | ---: | ---: | ---: | ---: |');
  for (const l of r) out.push(`| ${l.lote} | ${l.arquivos} | ${l.trocaria} | ${l.excecao} | ${l.manual} |`);
  const tot = r.reduce((s, l) => ({ a: s.a + l.arquivos, t: s.t + l.trocaria, e: s.e + l.excecao, m: s.m + l.manual }), { a: 0, t: 0, e: 0, m: 0 });
  out.push(`| **total** | ${tot.a} | ${tot.t} | ${tot.e} | ${tot.m} |`, '');
  out.push('Por regra (todos os lotes):', '');
  const regs = [...new Set(arqs.flatMap((a) => a.ocorrencias.map((o) => o.regra)))].sort();
  out.push('| Regra | Trocaria | Excecao | Manual |', '| --- | ---: | ---: | ---: |');
  for (const g of regs) out.push(`| ${g} | ${conta(arqs, (o) => o.regra === g && o.estado === 'troca')} | ${conta(arqs, (o) => o.regra === g && o.estado === 'excecao')} | ${conta(arqs, (o) => o.regra === g && o.estado === 'manual')} |`);
  out.push('', 'Manual, por motivo:', '', '| Motivo | Ocorrencias |', '| --- | ---: |');
  const motivos = [...new Set(arqs.flatMap((a) => a.ocorrencias.filter((o) => o.estado === 'manual').map((o) => o.motivo)))].sort();
  for (const m of motivos) out.push(`| ${m} | ${conta(arqs, (o) => o.estado === 'manual' && o.motivo === m)} |`);

  const sem = arqs.filter((a) => a.lote === 'sem-lote');
  out.push('', 'Arquivos sem lote no plano (o Teia atribui a um lote):', '', '| Arquivo | Trocaria | Excecao | Manual |', '| --- | ---: | ---: | ---: |');
  for (const a of sem) out.push(`| ${a.rel} | ${a.ocorrencias.filter((o) => o.estado === 'troca').length} | ${a.ocorrencias.filter((o) => o.estado === 'excecao').length} | ${a.ocorrencias.filter((o) => o.estado === 'manual').length} |`);
  out.push('', '## 2. Ocorrencias de `/dgclaw:` (decisao de cada uma)', '', 'Regra do plano: skill ligada vira `/x`; skill que existe mas nao e ligada, reescrever a frase a mao; inexistente, a frase sai.', '');
  out.push('| Arquivo | Ocorrencia | Lote | Decisao |', '| --- | --- | --- | --- |');
  let nBarras = 0;
  const arqBarra = new Set();
  const DEC = { 'barra-nao-ligada': 'reescrever a mao (skill existe, nao e ligada ao agente)', 'barra-inexistente': 'sair (a skill nao existe)', 'barra-generica': 'reescrever a mao (nome generico ou placeholder)', 'fora-de-contexto': 'revisar (fora de texto)', 'comparacao-de-logica': 'revisar (comparacao de logica)', 'tipo-nao-coberto': 'revisar (tipo de arquivo sem leitor)' };
  for (const a of arqs) for (const o of a.ocorrencias.filter((x) => x.regra === 'barra')) {
    nBarras++; arqBarra.add(a.rel);
    const dec = o.estado === 'troca' ? `trocar por \`${o.para}\` (mecanico)` : o.estado === 'excecao' ? 'fica por excecao' : DEC[o.motivo] || o.motivo;
    out.push(`| ${a.rel} | \`${o.de}\` (linha ${o.linha}) | ${a.lote} | ${dec} |`);
  }
  out.push('', `Total: ${nBarras} ocorrencias em ${arqBarra.size} arquivos.`);

  out.push('', '## 3. Testes que citam a marca como texto esperado', '', 'Estes mudam junto com o texto. Linhas = linhas com alguma ocorrencia.', '', '| Arquivo | Linhas | Trocaria | Manual |', '| --- | ---: | ---: | ---: |');
  const ts = arqs.filter((a) => ehTeste(a.rel));
  let nl = 0;
  for (const a of ts) {
    const ls = new Set(a.ocorrencias.map((o) => o.linha)); nl += ls.size;
    out.push(`| ${a.rel} | ${ls.size} | ${a.ocorrencias.filter((o) => o.estado === 'troca').length} | ${a.ocorrencias.filter((o) => o.estado === 'manual').length} |`);
  }
  out.push('', `Total: ${nl} linhas em ${ts.length} arquivos de teste.`);

  out.push('', '## 4. Pede decisao humana (nao trocado), por arquivo', '', '| Arquivo | Lote | Motivo | Linha | Trecho |', '| --- | --- | --- | ---: | --- |');
  for (const a of arqs) for (const o of a.ocorrencias.filter((x) => x.estado === 'manual' && x.regra !== 'barra')) out.push(`| ${a.rel} | ${a.lote} | ${o.motivo} | ${o.linha} | \`${o.de}\` |`);
  void regras;
  return `${out.join('\n')}\n`;
}

// ------------------------------------------------------------------ linha de comando
function main() {
  const args = process.argv.slice(2);
  const tem = (f) => args.includes(f);
  const valores = (f) => args.flatMap((a, i) => (a === f && args[i + 1] ? [args[i + 1]] : []));
  const desconhecido = args.filter((a) => a.startsWith('--') && !['--dry', '--detalhe', '--mapa', '--pasta', '--raiz', '--regras', '--excecoes'].includes(a));
  if (desconhecido.length) { console.error(`opcao desconhecida: ${desconhecido.join(' ')}. Uso: aplicar.mjs [--dry] [--pasta <caminho>]... [--raiz <pasta>] [--detalhe] [--mapa]`); process.exit(2); }
  const raiz = path.resolve(valores('--raiz')[0] || path.join(AQUI, '..', '..'));
  let regras, excs;
  try {
    regras = carregarRegras(valores('--regras')[0]);
    excs = lerExcecoes(fs.readFileSync(valores('--excecoes')[0] || path.join(AQUI, 'excecoes.txt'), 'utf8'));
  } catch (e) { console.error(`aplicar: ${e.message}`); process.exit(2); }
  const dry = tem('--dry') || tem('--mapa');
  const arqs = rodar({ raiz, pastas: valores('--pasta'), dry, regras, excs });
  if (tem('--mapa')) { process.stdout.write(mapaMarkdown(arqs, regras)); return; }
  if (tem('--detalhe')) for (const a of arqs) for (const o of a.ocorrencias) console.log(`${o.estado}\t${a.rel}:${o.linha}\t${o.regra}\t${o.de}${o.para ? ` -> ${o.para}` : ''}${o.motivo ? `\t${o.motivo}` : ''}`);
  const r = resumo(arqs);
  console.log(`${dry ? '[dry] nada foi escrito. ' : ''}lote | arquivos que mudam | trocaria | excecao | manual`);
  for (const l of r) console.log(`${l.lote} | ${l.arquivos} | ${l.trocaria} | ${l.excecao} | ${l.manual}`);
  const mudam = arqs.filter((a) => a.muda).length;
  console.log(`${dry ? 'mudariam' : 'mudaram'} ${mudam} arquivo(s)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

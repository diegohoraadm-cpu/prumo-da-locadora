// Testes do scripts/marca/aplicar.mjs. Rodar: node --test scripts/marca/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analisar, carregarRegras, lerExcecoes, rodar, loteDe, listarArquivos } from './aplicar.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const regras = carregarRegras();
const skillsExistentes = new Set(['agenda', 'doctor', 'cards']);
const ctx = (excs = '') => ({ regras, excs: lerExcecoes(excs), skillsExistentes });
const aplica = (rel, src, excs) => analisar(rel, src, ctx(excs));
const estados = (r) => r.ocorrencias.map((o) => `${o.estado}${o.motivo ? `:${o.motivo}` : ''}`);

test('JS: troca a string e deixa o identificador vizinho, na mesma linha', () => {
  const src = "const dgclaw_dir = '/etc/dgclaw'; const msg = 'O DG Claw iniciou em ' + process.env.DGCLAW_HOME; // DG Claw\n";
  const r = aplica('web/lib/a.js', src);
  assert.equal(r.novo, "const dgclaw_dir = '/etc/dgclaw'; const msg = 'O Prumo da Locadora iniciou em ' + process.env.DGCLAW_HOME; // Prumo da Locadora\n");
});

test('JS: comparacao, regex e comando no inicio de string nao sao trocados', () => {
  const src = [
    "if (o.startsWith('DG Claw')) x();",
    "if (nome === 'DG Claw') y();",
    "const rx = /^DG Claw\\s+/;",
    "execSync('dgclaw agente listar');",
    "const dica = 'Rode: sudo dgclaw atualizar';",
    'const t = `O DG Claw de ${nome} esta ligado`;',
  ].join('\n');
  const r = aplica('web/lib/b.js', src);
  assert.deepEqual(estados(r), ['manual:comparacao-de-logica', 'manual:comparacao-de-logica', 'manual:fora-de-contexto', 'manual:comando-no-inicio-de-string', 'troca', 'troca']);
  assert.match(r.novo, /startsWith\('DG Claw'\)/);
  assert.match(r.novo, /execSync\('dgclaw agente listar'\)/);
  assert.match(r.novo, /Rode: sudo prumo atualizar/);
  assert.match(r.novo, /O Prumo da Locadora de \$\{nome\}/);
});

test('JS: aspa dentro de regex nao confunde o leitor', () => {
  const r = aplica('a.js', "const q = /'/g; const s = 'DG Claw';\n");
  assert.equal(r.novo, "const q = /'/g; const s = 'Prumo da Locadora';\n");
});

test('shell: printf, falha e aviso trocam; grep, caminho, variavel e servico nao', () => {
  const src = [
    '#!/usr/bin/env bash',
    '# DG Claw: cabecalho do script',
    'DG_DIR=/etc/dgclaw',
    'printf \'O DG Claw esta pronto. Rode: sudo dgclaw atualizar\\n\'',
    '[ -f "$x" ] || falha "o DG Claw nao achou $DG_DIR/dgclaw.env" \\',
    '    "rode: dgclaw agente listar"',
    'grep -q "DG Claw" "$arq"',
    'systemctl restart dgclaw-web.service',
    'printf \'# DG Claw\\n\' > "$cf"',
    'echo "DG Claw" | tee "$cf"',
    'aviso "veja /var/lib/dgclaw e DGCLAW_PORTA" 2>&1',
  ].join('\n');
  const r = aplica('lib/x.sh', src);
  const linhas = r.novo.split('\n');
  assert.equal(linhas[1], '# Prumo da Locadora: cabecalho do script');
  assert.equal(linhas[2], 'DG_DIR=/etc/dgclaw');
  assert.equal(linhas[3], "printf 'O Prumo da Locadora esta pronto. Rode: sudo prumo atualizar\\n'");
  assert.equal(linhas[4], '[ -f "$x" ] || falha "o Prumo da Locadora nao achou $DG_DIR/dgclaw.env" \\');
  assert.equal(linhas[5], '    "rode: prumo agente listar"');
  assert.equal(linhas[6], 'grep -q "DG Claw" "$arq"');
  assert.equal(linhas[7], 'systemctl restart dgclaw-web.service');
  assert.equal(linhas[8], "printf '# DG Claw\\n' > \"$cf\"");
  assert.equal(linhas[9], 'echo "DG Claw" | tee "$cf"');
  assert.equal(linhas[10], 'aviso "veja /var/lib/dgclaw e DGCLAW_PORTA" 2>&1');
  assert.deepEqual(r.ocorrencias.filter((o) => o.motivo === 'fora-de-contexto').length, 3);
});

test('shell: cat <<EOF para a tela troca; para arquivo nao', () => {
  const src = 'cat <<EOF\nUso: dgclaw agente criar (DG Claw)\nEOF\ncat > "$f" <<EOF\n# DG Claw\nEOF\n';
  const r = aplica('bin/x.sh', src);
  assert.equal(r.novo, 'cat <<EOF\nUso: prumo agente criar (Prumo da Locadora)\nEOF\ncat > "$f" <<EOF\n# DG Claw\nEOF\n');
});

test('HTML: no de texto e atributo de tela trocam; href, class, id e script de codigo nao', () => {
  const src = [
    '<title>DG Claw</title>',
    '<a class="dgclaw-link" id="dgclaw" href="/dgclaw/x" title="Abrir o DG Claw">Entrar no DG Claw</a>',
    '<p>Rode <code>sudo dgclaw atualizar</code> no servidor.</p>',
    "<script>const dgclaw = 1; const t = 'DG Claw'; localStorage.setItem('dgclaw_tema', 'x');</script>",
  ].join('\n');
  const r = aplica('web/public/a.html', src);
  const l = r.novo.split('\n');
  assert.equal(l[0], '<title>Prumo da Locadora</title>');
  assert.equal(l[1], '<a class="dgclaw-link" id="dgclaw" href="/dgclaw/x" title="Abrir o Prumo da Locadora">Entrar no Prumo da Locadora</a>');
  assert.equal(l[2], '<p>Rode <code>sudo prumo atualizar</code> no servidor.</p>');
  assert.equal(l[3], "<script>const dgclaw = 1; const t = 'Prumo da Locadora'; localStorage.setItem('dgclaw_tema', 'x');</script>");
});

test('Markdown: prosa e bloco de codigo trocam; caminho, servico e variavel nao', () => {
  const src = [
    '# DG Claw',
    'Instale o DG Claw e rode `sudo dgclaw atualizar`.',
    '```bash',
    'sudo dgclaw agente listar',
    'cat /etc/dgclaw/dgclaw.env   # DGCLAW_PORTA do DG Claw',
    'systemctl status dgclaw-web.service dgclaw-agente',
    '```',
  ].join('\n');
  const r = aplica('docs/a.md', src);
  assert.equal(r.novo, [
    '# Prumo da Locadora',
    'Instale o Prumo da Locadora e rode `sudo prumo atualizar`.',
    '```bash',
    'sudo prumo agente listar',
    'cat /etc/dgclaw/dgclaw.env   # DGCLAW_PORTA do Prumo da Locadora',
    'systemctl status dgclaw-web.service dgclaw-agente',
    '```',
  ].join('\n'));
});

test('Markdown: "dgclaw" que nao e comando (usuario, pasta) fica', () => {
  const r = aplica('docs/b.md', 'O usuario dgclaw e dono de /var/lib/dgclaw. O dgclaw tem permissao. Veja `dgclaw-agente canal status`.\n');
  assert.equal(r.novo, 'O usuario dgclaw e dono de /var/lib/dgclaw. O dgclaw tem permissao. Veja `dgclaw-agente canal status`.\n');
  assert.equal(r.ocorrencias.length, 0);
});

test('Python: docstring e comentario trocam; a string de comparacao nao', () => {
  const src = '"""Ronda do DG Claw."""\n# o DG Claw\nif onde.startswith("DG Claw"):\n    print("saiu do DG Claw")\n';
  const r = aplica('seguranca/x.py', src);
  assert.equal(r.novo, '"""Ronda do Prumo da Locadora."""\n# o Prumo da Locadora\nif onde.startswith("DG Claw"):\n    print("saiu do Prumo da Locadora")\n');
});

test('barras: ligada vira /x; nao ligada e inexistente ficam para a mao', () => {
  const r = aplica('docs/c.md', 'Use /dgclaw:agenda, /dgclaw:doctor, /dgclaw:setup e /dgclaw:*.\n');
  assert.equal(r.novo, 'Use /agenda, /dgclaw:doctor, /dgclaw:setup e /dgclaw:*.\n');
  assert.deepEqual(estados(r), ['troca', 'manual:barra-nao-ligada', 'manual:barra-inexistente', 'manual:barra-generica']);
});

test('DG Chat e DG Alive viram descricao; "DG Telegram" nao tem regra (vai para a mao)', () => {
  const r = aplica('docs/d.md', 'Chat do painel (DG Chat). Pelo canal DG Chat, do DG Chat e sem o DG Alive; com a extensão DG Alive. Chame o suporte DG. O DG Telegram.\n');
  assert.equal(r.novo, 'Chat do painel. Pelo canal do chat do painel, do chat do painel e sem a extensão de emoções; com a extensão de emoções. Chame o suporte. O DG Telegram.\n');
  assert.deepEqual(estados(r).slice(-1), ['manual:sem-regra']);
  assert.doesNotMatch(r.novo, /Prumo (Chat|Alive|Telegram)/);
});

test('barra: bin/dgclaw:5 e bin/README "bin/dgclaw: a linha" nao sao /dgclaw:', () => {
  const r = aplica('docs/e.md', 'Veja bin/dgclaw:5 e bin/dgclaw: a linha de comando. Use /dgclaw:agenda.\n');
  assert.equal(r.novo, 'Veja bin/dgclaw:5 e bin/dgclaw: a linha de comando. Use /agenda.\n');
  assert.equal(r.ocorrencias.length, 1);
});

test('"DG Claw Lite" fica por excecao; die troca; comando do Admin nao troca (fica_em)', () => {
  const excs = 'skills/importar/SKILL.md\tDG Claw Lite\toutro produto\n';
  assert.equal(aplica('skills/importar/SKILL.md', 'versao DG Claw Lite\n', excs).novo, 'versao DG Claw Lite\n');
  const sh = aplica('bin/x', '#!/usr/bin/env bash\ndie "o DG Claw caiu"\nW "rode dgclaw agente listar"\nI "o DG Alive esta ligado"\n');
  assert.equal(sh.novo, '#!/usr/bin/env bash\ndie "o Prumo da Locadora caiu"\nW "rode prumo agente listar"\nI "a extensão de emoções esta ligado"\n');
  const adm = aplica('skills/criar-agente/SKILL.md', 'Rode `sudo dgclaw colaborador criar` no DG Claw.\n');
  assert.equal(adm.novo, 'Rode `sudo dgclaw colaborador criar` no Prumo da Locadora.\n');
  assert.equal(aplica('templates/ambiente/admin.md', 'rode dgclaw colaborador criar\n').ocorrencias.length, 0);
});

test('NOTICE: o titulo muda, a afirmacao do autor original e o resto ficam', () => {
  const excs = 'NOTICE\tcódigo do DG Claw foi escrito do zero\tafirmacao do autor original\n';
  const r = aplica('NOTICE', 'DG Claw\n\nO código do DG Claw foi escrito do zero para este projeto.\n', excs);
  assert.equal(r.novo, 'Prumo da Locadora\n\nO código do DG Claw foi escrito do zero para este projeto.\n');
});

test('lotes: cada arquivo tem um dono so (--lote nao se cruza)', () => {
  const d = (rel) => loteDe(rel, regras.lotes);
  assert.equal(d('tests/ambiente/rodar.sh'), 'M4');
  assert.equal(d('scripts/gerar-instrucoes.sh'), 'M3');
  assert.equal(d('scripts/doctor.sh'), 'M4');
  assert.equal(d('tests/instrucoes/rodar.sh'), 'M3');
  assert.equal(d('tests/docs-em-dia/checar.mjs'), 'M5');
  assert.equal(d('powers/crm/POWER.md'), 'M3');
  assert.equal(d('panel/rotas/nucleo.js'), 'M1');
  assert.equal(d('web/bin/cofre.js'), 'M4');
  assert.equal(d('web/docs/MODO-FOCO.md'), 'M5');
  assert.equal(d('NOTICE'), 'M5');
  assert.equal(d('NOTICE.md'), 'sem-lote');
  const repo = path.join(AQUI, '..', '..');
  const todos = listarArquivos(repo, [], regras.ignorar);
  const semDono = todos.filter((r) => d(r) === 'sem-lote' && !r.startsWith('aceite/') && r !== 'NOTICE.md' && r !== 'LICENSE');
  const comOcorrencia = rodar({ raiz: repo, regras, excs: lerExcecoes(fs.readFileSync(path.join(AQUI, 'excecoes.txt'), 'utf8')) }).filter((a) => a.lote === 'sem-lote').map((a) => a.rel);
  assert.deepEqual(comOcorrencia.filter((r) => !r.startsWith('aceite/') && r !== 'NOTICE.md'), []);
  void semDono;
});

test('--lote M3 nao lista tests/ambiente/rodar.sh e M4 sim', () => {
  const d = arvore({ 'tests/ambiente/rodar.sh': 'echo "DG Claw"\n', 'templates/a.md': 'DG Claw\n' });
  const excs = lerExcecoes('');
  assert.deepEqual(rodar({ raiz: d, regras, excs, lote: 'M3' }).map((a) => a.rel), ['templates/a.md']);
  assert.deepEqual(rodar({ raiz: d, regras, excs, lote: 'M4' }).map((a) => a.rel), ['tests/ambiente/rodar.sh']);
});

test('excecoes: todo trecho literal esta presente no arquivo (menos os marcados "entra no M1")', () => {
  const repo = path.join(AQUI, '..', '..');
  const mortas = [];
  for (const e of lerExcecoes(fs.readFileSync(path.join(AQUI, 'excecoes.txt'), 'utf8'))) {
    if (e.trecho === '*' || e.trecho.startsWith('secao:') || /entra no M1/.test(e.motivo) || e.arquivo.endsWith('/')) continue;
    const f = path.join(repo, e.arquivo);
    if (!fs.existsSync(f) || !fs.readFileSync(f, 'utf8').includes(e.trecho)) mortas.push(`${e.arquivo}: ${e.trecho}`);
  }
  assert.deepEqual(mortas, []);
});

test('excecao por trecho, por secao e por arquivo inteiro', () => {
  const excs = ['README.md\tde DG Medeiros, DG Claw\tcredito', 'CHANGELOG.md\tsecao:^## \\[(?!2\\.0\\])\tantigas', 'LICENSE\t*\tmit'].join('\n');
  const a = aplica('README.md', 'Feito sobre DG Claw\nde DG Medeiros, DG Claw (credito)\n', excs);
  assert.equal(a.novo, 'Feito sobre Prumo da Locadora\nde DG Medeiros, DG Claw (credito)\n');
  const c = aplica('CHANGELOG.md', '## [2.0]\n- novo DG Claw\n## [1.0]\n- velho DG Claw\n', excs);
  assert.equal(c.novo, '## [2.0]\n- novo Prumo da Locadora\n## [1.0]\n- velho DG Claw\n');
  const l = aplica('LICENSE', 'DG Claw\n', excs);
  assert.equal(l.novo, 'DG Claw\n');
  assert.deepEqual(estados(l), ['excecao']);
});

test('excecao sem motivo e recusada', () => {
  assert.throws(() => lerExcecoes('a.md\tDG Claw\t'), /motivo/);
});

test('a decisao nao depende da posicao: linhas a mais no topo dao o mesmo resultado', () => {
  const base = "const a = 'DG Claw';\nif (x.startsWith('DG Claw')) {}\n";
  const um = aplica('a.js', base).novo;
  const dois = aplica('a.js', `\n\n\n${base}`).novo;
  assert.equal(`\n\n\n${um}`, dois);
});

function arvore(arquivos) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'marca-'));
  for (const [rel, txt] of Object.entries(arquivos)) { fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true }); fs.writeFileSync(path.join(d, rel), txt); }
  return d;
}

test('idempotente: a segunda passada muda 0 arquivos; --dry nao escreve; --pasta restringe', () => {
  const arq = { 'docs/a.md': 'DG Claw e `dgclaw atualizar`\n', 'lib/b.sh': 'falha "o DG Claw caiu"\n', 'web/c.js': "x('DG Claw');\n" };
  const d = arvore(arq);
  const excs = lerExcecoes('');
  const dry = rodar({ raiz: d, dry: true, regras, excs });
  assert.equal(dry.filter((a) => a.muda).length, 3);
  assert.equal(fs.readFileSync(path.join(d, 'docs/a.md'), 'utf8'), arq['docs/a.md']);
  const so = rodar({ raiz: d, pastas: ['lib'], dry: false, regras, excs });
  assert.deepEqual(so.map((a) => a.rel), ['lib/b.sh']);
  assert.equal(fs.readFileSync(path.join(d, 'web/c.js'), 'utf8'), arq['web/c.js']);
  rodar({ raiz: d, dry: false, regras, excs });
  const de = rodar({ raiz: d, dry: false, regras, excs });
  assert.equal(de.filter((a) => a.muda).length, 0);
  assert.equal(fs.readFileSync(path.join(d, 'docs/a.md'), 'utf8'), 'Prumo da Locadora e `prumo atualizar`\n');
});

test('linha de comando: --dry lista e sai 0; opcao desconhecida sai 2', () => {
  const d = arvore({ 'docs/a.md': 'DG Claw\n' });
  const out = execFileSync(process.execPath, [path.join(AQUI, 'aplicar.mjs'), '--dry', '--raiz', d], { encoding: 'utf8' });
  assert.match(out, /mudariam 1 arquivo/);
  assert.equal(fs.readFileSync(path.join(d, 'docs/a.md'), 'utf8'), 'DG Claw\n');
  assert.throws(() => execFileSync(process.execPath, [path.join(AQUI, 'aplicar.mjs'), '--xis'], { stdio: 'pipe' }), (e) => e.status === 2);
});

// docs-em-dia: `prumo` e aceito como o mesmo comando que `dgclaw` (tests/docs-em-dia/checar.mjs + inventario)
function checar(manual, inventario) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'marca-docs-'));
  const m = path.join(d, 'manual');
  fs.mkdirSync(m);
  fs.writeFileSync(path.join(m, 'excecoes.tsv'), '# vazio\n');
  for (const [n, t] of Object.entries(manual)) fs.writeFileSync(path.join(m, n), t);
  fs.writeFileSync(path.join(d, 'inv.json'), JSON.stringify(inventario));
  const r = (args = []) => {
    try { return { rc: 0, out: execFileSync(process.execPath, [path.join(AQUI, '..', '..', 'tests', 'docs-em-dia', 'checar.mjs'), ...args], { encoding: 'utf8', stdio: 'pipe', env: { ...process.env, DOCS_MANUAL_DIR: m, DOCS_INVENTARIO_ARQUIVO: path.join(d, 'inv.json') } }) }; } catch (e) { return { rc: e.status, out: `${e.stdout}${e.stderr}` }; }
  };
  return r();
}
const item = (id) => [{ id, origem: 'x:1' }];
const INV = { telas: item('/mesa'), rotas: item('/api/v1/foco'), comandos: item('dgclaw agente criar'), skills: item('agenda'), powers: item('crm'), canais: item('whatsapp'), provedores: item('claude') };
const BASE = 'A tela `/mesa`, a familia /api/v1/foco, a skill `agenda`, o power `crm`, o canal `whatsapp` e o provedor `claude`.\n';
const REF = (cmd) => `# Referencia\n\n<!-- inventario:inicio -->\n- ${cmd}\n<!-- inventario:fim -->\n`;

test('docs-em-dia: com o apelido declarado, prumo vale como dgclaw; sem, nao; comando que sumiu reprova; prosa "prumo da locadora" nao atrapalha', () => {
  const ap = { ...INV, apelidos_de_comando: { prumo: 'dgclaw' } };
  const manual = { 'README.md': `${BASE}Para criar use prumo agente criar. O prumo da locadora e o Prumo da Locadora.\n`, 'referencia-admin.md': REF('prumo agente criar meu-agente') };
  assert.equal(checar(manual, ap).rc, 0);
  const sem = checar(manual, INV);
  assert.equal(sem.rc, 1);
  assert.match(sem.out, /dgclaw agente criar/);
  const sumiu = checar({ ...manual, 'referencia-admin.md': REF('prumo agente apagar-tudo') }, ap);
  assert.equal(sumiu.rc, 1);
  assert.match(sumiu.out, /agente apagar-tudo/);
});

test('docs-em-dia: o inventario real declara o apelido prumo -> dgclaw', () => {
  const inv = JSON.parse(execFileSync(process.execPath, [path.join(AQUI, '..', 'docs-inventario.mjs')], { encoding: 'utf8', maxBuffer: 1 << 26 }));
  assert.deepEqual(inv.apelidos_de_comando, { prumo: 'dgclaw' });
});

test('comando executado/validado: nada em web/lib/diagnostico e trocado, nem a ajuda() do bin/dgclaw', () => {
  const repo = path.join(AQUI, '..', '..');
  const excs = lerExcecoes(fs.readFileSync(path.join(AQUI, 'excecoes.txt'), 'utf8'));
  const diag = rodar({ raiz: repo, pastas: ['web/lib/diagnostico'], regras, excs });
  assert.deepEqual(diag.flatMap((a) => a.ocorrencias.filter((o) => o.regra === 'comando')), []);
  const r = aplica('web/lib/diagnostico/util.js', "const A = [/^`dgclaw status`$/]; const t = 'Rode sudo dgclaw status';\n");
  assert.equal(r.novo, "const A = [/^`dgclaw status`$/]; const t = 'Rode sudo dgclaw status';\n");
  const ajuda = aplica('bin/dgclaw', "#!/usr/bin/env bash\najuda() {\ncat <<'FIM'\n  dgclaw agente criar <nome>\nFIM\n}\n", 'bin/dgclaw\t  dgclaw \tlogica: ajuda lida por uso-atualizacao.sh\n');
  assert.match(ajuda.novo, /\n {2}dgclaw agente criar/);
});

test('comando generico ("sudo dgclaw ..." e "dgclaw <comando>") tambem troca; "dgclaw tem" nao', () => {
  const r = aplica('docs/g.md', 'Rode `sudo dgclaw ...` ou `sudo dgclaw <comando>`. O dgclaw tem permissao.\n');
  assert.equal(r.novo, 'Rode `sudo prumo ...` ou `sudo prumo <comando>`. O dgclaw tem permissao.\n');
});

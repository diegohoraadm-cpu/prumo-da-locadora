'use strict';
// Só o principal conversa com o dono: quem é o principal, a marca de equipe, o papel e o desvio da conversa.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { subirWeb, pastaTemp } = require('./ajuda');

// Runner em porta fechada: a lista cai na reserva do rótulo na hora, sem esperar.
const ag = (slug, tipo, extra) => Object.assign({ slug, nome: slug.toUpperCase(), tipo, runner: 'http://127.0.0.1:9', agente_id: slug }, extra);

async function cenario(agentes) {
  const t = await subirWeb({ agentes });
  await t.login();
  return t;
}

test('principal: o primeiro agente de trabalho, gravado em principal.json e estável quando a ordem muda', async () => {
  const casa = pastaTemp('casa-beto');
  fs.writeFileSync(path.join(casa, 'AGENT.md'), '# Beto\n\n## Seu papel\n\nCuida do <b>financeiro</b> da loja.\n\n## Outra\n');
  const t = await cenario([ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente', { home_host: casa })]);
  try {
    const lista = (await t.c.get('/api/v1/agents')).json.agentes;
    const por = Object.fromEntries(lista.map((a) => [a.id, a]));
    assert.equal(por.ana.principal, true); assert.equal(por.ana.equipe, false);
    assert.equal(por.beto.principal, false); assert.equal(por.beto.equipe, true);
    assert.equal(por.admin.principal, false); assert.equal(por.admin.equipe, false);
    assert.equal(por.beto.papel, 'Cuida do <b>financeiro</b> da loja.', 'o texto vai cru; quem pinta escapa');
    assert.equal(por.ana.papel, '');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(t.dados, 'principal.json'), 'utf8')), { slug: 'ana' });

    // ana recriada vai para o fim do agentes.json (é o que o agentes_registrar faz): continua principal
    fs.writeFileSync(t.agentesPath, JSON.stringify({ versao: 1, agentes: [ag('admin', 'admin'), ag('beto', 'agente', { home_host: casa }), ag('ana', 'agente')] }));
    const depois = (await t.c.get('/api/v1/agents')).json.agentes;
    assert.equal(depois.find((a) => a.id === 'ana').principal, true);
    assert.equal(depois.find((a) => a.id === 'beto').equipe, true);
  } finally { await t.fechar(); }
});

test('principal: arquivo ilegível não é sobrescrito; slug que some por um instante não troca o gravado', async () => {
  const t = await cenario([ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente')]);
  const arq = path.join(t.dados, 'principal.json');
  const lista = async () => (await t.c.get('/api/v1/agents')).json.agentes;
  try {
    fs.writeFileSync(arq, '{ escrito à mão');
    assert.equal((await lista()).find((a) => a.id === 'ana').principal, true);
    assert.equal(fs.readFileSync(arq, 'utf8'), '{ escrito à mão');
    assert.match(t.log.texto(), /Não consegui ler o agente principal/);

    fs.writeFileSync(arq, JSON.stringify({ slug: 'beto' }));
    assert.equal((await lista()).find((a) => a.id === 'beto').principal, true, 'escolha do dono vale');

    // remover beto e criar de novo: no meio, beto some do registro; o arquivo não pode mudar
    fs.writeFileSync(t.agentesPath, JSON.stringify({ versao: 1, agentes: [ag('admin', 'admin'), ag('ana', 'agente')] }));
    assert.equal((await lista()).find((a) => a.id === 'ana').principal, true, 'enquanto beto está fora, vale o primeiro');
    assert.deepEqual(JSON.parse(fs.readFileSync(arq, 'utf8')), { slug: 'beto' });
    fs.writeFileSync(t.agentesPath, JSON.stringify({ versao: 1, agentes: [ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente')] }));
    const depois = await lista();
    assert.equal(depois.find((a) => a.id === 'beto').principal, true, 'beto voltou e segue principal');
    assert.equal(depois.find((a) => a.id === 'ana').equipe, true);
  } finally { await t.fechar(); }
});

test('painel: a conversa do painel de um agente da equipe é recusada, em qualquer grafia do caminho', async () => {
  const t = await cenario([ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente')]);
  try {
    for (const c of ['/p/beto/api/chat/mensagens', '/p/beto//api/chat/mensagem', '/p/beto/API/Chat/parar', '/p/beto/api/chat%2Fmensagem', '/p/beto/x/../api/chat/mensagens']) {
      const r = c.includes('mensagens') ? await t.c.get(c) : await t.c.post(c, { json: { text: 'oi' } });
      assert.equal(r.status, 403, c); assert.match(r.json.erro, /equipe/, c);
    }
    assert.notEqual((await t.c.get('/p/ana/api/chat/mensagens')).status, 403, 'o principal segue com a conversa');
    assert.notEqual((await t.c.get('/p/beto/api/memory')).status, 403, 'o resto do painel da equipe abre');
  } finally { await t.fechar(); }
});

test('conversa: /a/<equipe> leva à aba Equipe da Mesa; principal e Admin abrem a conversa; "/" ignora cookie da equipe', async () => {
  const t = await cenario([ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente')]);
  try {
    const html = { headers: { Accept: 'text/html' } };
    const beto = await t.c.get('/a/beto', html);
    assert.equal(beto.status, 302); assert.equal(beto.headers.location, '/mesa#equipe');
    assert.equal((await t.c.get('/a/ana', html)).status, 200);
    assert.equal((await t.c.get('/a/admin', html)).status, 200);
    const raiz = await t.c.get('/', { headers: { Accept: 'text/html', Cookie: "dgclaw_agente=beto" } });
    assert.equal(raiz.status, 302); assert.equal(raiz.headers.location, '/a/ana');
  } finally { await t.fechar(); }
});

test('papel: AGENT.md que é atalho não é seguido', async () => {
  const casa = pastaTemp('casa-atalho');
  const fora = path.join(pastaTemp('fora'), 'segredo.md');
  fs.writeFileSync(fora, '## Seu papel\n\nconteudo de fora da casa\n');
  fs.symlinkSync(fora, path.join(casa, 'AGENT.md'));
  const t = await cenario([ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente', { home_host: casa })]);
  try {
    assert.equal((await t.c.get('/api/v1/agents')).json.agentes.find((a) => a.id === 'beto').papel, '');
  } finally { await t.fechar(); }
});

test('papel: AGENT.md trocado por FIFO não trava o Web', () => {
  // processo à parte com prazo: se a leitura bloquear, o event loop para e só o prazo de fora pega
  const r = spawnSync(process.execPath, [path.join(__dirname, 'fixtures', 'papel-fifo.js')], { timeout: 15000, encoding: 'utf8' });
  assert.equal(r.error && r.error.code, undefined, 'o processo passou do prazo: a leitura do papel bloqueou no FIFO');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), { status: 200, papel: '' });
});

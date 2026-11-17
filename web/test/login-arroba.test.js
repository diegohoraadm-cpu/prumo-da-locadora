'use strict';
// Login (C1): a dica do "@" nasce no navegador; o servidor responde igual para e-mail de colaborador e e-mail que não existe.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { cenario, colaboradorAtivo } = require('./colab-ajuda');

const pub = (n) => fs.readFileSync(path.join(__dirname, '../public', n), 'utf8');
const DICA = 'O dono entra com o nome de usuário (sem @); e-mail é só para convidado.';

/** Roda o login.js numa página falsa com a barra de endereço dada; devolve a caixa de erro e o painel de ajuda. */
function paginaCom(busca) {
  const el = () => ({ hidden: false, textContent: '', value: '', attrs: {}, ouvintes: {}, classList: { add() {} },
    setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(e, f) { this.ouvintes[e] = f; }, focus() {} });
  const els = Object.fromEntries(['next', 'usuario', 'campoSenha', 'verSenha', 'form', 'entrar', 'erro', 'naoConsigo', 'ajudaEntrar'].map((i) => [i, el()]));
  els.ajudaEntrar.hidden = true;
  const janela = { document: { getElementById: (i) => els[i] }, location: { search: busca }, addEventListener() {},
    fetch: () => new Promise(() => {}), URLSearchParams, setTimeout };
  janela.window = janela;
  vm.runInNewContext(pub('login.js'), Object.assign(janela, { fetch: janela.fetch }));
  return els;
}

test('login.js: com "@" no usuário e senha errada, a mensagem ganha a dica; sem "@", não', () => {
  const com = paginaCom('?erro=credenciais&usuario=maria%40x.com').erro;
  assert.equal(com.textContent, `Usuário ou senha incorretos. Confira e tente de novo. ${DICA}`);
  assert.equal(com.hidden, false);
  const sem = paginaCom('?erro=credenciais&usuario=dono').erro;
  assert.ok(!sem.textContent.includes('sem @'), sem.textContent);
  assert.ok(!paginaCom('?erro=credenciais').erro.textContent.includes('sem @'));
});

test('login.js: bloqueio diz "Espere até 15 minutos"; o painel "Não consigo entrar" abre e fecha com aria-expanded', () => {
  assert.match(paginaCom('?erro=limite').erro.textContent, /Espere até 15 minutos/);
  const p = paginaCom('');
  assert.equal(p.ajudaEntrar.hidden, true);
  p.naoConsigo.ouvintes.click();
  assert.deepEqual([p.ajudaEntrar.hidden, p.naoConsigo.attrs['aria-expanded']], [false, 'true']);
  p.naoConsigo.ouvintes.click();
  assert.deepEqual([p.ajudaEntrar.hidden, p.naoConsigo.attrs['aria-expanded']], [true, 'false']);
});

test('login.html: botão de verdade com aria-controls, e o painel traz os dois comandos e os 15 minutos', () => {
  const h = pub('login.html');
  assert.match(h, /<button type="button" id="naoConsigo" aria-expanded="false" aria-controls="ajudaEntrar"/);
  assert.match(h, /<div id="ajudaEntrar"[^>]*\bhidden\b/);
  for (const t of ['sudo prumo usuario', 'sudo prumo senha', 'Não consigo entrar', '15 minutos']) assert.ok(h.includes(t), t);
});

test('servidor: e-mail de colaborador com senha errada e e-mail inexistente recebem a MESMA resposta (a dica não revela nada)', async () => {
  const s = await cenario({});
  try {
    const x = await colaboradorAtivo(s, 'maria@x.com');
    const tenta = async (usuario) => {
      const r = await s.t.c.post('/login', { form: { usuario, senha: 'errada-123', next: '/' } });
      const loc = new URL(r.headers.location, 'http://x');
      return { status: r.status, erro: loc.searchParams.get('erro'), next: loc.searchParams.get('next'), corpo: r.texto, cache: r.headers['cache-control'] };
    };
    const existente = await tenta(x.email);
    const inexistente = await tenta('ninguem@x.com');
    assert.equal(existente.status, 302);
    assert.equal(existente.erro, 'credenciais');
    assert.deepEqual(existente, inexistente);
    const j1 = await s.t.c.post('/login', { json: { usuario: x.email, senha: 'errada-123' } });
    const j2 = await s.t.c.post('/login', { json: { usuario: 'ninguem@x.com', senha: 'errada-123' } });
    assert.equal(j1.status, 401);
    assert.deepEqual([j1.status, j1.texto], [j2.status, j2.texto]);
  } finally { await s.fechar(); }
});

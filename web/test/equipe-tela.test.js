'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Q = require('../public/equipe');

const tarefas = [
  { agente: 'beto', titulo: 'Conciliar o caixa', estado: 'fazendo', parada: false },
  { agente: 'beto', titulo: 'Aprovar o pagamento', estado: 'esperando_dono' },
  { agente: 'caio', titulo: 'Fechada', estado: 'concluida' },
];

test('estado da equipe: o que mais pede atenção vence; só tarefa fechada ou nenhuma é "livre"', () => {
  assert.deepEqual(Q.estadoDe('beto', tarefas), { titulo: 'Aprovar o pagamento', texto: 'esperando você', classe: 'esperando' });
  assert.equal(Q.estadoDe('beto', [tarefas[0]]).texto, 'fazendo');
  assert.equal(Q.estadoDe('caio', tarefas).texto, 'livre');
  assert.equal(Q.estadoDe('ninguem', null).texto, 'livre');
});

test('lista da equipe: só quem tem equipe:true, texto escapado, papel em branco avisa', () => {
  const ag = [
    { id: 'admin', nome: 'Admin', tipo: 'admin', equipe: false },
    { id: 'ana', nome: 'Ana', principal: true, equipe: false },
    { id: 'beto', nome: 'Beto <i>', equipe: true, papel: 'Financeiro & caixa', painel_url: '/p/beto/' },
    { id: 'caio', nome: 'Caio', equipe: true, papel: '' },
  ];
  const h = Q.htmlEquipe(ag, tarefas);
  assert.doesNotMatch(h, /Ana|Admin</);
  assert.match(h, /Beto &lt;i&gt;/); assert.match(h, /Financeiro &amp; caixa/);
  assert.match(h, /papel não informado/); assert.match(h, /href="\/p\/beto\/#aba=status">configurações</); assert.doesNotMatch(h, /abrir o painel/);
  assert.match(Q.htmlEquipe(ag.slice(0, 2), []), /Ainda não há equipe/);
});

test('mesa.html carrega a Equipe depois da Mesa; textos sem travessão', () => {
  const h = fs.readFileSync(path.join(__dirname, '../public/mesa.html'), 'utf8');
  assert.ok(h.indexOf('<script src="/mesa.js">') < h.indexOf('<script src="/equipe.js">'));
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '../public/equipe.js'), 'utf8'), /[—–]/);
});

'use strict';
// Roda num processo à parte (web/test/principal.test.js): se a leitura do papel abrir um FIFO
// bloqueando, o event loop inteiro para, e só um processo separado com prazo consegue ver isso.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { subirWeb, pastaTemp } = require('../ajuda');

(async () => {
  const casa = pastaTemp('casa-fifo');
  execFileSync('mkfifo', [path.join(casa, 'AGENT.md')]);
  const ag = (slug, tipo, extra) => Object.assign({ slug, nome: slug, tipo, runner: 'http://127.0.0.1:9', agente_id: slug }, extra);
  const t = await subirWeb({ agentes: [ag('admin', 'admin'), ag('ana', 'agente'), ag('beto', 'agente', { home_host: casa })] });
  await t.login();
  const r = await t.c.get('/api/v1/agents');
  process.stdout.write(JSON.stringify({ status: r.status, papel: r.json.agentes.find((a) => a.id === 'beto').papel }));
  await t.fechar();
  fs.rmSync(casa, { recursive: true, force: true });
})().catch((e) => { console.error(e); process.exit(1); });

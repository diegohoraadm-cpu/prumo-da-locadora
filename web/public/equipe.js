'use strict';
/* equipe.js: a aba "Equipe" da Mesa de tarefas (/mesa#equipe).

   A equipe são os agentes de trabalho que não são o principal (o servidor marca cada um com `equipe: true`
   em /api/v1/agents). O dono não conversa com eles: quem chama a equipe é o principal. Aqui o dono vê quem
   são, o papel de cada um e o estado, tirado das tarefas de hoje na Mesa. O link leva às configurações do
   agente (cofre, memória); a conversa do painel dele o Web recusa (web/server.js, ehChatDoPainel).

   Parte pura (sem DOM, com teste em web/test/equipe-tela.test.js): estadoDe e htmlEquipe.
   Parte com DOM: registra a aba pela window.DGMesaAbas, depois da aba Tarefas. */
(function (raiz, fabrica) {
  const m = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = m;
  else raiz.DGEquipe = m;
})(this, function (raiz) {
  const { esc, rotuloEstado } = raiz.DGMesa || require('./mesa');

  /* O estado que mais pede atenção entre as tarefas do agente; sem nenhuma tarefa aberta, "livre". */
  const ORDEM = ['esperando', 'travada', 'parada', 'fazendo'];
  function estadoDe(id, tarefas) {
    const rotulos = (tarefas || []).filter(t => t && t.agente === id).map(t => Object.assign({ titulo: t.titulo || '' }, rotuloEstado(t)));
    for (const c of ORDEM) {
      const r = rotulos.find(x => x.classe === c);
      if (r) return r;
    }
    return { texto: 'livre', classe: 'outro', titulo: '' };
  }

  function htmlEquipe(agentes, tarefas) {
    const equipe = (agentes || []).filter(a => a && a.equipe);
    if (!equipe.length) {
      return '<p class="mz-vazio grande">Ainda não há equipe. Quando o seu agente principal precisar de um ajudante fixo, ' +
        'ele pede ao Admin, e o agente novo aparece aqui.</p>';
    }
    return '<p class="mz-vazio">Estes agentes trabalham para o seu agente principal. Você não conversa com eles: ' +
      'peça ao principal, que ele chama quem precisar.</p><ul class="mz-equipe">' + equipe.map(a => {
      const e = estadoDe(a.id, tarefas);
      return `<li class="mz-cartao"><div class="mz-bloco-cab"><h3>${esc(a.nome)}</h3>` +
        `<span class="mz-selo ${esc(e.classe)}">${esc(e.texto)}</span></div>` +
        `<p>${esc(a.papel || 'papel não informado')}</p>` +
        (e.titulo ? `<p class="mz-vazio">${esc(e.titulo)}</p>` : '') +
        (a.painel_url ? `<a class="mz-btn" href="${esc(a.painel_url)}#aba=status">configurações</a>` : '') + '</li>';
    }).join('') + '</ul>';
  }

  if (typeof document === 'undefined') return { estadoDe, htmlEquipe };

  async function lerApi(url) {
    const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d || d.ok === false) throw new Error((d && d.erro) || ('o servidor respondeu ' + r.status + ' a ' + url));
    return d;
  }

  function montar(el) {
    const carrega = async () => {
      try {
        const [a, t] = await Promise.all([lerApi('/api/v1/agents'), lerApi('/api/v1/tarefas?dia=hoje')]);
        el.innerHTML = htmlEquipe(a.agentes, t.tarefas);
      } catch (e) {
        console.warn('equipe: não consegui montar a lista:', e);
        el.innerHTML = `<div class="mz-erro" role="alert"><p>Não consegui mostrar a equipe: ${esc(e.message)}. Ela tenta de novo em 30 segundos.</p></div>`;
      }
    };
    carrega();
    setInterval(() => { if (document.visibilityState === 'visible' && !el.hidden) carrega(); }, 30000);
  }

  // Depois do boot da Mesa (que registra Tarefas no DOMContentLoaded), para a Equipe vir depois dela.
  const registra = () => raiz.DGMesaAbas && raiz.DGMesaAbas.registrar({ id: 'equipe', titulo: 'Equipe', montar });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', registra);
  else registra();
  return { estadoDe, htmlEquipe, montar };
});

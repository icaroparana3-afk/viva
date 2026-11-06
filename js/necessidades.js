// =============================================================
// necessidades.js — as barras do bebê (Etapa 8).
//
// Cinco barras de 0 a 100 (100 = tudo bem, 0 = precisa muito):
//   fome, sede, energia, higiene, diversao
//
// Decisões do autor (2026-11-05):
// - As barras caem pelo tempo REAL (não pelo relógio rápido do jogo).
//   A fome vai de cheia a vazia em 5 horas reais.
// - Com o jogo fechado continuam caindo, mas na METADE da velocidade.
// - De 0 a 1 ano, a mamadeira enche a fome e a sede juntas.
//
// Energia e higiene ficam paradas até as etapas do sono e do banho
// (velocidade 0 em CONFIG.NECESSIDADES.QUEDA_POR_HORA).
//
// Como saber se o jogo estava fechado: o jogo atualiza as barras a cada
// segundo enquanto está na tela. Se passou mais que LIMITE_ABERTO_SEGUNDOS
// desde a última atualização, aquele tempo foi com o jogo fechado.
//
// Guardado no save: necessidades {fome, sede, ...} e necessidadesEm (quando
// foram atualizadas pela última vez).
// =============================================================

const NEC = {
  LISTA: ['fome', 'sede', 'energia', 'higiene', 'diversao'],

  // Save sem barras (bebê recém-chegado ou save antigo): começa como na chegada
  garantir(s) {
    if (!s.necessidades) {
      s.necessidades = Object.assign({}, CONFIG.NECESSIDADES.CHEGADA);
      s.necessidadesEm = Date.now();
    }
  },

  // Faz as barras caírem até agora e grava. Devolve as barras (ou null sem bebê).
  atualizar(agora = Date.now()) {
    const N = CONFIG.NECESSIDADES;
    const s = Estado.carregar();
    if (!s || !s.bebeRecebido) return null;
    NEC.garantir(s);
    const seg = Math.max(0, (agora - s.necessidadesEm) / 1000);
    const fator = seg > N.LIMITE_ABERTO_SEGUNDOS ? N.FATOR_FECHADO : 1;
    for (const k of NEC.LISTA) {
      const queda = N.QUEDA_POR_HORA[k] * (seg / 3600) * fator;
      s.necessidades[k] = NEC.limitar(s.necessidades[k] - queda);
    }
    s.necessidadesEm = agora;
    Estado.salvar();
    return s.necessidades;
  },

  // Sobe (ou desce) uma barra e grava
  mudar(k, quanto) {
    const n = NEC.atualizar();
    if (!n) return null;
    n[k] = NEC.limitar(n[k] + quanto);
    Estado.salvar();
    return n;
  },

  // TESTE: faz as barras caírem como se passassem estes minutos reais (com o jogo aberto)
  adiantar(minutos) {
    const n = NEC.atualizar();
    if (!n) return;
    for (const k of NEC.LISTA) n[k] = NEC.limitar(n[k] - CONFIG.NECESSIDADES.QUEDA_POR_HORA[k] * minutos / 60);
    Estado.salvar();
  },

  limitar(v) { return Math.max(0, Math.min(100, v)); },

  // As barras atuais (sem atualizar)
  atuais() {
    const s = Estado.dados || Estado.carregar();
    if (!s || !s.bebeRecebido) return null;
    NEC.garantir(s);
    return s.necessidades;
  },

  // Humor do bebê, a partir das barras (estilo The Sims; a lista vai crescer)
  //   triste    → alguma barra que já funciona está muito baixa
  //   entediado → diversão baixa
  //   feliz     → o resto
  humor(n = NEC.atuais()) {
    const N = CONFIG.NECESSIDADES;
    if (!n) return 'feliz';
    if (NEC.ativas().some(k => n[k] < N.LIMITE_TRISTE)) return 'triste';
    if (n.diversao < N.LIMITE_ENTEDIADO) return 'entediado';
    return 'feliz';
  },

  // Barras que já caem nesta etapa (as outras ficam paradas)
  ativas() {
    return NEC.LISTA.filter(k => CONFIG.NECESSIDADES.QUEDA_POR_HORA[k] > 0);
  },

  // O que o bebê mais quer agora (para o balão). null = nada urgente.
  pedido(n = NEC.atuais()) {
    const N = CONFIG.NECESSIDADES;
    if (!n) return null;
    let pior = null;
    for (const k of NEC.ativas()) {
      if (n[k] < N.LIMITE_PEDIR && (pior === null || n[k] < n[pior])) pior = k;
    }
    return pior;
  }
};

// Relógio das barras: a cada segundo, com o jogo na tela.
setInterval(() => { if (document.visibilityState === 'visible') NEC.atualizar(); }, 1000);

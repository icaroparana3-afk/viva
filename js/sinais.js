// =============================================================
// sinais.js — os sinais de cuidado do bebê (Etapa 8.2).
//
// O bebê ainda não fala: ele mostra o que precisa em três camadas.
//   1. O próprio bebê (animação e choro)   → "algo está errado"
//   2. O balão em cima do berço            → "o que ele quer"
//   3. A carinha de humor na caixinha      → "como ele está no geral"
//
// Aqui só ficam as contas (qual faixa, qual pedido). O desenho fica no Quarto.js.
// As barras em si continuam em js/necessidades.js. Números em CONFIG.SINAIS.
// =============================================================

const SINAIS = {
  // Ordem das faixas, da melhor para a pior
  ORDEM: ['nada', 'triste', 'chorando', 'forte', 'esgotado'],

  // Faixa de um valor de barra (pela porcentagem arredondada, a mesma do painel)
  faixa(v) {
    const F = CONFIG.SINAIS.FAIXAS;
    const p = Math.round(v);
    if (p > F.TRISTE) return 'nada';
    if (p > F.CHORANDO) return 'triste';
    if (p > F.FORTE) return 'chorando';
    if (p > 0) return 'forte';
    return 'esgotado';
  },

  gravidade(faixa) { return SINAIS.ORDEM.indexOf(faixa); },

  // Pedidos: barras ativas que precisam de algo, da mais urgente (menor valor) para a menos
  pedidos(n = NEC.atuais()) {
    if (!n) return [];
    return NEC.ativas()
      .map(k => ({ k, v: n[k], faixa: SINAIS.faixa(n[k]) }))
      .filter(p => p.faixa !== 'nada')
      .sort((a, b) => a.v - b.v);
  },

  // O grupo que o balão mostra: as necessidades na MESMA faixa da mais urgente
  // (se for mais de uma, o balão alterna entre elas)
  grupoDoBalao(n = NEC.atuais()) {
    const lista = SINAIS.pedidos(n);
    if (!lista.length) return [];
    return lista.filter(p => p.faixa === lista[0].faixa);
  },

  // Faixa da pior barra (o choro e a animação do bebê seguem esta)
  pior(n = NEC.atuais()) {
    const lista = SINAIS.pedidos(n);
    return lista.length ? lista[0].faixa : 'nada';
  },

  // Alguma barra ativa abaixo de 25? (botão pulsa e ganha o "!")
  alerta(n = NEC.atuais()) {
    if (!n) return false;
    return NEC.ativas().some(k => n[k] < CONFIG.NECESSIDADES.LIMITE_ALERTA);
  }
};

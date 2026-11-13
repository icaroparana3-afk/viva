// =============================================================
// tarefas.js — 3 tarefinhas do dia e as estrelinhas (v0.0.64).
//
// Por dia REAL (data do celular): na primeira vez que o jogo abre no dia,
// sorteia 3 tarefas de CONFIG.TAREFAS.LISTA (o mesmo sorteio para a mesma
// data). Feita uma, o jogador toca em "Pegar" e ganha estrelinhas; as 3
// pegas dão um bônus. Não fazer não tira nada.
//
//   TAREFAS.contar('carinho')     → soma 1 (true se a tarefa acabou de ficar pronta)
//   TAREFAS.maximo('torre', 6)    → vale o maior valor do dia
//   TAREFAS.estado()  TAREFAS.pegar(i)  TAREFAS.estrelas()  TAREFAS.prontas()
// Fica em save.tarefas = { data, lista: [{ tipo, prog, feita, pega }], bonus } e save.estrelas.
// =============================================================

const TAREFAS = {
  hoje() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  tipo(nome) {
    return CONFIG.TAREFAS.LISTA.find(t => t.tipo === nome);
  },

  // As tarefas de hoje (sorteia se o dia mudou)
  estado() {
    const s = Estado.dados || Estado.carregar();   // o save em memória (não relê, para não perder mudanças de quem chamou)
    if (!s) return null;
    const hoje = TAREFAS.hoje();
    if (!s.tarefas || s.tarefas.data !== hoje) {
      const semente = parseInt(hoje.replace(/-/g, ''), 10);
      const r = CLIMA.sorteador(semente);
      const tipos = CONFIG.TAREFAS.LISTA.map(t => t.tipo);
      const lista = [];
      while (lista.length < CONFIG.TAREFAS.POR_DIA && tipos.length) {
        const i = Math.floor(r() * tipos.length);
        lista.push({ tipo: tipos.splice(i, 1)[0], prog: 0, feita: false, pega: false });
      }
      s.tarefas = { data: hoje, lista, bonus: false };
      Estado.salvar();
    }
    return s.tarefas;
  },

  mexer(nome, fazer) {
    const st = TAREFAS.estado();
    if (!st) return false;
    let pronta = false, mudou = false;
    st.lista.forEach(t => {
      if (t.tipo !== nome || t.feita) return;
      const def = TAREFAS.tipo(nome);
      const novo = Math.min(def.alvo, fazer(t.prog));
      if (novo === t.prog) return;
      t.prog = novo; mudou = true;
      if (t.prog >= def.alvo) { t.feita = true; pronta = true; }
    });
    if (mudou) Estado.salvar();
    return pronta;
  },

  contar(nome, n = 1) {
    if (!n || n <= 0) return false;
    return TAREFAS.mexer(nome, p => p + n);
  },

  maximo(nome, valor) {
    return TAREFAS.mexer(nome, p => Math.max(p, valor));
  },

  prontas() {
    const st = TAREFAS.estado();
    return st ? st.lista.filter(t => t.feita && !t.pega).length : 0;
  },

  estrelas() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.estrelas) || 0;
  },

  // Pega a estrelinha da tarefa i. Devolve quantas ganhou (com o bônus, se fechou as 3).
  pegar(i) {
    const st = TAREFAS.estado();
    const t = st && st.lista[i];
    if (!t || !t.feita || t.pega) return 0;
    const T = CONFIG.TAREFAS;
    const s = Estado.dados;           // o mesmo save que estado() acabou de ler
    t.pega = true;
    let ganho = T.ESTRELAS_POR_TAREFA;
    if (!st.bonus && st.lista.every(x => x.pega)) { st.bonus = true; ganho += T.BONUS_TODAS; }
    s.estrelas = (s.estrelas || 0) + ganho;
    Estado.salvar();
    return ganho;
  }
};

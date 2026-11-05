// =============================================================
// tempo.js — a hora DO JOGO, num lugar só.
//
// Tudo que depende da hora (relógio do quarto, dia/noite na janela...)
// pergunta aqui: TEMPO.agora() → { hora, minuto, segundo }.
//
// Por enquanto é a hora do aparelho. Na Etapa 6 (relógio do jogo)
// só esta função muda, e o relógio e a janela seguem sozinhos.
// =============================================================

const TEMPO = {
  agora() {
    const d = new Date();
    return { hora: d.getHours(), minuto: d.getMinutes(), segundo: d.getSeconds() };
  },

  // true entre NOITE_COMECA e DIA_COMECA (ver CONFIG.JANELA)
  ehNoite() {
    const J = CONFIG.JANELA;
    const h = TEMPO.agora().hora;
    return h < J.DIA_COMECA || h >= J.NOITE_COMECA;
  }
};

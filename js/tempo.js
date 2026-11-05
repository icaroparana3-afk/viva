// =============================================================
// tempo.js — o TEMPO DO JOGO, num lugar só (Etapa 6).
//
// O jogo tem o seu próprio relógio, mais rápido que o de verdade:
//   7 dias reais = 2 anos no jogo (CONFIG.TEMPO.DIAS_REAIS_POR_ANO = 3,5)
//   → 1 dia do jogo ≈ 13,8 minutos reais
//   → 1 hora do jogo ≈ 34,5 segundos reais
//
// O relógio começa quando a cegonha entrega o bebê (save.chegadaReal),
// às CONFIG.TEMPO.HORA_CHEGADA do 1º dia. Daí em diante a hora do jogo
// é só uma conta com o relógio do aparelho: por isso o tempo CONTINUA
// PASSANDO com o jogo fechado.
//
// Tudo que depende da hora pergunta aqui:
//   TEMPO.agora()      → { dia, hora, minuto, segundo }  (dia 1 = dia da chegada)
//   TEMPO.ehNoite()    → true/false
//   TEMPO.idade()      → { anos, meses, dias, totalDias } do bebê
//   TEMPO.textoIdade() → "3 dias", "5 meses", "1 ano e 2 meses"...
// =============================================================

const TEMPO = {
  // Quantos milissegundos reais dura 1 minuto do jogo
  msPorMinuto() {
    const T = CONFIG.TEMPO;
    return (T.DIAS_REAIS_POR_ANO * 24 * 60 * 60 * 1000) / (365 * 24 * 60);
  },

  // Minutos do jogo desde a chegada do bebê (0 antes da chegada)
  minutosDeVida(agoraReal = Date.now()) {
    const s = Estado.dados || Estado.carregar();
    if (!s || !s.chegadaReal) return 0;
    return Math.max(0, (agoraReal - s.chegadaReal) / TEMPO.msPorMinuto());
  },

  // A hora do jogo agora
  agora() {
    const total = CONFIG.TEMPO.HORA_CHEGADA * 60 + TEMPO.minutosDeVida();
    const noDia = total % (24 * 60);
    return {
      dia: Math.floor(total / (24 * 60)) + 1,
      hora: Math.floor(noDia / 60),
      minuto: Math.floor(noDia % 60),
      segundo: Math.floor((noDia * 60) % 60)
    };
  },

  // true entre NOITE_COMECA e DIA_COMECA (ver CONFIG.JANELA)
  ehNoite() {
    const J = CONFIG.JANELA;
    const h = TEMPO.agora().hora;
    return h < J.DIA_COMECA || h >= J.NOITE_COMECA;
  },

  // Idade do bebê (ano de 365 dias, mês = 1/12 do ano)
  idade() {
    const totalDias = Math.floor(TEMPO.minutosDeVida() / (24 * 60));
    const anos = Math.floor(totalDias / 365);
    const resto = totalDias - anos * 365;
    const meses = Math.floor(resto / (365 / 12));
    const dias = Math.floor(resto - meses * (365 / 12));
    return { anos, meses, dias, totalDias };
  },

  // Idade escrita do jeito que a gente fala
  textoIdade(sexo) {
    const i = TEMPO.idade();
    const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
    if (i.totalDias === 0) return sexo === 'F' ? 'recém-nascida' : 'recém-nascido';
    if (i.anos === 0 && i.meses === 0) return plural(i.dias, 'dia', 'dias');
    if (i.anos === 0) return plural(i.meses, 'mês', 'meses');
    if (i.meses === 0) return plural(i.anos, 'ano', 'anos');
    return plural(i.anos, 'ano', 'anos') + ' e ' + plural(i.meses, 'mês', 'meses');
  },

  // Escreve um tempo REAL (ms) de um jeito curto: "40 min", "2 h 10 min", "3 dias e 4 h"
  textoReal(ms) {
    const min = Math.floor(ms / 60000);
    if (min < 60) return min + ' min';
    const h = Math.floor(min / 60);
    if (h < 24) return h + ' h' + (min % 60 ? ' ' + (min % 60) + ' min' : '');
    const d = Math.floor(h / 24);
    return (d === 1 ? '1 dia' : d + ' dias') + (h % 24 ? ' e ' + (h % 24) + ' h' : '');
  },

  // Escreve um tempo DO JOGO (minutos) de um jeito curto: "9 horas", "3 dias", "2 meses"
  textoJogo(minutos) {
    const h = Math.floor(minutos / 60);
    if (h < 1) return Math.floor(minutos) + ' minutos';
    if (h < 24) return h === 1 ? '1 hora' : h + ' horas';
    const d = Math.floor(h / 24);
    if (d < 31) return d === 1 ? '1 dia' : d + ' dias';
    const m = Math.floor(d / (365 / 12));
    if (m < 12) return m === 1 ? '1 mês' : m + ' meses';
    const a = Math.floor(d / 365);
    return a === 1 ? '1 ano' : a + ' anos';
  },

  // TESTE: adianta o relógio do jogo (empurra a chegada para trás)
  adiantar(minutosDoJogo) {
    const s = Estado.dados || Estado.carregar();
    if (!s || !s.chegadaReal) return;
    s.chegadaReal -= minutosDoJogo * TEMPO.msPorMinuto();
    Estado.salvar();
  }
};

// =============================================================
// VISITA — guarda no save a última vez que o jogador esteve aqui
// (save.ultimaVez) e avisa quando ele volta depois de um tempo fora.
//
// - A cada CONFIG.TEMPO.MARCAR_VISITA_SEGUNDOS, com o jogo na tela,
//   e ao esconder/fechar a página, grava ultimaVez = agora.
// - Ao abrir o jogo: VISITA.foraAoAbrir = quanto tempo ficou fora.
// - Ao voltar para a aba/app sem recarregar: emite o evento 'voltou'
//   no jogo (o quarto mostra o aviso).
// =============================================================
const VISITA = {
  foraAoAbrir: 0,     // ms fora antes de abrir o jogo (o quarto mostra e zera)

  iniciar() {
    const s = Estado.carregar();
    if (s && s.ultimaVez && s.bebeRecebido) VISITA.foraAoAbrir = Math.max(0, Date.now() - s.ultimaVez);
    VISITA.marcar();

    setInterval(() => { if (document.visibilityState === 'visible') VISITA.marcar(); },
      CONFIG.TEMPO.MARCAR_VISITA_SEGUNDOS * 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { VISITA.marcar(); return; }
      const s = Estado.dados && Estado.carregar();
      if (!s || !s.ultimaVez) return;
      const fora = Date.now() - s.ultimaVez;
      VISITA.marcar();
      if (typeof jogo !== 'undefined') jogo.events.emit('voltou', fora);
    });
    window.addEventListener('pagehide', () => VISITA.marcar());
  },

  marcar() {
    if (!Estado.dados) return;      // nenhuma história em andamento nesta sessão
    const s = Estado.carregar();    // lê de novo do save, para não gravar por cima com dados velhos
    if (!s) return;
    s.ultimaVez = Date.now();
    Estado.salvar();
  },

  // Já ficou fora tempo suficiente para mostrar o aviso?
  valeAvisar(ms) {
    return ms >= CONFIG.TEMPO.AVISO_VOLTA_MINUTOS * 60000;
  }
};

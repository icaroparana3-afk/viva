// =============================================================
// seguranca.js — protege o jogo contra a "tela preta" (v0.0.47).
//
// A tela preta aparecia às vezes no celular depois de "Levar para o berço".
// Dois motivos possíveis, os dois tratados aqui:
//
// 1. O TECLADO DO CELULAR. Ao digitar o nome, o celular empurra a página
//    para cima para o campo aparecer. Quando o campo some de repente
//    (o jogo destrói o campo ao levar o bebê), alguns celulares, iPhone
//    principalmente, não devolvem a página para o lugar: o jogo fica fora
//    da tela e sobra só o fundo preto. → SEGURANCA.consertarTela() põe
//    tudo de volta e manda o Phaser medir a tela de novo.
//
// 2. A TRANSIÇÃO TRAVADA. Toda troca de tela escurece até o preto e a tela
//    nova clareia. Se a tela nova não começar (ou não clarear), ficaria preto
//    para sempre. → SEGURANCA.vigiarTroca() confere logo depois e destrava.
//
// Se mesmo assim o jogo parar de desenhar (um erro no código), aparece um
// aviso com o erro e "Toque para continuar" (recarrega; o save não se perde).
// =============================================================

const SEGURANCA = {
  ultimoErro: '',

  // Devolve a página para o lugar e remede a tela (depois do teclado fechar)
  consertarTela() {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (typeof jogo !== 'undefined' && jogo.scale) jogo.scale.refresh();
    } catch (e) { /* nada */ }
  },

  // Chama consertarTela algumas vezes enquanto o teclado termina de fechar
  depoisDoTeclado() {
    [0, 120, 350, 700, 1200].forEach(ms => setTimeout(() => SEGURANCA.consertarTela(), ms));
  },

  // Depois de uma troca de tela: a tela nova abriu e clareou? Se não, destrava.
  vigiarTroca(chave, dados) {
    const espera = CONFIG.TRANSICAO_SEGUNDOS * 1000 + 2500;
    setTimeout(() => {
      if (typeof jogo === 'undefined' || document.visibilityState !== 'visible') return;
      const cena = jogo.scene.getScene(chave);
      if (!cena) return;
      SEGURANCA.consertarTela();
      if (!jogo.scene.isActive(chave) && !jogo.scene.getScenes(true).length) {
        jogo.scene.start(chave, dados);           // nenhuma tela ativa: abre de novo
        return;
      }
      const cam = cena.cameras && cena.cameras.main;
      if (cam && cam.fadeEffect && !cam.fadeEffect.isRunning && cam.fadeEffect.alpha > 0.5) {
        cam.resetFX();                            // ficou no escuro: clareia
      }
    }, espera);
  },

  // Aviso por cima de tudo quando o jogo parou de desenhar
  mostrarTravou() {
    if (document.getElementById('viva-travou')) return;
    const d = document.createElement('div');
    d.id = 'viva-travou';
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#1a0f22;color:#ffd860;' +
      'font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'text-align:center;padding:24px;gap:14px;font-size:16px;';
    d.innerHTML = '<div>O jogo travou :(</div><div style="color:#fff">Toque para continuar.<br>Seu bebê está salvo.</div>' +
      '<div style="color:#b07ad6;font-size:11px;max-width:300px;word-break:break-word">' +
      (SEGURANCA.ultimoErro ? 'Erro (mande uma foto disto): ' + SEGURANCA.ultimoErro.replace(/</g, '&lt;') : '') +
      ' · v' + CONFIG.VERSAO + '</div>';
    d.addEventListener('click', () => location.reload());
    document.body.appendChild(d);
  },

  iniciar() {
    window.addEventListener('error', e => {
      SEGURANCA.ultimoErro = (e.message || 'erro') + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : '');
    });
    window.addEventListener('unhandledrejection', e => { SEGURANCA.ultimoErro = String(e.reason); });

    // Teclado fechou / tela mudou de tamanho: sem campo de texto em uso, põe a página no lugar
    const aoMudar = () => {
      const foco = document.activeElement;
      if (!foco || foco.tagName !== 'INPUT') SEGURANCA.consertarTela();
    };
    window.addEventListener('resize', aoMudar);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', aoMudar);
    document.addEventListener('focusout', () => setTimeout(aoMudar, 300));

    // O jogo continua desenhando? (só confere com a página na tela)
    let quadro = -1, parado = 0, visivelDesde = Date.now();
    document.addEventListener('visibilitychange', () => { visivelDesde = Date.now(); parado = 0; });
    setInterval(() => {
      if (typeof jogo === 'undefined' || !jogo.loop || document.visibilityState !== 'visible') return;
      if (Date.now() - visivelDesde < 3000) { quadro = jogo.loop.frame; return; }
      if (jogo.loop.frame === quadro) parado++; else parado = 0;
      quadro = jogo.loop.frame;
      if (parado >= 3) SEGURANCA.mostrarTravou();
    }, 1000);
  }
};

SEGURANCA.iniciar();

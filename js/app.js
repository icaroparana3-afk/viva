// =============================================================
// app.js — o Viva como APLICATIVO (Etapa 7, PWA).
//
// - Liga o "service worker" (sw.js): guarda o jogo no aparelho para
//   abrir sem internet e permite instalar na tela inicial.
// - APP.instalar(): mostra o pedido de instalação do navegador
//   (Chrome/Android). No iPhone não existe esse pedido: o jogador
//   usa Compartilhar → "Adicionar à Tela de Início".
// =============================================================

const APP = {
  pedido: null,     // o pedido de instalação guardado (só Chrome/Android/PC)

  iniciar() {
    // Só funciona em http(s) (Live Server e GitHub Pages); abrindo o arquivo direto, não.
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(e => console.warn('Service worker não ligou:', e));
      });
    }
    // O navegador avisa quando o jogo pode ser instalado: guarda para o botão usar
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); APP.pedido = e; });
    window.addEventListener('appinstalled', () => { APP.pedido = null; });
  },

  // Já está rodando como app instalado (aberto pelo ícone)?
  instalado() {
    return window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  },

  ehIphone() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },

  // Tenta instalar. Devolve um texto para mostrar quando não dá para pedir direto.
  async instalar() {
    if (APP.instalado()) return 'O Viva já está\ninstalado!';
    if (APP.pedido) {
      APP.pedido.prompt();
      const r = await APP.pedido.userChoice;
      APP.pedido = null;
      return r.outcome === 'accepted' ? null : 'Tudo bem! Dá para\ninstalar depois.';
    }
    if (APP.ehIphone()) return 'No Safari, toque em\nCompartilhar e depois\n"Adicionar à Tela\nde Início"';
    return 'No menu ⋮ do Chrome,\ntoque em "Instalar app"\nou "Adicionar à tela\ninicial"';
  }
};

APP.iniciar();

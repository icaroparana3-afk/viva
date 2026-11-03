// =============================================================
// Boot.js — primeira cena do jogo.
// Hoje: só mostra "Viva" no centro e a versão no rodapé.
// Nas próximas etapas: carrega os desenhos e sons e abre o Menu.
// =============================================================

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot'); // nome da cena
  }

  create() {
    const meioX = CONFIG.LARGURA / 2;
    const meioY = CONFIG.ALTURA / 2;

    // Título no centro (provisório: depois troca pelo seu logo em pixel art)
    this.add.text(meioX, meioY, 'Viva', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: CONFIG.COR_TEXTO
    }).setOrigin(0.5); // 0.5 = o ponto de referência é o meio do texto

    // Versão no rodapé
    this.add.text(meioX, CONFIG.ALTURA - 6, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: CONFIG.COR_TEXTO_FRACO
    }).setOrigin(0.5, 1);
  }
}

// =============================================================
// main.js — liga o Phaser com as regras fixas do projeto.
// =============================================================

const jogo = new Phaser.Game({
  type: Phaser.AUTO,          // o Phaser escolhe o melhor jeito de desenhar
  parent: 'game',             // desenha dentro da <div id="game">
  width: CONFIG.LARGURA,      // 180
  height: CONFIG.ALTURA,      // 320
  pixelArt: true,             // pixels nítidos, sem borrar
  backgroundColor: CONFIG.COR_FUNDO,
  scale: {
    mode: Phaser.Scale.FIT,               // amplia até caber na tela, sem cortar
    autoCenter: Phaser.Scale.CENTER_BOTH  // centraliza
  },
  scene: [Boot, Menu, Configuracoes] // lista de cenas (vai crescer a cada etapa)
});

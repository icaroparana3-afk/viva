// =============================================================
// main.js — liga o Phaser com as regras fixas do projeto.
// =============================================================

const jogo = new Phaser.Game({
  type: Phaser.AUTO,          // o Phaser escolhe o melhor jeito de desenhar
  parent: 'game',             // desenha dentro da <div id="game">
  // Tela interna ESCALA vezes maior (ver "NITIDEZ" no config.js).
  // O código e os desenhos continuam usando 180 x 320.
  width: CONFIG.LARGURA * CONFIG.ESCALA,
  height: CONFIG.ALTURA * CONFIG.ESCALA,
  pixelArt: true,             // pixels nítidos, sem borrar
  backgroundColor: CONFIG.COR_FUNDO,
  // Permite colocar campos de texto de verdade (HTML) por cima do jogo.
  // É o que faz o teclado do celular abrir na tela de Perfil.
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.FIT,               // amplia até caber na tela, sem cortar
    autoCenter: Phaser.Scale.CENTER_BOTH  // centraliza
  },
  scene: [Boot, Carregando, Menu, Perfil, Regiao, Cegonha, Quarto, Configuracoes, TesteBebe] // lista de cenas (vai crescer a cada etapa)
});

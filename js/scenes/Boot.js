// =============================================================
// Boot.js — primeira cena: carrega todos os desenhos e abre o Menu.
// Enquanto carrega, mostra "Viva" e uma barrinha de progresso.
// =============================================================

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const meioX = CONFIG.LARGURA / 2;
    const meioY = CONFIG.ALTURA / 2;

    // Título enquanto carrega
    this.add.text(meioX, meioY - 20, 'Viva', {
      fontFamily: 'monospace', fontSize: '32px', color: CONFIG.COR_TEXTO
    }).setOrigin(0.5);

    // Barra de progresso: um contorno e um preenchimento que cresce
    this.add.rectangle(meioX, meioY + 20, 102, 6).setStrokeStyle(1, 0xf4f4f4);
    const barra = this.add.rectangle(meioX - 50, meioY + 20, 0, 4, 0xf4f4f4).setOrigin(0, 0.5);
    this.load.on('progress', p => { barra.width = Math.round(100 * p); });

    // ---------- Desenhos do menu ----------
    this.load.image('menu_ceu', './assets/ui/menu_ceu.png');
    this.load.image('menu_montanhas', './assets/ui/menu_montanhas.png');
    this.load.image('nuvem1', './assets/sprites/nuvem1.png');
    this.load.image('nuvem2', './assets/sprites/nuvem2.png');
    this.load.image('casal', './assets/sprites/casal.png');
    this.load.spritesheet('passaro', './assets/sprites/passaro.png', { frameWidth: 8, frameHeight: 8 });

    // ---------- Botões ----------
    this.load.image('botao_nova_historia', './assets/ui/botao_nova_historia.png');
    this.load.image('botao_continuar_historia', './assets/ui/botao_continuar_historia.png');
    this.load.image('botao_configuracoes', './assets/ui/botao_configuracoes.png');
    this.load.image('botao_voltar', './assets/ui/botao_voltar.png');
  }

  create() {
    // Animação do pássaro batendo asas (quadros 0, 1, 2 e volta)
    this.anims.create({
      key: 'passaro_voando',
      frames: this.anims.generateFrameNumbers('passaro', { frames: [0, 1, 2, 1] }),
      frameRate: CONFIG.MENU.PASSARO_QUADROS_POR_SEG,
      repeat: -1
    });

    this.scene.start('Menu');
  }
}

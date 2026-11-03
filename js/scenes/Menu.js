// =============================================================
// Menu.js — tela inicial com o pôr do sol, o casal e os 3 botões.
// Camadas (de trás para frente):
//   céu com sol → nuvens → montanhas e grama → casal → pássaro → botões
// =============================================================

class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const M = CONFIG.MENU;

    // ---------- Cenário ----------
    this.add.image(0, 0, 'menu_ceu').setOrigin(0, 0);

    // Nuvens (posições iguais às do menu antigo)
    this.nuvem1 = this.add.image(14, 52, 'nuvem1').setOrigin(0, 0);
    this.nuvem2 = this.add.image(124, 84, 'nuvem2').setOrigin(0, 0);
    this.nuvem1.posX = this.nuvem1.x; // posição "de verdade", com casas decimais
    this.nuvem2.posX = this.nuvem2.x;

    this.add.image(0, 0, 'menu_montanhas').setOrigin(0, 0);
    this.add.image(66, 275, 'casal').setOrigin(0, 0);

    // Pássaro: começa escondido e aparece de tempos em tempos
    this.passaro = this.add.sprite(-10, 60, 'passaro').setOrigin(0, 0).play('passaro_voando');
    this.passaro.setVisible(false);
    this.passaro.voando = false;
    this.agendarPassaro();

    // ---------- Botões ----------
    criarBotao(this, 35, 120, 'botao_nova_historia', () => this.novaHistoria());
    criarBotao(this, 35, 146, 'botao_continuar_historia', () => this.continuarHistoria(), temSave());
    criarBotao(this, 35, 172, 'botao_configuracoes', () => this.scene.start('Configuracoes'));

    // Versão no rodapé (discreta)
    this.add.text(CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.6);
  }

  // Roda a cada quadro. "delta" = milissegundos desde o quadro anterior.
  update(time, delta) {
    const seg = delta / 1000;
    const M = CONFIG.MENU;

    // Nuvens andam para a direita; ao sair pela direita, voltam pela esquerda
    for (const [nuvem, vel] of [[this.nuvem1, M.NUVEM1_VELOCIDADE], [this.nuvem2, M.NUVEM2_VELOCIDADE]]) {
      nuvem.posX += vel * seg;
      if (nuvem.posX > CONFIG.LARGURA) nuvem.posX = -nuvem.width;
      nuvem.x = Math.round(nuvem.posX); // sempre em pixel inteiro
    }

    // Pássaro atravessando
    if (this.passaro.voando) {
      this.passaro.posX += M.PASSARO_VELOCIDADE * seg;
      this.passaro.x = Math.round(this.passaro.posX);
      if (this.passaro.x > CONFIG.LARGURA) {
        this.passaro.voando = false;
        this.passaro.setVisible(false);
        this.agendarPassaro();
      }
    }
  }

  // Espera um tempo sorteado e solta o pássaro pela esquerda
  agendarPassaro() {
    const M = CONFIG.MENU;
    const espera = Phaser.Math.Between(M.PASSARO_INTERVALO_MIN, M.PASSARO_INTERVALO_MAX) * 1000;
    this.time.delayedCall(espera, () => {
      this.passaro.posX = -8;
      this.passaro.x = -8;
      this.passaro.y = Phaser.Math.Between(M.PASSARO_ALTURA_MIN, M.PASSARO_ALTURA_MAX);
      this.passaro.setVisible(true);
      this.passaro.voando = true;
    });
  }

  novaHistoria() {
    // Etapa 2 vai abrir a tela de Perfil aqui. Por enquanto, só um aviso.
    this.avisar('Em breve: Perfil');
  }

  continuarHistoria() {
    // Etapa 6 vai carregar o save aqui.
    this.avisar('Em breve: Continuar');
  }

  // Mensagem curta que aparece e some
  avisar(texto) {
    if (this.aviso) this.aviso.destroy();
    this.aviso = this.add.text(CONFIG.LARGURA / 2, 205, texto, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
      backgroundColor: '#1a1c2c', padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0);
    this.tweens.add({ targets: this.aviso, alpha: 0, delay: 1200, duration: 400 });
  }
}

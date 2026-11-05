// =============================================================
// Quarto.js — o quarto com o berço e o bebê (Etapa 5).
//
// Camadas (de trás para frente):
//   fundo do quarto → berço (trás) → bebê → berço (frente) → coração → botões
// A grade da frente do berço fica NA FRENTE do bebê: ele parece estar dentro.
//
// O bebê: respira (sobe 1 px e desce), pisca de vez em quando e,
// ao ser tocado, dá um pulinho e solta um coração.
// Necessidades (fome, sede, sono...) entram a partir da Etapa 8.
// =============================================================

class Quarto extends Phaser.Scene {
  constructor() {
    super('Quarto');
  }

  // dados.chegou = true quando vem direto da cegonha (mostra boas-vindas)
  init(dados) {
    this.chegou = !!(dados && dados.chegou);
  }

  create() {
    prepararCamera(this);
    const Q = CONFIG.QUARTO;

    const save = Estado.carregar();
    if (!save || !save.bebe) { this.scene.start('Menu'); return; } // segurança
    this.bebe = save.bebe;

    // ---------- Quarto e berço ----------
    this.add.image(0, 0, 'quarto_fundo').setOrigin(0, 0);
    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_tras').setOrigin(0, 0);

    // ---------- Bebê (camadas do autor) ----------
    this.visual = criarBebeVisual(this, Q.BEBE_X, Q.BEBE_Y, 1).mostrar(this.bebe);
    // Área de toque do bebê (um pouco maior que ele, fácil de acertar com o dedo)
    const toque = this.add.zone(Q.BEBE_X - 2, Q.BEBE_Y - 2, 36, 36).setOrigin(0, 0).setInteractive();
    toque.on('pointerup', () => this.tocarBebe());

    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_frente').setOrigin(0, 0);

    // ---------- Topo: botão de voltar ao menu ----------
    criarOpcao(this, 4, 4, 34, 14, 'Menu', () => this.scene.start('Menu'), 8);

    escrever(this, CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.6);

    if (this.chegou) {
      mostrarAviso(this, this.bebe.sexo === 'F' ? 'Sua filha chegou!' : 'Seu filho chegou!', 120);
    }

    // ---------- Vida do bebê ----------
    this.tempo = 0;
    this.pulo = 0;        // altura atual do pulinho (pixels)
    this.agendarPiscada();
  }

  update(time, delta) {
    const Q = CONFIG.QUARTO;
    this.tempo += delta / 1000;
    // Respirar: metade do tempo 1 px para cima, metade no lugar
    const respira = (this.tempo % Q.RESPIRAR_SEGUNDOS) < Q.RESPIRAR_SEGUNDOS / 2 ? 0 : -1;
    this.visual.setPosition(Q.BEBE_X, Q.BEBE_Y + respira - Math.round(this.pulo));
  }

  agendarPiscada() {
    const Q = CONFIG.QUARTO;
    const espera = Phaser.Math.FloatBetween(Q.PISCAR_MIN, Q.PISCAR_MAX) * 1000;
    this.time.delayedCall(espera, () => {
      this.visual.piscar(true);
      this.time.delayedCall(Q.PISCAR_DURACAO * 1000, () => {
        this.visual.piscar(false);
        this.agendarPiscada();
      });
    });
  }

  // Toque no bebê: pulinho + coração subindo
  tocarBebe() {
    const Q = CONFIG.QUARTO;
    if (this.pulando) return;
    this.pulando = true;
    this.tweens.add({
      targets: this, pulo: Q.PULINHO_PIXELS, duration: 120, yoyo: true, ease: 'Sine.easeOut',
      onComplete: () => { this.pulo = 0; this.pulando = false; }
    });
    const c = this.add.image(Q.BEBE_X + 16, Q.BEBE_Y - 2, 'coracao').setOrigin(0.5, 1);
    c.posY = c.y;
    this.tweens.add({
      targets: c, posY: c.y - 18, alpha: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: () => { c.y = Math.round(c.posY); },
      onComplete: () => c.destroy()
    });
  }
}

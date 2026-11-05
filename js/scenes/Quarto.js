// =============================================================
// Quarto.js — o quarto com o berço e o bebê (Etapa 5).
//
// Camadas (de trás para frente):
//   céu da janela → quarto (menina ou menino) → berço (trás) → bebê
//   → berço (frente) → escuro da noite → coração → botões
// O vidro da janela é transparente no desenho do quarto: o céu que
// aparece ali é desenhado pelo jogo (dia: céu claro e nuvens passando;
// noite: céu escuro, estrelas piscando e lua).
//
// O bebê: respira (sobe 1 px e desce), pisca de vez em quando e,
// ao ser tocado, dá um pulinho e solta um coração.
// Abajur (criado-mudo à direita) será o botão de dormir — etapa do sono.
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

    // ---------- Janela: o mundo lá fora (fica ATRÁS do quarto) ----------
    this.criarJanela();

    // ---------- Quarto e berço ----------
    this.add.image(0, 0, this.bebe.sexo === 'F' ? 'quarto_menina' : 'quarto_menino').setOrigin(0, 0);
    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_tras').setOrigin(0, 0);

    // ---------- Bebê (camadas do autor) ----------
    this.visual = criarBebeVisual(this, Q.BEBE_X, Q.BEBE_Y, 1).mostrar(this.bebe);
    // Área de toque do bebê (um pouco maior que ele, fácil de acertar com o dedo)
    const toque = this.add.zone(Q.BEBE_X - 2, Q.BEBE_Y - 2, 36, 36).setOrigin(0, 0).setInteractive();
    toque.on('pointerup', () => this.tocarBebe());

    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_frente').setOrigin(0, 0);

    // ---------- Escuro da noite (por cima do quarto, abaixo dos botões) ----------
    this.escuro = this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x0b0d2a, 1)
      .setOrigin(0, 0).setAlpha(0);

    // ---------- Topo: botão de voltar ao menu ----------
    criarOpcao(this, 4, 4, 34, 14, 'Menu', () => this.scene.start('Menu'), 8);

    escrever(this, CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.6);

    if (this.chegou) {
      mostrarAviso(this, this.bebe.sexo === 'F' ? 'Sua filha chegou!' : 'Seu filho chegou!', Q.AVISO_Y);
    }

    // ---------- Dia ou noite ----------
    this.forcado = false;                 // true depois do toque de teste na janela
    this.noite = this.ehNoite();
    this.aplicarPeriodo(this.noite, 0);
    // De tempos em tempos confere a hora (se virou noite enquanto o jogo está aberto)
    this.time.addEvent({
      delay: 30000, loop: true,
      callback: () => { if (!this.forcado && this.ehNoite() !== this.noite) this.aplicarPeriodo(!this.noite); }
    });

    // TESTE (até a Etapa 6): tocar na janela troca dia/noite
    if (CONFIG.JANELA.TESTE_TOQUE_JANELA) {
      const J = CONFIG.JANELA;
      this.add.zone(J.X, J.Y, J.LARGURA, J.ALTURA).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => { this.forcado = true; this.aplicarPeriodo(!this.noite); });
    }

    // ---------- Vida do bebê ----------
    this.tempo = 0;
    this.pulo = 0;        // altura atual do pulinho (pixels)
    this.agendarPiscada();
  }

  // ---------- Janela ----------
  criarJanela() {
    const J = CONFIG.JANELA;
    const cor = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;
    const faixas = (alto, baixo) => [
      this.add.rectangle(J.X, J.Y, J.LARGURA, J.FAIXA_ALTURA, cor(alto)).setOrigin(0, 0),
      this.add.rectangle(J.X, J.Y + J.FAIXA_ALTURA, J.LARGURA, J.ALTURA - J.FAIXA_ALTURA, cor(baixo)).setOrigin(0, 0)
    ];

    // Dia: céu claro + nuvens passando
    this.dia = this.add.container(0, 0, faixas(J.CEU_DIA_ALTO, J.CEU_DIA_BAIXO));
    this.nuvens = [];
    for (let i = 0; i < J.NUVENS; i++) {
      const n = this.add.image(0, 0, i % 2 ? 'nuvem_janela2' : 'nuvem_janela1').setOrigin(0, 0);
      this.sortearNuvem(n, true);
      this.dia.add(n);
      this.nuvens.push(n);
    }

    // Noite: céu escuro + estrelas piscando + lua
    this.noiteCeu = this.add.container(0, 0, faixas(J.CEU_NOITE_ALTO, J.CEU_NOITE_BAIXO));
    for (let i = 0; i < J.ESTRELAS; i++) {
      const e = this.add.rectangle(
        Phaser.Math.Between(J.X + 1, J.X + J.LARGURA - 2),
        Phaser.Math.Between(J.Y + 1, J.Y + J.ALTURA - 3), 1, 1, 0xfff6d0).setOrigin(0, 0);
      this.noiteCeu.add(e);
      this.tweens.add({
        targets: e, alpha: 0.25, yoyo: true, repeat: -1,
        duration: Phaser.Math.Between(700, 1800), delay: Phaser.Math.Between(0, 1500)
      });
    }
    this.noiteCeu.add(this.add.image(J.LUA_X, J.LUA_Y, 'lua').setOrigin(0, 0));
  }

  // Coloca uma nuvem num ponto de partida (à esquerda da janela) com velocidade sorteada.
  // espalhar = true na primeira vez: já começa em qualquer ponto da janela.
  sortearNuvem(n, espalhar) {
    const J = CONFIG.JANELA;
    n.posX = espalhar
      ? Phaser.Math.Between(J.X - n.width, J.X + J.LARGURA)
      : J.X - n.width - Phaser.Math.Between(0, 20);
    n.y = Phaser.Math.Between(J.Y + 2, J.Y + J.ALTURA - n.height - 6);
    n.vel = Phaser.Math.FloatBetween(J.NUVEM_VELOCIDADE_MIN, J.NUVEM_VELOCIDADE_MAX);
    n.x = Math.round(n.posX);
  }

  ehNoite() {
    const J = CONFIG.JANELA;
    const h = new Date().getHours();
    return h < J.DIA_COMECA || h >= J.NOITE_COMECA;
  }

  // Passa para dia ou noite (segundos = duração da passagem; 0 = na hora)
  aplicarPeriodo(noite, segundos = CONFIG.JANELA.TROCA_SEGUNDOS) {
    this.noite = noite;
    const J = CONFIG.JANELA;
    const alvo = [
      [this.dia, noite ? 0 : 1],
      [this.noiteCeu, noite ? 1 : 0],
      [this.escuro, noite ? J.NOITE_ESCURECER : 0]
    ];
    for (const [obj, a] of alvo) {
      this.tweens.killTweensOf(obj);
      if (segundos === 0) obj.setAlpha(a);
      else this.tweens.add({ targets: obj, alpha: a, duration: segundos * 1000 });
    }
  }

  update(time, delta) {
    const Q = CONFIG.QUARTO;
    const seg = delta / 1000;
    this.tempo += seg;

    // Nuvens atravessam a janela devagar (fora do vidro ficam escondidas atrás da parede)
    const J = CONFIG.JANELA;
    for (const n of this.nuvens) {
      n.posX += n.vel * seg;
      if (n.posX > J.X + J.LARGURA) this.sortearNuvem(n, false);
      n.x = Math.round(n.posX);
    }

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

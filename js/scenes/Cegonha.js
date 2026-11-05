// =============================================================
// Cegonha.js — a cegonha traz o bebê (Etapa 4).
//
// 1. O bebê é sorteado (BEBE.gerar) e guardado no save LOGO NO COMEÇO:
//    se o jogador fechar o jogo aqui, volta o MESMO bebê.
// 2. A cegonha entra voando com a trouxinha no bico e fica pairando,
//    segurando, até o jogador tocar na tela.
//    Regra: ela NUNCA solta nem derruba o bebê. A trouxinha é desenhada
//    presa ao bico em todo quadro (sem física, sem queda).
// 3. Ao tocar: aparece o bebê, só com o sexo (e a origem, se for especial).
// 4. "Levar para o berço": a cegonha sai voando com o bebê e o save marca
//    o bebê como recebido. O quarto chega na Etapa 5.
// =============================================================

class Cegonha extends Phaser.Scene {
  constructor() {
    super('Cegonha');
  }

  create() {
    prepararCamera(this);
    const K = CONFIG.CEGONHA;

    // ---------- Bebê: sorteia uma vez só e guarda ----------
    const dados = Estado.carregar();
    if (!dados) { this.scene.start('Menu'); return; }   // segurança: sem perfil não há cegonha
    if (!dados.bebe) {
      dados.bebe = BEBE.gerar(dados.perfil.regiao);
      dados.bebeRecebido = false;
      Estado.salvar();
    }
    this.bebe = dados.bebe;

    // ---------- Cenário (o mesmo do menu, sem piquenique) ----------
    this.add.image(0, 0, 'menu_ceu').setOrigin(0, 0);
    this.nuvens = [
      Object.assign(this.add.image(14, 52, 'nuvem1').setOrigin(0, 0), { posX: 14, vel: CONFIG.MENU.NUVEM1_VELOCIDADE }),
      Object.assign(this.add.image(124, 84, 'nuvem2').setOrigin(0, 0), { posX: 124, vel: CONFIG.MENU.NUVEM2_VELOCIDADE })
    ];
    this.add.image(0, 0, 'menu_montanhas').setOrigin(0, 0);
    for (const s of CONFIG.SOMBRAS) {
      if (s.quem === 'arvore' || s.quem === 'moita') this.add.image(s.x, s.y, 'sombra_' + s.tipo).setAlpha(s.opacidade);
    }
    this.add.image(0, 195, 'arvore_esquerda').setOrigin(0, 0);
    this.add.image(140, 191, 'arvore_direita').setOrigin(0, 0);
    this.add.image(0, 286, 'moita_esquerda').setOrigin(0, 0);
    this.add.image(144, 274, 'moita_direita').setOrigin(0, 0);

    // ---------- Cegonha + trouxinha (presa no bico) ----------
    this.cegonha = this.add.sprite(CONFIG.LARGURA + 10, K.PARADA_Y - 30, 'cegonha', 0)
      .setOrigin(0, 0).play('cegonha_voando');
    this.trouxinha = this.add.image(0, 0, 'trouxinha').setOrigin(0.5, 0);
    this.cegonha.posX = this.cegonha.x;
    this.cegonha.posY = this.cegonha.y;
    this.prenderTrouxinha();

    // Texto de dica (aparece quando ela para)
    this.dica = escrever(this, CONFIG.LARGURA / 2, 150, 'Toque para receber\nseu bebê', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff', align: 'center',
      stroke: '#2a1838', strokeThickness: 3
    }).setOrigin(0.5, 0).setAlpha(0);

    // ---------- Entrada voando ----------
    this.fase = 'chegando';
    this.tempo = 0;
    this.tweens.add({
      targets: this.cegonha,
      posX: K.PARADA_X,
      posY: K.PARADA_Y,
      duration: K.ENTRADA_SEGUNDOS * 1000,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.fase = 'pairando';
        this.tweens.add({ targets: this.dica, alpha: 1, duration: 400 });
        this.tweens.add({ targets: this.dica, alpha: 0.4, duration: 700, yoyo: true, repeat: -1, delay: 400 });
      }
    });

    // Toque em qualquer lugar (só vale com ela parada)
    this.input.on('pointerup', () => { if (this.fase === 'pairando') this.receber(); });
  }

  // A trouxinha acompanha o bico em todo quadro: nunca cai.
  prenderTrouxinha() {
    const K = CONFIG.CEGONHA;
    this.trouxinha.x = this.cegonha.x + K.BICO_X;
    this.trouxinha.y = this.cegonha.y + K.BICO_Y - 1; // o nó fica 1 px acima do bico
  }

  update(time, delta) {
    const seg = delta / 1000;
    const K = CONFIG.CEGONHA;
    this.tempo += seg;

    for (const n of this.nuvens) {
      n.posX += n.vel * seg;
      if (n.posX > CONFIG.LARGURA) n.posX = -n.width;
      n.x = Math.round(n.posX);
    }

    // Pairando: sobe e desce devagar
    const balanco = (this.fase === 'pairando' || this.fase === 'revelando')
      ? Math.sin(this.tempo * K.BALANCO_POR_SEG * 2 * Math.PI) * K.BALANCO_PIXELS : 0;
    this.cegonha.x = Math.round(this.cegonha.posX);
    this.cegonha.y = Math.round(this.cegonha.posY + balanco);
    this.prenderTrouxinha();
  }

  // ---------- Toque: mostra o bebê ----------
  receber() {
    this.fase = 'revelando';
    this.tweens.killTweensOf(this.dica);
    this.dica.setVisible(false);

    const U = CONFIG.UI;
    const b = this.bebe;
    const itens = [];
    const fundo = this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x000000, 0.45).setOrigin(0, 0).setDepth(20);
    const painel = this.add.rectangle(14, 140, 152, 150, 0x2a1838, 0.92).setOrigin(0, 0)
      .setStrokeStyle(1, U.CAIXA_ESCOLHIDA).setDepth(21);
    itens.push(fundo, painel);

    // O bebê (as camadas do autor, 2×)
    const visual = criarBebeVisual(this, 58, 146, 2).mostrar(b).setDepth(22);

    const fonte = (tam, cor) => ({ fontFamily: 'monospace', fontSize: tam + 'px', color: cor, align: 'center' });
    const menina = b.sexo === 'F';
    const linhas = [escrever(this, 90, 212, menina ? 'É uma menina!' : 'É um menino!', fonte(11, U.TEXTO))];
    // A origem só é revelada se for especial (regra do DESIGN)
    if (BEBE.revelaOrigem(b)) {
      const nome = { alienigena: 'alienígena', vampiro: menina ? 'vampira' : 'vampiro', lobisomem: 'lobisomem' }[b.especial];
      linhas.push(escrever(this, 90, 228, (menina ? 'E ela é uma ' : 'E ele é um ') + nome + '!', fonte(8, '#ff9cf0')));
    }
    linhas.push(escrever(this, 90, BEBE.revelaOrigem(b) ? 242 : 232, 'Nasceu ' + BEBE.ondeNasceu(b), fonte(7, U.TEXTO_FRACO)));
    linhas.forEach(l => l.setOrigin(0.5, 0).setDepth(22));

    // Entrada suave
    [fundo, painel, ...linhas].forEach(o => { const a = o.alpha; o.setAlpha(0); this.tweens.add({ targets: o, alpha: a, duration: 300 }); });
    visual.setAlpha(0);
    this.tweens.addCounter({ from: 0, to: 1, duration: 300, onUpdate: t => visual.setAlpha(t.getValue()) });

    const botao = criarOpcao(this, 30, 262, 120, 18, 'Levar para o berço', () => {
      [fundo, painel, ...linhas].forEach(o => o.destroy());
      visual.destroy();
      botao.caixa.destroy(); botao.rotulo.destroy();
      this.levarParaBerco();
    }, 8);
    botao.caixa.setDepth(22); botao.rotulo.setDepth(23);
  }

  // ---------- A cegonha leva o bebê (sem soltar) ----------
  levarParaBerco() {
    this.fase = 'saindo';
    const K = CONFIG.CEGONHA;
    this.tweens.add({
      targets: this.cegonha,
      posX: -CONFIG.CEGONHA.LARGURA - 10,
      posY: K.PARADA_Y - 40,
      duration: K.SAIDA_SEGUNDOS * 1000,
      ease: 'Sine.easeIn',
      onComplete: () => {
        const dados = Estado.carregar();
        dados.bebeRecebido = true;
        Estado.salvar();
        // O quarto (com o berço) chega na Etapa 5.
        this.scene.start('Menu', { avisar: 'O bebê está no berço!' });
      }
    });
  }
}

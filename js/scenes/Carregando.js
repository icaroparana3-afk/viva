// =============================================================
// Carregando.js — tela de carregamento.
// Fundo: o cenário do menu PARADO (sem botões, crianças, animal,
// estrela cadente e pássaro). A mamadeira do autor enche conforme
// os desenhos carregam: 0% vazia → 100% cheia.
// Depois prepara animações e desenhos provisórios e abre o Menu.
// =============================================================

class Carregando extends Phaser.Scene {
  constructor() {
    super('Carregando');
  }

  preload() {
    prepararCamera(this);
    const K = CONFIG.CARREGAMENTO;
    this.inicio = Date.now();

    // ---------- Cenário parado (mesmas posições do Menu) ----------
    this.add.image(0, 0, 'menu_ceu').setOrigin(0, 0);
    this.add.image(14, 52, 'nuvem1').setOrigin(0, 0);
    this.add.image(124, 84, 'nuvem2').setOrigin(0, 0);
    this.add.image(0, 0, 'menu_montanhas').setOrigin(0, 0);
    this.add.image(CONFIG.PIQUENIQUE.TOALHA_X, CONFIG.PIQUENIQUE.TOALHA_Y, 'toalha').setOrigin(0, 0);
    for (const s of CONFIG.SOMBRAS) {
      if (s.quem === 'casal' || s.quem === 'animal') continue; // eles não aparecem aqui
      this.add.image(s.x, s.y, 'sombra_' + s.tipo).setOrigin(0.5, 0.5).setAlpha(s.opacidade);
    }
    this.add.image(0, 195, 'arvore_esquerda').setOrigin(0, 0);
    this.add.image(140, 191, 'arvore_direita').setOrigin(0, 0);
    this.add.image(0, 286, 'moita_esquerda').setOrigin(0, 0);
    this.add.image(144, 274, 'moita_direita').setOrigin(0, 0);
    this.add.image(CONFIG.PIQUENIQUE.CESTA_X, CONFIG.PIQUENIQUE.CESTA_Y, 'cesta').setOrigin(0, 0);
    this.add.image(53, 15, 'texto_titulo').setOrigin(0, 0);

    // ---------- Mamadeira ----------
    this.ultimoQuadro = 17; // quadro da mamadeira cheia
    this.mamadeira = this.add.sprite(K.MAMADEIRA_X, K.MAMADEIRA_Y, 'mamadeira', 0)
      .setOrigin(0, 0).setScale(K.MAMADEIRA_ESCALA);
    const largM = 16 * K.MAMADEIRA_ESCALA, altM = 32 * K.MAMADEIRA_ESCALA;
    this.txtPorcento = escrever(this, K.MAMADEIRA_X + largM / 2, K.MAMADEIRA_Y + altM + 4, '0%', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(0.5, 0).setVisible(K.MOSTRAR_PORCENTAGEM);

    this.mostrado = 0; // porcentagem que aparece (0 a 1)
    // Enquanto carrega: mostra o progresso real, mas sem passar do tempo
    // (assim, se carregar num piscar de olhos, a mamadeira não enche de uma vez).
    this.load.on('progress', p => {
      const tempo = (Date.now() - this.inicio) / 1000 / K.TEMPO_MINIMO;
      this.mostrar(Math.min(p, tempo));
    });

    // ---------- Todo o resto do jogo ----------
    this.load.image('casal', './assets/sprites/casal.png');
    this.load.spritesheet('passaro', './assets/sprites/passaro.png', { frameWidth: 8, frameHeight: 8 });

    this.load.image('botao_nova_historia', './assets/ui/botao_nova_historia.png');
    this.load.image('botao_continuar_historia', './assets/ui/botao_continuar_historia.png');
    this.load.image('botao_configuracoes', './assets/ui/botao_configuracoes.png');
    this.load.image('botao_voltar', './assets/ui/botao_voltar.png');
    this.load.image('botao_levar_berco', './assets/ui/botao_levar_berco.png');
    this.load.image('botao_menu', './assets/ui/botao_menu.png');

    // Desenhos que só carregam quando estiverem prontos (ver CONFIG.ARTES_PRONTAS)
    const P = CONFIG.ARTES_PRONTAS;
    if (P.botoes_som) {
      ['botao_musica', 'botao_musica_off', 'botao_som', 'botao_som_off']
        .forEach(nome => this.load.image(nome, './assets/ui/' + nome + '.png'));
    }
    if (P.animal) {
      this.load.spritesheet('animal', './assets/sprites/animal.png',
        { frameWidth: CONFIG.ANIMAL.LARGURA, frameHeight: CONFIG.ANIMAL.ALTURA });
    }
    if (P.folha) this.load.spritesheet('folha', './assets/sprites/folha.png', { frameWidth: 4, frameHeight: 4 });
    if (P.vento) this.load.image('vento', './assets/sprites/vento.png');
    // Quarto (desenhos do autor): um para menina, outro para menino, e o berço
    this.load.image('quarto_menina', './assets/ui/quarto_menina.png');
    this.load.image('quarto_menino', './assets/ui/quarto_menino.png');
    this.load.image('berco_tras', './assets/sprites/berco_tras.png');
    this.load.image('berco_frente', './assets/sprites/berco_frente.png');
    if (P.janela) {
      ['nuvem_janela1', 'nuvem_janela2', 'lua'].forEach(nome => this.load.image(nome, './assets/sprites/' + nome + '.png'));
    }
    if (P.coracao) this.load.image('coracao', './assets/sprites/coracao.png');
    // Cegonha do autor (2 quadros, já com a trouxinha no bico)
    this.load.spritesheet('cegonha', './assets/sprites/cegonha.png',
      { frameWidth: CONFIG.CEGONHA.LARGURA, frameHeight: CONFIG.CEGONHA.ALTURA });

    // Bebê (camadas: a cor é aplicada pelo código)
    ['bebe_corpo', 'bebe_brilho', 'bebe_cabelo', 'bebe_olhos', 'bebe_contorno',
     'bebe_extra_alienigena', 'bebe_extra_vampiro', 'bebe_extra_lobisomem']
      .forEach(nome => this.load.image(nome, './assets/sprites/' + nome + '.png'));

    // Perfil
    this.load.image('mapa_brasil', './assets/ui/mapa_brasil.png');
    ['botao_proximo', 'botao_comecar',
     'botao_papai', 'botao_papai_sel', 'botao_mamae', 'botao_mamae_sel',
     'botao_sim', 'botao_sim_sel', 'botao_nao', 'botao_nao_sel',
     'fundo_perfil', 'texto_seu_perfil', 'texto_sua_regiao', 'texto_nome', 'texto_voce_e'
    ].forEach(nome => this.load.image(nome, './assets/ui/' + nome + '.png'));
  }

  // Mostra uma porcentagem (0 a 1) na mamadeira. Nunca volta para trás.
  mostrar(p) {
    this.mostrado = Math.max(this.mostrado, Math.min(1, p));
    this.mamadeira.setFrame(Math.round(this.mostrado * this.ultimoQuadro));
    this.txtPorcento.setText(Math.round(this.mostrado * 100) + '%');
  }

  create() {
    // Animação do pássaro batendo asas (quadros 0, 1, 2 e volta)
    this.anims.create({
      key: 'passaro_voando',
      frames: this.anims.generateFrameNumbers('passaro', { frames: [0, 1, 2, 1] }),
      frameRate: CONFIG.MENU.PASSARO_QUADROS_POR_SEG,
      repeat: -1
    });

    // Estrela cadente (desenhada por código) e desenhos provisórios
    criarTexturaEstrela(this);
    const P = CONFIG.ARTES_PRONTAS;
    if (!P.botoes_som) criarBotoesSomProvisorios(this);
    if (!P.animal) criarAnimalProvisorio(this);
    if (!P.folha) criarFolhaProvisoria(this);
    if (!P.vento) criarVentoProvisorio(this);
    if (!P.janela) criarJanelaProvisoria(this);
    if (!P.coracao) criarCoracaoProvisorio(this);
    criarPalpebrasBebe(this);   // pálpebras do bebê (feitas a partir dos olhos do desenho do autor)

    // Animações do animal e da folha
    const A = CONFIG.ANIMAL;
    this.anims.create({
      key: 'animal_parado',
      frames: this.anims.generateFrameNumbers('animal', { frames: A.QUADROS_PARADO }),
      frameRate: A.PARADO_QUADROS_POR_SEG,
      repeat: -1
    });
    this.anims.create({
      key: 'animal_acao',
      frames: this.anims.generateFrameNumbers('animal', { frames: A.QUADROS_ACAO }),
      frameRate: A.ACAO_QUADROS_POR_SEG,
      repeat: 0
    });
    this.anims.create({
      key: 'folha_girando',
      frames: this.anims.generateFrameNumbers('folha', { frames: [0, 1, 2, 3] }),
      frameRate: CONFIG.VENTO.FOLHA_QUADROS_POR_SEG,
      repeat: -1
    });

    // Cegonha batendo asas (quadros 0 e 1)
    this.anims.create({
      key: 'cegonha_voando',
      frames: this.anims.generateFrameNumbers('cegonha', { frames: [0, 1] }),
      frameRate: CONFIG.CEGONHA.QUADROS_POR_SEG,
      repeat: -1
    });

    // Lê as opções de música/efeitos guardadas
    Opcoes.carregar();

    // Prepara o mapa para saber qual região foi tocada (ver js/mapa.js)
    MAPA.preparar(this);

    // Se carregou muito rápido, a mamadeira termina de encher com calma
    // até completar o TEMPO_MINIMO. Depois abre o Menu.
    const passou = (Date.now() - this.inicio) / 1000;
    const falta = Math.max(0.3, CONFIG.CARREGAMENTO.TEMPO_MINIMO - passou);
    const estado = { p: this.mostrado }; // continua de onde parou (nunca volta)
    this.tweens.add({
      targets: estado,
      p: 1,
      duration: falta * 1000,
      onUpdate: () => this.mostrar(estado.p),
      onComplete: () => this.time.delayedCall(250, () => this.scene.start('Menu'))
    });
  }
}

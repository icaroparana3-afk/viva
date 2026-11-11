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
    if (P.mamadeira_bebe) this.load.image('mamadeira_bebe', './assets/sprites/mamadeira_bebe.png');
    if (P.icones_necessidades16) {
      this.load.spritesheet('icones_necessidades16', './assets/ui/icones_necessidades16.png', { frameWidth: 16, frameHeight: 16 });
    }
    if (P.humor) this.load.spritesheet('humor', './assets/ui/humor.png', { frameWidth: 12, frameHeight: 12 });
    if (P.x_nao) this.load.image('x_nao', './assets/ui/x_nao.png');
    if (P.maozinha) this.load.spritesheet('maozinha', './assets/ui/maozinha.png', { frameWidth: 18, frameHeight: 18 });
    if (P.selo_esgotado) this.load.image('selo_esgotado', './assets/ui/selo_esgotado.png');   // v0.0.61: 1 selo só, 8×8 (do autor)
    if (P.sinais) {   // Etapa 8.2: sinais de cuidado
      this.load.spritesheet('selos', './assets/ui/selos.png', { frameWidth: 8, frameHeight: 8 });
      this.load.image('balao_pedido', './assets/ui/balao_pedido.png');
      this.load.image('bebe_choro', './assets/sprites/bebe_choro.png');
      this.load.image('bebe_esgotado', './assets/sprites/bebe_esgotado.png');
    }
    if (P.botao_necessidades) this.load.image('botao_necessidades', './assets/ui/botao_necessidades.png');
    if (P.painel_necessidades) {
      ['painel_necessidades', 'linha_necessidade',
        'linha_necessidade_sel', 'moldura_icone', 'botao_fechar']
        .forEach(nome => this.load.image(nome, './assets/ui/' + nome + '.png'));
    }
    // Sons (Etapa 30): só carregam quando os arquivos existirem
    // v0.0.58: sons provisórios (sintetizados) para tudo o que o autor ainda não mandou
    const doAutor = [...(P.sons ? ['abrir', 'clique'] : []), ...(P.sons_choro ? ['choro', 'choro_forte'] : [])];
    CONFIG.SONS_PROVISORIOS.filter(n => !doAutor.includes(n))
      .forEach(nome => this.load.audio(nome, './assets/audio/provisorios/' + nome + '.wav'));
    if (P.sons) ['abrir', 'clique'].forEach(nome => this.load.audio(nome, './assets/audio/' + nome + '.mp3'));
    if (P.sons_choro) ['choro', 'choro_forte'].forEach(nome =>
      this.load.audio(nome, ['./assets/audio/' + nome + '.ogg', './assets/audio/' + nome + '.mp3']));
    // Quarto (desenhos do autor): um para menina, outro para menino, e o berço
    this.load.image('quarto_menina', './assets/ui/quarto_menina.png');
    this.load.image('quarto_menino', './assets/ui/quarto_menino.png');
    this.load.image('quadros_parede', './assets/sprites/quadros_parede.png');                      // v0.0.50: 56×50, do autor
    // Eventos do bebê (v0.0.57): só carrega o que o autor já desenhou
    const EV = CONFIG.ARTES_PRONTAS;
    if (EV.balao_pensamento) this.load.image('balao_pensamento', './assets/sprites/balao_pensamento.png');
    if (EV.pensamentos) this.load.spritesheet('pensamentos', './assets/sprites/pensamentos.png', { frameWidth: 12, frameHeight: 12 });
    if (EV.chocalho) this.load.spritesheet('chocalho', './assets/sprites/chocalho.png', { frameWidth: 12, frameHeight: 12 });
    if (EV.curativo) this.load.image('curativo', './assets/sprites/curativo.png');
    if (EV.galo) this.load.image('galo', './assets/sprites/galo.png');
    if (EV.icone_curativo) this.load.image('icone_curativo', './assets/ui/icone_curativo.png');
    // Clima, visitas, festa e álbum (v0.0.58)
    if (EV.sol_janela) this.load.image('sol_janela', './assets/sprites/sol_janela.png');
    if (EV.raio_janela) this.load.image('raio_janela', './assets/sprites/raio_janela.png');
    if (EV.borboleta) this.load.spritesheet('borboleta', './assets/sprites/borboleta.png', { frameWidth: 7, frameHeight: 6 });
    if (EV.abelha) this.load.spritesheet('abelha', './assets/sprites/abelha.png', { frameWidth: 7, frameHeight: 6 });
    if (EV.balao_visita) this.load.image('balao_visita', './assets/sprites/balao_visita.png');
    if (EV.folha_seca) this.load.spritesheet('folha_seca', './assets/sprites/folha_seca.png', { frameWidth: 5, frameHeight: 5 });
    if (EV.bolo) this.load.spritesheet('bolo', './assets/sprites/bolo.png', { frameWidth: 14, frameHeight: 14 });
    // v0.0.60: festa, gato e álbum com os desenhos do autor
    if (EV.bolos_autor) ['menino', 'menina'].forEach(q =>
      this.load.spritesheet('bolo_' + q, './assets/sprites/bolo_' + q + '.png', { frameWidth: 14, frameHeight: 14 }));
    if (EV.mesa_festa) ['menino', 'menina'].forEach(q => this.load.image('mesa_' + q, './assets/sprites/mesa_' + q + '.png'));
    if (EV.gato_susto) this.load.image('gato_susto', './assets/sprites/gato_susto.png');
    if (EV.icones_album_autor) ['dodoi', 'primavera', 'soluco'].forEach(n => this.load.image('album_' + n, './assets/ui/album_' + n + '.png'));
    if (EV.botoes_album) ['botao_voltar_album', 'seta_esquerda', 'seta_esquerda_off', 'seta_direita', 'seta_direita_off'].forEach(n =>
      this.load.image(n, './assets/ui/' + n + '.png'));
    if (EV.icones_album) this.load.spritesheet('icones_album', './assets/ui/icones_album.png', { frameWidth: 12, frameHeight: 12 });
    if (EV.botao_album) this.load.image('botao_album', './assets/ui/botao_album.png');
    this.load.spritesheet('gato', './assets/sprites/gato_prateleira.png', { frameWidth: CONFIG.QUARTO.GATO_LARGURA, frameHeight: CONFIG.QUARTO.GATO_ALTURA });  // v0.0.56: 10 quadros 19×20 (animação do autor reduzida), toca em loop
    this.load.image('berco_tras', './assets/sprites/berco_tras.png');
    this.load.image('berco_frente', './assets/sprites/berco_frente.png');
    for (const quarto of ['menina', 'menino']) {
      CONFIG.BRINQUEDOS[quarto].forEach(b =>
        this.load.image('brinquedo_' + quarto + '_' + b.nome, './assets/sprites/brinquedo_' + quarto + '_' + b.nome + '.png'));
    }
    this.load.image('abajur_aceso_menina', './assets/sprites/abajur_aceso_menina.png');
    this.load.image('abajur_aceso_menino', './assets/sprites/abajur_aceso_menino.png');
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
    if (!P.mamadeira_bebe) criarMamadeiraBebeProvisoria(this);
    if (!P.icones_necessidades16) criarIcones16Provisorios(this);
    criarSinaisProvisorios(this);   // só cria os que ainda não chegaram do autor
    criarAlertaMini(this);      // "!" do botão de necessidades (feito por código)
    this.anims.create({ key: 'maozinha_aponta', frames: this.anims.generateFrameNumbers('maozinha', { frames: [0, 1] }),
      frameRate: 3, repeat: -1 });
    criarPainelNecessidadesProvisorio(this);   // só cria as peças que ainda não chegaram
    criarClimaProvisorio(this);      // v0.0.58: sol, raio, visitas, folha seca, bolo, ícones do álbum
    criarEventosProvisorios(this);   // v0.0.57: nuvem, pensamentos, chocalho, curativo, galo (só os que faltam)
    criarLuzAbajur(this);       // brilho do abajur (feito por código)
    criarEstrelinha(this);      // estrelinha da festa de chegada
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
      onComplete: () => this.time.delayedCall(250, () => irPara(this, 'Menu'))
    });
  }
}

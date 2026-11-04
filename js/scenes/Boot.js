// =============================================================
// Boot.js — primeira cena: carrega todos os desenhos e abre o Menu.
// Enquanto carrega, mostra "Viva" e uma barrinha de progresso.
// =============================================================

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    prepararCamera(this);
    const meioX = CONFIG.LARGURA / 2;
    const meioY = CONFIG.ALTURA / 2;

    // Título enquanto carrega
    escrever(this, meioX, meioY - 20, 'Viva', {
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
    this.load.image('texto_titulo', './assets/ui/texto_titulo.png');

    // Botões de música e efeitos (16×16). Só carrega quando os desenhos existirem.
    if (CONFIG.MENU.BOTOES_SOM_DESENHADOS) {
      ['botao_musica', 'botao_musica_off', 'botao_som', 'botao_som_off']
        .forEach(nome => this.load.image(nome, './assets/ui/' + nome + '.png'));
    }

    // ---------- Perfil ----------
    this.load.image('mapa_brasil', './assets/ui/mapa_brasil.png');
    // Botões das telas de Perfil, Região e confirmação ("_sel" = versão selecionada)
    ['botao_proximo', 'botao_comecar',
     'botao_papai', 'botao_papai_sel', 'botao_mamae', 'botao_mamae_sel',
     'botao_sim', 'botao_sim_sel', 'botao_nao', 'botao_nao_sel',
     'fundo_perfil', 'texto_seu_perfil', 'texto_sua_regiao', 'texto_nome', 'texto_voce_e'
    ].forEach(nome => this.load.image(nome, './assets/ui/' + nome + '.png'));
  }

  create() {
    // Animação do pássaro batendo asas (quadros 0, 1, 2 e volta)
    this.anims.create({
      key: 'passaro_voando',
      frames: this.anims.generateFrameNumbers('passaro', { frames: [0, 1, 2, 1] }),
      frameRate: CONFIG.MENU.PASSARO_QUADROS_POR_SEG,
      repeat: -1
    });

    // Estrela cadente (desenhada por código) e botões de som provisórios
    criarTexturaEstrela(this);
    if (!CONFIG.MENU.BOTOES_SOM_DESENHADOS) criarBotoesSomProvisorios(this);

    // Lê as opções de música/efeitos guardadas
    Opcoes.carregar();

    // Prepara o mapa para saber qual região foi tocada (ver js/mapa.js)
    MAPA.preparar(this);

    this.scene.start('Menu');
  }
}

// ---------- Estrela cadente ----------
// Uma cabeça branca e um rastro que vai sumindo, na diagonal
// (2 pixels para o lado a cada 1 para baixo, como no modelo do autor).
// Ela cai para a esquerda: a cabeça fica no canto de baixo à esquerda.
function criarTexturaEstrela(cena) {
  const larg = 16, alt = 8;
  const tex = cena.textures.createCanvas('estrela_cadente', larg, alt);
  const ctx = tex.getContext();
  for (let i = 0; i < larg; i++) {
    const x = i, y = alt - 1 - Math.floor(i / 2);
    const forca = 1 - i / larg;                 // 1 na cabeça, quase 0 na ponta
    if (i < 2) ctx.fillStyle = '#ffffff';
    else ctx.fillStyle = 'rgba(214,200,255,' + (forca * 0.9).toFixed(2) + ')';
    ctx.fillRect(x, y, 1, 1);
  }
  // brilho em volta da cabeça
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(0, alt - 2, 1, 1);
  ctx.fillRect(1, alt - 1, 1, 1);
  tex.refresh();
}

// ---------- Botões de som provisórios (até chegar o desenho do autor) ----------
// Quadrados 16×16 nas cores dos botões, com uma nota musical ou um alto-falante.
function criarBotoesSomProvisorios(cena) {
  const nota = [
    '..........',
    '....#####.',
    '....#...#.',
    '....#...#.',
    '....#...#.',
    '..###.###.',
    '.####.###.',
    '..##......'
  ];
  const falante = [
    '....#.....',
    '...##..#..',
    '####...#.#',
    '####.#.#.#',
    '####.#.#.#',
    '####...#.#',
    '...##..#..',
    '....#.....'
  ];
  const fazer = (nome, desenho, ligado) => {
    const tex = cena.textures.createCanvas(nome, 16, 16);
    const ctx = tex.getContext();
    ctx.fillStyle = '#2a1838'; ctx.fillRect(0, 0, 16, 16);              // contorno
    ctx.fillStyle = ligado ? '#7b4aa6' : '#4a2a66'; ctx.fillRect(1, 1, 14, 13); // fundo
    ctx.fillStyle = ligado ? '#ffd860' : '#8a6aa6';
    desenho.forEach((linha, y) => {
      for (let x = 0; x < linha.length; x++) if (linha[x] === '#') ctx.fillRect(3 + x, 3 + y, 1, 1);
    });
    if (!ligado) {                                                      // risco de "desligado"
      ctx.fillStyle = '#ff6e8c';
      for (let i = 0; i < 11; i++) ctx.fillRect(2 + i, 12 - i, 1, 1);
    }
    tex.refresh();
  };
  fazer('botao_musica', nota, true);
  fazer('botao_musica_off', nota, false);
  fazer('botao_som', falante, true);
  fazer('botao_som_off', falante, false);
}

// =============================================================
// Boot.js — primeira cena: carrega só o cenário e a mamadeira
// e abre a tela de carregamento (Carregando.js), que carrega o resto.
// =============================================================

class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Só o necessário para a tela de carregamento (poucos arquivos, abre rápido).
    this.load.image('menu_ceu', './assets/ui/menu_ceu.png');
    this.load.image('menu_montanhas', './assets/ui/menu_montanhas.png');
    this.load.image('texto_titulo', './assets/ui/texto_titulo.png');
    this.load.image('nuvem1', './assets/sprites/nuvem1.png');
    this.load.image('nuvem2', './assets/sprites/nuvem2.png');
    ['arvore_esquerda', 'arvore_direita', 'moita_esquerda', 'moita_direita', 'toalha', 'cesta']
      .forEach(nome => this.load.image(nome, './assets/sprites/' + nome + '.png'));
    // Mamadeira: 18 quadros de 16×32 (0 = vazia, 17 = cheia), feitos a partir do desenho do autor
    this.load.spritesheet('mamadeira', './assets/ui/mamadeira_carregando.png', { frameWidth: 16, frameHeight: 32 });
    if (CONFIG.ARTES_PRONTAS.sombras) {
      ['sombra_grande', 'sombra_media', 'sombra_pequena']
        .forEach(nome => this.load.image(nome, './assets/sprites/' + nome + '.png'));
    }
  }

  create() {
    if (!CONFIG.ARTES_PRONTAS.sombras) criarSombrasProvisorias(this);
    this.scene.start('Carregando');
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

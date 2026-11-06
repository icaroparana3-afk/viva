// =============================================================
// provisorios.js — desenhos PROVISÓRIOS feitos por código.
//
// Cada função aqui cria, no mesmo nome e tamanho, um substituto
// simples para um desenho que o autor ainda vai fazer.
// Quando o desenho de verdade chega, o item em CONFIG.ARTES_PRONTAS
// vira true e estas funções deixam de ser usadas.
// =============================================================

// Pinta um "mapa de pixels" (lista de textos) num canvas.
// Cada letra é uma cor da paleta; '.' é transparente.
function pintarPixels(ctx, mapa, paleta, dx = 0, dy = 0) {
  mapa.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x++) {
      const cor = paleta[linha[x]];
      if (!cor) continue;
      ctx.fillStyle = cor;
      ctx.fillRect(dx + x, dy + y, 1, 1);
    }
  });
}

// Registra os quadros de uma folha de sprites feita por código,
// para as animações funcionarem igual a um spritesheet carregado.
function registrarQuadros(tex, larg, alt, quantos) {
  for (let i = 0; i < quantos; i++) tex.add(i, 0, i * larg, 0, larg, alt);
}

// ---------- Animal (coelho provisório) ----------
// 8 quadros de 16×16: 0–3 parado (respira, pisca, mexe o nariz),
// 4–7 ação (um pulinho no lugar). Ele olha para a esquerda (para o casal).
function criarAnimalProvisorio(cena) {
  const A = CONFIG.ANIMAL;
  const tex = cena.textures.createCanvas('animal', A.LARGURA * 8, A.ALTURA);
  const ctx = tex.getContext();
  const paleta = { o: '#3a2a34', b: '#d8cfc6', s: '#a89a92', w: '#ffffff', e: '#1a1420', n: '#ff9cc0', i: '#f0b0b8' };

  // Coelho sentado, 16×16 (orelhas em pé)
  const base = [
    '................',
    '.....o.o........',
    '....obobo.......',
    '....obobo.......',
    '....oioio.......',
    '....obobo.......',
    '...obbbbbo......',
    '..obebbbbbo.....',
    '.nbbbbbbbbbooo..',
    '..obbbbbbbbbbbo.',
    '...osbbbbbbbbwwo',
    '...osbbbbbbbbwwo',
    '...osbbbbbbbbbo.',
    '...osssbbbssbbo.',
    '....oooooooooo..',
    '................'
  ];
  const trocar = (mapa, y, x, letra) => {
    const m = mapa.slice();
    m[y] = m[y].substring(0, x) + letra + m[y].substring(x + 1);
    return m;
  };
  const piscar = trocar(base, 7, 3, 'b');                 // olho fechado
  const nariz = trocar(trocar(base, 8, 1, '.'), 8, 2, 'n'); // nariz mexendo
  const orelhaBaixa = trocar(trocar(base, 1, 7, '.'), 2, 7, 'o'); // orelha de trás abaixa

  // [mapa, quanto sobe (pixels)]
  const quadros = [
    [base, 0], [base, 0], [piscar, 0], [nariz, 0],          // parado
    [orelhaBaixa, 0], [base, 2], [base, 3], [base, 1]       // ação: pulinho
  ];
  quadros.forEach(([mapa, sobe], i) => pintarPixels(ctx, mapa, paleta, i * A.LARGURA, -sobe));
  tex.refresh();
  registrarQuadros(tex, A.LARGURA, A.ALTURA, 8);
}

// ---------- Folha voando (4 quadros de 4×4, girando) ----------
function criarFolhaProvisoria(cena) {
  const tex = cena.textures.createCanvas('folha', 16, 4);
  const ctx = tex.getContext();
  const paleta = { a: '#8cbc58', b: '#4f803c' };
  const quadros = [
    ['.aa.', 'aaab', 'bab.', '.b..'],
    ['..a.', '.aab', 'aab.', '.b..'],
    ['....', 'aaab', 'bbb.', '....'],
    ['.a..', '.aa.', '.ab.', '..b.']
  ];
  quadros.forEach((mapa, i) => pintarPixels(ctx, mapa, paleta, i * 4, 0));
  tex.refresh();
  registrarQuadros(tex, 4, 4, 4);
}

// ---------- Risco de vento (24×3) ----------
// Uma linha clara que some nas pontas.
function criarVentoProvisorio(cena) {
  const tex = cena.textures.createCanvas('vento', 24, 3);
  const ctx = tex.getContext();
  for (let x = 0; x < 24; x++) {
    const meio = 1 - Math.abs(x - 12) / 12;             // 0 nas pontas, 1 no meio
    ctx.fillStyle = 'rgba(255,240,255,' + (0.7 * meio).toFixed(2) + ')';
    ctx.fillRect(x, x < 14 ? 1 : (x < 20 ? 0 : 1), 1, 1); // leve curva para cima
  }
  ctx.fillStyle = 'rgba(255,240,255,0.25)';
  ctx.fillRect(4, 2, 6, 1);
  tex.refresh();
}

// ---------- Sombras (elipses escuras com borda em pixel) ----------
// A transparência final vem de CONFIG.SOMBRAS (opacidade).
function criarSombrasProvisorias(cena) {
  const tamanhos = { sombra_grande: [52, 6], sombra_media: [28, 5], sombra_pequena: [14, 3] };
  for (const [nome, [larg, alt]] of Object.entries(tamanhos)) {
    const tex = cena.textures.createCanvas(nome, larg, alt);
    const ctx = tex.getContext();
    const cx = (larg - 1) / 2, cy = (alt - 1) / 2;
    for (let y = 0; y < alt; y++) {
      for (let x = 0; x < larg; x++) {
        const d = ((x - cx) / (larg / 2)) ** 2 + ((y - cy) / (alt / 2)) ** 2;
        if (d > 1) continue;
        // miolo mais escuro, borda mais clara (duas faixas, sem degradê)
        ctx.fillStyle = d < 0.45 ? 'rgba(20,16,36,1)' : 'rgba(20,16,36,0.6)';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    tex.refresh();
  }
}

// ---------- Coraçãozinho (Etapa 5) ----------
//   coracao  7×6  sobe quando o bebê é tocado
function criarCoracaoProvisorio(cena) {
  const t = cena.textures.createCanvas('coracao', 7, 6);
  pintarPixels(t.getContext(), ['.oo.oo.', 'orroiro', 'orrrrro', '.orrro.', '..oro..', '...o...'],
    { o: '#2a1838', r: '#ff6e8c', i: '#ffc8d2' });
  t.refresh();
}

// ---------- Estrelinha da festa (chegada do bebê) ----------
//   estrelinha  5×5  brilho em cruz, amarelo
function criarEstrelinha(cena) {
  const t = cena.textures.createCanvas('estrelinha', 5, 5);
  pintarPixels(t.getContext(), ['..a..', '..y..', 'ayway', '..y..', '..a..'],
    { w: '#ffffff', y: '#ffd860', a: '#e8a640' });
  t.refresh();
}

// ---------- O mundo lá fora da janela do quarto (Etapa 5) ----------
//   nuvem_janela1  12×5   nuvem maior que passa de dia
//   nuvem_janela2  8×4    nuvem menor
//   lua            5×5    lua crescente da noite
// Mesmas cores da nuvem que o autor desenhou na janela.
function criarJanelaProvisoria(cena) {
  const cores = { w: '#ffffff', s: '#e5f6f1', b: '#b3cfce', y: '#f6efc0', z: '#d8cf96' };
  let t = cena.textures.createCanvas('nuvem_janela1', 12, 5);
  pintarPixels(t.getContext(), [
    '....ww......',
    '..wwwwww.w..',
    '.wwwwwwwwww.',
    'wwwwwwwwwwww',
    '.bbbbbbbbbb.'
  ], cores);
  t.refresh();
  t = cena.textures.createCanvas('nuvem_janela2', 8, 4);
  pintarPixels(t.getContext(), [
    '..ww....',
    '.wwwwww.',
    'wwwwwwww',
    '.bbbbbb.'
  ], cores);
  t.refresh();
  t = cena.textures.createCanvas('lua', 5, 5);
  pintarPixels(t.getContext(), [
    '.yyy.',
    'yy...',
    'yz...',
    'yy...',
    '.yyy.'
  ], cores);
  t.refresh();
}

// ---------- Luz do abajur (Etapa 5) ----------
//   luz_abajur  120×96  brilho em anéis (estilo pixel), mais forte no meio
// A cor é aplicada pelo jogo (CONFIG.QUARTO.LUZ_COR); aqui é branco com transparência.
function criarLuzAbajur(cena) {
  const L = 120, A = 96;
  const t = cena.textures.createCanvas('luz_abajur', L, A);
  const c = t.getContext();
  // Anéis: [raio, opacidade]. Na divisa entre dois anéis, xadrez (dithering) para ficar com cara de pixel art.
  const aneis = [[16, 0.4], [28, 0.26], [42, 0.15], [58, 0.07]];
  for (let y = 0; y < A; y++) for (let x = 0; x < L; x++) {
    const dx = (x + 0.5 - L / 2), dy = (y + 0.5 - A / 2) * 1.25;   // um pouco mais larga que alta
    const d = Math.sqrt(dx * dx + dy * dy);
    let alfa = 0;
    for (let i = 0; i < aneis.length; i++) {
      const [r, a] = aneis[i];
      if (d < r - 1.5) { alfa = a; break; }
      if (d < r + 1.5) { alfa = ((x + y) % 2) ? a : (aneis[i + 1] ? aneis[i + 1][1] : 0); break; }
    }
    if (!alfa) continue;
    c.fillStyle = 'rgba(255,255,255,' + alfa + ')';
    c.fillRect(x, y, 1, 1);
  }
  t.refresh();
}

// ---------- Pálpebras do bebê (piscar) ----------
// Feitas a partir das posições dos olhos no desenho do autor (olhos em x 11–12 e 19–20, linhas 11–13).
//   bebe_palpebras       cobre os olhos com a cor da pele (branco: o jogo pinta com a cor da pele)
//   bebe_olhos_fechados  olho fechado tranquilo, curvinha para baixo (◡ ◡) — piscar
//   bebe_olhos_felizes   olho fechado sorrindo, curvinha para cima (^ ^) — quando é tocado
function criarPalpebrasBebe(cena) {
  const olhos = [10, 18];   // coluna onde começa cada olho (4 px de largura)
  let t = cena.textures.createCanvas('bebe_palpebras', 32, 32);
  let c = t.getContext();
  c.fillStyle = '#ffffff';
  for (const x of olhos) c.fillRect(x, 11, 4, 3);
  t.refresh();
  const desenho = (nome, linhas) => {
    const tx = cena.textures.createCanvas(nome, 32, 32);
    for (const x of olhos) pintarPixels(tx.getContext(), linhas, { o: '#141414' }, x, 12);
    tx.refresh();
  };
  desenho('bebe_olhos_fechados', ['o..o', '.oo.']);
  desenho('bebe_olhos_felizes', ['.oo.', 'o..o']);
}

// ---------- Necessidades do bebê (Etapas 8 e 8.1) ----------
//   mamadeira_bebe        12×7   a mamadeira deitada, bico à esquerda (vai na boca do bebê)
function criarMamadeiraBebeProvisoria(cena) {
  const t = cena.textures.createCanvas('mamadeira_bebe', 12, 7);
  pintarPixels(t.getContext(), [
    '.....ooooooo',
    '...oowmmmmmo',
    '.ootowmmmmmo',
    'ottttwmmmmmo',
    '.ootowmmmmmo',
    '...oowmmmmmo',
    '.....ooooooo'
  ], { o: '#2a1838', t: '#e8b48a', w: '#8fd0ff', m: '#fffbe8' });
  t.refresh();
}

//   icones_necessidades16  80×16  cinco ícones de 16×16 lado a lado:
//                                 fome (maçã), sede (gota), energia (raio), higiene (bolhas), diversão (bola)
function criarIcones16Provisorios(cena) {
  const mapas = [
    [
      '............o...',
      '.......oo..ogo..',
      '......ommoogggo.',
      '....ooommgggoo..',
      '...orrrmmrgro...',
      '..orrrrmmrrrro..',
      '..orrwrrrrrrro..',
      '..orwrrrrrrrro..',
      '.orrwrrrrrrrrro.',
      '.orrrrrrrrrrrro.',
      '.orrrrrrrrrrrro.',
      '.orrrrrrrrrrrro.',
      '..orrrrrrrrrro..',
      '..orrrrrrrrrro..',
      '...orRrrrrrro...',
      '....ooRRRRRo....'
    ],
    [
      '.......oo.......',
      '......obbo......',
      '......obbo......',
      '.....obbbbo.....',
      '.....obbbbo.....',
      '....obbbbbbo....',
      '....obbbbbbo....',
      '...obbbbbbbbo...',
      '...obbwbbbbbo...',
      '..obbwbbbbbbbo..',
      '..obbwbbbbbbbo..',
      '..obbwbbbbbbbo..',
      '..obbbbbbbbbbo..',
      '...obbbbbbbBo...',
      '....obbbbbBo....',
      '.....oBBBBo.....'
    ],
    [
      '.........ooo....',
      '........oyyyo...',
      '.......oywyo....',
      '.......owyyo....',
      '......oywyo.....',
      '.....oywyyooo...',
      '....oywyyyyyyo..',
      '....oywyyyyyo...',
      '...oywyyyyyo....',
      '..oyyyyyyyyo....',
      '...ooooyyyo.....',
      '.....oyyyo......',
      '.....oyyo.......',
      '.....oyyo.......',
      '....oyyo........',
      '....oyo.........'
    ],
    [
      '...........oo...',
      '..........occo..',
      '....oooooocccco.',
      '...occcccocccco.',
      '..occcccccocco..',
      '.occwwcccccoo...',
      'occwcccccccco...',
      'occwcccccccco...',
      'occccccccccco...',
      'occcccccccccoo..',
      'occccccccccCcco.',
      '.occccccccCwccco',
      '..occccccCccccco',
      '...oCCCCCoccccco',
      '....ooooo.occco.',
      '...........ooo..'
    ],
    [
      '......oooo......',
      '....oorrrroo....',
      '...orrrrrrrro...',
      '..orrwrrrrrrro..',
      '.orrwrrrrrrrrro.',
      '.orrwrrrrrrrrro.',
      'oyyyyyyyyyyyyyyo',
      'oyyyyyyyyyyyyyyo',
      'oyyyyyyyyyyyyyyo',
      'oyyyyyyyyyyyyyyo',
      '.obbbbbbbbbbbbo.',
      '.obbbbbbbbbbbbo.',
      '..obbbbbbbbbbo..',
      '...obbbbbbbbo...',
      '....oobbbboo....',
      '......oooo......'
    ]
  ];
  const pal = { o: '#2a1838', r: '#e04848', R: '#a02838', w: '#ffffff', g: '#4fa84a', m: '#7a4a2a',
    b: '#4aa8f0', B: '#2a70c0', y: '#ffd860', c: '#bfe8ff', C: '#7ab8e0' };
  const t = cena.textures.createCanvas('icones_necessidades16', 80, 16);
  mapas.forEach((m, i) => pintarPixels(t.getContext(), m, pal, i * 16, 0));
  registrarQuadros(t, 16, 16, 5);
  t.refresh();
}

// Painel de necessidades (Etapa 8.1), todos em assets/ui:
//   botao_necessidades  26×26   botão sem o coração
//   coracao_necessidades 9×8    coração BRANCO (o jogo pinta a cor)
//   painel_necessidades 164×196 fundo do painel com faixa do título
//   linha_necessidade   156×32  fundo de uma linha (e linha_necessidade_sel, a selecionada)
//   moldura_icone       22×22   moldura clara do ícone
//   botao_fechar        12×12   X
function criarPainelNecessidadesProvisorio(cena) {
  const caixa = (nome, l, a, fundo, borda, extra) => {
    const t = cena.textures.createCanvas(nome, l, a);
    const c = t.getContext();
    c.fillStyle = borda; c.fillRect(0, 0, l, a);
    c.fillStyle = fundo; c.fillRect(1, 1, l - 2, a - 2);
    if (extra) extra(c);
    t.refresh();
  };
  caixa('botao_necessidades', 26, 26, '#2a1838', '#7b4aa6', c => {
    c.fillStyle = '#120a18'; c.fillRect(0, 0, 1, 1); c.fillRect(25, 0, 1, 1); c.fillRect(0, 25, 1, 1); c.fillRect(25, 25, 1, 1);
    c.fillStyle = '#3d2452'; c.fillRect(2, 2, 22, 22);
  });
  let t = cena.textures.createCanvas('coracao_necessidades', 9, 8);
  pintarPixels(t.getContext(), ['.ww...ww.', 'wwww.wwww', 'wwwwwwwww', 'wwwwwwwww', '.wwwwwww.', '..wwwww..', '...www...', '....w....'], { w: '#ffffff' });
  t.refresh();
  caixa('painel_necessidades', 164, 196, '#2a1838', '#7b4aa6', c => {
    c.fillStyle = '#4a2a66'; c.fillRect(1, 1, 162, 16);     // faixa do título
    c.fillStyle = '#7b4aa6'; c.fillRect(1, 17, 162, 1);
  });
  caixa('linha_necessidade', 156, 32, '#3a2150', '#4a3060');
  caixa('linha_necessidade_sel', 156, 32, '#5e3487', '#ffd860');
  caixa('moldura_icone', 22, 22, '#e8d8f0', '#9a7ab8');
  caixa('botao_fechar', 12, 12, '#a03048', '#ffffff', c => {
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) { c.fillRect(3 + i, 3 + i, 1, 1); c.fillRect(8 - i, 3 + i, 1, 1); }
  });
}

// ---------- Sinais de cuidado (Etapa 8.2) ----------
// Mesma paleta e contorno escuro (#2a1838) dos ícones. Tamanhos finais:
//   humor          36×12  3 carinhas 12×12: feliz, entediada, triste
//   selos          32×8   4 selos 8×8: triste, chorando, chorando forte, esgotado
//   balao_pedido   26×24  balão com perninha (ícone 16×16 em 5,2; selo 8×8 em 17,11)
//   x_nao          10×10  X vermelho ("não quero")
//   maozinha       24×12  2 quadros 12×12, apontando para a esquerda
//   bebe_choro     32×32  camada: lágrimas e boca aberta
//   bebe_esgotado  32×32  camada: olhos fechados (e gotinha de suor)
function criarSinaisProvisorios(cena) {
  const o = '#2a1838';
  const pal = { o, y: '#ffd860', Y: '#e8a640', a: '#f6dc8a', b: '#8fc0f0', B: '#5a8ad0', k: '#141414',
    l: '#6ec8ff', r: '#e04848', p: '#ff8aa8', w: '#ffffff', v: '#ff9c8c' };

  // Carinhas 12×12
  const rosto = (cor) => [
    '...oooooo...', '..oCCCCCCo..', '.oCCCCCCCCo.', 'oCCCCCCCCCCo', 'oCCCCCCCCCCo', 'oCCCCCCCCCCo',
    'oCCCCCCCCCCo', 'oCCCCCCCCCCo', 'oCCCCCCCCCCo', '.oCCCCCCCCo.', '..oCCCCCCo..', '...oooooo...'
  ].map(l => l.replace(/C/g, cor));
  const marcar = (mapa, pontos, letra) => {
    const m = mapa.map(l => l.split(''));
    pontos.forEach(([x, y]) => { m[y][x] = letra; });
    return m.map(l => l.join(''));
  };
  let t = cena.textures.createCanvas('humor', 36, 12);
  let c = t.getContext();
  // feliz: olhos e sorriso
  let f = marcar(rosto('y'), [[4, 4], [4, 5], [7, 4], [7, 5], [3, 7], [8, 7], [4, 8], [5, 8], [6, 8], [7, 8]], 'k');
  pintarPixels(c, f, pal, 0, 0);
  // entediada: olhos meio fechados (traço), boca reta
  f = marcar(rosto('a'), [[3, 5], [4, 5], [7, 5], [8, 5], [4, 8], [5, 8], [6, 8], [7, 8]], 'k');
  pintarPixels(c, f, pal, 12, 0);
  // triste: olhos, boca para baixo e uma lágrima
  f = marcar(rosto('b'), [[4, 4], [4, 5], [7, 4], [7, 5], [4, 7], [5, 7], [6, 7], [7, 7], [3, 8], [8, 8]], 'k');
  f = marcar(f, [[3, 6], [3, 7]], 'l');
  pintarPixels(c, f, pal, 24, 0);
  registrarQuadros(t, 12, 12, 3);
  t.refresh();

  // Selos 8×8
  const selo = (cor) => ['..oooo..', '.oCCCCo.', 'oCCCCCCo', 'oCCCCCCo', 'oCCCCCCo', 'oCCCCCCo', '.oCCCCo.', '..oooo..']
    .map(l => l.replace(/C/g, cor));
  t = cena.textures.createCanvas('selos', 32, 8);
  c = t.getContext();
  pintarPixels(c, marcar(selo('b'), [[2, 3], [5, 3], [3, 5], [4, 5], [2, 6], [5, 6]], 'k'), pal, 0, 0);          // triste
  pintarPixels(c, marcar(marcar(selo('b'), [[2, 3], [5, 3], [3, 5], [4, 5]], 'k'), [[1, 4], [6, 4]], 'l'), pal, 8, 0);   // chorando
  pintarPixels(c, marcar(marcar(selo('v'), [[2, 2], [5, 2], [3, 4], [4, 4], [3, 5], [4, 5]], 'k'),
    [[1, 3], [1, 4], [1, 5], [6, 3], [6, 4], [6, 5]], 'l'), pal, 16, 0);                                      // chorando forte
  pintarPixels(c, marcar(marcar(marcar(selo('a'), [[1, 2], [3, 2], [2, 3], [1, 4], [3, 4], [4, 2], [6, 2], [5, 3], [4, 4], [6, 4]], 'k'),
    [[4, 6]], 'p'), [[7, 0], [7, 1]], 'l'), pal, 24, 0);                                                      // esgotado (X, língua, suor)
  registrarQuadros(t, 8, 8, 4);
  t.refresh();

  // Balão de pedido 26×24 (caixa branca arredondada + perninha à esquerda)
  t = cena.textures.createCanvas('balao_pedido', 26, 24);
  c = t.getContext();
  c.fillStyle = o; c.fillRect(2, 0, 22, 20); c.fillRect(1, 1, 24, 18); c.fillRect(0, 2, 26, 16);
  c.fillStyle = '#ffffff'; c.fillRect(2, 1, 22, 18); c.fillRect(1, 2, 24, 16);
  c.fillStyle = o; c.fillRect(3, 19, 6, 2); c.fillRect(2, 20, 4, 2); c.fillRect(1, 21, 3, 2); c.fillRect(0, 22, 2, 2);
  c.fillStyle = '#ffffff'; c.fillRect(4, 19, 4, 1); c.fillRect(3, 20, 2, 1); c.fillRect(2, 21, 1, 1);
  t.refresh();

  // X vermelho 10×10
  t = cena.textures.createCanvas('x_nao', 10, 10);
  pintarPixels(t.getContext(), [
    'oo......oo', 'orro..orro', '.orroorro.', '..orrrro..', '...orro...',
    '...orro...', '..orrrro..', '.orroorro.', 'orro..orro', 'oo......oo'
  ], pal);
  t.refresh();

  // Mãozinha 12×12, apontando para a esquerda (2 quadros: o segundo 1 px mais perto)
  const mao = [
    '............', '............', '......ooo...', '.ooooowwwo..', 'owwwwwwwwwo.', '.oooowwwwwwo',
    '....owwwwwwo', '....owwwwwwo', '....owwwwwo.', '.....ooooo..', '............', '............'
  ];
  t = cena.textures.createCanvas('maozinha', 24, 12);
  pintarPixels(t.getContext(), mao, pal, 1, 0);
  pintarPixels(t.getContext(), mao, pal, 12, 0);
  registrarQuadros(t, 12, 12, 2);
  t.refresh();

  // Camada do bebê chorando: lágrimas embaixo dos olhos e boca aberta (por cima da chupeta)
  t = cena.textures.createCanvas('bebe_choro', 32, 32);
  c = t.getContext();
  c.fillStyle = '#6ec8ff';
  [[10, 14], [10, 15], [9, 16], [21, 14], [21, 15], [22, 16]].forEach(([x, y]) => c.fillRect(x, y, 1, 1));
  pintarPixels(c, ['.kk.', 'kkkk', 'kppk', '.kk.'], pal, 14, 15);
  t.refresh();

  // Camada do bebê esgotado: olhos fechados retos e gotinha de suor
  t = cena.textures.createCanvas('bebe_esgotado', 32, 32);
  c = t.getContext();
  c.fillStyle = '#141414';
  c.fillRect(10, 13, 4, 1); c.fillRect(18, 13, 4, 1);
  pintarPixels(c, ['.l.', 'lll', 'lwl', '.l.'], pal, 23, 5);
  t.refresh();
}

// "!" pequeno do canto do botão de necessidades (3×8, só por código)
function criarAlertaMini(cena) {
  const t = cena.textures.createCanvas('alerta_mini', 5, 9);
  pintarPixels(t.getContext(), ['.ooo.', 'orrro', 'orrro', 'orrro', '.oro.', '.ooo.', '.ooo.', '.oro.', '.ooo.'],
    { o: '#2a1838', r: '#ff4848' });
  t.refresh();
}

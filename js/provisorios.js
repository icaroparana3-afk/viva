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
//   luz_abajur  150×120  brilho em anéis (estilo pixel), mais forte no meio
// A cor é aplicada pelo jogo (CONFIG.QUARTO.LUZ_COR); aqui é branco com transparência.
function criarLuzAbajur(cena) {
  const L = 150, A = 120;
  const t = cena.textures.createCanvas('luz_abajur', L, A);
  const c = t.getContext();
  // Anéis: [raio, opacidade]. Na divisa entre dois anéis, xadrez (dithering) para ficar com cara de pixel art.
  const aneis = [[18, 0.45], [32, 0.31], [48, 0.2], [66, 0.1]];
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
//   botao_necessidades  26×26   botão sem ícone (o jogo põe o ícone da necessidade e os 5 quadradinhos)
//   painel_necessidades 164×196 fundo do painel com faixa do título
//   linha_necessidade   156×32  fundo de uma linha (e linha_necessidade_sel, a selecionada)
//   moldura_icone       22×22   moldura clara do ícone
//   botao_fechar        16×16   X
function criarPainelNecessidadesProvisorio(cena) {
  const caixa = (nome, l, a, fundo, borda, extra) => {
    if (cena.textures.exists(nome)) return;      // desenho pronto já carregado
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
  caixa('painel_necessidades', 164, 196, '#2a1838', '#7b4aa6', c => {
    c.fillStyle = '#4a2a66'; c.fillRect(1, 1, 162, 16);     // faixa do título
    c.fillStyle = '#7b4aa6'; c.fillRect(1, 17, 162, 1);
  });
  caixa('linha_necessidade', 156, 32, '#3a2150', '#4a3060');
  caixa('linha_necessidade_sel', 156, 32, '#5e3487', '#ffd860');
  caixa('moldura_icone', 22, 22, '#e8d8f0', '#9a7ab8');
  caixa('botao_fechar', 16, 16, '#a03048', '#ffffff', c => {
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) { c.fillRect(5 + i, 5 + i, 1, 1); c.fillRect(10 - i, 5 + i, 1, 1); }
  });
}

// ---------- Sinais de cuidado (Etapa 8.2) ----------
// Mesma paleta e contorno escuro (#2a1838) dos ícones. Tamanhos finais:
//   humor          36×12  3 carinhas 12×12: feliz, entediada, triste
//   selos          32×8   4 selos 8×8: triste, chorando, chorando forte, esgotado
//   balao_pedido   26×24  balão com perninha (ícone 16×16 em 5,2; selo 8×8 em 17,11)
//   x_nao          10×10  X vermelho ("não quero")
//   maozinha       36×18  2 quadros 18×18, apontando para a esquerda
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
  const falta = (nome) => !cena.textures.exists(nome);   // desenho do autor já carregado? então pula
  let t, c, f;
  if (falta('humor')) {
  t = cena.textures.createCanvas('humor', 36, 12);
  c = t.getContext();
  // feliz: olhos e sorriso
  f = marcar(rosto('y'), [[4, 4], [4, 5], [7, 4], [7, 5], [3, 7], [8, 7], [4, 8], [5, 8], [6, 8], [7, 8]], 'k');
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
  }

  // Selos 8×8
  const selo = (cor) => ['..oooo..', '.oCCCCo.', 'oCCCCCCo', 'oCCCCCCo', 'oCCCCCCo', 'oCCCCCCo', '.oCCCCo.', '..oooo..']
    .map(l => l.replace(/C/g, cor));
  if (falta('selos')) {
  t = cena.textures.createCanvas('selos', 32, 8);
  c = t.getContext();
  pintarPixels(c, marcar(selo('b'), [[2, 3], [5, 3], [3, 5], [4, 5], [2, 6], [5, 6]], 'k'), pal, 0, 0);          // triste
  pintarPixels(c, marcar(marcar(selo('b'), [[2, 3], [5, 3], [3, 5], [4, 5]], 'k'), [[1, 4], [6, 4]], 'l'), pal, 8, 0);   // chorando
  pintarPixels(c, marcar(marcar(selo('v'), [[2, 2], [5, 2], [3, 4], [4, 4], [3, 5], [4, 5]], 'k'),
    [[1, 3], [1, 4], [1, 5], [6, 3], [6, 4], [6, 5]], 'l'), pal, 16, 0);                                      // chorando forte
  // esgotado: desenho do autor (v0.0.61) se já carregado, senão o provisório (X, língua, suor)
  if (cena.textures.exists('selo_esgotado')) {
    c.drawImage(cena.textures.get('selo_esgotado').getSourceImage(), 24, 0);
  } else {
    pintarPixels(c, marcar(marcar(marcar(selo('a'), [[1, 2], [3, 2], [2, 3], [1, 4], [3, 4], [4, 2], [6, 2], [5, 3], [4, 4], [6, 4]], 'k'),
      [[4, 6]], 'p'), [[7, 0], [7, 1]], 'l'), pal, 24, 0);
  }
  registrarQuadros(t, 8, 8, 4);
  t.refresh();
  }

  // Balão de pedido 26×24 (caixa branca arredondada + perninha à esquerda)
  if (falta('balao_pedido')) {
  t = cena.textures.createCanvas('balao_pedido', 26, 24);
  c = t.getContext();
  c.fillStyle = o; c.fillRect(2, 0, 22, 20); c.fillRect(1, 1, 24, 18); c.fillRect(0, 2, 26, 16);
  c.fillStyle = '#ffffff'; c.fillRect(2, 1, 22, 18); c.fillRect(1, 2, 24, 16);
  c.fillStyle = o; c.fillRect(3, 19, 6, 2); c.fillRect(2, 20, 4, 2); c.fillRect(1, 21, 3, 2); c.fillRect(0, 22, 2, 2);
  c.fillStyle = '#ffffff'; c.fillRect(4, 19, 4, 1); c.fillRect(3, 20, 2, 1); c.fillRect(2, 21, 1, 1);
  t.refresh();
  }

  // X vermelho 10×10
  if (falta('x_nao')) {
  t = cena.textures.createCanvas('x_nao', 10, 10);
  pintarPixels(t.getContext(), [
    'oo......oo', 'orro..orro', '.orroorro.', '..orrrro..', '...orro...',
    '...orro...', '..orrrro..', '.orroorro.', 'orro..orro', 'oo......oo'
  ], pal);
  t.refresh();
  }

  // Mãozinha 18×18, apontando para a esquerda (2 quadros: o segundo 1 px mais perto)
  if (falta('maozinha')) {
  const mao = [
    '............', '............', '......ooo...', '.ooooowwwo..', 'owwwwwwwwwo.', '.oooowwwwwwo',
    '....owwwwwwo', '....owwwwwwo', '....owwwwwo.', '.....ooooo..', '............', '............'
  ];
  t = cena.textures.createCanvas('maozinha', 36, 18);
  pintarPixels(t.getContext(), mao, pal, 4, 3);
  pintarPixels(t.getContext(), mao, pal, 21, 3);
  registrarQuadros(t, 18, 18, 2);
  t.refresh();
  }

  // Camada do bebê chorando: lágrimas embaixo dos olhos e boca aberta (por cima da chupeta)
  if (falta('bebe_choro')) {
  t = cena.textures.createCanvas('bebe_choro', 32, 32);
  c = t.getContext();
  c.fillStyle = '#6ec8ff';
  [[10, 14], [10, 15], [9, 16], [21, 14], [21, 15], [22, 16]].forEach(([x, y]) => c.fillRect(x, y, 1, 1));
  pintarPixels(c, ['.kk.', 'kkkk', 'kppk', '.kk.'], pal, 14, 15);
  t.refresh();
  }

  // Camada do bebê esgotado: olhos fechados retos e gotinha de suor
  if (falta('bebe_esgotado')) {
  t = cena.textures.createCanvas('bebe_esgotado', 32, 32);
  c = t.getContext();
  c.fillStyle = '#141414';
  c.fillRect(10, 13, 4, 1); c.fillRect(18, 13, 4, 1);
  pintarPixels(c, ['.l.', 'lll', 'lwl', '.l.'], pal, 23, 5);
  t.refresh();
  }
}

// "!" pequeno do canto do botão de necessidades (3×8, só por código)
function criarAlertaMini(cena) {
  const t = cena.textures.createCanvas('alerta_mini', 5, 9);
  pintarPixels(t.getContext(), ['.ooo.', 'orrro', 'orrro', 'orrro', '.oro.', '.ooo.', '.ooo.', '.oro.', '.ooo.'],
    { o: '#2a1838', r: '#ff4848' });
  t.refresh();
}

// ---------- Eventos do bebê (v0.0.57) — provisórios até chegar a arte do autor ----------
//   balao_pensamento  34×30   nuvem de pensamento + 2 bolinhas descendo à direita (até a cabeça do bebê)
//   pensamentos       96×12   8 quadros 12×12: gato, passaro, sol, lua, estrela, mamadeira, bola, coracao
//   chocalho          22×12   2 quadros 11×12 (inclinado para a esquerda e para a direita; cabo no centro de baixo)
//   curativo          7×4     band-aid na testa
//   galo              4×3     galo vermelho na testa (dodói)
//   icone_curativo    16×16   ícone do balão de pedido durante o dodói
function criarEventosProvisorios(cena) {
  const falta = (nome) => !cena.textures.exists(nome);
  const o = '#2a1838';
  const pal = {
    o, k: '#141414', w: '#ffffff', m: '#b07e5c', M: '#7a5440', p: '#ff8aa8', P: '#e05a8a',
    b: '#6ec8ff', B: '#3d8ad0', y: '#ffd860', Y: '#f0a830', a: '#f6dc8a', r: '#e04848', i: '#ffc8d2',
    t: '#e8b88a', T: '#c89870', c: '#fff2dc', d: '#8a5a3c', g: '#ff8a8a', G: '#d8505a', u: '#f0f0f8'
  };
  let t;

  // Nuvem de pensamento: máscara de círculos → contorno escuro e miolo branco
  if (falta('balao_pensamento')) {
    const W = 34, H = 30;
    const circ = [[8, 11, 7], [16, 8, 8.2], [25, 11, 7], [16, 14, 7], [10, 15, 5], [23, 15, 5], [27.5, 23.5, 2.3], [31.5, 27.5, 1.6]];
    const dentro = (x, y) => circ.some(([cx, cy, r]) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r);
    t = cena.textures.createCanvas('balao_pensamento', W, H);
    const c = t.getContext();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!dentro(x, y)) continue;
      const borda = !dentro(x - 1, y) || !dentro(x + 1, y) || !dentro(x, y - 1) || !dentro(x, y + 1);
      c.fillStyle = borda ? o : (y > 17 && x < 26 ? '#eee6f6' : '#ffffff');   // sombrinha embaixo
      c.fillRect(x, y, 1, 1);
    }
    t.refresh();
  }

  if (falta('pensamentos')) {
    const mapas = [
      // gato
      ['............', '.o........o.', '.oo......oo.', '.omoooooomo.', '.ommmmmmmmo.', 'ommmmmmmmmmo',
       'omkmmmmmmkmo', 'omkmmmmmmkmo', 'ommmmppmmmmo', 'oMmmmmmmmmMo', '.ommmmmmmmo.', '..oooooooo..'],
      // passarinho
      ['............', '............', '.....oooo...', '....obbbbo..', '...obbbbkbo.', '..obbbbbbbyo',
       '.obbBBbbbbo.', 'obbBBBbbbo..', 'obBBBbbbo...', '.oooobbbo...', '.....ooo....', '............'],
      // sol
      ['............', '.y....y....y', '..y..ooo..y.', '....oYYYo...', '...oYyyyYo..', '.yyoYyyyYoyy',
       '...oYyyyYo..', '....oYYYo...', '..y..ooo..y.', '.y....y....y', '............', '............'],
      // lua
      ['............', '.....ooooo..', '...ooaaaao..', '..oaaaaoo...', '..oaaao.....', '..oaao......',
       '..oaao......', '..oaaao.....', '..oaaaaoo...', '...ooaaaao..', '.....ooooo..', '............'],
      // estrela
      ['............', '.....oo.....', '....oyyo....', '....oyyo....', 'ooooyyyyoooo', '.oyyyyyyyyo.',
       '..oyyyyyyo..', '...oyyyyo...', '..oyyooyyo..', '..oyo..oyo..', '..oo....oo..', '............'],
      // mamadeira
      ['.....oo.....', '....oaao....', '....oaao....', '...oBBBBo...', '...owwwwo...', '...ouwwwo...',
       '...owwwwo...', '...ouwwwo...', '...owwwwo...', '...owwwwo...', '...owwwwo...', '....oooo....'],
      // bola
      ['....oooo....', '..oorrwwoo..', '.orrrrwwwwo.', '.orrrrwwwwo.', 'orrrrrwwwwwo', 'orrrrrwwwwwo',
       'owwwwwbbbbbo', 'owwwwwbbbbbo', '.owwwwbbbbo.', '.owwwwbbbbo.', '..oowwbboo..', '....oooo....'],
      // coração
      ['............', '..ooo..ooo..', '.oirrooirro.', 'oiirrrrrrrro', 'orrrrrrrrrro', 'orrrrrrrrrro',
       '.orrrrrrrro.', '..orrrrrro..', '...orrrro...', '....orro....', '.....oo.....', '............']
    ];
    t = cena.textures.createCanvas('pensamentos', 12 * mapas.length, 12);
    mapas.forEach((m, i) => pintarPixels(t.getContext(), m, pal, i * 12, 0));
    registrarQuadros(t, 12, 12, mapas.length);
    t.refresh();
  }

  if (falta('chocalho')) {
    const q0 = ['.oooo......', 'oppppo.....', 'owpppo.....', 'opPppo.....', '.opppo.....', '..oooyo....',
                '....oyo....', '....oyo....', '....oyo....', '....oyo....', '....oyo....', '....ooo....'];
    const q1 = q0.map(l => l.split('').reverse().join(''));   // espelhado: o cabo continua no centro
    t = cena.textures.createCanvas('chocalho', 22, 12);
    pintarPixels(t.getContext(), q0, pal, 0, 0);
    pintarPixels(t.getContext(), q1, pal, 11, 0);
    registrarQuadros(t, 11, 12, 2);
    t.refresh();
  }

  if (falta('curativo')) {
    t = cena.textures.createCanvas('curativo', 7, 4);
    pintarPixels(t.getContext(), ['.ddddd.', 'dtcccTd', 'dtcccTd', '.ddddd.'], pal);
    t.refresh();
  }

  if (falta('galo')) {
    t = cena.textures.createCanvas('galo', 4, 3);
    pintarPixels(t.getContext(), ['.gg.', 'gGGg', '.GG.'], pal);
    t.refresh();
  }

  if (falta('icone_curativo')) {
    t = cena.textures.createCanvas('icone_curativo', 16, 16);
    pintarPixels(t.getContext(), [
      '................', '................', '................', '................',
      '..oooooooooooo..', '.otttoccccottto.', 'ottttocTccotttto', 'ottttoccccotttto',
      'ottttoccTcotttto', 'ottttoccccotttto', '.otttoccccottto.', '..oooooooooooo..',
      '................', '................', '................', '................'
    ], pal);
    t.refresh();
  }
}

// ---------- Clima, visitas, festa e álbum (v0.0.58) — provisórios ----------
//   sol_janela     9×9     sol do canto da janela
//   raio_janela    9×28    raio do temporal
//   borboleta      14×6    2 quadros 7×6 (asas abertas / fechadas)
//   abelha         14×6    2 quadros 7×6 (olhando para a direita; o jogo espelha)
//   balao_visita   7×11    balão de festa que sobe pela janela (branco: o jogo pinta)
//   folha_seca     20×5    4 quadros 5×5 (girando)
//   bolo           28×14   2 quadros 14×14 (a chama da vela muda)
//   icones_album   96×12   8 quadros 12×12: chuva, neve, raio, folha, flor, bolo, soluço, espirro
//   botao_album    14×14   livrinho do álbum (botão do quarto)
function criarClimaProvisorio(cena) {
  const falta = (nome) => !cena.textures.exists(nome);
  const o = '#2a1838';
  const pal = {
    o, y: '#ffd860', Y: '#f0a830', w: '#ffffff', W: '#e8eef8', k: '#141414', b: '#6ec8ff', B: '#3d8ad0',
    p: '#ff8aa8', P: '#e05a8a', r: '#e04848', l: '#ffb347', L: '#d06a28', m: '#a0522d', g: '#8ce07a', G: '#4f9a40',
    c: '#f6dc8a', C: '#c8945a', v: '#c89cff', V: '#8a5ad0', a: '#9aa0b0', s: '#d8e0ec', n: '#5a3a28', e: '#ff6e8c'
  };
  const pintar = (nome, w, h, mapas, qw) => {
    if (!falta(nome)) return;
    const t = cena.textures.createCanvas(nome, w, h);
    mapas.forEach((m, i) => pintarPixels(t.getContext(), m, pal, i * (qw || w), 0));
    if (mapas.length > 1) registrarQuadros(t, qw, h, mapas.length);
    t.refresh();
  };
  pintar('sol_janela', 9, 9, [['...yYy...', '.y.yyy.y.', '..yyyyy..', 'Yyyyyyyyy', 'yyyyyyyyY', 'Yyyyyyyyy', '..yyyyy..', '.y.yyy.y.', '...yYy...']]);
  pintar('raio_janela', 9, 28, [[
    '.....ww..', '....wyw..', '....wyw..', '...wyw...', '...wyw...', '..wyw....', '..wyyyww.', '..wwyyyw.',
    '....wyw..', '....wyw..', '...wyw...', '...wyw...', '..wyw....', '..wyyyww.', '..wwyyw..', '....wyw..',
    '....ww...', '...wyw...', '...ww....', '..wyw....', '..ww.....', '.wyw.....', '.ww......', '.w.......',
    '.........', '.........', '.........', '.........']]);
  pintar('borboleta', 14, 6, [
    ['vv.k.vv', 'vVvkvVv', 'vvvkvvv', '.vvkvv.', '.vVkVv.', '..v.v..'],
    ['...k...', '.vvkvv.', '.vVkVv.', '..vkv..', '..vkv..', '...k...']], 7);
  pintar('abelha', 14, 6, [
    ['..ww...', '.wwww..', '.okyky.', 'okykyko', '.okyky.', '..ooo..'],
    ['.......', '..ww...', '.wkyky.', 'okykyko', '.okyky.', '..ooo..']], 7);
  pintar('balao_visita', 7, 11, [['.wwww..', 'wwwwww.', 'wWwwwww', 'wwwwwww', 'wwwwwww', '.wwwww.', '..www..', '...w...', '...k...', '..k....', '...k...']]);
  pintar('folha_seca', 20, 5, [
    ['.ll..', 'lllL.', '.lLL.', '..L..', '.....'],
    ['..l..', '.llL.', 'llLL.', '.L...', '.....'],
    ['.....', 'lllLL', '.LLL.', '.....', '.....'],
    ['.l...', '.ll..', '.lL..', '..L..', '...L.']], 5);
  pintar('bolo', 28, 14, [
    ['......y.......', '......l.......', '......w.......', '......w.......', '.oooooooooooo.', 'oppppppppppppo',
     'oPwpPwpPwpPwPo', 'occcccccccccco', 'occcccccccccco', 'oCCCCCCCCCCCCo', 'oppppppppppppo', 'oPPPPPPPPPPPPo',
     '.oooooooooooo.', '..............'],
    ['.....y........', '......y.......', '......w.......', '......w.......', '.oooooooooooo.', 'oppppppppppppo',
     'oPwpPwpPwpPwPo', 'occcccccccccco', 'occcccccccccco', 'oCCCCCCCCCCCCo', 'oppppppppppppo', 'oPPPPPPPPPPPPo',
     '.oooooooooooo.', '..............']], 14);
  pintar('icones_album', 96, 12, [
    // chuva
    ['............', '....oooo....', '..oossssoo..', '.osssssssso.', 'ossssssssaso', '.oaaaaaaaao.', '............',
     '..b...b...b.', '.b...b...b..', '...b...b....', '..b...b...b.', '............'],
    // neve (floco)
    ['.....w......', '...w.w.w....', '....www.....', '.w..www..w..', '..w.www.w...', 'wwwwwwwwwww.', '..w.www.w...',
     '.w..www..w..', '....www.....', '...w.w.w....', '.....w......', '............'],
    // raio
    ['......oooo..', '.....oyyo...', '....oyyo....', '...oyyo.....', '..oyyyyyoo..', '..ooyyyyo...', '....oyyo....',
     '...oyyo.....', '..oyyo......', '..oyo.......', '..oo........', '............'],
    // folha seca
    ['........oo..', '......ooLo..', '....oollLo..', '...ollllLo..', '..ollllLo...', '.olllLLo....', '.ollLLo.....',
     '.olLLo......', '.oLoo.......', 'oLo.........', 'oo..........', '............'],
    // flor
    ['............', '....oo......', '...oppo.oo..', '...oppoppo..', '.oooyyooo...', 'oppoyyoppo..', '.ooppoopo...',
     '..oppoopo...', '...oo.o.....', '......oGo...', '.....oGGo...', '......o.....'],
    // bolo
    ['.....y......', '.....l......', '.....w......', '..oooooooo..', '.oppppppppo.', '.oPwPwPwPwo.', '.occcccccco.',
     '.occcccccco.', '.oCCCCCCCCo.', '.oppppppppo.', '..oooooooo..', '............'],
    // soluço ("hic" num balãozinho)
    ['............', '.oooooooooo.', 'owwwwwwwwwwo', 'owkwkwkwkkwo', 'owkkkwkwkwwo', 'owkwkwkwkwwo', 'owkwkwkwkkwo',
     'owwwwwwwwwwo', '.oooooooooo.', '...ow.......', '...o........', '............'],
    // espirro (gotinhas)
    ['............', '..b.....b...', '....b.b.....', '.b..bbb..b..', '...bbbbb....', '..bbbbbbb...', '...bbbbb....',
     '.b..bbb..b..', '....b.b.....', '..b.....b...', '............', '............']], 12);
  pintar('botao_album', 14, 14, [[
    '.oooooooooooo.', 'oVvvvvvvvvvvvo', 'oVvwwwwwwwwvvo', 'oVvwvvvvvvwvvo', 'oVvwvpppvvwvvo', 'oVvwvpPpvvwvvo',
    'oVvwvvpvvvwvvo', 'oVvwvvvvvvwvvo', 'oVvwwwwwwwwvvo', 'oVvvvvvvvvvvvo', 'oVvvvvvvvvvvvo', 'oVVVVVVVVVVVVo',
    'owwwwwwwwwwwwo', '.oooooooooooo.']]);
}

// ---------- Brincadeiras e câmera (v0.0.62) ----------
// Provisórios até o autor mandar os PNGs (ver ARTES_PRONTAS em config.js):
//   bolha 24×12 (2 quadros 12×12: inteira, estourando)
//   mao_achou 28×34 (a mão esquerda; o jogo espelha para a direita)
//   livro_aberto 150×96 (o livro aberto, páginas em branco)
//   bloco_brinquedo 42×14 (3 quadros 14×14: A vermelho, B azul, C amarelo)
//   icones_atividades 48×12 (4 quadros 12×12: bolhas, cadê-achou, livro, blocos)
//   botao_camera 14×14, moldura_camera 84×84, botao_foto 26×26
function criarAtividadesProvisorio(cena) {
  const falta = (nome) => !cena.textures.exists(nome);
  const pal = {
    o: '#2a1838', w: '#ffffff', W: '#e8eef8', b: '#9ad8ff', B: '#4a9ad8', k: '#141414', n: '#7a4a2a',
    s: '#f6cfa8', S: '#d9a77c', c: '#fff4dc', C: '#e6d2a8', r: '#e04848', R: '#a02828', u: '#3d8ad0', U: '#24578a',
    y: '#ffd860', Y: '#c89a20', v: '#8a5ad0', V: '#6a3aa8', p: '#ff8aa8', g: '#8ce07a', a: '#9aa0b0', A: '#5a6070'
  };
  const pintar = (nome, w, h, mapas, qw) => {
    if (!falta(nome)) return;
    const t = cena.textures.createCanvas(nome, w, h);
    mapas.forEach((m, i) => pintarPixels(t.getContext(), m, pal, i * (qw || w), 0));
    if (mapas.length > 1) registrarQuadros(t, qw, h, mapas.length);
    t.refresh();
  };
  pintar('bolha', 24, 12, [
    ['....bbbb....', '..bb....bb..', '.b..ww....b.', '.b.w......b.', 'b..w.......b', 'b..........b',
     'b..........b', 'b.........Bb', '.b.......B.b', '.b......BB..', '..bb..BB.b..', '....bbbb....'],
    ['.....w......', '..w.....w...', '....b.b.....', '.w.b...b..w.', '...........b', 'wb.........w',
     '...........b', '.w.b...b....', '....b.b..w..', '..w.........', '......w.....', '............']], 12);
  pintar('mao_achou', 28, 34, [[
    '..........nn................', '.........nssn..nn...........', '.........nssn.nssn..........', '.....nn..nssn.nssn..........',
    '....nssn.nssn.nssn..nn......', '....nssn.nssn.nssn.nssn.....', '....nssn.nssn.nssn.nssn.....', '....nssn.nssn.nssn.nssn.....',
    '....nssn.nssn.nssn.nssn.....', '....nssnnssnnnssnnnssn......', '....nssssssssssssssssn......', '....nssssssssssssssssn..nn..',
    '....nssssssssssssssssn.nssn.', '....nsssssssssssssssssnsssn.', '....nssssssssssssssssssssn..', '....nssssssssssssssssssSn...',
    '....nsssssssssssssssssSn....', '....nSssssssssssssssssSn....', '.....nsssssssssssssssSn.....', '.....nSsssssssssssssSn......',
    '......nsssssssssssssn.......', '......nSssssssssssSSn.......', '.......nsssssssssssn........', '.......nsssssssssssn........',
    '.......nsssssssssssn........', '.......nsssssssssssn........', '.......nsssssssssssn........', '.......nSSSSSSSSSSSn........',
    '.......nnnnnnnnnnnnn........', '.......nppppppppppppn.......', '.......npppppppppppn........', '.......npppppppppppn........',
    '.......npppppppppppn........', '.......nnnnnnnnnnnnn........']]);
  if (falta('livro_aberto')) {
    const t = cena.textures.createCanvas('livro_aberto', 150, 96);
    const c = t.getContext();
    c.fillStyle = '#7a3a2a'; c.fillRect(0, 4, 150, 92);                 // capa
    c.fillStyle = '#5a2418'; c.fillRect(0, 92, 150, 4);
    c.fillStyle = '#fff4dc'; c.fillRect(4, 0, 69, 90); c.fillRect(77, 0, 69, 90);   // páginas
    c.fillStyle = '#e6d2a8'; c.fillRect(67, 0, 6, 90); c.fillRect(77, 0, 6, 90);    // sombra da dobra
    c.fillStyle = '#c8b088'; c.fillRect(73, 0, 4, 92);                              // lombada
    c.fillStyle = '#e6d2a8'; c.fillRect(4, 88, 69, 2); c.fillRect(77, 88, 69, 2);
    t.refresh();
  }
  if (falta('bloco_brinquedo')) {
    const t = cena.textures.createCanvas('bloco_brinquedo', 42, 14);
    const c = t.getContext();
    const letras = {
      A: ['.www.', 'w...w', 'wwwww', 'w...w', 'w...w'],
      B: ['wwww.', 'w...w', 'wwww.', 'w...w', 'wwww.'],
      C: ['.wwww', 'w....', 'w....', 'w....', '.wwww']
    };
    [['A', '#e04848', '#a02828', '#ff8080'], ['B', '#3d8ad0', '#24578a', '#7ab8f0'], ['C', '#ffd860', '#c89a20', '#fff0a0']]
      .forEach(([l, cor, esc, clara], i) => {
        const x = i * 14;
        c.fillStyle = '#2a1838'; c.fillRect(x, 0, 14, 14);
        c.fillStyle = esc; c.fillRect(x + 1, 1, 12, 12);
        c.fillStyle = cor; c.fillRect(x + 1, 1, 11, 11);
        c.fillStyle = clara; c.fillRect(x + 1, 1, 11, 1); c.fillRect(x + 1, 1, 1, 11);
        pintarPixels(c, letras[l], { w: '#ffffff' }, x + 4, 4);
      });
    registrarQuadros(t, 14, 14, 3);
    t.refresh();
  }
  pintar('icones_atividades', 48, 12, [
    ['............', '..bbb.......', '.b.wwb......', '.bw..b..bb..', '.b...b.bwwb.', '..bbb..b..b.',
     '........bb..', '...bb.......', '..bwwb......', '..b..b......', '...bb.......', '............'],
    ['..n.n.n.....', '.nsnsnsn....', '.nsnsnsn.n..', '.nsssssnnsn.', '.nssssssssn.', '.nssssssssn.',
     '..nsssssssn.', '..nssssssn..', '...nssssn...', '...nssssn...', '...nnnnnn...', '............'],
    ['............', '.nnnn..nnnn.', 'nccccnnccccn', 'ncnncnncnncn', 'nccccnnccccn', 'ncnncnncnccn',
     'nccccnnccccn', 'ncnncnncnncn', 'nccccnnccccn', '.nnnnnnnnnn.', '............', '............'],
    ['....ooooo...', '....orrro...', '....orwro...', '....orrro...', '.oooooooooo.', '.ouuuuoyyyo.',
     '.ouwwuoywyo.', '.ouwuuoywyo.', '.ouwwuoyyyo.', '.ouuuuoyyyo.', '.oooooooooo.', '............']], 12);
  pintar('botao_camera', 14, 14, [[
    '.oooooooooooo.', 'oVvvvvvvvvvvvo', 'oVvvvaaavvvvvo', 'oVvaaaaaaaavvo', 'oVvaAAAAAAavvo', 'oVvaAwwwwAavvo',
    'oVvaAwkkwAavvo', 'oVvaAwkkwAavvo', 'oVvaAwwwwAavvo', 'oVvaAAAAAAavvo', 'oVvaaaaaaaavvo', 'oVVVVVVVVVVVVo',
    'owwwwwwwwwwwwo', '.oooooooooooo.']]);
  if (falta('moldura_camera')) {
    const t = cena.textures.createCanvas('moldura_camera', 84, 84);
    const c = t.getContext();
    const canto = (x, y, dx, dy) => {
      c.fillStyle = '#2a1838';
      c.fillRect(x, y, 12 * dx || 1, 3); c.fillRect(x, y, 3, 12 * dy || 1);
    };
    // cantos brancos com contorno escuro
    [[0, 0], [72, 0], [0, 72], [72, 72]].forEach(([x, y]) => {
      const h = x === 0 ? 0 : 9, v = y === 0 ? 0 : 9;
      c.fillStyle = '#2a1838'; c.fillRect(x, y + v, 12, 3); c.fillRect(x + h, y, 3, 12);
      c.fillStyle = '#ffffff'; c.fillRect(x + 1, y + v + 1, 10, 1); c.fillRect(x + h + 1, y + 1, 1, 10);
    });
    c.fillStyle = '#ffffff'; c.fillRect(41, 39, 2, 6); c.fillRect(39, 41, 6, 2);   // mira no meio
    t.refresh();
  }
  if (falta('botao_foto')) {
    const t = cena.textures.createCanvas('botao_foto', 26, 26);
    const c = t.getContext();
    const disco = (r, cor) => {
      c.fillStyle = cor;
      for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) {
        const dx = x - 12.5, dy = y - 12.5;
        if (dx * dx + dy * dy <= r * r) c.fillRect(x, y, 1, 1);
      }
    };
    disco(13, '#2a1838'); disco(12, '#ffffff'); disco(10, '#2a1838'); disco(9, '#e8eef8'); disco(7, '#ffffff');
    t.refresh();
  }
}

// ---------- Marcos do desenvolvimento (v0.0.63) ----------
//   icones_marcos 120×12 (10 quadros 12×12: medalha com o número do marco)
//   mao_tchau 10×11 (a mãozinha do bebê acenando)
function criarMarcosProvisorio(cena) {
  const falta = (nome) => !cena.textures.exists(nome);
  if (falta('icones_marcos')) {
    const t = cena.textures.createCanvas('icones_marcos', 120, 12);
    const c = t.getContext();
    const digitos = {
      0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
      3: ['111', '001', '011', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
      6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'],
      9: ['111', '101', '111', '001', '111']
    };
    const pintarDigito = (d, x, y) => digitos[d].forEach((linha, j) => [...linha].forEach((v, k) => {
      if (v === '1') c.fillRect(x + k, y + j, 1, 1);
    }));
    for (let i = 0; i < 10; i++) {
      const x = i * 12;
      // fitinha
      c.fillStyle = '#d04070'; c.fillRect(x + 3, 0, 2, 4); c.fillRect(x + 7, 0, 2, 4);
      c.fillStyle = '#4a7ad0'; c.fillRect(x + 5, 0, 2, 4);
      // medalha
      const disco = (r, cor) => {
        c.fillStyle = cor;
        for (let yy = 0; yy < 9; yy++) for (let xx = 0; xx < 12; xx++) {
          const dx = xx - 5.5, dy = yy - 4;
          if (dx * dx + dy * dy <= r * r) c.fillRect(x + xx, 3 + yy, 1, 1);
        }
      };
      disco(4.6, '#8a5a10'); disco(3.7, '#ffd860'); disco(2.6, '#ffe890');
      c.fillStyle = '#8a5a10';
      const n = String(i + 1);
      if (n.length === 1) pintarDigito(+n, x + 5, 5);
      else { pintarDigito(1, x + 2, 5); pintarDigito(0, x + 6, 5); }
    }
    registrarQuadros(t, 12, 12, 10);
    t.refresh();
  }
  if (falta('mao_tchau')) {
    const t = cena.textures.createCanvas('mao_tchau', 10, 11);
    pintarPixels(t.getContext(), [
      '.n.n.n....', 'nsnsnsn...', 'nsnsnsn.n.', 'nsssssnnsn', 'nssssssssn', 'nssssssssn',
      '.nsssssssn', '.nssssssn.', '..nssssn..', '..nssssn..', '..nnnnnn..'
    ], { n: '#7a4a2a', s: '#f6cfa8' }, 0, 0);
    t.refresh();
  }
}

// ---------- Chupeta que sai e boquinha (v0.0.64) ----------
// A chupeta vinha desenhada no contorno do bebê (do autor). Aqui ela é separada:
//   bebe_contorno  → sem a chupeta
//   bebe_corpo     → o "buraco" embaixo da chupeta vira pele
//   bebe_chupeta   → só a chupeta (32×32), aparece quando o bebê ganha o bico
//   bebe_boca      → 96×32, 3 quadros 32×32: neutra, sorriso, sorriso com dentinho (provisória)
// Só mexe se o desenho for o mesmo de antes (se o autor mandar o bebê novo, nada muda).
function prepararChupeta(cena) {
  const P = CONFIG.BEBE.CHUPETA;   // pixels da chupeta no desenho
  const ler = (chave) => {
    const img = cena.textures.get(chave).getSourceImage();
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return { c, ctx, d: ctx.getImageData(0, 0, 32, 32) };
  };
  const px = (d, x, y) => { const i = (y * 32 + x) * 4; return [d.data[i], d.data[i + 1], d.data[i + 2], d.data[i + 3]]; };
  const pintar = (d, x, y, cor) => { const i = (y * 32 + x) * 4; d.data[i] = cor[0]; d.data[i + 1] = cor[1]; d.data[i + 2] = cor[2]; d.data[i + 3] = cor[3]; };
  const vazia = (nome, w) => { if (!cena.textures.exists(nome)) cena.textures.createCanvas(nome, w, 32).refresh(); };
  const trocar = (chave, canvas, w) => {
    cena.textures.remove(chave);
    const t = cena.textures.createCanvas(chave, w, 32);
    t.getContext().drawImage(canvas, 0, 0);
    t.refresh();
    return t;
  };
  try {
    const cont = ler('bebe_contorno'), corpo = ler('bebe_corpo');
    // confere: o meio da chupeta é branco e o bico é cinza escuro
    const branco = px(cont.d, P.CONFERE_BRANCO[0], P.CONFERE_BRANCO[1]);
    const bico = px(cont.d, P.CONFERE_BICO[0], P.CONFERE_BICO[1]);
    if (!(branco[3] > 0 && branco[0] > 200 && bico[3] > 0 && bico[0] < 140)) {
      vazia('bebe_chupeta', 32); vazia('bebe_boca', 96);
      CONFIG.BEBE.CHUPETA.SEPARADA = false;
      return;
    }
    // 1) a chupeta sozinha
    const ch = document.createElement('canvas'); ch.width = 32; ch.height = 32;
    const chx = ch.getContext('2d'); const chd = chx.createImageData(32, 32);
    P.PIXELS.forEach(([x, y]) => { pintar(chd, x, y, px(cont.d, x, y)); pintar(cont.d, x, y, [0, 0, 0, 0]); });
    chx.putImageData(chd, 0, 0);
    trocar('bebe_chupeta', ch, 32);
    // 2) contorno sem a chupeta
    cont.ctx.putImageData(cont.d, 0, 0);
    trocar('bebe_contorno', cont.c, 32);
    // 3) corpo: o buraco vira pele (a cor clara do corpo; o jogo pinta com a cor da pele)
    const pele = px(corpo.d, P.PELE[0], P.PELE[1]);
    P.PIXELS.forEach(([x, y]) => { if (px(corpo.d, x, y)[3] === 0) pintar(corpo.d, x, y, pele); });
    corpo.ctx.putImageData(corpo.d, 0, 0);
    trocar('bebe_corpo', corpo.c, 32);
    // 4) a boquinha: neutra, sorriso, sorriso com dentinho
    if (!CONFIG.ARTES_PRONTAS.bebe_boca) {   // sem a boquinha do autor: provisória
      if (cena.textures.exists('bebe_boca')) cena.textures.remove('bebe_boca');
      const t = cena.textures.createCanvas('bebe_boca', 96, 32);
      const c = t.getContext();
      const k = '#3a1c1c', w = '#ffffff', r = '#c8505a';
      const p = (q, x, y, cor) => { c.fillStyle = cor; c.fillRect(q * 32 + x, y, 1, 1); };
      const [bx, by] = P.BOCA;                // canto esquerdo da boca (2 pixels de largura)
      p(0, bx, by, k); p(0, bx + 1, by, k);                                              // neutra: —
      p(1, bx - 1, by - 1, k); p(1, bx + 2, by - 1, k); p(1, bx, by, k); p(1, bx + 1, by, k);      // sorriso: ◡
      p(2, bx - 1, by - 1, k); p(2, bx, by - 1, w); p(2, bx + 1, by - 1, r); p(2, bx + 2, by - 1, k); // boca aberta com o dentinho
      p(2, bx, by, k); p(2, bx + 1, by, k);
      registrarQuadros(t, 32, 32, 3);
      t.refresh();
    }
    CONFIG.BEBE.CHUPETA.SEPARADA = true;
  } catch (e) {
    vazia('bebe_chupeta', 32); vazia('bebe_boca', 96);
    CONFIG.BEBE.CHUPETA.SEPARADA = false;
  }
}

// ---------- Ícone do bico no balão (v0.0.64) ----------
//   icone_chupeta 16×16 (o mesmo tamanho dos ícones do balão de pedido)
function criarChupetaProvisorio(cena) {
  if (cena.textures.exists('icone_chupeta')) return;
  const t = cena.textures.createCanvas('icone_chupeta', 16, 16);
  pintarPixels(t.getContext(), [
    '................', '......bbbb......', '.....b....b.....', '.....b....b.....', '......bbbb......',
    '...kkkkkkkkkk...', '..kWWWWWWWWWWk..', '.kWWWWbbbbWWWWk.', '.kWWWWbbbbWWWWk.', '..kWWWWWWWWWWk..',
    '...kkkkggkkkk...', '......kggk......', '......kggk......', '.......kk.......', '................', '................'
  ], { k: '#2a1838', W: '#ffffff', b: '#7ab8f0', g: '#c8c8c8' }, 0, 0);
  t.refresh();
}

// ---------- Cortina fechada (v0.0.64) ----------
//   cortina_fechada 36×62 (a metade esquerda; o jogo espelha para a direita), nas cores da cortina do quarto
function criarCortinaProvisorio(cena) {
  if (cena.textures.exists('cortina_fechada')) return;
  const t = cena.textures.createCanvas('cortina_fechada', 36, 62);
  const c = t.getContext();
  const cor = { claro: '#44bc9c', meio: '#3e968d', medio: '#448278', escuro: '#1a5f54', borda: '#214345' };
  // dobras verticais: claro, meio, escuro, meio...
  const dobra = ['claro', 'claro', 'meio', 'meio', 'medio', 'escuro'];
  for (let x = 0; x < 36; x++) {
    c.fillStyle = cor[dobra[x % 6]];
    // a barra de baixo ondula com as dobras
    const fim = 60 - (x % 6 < 2 ? 1 : 0);
    c.fillRect(x, 1, 1, fim);
  }
  c.fillStyle = cor.borda;
  c.fillRect(0, 0, 1, 62);                       // borda de fora
  c.fillRect(0, 59, 36, 1); c.fillRect(0, 61, 36, 1);   // barra
  for (let x = 2; x < 36; x += 8) c.fillRect(x, 0, 3, 2);   // argolas no varão
  c.fillStyle = cor.claro; c.fillRect(35, 1, 1, 58);   // beirada do meio, mais clara
  t.refresh();
}

// ---------- Segundo livro de figuras (v0.0.64) ----------
//   figuras_livro2 96×12 (8 quadros 12×12): vaca, cachorro, pato, peixe, flor, árvore, casa, carro
function criarLivro2Provisorio(cena) {
  if (cena.textures.exists('figuras_livro2')) return;
  const t = cena.textures.createCanvas('figuras_livro2', 96, 12);
  const pal = {
    k: '#2a1838', w: '#ffffff', p: '#ff9ab0', m: '#7a4a2a', M: '#b07a4a', y: '#ffd860', o: '#f08a30',
    b: '#4a9ad8', B: '#9ad8ff', g: '#5ac85a', G: '#2e8a3a', r: '#e04848', R: '#a02828', c: '#c8c8c8', a: '#5a6070'
  };
  [
    // vaca
    ['............', '.k........k.', '.kkkkkkkkkk.', '.kwwkkwwwwk.', '.kwkwwwwkwk.', '.kwwwwwkkwk.',
     '.kkpppppkkk.', '..kpkppkpk..', '..kkkkkkkk..', '............', '............', '............'],
    // cachorro
    ['............', '.mm....mm...', '.mMm..mMm...', '.mMMMMMMm...', '.MMkMMkMM...', '.MMMMMMMM...',
     '..MMkkMM....', '..MMMMMM....', '...MppM.....', '....pp......', '............', '............'],
    // pato
    ['............', '....yyy.....', '...yykyy....', '...yyyyyoo..', '....yyy.....', '.y.yyyyy....',
     '.yyyyyyyy...', '.yyyyyyyy...', '..yyyyyy....', '....oo.oo...', '............', '............'],
    // peixe
    ['............', '............', '.....bbb....', 'b...bbbbb...', 'bb.bbbbkbb..', 'bbbbbbbbbbb.',
     'bb.bbBBBbb..', 'b...bbbbb...', '.....bbb....', '............', '............', '............'],
    // flor
    ['............', '....rr.rr...', '...rrrrrrr..', '....ryyyr...', '...rryyyrr..', '....rrrrr...',
     '......g.....', '...gg.g.....', '....ggg.gg..', '......ggg...', '......g.....', '............'],
    // árvore
    ['....GGGG....', '..GGggggGG..', '.GggggggggG.', '.GggGgggGgG.', '.GggggggggG.', '..GGggggGG..',
     '....GmmG....', '.....mm.....', '.....mm.....', '.....mm.....', '...mmmmmm...', '............'],
    // casa
    ['.....rr.....', '....rRRr....', '...rRRRRr...', '..rRRRRRRr..', '.rrrrrrrrrr.', '..cwwwwwwc..',
     '..cwbbwmmc..', '..cwbbwmmc..', '..cwwwwmmc..', '..cccccccc..', '............', '............'],
    // carro
    ['............', '............', '....bbbb....', '...bBBbBb...', '..bbBBbBBb..', '.bbbbbbbbbbb',
     '.bbbbbbbbbby', '.bbbbbbbbbbb', '..akka..akka', '...aa....aa.', '............', '............']
  ].forEach((m, i) => pintarPixels(t.getContext(), m, pal, i * 12, 0));
  registrarQuadros(t, 12, 12, 8);
  t.refresh();
}

// ---------- Tarefas do dia (v0.0.64) ----------
//   botao_tarefas 14×14 (prancheta), estrela_tarefa 7×7
function criarTarefasProvisorio(cena) {
  const pal = { o: '#2a1838', V: '#6a3aa8', v: '#8a5ad0', m: '#b07a4a', M: '#7a4a2a', w: '#ffffff', a: '#9aa0b0', y: '#ffd860', Y: '#c89a20' };
  if (!cena.textures.exists('botao_tarefas')) {
    const t = cena.textures.createCanvas('botao_tarefas', 14, 14);
    pintarPixels(t.getContext(), [
      '.oooooooooooo.', 'oVvvvaaaavvvvo', 'oVvMmaaaamMvvo', 'oVvmwwwwwwmvvo', 'oVvmwaawwwmvvo', 'oVvmwwwwwwmvvo',
      'oVvmwaaawwmvvo', 'oVvmwwwwwwmvvo', 'oVvmwaawwwmvvo', 'oVvmwwwwwwmvvo', 'oVvMmmmmmmMvvo', 'oVVVVVVVVVVVVo',
      'owwwwwwwwwwwwo', '.oooooooooooo.'], pal, 0, 0);
    t.refresh();
  }
  if (!cena.textures.exists('estrela_tarefa')) {
    const t = cena.textures.createCanvas('estrela_tarefa', 7, 7);
    pintarPixels(t.getContext(), ['...Y...', '..YyY..', 'YYyyyYY', '.YyyyY.', '..yyy..', '.Yy.yY.', '.Y...Y.'], pal, 0, 0);
    t.refresh();
  }
}

// ---------- Lojinha (v0.0.66) ----------
// Sacolinha do botão, enfeites do quarto e os brinquedos novos. Só cria o que o autor ainda não mandou.
function criarLojaProvisorio(cena) {
  const P = CONFIG.ARTES_PRONTAS;
  const novo = (chave, w, h) => cena.textures.exists(chave) ? null : cena.textures.createCanvas(chave, w, h);
  const px = (c, cor, x, y, w = 1, h = 1) => { c.fillStyle = cor; c.fillRect(x, y, w, h); };
  let t;
  // sacolinha 14×14 (roxa, alça e estrelinha)
  if (!P.botao_loja && (t = novo('botao_loja', 14, 14))) {
    pintarPixels(t.getContext(), [
      '....oooooo....', '...o......o...', '...o......o...', '.oooooooooooo.', 'oVvvvvvvvvvvvo', 'oVvvvvYvvvvvvo',
      'oVvvvYyYvvvvvo', 'oVvYYyyyYYvvvo', 'oVvvYyyyYvvvvo', 'oVvvvyyyvvvvvo', 'oVvvYyvyYvvvvo', 'oVvvvvvvvvvvvo',
      'oVVVVVVVVVVVVo', '.oooooooooooo.'], { o: '#2a1838', V: '#6a3aa8', v: '#8a5ad0', Y: '#c89a20', y: '#ffd860' });
    t.refresh();
  }
  // móbile 64×24 (2 quadros 32×24): haste presa no pé do berço, 3 bichinhos pendurados
  if (!P.deco_mobile && (t = novo('deco_mobile', 64, 24))) {
    const c = t.getContext();
    [0, 1].forEach(q => {
      const o = q * 32, bal = q ? 1 : -1;
      px(c, '#e8d8b8', o + 29, 2, 1, 22); px(c, '#b89a70', o + 30, 3, 1, 21);   // haste
      px(c, '#e8d8b8', o + 4, 1, 26, 1); px(c, '#b89a70', o + 4, 2, 26, 1);     // braço
      px(c, '#ffd860', o + 27, 0, 3, 2);                                        // pino
      const bichos = [[6, 8, '#ffd860'], [15, 11, '#f48aa8'], [24, 7, '#7ac8f0']];
      bichos.forEach(([x, comp, cor], i) => {
        const d = (i % 2 ? -bal : bal);
        px(c, '#d8d0e0', o + x, 3, 1, comp - 3);                                // fio
        const bx = o + x + d, by = comp;
        px(c, cor, bx - 2, by, 5, 3); px(c, cor, bx - 1, by - 1, 3, 1); px(c, cor, bx - 1, by + 3, 3, 1);
        px(c, '#2a1838', bx - 1, by + 1, 1, 1); px(c, '#2a1838', bx + 1, by + 1, 1, 1);
      });
    });
    registrarQuadros(t, 32, 24, 2);
    t.refresh();
  }
  // varal de luzinhas 48×12 (apagado) e o brilho (aceso)
  const lampadas = [];
  for (let i = 0; i < 7; i++) {
    const x = 3 + i * 7;
    const y = Math.round(2 + 4 * Math.sin(Math.PI * x / 48));   // o fio cai no meio
    lampadas.push([x, y, ['#ff6a6a', '#ffd860', '#7ae07a', '#6ab0ff', '#ff8ad8'][i % 5]]);
  }
  if (!P.deco_varal && (t = novo('deco_varal', 48, 12))) {
    const c = t.getContext();
    for (let x = 0; x < 48; x++) px(c, '#5a4a3a', x, Math.round(1 + 4 * Math.sin(Math.PI * x / 48)), 1, 1);
    lampadas.forEach(([x, y, cor]) => { px(c, '#3a3040', x, y + 1, 2, 1); c.globalAlpha = 0.7; px(c, cor, x, y + 2, 2, 3); c.globalAlpha = 1; });
    t.refresh();
  }
  if (!P.deco_varal && (t = novo('deco_varal_luz', 48, 12))) {
    const c = t.getContext();
    lampadas.forEach(([x, y, cor]) => {
      c.globalAlpha = 0.35; px(c, cor, x - 1, y + 1, 4, 5);
      c.globalAlpha = 1; px(c, cor, x, y + 2, 2, 3); px(c, '#ffffff', x, y + 2, 1, 1);
    });
    c.globalAlpha = 1;
    t.refresh();
  }
  // estrela adesiva 5×5
  if (!P.deco_estrela && (t = novo('deco_estrela', 5, 5))) {
    pintarPixels(t.getContext(), ['..a..', '.aaa.', 'aabaa', '.aaa.', '.a.a.'], { a: '#f4ecc0', b: '#ffffff' });
    t.refresh();
  }
  // plantinha 16×24
  if (!P.deco_planta && (t = novo('deco_planta', 16, 24))) {
    pintarPixels(t.getContext(), [
      '.......g........', '......gG...g....', '..g...gG..gG....', '..Gg..gG.gG.....', '...GggGGgG...g..', '.g..GgGGG...gG..',
      '.Gg..GGGG.gGG...', '..GGg.GGGgGG....', '...GGGGGGGG..g..', '....GGGGGG..gG..', '..g..GGGGGgGG...', '..GgggGGGGGG....',
      '...GGGGGGGG.....', '.....GGGG.......', '......GG........', '......GG........', '..oooooooooooo..', '..oTTTTTTTTTTo..',
      '...otttttttto...', '...otttttttto...', '...otttttttto...', '....otttttto....', '....otttttto....', '....oooooooo....'],
      { g: '#7ad06a', G: '#3e9a4a', o: '#5a2a1a', T: '#e0885a', t: '#c06a40' });
    t.refresh();
  }
  // brinquedos 12×12 (xilofone 16×10)
  if (!P.brinquedos_loja) {
    const pal = { o: '#2a1838', r: '#e05050', w: '#ffffff', b: '#5b8fd8', y: '#ffd860', Y: '#e0a020', l: '#f08a2a', p: '#c070d0', g: '#6cc07a', m: '#a07040', M: '#6a4a2a' };
    const desenhos = {
      loja_bola: ['...oooooo...', '..owwrrrbo..', '.owwwrrrbbo.', 'owwwwrrrbbbo', 'owwwwrrrbbbo', 'oyyyyyyyyyyo', 'oyyyyyyyyyyo', 'orrrbbbwwwwo', 'orrrbbbwwwwo', '.orrrbbbwwo.', '..orrbbbwo..', '...oooooo...'],
      loja_patinho: ['............', '.....ooo....', '....oyyyo...', '....oyoyol..', '....oyyyoll.', '.oo..oyyo...', 'oyyooyyyyo..', 'oyyyyyyyyyo.', 'oyyYyyyyyyo.', '.oyyYYYyyo..', '..oyyyyyo...', '...ooooo....'],
      loja_piao: ['.....oo.....', '.....om.....', '...oooooo...', '..orrrrrro..', '.orwwwwwwro.', 'orrrrrrrrrro', 'obbbbbbbbbbo', '.obbbbbbbbo.', '..oyyyyyyo..', '...oyyyyo...', '....oyyo....', '.....oo.....'],
      loja_xilofone: ['oooooooooooooooo', 'orrRllLyyYggGbbo', 'orrRllLyyYggGbbo', 'orrRllLyyYggGbb.', 'oMrrRllLyyYggGbo', 'oMMMllLyyYggGbbo', 'oMMMMMMyyYggGbbo', 'oMMMMMMMMMMMMMMo', '.mm..........mm.', '.oo..........oo.']
    };
    const pal2 = Object.assign({}, pal, { R: '#a03030', L: '#c06a10', Y: '#c89a20', G: '#3e9a4a', B: '#3a6ab0' });
    Object.entries(desenhos).forEach(([chave, mapa]) => {
      if (cena.textures.exists(chave)) return;
      const tt = cena.textures.createCanvas(chave, mapa[0].length, mapa.length);
      pintarPixels(tt.getContext(), mapa, pal2);
      tt.refresh();
    });
  }
}

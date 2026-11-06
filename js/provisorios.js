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

//   balao  22×24  balão de pensamento; o ícone de 16×16 entra no ponto (3,2)
function criarBalaoProvisorio(cena) {
  const t = cena.textures.createCanvas('balao', 22, 24);
  const c = t.getContext();
  const o = '#2a1838', w = '#ffffff';
  c.fillStyle = o; c.fillRect(1, 0, 20, 20); c.fillRect(0, 1, 22, 18);
  c.fillStyle = w; c.fillRect(1, 1, 20, 18);
  // rabinho para baixo e para a esquerda (aponta para a cabeça do bebê)
  c.fillStyle = o; c.fillRect(2, 19, 5, 3); c.fillRect(0, 21, 3, 3);
  c.fillStyle = w; c.fillRect(3, 19, 3, 2); c.fillRect(1, 22, 1, 1);
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

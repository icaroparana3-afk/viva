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

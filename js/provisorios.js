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

// ---------- Cegonha (4 quadros de 48×32, olhando para a esquerda) ----------
// Quadros: 0 asas para cima, 1 asas no meio, 2 asas para baixo, 3 = 1.
// O bico fica na ponta esquerda; a trouxinha é presa em CONFIG.CEGONHA.BICO_X/BICO_Y.
function criarCegonhaProvisoria(cena) {
  const L = 48, A = 32;
  const tex = cena.textures.createCanvas('cegonha', L * 4, A);
  const ctx = tex.getContext();
  const BRANCO = '#f4f4f4', SOMBRA = '#c8c8d8', PRETO = '#2a2430', LARANJA = '#f08c40', CONT = '#2a1838';

  for (let q = 0; q < 4; q++) {
    const m = [];                                   // mapa de cores do quadro
    for (let y = 0; y < A; y++) m.push(new Array(L).fill(null));
    const pinta = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < L && y < A) m[y][x] = c; };
    const elipse = (cx, cy, rx, ry, cor, corBaixo) => {
      for (let y = 0; y < A; y++) for (let x = 0; x < L; x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) pinta(x, y, corBaixo && y > cy + ry * 0.3 ? corBaixo : cor);
    };
    const linha = (x0, y0, x1, y1, cor, grossura = 1) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
        for (let g = 0; g < grossura; g++) pinta(x, y + g, cor);
      }
    };
    // pernas para trás
    linha(32, 19, 46, 22, LARANJA);
    linha(31, 20, 45, 24, LARANJA);
    // corpo, cauda preta, pescoço e cabeça
    elipse(25, 16, 10, 5, BRANCO, SOMBRA);
    elipse(35, 15, 3, 2, PRETO);
    linha(15, 13, 19, 15, BRANCO, 3);
    elipse(11, 10, 4, 3.5, BRANCO);
    pinta(10, 9, PRETO);                            // olho
    linha(7, 11, 1, 13, LARANJA, 2);                // bico
    // asa, conforme o quadro
    const fase = q === 3 ? 1 : q;
    if (fase === 0) {                               // para cima
      for (let i = 0; i < 10; i++) linha(19 + i, 12, 15 + i * 1.2, 2 + i * 0.3, i > 6 ? PRETO : BRANCO);
    } else if (fase === 1) {                        // no meio
      for (let i = 0; i < 6; i++) linha(16, 11 + i * 0.5, 36, 12 + i * 0.4, i < 2 ? SOMBRA : BRANCO);
      linha(31, 11, 37, 12, PRETO, 2);
    } else {                                        // para baixo
      for (let i = 0; i < 10; i++) linha(19 + i, 17, 16 + i * 1.2, 26 + i * 0.3, i > 6 ? PRETO : SOMBRA);
    }
    // contorno escuro em volta de tudo
    for (let y = 0; y < A; y++) for (let x = 0; x < L; x++) {
      if (m[y][x]) continue;
      const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (m[y + dy] || [])[x + dx] && (m[y + dy][x + dx] !== 'C'));
      if (viz) m[y][x] = 'C';
    }
    for (let y = 0; y < A; y++) for (let x = 0; x < L; x++) {
      const c = m[y][x];
      if (!c) continue;
      ctx.fillStyle = c === 'C' ? CONT : c;
      ctx.fillRect(q * L + x, y, 1, 1);
    }
  }
  tex.refresh();
  registrarQuadros(tex, L, A, 4);

  // Trouxinha (14×16): pano creme com o nó em cima (onde o bico segura)
  const t = cena.textures.createCanvas('trouxinha', 14, 16);
  pintarPixels(t.getContext(), [
    '.....ooo......',
    '....oaao......',
    '....oaaoo.....',
    '...oaabbao....',
    '..oaaaaaaao...',
    '.oaaaaaaabbo..',
    '.oaacaaaaabo..',
    'oaaacaaaaaabo.',
    'oaaaaaaaaaabo.',
    'oaaaaaaaaabbo.',
    'oaaaaaaaaabbo.',
    '.oaaaaaaabbo..',
    '.oaaaaaabbbo..',
    '..obbbbbbbo...',
    '...ooooooo....',
    '..............'
  ], { o: '#2a1838', a: '#f6ead2', b: '#d8c8a8', c: '#ffffff' });
  t.refresh();
}

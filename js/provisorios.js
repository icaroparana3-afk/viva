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

// ---------- Quarto e berço provisórios (Etapa 5) ----------
//   quarto_fundo  180×320  parede listrada, janela com céu, rodapé, chão de tábuas e tapete
//   berco_tras    80×64    cabeceira, grade de trás e colchão (fica ATRÁS do bebê)
//   berco_frente  80×64    grade da frente (fica NA FRENTE do bebê)
//   coracao       7×6      coraçãozinho que sobe quando o bebê é tocado
function criarQuartoProvisorio(cena) {
  const ret = (ctx, cor, x, y, l, a) => { ctx.fillStyle = cor; ctx.fillRect(x, y, l, a); };
  const CONT = '#2a1838';

  // Fundo do quarto
  let t = cena.textures.createCanvas('quarto_fundo', 180, 320);
  let c = t.getContext();
  for (let x = 0; x < 180; x += 12) { ret(c, '#c8a8dc', x, 0, 6, 214); ret(c, '#b898d0', x + 6, 0, 6, 214); } // parede listrada
  ret(c, '#9a78b4', 0, 206, 180, 8);                       // faixa de baixo da parede
  ret(c, '#f4e6d0', 0, 212, 180, 3); ret(c, CONT, 0, 215, 180, 1); // rodapé
  for (let y = 216; y < 320; y += 8) {                     // chão de tábuas
    ret(c, '#9a6448', 0, y, 180, 8); ret(c, '#7e4e38', 0, y + 7, 180, 1);
    const desloc = (y / 8) % 2 ? 0 : 22;
    for (let x = desloc; x < 180; x += 44) ret(c, '#7e4e38', x, y, 1, 7);
  }
  // Janela com céu de dia
  ret(c, CONT, 59, 33, 62, 54); ret(c, '#f4e6d0', 60, 34, 60, 52);
  ret(c, '#84cede', 64, 38, 52, 44); ret(c, '#a8e0ee', 64, 38, 52, 14);
  ret(c, '#ffffff', 70, 56, 14, 4); ret(c, '#ffffff', 74, 53, 7, 3);   // nuvenzinha
  ret(c, '#f4e6d0', 89, 38, 2, 44); ret(c, '#f4e6d0', 64, 59, 52, 2);  // cruz da janela
  ret(c, '#e88aa0', 54, 30, 8, 60); ret(c, '#e88aa0', 118, 30, 8, 60); // cortinas
  ret(c, '#c86a84', 60, 30, 2, 60); ret(c, '#c86a84', 118, 30, 2, 60);
  ret(c, '#f4e6d0', 50, 28, 80, 3);                                    // varão
  // Tapete
  for (let y = 0; y < 30; y++) for (let x = 0; x < 120; x++) {
    const d = ((x - 59.5) / 60) ** 2 + ((y - 14.5) / 15) ** 2;
    if (d > 1) continue;
    ret(c, d > 0.85 ? '#c86a84' : (d > 0.55 && d < 0.65 ? '#ffd860' : '#e88aa0'), 30 + x, 252 + y, 1, 1);
  }
  t.refresh();

  // Berço: madeira clara, contorno escuro
  const MAD = '#e8c8a0', MAD_S = '#c8a07a', LENCOL = '#bcd8f0', LENCOL_S = '#98b8dc';
  t = cena.textures.createCanvas('berco_tras', 80, 64);
  c = t.getContext();
  const poste = (x) => { ret(c, CONT, x, 0, 6, 64); ret(c, MAD, x + 1, 1, 4, 62); ret(c, MAD_S, x + 4, 1, 1, 62); };
  ret(c, CONT, 3, 4, 74, 6); ret(c, MAD, 4, 5, 72, 4);                 // trilho de cima (trás)
  for (let x = 10; x < 72; x += 7) { ret(c, CONT, x, 9, 3, 36); ret(c, MAD_S, x + 1, 9, 1, 36); } // grade de trás
  ret(c, CONT, 4, 42, 72, 11); ret(c, LENCOL, 5, 43, 70, 9); ret(c, LENCOL_S, 5, 49, 70, 3);      // colchão
  ret(c, CONT, 3, 52, 74, 6); ret(c, MAD_S, 4, 53, 72, 4);             // base
  poste(0); poste(74);
  t.refresh();

  t = cena.textures.createCanvas('berco_frente', 80, 64);
  c = t.getContext();
  ret(c, CONT, 3, 44, 74, 5); ret(c, MAD, 4, 45, 72, 3);               // trilho de cima (frente, bem mais baixo: o bebê aparece)
  for (let x = 8; x < 74; x += 8) { ret(c, CONT, x, 48, 3, 8); ret(c, MAD, x + 1, 48, 1, 8); }   // grade da frente
  ret(c, CONT, 3, 54, 74, 6); ret(c, MAD, 4, 55, 72, 4);               // trilho de baixo (frente)
  for (const x of [0, 74]) { ret(c, CONT, x, 40, 6, 24); ret(c, MAD, x + 1, 41, 4, 22); ret(c, MAD_S, x + 4, 41, 1, 22); }
  t.refresh();

  // Coraçãozinho
  t = cena.textures.createCanvas('coracao', 7, 6);
  pintarPixels(t.getContext(), ['.oo.oo.', 'orroiro', 'orrrrro', '.orrro.', '..oro..', '...o...'],
    { o: CONT, r: '#ff6e8c', i: '#ffc8d2' });
  t.refresh();
}

// ---------- Pálpebras do bebê (piscar) ----------
// Feitas a partir das posições dos olhos no desenho do autor (2×2 em (11,11) e (19,11)).
//   bebe_palpebras       cobre os olhos com a cor da pele (recebe tint da pele)
//   bebe_olhos_fechados  risquinho escuro do olho fechado (cor fixa)
function criarPalpebrasBebe(cena) {
  let t = cena.textures.createCanvas('bebe_palpebras', 32, 32);
  let c = t.getContext();
  c.fillStyle = '#f0f0f0';
  for (const x of [11, 19]) c.fillRect(x, 11, 2, 2);
  t.refresh();
  t = cena.textures.createCanvas('bebe_olhos_fechados', 32, 32);
  c = t.getContext();
  c.fillStyle = '#141414';
  for (const x of [11, 19]) c.fillRect(x, 12, 2, 1);
  t.refresh();
}

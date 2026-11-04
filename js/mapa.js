// =============================================================
// mapa.js — prepara o mapa do Brasil para receber toques.
//
// Roda uma vez, no Boot. Lê os pixels do seu desenho e monta uma
// "grade": para cada pixel, de qual região ele é. Cada pixel fica
// com a região da cor PRINCIPAL mais próxima (CONFIG.PERFIL.REGIOES[].cor),
// então sombras, brilhos e bordas entram automaticamente.
//
// Também cria uma imagem separada de cada região (mapa_norte, mapa_sul...),
// usada para deixar a região escolhida acesa e o resto escurecido.
// =============================================================

const MAPA = {
  largura: 0,
  altura: 0,
  grade: null,   // para cada pixel: índice da região (0 a 4) ou -1 (fora do mapa)

  preparar(cena) {
    const regioes = CONFIG.PERFIL.REGIOES;
    const fonte = cena.textures.get('mapa_brasil').getSourceImage();
    const L = fonte.width, A = fonte.height;
    this.largura = L; this.altura = A;

    // Lê os pixels do desenho
    const tela = document.createElement('canvas');
    tela.width = L; tela.height = A;
    const ctx = tela.getContext('2d');
    ctx.drawImage(fonte, 0, 0);
    const px = ctx.getImageData(0, 0, L, A).data;

    // Cores principais em número (ex.: '#96e646' → 0x96e646)
    const principais = regioes.map(r => parseInt(r.cor.slice(1), 16));

    // Começa com tudo -1 e marca os pixels da cor principal de cada região
    const grade = new Int8Array(L * A).fill(-1);
    const fila = [];
    for (let i = 0; i < L * A; i++) {
      if (px[i * 4 + 3] < 255) continue; // transparente ou sombra
      const cor = (px[i * 4] << 16) | (px[i * 4 + 1] << 8) | px[i * 4 + 2];
      const r = principais.indexOf(cor);
      if (r >= 0) { grade[i] = r; fila.push(i); }
    }

    // Espalha cada região para os pixels vizinhos (sombras, bordas, contorno),
    // como uma mancha de tinta, até cobrir todo o desenho.
    for (let k = 0; k < fila.length; k++) {
      const i = fila[k], x = i % L, y = (i / L) | 0;
      const viz = [];
      if (x > 0) viz.push(i - 1);
      if (x < L - 1) viz.push(i + 1);
      if (y > 0) viz.push(i - L);
      if (y < A - 1) viz.push(i + L);
      for (const j of viz) {
        if (grade[j] === -1 && px[j * 4 + 3] === 255) { grade[j] = grade[i]; fila.push(j); }
      }
    }
    this.grade = grade;

    // Uma imagem por região (só os pixels dela)
    regioes.forEach((r, idx) => {
      const chave = 'mapa_' + r.id;
      if (cena.textures.exists(chave)) cena.textures.remove(chave);
      const tex = cena.textures.createCanvas(chave, L, A);
      const c2 = tex.getContext();
      const img = c2.createImageData(L, A);
      for (let i = 0; i < L * A; i++) {
        if (grade[i] !== idx) continue;
        img.data[i * 4] = px[i * 4];
        img.data[i * 4 + 1] = px[i * 4 + 1];
        img.data[i * 4 + 2] = px[i * 4 + 2];
        img.data[i * 4 + 3] = 255;
      }
      c2.putImageData(img, 0, 0);
      tex.refresh();
    });
  },

  // Qual região está no pixel (x, y) do mapa? Devolve o índice ou -1.
  // Se o toque cair um pouco fora (no contorno ou no vazio), procura a região mais perto.
  regiaoEm(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    const L = this.largura, A = this.altura;
    const tol = CONFIG.PERFIL.MAPA_TOLERANCIA_TOQUE;
    let melhor = -1, menorDist = Infinity;
    for (let dy = -tol; dy <= tol; dy++) {
      for (let dx = -tol; dx <= tol; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= L || yy >= A) continue;
        const r = this.grade[yy * L + xx];
        const d = dx * dx + dy * dy;
        if (r >= 0 && d < menorDist) { menorDist = d; melhor = r; }
      }
    }
    return melhor;
  }
};

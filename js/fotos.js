// =============================================================
// fotos.js — câmera de fotos do bebê (v0.0.62).
//
// A foto é um quadrado de CONFIG.FOTOS.TAMANHO pixels do jogo, guardado
// como PNG pequeno (data URL) no localStorage 'viva_fotos', FORA do save,
// para o save continuar pequeno (e leve para o Firebase depois).
//
//   FOTOS.tirar(cena, x, y, (dados) => ...)  → tira a foto da área (x, y)
//   FOTOS.adicionar(dados)                    → guarda com dia e idade
//   FOTOS.lista()   FOTOS.apagar(id)
//   FOTOS.textura(cena, foto, (chave) => ...) → vira textura do Phaser
// =============================================================

const FOTOS = {
  lista() {
    try { return JSON.parse(localStorage.getItem(CONFIG.FOTOS.CHAVE)) || []; }
    catch (e) { return []; }
  },

  guardar(lista) {
    try { localStorage.setItem(CONFIG.FOTOS.CHAVE, JSON.stringify(lista)); return true; }
    catch (e) { return false; }   // memória do navegador cheia
  },

  adicionar(dados) {
    if (!dados) return null;
    const s = Estado.dados || Estado.carregar();
    const t = TEMPO.agora();
    const lista = FOTOS.lista();
    const foto = {
      id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
      dados, dia: t.dia, idade: TEMPO.textoIdade(s && s.bebe ? s.bebe.sexo : 'M'), em: Date.now()
    };
    lista.push(foto);
    while (lista.length > CONFIG.FOTOS.MAXIMO) lista.shift();      // a mais antiga sai
    while (!FOTOS.guardar(lista) && lista.length > 1) lista.shift(); // sem espaço: libera as mais antigas
    return foto;
  },

  apagar(id) {
    FOTOS.guardar(FOTOS.lista().filter(f => f.id !== id));
  },

  // Tira a foto da área (x, y) do jogo, com TAMANHO × TAMANHO pixels do jogo.
  // A tela é desenhada ESCALA vezes maior; a foto volta ao tamanho do jogo
  // pegando 1 ponto por pixel (fica nítida, sem borrar).
  tirar(cena, x, y, aoTerminar) {
    const T = CONFIG.FOTOS.TAMANHO;
    const E = cena.game.canvas.width / CONFIG.LARGURA;
    cena.game.renderer.snapshotArea(Math.round(x * E), Math.round(y * E), Math.round(T * E), Math.round(T * E), (img) => {
      try {
        const c = document.createElement('canvas');
        c.width = T; c.height = T;
        const ctx = c.getContext('2d');
        if (!ctx || !img) { aoTerminar(null); return; }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, T, T);
        aoTerminar(c.toDataURL('image/png'));
      } catch (e) { aoTerminar(null); }
    });
  },

  // A foto vira textura do Phaser (demora um instante para carregar)
  textura(cena, foto, pronto) {
    const k = 'foto_' + foto.id;
    if (cena.textures.exists(k)) { pronto(k); return; }
    cena.textures.once('addtexture-' + k, () => pronto(k));
    cena.textures.addBase64(k, foto.dados);
  }
};

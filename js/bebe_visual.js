// =============================================================
// bebe_visual.js — desenha um bebê na tela a partir das camadas.
//
// As camadas são do autor (32×32 cada, carregadas no Carregando.js).
// A cor de pele, cabelo e olhos é aplicada por "tint", com as cores
// de CONFIG.BEBE.CORES. Usado na tela de teste e na cegonha.
//
//   const v = criarBebeVisual(cena, x, y, escala);
//   v.mostrar(bebe);      // pinta as camadas para este bebê
//   v.setVisible(false);  v.setDepth(10);  v.setAlpha(0.5);  v.destroy();
// =============================================================

function criarBebeVisual(cena, x, y, escala = 1) {
  // Ordem de baixo para cima: corpo → brilho → cabelo → olhos → contorno → extra
  const nomes = ['corpo', 'brilho', 'cabelo', 'olhos', 'contorno', 'extra'];
  const camadas = {};
  for (const n of nomes) {
    const textura = n === 'extra' ? 'bebe_extra_vampiro' : 'bebe_' + n;
    camadas[n] = cena.add.image(x, y, textura).setOrigin(0, 0).setScale(escala);
  }
  camadas.extra.setVisible(false);

  const hex = (h) => parseInt(h.slice(1), 16);
  const todas = () => nomes.map(n => camadas[n]);

  const obj = {
    camadas,
    mostrar(b) {
      const C = CONFIG.BEBE.CORES;
      camadas.corpo.setTint(hex(C.pele[b.pele]));
      camadas.olhos.setTint(hex(C.olhos[b.olhos]));
      camadas.cabelo.setTint(hex(C.cabeloCor[b.cabeloCor]));
      camadas.extra.setVisible(!!b.especial);
      if (b.especial) camadas.extra.setTexture('bebe_extra_' + b.especial);
      // As antenas do alienígena são cinzas como o corpo: recebem a cor da pele.
      if (b.especial === 'alienigena') camadas.extra.setTint(hex(C.pele[b.pele]));
      else camadas.extra.clearTint();
      obj.bebe = b;
      return obj;
    },
    setVisible(v) {
      todas().forEach(c => c.setVisible(v));
      if (v && obj.bebe) camadas.extra.setVisible(!!obj.bebe.especial);
      return obj;
    },
    setDepth(d) { todas().forEach(c => c.setDepth(d)); return obj; },
    setAlpha(a) { todas().forEach(c => c.setAlpha(a)); return obj; },
    setPosition(nx, ny) { todas().forEach(c => c.setPosition(nx, ny)); return obj; },
    destroy() { todas().forEach(c => c.destroy()); }
  };
  return obj;
}

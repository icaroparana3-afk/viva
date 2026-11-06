// =============================================================
// bebe_visual.js — desenha um bebê na tela a partir das camadas.
//
// As camadas são do autor (32×32 cada, carregadas no Carregando.js).
// A cor de pele, cabelo e olhos é aplicada por "tint", com as cores
// de CONFIG.BEBE.CORES. Usado na tela de teste e na cegonha.
//
//   const v = criarBebeVisual(cena, x, y, escala);
//   v.mostrar(bebe);      // pinta as camadas para este bebê
//   v.piscar(true);       // fecha os olhos (false abre); v.piscar(true, true) = olhos fechados sorrindo (^ ^)
//   v.sinal('choro');     // Etapa 8.2: 'choro' (lágrimas e boca aberta, olhos apertados),
//                         // 'esgotado' (olhos fechados) ou null (normal)
//   v.olharBaixo(true);   // olhos 1 px para baixo (bebê tristinho)
//   v.setAngle(-90);      // deitado (giro de 90°, sem deformar os pixels)
//   v.setVisible(false);  v.setDepth(10);  v.setAlpha(0.5);  v.destroy();
// =============================================================

function criarBebeVisual(cena, x, y, escala = 1) {
  // Ordem de baixo para cima: corpo → brilho → cabelo → olhos → contorno → pálpebras → olho fechado
  // → choro → esgotado → extra
  // (pálpebras e olho fechado só aparecem quando o bebê pisca; choro e esgotado, nos sinais de cuidado)
  const nomes = ['corpo', 'brilho', 'cabelo', 'olhos', 'contorno', 'palpebras', 'olhos_fechados', 'choro', 'esgotado', 'extra'];
  const camadas = {};
  for (const n of nomes) {
    const textura = n === 'extra' ? 'bebe_extra_vampiro' : 'bebe_' + n;
    camadas[n] = cena.add.image(x, y, textura).setOrigin(0, 0).setScale(escala);
  }
  camadas.extra.setVisible(false);
  camadas.palpebras.setVisible(false);
  camadas.olhos_fechados.setVisible(false);
  camadas.choro.setVisible(false);
  camadas.esgotado.setVisible(false);
  let desvioOlhos = 0, sinalAtual = null, fechadoAtual = false;

  const hex = (h) => parseInt(h.slice(1), 16);
  const todas = () => nomes.map(n => camadas[n]);

  const obj = {
    camadas,
    mostrar(b) {
      const C = CONFIG.BEBE.CORES;
      camadas.corpo.setTint(hex(C.pele[b.pele]));
      camadas.palpebras.setTint(hex(C.pele[b.pele]));
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
    piscar(fechado, feliz = false) {
      fechadoAtual = fechado;
      camadas.olhos_fechados.setTexture(fechado && feliz ? 'bebe_olhos_felizes' : 'bebe_olhos_fechados');
      camadas.palpebras.setVisible(fechado || sinalAtual !== null);
      // Esgotado: a camada dele já traz os olhos fechados; chorando: olhos apertados (◡ ◡)
      camadas.olhos_fechados.setVisible(fechado || sinalAtual === 'choro');
      return obj;
    },
    // Sinais de cuidado (Etapa 8.2): null, 'choro' ou 'esgotado'
    sinal(nome) {
      sinalAtual = nome;
      camadas.choro.setVisible(nome === 'choro');
      camadas.esgotado.setVisible(nome === 'esgotado');
      return obj.piscar(false);
    },
    olharBaixo(sim) {
      desvioOlhos = sim ? 1 : 0;
      camadas.olhos.setPosition(camadas.corpo.x, camadas.corpo.y);
      if (desvioOlhos) obj.setPosition(camadas.corpo.x, camadas.corpo.y);
      return obj;
    },
    setAngle(a) { todas().forEach(c => c.setAngle(a)); return obj; },
    setVisible(v) {
      todas().forEach(c => c.setVisible(v));
      camadas.palpebras.setVisible(false);
      camadas.olhos_fechados.setVisible(false);
      camadas.choro.setVisible(v && sinalAtual === 'choro');
      camadas.esgotado.setVisible(v && sinalAtual === 'esgotado');
      if (v && obj.bebe) camadas.extra.setVisible(!!obj.bebe.especial);
      return obj;
    },
    setDepth(d) { todas().forEach(c => c.setDepth(d)); return obj; },
    setAlpha(a) { todas().forEach(c => c.setAlpha(a)); return obj; },
    setPosition(nx, ny) {
      todas().forEach(c => c.setPosition(nx, ny));
      if (desvioOlhos) {
        // "para baixo" na tela, mesmo com o bebê girado
        const ang = Phaser.Math.DegToRad(camadas.corpo.angle);
        camadas.olhos.setPosition(nx - Math.round(Math.sin(ang)) * desvioOlhos, ny + Math.round(Math.cos(ang)) * desvioOlhos);
      }
      return obj;
    },
    destroy() { todas().forEach(c => c.destroy()); }
  };
  return obj;
}

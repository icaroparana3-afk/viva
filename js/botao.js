// =============================================================
// botao.js — peças de tela usadas em todas as cenas:
// botões de imagem, opções provisórias, avisos e confirmação.
// =============================================================

// ---------- Câmera de cada tela ----------
// Chame no começo de toda cena. Ela amplia a câmera pela ESCALA
// e enquadra a área 180 x 320 do jogo.
function prepararCamera(cena) {
  const cam = cena.cameras.main;
  cam.setZoom(CONFIG.ESCALA);
  cam.centerOn(CONFIG.LARGURA / 2, CONFIG.ALTURA / 2);
  cam.setRoundPixels(true);
}

// ---------- Texto nítido ----------
// Use sempre escrever(...) no lugar de cena.add.text(...).
// Ele escreve o texto já na resolução grande da tela, sem borrar.
function escrever(cena, x, y, texto, estilo = {}) {
  return cena.add.text(x, y, texto, Object.assign({}, estilo, { resolution: CONFIG.ESCALA }));
}

// ---------- Botão feito com um desenho seu ----------
// criarBotao(cena, x, y, imagem, aoTocar, ativo)
//   x, y    = canto superior esquerdo, em pixels
//   imagem  = nome carregado no Boot (ex.: 'botao_nova_historia')
//   aoTocar = o que acontece ao soltar o dedo em cima
//   ativo   = false deixa o botão apagado e sem reação
function criarBotao(cena, x, y, imagem, aoTocar, ativo = true) {
  const botao = cena.add.image(x, y, imagem).setOrigin(0, 0);

  if (!ativo) {
    botao.setAlpha(CONFIG.MENU.BOTAO_DESATIVADO_OPACIDADE);
    return botao;
  }

  botao.setInteractive();
  let apertado = false;

  botao.on('pointerdown', () => {
    apertado = true;
    botao.setTint(0xb0b0b0);
    botao.y = y + 1;
  });

  const soltar = () => {
    apertado = false;
    botao.clearTint();
    botao.y = y;
  };

  botao.on('pointerout', soltar);
  botao.on('pointerup', () => {
    const valeu = apertado;
    soltar();
    if (valeu) aoTocar();
  });

  return botao;
}

// ---------- Botão de desenho que pode acender/apagar e ser marcado ----------
// Usado em Próximo, Começar, Papai, Mamãe, Sim e Não.
// criarBotaoImg(cena, x, y, imagem, aoTocar, imagemMarcada)
//   imagemMarcada = a versão "selecionada" do seu desenho (ex.: 'botao_papai_sel').
//                   Se existir, ela aparece enquanto o dedo aperta o botão
//                   e quando o botão está marcado (.marcar(true)).
//                   Se não existir, o botão escurece e afunda 1 pixel ao apertar.
// Devolve um objeto com:
//   .ativar(true/false)  acende ou apaga (apagado não reage)
//   .marcar(true/false)  mostra a versão selecionada e deixa ela fixa
function criarBotaoImg(cena, x, y, imagem, aoTocar, imagemMarcada = null) {
  const img = cena.add.image(x, y, imagem).setOrigin(0, 0).setInteractive();
  const obj = { img, ativo: true, marcado: false };
  let apertado = false;

  const mostrar = () => {
    const sel = imagemMarcada && (obj.marcado || apertado);
    img.setTexture(sel ? imagemMarcada : imagem);
    if (!imagemMarcada && apertado) { img.setTint(0xb0b0b0); img.y = y + 1; }
    else { img.clearTint(); img.y = y; }
    img.setAlpha(obj.ativo ? 1 : CONFIG.MENU.BOTAO_DESATIVADO_OPACIDADE);
  };

  img.on('pointerdown', () => { if (!obj.ativo) return; apertado = true; mostrar(); });
  img.on('pointerout', () => { apertado = false; mostrar(); });
  img.on('pointerup', () => {
    const valeu = apertado && obj.ativo;
    apertado = false;
    mostrar();
    if (valeu) aoTocar(obj);
  });

  obj.ativar = (sim) => { obj.ativo = sim; mostrar(); return obj; };
  obj.marcar = (sim) => { obj.marcado = sim; mostrar(); return obj; };
  obj.setDepth = (d) => { img.setDepth(d); return obj; };
  obj.destroy = () => img.destroy();
  return obj;
}

// ---------- Opção provisória (retângulo + texto) ----------
// Substituto até você desenhar essas caixas.
// Devolve um objeto com .marcar(true/false) e .ativar(true/false).
function criarOpcao(cena, x, y, larg, alt, texto, aoTocar, tamanhoFonte = 9) {
  const U = CONFIG.UI;
  const caixa = cena.add.rectangle(x, y, larg, alt, U.CAIXA).setOrigin(0, 0)
    .setStrokeStyle(1, U.BORDA);
  const rotulo = escrever(cena, x + larg / 2, y + alt / 2, texto, {
    fontFamily: 'monospace', fontSize: tamanhoFonte + 'px', color: U.TEXTO
  }).setOrigin(0.5);

  const obj = { caixa, rotulo, escolhida: false, ativa: true };

  obj.marcar = (sim) => {
    obj.escolhida = sim;
    caixa.setFillStyle(sim ? U.CAIXA_ESCOLHIDA : U.CAIXA);
    caixa.setStrokeStyle(1, sim ? U.DESTAQUE : U.BORDA);
    return obj;
  };

  obj.ativar = (sim) => {
    obj.ativa = sim;
    caixa.setAlpha(sim ? 1 : CONFIG.MENU.BOTAO_DESATIVADO_OPACIDADE);
    rotulo.setAlpha(sim ? 1 : CONFIG.MENU.BOTAO_DESATIVADO_OPACIDADE);
    return obj;
  };

  caixa.setInteractive();
  caixa.on('pointerup', () => { if (obj.ativa) aoTocar(obj); });

  return obj;
}

// ---------- Aviso curto que aparece e some ----------
function mostrarAviso(cena, texto, y = 205) {
  if (cena._aviso) cena._aviso.destroy();
  cena._aviso = escrever(cena, CONFIG.LARGURA / 2, y, texto, {
    fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
    backgroundColor: '#1a1c2c', padding: { x: 4, y: 2 }
  }).setOrigin(0.5, 0).setDepth(50);
  cena.tweens.add({ targets: cena._aviso, alpha: 0, delay: 1400, duration: 400 });
}

// ---------- Caixa de confirmação (Sim / Não) ----------
// Usada ao começar uma história nova por cima de outra já salva.
function criarConfirmacao(cena, texto, aoSim) {
  const U = CONFIG.UI;
  const itens = [];

  // Fundo escuro que cobre a tela e bloqueia os toques de trás
  const fundo = cena.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x000000, 0.7)
    .setOrigin(0, 0).setDepth(100).setInteractive();
  itens.push(fundo);

  const painel = cena.add.rectangle(20, 108, 140, 94, 0x2a1838).setOrigin(0, 0)
    .setStrokeStyle(1, U.CAIXA_ESCOLHIDA).setDepth(101);
  itens.push(painel);

  const msg = escrever(cena, 90, 122, texto, {
    fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
    align: 'center', wordWrap: { width: 126 }
  }).setOrigin(0.5, 0).setDepth(102);
  itens.push(msg);

  const fechar = () => itens.forEach(i => i.destroy());

  // Seus botões Sim e Não (53×20). A versão "_sel" aparece enquanto o dedo aperta.
  const sim = criarBotaoImg(cena, 33, 174, 'botao_sim', () => { fechar(); aoSim(); }, 'botao_sim_sel');
  const nao = criarBotaoImg(cena, 94, 174, 'botao_nao', fechar, 'botao_nao_sel');
  [sim, nao].forEach(o => { o.setDepth(102); itens.push(o); });
}

// ---------- Botão liga/desliga (música, efeitos) ----------
// criarBotaoAlternar(cena, x, y, imgLigado, imgDesligado, ligado, aoMudar)
//   Mostra imgLigado ou imgDesligado. Cada toque troca e chama aoMudar(novoValor).
function criarBotaoAlternar(cena, x, y, imgLigado, imgDesligado, ligado, aoMudar) {
  let valor = ligado;
  const img = cena.add.image(x, y, valor ? imgLigado : imgDesligado).setOrigin(0, 0).setInteractive();
  let apertado = false;

  img.on('pointerdown', () => { apertado = true; img.setTint(0xb0b0b0); img.y = y + 1; });
  const soltar = () => { apertado = false; img.clearTint(); img.y = y; };
  img.on('pointerout', soltar);
  img.on('pointerup', () => {
    const valeu = apertado;
    soltar();
    if (!valeu) return;
    valor = !valor;
    img.setTexture(valor ? imgLigado : imgDesligado);
    aoMudar(valor);
  });
  return img;
}

// ---------- Existe save guardado? ----------
function temSave() {
  return Estado.existe();
}

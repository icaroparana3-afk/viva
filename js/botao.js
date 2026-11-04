// =============================================================
// botao.js — peças de tela usadas em todas as cenas:
// botões de imagem, opções provisórias, avisos e confirmação.
// =============================================================

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

// ---------- Opção provisória (retângulo + texto) ----------
// Substituto até você desenhar essas caixas.
// Devolve um objeto com .marcar(true/false) e .ativar(true/false).
function criarOpcao(cena, x, y, larg, alt, texto, aoTocar, tamanhoFonte = 9) {
  const U = CONFIG.UI;
  const caixa = cena.add.rectangle(x, y, larg, alt, U.CAIXA).setOrigin(0, 0)
    .setStrokeStyle(1, U.BORDA);
  const rotulo = cena.add.text(x + larg / 2, y + alt / 2, texto, {
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
  cena._aviso = cena.add.text(CONFIG.LARGURA / 2, y, texto, {
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

  const msg = cena.add.text(90, 122, texto, {
    fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
    align: 'center', wordWrap: { width: 126 }
  }).setOrigin(0.5, 0).setDepth(102);
  itens.push(msg);

  const fechar = () => itens.forEach(i => i.destroy());

  const sim = criarOpcao(cena, 28, 174, 60, 20, 'Sim', () => { fechar(); aoSim(); });
  const nao = criarOpcao(cena, 92, 174, 60, 20, 'Não', fechar);
  [sim, nao].forEach(o => {
    o.caixa.setDepth(102);
    o.rotulo.setDepth(103);
    itens.push(o.caixa, o.rotulo);
  });
}

// ---------- Existe save guardado? ----------
function temSave() {
  return Estado.existe();
}

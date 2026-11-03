// =============================================================
// botao.js — cria um botão de imagem que reage ao toque.
// Usado no Menu e em todas as telas seguintes.
//
// criarBotao(cena, x, y, imagem, aoTocar, ativo)
//   x, y     = canto superior esquerdo do botão, em pixels
//   imagem   = nome da imagem carregada no Boot (ex.: 'botao_nova_historia')
//   aoTocar  = o que acontece quando o jogador solta o dedo em cima do botão
//   ativo    = false deixa o botão apagado e sem reação
// =============================================================

function criarBotao(cena, x, y, imagem, aoTocar, ativo = true) {
  const botao = cena.add.image(x, y, imagem).setOrigin(0, 0);

  if (!ativo) {
    botao.setAlpha(CONFIG.MENU.BOTAO_DESATIVADO_OPACIDADE);
    return botao;
  }

  botao.setInteractive();
  let apertado = false;

  // Dedo encostou: o botão escurece e "afunda" 1 pixel
  botao.on('pointerdown', () => {
    apertado = true;
    botao.setTint(0xb0b0b0);
    botao.y = y + 1;
  });

  // Volta ao normal
  const soltar = () => {
    apertado = false;
    botao.clearTint();
    botao.y = y;
  };

  // Dedo saiu de cima do botão sem soltar: cancela
  botao.on('pointerout', soltar);

  // Dedo soltou em cima do botão: executa a ação
  botao.on('pointerup', () => {
    const valeu = apertado;
    soltar();
    if (valeu) aoTocar();
  });

  return botao;
}

// Confere se existe um save guardado no navegador.
// (try/catch = se o navegador bloquear o acesso, o jogo não quebra; só responde "não")
function temSave() {
  try {
    return localStorage.getItem(CONFIG.CHAVE_SAVE) !== null;
  } catch (e) {
    return false;
  }
}

// =============================================================
// config.js — TODOS os números e ajustes do jogo ficam aqui.
// Você pode mudar estes valores sem mexer no resto do código.
// Nas próximas etapas entram aqui: velocidade da fome, chances
// de cada origem do bebê, tempos, etc.
// =============================================================

const CONFIG = {
  // Tamanho da tela do jogo em pixels. NÃO mude:
  // todos os desenhos são feitos pensando nessa grade de 180 x 320.
  LARGURA: 180,
  ALTURA: 320,

  // Cores (código hexadecimal, o mesmo que o Piskel e o Lospec mostram).
  // Troque quando escolher a sua paleta.
  COR_FUNDO: '#1a1c2c',   // fundo escuro do jogo
  COR_TEXTO: '#f4f4f4',   // texto principal
  COR_TEXTO_FRACO: '#566c86', // textos pequenos e discretos

  // Versão do jogo. Aumente a cada envio ao GitHub
  // (0.0.1 → 0.0.2 ...). Ela aparece no rodapé da tela:
  // assim você confere no celular se ele já pegou a versão nova.
  VERSAO: '0.0.1'
};

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
  COR_FUNDO: '#1a1c2c',       // fundo escuro do jogo
  COR_TEXTO: '#f4f4f4',       // texto principal
  COR_TEXTO_FRACO: '#566c86', // textos pequenos e discretos

  // Versão do jogo. Aumente a cada envio ao GitHub (0.0.2 → 0.0.3 ...).
  // Ela aparece no rodapé: assim você confere se o celular pegou a versão nova.
  VERSAO: '0.0.4',

  // Nome da "gaveta" do navegador onde o jogo vai guardar o save.
  // Se existir algo salvo aqui, o botão "Continuar História" acende.
  CHAVE_SAVE: 'viva_save',

  // ---------- MENU ----------
  MENU: {
    // Nuvens: velocidade em pixels por segundo (0 = paradas).
    // Números pequenos = movimento calmo.
    NUVEM1_VELOCIDADE: 2,
    NUVEM2_VELOCIDADE: 3,

    // Pássaro: atravessa o céu de vez em quando.
    PASSARO_VELOCIDADE: 18,        // pixels por segundo
    PASSARO_QUADROS_POR_SEG: 6,    // velocidade do bater de asas
    PASSARO_INTERVALO_MIN: 4,      // espera mínima entre uma passada e outra (segundos)
    PASSARO_INTERVALO_MAX: 10,     // espera máxima (segundos)
    PASSARO_ALTURA_MIN: 30,        // altura mais alta onde ele pode voar (y)
    PASSARO_ALTURA_MAX: 105,       // altura mais baixa (y) — acima dos botões

    // Quanto o botão "Continuar" fica apagado quando não há save (0 = invisível, 1 = normal).
    BOTAO_DESATIVADO_OPACIDADE: 0.45
  }
};

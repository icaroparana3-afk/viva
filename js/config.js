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
  VERSAO: '0.0.6',

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
  },

  // ---------- PERFIL (Etapa 2) ----------
  PERFIL: {
    // Quantas letras o nome pode ter, no máximo.
    NOME_MAX: 12,
    // Quantas letras, no mínimo, para o botão "Começar" acender.
    NOME_MIN: 2,

    // As 5 regiões.
    //   id      = o que fica salvo
    //   nome    = o que aparece na tela ao tocar na região
    //   cor     = a cor PRINCIPAL da região no seu desenho do mapa (assets/ui/mapa_brasil.png).
    //             As sombras e brilhos não precisam estar aqui: o jogo liga cada pixel
    //             à cor principal mais próxima. Se você repintar uma região, troque só esta cor.
    //   clima   = texto que aparece ao escolher a região
    //   estados = o bebê nasce em um destes, sorteado (Etapa 3)
    REGIOES: [
      { id: 'norte', nome: 'Norte', cor: '#96e646',
        clima: 'Clima quente, com chuvas abundantes.',
        estados: ['Acre', 'Amapá', 'Amazonas', 'Pará', 'Rondônia', 'Roraima', 'Tocantins'] },
      { id: 'nordeste', nome: 'Nordeste', cor: '#84cede',
        clima: 'Clima tropical no litoral e semiárido no interior, com longos períodos de estiagem.',
        estados: ['Alagoas', 'Bahia', 'Ceará', 'Maranhão', 'Paraíba', 'Pernambuco', 'Piauí', 'Rio Grande do Norte', 'Sergipe'] },
      { id: 'centro-oeste', nome: 'Centro-Oeste', cor: '#f08c40',
        clima: 'Clima tropical típico, com verão chuvoso e inverno seco.',
        estados: ['Goiás', 'Mato Grosso', 'Mato Grosso do Sul', 'Distrito Federal'] },
      { id: 'sudeste', nome: 'Sudeste', cor: '#2c80a2',
        clima: 'Clima tropical de altitude e tropical atlântico.',
        estados: ['Espírito Santo', 'Minas Gerais', 'Rio de Janeiro', 'São Paulo'] },
      { id: 'sul', nome: 'Sul', cor: '#faec3c',
        clima: 'Clima mais frio, com possíveis geadas e neve.',
        estados: ['Paraná', 'Rio Grande do Sul', 'Santa Catarina'] }
    ],

    // Quanto o resto do mapa escurece quando uma região está escolhida
    // (0x000000 = preto, 0xffffff = sem escurecer).
    MAPA_ESCURECER: 0x707070,
    // Distância máxima (em pixels) para aceitar um toque perto da borda do mapa.
    MAPA_TOLERANCIA_TOQUE: 4
  },

  // ---------- CORES DA INTERFACE ----------
  // São as mesmas cores dos seus botões, para as telas provisórias
  // combinarem com o desenho até você desenhar cada uma.
  UI: {
    CAIXA: 0x5e3487,          // fundo de uma opção não escolhida
    CAIXA_ESCOLHIDA: 0x7b4aa6, // fundo da opção escolhida
    BORDA: 0x2a1838,          // contorno escuro
    DESTAQUE: 0xffd860,       // dourado das letras
    TEXTO: '#ffd860',
    TEXTO_FRACO: '#b07ad6'
  }
};

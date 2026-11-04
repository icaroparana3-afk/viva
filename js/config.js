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
  VERSAO: '0.0.21',

  // Nome da "gaveta" do navegador onde o jogo vai guardar o save.
  // Se existir algo salvo aqui, o botão "Continuar História" acende.
  CHAVE_SAVE: 'viva_save',

  // Gaveta separada para as opções (música e efeitos ligados/desligados).
  // Fica fora do save para não acender o "Continuar História".
  CHAVE_OPCOES: 'viva_opcoes',

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

    // Estrela cadente: risca o céu de vez em quando.
    ESTRELA_VELOCIDADE: 110,       // pixels por segundo
    ESTRELA_DURACAO: 0.8,          // quanto tempo ela fica visível (segundos)
    ESTRELA_INTERVALO_MIN: 3,      // espera mínima entre uma e outra (segundos)
    ESTRELA_INTERVALO_MAX: 9,      // espera máxima (segundos)
    ESTRELA_ALTURA_MAX: 45,        // nasce entre y=0 e este valor (parte alta do céu)


    // Quanto o botão "Continuar" fica apagado quando não há save (0 = invisível, 1 = normal).
    BOTAO_DESATIVADO_OPACIDADE: 0.45
  },

  // ---------- DESENHOS PRONTOS ----------
  // Enquanto um item estiver false, o jogo usa um desenho PROVISÓRIO feito
  // por código (no mesmo tamanho). Quando o seu desenho chegar, ele vai para
  // a pasta indicada e o item vira true. Nada mais precisa mudar.
  ARTES_PRONTAS: {
    botoes_som: false, // assets/ui/botao_musica(_off).png e botao_som(_off).png — 16×16 cada
    animal: false,     // assets/sprites/animal.png — 8 quadros de 16×16 lado a lado (128×16)
    folha: false,      // assets/sprites/folha.png — 4 quadros de 4×4 lado a lado (16×4)
    vento: false,      // assets/sprites/vento.png — risco de vento, 24×3
    sombras: false     // assets/sprites/sombra_grande.png 52×6, sombra_media.png 28×5, sombra_pequena.png 14×3
  },

  // ---------- TELA DE CARREGAMENTO ----------
  // O cenário do menu parado, sem botões, crianças, animal, estrela e pássaro,
  // com a mamadeira do autor enchendo conforme o jogo carrega.
  CARREGAMENTO: {
    TEMPO_MINIMO: 1.5,        // segundos: a tela fica pelo menos isso, para dar tempo de ver a mamadeira encher
    MAMADEIRA_X: 74,          // canto superior esquerdo da mamadeira (já ampliada)
    MAMADEIRA_Y: 116,
    MAMADEIRA_ESCALA: 2,      // 16×32 desenhada 2× maior (32×64)
    MOSTRAR_PORCENTAGEM: true // número embaixo da mamadeira
  },

  // ---------- VIDA NO MENU: vento, sombras e animal ----------
  VENTO: {
    // De tempos em tempos vem uma rajada de vento (da esquerda para a direita).
    INTERVALO_MIN: 5,          // espera mínima entre rajadas (segundos)
    INTERVALO_MAX: 12,         // espera máxima (segundos)
    DURACAO: 3.5,              // quanto dura cada rajada (segundos)
    NUVEM_MULTIPLICADOR: 4,    // no pico da rajada, as nuvens andam X vezes mais rápido
    BALANCO_PIXELS: 1,         // quantos pixels a copa das árvores e o topo das moitas se movem
    BALANCO_POR_SEG: 2.5,      // quantas vezes por segundo elas balançam no pico
    FOLHAS_POR_RAJADA: 6,      // quantas folhas voam em cada rajada
    FOLHA_VELOCIDADE_MIN: 35,  // pixels por segundo
    FOLHA_VELOCIDADE_MAX: 60,
    FOLHA_QUADROS_POR_SEG: 8,  // velocidade da folha girando
    RISCOS_POR_RAJADA: 3,      // riscos de vento no céu em cada rajada
    RISCO_VELOCIDADE: 90,      // pixels por segundo
    RISCO_ALTURA_MIN: 50,      // faixa do céu onde os riscos aparecem (y)
    RISCO_ALTURA_MAX: 200
  },

  // Sombras no chão: tipo (grande/media/pequena), centro (x, y) e opacidade.
  // O centro é o ponto do chão logo abaixo de quem faz a sombra.
  SOMBRAS: [
    { tipo: 'media',   x: 15,  y: 279, opacidade: 0.45, quem: 'arvore' }, // árvore da esquerda
    { tipo: 'media',   x: 164, y: 269, opacidade: 0.45, quem: 'arvore' }, // árvore da direita
    { tipo: 'media',   x: 12,  y: 299, opacidade: 0.35, quem: 'moita' },  // moita da esquerda
    { tipo: 'media',   x: 162, y: 291, opacidade: 0.35, quem: 'moita' },  // moita da direita
    { tipo: 'grande',  x: 90,  y: 305, opacidade: 0.45, quem: 'casal' },  // casal
    { tipo: 'pequena', x: 124, y: 306, opacidade: 0.45, quem: 'cesta' },  // cesta de piquenique
    { tipo: 'pequena', x: 146, y: 308, opacidade: 0.45, quem: 'animal' }  // animal
  ],

  // Piquenique: toalha xadrez embaixo do casal e cesta ao lado da menina.
  PIQUENIQUE: {
    TOALHA_X: 50, TOALHA_Y: 296,   // canto superior esquerdo da toalha (86×17)
    CESTA_X: 113, CESTA_Y: 287     // canto superior esquerdo da cesta (22×20)
  },

  ANIMAL: {
    X: 138, Y: 293,            // canto superior esquerdo do quadro (16×16), ao lado do piquenique
    LARGURA: 16, ALTURA: 16,   // tamanho de cada quadro do desenho
    QUADROS_PARADO: [0, 1, 2, 3], // animação parada (respirar, piscar...) — fica repetindo
    QUADROS_ACAO: [4, 5, 6, 7],   // ação de vez em quando (pulinho, coçar a orelha...)
    PARADO_QUADROS_POR_SEG: 3,
    ACAO_QUADROS_POR_SEG: 8,
    ACAO_INTERVALO_MIN: 4,     // espera mínima entre uma ação e outra (segundos)
    ACAO_INTERVALO_MAX: 9,
    VIRAR: false               // true = espelha o desenho (olhar para o outro lado)
  },

  // ---------- BEBÊ (Etapa 3) ----------
  // Regras do sorteio do bebê que a cegonha traz.
  // Listas: cada valor tem a mesma chance. Para um valor sair mais,
  // repita ele na lista (ex.: ['liso', 'liso', 'cacheado'] = liso 2x mais).
  BEBE: {
    // Chance de ser menina (0.5 = metade).
    CHANCE_MENINA: 0.5,

    // Chance de cada origem, em "pesos" (aqui somam 100, então = porcentagem).
    // Miscigenado tem chance menor que as outras 4 (regra do DESIGN).
    ORIGENS: {
      negro: 26,
      branco: 26,
      indigena: 20,
      cabo_verde: 16,
      miscigenado: 10,
      especial: 2
    },

    // O que cada origem pode ter. (Miscigenado sorteia de TODAS as listas normais.)
    REGRAS: {
      negro:      { pele: ['negro'],  cabeloTipo: ['crespo', 'cacheado'], cabeloCor: ['preto', 'castanho_escuro'],
                    olhos: ['castanho_escuro'] },
      branco:     { pele: ['branco'], cabeloTipo: ['liso', 'cacheado'],
                    cabeloCor: ['ruivo', 'loiro', 'castanho_claro', 'castanho_escuro'],
                    olhos: ['azul_claro', 'azul_escuro', 'verde_claro', 'verde_escuro', 'castanho_claro'] },
      indigena:   { pele: ['pardo'],  cabeloTipo: ['liso'], cabeloCor: ['preto'],
                    olhos: ['castanho_claro', 'castanho_escuro'] },
      // "Pele escura" do Cabo Verde = tom negro (decisão provisória; troque para 'pardo' se preferir)
      cabo_verde: { pele: ['negro'],  cabeloTipo: ['liso'], cabeloCor: ['preto'],
                    olhos: ['verde_claro', 'verde_escuro'] }
    },

    // Listas completas (usadas pelo Miscigenado).
    TODOS: {
      pele: ['branco', 'pardo', 'negro'],
      cabeloTipo: ['liso', 'cacheado', 'crespo'],
      cabeloCor: ['loiro', 'castanho_claro', 'castanho_escuro', 'preto', 'ruivo'],
      olhos: ['azul_claro', 'azul_escuro', 'castanho_claro', 'castanho_escuro', 'verde_claro', 'verde_escuro']
    },

    // Especiais (2%): cada um tem a mesma chance e o seu próprio visual.
    // Provisório até a Etapa 5, quando os desenhos dizem o que muda.
    ESPECIAIS: {
      alienigena: { pele: ['alien'],  cabeloTipo: ['liso'], cabeloCor: ['prateado'], olhos: ['preto'] },
      vampiro:    { pele: ['palido'], cabeloTipo: ['liso', 'cacheado'], cabeloCor: ['preto'], olhos: ['vermelho'] },
      lobisomem:  { pele: ['branco', 'pardo', 'negro'], cabeloTipo: ['crespo', 'cacheado'],
                    cabeloCor: ['castanho_escuro', 'preto'], olhos: ['amarelo'] }
    },

    // O estado de nascimento é sorteado entre os estados da região, todos com a mesma chance.

    // Cores PROVISÓRIAS de cada atributo (aplicadas por "tint" nas camadas do desenho).
    // Na Etapa 5, com os desenhos do bebê, você ajusta para os tons da sua paleta.
    CORES: {
      pele:      { branco: '#f2d0b4', pardo: '#c48a5c', negro: '#7a4a2e', alien: '#8fd16a', palido: '#e4e0ee' },
      cabeloCor: { loiro: '#f0d070', castanho_claro: '#a0703c', castanho_escuro: '#5a3620', preto: '#2a1e1e',
                   ruivo: '#c8502a', prateado: '#c8ccd8' },
      olhos:     { azul_claro: '#7ec8f0', azul_escuro: '#2a5ab0', castanho_claro: '#a8743c', castanho_escuro: '#4a2a18',
                   verde_claro: '#7cd27c', verde_escuro: '#2e7a3a', vermelho: '#d82020', amarelo: '#f0c020', preto: '#101010' }
    },

    // Como cada valor aparece escrito na tela.
    NOMES: {
      M: 'Menino', F: 'Menina',
      negro: 'Negro', branco: 'Branco', indigena: 'Indígena', cabo_verde: 'Cabo Verde',
      miscigenado: 'Miscigenado', especial: 'Especial',
      alienigena: 'Alienígena', vampiro: 'Vampiro', lobisomem: 'Lobisomem',
      pardo: 'Pardo', alien: 'Verde (alien)', palido: 'Pálido',
      liso: 'Liso', cacheado: 'Cacheado', crespo: 'Crespo',
      loiro: 'Loiro', castanho_claro: 'Castanho claro', castanho_escuro: 'Castanho escuro',
      preto: 'Preto', ruivo: 'Ruivo', prateado: 'Prateado',
      azul_claro: 'Azul claro', azul_escuro: 'Azul escuro', verde_claro: 'Verde claro', verde_escuro: 'Verde escuro',
      vermelho: 'Vermelho', amarelo: 'Amarelo'
    }
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
    //   subtitulo = frase curta que aparece embaixo do nome da região
    //   clima     = texto curto (até 3 linhas) que aparece ao escolher a região
    //               (os textos completos do autor estão no DESIGN.md)
    //   estados = o bebê nasce em um destes, sorteado (Etapa 3)
    REGIOES: [
      { id: 'norte', nome: 'Norte', cor: '#96e646',
        subtitulo: 'Calor de floresta',
        clima: 'Quente o ano todo (25°C a 28°C) e chuva quase todo dia.',
        estados: ['Acre', 'Amapá', 'Amazonas', 'Pará', 'Rondônia', 'Roraima', 'Tocantins'] },
      { id: 'nordeste', nome: 'Nordeste', cor: '#84cede',
        subtitulo: 'Sol de sertão e mar de litoral',
        clima: 'Sertão: sol forte e longas secas. Litoral: calor, com chuva no outono e inverno.',
        estados: ['Alagoas', 'Bahia', 'Ceará', 'Maranhão', 'Paraíba', 'Pernambuco', 'Piauí', 'Rio Grande do Norte', 'Sergipe'] },
      { id: 'centro-oeste', nome: 'Centro-Oeste', cor: '#f08c40',
        subtitulo: 'Duas estações bem marcadas',
        clima: 'Verão quente, com temporais. Inverno seco, com o ar bem seco.',
        estados: ['Goiás', 'Mato Grosso', 'Mato Grosso do Sul', 'Distrito Federal'] },
      { id: 'sudeste', nome: 'Sudeste', cor: '#2c80a2',
        subtitulo: 'Três climas numa região só',
        clima: 'Serra: verão ameno e inverno frio, com geada. Litoral: calor forte e chuva frequente.',
        estados: ['Espírito Santo', 'Minas Gerais', 'Rio de Janeiro', 'São Paulo'] },
      { id: 'sul', nome: 'Sul', cor: '#faec3c',
        subtitulo: 'As quatro estações',
        clima: 'A região mais fria do Brasil. Inverno com geada, que pede casaco de verdade.',
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

// =============================================================
// NITIDEZ — escala interna do jogo (calculada sozinha, não precisa mexer).
//
// O jogo continua sendo 180 x 320 para o código e para os seus desenhos.
// Mas por dentro ele desenha numa tela ESCALA vezes maior
// (ex.: 6 → 1080 x 1920), do tamanho da tela do aparelho.
// Assim: os desenhos são ampliados pixel por pixel (nítidos)
// e os textos são escritos já no tamanho grande (nítidos também).
// =============================================================
CONFIG.ESCALA_MAXIMA = 8; // limite, para não pesar em telas muito grandes

CONFIG.ESCALA = (() => {
  const dpr = window.devicePixelRatio || 1;                // densidade da tela (celular costuma ser 2 ou 3)
  const larg = window.innerWidth * dpr;                    // largura real da tela, em pixels físicos
  const alt = window.innerHeight * dpr;                    // altura real da tela, em pixels físicos
  const cabe = Math.min(larg / CONFIG.LARGURA, alt / CONFIG.ALTURA);
  // Arredonda para baixo (número inteiro), para os pixels da arte ficarem todos do mesmo tamanho
  return Math.max(1, Math.min(CONFIG.ESCALA_MAXIMA, Math.floor(cabe)));
})();

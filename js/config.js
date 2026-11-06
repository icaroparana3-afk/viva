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
  VERSAO: '0.0.50',

  // Transição entre telas: tempo para escurecer (e para a próxima clarear), em segundos.
  TRANSICAO_SEGUNDOS: 0.25,

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


    // Botões de música e efeitos sonoros (16×16 cada): canto superior esquerdo de cada um.
    BOTAO_MUSICA_X: 141, BOTAO_MUSICA_Y: 4,
    BOTAO_SOM_X: 159,    BOTAO_SOM_Y: 4,

    // Quanto o botão "Continuar" fica apagado quando não há save (0 = invisível, 1 = normal).
    BOTAO_DESATIVADO_OPACIDADE: 0.45
  },

  // ---------- DESENHOS PRONTOS ----------
  // Enquanto um item estiver false, o jogo usa um desenho PROVISÓRIO feito
  // por código (no mesmo tamanho). Quando o seu desenho chegar, ele vai para
  // a pasta indicada e o item vira true. Nada mais precisa mudar.
  ARTES_PRONTAS: {
    botoes_som: true,  // assets/ui/botao_musica(_off).png e botao_som(_off).png — 16×16 cada (do autor)
    animal: false,     // assets/sprites/animal.png — 8 quadros de 16×16 lado a lado (128×16)
    folha: false,      // assets/sprites/folha.png — 4 quadros de 4×4 lado a lado (16×4)
    vento: false,      // assets/sprites/vento.png — risco de vento, 24×3
    sombras: false,    // assets/sprites/sombra_grande.png 52×6, sombra_media.png 28×5, sombra_pequena.png 14×3
    janela: false,     // assets/sprites/nuvem_janela1.png 12×5, nuvem_janela2.png 8×4 e lua.png 5×5
    coracao: false,    // assets/sprites/coracao.png 7×6
    mamadeira_bebe: false,        // assets/sprites/mamadeira_bebe.png 12×7 (deitada, bico à esquerda)
    icones_necessidades16: true,  // assets/ui/icones_necessidades16.png 80×16 (5 ícones de 16×16: fome, sede, energia, higiene, diversão) — do autor
    humor: true,                  // assets/ui/humor.png 36×12 (3 carinhas 12×12: feliz, entediado, triste) — do autor
    x_nao: true,                  // assets/ui/x_nao.png 10×10 — do autor
    maozinha: true,               // assets/ui/maozinha.png 36×18 (2 quadros 18×18, apontando para a esquerda) — do autor
    sinais: false,                // Etapa 8.2 (ficam provisórios por decisão do autor): em assets/ui selos.png 32×8 e
                                  //   balao_pedido.png 26×24; em assets/sprites bebe_choro.png e bebe_esgotado.png 32×32
    painel_necessidades: true,    // assets/ui: painel_necessidades 164×196, linha_necessidade(_sel) 156×32, moldura_icone 22×22,
                                  //   botao_fechar 16×16 — redesenhados no tamanho do jogo a partir do modelo do autor
                                  //   (assets/originais/painel_necessidades_modelo.png) (v0.0.46)
    botao_necessidades: false,    // assets/ui/botao_necessidades.png 26×26 (só a caixa: o jogo põe o ícone e os 5 quadradinhos)
    sons: false,                  // assets/audio: abrir.mp3 e clique.mp3 (Etapa 30)
    sons_choro: false             // assets/audio: choro e choro_forte (.ogg e .mp3)
    // O quarto (menina e menino), o berço e a cegonha já são desenhos do autor.
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

  // ---------- CEGONHA (Etapa 4) ----------
  // A cegonha entra voando com o bebê, fica segurando até o jogador tocar
  // e NUNCA solta nem derruba o bebê: a trouxinha fica presa no bico o tempo todo.
  // Desenho do autor: assets/sprites/cegonha.png = 2 quadros de 80×87 lado a lado (160×87),
  // olhando para a esquerda, com a trouxinha já no bico (faz parte do desenho: nunca cai).
  CEGONHA: {
    LARGURA: 80, ALTURA: 87,         // tamanho de cada quadro do desenho
    QUADROS_POR_SEG: 4,              // velocidade do bater de asas (2 quadros: asas para baixo e para cima)
    ENTRADA_SEGUNDOS: 2.5,           // tempo para chegar voando até o meio da tela
    PARADA_X: 50, PARADA_Y: 50,      // onde ela fica pairando (canto superior esquerdo do quadro)
    BALANCO_PIXELS: 3,               // quanto ela sobe e desce enquanto paira
    BALANCO_POR_SEG: 0.8,
    SAIDA_SEGUNDOS: 2,               // tempo para sair voando com o bebê (indo para o berço)
    DICA_Y: 156                      // altura do texto "Toque para receber seu bebê"
  },

  // ---------- FESTA NA CHEGADA DO BEBÊ (tela da cegonha) ----------
  FESTA: {
    QUANTIDADE: 26,          // quantos corações e estrelinhas saem
    DISTANCIA_MIN: 40,       // até onde eles voam (pixels)
    DISTANCIA_MAX: 95,
    DURACAO_MIN: 0.9,        // segundos
    DURACAO_MAX: 1.6
  },

  // ---------- QUARTO (Etapa 5) ----------
  // Fundo: assets/ui/quarto_menina.png ou quarto_menino.png (180×320), conforme o bebê.
  // O vidro da janela é transparente no desenho: atrás dele o jogo desenha o céu.
  QUARTO: {
    BERCO_X: 50, BERCO_Y: 187,       // canto superior esquerdo do berço (80×64), encostado no rodapé
    BEBE_X: 74,  BEBE_Y: 199,        // canto superior esquerdo do bebê (32×32), sentado no colchão
    RESPIRAR_SEGUNDOS: 1.4,          // tempo de uma respiração (sobe 1 px e desce)
    PISCAR_MIN: 2.5,                 // espera mínima entre uma piscada e outra (segundos)
    PISCAR_MAX: 6,
    PISCAR_DURACAO: 0.15,            // quanto tempo o olho fica fechado (segundos)
    PULINHO_PIXELS: 3,               // altura do pulinho quando o jogador toca no bebê
    OLHOS_FECHADOS_TOQUE: 0.35,      // ao ser tocado, fecha os olhos (sorrindo) por este tempo (segundos)
    AVISO_Y: 40,                     // altura do aviso "Seu filho chegou!"
    INFO_X: 176, INFO_Y: 4,          // caixinha do nome e da idade (canto superior direito; x = borda direita)
    // Parede (v0.0.50): quadros e gato da prateleira, desenhos do autor (o quarto não os tem mais)
    QUADROS_X: 41, QUADROS_Y: 133,             // quadros 56×50 (com a sombra)
    GATO_X: 147, GATO_Y: 114,                  // gato 42×29 (o chão dele é a prateleira, em y=135)
    GATO_INTERVALO_SEGUNDOS: 30,               // de quanto em quanto tempo o gato balança o rabo
    GATO_BALANCOS: 3, GATO_QUADRO_MS: 240,     // quantas balançadas, e quanto dura cada quadro
    INFO_ALTURA: 31,                 // altura da caixinha (3 linhas: nome, idade, dia e hora)
    HUMOR_ESPACO: 18, HUMOR_Y: 4,   // carinha de humor 12×12, FORA da caixinha, à ESQUERDA dela; y = topo da caixinha; 18 px de folga para o nome do humor (centralizado embaixo dela) não encostar na caixinha
    TROCA_HORA_SEGUNDOS: 1,          // de quanto em quanto tempo (real) o quarto confere se virou dia/noite

    // Abajur (no criado-mudo, à direita): tocar acende e apaga a luz.
    // É só luz: NÃO tem ligação com o sono do bebê.
    ABAJUR_X: 152, ABAJUR_Y: 236, ABAJUR_LARGURA: 23, ABAJUR_ALTURA: 26, // área de toque
    ABAJUR_CUPULA_X: 150, ABAJUR_CUPULA_Y: 237,  // onde fica a cúpula acesa (abajur_aceso_*.png, 28×10)
    LUZ_CENTRO_X: 163, LUZ_CENTRO_Y: 243,        // centro do brilho
    LUZ_COR: '#ffd88a',                          // cor da luz
    LUZ_FORCA_NOITE: 1,                          // brilho à noite (0 a 1)
    LUZ_FORCA_DIA: 0.45,                         // brilho de dia (mais fraco: já está claro)
    NOITE_ESCURECER_ABAJUR: 0.12,                // escuro da noite com o abajur aceso (sem ele: CONFIG.JANELA.NOITE_ESCURECER)
    LUZ_TROCA_SEGUNDOS: 0.25                     // tempo para acender/apagar
  },

  // ---------- BRINQUEDOS DO CHÃO DO QUARTO (tocáveis) ----------
  // Recortados do desenho do autor (assets/sprites/brinquedo_<quarto>_<nome>.png).
  // x, y = canto superior esquerdo. acao: 'pulo' (pulinho), 'pulinhos' (dois pulinhos),
  // 'balanca' (treme de um lado para o outro) ou 'anda' (vai para a frente e volta).
  BRINQUEDOS: {
    menina: [
      { nome: 'urso',     x: 2,  y: 253, acao: 'pulo' },
      { nome: 'coelho',   x: 20, y: 253, acao: 'pulinhos' },
      { nome: 'elefante', x: 2,  y: 273, acao: 'balanca' },
      { nome: 'blocos',   x: 21, y: 271, acao: 'balanca' }
    ],
    menino: [
      { nome: 'dino',   x: 1,  y: 252, acao: 'pulinhos' },
      { nome: 'blocos', x: 20, y: 257, acao: 'balanca' },
      { nome: 'carro',  x: 4,  y: 272, acao: 'anda' }
    ],
    PULO_PIXELS: 4,          // altura do pulinho
    ANDA_PIXELS: 10,         // quanto o carrinho anda antes de voltar
    BALANCA_PIXELS: 1        // quanto treme para cada lado
  },

  // ---------- RELÓGIO DA PAREDE DO QUARTO ----------
  // Os ponteiros do desenho foram apagados; o jogo desenha os dois
  // ponteiros conforme a hora do jogo (js/tempo.js).
  RELOGIO: {
    CENTRO_X: 110, CENTRO_Y: 153,    // pixel do centro do mostrador
    MINUTO_COMPRIMENTO: 4,           // ponteiro grande (pixels)
    HORA_COMPRIMENTO: 3,             // ponteiro pequeno
    COR_MINUTO: 0x12232a,            // as cores dos ponteiros do desenho do autor
    COR_HORA: 0x4f3e45,
    COR_CENTRO: 0x785640
  },

  // ---------- JANELA DO QUARTO: o mundo lá fora ----------
  // Dia: céu claro e nuvens passando. Noite: céu escuro, estrelas e lua.
  // Vale a hora DO JOGO (js/tempo.js e CONFIG.TEMPO).
  JANELA: {
    X: 69, Y: 76, LARGURA: 42, ALTURA: 45,   // retângulo do vidro (o céu é desenhado aqui, atrás do quarto)
    DIA_COMECA: 6,                   // hora em que amanhece
    NOITE_COMECA: 18,                // hora em que anoitece
    // Céu em duas faixas (as mesmas cores do desenho do autor de dia)
    CEU_DIA_ALTO: '#a8dcea',  CEU_DIA_BAIXO: '#7ac3d7',
    CEU_NOITE_ALTO: '#151a3d', CEU_NOITE_BAIXO: '#232a5c',
    FAIXA_ALTURA: 14,                // altura da faixa de cima
    NUVEM_VELOCIDADE_MIN: 1.5,       // pixels por segundo (calmo)
    NUVEM_VELOCIDADE_MAX: 3,
    NUVENS: 3,                       // quantas nuvens passam ao mesmo tempo
    ESTRELAS: 14,                    // quantas estrelas aparecem à noite
    LUA_X: 96, LUA_Y: 79,            // onde fica a lua (canto superior esquerdo)
    TROCA_SEGUNDOS: 1.5,             // tempo da passagem dia ↔ noite
    NOITE_ESCURECER: 0.28,           // quanto o quarto escurece à noite (0 = nada, 1 = preto)
    // Vida lá fora: de dia passa um passarinho; à noite cai uma estrela cadente
    PASSARO_INTERVALO_MIN: 6, PASSARO_INTERVALO_MAX: 14,   // segundos entre um passarinho e outro
    PASSARO_VELOCIDADE: 14,                                 // pixels por segundo
    ESTRELA_INTERVALO_MIN: 5, ESTRELA_INTERVALO_MAX: 12,   // segundos entre uma estrela cadente e outra
    ESTRELA_VELOCIDADE: 55                                  // pixels por segundo
  },

  // ---------- TEMPO DO JOGO (Etapa 6) ----------
  // O jogo tem o próprio relógio e ele continua andando com o jogo fechado.
  // Começa quando a cegonha entrega o bebê. Contas em js/tempo.js.
  TEMPO: {
    DIAS_REAIS_POR_ANO: 3.5,        // 1 ano do jogo = 3,5 dias reais (7 dias reais = 2 anos)
                                    // → 1 dia do jogo ≈ 13,8 min reais; 1 hora ≈ 34,5 s
    HORA_CHEGADA: 8,                // hora do jogo em que o bebê chega (8h da manhã do 1º dia)
    AVISO_VOLTA_MINUTOS: 5,         // fora por pelo menos este tempo (real) → aviso "Você ficou fora..."
    ABANDONO_HORAS: 24,             // fora por este tempo (REAL) = a regra do abandono entra em vigor (Etapa 17)
    ABANDONO_ALERTA_HORAS: 18,      // a partir daqui o aviso de volta diz "não demore"
    MARCAR_VISITA_SEGUNDOS: 15,     // de quanto em quanto tempo o save guarda "última vez aqui"
    TESTE_TOQUE_RELOGIO: true       // TESTE: tocar no relógio da parede adianta 1 hora do jogo (tirar antes de lançar)
  },

  // ---------- NECESSIDADES DO BEBÊ (Etapa 8) ----------
  // Barras de 0 a 100 (100 = tudo bem). Caem pelo tempo REAL. Contas em js/necessidades.js.
  NECESSIDADES: {
    // Quanto cada barra cai por HORA REAL com o jogo aberto (100 / horas para esvaziar)
    QUEDA_POR_HORA: {
      fome: 20,          // 5 h reais de cheia a vazia (decisão do autor)
      sede: 20,          // 5 h
      diversao: 25,      // 4 h
      energia: 0,        // parada até a etapa do sono   (quando ligar: 12.5 = 8 h)
      higiene: 0         // parada até a etapa do banho  (quando ligar: 10 = 10 h)
    },
    FATOR_FECHADO: 0.5,           // com o jogo fechado cai na metade da velocidade (decisão do autor)
    LIMITE_ABERTO_SEGUNDOS: 60,   // mais que isso sem atualizar = o jogo estava fechado
    // Como o bebê chega: com fome, com sede e entediado (DESIGN)
    CHEGADA: { fome: 40, sede: 40, energia: 80, higiene: 90, diversao: 30 },
    LIMITE_TRISTE: 20,            // abaixo disso fica triste
    LIMITE_ENTEDIADO: 40,         // diversão abaixo disso = entediado
    COR_BOA: 0x6cc24a, COR_MEDIA: 0xf0c020, COR_RUIM: 0xe04848,   // cores da barra (>50, 25–50, <25)

    // Mamadeira (0 a 1 ano): enche fome e sede juntas
    MAMADEIRA_POR_SEG: 18,        // quanto sobe por segundo enquanto mama
    MAMADEIRA_RECUSA: 95,         // fome e sede acima disso = "não quero"
    // Brincar um pouquinho com o toque
    DIVERSAO_TOQUE_BEBE: 3,       // tocar no bebê
    DIVERSAO_TOQUE_BRINQUEDO: 5,  // tocar num brinquedo do chão (o bebê acha graça) — 5 a pedido do autor (v0.0.47)

    // Onde ficam as coisas na tela do quarto
    BOTAO: { X: 150, Y: 288 },    // botão de necessidades (26×26), canto inferior direito (Etapa 8.1)
    COR_PARADA: 0x8a8a8a,         // pontinho das barras paradas (energia e higiene, por enquanto)
    PULSO_PIXELS: 1,              // o botão sobe e desce isso quando alguma barra está vermelha
    PULSO_SEGUNDOS: 0.5,
    // Painel aberto
    PAINEL: { X: 8, Y: 116, LARGURA: 164, ALTURA: 196 },
    PAINEL_ESCURO: 0.55,          // quanto o quarto escurece atrás do painel (0 a 1)
    PAINEL_SUBIR_MS: 200,         // animação do painel subindo
    LINHA_Y0: 21, LINHA_ESPACO: 34,   // primeira linha e distância entre linhas (dentro do painel)
    FECHAR_X: 147, FECHAR_Y: 1,       // botão X (16×16), em cima do canto da moldura, como no modelo
    BARRA_FUNDO: 0x1b1225, BARRA_BORDA: 0x634a76, BARRA_DIVISAO: 0.35,   // trilho da barra e divisões a cada 10%
    COR_EM_BREVE: '#8a7f96',
    LIMITE_ALERTA: 25,            // abaixo disso aparece o "!" piscando
    NOMES: { fome: 'Fome', sede: 'Sede', energia: 'Energia', higiene: 'Higiene', diversao: 'Diversão' },
    DICAS: { fome: '> MAMADEIRA', sede: '> MAMADEIRA', energia: '> DORMIR', higiene: '> BANHO', diversao: '> BRINCAR' },
    TESTE_MINUTOS_RELOGIO: 30,    // TESTE: tocar no relógio também faz as barras caírem como se passassem 30 min reais
    BALAO_X: 100, BALAO_Y: 172,   // balão de pedido (26×24), ao lado da cabeça do bebê
    BOTAO_MAMADEIRA_X: 4, BOTAO_MAMADEIRA_Y: 140,   // botão da mamadeira (22×38), na parede da esquerda
    MAMADEIRA_BOCA_X: 91, MAMADEIRA_BOCA_Y: 212     // mamadeira na boca (canto superior esquerdo, sobe e desce com o bebê)
  },

  // ---------- SINAIS DE CUIDADO (Etapa 8.2) ----------
  // O jogador percebe o que o bebê precisa sem abrir o painel e sem texto.
  // Só as barras ATIVAS sinalizam (energia e higiene paradas, não). Contas em js/sinais.js.
  SINAIS: {
    // Faixas pela porcentagem (arredondada) da barra:
    //   acima de 70 → nada | 70 a 51 → triste | 50 a 26 → chorando | 25 a 1 → chorando forte | 0 → esgotado
    FAIXAS: { TRISTE: 70, CHORANDO: 50, FORTE: 25 },
    ALTERNAR_SEGUNDOS: 2,         // duas necessidades na mesma faixa: o balão alterna entre elas
    // Carinha de humor (no lugar do texto): humor → quadro de humor.png. Para uma carinha nova,
    // desenhe mais um quadro e acrescente aqui.
    HUMOR_QUADROS: { feliz: 0, entediado: 1, triste: 2 },
    HUMOR_NOMES: { feliz: ['Feliz', 'Feliz'], entediado: ['Entediado', 'Entediada'], triste: ['Triste', 'Triste'] }, // [menino, menina]
    HUMOR_TEXTO_SEGUNDOS: 2,      // tocar na carinha mostra o nome por este tempo
    SELO_QUADROS: { triste: 0, chorando: 1, forte: 2, esgotado: 3 },   // quadros de selos.png
    // Balão: posições dentro dele
    BALAO_ICONE_X: 5, BALAO_ICONE_Y: 2, BALAO_SELO_X: 17, BALAO_SELO_Y: 11,
    TREMOR_BALAO_PIXELS: 1,       // chorando forte: o balão treme
    // Bebê
    MAOS_PIXELS: 1, MAOS_SEGUNDOS: 0.35,          // triste: "mexe as mãos" (provisório: mexe de lado de leve)
    LAGRIMA_COR: 0x6ec8ff,
    LAGRIMA_CHORANDO: 0.6, LAGRIMA_FORTE: 0.3,    // segundos entre uma lágrima e outra
    BALANCO_FORTE_PIXELS: 2, BALANCO_FORTE_SEGUNDOS: 0.8,   // chorando forte: balança no berço
    DEITADO_Y: 35,                // esgotado: deitado (o bebê gira 90°; a altura dele em relação ao BEBE_Y)
    // Sons (só com efeitos ligados, jogo aberto e arquivos presentes)
    CHORO_INTERVALO: 20, CHORO_VOLUME: 0.6,       // chorando: "choro" a cada ~20 s
    FORTE_INTERVALO: 10, FORTE_VOLUME: 1,         // chorando forte: "choro_forte" a cada ~10 s
    // "Não quero" (mamadeira com fome e sede cheias)
    RECUSA_SEGUNDOS: 1.5, RECUSA_BALANCOS: 2, RECUSA_PIXELS: 2,
    RECUSA_X_X: 15, RECUSA_X_Y: 9,   // X 10×10 no canto do balão (no lugar do selo, sobre o branco)
    // Mãozinha da primeira vez (fome → aponta para a mamadeira)
    MAOZINHA_X: 26, MAOZINHA_Y: 151,   // mãozinha 18×18, o dedo encosta na caixa da mamadeira
    // Botão de necessidades: "!" no canto quando alguma barra ativa está abaixo de 25
    ALERTA_BOTAO_X: 20, ALERTA_BOTAO_Y: 1,
    // Botão de necessidades (v0.0.45): ícone da necessidade mais baixa + 5 quadradinhos
    //   tudo 100%   → carinha feliz, 5 verdes
    //   acima de 50 → ícone, 4 verdes e 1 vazio
    //   1 a 50      → ícone, 3 amarelos e 2 vazios
    //   0           → ícone, 5 vermelhos
    BOTAO_ICONE_X: 5, BOTAO_ICONE_Y: 2,           // ícone 16×16 dentro do botão
    BOTAO_FELIZ_X: 7, BOTAO_FELIZ_Y: 5,           // carinha feliz 12×12 (tudo 100%)
    QUADRADOS_X: 4, QUADRADOS_Y: 20,              // primeiro quadradinho
    QUADRADO_TAMANHO: 3, QUADRADO_ESPACO: 1,      // 5 quadradinhos de 3×3 com 1 px entre eles
    COR_QUADRADO_APAGADO: 0x1c1026,
    // TESTE: no painel aberto, tocar na barra de uma necessidade troca o valor
    // por esta lista (100 → 70 → 50 → 25 → 0 → 100). Tirar antes de lançar.
    TESTE_BARRAS: true, TESTE_VALORES: [100, 70, 50, 25, 0]
  },

  // ---------- BEBÊ (Etapa 3) ----------
  // Regras do sorteio do bebê que a cegonha traz.
  // Listas: cada valor tem a mesma chance. Para um valor sair mais,
  // repita ele na lista (ex.: ['liso', 'liso', 'cacheado'] = liso 2x mais).
  BEBE: {
    // Nome do bebê (escolhido pelo jogador quando a cegonha entrega)
    NOME_MAX: 12,
    NOME_MIN: 2,

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

    // Como se diz "nasceu ___ <estado>" (no, na ou em), para frases como "Nasceu no Paraná".
    NASCEU_EM: {
      'Acre': 'no', 'Amapá': 'no', 'Amazonas': 'no', 'Pará': 'no', 'Rondônia': 'em', 'Roraima': 'em', 'Tocantins': 'no',
      'Alagoas': 'em', 'Bahia': 'na', 'Ceará': 'no', 'Maranhão': 'no', 'Paraíba': 'na', 'Pernambuco': 'em', 'Piauí': 'no',
      'Rio Grande do Norte': 'no', 'Sergipe': 'em',
      'Goiás': 'em', 'Mato Grosso': 'em', 'Mato Grosso do Sul': 'em', 'Distrito Federal': 'no',
      'Espírito Santo': 'no', 'Minas Gerais': 'em', 'Rio de Janeiro': 'no', 'São Paulo': 'em',
      'Paraná': 'no', 'Rio Grande do Sul': 'no', 'Santa Catarina': 'em'
    },

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

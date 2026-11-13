# Viva — Regras do jogo (DESIGN)

> Este arquivo guarda as regras do jogo. Quando uma regra mudar, ela é atualizada aqui.

## Regras técnicas fixas
- Phaser 3 por CDN, sem build. Tela 180×320, retrato, `pixelArt: true`, `Scale.FIT`.
- Todos os números de equilíbrio (velocidade da fome, probabilidades, tempos) ficam em `js/config.js`, comentados em português.
- Personagem em camadas do mesmo tamanho (corpo/pele, olhos, cabelo, roupa). Cores de pele, cabelo e olhos aplicadas por código (tint ou troca de paleta): cada parte é desenhada uma vez só.
- Save no `localStorage` desde cedo. Nuvem (Firebase) só no final.
- Visual 100% feito pelo autor. Até o desenho ficar pronto, usar formas simples (retângulos e círculos) como substitutos.
- Caminhos de arquivo sempre relativos (`./...`), nomes em minúsculas, sem espaço nem acento.

## Ideia
Estilo Tamagotchi, pixel art, para celular. A cegonha traz um bebê aleatório e o jogador cuida dele até os 18 anos.
Tempo: 7 dias reais = 2 anos no jogo (1 ano = 3,5 dias reais; 0 a 18 anos ≈ 63 dias reais).
- O jogo tem relógio próprio (decisão do autor, 2026-11-05): 1 dia do jogo ≈ 13,8 min reais; 1 hora ≈ 34,5 s; 1 mês ≈ 7 h reais. O tempo continua passando com o jogo fechado.
- O relógio começa quando a cegonha entrega o bebê, às 8h do 1º dia. Dia das 6h às 18h; noite das 18h às 6h.
- O quarto mostra o nome, a idade e o dia/hora do jogo ("Dia 41 · 17h"). Quem volta depois de um tempo fora vê quanto tempo ficou fora e quanto passou no jogo.

## App (PWA)
- O Viva se instala no celular como app (ícone na tela inicial, tela cheia, retrato) e abre sem internet depois da primeira visita. Com internet, sempre carrega a versão mais nova.

## Menu e perfil
- Menu: Nova História, Continuar História (só ativo se houver save), Configurações.
- Antes de receber o bebê, o jogador cria o perfil em duas telas:
  1. Nome e papai ou mamãe.
  2. Região, escolhida tocando no mapa do Brasil (cada região tem uma cor). Ao tocar, a região acende e aparecem o nome e a descrição do clima.
- O bebê nasce em um estado sorteado dentro da região escolhida.

## Geração do bebê
- Atributos: sexo (M/F); pele (branco, pardo, negro); tipo de cabelo (liso, cacheado, crespo); cor do cabelo (loiro, castanho claro, castanho escuro, preto, ruivo); olhos (azul claro, azul escuro, castanho claro, castanho escuro, verde claro, verde escuro).
- Origens:
  - Negro: pele negra; cabelo crespo ou cacheado, preto ou castanho escuro; olhos castanho escuro.
  - Branco: pele branca; cabelo liso ou cacheado, ruivo, loiro, castanho claro ou castanho escuro; olhos azuis, verdes ou castanho claro.
  - Indígena: pele parda; cabelo liso e preto; olhos castanho claro ou escuro.
  - Cabo Verde: pele escura; cabelo liso e preto; olhos verdes.
  - Miscigenado: atributos aleatórios (chance menor que as anteriores).
  - Especial: alienígena, vampiro ou lobisomem (2% de chance).
- Ao receber o bebê, mostra só o sexo. A origem só aparece se for especial.
- Chances (Etapa 3, ajustáveis em `CONFIG.BEBE.ORIGENS`): Negro 26%, Branco 26%, Indígena 20%, Cabo Verde 16%, Miscigenado 10%, Especial 2%.
- Cabo Verde "pele escura" = tom negro (provisório, ajustável).
- Especiais (cada um 1/3 dos 2%): alienígena (pele verde, cabelo liso prateado, olhos pretos, anteninhas); vampiro (pele pálida, cabelo liso ou cacheado preto, olhos vermelhos, dentinhos); lobisomem (pele branca/parda/negra, cabelo crespo ou cacheado castanho escuro ou preto, olhos amarelos, orelhas de lobo). Visual definitivo na Etapa 5.
- Estado de nascimento: sorteado entre os estados da região, todos com a mesma chance.
- Tipo de cabelo (liso, cacheado, crespo): sorteado no nascimento e guardado, mas só aparece a partir de 1 ano (idade exata na Etapa 8). Até lá, o bebê tem um único desenho de cabelo, com a cor sorteada.

## Cegonha
Entra voando com o bebê e fica segurando-o até o jogador tocar. NUNCA solta nem derruba o bebê. Depois do toque, o bebê vai para o berço no quarto.
- Implementação (Etapa 4): o bebê é sorteado e salvo quando a cegonha aparece (fechar o jogo traz o mesmo bebê). Ela entra voando, paira até o toque e a trouxinha fica presa ao bico o tempo todo (no desenho do autor, a trouxinha faz parte da cegonha). Ao tocar, mostra "É um menino!/É uma menina!", a origem só se for especial e o estado onde nasceu. "Levar para o berço": a cegonha sai voando com o bebê para o quarto.

## Necessidades e emoções
- Barras: fome, sede, energia, higiene, diversão.
- Emoções (estilo The Sims): feliz, entediado, triste, focado (lista pode crescer).
- O bebê chega com fome, sede e entediado.
- Barras de 0 a 100 que caem pelo TEMPO REAL, não pelo relógio rápido do jogo (decisão do autor, 2026-11-05). A fome vai de cheia a vazia em 5 h reais.
- Com o jogo fechado, as barras continuam caindo, mas na metade da velocidade.
- O bebê pede o que mais precisa com um balão. Humor (Etapa 8): feliz, entediado (diversão baixa) ou triste (alguma barra muito baixa).
- Sinais de cuidado (Etapa 8.2), sem texto porque o bebê não fala: o bebê mostra que algo está errado, o balão diz o que ele quer e a carinha à esquerda da caixinha do nome mostra o humor geral.
  - Faixas de cada barra: acima de 70 nada; 70–51 tristinho; 50–26 chora (som a cada ~20 s); 25–1 chora forte (som a cada ~10 s, balão treme, botão pulsa com "!"); 0 esgotado, deitado e em silêncio.
  - O balão mostra a mais urgente; se duas estiverem na mesma faixa, alterna. O choro segue a pior.
  - Recusa da mamadeira: X vermelho no balão e o bebê vira o rosto. Nenhum texto.
  - Na primeira vez que pede comida, uma mãozinha aponta para a mamadeira (uma vez só).
  - O bebê chega com fome 40, sede 40 e diversão 30, ou seja, já chorando: de propósito, para ensinar o jogo.
- Energia e higiene só começam a cair nas etapas do sono e do banho.
- No quarto as barras ficam escondidas num botão (canto inferior direito). Dentro dele aparece o ícone da necessidade mais baixa (com tudo 100%, a carinha feliz) e 5 quadradinhos: tudo 100% = 5 verdes, acima de 50 = 4 verdes e 1 vazio, 1 a 50 = 3 amarelos e 2 vazios, 0 = 5 vermelhos. Ele pulsa com um "!" quando alguma está abaixo de 25 (v0.0.45). Tocar abre o painel com as 5 barras grandes e a dica do que fazer em cada uma (Etapa 8.1).

## Casa
Quarto (berço), sala (TV), varanda (brinquedos), banheiro (banheira), cozinha (cadeirinha). O jogador navega entre eles.
- Quarto (Etapa 5): o bebê fica sentado no berço, respira, pisca e reage ao toque: fecha os olhos sorrindo, dá um pulinho e solta um coração.
- Quarto de menina (rosa) e quarto de menino (azul), escolhido pelo sexo do bebê. O berço não tem grade na frente.
- Janela viva: de dia, claridade, céu azul e nuvens passando; de noite, céu escuro e estrelas (e lua). O quarto escurece um pouco à noite.
- Nome do bebê: o jogador escolhe quando a cegonha entrega (2 a 12 letras). Aparece nas boas-vindas do quarto.
- Brinquedos do chão do quarto reagem ao toque (pulam, balançam, o carrinho anda). Cada toque dá 5 de diversão. Janela: passarinho de dia, estrela cadente à noite.
- Relógio da parede do quarto funciona: os ponteiros mostram a hora do jogo.
- Gato da estante (v0.0.55–0.0.56): desenho do autor, rabo animado o tempo todo; tocar faz ele balançar como os brinquedos (sem diversão).

## Eventos do bebê (v0.0.57)
Coisas que acontecem sozinhas no quarto, só com o jogo aberto e o bebê bem (nenhuma barra chorando). Sem texto: o bebê não fala.
- Imaginação: nuvem de pensamento com 3 coisas, uma depois da outra (gato, bola, coração; sol e passarinho de dia, lua e estrela à noite; mamadeira se tiver fome). Tocar estoura a bolha (+2 diversão).
- Chocalho: o bebê brinca sozinho (+8 diversão).
- Dodói: às vezes o chocalho bate na testa: galo, estrelinhas, choro forte e o balão pede um curativo. Tocar no bebê põe o curativo (fica 10 min reais). Ignorado: para sozinho em 45 s, mas perde 15 de diversão. (v0.0.59: sem limite de tempo entre dodóis; chance de 10% por chocalho.)
- Abajur (no criado-mudo): tocar acende e apaga. É SÓ LUZ, sem ligação com o sono do bebê (decisão do autor, 2026-11-05): à noite ele clareia o quarto escuro sem fazer o bebê dormir. O jeito de pôr o bebê para dormir será decidido na etapa do sono.

- v0.0.58: soluço (carinho ou mamadeira faz passar), espirro (o gato pula; mais no frio), beijinho (vínculo alto), susto com o trovão. Chocalho com 10% de dodói (era 30% na v0.0.58).
- Festa (v0.0.60): mesinha 40×28 no tapete com o bolo do autor em cima (azul para menino, rosa para menina), vela animada a 4 quadros por segundo. No espirro, o gato da prateleira pula de susto (desenho do autor 42×29).
- Chocalho: desenho do autor 12×12 (1 quadro); o jogo balança girando ±15° pela base do cabo.
- Dar o brinquedo: arrastar do chão até o berço; o bebê brinca (+12 diversão), com 15% de chance de se machucar (dodói; era 30% na v0.0.58).

## Estações e clima (v0.0.58)
- O calendário começa no mês real em que o bebê chegou. Cada estação dura 3 meses do jogo; ciclo verão → outono → inverno → primavera.
- Verão: sol mais intenso, mais visitas na janela, chuva rápida e forte no fim da tarde de vez em quando (Sudeste, Centro-Oeste, Sul e Norte). No Nordeste, menos chuva e sol mais forte.
- Outono: transição para o frio. Folhas secas passando pela janela, sol mais fraco, temperatura um pouco mais baixa em todas as regiões, menos visitas.
- Inverno: frio forte no Sul e Sudeste, com dias e madrugadas nublados e chance de neve; seca e frio no Centro-Oeste; chuva frequente no Norte e Nordeste. Sem visitas na janela.
- Primavera: volta o calor. Chuvas rápidas com raios e vento forte no Centro-Oeste e Sudeste; sol nas outras regiões; as visitas voltam, com menos frequência.
- A temperatura já é calculada (região, estação, noite, chuva) e aparece ao tocar na janela. Vai servir para a roupa e o clima do bebê.

## Vínculo, festas e álbum (v0.0.58)
- Vínculo: valor escondido que sobe com carinho e cuidado e cai com descuido. Muda a recepção na volta, os corações do carinho e o beijinho espontâneo.
- Recepção: ao voltar, o bebê bem cuidado recebe você com festa.
- Festa só no aniversário, a cada ano completo (v0.0.63: o mesversário saiu, decisão do autor, porque o bebê fica ~1 mês mais velho a cada visita e a festa aparecia toda vez). Se a volta pular o mês exato, a festa acontece mesmo assim.
- Álbum de momentos: as primeiras vezes e as festas, guardadas sozinhas, com o dia do jogo e a idade.
- Tutorial: a mãozinha ensina o painel e os brinquedos, uma vez cada.

## Bebê
- Alimentação: 0 a 1 ano, mamadeira no berço até encher a fome. A mamadeira enche a fome e a sede juntas (decisão do autor, 2026-11-05). Depois, na cozinha.
- Banho: banheira; sabonete faz espuma, chuveiro tira. Brincar suja.
- Roupa e clima: frio pede roupa quente, calor pede roupa fresca. Frio + roupa errada = resfriado (cuidados e remédio). Calor + roupa errada = chora mais, sem dizer por quê.
- Brincar: sala (assistir) ou varanda (brinquedos). Muda com a idade.
  - YohTub (fictício): besteira diverte mas não ensina; educativo aumenta inteligência e acelera a fala.
  - 0 a 2 anos: assistir mais do que brincar = vício em tela, passa a gostar menos de brincar.
  - Varanda: habilidade motora, anda mais cedo.
- Dormir: no quarto (como iniciar o sono: a decidir na etapa do sono; NÃO é o abajur); dorme até encher a energia. 0 a 2 anos sem dormir: chora ao brincar e não aprende nada.
- Fala: em nível médio, chama "papai" ou "mamãe" conforme o perfil.

## Doenças (todas as idades)
Gripe, catapora, enjoo/vômito. Mais cuidado e, quando fizer sentido, remédio.

## Regiões e estados
- Norte: Acre, Amapá, Amazonas, Pará, Rondônia, Roraima e Tocantins.
- Nordeste: Alagoas, Bahia, Ceará, Maranhão, Paraíba, Pernambuco, Piauí, Rio Grande do Norte e Sergipe.
- Centro-Oeste: Goiás, Mato Grosso, Mato Grosso do Sul e Distrito Federal.
- Sudeste: Espírito Santo, Minas Gerais, Rio de Janeiro e São Paulo.
- Sul: Paraná, Rio Grande do Sul e Santa Catarina.

## Descrição do clima (mostrada ao tocar na região)
Na tela aparece: nome da região, subtítulo e um texto curto (até 3 linhas, para caber embaixo do mapa).

| Região | Subtítulo | Texto curto (no jogo) |
|---|---|---|
| Norte | Calor de floresta | Quente o ano todo (25°C a 28°C) e chuva quase todo dia. |
| Nordeste | Sol de sertão e mar de litoral | Sertão: sol forte e longas secas. Litoral: calor, com chuva no outono e inverno. |
| Centro-Oeste | Duas estações bem marcadas | Verão quente, com temporais. Inverno seco, com o ar bem seco. |
| Sudeste | Três climas numa região só | Serra: verão ameno e inverno frio, com geada. Litoral: calor forte e chuva frequente. |
| Sul | As quatro estações | A região mais fria do Brasil. Inverno com geada, que pede casaco de verdade. |

Textos completos do autor (guardados para uma futura tela de detalhes):
- Norte — Calor de floresta: Clima equatorial úmido, quente o ano todo, com chuva quase diária e temperaturas entre 25°C e 28°C. Aqui o calor não vai embora e a chuva aparece quase todo dia.
- Nordeste — Sol de sertão e mar de litoral: No sertão, o sol é forte e a chuva é escassa, com longas secas. No litoral, a umidade do mar traz calor com chuva no outono e inverno. Num mesmo estado pode ter seca no sertão e chuva na praia.
- Centro-Oeste — Duas estações bem marcadas: Verão quente e chuvoso, com temporais, e inverno seco, com ar bem pesado de secura. Chuva forte no verão e ar seco no inverno.
- Sudeste — Três climas numa região só: Nas serras, o verão é ameno e o inverno frio, com chance de geada. No litoral, o calor é forte e a chuva frequente. Dá para sentir frio na serra e calor na praia no mesmo dia de viagem.
- Sul — As quatro estações: É a região mais fria do Brasil, com grande diferença entre verão e inverno e chuva distribuída o ano todo. O inverno chega com geada e pede casaco de verdade.

## Clima por região (simulado pelo jogo)
- Nordeste: mais calor, pouco frio.
- Norte: quente, com chuvas abundantes.
- Sul: mais frio, menos calor.
- Sudeste e Centro-Oeste: um pouco mais frio que o Nordeste, menos que o Sul.

## Brincadeiras, câmera e o plano para prender o jogador (v0.0.62)
Objetivo do autor: o jogador ficar mais tempo no jogo e ter motivos para voltar. Regra: recompensa, nunca castigo; nada de obrigação com hora marcada.
Ordem combinada (Etapa 8, bebê):
1. **Pacote 1 (v0.0.62, feito):** brincadeiras do baú (bolhas de sabão, cadê-achou, livro de figuras, torre de blocos) e câmera de fotos.
2. **Marcos do desenvolvimento** (v0.0.63, feito).
3. **3 tarefinhas do dia** (v0.0.64, feito).
4. **Estrelinhas e lojinha** (roupas, decoração, brinquedos) (v0.0.66, feito).
- Banho: fica para OUTRO cômodo (banheiro), para não juntar tudo no quarto.
- Visita da família: decidir antes do "aprovado" da Etapa 8. Ideia do autor: os presentes viram decoração, roupa ou brinquedo.

Como funciona:
- **Baú de brinquedos** (no quarto, embaixo do urso): tocar abre "Vamos brincar?" com as 4 brincadeiras. Uma mãozinha ensina o baú uma vez (depois de aprender os brinquedos, com a diversão abaixo de 85).
- Não dá para brincar com o bebê chorando por fome, sede, sono ou higiene, nem com dodói ("Cuide do bebê primeiro!"). Chorando só por falta de diversão pode, porque brincar é o remédio. Com energia abaixo de 15: "está com muito sono".
- A brincadeira abre por cima do quarto (que fica pausado e escurecido) e mostra o bebê de perto. Ganha diversão e vínculo, gasta 2 de energia. Sair no meio também ganha o que já brincou.
- **Bolhas:** 30 s; tocar nas bolhas antes de sumirem (+1; a dourada +3); até +18 de diversão.
- **Cadê-achou:** 5 rodadas. Tocar esconde o rosto com as mãos; tocar de novo quando aparecer o "!" → "ACHOU!" (+4, risada). Cedo demais: +1. Demorou: +0.
- **Livro de figuras:** 8 páginas com as figuras dos pensamentos (gato, passarinho, sol, lua, estrela, mamadeira, bola, coração) e a palavra. Tocar na figura: o bebê "fala" a primeira sílaba ("ga-ga!"); conta as palavras ouvidas (`save.atividades.palavras`, base para a primeira palavra, decisão 9). Livro todo: +10.
- **Torre de blocos:** o bloco anda no alto; tocar solta. Precisa ficar 45% em cima do outro, senão a torre cai (o bebê ri do mesmo jeito). Com 8 blocos, o bebê derruba tudo rindo. +2 por bloco, +4 ao derrubar.
- **Câmera** (botão ao lado do álbum): um visor 80×80 que dá para arrastar pelo quarto; o bebê sorri para a foto. As fotos (até 40) ficam no álbum, na aba "Fotos": miniaturas, foto grande com dia e idade, e dá para apagar. Ficam no localStorage `viva_fotos`, fora do save.
- Contagens e recordes em `save.atividades` (servem para as tarefas do dia e os marcos).
- **Bolhas vermelhas (v0.0.63, pedido do autor):** 18% das bolhas são vermelhas e tiram 2 pontos se estouradas (nunca abaixo de zero); o bebê faz careta e a tela treme. Fuja delas!

## Marcos do desenvolvimento (v0.0.63)
Cada marco chega quando o bebê tem a IDADE mínima (meses do jogo) E o jogador fez a conquista pedida. Se a idade chegou e falta a conquista, ele espera, nunca se perde. Um marco por vez, com festinha (medalha sobe do bebê, "Novo marco!") e entra no álbum.
Na ordem: sorriso para você (1 mês, carinho), primeira gargalhada (3 meses, 15 risadas nas brincadeiras), segura o chocalho sozinho (4 meses, 3 chocalhos), tenta pegar as bolhas (5 meses, 30 bolhas), primeiro dentinho (6 meses, só a idade), entende o cadê-achou (8 meses, 10 "achou!"), bate palminhas (9 meses, ler o livro todo 2 vezes), dá tchauzinho (10 meses, carinho), adora derrubar torres (12 meses, 3 torres), manda beijinho (14 meses, muito carinho).
Os marcos que mudam o jogo: gargalhada (o bebê ri mais nas brincadeiras, +1 coração), bate palminhas (bate palmas no fim das brincadeiras) e dá tchauzinho (acena quando você volta ao jogo).
Ficaram de fora (são de etapas futuras): engatinhar, ficar em pé e andar (varanda), primeira palavra (Etapa 14), papinha (cozinha) e dormir (etapa do sono). O dentinho é só comemoração: a chupeta cobre a boca.
Caderneta: a aba "Marcos" do álbum mostra os que chegaram (com dia e idade) e, nos outros, a idade e o que falta ("Falta: chocalho 1/3"). O carinho aparece sem número ("mais carinho"), porque o vínculo é escondido.

## Bico, cortinas, resfriado e tarefas do dia (v0.0.64)
- **Bico (chupeta):** não é mais permanente. A chupeta do desenho do autor virou uma camada que sai; embaixo apareceu uma boquinha (neutra, sorriso, e sorriso com o dentinho depois do marco "primeiro dentinho").
  - O bebê pede o bico num balão. Chance de 20% por dia do jogo, +12% por nível de vício (até 80%).
  - Dar: tocar no bebê, tocar no balão ou arrastar o bico do balão até ele. Fica 1 minuto com o bico. Cada vez que dá, o vício sobe 1 (até 5).
  - Trocar: arrastar um brinquedo do chão até o berço enquanto ele pede. O vício desce 1. Se ele já estiver viciado (3 ou mais), chora um pouco (manha) e o brinquedo volta para o chão; um carinho faz parar.
  - Ninguém deu nada em 45 s: o pedido some (−2 de diversão).
  - Mamar tira o bico.
- **Cortinas:** tocar numa cortina fecha as duas (tocar de novo abre); a escolha fica guardada. Fechadas: o sol não entra, o quarto fica um pouco mais escuro, o raio quase não clareia e não assusta o bebê. Com frio ou temporal e a cortina aberta, um aviso sugere fechar.
- **Resfriado** (primeira parte das doenças): no frio (12 °C ou menos) com a cortina aberta, a cada hora do jogo há 6% de chance. Dura 36 horas do jogo: o bebê espirra bem mais e fica com o narizinho vermelho. Cortina fechada no frio evita. Remédio e médico entram com as doenças.
- **Segundo livro:** ao abrir o livro, escolhe entre "Coisas do bebê" e "Bichos e coisas" (vaca, cachorro, pato, peixe, flor, árvore, casa, carro).
- **3 tarefinhas do dia:** por dia REAL (trocam à meia-noite), sorteadas entre 9: ler um livro inteiro, estourar 15 bolhas, 3 "achou!", torre de 5 blocos, tirar uma foto, 5 carinhos, dar a mamadeira, dar um brinquedo no berço, tudo acima de 70%. Feita: "Pegar" dá 1 estrelinha; as 3: +2 de bônus. Não fazer não tira nada. Prancheta embaixo do MENU, com bolinha amarela quando tem estrelinha para pegar. As estrelinhas serão usadas na lojinha (próximo pacote).
- **Avisos:** um por vez, em fila (v0.0.65): se chegar outro com um na tela, ele espera a vez. O mesmo texto não repete e esperam no máximo 4.

## Lojinha (v0.0.66)
- **Moeda:** as estrelinhas das tarefas do dia (1 por tarefa, +2 com as 3: até 5 por dia real).
- **Onde:** sacolinha ao lado da prancheta, no quarto. Tela própria com vitrine e 3 abas.
- **Comprou, é seu para sempre**, e já começa a usar. Dá para trocar de roupa, voltar à cor original ou tirar um enfeite sem perder nada.
- **Roupas** (4 a 10 estrelinhas): bodies, macacões e pijamas, feitos por código em cima do desenho do bebê (o contorno do autor continua por cima). O bebê aparece vestido no quarto e nas brincadeiras.
- **Quarto:** parede (8) e tapete (5) em rosa, azul, menta, amarela, lilás ou pêssego; a cor original do quarto é de graça. Enfeites: móbile (10, tocar faz girar e diverte o bebê), varal de luzinhas (8) e estrelas na parede (6), que acendem à noite, e plantinha (5).
- **Brinquedos** (4 a 8): bola, patinho, pião e xilofone, no chão do quarto; dá para dar ao bebê no berço como os outros.
- Tudo junto custa ~160 estrelinhas (cerca de 1 mês jogando todo dia).
- Depois: mais itens a cada etapa (roupas de criança, móveis dos outros cômodos), e a arte do autor substitui os provisórios.

## Ausência
- Bebê: mais de 1 dia real sem entrar = aviso. De novo = adoção e fim da história. (Decisão do autor, 2026-11-05: 12 h reais viram 1 dia real.)
- Criança: mais de 1 dia real = triste e chorando no quarto, suja, sem conseguir comer; tenta brincar/assistir, nem sempre funciona.
- Adolescente: mais de 1 dia real = risco de depressão (cuidar mais, psicólogo). Várias vezes = 100% independente, pode sair de casa (fim). Se não sair, ausência deixa de ter efeito negativo.

## Criança (até 10)
- Cozinha: cadeirinha, escolhe alimentos. Gostos secretos e aleatórios, descobertos pela reação (chora/feliz).
- Brincadeiras: bola, boneco, correr, pula-pula, assistir besteira ou educativo.
- Primeira infância: se aprendeu cedo, chama papai/mamãe no fim do 1º ano e vai melhor na escola; se não, só no fim do 3º ano e tem dificuldade.
- Escola: social, tímido, CDF ou gênio (extremos possíveis; gênio muito difícil).
- Lição de casa só se mandar. Sem lição: inteligência não sobe, fica mais social.
- A partir dos 6: come e toma banho sozinho, independência gradual.

## Adolescência (10 a 17)
Come, bebe, estuda (se aprendeu) e se diverte sozinho. Escolhas mudam o rumo da vida.

## 18 anos
Assumir a vida (profissão, relacionamentos, casamento, filhos, morte — "ir para outro plano") ou começar outra história.

## Referência
Interações inspiradas em "Meu Talking Tom" (só a ideia; nada de arte, nomes ou sons).

## Decisões pendentes (decidir na etapa em que importarem)
1. Idades exatas de cada fase e alimentação entre 1 e 2 anos. (decidir quando o bebê chegar perto de 1 ano: etapa da cozinha)
2. Infância termina aos 10? (Etapa 18)
3. Regra do abandono: decidido pelo autor em 2026-11-05 — 1 dia real sem entrar = a regra entra em vigor (antes era 12 h). Falta decidir só o que acontece com aviso, adoção e "modo noite". (Etapa 17)
4. ~~Chance exata de cada origem.~~ Decidido na Etapa 3 (ver Geração do bebê).
5. "Nível médio" de fala e quanto cada atividade sobe as habilidades. (Etapa 14)
6. ~~Sede de 0 a 1 ano.~~ Decidido: a mamadeira enche fome e sede.
7. ~~Cabo Verde "pele escura".~~ Decidido: tom negro (provisório).
8. Especiais: atributos próprios decididos na Etapa 3; cada um tem uma camada extra de desenho (antenas, dentes, orelhas). Visual final na Etapa 5.
9. Fala: vale o nível (nível médio) ou a idade (fim do 1º/3º ano)? Provável: o nível, com velocidade de subida que leva a essas idades. (Etapa 14)
10. O que acontece quando uma barra fica em 0% (esgotado)? Por enquanto só o sinal, sem doença nem consequência. (Pergunta aberta da Etapa 8.2)

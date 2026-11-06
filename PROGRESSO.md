# Viva — PROGRESSO

> Se o chat ficar longo, cole este arquivo num chat novo para continuar de onde parou.

## Etapa atual
**Etapa 8.2 — Sinais de cuidado** (v0.0.49: tela preta tratada, brinquedo +5, carinha à esquerda da caixinha alinhada ao topo; aguardando "aprovado")

## O que está pronto
- **Etapa 0 (aprovada):** pasta do projeto, Live Server, repositório `viva` no GitHub, GitHub Pages ligado em https://icaroparana3-afk.github.io/viva/
- **Etapa 1 (aprovada):**
  - `Boot` carrega todos os desenhos com barra de progresso e abre o Menu.
  - Menu com a arte do autor (céu com sol, nuvens andando, montanhas, casal, pássaro que passa de vez em quando).
  - 3 botões desenhados: Nova História (mostra "Em breve"), Continuar História (apagado se não houver save), Configurações.
  - Tela de Configurações vazia com botão Voltar desenhado (110×20, centralizado).
  - `js/botao.js`: função `criarBotao` (reação ao toque) e `temSave()`.

- **Etapa 2 (aprovada em 2026-11-04):**
  - Perfil em duas telas: (1) nome + Papai/Mamãe → "Próximo"; (2) mapa do Brasil → "Começar".
  - Nome: campo de texto de verdade (abre o teclado do celular).
  - Mapa: tocar numa região acende ela, escurece o resto e mostra nome + clima. Toque com tolerância de 4 px perto da borda.
  - `js/mapa.js`: liga cada pixel do mapa à região da cor principal mais próxima (sombras e bordas entram sozinhas).
  - "Voltar" no mapa volta ao Perfil sem perder nome, papel e região.
  - `js/state.js`: cria, salva, lê e apaga o save no localStorage.
  - "Nova História" leva ao Perfil; se já houver save, pergunta antes de apagar.
  - "Continuar História" acende sozinho quando existe save e mostra o nome salvo.
  - Textos nítidos (v0.0.7): o jogo desenha numa tela interna maior (ESCALA) e os textos são escritos nessa resolução.
  - Botões desenhados pelo autor (v0.0.8): Próximo, Começar, Papai, Mamãe, Sim e Não. Papai/Mamãe mostram a versão "_sel" quando escolhidos; Sim/Não mostram "_sel" enquanto o dedo aperta. Próximo e Começar ficam apagados até as respostas estarem prontas.
  - Visual do autor (v0.0.10): títulos "SEU PERFIL"/"SUA REGIÃO", rótulos "Nome"/"Você é", novo botão Voltar e fundo em degradê, nas posições exatas da tela de exemplo do autor (Perfil idêntico ao exemplo pixel a pixel). Campo do nome com 110 de largura, como os botões.
  - Menu melhorado (v0.0.11): título "VIVA / CUIDE DE UMA VIDA" (tirado da tela de exemplo do autor; o subtítulo foi remontado na mesma fonte 3×5), estrela cadente que risca o céu de vez em quando (feita por código, a pedido do autor), botões de música e efeitos no canto superior direito (desenho provisório até chegar a arte do autor). Os botões só guardam a escolha por enquanto; os sons entram na Etapa 30.
  - Árvores e moitas no menu (v0.0.12): 2 árvores e 2 moitas recortadas da tela de exemplo do autor, nas mesmas posições.
  - Vida no menu (v0.0.13): rajadas de vento (nuvens aceleram, copas e moitas balançam 1 px, folhas voam, riscos de vento no céu), sombras no chão (árvores, moitas, casal, animal) e um animal parado ao lado do casal (anima parado, faz uma ação de vez em quando e quando é tocado). Tudo funciona com desenhos provisórios até a arte do autor chegar.
  - Piquenique (v0.0.14): toalha xadrez (vermelho #e53a29, rosa #ebaba2, branco #f7f7f9, cores escolhidas pelo autor; desenho feito por código a pedido dele) embaixo do casal, e cesta de piquenique ao lado da menina (reduzida da imagem do autor para 22×20). O animal foi para a direita, fora da toalha.
  - Textos de clima (v0.0.9): nome + subtítulo + texto curto (até 3 linhas) ao tocar na região. Textos completos do autor guardados no DESIGN.md.

- **Etapa 3 (aprovada em 2026-11-04, v0.0.15–0.0.21):**
  - `js/bebe.js`: `BEBE.gerar(regiao)` sorteia sexo, origem (e especial), pele, tipo e cor do cabelo, olhos e estado; `BEBE.confere(bebe)` checa as regras; `BEBE.revelaOrigem(bebe)` = só especiais.
  - Regras e chances em `CONFIG.BEBE` (config.js): pesos das origens, listas permitidas por origem, especiais, cores provisórias (tint) e nomes na tela.
  - Tela de teste `TesteBebe` (Configurações → "Teste: gerador do bebê"): mostra 1 bebê em camadas provisórias coloridas por tint, gera 1000 e mostra as porcentagens em 8 páginas (origem com o alvo, sexo, especiais, pele, tipo e cor do cabelo, olhos, estado). Toque em "Região" troca a região.
  - Conferido: 100.000 bebês com 0 erros de regra e porcentagens iguais às chances.
  - Bebê do autor (v0.0.16): desenho 32×32 + tufo de cabelo 9×6 do autor, separados em camadas 32×32 por cor: `bebe_corpo` (cinzas da pele, clareados para o tint), `bebe_cabelo` (tufo em (11,2), recortado para ficar só dentro da cabeça; 2 pixels de cabelo acrescentados em (17,2) e (11,3) a pedido do autor), `bebe_brilho` (brilho da careca, embaixo do cabelo), `bebe_olhos` (pupilas, feitas por Claude), `bebe_contorno` (contorno, boca, fralda e brilhos, cores fixas) e `bebe_extra_alienigena` (antenas do autor 26×5, em (3,0), recebem a cor da pele) / `vampiro` / `lobisomem` (feitos por Claude). Ordem: corpo → brilho → cabelo → olhos → contorno → extra.
- Tela de teste (v0.0.20): linhas longas (ex.: "Rio Grande do Norte") quebram sozinhas, com recuo; cartão maior.
- O teste ainda mostra o tipo de cabelo no texto (ele só aparece no desenho a partir de 1 ano).

- **Tela de carregamento (v0.0.21):** `Boot` carrega só o cenário e a mamadeira; a cena nova `Carregando` mostra o menu parado (sem botões, crianças, animal, estrela e pássaro) com a mamadeira do autor enchendo de 0% a 100% e a porcentagem embaixo, depois abre o Menu. Fica pelo menos `CONFIG.CARREGAMENTO.TEMPO_MINIMO` (1,5 s) para dar tempo de ver a mamadeira encher. Números em `CONFIG.CARREGAMENTO`.

- **Etapa 4 (aprovada em 2026-11-05, v0.0.22–0.0.25):**
  - Cena `Cegonha`: cenário do menu (sem piquenique), a cegonha entra voando da direita com a trouxinha no bico, para e fica pairando (sobe e desce) com "Toque para receber seu bebê".
  - Regra: a trouxinha é reposicionada no bico a cada quadro (sem física): nunca cai. Conferido no teste (distância bico↔trouxinha sempre igual).
  - Toque: aparece o bebê (camadas do autor, 2×), "É um menino!/É uma menina!", a origem só se for especial ("E ela é uma vampira!") e "Nasceu no/na/em <estado>". Botão "Levar para o berço": a cegonha sai voando com o bebê, o save marca `bebeRecebido: true` e volta ao Menu com "O bebê está no berço!".
  - Save: `bebe` (o bebê sorteado) e `bebeRecebido`. O bebê é sorteado e salvo assim que a cegonha aparece: fechar o jogo no meio traz o MESMO bebê de volta.
  - Fluxo: Região → "Começar" abre a cegonha. "Continuar História" abre a cegonha se o bebê ainda não foi recebido; se já foi, mostra "Em breve: o quarto" (Etapa 5).
  - `js/bebe_visual.js`: `criarBebeVisual(cena, x, y, escala)` desenha o bebê em camadas (usado no teste e na cegonha).
  - `BEBE.ondeNasceu(bebe)` + `CONFIG.PERFIL.NASCEU_EM`: artigo certo de cada estado (no Paraná, na Bahia, em São Paulo).
  - Cegonha e trouxinha provisórias (feitas por código) até a arte do autor chegar. Números em `CONFIG.CEGONHA`.

- **Etapa 5 (aprovada em 2026-11-05, v0.0.26–0.0.35):**
  - Cena `Quarto`: fundo do quarto, berço em duas camadas (trás e frente) e o bebê sentado no colchão entre elas (a grade da frente fica na frente dele).
  - Bebê vivo: respira (sobe 1 px e desce), pisca a cada 2,5–6 s (pálpebras com a cor da pele, feitas a partir dos olhos do desenho do autor) e, ao ser tocado, dá um pulinho e solta um coração.
  - Fluxo: a cegonha leva o bebê e o jogo abre o quarto com "Seu filho chegou!/Sua filha chegou!". "Continuar História" abre o quarto quando o bebê já foi recebido. Botão "Menu" no canto volta ao menu.
  - Coração provisório (feito por código); números em `CONFIG.QUARTO`.
- **Etapa 5, visual (v0.0.27):**
  - Quartos do autor: `quarto_menina.png` (rosa) e `quarto_menino.png` (azul), 180×320; o jogo escolhe pelo sexo do bebê.
  - Berço do autor (sem grade da frente) reduzido para 80×64 e limpo em pixel art: posição (50,187), encostado no rodapé. `berco_frente` = postes + painel de baixo. Bebê em (74,199).
  - Janela viva: o vidro do desenho virou transparente e o jogo desenha o céu atrás. Dia (6h–18h): céu claro com as cores do autor e nuvens passando. Noite: céu escuro, estrelas piscando, lua, e o quarto escurece um pouco (`NOITE_ESCURECER`). Por enquanto vale a hora do aparelho; na Etapa 6 passa a ser o relógio do jogo. Números em `CONFIG.JANELA`.
  - TESTE: tocar na janela troca dia/noite (`CONFIG.JANELA.TESTE_TOQUE_JANELA`, sai na Etapa 6).
  - Nuvens da janela (12×5 e 8×4) e lua (5×5) provisórias, feitas por código com as cores da nuvem do autor.
  - Originais do autor guardados em `assets/originais/` (berco_original, quarto_menina_original, quarto_menino_original).
- **Acabamentos (v0.0.34):**
  - Transição suave entre todas as telas (escurece e clareia): `irPara(cena, 'Tela')` em js/botao.js; tempo em `CONFIG.TRANSICAO_SEGUNDOS`.
  - Vida na janela: de dia um passarinho atravessa o vidro; à noite cai uma estrela cadente. Intervalos e velocidades em `CONFIG.JANELA`.
  - Brinquedos tocáveis: recortados do chão dos quartos do autor (`brinquedo_menina_urso/coelho/elefante/blocos`, `brinquedo_menino_dino/blocos/carro`), o chão embaixo deles foi completado com as tábuas. Ao tocar: pulinho, dois pulinhos, balançar ou o carrinho anda e volta. Posições e ações em `CONFIG.BRINQUEDOS`.
  - Festa na chegada: corações e estrelinhas saem de trás do bebê quando ele é revelado (`CONFIG.FESTA`).
  - Nome do bebê: na tela da cegonha, "Qual vai ser o nome dela/dele?" com campo de texto; o botão "Levar para o berço" só acende com um nome (2 a 12 letras, `CONFIG.BEBE.NOME_MIN/MAX`). Salvo em `bebe.nome`, com a primeira letra de cada palavra em maiúscula. No quarto: "Sua filha chegou! / Bem-vinda, Luna!". Save antigo sem nome: o quarto pergunta o nome uma vez.
- **Abajur acende e apaga (v0.0.33):** tocar no abajur acende/apaga. Aceso: a cúpula brilha (`abajur_aceso_menina/menino.png`, 28×10, feitas a partir da cúpula do desenho do autor) e um brilho amarelo em anéis (`luz_abajur`, por código) clareia o canto; à noite o quarto fica bem menos escuro. O estado fica salvo (`abajurAceso` no save). Sem ligação com o sono. Ajustes em `CONFIG.QUARTO` (ABAJUR_*, LUZ_*).
- **Relógio do quarto funcionando (v0.0.32):** os ponteiros do desenho foram apagados (nos dois quartos) e o jogo desenha os ponteiros pixel a pixel, com as cores do autor, conforme a hora do jogo. Ajustes em `CONFIG.RELOGIO`.
  - Novo `js/tempo.js`: `TEMPO.agora()` e `TEMPO.ehNoite()` são o único lugar que diz a hora do jogo. Hoje é a hora do aparelho; na Etapa 6 só esse arquivo muda e o relógio e a janela acompanham.
- **Borda da cegonha limpa (v0.0.31):** a redução tinha deixado pixels brancos/cinzas na borda; agora toda a borda tem o contorno escuro, como no desenho original.
- **Botões do autor e aviso em caixa (v0.0.30):** `botao_levar_berco.png` 110×20 (centralizado em y 262 na cegonha) e `botao_menu.png` 34×14 (canto do quarto, em (4,4)). "Sua filha/Seu filho chegou!" agora aparece numa caixa roxa igual ao painel da cegonha (`mostrarAvisoCaixa` em js/botao.js), some depois de 2,5 s.
- **Cegonha menor (v0.0.29):** `cegonha.png` reduzida de 110×119 para 80×87 por quadro (160×87 no total), pairando em (50,50). O original 220×119 está em `assets/originais/cegonha_220x119_original.png`.
- **Cegonha do autor e olhinhos (v0.0.28):**
  - Cegonha do autor: `assets/sprites/cegonha.png` 220×119 = 2 quadros de 110×119 (asas para baixo e para cima), com a trouxinha já no bico (faz parte do desenho: nunca cai). Pairando em (35,30); dica "Toque para receber" em y 156. Cegonha e trouxinha provisórias removidas do código.
  - Ao tocar no bebê: ele fecha os olhos sorrindo (^ ^) durante o pulinho (`CONFIG.QUARTO.OLHOS_FECHADOS_TOQUE`). A piscada normal agora é uma curvinha (◡ ◡); a pálpebra cobre o olho inteiro.

- **Etapa 5, ajuste (v0.0.35):** o campo do nome mostra só "nome" (antes "nome dela/dele").
- **Etapa 6 — Relógio e save (aprovada em 2026-11-05, v0.0.36–0.0.37):**
  - O jogo tem o próprio relógio (escolha do autor: opção "a"). 1 ano do jogo = 3,5 dias reais → 1 dia do jogo ≈ 13,8 min reais, 1 hora ≈ 34,5 s. Números em `CONFIG.TEMPO`.
  - O relógio começa quando a cegonha entrega o bebê (`save.chegadaReal`), às 8h do 1º dia (`HORA_CHEGADA`). A hora do jogo é uma conta com o relógio do aparelho, então o tempo continua passando com o jogo fechado.
  - `js/tempo.js`: `TEMPO.agora()` → {dia, hora, minuto, segundo}; `TEMPO.ehNoite()`; `TEMPO.idade()` → {anos, meses, dias, totalDias}; `TEMPO.textoIdade()` ("recém-nascida", "3 dias", "5 meses", "1 ano e 2 meses").
  - Relógio da parede e janela (dia 6h–18h, noite 18h–6h) seguem a hora do jogo; o quarto confere a cada 1 s.
  - Caixinha roxa no canto superior direito do quarto: nome e idade do bebê (atualiza sozinha).
  - Save guarda a última vez aqui (`ultimaVez`) a cada 15 s com o jogo na tela e ao esconder/fechar a página (`VISITA` em tempo.js). Quem volta depois de 5 min ou mais (`AVISO_VOLTA_MINUTOS`) vê no quarto: "Bem-vinda/Bem-vindo de volta! / Fora por 2 h / No jogo: 8 dias" (também ao voltar de outro app sem recarregar).
  - Ajuste (v0.0.37): a caixinha do canto agora tem 3 linhas: nome, idade e "Dia 41 · 17h" (dia e hora do jogo). O aviso de volta ganhou uma linha quando o jogador fica 18 h reais ou mais fora ("Não demore: 1 dia fora é o limite!") e outra ao passar de 24 h ("Ele/Ela sentiu sua falta!"). Limites em `CONFIG.TEMPO.ABANDONO_ALERTA_HORAS` e `ABANDONO_HORAS`. A regra do abandono em si (adoção etc.) entra na Etapa 17.
  - Saves antigos sem `chegadaReal`: o bebê passa a contar a partir de agora (recém-nascido).
  - Saiu o teste de tocar na janela. TESTE novo: tocar no relógio da parede adianta 1 hora do jogo (`CONFIG.TEMPO.TESTE_TOQUE_RELOGIO`, tirar antes de lançar).

- **Etapa 7 — PWA (aprovada em 2026-11-05, v0.0.38–0.0.40):**
  - O jogo é instalável: `manifest.json` (nome "Viva", tela cheia, retrato, cores do jogo) e ícones `assets/ui/icone_192.png`, `icone_512.png` e `icone_180.png` (iPhone). Ícone do autor: original em `assets/originais/icone_original_48.png`. Na v0.0.40 o jogo corta o contorno escuro de 1 px (e a linha clara ao lado) e usa o miolo 44×44 como `assets/ui/icone.png`, porque o iPhone enchia o quadrado e o contorno aparecia como moldura roxa. Para o Android existe `icone_512_maskable.png` (arte a 76% com céu e grama espelhados até a borda), para o corte em círculo não cortar o sol.
  - `sw.js` (service worker): na primeira visita guarda todos os arquivos do jogo e o Phaser. Com internet busca sempre a versão nova (o celular não fica preso numa versão velha); sem internet, ou com a internet demorando mais de 4 s, usa a cópia guardada. A versão do cache acompanha `CONFIG.VERSAO`.
  - Novo `js/app.js`: liga o service worker e guarda o pedido de instalação do navegador.
  - Configurações: botão "Instalar no celular". No Chrome/Android abre o pedido de instalação; no iPhone e quando o pedido não está disponível, explica o caminho pelo menu. Se já estiver instalado, mostra "Já instalado ✓".
  - Testado: jogo abre sem internet depois da primeira visita.

- **Etapa 8 — Necessidades e mamadeira (aprovada em 2026-11-06, v0.0.41):**
  - Novo `js/necessidades.js` (`NEC`): cinco barras de 0 a 100 no save (`necessidades`, `necessidadesEm`): fome, sede, energia, higiene, diversão.
  - As barras caem pelo TEMPO REAL (decisão do autor): fome e sede esvaziam em 5 h, diversão em 4 h. Com o jogo fechado caem na metade da velocidade. Energia e higiene ficam paradas (barra mais apagada) até as etapas do sono e do banho. Números em `CONFIG.NECESSIDADES`.
  - O bebê chega com fome (40), sede (40) e entediado (diversão 30). Saves antigos começam assim também.
  - Painel embaixo do quarto com os 5 ícones e as barras (verde > 50, amarelo 25–50, vermelho < 25). A versão subiu para cima do painel.
  - Botão da mamadeira na parede da esquerda (usa a mamadeira cheia do desenho do autor). Ao tocar, a mamadeira vai à boca do bebê, ele fecha os olhos contente e a fome e a sede enchem juntas (decisão do autor) até ficarem cheias; no fim sai um coração. Cheio: "Não quero!".
  - Balão de pedido em cima do berço com o ícone da barra mais baixa (abaixo de 30).
  - Humor na caixinha do canto: Feliz, Entediado(a) (diversão < 40) ou Triste (alguma barra ativa < 20).
  - Tocar no bebê sobe a diversão (+3); tocar num brinquedo, +1.
  - Arte provisória feita por código: ícones das necessidades, mamadeira na boca e balão (`CONFIG.ARTES_PRONTAS.necessidades`).

- **Etapa 8.1 — Painel de necessidades (v0.0.42):** só muda a forma de mostrar; a lógica das barras é a mesma.
  - Saiu a faixa fixa de barras. A versão voltou para o rodapé, no canto esquerdo (no direito fica o botão novo).
  - Botão de necessidades 26×26 em (150, 288), `CONFIG.NECESSIDADES.BOTAO`: coração branco pintado com a cor da barra ATIVA mais baixa (verde > 50, amarelo 25–50, vermelho < 25) e 5 pontinhos, um por barra (cinza = parada). Com alguma barra ativa no vermelho, o botão sobe e desce 1 pixel; a área de toque não se mexe.
  - Tocar no botão: o quarto escurece (`PAINEL_ESCURO` 0,55) e o painel 164×196 sobe de baixo em 200 ms, em (8, 116). Título "NECESSIDADES" e X. Tocar fora do painel também fecha.
  - Uma linha por necessidade: ícone 16×16 numa moldura 22×22, nome, porcentagem na cor da barra, barra 98×7 com divisões a cada 10% e "!" piscando abaixo de 25. Energia e higiene: barra cinza e "EM BREVE".
  - Tocar numa linha destaca e mostra a dica (`CONFIG.NECESSIDADES.DICAS`: > MAMADEIRA, > DORMIR, > BANHO, > BRINCAR). Tocar de novo tira o destaque.
  - O painel se atualiza sozinho. Com ele aberto, bebê, brinquedos, mamadeira, abajur, relógio e Menu não respondem.
  - Balão de pedido agora 22×24, com o ícone de 16×16 no ponto (3,2).
  - Sons "abrir" e "clique" prontos no código (`tocarSom`): tocam só com os efeitos ligados e os arquivos em assets/audio (`ARTES_PRONTAS.sons`). Sem os arquivos, nada acontece.
  - Texto ainda na fonte provisória (monospace do navegador): não existe fonte pixel (bitmap) no projeto.
  - TESTE: tocar no relógio da parede agora também faz as barras caírem como se passassem 30 min reais (`TESTE_MINUTOS_RELOGIO`).
  - Arte provisória feita por código, com os mesmos nomes e tamanhos dos arquivos do autor.

- **Etapa 8.2 — Sinais de cuidado (v0.0.43):** o jogador percebe o que o bebê precisa sem abrir o painel e sem texto. A lógica das barras não mudou. Números em `CONFIG.SINAIS`; contas em `js/sinais.js`.
  - Carinha de humor 12×12 no lugar do texto "Feliz/Entediado/Triste" (mesmas regras da Etapa 8). Tocar nela mostra o nome por 2 s. Carinhas novas: um quadro a mais em humor.png e uma linha em `HUMOR_QUADROS`.
  - Escada de sinais (só barras ativas): acima de 70 nada; 70–51 balão com selo triste e bebê olhando para baixo, mexendo de leve; 50–26 selo chorando, bebê chora (olhos apertados, boca aberta, lágrimas caindo) e "choro" a cada ~20 s; 25–1 selo chorando forte, balão tremendo, bebê balança no berço e "choro_forte" a cada ~10 s; 0 selo esgotado, bebê deitado de olhos fechados, em silêncio.
  - O balão mostra a mais urgente; duas na mesma faixa alternam a cada 2 s. O bebê segue a pior.
  - Mamadeira com fome e sede cheias: X vermelho em cima da fome no balão por 1,5 s e o bebê balança de lado 2 vezes. Saiu o texto "Não quero!".
  - Botão de necessidades: abaixo de 25 pulsa e ganha um "!" no canto.
  - Mãozinha da primeira vez: quando o balão pede comida, aponta para a mamadeira até o jogador tocar nela. Fica guardado no save (`sinais.maozinha_fome`) e não volta mais.
  - Sons de choro prontos no código (`ARTES_PRONTAS.sons_choro`, assets/audio/choro e choro_forte em .ogg e .mp3): só tocam com efeitos ligados e jogo aberto; sem arquivos, nada acontece.
  - TESTE: com o painel aberto, tocar na barra de uma necessidade troca o valor: 100 → 70 → 50 → 25 → 0 (`SINAIS.TESTE_BARRAS`, tirar antes de lançar).
  - Arte provisória por código (`ARTES_PRONTAS.sinais`): carinhas, selos, balão de pedido 26×24 (substitui o balão 22×24 da 8.1), X, mãozinha e as camadas do bebê chorando e esgotado. O bebê ganhou as camadas `choro` e `esgotado` e pode girar para deitar (bebe_visual.js), sem mexer nos PNGs dele.
  - Corrigido: o quarto quebrava ao abrir com o bebê já pedindo algo (o balão era montado antes do relógio da cena).
- **v0.0.44 — desenhos do autor e botão de necessidades novo:**
  - Entraram os desenhos do autor: ícones 16×16 (fome maçã, sede gota, energia raio, higiene bolhas, diversão bola), carinhas de humor (feliz, entediado, triste), mãozinha (agora 18×18, 2 quadros) e X vermelho. `ARTES_PRONTAS` ganhou `humor`, `x_nao` e `maozinha` separados; `sinais` (selos, balão, bebê chorando e esgotado) continua provisório por decisão do autor.
  - Botão de necessidades: no lugar do coração aparece o ícone da necessidade ativa mais baixa. Embaixo, 5 quadradinhos (v0.0.45): tudo 100% = carinha feliz e 5 verdes; acima de 50 = 4 verdes e 1 vazio; 1 a 50 = 3 amarelos e 2 vazios; 0 = 5 vermelhos. O "!" e o pulso abaixo de 25 continuam. Posições em `CONFIG.SINAIS` (BOTAO_ICONE, BOTAO_FELIZ, QUADRADOS_*). O coração (`coracao_necessidades`) saiu do jogo.
  - O X da recusa foi para o canto do balão (onde fica o selo), porque em cima da maçã vermelha não aparecia.
- **v0.0.49:** a carinha de humor fica à ESQUERDA da caixinha, alinhada ao topo dela (`HUMOR_ESPACO` 18 e `HUMOR_Y` 4 em `CONFIG.QUARTO`), e o nome do humor aparece centralizado embaixo dela.
- **v0.0.47 — tela preta, brinquedos e caixinha:**
  - Tela preta depois de "Levar para o berço" (às vezes, no celular). Não apareceu nos testes, mas o código tinha dois pontos fracos que causam exatamente isso, e os dois foram tratados em `js/seguranca.js`:
    1. Teclado: ao destruir o campo do nome com o teclado aberto, o celular (iPhone, principalmente) pode deixar a página empurrada para cima, com o jogo fora da tela. Agora o campo, ao sumir, devolve a página para o lugar e o Phaser mede a tela de novo (várias vezes enquanto o teclado fecha). O mesmo vale a qualquer mudança de tamanho da tela sem campo em uso.
    2. Transição: o escurecer agora é forçado (antes não começava se outro efeito ainda rodasse), tem plano B (troca mesmo se o aviso de "terminou" não vier) e um vigia confere, 2,5 s depois, se a tela nova abriu e clareou; se não, destrava.
    3. Se o jogo parar de desenhar por um erro no código (confirmado em teste: um erro durante o jogo congela a tela, e se for na entrada do quarto, que ainda está escuro, fica preto), aparece "O jogo travou :( Toque para continuar" com o erro escrito. O toque recarrega; o save não se perde. Se aparecer, mandar foto do erro.
  - Brinquedos: cada toque dá 5 de diversão (antes 1). `CONFIG.NECESSIDADES.DIVERSAO_TOQUE_BRINQUEDO`.
  - Carinha de humor fora da caixinha (na v0.0.48 passou para a esquerda). A caixinha ficou só com nome, idade e dia (31 px de altura em vez de 45, `INFO_ALTURA`). Tocar na carinha mostra o humor ao lado dela.
- **v0.0.46 — painel de necessidades novo (modelo do autor):** o modelo (assets/originais/painel_necessidades_modelo.png, 844×1024) foi redesenhado pixel a pixel no tamanho do painel do jogo (164×196), com as cores dele: moldura dourada com cantinhos, faixa do título com linha dourada, linhas com borda roxa clara, moldura lilás do ícone, botão X prateado e vermelho (agora 16×16, em cima do canto) e barra com trilho escuro e divisões a cada 10%. "EM BREVE" em cinza-lilás. `ARTES_PRONTAS.painel_necessidades = true`; o botão de necessidades ganhou flag própria (`botao_necessidades`, ainda provisório). Números em `CONFIG.NECESSIDADES` (FECHAR_X/Y, BARRA_FUNDO, BARRA_BORDA, BARRA_DIVISAO, COR_EM_BREVE).

## Arquivos de arte no projeto
| Arquivo | Tamanho | Observação |
|---|---|---|
| assets/ui/menu_ceu.png | 180×320 | céu + sol |
| assets/ui/menu_montanhas.png | 180×320 | montanhas e grama, topo transparente |
| assets/sprites/nuvem1.png / nuvem2.png | 40×16 | |
| assets/sprites/casal.png | 48×32 | |
| assets/sprites/passaro.png | 24×8 | 3 quadros de 8×8 lado a lado |
| assets/ui/botao_nova_historia.png | 110×20 | |
| assets/ui/botao_continuar_historia.png | 110×20 | |
| assets/ui/botao_configuracoes.png | 110×20 | |
| assets/ui/botao_proximo.png / botao_comecar.png | 110×20 | |
| assets/ui/botao_papai(_sel).png / botao_mamae(_sel).png | 53×20 | "_sel" = selecionado |
| assets/ui/botao_sim(_sel).png / botao_nao(_sel).png | 53×20 | "_sel" = apertado |
| assets/ui/fundo_perfil.png | 180×320 | degradê das telas de Perfil e Região (tirado da tela de exemplo do autor) |
| assets/ui/texto_seu_perfil.png / texto_sua_regiao.png | 105×15 / 105×18 | títulos |
| assets/ui/texto_nome.png / texto_voce_e.png | 24×9 / 33×9 | rótulos |
| assets/ui/mapa_brasil.png | 160×160 | 18 cores; sombra semitransparente proposital (1 cor só) |
| assets/ui/botao_voltar.png | 110×20 | desenhado pelo autor (v0.0.10) |
| assets/sprites/arvore_esquerda.png / arvore_direita.png | 42×85 / 40×79 | posições (0,195) e (140,191), recortadas da tela de exemplo do autor |
| assets/sprites/moita_esquerda.png / moita_direita.png | 26×14 / 36×18 | posições (0,286) e (144,274) |
| assets/sprites/toalha.png | 86×17 | toalha xadrez em perspectiva, posição (50,296) |
| assets/sprites/cesta.png | 22×20 | cesta reduzida da imagem do autor, posição (113,287); pode ser redesenhada no mesmo tamanho |
| assets/sprites/bebe_corpo / bebe_cabelo / bebe_olhos / bebe_contorno .png | 32×32 cada | camadas do bebê (desenho e cabelo do autor; olhos e contorno separados por Claude) |
| assets/sprites/bebe_extra_alienigena.png | 32×32 | antenas do autor (v0.0.17), recebem a cor da pele |
| assets/sprites/bebe_extra_vampiro / _lobisomem .png | 32×32 cada | detalhes dos especiais (provisórios, feitos por Claude) |
| assets/ui/mamadeira.png | 16×32 | mamadeira do autor (original) |
| assets/ui/mamadeira_carregando.png | 288×32 | 18 quadros de 16×32 (0 = vazia, 17 = cheia), feitos a partir da mamadeira do autor |
| assets/ui/botao_musica(_off).png / botao_som(_off).png | 16×16 cada | botões de música e efeitos do autor (v0.0.25, roxos, combinando com os botões do menu), lado a lado no canto direito: música (141,4), efeitos (159,4) — `CONFIG.MENU.BOTAO_*`. Versões anteriores (hexágono 32×28 e 16×16) guardadas em assets/originais |
| assets/ui/texto_titulo.png | 71×44 | "VIVA" + coração + "CUIDE DE UMA VIDA", posição (53,15) no Menu |
| assets/ui/quarto_menina.png / quarto_menino.png | 180×320 | quartos do autor (v0.0.27); vidro da janela transparente (x 69–110, y 76–120) para o céu vivo |
| assets/sprites/berco_tras.png / berco_frente.png | 80×64 cada | berço do autor reduzido e limpo; frente = postes + painel |
| assets/ui/botao_levar_berco.png / botao_menu.png | 110×20 / 34×14 | botões do autor (v0.0.30) |
| assets/sprites/brinquedo_menina_*.png / brinquedo_menino_*.png | 10×17 a 23×13 | brinquedos recortados dos quartos do autor (v0.0.34) |
| assets/ui/icones_necessidades16.png | 80×16 | 5 ícones 16×16 do autor: fome, sede, energia, higiene, diversão (v0.0.44) |
| assets/ui/humor.png | 36×12 | carinhas 12×12 do autor: feliz, entediado, triste (v0.0.44) |
| assets/ui/maozinha.png | 36×18 | 2 quadros 18×18 do autor, apontando para a esquerda (v0.0.44) |
| assets/ui/x_nao.png | 10×10 | X vermelho do autor (v0.0.44) |
| assets/ui/painel_necessidades.png | 164×196 | redesenhado no tamanho do jogo a partir do modelo do autor (v0.0.46) |
| assets/ui/linha_necessidade(_sel).png | 156×32 | idem |
| assets/ui/moldura_icone.png / botao_fechar.png | 22×22 / 16×16 | idem |
| assets/sprites/cegonha.png | 160×87 | 2 quadros de 80×87 (reduzidos do desenho do autor de 110×119), olhando para a esquerda, trouxinha no bico (v0.0.29) |

## Falta desenhar (pode ser depois)
- **Necessidades (Etapas 8 e 8.1):** em assets/ui: `botao_necessidades.png` 26×26 (só a caixa: o jogo põe o ícone em 5,2 e os 5 quadradinhos 3×3 a partir de 4,20; flag `botao_necessidades`). Em assets/sprites: `mamadeira_bebe.png` 12×7.
- **Sinais de cuidado (Etapa 8.2), opcional:** o autor decidiu manter provisórios `selos.png` 32×8, `balao_pedido.png` 26×24, `bebe_choro.png` e `bebe_esgotado.png` 32×32. Se um dia desenhar: `ARTES_PRONTAS.sinais = true`.
- **Fonte pixel (opcional):** hoje os textos usam a fonte do navegador.
- **Janela (opcional):** `assets/sprites/nuvem_janela1.png` 12×5, `nuvem_janela2.png` 8×4, `lua.png` 5×5 (fundo transparente). Ao chegar: ligar `ARTES_PRONTAS.janela`.
- **Coração (opcional):** `assets/sprites/coracao.png` 7×6. Ao chegar: ligar `ARTES_PRONTAS.coracao`.
- **Piscar (opcional):** `bebe_palpebras.png` 32×32 (branco sobre os olhos; o jogo pinta com a cor da pele), `bebe_olhos_fechados.png` 32×32 (piscada) e `bebe_olhos_felizes.png` 32×32 (olhos fechados sorrindo, ao ser tocado).
- **Desenhos da vida no menu (o autor está fazendo).** Ao chegar, colocar na pasta e ligar o item em `CONFIG.ARTES_PRONTAS`:
  - `assets/sprites/animal.png`: 128×16 (8 quadros de 16×16 lado a lado). Quadros 0–3 = parado (repete), 4–7 = ação. Olhando para a esquerda (para o casal).
  - `assets/sprites/folha.png`: 16×4 (4 quadros de 4×4, a folha girando).
  - `assets/sprites/vento.png`: 24×3 (um risco de vento, pode ter transparência).
  - `assets/sprites/sombra_grande.png` 52×6 (casal), `sombra_media.png` 28×5 (árvores e moitas), `sombra_pequena.png` 14×3 (animal). Cor cheia; a transparência é aplicada pelo jogo (`CONFIG.SOMBRAS`).
- Telas de Perfil e confirmação: as caixas são retângulos provisórios. Para desenhá-las, o melhor é antes termos uma fonte pixel (bitmap font), senão cada texto vira um desenho separado. Sugestão: deixar para uma etapa de acabamento.
- Nada obrigatório.

## Decisões tomadas
- Phaser 3.90.0 por CDN (jsDelivr).
- Versão aparece no rodapé para conferir se o celular pegou a atualização.
- Backup: Git pelo VS Code ("Publish to GitHub" já feito).
- Menu reaproveitado do jogo antigo, peças separadas pelo autor; posições idênticas ao original (botões em x=35, y=120/146/172).
- Save guardado em `localStorage`, na chave `viva_save`, em formato JSON: `{versao, criadoEm, ultimaVez, chegadaReal, perfil:{nome, papel, regiao}, bebe:{sexo, origem, especial, pele, cabeloTipo, cabeloCor, olhos, regiao, estado, nome}, bebeRecebido, abajurAceso}`.
- Nome do jogador: máximo 12 letras, mínimo 2 (em `CONFIG.PERFIL`).
- Regiões salvas pelo id: norte, nordeste, centro-oeste, sudeste, sul.
- Cada região em `CONFIG.PERFIL.REGIOES` guarda: cor principal no mapa, texto do clima e lista de estados.
- O estado de nascimento é sorteado na Etapa 3 (gerador do bebê), não no Perfil.
- Clima do Norte: quente, com chuvas abundantes (decisão do autor, 2026-11-04).
- `criarBotaoImg(...)` (js/botao.js): botão de desenho que acende/apaga (`.ativar`) e marca (`.marcar`) trocando para a imagem "_sel".
- Nitidez (v0.0.7): o mundo do jogo continua 180×320, mas o canvas interno é 180×320 × `CONFIG.ESCALA` (calculada pela tela do aparelho, inteira, de 1 a 8). Cada cena chama `prepararCamera(this)` no começo, e todo texto é criado com `escrever(...)` em vez de `this.add.text(...)`. Toques no mapa usam `ponteiro.worldX/worldY`.
- Posições no Perfil (tela de exemplo do autor): título (37,10), Nome (36,48), campo do nome centro (90,70), Você é (36,92), Papai (36,104), Mamãe (92,104), Próximo (35,222), Voltar (35,250). Região: título (37,3), mapa (10,22).
- Exceção à regra "Claude não desenha": a pedido do autor, o botão Voltar 110×20 foi montado por código só com pixels das letras/fundo dos botões dele (sem arte nova), podendo ser substituído por um desenho próprio.
- Velocidades de nuvens e pássaro ficam em `CONFIG.MENU` (config.js).
- Estrela cadente: velocidade, duração, intervalo e altura em `CONFIG.MENU` (ESTRELA_...). Cai na diagonal para a esquerda.
- Posições da toalha e da cesta em `CONFIG.PIQUENIQUE`.
- Mamadeira de carregamento: o interior tem 17 linhas, então ela enche em 17 passos (cerca de 6% cada). Cada sombra em `CONFIG.SOMBRAS` diz de quem é (`quem`), para a tela de carregamento esconder as do casal e do animal.
- Vento, sombras e animal: números em `CONFIG.VENTO`, `CONFIG.SOMBRAS` e `CONFIG.ANIMAL`. Desenhos provisórios em `js/provisorios.js`, usados enquanto o item de `CONFIG.ARTES_PRONTAS` estiver false.
- Balanço das árvores: o mesmo desenho aparece em duas partes (copa e tronco); só a copa anda 1 px. Linhas de corte: árvore esquerda 47, direita 50, moita esquerda 7, direita 9 (em `Menu.js`, `criarBalanco`).
- Opções de música/efeitos ficam na gaveta `viva_opcoes` (separada do save, não acende o "Continuar"). Objeto `Opcoes` em state.js.

## Próximo passo
Etapa 9 — próxima etapa da fase do bebê (0 a 2 anos), a combinar depois da aprovação da Etapa 8.

## Decisões da Etapa 3 (padrões, ajustáveis no config.js)
- Origens: Negro 26, Branco 26, Indígena 20, Cabo Verde 16, Miscigenado 10, Especial 2 (%).
- Cabo Verde "pele escura" = tom negro.
- Especiais com atributos próprios (alienígena, vampiro, lobisomem), cada um com 1/3 dos 2%.
- Estado de nascimento: todos os estados da região com a mesma chance.
- O botão de teste em Configurações sai antes da versão final.
- Tipo de cabelo só aparece a partir de 1 ano (o bebê tem um único desenho de cabelo até lá). Idade exata na Etapa 8.
- Arte do bebê simplificada: 7 peças (corpo, cabelo de bebê, olhos, contorno, 3 extras dos especiais). Cabelo liso/cacheado/crespo só na fase infantil.

## Lembrete
Ao fim de toda etapa: aumentar `VERSAO` no `config.js` e enviar ao GitHub (Confirmar → Sincronizar).

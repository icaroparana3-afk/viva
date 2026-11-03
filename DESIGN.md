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

## Menu e perfil
- Menu: Nova História, Continuar História (só ativo se houver save), Configurações.
- Antes de receber o bebê, o jogador cria o perfil: nome, papai ou mamãe, região do Brasil (define o clima).

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

## Cegonha
Entra voando com o bebê e fica segurando-o até o jogador tocar. NUNCA solta nem derruba o bebê. Depois do toque, o bebê vai para o berço no quarto.

## Necessidades e emoções
- Barras: fome, sede, energia, higiene, diversão.
- Emoções (estilo The Sims): feliz, entediado, triste, focado (lista pode crescer).
- O bebê chega com fome, sede e entediado.

## Casa
Quarto (berço), sala (TV), varanda (brinquedos), banheiro (banheira), cozinha (cadeirinha). O jogador navega entre eles.

## Bebê
- Alimentação: 0 a 1 ano, mamadeira no berço até encher a fome. Depois, na cozinha.
- Banho: banheira; sabonete faz espuma, chuveiro tira. Brincar suja.
- Roupa e clima: frio pede roupa quente, calor pede roupa fresca. Frio + roupa errada = resfriado (cuidados e remédio). Calor + roupa errada = chora mais, sem dizer por quê.
- Brincar: sala (assistir) ou varanda (brinquedos). Muda com a idade.
  - YohTub (fictício): besteira diverte mas não ensina; educativo aumenta inteligência e acelera a fala.
  - 0 a 2 anos: assistir mais do que brincar = vício em tela, passa a gostar menos de brincar.
  - Varanda: habilidade motora, anda mais cedo.
- Dormir: no quarto, apagando a luz; dorme até encher a energia. 0 a 2 anos sem dormir: chora ao brincar e não aprende nada.
- Fala: em nível médio, chama "papai" ou "mamãe" conforme o perfil.

## Doenças (todas as idades)
Gripe, catapora, enjoo/vômito. Mais cuidado e, quando fizer sentido, remédio.

## Clima por região (simulado)
- Nordeste: mais calor, pouco frio.
- Norte: equilibrado.
- Sul: mais frio, menos calor.
- Sudeste e Centro-Oeste: um pouco mais frio que o Nordeste, menos que o Sul.

## Ausência
- Bebê: mais de 12 h sem entrar = aviso. De novo = adoção e fim da história.
- Criança: mais de 12 h = triste e chorando no quarto, suja, sem conseguir comer; tenta brincar/assistir, nem sempre funciona.
- Adolescente: mais de 12 h = risco de depressão (cuidar mais, psicólogo). Várias vezes = 100% independente, pode sair de casa (fim). Se não sair, ausência deixa de ter efeito negativo.

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
1. Idades exatas de cada fase e alimentação entre 1 e 2 anos. (Etapa 8)
2. Infância termina aos 10? (Etapa 18)
3. Regra das 12 h: manter, aumentar, "modo noite", notificação? (Etapa 6/17)
4. Chance exata de cada origem. (Etapa 3)
5. "Nível médio" de fala e quanto cada atividade sobe as habilidades. (Etapa 14)
6. Como o bebê mata a sede de 0 a 1 ano (a mamadeira enche fome e sede?). (Etapa 8)
7. Cabo Verde "pele escura": usa o tom negro ou pardo da lista? (Etapa 3)
8. Especiais (alienígena, vampiro, lobisomem): têm pele/cabelo/olhos próprios? Precisam de camadas extras de desenho? (Etapa 3/5)
9. Fala: vale o nível (nível médio) ou a idade (fim do 1º/3º ano)? Provável: o nível, com velocidade de subida que leva a essas idades. (Etapa 14)

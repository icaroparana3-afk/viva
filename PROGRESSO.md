# Viva — PROGRESSO

> Se o chat ficar longo, cole este arquivo num chat novo para continuar de onde parou.

## Etapa atual
**Etapa 3 — Gerador do bebê** (aguardando "aprovado")

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

- **Etapa 3 (v0.0.15):**
  - `js/bebe.js`: `BEBE.gerar(regiao)` sorteia sexo, origem (e especial), pele, tipo e cor do cabelo, olhos e estado; `BEBE.confere(bebe)` checa as regras; `BEBE.revelaOrigem(bebe)` = só especiais.
  - Regras e chances em `CONFIG.BEBE` (config.js): pesos das origens, listas permitidas por origem, especiais, cores provisórias (tint) e nomes na tela.
  - Tela de teste `TesteBebe` (Configurações → "Teste: gerador do bebê"): mostra 1 bebê em camadas provisórias coloridas por tint, gera 1000 e mostra as porcentagens em 8 páginas (origem com o alvo, sexo, especiais, pele, tipo e cor do cabelo, olhos, estado). Toque em "Região" troca a região.
  - Conferido: 100.000 bebês com 0 erros de regra e porcentagens iguais às chances.
  - Bebê do autor (v0.0.16): desenho 32×32 + tufo de cabelo 9×6 do autor, separados em camadas 32×32 por cor: `bebe_corpo` (cinzas da pele, clareados para o tint), `bebe_cabelo` (tufo em (11,2), recortado para ficar só dentro da cabeça; 2 pixels de cabelo acrescentados em (17,2) e (11,3) a pedido do autor), `bebe_brilho` (brilho da careca, embaixo do cabelo), `bebe_olhos` (pupilas, feitas por Claude), `bebe_contorno` (contorno, boca, fralda e brilhos, cores fixas) e `bebe_extra_alienigena` (antenas do autor 26×5, em (3,0), recebem a cor da pele) / `vampiro` / `lobisomem` (feitos por Claude). Ordem: corpo → brilho → cabelo → olhos → contorno → extra.
- O teste ainda mostra o tipo de cabelo no texto (ele só aparece no desenho a partir de 1 ano).

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
| assets/ui/texto_titulo.png | 71×44 | "VIVA" + coração + "CUIDE DE UMA VIDA", posição (53,15) no Menu |

## Falta desenhar (pode ser depois)
- **Desenhos da vida no menu (o autor está fazendo).** Ao chegar, colocar na pasta e ligar o item em `CONFIG.ARTES_PRONTAS`:
  - `assets/sprites/animal.png`: 128×16 (8 quadros de 16×16 lado a lado). Quadros 0–3 = parado (repete), 4–7 = ação. Olhando para a esquerda (para o casal).
  - `assets/sprites/folha.png`: 16×4 (4 quadros de 4×4, a folha girando).
  - `assets/sprites/vento.png`: 24×3 (um risco de vento, pode ter transparência).
  - `assets/sprites/sombra_grande.png` 52×6 (casal), `sombra_media.png` 28×5 (árvores e moitas), `sombra_pequena.png` 14×3 (animal). Cor cheia; a transparência é aplicada pelo jogo (`CONFIG.SOMBRAS`).
- **Botões de som (o autor está fazendo):** 16×16 cada, 4 arquivos: `botao_musica.png`, `botao_musica_off.png`, `botao_som.png`, `botao_som_off.png`. Posição: música (141,4), efeitos (159,4). Quando chegarem: colocar em assets/ui e mudar `ARTES_PRONTAS.botoes_som` para true no config.js.
- Telas de Perfil e confirmação: as caixas são retângulos provisórios. Para desenhá-las, o melhor é antes termos uma fonte pixel (bitmap font), senão cada texto vira um desenho separado. Sugestão: deixar para uma etapa de acabamento.
- Nada obrigatório.

## Decisões tomadas
- Phaser 3.90.0 por CDN (jsDelivr).
- Versão aparece no rodapé para conferir se o celular pegou a atualização.
- Backup: Git pelo VS Code ("Publish to GitHub" já feito).
- Menu reaproveitado do jogo antigo, peças separadas pelo autor; posições idênticas ao original (botões em x=35, y=120/146/172).
- Save guardado em `localStorage`, na chave `viva_save`, em formato JSON: `{versao, criadoEm, ultimaVez, perfil:{nome, papel, regiao}}`.
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
- Vento, sombras e animal: números em `CONFIG.VENTO`, `CONFIG.SOMBRAS` e `CONFIG.ANIMAL`. Desenhos provisórios em `js/provisorios.js`, usados enquanto o item de `CONFIG.ARTES_PRONTAS` estiver false.
- Balanço das árvores: o mesmo desenho aparece em duas partes (copa e tronco); só a copa anda 1 px. Linhas de corte: árvore esquerda 47, direita 50, moita esquerda 7, direita 9 (em `Menu.js`, `criarBalanco`).
- Opções de música/efeitos ficam na gaveta `viva_opcoes` (separada do save, não acende o "Continuar"). Objeto `Opcoes` em state.js.

## Próximo passo
Etapa 4 — Cegonha: entra voando com o bebê, fica segurando até o jogador tocar (nunca solta nem derruba), mostra só o sexo (e a origem, se especial) e guarda o bebê no save.

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

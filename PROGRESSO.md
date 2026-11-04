# Viva — PROGRESSO

> Se o chat ficar longo, cole este arquivo num chat novo para continuar de onde parou.

## Etapa atual
**Etapa 2 — Perfil** (aguardando "aprovado")

## O que está pronto
- **Etapa 0 (aprovada):** pasta do projeto, Live Server, repositório `viva` no GitHub, GitHub Pages ligado em https://icaroparana3-afk.github.io/viva/
- **Etapa 1 (aprovada):**
  - `Boot` carrega todos os desenhos com barra de progresso e abre o Menu.
  - Menu com a arte do autor (céu com sol, nuvens andando, montanhas, casal, pássaro que passa de vez em quando).
  - 3 botões desenhados: Nova História (mostra "Em breve"), Continuar História (apagado se não houver save), Configurações.
  - Tela de Configurações vazia com botão Voltar desenhado (110×20, centralizado).
  - `js/botao.js`: função `criarBotao` (reação ao toque) e `temSave()`.

- **Etapa 2:**
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
  - Textos de clima (v0.0.9): nome + subtítulo + texto curto (até 3 linhas) ao tocar na região. Textos completos do autor guardados no DESIGN.md.

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

## Falta desenhar (pode ser depois)
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

## Próximo passo
Etapa 3 — Gerador do bebê (só lógica): sorteia origem e atributos, com uma tela de teste que gera 1000 bebês e mostra as porcentagens.

## A decidir na Etapa 3
- O estado de nascimento é sorteado entre os estados da região (lista em `CONFIG.PERFIL.REGIOES`). Todos com a mesma chance?
- Chance exata de cada origem (Negro, Branco, Indígena, Cabo Verde, Miscigenado), sabendo que Especial = 2%.
- Cabo Verde "pele escura": usa o tom negro ou o pardo?
- Especiais (alienígena, vampiro, lobisomem) têm pele/cabelo/olhos próprios?

## Lembrete
Ao fim de toda etapa: aumentar `VERSAO` no `config.js` e enviar ao GitHub (Confirmar → Sincronizar).

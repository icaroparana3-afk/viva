# Viva — PROGRESSO

> Se o chat ficar longo, cole este arquivo num chat novo para continuar de onde parou.

## Etapa atual
**Etapa 1 — Menu** (aguardando "aprovado")

## O que está pronto
- **Etapa 0 (aprovada):** pasta do projeto, Live Server, repositório `viva` no GitHub, GitHub Pages ligado em https://icaroparana3-afk.github.io/viva/
- **Etapa 1:**
  - `Boot` carrega todos os desenhos com barra de progresso e abre o Menu.
  - Menu com a arte do autor (céu com sol, nuvens andando, montanhas, casal, pássaro que passa de vez em quando).
  - 3 botões desenhados: Nova História (mostra "Em breve"), Continuar História (apagado se não houver save), Configurações.
  - Tela de Configurações vazia com botão Voltar desenhado (110×20, centralizado).
  - `js/botao.js`: função `criarBotao` (reação ao toque) e `temSave()`.

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
| assets/ui/botao_voltar.png | 110×20 | montado a partir das letras e do fundo dos outros botões (L derivado do E). O desenho original 165×30 do autor está guardado em assets/originais/ (não é carregado pelo jogo) |

## Falta desenhar (pode ser depois)
- Nada obrigatório. Opcional: redesenhar `botao_voltar.png` por conta própria (110×20, paleta dos outros botões) para substituir a versão montada.

## Decisões tomadas
- Phaser 3.90.0 por CDN (jsDelivr).
- Versão aparece no rodapé para conferir se o celular pegou a atualização.
- Backup: Git pelo VS Code ("Publish to GitHub" já feito).
- Menu reaproveitado do jogo antigo, peças separadas pelo autor; posições idênticas ao original (botões em x=35, y=120/146/172).
- Exceção à regra "Claude não desenha": a pedido do autor, o botão Voltar 110×20 foi montado por código só com pixels das letras/fundo dos botões dele (sem arte nova), podendo ser substituído por um desenho próprio.
- Velocidades de nuvens e pássaro ficam em `CONFIG.MENU` (config.js).

## Próximo passo
Etapa 2 — Perfil: nome, papai/mamãe, região, salvos no localStorage.

## Lembrete
Ao fim de toda etapa: aumentar `VERSAO` no `config.js` e enviar ao GitHub (Confirmar → Sincronizar).

// =============================================================
// Configuracoes.js — tela de Configurações (vazia por enquanto).
// Na Etapa 30 entram volume e "apagar save".
// Etapa 7: botão "Instalar no celular" (js/app.js).
// E o botão da tela de teste do gerador do bebê (Etapa 3, sai antes da versão final).
// =============================================================

class Configuracoes extends Phaser.Scene {
  constructor() {
    super('Configuracoes');
  }

  create() {
    prepararCamera(this);
    // Fundo: o mesmo céu do menu, escurecido
    this.add.image(0, 0, 'menu_ceu').setOrigin(0, 0);
    this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x1a1c2c, 0.6).setOrigin(0, 0);

    // Título (provisório: texto comum)
    escrever(this, CONFIG.LARGURA / 2, 40, 'Configurações', {
      fontFamily: 'monospace', fontSize: '14px', color: CONFIG.COR_TEXTO
    }).setOrigin(0.5);

    // Instalar o jogo como app (ícone na tela inicial, tela cheia, funciona sem internet)
    criarOpcao(this, 30, 80, 120, 18, APP.instalado() ? 'Já instalado ✓' : 'Instalar no celular', async () => {
      const msg = await APP.instalar();
      if (msg) mostrarAvisoCaixa(this, msg, 130, 4);
    }, 8);

    // Ferramenta de teste da Etapa 3 (sai antes da versão final)
    criarOpcao(this, 30, 104, 120, 18, 'Teste: gerador do bebê', () => irPara(this, 'TesteBebe'), 8);

    // Botão Voltar: centralizado na horizontal, qualquer que seja a largura do desenho
    const larg = this.textures.get('botao_voltar').getSourceImage().width;
    const alt = this.textures.get('botao_voltar').getSourceImage().height;
    const x = Math.floor((CONFIG.LARGURA - larg) / 2);
    const y = CONFIG.ALTURA - alt - 20;
    criarBotao(this, x, y, 'botao_voltar', () => irPara(this, 'Menu'));
  }
}

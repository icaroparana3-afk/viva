// =============================================================
// Regiao.js — Etapa 2, parte 2: o jogador escolhe a região no mapa.
// Ao tocar numa região: ela fica acesa, o resto escurece, e aparecem
// o nome e o clima. "Começar" salva o perfil.
// =============================================================

class Regiao extends Phaser.Scene {
  constructor() {
    super('Regiao');
  }

  // Recebe nome e papel da tela anterior
  init(dados) {
    this.nome = dados.nome;
    this.papel = dados.papel;
    this.escolhida = dados.regiao || null;   // id, se o jogador voltou para esta tela
  }

  create() {
    prepararCamera(this);
    const U = CONFIG.UI;
    const regioes = CONFIG.PERFIL.REGIOES;
    this.mapaX = 10;
    this.mapaY = 22;

    // ---------- Fundo ----------
    this.add.image(0, 0, 'fundo_perfil').setOrigin(0, 0);
    // Título desenhado (105×18), centralizado
    this.add.image(37, 3, 'texto_sua_regiao').setOrigin(0, 0);

    // ---------- Mapa ----------
    this.mapa = this.add.image(this.mapaX, this.mapaY, 'mapa_brasil').setOrigin(0, 0).setInteractive();
    // Uma camada por região, por cima do mapa, escondida até ser escolhida
    this.camadas = regioes.map(r =>
      this.add.image(this.mapaX, this.mapaY, 'mapa_' + r.id).setOrigin(0, 0).setVisible(false)
    );

    this.mapa.on('pointerup', (ponteiro) => {
      const idx = MAPA.regiaoEm(ponteiro.worldX - this.mapaX, ponteiro.worldY - this.mapaY);
      if (idx >= 0) this.escolher(regioes[idx].id);
    });

    // ---------- Informações da região ----------
    this.txtNome = escrever(this, 90, 186, '', {
      fontFamily: 'monospace', fontSize: '10px', color: U.TEXTO
    }).setOrigin(0.5, 0);
    this.txtSub = escrever(this, 90, 199, '', {
      fontFamily: 'monospace', fontSize: '8px', color: U.TEXTO_FRACO
    }).setOrigin(0.5, 0);
    this.txtClima = escrever(this, 90, 211, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      align: 'center', wordWrap: { width: 164 }
    }).setOrigin(0.5, 0);

    // ---------- Botões ----------
    this.btComecar = criarBotaoImg(this, 35, 258, 'botao_comecar', () => this.comecar());
    criarBotao(this, 35, 284, 'botao_voltar', () =>
      this.scene.start('Perfil', { nome: this.nome, papel: this.papel, regiao: this.escolhida })
    );

    escrever(this, CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.6);

    if (this.escolhida) this.escolher(this.escolhida);
    else this.limpar();
  }

  limpar() {
    this.mapa.clearTint();
    this.camadas.forEach(c => c.setVisible(false));
    this.txtNome.setText('');
    this.txtSub.setText('');
    this.txtClima.setText('Toque em uma região do mapa');
    this.btComecar.ativar(false);
  }

  escolher(id) {
    const regioes = CONFIG.PERFIL.REGIOES;
    const idx = regioes.findIndex(r => r.id === id);
    if (idx < 0) return;
    this.escolhida = id;

    // Escurece o mapa e acende só a região escolhida
    this.mapa.setTint(CONFIG.PERFIL.MAPA_ESCURECER);
    this.camadas.forEach((c, i) => c.setVisible(i === idx));

    this.txtNome.setText(regioes[idx].nome);
    this.txtSub.setText(regioes[idx].subtitulo);
    this.txtClima.setText(regioes[idx].clima);
    this.btComecar.ativar(true);
  }

  comecar() {
    if (!this.escolhida) return;
    Estado.criarNovo({ nome: this.nome, papel: this.papel, regiao: this.escolhida });
    // A Etapa 4 (Cegonha) vai começar aqui. Por enquanto, volta ao menu.
    this.scene.start('Menu', { avisar: 'Perfil salvo!' });
  }
}

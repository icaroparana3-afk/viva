// =============================================================
// Album.js — álbum de momentos do bebê (v0.0.58).
//
// Mostra as "primeiras vezes" e as festas guardadas em save.momentos
// (js/momentos.js), do mais novo para o mais antigo, 6 por página.
// Abre pelo botão do livrinho, ao lado do MENU, no quarto.
// =============================================================

class Album extends Phaser.Scene {
  constructor() {
    super('Album');
  }

  create() {
    prepararCamera(this);
    const U = CONFIG.UI, A = CONFIG.ALBUM;
    const save = Estado.carregar();
    if (!save || !save.bebe) { this.scene.start('Menu'); return; }
    this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x1b1225, 1).setOrigin(0, 0);

    const nome = save.bebe.nome || (save.bebe.sexo === 'F' ? 'da bebê' : 'do bebê');
    escrever(this, CONFIG.LARGURA / 2, 7, 'Álbum de ' + nome, {
      fontFamily: 'monospace', fontSize: '10px', color: U.TEXTO
    }).setOrigin(0.5, 0);
    if (CONFIG.VINCULO.TESTE_MOSTRAR) {
      escrever(this, CONFIG.LARGURA / 2, 20, '(teste) vínculo: ' + Math.round(VINCULO.valor()), {
        fontFamily: 'monospace', fontSize: '7px', color: '#8a7f96'
      }).setOrigin(0.5, 0);
    }

    this.momentos = MOMENTOS.lista().slice().sort((a, b) => (b.dia - a.dia) || (b.em - a.em));   // o mais novo primeiro
    this.pagina = 0;
    this.paginas = Math.max(1, Math.ceil(this.momentos.length / A.POR_PAGINA));
    this.itens = [];

    criarOpcao(this, 8, 296, 52, 16, 'Voltar', () => irPara(this, 'Quarto'), 8);
    this.anterior = criarOpcao(this, 104, 296, 18, 16, '<', () => this.mudarPagina(-1), 9);
    this.proxima = criarOpcao(this, 154, 296, 18, 16, '>', () => this.mudarPagina(1), 9);
    this.textoPagina = escrever(this, 138, 304, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(0.5);
    this.mostrarPagina();
  }

  mudarPagina(d) {
    const p = this.pagina + d;
    if (p < 0 || p >= this.paginas) return;
    this.pagina = p;
    this.mostrarPagina();
  }

  mostrarPagina() {
    const U = CONFIG.UI, A = CONFIG.ALBUM;
    this.itens.forEach(o => o.destroy());
    this.itens = [];
    this.textoPagina.setText((this.pagina + 1) + '/' + this.paginas);
    this.anterior.ativar(this.pagina > 0);
    this.proxima.ativar(this.pagina < this.paginas - 1);

    if (!this.momentos.length) {
      this.itens.push(escrever(this, CONFIG.LARGURA / 2, 140, 'Nenhum momento ainda.\nCuide do bebê e volte aqui!', {
        fontFamily: 'monospace', fontSize: '8px', color: '#b07ad6', align: 'center', lineSpacing: 3
      }).setOrigin(0.5));
      return;
    }
    const lista = this.momentos.slice(this.pagina * A.POR_PAGINA, (this.pagina + 1) * A.POR_PAGINA);
    lista.forEach((m, i) => {
      const y = 34 + i * 43;
      const caixa = this.add.rectangle(8, y, 164, 40, 0x2a1838, 1).setOrigin(0, 0).setStrokeStyle(1, U.CAIXA_ESCOLHIDA);
      const moldura = this.add.rectangle(13, y + 10, 20, 20, 0x3d2752, 1).setOrigin(0, 0);
      this.itens.push(caixa, moldura);
      if (m.textura && this.textures.exists(m.textura)) {
        const img = m.quadro === null || m.quadro === undefined
          ? this.add.image(23, y + 20, m.textura) : this.add.image(23, y + 20, m.textura, m.quadro);
        img.setOrigin(0.5);
        if (img.width > 18 || img.height > 18) img.setScale(0.5);
        this.itens.push(img);
      }
      this.itens.push(escrever(this, 38, y + 5, m.texto, {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', wordWrap: { width: 130 }, lineSpacing: 1
      }));
      this.itens.push(escrever(this, 38, y + 29, 'Dia ' + m.dia + ' · ' + m.idade, {
        fontFamily: 'monospace', fontSize: '7px', color: '#b07ad6'
      }));
    });
  }
}

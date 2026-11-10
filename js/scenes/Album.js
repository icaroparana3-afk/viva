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
    this.sexo = save.bebe.sexo;
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

    if (this.textures.exists('botao_voltar_album')) {
      // v0.0.60: botões desenhados pelo autor (a seta apagada tem o próprio desenho)
      criarBotaoImg(this, 8, 296, 'botao_voltar_album', () => irPara(this, 'Quarto'));
      this.anterior = this.criarSeta(104, 296, 'seta_esquerda', () => this.mudarPagina(-1));
      this.proxima = this.criarSeta(154, 296, 'seta_direita', () => this.mudarPagina(1));
    } else {
      criarOpcao(this, 8, 296, 52, 16, 'Voltar', () => irPara(this, 'Quarto'), 8);
      this.anterior = criarOpcao(this, 104, 296, 18, 16, '<', () => this.mudarPagina(-1), 9);
      this.proxima = criarOpcao(this, 154, 296, 18, 16, '>', () => this.mudarPagina(1), 9);
    }
    this.textoPagina = escrever(this, 138, 304, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(0.5);
    this.mostrarPagina();
  }

  // Seta 18×16: desenho aceso (nome) e apagado (nome_off); afunda 1 pixel ao apertar
  criarSeta(x, y, nome, aoTocar) {
    const img = this.add.image(x, y, nome).setOrigin(0, 0).setInteractive();
    const obj = { img, ativa: true };
    let apertado = false;
    const mostrar = () => {
      img.setTexture(obj.ativa ? nome : nome + '_off');
      img.y = y + (apertado && obj.ativa ? 1 : 0);
    };
    img.on('pointerdown', () => { apertado = true; mostrar(); });
    img.on('pointerout', () => { apertado = false; mostrar(); });
    img.on('pointerup', () => {
      const valeu = apertado && obj.ativa;
      apertado = false;
      mostrar();
      if (valeu) aoTocar();
    });
    obj.ativar = (sim) => { obj.ativa = sim; mostrar(); return obj; };
    return obj;
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
      // O desenho de agora para esse momento; se faltar, o que ficou guardado no save
      let [textura, quadro] = MOMENTOS.icone(m, this.sexo);
      if (!textura || !this.textures.exists(textura)) { textura = m.textura; quadro = m.quadro; }
      if (textura && this.textures.exists(textura)) {
        const img = quadro === null || quadro === undefined
          ? this.add.image(23, y + 20, textura) : this.add.image(23, y + 20, textura, quadro);
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

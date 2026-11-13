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
      escrever(this, CONFIG.LARGURA - 2, 1, '(teste) vínculo ' + Math.round(VINCULO.valor()), {
        fontFamily: 'monospace', fontSize: '6px', color: '#8a7f96'
      }).setOrigin(1, 0);
    }

    this.momentos = MOMENTOS.lista().slice().sort((a, b) => (b.dia - a.dia) || (b.em - a.em));   // o mais novo primeiro
    this.fotos = FOTOS.lista().slice().reverse();                                               // v0.0.62: a mais nova primeiro
    this.modo = 'momentos';
    this.vendoFoto = null;
    this.pagina = 0;
    this.itens = [];

    // v0.0.62: abas "Momentos" e "Fotos"
    this.abaMomentos = criarOpcao(this, 6, 19, 54, 13, 'Momentos', () => this.mudarModo('momentos'), 8);
    this.abaFotos = criarOpcao(this, 63, 19, 54, 13, 'Fotos (' + this.fotos.length + ')', () => this.mudarModo('fotos'), 8);
    // v0.0.63: caderneta dos marcos do desenvolvimento
    this.abaMarcos = criarOpcao(this, 120, 19, 54, 13, 'Marcos ' + MARCOS.quantos() + '/' + CONFIG.MARCOS.LISTA.length, () => this.mudarModo('marcos'), 8);

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

  mudarModo(modo) {
    if (this.vendoFoto) return;
    this.modo = modo;
    this.pagina = 0;
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
    const porPagina = this.modo === 'fotos' ? CONFIG.FOTOS.POR_PAGINA : A.POR_PAGINA;
    const total = this.modo === 'fotos' ? this.fotos.length : this.modo === 'marcos' ? CONFIG.MARCOS.LISTA.length : this.momentos.length;
    this.paginas = Math.max(1, Math.ceil(total / porPagina));
    this.textoPagina.setText((this.pagina + 1) + '/' + this.paginas);
    this.anterior.ativar(this.pagina > 0);
    this.proxima.ativar(this.pagina < this.paginas - 1);
    this.abaMomentos.marcar(this.modo === 'momentos');
    this.abaFotos.marcar(this.modo === 'fotos');
    this.abaMarcos.marcar(this.modo === 'marcos');
    if (this.modo === 'fotos') { this.mostrarFotos(); return; }
    if (this.modo === 'marcos') { this.mostrarMarcos(); return; }

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

  // ---------- v0.0.62: fotos (4 colunas × 5 linhas de miniaturas 40×40) ----------
  mostrarFotos() {
    const F = CONFIG.FOTOS;
    if (!this.fotos.length) {
      this.itens.push(escrever(this, CONFIG.LARGURA / 2, 140, 'Nenhuma foto ainda.\nToque na câmera no quarto!', {
        fontFamily: 'monospace', fontSize: '8px', color: '#b07ad6', align: 'center', lineSpacing: 3
      }).setOrigin(0.5));
      return;
    }
    const pagina = this.pagina;
    const lista = this.fotos.slice(pagina * F.POR_PAGINA, (pagina + 1) * F.POR_PAGINA);
    lista.forEach((foto, i) => {
      const x = 8 + (i % 4) * 42, y = 38 + Math.floor(i / 4) * 49;
      const moldura = this.add.rectangle(x - 1, y - 1, 42, 42, 0x3d2752, 1).setOrigin(0, 0).setStrokeStyle(1, CONFIG.UI.CAIXA_ESCOLHIDA);
      const dia = escrever(this, x + 20, y + 41, 'Dia ' + foto.dia, { fontFamily: 'monospace', fontSize: '6px', color: '#b07ad6' }).setOrigin(0.5, 0);
      this.itens.push(moldura, dia);
      FOTOS.textura(this, foto, (chave) => {
        if (this.modo !== 'fotos' || this.pagina !== pagina || !moldura.active) return;   // já mudou de página
        const img = this.add.image(x, y, chave).setOrigin(0, 0).setScale(40 / F.TAMANHO).setInteractive();
        img.on('pointerup', () => this.verFoto(foto, chave));
        this.itens.push(img);
      });
    });
  }

  // A foto grande (2×), com o dia e a idade; dá para apagar
  verFoto(foto, chave) {
    if (this.vendoFoto) return;
    const U = CONFIG.UI, F = CONFIG.FOTOS;
    const tela = [];
    this.vendoFoto = tela;
    const lado = F.TAMANHO * 2;
    const x = Math.round((CONFIG.LARGURA - lado) / 2), y = 40;
    tela.push(this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x1b1225, 1).setOrigin(0, 0).setInteractive().setDepth(70));
    tela.push(this.add.rectangle(x - 3, y - 3, lado + 6, lado + 6, 0xfff4dc, 1).setOrigin(0, 0).setDepth(71));
    tela.push(this.add.image(x, y, chave).setOrigin(0, 0).setScale(lado / F.TAMANHO).setDepth(72));
    tela.push(escrever(this, CONFIG.LARGURA / 2, y + lado + 8, 'Dia ' + foto.dia + ' · ' + foto.idade, {
      fontFamily: 'monospace', fontSize: '8px', color: U.TEXTO
    }).setOrigin(0.5, 0).setDepth(72));
    const fechar = () => { tela.forEach(o => o.destroy()); this.vendoFoto = null; };
    const voltar = criarOpcao(this, 24, 252, 60, 16, 'Voltar', fechar, 8);
    let certeza = false;
    const apagar = criarOpcao(this, 96, 252, 60, 16, 'Apagar', () => {
      if (!certeza) { certeza = true; apagar.rotulo.setText('Apagar?'); apagar.marcar(true); return; }
      FOTOS.apagar(foto.id);
      if (this.textures.exists(chave)) this.textures.remove(chave);
      this.fotos = this.fotos.filter(f => f.id !== foto.id);
      this.abaFotos.rotulo.setText('Fotos (' + this.fotos.length + ')');
      fechar();
      if (this.pagina > 0 && this.pagina * F.POR_PAGINA >= this.fotos.length) this.pagina--;
      this.mostrarPagina();
    }, 8);
    [voltar, apagar].forEach(b => { b.caixa.setDepth(73); b.rotulo.setDepth(74); tela.push(b.caixa, b.rotulo); });
  }

  // ---------- v0.0.63: caderneta dos marcos (os que chegaram e o que falta) ----------
  mostrarMarcos() {
    const U = CONFIG.UI, A = CONFIG.ALBUM, M = CONFIG.MARCOS;
    const lista = M.LISTA.slice(this.pagina * A.POR_PAGINA, (this.pagina + 1) * A.POR_PAGINA);
    lista.forEach((m, j) => {
      const i = M.LISTA.indexOf(m);
      const st = MARCOS.situacao(m);
      const y = 34 + j * 43;
      const caixa = this.add.rectangle(8, y, 164, 40, st.chegou ? 0x2a1838 : 0x1f1530, 1).setOrigin(0, 0)
        .setStrokeStyle(1, st.chegou ? U.DESTAQUE : U.CAIXA_ESCOLHIDA);
      const moldura = this.add.rectangle(13, y + 10, 20, 20, st.chegou ? 0x3d2752 : 0x2a2036, 1).setOrigin(0, 0);
      const icone = this.add.image(23, y + 20, 'icones_marcos', i);
      if (!st.chegou) icone.setTint(0x4a4058);              // ainda não chegou: medalha apagada
      this.itens.push(caixa, moldura, icone);
      this.itens.push(escrever(this, 38, y + 5, m.nome, {
        fontFamily: 'monospace', fontSize: '8px', color: st.chegou ? '#ffffff' : '#a898b8', wordWrap: { width: 130 }, lineSpacing: 1
      }));
      this.itens.push(escrever(this, 38, y + 29, st.texto, {
        fontFamily: 'monospace', fontSize: '7px', color: st.chegou ? '#b07ad6' : '#8a7f96'
      }));
    });
  }
}

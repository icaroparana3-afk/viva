// =============================================================
// Lojinha.js — a lojinha das estrelinhas (v0.0.66).
//
// Abre pela sacolinha do quarto (ao lado da prancheta das tarefas).
// Em cima, a vitrine mostra o item escolhido (o bebê vestido, a cor
// do quarto, o enfeite ou o brinquedo) com o botão de comprar ou usar.
// Embaixo, 3 abas (Roupas, Quarto, Brinquedos) com 9 itens por página.
// As regras e o save ficam em js/loja.js.
// =============================================================

class Lojinha extends Phaser.Scene {
  constructor() {
    super('Lojinha');
  }

  create() {
    prepararCamera(this);
    const U = CONFIG.UI;
    const save = Estado.carregar();
    if (!save || !save.bebe) { this.scene.start('Menu'); return; }
    this.bebeDados = save.bebe;
    this.sexo = save.bebe.sexo;
    this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x1b1225, 1).setOrigin(0, 0);

    escrever(this, 6, 5, 'Lojinha', { fontFamily: 'monospace', fontSize: '10px', color: U.TEXTO });
    // as estrelinhas que você tem
    this.add.image(CONFIG.LARGURA - 8, 10, 'estrela_tarefa').setScale(2);
    this.textoEstrelas = escrever(this, CONFIG.LARGURA - 16, 5, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffd860'
    }).setOrigin(1, 0);

    // abas
    this.abas = {
      roupas: criarOpcao(this, 6, 20, 54, 13, 'Roupas', () => this.mudarAba('roupas'), 8),
      quarto: criarOpcao(this, 63, 20, 54, 13, 'Quarto', () => this.mudarAba('quarto'), 8),
      brinquedos: criarOpcao(this, 120, 20, 54, 13, 'Brinquedos', () => this.mudarAba('brinquedos'), 8)
    };

    // vitrine
    this.add.rectangle(6, 37, 168, 92, 0x2a1838, 1).setOrigin(0, 0).setStrokeStyle(1, U.BORDA);
    this.add.rectangle(10, 41, 76, 84, 0x3d2752, 1).setOrigin(0, 0);

    // embaixo: voltar e páginas
    if (this.textures.exists('botao_voltar_album')) {
      criarBotaoImg(this, 8, 296, 'botao_voltar_album', () => irPara(this, 'Quarto'));
      this.anterior = this.criarSeta(104, 296, 'seta_esquerda', () => this.mudarPagina(-1));
      this.proxima = this.criarSeta(154, 296, 'seta_direita', () => this.mudarPagina(1));
    } else {
      criarOpcao(this, 8, 296, 52, 16, 'Voltar', () => irPara(this, 'Quarto'), 8);
      this.anterior = criarOpcao(this, 104, 296, 18, 16, '<', () => this.mudarPagina(-1), 9);
      this.proxima = criarOpcao(this, 154, 296, 18, 16, '>', () => this.mudarPagina(1), 9);
    }
    this.textoPagina = escrever(this, 138, 304, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5);

    this.itensGrade = [];
    this.itensVitrine = [];
    this.mudarAba('roupas');
  }

  // Mesma seta do álbum: desenho aceso e apagado; afunda 1 pixel ao apertar
  criarSeta(x, y, nome, aoTocar) {
    const img = this.add.image(x, y, nome).setOrigin(0, 0).setInteractive();
    const obj = { img, ativa: true };
    let apertado = false;
    const mostrar = () => { img.setTexture(obj.ativa ? nome : nome + '_off'); img.y = y + (apertado && obj.ativa ? 1 : 0); };
    img.on('pointerdown', () => { apertado = true; mostrar(); });
    img.on('pointerout', () => { apertado = false; mostrar(); });
    img.on('pointerup', () => { const valeu = apertado && obj.ativa; apertado = false; mostrar(); if (valeu) aoTocar(); });
    obj.ativar = (sim) => { obj.ativa = sim; mostrar(); return obj; };
    return obj;
  }

  mudarAba(aba) {
    this.aba = aba;
    Object.entries(this.abas).forEach(([k, b]) => b.marcar(k === aba));
    this.lista = LOJA.itens(aba);
    // começa no que está em uso (a roupa vestida, a parede de agora...), senão no primeiro
    const emUso = this.lista.find(i => i.tipo !== 'enfeite' && i.tipo !== 'brinquedo' && LOJA.usando(i.id));
    this.selecionado = (emUso || this.lista[0]).id;
    const idx = this.lista.findIndex(i => i.id === this.selecionado);
    this.pagina = Math.max(0, Math.floor(idx / CONFIG.LOJA.POR_PAGINA));
    this.atualizar();
  }

  mudarPagina(d) {
    const total = Math.ceil(this.lista.length / CONFIG.LOJA.POR_PAGINA);
    this.pagina = Phaser.Math.Clamp(this.pagina + d, 0, total - 1);
    tocarSom(this, 'pagina', { volume: 0.5 });
    this.atualizar();
  }

  selecionar(id) {
    if (this.selecionado === id) return;
    this.selecionado = id;
    tocarSom(this, 'clique', { volume: 0.5 });
    this.atualizar();
  }

  atualizar() {
    this.textoEstrelas.setText(String(LOJA.estrelas()));
    this.mostrarGrade();
    this.mostrarVitrine();
  }

  // ---------- Grade (3 × 3) ----------
  mostrarGrade() {
    const U = CONFIG.UI, P = CONFIG.LOJA.POR_PAGINA;
    this.itensGrade.forEach(o => o.destroy());
    this.itensGrade = [];
    const total = Math.max(1, Math.ceil(this.lista.length / P));
    const pagina = this.lista.slice(this.pagina * P, this.pagina * P + P);
    const estrelas = LOJA.estrelas();
    pagina.forEach((it, k) => {
      const x = 6 + (k % 3) * 57, y = 133 + Math.floor(k / 3) * 53;
      const sel = it.id === this.selecionado;
      const usando = LOJA.usando(it.id), tem = LOJA.tem(it.id);
      const card = this.add.rectangle(x, y, 54, 50, sel ? U.CAIXA_ESCOLHIDA : 0x2a1838, 1).setOrigin(0, 0)
        .setStrokeStyle(1, sel ? U.DESTAQUE : U.BORDA).setInteractive();
      card.on('pointerup', () => this.selecionar(it.id));
      this.itensGrade.push(card);
      this.itensGrade.push(...this.desenharItem(it, x + 27, y + 19, 44, 30, false));
      if (usando && it.tipo !== 'brinquedo') {
        this.itensGrade.push(escrever(this, x + 27, y + 39, 'Usando', { fontFamily: 'monospace', fontSize: '7px', color: '#8ce07a' }).setOrigin(0.5, 0));
      } else if (tem) {
        this.itensGrade.push(escrever(this, x + 27, y + 39, it.tipo === 'brinquedo' ? 'No quarto' : 'É seu', { fontFamily: 'monospace', fontSize: '7px', color: '#b07ad6' }).setOrigin(0.5, 0));
      } else {
        const caro = estrelas < it.preco;
        this.itensGrade.push(this.add.image(x + 22, y + 43, 'estrela_tarefa'));
        this.itensGrade.push(escrever(this, x + 27, y + 39, String(it.preco), { fontFamily: 'monospace', fontSize: '8px', color: caro ? '#e07070' : '#ffd860' }));
      }
    });
    this.anterior.ativar(this.pagina > 0);
    this.proxima.ativar(this.pagina < total - 1);
    this.textoPagina.setText((this.pagina + 1) + '/' + total);
  }

  // Desenha o item centrado em (cx, cy), cabendo em larg × alt. grande = na vitrine.
  desenharItem(it, cx, cy, larg, alt, grande) {
    const objs = [];
    const caber = (img) => {
      const esc = Math.max(1, Math.floor(Math.min(larg / img.width, alt / img.height)));
      img.setScale(Math.min(esc, grande ? 4 : 2));
      return img;
    };
    if (it.tipo === 'roupa') {
      if (grande) {
        const b = criarBebeVisual(this, cx - 32, cy - 32, 2).mostrar(this.bebeDados).dentinho(MARCOS.tem('dentinho'))
          .roupa(it.id === 'roupa_nenhuma' ? null : it.id);
        objs.push(...Object.values(b.camadas));
      } else {
        const chave = LOJA.iconeRoupa(this, it.id);
        if (chave) objs.push(this.add.image(cx, cy, chave).setScale(2));
      }
    } else if (it.tipo === 'parede' || it.tipo === 'tapete') {
      // um pedaço do quarto, com a cor por cima
      const base = this.sexo === 'F' ? 'quarto_menina' : 'quarto_menino';
      const rec = grande
        ? (it.tipo === 'parede' ? [100, 128, 76, 84] : [34, 244, 76, 46])
        : (it.tipo === 'parede' ? [4, 40, 40, 26] : [36, 258, 40, 26]);
      const [rx, ry, rw, rh] = rec;
      const chaves = [base];
      const cor = LOJA.texturaQuarto(this, this.sexo, it.tipo, it.cor.id);
      if (cor) chaves.push(cor);
      chaves.forEach(ch => objs.push(this.add.image(Math.round(cx - rw / 2) - rx, Math.round(cy - rh / 2) - ry, ch).setOrigin(0, 0).setCrop(rx, ry, rw, rh)));
    } else if (it.tipo === 'enfeite') {
      const e = it.def;
      if (e.id === 'estrelas') {
        [[-8, -6], [6, -9], [0, 6], [-12, 8], [12, 4]].forEach(([dx, dy], i) =>
          objs.push(this.add.image(cx + dx * (grande ? 2 : 1), cy + dy * (grande ? 2 : 1), 'deco_estrela').setScale(grande ? 3 - (i % 2) : 1)));
      } else {
        const img = e.id === 'mobile' ? this.add.sprite(cx, cy, 'deco_mobile', 0) : this.add.image(cx, cy, e.textura);
        caber(img);
        if (e.id === 'mobile' && grande) { LOJA.criarAnimacoes(this); img.play('mobile_devagar'); }
        objs.push(img);
        if (e.id === 'varal' && grande) objs.push(caber(this.add.image(cx, cy, 'deco_varal_luz')).setAlpha(0.8));
      }
    } else {
      objs.push(caber(this.add.image(cx, cy, it.def.textura)));
    }
    return objs;
  }

  // ---------- Vitrine ----------
  mostrarVitrine() {
    this.itensVitrine.forEach(o => o.destroy());
    this.itensVitrine = [];
    const it = this.lista.find(i => i.id === this.selecionado);
    if (!it) return;
    const v = this.itensVitrine;
    v.push(...this.desenharItem(it, 48, 83, 72, 80, true));
    v.push(escrever(this, 92, 42, it.nome, { fontFamily: 'monospace', fontSize: '9px', color: '#ffffff', wordWrap: { width: 80 } }));
    const desc = it.tipo === 'roupa' ? (it.id === 'roupa_nenhuma' ? 'Sem roupa, só a fraldinha.' : 'Para vestir o bebê.')
      : it.tipo === 'parede' ? (it.original ? 'A cor original da parede.' : 'Pinta a parede do quarto.')
      : it.tipo === 'tapete' ? (it.original ? 'A cor original do tapete.' : 'Troca a cor do tapete.')
      : it.tipo === 'enfeite' ? it.def.texto
      : 'Fica no chão do quarto. Arraste até o berço!';
    v.push(escrever(this, 92, 66, desc, { fontFamily: 'monospace', fontSize: '7px', color: '#b07ad6', wordWrap: { width: 80 }, lineSpacing: 1 }));

    const tem = LOJA.tem(it.id), usando = LOJA.usando(it.id);
    let rotulo, acao = null;
    if (!tem) {
      v.push(this.add.image(96, 100, 'estrela_tarefa'));
      const caro = LOJA.estrelas() < it.preco;
      v.push(escrever(this, 102, 95, String(it.preco), { fontFamily: 'monospace', fontSize: '9px', color: caro ? '#e07070' : '#ffd860' }));
      rotulo = 'Comprar'; acao = () => this.comprar(it);
    } else if (it.tipo === 'roupa') {
      if (usando) { rotulo = it.id === 'roupa_nenhuma' ? 'Usando' : 'Tirar'; if (it.id !== 'roupa_nenhuma') acao = () => this.usar(it, false); }
      else { rotulo = 'Vestir'; acao = () => this.usar(it, true); }
    } else if (it.tipo === 'parede' || it.tipo === 'tapete') {
      if (usando) rotulo = 'Usando';
      else { rotulo = 'Usar'; acao = () => this.usar(it, true); }
    } else if (it.tipo === 'enfeite') {
      if (usando) { rotulo = 'Tirar'; acao = () => this.usar(it, false); }
      else { rotulo = 'Pôr no quarto'; acao = () => this.usar(it, true); }
    } else {
      rotulo = 'No quarto';
    }
    const b = criarOpcao(this, 92, 109, 78, 15, rotulo, () => { if (acao) acao(); }, 8);
    if (!acao) b.ativar(false);
    v.push(b.caixa, b.rotulo);
  }

  comprar(it) {
    const r = LOJA.comprar(it.id);
    if (!r.ok) {
      tocarSom(this, 'toc', { volume: 0.5 });
      mostrarAvisoCaixa(this, 'Faltam ' + r.falta + (r.falta === 1 ? ' estrelinha.' : ' estrelinhas.') + '\nFaça as tarefas do dia!', 248, 2.5);
      return;
    }
    tocarSom(this, 'marco', { volume: 0.7 });
    // a estrelinha "sai" do contador
    for (let k = 0; k < Math.min(it.preco, 6); k++) {
      const e = this.add.image(CONFIG.LARGURA - 8, 10, 'estrela_tarefa').setScale(2).setDepth(60);
      this.tweens.add({ targets: e, x: 48, y: 83, scale: 1, alpha: 0, delay: k * 70, duration: 420, ease: 'Sine.easeIn', onComplete: () => e.destroy() });
    }
    mostrarAvisoCaixa(this, it.tipo === 'brinquedo' ? 'Comprado!\nJá está no quarto.' : 'Comprado!', 248, 1.8);
    this.atualizar();
  }

  usar(it, sim) {
    if (sim) LOJA.usar(it.id); else LOJA.tirar(it.id);
    tocarSom(this, 'clique', { volume: 0.6 });
    this.atualizar();
  }
}

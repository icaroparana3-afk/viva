// =============================================================
// Brincadeira.js — os minijogos do baú de brinquedos (v0.0.62).
//
// Abre POR CIMA do quarto (o quarto fica pausado e aparece escurecido
// atrás). O bebê aparece de perto. Nenhuma brincadeira tira nada:
// só dá diversão e vínculo (e cansa um pouquinho: CONFIG.ATIVIDADES.ENERGIA).
//
//   bolhas  — toque nas bolhas de sabão antes de elas sumirem (30 s)
//   achou   — "cadê? achou!": esconda o rosto e mostre na hora do "!"
//   livro   — leia o livro de figuras; tocar na figura o bebê "fala"
//   blocos  — empilhe os blocos; no fim o bebê derruba a torre rindo
//
// Abrir: this.scene.launch('Brincadeira', { qual: 'bolhas' }); this.scene.pause();
// =============================================================

class Brincadeira extends Phaser.Scene {
  constructor() {
    super('Brincadeira');
  }

  init(dados) {
    this.qual = (dados && dados.qual) || 'bolhas';
  }

  create() {
    prepararCamera(this);
    const save = Estado.carregar();
    if (!save || !save.bebe) { this.sair(); return; }
    this.bebeDados = save.bebe;
    this.diversao = 0;
    this.vinculo = 0;
    this.pontos = 0;
    this.acabou = false;
    this.aplicado = false;
    this.passo = null;
    this.ultimaRisada = 0;
    this.risadas = 0; this.estouradas = 0; this.acertos = 0; this.vermelhas = 0;   // v0.0.63: contam para os marcos

    // Fundo: o quarto escurecido atrás; segura os toques para não irem ao quarto
    this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x1b1225, 0.78).setOrigin(0, 0).setInteractive();
    this.add.rectangle(0, 0, CONFIG.LARGURA, 34, 0x1b1225, 1).setOrigin(0, 0);   // faixa do título (esconde o MENU e o nome do quarto atrás)
    this.titulo = escrever(this, 6, 7, '', { fontFamily: 'monospace', fontSize: '9px', color: CONFIG.UI.TEXTO });
    this.placar = escrever(this, 6, 19, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffffff' });
    this.botaoSair = criarOpcao(this, 134, 5, 40, 14, 'Sair', () => this.sair(), 8);

    const nomes = { bolhas: 'Bolhas de sabão', achou: 'Cadê? Achou!', livro: 'Livro de figuras', blocos: 'Torre de blocos' };
    this.titulo.setText(nomes[this.qual] || '');
    this['iniciar_' + this.qual]();
  }

  update(t, ms) {
    const dt = Math.min(ms, 100) / 1000;
    if (this.passo && !this.acabou) this.passo(dt);
    // o bebê pisca de vez em quando
    if (this.bebe && !this.rindo) {
      this.piscaEm = (this.piscaEm || 2.5) - dt;
      if (this.piscaEm <= 0) {
        this.bebe.piscar(true);
        this.time.delayedCall(140, () => { if (this.bebe && !this.rindo) this.bebe.piscar(false); });
        this.piscaEm = 2 + Math.random() * 3;
      }
    }
  }

  // ---------- Bebê de perto ----------
  criarBebe(x, y, escala) {
    this.bebe = criarBebeVisual(this, x, y, escala).mostrar(this.bebeDados).dentinho(MARCOS.tem('dentinho'));
    this.bebeX = x; this.bebeY = y; this.bebeEscala = escala;
    return this.bebe;
  }

  rir(segundos = 0.6, coracoes = 1) {
    if (!this.bebe) return;
    this.risadas = (this.risadas || 0) + 1;
    // marco "Primeira gargalhada": ri mais e solta um coração a mais
    if (MARCOS.tem('gargalhada')) { segundos += 0.25; coracoes += 1; }
    this.rindo = true;
    this.bebe.piscar(true, true);
    if (this.time.now - this.ultimaRisada > 600) { tocarSom(this, 'risada'); this.ultimaRisada = this.time.now; }
    if (this.fimRiso) this.fimRiso.remove();
    this.fimRiso = this.time.delayedCall(segundos * 1000, () => { this.rindo = false; if (this.bebe) this.bebe.piscar(false); });
    const meio = this.bebeX + 16 * this.bebeEscala;
    for (let i = 0; i < coracoes; i++) {
      const c = this.add.image(meio + (i - (coracoes - 1) / 2) * 10, this.bebeY + 2, 'coracao').setDepth(30);
      this.tweens.add({ targets: c, y: c.y - 18, alpha: 0, duration: 900, delay: i * 120, onComplete: () => c.destroy() });
    }
  }

  textoNoAr(x, y, texto, cor = '#ffffff', tamanho = 10) {
    const t = escrever(this, x, y, texto, { fontFamily: 'monospace', fontSize: tamanho + 'px', color: cor, stroke: '#1b1225', strokeThickness: 3 })
      .setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: t, y: y - 12, alpha: 0, delay: 500, duration: 600, onComplete: () => t.destroy() });
    return t;
  }

  // ---------- Recompensa e fim ----------
  // Brincou de verdade? (nas bolhas, os pontos podem voltar a 0 por causa das vermelhas)
  brincou() {
    return this.pontos > 0 || (this.estouradas || 0) > 0;
  }

  aplicar() {
    if (this.aplicado) return;
    this.aplicado = true;
    const A = CONFIG.ATIVIDADES;
    const d = Math.round(this.diversao);
    if (d > 0) NEC.mudar('diversao', d);
    const brincou = this.brincou();
    if (brincou) NEC.mudar('energia', A.ENERGIA);
    if (this.vinculo > 0) VINCULO.mudar(this.vinculo);
    // contagens (servem para as tarefas do dia e os marcos depois)
    const s = Estado.carregar();
    if (s) {
      s.atividades = s.atividades || {};
      const a = s.atividades;
      a[this.qual] = (a[this.qual] || 0) + (brincou ? 1 : 0);
      // v0.0.63: contagens que liberam os marcos do desenvolvimento
      a.risadas = (a.risadas || 0) + (this.risadas || 0);
      if (this.qual === 'bolhas') a.bolhas_total = (a.bolhas_total || 0) + (this.estouradas || 0);
      if (this.qual === 'achou') a.acertos_achou = (a.acertos_achou || 0) + (this.acertos || 0);
      if (this.qual === 'livro' && this.lidas && this.lidas.size === this.paginas.length) a.livros_completos = (a.livros_completos || 0) + 1;
      const rec = 'recorde_' + this.qual;
      if (this.qual !== 'livro' && this.pontos > (a[rec] || 0)) a[rec] = this.pontos;
      Estado.salvar();
    }
    const momento = { bolhas: 'primeiras_bolhas', achou: 'primeiro_achou', livro: 'primeiro_livro', blocos: 'primeira_torre' }[this.qual];
    // v0.0.64: tarefas do dia
    let pronta = false;
    if (this.qual === 'livro' && this.lidas && this.lidas.size === this.paginas.length) pronta = TAREFAS.contar('livro') || pronta;
    if (this.qual === 'bolhas') pronta = TAREFAS.contar('bolhas', this.estouradas || 0) || pronta;
    if (this.qual === 'achou') pronta = TAREFAS.contar('achou', this.acertos || 0) || pronta;
    if (this.qual === 'blocos') pronta = TAREFAS.maximo('torre', this.pontos) || pronta;
    this.tarefaPronta = pronta;
    const livroInteiro = this.qual !== 'livro' || (this.lidas && this.lidas.size === this.paginas.length);
    if (brincou && momento && livroInteiro && !(this.qual === 'achou' && this.acertos === 0)) MOMENTOS.registrar(momento);
  }

  fim(texto) {
    if (this.acabou) return;
    this.acabou = true;
    this.aplicar();
    const U = CONFIG.UI;
    const d = Math.round(this.diversao);
    const caixa = this.add.rectangle(20, 92, 140, 98, U.CAIXA, 1).setOrigin(0, 0).setStrokeStyle(1, U.DESTAQUE).setDepth(60);
    const linhas = texto + (d > 0 ? '\n+' + d + ' de diversão' : '') + (this.tarefaPronta ? '\nTarefa do dia feita!' : '');
    escrever(this, 90, 100, linhas, { fontFamily: 'monospace', fontSize: '9px', color: U.TEXTO, align: 'center', lineSpacing: 3 })
      .setOrigin(0.5, 0).setDepth(61);
    const de = criarOpcao(this, 28, 168, 58, 16, 'De novo', () => this.deNovo(), 8);
    const vo = criarOpcao(this, 94, 168, 58, 16, 'Voltar', () => this.sair(), 8);
    [de.caixa, de.rotulo, vo.caixa, vo.rotulo].forEach(o => o.setDepth(61));
    tocarSom(this, 'festa', { volume: 0.5 });
    if (MARCOS.tem('palmas')) this.palminhas();
    void caixa;
  }

  // Marco "Bate palminhas": no fim da brincadeira o bebê bate palmas (provisório:
  // brilhinhos nas mãos e o som de palmas, até a arte do bebê batendo palmas)
  palminhas() {
    if (!this.bebe) return;
    const e = this.bebeEscala, cx = this.bebeX + 16 * e, cy = this.bebeY + 22 * e;
    this.time.delayedCall(250, () => tocarSom(this, 'palmas'));
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(250 + i * 170, () => {
        if (!this.bebe) return;
        this.rir(0.3, 0);
        for (let k = 0; k < 4; k++) {
          const ang = k * Math.PI / 2 + Math.PI / 4;
          const b = this.add.rectangle(cx, cy, 2, 2, 0xffffff).setDepth(30);
          this.tweens.add({ targets: b, x: cx + Math.cos(ang) * 8, y: cy + Math.sin(ang) * 8, alpha: 0, duration: 260, onComplete: () => b.destroy() });
        }
      });
    }
  }

  deNovo() {
    const n = NEC.atuais();
    if (n && n.energia < CONFIG.ATIVIDADES.ENERGIA_MINIMA) { this.sair('O bebê está com\nmuito sono agora...'); return; }
    this.scene.restart({ qual: this.qual });
  }

  sair(aviso) {
    if (!this.aplicado && this.brincou()) this.aplicar();   // saiu antes do fim: ganha o que já brincou
    const q = this.scene.get('Quarto');
    this.scene.resume('Quarto', { brincou: this.qual, aviso });
    this.scene.stop();
    void q;
  }

  // =============================================================
  // BOLHAS DE SABÃO
  // =============================================================
  iniciar_bolhas() {
    const B = CONFIG.ATIVIDADES.BOLHAS;
    this.criarBebe(58, 236, 2);
    this.bolhas = [];
    this.tempo = B.SEGUNDOS;
    this.proxima = 0.3;
    this.barra = this.add.rectangle(6, 30, 168, 3, 0x7b4aa6).setOrigin(0, 0);
    this.add.rectangle(6, 30, 168, 3, 0x000000, 0).setOrigin(0, 0).setStrokeStyle(1, 0x2a1838);
    tocarSom(this, 'sopro');
    this.placar.setText('Estoure! Fuja das vermelhas');
    this.passo = (dt) => {
      this.tempo -= dt;
      this.barra.width = Math.max(0, 168 * this.tempo / B.SEGUNDOS);
      this.proxima -= dt;
      if (this.proxima <= 0 && this.tempo > 1) {
        this.soltarBolha();
        this.proxima = Phaser.Math.FloatBetween(B.INTERVALO[0], B.INTERVALO[1]);
      }
      for (const b of this.bolhas) {
        if (!b.active || b.estourou) continue;
        b.vida += dt;
        b.py -= b.vel * dt;
        b.x = Math.round(b.x0 + Math.sin(b.vida * b.freq) * b.amp);
        b.y = Math.round(b.py);
        if (b.py < 36 || b.vida > B.VIDA) this.sumirBolha(b);
      }
      this.bolhas = this.bolhas.filter(b => b.active);
      if (this.tempo <= 0) this.fim(this.pontos + (this.pontos === 1 ? ' bolha estourada!' : ' bolhas estouradas!'));
    };
  }

  soltarBolha() {
    const B = CONFIG.ATIVIDADES.BOLHAS;
    const grande = Math.random() < 0.4;
    const x0 = Phaser.Math.Between(18, 162);
    const b = this.add.image(x0, 300, 'bolha', 0).setScale(grande ? 2 : 1).setDepth(20);
    b.x0 = x0; b.py = 300; b.vida = 0;
    b.vel = Phaser.Math.Between(B.SUBIDA[0], B.SUBIDA[1]);
    b.freq = Phaser.Math.FloatBetween(1.2, 2.4); b.amp = Phaser.Math.Between(4, 12);
    // v0.0.63: a bolha VERMELHA tira pontos (dá para evitar); a dourada vale 3
    const sorte = Math.random();
    b.vermelha = sorte < B.VERMELHA;
    b.dourada = !b.vermelha && sorte < B.VERMELHA + B.DOURADA;
    if (b.dourada) b.setTint(0xffd860);
    if (b.vermelha) b.setTint(0xff4040);
    b.setInteractive(new Phaser.Geom.Rectangle(-3, -3, 18, 18), Phaser.Geom.Rectangle.Contains);   // um pouco maior que a bolha: mais fácil de acertar
    b.on('pointerdown', () => this.estourar(b));
    this.bolhas.push(b);
  }

  estourar(b) {
    if (b.estourou || this.acabou) return;
    const B = CONFIG.ATIVIDADES.BOLHAS;
    b.estourou = true;
    b.disableInteractive();
    b.setFrame(1);
    this.vinculo = B.VINCULO;
    if (b.vermelha) {
      // bolha vermelha: perde pontos (nunca abaixo de zero) e o bebê faz careta
      tocarSom(this, 'estouro', { rate: 0.6 });
      this.pontos = Math.max(0, this.pontos - B.PERDE_VERMELHA);
      this.vermelhas = (this.vermelhas || 0) + 1;
      this.textoNoAr(b.x, b.y - 8, '-' + B.PERDE_VERMELHA, '#ff6060');
      this.cameras.main.shake(120, 0.006);
      if (this.bebe && !this.rindo) {
        this.bebe.olharBaixo(true);
        this.time.delayedCall(500, () => this.bebe && this.bebe.olharBaixo(false));
      }
    } else {
      tocarSom(this, 'estouro');
      this.pontos += b.dourada ? 3 : 1;
      this.estouradas++;
      if (b.dourada) this.textoNoAr(b.x, b.y - 8, '+3', '#ffd860');
      this.rir(0.5, b.dourada ? 2 : 1);
    }
    this.diversao = Math.min(B.DIVERSAO_MAX, this.pontos * B.DIVERSAO_POR_BOLHA);
    this.placar.setText('Bolhas: ' + this.pontos);
    this.tweens.add({ targets: b, alpha: 0, duration: 180, onComplete: () => b.destroy() });
  }

  sumirBolha(b) {
    b.estourou = true;
    b.disableInteractive();
    this.tweens.add({ targets: b, alpha: 0, duration: 250, onComplete: () => b.destroy() });
  }

  // =============================================================
  // CADÊ? ACHOU!
  // =============================================================
  iniciar_achou() {
    const C = CONFIG.ATIVIDADES.ACHOU;
    this.criarBebe(42, 110, 3);
    this.rodada = 0;
    this.acertos = 0;
    this.seguidos = 0;
    // as mãos (de quem brinca) entram pelos lados e cobrem o rosto do bebê
    this.maoE = this.add.image(-30, 250, 'mao_achou').setOrigin(0.5, 0.5).setScale(2).setDepth(20);
    this.maoD = this.add.image(210, 250, 'mao_achou').setOrigin(0.5, 0.5).setScale(2).setFlipX(true).setDepth(20);
    this.aviso = escrever(this, 90, 232, '', { fontFamily: 'monospace', fontSize: '10px', color: CONFIG.UI.TEXTO, align: 'center' })
      .setOrigin(0.5, 0).setDepth(30);
    this.exclama = escrever(this, 90, 84, '!', { fontFamily: 'monospace', fontSize: '22px', color: '#ffd860', stroke: '#1b1225', strokeThickness: 4 })
      .setOrigin(0.5).setDepth(31).setVisible(false);
    this.estado = 'pronto';
    this.toque = this.add.zone(0, 34, CONFIG.LARGURA, CONFIG.ALTURA - 34).setOrigin(0, 0).setInteractive().setDepth(10);
    this.toque.on('pointerdown', () => this.tocarAchou());
    this.prepararRodada();
    this.passo = (dt) => {
      if (this.estado === 'escondido') {
        this.espera -= dt;
        if (this.espera <= 0) {
          this.estado = 'janela';
          this.janela = C.JANELA;
          this.exclama.setVisible(true).setScale(0.6);
          this.tweens.add({ targets: this.exclama, scale: 1, duration: 120 });
          // o bebê se mexe atrás das mãos
          this.tweens.add({ targets: [this.maoE, this.maoD], y: '-=2', duration: 90, yoyo: true, repeat: 1 });
        }
      } else if (this.estado === 'janela') {
        this.janela -= dt;
        if (this.janela <= 0) this.mostrar('tarde');
      }
    };
  }

  prepararRodada() {
    const C = CONFIG.ATIVIDADES.ACHOU;
    if (this.rodada >= C.RODADAS) {
      this.fim(this.acertos + ' de ' + C.RODADAS + ' "achou!"' + (this.acertos >= 4 ? '\nQue risada!' : ''));
      return;
    }
    this.estado = 'pronto';
    this.placar.setText('Rodada ' + (this.rodada + 1) + '/' + C.RODADAS + (this.seguidos > 1 ? '  · ' + this.seguidos + ' seguidos!' : ''));
    this.aviso.setText('Toque para esconder');
  }

  tocarAchou() {
    if (this.acabou) return;
    if (this.estado === 'pronto') {
      this.estado = 'cobrindo';
      this.aviso.setText('Cadê o bebê?\nEspere o "!"');
      this.tweens.add({ targets: this.maoE, x: 66, y: 160, duration: 220, ease: 'Sine.easeOut' });
      this.tweens.add({
        targets: this.maoD, x: 114, y: 160, duration: 220, ease: 'Sine.easeOut',
        onComplete: () => {
          this.estado = 'escondido';
          const C = CONFIG.ATIVIDADES.ACHOU;
          this.espera = Phaser.Math.FloatBetween(C.ESPERA[0], C.ESPERA[1]);
        }
      });
    } else if (this.estado === 'escondido') this.mostrar('cedo');
    else if (this.estado === 'janela') this.mostrar('certo');
  }

  mostrar(como) {
    const C = CONFIG.ATIVIDADES.ACHOU;
    this.estado = 'mostrando';
    this.exclama.setVisible(false);
    this.tweens.add({ targets: this.maoE, x: -30, y: 250, duration: 200, ease: 'Sine.easeIn' });
    this.tweens.add({ targets: this.maoD, x: 210, y: 250, duration: 200, ease: 'Sine.easeIn' });
    this.pontos++;
    if (como === 'certo') {
      this.acertos++; this.seguidos++;
      this.diversao += C.DIVERSAO_ACERTO + (this.seguidos >= 3 ? 1 : 0);
      this.vinculo += C.VINCULO_ACERTO;
      tocarSom(this, 'achou');
      this.aviso.setText('ACHOU!');
      this.rir(0.9, this.seguidos >= 3 ? 3 : 2);
    } else if (como === 'cedo') {
      this.seguidos = 0;
      this.diversao += C.DIVERSAO_CEDO;
      this.aviso.setText('Ainda não...\no bebê nem se escondeu!');
      this.textoNoAr(90, 100, '?', '#ffffff', 16);
    } else {
      this.seguidos = 0;
      this.aviso.setText('Demorou!\nO bebê achou você primeiro.');
      this.bebe.olharBaixo(true);
      this.time.delayedCall(700, () => this.bebe && this.bebe.olharBaixo(false));
    }
    this.rodada++;
    this.time.delayedCall(1300, () => { if (!this.acabou) this.prepararRodada(); });
  }

  // =============================================================
  // LIVRO DE FIGURAS
  // =============================================================
  // v0.0.64: primeiro escolhe o livro (capas), depois lê
  iniciar_livro() {
    const livros = CONFIG.ATIVIDADES.LIVRO.LIVROS;
    this.criarBebe(58, 214, 2);
    this.placar.setText('Qual livro vamos ler?');
    const capas = [];
    const cores = [[0x8a3a2a, 0x5a2418], [0x2a5a8a, 0x183a5a]];
    livros.forEach((l, i) => {
      const x = 14 + i * 80, y = 58;
      const capa = this.add.rectangle(x, y, 72, 96, cores[i % 2][0], 1).setOrigin(0, 0).setStrokeStyle(2, cores[i % 2][1]).setInteractive();
      const miolo = this.add.rectangle(x + 10, y + 10, 52, 46, 0xfff4dc, 1).setOrigin(0, 0);
      const fig = this.add.image(x + 36, y + 33, l.textura, l.paginas[0][1]).setScale(3);
      const nome = escrever(this, x + 36, y + 62, l.nome, {
        fontFamily: 'monospace', fontSize: '8px', color: '#fff4dc', align: 'center', wordWrap: { width: 64 }
      }).setOrigin(0.5, 0);
      capa.on('pointerdown', () => capa.setFillStyle(cores[i % 2][1]));
      capa.on('pointerout', () => capa.setFillStyle(cores[i % 2][0]));
      capa.on('pointerup', () => { capas.forEach(o => o.destroy()); this.abrirLivro(i); });
      capas.push(capa, miolo, fig, nome);
    });
  }

  abrirLivro(qual) {
    const livro = CONFIG.ATIVIDADES.LIVRO.LIVROS[qual];
    this.livroAtual = livro;
    this.paginas = livro.paginas;
    this.pagina = 0;
    this.lidas = new Set([0]);
    this.add.image(15, 42, 'livro_aberto').setOrigin(0, 0);
    this.figura = this.add.image(53, 88, livro.textura, this.paginas[0][1]).setScale(4);
    this.figura.setInteractive();
    this.figura.on('pointerdown', () => this.tocarFigura());
    this.palavra = escrever(this, 126, 78, '', { fontFamily: 'monospace', fontSize: '10px', color: '#3a2418', align: 'center' }).setOrigin(0.5);
    this.dica = escrever(this, 126, 112, 'toque na\nfigura', { fontFamily: 'monospace', fontSize: '7px', color: '#9a8060', align: 'center' }).setOrigin(0.5);
    const seta = (x, nome, d) => {
      const tem = this.textures.exists(nome);
      const b = tem ? this.add.image(x, 146, nome).setOrigin(0, 0) : null;
      const obj = tem ? { img: b } : criarOpcao(this, x, 146, 18, 16, d < 0 ? '<' : '>', () => this.virar(d), 9);
      if (tem) {
        b.setInteractive();
        b.on('pointerup', () => this.virar(d));
        obj.ativar = (sim) => { b.setTexture(sim ? nome : nome + '_off'); obj.ativa = sim; };
      }
      return obj;
    };
    this.anterior = seta(14, 'seta_esquerda', -1);
    this.proxima = seta(148, 'seta_direita', 1);
    this.fimLivro = criarOpcao(this, 128, 146, 38, 16, 'Fim', () => this.terminarLivro(), 8);
    this.mostrarPaginaLivro();
  }

  mostrarPaginaLivro() {
    const [nome, quadro] = this.paginas[this.pagina];
    this.figura.setFrame(quadro);
    this.palavra.setText(nome.length > 8 ? nome.slice(0, Math.ceil(nome.length / 2)) + '-\n' + nome.slice(Math.ceil(nome.length / 2)) : nome);
    this.placar.setText('Página ' + (this.pagina + 1) + '/' + this.paginas.length);
    this.anterior.ativar(this.pagina > 0);
    const ultima = this.pagina === this.paginas.length - 1;
    this.proxima.ativar(!ultima);
    if (this.proxima.img) this.proxima.img.setVisible(!ultima);
    else { this.proxima.caixa.setVisible(!ultima); this.proxima.rotulo.setVisible(!ultima); }
    this.fimLivro.caixa.setVisible(ultima); this.fimLivro.rotulo.setVisible(ultima); this.fimLivro.ativar(ultima);
    this.pontos = this.lidas.size;
    this.diversao = CONFIG.ATIVIDADES.LIVRO.DIVERSAO * this.lidas.size / this.paginas.length;
    this.vinculo = CONFIG.ATIVIDADES.LIVRO.VINCULO * this.lidas.size / this.paginas.length;
  }

  virar(d) {
    const p = this.pagina + d;
    if (p < 0 || p >= this.paginas.length || this.acabou) return;
    this.pagina = p;
    this.lidas.add(p);
    tocarSom(this, 'pagina');
    this.figura.setAlpha(0); this.palavra.setAlpha(0);
    this.tweens.add({ targets: [this.figura, this.palavra], alpha: 1, duration: 200 });
    this.mostrarPaginaLivro();
  }

  tocarFigura() {
    if (this.acabou) return;
    const [nome] = this.paginas[this.pagina];
    tocarSom(this, 'clique');
    this.tweens.add({ targets: this.figura, scale: 4.5, duration: 90, yoyo: true });
    // o bebê "fala" a primeira sílaba, do jeito de bebê
    const silaba = nome.toLowerCase().match(/^[^aeiouáéíóúãõâêô]*[aeiouáéíóúãõâêô]/);
    const fala = (silaba ? silaba[0] : nome.slice(0, 2).toLowerCase());
    this.textoNoAr(this.bebeX + 32, this.bebeY - 6, fala + '-' + fala + '!', '#ffd860', 9);
    this.rir(0.6, 1);
    const s = Estado.carregar();
    if (s) {
      s.atividades = s.atividades || {};
      s.atividades.palavras = s.atividades.palavras || {};
      s.atividades.palavras[nome] = (s.atividades.palavras[nome] || 0) + 1;
      Estado.salvar();
    }
  }

  terminarLivro() {
    this.lidas.add(this.paginas.length - 1);
    this.mostrarPaginaLivro();
    this.fim(this.lidas.size === this.paginas.length ? 'Leu o livro todo!' : 'Fim da história!');
  }

  // =============================================================
  // TORRE DE BLOCOS
  // =============================================================
  iniciar_blocos() {
    const B = CONFIG.ATIVIDADES.BLOCOS;
    this.chao = 262;
    this.add.rectangle(6, this.chao, 168, 3, 0x7a4a2a).setOrigin(0, 0);
    this.criarBebe(112, this.chao - 64, 2);
    this.torre = [];
    this.vel = B.VELOCIDADE;
    this.dir = 1;
    this.placar.setText('Toque para soltar o bloco');
    this.novoBloco();
    this.toque = this.add.zone(0, 34, CONFIG.LARGURA, CONFIG.ALTURA - 34).setOrigin(0, 0).setInteractive().setDepth(5);
    this.toque.on('pointerdown', () => this.soltarBloco());
    this.passo = (dt) => {
      const b = this.blocoAtual;
      if (!b || b.caindo) return;
      b.px += this.vel * this.dir * dt;
      if (b.px > 96) { b.px = 96; this.dir = -1; }
      if (b.px < 28) { b.px = 28; this.dir = 1; }
      b.x = Math.round(b.px);
    };
  }

  topoDaTorre() {
    return this.chao - this.torre.length * 28;
  }

  novoBloco() {
    // o bloco anda lá no alto, de um lado para o outro (y = base do bloco)
    const b = this.add.image(28, 62, 'bloco_brinquedo', this.torre.length % 3).setScale(2).setOrigin(0.5, 1).setDepth(20);
    b.px = 28 + Math.random() * 60;
    b.caindo = false;
    this.blocoAtual = b;
  }

  soltarBloco() {
    const b = this.blocoAtual;
    if (!b || b.caindo || this.acabou) return;
    const B = CONFIG.ATIVIDADES.BLOCOS;
    b.caindo = true;
    const destino = this.topoDaTorre();
    this.tweens.add({
      targets: b, y: destino, duration: 120 + (destino - b.y) * 1.2, ease: 'Quad.easeIn',
      onComplete: () => {
        const baixo = this.torre[this.torre.length - 1];
        const sobra = baixo ? 1 - Math.abs(b.x - baixo.x) / 28 : 1;
        if (sobra < B.SOBRA_MINIMA) { this.cairTorre(b, b.x > baixo.x ? 1 : -1); return; }
        this.torre.push(b);
        tocarSom(this, 'toc');
        this.pontos = this.torre.length;
        this.diversao = this.pontos * B.DIVERSAO_POR_BLOCO;
        this.vinculo = B.VINCULO;
        this.placar.setText('Blocos: ' + this.pontos);
        if (this.pontos % 3 === 0) this.rir(0.5, 1);
        if (this.torre.length >= B.MAXIMO) { this.bebeDerruba(); return; }
        this.vel += B.ACELERA;
        this.novoBloco();
      }
    });
  }

  // O bloco ficou torto demais: cai, e a torre vai junto
  cairTorre(b, lado) {
    this.blocoAtual = null;
    this.tweens.add({ targets: b, x: b.x + lado * 30, y: this.chao + 10, angle: lado * 120, alpha: 0, duration: 450 });
    this.desmoronar(lado);
    this.time.delayedCall(700, () => this.fim(this.pontos > 0 ? 'Caiu! Torre de ' + this.pontos + (this.pontos === 1 ? ' bloco.' : ' blocos.') + '\nO bebê adorou!' : 'Caiu!'));
  }

  // Torre completa: o bebê vai lá e derruba tudo, rindo
  bebeDerruba() {
    const B = CONFIG.ATIVIDADES.BLOCOS;
    this.blocoAtual = null;
    this.diversao += B.DIVERSAO_DERRUBAR;
    const camadas = Object.values(this.bebe.camadas);
    this.tweens.add({
      targets: camadas, x: '-=14', duration: 250, yoyo: true, ease: 'Sine.easeOut',
      onYoyo: () => this.desmoronar(-1)
    });
    this.time.delayedCall(1000, () => this.fim('Torre de ' + this.pontos + ' blocos!\nE o bebê derrubou tudo!'));
  }

  desmoronar(lado) {
    tocarSom(this, 'tombo');
    this.torre.forEach((t, i) => {
      this.tweens.add({
        targets: t, x: t.x + lado * Phaser.Math.Between(10, 40) - (lado > 0 ? 0 : 10), y: this.chao,
        angle: Phaser.Math.Between(-90, 90), duration: 380 + i * 40, delay: (this.torre.length - i) * 30, ease: 'Quad.easeIn'
      });
    });
    this.rir(1, 3);
  }
}

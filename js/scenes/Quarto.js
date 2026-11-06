// =============================================================
// Quarto.js — o quarto com o berço e o bebê (Etapa 5).
//
// Camadas (de trás para frente):
//   céu da janela → quarto (menina ou menino) → berço (trás) → bebê
//   → berço (frente) → escuro da noite → coração → botões
// O vidro da janela é transparente no desenho do quarto: o céu que
// aparece ali é desenhado pelo jogo (dia: céu claro e nuvens passando;
// noite: céu escuro, estrelas piscando e lua).
//
// O bebê: respira (sobe 1 px e desce), pisca de vez em quando e,
// ao ser tocado, dá um pulinho e solta um coração.
// Abajur (criado-mudo à direita): tocar acende e apaga. É só luz, sem ligação com o sono.
// Etapa 6: tudo segue a hora DO JOGO (js/tempo.js): relógio, dia/noite,
// e a caixinha do canto com o nome e a idade. Quem volta depois de um
// tempo fora vê quanto tempo passou.
// Necessidades (fome, sede, sono...) entram a partir da Etapa 8.
// =============================================================

class Quarto extends Phaser.Scene {
  constructor() {
    super('Quarto');
  }

  // dados.chegou = true quando vem direto da cegonha (mostra boas-vindas)
  init(dados) {
    this.chegou = !!(dados && dados.chegou);
  }

  create() {
    prepararCamera(this);
    const Q = CONFIG.QUARTO;

    const save = Estado.carregar();
    if (!save || !save.bebe) { this.scene.start('Menu'); return; } // segurança
    this.bebe = save.bebe;

    // ---------- Janela: o mundo lá fora (fica ATRÁS do quarto) ----------
    this.criarJanela();

    // ---------- Quarto e berço ----------
    this.add.image(0, 0, this.bebe.sexo === 'F' ? 'quarto_menina' : 'quarto_menino').setOrigin(0, 0);

    // ---------- Brinquedos do chão (tocáveis) ----------
    this.criarBrinquedos();

    // ---------- Relógio da parede (ponteiros andam com a hora do jogo) ----------
    this.ponteiros = this.add.graphics();
    this.ultimoMinuto = -1;
    this.desenharRelogio();
    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_tras').setOrigin(0, 0);

    // ---------- Bebê (camadas do autor) ----------
    this.visual = criarBebeVisual(this, Q.BEBE_X, Q.BEBE_Y, 1).mostrar(this.bebe);
    // Área de toque do bebê (um pouco maior que ele, fácil de acertar com o dedo)
    const toque = this.add.zone(Q.BEBE_X - 2, Q.BEBE_Y - 2, 36, 36).setOrigin(0, 0).setInteractive();
    toque.on('pointerup', () => this.tocarBebe());

    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_frente').setOrigin(0, 0);

    // Mamadeira na boca do bebê (aparece enquanto mama; atrás do escuro da noite)
    const N = CONFIG.NECESSIDADES;
    this.mamadeira = this.add.image(N.MAMADEIRA_BOCA_X, N.MAMADEIRA_BOCA_Y, 'mamadeira_bebe').setOrigin(0, 0).setVisible(false);

    // ---------- Escuro da noite (por cima do quarto, abaixo dos botões) ----------
    this.escuro = this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x0b0d2a, 1)
      .setOrigin(0, 0).setAlpha(0);

    // ---------- Abajur: acende e apaga (só luz, sem ligação com o sono) ----------
    this.criarAbajur(save);

    // ---------- Necessidades (Etapas 8 e 8.1): botão do coração, mamadeira e balão ----------
    this.criarNecessidades();

    // ---------- Topo: botão de voltar ao menu ----------
    criarBotaoImg(this, 4, 4, 'botao_menu', () => irPara(this, 'Menu'));   // botão do autor (34×14)

    // Versão no rodapé (à esquerda: no canto direito fica o botão de necessidades)
    escrever(this, 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(0, 1).setAlpha(0.6);

    // ---------- Topo direito: nome e idade do bebê ----------
    this.criarInfo();

    // ---------- Dia ou noite (hora do jogo) ----------
    this.noite = this.ehNoite();
    this.aplicarPeriodo(this.noite, 0);
    // Confere a hora do jogo sempre (1 hora do jogo dura ~35 s reais)
    this.time.addEvent({
      delay: Q.TROCA_HORA_SEGUNDOS * 1000, loop: true,
      callback: () => this.conferirHora()
    });

    // TESTE: tocar no relógio da parede adianta 1 hora do jogo
    if (CONFIG.TEMPO.TESTE_TOQUE_RELOGIO) {
      const R = CONFIG.RELOGIO;
      this.add.zone(R.CENTRO_X - 8, R.CENTRO_Y - 8, 17, 17).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => {
          if (this.painelAberto) return;
          TEMPO.adiantar(60);
          NEC.adiantar(CONFIG.NECESSIDADES.TESTE_MINUTOS_RELOGIO);   // e as barras caem 30 min reais
          this.ultimoMinuto = -1;
          this.desenharRelogio();
          this.conferirHora();
        });
    }

    // ---------- Avisos ao entrar ----------
    if (!this.bebe.nome) this.pedirNome();          // save antigo, de antes do nome: pergunta agora
    else if (this.chegou) this.boasVindas();
    else if (VISITA.valeAvisar(VISITA.foraAoAbrir)) this.avisarVolta(VISITA.foraAoAbrir);
    VISITA.foraAoAbrir = 0;                         // o aviso de "ficou fora" aparece uma vez só

    // Voltou para o jogo sem recarregar (trocou de app e voltou)
    const aoVoltar = (ms) => { if (VISITA.valeAvisar(ms)) { this.conferirHora(); this.avisarVolta(ms); } };
    jogo.events.on('voltou', aoVoltar);
    this.events.once('shutdown', () => jogo.events.off('voltou', aoVoltar));

    // ---------- Vida do bebê ----------
    this.tempo = 0;
    this.pulo = 0;        // altura atual do pulinho (pixels)
    this.agendarPiscada();
  }

  // ---------- Janela ----------
  criarJanela() {
    const J = CONFIG.JANELA;
    const cor = (hex) => Phaser.Display.Color.HexStringToColor(hex).color;
    const faixas = (alto, baixo) => [
      this.add.rectangle(J.X, J.Y, J.LARGURA, J.FAIXA_ALTURA, cor(alto)).setOrigin(0, 0),
      this.add.rectangle(J.X, J.Y + J.FAIXA_ALTURA, J.LARGURA, J.ALTURA - J.FAIXA_ALTURA, cor(baixo)).setOrigin(0, 0)
    ];

    // Dia: céu claro + nuvens passando
    this.dia = this.add.container(0, 0, faixas(J.CEU_DIA_ALTO, J.CEU_DIA_BAIXO));
    this.nuvens = [];
    for (let i = 0; i < J.NUVENS; i++) {
      const n = this.add.image(0, 0, i % 2 ? 'nuvem_janela2' : 'nuvem_janela1').setOrigin(0, 0);
      this.sortearNuvem(n, true);
      this.dia.add(n);
      this.nuvens.push(n);
    }

    // Noite: céu escuro + estrelas piscando + lua
    this.noiteCeu = this.add.container(0, 0, faixas(J.CEU_NOITE_ALTO, J.CEU_NOITE_BAIXO));
    for (let i = 0; i < J.ESTRELAS; i++) {
      const e = this.add.rectangle(
        Phaser.Math.Between(J.X + 1, J.X + J.LARGURA - 2),
        Phaser.Math.Between(J.Y + 1, J.Y + J.ALTURA - 3), 1, 1, 0xfff6d0).setOrigin(0, 0);
      this.noiteCeu.add(e);
      this.tweens.add({
        targets: e, alpha: 0.25, yoyo: true, repeat: -1,
        duration: Phaser.Math.Between(700, 1800), delay: Phaser.Math.Between(0, 1500)
      });
    }
    this.noiteCeu.add(this.add.image(J.LUA_X, J.LUA_Y, 'lua').setOrigin(0, 0));

    // Passarinho (de dia): atravessa a janela de vez em quando, por cima das nuvens
    this.passaro = this.add.sprite(0, 0, 'passaro').setOrigin(0, 0).play('passaro_voando').setVisible(false);
    this.dia.add(this.passaro);
    // Estrela cadente (à noite): risca o céu da janela de vez em quando
    this.cadente = this.add.image(0, 0, 'estrela_cadente').setOrigin(0, 1).setVisible(false);
    this.noiteCeu.add(this.cadente);
    this.agendarPassaro();
    this.agendarCadente();
  }

  agendarPassaro() {
    const J = CONFIG.JANELA;
    this.time.delayedCall(Phaser.Math.FloatBetween(J.PASSARO_INTERVALO_MIN, J.PASSARO_INTERVALO_MAX) * 1000, () => {
      const p = this.passaro;
      p.posX = J.X - 9;                                            // começa escondido atrás da parede
      p.y = Phaser.Math.Between(J.Y + 3, J.Y + J.ALTURA - 14);
      p.x = p.posX;
      p.setVisible(true);
      p.voando = true;
    });
  }

  agendarCadente() {
    const J = CONFIG.JANELA;
    this.time.delayedCall(Phaser.Math.FloatBetween(J.ESTRELA_INTERVALO_MIN, J.ESTRELA_INTERVALO_MAX) * 1000, () => {
      const e = this.cadente;
      // Nasce na parte de cima da janela, à direita, e cai para baixo e para a esquerda
      e.posX = Phaser.Math.Between(J.X + 18, J.X + J.LARGURA);
      e.posY = Phaser.Math.Between(J.Y - 2, J.Y + 12);
      e.vida = 0;
      e.setPosition(e.posX, e.posY).setAlpha(1).setVisible(true);
      e.caindo = true;
    });
  }

  // Coloca uma nuvem num ponto de partida (à esquerda da janela) com velocidade sorteada.
  // espalhar = true na primeira vez: já começa em qualquer ponto da janela.
  sortearNuvem(n, espalhar) {
    const J = CONFIG.JANELA;
    n.posX = espalhar
      ? Phaser.Math.Between(J.X - n.width, J.X + J.LARGURA)
      : J.X - n.width - Phaser.Math.Between(0, 20);
    n.y = Phaser.Math.Between(J.Y + 2, J.Y + J.ALTURA - n.height - 6);
    n.vel = Phaser.Math.FloatBetween(J.NUVEM_VELOCIDADE_MIN, J.NUVEM_VELOCIDADE_MAX);
    n.x = Math.round(n.posX);
  }

  ehNoite() {
    return TEMPO.ehNoite();   // hora do jogo (js/tempo.js)
  }

  // Virou dia ou noite? A idade mudou? (chamado a cada TROCA_HORA_SEGUNDOS)
  conferirHora() {
    if (this.ehNoite() !== this.noite) this.aplicarPeriodo(!this.noite);
    this.atualizarInfo();
    this.atualizarNecessidades();
  }

  // ---------- Nome e idade (canto superior direito) ----------
  criarInfo() {
    const Q = CONFIG.QUARTO, U = CONFIG.UI;
    this.infoCaixa = this.add.rectangle(0, Q.INFO_Y, 10, 10, 0x2a1838, 0.85).setOrigin(0, 0)
      .setStrokeStyle(1, U.CAIXA_ESCOLHIDA);
    this.infoNome = escrever(this, Q.INFO_X - 4, Q.INFO_Y + 2, '', {
      fontFamily: 'monospace', fontSize: '8px', color: U.TEXTO
    }).setOrigin(1, 0);
    this.infoIdade = escrever(this, Q.INFO_X - 4, Q.INFO_Y + 12, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#ffffff'
    }).setOrigin(1, 0);
    this.infoHora = escrever(this, Q.INFO_X - 4, Q.INFO_Y + 21, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#b07ad6'
    }).setOrigin(1, 0);
    this.infoHumor = escrever(this, Q.INFO_X - 4, Q.INFO_Y + 30, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#ffffff'
    }).setOrigin(1, 0);
    this.textoInfo = null;
    this.atualizarInfo();
  }

  atualizarInfo() {
    if (!this.infoNome) return;        // a caixinha ainda não foi criada
    const Q = CONFIG.QUARTO;
    const t = TEMPO.agora();
    const idade = TEMPO.textoIdade(this.bebe.sexo);
    const nome = this.bebe.nome || '';
    const hora = 'Dia ' + t.dia + ' · ' + t.hora + 'h';
    const humor = NEC.humor();
    const chave = nome + '|' + idade + '|' + hora + '|' + humor;
    if (chave === this.textoInfo) return;
    this.textoInfo = chave;
    this.infoNome.setText(nome);
    this.infoIdade.setText(idade);
    this.infoHora.setText(hora);
    const H = { feliz: ['Feliz', '#8ee06a'], entediado: ['Entediad' + (this.bebe.sexo === 'F' ? 'a' : 'o'), '#ffd860'],
      triste: ['Triste', '#ff7a7a'] }[humor];
    this.infoHumor.setText(H[0]).setColor(H[1]);
    const larg = Math.ceil(Math.max(this.infoNome.width, this.infoIdade.width, this.infoHora.width, this.infoHumor.width)) + 8;
    this.infoCaixa.setPosition(Q.INFO_X - larg, Q.INFO_Y).setSize(larg, 40);
  }

  // Aviso de quem volta depois de um tempo fora
  avisarVolta(ms) {
    const save = Estado.dados || Estado.carregar();
    const mamae = save && save.perfil && save.perfil.papel === 'mamae';
    const T = CONFIG.TEMPO;
    const horas = ms / 3600000;
    let texto = (mamae ? 'Bem-vinda de volta!' : 'Bem-vindo de volta!') + '\n' +
      'Fora por ' + TEMPO.textoReal(ms) + '\n' +
      'No jogo: ' + TEMPO.textoJogo(ms / TEMPO.msPorMinuto());
    // Perto do limite do abandono (ou além dele): avisa
    if (horas >= T.ABANDONO_HORAS) texto += '\n' + (this.bebe.sexo === 'F' ? 'Ela' : 'Ele') + ' sentiu sua falta!';
    else if (horas >= T.ABANDONO_ALERTA_HORAS) texto += '\nNão demore: 1 dia fora\né o limite!';
    mostrarAvisoCaixa(this, texto, CONFIG.QUARTO.AVISO_Y, horas >= T.ABANDONO_ALERTA_HORAS ? 5 : 4);
  }

  // ---------- Relógio ----------
  // Desenha os dois ponteiros pixel a pixel, saindo do centro do mostrador.
  // Só redesenha quando o minuto muda.
  desenharRelogio() {
    const R = CONFIG.RELOGIO;
    const t = TEMPO.agora();
    if (t.minuto === this.ultimoMinuto) return;
    this.ultimoMinuto = t.minuto;

    const g = this.ponteiros;
    g.clear();
    // Ângulos: 0 = para cima (12h), girando no sentido do relógio
    const angMin = (t.minuto / 60) * Math.PI * 2;
    const angHora = (((t.hora % 12) + t.minuto / 60) / 12) * Math.PI * 2;
    const linha = (ang, comp, cor) => {
      const x1 = R.CENTRO_X + Math.round(Math.sin(ang) * comp);
      const y1 = R.CENTRO_Y - Math.round(Math.cos(ang) * comp);
      // Linha de pixels (Bresenham) do centro até a ponta
      let x = R.CENTRO_X, y = R.CENTRO_Y;
      const dx = Math.abs(x1 - x), dy = -Math.abs(y1 - y);
      const sx = x < x1 ? 1 : -1, sy = y < y1 ? 1 : -1;
      let erro = dx + dy;
      g.fillStyle(cor, 1);
      while (true) {
        g.fillRect(x, y, 1, 1);
        if (x === x1 && y === y1) break;
        const e2 = 2 * erro;
        if (e2 >= dy) { erro += dy; x += sx; }
        if (e2 <= dx) { erro += dx; y += sy; }
      }
    };
    linha(angMin, R.MINUTO_COMPRIMENTO, R.COR_MINUTO);
    linha(angHora, R.HORA_COMPRIMENTO, R.COR_HORA);
    g.fillStyle(R.COR_CENTRO, 1);
    g.fillRect(R.CENTRO_X, R.CENTRO_Y, 1, 1);   // pino do centro
  }

  // ---------- Nome do bebê ----------
  boasVindas() {
    const menina = this.bebe.sexo === 'F';
    const texto = (menina ? 'Sua filha chegou!' : 'Seu filho chegou!') + '\n' +
      (menina ? 'Bem-vinda, ' : 'Bem-vindo, ') + this.bebe.nome + '!';
    mostrarAvisoCaixa(this, texto, CONFIG.QUARTO.AVISO_Y, 3);
  }

  // Para bebês que chegaram antes de existir o nome: pergunta uma vez.
  pedirNome() {
    const U = CONFIG.UI, B = CONFIG.BEBE;
    const menina = this.bebe.sexo === 'F';
    const fundo = this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x000000, 0.6)
      .setOrigin(0, 0).setDepth(100).setInteractive();      // bloqueia os toques de trás
    const painel = this.add.rectangle(20, 112, 140, 84, 0x2a1838, 0.95).setOrigin(0, 0)
      .setStrokeStyle(1, U.CAIXA_ESCOLHIDA).setDepth(101);
    const txt = escrever(this, 90, 122, menina ? 'Qual é o nome\nda sua filha?' : 'Qual é o nome\ndo seu filho?', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5, 0).setDepth(102);
    const pronto = () => nomeBonito(campo.input.value).length >= B.NOME_MIN;
    const campo = criarCampoTexto(this, 90, 156, B.NOME_MAX, 'nome', () => {});
    const confirmar = () => {
      if (!pronto()) return;
      const dados = Estado.carregar();
      dados.bebe.nome = nomeBonito(campo.input.value);
      Estado.salvar();
      this.bebe = dados.bebe;
      this.atualizarInfo();
      campo.destroy();
      [fundo, painel, txt, ok.caixa, ok.rotulo].forEach(o => o.destroy());
      this.boasVindas();
    };
    campo.input.addEventListener('keydown', e => { if (e.key === 'Enter') confirmar(); });
    const ok = criarOpcao(this, 55, 172, 70, 16, 'Pronto', confirmar, 8);
    ok.caixa.setDepth(102); ok.rotulo.setDepth(103);
  }

  // ---------- Brinquedos ----------
  // Cada brinquedo é um desenho separado por cima do quarto. Ao tocar, ele se mexe.
  criarBrinquedos() {
    const quarto = this.bebe.sexo === 'F' ? 'menina' : 'menino';
    this.brinquedos = CONFIG.BRINQUEDOS[quarto].map(b => {
      const img = this.add.image(b.x, b.y, 'brinquedo_' + quarto + '_' + b.nome).setOrigin(0, 0);
      const brinq = { img, x: b.x, y: b.y, acao: b.acao, dx: 0, dy: 0, ocupado: false };
      this.add.zone(b.x - 2, b.y - 2, img.width + 4, img.height + 4).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => this.mexerBrinquedo(brinq));
      return brinq;
    });
  }

  mexerBrinquedo(b) {
    if (b.ocupado || this.painelAberto) return;
    b.ocupado = true;
    NEC.mudar('diversao', CONFIG.NECESSIDADES.DIVERSAO_TOQUE_BRINQUEDO);   // o bebê acha graça
    this.atualizarNecessidades();
    const B = CONFIG.BRINQUEDOS;
    const posicionar = () => b.img.setPosition(b.x + Math.round(b.dx), b.y + Math.round(b.dy));
    const fim = () => { b.dx = 0; b.dy = 0; posicionar(); b.ocupado = false; };
    const comum = { targets: b, onUpdate: posicionar, onComplete: fim };
    if (b.acao === 'pulo') {
      this.tweens.add({ ...comum, dy: -B.PULO_PIXELS, duration: 140, yoyo: true, ease: 'Sine.easeOut' });
    } else if (b.acao === 'pulinhos') {
      this.tweens.add({ ...comum, dy: -B.PULO_PIXELS + 1, duration: 110, yoyo: true, repeat: 1, ease: 'Sine.easeOut' });
    } else if (b.acao === 'balanca') {
      b.dx = -B.BALANCA_PIXELS;
      this.tweens.add({ ...comum, dx: B.BALANCA_PIXELS, duration: 70, yoyo: true, repeat: 2 });
    } else if (b.acao === 'anda') {
      this.tweens.add({ ...comum, dx: B.ANDA_PIXELS, duration: 550, yoyo: true, hold: 200, ease: 'Sine.easeInOut' });
    }
  }

  // ---------- Abajur ----------
  // Por cima do escuro da noite: a cúpula acesa e o brilho em volta.
  criarAbajur(save) {
    const Q = CONFIG.QUARTO;
    const menina = this.bebe.sexo === 'F';
    this.cupula = this.add.image(Q.ABAJUR_CUPULA_X, Q.ABAJUR_CUPULA_Y, menina ? 'abajur_aceso_menina' : 'abajur_aceso_menino')
      .setOrigin(0, 0).setAlpha(0);
    this.luz = this.add.image(Q.LUZ_CENTRO_X, Q.LUZ_CENTRO_Y, 'luz_abajur')
      .setTint(Phaser.Display.Color.HexStringToColor(Q.LUZ_COR).color).setAlpha(0);
    this.abajurAceso = !!save.abajurAceso;   // lembra se estava aceso
    this.add.zone(Q.ABAJUR_X, Q.ABAJUR_Y, Q.ABAJUR_LARGURA, Q.ABAJUR_ALTURA).setOrigin(0, 0).setInteractive()
      .on('pointerup', () => this.trocarAbajur());
  }

  trocarAbajur() {
    if (this.painelAberto) return;
    this.abajurAceso = !this.abajurAceso;
    const dados = Estado.carregar();
    if (dados) { dados.abajurAceso = this.abajurAceso; Estado.salvar(); }
    this.aplicarPeriodo(this.noite, CONFIG.QUARTO.LUZ_TROCA_SEGUNDOS);
  }

  // Passa para dia ou noite (segundos = duração da passagem; 0 = na hora).
  // Também acerta a luz do abajur, que depende de ser dia ou noite.
  aplicarPeriodo(noite, segundos = CONFIG.JANELA.TROCA_SEGUNDOS) {
    this.noite = noite;
    const J = CONFIG.JANELA, Q = CONFIG.QUARTO;
    const aceso = this.abajurAceso;
    const alvo = [
      [this.dia, noite ? 0 : 1],
      [this.noiteCeu, noite ? 1 : 0],
      [this.escuro, noite ? (aceso ? Q.NOITE_ESCURECER_ABAJUR : J.NOITE_ESCURECER) : 0],
      [this.cupula, aceso ? 1 : 0],
      [this.luz, aceso ? (noite ? Q.LUZ_FORCA_NOITE : Q.LUZ_FORCA_DIA) : 0]
    ];
    for (const [obj, a] of alvo) {
      this.tweens.killTweensOf(obj);
      if (segundos === 0) obj.setAlpha(a);
      else this.tweens.add({ targets: obj, alpha: a, duration: segundos * 1000 });
    }
  }

  update(time, delta) {
    if (!this.visual) return;     // a cena saiu antes de montar (sem save)
    const Q = CONFIG.QUARTO;
    const seg = delta / 1000;
    this.tempo += seg;
    this.desenharRelogio();

    // Nuvens atravessam a janela devagar (fora do vidro ficam escondidas atrás da parede)
    const J = CONFIG.JANELA;
    for (const n of this.nuvens) {
      n.posX += n.vel * seg;
      if (n.posX > J.X + J.LARGURA) this.sortearNuvem(n, false);
      n.x = Math.round(n.posX);
    }
    // Passarinho atravessando a janela
    const p = this.passaro;
    if (p.voando) {
      p.posX += J.PASSARO_VELOCIDADE * seg;
      p.x = Math.round(p.posX);
      if (p.x > J.X + J.LARGURA) { p.voando = false; p.setVisible(false); this.agendarPassaro(); }
    }
    // Estrela cadente: anda na diagonal (2 para o lado, 1 para baixo) e apaga
    const e = this.cadente;
    if (e.caindo) {
      e.vida += seg;
      e.posX -= J.ESTRELA_VELOCIDADE * seg;
      e.posY += J.ESTRELA_VELOCIDADE * seg / 2;
      e.setPosition(Math.round(e.posX), Math.round(e.posY));
      e.setAlpha(Math.max(0, 1 - e.vida / 0.7));
      if (e.vida > 0.7) { e.caindo = false; e.setVisible(false); this.agendarCadente(); }
    }

    // Respirar: metade do tempo 1 px para cima, metade no lugar
    const respira = (this.tempo % Q.RESPIRAR_SEGUNDOS) < Q.RESPIRAR_SEGUNDOS / 2 ? 0 : -1;
    this.visual.setPosition(Q.BEBE_X, Q.BEBE_Y + respira - Math.round(this.pulo));
    if (this.botaoNec) {
      const N = CONFIG.NECESSIDADES;
      const sobe = this.pulsando && Math.floor(this.tempo / N.PULSO_SEGUNDOS) % 2 === 1 ? N.PULSO_PIXELS : 0;
      this.botaoNec.y = N.BOTAO.Y - sobe;
    }
    if (this.mamadeira.visible) {
      const N = CONFIG.NECESSIDADES;
      this.mamadeira.setPosition(N.MAMADEIRA_BOCA_X, N.MAMADEIRA_BOCA_Y + respira);
    }
  }

  agendarPiscada() {
    const Q = CONFIG.QUARTO;
    const espera = Phaser.Math.FloatBetween(Q.PISCAR_MIN, Q.PISCAR_MAX) * 1000;
    this.time.delayedCall(espera, () => {
      if (this.olhosDoToque) { this.agendarPiscada(); return; } // já está de olhos fechados pelo toque
      this.visual.piscar(true);
      this.time.delayedCall(Q.PISCAR_DURACAO * 1000, () => {
        if (!this.olhosDoToque) this.visual.piscar(false);
        this.agendarPiscada();
      });
    });
  }

  // Toque no bebê: fecha os olhos (sorrindo), dá um pulinho e solta um coração
  tocarBebe() {
    const Q = CONFIG.QUARTO;
    if (this.pulando || this.mamando || this.painelAberto) return;
    this.pulando = true;
    NEC.mudar('diversao', CONFIG.NECESSIDADES.DIVERSAO_TOQUE_BEBE);
    this.atualizarNecessidades();
    this.olhosDoToque = true;
    this.visual.piscar(true, true);     // olhos fechados sorrindo (^ ^)
    this.time.delayedCall(Q.OLHOS_FECHADOS_TOQUE * 1000, () => {
      this.olhosDoToque = false;
      this.visual.piscar(false);
    });
    this.tweens.add({
      targets: this, pulo: Q.PULINHO_PIXELS, duration: 120, yoyo: true, ease: 'Sine.easeOut',
      onComplete: () => { this.pulo = 0; this.pulando = false; }
    });
    const c = this.add.image(Q.BEBE_X + 16, Q.BEBE_Y - 2, 'coracao').setOrigin(0.5, 1);
    c.posY = c.y;
    this.tweens.add({
      targets: c, posY: c.y - 18, alpha: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: () => { c.y = Math.round(c.posY); },
      onComplete: () => c.destroy()
    });
  }

  // ---------- Necessidades (Etapas 8 e 8.1) ----------
  // No quarto: botão do coração (canto inferior direito), botão da mamadeira na parede
  // e o balão de pedido. Tocar no coração abre o painel com as 5 barras.
  criarNecessidades() {
    const N = CONFIG.NECESSIDADES, U = CONFIG.UI;

    // Botão de necessidades: coração com a cor da barra ativa mais baixa e 5 pontinhos
    const B = N.BOTAO;
    this.coracaoNec = this.add.image(8, 6, 'coracao_necessidades').setOrigin(0, 0);
    this.pontosNec = NEC.LISTA.map((k, i) => this.add.rectangle(4 + i * 4, 19, 2, 2, N.COR_BOA).setOrigin(0, 0));
    this.botaoNec = this.add.container(B.X, B.Y, [
      this.add.image(0, 0, 'botao_necessidades').setOrigin(0, 0), this.coracaoNec, ...this.pontosNec
    ]);
    // A área de toque fica parada (o botão pulsa, o toque não muda de lugar)
    this.add.zone(B.X - 2, B.Y - 2, 30, 30).setOrigin(0, 0).setInteractive()
      .on('pointerdown', () => this.botaoNec.list[0].setTint(0xc8a8e8))
      .on('pointerout', () => this.botaoNec.list[0].clearTint())
      .on('pointerup', () => { this.botaoNec.list[0].clearTint(); this.abrirPainel(); });

    // Botão da mamadeira (0 a 1 ano): a mamadeira cheia do desenho do autor dentro de uma caixa roxa
    const bx = N.BOTAO_MAMADEIRA_X, by = N.BOTAO_MAMADEIRA_Y;
    const caixa = this.add.rectangle(bx, by, 22, 38, 0x2a1838, 0.85).setOrigin(0, 0).setStrokeStyle(1, U.CAIXA_ESCOLHIDA);
    this.add.image(bx + 3, by + 3, 'mamadeira', 17).setOrigin(0, 0);
    this.add.zone(bx - 2, by - 2, 26, 42).setOrigin(0, 0).setInteractive()
      .on('pointerdown', () => caixa.setFillStyle(0x5e3487, 0.95))
      .on('pointerout', () => caixa.setFillStyle(0x2a1838, 0.85))
      .on('pointerup', () => { caixa.setFillStyle(0x2a1838, 0.85); this.darMamadeira(); });

    // Balão de pedido (ícone 16×16 do que ele quer)
    this.balao = this.add.container(N.BALAO_X, N.BALAO_Y, [
      this.add.image(0, 0, 'balao').setOrigin(0, 0),
      this.add.image(3, 2, 'icones_necessidades16', 0).setOrigin(0, 0)
    ]).setVisible(false);
    this.tweens.add({ targets: this.balao, y: N.BALAO_Y - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.atualizarNecessidades();
  }

  // Cor de uma barra: verde > 50, amarelo 25–50, vermelho < 25 (cinza se parada)
  corDaBarra(k, v) {
    const N = CONFIG.NECESSIDADES;
    if (N.QUEDA_POR_HORA[k] === 0) return N.COR_PARADA;
    return v > 50 ? N.COR_BOA : v >= 25 ? N.COR_MEDIA : N.COR_RUIM;
  }

  // Atualiza o botão, o balão, o humor e o painel aberto (a cada segundo e após cada cuidado)
  atualizarNecessidades() {
    const N = CONFIG.NECESSIDADES;
    const n = NEC.atuais();
    if (!n || !this.botaoNec) return;
    // Coração: cor da barra ATIVA mais baixa
    const ativas = NEC.ativas();
    const pior = ativas.reduce((a, k) => (a === null || n[k] < n[a] ? k : a), null);
    this.coracaoNec.setTint(pior ? this.corDaBarra(pior, n[pior]) : N.COR_BOA);
    NEC.LISTA.forEach((k, i) => this.pontosNec[i].setFillStyle(this.corDaBarra(k, n[k])));
    this.pulsando = ativas.some(k => n[k] < 25);

    const pedido = this.mamando ? null : NEC.pedido(n);
    this.balao.setVisible(!!pedido);
    if (pedido) this.balao.list[1].setFrame(NEC.LISTA.indexOf(pedido));
    this.atualizarInfo();
    if (this.painelAberto) this.atualizarPainel();
  }

  // ---------- Painel de necessidades (Etapa 8.1) ----------
  abrirPainel() {
    if (this.painelAberto || this.mamando) return;
    const N = CONFIG.NECESSIDADES, P = N.PAINEL;
    this.painelAberto = true;
    this.linhaSel = null;
    tocarSom(this, 'abrir');

    // Quarto escurece; tocar fora do painel fecha
    this.painelFundo = this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x000000, N.PAINEL_ESCURO)
      .setOrigin(0, 0).setDepth(90).setInteractive().setAlpha(0);
    this.painelFundo.on('pointerup', () => this.fecharPainel());
    this.tweens.add({ targets: this.painelFundo, alpha: 1, duration: N.PAINEL_SUBIR_MS });

    const fonte = (tam, cor) => ({ fontFamily: 'monospace', fontSize: tam + 'px', color: cor });
    const itens = [];
    const fundo = this.add.image(0, 0, 'painel_necessidades').setOrigin(0, 0).setInteractive();  // segura os toques
    itens.push(fundo);
    itens.push(escrever(this, P.LARGURA / 2, 4, 'NECESSIDADES', fonte(9, '#ffd860')).setOrigin(0.5, 0));
    const fechar = this.add.image(P.LARGURA - 15, 3, 'botao_fechar').setOrigin(0, 0);
    itens.push(fechar);
    itens.push(this.add.zone(P.LARGURA - 20, 0, 20, 18).setOrigin(0, 0).setInteractive()
      .on('pointerup', () => this.fecharPainel()));

    this.linhas = {};
    NEC.LISTA.forEach((k, i) => {
      const x = 4, y = N.LINHA_Y0 + i * N.LINHA_ESPACO;
      const L = {};
      L.fundo = this.add.image(x, y, 'linha_necessidade').setOrigin(0, 0);
      L.toque = this.add.zone(x, y, 156, 32).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => this.escolherLinha(k));
      const moldura = this.add.image(x + 5, y + 5, 'moldura_icone').setOrigin(0, 0);
      const icone = this.add.image(x + 8, y + 8, 'icones_necessidades16', i).setOrigin(0, 0);
      L.nome = escrever(this, x + 32, y + 4, N.NOMES[k], fonte(8, '#ffffff'));
      L.dica = escrever(this, x + 72, y + 5, N.DICAS[k], fonte(7, '#ffd860')).setVisible(false);
      L.pct = escrever(this, x + 151, y + 4, '', fonte(8, '#ffffff')).setOrigin(1, 0);
      L.barraFundo = this.add.rectangle(x + 32, y + 18, 98, 7, 0x120a18).setOrigin(0, 0).setStrokeStyle(1, 0x6a4a88);
      L.barra = this.add.rectangle(x + 33, y + 19, 96, 5, N.COR_BOA).setOrigin(0, 0);
      // Divisões a cada 10%
      const marcas = [];
      for (let j = 1; j < 10; j++) {
        marcas.push(this.add.rectangle(x + 33 + Math.round(9.6 * j), y + 19, 1, 5, 0x000000, 0.35).setOrigin(0, 0));
      }
      L.alerta = escrever(this, x + 140, y + 14, '!', Object.assign(fonte(11, '#ff5050'), { fontStyle: 'bold' })).setVisible(false);
      this.tweens.add({ targets: L.alerta, alpha: 0.15, duration: 350, yoyo: true, repeat: -1 });
      this.linhas[k] = L;
      itens.push(L.fundo, L.toque, moldura, icone, L.nome, L.dica, L.pct, L.barraFundo, L.barra, ...marcas, L.alerta);
    });

    // O painel sobe de baixo
    this.painel = this.add.container(P.X, CONFIG.ALTURA, itens).setDepth(91);
    this.tweens.add({ targets: this.painel, y: P.Y, duration: N.PAINEL_SUBIR_MS, ease: 'Cubic.easeOut',
      onUpdate: () => { this.painel.y = Math.round(this.painel.y); } });
    this.atualizarPainel();
  }

  atualizarPainel() {
    const N = CONFIG.NECESSIDADES;
    const n = NEC.atuais();
    if (!n || !this.linhas) return;
    for (const k of NEC.LISTA) {
      const L = this.linhas[k], v = n[k];
      const parada = N.QUEDA_POR_HORA[k] === 0;
      if (parada) {
        L.barra.setSize(96, 5).setFillStyle(0x5a5a5a).setVisible(true);
        L.pct.setText('EM BREVE').setColor('#9a9a9a').setFontSize(7);
        L.alerta.setVisible(false);
      } else {
        const larg = Math.round(96 * v / 100);
        const cor = this.corDaBarra(k, v);
        L.barra.setSize(larg, 5).setFillStyle(cor).setVisible(larg > 0);
        L.pct.setText(Math.round(v) + '%').setColor('#' + cor.toString(16).padStart(6, '0'));
        L.alerta.setVisible(v < N.LIMITE_ALERTA);
      }
    }
  }

  // Tocar numa linha: destaca e mostra a dica do que fazer
  escolherLinha(k) {
    tocarSom(this, 'clique');
    this.linhaSel = this.linhaSel === k ? null : k;
    for (const j of NEC.LISTA) {
      const L = this.linhas[j], sel = j === this.linhaSel;
      L.fundo.setTexture(sel ? 'linha_necessidade_sel' : 'linha_necessidade');
      L.dica.setVisible(sel);
    }
  }

  fecharPainel() {
    if (!this.painelAberto || this.fechandoPainel) return;
    this.fechandoPainel = true;
    const N = CONFIG.NECESSIDADES;
    this.tweens.add({ targets: this.painelFundo, alpha: 0, duration: N.PAINEL_SUBIR_MS });
    this.tweens.add({
      targets: this.painel, y: CONFIG.ALTURA, duration: N.PAINEL_SUBIR_MS, ease: 'Cubic.easeIn',
      onComplete: () => {
        this.painel.destroy(); this.painelFundo.destroy();
        this.painel = this.painelFundo = this.linhas = null;
        this.painelAberto = false;
        this.fechandoPainel = false;
      }
    });
  }

  // Mamadeira: o bebê mama até encher a fome (a sede enche junto)
  darMamadeira() {
    const N = CONFIG.NECESSIDADES;
    if (this.mamando || this.pulando || this.painelAberto) return;
    const n = NEC.atualizar();
    if (!n) return;
    if (n.fome >= N.MAMADEIRA_RECUSA && n.sede >= N.MAMADEIRA_RECUSA) { this.falar('Não quero!'); return; }
    this.mamando = true;
    this.olhosDoToque = true;
    this.visual.piscar(true, true);       // olhos fechados, contente
    this.mamadeira.setVisible(true);
    this.balao.setVisible(false);
    const passo = 0.25;                   // segundos
    this.mamarEvento = this.time.addEvent({
      delay: passo * 1000, loop: true,
      callback: () => {
        NEC.mudar('fome', N.MAMADEIRA_POR_SEG * passo);
        const m = NEC.mudar('sede', N.MAMADEIRA_POR_SEG * passo);
        this.atualizarNecessidades();
        if (m.fome >= 100 && m.sede >= 100) this.pararMamadeira();
        else if (m.fome >= 100 && m.sede >= N.MAMADEIRA_RECUSA) this.pararMamadeira();
      }
    });
  }

  pararMamadeira() {
    if (this.mamarEvento) this.mamarEvento.remove();
    this.mamarEvento = null;
    this.mamando = false;
    this.olhosDoToque = false;
    this.mamadeira.setVisible(false);
    this.visual.piscar(false);
    const Q = CONFIG.QUARTO;
    const c = this.add.image(Q.BEBE_X + 16, Q.BEBE_Y - 2, 'coracao').setOrigin(0.5, 1);
    c.posY = c.y;
    this.tweens.add({
      targets: c, posY: c.y - 18, alpha: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: () => { c.y = Math.round(c.posY); }, onComplete: () => c.destroy()
    });
    this.atualizarNecessidades();
  }

  // Um textinho que sobe em cima do bebê ("Não quero!")
  falar(texto) {
    const Q = CONFIG.QUARTO;
    const t = escrever(this, Q.BEBE_X + 16, Q.BEBE_Y - 4, texto, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', stroke: '#2a1838', strokeThickness: 3
    }).setOrigin(0.5, 1);
    t.posY = t.y;
    this.tweens.add({
      targets: t, posY: t.y - 12, alpha: { from: 1, to: 0 }, delay: 500, duration: 900,
      onUpdate: () => { t.y = Math.round(t.posY); }, onComplete: () => t.destroy()
    });
  }
}

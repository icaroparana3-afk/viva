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

  // v0.0.61: o Phaser reaproveita esta mesma cena toda vez que você volta ao quarto,
  // e o que ficou da visita anterior continuava guardado. Se você saía com o painel
  // aberto (ou mamando, com susto, festa, dodói...), na volta o quarto ficava meio
  // montado (sem MENU, sem álbum, sem relógio) e os brinquedos não respondiam.
  // Agora tudo isso é zerado ao abrir e ao sair do quarto.
  zerarEstado() {
    // Esquece todos os objetos da visita anterior (ver esquecerObjetos em botao.js)
    esquecerObjetos(this);
    this.textoInfo = null;
    this.painelAberto = false; this.fechandoPainel = false;
    this.painel = null; this.painelFundo = null; this.linhas = null; this.linhaSel = null;
    this.mamando = false; this.mamarEvento = null;
    this.pulando = false; this.pulo = 0;
    this.recusando = false; this.recusaDx = 0;
    this.susto = false; this.timerSusto = null;
    this.festaAgora = false; this.dodoi = false; this.brincando = false;
    this.olhosDoToque = false; this.pulsando = false;
    this.visita = null; this.avisoJanela = null;
  }

  create() {
    this.zerarEstado();
    this.events.once('shutdown', () => this.zerarEstado());
    prepararCamera(this);
    const Q = CONFIG.QUARTO;

    const save = Estado.carregar();
    if (!save || !save.bebe) { this.scene.start('Menu'); return; } // segurança
    this.bebe = save.bebe;

    // ---------- Janela: o mundo lá fora (fica ATRÁS do quarto) ----------
    this.criarJanela();
    JANELA_VIVA.criar(this);     // v0.0.58: sol, chuva, neve, folhas, raio e visitas (atrás do quarto)

    // ---------- Quarto e berço ----------
    this.add.image(0, 0, this.bebe.sexo === 'F' ? 'quarto_menina' : 'quarto_menino').setOrigin(0, 0);

    // ---------- Quadros e gato da parede (v0.0.50) ----------
    this.add.image(Q.QUADROS_X, Q.QUADROS_Y, 'quadros_parede').setOrigin(0, 0);
    this.gato = this.add.sprite(Q.GATO_X, Q.GATO_Y, 'gato', 0).setOrigin(0, 0);
    // v0.0.55: o gato mexe o rabo o tempo todo (animação do autor, todos os quadros em loop, sem toque)
    if (!this.anims.exists('gato_rabo_sempre')) {
      const total = this.textures.get('gato').frameTotal - 1;   // funciona com qualquer número de quadros
      this.anims.create({ key: 'gato_rabo_sempre', frames: this.anims.generateFrameNumbers('gato', { start: 0, end: total - 1 }), frameRate: Q.GATO_FPS, repeat: -1 });
    }
    this.gato.play('gato_rabo_sempre');
    // v0.0.56: tocar no gato faz ele se mexer como os brinquedos (de um lado para o outro)
    this.gatoBrinq = { img: this.gato, x: Q.GATO_X, y: Q.GATO_Y, acao: Q.GATO_ACAO, dx: 0, dy: 0, ocupado: false, diversao: Q.GATO_DIVERSAO };
    this.add.zone(Q.GATO_X - 3, Q.GATO_Y - 3, Q.GATO_LARGURA + 6, Q.GATO_ALTURA + 6).setOrigin(0, 0).setInteractive()
      .on('pointerup', () => this.mexerBrinquedo(this.gatoBrinq));

    // ---------- Brinquedos do chão (tocáveis) ----------
    this.criarBrinquedos();

    // ---------- Relógio da parede (ponteiros andam com a hora do jogo) ----------
    this.ponteiros = this.add.graphics();
    this.ultimoMinuto = -1;
    this.desenharRelogio();
    this.bercoTras = this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_tras').setOrigin(0, 0);

    // ---------- Bebê (camadas do autor) ----------
    this.visual = criarBebeVisual(this, Q.BEBE_X, Q.BEBE_Y, 1).mostrar(this.bebe);
    // Área de toque do bebê (um pouco maior que ele, fácil de acertar com o dedo)
    const toque = this.add.zone(Q.BEBE_X - 2, Q.BEBE_Y - 2, 36, 36).setOrigin(0, 0).setInteractive();
    toque.on('pointerup', () => this.tocarBebe());
    // Lágrimas que caem quando ele chora (Etapa 8.2)
    this.lagrimas = this.add.container(0, 0);
    this.sinalBebe = 'nada';        // faixa da pior barra (js/sinais.js)
    this.poseAtual = 'nada';        // o que o bebê está mostrando agora
    this.recusaDx = 0;
    this.timerLagrima = 0;
    this.timerChoro = 0;
    this.grupoBalao = [];

    this.add.image(Q.BERCO_X, Q.BERCO_Y, 'berco_frente').setOrigin(0, 0);

    // Eventos (v0.0.57): chocalho na mão, galo, curativo e estrelinhas do dodói (seguem o bebê)
    EVENTOS.criarCamadas(this);

    // Mamadeira na boca do bebê (aparece enquanto mama; atrás do escuro da noite)
    const N = CONFIG.NECESSIDADES;
    this.mamadeira = this.add.image(N.MAMADEIRA_BOCA_X, N.MAMADEIRA_BOCA_Y, 'mamadeira_bebe').setOrigin(0, 0).setVisible(false);

    // ---------- Escuro da noite (por cima do quarto, abaixo dos botões) ----------
    this.escuro = this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x0b0d2a, 1)
      .setOrigin(0, 0).setAlpha(0);

    // ---------- Abajur: acende e apaga (só luz, sem ligação com o sono) ----------
    this.criarAbajur(save);

    // v0.0.58: luz do sol, sombra dos dias fechados, clarão do raio e toque na janela
    JANELA_VIVA.criarLuz(this);

    // ---------- Necessidades (Etapas 8 e 8.1): botão do coração, mamadeira e balão ----------
    this.criarNecessidades();

    // Nuvem de pensamento da imaginação (depois do escuro: fica clara à noite, como o balão)
    EVENTOS.criarNuvem(this);

    // ---------- Topo: botão de voltar ao menu ----------
    criarBotaoImg(this, 4, 4, 'botao_menu', () => irPara(this, 'Menu'));   // botão do autor (34×14)
    // v0.0.58: álbum de momentos (botão 14×14 ao lado do MENU)
    criarBotaoImg(this, CONFIG.ALBUM.BOTAO_X, CONFIG.ALBUM.BOTAO_Y, 'botao_album', () => { if (!this.painelAberto) irPara(this, 'Album'); });

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
    else if (VISITA.valeAvisar(VISITA.foraAoAbrir)) { this.avisarVolta(VISITA.foraAoAbrir); EVENTOS.voltou(this, VISITA.foraAoAbrir); }
    MOMENTOS.registrar('chegada', { dia: 1, idade: this.bebe.sexo === 'F' ? 'recém-nascida' : 'recém-nascido', em: save.chegadaReal });
    VISITA.foraAoAbrir = 0;                         // o aviso de "ficou fora" aparece uma vez só

    // Voltou para o jogo sem recarregar (trocou de app e voltou)
    const aoVoltar = (ms) => { if (VISITA.valeAvisar(ms)) { this.conferirHora(); this.avisarVolta(ms); EVENTOS.voltou(this, ms); } };
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

  // v0.0.58: o passarinho virou uma das visitas da janela (frequência pela estação, js/janela.js)
  agendarPassaro() {
    JANELA_VIVA.agendarVisita(this);
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
    JANELA_VIVA.conferir(this);
    if (this.ev) EVENTOS.conferirFesta(this);   // v0.0.58: mesversário / aniversário
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
    // Carinha de humor (Etapa 8.2), fora da caixinha, logo abaixo dela; tocar mostra o nome por 2 s
    this.infoHumor = this.add.image(0, Q.HUMOR_Y, 'humor', 0).setOrigin(0, 0);
    this.humorToque = this.add.zone(0, Q.HUMOR_Y - 3, 18, 18).setOrigin(0, 0).setInteractive()
      .on('pointerup', () => this.mostrarNomeHumor());
    this.textoInfo = null;
    this.atualizarInfo();
    // TESTE (v0.0.58): tocar na caixinha do nome adianta 1 mês do jogo (para ver estações e festas)
    if (CONFIG.FESTA.TESTE_TOQUE_CAIXINHA) {
      this.add.zone(Q.INFO_X - 44, Q.INFO_Y, 44, Q.INFO_ALTURA).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => {
          if (this.painelAberto) return;
          TEMPO.adiantar(365 / 12 * 24 * 60);
          this.ultimoMinuto = -1;
          this.conferirHora();
        });
    }
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
    this.infoHumor.setFrame(CONFIG.SINAIS.HUMOR_QUADROS[humor] || 0);
    const larg = Math.ceil(Math.max(this.infoNome.width, this.infoIdade.width, this.infoHora.width, 12)) + 8;
    this.infoCaixa.setPosition(Q.INFO_X - larg, Q.INFO_Y).setSize(larg, Q.INFO_ALTURA);
    // A carinha acompanha a borda esquerda da caixinha (que muda de largura com o texto)
    const hx = Q.INFO_X - larg - Q.HUMOR_ESPACO - 12;
    this.infoHumor.setX(hx);
    this.humorToque.setX(hx - 3);
    this.humorX = hx;
  }

  // Tocar na carinha: mostra o nome do humor por alguns segundos
  mostrarNomeHumor() {
    if (this.painelAberto) return;
    const Q = CONFIG.QUARTO, S = CONFIG.SINAIS;
    const nomes = S.HUMOR_NOMES[NEC.humor()] || ['', ''];
    if (this.textoHumor) this.textoHumor.destroy();
    this.textoHumor = escrever(this, this.humorX + 6, Q.HUMOR_Y + 14, nomes[this.bebe.sexo === 'F' ? 1 : 0], {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', stroke: '#2a1838', strokeThickness: 3
    }).setOrigin(0.5, 0);   // centralizado embaixo da carinha
    const t = this.textoHumor;
    this.time.delayedCall(S.HUMOR_TEXTO_SEGUNDOS * 1000, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
      if (this.textoHumor === t) this.textoHumor = null;
    });
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
    this.input.dragDistanceThreshold = 4;   // mexer o dedo 4 px = arrastar (menos que isso = toque)
    const quarto = this.bebe.sexo === 'F' ? 'menina' : 'menino';
    this.brinquedos = CONFIG.BRINQUEDOS[quarto].map(b => {
      const img = this.add.image(b.x, b.y, 'brinquedo_' + quarto + '_' + b.nome).setOrigin(0, 0);
      const brinq = { img, x: b.x, y: b.y, acao: b.acao, dx: 0, dy: 0, ocupado: false };
      // v0.0.58: tocar mexe o brinquedo; ARRASTAR até o berço dá o brinquedo para o bebê
      const zona = this.add.zone(b.x - 2, b.y - 2, img.width + 4, img.height + 4).setOrigin(0, 0)
        .setInteractive({ draggable: true });
      zona.on('pointerdown', () => { brinq.arrastou = false; });
      zona.on('pointerup', () => { if (!brinq.arrastou) this.mexerBrinquedo(brinq); });
      zona.on('dragstart', () => {
        brinq.semArrastar = brinq.ocupado || this.painelAberto;
        if (brinq.semArrastar) return;
        brinq.arrastou = true;
        this.tweens.killTweensOf(brinq);
        this.children.bringToTop(img);
        EVENTOS.aprendeu(this, 'brinquedo');
      });
      zona.on('drag', (p) => {
        if (brinq.semArrastar) return;
        img.setPosition(Math.round(p.worldX - img.width / 2), Math.round(p.worldY - img.height / 2));
      });
      zona.on('dragend', (p) => {
        if (brinq.semArrastar) return;
        const S = CONFIG.EVENTOS.BRINQUEDO.SOLTAR;
        const noBerco = p.worldX >= S.X && p.worldX <= S.X + S.LARGURA && p.worldY >= S.Y && p.worldY <= S.Y + S.ALTURA;
        if (noBerco && EVENTOS.podeBrinquedo(this)) { EVENTOS.iniciarBrinquedo(this, brinq); return; }
        // Soltou fora (ou o bebê não pode agora): volta para o lugar
        brinq.ocupado = true;
        this.tweens.add({ targets: img, x: brinq.x, y: brinq.y, duration: 300, ease: 'Sine.easeOut',
          onComplete: () => { this.children.moveBelow(img, this.bercoTras); brinq.ocupado = false; } });
      });
      return brinq;
    });
  }

  mexerBrinquedo(b) {
    if (b.ocupado || this.painelAberto) return;
    b.ocupado = true;
    if (b !== this.gatoBrinq) EVENTOS.aprendeu(this, 'brinquedo');
    const ganho = b.diversao !== undefined ? b.diversao : CONFIG.NECESSIDADES.DIVERSAO_TOQUE_BRINQUEDO;
    if (ganho > 0) {
      NEC.mudar('diversao', ganho);   // o bebê acha graça
      this.atualizarNecessidades();
    }
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
    JANELA_VIVA.conferir(this, true);   // véu do céu e luz do sol mudam com o dia e a noite
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
      n.posX += n.vel * (this.ventoFator || 1) * seg;   // com vento forte, as nuvens correm
      if (n.posX > J.X + J.LARGURA) this.sortearNuvem(n, false);
      n.x = Math.round(n.posX);
    }
    // Visitas na janela, chuva, neve, folhas e raios (js/janela.js)
    JANELA_VIVA.atualizar(this, seg);
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
    this.atualizarBebeSinal(seg, respira);
    EVENTOS.atualizar(this, seg);
    if (this.balao) this.mostrarBalao();
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
      // já está de olhos fechados (toque, choro ou esgotado)
      if (this.olhosDoToque || this.brincando || ['chorando', 'forte', 'esgotado'].includes(this.poseAtual)) { this.agendarPiscada(); return; }
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
    if (this.dodoi && !this.painelAberto && !this.mamando) { EVENTOS.cuidarDodoi(this); return; }   // v0.0.57: põe o curativo
    if (this.pulando || this.mamando || this.painelAberto) return;
    EVENTOS.cuidarSoluco(this);       // v0.0.58: carinho faz o soluço passar
    this.susto = false;               // e acalma o susto do trovão
    this.pulando = true;
    NEC.mudar('diversao', CONFIG.NECESSIDADES.DIVERSAO_TOQUE_BEBE);
    VINCULO.mudar(CONFIG.VINCULO.TOQUE);
    tocarSom(this, 'risada', { volume: 0.5 });
    if (VINCULO.valor() >= CONFIG.VINCULO.DOIS_CORACOES_MIN) this.time.delayedCall(200, () => EVENTOS.coracao(this, 7));
    this.atualizarNecessidades();
    this.olhosDoToque = true;
    this.visual.piscar(true, true);     // olhos fechados sorrindo (^ ^)
    this.time.delayedCall(Q.OLHOS_FECHADOS_TOQUE * 1000, () => {
      this.olhosDoToque = false;
      this.visual.piscar(!!this.brincando, true);   // brincando com o chocalho: volta aos olhinhos felizes
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

    // Botão de necessidades: ícone da necessidade ativa mais baixa (ou carinha feliz com tudo 100%)
    // e 5 quadradinhos que mostram o nível dela
    const B = N.BOTAO;
    const S = CONFIG.SINAIS;
    this.iconeNec = this.add.image(S.BOTAO_ICONE_X, S.BOTAO_ICONE_Y, 'icones_necessidades16', 0).setOrigin(0, 0);
    this.felizNec = this.add.image(S.BOTAO_FELIZ_X, S.BOTAO_FELIZ_Y, 'humor', S.HUMOR_QUADROS.feliz).setOrigin(0, 0).setVisible(false);
    this.quadradosNec = [0, 1, 2, 3, 4].map(i => this.add.rectangle(
      S.QUADRADOS_X + i * (S.QUADRADO_TAMANHO + S.QUADRADO_ESPACO), S.QUADRADOS_Y,
      S.QUADRADO_TAMANHO, S.QUADRADO_TAMANHO, N.COR_BOA).setOrigin(0, 0));
    this.alertaNec = this.add.image(S.ALERTA_BOTAO_X, S.ALERTA_BOTAO_Y, 'alerta_mini').setOrigin(0, 0).setVisible(false);
    this.botaoNec = this.add.container(B.X, B.Y, [
      this.add.image(0, 0, 'botao_necessidades').setOrigin(0, 0), this.iconeNec, this.felizNec, ...this.quadradosNec, this.alertaNec
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

    // Balão de pedido (Etapa 8.2): ícone 16×16 do que ele quer + selo 8×8 de como ele está
    this.balaoIcone = this.add.image(S.BALAO_ICONE_X, S.BALAO_ICONE_Y, 'icones_necessidades16', 0).setOrigin(0, 0);
    this.balaoSelo = this.add.image(S.BALAO_SELO_X, S.BALAO_SELO_Y, 'selos', 0).setOrigin(0, 0);
    this.balaoX = this.add.image(S.RECUSA_X_X, S.RECUSA_X_Y, 'x_nao').setOrigin(0, 0).setVisible(false);
    this.balao = this.add.container(N.BALAO_X, N.BALAO_Y, [
      this.add.image(0, 0, 'balao_pedido').setOrigin(0, 0), this.balaoIcone, this.balaoSelo, this.balaoX
    ]).setVisible(false);
    this.tweens.add({ targets: this.balao, y: N.BALAO_Y - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Mãozinha da primeira vez: aponta para a mamadeira quando o balão pede comida
    this.maozinha = this.add.sprite(S.MAOZINHA_X, S.MAOZINHA_Y, 'maozinha', 0).setOrigin(0, 0)
      .setVisible(false).play('maozinha_aponta');

    this.atualizarNecessidades();
  }

  // Cor de uma barra: verde > 50, amarelo 25–50, vermelho < 25 (cinza se parada)
  corDaBarra(k, v) {
    const N = CONFIG.NECESSIDADES;
    if (N.QUEDA_POR_HORA[k] === 0) return N.COR_PARADA;
    return v > 50 ? N.COR_BOA : v >= 25 ? N.COR_MEDIA : N.COR_RUIM;
  }

  // Botão de necessidades (v0.0.45): ícone da barra ATIVA mais baixa + 5 quadradinhos
  //   tudo 100% → carinha feliz e 5 verdes | acima de 50 → 4 verdes e 1 vazio
  //   1 a 50 → 3 amarelos e 2 vazios       | 0 → 5 vermelhos
  atualizarBotaoNec(n) {
    const N = CONFIG.NECESSIDADES, S = CONFIG.SINAIS;
    const ativas = NEC.ativas();
    const pior = ativas.reduce((a, k) => (a === null || n[k] < n[a] ? k : a), null);
    const p = pior ? Math.round(n[pior]) : 100;   // mesma porcentagem do painel
    const tudoCheio = p >= 100;
    this.felizNec.setVisible(tudoCheio);
    this.iconeNec.setVisible(!tudoCheio);
    if (!tudoCheio) this.iconeNec.setFrame(NEC.LISTA.indexOf(pior));
    let cor, quantos;
    if (tudoCheio) { cor = N.COR_BOA; quantos = 5; }
    else if (p > 50) { cor = N.COR_BOA; quantos = 4; }
    else if (p > 0) { cor = N.COR_MEDIA; quantos = 3; }
    else { cor = N.COR_RUIM; quantos = 5; }
    this.quadradosNec.forEach((q, i) => q.setFillStyle(i < quantos ? cor : S.COR_QUADRADO_APAGADO));
  }

  // Atualiza o botão, o balão, o humor e o painel aberto (a cada segundo e após cada cuidado)
  atualizarNecessidades() {
    const N = CONFIG.NECESSIDADES;
    const n = NEC.atuais();
    if (!n || !this.botaoNec) return;
    this.atualizarBotaoNec(n);
    this.pulsando = SINAIS.alerta(n);
    this.alertaNec.setVisible(this.pulsando);

    // Sinais (Etapa 8.2): o balão mostra a mais urgente; o bebê segue a pior
    this.grupoBalao = SINAIS.grupoDoBalao(n);
    this.sinalBebe = SINAIS.pior(n);
    if (NEC.ativas().every(k => n[k] >= 100)) MOMENTOS.registrar('tudo_cheio');
    this.mostrarBalao();
    this.atualizarInfo();
    if (this.painelAberto) this.atualizarPainel();
  }

  // ---------- Painel de necessidades (Etapa 8.1) ----------
  abrirPainel() {
    if (this.painelAberto || this.mamando) return;
    const N = CONFIG.NECESSIDADES, P = N.PAINEL;
    this.painelAberto = true;
    EVENTOS.aprendeu(this, 'painel');
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
    const fechar = this.add.image(N.FECHAR_X, N.FECHAR_Y, 'botao_fechar').setOrigin(0, 0);
    itens.push(fechar);
    itens.push(this.add.zone(P.LARGURA - 24, 0, 24, 20).setOrigin(0, 0).setInteractive()
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
      L.barraFundo = this.add.rectangle(x + 32, y + 18, 98, 7, N.BARRA_FUNDO).setOrigin(0, 0).setStrokeStyle(1, N.BARRA_BORDA);
      L.barra = this.add.rectangle(x + 33, y + 19, 96, 5, N.COR_BOA).setOrigin(0, 0);
      // Divisões a cada 10%
      const marcas = [];
      for (let j = 1; j < 10; j++) {
        marcas.push(this.add.rectangle(x + 33 + Math.round(9.6 * j), y + 19, 1, 5, 0x000000, N.BARRA_DIVISAO).setOrigin(0, 0));
      }
      // TESTE: tocar na barra troca o valor (100 → 70 → 50 → 25 → 0)
      if (CONFIG.SINAIS.TESTE_BARRAS) {
        L.teste = this.add.zone(x + 30, y + 15, 102, 13).setOrigin(0, 0).setInteractive()
          .on('pointerup', () => this.testarBarra(k));
      }
      L.alerta = escrever(this, x + 140, y + 14, '!', Object.assign(fonte(11, '#ff5050'), { fontStyle: 'bold' })).setVisible(false);
      this.tweens.add({ targets: L.alerta, alpha: 0.15, duration: 350, yoyo: true, repeat: -1 });
      this.linhas[k] = L;
      itens.push(L.fundo, L.toque, moldura, icone, L.nome, L.dica, L.pct, L.barraFundo, L.barra, ...marcas, L.alerta);
      if (L.teste) itens.push(L.teste);
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
    if (!n || !this.linhas || !this.painel || !this.painel.active) return;   // painel fechado (ou de uma visita anterior)
    for (const k of NEC.LISTA) {
      const L = this.linhas[k], v = n[k];
      const parada = N.QUEDA_POR_HORA[k] === 0;
      if (parada) {
        L.barra.setSize(96, 5).setFillStyle(0x5a5a5a).setVisible(true);
        L.pct.setText('EM BREVE').setColor(N.COR_EM_BREVE).setFontSize(7);
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
    if (this.mamando || this.pulando || this.painelAberto || this.recusando) return;
    this.esconderMaozinha();
    const n = NEC.atualizar();
    if (!n) return;
    if (n.fome >= N.MAMADEIRA_RECUSA && n.sede >= N.MAMADEIRA_RECUSA) { this.recusar(); return; }
    this.mamando = true;
    VINCULO.mudar(CONFIG.VINCULO.MAMADEIRA);
    MOMENTOS.registrar('primeira_mamadeira');
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

  // ---------- Sinais de cuidado (Etapa 8.2) ----------

  // Balão: mostra a necessidade mais urgente; se houver mais de uma na mesma faixa, alterna
  mostrarBalao() {
    const S = CONFIG.SINAIS, N = CONFIG.NECESSIDADES;
    if (this.recusando) return;                       // o "X" está na tela
    if (this.dodoi) { EVENTOS.balaoDodoi(this); return; }   // v0.0.57: dodói, o balão pede um curativo
    if (this.balaoIcone.texture.key !== 'icones_necessidades16') this.balaoIcone.setTexture('icones_necessidades16', 0);
    const g = this.grupoBalao;
    if (this.mamando || !g.length) { this.balao.setVisible(false); this.balao.x = N.BALAO_X; return; }
    const t = this.tempo || 0;                        // a cena pode ainda estar montando
    const p = g[Math.floor(t / S.ALTERNAR_SEGUNDOS) % g.length];
    this.balao.setVisible(true);
    this.balaoIcone.setFrame(NEC.LISTA.indexOf(p.k));
    this.balaoSelo.setFrame(S.SELO_QUADROS[p.faixa]).setVisible(true);
    // Chorando forte: o balão treme
    const treme = p.faixa === 'forte' ? (Math.floor(t / 0.08) % 2 ? 1 : -1) * S.TREMOR_BALAO_PIXELS : 0;
    this.balao.x = N.BALAO_X + treme;
    // Primeira vez que pede comida: a mãozinha aponta para a mamadeira
    if (p.k === 'fome' && !this.maozinha.visible && !this.maozinhaJaVista()) this.maozinha.setVisible(true);
  }

  maozinhaJaVista() {
    const s = Estado.dados || Estado.carregar();
    return !!(s && s.sinais && s.sinais.maozinha_fome);
  }

  esconderMaozinha() {
    if (!this.maozinha.visible) return;
    this.maozinha.setVisible(false);
    const s = Estado.carregar();
    s.sinais = Object.assign({}, s.sinais, { maozinha_fome: true });   // nunca mais volta
    Estado.salvar();
  }

  // O bebê mostra a faixa da pior barra: triste, chorando, chorando forte ou esgotado
  atualizarBebeSinal(seg, respira) {
    const Q = CONFIG.QUARTO, S = CONFIG.SINAIS;
    let pose = (this.mamando || this.recusando || this.olhosDoToque || this.brincando) ? 'nada' : this.sinalBebe;
    if (this.dodoi && !this.mamando && !this.olhosDoToque) pose = 'forte';   // v0.0.57: dodói, chora forte
    else if (this.susto && (pose === 'nada' || pose === 'triste')) pose = 'chorando';   // v0.0.58: susto do trovão
    if (pose !== this.poseAtual) {
      this.poseAtual = pose;
      const chora = pose === 'chorando' || pose === 'forte';
      this.visual.sinal(chora ? 'choro' : pose === 'esgotado' ? 'esgotado' : null);
      this.visual.olharBaixo(pose === 'triste');
      this.visual.setAngle(pose === 'esgotado' ? -90 : 0);
      this.timerChoro = 1.5;          // o primeiro choro vem logo
      this.timerLagrima = 0;
    }
    let x = Q.BEBE_X, y = Q.BEBE_Y + respira - Math.round(this.pulo);
    if (pose === 'triste') {
      // "mexe as mãos" (provisório: mexe de lado de leve)
      x += Math.floor(this.tempo / S.MAOS_SEGUNDOS) % 2 * S.MAOS_PIXELS;
    } else if (pose === 'forte') {
      x += Math.round(Math.sin(this.tempo * 2 * Math.PI / S.BALANCO_FORTE_SEGUNDOS) * S.BALANCO_FORTE_PIXELS);
    } else if (pose === 'esgotado') {
      y = Q.BEBE_Y + S.DEITADO_Y;       // deitado, parado
    }
    x += Math.round(this.recusaDx);
    this.visual.setPosition(x, y);
    EVENTOS.seguirBebe(this, x, y, pose);

    // Lágrimas e som do choro
    if (pose === 'chorando' || pose === 'forte') {
      this.timerLagrima -= seg;
      if (this.timerLagrima <= 0) {
        this.timerLagrima = pose === 'forte' ? S.LAGRIMA_FORTE : S.LAGRIMA_CHORANDO;
        this.soltarLagrimas(x, y);
      }
      this.timerChoro -= seg;
      if (this.timerChoro <= 0) {
        const forte = pose === 'forte';
        this.timerChoro = forte ? S.FORTE_INTERVALO : S.CHORO_INTERVALO;
        tocarSom(this, forte ? 'choro_forte' : 'choro', { volume: forte ? S.FORTE_VOLUME : S.CHORO_VOLUME });
      }
    }
  }

  soltarLagrimas(x, y) {
    const S = CONFIG.SINAIS;
    for (const lx of [10, 21]) {
      const g = this.add.rectangle(x + lx, y + 16, 1, 2, S.LAGRIMA_COR).setOrigin(0, 0);
      this.lagrimas.add(g);
      g.posY = g.y;
      this.tweens.add({
        targets: g, posY: g.y + 8, alpha: 0, duration: 650, ease: 'Sine.easeIn',
        onUpdate: () => { g.y = Math.round(g.posY); }, onComplete: () => g.destroy()
      });
    }
  }

  // "Não quero": X vermelho em cima da fome no balão e o bebê vira o rosto
  recusar() {
    const S = CONFIG.SINAIS, N = CONFIG.NECESSIDADES;
    this.recusando = true;
    this.balao.setVisible(true);
    this.balao.x = N.BALAO_X;
    this.balaoIcone.setFrame(NEC.LISTA.indexOf('fome'));
    this.balaoSelo.setVisible(false);
    this.balaoX.setVisible(true);
    // provisório: balança de lado 2 vezes
    this.tweens.add({
      targets: this, recusaDx: { from: -S.RECUSA_PIXELS, to: S.RECUSA_PIXELS }, duration: 130,
      yoyo: true, repeat: S.RECUSA_BALANCOS - 1, onComplete: () => { this.recusaDx = 0; }
    });
    this.time.delayedCall(S.RECUSA_SEGUNDOS * 1000, () => {
      this.recusando = false;
      this.balaoX.setVisible(false);
      this.mostrarBalao();
    });
  }

  // TESTE: no painel aberto, tocar na barra troca o valor (100 → 70 → 50 → 25 → 0)
  testarBarra(k) {
    const lista = CONFIG.SINAIS.TESTE_VALORES;
    const n = NEC.atuais();
    const i = lista.indexOf(Math.round(n[k]));
    NEC.definir(k, lista[(i + 1) % lista.length]);
    this.atualizarNecessidades();
  }
}

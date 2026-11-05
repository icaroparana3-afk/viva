// =============================================================
// Menu.js — tela inicial com o pôr do sol, o casal e os 3 botões.
// Camadas (de trás para frente):
//   céu com sol → estrela cadente → nuvens → riscos de vento → montanhas e grama
//   → toalha de piquenique → sombras → árvores e moitas → casal → cesta → animal
//   → folhas → pássaro
//   → título → botões
// Os números (velocidades, tempos, posições) ficam em config.js:
//   CONFIG.MENU, CONFIG.VENTO, CONFIG.SOMBRAS e CONFIG.ANIMAL.
// =============================================================

class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  // Recebe um recado de outra cena (ex.: "Perfil salvo!")
  init(dados) {
    this.recado = dados && dados.avisar ? dados.avisar : null;
  }

  create() {
    prepararCamera(this);

    // ---------- Céu ----------
    this.add.image(0, 0, 'menu_ceu').setOrigin(0, 0);

    // Estrela cadente: começa escondida e risca o céu de tempos em tempos
    this.estrela = this.add.image(0, 0, 'estrela_cadente').setOrigin(0, 1).setVisible(false);
    this.estrela.caindo = false;
    this.agendarEstrela();

    // Nuvens (posições iguais às do menu antigo)
    this.nuvem1 = this.add.image(14, 52, 'nuvem1').setOrigin(0, 0);
    this.nuvem2 = this.add.image(124, 84, 'nuvem2').setOrigin(0, 0);
    this.nuvem1.posX = this.nuvem1.x; // posição "de verdade", com casas decimais
    this.nuvem2.posX = this.nuvem2.x;

    // Riscos de vento (aparecem só nas rajadas)
    this.riscos = [];
    for (let i = 0; i < CONFIG.VENTO.RISCOS_POR_RAJADA; i++) {
      const r = this.add.image(0, 0, 'vento').setOrigin(0, 0).setVisible(false);
      r.ativo = false;
      this.riscos.push(r);
    }

    // ---------- Chão ----------
    this.add.image(0, 0, 'menu_montanhas').setOrigin(0, 0);

    // Toalha do piquenique (embaixo de tudo que fica no chão)
    const PQ = CONFIG.PIQUENIQUE;
    this.add.image(PQ.TOALHA_X, PQ.TOALHA_Y, 'toalha').setOrigin(0, 0);

    // Sombras no chão (CONFIG.SOMBRAS)
    for (const s of CONFIG.SOMBRAS) {
      this.add.image(s.x, s.y, 'sombra_' + s.tipo).setOrigin(0.5, 0.5).setAlpha(s.opacidade);
    }

    // Árvores e moitas: a parte de cima balança com o vento, a de baixo fica parada.
    //   corte = linha do desenho onde termina a parte que balança
    this.balancam = [
      this.criarBalanco(0, 195, 'arvore_esquerda', 47, 0),
      this.criarBalanco(140, 191, 'arvore_direita', 50, 1.3),
      this.criarBalanco(0, 286, 'moita_esquerda', 7, 0.6),
      this.criarBalanco(144, 274, 'moita_direita', 9, 2.1)
    ];

    this.add.image(66, 275, 'casal').setOrigin(0, 0);
    this.add.image(PQ.CESTA_X, PQ.CESTA_Y, 'cesta').setOrigin(0, 0);

    // ---------- Animal parado perto do casal ----------
    this.criarAnimal();

    // Folhas voando (aparecem só nas rajadas)
    this.folhas = [];
    for (let i = 0; i < CONFIG.VENTO.FOLHAS_POR_RAJADA; i++) {
      const f = this.add.sprite(0, 0, 'folha').setOrigin(0, 0).setVisible(false);
      f.ativa = false;
      this.folhas.push(f);
    }

    // Pássaro: começa escondido e aparece de tempos em tempos
    this.passaro = this.add.sprite(-10, 60, 'passaro').setOrigin(0, 0).play('passaro_voando');
    this.passaro.setVisible(false);
    this.passaro.voando = false;
    this.agendarPassaro();

    // ---------- Título (VIVA + "Cuide de uma vida") ----------
    this.add.image(53, 15, 'texto_titulo').setOrigin(0, 0);

    // ---------- Música e efeitos sonoros (canto superior direito) ----------
    const M = CONFIG.MENU;
    // Por enquanto só guardam a escolha; os sons entram na Etapa 30.
    criarBotaoAlternar(this, M.BOTAO_MUSICA_X, M.BOTAO_MUSICA_Y, 'botao_musica', 'botao_musica_off', Opcoes.musica, v => {
      Opcoes.musica = v; Opcoes.salvar();
    });
    criarBotaoAlternar(this, M.BOTAO_SOM_X, M.BOTAO_SOM_Y, 'botao_som', 'botao_som_off', Opcoes.som, v => {
      Opcoes.som = v; Opcoes.salvar();
    });

    // ---------- Botões ----------
    criarBotao(this, 35, 120, 'botao_nova_historia', () => this.novaHistoria());
    criarBotao(this, 35, 146, 'botao_continuar_historia', () => this.continuarHistoria(), temSave());
    criarBotao(this, 35, 172, 'botao_configuracoes', () => this.scene.start('Configuracoes'));

    // Versão no rodapé (discreta)
    escrever(this, CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.6);

    if (this.recado) mostrarAviso(this, this.recado);

    // ---------- Vento ----------
    this.vento = { ativo: false, tempo: 0, forca: 0 };
    this.agendarRajada();
  }

  // Roda a cada quadro. "delta" = milissegundos desde o quadro anterior.
  update(time, delta) {
    const seg = delta / 1000;
    const M = CONFIG.MENU;
    const V = CONFIG.VENTO;

    // ---------- Força do vento ----------
    // Durante a rajada, a força sobe de 0 até 1 e volta a 0 (curva suave).
    const vento = this.vento;
    if (vento.ativo) {
      vento.tempo += seg;
      vento.forca = Math.max(0, Math.sin(Math.PI * vento.tempo / V.DURACAO));
      if (vento.tempo >= V.DURACAO) {
        vento.ativo = false;
        vento.forca = 0;
        this.agendarRajada();
      }
    }

    // Nuvens andam para a direita (mais rápido no vento); ao sair, voltam pela esquerda
    const mult = 1 + (V.NUVEM_MULTIPLICADOR - 1) * vento.forca;
    for (const [nuvem, vel] of [[this.nuvem1, M.NUVEM1_VELOCIDADE], [this.nuvem2, M.NUVEM2_VELOCIDADE]]) {
      nuvem.posX += vel * mult * seg;
      if (nuvem.posX > CONFIG.LARGURA) nuvem.posX = -nuvem.width;
      nuvem.x = Math.round(nuvem.posX); // sempre em pixel inteiro
    }

    // Copas e moitas balançando
    for (const b of this.balancam) {
      let desloca = 0;
      if (vento.forca > 0.25) {
        const onda = Math.sin(time / 1000 * V.BALANCO_POR_SEG * 2 * Math.PI + b.fase);
        if (onda > -0.3) desloca = V.BALANCO_PIXELS;   // inclinada para a direita, com voltinhas
      }
      b.topo.x = b.x + desloca;
    }

    // Folhas voando
    for (const f of this.folhas) {
      if (!f.ativa) continue;
      f.tempo += seg;
      f.posX += f.vel * (0.5 + 0.5 * vento.forca + 0.3) * seg;
      f.posY += 6 * seg;                                     // vai caindo devagar
      f.x = Math.round(f.posX);
      f.y = Math.round(f.posY + Math.sin(f.tempo * 4 + f.fase) * 3); // sobe e desce
      if (f.x > CONFIG.LARGURA + 4 || f.y > CONFIG.ALTURA) { f.ativa = false; f.setVisible(false); }
    }

    // Riscos de vento
    for (const r of this.riscos) {
      if (!r.ativo) continue;
      r.posX += V.RISCO_VELOCIDADE * seg;
      r.x = Math.round(r.posX);
      r.setAlpha(Math.min(1, vento.forca * 1.5));
      if (r.x > CONFIG.LARGURA) { r.ativo = false; r.setVisible(false); }
    }

    // Estrela cadente: anda na diagonal (2 para a esquerda, 1 para baixo) e some no fim
    const e = this.estrela;
    if (e.caindo) {
      e.tempo += seg;
      const passo = M.ESTRELA_VELOCIDADE * seg / Math.sqrt(5);
      e.posX -= 2 * passo;
      e.posY += passo;
      e.x = Math.round(e.posX);
      e.y = Math.round(e.posY);
      const fim = M.ESTRELA_DURACAO;
      if (e.tempo > fim * 0.6) e.setAlpha(Math.max(0, 1 - (e.tempo - fim * 0.6) / (fim * 0.4)));
      if (e.tempo >= fim) {
        e.caindo = false;
        e.setVisible(false);
        this.agendarEstrela();
      }
    }

    // Pássaro atravessando
    if (this.passaro.voando) {
      this.passaro.posX += M.PASSARO_VELOCIDADE * seg;
      this.passaro.x = Math.round(this.passaro.posX);
      if (this.passaro.x > CONFIG.LARGURA) {
        this.passaro.voando = false;
        this.passaro.setVisible(false);
        this.agendarPassaro();
      }
    }
  }

  // ---------- Árvore/moita em duas partes ----------
  // O mesmo desenho aparece duas vezes, cada uma recortada:
  //   topo = linhas 0 até "corte" (balança)   base = do "corte" para baixo (parada)
  criarBalanco(x, y, textura, corte, fase) {
    const img = this.textures.get(textura).getSourceImage();
    const base = this.add.image(x, y, textura).setOrigin(0, 0).setCrop(0, corte, img.width, img.height - corte);
    const topo = this.add.image(x, y, textura).setOrigin(0, 0).setCrop(0, 0, img.width, corte);
    return { x, topo, base, fase };
  }

  // ---------- Animal ----------
  // Fica parado (animação que repete) e de vez em quando faz uma ação.
  // Tocar nele também faz a ação.
  criarAnimal() {
    const A = CONFIG.ANIMAL;
    this.animal = this.add.sprite(A.X, A.Y, 'animal').setOrigin(0, 0).setFlipX(A.VIRAR);
    this.animal.play('animal_parado');
    this.animal.setInteractive();
    this.animal.on('pointerup', () => this.acaoAnimal());
    this.animal.on('animationcomplete-animal_acao', () => this.animal.play('animal_parado'));
    this.agendarAcaoAnimal();
  }

  acaoAnimal() {
    if (this.animal.anims.currentAnim && this.animal.anims.currentAnim.key === 'animal_acao') return;
    this.animal.play('animal_acao');
  }

  agendarAcaoAnimal() {
    const A = CONFIG.ANIMAL;
    const espera = Phaser.Math.FloatBetween(A.ACAO_INTERVALO_MIN, A.ACAO_INTERVALO_MAX) * 1000;
    this.time.delayedCall(espera, () => { this.acaoAnimal(); this.agendarAcaoAnimal(); });
  }

  // ---------- Rajadas de vento ----------
  agendarRajada() {
    const V = CONFIG.VENTO;
    const espera = Phaser.Math.FloatBetween(V.INTERVALO_MIN, V.INTERVALO_MAX) * 1000;
    this.time.delayedCall(espera, () => this.comecarRajada());
  }

  comecarRajada() {
    const V = CONFIG.VENTO;
    this.vento.ativo = true;
    this.vento.tempo = 0;

    // Folhas saem das copas (e algumas de fora da tela, à esquerda), espalhadas no tempo
    this.folhas.forEach((f, i) => {
      this.time.delayedCall(Phaser.Math.FloatBetween(0.2, V.DURACAO * 0.6) * 1000, () => {
        const daArvore = i % 2 === 0;
        f.posX = daArvore ? Phaser.Math.Between(4, 36) : -4;
        f.posY = daArvore ? Phaser.Math.Between(205, 235) : Phaser.Math.Between(200, 270);
        f.vel = Phaser.Math.Between(V.FOLHA_VELOCIDADE_MIN, V.FOLHA_VELOCIDADE_MAX);
        f.fase = Math.random() * 6;
        f.tempo = 0;
        f.ativa = true;
        f.setVisible(true).play({ key: 'folha_girando', startFrame: Phaser.Math.Between(0, 3) });
      });
    });

    // Riscos de vento no céu
    this.riscos.forEach(r => {
      this.time.delayedCall(Phaser.Math.FloatBetween(0.3, V.DURACAO * 0.5) * 1000, () => {
        r.posX = -24;
        r.x = -24;
        r.y = Phaser.Math.Between(V.RISCO_ALTURA_MIN, V.RISCO_ALTURA_MAX);
        r.ativo = true;
        r.setAlpha(0).setVisible(true);
      });
    });
  }

  // Espera um tempo sorteado e faz uma estrela cadente riscar o céu
  agendarEstrela() {
    const M = CONFIG.MENU;
    const espera = Phaser.Math.FloatBetween(M.ESTRELA_INTERVALO_MIN, M.ESTRELA_INTERVALO_MAX) * 1000;
    this.time.delayedCall(espera, () => {
      const e = this.estrela;
      e.posX = Phaser.Math.Between(70, CONFIG.LARGURA + 10);   // nasce na metade direita do céu
      e.posY = Phaser.Math.Between(0, M.ESTRELA_ALTURA_MAX);
      e.tempo = 0;
      e.setAlpha(1).setVisible(true);
      e.caindo = true;
    });
  }

  // Espera um tempo sorteado e solta o pássaro pela esquerda
  agendarPassaro() {
    const M = CONFIG.MENU;
    const espera = Phaser.Math.Between(M.PASSARO_INTERVALO_MIN, M.PASSARO_INTERVALO_MAX) * 1000;
    this.time.delayedCall(espera, () => {
      this.passaro.posX = -8;
      this.passaro.x = -8;
      this.passaro.y = Phaser.Math.Between(M.PASSARO_ALTURA_MIN, M.PASSARO_ALTURA_MAX);
      this.passaro.setVisible(true);
      this.passaro.voando = true;
    });
  }

  novaHistoria() {
    // Se já existe uma história salva, pergunta antes de apagar.
    if (temSave()) {
      criarConfirmacao(this, 'Isso vai apagar a\nhistória salva.\nContinuar?', () => {
        Estado.apagar();
        this.scene.start('Perfil');
      });
      return;
    }
    this.scene.start('Perfil');
  }

  continuarHistoria() {
    const save = Estado.carregar();
    if (!save) return;
    // Se a cegonha ainda não entregou o bebê, ela volta (com o MESMO bebê, que já está salvo).
    if (!save.bebe || !save.bebeRecebido) { this.scene.start('Cegonha'); return; }
    this.scene.start('Quarto');
  }
}

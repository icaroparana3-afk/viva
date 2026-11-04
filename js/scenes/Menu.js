// =============================================================
// Menu.js — tela inicial com o pôr do sol, o casal e os 3 botões.
// Camadas (de trás para frente):
//   céu com sol → estrela cadente → nuvens → montanhas e grama → casal
//   → pássaro → título → botões
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
    const M = CONFIG.MENU;

    // ---------- Cenário ----------
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

    this.add.image(0, 0, 'menu_montanhas').setOrigin(0, 0);
    this.add.image(66, 275, 'casal').setOrigin(0, 0);

    // Pássaro: começa escondido e aparece de tempos em tempos
    this.passaro = this.add.sprite(-10, 60, 'passaro').setOrigin(0, 0).play('passaro_voando');
    this.passaro.setVisible(false);
    this.passaro.voando = false;
    this.agendarPassaro();

    // ---------- Título (VIVA + "Cuide de uma vida") ----------
    this.add.image(53, 15, 'texto_titulo').setOrigin(0, 0);

    // ---------- Música e efeitos sonoros (canto superior direito) ----------
    // Por enquanto só guardam a escolha; os sons entram na Etapa 30.
    criarBotaoAlternar(this, 141, 4, 'botao_musica', 'botao_musica_off', Opcoes.musica, v => {
      Opcoes.musica = v; Opcoes.salvar();
    });
    criarBotaoAlternar(this, 159, 4, 'botao_som', 'botao_som_off', Opcoes.som, v => {
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
  }

  // Roda a cada quadro. "delta" = milissegundos desde o quadro anterior.
  update(time, delta) {
    const seg = delta / 1000;
    const M = CONFIG.MENU;

    // Nuvens andam para a direita; ao sair pela direita, voltam pela esquerda
    for (const [nuvem, vel] of [[this.nuvem1, M.NUVEM1_VELOCIDADE], [this.nuvem2, M.NUVEM2_VELOCIDADE]]) {
      nuvem.posX += vel * seg;
      if (nuvem.posX > CONFIG.LARGURA) nuvem.posX = -nuvem.width;
      nuvem.x = Math.round(nuvem.posX); // sempre em pixel inteiro
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
    // A Etapa 5/6 vai abrir o quarto aqui.
    mostrarAviso(this, 'Em breve: ' + save.perfil.nome);
  }
}

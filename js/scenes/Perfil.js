// =============================================================
// Perfil.js — Etapa 2, parte 1: nome do jogador e papai ou mamãe.
// "Próximo" leva para a escolha da região no mapa (Regiao.js).
//
// As caixas desta tela são SUBSTITUTOS (retângulos) até você
// desenhar as suas.
// =============================================================

class Perfil extends Phaser.Scene {
  constructor() {
    super('Perfil');
  }

  // Se o jogador voltou do mapa, recebe de volta o que já tinha preenchido
  init(dados) {
    this.nomeInicial = (dados && dados.nome) || '';
    this.papel = (dados && dados.papel) || null;      // 'papai' ou 'mamae'
    this.regiao = (dados && dados.regiao) || null;    // guardada para não se perder
  }

  create() {
    const U = CONFIG.UI;

    // ---------- Fundo ----------
    this.add.image(0, 0, 'menu_ceu').setOrigin(0, 0);
    this.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x1a1c2c, 0.72).setOrigin(0, 0);

    this.add.text(90, 10, 'SEU PERFIL', {
      fontFamily: 'monospace', fontSize: '12px', color: U.TEXTO
    }).setOrigin(0.5, 0);

    // ---------- Nome ----------
    this.add.text(35, 50, 'Nome', {
      fontFamily: 'monospace', fontSize: '8px', color: U.TEXTO_FRACO
    }).setOrigin(0, 0);

    // "DOM" = um campo de texto de verdade do navegador, colocado
    // por cima do jogo. É ele que faz o teclado do celular abrir.
    this.campoNome = this.add.dom(90, 70).createFromHTML(
      '<input type="text" maxlength="' + CONFIG.PERFIL.NOME_MAX + '" placeholder="seu nome" ' +
      'autocomplete="off" autocorrect="off" spellcheck="false" ' +
      'style="width:98px;height:16px;background:#2a1838;color:#ffd860;' +
      'border:1px solid #7b4aa6;font-family:monospace;font-size:9px;' +
      'text-align:center;outline:none;padding:0;border-radius:0;">'
    );
    this.input = this.campoNome.node.querySelector('input');
    this.input.value = this.nomeInicial;
    this.input.addEventListener('input', () => this.conferir());

    // ---------- Papai ou mamãe ----------
    this.add.text(35, 96, 'Você é', {
      fontFamily: 'monospace', fontSize: '8px', color: U.TEXTO_FRACO
    }).setOrigin(0, 0);

    this.opcoesPapel = [];
    [{ id: 'papai', nome: 'Papai' }, { id: 'mamae', nome: 'Mamãe' }].forEach((p, i) => {
      const o = criarOpcao(this, 35 + i * 57, 106, 53, 20, p.nome, () => {
        this.input.blur();               // fecha o teclado do celular
        this.papel = p.id;
        this.opcoesPapel.forEach(x => x.marcar(x.id === p.id));
        this.conferir();
      });
      o.id = p.id;
      if (p.id === this.papel) o.marcar(true);
      this.opcoesPapel.push(o);
    });

    // ---------- Próximo ----------
    this.btProximo = criarOpcao(this, 35, 216, 110, 20, 'Próximo', () => this.proximo(), 10);
    this.conferir();

    // ---------- Voltar (usa o seu desenho) ----------
    criarBotao(this, 35, 244, 'botao_voltar', () => this.scene.start('Menu'));

    this.add.text(CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.6);
  }

  // O botão "Próximo" só acende com nome e papel preenchidos.
  conferir() {
    const nome = this.input.value.trim();
    const pronto = nome.length >= CONFIG.PERFIL.NOME_MIN && !!this.papel;
    this.btProximo.ativar(pronto);
    return pronto;
  }

  proximo() {
    if (!this.conferir()) return;
    this.input.blur();
    this.scene.start('Regiao', { nome: this.input.value.trim(), papel: this.papel, regiao: this.regiao });
  }
}

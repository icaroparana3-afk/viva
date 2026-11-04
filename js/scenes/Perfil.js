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
    prepararCamera(this);
    const U = CONFIG.UI;

    // ---------- Fundo e título (seus desenhos; posições da sua tela de exemplo) ----------
    this.add.image(0, 0, 'fundo_perfil').setOrigin(0, 0);
    this.add.image(37, 10, 'texto_seu_perfil').setOrigin(0, 0);

    // ---------- Nome ----------
    this.add.image(36, 48, 'texto_nome').setOrigin(0, 0);

    // "DOM" = um campo de texto de verdade do navegador, colocado
    // por cima do jogo. É ele que faz o teclado do celular abrir.
    // Mesma largura dos botões (110), entre "Nome" e "Você é".
    this.campoNome = this.add.dom(90, 70).createFromHTML(
      '<input type="text" maxlength="' + CONFIG.PERFIL.NOME_MAX + '" placeholder="seu nome" ' +
      'autocomplete="off" autocorrect="off" spellcheck="false" ' +
      'style="width:108px;height:16px;background:#2a1838;color:#ffd860;' +
      'border:1px solid #7b4aa6;font-family:monospace;font-size:9px;' +
      'text-align:center;outline:none;padding:0;border-radius:0;">'
    );
    this.input = this.campoNome.node.querySelector('input');
    this.input.value = this.nomeInicial;
    this.input.addEventListener('input', () => this.conferir());

    // ---------- Papai ou mamãe ----------
    this.add.image(36, 92, 'texto_voce_e').setOrigin(0, 0);

    // Seus botões Papai e Mamãe (53×20). O escolhido fica com a versão "_sel".
    this.opcoesPapel = [];
    [{ id: 'papai', x: 36 }, { id: 'mamae', x: 92 }].forEach(p => {
      const o = criarBotaoImg(this, p.x, 104, 'botao_' + p.id, () => {
        this.input.blur();               // fecha o teclado do celular
        this.papel = p.id;
        this.opcoesPapel.forEach(x => x.marcar(x.id === p.id));
        this.conferir();
      }, 'botao_' + p.id + '_sel');
      o.id = p.id;
      if (p.id === this.papel) o.marcar(true);
      this.opcoesPapel.push(o);
    });

    // ---------- Próximo ----------
    this.btProximo = criarBotaoImg(this, 35, 222, 'botao_proximo', () => this.proximo());
    this.conferir();

    // ---------- Voltar (usa o seu desenho) ----------
    criarBotao(this, 35, 250, 'botao_voltar', () => this.scene.start('Menu'));

    escrever(this, CONFIG.LARGURA - 3, CONFIG.ALTURA - 2, 'v' + CONFIG.VERSAO, {
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

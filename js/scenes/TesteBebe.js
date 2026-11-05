// =============================================================
// TesteBebe.js — tela de TESTE do gerador do bebê (Etapa 3).
// Fica em Configurações → "Teste: gerador do bebê".
// É uma ferramenta de conferência: sai do jogo antes da versão final.
//
//   "Novo bebê"  → sorteia 1 bebê e mostra ele (desenho provisório em camadas)
//   "Gerar 1000" → sorteia 1000 e mostra as porcentagens, página por página
//   "Região: ..." (toque) → troca a região usada no sorteio
// =============================================================

class TesteBebe extends Phaser.Scene {
  constructor() {
    super('TesteBebe');
  }

  create() {
    prepararCamera(this);
    const U = CONFIG.UI;
    this.add.image(0, 0, 'fundo_perfil').setOrigin(0, 0);

    const fonte = (tam, cor = '#ffffff') => ({ fontFamily: 'monospace', fontSize: tam + 'px', color: cor });

    escrever(this, 90, 4, 'Gerador do bebê (teste)', fonte(9, U.TEXTO)).setOrigin(0.5, 0);

    // Região usada no sorteio: a do save, se existir; senão, Sudeste.
    const save = Estado.carregar();
    this.regiao = save && save.perfil ? save.perfil.regiao : 'sudeste';
    this.txtRegiao = escrever(this, 90, 15, '', fonte(7, U.TEXTO_FRACO)).setOrigin(0.5, 0)
      .setInteractive().on('pointerup', () => this.trocarRegiao());
    this.mostrarRegiao();

    // ---------- Cartão do bebê ----------
    this.add.rectangle(6, 26, 168, 95, 0x2a1838, 0.6).setOrigin(0, 0).setStrokeStyle(1, U.CAIXA_ESCOLHIDA);
    // Bebê em camadas (32×32, ampliado 2×) — ver js/bebe_visual.js
    this.visual = criarBebeVisual(this, 9, 33, 2);
    this.txtBebe = escrever(this, 76, 29, '', Object.assign(fonte(7), { lineSpacing: 1 }));
    // Largura de uma letra (a fonte é monoespaçada) e espaço disponível no cartão
    const medida = escrever(this, 0, 0, '0000000000', fonte(7));
    this.larguraLetra = medida.width / 10;
    medida.destroy();
    this.larguraTexto = 172 - 76;
    escrever(this, 10, 112, '* no jogo só aparece se for especial', fonte(6, U.TEXTO_FRACO));

    criarOpcao(this, 6, 125, 82, 16, 'Novo bebê', () => this.novoBebe(), 8);
    criarOpcao(this, 92, 125, 82, 16, 'Gerar 1000', () => this.gerarMil(), 8);

    // ---------- Painel de porcentagens ----------
    this.add.rectangle(6, 145, 168, 144, 0x2a1838, 0.6).setOrigin(0, 0).setStrokeStyle(1, U.CAIXA_ESCOLHIDA);
    this.txtTitulo = escrever(this, 90, 149, '', fonte(8, U.TEXTO)).setOrigin(0.5, 0);
    criarOpcao(this, 9, 147, 16, 12, '<', () => this.mudarPagina(-1), 8);
    criarOpcao(this, 155, 147, 16, 12, '>', () => this.mudarPagina(1), 8);
    this.linhas = this.add.container(0, 0);
    this.txtRodape = escrever(this, 90, 277, '', fonte(7, U.TEXTO_FRACO)).setOrigin(0.5, 0);

    criarBotao(this, 35, 295, 'botao_voltar', () => irPara(this, 'Configuracoes'));

    this.pagina = 0;
    this.resultado = null;
    this.desenharPagina();
    this.novoBebe();
  }

  // ---------- Região ----------
  trocarRegiao() {
    const ids = CONFIG.PERFIL.REGIOES.map(r => r.id);
    this.regiao = ids[(ids.indexOf(this.regiao) + 1) % ids.length];
    this.mostrarRegiao();
    this.novoBebe();
    if (this.resultado) this.gerarMil();
  }

  mostrarRegiao() {
    const r = CONFIG.PERFIL.REGIOES.find(g => g.id === this.regiao);
    this.txtRegiao.setText('Região: ' + r.nome + '  (toque p/ trocar)');
  }

  // ---------- 1 bebê ----------
  novoBebe() {
    const b = BEBE.gerar(this.regiao);
    this.visual.mostrar(b);

    const n = (v) => BEBE.nome(v);
    const origem = b.especial ? n(b.especial) : n(b.origem);
    const problemas = BEBE.confere(b);
    this.txtBebe.setText([
      n(b.sexo),
      'Origem*: ' + origem,
      'Pele: ' + n(b.pele),
      'Cabelo: ' + n(b.cabeloTipo),
      '  ' + n(b.cabeloCor),
      'Olhos: ' + n(b.olhos),
      'Estado: ' + b.estado,
      problemas.length ? 'ERRO: ' + problemas[0] : ''
    ].map(l => this.quebrar(l)).join('\n'));
  }

  // Se a linha não cabe no cartão, quebra na palavra e recua a continuação.
  quebrar(linha) {
    const max = Math.floor(this.larguraTexto / this.larguraLetra);
    if (linha.length <= max) return linha;
    const partes = [];
    let atual = '';
    for (const palavra of linha.split(' ')) {
      const tentativa = atual ? atual + ' ' + palavra : palavra;
      if (tentativa.length > max && atual) { partes.push(atual); atual = '  ' + palavra; }
      else atual = tentativa;
    }
    partes.push(atual);
    return partes.join('\n');
  }

  // ---------- 1000 bebês ----------
  gerarMil() {
    const N = 1000;
    const contar = { origem: {}, sexo: {}, especial: {}, pele: {}, cabeloTipo: {}, cabeloCor: {}, olhos: {}, estado: {} };
    let erros = 0;
    for (let i = 0; i < N; i++) {
      const b = BEBE.gerar(this.regiao);
      if (BEBE.confere(b).length) erros++;
      for (const campo of Object.keys(contar)) {
        const v = b[campo];
        if (v === null) continue;
        contar[campo][v] = (contar[campo][v] || 0) + 1;
      }
    }
    this.resultado = { N, contar, erros };
    this.desenharPagina();
  }

  // ---------- Páginas ----------
  paginas() {
    const B = CONFIG.BEBE;
    const totalPeso = Object.values(B.ORIGENS).reduce((s, p) => s + p, 0);
    const alvoOrigem = {};
    for (const [k, p] of Object.entries(B.ORIGENS)) alvoOrigem[k] = 100 * p / totalPeso;
    const regiao = CONFIG.PERFIL.REGIOES.find(g => g.id === this.regiao);
    return [
      { titulo: 'Origem', campo: 'origem', valores: Object.keys(B.ORIGENS), alvo: alvoOrigem },
      { titulo: 'Sexo', campo: 'sexo', valores: ['M', 'F'], alvo: { M: 100 * (1 - B.CHANCE_MENINA), F: 100 * B.CHANCE_MENINA } },
      { titulo: 'Especiais', campo: 'especial', valores: Object.keys(B.ESPECIAIS), deTotal: true },
      { titulo: 'Pele', campo: 'pele', valores: Object.keys(B.CORES.pele) },
      { titulo: 'Tipo de cabelo', campo: 'cabeloTipo', valores: B.TODOS.cabeloTipo },
      { titulo: 'Cor do cabelo', campo: 'cabeloCor', valores: Object.keys(B.CORES.cabeloCor) },
      { titulo: 'Olhos', campo: 'olhos', valores: Object.keys(B.CORES.olhos) },
      { titulo: 'Estado', campo: 'estado', valores: regiao.estados }
    ];
  }

  mudarPagina(d) {
    const total = this.paginas().length;
    this.pagina = (this.pagina + d + total) % total;
    this.desenharPagina();
  }

  desenharPagina() {
    const U = CONFIG.UI;
    const pags = this.paginas();
    const p = pags[this.pagina];
    this.txtTitulo.setText(p.titulo + '  ' + (this.pagina + 1) + '/' + pags.length);
    this.linhas.removeAll(true);

    if (!this.resultado) {
      this.linhas.add(escrever(this, 90, 215, 'Toque em "Gerar 1000"', {
        fontFamily: 'monospace', fontSize: '8px', color: U.TEXTO_FRACO }).setOrigin(0.5));
      this.txtRodape.setText('');
      return;
    }

    const { N, contar, erros } = this.resultado;
    const cont = contar[p.campo];
    // Especiais: porcentagem DENTRO dos especiais (e quantos saíram no total)
    const base = p.deTotal ? Object.values(cont).reduce((s, v) => s + v, 0) : N;
    const alt = 12;
    const cores = CONFIG.BEBE.CORES[p.campo];

    p.valores.forEach((v, i) => {
      const y = 163 + i * alt;
      const qtd = cont[v] || 0;
      const pct = base ? 100 * qtd / base : 0;
      // nome
      this.linhas.add(escrever(this, 10, y, BEBE.nome(v), { fontFamily: 'monospace', fontSize: '7px', color: '#ffffff' }));
      // amostra da cor (quando o atributo tem cor)
      if (cores && cores[v]) this.linhas.add(this.add.rectangle(78, y + 1, 5, 5, parseInt(cores[v].slice(1), 16)).setOrigin(0, 0));
      // barra
      this.linhas.add(this.add.rectangle(86, y + 1, 38, 5, 0x1a1028).setOrigin(0, 0));
      this.linhas.add(this.add.rectangle(86, y + 1, Math.round(38 * pct / 100), 5, U.DESTAQUE).setOrigin(0, 0));
      // número (e o alvo, quando existe)
      const alvo = p.alvo ? ' (' + Math.round(p.alvo[v]) + ')' : '';
      this.linhas.add(escrever(this, 171, y, pct.toFixed(1) + alvo, {
        fontFamily: 'monospace', fontSize: '7px', color: '#ffffff' }).setOrigin(1, 0));
    });

    const extra = p.deTotal ? ' · ' + base + ' esp.' : '';
    const alvoTxt = p.alvo ? ' · (alvo)' : '';
    this.txtRodape.setText(N + ' bebês · erros: ' + erros + extra + alvoTxt);
  }
}

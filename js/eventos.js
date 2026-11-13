// =============================================================
// eventos.js — coisas que acontecem sozinhas no quarto (v0.0.57).
//
// Só com o jogo aberto, no quarto, e com o bebê bem (nenhuma barra
// chorando, sem mamar, sem painel aberto). A cada CONFERIR_SEGUNDOS
// o jogo sorteia se acontece algo (CHANCE) e qual evento (PESOS).
//
//   imaginacao  nuvem de pensamento sobre o bebê, mostrando 3 coisas
//               (o gato, o passarinho ou o sol de dia, a lua ou a
//               estrela à noite, a mamadeira se tiver fome...).
//               Tocar na nuvem estoura a bolha: +2 de diversão.
//   chocalho    o bebê acha o chocalho e balança (+8 de diversão).
//               Às vezes termina em DODÓI: "toc" na testa, galo,
//               estrelinhas girando, choro forte e o balão pede um
//               curativo. Tocar no bebê põe o curativo (fica 10 min
//               reais na testa). Ninguém cuidou em 45 s: ele para
//               sozinho, mas perde 15 de diversão.
//
// Usado pelo Quarto.js:
//   EVENTOS.criarCamadas(q)        depois do bebê e do berço (chocalho, galo, curativo, estrelas)
//   EVENTOS.criarNuvem(q)          depois do escuro da noite (a nuvem fica clara à noite)
//   EVENTOS.atualizar(q, seg)      no update
//   EVENTOS.seguirBebe(q, x, y, pose)  depois de posicionar o bebê
//   EVENTOS.cuidarDodoi(q)         toque no bebê durante o dodói
//   EVENTOS.balaoDodoi(q)          o balão de pedido mostra o curativo
// Salvo em save.eventos: { curativoAte, ultimoDodoi, dodois, imaginacoes, chocalhos }
//
// v0.0.58: soluço, espirro, beijinho (vínculo alto), brinquedo arrastado
// até o berço (15% de dodói; o chocalho 10%, v0.0.59), susto com o trovão,
// recepção na volta, mesversário/aniversário e as mãozinhas do tutorial.
// =============================================================

const EVENTOS = {

  // ---------- Montagem ----------
  criarCamadas(q) {
    const E = CONFIG.EVENTOS;
    const salvo = EVENTOS.salvo();
    q.ev = {
      ativo: null,                          // 'imaginacao' | 'chocalho' | 'dodoi' | null
      espera: E.PRIMEIRO_SEGUNDOS,          // segundos até o próximo sorteio
      t: 0,
      curativoAte: salvo.curativoAte || 0,  // até quando o curativo fica na testa (Date.now)
      galoFim: 0,                           // ignorado: o galo fica até esta hora (Date.now) e some sozinho
      estrelasAte: 0,
      chocalhoSolto: false,
      ordemTeste: 0
    };
    q.chocalho = q.add.sprite(0, 0, 'chocalho', 0).setOrigin(0.5, 1).setVisible(false);
    q.galo = q.add.image(0, 0, 'galo').setOrigin(0, 0).setVisible(false);
    q.curativo = q.add.image(0, 0, 'curativo').setOrigin(0, 0).setVisible(false);
    q.estrelasDodoi = [0, 1, 2].map(() => q.add.image(0, 0, 'estrelinha').setOrigin(0.5).setVisible(false));
  },

  criarNuvem(q) {
    const I = CONFIG.EVENTOS.IMAGINACAO;
    q.nuvemIcone = q.add.image(I.ICONE_X, I.ICONE_Y, 'pensamentos', 0).setOrigin(0, 0);
    q.nuvem = q.add.container(I.X, I.Y, [q.add.image(0, 0, 'balao_pensamento').setOrigin(0, 0), q.nuvemIcone])
      .setVisible(false);
    q.tweens.add({ targets: q.nuvem, y: I.Y - 1, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Toque na nuvem: só funciona com ela na tela (desligada, não rouba o toque de quem está embaixo)
    q.nuvemToque = q.add.zone(I.X, I.Y, 34, 22).setOrigin(0, 0).setInteractive()
      .on('pointerup', () => EVENTOS.estourarNuvem(q));
    q.nuvemToque.input.enabled = false;

    // Mãozinhas do tutorial (painel e brinquedos)
    EVENTOS.criarTutorial(q);

    // TESTE: tocar nos quadros da parede dispara o próximo evento
    if (CONFIG.EVENTOS.TESTE_TOQUE_QUADROS) {
      const Q = CONFIG.QUARTO;
      q.add.zone(Q.QUADROS_X, Q.QUADROS_Y, 56, 36).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => {
          if (q.ev.ativo || q.painelAberto || q.mamando) return;
          const lista = CONFIG.EVENTOS.TESTE_ORDEM;
          const qual = lista[q.ev.ordemTeste++ % lista.length];
          if (qual === 'dodoi') EVENTOS.iniciar(q, 'chocalho', { forcarDodoi: true });
          else EVENTOS.iniciar(q, qual, { forcarDodoi: false });
        });
    }
  },

  // ---------- Save ----------
  salvo() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.eventos) || {};
  },
  gravar(mudancas) {
    const s = Estado.carregar();
    if (!s) return;
    s.eventos = Object.assign({}, s.eventos, mudancas);
    Estado.salvar();
  },
  contar(campo) {
    EVENTOS.gravar({ [campo]: (EVENTOS.salvo()[campo] || 0) + 1 });
  },

  // ---------- Sorteio ----------
  // O bebê está bem o bastante para um evento?
  pode(q) {
    return !q.mamando && !q.painelAberto && !q.recusando && !q.pulando && !q.dodoi
      && !q.marcoAgora && !q.cameraAberta && !q.itensBrincar && !q.manha
      && ['nada', 'triste'].includes(q.sinalBebe);
  },

  sortear(q) {
    const E = CONFIG.EVENTOS;
    const P = Object.assign({}, E.PESOS);
    const est = q && q.clima ? q.clima.estacao : '';
    if (est === 'outono' || est === 'inverno') P.espirro *= E.ESPIRRO.FATOR_FRIO;
    if (VINCULO.valor() < CONFIG.VINCULO.BEIJINHO_MIN) delete P.beijinho;
    const total = Object.values(P).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [k, peso] of Object.entries(P)) { r -= peso; if (r < 0) return k; }
    return 'imaginacao';
  },

  atualizar(q, seg) {
    const E = CONFIG.EVENTOS, ev = q.ev;
    if (!ev) return;
    if (ev.ativo === 'imaginacao') EVENTOS.passoImaginacao(q, seg);
    else if (ev.ativo === 'chocalho') EVENTOS.passoChocalho(q, seg);
    else if (ev.ativo === 'dodoi') EVENTOS.passoDodoi(q, seg);
    else if (ev.ativo === 'soluco') EVENTOS.passoSoluco(q, seg);
    else if (ev.ativo === 'brinquedo') EVENTOS.passoBrinquedo(q, seg);
    EVENTOS.passoBico(q, seg);           // v0.0.64: bico (pedido, tempo com o bico, manha)
    EVENTOS.passoResfriado(q, seg);      // v0.0.64: resfriado espirra mais
    EVENTOS.passoVinculo(q, seg);
    EVENTOS.conferirTutorial(q);
    if (ev.ativo) return;
    ev.espera -= seg;
    if (ev.espera > 0) return;
    ev.espera = E.CONFERIR_SEGUNDOS;
    if (!EVENTOS.pode(q) || Math.random() > E.CHANCE) return;
    EVENTOS.iniciar(q, EVENTOS.sortear(q), {});
  },

  iniciar(q, qual, opcoes) {
    if (!EVENTOS.pode(q)) return;
    q.ev.t = 0;
    if (qual === 'imaginacao') EVENTOS.iniciarImaginacao(q);
    else if (qual === 'chocalho') EVENTOS.iniciarChocalho(q, opcoes.forcarDodoi);
    else if (qual === 'soluco') EVENTOS.iniciarSoluco(q);
    else if (qual === 'espirro') EVENTOS.espirro(q);
    else if (qual === 'beijinho') EVENTOS.beijinho(q);
    else if (qual === 'bico') {                       // v0.0.65 (teste): força o pedido do bico
      if (q.chupetaAte) EVENTOS.tirarChupeta(q);      // se já está com o bico, tira para pedir de novo
      EVENTOS.iniciarBico(q);
    }
  },

  terminar(q) {
    q.ev.ativo = null;
    q.ev.espera = Math.max(q.ev.espera, CONFIG.EVENTOS.DESCANSO_SEGUNDOS);
  },

  // ---------- Imaginação ----------
  pensamentosPossiveis(q) {
    const n = NEC.atuais() || {};
    const lista = ['gato', 'bola', 'coracao'];
    if (q.noite) lista.push('lua', 'estrela'); else lista.push('sol', 'passaro');
    if (n.fome < 70 || n.sede < 70) lista.push('mamadeira', 'mamadeira');   // com fome, pensa mais na mamadeira
    return lista;
  },

  iniciarImaginacao(q) {
    const I = CONFIG.EVENTOS.IMAGINACAO;
    const sacola = Phaser.Utils.Array.Shuffle(EVENTOS.pensamentosPossiveis(q));
    q.ev.pensamentos = [...new Set(sacola)].slice(0, I.QUANTOS);
    q.ev.indice = -1;
    q.ev.ativo = 'imaginacao';
    q.nuvem.setVisible(true).setAlpha(0);
    q.tweens.add({ targets: q.nuvem, alpha: 1, duration: 250 });
    q.nuvemToque.input.enabled = true;
    EVENTOS.contar('imaginacoes');
    MOMENTOS.registrar('primeira_imaginacao');
  },

  passoImaginacao(q, seg) {
    const I = CONFIG.EVENTOS.IMAGINACAO, ev = q.ev;
    // Se ele começar a chorar ou for mamar, a imaginação some
    if (q.mamando || !['nada', 'triste'].includes(q.sinalBebe)) { EVENTOS.fimImaginacao(q); return; }
    ev.t += seg;
    const i = Math.floor(ev.t / I.SEGUNDOS_CADA);
    if (i >= ev.pensamentos.length) { EVENTOS.fimImaginacao(q); return; }
    if (i !== ev.indice) {
      ev.indice = i;
      q.nuvemIcone.setFrame(I.QUADROS.indexOf(ev.pensamentos[i])).setAlpha(0);
      q.tweens.add({ targets: q.nuvemIcone, alpha: 1, duration: 180 });
    }
  },

  fimImaginacao(q) {
    q.nuvemToque.input.enabled = false;
    q.tweens.add({ targets: q.nuvem, alpha: 0, duration: 250, onComplete: () => q.nuvem.setVisible(false) });
    EVENTOS.terminar(q);
  },

  // Tocar na nuvem: a bolha estoura em estrelinhas e o bebê acha graça
  estourarNuvem(q) {
    if (q.ev.ativo !== 'imaginacao' || q.painelAberto) return;
    const I = CONFIG.EVENTOS.IMAGINACAO;
    q.nuvemToque.input.enabled = false;
    q.nuvem.setVisible(false);
    const cx = I.X + 16, cy = I.Y + 10;
    [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.4]].forEach(([dx, dy]) => {
      const e = q.add.image(cx, cy, 'estrelinha').setOrigin(0.5);
      e.px = cx; e.py = cy;
      q.tweens.add({
        targets: e, px: cx + dx * 14, py: cy + dy * 10, alpha: 0, duration: 450, ease: 'Sine.easeOut',
        onUpdate: () => e.setPosition(Math.round(e.px), Math.round(e.py)), onComplete: () => e.destroy()
      });
    });
    NEC.mudar('diversao', I.DIVERSAO_ESTOURAR);
    q.atualizarNecessidades();
    VINCULO.mudar(CONFIG.VINCULO.BOLHA);
    MOMENTOS.registrar('primeira_bolha');
    tocarSom(q, 'estouro');
    EVENTOS.terminar(q);
  },

  // ---------- Chocalho ----------
  dodoiLiberado() {
    const ultimo = EVENTOS.salvo().ultimoDodoi || 0;
    return Date.now() - ultimo > CONFIG.EVENTOS.CHOCALHO.DODOI_INTERVALO_MINUTOS * 60000;
  },

  iniciarChocalho(q, forcarDodoi) {
    const C = CONFIG.EVENTOS.CHOCALHO, ev = q.ev;
    ev.ativo = 'chocalho';
    ev.vaiDarDodoi = forcarDodoi || (Math.random() < C.CHANCE_DODOI && EVENTOS.dodoiLiberado());
    ev.chocalhoSolto = false;
    q.tweens.killTweensOf(q.chocalho);
    q.chocalho.setVisible(true).setAlpha(1).setFrame(0).setAngle(-CONFIG.EVENTOS.CHOCALHO.BALANCO_GRAUS);
    q.brincando = true;
    q.visual.piscar(true, true);          // olhinhos felizes (^ ^) enquanto balança
    EVENTOS.contar('chocalhos');
    MOMENTOS.registrar('primeiro_chocalho');
    ev.somChocalho = 0;
  },

  passoChocalho(q, seg) {
    const C = CONFIG.EVENTOS.CHOCALHO, ev = q.ev;
    if (q.mamando || !['nada', 'triste'].includes(q.sinalBebe)) { EVENTOS.soltarChocalho(q); EVENTOS.fimChocalho(q, false); return; }
    ev.t += seg;
    // balança girando pela base do cabo (na mão do bebê): um lado, o outro
    q.chocalho.setAngle(Math.floor(ev.t * 1000 / C.BALANCO_MS) % 2 ? C.BALANCO_GRAUS : -C.BALANCO_GRAUS);
    ev.somChocalho -= seg;
    if (ev.somChocalho <= 0) { ev.somChocalho = 1.2; tocarSom(q, 'chocalho', { volume: 0.5 }); }
    if (ev.t < C.SEGUNDOS) return;
    if (ev.vaiDarDodoi) EVENTOS.iniciarDodoi(q);
    else {
      NEC.mudar('diversao', C.DIVERSAO);
      q.atualizarNecessidades();
      EVENTOS.soltarChocalho(q);
      EVENTOS.fimChocalho(q, true);
    }
  },

  // O chocalho cai no colchão e some
  soltarChocalho(q) {
    q.ev.chocalhoSolto = true;
    const c = q.chocalho;
    c.py = c.y;
    q.tweens.add({
      targets: c, py: c.y + 8, alpha: 0, duration: 400, ease: 'Sine.easeIn',
      onUpdate: () => { c.y = Math.round(c.py); },
      onComplete: () => { c.setVisible(false).setAngle(0); q.ev.chocalhoSolto = false; }
    });
  },

  fimChocalho(q, feliz) {
    q.brincando = false;
    if (!q.olhosDoToque && !q.mamando) q.visual.piscar(false);
    if (feliz) EVENTOS.coracao(q);
    EVENTOS.terminar(q);
  },

  // ---------- Dodói ----------
  iniciarDodoi(q) {
    const D = CONFIG.EVENTOS.DODOI, ev = q.ev;
    q.brincando = false;
    q.visual.piscar(false);
    ev.ativo = 'dodoi';
    ev.t = 0;
    ev.estrelasAte = D.ESTRELAS_SEGUNDOS;
    q.dodoi = true;                       // o Quarto mostra o choro forte e o balão do curativo
    if (ev.brinquedo) EVENTOS.devolverBrinquedo(q);   // o brinquedo volta para o chão
    else EVENTOS.soltarChocalho(q);
    MOMENTOS.registrar('primeiro_dodoi');
    q.cameras.main.shake(120, 0.006);     // "toc!"
    tocarSom(q, 'toc');
    EVENTOS.gravar({ ultimoDodoi: Date.now(), dodois: (EVENTOS.salvo().dodois || 0) + 1 });
  },

  passoDodoi(q, seg) {
    const D = CONFIG.EVENTOS.DODOI, ev = q.ev;
    ev.t += seg;
    if (ev.t >= D.ESPERA_SEGUNDOS) {
      // Ninguém cuidou: ele cansa de chorar, fica com o galo um tempo e menos animado
      NEC.mudar('diversao', D.DIVERSAO_IGNORADO);
      VINCULO.mudar(CONFIG.VINCULO.DODOI_IGNORADO);
      ev.galoFim = Date.now() + D.GALO_SEGUNDOS * 1000;
      EVENTOS.fimDodoi(q);
      q.atualizarNecessidades();
    }
  },

  // Toque no bebê durante o dodói: curativo na testa, carinho, para de chorar
  cuidarDodoi(q) {
    const D = CONFIG.EVENTOS.DODOI, ev = q.ev;
    if (!q.dodoi) return;
    ev.curativoAte = Date.now() + D.CURATIVO_MINUTOS * 60000;
    EVENTOS.gravar({ curativoAte: ev.curativoAte });
    ev.galoFim = 0;
    EVENTOS.fimDodoi(q);
    NEC.mudar('diversao', D.DIVERSAO_CUIDADO);
    q.atualizarNecessidades();
    VINCULO.mudar(CONFIG.VINCULO.CURATIVO);
    MOMENTOS.registrar('primeiro_curativo');
    q.olhosDoToque = true;
    q.visual.piscar(true, true);
    q.time.delayedCall(1000, () => { q.olhosDoToque = false; if (!q.mamando) q.visual.piscar(false); });
    EVENTOS.coracao(q);
    tocarSom(q, 'clique');
  },

  fimDodoi(q) {
    q.dodoi = false;
    q.ev.estrelasAte = 0;
    EVENTOS.terminar(q);
  },

  // O balão de pedido mostra o curativo (e o selo de choro forte)
  balaoDodoi(q) {
    const S = CONFIG.SINAIS, N = CONFIG.NECESSIDADES;
    q.balao.setVisible(!q.mamando);
    if (q.balaoIcone.texture.key !== 'icone_curativo') q.balaoIcone.setTexture('icone_curativo');
    q.balaoSelo.setFrame(S.SELO_QUADROS.forte).setVisible(true);
    q.balao.x = N.BALAO_X + (Math.floor(q.tempo / 0.08) % 2 ? 1 : -1) * S.TREMOR_BALAO_PIXELS;
  },

  coracao(q, dx = 0) {
    const Q = CONFIG.QUARTO;
    const c = q.add.image(Q.BEBE_X + 16 + dx, Q.BEBE_Y - 2, 'coracao').setOrigin(0.5, 1);
    c.posY = c.y;
    q.tweens.add({
      targets: c, posY: c.y - 18, alpha: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: () => { c.y = Math.round(c.posY); }, onComplete: () => c.destroy()
    });
  },

  // ---------- Tudo o que fica preso ao bebê (chamado a cada quadro) ----------
  seguirBebe(q, x, y, pose) {
    const E = CONFIG.EVENTOS, C = E.CHOCALHO, D = E.DODOI, ev = q.ev;
    if (!ev) return;
    const deitado = pose === 'esgotado';
    if (!ev.chocalhoSolto) q.chocalho.setPosition(x + C.MAO_X, y + C.MAO_Y);
    // galo: no dodói até cuidar; se ignorado, mais um tempo
    const temGalo = q.dodoi || Date.now() < ev.galoFim;
    const temCurativo = ev.curativoAte > Date.now();
    q.galo.setPosition(x + D.GALO_X, y + D.GALO_Y).setVisible(!!temGalo && !temCurativo && !deitado);
    q.curativo.setPosition(x + D.CURATIVO_X, y + D.CURATIVO_Y).setVisible(temCurativo && !deitado);
    if (q.narizResfriado) {   // v0.0.64: narizinho vermelho do resfriado
      const R = CONFIG.RESFRIADO;
      q.narizResfriado.setPosition(x + R.NARIZ_X, y + R.NARIZ_Y).setVisible(EVENTOS.resfriado() && !deitado && q.visual.camadas.corpo.visible);
    }
    // estrelinhas girando em volta da cabeça
    const giram = q.dodoi && ev.t < ev.estrelasAte;
    q.estrelasDodoi.forEach((e, i) => {
      e.setVisible(giram);
      if (!giram) return;
      const a = q.tempo * 2 * Math.PI / D.ESTRELAS_VOLTA_SEGUNDOS + i * 2 * Math.PI / 3;
      e.setPosition(Math.round(x + 16 + Math.cos(a) * D.ESTRELAS_RAIO_X), Math.round(y + D.ESTRELAS_Y + Math.sin(a) * D.ESTRELAS_RAIO_Y));
    });
  },

  // =============================================================
  // v0.0.58 — novos eventos
  // =============================================================

  // Texto curtinho que sobe e some ("hic!", "atchim!")
  textinho(q, x, y, texto) {
    const t = escrever(q, x, y, texto, {
      fontFamily: 'monospace', fontSize: '7px', color: '#ffffff', stroke: '#2a1838', strokeThickness: 3
    }).setOrigin(0.5, 1);
    t.py = y;
    q.tweens.add({
      targets: t, py: y - 10, alpha: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: () => { t.y = Math.round(t.py); }, onComplete: () => t.destroy()
    });
  },

  pulinho(q, pixels = 2, ms = 90, vezes = 0) {
    if (q.pulando) return;
    q.tweens.add({ targets: q, pulo: pixels, duration: ms, yoyo: true, repeat: vezes, ease: 'Sine.easeOut', onComplete: () => { q.pulo = 0; } });
  },

  // O gato da estante leva um susto e pula
  assustarGato(q) {
    const g = q.gatoBrinq;
    if (!g || g.ocupado) return;
    if (!q.textures.exists('gato_susto')) {          // sem o desenho do susto: só uns pulinhos
      const acao = g.acao;
      g.acao = 'pulinhos';
      q.mexerBrinquedo(g);
      g.acao = acao;
      return;
    }
    // v0.0.60: o gato some da prateleira e aparece o desenho dele pulando de susto
    const G = CONFIG.EVENTOS.GATO_SUSTO;
    g.ocupado = true;
    const x = g.x + G.DX, y = g.y + G.DY;
    const susto = q.add.image(x, y, 'gato_susto').setOrigin(0, 0);
    q.children.moveAbove(susto, g.img);
    g.img.setVisible(false);
    susto.py = y;
    q.tweens.add({
      targets: susto, py: y - G.PULO_PIXELS, duration: G.SEGUNDOS * 500, yoyo: true, ease: 'Sine.easeOut',
      onUpdate: () => { susto.y = Math.round(susto.py); },
      onComplete: () => { susto.destroy(); g.img.setVisible(true); g.ocupado = false; }
    });
  },

  // ---------- Soluço: tocar no bebê (carinho) ou dar a mamadeira faz passar ----------
  iniciarSoluco(q) {
    q.ev.ativo = 'soluco';
    q.ev.t = 0;
    q.ev.proxHic = 0.3;
    MOMENTOS.registrar('primeiro_soluco');
  },

  passoSoluco(q, seg) {
    const S = CONFIG.EVENTOS.SOLUCO, ev = q.ev, Q = CONFIG.QUARTO;
    if (q.mamando) { EVENTOS.fimSoluco(q, true); return; }          // a mamadeira faz passar
    if (!['nada', 'triste'].includes(q.sinalBebe)) { EVENTOS.fimSoluco(q, false, true); return; }
    ev.t += seg;
    ev.proxHic -= seg;
    if (ev.proxHic <= 0) {
      ev.proxHic = S.INTERVALO;
      EVENTOS.pulinho(q, 2, 70);
      EVENTOS.textinho(q, Q.BEBE_X + 30, Q.BEBE_Y + 4, 'hic!');
      tocarSom(q, 'hic', { volume: 0.7 });
    }
    if (ev.t >= S.SEGUNDOS) {
      NEC.mudar('diversao', S.DIVERSAO_IGNORADO);
      VINCULO.mudar(CONFIG.VINCULO.SOLUCO_IGNORADO);
      q.atualizarNecessidades();
      EVENTOS.fimSoluco(q, false);
    }
  },

  cuidarSoluco(q) {
    if (q.ev.ativo !== 'soluco') return false;
    VINCULO.mudar(CONFIG.VINCULO.SOLUCO);
    EVENTOS.fimSoluco(q, true);
    return true;
  },

  fimSoluco(q, cuidado, semNada) {
    if (cuidado) EVENTOS.coracao(q);
    EVENTOS.terminar(q);
  },

  // ---------- Espirro: "atchim!", gotinhas, e o gato pula de susto ----------
  espirro(q) {
    const Q = CONFIG.QUARTO;
    q.ev.ativo = 'espirro';
    q.olhosDoToque = true;
    q.visual.piscar(true);                       // fecha os olhos... ah... ah...
    EVENTOS.pulinho(q, 1, 250);
    q.time.delayedCall(550, () => {
      EVENTOS.textinho(q, Q.BEBE_X + 30, Q.BEBE_Y + 6, 'atchim!');
      tocarSom(q, 'espirro', { volume: 0.8 });
      q.recusaDx = 1;
      q.time.delayedCall(90, () => { q.recusaDx = 0; });
      for (let i = 0; i < 4; i++) {
        const g = q.add.rectangle(Q.BEBE_X + 16, Q.BEBE_Y + 17, 1, 1, 0xcfe8ff).setOrigin(0, 0);
        g.px = g.x; g.py = g.y;
        q.tweens.add({
          targets: g, px: g.x + Phaser.Math.Between(-8, 8), py: g.y + Phaser.Math.Between(4, 9), alpha: 0, duration: 450,
          onUpdate: () => g.setPosition(Math.round(g.px), Math.round(g.py)), onComplete: () => g.destroy()
        });
      }
      EVENTOS.assustarGato(q);
      MOMENTOS.registrar('primeiro_espirro');
    });
    q.time.delayedCall(1100, () => {
      q.olhosDoToque = false;
      if (!q.mamando) q.visual.piscar(false);
      EVENTOS.terminar(q);
    });
  },

  // ---------- Beijinho (vínculo alto): manda um coração para você ----------
  beijinho(q) {
    const Q = CONFIG.QUARTO;
    q.ev.ativo = 'beijinho';
    q.olhosDoToque = true;
    q.visual.piscar(true, true);
    tocarSom(q, 'beijinho', { volume: 0.7 });
    const c = q.add.image(Q.BEBE_X + 16, Q.BEBE_Y + 16, 'coracao').setOrigin(0.5).setScale(1);
    c.py = c.y;
    q.tweens.add({
      targets: c, py: c.y - 40, scale: 2, duration: 1100, ease: 'Sine.easeOut',
      onUpdate: () => { c.y = Math.round(c.py); },
      onComplete: () => q.tweens.add({ targets: c, alpha: 0, duration: 300, onComplete: () => c.destroy() })
    });
    MOMENTOS.registrar('primeiro_beijinho');
    q.time.delayedCall(1300, () => {
      q.olhosDoToque = false;
      if (!q.mamando) q.visual.piscar(false);
      EVENTOS.terminar(q);
    });
  },

  // ---------- Trovão: o bebê leva um susto (pula e chora um pouquinho) ----------
  trovao(q) {
    if (!CLIMA.forcado) MOMENTOS.registrar('primeiro_trovao');
    EVENTOS.assustarGato(q);
    if (q.mamando || q.dodoi || q.poseAtual === 'esgotado' || q.ev.ativo === 'brinquedo') return;
    if (q.cortinaFechada) return;      // v0.0.64: com a cortina fechada o bebê nem viu o raio
    EVENTOS.pulinho(q, 3, 80);
    q.susto = true;
    if (q.timerSusto) q.timerSusto.remove();
    q.timerSusto = q.time.delayedCall(CONFIG.EVENTOS.TROVAO.CHORO_SEGUNDOS * 1000, () => { q.susto = false; });
  },

  // ---------- Brinquedo arrastado até o berço (15% de dodói) ----------
  podeBrinquedo(q) {
    return !q.ev.ativo && EVENTOS.pode(q);
  },

  iniciarBrinquedo(q, b) {
    const B = CONFIG.EVENTOS.BRINQUEDO, ev = q.ev;
    if (q.tarefa) q.tarefa('brinquedo');   // v0.0.64: tarefa do dia
    ev.ativo = 'brinquedo';
    ev.t = 0;
    ev.brinquedo = b;
    ev.vaiDarDodoi = Math.random() < B.CHANCE_DODOI;
    b.ocupado = true;
    b.noBerco = true;
    b.img.setPosition(B.X, B.BASE_Y - b.img.height);
    q.children.moveAbove(b.img, q.chocalho);       // na frente do berço, ao lado do bebê
    q.brincando = true;
    q.visual.piscar(true, true);
    tocarSom(q, 'risada', { volume: 0.6 });
    MOMENTOS.registrar('primeiro_brinquedo');
    EVENTOS.aprendeu(q, 'brinquedo');
  },

  passoBrinquedo(q, seg) {
    const B = CONFIG.EVENTOS.BRINQUEDO, ev = q.ev, b = ev.brinquedo;
    if (!b) return;
    if (q.mamando || !['nada', 'triste'].includes(q.sinalBebe)) { EVENTOS.devolverBrinquedo(q); EVENTOS.fimBrinquedo(q, false); return; }
    ev.t += seg;
    const sobe = Math.floor(ev.t / B.PULO_SEGUNDOS) % 2 ? B.PULO_PIXELS : 0;
    b.img.setPosition(B.X, B.BASE_Y - b.img.height - sobe);
    if (ev.t < B.SEGUNDOS) return;
    if (ev.vaiDarDodoi) { EVENTOS.iniciarDodoi(q); return; }
    NEC.mudar('diversao', B.DIVERSAO);
    VINCULO.mudar(CONFIG.VINCULO.BRINQUEDO);
    q.atualizarNecessidades();
    EVENTOS.devolverBrinquedo(q);
    EVENTOS.fimBrinquedo(q, true);
  },

  // O brinquedo volta para o lugar dele no chão
  devolverBrinquedo(q) {
    const b = q.ev.brinquedo;
    if (!b) return;
    q.ev.brinquedo = null;
    q.tweens.add({
      targets: b.img, x: b.x, y: b.y, duration: 450, ease: 'Sine.easeInOut',
      onComplete: () => { q.children.moveBelow(b.img, q.bercoTras); b.ocupado = false; b.noBerco = false; }
    });
  },

  fimBrinquedo(q, feliz) {
    q.brincando = false;
    if (!q.olhosDoToque && !q.mamando) q.visual.piscar(false);
    if (feliz) EVENTOS.coracao(q);
    EVENTOS.terminar(q);
  },

  // ---------- Recepção na volta (depende do vínculo) ----------
  voltou(q, ms) {
    if (ms >= CONFIG.TEMPO.ABANDONO_ALERTA_HORAS * 3600000) VINCULO.mudar(CONFIG.VINCULO.LONGE_DEMAIS);
    q.time.delayedCall(800, () => EVENTOS.recepcao(q));
  },

  recepcao(q) {
    if (!EVENTOS.pode(q) || q.ev.ativo) return;
    const festa = VINCULO.valor() >= CONFIG.VINCULO.RECEPCAO_MIN;
    q.olhosDoToque = true;
    q.visual.piscar(true, true);
    EVENTOS.pulinho(q, 3, 110, festa ? 1 : 0);
    const coracoes = festa ? 3 : 1;
    for (let i = 0; i < coracoes; i++) q.time.delayedCall(i * 250, () => EVENTOS.coracao(q, (i - 1) * 6));
    if (festa) { tocarSom(q, 'risada', { volume: 0.7 }); MOMENTOS.registrar('primeira_recepcao'); }
    if (MARCOS.tem('tchau')) EVENTOS.tchauzinho(q);
    q.time.delayedCall(1500, () => { q.olhosDoToque = false; if (!q.mamando) q.visual.piscar(false); });
  },

  // Marco "Dá tchauzinho" (v0.0.63): ao voltar, a mãozinha do bebê acena
  tchauzinho(q) {
    const Q = CONFIG.QUARTO;
    const mao = q.add.image(Q.BEBE_X + 27, Q.BEBE_Y + 14, 'mao_tchau').setOrigin(0.5, 1).setDepth(36);
    q.tweens.add({ targets: mao, angle: { from: -25, to: 25 }, duration: 160, yoyo: true, repeat: 4,
      onComplete: () => q.tweens.add({ targets: mao, alpha: 0, duration: 200, onComplete: () => mao.destroy() }) });
  },

  // ---------- Bico / chupeta (v0.0.64) ----------
  // O bebê pede o bico num balão. Dar (tocar no bebê, tocar no balão ou arrastar o
  // bico até ele): fica com o bico 1 minuto e o vício sobe. Trocar por um brinquedo
  // (arrastar até o berço): o vício desce; se já está viciado, chora um pouco (manha)
  // até ganhar um carinho.
  dadosBico() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.bico) || { vicio: 0, dados: 0, trocas: 0 };
  },

  gravarBico(muda) {
    const s = Estado.carregar();
    if (!s) return;
    s.bico = Object.assign({ vicio: 0, dados: 0, trocas: 0 }, s.bico || {});
    muda(s.bico);
    Estado.salvar();
  },

  chanceBico() {
    const B = CONFIG.EVENTOS.BICO;
    const porDia = Math.min(0.95, B.CHANCE_DIA + EVENTOS.dadosBico().vicio * B.VICIO_POR_NIVEL);
    const segundosPorDia = CONFIG.TEMPO.DIAS_REAIS_POR_ANO * 86400 / 365;
    return porDia * B.CONFERIR_SEGUNDOS / segundosPorDia;
  },

  passoBico(q, seg) {
    const B = CONFIG.EVENTOS.BICO, ev = q.ev;
    // acabou o minuto com o bico
    if (q.chupetaAte && q.time.now >= q.chupetaAte) EVENTOS.tirarChupeta(q);
    if (ev.ativo === 'bico') {
      ev.t += seg;
      if (ev.t >= B.ESPERA_SEGUNDOS) EVENTOS.bicoIgnorado(q);
      return;
    }
    if (ev.ativo || q.chupetaAte || q.manha) return;
    q.bicoDescanso = (q.bicoDescanso || 0) - seg;
    q.bicoConferir = (q.bicoConferir === undefined ? B.CONFERIR_SEGUNDOS : q.bicoConferir) - seg;
    if (q.bicoConferir > 0 || q.bicoDescanso > 0) return;
    q.bicoConferir = B.CONFERIR_SEGUNDOS;
    if (EVENTOS.pode(q) && Math.random() < EVENTOS.chanceBico()) EVENTOS.iniciarBico(q);
  },

  iniciarBico(q) {
    if (!EVENTOS.pode(q) || q.ev.ativo) return false;
    const N = CONFIG.NECESSIDADES, Q = CONFIG.QUARTO;
    q.ev.ativo = 'bico';
    q.ev.t = 0;
    MOMENTOS.registrar('primeiro_bico');
    tocarSom(q, 'choro', { volume: 0.25, rate: 1.5 });     // um "hmm" curtinho
    q.mostrarBalao();
    // o bico do balão: tocar dá o bico; arrastar até o bebê também
    const zona = q.zonaBico = q.add.zone(N.BALAO_X - 2, N.BALAO_Y - 4, 32, 30).setOrigin(0, 0)
      .setInteractive({ draggable: true }).setDepth(60);
    let arrastou = false;
    zona.on('dragstart', (p) => {
      arrastou = true;
      q.balao.setVisible(false);
      q.chupetaVoando = q.add.image(p.worldX, p.worldY, 'icone_chupeta').setDepth(61);
    });
    zona.on('drag', (p) => { if (q.chupetaVoando) q.chupetaVoando.setPosition(Math.round(p.worldX), Math.round(p.worldY)); });
    zona.on('dragend', (p) => {
      if (q.chupetaVoando) { q.chupetaVoando.destroy(); q.chupetaVoando = null; }
      const noBebe = p.worldX >= Q.BEBE_X - 6 && p.worldX <= Q.BEBE_X + 38 && p.worldY >= Q.BEBE_Y - 6 && p.worldY <= Q.BEBE_Y + 38;
      if (noBebe) EVENTOS.darBico(q);
      else { arrastou = false; q.mostrarBalao(); }
    });
    zona.on('pointerup', () => { if (!arrastou) EVENTOS.darBico(q); });
    return true;
  },

  balaoBico(q) {
    const N = CONFIG.NECESSIDADES;
    if (q.chupetaVoando) { q.balao.setVisible(false); return; }
    q.balao.setVisible(!q.mamando);
    if (q.balaoIcone.texture.key !== 'icone_chupeta') q.balaoIcone.setTexture('icone_chupeta');
    q.balaoSelo.setVisible(false);
    q.balao.x = N.BALAO_X;
  },

  fimPedidoBico(q) {
    if (q.zonaBico) { q.zonaBico.destroy(); q.zonaBico = null; }
    if (q.chupetaVoando) { q.chupetaVoando.destroy(); q.chupetaVoando = null; }
    q.ev.ativo = null;
    q.bicoDescanso = CONFIG.EVENTOS.BICO.DESCANSO_SEGUNDOS;
    q.ev.espera = Math.max(q.ev.espera, 10);
    q.mostrarBalao();
  },

  darBico(q) {
    if (q.ev.ativo !== 'bico') return;
    const B = CONFIG.EVENTOS.BICO;
    EVENTOS.fimPedidoBico(q);
    EVENTOS.gravarBico(b => { b.vicio = Math.min(B.VICIO_MAX, b.vicio + 1); b.dados++; });
    q.chupetaAte = q.time.now + B.SEGUNDOS_COM_BICO * 1000;
    q.visual.chupeta(true);
    tocarSom(q, 'beijinho', { volume: 0.5 });
    EVENTOS.coracao(q, 0);
    q.atualizarNecessidades();
  },

  tirarChupeta(q) {
    q.chupetaAte = null;
    if (q.visual) q.visual.chupeta(false);
  },

  // Brinquedo arrastado até o berço enquanto ele pede o bico
  trocarBico(q, brinq) {
    const B = CONFIG.EVENTOS.BICO;
    const viciado = EVENTOS.dadosBico().vicio >= B.VICIADO_A_PARTIR;
    EVENTOS.fimPedidoBico(q);
    EVENTOS.gravarBico(b => { b.vicio = Math.max(0, b.vicio - 1); b.trocas++; });
    VINCULO.mudar(B.VINCULO_TROCA);
    MOMENTOS.registrar('trocou_bico');
    if (!viciado) { EVENTOS.iniciarBrinquedo(q, brinq); return true; }
    if (q.tarefa) q.tarefa('brinquedo');   // deu o brinquedo (mesmo com a manha)
    // viciado: chora um pouco (manha); o brinquedo volta para o chão; um carinho faz parar
    q.manha = true;
    tocarSom(q, 'choro', { volume: 0.5 });
    if (q.timerManha) q.timerManha.remove();
    q.timerManha = q.time.delayedCall(B.MANHA_SEGUNDOS * 1000, () => { q.manha = false; });
    return false;
  },

  acalmarManha(q) {
    if (!q.manha) return;
    q.manha = false;
    if (q.timerManha) { q.timerManha.remove(); q.timerManha = null; }
    VINCULO.mudar(CONFIG.EVENTOS.BICO.VINCULO_CARINHO_MANHA);
    q.time.delayedCall(150, () => EVENTOS.coracao(q, -7));
  },

  bicoIgnorado(q) {
    EVENTOS.fimPedidoBico(q);
    NEC.mudar('diversao', -2);
    q.visual.olharBaixo(true);
    q.time.delayedCall(800, () => q.visual && q.visual.olharBaixo(false));
    q.atualizarNecessidades();
  },

  // ---------- Resfriado (v0.0.64) ----------
  // No frio (CONFIG.RESFRIADO.FRIO_ATE) com as cortinas ABERTAS, a cada hora do jogo
  // há uma chance de o bebê ficar resfriado: espirra muito e fica com o narizinho
  // vermelho por algumas horas do jogo. Fechar as cortinas no frio evita.
  // (Remédio e médico entram com as doenças, numa etapa futura.)
  resfriado() {
    const s = Estado.dados || Estado.carregar();
    return !!(s && s.saude && s.saude.resfriadoAte && TEMPO.minutosDeVida() < s.saude.resfriadoAte);
  },

  conferirResfriado(q) {
    const R = CONFIG.RESFRIADO;
    const c = q.clima;
    if (!c || EVENTOS.resfriado() || q.cortinaFechada) return;
    if (c.temperatura > R.FRIO_ATE) return;
    if (Math.random() < R.CHANCE_HORA) EVENTOS.pegarResfriado(q);
  },

  pegarResfriado(q) {
    const R = CONFIG.RESFRIADO;
    const s = Estado.carregar();
    if (!s) return;
    s.saude = Object.assign({}, s.saude, { resfriadoAte: TEMPO.minutosDeVida() + R.HORAS * 60 });
    Estado.salvar();
    MOMENTOS.registrar('primeiro_resfriado');
    mostrarAvisoCaixa(q, 'Ficou resfriado!\nNo frio, feche a cortina.', 44, 3.5);
    q.proximoEspirroResfriado = 2;
  },

  passoResfriado(q, seg) {
    const R = CONFIG.RESFRIADO;
    const doente = EVENTOS.resfriado();
    if (!q.narizResfriado) q.narizResfriado = q.add.rectangle(0, 0, 2, 1, 0xe8606e).setOrigin(0, 0).setVisible(false);
    if (!doente) { q.narizResfriado.setVisible(false); return; }
    if (q.proximoEspirroResfriado === null || q.proximoEspirroResfriado === undefined) {
      q.proximoEspirroResfriado = Phaser.Math.FloatBetween(R.ESPIRRO_INTERVALO[0], R.ESPIRRO_INTERVALO[1]);
    }
    q.proximoEspirroResfriado -= seg;
    if (q.proximoEspirroResfriado <= 0 && !q.ev.ativo && EVENTOS.pode(q)) {
      q.proximoEspirroResfriado = Phaser.Math.FloatBetween(R.ESPIRRO_INTERVALO[0], R.ESPIRRO_INTERVALO[1]);
      EVENTOS.espirro(q);
    }
  },

  // ---------- Marcos do desenvolvimento (v0.0.63) ----------
  // Chamado de tempos em tempos pelo quarto. Um marco por vez, com festinha.
  conferirMarco(q) {
    if (q.marcoAgora || q.festaAgora || q.painelAberto || q.fechandoPainel || q.itensBrincar || q.cameraAberta || q.mamando) return;
    if (q.ev && q.ev.ativo) return;
    const m = MARCOS.conferir();
    if (!m) return;
    const M = CONFIG.MARCOS, Q = CONFIG.QUARTO;
    q.marcoAgora = true;
    if (m.id === 'dentinho') q.visual.dentinho(true);   // v0.0.64: aparece no sorriso
    const i = M.LISTA.indexOf(m);
    tocarSom(q, 'marco');
    mostrarAvisoCaixa(q, 'Novo marco!\n' + m.nome, 44, M.AVISO_SEGUNDOS);
    q.olhosDoToque = true;
    q.visual.piscar(true, true);
    EVENTOS.pulinho(q, 2, 120, 0);
    // a medalha sobe do bebê, com estrelinhas em volta
    const cx = Q.BEBE_X + 16, cy = Q.BEBE_Y + 2;
    const med = q.add.image(cx, cy, 'icones_marcos', i).setDepth(45).setScale(2).setAlpha(0);
    q.tweens.add({ targets: med, y: cy - 22, alpha: 1, duration: 500, ease: 'Back.easeOut' });
    for (let k = 0; k < 8; k++) {
      const ang = k * Math.PI / 4;
      const e = q.add.rectangle(cx, cy - 22, 2, 2, 0xffd860).setDepth(44);
      q.tweens.add({ targets: e, x: cx + Math.cos(ang) * 16, y: cy - 22 + Math.sin(ang) * 16, alpha: 0, delay: 400, duration: 600, onComplete: () => e.destroy() });
    }
    q.time.delayedCall(M.AVISO_SEGUNDOS * 1000, () => {
      q.tweens.add({ targets: med, alpha: 0, duration: 300, onComplete: () => med.destroy() });
      q.olhosDoToque = false;
      if (!q.mamando && q.visual) q.visual.piscar(false);
      q.marcoAgora = false;
    });
  },

  // ---------- Aniversário (a cada ano; o mesversário saiu na v0.0.63) ----------
  conferirFesta(q) {
    const i = TEMPO.idade();
    const meses = i.anos * 12 + i.meses;
    const s = Estado.dados || Estado.carregar();
    if (!s) return;
    if (!s.festas) { const x = Estado.carregar(); x.festas = { ultimoMes: meses }; Estado.salvar(); return; }
    if (meses <= s.festas.ultimoMes || q.painelAberto || q.festaAgora) return;
    const mesAntes = s.festas.ultimoMes;
    const x = Estado.carregar();
    x.festas = { ultimoMes: meses };
    Estado.salvar();
    // v0.0.63: sem mesversário (decisão do autor: o bebê quase sempre está ~1 mês mais
    // velho a cada visita, e a festa aparecia toda vez). Só aniversário, a cada ano completo,
    // mesmo que a volta do jogador pule o mês exato do aniversário.
    const anosAntes = Math.floor(mesAntes / 12), anos = Math.floor(meses / 12);
    if (anos > anosAntes && anos >= 1) EVENTOS.festa(q, 'ano', anos);
  },

  festa(q, tipo, n) {
    const F = CONFIG.FESTA, Q = CONFIG.QUARTO;
    const nome = q.bebe.nome || (q.bebe.sexo === 'F' ? 'A bebê' : 'O bebê');
    q.festaAgora = true;
    const texto = tipo === 'mes'
      ? nome + ' fez ' + n + (n === 1 ? ' mês!' : ' meses!') + '\nFeliz mesversário!'
      : nome + ' fez ' + n + (n === 1 ? ' ano!' : ' anos!') + '\nFeliz aniversário!';
    mostrarAvisoCaixa(q, texto, 44, F.SEGUNDOS - 2);
    MOMENTOS.registrar((tipo === 'mes' ? 'mesversario_' : 'aniversario_') + n, { n });
    tocarSom(q, 'festa', { volume: 0.8 });
    // Bolo com velinha (v0.0.60: bolo e mesinha do autor, azul para menino e rosa para menina)
    const lado = q.bebe.sexo === 'F' ? 'menina' : 'menino';
    const chaveBolo = q.textures.exists('bolo_' + lado) ? 'bolo_' + lado : 'bolo';
    const temMesa = q.textures.exists('mesa_' + lado);
    const mesa = temMesa ? q.add.image(F.MESA_X, F.MESA_Y, 'mesa_' + lado).setOrigin(0, 0).setDepth(40).setAlpha(0) : null;
    const bolo = temMesa
      ? q.add.sprite(F.MESA_X + F.BOLO_NA_MESA_X, F.MESA_Y + F.BOLO_NA_MESA_Y, chaveBolo, 0)
      : q.add.sprite(F.BOLO_X, F.BOLO_Y, chaveBolo, 0);
    bolo.setOrigin(0, 0).setDepth(40).setAlpha(0);
    const enfeites = mesa ? [mesa, bolo] : [bolo];
    q.tweens.add({ targets: enfeites, alpha: 1, duration: 300 });
    const quadros = Math.max(1, q.textures.get(chaveBolo).frameTotal - 1);
    let quadro = 0;
    const vela = q.time.addEvent({ delay: Math.round(1000 / F.VELA_FPS), loop: true,
      callback: () => { quadro = (quadro + 1) % quadros; bolo.setFrame(quadro); } });
    // Confete caindo
    const cores = [0xff6e8c, 0xffd860, 0x6ec8ff, 0x8ce07a, 0xc89cff, 0xffffff];
    const confete = [];
    for (let i = 0; i < F.CONFETES; i++) {
      const c = q.add.rectangle(Phaser.Math.Between(0, CONFIG.LARGURA), Phaser.Math.Between(-60, -2), i % 3 ? 2 : 1, 2,
        cores[i % cores.length]).setOrigin(0, 0).setDepth(41);
      c.px = c.x; c.py = c.y; c.v = Phaser.Math.FloatBetween(35, 70); c.fase = Math.random() * 6;
      confete.push(c);
    }
    const caiu = q.time.addEvent({ delay: 33, loop: true, callback: () => {
      for (const c of confete) {
        c.py += c.v * 0.033; c.px += Math.sin(c.py / 9 + c.fase) * 0.5;
        if (c.py > CONFIG.ALTURA) { c.py = -4; c.px = Phaser.Math.Between(0, CONFIG.LARGURA); }
        c.setPosition(Math.round(c.px), Math.round(c.py));
      }
    } });
    // Aniversário: balões subindo
    const baloes = [];
    if (tipo === 'ano') {
      const tons = [0xff6e8c, 0x6ec8ff, 0xffd860, 0x8ce07a];
      for (let i = 0; i < F.BALOES; i++) {
        const b = q.add.image(20 + i * 42, CONFIG.ALTURA + 4 + i * 12, 'balao_visita').setOrigin(0, 0).setScale(2)
          .setTint(tons[i % tons.length]).setDepth(41);
        b.py = b.y;
        q.tweens.add({ targets: b, py: -30, duration: F.SEGUNDOS * 1000, onUpdate: () => { b.y = Math.round(b.py); } });
        baloes.push(b);
      }
    }
    // O bebê comemora
    q.olhosDoToque = true;
    q.visual.piscar(true, true);
    EVENTOS.pulinho(q, 3, 120, 3);
    q.time.delayedCall(F.SEGUNDOS * 1000, () => {
      vela.remove(); caiu.remove();
      q.tweens.add({ targets: [...enfeites, ...confete, ...baloes], alpha: 0, duration: 500,
        onComplete: () => [...enfeites, ...confete, ...baloes].forEach(o => o.destroy()) });
      q.olhosDoToque = false;
      if (!q.mamando) q.visual.piscar(false);
      q.festaAgora = false;
    });
  },

  // ---------- Vínculo: cai devagar enquanto ele fica esgotado ----------
  passoVinculo(q, seg) {
    if (q.poseAtual !== 'esgotado') return;
    q.ev.esgotadoT = (q.ev.esgotadoT || 0) + seg;
    if (q.ev.esgotadoT >= 60) { q.ev.esgotadoT = 0; VINCULO.mudar(CONFIG.VINCULO.ESGOTADO_POR_MINUTO); }
  },

  // ---------- Tutorial: mãozinhas que aparecem uma vez só ----------
  criarTutorial(q) {
    const T = CONFIG.TUTORIAL;
    q.maoPainel = q.add.sprite(T.MAO_PAINEL_X, T.MAO_PAINEL_Y, 'maozinha', 0).setOrigin(0, 0).setFlipX(true)
      .setVisible(false).play('maozinha_aponta');
    q.maoBrinquedo = q.add.sprite(T.MAO_BRINQUEDO_X, T.MAO_BRINQUEDO_Y, 'maozinha', 0).setOrigin(0, 0)
      .setVisible(false).play('maozinha_aponta');
    // v0.0.62: aponta para o baú das brincadeiras (depois de aprender os brinquedos)
    q.maoBau = q.add.sprite(T.MAO_BAU_X, T.MAO_BAU_Y, 'maozinha', 0).setOrigin(0, 0)
      .setVisible(false).play('maozinha_aponta');
  },

  conferirTutorial(q) {
    if (!q.maoPainel) return;
    q.ev.timerTut = (q.ev.timerTut || 0) - 1;
    if (q.ev.timerTut > 0) return;
    q.ev.timerTut = 20;                        // confere a cada ~20 quadros
    const T = CONFIG.TUTORIAL;
    const s = Estado.dados || {};
    const vistos = s.sinais || {};
    const n = NEC.atuais();
    if (!n) return;
    const ocupada = q.maozinha && q.maozinha.visible;
    if (!vistos.mao_painel && !ocupada && !q.painelAberto && NEC.ativas().some(k => n[k] < T.PAINEL_ABAIXO_DE)) {
      q.maoPainel.setVisible(true);
    }
    if (!vistos.mao_brinquedo && !ocupada && !q.maoPainel.visible && n.diversao < T.BRINQUEDO_ABAIXO_DE && !q.painelAberto) {
      q.maoBrinquedo.setVisible(true);
    }
    if (q.maoBau && !vistos.mao_bau && vistos.mao_brinquedo && !ocupada && !q.maoPainel.visible && !q.maoBrinquedo.visible
      && n.diversao < T.BAU_ABAIXO_DE && !q.painelAberto && !q.cameraAberta) {
      q.maoBau.setVisible(true);
    }
  },

  // O jogador fez o que a mãozinha mostrava: some para sempre
  aprendeu(q, qual) {
    const mao = qual === 'painel' ? q.maoPainel : qual === 'bau' ? q.maoBau : q.maoBrinquedo;
    if (mao) mao.setVisible(false);
    const s = Estado.carregar();
    if (!s || (s.sinais && s.sinais['mao_' + qual])) return;
    s.sinais = Object.assign({}, s.sinais, { ['mao_' + qual]: true });
    Estado.salvar();
  }
};

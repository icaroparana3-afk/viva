// =============================================================
// janela.js — o tempo lá fora visto pela janela do quarto (v0.0.58).
//
// Tudo isto fica ATRÁS do desenho do quarto: o vidro é transparente,
// então o que sai do vidro some atrás da parede sozinho.
//   sol (força pela estação), véu do céu (nublado, chuva, seco),
//   gotas (chuva fraca, forte, temporal com vento), flocos (neve),
//   folhas secas (outono), raio (temporal) e as visitas
//   (passarinho, borboleta, abelha, balão), mais frequentes no verão
//   e nenhuma no inverno ou com chuva.
// Por cima do quarto: luz do sol, sombra dos dias fechados e o clarão do raio.
//
// Usado pelo Quarto.js:
//   JANELA_VIVA.criar(q)        logo depois de criarJanela()
//   JANELA_VIVA.criarLuz(q)     depois do escuro da noite
//   JANELA_VIVA.conferir(q)     a cada segundo (e quando vira dia/noite)
//   JANELA_VIVA.atualizar(q, seg)
//   JANELA_VIVA.agendarVisita(q)
// =============================================================

const JANELA_VIVA = {

  criar(q) {
    const J = CONFIG.JANELA, C = CONFIG.CLIMA;
    // Sol: dentro do céu do dia (some à noite junto com ele), atrás das nuvens
    q.solJanela = q.add.image(C.SOL_X, C.SOL_Y, 'sol_janela').setOrigin(0, 0);
    q.dia.addAt(q.solJanela, 2);
    // Véu por cima do céu (dia e noite)
    q.veuJanela = q.add.rectangle(J.X - 2, J.Y - 2, J.LARGURA + 4, J.ALTURA + 4, 0x8890a0, 1).setOrigin(0, 0).setAlpha(0);
    // Visitas (dentro do céu do dia)
    q.borboleta = q.add.sprite(0, 0, 'borboleta', 0).setOrigin(0, 0).setVisible(false);
    q.abelha = q.add.sprite(0, 0, 'abelha', 0).setOrigin(0, 0).setVisible(false);
    q.balaoVisita = q.add.image(0, 0, 'balao_visita').setOrigin(0, 0).setVisible(false);
    q.dia.add([q.borboleta, q.abelha, q.balaoVisita]);
    if (!q.anims.exists('borboleta_voa')) {
      q.anims.create({ key: 'borboleta_voa', frames: q.anims.generateFrameNumbers('borboleta', { frames: [0, 1] }), frameRate: 6, repeat: -1 });
      q.anims.create({ key: 'abelha_voa', frames: q.anims.generateFrameNumbers('abelha', { frames: [0, 1] }), frameRate: 14, repeat: -1 });
      q.anims.create({ key: 'folha_seca_gira', frames: q.anims.generateFrameNumbers('folha_seca', { frames: [0, 1, 2, 3] }), frameRate: 5, repeat: -1 });
    }
    q.borboleta.play('borboleta_voa');
    q.abelha.play('abelha_voa');
    // Chuva, neve, folhas e raio (na frente do céu, atrás do quarto)
    q.gotas = [];
    for (let i = 0; i < 40; i++) q.gotas.push(q.add.rectangle(0, 0, 1, 3, 0xcfe8ff, 0.85).setOrigin(0, 0).setVisible(false));
    q.flocos = [];
    for (let i = 0; i < C.FLOCOS; i++) q.flocos.push(q.add.rectangle(0, 0, i % 4 ? 1 : 2, i % 4 ? 1 : 2, 0xffffff, 1).setOrigin(0, 0).setVisible(false));
    q.folhasSecas = [0, 1, 2].map(() => q.add.sprite(0, 0, 'folha_seca', 0).setOrigin(0, 0).setVisible(false).play('folha_seca_gira'));
    q.raioJanela = q.add.image(0, 0, 'raio_janela').setOrigin(0, 0).setVisible(false);
    q.ventoFator = 1;
    q.climaChave = '';
    q.timerFolha = 1;
    q.timerRaio = 3;
    q.climaTempo = 0;
  },

  criarLuz(q) {
    const J = CONFIG.JANELA;
    q.luzSol = q.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0xffe08a, 1).setOrigin(0, 0)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    q.sombraClima = q.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0x30384a, 1).setOrigin(0, 0).setAlpha(0);
    q.flash = q.add.rectangle(0, 0, CONFIG.LARGURA, CONFIG.ALTURA, 0xffffff, 1).setOrigin(0, 0).setAlpha(0).setDepth(80);
    // Tocar na janela: estação, temperatura e tempo (no TESTE, troca o tempo a cada toque)
    q.add.zone(J.X, J.Y, J.LARGURA, J.ALTURA).setOrigin(0, 0).setInteractive()
      .on('pointerup', () => JANELA_VIVA.tocarJanela(q));
    q.events.once('shutdown', () => { if (q.somChuva) q.somChuva.stop(); });
    JANELA_VIVA.conferir(q, true);
  },

  tocarJanela(q) {
    if (q.painelAberto) return;
    const C = CONFIG.CLIMA;
    if (C.TESTE_TOQUE_JANELA) {
      const lista = C.TESTE_TEMPOS;
      q.testeClima = ((q.testeClima || 0) + 1) % lista.length;
      CLIMA.forcado = lista[q.testeClima];
      JANELA_VIVA.conferir(q, true);
    }
    if (q.avisoJanela) q.avisoJanela.forEach(o => o.destroy());
    const txt = CLIMA.texto(q.clima) + (C.TESTE_TOQUE_JANELA ? '\n(teste: ' + (CLIMA.forcado || 'automático') + ')' : '');
    q.avisoJanela = mostrarAvisoCaixa(q, txt, CONFIG.JANELA.Y + CONFIG.JANELA.ALTURA + 3, C.AVISO_SEGUNDOS);
  },

  // Confere o tempo agora e ajusta o que mudou
  conferir(q, forcar = false) {
    if (!q.veuJanela || !q.luzSol) return;   // ainda montando o quarto
    const C = CONFIG.CLIMA;
    const c = CLIMA.agora();
    q.clima = c;
    const chave = [c.estacao, c.ceu, c.chuva, c.neve, c.folhas, c.sol, q.noite, Opcoes.som].join('|');
    if (chave === q.climaChave && !forcar) return;
    q.climaChave = chave;
    const tipo = c.neve ? 'neve' : c.chuva || c.ceu;
    const F = C.FILTRO[tipo];
    if (F) q.veuJanela.setFillStyle(q.noite ? F[1] : F[0], 1);
    q.tweens.add({ targets: q.veuJanela, alpha: F ? F[2] : 0, duration: 800 });
    // Sol e luz do quarto
    q.solJanela.setVisible(c.sol > 0).setAlpha(0.5 + c.sol * 0.5);
    q.tweens.add({ targets: q.luzSol, alpha: q.noite ? 0 : c.sol * C.LUZ_SOL_MAX, duration: 800 });
    q.tweens.add({ targets: q.sombraClima, alpha: C.SOMBRA_QUARTO[tipo] || 0, duration: 800 });
    // Nuvens cinza com tempo fechado
    const cinza = c.ceu === 'nublado';
    q.nuvens.forEach(n => cinza ? n.setTint(0x9aa0b0) : n.clearTint());
    q.ventoFator = c.vento ? 4 : 1;
    // Chuva: quantas gotas
    const nGotas = c.chuva ? C.GOTAS[c.chuva] : 0;
    q.gotas.forEach((g, i) => {
      const liga = i < nGotas;
      if (liga && !g.visible) JANELA_VIVA.novaGota(q, g, true);
      g.setVisible(liga);
    });
    q.flocos.forEach(f => { if (c.neve && !f.visible) JANELA_VIVA.novoFloco(q, f, true); f.setVisible(c.neve); });
    // Som da chuva (em loop, baixinho)
    const querSom = !!c.chuva && Opcoes.som && q.cache.audio.exists('chuva');
    if (querSom && !q.somChuva) { q.somChuva = q.sound.add('chuva', { loop: true, volume: c.chuva === 'fraca' ? 0.15 : 0.28 }); q.somChuva.play(); }
    if (!querSom && q.somChuva) { q.somChuva.stop(); q.somChuva.destroy(); q.somChuva = null; }
    // Álbum: primeira chuva, neve, temporal e cada estação pela primeira vez
    if (typeof MOMENTOS !== 'undefined' && !CLIMA.forcado) {
      MOMENTOS.registrar('estacao_' + c.estacao);
      if (c.chuva) MOMENTOS.registrar('primeira_chuva');
      if (c.neve) MOMENTOS.registrar('primeira_neve');
      if (c.raios) MOMENTOS.registrar('primeiro_temporal');
    }
  },

  novaGota(q, g, espalhar) {
    const J = CONFIG.JANELA;
    g.px = J.X - 6 + Math.random() * (J.LARGURA + 30);
    g.py = espalhar ? J.Y + Math.random() * J.ALTURA : J.Y - 4 - Math.random() * 10;
    g.v = CONFIG.CLIMA.GOTA_VELOCIDADE[q.clima.chuva || 'fraca'] * (0.85 + Math.random() * 0.3);
  },

  novoFloco(q, f, espalhar) {
    const J = CONFIG.JANELA;
    f.px = J.X - 2 + Math.random() * (J.LARGURA + 4);
    f.py = espalhar ? J.Y + Math.random() * J.ALTURA : J.Y - 3;
    f.v = 7 + Math.random() * 7;
    f.fase = Math.random() * 6;
  },

  atualizar(q, seg) {
    if (!q.veuJanela || !q.clima) return;
    const J = CONFIG.JANELA, C = CONFIG.CLIMA, c = q.clima;
    q.climaTempo += seg;
    const vento = c.vento ? C.VENTO_TEMPORAL : 0;
    for (const g of q.gotas) {
      if (!g.visible) continue;
      g.py += g.v * seg; g.px += vento * seg;
      if (g.py > J.Y + J.ALTURA + 2) JANELA_VIVA.novaGota(q, g, false);
      g.setPosition(Math.round(g.px), Math.round(g.py));
    }
    for (const f of q.flocos) {
      if (!f.visible) continue;
      f.py += f.v * seg;
      f.px += Math.sin(q.climaTempo * 1.8 + f.fase) * 5 * seg;
      if (f.py > J.Y + J.ALTURA + 2) JANELA_VIVA.novoFloco(q, f, false);
      f.setPosition(Math.round(f.px), Math.round(f.py));
    }
    // Folhas secas atravessando (outono, sem chuva)
    if (c.folhas && !c.chuva) {
      q.timerFolha -= seg;
      if (q.timerFolha <= 0) {
        q.timerFolha = Phaser.Math.FloatBetween(C.FOLHA_INTERVALO_MIN, C.FOLHA_INTERVALO_MAX);
        const f = q.folhasSecas.find(x => !x.visible);
        if (f) {
          f.px = J.X - 6; f.py = J.Y + Phaser.Math.Between(0, 26); f.base = f.py;
          f.vx = Phaser.Math.FloatBetween(12, 20); f.vy = Phaser.Math.FloatBetween(4, 8); f.t = Math.random() * 6;
          f.setVisible(true);
        }
      }
    }
    for (const f of q.folhasSecas) {
      if (!f.visible) continue;
      f.t += seg; f.px += f.vx * seg; f.base += f.vy * seg;
      f.py = f.base + Math.sin(f.t * 3) * 3;
      f.setPosition(Math.round(f.px), Math.round(f.py));
      if (f.px > J.X + J.LARGURA + 4 || f.py > J.Y + J.ALTURA + 4) f.setVisible(false);
    }
    // Raios no temporal
    if (c.raios) {
      q.timerRaio -= seg;
      if (q.timerRaio <= 0) {
        q.timerRaio = Phaser.Math.FloatBetween(C.RAIO_INTERVALO_MIN, C.RAIO_INTERVALO_MAX);
        JANELA_VIVA.raio(q);
      }
    }
    JANELA_VIVA.moverVisita(q, seg);
  },

  raio(q) {
    const J = CONFIG.JANELA;
    q.raioJanela.setPosition(J.X + Phaser.Math.Between(4, J.LARGURA - 12), J.Y + 2).setVisible(true).setAlpha(1);
    q.time.delayedCall(130, () => q.raioJanela.setVisible(false));
    q.flash.setAlpha(0.55);
    q.tweens.add({ targets: q.flash, alpha: 0, duration: 320 });
    q.time.delayedCall(450, () => {
      tocarSom(q, 'trovao', { volume: 0.7 });
      q.cameras.main.shake(220, 0.005);
      if (typeof EVENTOS !== 'undefined') EVENTOS.trovao(q);
    });
  },

  // ---------- Visitas na janela ----------
  agendarVisita(q) {
    const C = CONFIG.CLIMA;
    const mult = q.clima ? q.clima.visitas : C.VISITAS.primavera;
    const espera = mult > 0 ? Phaser.Math.FloatBetween(C.VISITA_INTERVALO_MIN, C.VISITA_INTERVALO_MAX) / mult : 10;
    q.time.delayedCall(espera * 1000, () => {
      if (!q.clima || q.clima.visitas <= 0 || q.noite) { JANELA_VIVA.agendarVisita(q); return; }
      JANELA_VIVA.comecarVisita(q, CLIMA.escolherPeso(C.VISITA_PESOS, Math.random()));
    });
  },

  comecarVisita(q, tipo) {
    const J = CONFIG.JANELA;
    const spr = { passaro: q.passaro, borboleta: q.borboleta, abelha: q.abelha, balao: q.balaoVisita }[tipo];
    const v = { tipo, spr, t: 0 };
    if (tipo === 'balao') { v.px = J.X + Phaser.Math.Between(4, J.LARGURA - 10); v.py = J.Y + J.ALTURA + 2; }
    else if (tipo === 'abelha') { v.px = J.X + J.LARGURA + 2; v.py = J.Y + Phaser.Math.Between(6, J.ALTURA - 14); }
    else { v.px = J.X - 9; v.py = J.Y + Phaser.Math.Between(3, J.ALTURA - 14); }
    v.base = v.py; v.baseX = v.px;
    spr.setFlipX(tipo === 'abelha');
    if (tipo === 'balao') spr.setTint(Phaser.Utils.Array.GetRandom([0xff6e8c, 0x6ec8ff, 0xffd860, 0x8ce07a, 0xc89cff]));
    spr.setPosition(Math.round(v.px), Math.round(v.py)).setVisible(true);
    q.visita = v;
    if (typeof MOMENTOS !== 'undefined' && tipo !== 'passaro') MOMENTOS.registrar('visita_' + tipo);
  },

  moverVisita(q, seg) {
    const v = q.visita, J = CONFIG.JANELA;
    if (!v) return;
    v.t += seg;
    if (v.tipo === 'passaro') { v.px += J.PASSARO_VELOCIDADE * seg; }
    else if (v.tipo === 'borboleta') { v.px += 8 * seg; v.py = v.base + Math.sin(v.t * 3) * 4; }
    else if (v.tipo === 'abelha') { v.px -= 16 * seg; v.py = v.base + Math.sin(v.t * 9) * 2; }
    else if (v.tipo === 'balao') { v.py -= 6 * seg; v.px = v.baseX + Math.sin(v.t * 1.2) * 2; }
    v.spr.setPosition(Math.round(v.px), Math.round(v.py));
    const fora = v.px > J.X + J.LARGURA + 2 || v.px < J.X - 12 || v.py < J.Y - 14;
    if (fora) { v.spr.setVisible(false); q.visita = null; JANELA_VIVA.agendarVisita(q); }
  }
};

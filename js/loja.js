// =============================================================
// loja.js — a lojinha das estrelinhas (v0.0.66).
//
// As estrelinhas das tarefas do dia (save.estrelas) compram:
//   roupas (camada 'roupa' do bebê), cores da parede e do tapete,
//   enfeites do quarto (móbile, varal de luzinhas, estrelas, plantinha)
//   e brinquedos novos para o chão do quarto.
// Comprou, é seu para sempre. Fica em
//   save.loja = { tem: {id: true}, roupa, parede, tapete, enfeites: {id: true} }
//
// As roupas e as cores do quarto são feitas POR CÓDIGO a partir dos
// desenhos do autor (camadas do bebê e os dois quartos), então não
// precisam de arte nova. Enfeites e brinquedos têm provisórios em
// js/provisorios.js (criarLojaProvisorio) até o autor desenhar.
//
//   LOJA.itens('roupas' | 'quarto' | 'brinquedos')
//   LOJA.tem(id)  LOJA.usando(id)  LOJA.comprar(id)  LOJA.usar(id)  LOJA.tirar(id)
//   LOJA.roupaId()            → id da roupa vestida (ou null)
//   LOJA.texturaRoupa(cena, id)   LOJA.texturaQuarto(cena, sexo, tipo, cor)
//   LOJA.aplicarQuarto(q)  LOJA.criarEnfeites(q)  LOJA.criarBrilhos(q)  LOJA.periodo(q, noite, s)
// =============================================================

const LOJA = {
  ABAS: ['roupas', 'quarto', 'brinquedos'],

  // ---------- Save ----------
  dados() {
    const s = Estado.dados || Estado.carregar();
    if (!s) return null;
    if (!s.loja) s.loja = { tem: {}, roupa: null, parede: null, tapete: null, enfeites: {} };
    if (!s.loja.tem) s.loja.tem = {};
    if (!s.loja.enfeites) s.loja.enfeites = {};
    return s.loja;
  },
  sexo() {
    const s = Estado.dados || Estado.carregar();
    return s && s.bebe && s.bebe.sexo === 'M' ? 'M' : 'F';
  },

  // ---------- Catálogo ----------
  itens(aba) {
    const L = CONFIG.LOJA;
    if (aba === 'roupas') {
      return [{ id: 'roupa_nenhuma', tipo: 'roupa', nome: 'Só a fralda', preco: 0, def: null }]
        .concat(L.ROUPAS.map(r => ({ id: r.id, tipo: 'roupa', nome: r.nome, preco: r.preco, def: r })));
    }
    if (aba === 'quarto') {
      const sexo = LOJA.sexo();
      const cores = (tipo) => {
        const lista = L.CORES.map(c => ({
          id: tipo + '_' + c.id, tipo, cor: c,
          nome: (tipo === 'parede' ? 'Parede ' : 'Tapete ') + c.nome,
          original: c.original === sexo,
          preco: c.original === sexo ? 0 : (tipo === 'parede' ? L.PRECO_PAREDE : L.PRECO_TAPETE)
        }));
        return lista.filter(i => i.original).concat(lista.filter(i => !i.original));   // a original primeiro
      };
      return L.ENFEITES.map(e => ({ id: 'enfeite_' + e.id, tipo: 'enfeite', nome: e.nome, preco: e.preco, def: e }))
        .concat(cores('parede'), cores('tapete'));
    }
    return L.BRINQUEDOS.map(b => ({ id: 'brinquedo_' + b.id, tipo: 'brinquedo', nome: b.nome, preco: b.preco, def: b }));
  },
  item(id) {
    for (const aba of LOJA.ABAS) {
      const i = LOJA.itens(aba).find(x => x.id === id);
      if (i) return i;
    }
    return null;
  },
  estrelas() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.estrelas) || 0;
  },

  tem(id) {
    const it = LOJA.item(id);
    if (!it) return false;
    if (it.preco === 0) return true;
    const d = LOJA.dados();
    return !!(d && d.tem[id]);
  },
  usando(id) {
    const d = LOJA.dados(), it = LOJA.item(id);
    if (!d || !it) return false;
    if (it.tipo === 'roupa') return (d.roupa || 'roupa_nenhuma') === id;
    if (it.tipo === 'parede' || it.tipo === 'tapete') return d[it.tipo] ? d[it.tipo] === id : it.original;
    if (it.tipo === 'enfeite') return !!d.enfeites[it.def.id];
    return LOJA.tem(id);                       // brinquedo: comprou, está no quarto
  },

  // Compra: tira as estrelinhas e já usa o item. Devolve { ok } ou { ok: false, falta }
  comprar(id) {
    const it = LOJA.item(id), d = LOJA.dados(), s = Estado.dados;
    if (!it || !d || !s || LOJA.tem(id)) return { ok: false, falta: 0 };
    const tenho = s.estrelas || 0;
    if (tenho < it.preco) return { ok: false, falta: it.preco - tenho };
    s.estrelas = tenho - it.preco;
    d.tem[id] = true;
    d.compras = (d.compras || 0) + 1;
    LOJA.usar(id);                              // salva
    MOMENTOS.registrar('primeira_compra');
    return { ok: true };
  },
  usar(id) {
    const it = LOJA.item(id), d = LOJA.dados();
    if (!it || !d || !LOJA.tem(id)) return;
    if (it.tipo === 'roupa') d.roupa = id === 'roupa_nenhuma' ? null : id;
    else if (it.tipo === 'parede' || it.tipo === 'tapete') d[it.tipo] = it.original ? null : id;
    else if (it.tipo === 'enfeite') d.enfeites[it.def.id] = true;
    Estado.salvar();
  },
  tirar(id) {
    const it = LOJA.item(id), d = LOJA.dados();
    if (!it || !d) return;
    if (it.tipo === 'roupa') d.roupa = null;
    else if (it.tipo === 'enfeite') d.enfeites[it.def.id] = false;
    Estado.salvar();
  },
  roupaId() {
    const d = LOJA.dados();
    return d && d.roupa && CONFIG.LOJA.ROUPAS.some(r => r.id === d.roupa) ? d.roupa : null;
  },
  enfeiteLigado(nome) {
    const d = LOJA.dados();
    return !!(d && d.enfeites[nome] && d.tem['enfeite_' + nome]);
  },
  brinquedosComprados() {
    return CONFIG.LOJA.BRINQUEDOS.filter(b => LOJA.tem('brinquedo_' + b.id));
  },

  // ---------- Pixels ----------
  pixels(cena, chave) {
    const img = cena.textures.get(chave).getSourceImage();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  },
  hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; },
  rgbHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, max ? d / max : 0, max];
  },
  hsvRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  },

  // ---------- Roupas (feitas a partir das camadas do bebê) ----------
  // Pinta o tronco (camada do corpo), a fralda (pixels claros do contorno) e, se a
  // roupa tiver, as mangas e as pernas. O contorno escuro nunca é pintado, então o
  // desenho do autor continua por cima. Arquivo do autor (opcional): assets/sprites/<id>.png 32×32.
  texturaRoupa(cena, id) {
    if (!id) return null;
    if (cena.textures.exists(id)) return id;
    const r = CONFIG.LOJA.ROUPAS.find(x => x.id === id);
    if (!r || !cena.textures.exists('bebe_corpo') || !cena.textures.exists('bebe_contorno')) return null;
    const corpo = LOJA.pixels(cena, 'bebe_corpo'), cont = LOJA.pixels(cena, 'bebe_contorno');
    const W = corpo.width;
    const tex = cena.textures.createCanvas(id, W, corpo.height);
    const ctx = tex.getContext();
    const c1 = LOJA.hexRgb(r.cor1), c2 = LOJA.hexRgb(r.cor2);
    const px = (img, x, y, k) => img.data[(y * img.width + x) * 4 + k];
    for (let y = 0; y < corpo.height; y++) {
      for (let x = 0; x < W; x++) {
        const temCorpo = px(corpo, x, y, 3) > 0;
        const temCont = x < cont.width && y < cont.height && px(cont, x, y, 3) > 0;
        const claro = temCont && px(cont, x, y, 0) > 60;
        if (temCont && !claro) continue;                       // o contorno escuro fica
        let pinta = false, sombra = false;
        if (y >= 18 && y <= 22 && x >= 11 && x <= 20) {        // tronco
          pinta = temCorpo || claro;
          sombra = (temCorpo && px(corpo, x, y, 0) < 230) || (claro && px(cont, x, y, 0) < 200);
        } else if (y >= 23 && y <= 29 && claro && px(cont, x, y, 0) > 200) {
          pinta = true;                                        // a fralda
        } else if (temCorpo && !temCont) {
          const braco = (x <= 10 || x >= 21) && y >= 18 && y <= 23;
          if (braco && r.mangas) pinta = r.mangas === 'longa' ? y <= 22 : y <= 19;
          if (y >= 25 && y <= 28 && r.pernas) pinta = true;    // pernas (a linha 29 são os pezinhos)
          sombra = px(corpo, x, y, 0) < 230;
        }
        if (!pinta) continue;
        const desenho = r.padrao === 'listras' ? y % 2 === 0
          : r.padrao === 'bolinhas' ? (x + y) % 3 === 0 && y % 2 === 1
          : r.padrao === 'estrelas' ? (x * 7 + y * 3) % 11 === 0
          : false;
        let [cr, cg, cb] = desenho ? c2 : c1;
        if (sombra) { cr = Math.round(cr * 0.82); cg = Math.round(cg * 0.82); cb = Math.round(cb * 0.82); }
        ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    tex.refresh();
    return id;
  },

  // Ícone 16×16 da roupa (o tronco e a fralda, com contorno)
  iconeRoupa(cena, id) {
    const chave = 'icone_' + id;
    if (cena.textures.exists(chave)) return chave;
    let fonte;
    if (id === 'roupa_nenhuma') {
      // só a fralda: os pixels claros do contorno, em branco
      const cont = LOJA.pixels(cena, 'bebe_contorno');
      fonte = new ImageData(cont.width, cont.height);
      for (let y = 23; y <= 29; y++) for (let x = 0; x < cont.width; x++) {
        const i = (y * cont.width + x) * 4;
        if (cont.data[i + 3] > 0 && cont.data[i] > 200) { fonte.data[i] = fonte.data[i + 1] = fonte.data[i + 2] = 250; fonte.data[i + 3] = 255; }
      }
    } else {
      if (!LOJA.texturaRoupa(cena, id)) return null;
      fonte = LOJA.pixels(cena, id);
    }
    const tex = cena.textures.createCanvas(chave, 16, 16);
    const ctx = tex.getContext();
    const img = ctx.createImageData(16, 16);
    const X0 = 8, Y0 = 15;
    const tem = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 16 && fonte.data[((y + Y0) * fonte.width + x + X0) * 4 + 3] > 0;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const o = (y * 16 + x) * 4;
      if (tem(x, y)) {
        const i = ((y + Y0) * fonte.width + x + X0) * 4;
        img.data[o] = fonte.data[i]; img.data[o + 1] = fonte.data[i + 1]; img.data[o + 2] = fonte.data[i + 2]; img.data[o + 3] = 255;
      } else if (tem(x - 1, y) || tem(x + 1, y) || tem(x, y - 1) || tem(x, y + 1)) {
        img.data[o] = 42; img.data[o + 1] = 24; img.data[o + 2] = 56; img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    tex.refresh();
    return chave;
  },

  // ---------- Cores do quarto ----------
  // O que muda de cor = o que é diferente entre o quarto da menina e o do menino,
  // na parede (até PAREDE_ATE_Y, menos em cima do baú) ou no tapete (sem o chão marrom).
  // A cor nova mantém o claro e o escuro do desenho e troca só o tom.
  texturaQuarto(cena, sexo, tipo, corId) {
    const L = CONFIG.LOJA;
    const c = L.CORES.find(x => x.id === corId);
    if (!c || c.original === sexo) return null;              // a original: sem camada
    const chave = 'deco_' + tipo + '_' + sexo + '_' + corId;
    if (cena.textures.exists(chave)) return chave;
    const meu = LOJA.pixels(cena, sexo === 'F' ? 'quarto_menina' : 'quarto_menino');
    const outro = LOJA.pixels(cena, sexo === 'F' ? 'quarto_menino' : 'quarto_menina');
    const W = meu.width, H = meu.height;
    const tex = cena.textures.createCanvas(chave, W, H);
    const ctx = tex.getContext();
    const out = ctx.createImageData(W, H);
    const S = L.PAREDE_SEM, T = L.TAPETE;
    const naCaixa = (x, y) => x >= S.X && x < S.X + S.LARGURA && y >= S.Y && y < S.Y + S.ALTURA;
    const chaveCor = (d, i) => d[i] + ',' + d[i + 1] + ',' + d[i + 2];
    // Parede: as cores da parede (e a cor que cada uma tem no outro quarto), vistas fora da caixa
    // em cima do baú. Dentro dela (cada quarto tem enfeites diferentes ali) só mudam essas cores.
    const parCores = {};
    if (tipo === 'parede') {
      const conta = {};
      for (let y = 0; y <= Math.min(L.PAREDE_ATE_Y, H - 1); y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (naCaixa(x, y) || meu.data[i + 3] === 0) continue;
        const a = chaveCor(meu.data, i), b = chaveCor(outro.data, i);
        if (a === b) continue;
        conta[a] = conta[a] || {};
        conta[a][b] = (conta[a][b] || 0) + 1;
      }
      for (const [a, m] of Object.entries(conta)) parCores[a] = Object.entries(m).sort((u, v) => v[1] - u[1])[0][0].split(',').map(Number);
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (meu.data[i + 3] === 0) continue;
        const r = meu.data[i], g = meu.data[i + 1], b = meu.data[i + 2];
        const igual = r === outro.data[i] && g === outro.data[i + 1] && b === outro.data[i + 2];
        let doOutro = [outro.data[i], outro.data[i + 1], outro.data[i + 2]];
        if (tipo === 'parede') {
          if (y > L.PAREDE_ATE_Y) continue;
          if (naCaixa(x, y)) {
            const par = parCores[chaveCor(meu.data, i)];
            if (!par) continue;
            doOutro = par;
          } else if (igual) continue;
        } else {
          if (igual) continue;
          if (x < T.X || x >= T.X + T.LARGURA || y < T.Y || y >= T.Y + T.ALTURA) continue;
          const h = LOJA.rgbHsv(r, g, b)[0];
          if (h >= 8 && h <= 45) continue;                    // o chão de madeira não muda
        }
        let nova;
        if (c.original) nova = doOutro;                        // a cor do outro quarto
        else {
          const [, s, v] = LOJA.rgbHsv(r, g, b);
          nova = LOJA.hsvRgb(c.h, Math.min(1, s * (c.s || 1)), v);
        }
        out.data[i] = nova[0]; out.data[i + 1] = nova[1]; out.data[i + 2] = nova[2]; out.data[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    tex.refresh();
    return chave;
  },
  idCor(id, tipo) { return id ? id.slice(tipo.length + 1) : null; },

  // ---------- No quarto ----------
  // Logo depois do desenho do quarto: as cores compradas por cima
  aplicarQuarto(q) {
    const d = LOJA.dados();
    if (!d) return;
    for (const tipo of ['parede', 'tapete']) {
      const chave = LOJA.texturaQuarto(q, q.bebe.sexo, tipo, LOJA.idCor(d[tipo], tipo));
      if (chave) q.add.image(0, 0, chave).setOrigin(0, 0);
    }
  },

  // Enfeites (depois dos quadros, antes dos brinquedos e do berço)
  criarEnfeites(q) {
    const L = CONFIG.LOJA;
    const def = (id) => L.ENFEITES.find(e => e.id === id);
    q.enfeites = {};
    if (LOJA.enfeiteLigado('estrelas')) q.enfeites.estrelas = L.ESTRELAS_POS.map(([x, y]) => q.add.image(x, y, 'deco_estrela').setOrigin(0, 0));
    if (LOJA.enfeiteLigado('varal')) { const e = def('varal'); q.enfeites.varal = q.add.image(e.x, e.y, 'deco_varal').setOrigin(0, 0); }
    if (LOJA.enfeiteLigado('planta')) { const e = def('planta'); q.enfeites.planta = q.add.image(e.x, e.y, 'deco_planta').setOrigin(0, 0); }
    if (LOJA.enfeiteLigado('mobile')) {
      const e = def('mobile');
      LOJA.criarAnimacoes(q);
      const m = q.enfeites.mobile = q.add.sprite(e.x, e.y, 'deco_mobile', 0).setOrigin(0, 0).play('mobile_devagar');
      q.add.zone(e.x - 2, e.y - 2, m.width + 4, 22).setOrigin(0, 0).setInteractive()
        .on('pointerup', () => LOJA.tocarMobile(q));
    }
  },

  criarAnimacoes(cena) {
    const L = CONFIG.LOJA;
    if (cena.anims.exists('mobile_devagar')) return;
    const quadros = cena.anims.generateFrameNumbers('deco_mobile', { start: 0, end: 1 });
    cena.anims.create({ key: 'mobile_devagar', frames: quadros, frameRate: L.MOBILE_FPS, repeat: -1 });
    cena.anims.create({ key: 'mobile_rapido', frames: quadros, frameRate: L.MOBILE_FPS_TOQUE, repeat: -1 });
  },

  // O que acende à noite (fica por cima do escuro)
  criarBrilhos(q) {
    const L = CONFIG.LOJA;
    q.brilhos = [];
    if (q.enfeites && q.enfeites.varal) {
      const e = L.ENFEITES.find(x => x.id === 'varal');
      q.brilhos.push(q.add.image(e.x, e.y, 'deco_varal_luz').setOrigin(0, 0).setAlpha(0));
    }
    if (q.enfeites && q.enfeites.estrelas) {
      L.ESTRELAS_POS.forEach(([x, y]) => q.brilhos.push(q.add.image(x, y, 'deco_estrela').setOrigin(0, 0).setTint(0xfff3a0).setAlpha(0)));
    }
  },

  periodo(q, noite, segundos) {
    if (!q.brilhos) return;
    q.brilhos.forEach((b, i) => {
      if (!b.scene) return;
      q.tweens.killTweensOf(b);
      if (!noite) { q.tweens.add({ targets: b, alpha: 0, duration: Math.max(1, segundos * 1000) }); return; }
      q.tweens.add({
        targets: b, alpha: 1, duration: Math.max(1, segundos * 1000),
        onComplete: () => q.tweens.add({ targets: b, alpha: 0.55, duration: 700 + (i % 4) * 230, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      });
    });
  },

  // Tocar no móbile: gira rápido um pouco e o bebê se diverte
  tocarMobile(q) {
    const m = q.enfeites && q.enfeites.mobile;
    if (!m || q.painelAberto || q.mobileGirando) return;
    q.mobileGirando = true;
    m.play('mobile_rapido');
    tocarSom(q, 'chocalho', { volume: 0.25, rate: 1.6 });
    NEC.mudar('diversao', CONFIG.LOJA.MOBILE_DIVERSAO);
    q.atualizarNecessidades();
    if (EVENTOS.pode(q) && !q.ev.ativo && !q.olhosDoToque) {
      q.olhosDoToque = true;
      q.visual.piscar(true, true);
      q.time.delayedCall(600, () => { q.olhosDoToque = false; if (!q.mamando && q.visual) q.visual.piscar(false); });
    }
    q.time.delayedCall(2000, () => { if (m.scene) m.play('mobile_devagar'); q.mobileGirando = false; });
  }
};

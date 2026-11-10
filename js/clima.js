// =============================================================
// clima.js — calendário, estações e o tempo lá fora (v0.0.58).
//
// O calendário começa no mês REAL em que o bebê chegou (save.chegadaReal)
// e anda junto com os meses de vida do bebê. Cada estação dura 3 meses
// do jogo. O tempo de cada dia do jogo (céu, chuva, neve, folhas) é
// sorteado pela estação e pela REGIÃO do jogador (save.perfil.regiao),
// sempre com o mesmo resultado para o mesmo dia (sorteio com semente),
// então recarregar o jogo não muda a chuva.
//
//   CLIMA.mesDoJogo()    → 0 (janeiro) … 11 (dezembro)
//   CLIMA.estacao()      → 'verao' | 'outono' | 'inverno' | 'primavera'
//   CLIMA.agora()        → { estacao, regiao, ceu, chuva, neve, raios, vento, folhas, sol, visitas, temperatura }
//   CLIMA.texto()        → "Primavera · 24°C" e "Sol" (para o aviso da janela)
//   CLIMA.forcado        → TESTE: um tempo fixo (ver CONFIG.CLIMA.TESTE_TEMPOS)
// =============================================================

const CLIMA = {
  forcado: null,

  regiao() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.perfil && s.perfil.regiao) || 'sudeste';
  },

  // Mês em que a história começou (o mês real da chegada do bebê)
  mesInicial() {
    const s = Estado.dados || Estado.carregar();
    return new Date((s && s.chegadaReal) || Date.now()).getMonth();
  },

  // Meses de vida de um dia do jogo (dia 1 = chegada)
  mesesNoDia(dia) {
    return Math.floor((dia - 1) / (365 / 12));
  },

  mesDoJogo(dia = TEMPO.agora().dia) {
    return (CLIMA.mesInicial() + CLIMA.mesesNoDia(dia)) % 12;
  },

  estacao(dia) {
    return CONFIG.CLIMA.ESTACAO_DO_MES[CLIMA.mesDoJogo(dia)];
  },

  // Sorteio com semente (o mesmo dia dá sempre o mesmo resultado)
  sorteador(semente) {
    let a = semente >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  escolherPeso(pesos, r) {
    const total = Object.values(pesos).reduce((a, b) => a + b, 0);
    let x = r * total;
    for (const [k, p] of Object.entries(pesos)) { x -= p; if (x < 0) return k; }
    return Object.keys(pesos)[0];
  },

  // O plano do dia: céu, chuva (hora de começar e quantas horas) e neve
  planoDoDia(dia) {
    const C = CONFIG.CLIMA;
    const est = CLIMA.estacao(dia);
    const reg = CLIMA.regiao();
    const regras = C.DIAS[est][reg] || C.DIAS[est].padrao;
    const r = CLIMA.sorteador(dia * 7919 + reg.length * 104729 + CLIMA.mesInicial() * 31);
    const plano = { estacao: est, regiao: reg, ceu: CLIMA.escolherPeso(regras.ceu, r()), folhas: !!regras.folhas };
    const entre = ([a, b]) => a + Math.floor(r() * (b - a + 1));
    if (regras.chuva && r() < regras.chuva.chance) {
      const inicio = entre(regras.chuva.inicio);
      plano.chuva = { tipo: regras.chuva.tipo, inicio, fim: Math.min(24, inicio + entre(regras.chuva.horas)) };
    }
    if (regras.neve && r() < regras.neve.chance) {
      const inicio = entre(regras.neve.inicio);
      plano.neve = { inicio, fim: Math.min(24, inicio + entre(regras.neve.horas)) };
    }
    return plano;
  },

  // O tempo agora (ou num dia/hora pedidos)
  agora(t = TEMPO.agora()) {
    const C = CONFIG.CLIMA;
    const p = CLIMA.planoDoDia(t.dia);
    const h = t.hora + t.minuto / 60;
    const dentro = (x) => x && h >= x.inicio && h < x.fim;
    const c = {
      estacao: p.estacao, regiao: p.regiao, ceu: p.ceu, folhas: p.folhas,
      chuva: dentro(p.chuva) ? p.chuva.tipo : null,
      neve: dentro(p.neve)
    };
    if (CLIMA.forcado) Object.assign(c, CLIMA.tempoDeTeste(CLIMA.forcado));
    if (c.chuva || c.neve) c.ceu = 'nublado';
    c.raios = c.chuva === 'temporal';
    c.vento = c.chuva === 'temporal';
    // Sol: mais forte no verão (ainda mais no Nordeste); some com céu fechado
    let sol = C.SOL[c.estacao];
    if (c.estacao === 'verao' && c.regiao === 'nordeste') sol = C.SOL_NORDESTE_VERAO;
    if (c.ceu === 'nublado') sol = 0;
    else if (c.ceu === 'parcial') sol *= 0.75;
    else if (c.ceu === 'seco') sol *= 0.7;
    c.sol = sol;
    c.visitas = (c.chuva || c.neve) ? 0 : C.VISITAS[c.estacao];
    // Temperatura
    const noite = t.hora < CONFIG.JANELA.DIA_COMECA || t.hora >= CONFIG.JANELA.NOITE_COMECA;
    const frio = c.estacao === 'inverno' && (c.regiao === 'sul' || c.regiao === 'sudeste');
    let temp = C.TEMPERATURA[c.estacao][c.regiao] || 24;
    if (noite) temp -= frio ? C.NOITE_MENOS_FRIO : C.NOITE_MENOS;
    if (c.chuva) temp -= C.CHUVA_MENOS;
    if (c.neve) temp = Math.min(temp, -1);
    c.temperatura = Math.round(temp);
    return c;
  },

  // TESTE: tempos fixos para ver cada clima sem esperar
  tempoDeTeste(nome) {
    const T = {
      verao_sol:          { estacao: 'verao', ceu: 'limpo', chuva: null, neve: false, folhas: false, regiao: 'nordeste' },
      verao_chuva:        { estacao: 'verao', ceu: 'nublado', chuva: 'forte', neve: false, folhas: false },
      outono_folhas:      { estacao: 'outono', ceu: 'parcial', chuva: null, neve: false, folhas: true },
      inverno_nublado:    { estacao: 'inverno', ceu: 'nublado', chuva: null, neve: false, folhas: false, regiao: 'sul' },
      inverno_neve:       { estacao: 'inverno', ceu: 'nublado', chuva: null, neve: true, folhas: false, regiao: 'sul' },
      inverno_seco:       { estacao: 'inverno', ceu: 'seco', chuva: null, neve: false, folhas: false, regiao: 'centro-oeste' },
      primavera_temporal: { estacao: 'primavera', ceu: 'nublado', chuva: 'temporal', neve: false, folhas: false, regiao: 'sudeste' }
    };
    return T[nome] || {};
  },

  // Para o aviso da janela: "Primavera · 24°C" e o tempo
  texto(c = CLIMA.agora()) {
    const C = CONFIG.CLIMA;
    let tempo;
    if (c.neve) tempo = 'Nevando!';
    else if (c.chuva === 'temporal') tempo = 'Temporal com raios';
    else if (c.chuva === 'forte') tempo = 'Chuva forte';
    else if (c.chuva) tempo = 'Chuvinha';
    else if (c.ceu === 'seco') tempo = 'Tempo seco';
    else if (c.ceu === 'nublado') tempo = 'Nublado';
    else if (TEMPO.ehNoite()) tempo = c.ceu === 'parcial' ? 'Noite com nuvens' : 'Noite limpa';
    else if (c.sol >= 0.85) tempo = 'Sol forte';
    else if (c.ceu === 'parcial') tempo = 'Sol entre nuvens';
    else tempo = 'Sol';
    if (c.folhas && !c.chuva) tempo += ', folhas secas';
    return C.NOMES[c.estacao] + ' · ' + c.temperatura + '°C\n' + tempo;
  }
};

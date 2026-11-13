// =============================================================
// marcos.js — marcos do desenvolvimento do bebê (v0.0.63).
//
// Lista e regras em CONFIG.MARCOS. Um marco chega quando o bebê tem a
// idade mínima E o jogador já fez a conquista da regra (brincar, ler,
// dar carinho...). Fica em save.marcos = { id: { dia, idade, em } } e
// vira um momento do álbum ('marco_<id>'). A caderneta (aba "Marcos"
// do álbum) mostra os que chegaram e o que falta para os outros.
//
//   MARCOS.tem('palmas')      → já chegou?
//   MARCOS.situacao(m)        → { chegou, idadeOk, faltas: [...], texto }
//   MARCOS.conferir()         → o próximo marco que acabou de chegar (ou null)
// =============================================================

const MARCOS = {
  salvos() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.marcos) || {};
  },

  tem(id) {
    return !!MARCOS.salvos()[id];
  },

  quantos() {
    return Object.keys(MARCOS.salvos()).length;
  },

  mesesDeVida() {
    const i = TEMPO.idade();
    return i.anos * 12 + i.meses;
  },

  // valor atual de cada regra
  valor(regra, s) {
    const a = (s && s.atividades) || {};
    const e = (s && s.eventos) || {};
    switch (regra) {
      case 'vinculo': return VINCULO.valor();
      case 'chocalhos': return e.chocalhos || 0;
      case 'torres': return a.blocos || 0;
      default: return a[regra] || 0;
    }
  },

  situacao(m) {
    const s = Estado.dados || Estado.carregar();
    const salvo = (s && s.marcos && s.marcos[m.id]) || null;
    const idadeOk = MARCOS.mesesDeVida() >= m.meses;
    const faltas = [];
    for (const [regra, alvo] of Object.entries(m.regra || {})) {
      const v = MARCOS.valor(regra, s);
      if (v < alvo) faltas.push({ regra, v: Math.floor(v), alvo });
    }
    const nomes = CONFIG.MARCOS.NOMES_REGRA;
    const falta = faltas.map(f => f.regra === 'vinculo' ? nomes.vinculo : nomes[f.regra] + ' ' + f.v + '/' + f.alvo).join(', ');
    let texto;
    if (salvo) texto = 'Dia ' + salvo.dia + ' · ' + salvo.idade;
    else if (!idadeOk) texto = 'Com ' + m.meses + (m.meses === 1 ? ' mês' : ' meses') + (falta ? ' · ' + falta : '');
    else texto = falta ? 'Falta: ' + falta : 'Quase lá!';
    return { chegou: !!salvo, idadeOk, faltas, texto };
  },

  // Confere se algum marco acabou de chegar; guarda e devolve o primeiro (um de cada vez)
  conferir() {
    const s = Estado.carregar();
    if (!s || !s.bebe) return null;
    for (const m of CONFIG.MARCOS.LISTA) {
      if (s.marcos && s.marcos[m.id]) continue;
      const st = MARCOS.situacao(m);
      if (!st.idadeOk || st.faltas.length) continue;
      const t = TEMPO.agora();
      s.marcos = s.marcos || {};
      s.marcos[m.id] = { dia: t.dia, idade: TEMPO.textoIdade(s.bebe.sexo), em: Date.now() };
      Estado.salvar();
      MOMENTOS.registrar('marco_' + m.id);
      return m;
    }
    return null;
  }
};

// Cada marco também é um momento do álbum, com o ícone do marco
CONFIG.MARCOS.LISTA.forEach((m, i) => {
  MOMENTOS.TIPOS['marco_' + m.id] = ['Marco: ' + m.nome, 'icones_marcos', i];
});

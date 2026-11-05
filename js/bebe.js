// =============================================================
// bebe.js — sorteia o bebê que a cegonha traz (Etapa 3).
//
// Só lógica: nenhum desenho aqui. As regras e chances ficam em
// CONFIG.BEBE (config.js).
//
// Um bebê é guardado assim (é isso que vai para o save na Etapa 4):
//   { sexo: 'M' ou 'F',
//     origem: 'negro' | 'branco' | 'indigena' | 'cabo_verde' | 'miscigenado' | 'especial',
//     especial: null ou 'alienigena' | 'vampiro' | 'lobisomem',
//     pele, cabeloTipo, cabeloCor, olhos,
//     regiao, estado }
// =============================================================

const BEBE = {
  // Sorteia um item de uma lista (todos com a mesma chance).
  sortearLista(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  },

  // Sorteia uma chave de um objeto de pesos. Ex.: { a: 3, b: 1 } → 'a' sai 3x mais.
  sortearPeso(pesos) {
    const total = Object.values(pesos).reduce((s, p) => s + p, 0);
    let r = Math.random() * total;
    for (const [chave, peso] of Object.entries(pesos)) {
      r -= peso;
      if (r < 0) return chave;
    }
    return Object.keys(pesos)[0]; // segurança (arredondamento)
  },

  // Quais listas valem para esta origem (e especial, se for o caso).
  regrasDe(origem, especial) {
    const B = CONFIG.BEBE;
    if (origem === 'especial') return B.ESPECIAIS[especial];
    if (origem === 'miscigenado') return B.TODOS;
    return B.REGRAS[origem];
  },

  // Gera um bebê novo. "regiao" = id da região do perfil (ex.: 'sudeste').
  gerar(regiao) {
    const B = CONFIG.BEBE;
    const origem = this.sortearPeso(B.ORIGENS);
    const especial = origem === 'especial' ? this.sortearLista(Object.keys(B.ESPECIAIS)) : null;
    const r = this.regrasDe(origem, especial);

    const infoRegiao = CONFIG.PERFIL.REGIOES.find(g => g.id === regiao) || CONFIG.PERFIL.REGIOES[0];

    return {
      sexo: Math.random() < B.CHANCE_MENINA ? 'F' : 'M',
      origem,
      especial,
      pele: this.sortearLista(r.pele),
      cabeloTipo: this.sortearLista(r.cabeloTipo),
      cabeloCor: this.sortearLista(r.cabeloCor),
      olhos: this.sortearLista(r.olhos),
      regiao: infoRegiao.id,
      estado: this.sortearLista(infoRegiao.estados)
    };
  },

  // Confere se um bebê segue as regras. Devolve a lista de problemas (vazia = tudo certo).
  confere(bebe) {
    const problemas = [];
    const r = this.regrasDe(bebe.origem, bebe.especial);
    if (!r) return ['origem desconhecida: ' + bebe.origem];
    for (const campo of ['pele', 'cabeloTipo', 'cabeloCor', 'olhos']) {
      if (!r[campo].includes(bebe[campo])) problemas.push(campo + ' = ' + bebe[campo] + ' não vale para ' + bebe.origem);
    }
    if ((bebe.origem === 'especial') !== (bebe.especial !== null)) problemas.push('especial não combina com a origem');
    const g = CONFIG.PERFIL.REGIOES.find(x => x.id === bebe.regiao);
    if (!g || !g.estados.includes(bebe.estado)) problemas.push('estado ' + bebe.estado + ' fora da região');
    if (bebe.sexo !== 'M' && bebe.sexo !== 'F') problemas.push('sexo inválido');
    return problemas;
  },

  // A origem só é revelada ao jogador quando o bebê é especial (regra do DESIGN).
  revelaOrigem(bebe) {
    return bebe.origem === 'especial';
  },

  // "no Paraná", "na Bahia", "em São Paulo"...
  ondeNasceu(bebe) {
    return (CONFIG.PERFIL.NASCEU_EM[bebe.estado] || 'em') + ' ' + bebe.estado;
  },

  // Nome bonito de um valor (ex.: 'castanho_claro' → 'Castanho claro').
  nome(valor) {
    return CONFIG.BEBE.NOMES[valor] || valor;
  }
};

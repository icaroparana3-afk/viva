// =============================================================
// momentos.js — álbum de momentos e vínculo (v0.0.58).
//
// MOMENTOS: o jogo guarda sozinho as "primeiras vezes" e as festas,
// com o dia do jogo e a idade, em save.momentos. A cena Album mostra.
//   MOMENTOS.registrar('primeira_mamadeira')       → true se for novo
//   MOMENTOS.registrar('mesversario_3', { n: 3 })  (o id é único)
//
// VINCULO: valor escondido de 0 a 100 (save.vinculo) que sobe com
// carinho e cuidado. Muda a recepção, os corações e o beijinho.
//   VINCULO.valor()   VINCULO.mudar(+2)
// =============================================================

const MOMENTOS = {
  // id (ou começo do id) → [texto, textura, quadro]
  // No texto: {ele} vira ele/ela, {o} vira o/a, {n} vira o número, {nome} vira o nome do bebê.
  TIPOS: {
    chegada:             ['{nome} chegou em casa!', 'coracao', null],
    primeira_mamadeira:  ['Primeira mamadeira', 'pensamentos', 5],
    tudo_cheio:          ['Tudo 100%: muito bem cuidad{o}!', 'humor', 0],
    primeira_imaginacao: ['Primeira imaginação', 'pensamentos', 4],
    primeiro_chocalho:   ['Brincou de chocalho', 'chocalho', 0],
    primeiro_dodoi:      ['Primeiro dodói', 'icone_curativo', null],
    primeiro_curativo:   ['Ganhou o primeiro curativo', 'icone_curativo', null],
    primeiro_brinquedo:  ['Brincou no berço', 'pensamentos', 6],
    primeiro_soluco:     ['Primeiro soluço', 'icones_album', 6],
    primeiro_espirro:    ['Primeiro espirro', 'icones_album', 7],
    primeira_bolha:      ['Estourou a bolha de pensamento', 'pensamentos', 7],
    primeira_recepcao:   ['Recebeu você com festa', 'coracao', null],
    primeiro_beijinho:   ['Mandou o primeiro beijinho', 'coracao', null],
    primeiro_trovao:     ['Levou um susto com o trovão', 'icones_album', 2],
    primeira_chuva:      ['Viu a primeira chuva', 'icones_album', 0],
    primeira_neve:       ['Viu neve pela janela!', 'icones_album', 1],
    primeiro_temporal:   ['Primeiro temporal', 'icones_album', 2],
    estacao_verao:       ['Primeiro verão', 'pensamentos', 2],
    estacao_outono:      ['Primeiro outono', 'icones_album', 3],
    estacao_inverno:     ['Primeiro inverno', 'icones_album', 1],
    estacao_primavera:   ['Primeira primavera', 'icones_album', 4],
    visita_borboleta:    ['Viu uma borboleta', 'borboleta', 0],
    visita_abelha:       ['Viu uma abelha', 'abelha', 0],
    visita_balao:        ['Viu um balão passar', 'balao_visita', null],
    mesversario:         ['Fez {n} {meses}!', 'icones_album', 5],
    aniversario:         ['Fez {n} {anos}! Feliz aniversário!', 'icones_album', 5]
  },

  lista() {
    const s = Estado.dados || Estado.carregar();
    return (s && s.momentos) || [];
  },

  tem(id) {
    return MOMENTOS.lista().some(m => m.id === id);
  },

  registrar(id, extra = {}) {
    if (MOMENTOS.tem(id)) return false;       // já está no álbum (sem ler o save de novo)
    const s = Estado.carregar();
    if (!s || !s.bebe) return false;
    s.momentos = s.momentos || [];
    if (s.momentos.some(m => m.id === id)) return false;
    const base = id.replace(/_\d+$/, '');
    const tipo = MOMENTOS.TIPOS[id] || MOMENTOS.TIPOS[base];
    if (!tipo) return false;
    const f = s.bebe.sexo === 'F';
    const n = extra.n || 0;
    const texto = tipo[0]
      .replace('{nome}', s.bebe.nome || (f ? 'A bebê' : 'O bebê'))
      .replace('{o}', f ? 'a' : 'o').replace('{ele}', f ? 'ela' : 'ele')
      .replace('{n}', n).replace('{meses}', n === 1 ? 'mês' : 'meses').replace('{anos}', n === 1 ? 'ano' : 'anos');
    const t = TEMPO.agora();
    s.momentos.push({
      id, texto, textura: tipo[1], quadro: tipo[2],
      dia: extra.dia || t.dia, idade: extra.idade || TEMPO.textoIdade(s.bebe.sexo), em: extra.em || Date.now()
    });
    const max = CONFIG.ALBUM.MAXIMO;
    if (s.momentos.length > max) s.momentos.splice(0, s.momentos.length - max);
    Estado.salvar();
    return true;
  }
};

const VINCULO = {
  valor() {
    const s = Estado.dados || Estado.carregar();
    if (!s) return CONFIG.VINCULO.INICIAL;
    return typeof s.vinculo === 'number' ? s.vinculo : CONFIG.VINCULO.INICIAL;
  },

  mudar(quanto) {
    if (!quanto) return;
    const s = Estado.carregar();
    if (!s) return;
    const atual = typeof s.vinculo === 'number' ? s.vinculo : CONFIG.VINCULO.INICIAL;
    s.vinculo = Math.max(0, Math.min(100, Math.round((atual + quanto) * 10) / 10));
    Estado.salvar();
  }
};

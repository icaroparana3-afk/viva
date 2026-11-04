// =============================================================
// state.js — guarda e lê o save do jogo.
//
// O save fica no "localStorage": uma gaveta do navegador que não
// some quando você fecha a página. Ele é guardado como JSON,
// que é texto que representa os dados (um jeito de escrever
// { nome: "Ícaro" } em forma de texto).
//
// Regra do projeto: o localStorage é o save PRINCIPAL.
// A nuvem (Firebase) entra só na Etapa 29, como cópia.
// =============================================================

const Estado = {
  // Aqui fica o save carregado na memória enquanto o jogo roda.
  dados: null,

  // Cria um save novo a partir do perfil (nome, papel, região).
  criarNovo(perfil) {
    this.dados = {
      versao: CONFIG.VERSAO,
      criadoEm: Date.now(),   // momento em que a história começou
      ultimaVez: Date.now(),  // última vez que o jogador esteve aqui (usado na Etapa 6)
      perfil: perfil
    };
    this.salvar();
    return this.dados;
  },

  // Grava o save. O try/catch evita que o jogo quebre se o
  // navegador bloquear o armazenamento (aba anônima, por exemplo).
  salvar() {
    try {
      localStorage.setItem(CONFIG.CHAVE_SAVE, JSON.stringify(this.dados));
      return true;
    } catch (e) {
      console.warn('Não consegui salvar:', e);
      return false;
    }
  },

  // Lê o save guardado. Devolve null se não houver nenhum.
  carregar() {
    try {
      const texto = localStorage.getItem(CONFIG.CHAVE_SAVE);
      if (!texto) return null;
      this.dados = JSON.parse(texto);
      return this.dados;
    } catch (e) {
      console.warn('Não consegui ler o save:', e);
      return null;
    }
  },

  // Existe algum save guardado?
  existe() {
    try {
      return localStorage.getItem(CONFIG.CHAVE_SAVE) !== null;
    } catch (e) {
      return false;
    }
  },

  // Apaga o save (usado ao começar uma história nova por cima de outra).
  apagar() {
    try {
      localStorage.removeItem(CONFIG.CHAVE_SAVE);
      this.dados = null;
      return true;
    } catch (e) {
      return false;
    }
  }
};

// =============================================================
// Opções do jogador (música e efeitos sonoros ligados ou não).
// Ficam numa gaveta separada (CONFIG.CHAVE_OPCOES), então
// continuam valendo mesmo depois de começar uma história nova.
// =============================================================
const Opcoes = {
  musica: true,
  som: true,

  carregar() {
    try {
      const texto = localStorage.getItem(CONFIG.CHAVE_OPCOES);
      if (texto) {
        const o = JSON.parse(texto);
        this.musica = o.musica !== false;
        this.som = o.som !== false;
      }
    } catch (e) { /* sem armazenamento: fica tudo ligado */ }
    return this;
  },

  salvar() {
    try {
      localStorage.setItem(CONFIG.CHAVE_OPCOES, JSON.stringify({ musica: this.musica, som: this.som }));
    } catch (e) { /* ignora */ }
  }
};

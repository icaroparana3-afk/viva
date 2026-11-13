// =============================================================
// sw.js — "service worker": um ajudante que o navegador roda por trás
// do jogo. É ele que deixa o Viva INSTALÁVEL e funcionando SEM INTERNET.
//
// Como funciona:
// - Na primeira visita, guarda uma cópia de todos os arquivos do jogo (cache).
// - Com internet: busca sempre a versão nova no site (e atualiza a cópia).
//   Assim o celular não fica preso numa versão velha.
// - Sem internet (ou internet muito lenta): usa a cópia guardada.
//
// A CADA PUBLICAÇÃO: subir VERSAO aqui junto com CONFIG.VERSAO
// (o Claude faz isso). Arquivos novos entram na lista ARQUIVOS.
// =============================================================

const VERSAO = '0.0.65';
const CACHE = 'viva-' + VERSAO;
const PHASER = 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js';
const ESPERA_REDE = 4000;   // ms: se a internet demorar mais que isso, usa a cópia

const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/bebe.js',
  './js/bebe_visual.js',
  './js/botao.js',
  './js/clima.js',
  './js/config.js',
  './js/eventos.js',
  './js/fotos.js',
  './js/janela.js',
  './js/main.js',
  './js/mapa.js',
  './js/marcos.js',
  './js/momentos.js',
  './js/necessidades.js',
  './js/provisorios.js',
  './js/seguranca.js',
  './js/sinais.js',
  './js/state.js',
  './js/tarefas.js',
  './js/tempo.js',
  './assets/sprites/abajur_aceso_menina.png',
  './assets/sprites/abajur_aceso_menino.png',
  './assets/sprites/arvore_direita.png',
  './assets/sprites/arvore_esquerda.png',
  './assets/sprites/bebe_brilho.png',
  './assets/sprites/bebe_cabelo.png',
  './assets/sprites/bebe_contorno.png',
  './assets/sprites/bebe_corpo.png',
  './assets/sprites/bebe_extra_alienigena.png',
  './assets/sprites/bebe_extra_lobisomem.png',
  './assets/sprites/bebe_extra_vampiro.png',
  './assets/sprites/bebe_olhos.png',
  './assets/sprites/berco_frente.png',
  './assets/sprites/berco_tras.png',
  './assets/sprites/bolo_menina.png',
  './assets/sprites/bolo_menino.png',
  './assets/sprites/brinquedo_menina_blocos.png',
  './assets/sprites/brinquedo_menina_coelho.png',
  './assets/sprites/brinquedo_menina_elefante.png',
  './assets/sprites/brinquedo_menina_urso.png',
  './assets/sprites/brinquedo_menino_blocos.png',
  './assets/sprites/brinquedo_menino_carro.png',
  './assets/sprites/brinquedo_menino_dino.png',
  './assets/sprites/casal.png',
  './assets/sprites/cegonha.png',
  './assets/sprites/cesta.png',
  './assets/sprites/chocalho.png',
  './assets/sprites/gato_prateleira.png',
  './assets/sprites/gato_susto.png',
  './assets/sprites/mesa_menina.png',
  './assets/sprites/mesa_menino.png',
  './assets/sprites/moita_direita.png',
  './assets/sprites/moita_esquerda.png',
  './assets/sprites/nuvem1.png',
  './assets/sprites/nuvem2.png',
  './assets/sprites/passaro.png',
  './assets/sprites/quadros_parede.png',
  './assets/sprites/toalha.png',
  './assets/ui/album_dodoi.png',
  './assets/ui/album_primavera.png',
  './assets/ui/album_soluco.png',
  './assets/ui/botao_comecar.png',
  './assets/ui/botao_configuracoes.png',
  './assets/ui/botao_continuar_historia.png',
  './assets/ui/botao_fechar.png',
  './assets/ui/botao_levar_berco.png',
  './assets/ui/botao_mamae.png',
  './assets/ui/botao_mamae_sel.png',
  './assets/ui/botao_menu.png',
  './assets/ui/botao_musica.png',
  './assets/ui/botao_musica_off.png',
  './assets/ui/botao_nao.png',
  './assets/ui/botao_nao_sel.png',
  './assets/ui/botao_nova_historia.png',
  './assets/ui/botao_papai.png',
  './assets/ui/botao_papai_sel.png',
  './assets/ui/botao_proximo.png',
  './assets/ui/botao_sim.png',
  './assets/ui/botao_sim_sel.png',
  './assets/ui/botao_som.png',
  './assets/ui/botao_som_off.png',
  './assets/ui/botao_voltar.png',
  './assets/ui/botao_voltar_album.png',
  './assets/ui/fundo_perfil.png',
  './assets/ui/humor.png',
  './assets/ui/icone.png',
  './assets/ui/icone_180.png',
  './assets/ui/icone_192.png',
  './assets/ui/icone_512.png',
  './assets/ui/icone_512_maskable.png',
  './assets/ui/icones_necessidades16.png',
  './assets/ui/linha_necessidade.png',
  './assets/ui/linha_necessidade_sel.png',
  './assets/ui/mamadeira.png',
  './assets/ui/mamadeira_carregando.png',
  './assets/ui/maozinha.png',
  './assets/ui/mapa_brasil.png',
  './assets/ui/menu_ceu.png',
  './assets/ui/menu_montanhas.png',
  './assets/ui/moldura_icone.png',
  './assets/ui/painel_necessidades.png',
  './assets/ui/quarto_menina.png',
  './assets/ui/quarto_menino.png',
  './assets/ui/selo_esgotado.png',
  './assets/ui/seta_direita.png',
  './assets/ui/seta_direita_off.png',
  './assets/ui/seta_esquerda.png',
  './assets/ui/seta_esquerda_off.png',
  './assets/ui/texto_nome.png',
  './assets/ui/texto_seu_perfil.png',
  './assets/ui/texto_sua_regiao.png',
  './assets/ui/texto_titulo.png',
  './assets/ui/texto_voce_e.png',
  './assets/ui/x_nao.png',
  './js/scenes/Album.js',
  './js/scenes/Boot.js',
  './js/scenes/Brincadeira.js',
  './js/scenes/Carregando.js',
  './js/scenes/Cegonha.js',
  './js/scenes/Configuracoes.js',
  './js/scenes/Menu.js',
  './js/scenes/Perfil.js',
  './js/scenes/Quarto.js',
  './js/scenes/Regiao.js',
  './js/scenes/TesteBebe.js',
  './assets/audio/provisorios/abrir.wav',
  './assets/audio/provisorios/achou.wav',
  './assets/audio/provisorios/beijinho.wav',
  './assets/audio/provisorios/chocalho.wav',
  './assets/audio/provisorios/choro.wav',
  './assets/audio/provisorios/choro_forte.wav',
  './assets/audio/provisorios/chuva.wav',
  './assets/audio/provisorios/clique.wav',
  './assets/audio/provisorios/espirro.wav',
  './assets/audio/provisorios/estouro.wav',
  './assets/audio/provisorios/festa.wav',
  './assets/audio/provisorios/hic.wav',
  './assets/audio/provisorios/marco.wav',
  './assets/audio/provisorios/obturador.wav',
  './assets/audio/provisorios/pagina.wav',
  './assets/audio/provisorios/palmas.wav',
  './assets/audio/provisorios/risada.wav',
  './assets/audio/provisorios/sopro.wav',
  './assets/audio/provisorios/toc.wav',
  './assets/audio/provisorios/tombo.wav',
  './assets/audio/provisorios/trovao.wav'
];

// Instalação: guarda tudo (o Phaser também, para abrir sem internet)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...ARQUIVOS, PHASER])));
  self.skipWaiting();
});

// Ativação: apaga as cópias de versões antigas
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Phaser (versão fixa no endereço): a cópia guardada serve para sempre
  if (req.url === PHASER) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => guardar(req, resp))));
    return;
  }
  if (url.origin !== self.location.origin) return;   // outros sites: o navegador cuida

  // Arquivos do jogo: internet primeiro, cópia se não tiver internet
  e.respondWith(redePrimeiro(req));
});

function redePrimeiro(req) {
  const daRede = fetch(req, { cache: 'no-cache' }).then(resp => guardar(req, resp));
  const daCopia = new Promise(ok => setTimeout(() => caches.match(req, { ignoreSearch: true }).then(ok), ESPERA_REDE));
  return Promise.race([
    daRede.catch(() => caches.match(req, { ignoreSearch: true })),
    daCopia.then(r => r || daRede)            // demorou: usa a cópia (se tiver)
  ]).then(r => r || daRede);
}

function guardar(req, resp) {
  if (resp && resp.ok) {
    const copia = resp.clone();
    caches.open(CACHE).then(c => c.put(req, copia));
  }
  return resp;
}

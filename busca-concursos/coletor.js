#!/usr/bin/env node
/*
 * Coletor de concursos — baixa a lista de concursos com inscrições abertas
 * do PCI Concursos, lê a notícia de cada um que interessa e grava dados.js,
 * que a página index.html usa.
 *
 * Uso:   node coletor.js              (salário mínimo padrão: R$ 5.000)
 *        node coletor.js --min 4000   (coleta a partir de outro valor)
 *        node coletor.js --refresh    (relê todas as notícias, sem reaproveitar)
 *
 * Requer Node 18+ (usa fetch nativo). Sem dependências.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.pciconcursos.com.br';
const LISTA_URL = BASE + '/concursos/';
const SAIDA = path.join(__dirname, 'dados.js');
const UA = 'Mozilla/5.0 (busca-concursos; uso pessoal)';

const args = process.argv.slice(2);
const SALARIO_MIN = Number(args[args.indexOf('--min') + 1]) || 5000;
const REFRESH = args.includes('--refresh');
const PARALELO = 4;

// ---------------------------------------------------------------- utilidades

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ordm: 'º', ordf: 'ª' };
function decodificar(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n.toLowerCase()] ?? m);
}
function semTags(s) {
  return decodificar(s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim();
}
// minúsculas e sem acento, para comparar texto
function normalizar(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function dinheiro(s) {
  // "10.354,29" -> 10354.29
  return Number(s.replace(/\./g, '').replace(',', '.'));
}
function dataBR(d, m, a) {
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function hojeISO() {
  const d = new Date();
  return dataBR(d.getDate(), d.getMonth() + 1, d.getFullYear());
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function baixar(url, tentativas = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (e) {
      if (i >= tentativas) throw new Error(`${url}: ${e.message}`);
      await esperar(1000 * i);
    }
  }
}

// ------------------------------------------------------------ página de lista

function lerInscricao(ce) {
  // formatos: "25/11/2026" | "23/11 a 17/12/2026" | "14/11/2026 a 07/12/2026"
  //           "23 a 30/11/2026" | "Prorrogado até 23/11/2026" | "Reaberto até ..."
  const t = semTags(ce).replace(/\s+/g, ' ');
  const fim = t.match(/(\d{2})\/(\d{2})\/(\d{4})\s*$/);
  if (!fim) return { texto: t, inicio: null, fim: null };
  const [, d, m, a] = fim;
  let inicio = null;
  const ini = t.match(/^(\d{2})(?:\/(\d{2}))?(?:\/(\d{4}))?\s+a\s/);
  if (ini) inicio = dataBR(ini[1], ini[2] || m, ini[3] || a);
  return { texto: t, inicio, fim: dataBR(d, m, a), situacao: /prorrogad/i.test(t) ? 'prorrogado' : /reabert/i.test(t) ? 'reaberto' : '' };
}

function lerVagasSalario(txt) {
  // "300 vagas até R$ 10.354,29" | "Cadastro de reserva até R$ 6.000,00"
  // "1 vaga + CR até R$ ..." | "Vagas até R$ 25,00 por hora-aula"
  const n = normalizar(txt);
  const vagas = n.match(/^([\d.]+)\s+vagas?/);
  const sal = txt.match(/R\$\s*([\d.]+,\d{2})/);
  return {
    vagas: vagas ? Number(vagas[1].replace(/\./g, '')) : null,
    cadastroReserva: /cadastro|\bcr\b/.test(n),
    salarioMax: sal ? dinheiro(sal[1]) : null,
    porHora: /por hora/.test(n),
  };
}

function lerLista(html) {
  const itens = [];
  // cada seção começa com <div id="SP" class="ua">; usamos para saber a UF
  const secoes = [...html.matchAll(/<div id="([A-Z]+)" class="ua">/g)].map((m) => ({ uf: m[1], pos: m.index }));
  const re = /<div class="(?:da|na|ea)"[^>]*data-url="([^"]+)"[^>]*>([\s\S]*?)<div class="clear"><\/div>/g;
  for (const m of html.matchAll(re)) {
    const [, url, bloco] = m;
    const pega = (cls) => (bloco.match(new RegExp(`<div class="${cls}">([\\s\\S]*?)</div>`)) || [, ''])[1];
    const a = bloco.match(/<div class="ca"><a [^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const cd = pega('cd');
    const partes = cd.match(/^([\s\S]*?)<br><span>([\s\S]*?)<br><span>([\s\S]*?)<\/span>/);
    let secao = 'NACIONAL';
    for (const s of secoes) if (s.pos < m.index) secao = s.uf;
    const ufBloco = semTags(pega('cc'));
    itens.push({
      url,
      orgao: a ? semTags(a[2]) : '',
      manchete: a ? decodificar(a[1]) : '',
      uf: secao === 'NACIONAL' ? 'Nacional' : ufBloco || secao,
      ...lerVagasSalario(partes ? semTags(partes[1]) : semTags(cd)),
      cargos: partes ? semTags(partes[2]) : '',
      escolaridade: partes ? semTags(partes[3]) : '',
      inscricao: lerInscricao(pega('ce')),
    });
  }
  return itens;
}

// ---------------------------------------------------------- página da notícia

const ORGAOS_DISPUTADOS =
  /\b(tribunal|tj[a-z]{2}|trf|trt|tre|tce|tcm|tcu|stf|stj|tst|receita|policia federal|prf|banco central|bacen|senado|camara dos deputados|assembleia legislativa|ministerio publico|defensoria|procuradoria|petrobras|banco do brasil|caixa economica|bndes|cgu|agu|anvisa|anatel|aneel|ibama|inss)\b/;
const BANCAS_DIFICEIS = /\b(cebraspe|cespe|fgv|getulio vargas|fcc|carlos chagas|cesgranrio|vunesp)\b/;
const FEDERAL =
  /\b(federal|ministerio d[aoe]|ibge|inss|ebserh|correios|petrobras|banco do brasil|caixa economica|exercito|marinha|aeronautica|trf\d?|trt\d*|tst|stj|stf|tcu|cgu|agu|prf|cefet|mpu|anvisa|anatel|aneel|ibama|icmbio|incra|funai|bacen|banco central|camara dos deputados|senado federal|pioneiras sociais)\b/;
const MUNICIPAL =
  /\b(prefeitura|camara municipal|camara de|municipio|municipal|saae|servico autonomo|consorcio|autarquia municipal|instituto de previdencia)\b/;

function lerNoticia(html) {
  const art = (html.match(/<article[\s\S]*?<\/article>/) || [html])[0];
  const corpoHtml = (art.match(/<div itemprop="articleBody">([\s\S]*?)<\/div>/) || [, ''])[1];
  // parágrafos e itens de lista viram linhas de texto
  const linhas = [...corpoHtml.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/g)]
    .map((m) => (m[1] === 'li' ? '• ' : '') + semTags(m[2]))
    .filter((l) => l && !/apostila|podcast desta not|material b[aá]sico|ponto de partida|maximize seu potencial/i.test(l));
  const texto = linhas.join('\n').slice(0, 4000);
  const descricao = semTags((art.match(/<div class="description"[^>]*>([\s\S]*?)<\/div>/) || [, ''])[1]);
  const publicado = (art.match(/<abbr class="published" title="([^"]+)"/) || [, ''])[1].slice(0, 10);

  // organizadora: texto do link logo após "pelo site do/da ..." (os links são ocultados pelo site)
  let banca = '';
  const mb = corpoHtml.match(/(?:site|p[aá]gina|portal)\s+d[oa]s?\s*<a[^>]*>([\s\S]*?)<\/a>/i) || corpoHtml.match(/<a[^>]*data-link-noticia[^>]*>([\s\S]*?)<\/a>/i);
  if (mb) banca = semTags(mb[1]);
  if (/^(aqui|neste link|clique|edital|site)$/i.test(banca)) banca = '';

  return { descricao, publicado, banca, texto };
}

// --------------------------------------------------------- análise e pontuação

function valoresEmReais(trecho) {
  return [...trecho.matchAll(/R\$\s*([\d.]+,\d{2})/g)].map((m) => dinheiro(m[1]));
}

function analisar(item) {
  const tudo = normalizar([item.manchete, item.descricao, item.texto].join('\n'));
  const frases = tudo.split(/(?<=[.;:!?])\s+|\n/);
  const f = {};

  f.qualquerArea = /qualquer (area|curso|formacao|graduacao|especialidade|carreira)|graduacao em qualquer|superior em qualquer/.test(tudo);
  f.objetiva = /prova(s)? objetiva|prova(s)? escrita|teste(s)? objetivo|prova(s)? de conhecimento/.test(tudo);
  f.discursiva = /discursiva|redacao|dissertativ|estudo de caso|peca (pratica|processual)/.test(tudo);
  f.titulos = /titulos|analise curricular|analise de curriculo|avaliacao curricular|curriculo/.test(tudo);
  f.entrevista = /entrevista/.test(tudo);
  f.taf = /aptidao fisica|\btaf\b|teste fisico|capacidade fisica|condicionamento fisico|avaliacao fisica/.test(tudo);
  f.pratica = /prova(s)? pratica|teste(s)? pratico|avaliacao pratica/.test(tudo);
  f.oral = /prova oral/.test(tudo);
  f.psicologico = /psicologic|psicotecnic/.test(tudo);
  f.cursoFormacao = /curso de formacao/.test(tudo);
  f.semProva = !f.objetiva && !f.discursiva && !f.oral && !f.pratica && (f.titulos || f.entrevista) && !/\bprova(s)?\b(?! de titulos)/.test(tudo.replace(/prova(s)? de titulos/g, ''));
  f.temporario = /processo seletivo|temporari|tempo determinado|contratacao emergencial|\bpss\b/.test(tudo) && !/concurso publico/.test(normalizar(item.manchete));

  // esfera
  const org = normalizar(item.orgao + ' ' + item.manchete);
  f.esfera = MUNICIPAL.test(org) ? 'Municipal' : item.uf === 'Nacional' || FEDERAL.test(org) ? 'Federal' : 'Estadual';

  // faixa salarial a partir do texto (ignora valores ligados a taxa de inscrição)
  const salFrases = frases.filter((s) => /r\$/.test(s) && !/taxa|inscric|isencao/.test(s));
  const vals = salFrases.flatMap(valoresEmReais).filter((v) => v >= 500 && v <= 100000);
  const taxas = frases.filter((s) => /taxa/.test(s)).flatMap(valoresEmReais).filter((v) => v > 0 && v < 1000);
  item.salarioMin = vals.length ? Math.min(...vals) : null;
  if (vals.length && (!item.salarioMax || Math.max(...vals) > item.salarioMax)) item.salarioMax = Math.max(...vals);
  item.taxa = taxas.length ? Math.max(...taxas) : null;

  // cargos citados na notícia (itens de lista), sem o "(N vagas)"
  item.cargosLista = item.texto
    .split('\n')
    .filter((l) => l.startsWith('• '))
    .map((l) => l.slice(2).replace(/\s*\(.*?\)\s*$/, '').trim())
    .filter((l) => l.length < 90)
    .slice(0, 80);

  // ---- escolaridade que interessa
  // A fonte só informa o MAIOR salário do edital e as escolaridades somadas.
  // Se o edital só tem nível médio (ou fundamental/médio), o salário é do médio:
  // "confirmado". Se também tem superior/técnico, pode ser de outro cargo: "possível".
  const esc = normalizar(item.escolaridade);
  item.temMedio = /medio/.test(esc);
  item.temSuperior = /superior/.test(esc);
  item.superiorQualquerArea = item.temSuperior && f.qualquerArea;
  item.confiancaMedio = !item.temMedio ? null : !item.temSuperior && !/tecnico/.test(esc) ? 'confirmado' : 'possivel';
  item.confiancaQualquerArea = !item.superiorQualquerArea ? null : !item.temMedio && !/tecnico|fundamental/.test(esc) ? 'confirmado' : 'possivel';

  // cargos de formação específica que costumam ter os maiores salários do edital
  const ESPECIALISTA = /\b(medic[oa]|odontolog|dentista|cirurgiao|engenheir|advogad|procurador|psicolog|enfermeir|farmaceutic|fisioterapeut|veterinari|arquitet|nutricionista|fonoaudiolog|contador|auditor|delegad|juiz|promotor|defensor|analista de tecnologia|desenvolvedor|cientista de dados|professor|pedagog)/;
  const nomes = [...new Set([...item.cargosLista, ...item.cargos.split(/[,;]/)].map((c) => c.trim()).filter((c) => ESPECIALISTA.test(normalizar(c))))];
  // médicos e dentistas primeiro: são quase sempre os maiores salários
  const peso = (c) => (/medic|odontolog|dentista|cirurgiao/.test(normalizar(c)) ? 0 : /engenheir|advogad|procurador|auditor|delegad/.test(normalizar(c)) ? 1 : 2);
  item.cargosEspecialistas = nomes.sort((x, y) => peso(x) - peso(y)).slice(0, 4);

  // ---- esforço de estudo estimado (1 = muito baixo ... 5 = muito alto)
  const motivos = [];
  let p;
  if (f.semProva) {
    p = 1;
    motivos.push('Sem prova escrita: só títulos/currículo' + (f.entrevista ? ' e entrevista' : ''));
  } else {
    p = 2.5;
    motivos.push(f.objetiva ? 'Prova objetiva (base)' : 'Etapas de prova não detalhadas (base)');
    if (f.esfera === 'Municipal') { p -= 1; motivos.push('Órgão municipal: concorrência costuma ser menor (−1)'); }
    if (f.esfera === 'Federal') { p += 1; motivos.push('Órgão federal/nacional: concorrência alta (+1)'); }
    if (ORGAOS_DISPUTADOS.test(org)) { p += 1.5; motivos.push('Órgão muito disputado (tribunal, controle, polícia federal etc.) (+1,5)'); }
    if (BANCAS_DIFICEIS.test(normalizar(item.banca + ' ' + item.texto))) { p += 1; motivos.push('Banca conhecida por provas difíceis (+1)'); }
    if (f.discursiva) { p += 1; motivos.push('Tem prova discursiva/redação (+1)'); }
    if (f.oral) { p += 1; motivos.push('Tem prova oral (+1)'); }
    if (f.cursoFormacao) { p += 0.5; motivos.push('Tem curso de formação eliminatório (+0,5)'); }
    if (f.temporario) { p -= 0.5; motivos.push('Seleção temporária/simplificada (−0,5)'); }
    if (item.salarioMax >= 12000) { p += 1; motivos.push('Salário muito alto atrai mais candidatos (+1)'); }
    if (item.vagas >= 50) { p -= 0.5; motivos.push(`${item.vagas} vagas: mais chances (−0,5)`); }
    if (!item.vagas && item.cadastroReserva) { p += 0.5; motivos.push('Só cadastro de reserva (+0,5)'); }
  }
  item.esforco = Math.max(1, Math.min(5, Math.round(p)));
  item.motivos = motivos;
  item.etapas = f;
  return item;
}

// ----------------------------------------------------------------- principal

function interessa(it) {
  if (it.porHora) return false;
  if (!it.salarioMax || it.salarioMax < SALARIO_MIN) return false;
  return /medio|superior/i.test(normalizar(it.escolaridade));
}

function carregarAnterior() {
  try {
    const txt = fs.readFileSync(SAIDA, 'utf8');
    const json = txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1);
    const d = JSON.parse(json);
    return new Map(d.concursos.map((c) => [c.url, c]));
  } catch {
    return new Map();
  }
}

async function main() {
  console.log(`Baixando lista: ${LISTA_URL}`);
  const lista = lerLista(await baixar(LISTA_URL));
  const hoje = hojeISO();
  const abertos = lista.filter((i) => !i.inscricao.fim || i.inscricao.fim >= hoje);
  const candidatos = abertos.filter(interessa);
  console.log(`${lista.length} concursos na lista, ${abertos.length} com inscrição em dia, ${candidatos.length} com salário ≥ R$ ${SALARIO_MIN} e nível médio/superior.`);

  const anterior = REFRESH ? new Map() : carregarAnterior();
  const resultado = [];
  let feitos = 0, erros = 0;
  const fila = [...candidatos];
  async function trabalhador() {
    while (fila.length) {
      const it = fila.shift();
      const velho = anterior.get(it.url);
      try {
        const noticia = velho && velho.texto ? { descricao: velho.descricao, publicado: velho.publicado, banca: velho.banca, texto: velho.texto } : lerNoticia(await baixar(it.url));
        resultado.push(analisar({ ...it, ...noticia }));
        if (!velho) await esperar(300);
      } catch (e) {
        erros++;
        console.warn('  falhou:', e.message);
        resultado.push(analisar({ ...it, descricao: '', publicado: '', banca: '', texto: '' }));
      }
      feitos++;
      if (feitos % 20 === 0) console.log(`  ${feitos}/${candidatos.length} notícias lidas`);
    }
  }
  await Promise.all(Array.from({ length: PARALELO }, trabalhador));

  resultado.sort((a, b) => a.esforco - b.esforco || b.salarioMax - a.salarioMax);
  const dados = {
    coletadoEm: new Date().toISOString(),
    fonte: LISTA_URL,
    salarioMinColeta: SALARIO_MIN,
    totalNaFonte: lista.length,
    concursos: resultado,
  };
  fs.writeFileSync(SAIDA, '// Gerado por coletor.js — não edite à mão.\nwindow.DADOS_CONCURSOS = ' + JSON.stringify(dados, null, 1) + ';\n');
  const medio = resultado.filter((c) => c.temMedio).length;
  const qa = resultado.filter((c) => c.superiorQualquerArea).length;
  console.log(`Pronto: ${resultado.length} concursos gravados em ${path.basename(SAIDA)} (${medio} com nível médio, ${qa} superior em qualquer área${erros ? `, ${erros} falhas` : ''}).`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Erro:', e.message);
    process.exit(1);
  });
}

module.exports = { lerLista, lerNoticia, analisar, lerInscricao, lerVagasSalario, normalizar };

// Concursos autorizados que ainda não publicaram edital.
// Lista montada à mão a partir de notícias e do Diário Oficial (não é gerada pelo coletor).
// Cada item traz a fonte; confira antes de decidir. "chaves" são termos usados pela
// página para avisar quando o edital aparecer na lista de inscrições abertas.
window.AUTORIZADOS = {
  atualizadoEm: '2026-11-22',
  itens: [
    {
      orgao: 'Banco Central do Brasil (Bacen)',
      esfera: 'Federal', uf: 'Nacional',
      situacao: 'Banca definida',
      cargos: [
        { nome: 'Técnico', escolaridade: 'Confira: as fontes divergem entre médio e superior', salario: 8300 },
        { nome: 'Analista / Auditor', escolaridade: 'Superior' },
        { nome: 'Procurador', escolaridade: 'Superior em Direito' },
      ],
      vagas: 170,
      banca: 'FGV',
      previsaoEdital: 'Até 30/12/2026',
      esforco: 5,
      notaEsforco: 'Órgão federal muito disputado, banca FGV e salários altos.',
      fontes: [
        { nome: 'JC Concursos', url: 'https://jcconcursos.com.br/noticia/concursos/concurso-bacen-urgente-definida-banca-para-170-vagas-edital-em-dezembro-146665' },
      ],
      chaves: ['banco central', 'bacen'],
    },
    {
      orgao: 'Receita Federal',
      esfera: 'Federal', uf: 'Nacional',
      situacao: 'Autorizado',
      cargos: [
        { nome: 'Analista-Tributário', escolaridade: 'Superior em qualquer área' },
        { nome: 'Auditor-Fiscal', escolaridade: 'Superior em qualquer área' },
      ],
      vagas: null,
      banca: 'A definir (prevista para novembro de 2026)',
      previsaoEdital: 'Dezembro de 2026',
      esforco: 5,
      notaEsforco: 'Um dos concursos mais disputados do país.',
      fontes: [
        { nome: 'Estratégia Concursos', url: 'https://concursos.estrategia.com/portal/concurso-receita-federal/' },
      ],
      chaves: ['receita federal'],
    },
    {
      orgao: 'Controladoria-Geral da União (CGU)',
      esfera: 'Federal', uf: 'Nacional',
      situacao: 'Autorizado',
      cargos: [
        { nome: 'Auditor Federal de Finanças e Controle', escolaridade: 'Superior (confira a área no edital)' },
      ],
      vagas: 60,
      banca: 'A definir',
      previsaoEdital: 'Até 24/12/2026 (prazo de 6 meses da portaria)',
      esforco: 5,
      notaEsforco: 'Órgão de controle federal, concorrência muito alta.',
      fontes: [
        { nome: 'Portaria MGI nº 5.093/2026 (DOU de 24/06/2026)', url: 'https://www.in.gov.br/web/dou/-/portaria-mgi-n-5.093-de-22-de-junho-de-2026-714435116' },
      ],
      chaves: ['controladoria-geral da uniao', 'cgu'],
    },
    {
      orgao: 'Agência Nacional de Proteção de Dados (ANPD)',
      esfera: 'Federal', uf: 'Nacional',
      situacao: 'Banca definida',
      cargos: [
        { nome: 'Especialista em Regulação e Proteção de Dados', escolaridade: 'Superior (confira a área no edital)', salario: 17726.42 },
      ],
      vagas: 50,
      banca: 'Cebraspe',
      previsaoEdital: '18/12/2026',
      esforco: 5,
      notaEsforco: 'Órgão federal, banca Cebraspe e salário acima de R$ 17 mil.',
      fontes: [
        { nome: 'Portaria MGI nº 5.092/2026 (DOU de 24/06/2026)', url: 'https://www.in.gov.br/web/dou/-/portaria-mgi-n-5.092-de-22-de-junho-de-2026-714430536' },
        { nome: 'Estratégia Concursos', url: 'https://concursos.estrategia.com/portal/concurso-anpd/' },
      ],
      chaves: ['protecao de dados', 'anpd'],
    },
    {
      orgao: 'Procuradoria-Geral do Estado do Rio de Janeiro (PGE-RJ)',
      esfera: 'Estadual', uf: 'RJ',
      situacao: 'Comissão formada',
      cargos: [
        { nome: 'Analista', escolaridade: 'Superior' },
        { nome: 'Técnico (cadastro de reserva)', escolaridade: 'Médio' },
      ],
      vagas: 30,
      banca: 'A definir',
      previsaoEdital: 'Sem data; autorização publicada em 05/11/2026',
      esforco: 4,
      notaEsforco: 'Órgão estadual jurídico, costuma ter concorrência alta.',
      fontes: [
        { nome: 'Direção Concursos', url: 'https://www.direcaoconcursos.com.br/noticias/concurso-pge-rj-comissao-organizadora' },
      ],
      chaves: ['procuradoria geral do estado do rio', 'pge rj', 'pge-rj'],
    },
    {
      orgao: 'Instituto Nacional do Seguro Social (INSS)',
      esfera: 'Federal', uf: 'Nacional',
      situacao: 'Pedido em análise',
      cargos: [
        { nome: 'Técnico do Seguro Social', escolaridade: 'Médio', salario: 6402.76 },
        { nome: 'Analista do Seguro Social', escolaridade: 'Superior' },
      ],
      vagas: 10000,
      banca: 'A definir',
      previsaoEdital: 'Depende de autorização do governo federal',
      esforco: 4,
      notaEsforco: 'Prova objetiva de nível médio, mas o último concurso teve mais de 1 milhão de inscritos.',
      fontes: [
        { nome: 'Folha Dirigida', url: 'https://folha.qconcursos.com/n/concurso-inss-2026-cargos-vagos' },
        { nome: 'JC Concursos', url: 'https://jcconcursos.com.br/noticia/concursos/concurso-inss-selecao-pode-ser-autorizada-antes-das-eleicoes-com-oferta-de-vagas-reduzida-144249' },
      ],
      chaves: ['instituto nacional do seguro social', 'inss'],
    },
  ],
};

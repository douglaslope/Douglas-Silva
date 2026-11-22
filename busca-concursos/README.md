# Radar de Concursos

Busca de concursos e processos seletivos com inscrição aberta que pagam a partir de R$ 5 mil, para **nível médio** ou **superior em qualquer área**, ordenados por uma nota de **esforço de estudo estimado** (1 = muito baixo, 5 = muito alto). Uma segunda aba mostra os concursos **já autorizados** que ainda não têm edital.

## Como usar

1. Abra `index.html` no navegador (dois cliques no arquivo).
2. Use os filtros: escolaridade, certeza sobre o salário, salário mínimo, esforço máximo, estado, esfera (municipal/estadual/federal), vínculo, "sem prova escrita", "sem TAF".
3. Abra **Detalhes** em cada edital para ver por que ele recebeu aquela nota, as etapas citadas, os cargos e o link da notícia completa.

## Como atualizar os dados

Os editais mudam toda semana. Para buscar a lista nova (precisa do [Node.js](https://nodejs.org) 18 ou mais novo, sem instalar mais nada):

```bash
cd busca-concursos
node coletor.js            # salário mínimo de R$ 5.000
node coletor.js --min 4000 # coleta a partir de outro valor
node coletor.js --refresh  # relê todas as notícias do zero
```

O coletor lê a lista de concursos abertos do [PCI Concursos](https://www.pciconcursos.com.br/concursos/), abre a notícia de cada edital que passa no filtro de salário e escolaridade, e grava tudo em `dados.js`. Leva cerca de 30 segundos.

## Como a nota de esforço é calculada

Nenhum concurso acima de R$ 5 mil dispensa estudo. A nota indica onde a disputa tende a ser mais leve:

| Fator | Efeito |
|---|---|
| Só títulos, currículo ou entrevista (sem prova escrita) | nota 1 |
| Prova objetiva | parte de 2,5 |
| Órgão municipal | −1 |
| Órgão federal | +1 |
| Tribunal, órgão de controle, polícia federal, banco público etc. | +1,5 |
| Banca Cebraspe, FGV, FCC, Vunesp ou Cesgranrio | +1 |
| Prova discursiva/redação | +1 |
| Prova oral | +1 |
| Curso de formação eliminatório | +0,5 |
| Salário acima de R$ 12 mil | +1 |
| Seleção temporária/simplificada | −0,5 |
| 50 vagas ou mais | −0,5 |
| Só cadastro de reserva | +0,5 |

## Certeza sobre o salário

A fonte (PCI Concursos, inclusive o conector oficial dele) informa só o **maior salário** de cada edital e a escolaridade somada de todos os cargos. Não existe salário por cargo. Por isso cada edital é classificado:

| Classificação | Quando |
|---|---|
| **Confirmado** | Todos os cargos pedem até o ensino médio; ou o edital tem um cargo só e a notícia diz "qualquer área"; ou a notícia dá a faixa salarial e o menor salário já passa do mínimo escolhido (e há cargo sem formação específica); ou a notícia diz quanto paga o nível médio. |
| **Provável** | Há vaga de nível médio e nenhum cargo de formação específica foi encontrado; ou o cargo costuma aceitar qualquer área (Analista/Técnico Judiciário – Área Administrativa, Agente/Escrivão de Polícia, Policial Penal). |
| **Salário de outro cargo** | O edital tem médico, engenheiro, professor, oficial (tenente), curso técnico ou cargo com área definida ("Analista, Contabilidade"). A vaga de nível médio provavelmente paga menos. |

Por padrão a página mostra só os **confirmados**. O filtro "Certeza sobre o salário" libera os outros.

## Concursos autorizados

Ficam em `autorizados.js`, uma lista montada à mão a partir de portarias do Diário Oficial da União e de notícias recentes, com o link de cada fonte. O coletor **não** atualiza esse arquivo: não existe uma lista oficial única de autorizações (as estaduais e municipais saem em centenas de diários oficiais) e a busca do DOU deixa portarias de fora. Quando um autorizado publica o edital, a página avisa e ele passa a aparecer em "Inscrições abertas".

## Limitações

- "Superior em qualquer área" só é confirmado quando a notícia diz isso com todas as letras.
- A nota de esforço é uma estimativa automática a partir do texto da notícia, não uma avaliação do edital completo.

# Radar de Concursos

Busca de concursos e processos seletivos com inscrição aberta que pagam a partir de R$ 5 mil, para **nível médio** ou **superior em qualquer área**, ordenados por uma nota de **esforço de estudo estimado** (1 = muito baixo, 5 = muito alto).

## Como usar

1. Abra `index.html` no navegador (dois cliques no arquivo).
2. Use os filtros: escolaridade, salário mínimo, esforço máximo, estado, esfera (municipal/estadual/federal), vínculo, "sem prova escrita", "sem TAF".
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

## Limitações

- A fonte informa só o **maior salário** de cada edital. Quando o edital tem vários níveis, esse valor costuma ser de médico, engenheiro ou professor. A página mostra um alerta amarelo nesses casos e o selo verde **"Salário do nível médio"** quando o edital só tem nível médio. Confira a tabela de cargos no edital antes de se inscrever.
- "Superior em qualquer área" só é marcado quando a notícia diz isso com todas as letras; editais que aceitam qualquer formação sem dizer isso na notícia ficam de fora desse filtro.
- A nota é uma estimativa automática a partir do texto da notícia, não uma avaliação do edital completo.

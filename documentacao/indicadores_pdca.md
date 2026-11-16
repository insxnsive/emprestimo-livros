# Indicadores e Melhoria Contínua — SEL

## Indicadores calculados
| Indicador | Cálculo | Resultado | Interpretação |
|---|---|---|---|
| Testes aprovados – rodada 1 | 11 ÷ 12 × 100 | **91,7%** | Acima da meta (≥ 90%), mas a falha em CT04 mostrou validação de ISBN insuficiente. |
| Testes aprovados – rodada 2 (final) | 13 ÷ 13 × 100 | **100%** | Correção eficaz e sem regressão (CT13). |
| NCs corrigidas | 2 ÷ 2 × 100 | **100%** | Nenhuma NC pendente na entrega. |
| Checklist atendido | 11 ÷ 11 × 100 | **100%** (rodada 1: 10 ÷ 11 = 90,9%) | Todos os critérios com evidência. |
| Requisitos verificados | 7 ÷ 7 × 100 | **100%** | Todo RF tem pelo menos um caso de teste. |
| Riscos altos sem resposta | contagem | **0** | R01 e R03 têm resposta definida. |

**Melhoria prioritária:** ampliar os testes de entrada inválida (datas digitadas à mão, e-mail, exemplares decimais) e manter a bateria de regressão a cada alteração.

## Ciclo PDCA aplicado
- **Plan (Planejar):** o teste exploratório EXP01 mostrou que o ISBN era aceito só pela quantidade de dígitos. Meta: rejeitar 100% dos ISBN com dígito verificador errado sem rejeitar ISBN válidos.
- **Do (Executar):** implementar o cálculo do dígito verificador de ISBN-10 e ISBN-13 e uma mensagem de erro com exemplo.
- **Check (Verificar):** repetir CT03 e CT04 e cadastrar um ISBN-10 válido terminado em X (CT13). Resultado: testes aprovados subiram de 91,7% para 100%.
- **Act (Agir):** padronizar a regra, atualizar o critério Q02 do checklist e manter CT13 na bateria de regressão.

## Conclusão do grupo
O SEL implementou o cadastro de livros, o registro de empréstimos e devoluções e a consulta de disponibilidade. A equipe definiu critérios de qualidade, aplicou o checklist e executou 13 casos de teste com evidências. A primeira rodada teve 91,7% de aprovação, e a falha encontrada (validação de ISBN) foi priorizada, corrigida e verificada por regressão, chegando a 100%. Também foi corrigida uma falha herdada do painel de referência (status de NC não salvo). Como próximos passos, recomenda-se ampliar os testes de entradas inválidas e avaliar o uso de um banco de dados para não depender do LocalStorage.

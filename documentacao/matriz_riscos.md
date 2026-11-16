# Matriz de Riscos — SEL

| ID | Risco | Probabilidade | Impacto | Resposta planejada | Situação |
|---|---|---|---|---|---|
| R01 | Escopo crescer além do prazo (reservas, multas, login) | Média | Alta | Manter só as funcionalidades mínimas; extras como melhoria futura | Controlado |
| R02 | Perda de dados no LocalStorage (limpeza do navegador) | Média | Média | Testar persistência (CT12) e manter cópia dos dados de demonstração | Monitorado |
| R03 | Disponibilidade inconsistente (emprestar mais do que existe) | Média | Alta | Calcular disponibilidade a partir dos empréstimos em aberto; validar antes de salvar; bloquear redução de exemplares abaixo dos emprestados | Mitigado (CT07, CT10) |
| R04 | Datas erradas por fuso horário (`new Date("AAAA-MM-DD")` interpreta como UTC) | Baixa | Média | Trabalhar com datas locais AAAA-MM-DD e testar no fuso America/Sao_Paulo | Mitigado (CT06, CT08) |
| R05 | Conflito de código entre integrantes | Média | Média | Combinar interfaces, revisar alterações, manter versão funcional | Monitorado |

**Escala:** Probabilidade (Baixa / Média / Alta) × Impacto (Baixo / Médio / Alto). Riscos de impacto Alto sem resposta: **0**.

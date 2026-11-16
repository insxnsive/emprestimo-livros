# Critérios e Checklist de Qualidade — SEL

Resultado da verificação feita na versão final (Chrome, 16/11/2026). Evidências na pasta `evidencias/`.

| ID | Critério | Como verificar | Evidência | Status |
|---|---|---|---|---|
| Q01 | Campos obrigatórios validados | Salvar livro sem título/autor; empréstimo sem datas válidas | CT02, CT08 | Atende |
| Q02 | ISBN validado (formato e dígito verificador) | ISBN com letras, curto e com dígito errado; ISBN-10 com X | CT04, CT13 | Atende (após correção da NC01) |
| Q03 | ISBN duplicado bloqueado | Cadastrar o mesmo ISBN sem hífens | CT03, CT13 | Atende |
| Q04 | Exemplares e datas validados | Prazo igual a 0 dias e 45 dias | CT08 | Atende |
| Q05 | CRUD de livros funciona | Cadastrar, editar, excluir | CT01, CT05, CT11 | Atende |
| Q06 | Empréstimo só com exemplar disponível | Emprestar todos os exemplares | CT07 | Atende |
| Q07 | Devolução libera o exemplar | Registrar devolução | CT09 | Atende |
| Q08 | Exclusão com confirmação e proteção | Cancelar/confirmar; excluir livro emprestado | CT10, CT11 | Atende |
| Q09 | Persistência | Recarregar a página | CT12 | Atende |
| Q10 | Mensagens claras | Provocar sucesso e erro | CT01–CT11 | Atende |
| Q11 | Interface consistente | Inspeção de rótulos, botões, abas, layout no celular | `layout_celular.png` | Atende |

**Indicador:** checklist atendido = 11 ÷ 11 × 100 = **100%** (na primeira rodada, Q02 não atendia: 10 ÷ 11 = 90,9%).

# Plano e Resultados dos Testes — SEL

**Ambiente:** Google Chrome, fuso America/Sao_Paulo, 16/11/2026. Testes executados por script que opera a interface como um usuário. Cada caso começa a partir do estado deixado pelo anterior.

**Rodadas**
- **Rodada 1 (versão inicial):** CT01–CT12. ISBN validado só pela quantidade de dígitos.
- **Rodada 2 (após correção da NC01):** CT01–CT13 (CT13 = regressão).

| ID | Cenário / dados | Resultado esperado | Rodada 1 | Rodada 2 (final) | Evidência |
|---|---|---|---|---|---|
| CT01 | Cadastrar *Dom Casmurro*, Machado de Assis, ISBN 978-85-359-0277-8, 2 exemplares | Salvo e exibido como Disponível (2) | Aprovado | Aprovado | CT01_cadastro_valido.png |
| CT02 | Salvar livro sem título e sem autor | Bloqueado; mensagem "Informe o título. Informe o autor." | Aprovado | Aprovado | CT02_obrigatorios.png |
| CT03 | Cadastrar ISBN 9788535902778 (mesmo, sem hífens) | Bloqueado por duplicidade | Aprovado | Aprovado | CT03_isbn_duplicado.png |
| CT04 | ISBN `97885ABC02778`, `12345` e `978-85-359-0277-1` (dígito errado) | Os três rejeitados | **Reprovado** – o de dígito errado foi aceito | Aprovado | CT04_isbn_invalido.png |
| CT05 | Editar a editora de *Dom Casmurro* | Editora alterada; autor, ISBN e exemplares mantidos | Aprovado | Aprovado | CT05_edicao.png |
| CT06 | Empréstimo de *Dom Casmurro* para Ana Souza, prazo padrão de 14 dias | Ativo; disponibilidade 2 → 1 | Aprovado | Aprovado | CT06_emprestimo.png |
| CT07 | Emprestar o último exemplar (Bruno Lima) | Indisponível; sai da lista de seleção | Aprovado | Aprovado | CT07_indisponivel.png |
| CT08 | Devolução prevista = data do empréstimo; depois +45 dias | Bloqueado nas duas tentativas | Aprovado | Aprovado | CT08_prazo_invalido.png |
| CT09 | Registrar devolução de Ana Souza | Devolvido; disponibilidade volta a 1 | Aprovado | Aprovado | CT09_devolucao.png |
| CT10 | Excluir *Dom Casmurro* com empréstimo em aberto | Exclusão bloqueada com mensagem | Aprovado | Aprovado | CT10_exclusao_bloqueada.png |
| CT11 | Excluir *O Cortiço*: cancelar, depois confirmar | Cancelar mantém; confirmar remove | Aprovado | Aprovado | CT11_exclusao_confirmacao.png |
| CT12 | Recarregar a página | Livro e 2 empréstimos continuam | Aprovado | Aprovado | CT12_persistencia.png |
| CT13 | **Regressão:** repetir CT03 e CT04 e cadastrar ISBN-10 válido 0-8044-2957-X | Duplicado e dígito errado bloqueados; ISBN válido aceito | — | Aprovado | CT13_regressao.png |

**Resumo:** Rodada 1 = 11 de 12 aprovados (91,7%). Rodada 2 = 13 de 13 aprovados (100%).

## Testes exploratórios
| ID | O que foi testado | Resultado | Evidência | Gerou |
|---|---|---|---|---|
| EXP01 | Versão inicial: cadastrar ISBN 978-85-359-0277-1 (dígito verificador errado) | Aceito com "Livro cadastrado com sucesso." | EXP01_isbn_digito_errado.png | NC01 |
| EXP02 | Código de referência (Veículos): mudar status da NC01 para Corrigida e recarregar | Voltou para "Pendente" (3 NCs abertas) | EXP02_referencia_status_nc_apos_recarregar.png | NC02 |

# Sistema de Empréstimo de Livros (SEL) — Gestão da Qualidade de Software

Projeto acadêmico do tema alternativo **Empréstimo de Livros**: cadastrar livros, registrar empréstimos e devoluções e consultar disponibilidade. Segue a mesma estrutura do projeto de referência (Cadastro de Veículos) e do gabarito sugerido.

## 1. Executar
1. Extraia o ZIP.
2. Abra `index.html` em um navegador atualizado (Chrome, Edge ou Firefox).
3. Aba **Acervo de livros**: cadastrar, consultar disponibilidade, editar e excluir livros.
4. Aba **Empréstimos e devoluções**: registrar empréstimos, devoluções e filtrar por situação.
5. Aba **Painel da qualidade**: checklist, casos de teste, riscos, não conformidades, indicadores e PDCA.

Não requer backend, banco de dados nem instalação. Os dados ficam no LocalStorage do navegador.

## 2. Requisitos
**Funcionais**
- RF01 – Cadastrar livro (título, autor, ISBN, editora, ano, gênero, exemplares).
- RF02 – Listar livros e consultar por título, autor ou ISBN, com filtro "somente disponíveis".
- RF03 – Editar e excluir livro (exclusão com confirmação; bloqueada se houver empréstimo em aberto).
- RF04 – Impedir dois livros com o mesmo ISBN (comparação sem hífens/espaços).
- RF05 – Registrar empréstimo (livro, leitor, e-mail opcional, data do empréstimo, devolução prevista).
- RF06 – Registrar devolução, liberando o exemplar.
- RF07 – Exibir disponibilidade = exemplares − empréstimos em aberto; situação do empréstimo (Ativo, Atrasado, Devolvido).

**Não funcionais**
- RNF01 – Interface simples, com rótulos e mensagens claras.
- RNF02 – Validar campos obrigatórios, ISBN (dígito verificador), exemplares (1–99), ano (1450 até o ano atual), e-mail e prazo (1 a 30 dias).
- RNF03 – Manter os dados após recarregar a página (LocalStorage).
- RNF04 – Funcionar em navegadores atuais e em telas de celular.
- RNF05 – Usar apenas dados fictícios.

## 3. Regras de negócio
- Só aparecem para empréstimo livros com exemplar disponível.
- A quantidade de exemplares não pode ficar abaixo dos empréstimos em aberto.
- A data do empréstimo não pode estar no futuro; a devolução prevista deve ser 1 a 30 dias depois.
- Empréstimo sem devolução e com prazo vencido aparece como **Atrasado**.

## 4. Como o projeto atende à Gestão da Qualidade
| Item do enunciado | Onde está |
|---|---|
| Objetivos e critérios de qualidade | `documentacao/plano_gestao_qualidade.md` (seções 3 e 5) |
| Requisitos e padrões | Este README (seção 2) e plano (seção 6) |
| Planejamento da qualidade | Plano (seções 4 e 7) |
| Garantia da qualidade + checklist | Plano (seção 6) e `documentacao/criterios_checklist.md` |
| Controle da qualidade (testes) | `documentacao/casos_teste.md` e pasta `evidencias/` |
| Gestão de riscos | `documentacao/matriz_riscos.md` e painel |
| Não conformidades | `documentacao/registro_nao_conformidades.md` e painel |
| Métricas e melhoria contínua | `documentacao/indicadores_pdca.md` e painel |

## 5. Evidências
A pasta `evidencias/` contém capturas de tela de cada caso de teste (CT01–CT13) e dos testes exploratórios (EXP01, EXP02), além dos resultados em JSON. Os testes foram executados no Google Chrome, com fuso horário America/Sao_Paulo, por script automatizado que opera a interface como um usuário.

## 6. Limitações
- LocalStorage não é banco de dados: os dados ficam só neste navegador e são perdidos se o histórico for limpo.
- Não há cadastro de leitores, login, reservas, renovação nem cálculo de multas (fora do escopo).
- A devolução é registrada com a data do dia; não é possível informar devolução retroativa.

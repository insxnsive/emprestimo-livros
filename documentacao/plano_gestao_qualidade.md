# Plano de Gestão da Qualidade de Software
## Sistema de Empréstimo de Livros (SEL)

### 1. Objetivo
Definir como a qualidade do SEL será planejada, assegurada, controlada e melhorada durante o projeto acadêmico.

### 2. Escopo
O sistema permite cadastrar, listar, consultar, editar e excluir livros; registrar empréstimos e devoluções; e consultar a disponibilidade de exemplares. **Não contempla** cadastro de leitores com login, reservas, renovação, cobrança de multas, integração com catálogos externos nem banco de dados em servidor.

**Usuário:** funcionário de uma pequena biblioteca (escolar, comunitária ou de empresa).

### 3. Objetivos de qualidade (mensuráveis)
| Objetivo | Meta |
|---|---|
| Atender aos requisitos funcionais RF01–RF07 | 100% dos requisitos verificados por pelo menos um caso de teste |
| Evitar registros inconsistentes | 0 empréstimos acima dos exemplares; 0 ISBN duplicado |
| Aprovação nos testes antes da entrega | ≥ 90% dos casos de teste aprovados |
| Tratar não conformidades | 100% das NCs de severidade Alta/Média corrigidas antes da entrega |
| Usabilidade | Todos os campos com rótulo; todas as operações com mensagem de sucesso ou erro |
| Persistência | Dados disponíveis após recarregar a página |

### 4. Papéis e responsabilidades
| Integrante | Papel | Responsabilidade |
|---|---|---|
| 1 | Coordenação | Escopo, cronograma e consolidação do plano de qualidade |
| 2 | Requisitos | Requisitos, critérios de aceitação e padrões de qualidade |
| 3 | Desenvolvimento | Implementar e corrigir a aplicação |
| 4 | Garantia e testes | Checklist, execução dos casos de teste e evidências |
| 5 | Métricas e melhoria | Riscos, não conformidades, indicadores e PDCA |

Em grupos menores os papéis podem ser acumulados. A qualidade é responsabilidade de todos.

### 5. Critérios de qualidade e aceitação
| Critério | Condição para considerar atendido |
|---|---|
| Completude funcional | Cadastro, consulta, edição, exclusão, empréstimo e devolução funcionam conforme os requisitos |
| Validação | Campos obrigatórios não aceitam vazio; ISBN com dígito verificador correto; exemplares 1–99; prazo 1–30 dias |
| Integridade | Não há ISBN duplicado (comparação normalizada) e não se empresta mais exemplares do que existem |
| Persistência | Livros e empréstimos permanecem após atualizar a página |
| Usabilidade | Campos com rótulos, botões identificados, mensagens compreensíveis |
| Confiabilidade básica | Ações inválidas não apagam nem corrompem registros (ex.: excluir livro emprestado é bloqueado) |

### 6. Garantia da qualidade (prevenção)
- Revisar requisitos e regras de negócio antes de programar (momento 1).
- Padronizar nomes de campos e mensagens; datas no formato AAAA-MM-DD.
- Revisão do código por outro integrante antes de juntar as alterações (momento 2).
- Aplicar o checklist de interface e validação durante o desenvolvimento.
- Manter cópia do projeto e registrar as mudanças feitas.

**Boas práticas adotadas:** separação HTML/CSS/JS; escape de texto antes de exibir (evita injeção de HTML); validação centralizada em funções (`validateBook`, `validateLoan`); confirmação antes de ações irreversíveis; datas tratadas no fuso local.

### 7. Controle da qualidade (detecção)
- Executar os 13 casos de teste (`casos_teste.md`) antes da entrega (momento 3).
- Registrar evidências (capturas em `evidencias/`).
- Fazer testes exploratórios com entradas inválidas e casos-limite.
- Classificar problemas por severidade, corrigir e repetir os testes afetados (regressão).

| Momento | Atividade | Responsável | Recurso |
|---|---|---|---|
| Antes de programar | Revisão de requisitos e critérios | Integrantes 1 e 2 | Este plano |
| Durante o desenvolvimento | Revisão de código e checklist | Integrantes 3 e 4 | Checklist Q01–Q11 |
| Antes da entrega | Casos de teste, exploratórios e regressão | Integrante 4 | Navegador + script de testes |
| Fechamento | Indicadores, NCs e PDCA | Integrante 5 | Painel da qualidade |

### 8. Gestão de riscos
Ver `matriz_riscos.md` (5 riscos com probabilidade, impacto e resposta).

### 9. Indicadores
- Percentual de casos de teste aprovados.
- Percentual de não conformidades corrigidas.
- Percentual de itens do checklist atendidos.
- Riscos de impacto alto sem resposta definida.

Valores obtidos e interpretação: `indicadores_pdca.md`.

### 10. Gestão de não conformidades
Cada ocorrência registra: ID, data, descrição e passos, evidência, severidade, causa provável, ação corretiva, situação e verificação após correção. Ver `registro_nao_conformidades.md`.

### 11. Melhoria contínua (PDCA)
Ver `indicadores_pdca.md`.

### 12. Critério de conclusão
O trabalho está concluído quando as funcionalidades mínimas estiverem demonstradas, os critérios avaliados, as NCs registradas e tratadas, os indicadores calculados e houver conclusão sobre a qualidade e as limitações do produto.

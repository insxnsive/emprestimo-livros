# Registro de Não Conformidades — SEL

Ocorrências reproduzidas durante os testes de 16/11/2026, com evidência na pasta `evidencias/`.

### NC01 — ISBN com dígito verificador errado era aceito
- **Identificação:** teste exploratório EXP01 e caso CT04 (rodada 1).
- **Passos:** aba Acervo → preencher título e autor → ISBN `978-85-359-0277-1` → Salvar.
- **Resultado obtido:** "Livro cadastrado com sucesso." O correto é `978-85-359-0277-8`.
- **Evidência:** `EXP01_isbn_digito_errado.png`.
- **Severidade:** Média (gera registros com ISBN inexistente e atrapalha a busca e a detecção de duplicidade, mas não perde dados).
- **Causa provável:** a regra validava só a quantidade de dígitos (10 ou 13), sem o cálculo do dígito verificador.
- **Ação corretiva:** implementar o cálculo do dígito verificador (ISBN-10 módulo 11, aceitando X; ISBN-13 pesos 1/3 módulo 10) e mensagem com exemplo válido.
- **Responsável:** desenvolvimento (integrante 3).
- **Verificação:** CT04 e CT13 (regressão) aprovados na rodada 2.
- **Situação:** **Corrigida.**

### NC02 — Status das não conformidades não era salvo no painel
- **Identificação:** teste exploratório EXP02 no código de referência (Veículos), cujo painel foi reaproveitado neste projeto.
- **Passos:** Painel da qualidade → mudar NC01 para "Corrigida" → recarregar a página.
- **Resultado obtido:** o status voltou para "Pendente" e o indicador mostrou 3 NCs abertas de novo.
- **Evidência:** `EXP02_referencia_status_nc_apos_recarregar.png`.
- **Severidade:** Baixa (afeta o acompanhamento da qualidade, não os dados de livros).
- **Causa provável:** o status era guardado só na memória; o checklist era salvo no LocalStorage, mas as NCs não.
- **Ação corretiva:** salvar o status das NCs (e o resultado dos casos de teste) no LocalStorage.
- **Responsável:** desenvolvimento (integrante 3).
- **Verificação:** no SEL, alterar o status e recarregar mantém o valor.
- **Situação:** **Corrigida.**

## Campos de cada registro
ID e data · descrição e passos · evidência · severidade · causa provável · responsável · ação corretiva · situação · verificação após correção.

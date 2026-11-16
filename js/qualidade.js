/* =============================================================
   qualidade.js — painel de gestão da qualidade
   ============================================================= */

(() => {
  "use strict";

  const CHECK_KEY = "sel_quality_check_v1";
  const TEST_KEY = "sel_quality_tests_v1";
  const NC_KEY = "sel_quality_nc_v1";

  const $ = Util.byId;


  /* ============================ Dados ============================ */

  const CHECKLIST = [
    ["Q01", "Campos obrigatórios identificados e validados", "Salvar livro sem título/autor/ISBN e empréstimo sem livro/leitor/datas."],
    ["Q02", "ISBN validado (formato e dígito verificador)", "Testar ISBN válido, com letras, com tamanho errado e com dígito errado."],
    ["Q03", "ISBN duplicado bloqueado", "Cadastrar duas vezes o mesmo ISBN, com e sem hífens."],
    ["Q04", "Exemplares e datas validados", "Testar exemplares inválidos, devolução antes do empréstimo e prazo acima de 30 dias."],
    ["Q05", "Cadastro, listagem, edição e exclusão de livros funcionam", "Executar o fluxo completo pela interface."],
    ["Q06", "Empréstimo só ocorre com exemplar disponível", "Emprestar todos os exemplares e verificar que o livro fica Indisponível."],
    ["Q07", "Devolução libera o exemplar", "Registrar devolução e conferir a disponibilidade."],
    ["Q08", "Exclusão exige confirmação e protege empréstimos em aberto", "Cancelar e confirmar exclusão; tentar excluir livro emprestado."],
    ["Q09", "Dados permanecem após recarregar", "Cadastrar livro e empréstimo e atualizar o navegador."],
    ["Q10", "Mensagens de sucesso e erro compreensíveis", "Executar operações válidas e inválidas."],
    ["Q11", "Interface com rótulos e navegação consistentes", "Revisar formulários, botões, abas e tabelas."]
  ];

  const TEST_CASES = [
    ["CT01", "Cadastrar livro com todos os campos válidos.", "Livro salvo e exibido como Disponível."],
    ["CT02", "Salvar livro sem título ou sem autor.", "Cadastro bloqueado com mensagem."],
    ["CT03", "Cadastrar ISBN já existente (com ou sem hífens).", "Cadastro bloqueado por duplicidade."],
    ["CT04", "ISBN com letras, tamanho errado ou dígito verificador errado.", "Sistema rejeita e informa o formato."],
    ["CT05", "Editar a editora de um livro.", "Alteração salva sem mudar os demais campos."],
    ["CT06", "Registrar empréstimo válido.", "Empréstimo Ativo; disponibilidade diminui em 1."],
    ["CT07", "Emprestar todos os exemplares de um livro.", "Livro Indisponível e fora da lista de empréstimo."],
    ["CT08", "Devolução prevista antes do empréstimo ou acima de 30 dias.", "Empréstimo bloqueado com mensagem."],
    ["CT09", "Registrar devolução de um empréstimo ativo.", "Situação Devolvido; exemplar volta a ficar disponível."],
    ["CT10", "Excluir livro com empréstimo em aberto.", "Exclusão bloqueada com mensagem."],
    ["CT11", "Excluir livro sem empréstimo: cancelar e confirmar.", "Cancelar mantém; confirmar remove."],
    ["CT12", "Recarregar a página após cadastrar livro e empréstimo.", "Dados continuam disponíveis."],
    ["CT13", "Regressão: repetir CT03 e CT04 após a correção do ISBN.", "Validações continuam funcionando."]
  ];

  const RISKS = [
    ["R01", "Escopo crescer além do tempo (reservas, multas, login).", "Média", "Alta", "Manter só as funcionalidades mínimas."],
    ["R02", "Perda de dados no LocalStorage.", "Média", "Média", "Testar persistência e manter cópia dos dados de demonstração."],
    ["R03", "Emprestar mais exemplares do que existem.", "Média", "Alta", "Calcular disponibilidade pelos empréstimos em aberto e validar antes de salvar."],
    ["R04", "Datas erradas por fuso horário.", "Baixa", "Média", "Usar datas locais AAAA-MM-DD e testar no fuso do Brasil."],
    ["R05", "Conflito de código entre integrantes.", "Média", "Média", "Revisar alterações e manter uma versão funcional."]
  ];

  const NONCONFORMITIES = [
    ["NC01", "ISBN com dígito verificador errado (ex.: 978-85-359-0277-1) era aceito.", "Média",
     "Implementar o cálculo do dígito verificador e repetir CT03/CT04.", "Corrigida"],
    ["NC02", "Status das não conformidades voltava a 'Pendente' ao recarregar (código de referência).", "Baixa",
     "Salvar o status no LocalStorage.", "Corrigida"]
  ];

  const TEST_OPTIONS = ["Não executado", "Aprovado", "Reprovado"];
  const NC_OPTIONS = ["Pendente", "Em tratamento", "Corrigida"];

  let checked = Util.load(CHECK_KEY, {});
  let testResults = Util.load(TEST_KEY, {});
  let ncStatus = Util.load(NC_KEY, {});


  /* ======================== Renderização ======================== */

  function selectHTML(options, selected, attributes) {
    const items = options.map(o => `<option ${o === selected ? "selected" : ""}>${o}</option>`).join("");
    return `<select ${attributes}>${items}</select>`;
  }

  function renderChecklist() {
    $("quality-checklist").innerHTML = CHECKLIST.map(([id, title, evidence]) => `
      <label class="check-item">
        <input type="checkbox" data-check="${id}" ${checked[id] ? "checked" : ""}>
        <span><b>${id} – ${title}</b><small>Evidência: ${evidence}</small></span>
      </label>`).join("");
  }

  function renderTests() {
    $("test-list").innerHTML = TEST_CASES.map(([id, scenario, expected]) => `
      <tr>
        <td><b>${id}</b></td>
        <td>${scenario}</td>
        <td>${expected}</td>
        <td>${selectHTML(TEST_OPTIONS, testResults[id] || "Não executado", `data-test="${id}" aria-label="Resultado ${id}"`)}</td>
      </tr>`).join("");
  }

  function renderRisks() {
    $("risk-list").innerHTML = RISKS.map(risk =>
      `<tr>${risk.map((cell, i) => (i === 0 ? `<td><b>${cell}</b></td>` : `<td>${cell}</td>`)).join("")}</tr>`
    ).join("");
  }

  function renderNonconformities() {
    $("nc-list").innerHTML = NONCONFORMITIES.map(([id, description, severity, action, initial]) => `
      <tr>
        <td><b>${id}</b></td>
        <td>${description}</td>
        <td>${severity}</td>
        <td>${action}</td>
        <td>${selectHTML(NC_OPTIONS, ncStatus[id] || initial, `data-nc="${id}" aria-label="Status ${id}"`)}</td>
      </tr>`).join("");
  }


  /* ========================= Indicadores ========================= */

  function percent(part, total) {
    const value = total ? Math.round((part / total) * 1000) / 10 : 0;
    return `${String(value).replace(".", ",")}%`;
  }

  function renderMetrics() {
    const books = Util.load("sel_books_v1", []);
    const loans = Util.load("sel_loans_v1", []);

    const checkedCount = CHECKLIST.filter(([id]) => checked[id]).length;

    const executed = TEST_CASES.filter(([id]) => testResults[id] && testResults[id] !== "Não executado");
    const passed = executed.filter(([id]) => testResults[id] === "Aprovado").length;

    const fixed = NONCONFORMITIES.filter(([id, , , , initial]) => (ncStatus[id] || initial) === "Corrigida").length;
    const highRisksWithoutAnswer = RISKS.filter(([, , , impact, answer]) => impact === "Alta" && !answer).length;

    $("m-books").textContent = books.length;
    $("m-loans").textContent = loans.filter(loan => !loan.returnDate).length;
    $("m-check").textContent = percent(checkedCount, CHECKLIST.length);
    $("m-tests").textContent = percent(passed, executed.length);
    $("m-tests-detail").textContent = `${passed} de ${executed.length} executados`;
    $("m-nc-open").textContent = NONCONFORMITIES.length - fixed;
    $("m-nc-fixed").textContent = percent(fixed, NONCONFORMITIES.length);
    $("m-risks").textContent = RISKS.length;
    $("m-risks-open").textContent = highRisksWithoutAnswer;
  }


  /* =========================== Eventos =========================== */

  $("quality-checklist").addEventListener("change", event => {
    const id = event.target.dataset.check;
    if (!id) return;
    checked[id] = event.target.checked;
    Util.save(CHECK_KEY, checked);
    renderMetrics();
  });

  $("test-list").addEventListener("change", event => {
    const id = event.target.dataset.test;
    if (!id) return;
    testResults[id] = event.target.value;
    Util.save(TEST_KEY, testResults);
    renderMetrics();
  });

  $("nc-list").addEventListener("change", event => {
    const id = event.target.dataset.nc;
    if (!id) return;
    ncStatus[id] = event.target.value;
    Util.save(NC_KEY, ncStatus);
    renderMetrics();
  });

  document.addEventListener("library:changed", renderMetrics);


  /* ======================= Inicialização ======================= */

  renderChecklist();
  renderTests();
  renderRisks();
  renderNonconformities();
  renderMetrics();
})();

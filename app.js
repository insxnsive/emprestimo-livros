(() => {
  "use strict";
  const BOOK_KEY = "sel_books_v1";
  const LOAN_KEY = "sel_loans_v1";
  const CHECK_KEY = "sel_quality_check_v1";
  const TEST_KEY = "sel_quality_tests_v1";
  const NC_KEY = "sel_quality_nc_v1";
  const MAX_LOAN_DAYS = 30;

  const $ = id => document.getElementById(id);

  /* ---------- Dados de gestão da qualidade ---------- */
  const qualityItems = [
    {id:"Q01",title:"Campos obrigatórios identificados e validados",evidence:"Tentar salvar livro sem título/autor/ISBN e empréstimo sem livro/leitor/datas."},
    {id:"Q02",title:"ISBN validado (formato e dígito verificador)",evidence:"Testar ISBN-10 e ISBN-13 válidos, com letras, com tamanho errado e com dígito verificador errado."},
    {id:"Q03",title:"ISBN duplicado bloqueado",evidence:"Cadastrar duas vezes o mesmo ISBN, com e sem hífens."},
    {id:"Q04",title:"Exemplares e datas validados",evidence:"Testar exemplares 0/negativo/decimal, devolução antes do empréstimo e prazo acima de 30 dias."},
    {id:"Q05",title:"Cadastro, listagem, edição e exclusão de livros funcionam",evidence:"Executar o fluxo completo pela interface."},
    {id:"Q06",title:"Empréstimo só ocorre com exemplar disponível",evidence:"Emprestar todos os exemplares e verificar que o livro sai da lista e aparece como Indisponível."},
    {id:"Q07",title:"Devolução libera o exemplar",evidence:"Registrar devolução e conferir a disponibilidade do livro."},
    {id:"Q08",title:"Exclusão exige confirmação e protege empréstimos em aberto",evidence:"Cancelar e confirmar exclusão; tentar excluir livro emprestado."},
    {id:"Q09",title:"Dados permanecem após recarregar",evidence:"Cadastrar livro e empréstimo e atualizar o navegador."},
    {id:"Q10",title:"Mensagens de sucesso e erro compreensíveis",evidence:"Executar operações válidas e inválidas e ler as mensagens."},
    {id:"Q11",title:"Interface com rótulos e navegação consistentes",evidence:"Revisar formulários, botões, abas e tabelas."}
  ];
  const testCases = [
    ["CT01","Cadastrar livro com todos os campos válidos.","Livro salvo e exibido na consulta como Disponível."],
    ["CT02","Salvar livro sem título ou sem autor.","Cadastro bloqueado; mensagem indica o campo obrigatório."],
    ["CT03","Cadastrar ISBN já existente (com ou sem hífens).","Cadastro bloqueado por duplicidade."],
    ["CT04","Informar ISBN com letras, tamanho errado ou dígito verificador errado.","Sistema rejeita e informa o formato esperado."],
    ["CT05","Editar a editora de um livro cadastrado.","Alteração salva sem modificar os demais campos."],
    ["CT06","Registrar empréstimo válido.","Empréstimo listado como Ativo; disponibilidade do livro diminui em 1."],
    ["CT07","Emprestar todos os exemplares de um livro.","Livro fica Indisponível e sai da lista de seleção de empréstimo."],
    ["CT08","Devolução prevista anterior ao empréstimo ou acima de 30 dias.","Empréstimo bloqueado com mensagem sobre o prazo."],
    ["CT09","Registrar devolução de um empréstimo ativo.","Situação muda para Devolvido; exemplar volta a ficar disponível."],
    ["CT10","Excluir livro com empréstimo em aberto.","Exclusão bloqueada com mensagem explicativa."],
    ["CT11","Excluir livro sem empréstimo e cancelar / confirmar.","Cancelar mantém o livro; confirmar remove o livro."],
    ["CT12","Recarregar a página após cadastrar livro e empréstimo.","Livro e empréstimo continuam disponíveis."],
    ["CT13","Regressão: repetir CT03 e CT04 após correção da validação de ISBN.","Validações continuam funcionando; sem regressão."]
  ];
  const risks = [
    ["R01","Escopo crescer além do tempo disponível (reservas, multas, login).","Média","Alta","Manter apenas as funcionalidades mínimas; extras ficam como melhoria futura."],
    ["R02","Perda de dados no LocalStorage (limpeza do navegador).","Média","Média","Testar persistência e manter cópia dos dados de demonstração."],
    ["R03","Disponibilidade inconsistente (emprestar mais exemplares do que existem).","Média","Alta","Calcular disponibilidade a partir dos empréstimos em aberto e validar antes de salvar."],
    ["R04","Datas registradas com erro por fuso horário.","Baixa","Média","Trabalhar com datas locais no formato AAAA-MM-DD e testar no fuso do Brasil."],
    ["R05","Conflito de código entre integrantes.","Média","Média","Combinar interfaces, revisar alterações e manter versão funcional."]
  ];
  const nonconformitiesBase = [
    {id:"NC01",description:"ISBN com dígito verificador errado (ex.: 978-85-359-0277-1) era aceito; só o tamanho era conferido.",severity:"Média",action:"Implementar cálculo do dígito verificador de ISBN-10 e ISBN-13 e repetir CT03/CT04.",status:"Corrigida"},
    {id:"NC02",description:"Status das não conformidades no painel não era salvo e voltava a 'Pendente' ao recarregar (falha observada no código de referência).",severity:"Baixa",action:"Persistir o status no LocalStorage, como já é feito com o checklist.",status:"Corrigida"}
  ];

  /* ---------- Estado ---------- */
  let books = loadJSON(BOOK_KEY, []);
  let loans = loadJSON(LOAN_KEY, []);
  let checklistState = loadJSON(CHECK_KEY, {});
  let testState = loadJSON(TEST_KEY, {});
  let ncState = loadJSON(NC_KEY, {});

  /* ---------- Utilitários ---------- */
  function loadJSON(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value ?? fallback; }
    catch { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  function val(id) { return $(id).value.trim(); }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }
  function newId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function showMessage(el, message, type = "success") { el.textContent = message; el.className = `feedback ${type}`; }
  function clearMessage(el) { el.textContent = ""; el.className = "feedback"; }

  // Datas locais no formato AAAA-MM-DD (evita deslocamento de fuso do new Date("AAAA-MM-DD"))
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function validISODate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y,m,d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m-1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m-1 && dt.getUTCDate() === d;
  }
  function daysBetween(a, b) {
    const [y1,m1,d1] = a.split("-").map(Number), [y2,m2,d2] = b.split("-").map(Number);
    return Math.round((Date.UTC(y2,m2-1,d2) - Date.UTC(y1,m1-1,d1)) / 86400000);
  }
  function addDays(iso, n) {
    const [y,m,d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m-1, d + n));
    return dt.toISOString().slice(0,10);
  }
  function formatDate(iso) { if (!iso) return "—"; const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; }

  // ISBN: remove hífens/espaços, aceita ISBN-10 (último pode ser X) e ISBN-13, conferindo o dígito verificador
  function normalizeISBN(isbn) { return String(isbn || "").toUpperCase().replace(/[\s-]/g, ""); }
  function validISBN(isbn) {
    const s = normalizeISBN(isbn);
    if (/^\d{9}[\dX]$/.test(s)) {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += (s[i] === "X" ? 10 : Number(s[i])) * (10 - i);
      return sum % 11 === 0;
    }
    if (/^\d{13}$/.test(s)) {
      let sum = 0;
      for (let i = 0; i < 13; i++) sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3);
      return sum % 10 === 0;
    }
    return false;
  }
  function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email); }

  /* ---------- Regras de negócio ---------- */
  function loanStatus(loan) {
    if (loan.returnDate) return "Devolvido";
    return todayISO() > loan.dueDate ? "Atrasado" : "Ativo";
  }
  function openLoansOf(bookId) { return loans.filter(l => l.bookId === bookId && !l.returnDate).length; }
  function availableOf(book) { return Math.max(0, Number(book.copies) - openLoansOf(book.id)); }

  /* ======================= LIVROS ======================= */
  const bookForm = $("book-form"), bookList = $("book-list"), bookFeedback = $("book-feedback");
  const bookIdField = $("book-id"), bookSearch = $("book-search"), onlyAvailable = $("only-available");

  function getBook() {
    return {title:val("title"), author:val("author"), isbn:val("isbn"), publisher:val("publisher"),
            year:val("year"), genre:val("genre"), copies:val("copies")};
  }
  function validateBook(b, editingId = null) {
    const errors = [];
    if (!b.title) errors.push("Informe o título.");
    if (!b.author) errors.push("Informe o autor.");
    if (!b.isbn) errors.push("Informe o ISBN.");
    else if (!validISBN(b.isbn)) errors.push("ISBN inválido. Use 10 ou 13 dígitos com dígito verificador correto (ex.: 978-85-359-0277-8).");
    else if (books.some(x => normalizeISBN(x.isbn) === normalizeISBN(b.isbn) && x.id !== editingId))
      errors.push("Já existe livro cadastrado com este ISBN.");
    const maxYear = new Date().getFullYear();
    if (b.year !== "" && (!Number.isInteger(Number(b.year)) || Number(b.year) < 1450 || Number(b.year) > maxYear))
      errors.push(`Ano de publicação deve ser um número inteiro entre 1450 e ${maxYear}.`);
    const copies = Number(b.copies);
    if (b.copies === "" || !Number.isInteger(copies) || copies < 1 || copies > 99)
      errors.push("Exemplares deve ser um número inteiro entre 1 e 99.");
    else if (editingId) {
      const open = openLoansOf(editingId);
      if (copies < open) errors.push(`Este livro tem ${open} exemplar(es) emprestado(s); a quantidade não pode ser menor que isso.`);
    }
    return errors;
  }
  function resetBookForm() {
    bookForm.reset(); bookIdField.value = ""; $("copies").value = "1";
    $("book-form-title").textContent = "Cadastrar livro"; $("book-save").textContent = "Salvar livro"; $("book-cancel").hidden = true;
  }
  function renderBooks() {
    const q = bookSearch.value.trim().toLowerCase();
    const qIsbn = normalizeISBN(q);
    const filtered = books.filter(b => {
      const matches = !q || [b.title, b.author].some(x => String(x || "").toLowerCase().includes(q)) || (qIsbn && normalizeISBN(b.isbn).includes(qIsbn));
      return matches && (!onlyAvailable.checked || availableOf(b) > 0);
    });
    $("book-count").textContent = String(books.length);
    if (!filtered.length) {
      bookList.innerHTML = `<tr><td colspan="6" class="empty">${books.length ? "Nenhum livro encontrado para os filtros informados." : "Nenhum livro cadastrado."}</td></tr>`;
    } else {
      bookList.innerHTML = filtered.map(b => {
        const av = availableOf(b);
        const badge = av > 0 ? `<span class="badge ok">Disponível (${av})</span>` : `<span class="badge no">Indisponível</span>`;
        return `<tr>
          <td><strong>${escapeHTML(b.title)}</strong>${b.publisher ? `<br><small class="muted">${escapeHTML(b.publisher)}${b.year ? " · " + escapeHTML(b.year) : ""}</small>` : ""}</td>
          <td>${escapeHTML(b.author)}</td><td>${escapeHTML(b.isbn)}</td><td>${escapeHTML(b.copies)}</td><td>${badge}</td>
          <td><div class="row-actions"><button class="action-btn" data-action="edit" data-id="${escapeHTML(b.id)}">Editar</button>
          <button class="action-btn delete" data-action="delete" data-id="${escapeHTML(b.id)}">Excluir</button></div></td></tr>`;
      }).join("");
    }
    renderLoanBookOptions(); renderMetrics();
  }

  bookForm.addEventListener("submit", event => {
    event.preventDefault(); clearMessage(bookFeedback);
    const b = getBook(), editingId = bookIdField.value || null;
    const errors = validateBook(b, editingId);
    if (errors.length) { showMessage(bookFeedback, errors.join(" "), "error"); return; }
    b.copies = Number(b.copies);
    if (editingId) {
      books = books.map(x => x.id === editingId ? {...x, ...b} : x);
      loans = loans.map(l => l.bookId === editingId ? {...l, bookTitle: b.title} : l);
      saveJSON(LOAN_KEY, loans);
      showMessage(bookFeedback, "Livro atualizado com sucesso.");
    } else {
      books.push({id:newId(), ...b});
      showMessage(bookFeedback, "Livro cadastrado com sucesso.");
    }
    saveJSON(BOOK_KEY, books); resetBookForm(); renderBooks(); renderLoans();
  });

  bookList.addEventListener("click", event => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const b = books.find(x => x.id === btn.dataset.id);
    if (!b) return;
    if (btn.dataset.action === "edit") {
      bookIdField.value = b.id;
      ["title","author","isbn","publisher","year","genre","copies"].forEach(k => $(k).value = b[k] ?? "");
      $("book-form-title").textContent = "Editar livro"; $("book-save").textContent = "Salvar alterações"; $("book-cancel").hidden = false;
      clearMessage(bookFeedback); window.scrollTo({top:0, behavior:"smooth"});
    } else if (btn.dataset.action === "delete") {
      const open = openLoansOf(b.id);
      if (open > 0) { showMessage(bookFeedback, `Não é possível excluir "${b.title}": há ${open} empréstimo(s) em aberto. Registre a devolução primeiro.`, "error"); return; }
      if (!confirm(`Deseja realmente excluir o livro "${b.title}"?`)) return;
      books = books.filter(x => x.id !== b.id); saveJSON(BOOK_KEY, books);
      if (bookIdField.value === b.id) resetBookForm();
      renderBooks(); renderLoans();
      showMessage(bookFeedback, "Livro excluído com sucesso.");
    }
  });
  $("book-cancel").addEventListener("click", () => { resetBookForm(); clearMessage(bookFeedback); });
  $("book-clear").addEventListener("click", () => setTimeout(() => { resetBookForm(); clearMessage(bookFeedback); }, 0));
  bookSearch.addEventListener("input", renderBooks);
  onlyAvailable.addEventListener("change", renderBooks);

  /* ======================= EMPRÉSTIMOS ======================= */
  const loanForm = $("loan-form"), loanList = $("loan-list"), loanFeedback = $("loan-feedback");
  const loanBook = $("loan-book"), loanSearch = $("loan-search"), loanFilter = $("loan-filter");

  function renderLoanBookOptions() {
    const current = loanBook.value;
    const options = books.filter(b => availableOf(b) > 0)
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
      .map(b => `<option value="${escapeHTML(b.id)}">${escapeHTML(b.title)} — ${escapeHTML(b.author)} (${availableOf(b)} disp.)</option>`);
    loanBook.innerHTML = `<option value="">${options.length ? "Selecione um livro disponível" : "Nenhum livro disponível"}</option>` + options.join("");
    if ([...loanBook.options].some(o => o.value === current)) loanBook.value = current;
  }
  function setDefaultDates() {
    const t = todayISO();
    $("loan-date").value = t; $("due-date").value = addDays(t, 14);
  }
  function validateLoan(l) {
    const errors = [];
    const book = books.find(b => b.id === l.bookId);
    if (!l.bookId) errors.push("Selecione o livro.");
    else if (!book) errors.push("Livro não encontrado.");
    else if (availableOf(book) < 1) errors.push("Não há exemplar disponível deste livro.");
    if (!l.reader) errors.push("Informe o nome do leitor.");
    else if (l.reader.length < 3) errors.push("O nome do leitor deve ter pelo menos 3 caracteres.");
    if (l.email && !validEmail(l.email)) errors.push("E-mail inválido. Use o formato nome@dominio.com.");
    const t = todayISO();
    if (!validISODate(l.loanDate)) errors.push("Informe a data do empréstimo.");
    else if (l.loanDate > t) errors.push("A data do empréstimo não pode estar no futuro.");
    if (!validISODate(l.dueDate)) errors.push("Informe a data prevista de devolução.");
    else if (validISODate(l.loanDate)) {
      const days = daysBetween(l.loanDate, l.dueDate);
      if (days < 1) errors.push("A devolução prevista deve ser posterior à data do empréstimo.");
      else if (days > MAX_LOAN_DAYS) errors.push(`O prazo máximo de empréstimo é de ${MAX_LOAN_DAYS} dias.`);
    }
    return errors;
  }
  function renderLoans() {
    const q = loanSearch.value.trim().toLowerCase(), f = loanFilter.value;
    const open = loans.filter(l => !l.returnDate);
    $("loan-active-count").textContent = String(open.length);
    $("loan-late-count").textContent = String(open.filter(l => loanStatus(l) === "Atrasado").length);
    const order = {Atrasado:0, Ativo:1, Devolvido:2};
    const filtered = loans
      .filter(l => (f === "all" || loanStatus(l) === f) && (!q || [l.reader, l.bookTitle].some(x => String(x || "").toLowerCase().includes(q))))
      .sort((a, b) => order[loanStatus(a)] - order[loanStatus(b)] || a.dueDate.localeCompare(b.dueDate));
    if (!filtered.length) {
      loanList.innerHTML = `<tr><td colspan="7" class="empty">${loans.length ? "Nenhum empréstimo encontrado para os filtros informados." : "Nenhum empréstimo registrado."}</td></tr>`;
    } else {
      loanList.innerHTML = filtered.map(l => {
        const s = loanStatus(l);
        const cls = s === "Devolvido" ? "done" : s === "Atrasado" ? "late" : "ok";
        return `<tr>
          <td><strong>${escapeHTML(l.bookTitle)}</strong></td>
          <td>${escapeHTML(l.reader)}${l.email ? `<br><small class="muted">${escapeHTML(l.email)}</small>` : ""}</td>
          <td>${formatDate(l.loanDate)}</td><td>${formatDate(l.dueDate)}</td><td>${formatDate(l.returnDate)}</td>
          <td><span class="badge ${cls}">${s}</span></td>
          <td>${l.returnDate ? "—" : `<button class="action-btn return" data-action="return" data-id="${escapeHTML(l.id)}">Registrar devolução</button>`}</td></tr>`;
      }).join("");
    }
    renderMetrics();
  }

  loanForm.addEventListener("submit", event => {
    event.preventDefault(); clearMessage(loanFeedback);
    const l = {bookId:loanBook.value, reader:val("reader"), email:val("reader-email"), loanDate:val("loan-date"), dueDate:val("due-date")};
    const errors = validateLoan(l);
    if (errors.length) { showMessage(loanFeedback, errors.join(" "), "error"); return; }
    const book = books.find(b => b.id === l.bookId);
    loans.push({id:newId(), ...l, bookTitle:book.title, returnDate:null});
    saveJSON(LOAN_KEY, loans);
    loanForm.reset(); setDefaultDates();
    renderBooks(); renderLoans();
    showMessage(loanFeedback, `Empréstimo de "${book.title}" para ${l.reader} registrado. Devolução prevista: ${formatDate(l.dueDate)}.`);
  });

  loanList.addEventListener("click", event => {
    const btn = event.target.closest("button[data-action='return']");
    if (!btn) return;
    const l = loans.find(x => x.id === btn.dataset.id);
    if (!l || l.returnDate) return;
    if (!confirm(`Confirmar a devolução de "${l.bookTitle}" por ${l.reader}?`)) return;
    const t = todayISO();
    l.returnDate = t < l.loanDate ? l.loanDate : t;
    saveJSON(LOAN_KEY, loans);
    renderBooks(); renderLoans();
    showMessage(loanFeedback, `Devolução de "${l.bookTitle}" registrada. O exemplar voltou a ficar disponível.`);
  });
  $("loan-clear").addEventListener("click", () => setTimeout(() => { setDefaultDates(); clearMessage(loanFeedback); }, 0));
  loanSearch.addEventListener("input", renderLoans);
  loanFilter.addEventListener("change", renderLoans);

  /* ======================= QUALIDADE ======================= */
  function nonconformities() { return nonconformitiesBase.map(n => ({...n, status: ncState[n.id] || n.status})); }

  function renderQuality() {
    const checklist = $("quality-checklist");
    checklist.innerHTML = qualityItems.map(item => `<label class="check-item">
      <input type="checkbox" data-check="${item.id}" ${checklistState[item.id] ? "checked" : ""}>
      <span><b>${item.id} – ${item.title}</b><small>Evidência: ${item.evidence}</small></span></label>`).join("");
    checklist.addEventListener("change", event => {
      const input = event.target.closest("input[data-check]");
      if (!input) return;
      checklistState[input.dataset.check] = input.checked; saveJSON(CHECK_KEY, checklistState); renderMetrics();
    });

    const opts = ["Não executado", "Aprovado", "Reprovado"];
    $("test-list").innerHTML = testCases.map(([id, scenario, expected]) => `<tr><td><b>${id}</b></td><td>${scenario}</td><td>${expected}</td>
      <td><select data-test="${id}" aria-label="Resultado ${id}">${opts.map(o => `<option ${ (testState[id] || "Não executado") === o ? "selected" : ""}>${o}</option>`).join("")}</select></td></tr>`).join("");
    $("test-list").addEventListener("change", event => {
      const sel = event.target.closest("select[data-test]");
      if (sel) { testState[sel.dataset.test] = sel.value; saveJSON(TEST_KEY, testState); renderMetrics(); }
    });

    $("risk-list").innerHTML = risks.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join("");

    const ncOpts = ["Pendente", "Em tratamento", "Corrigida"];
    $("nc-list").innerHTML = nonconformities().map(n => `<tr><td><b>${n.id}</b></td><td>${n.description}</td><td>${n.severity}</td><td>${n.action}</td>
      <td><select data-nc="${n.id}" aria-label="Status ${n.id}">${ncOpts.map(o => `<option ${n.status === o ? "selected" : ""}>${o}</option>`).join("")}</select></td></tr>`).join("");
    $("nc-list").addEventListener("change", event => {
      const sel = event.target.closest("select[data-nc]");
      if (sel) { ncState[sel.dataset.nc] = sel.value; saveJSON(NC_KEY, ncState); renderMetrics(); }
    });
    renderMetrics();
  }

  function pct(a, b) { return b ? Math.round(a / b * 1000) / 10 : 0; }
  function fmtPct(n) { return `${String(n).replace(".", ",")}%`; }
  function renderMetrics() {
    const done = qualityItems.filter(i => checklistState[i.id]).length;
    const executed = testCases.filter(([id]) => (testState[id] || "Não executado") !== "Não executado");
    const passed = executed.filter(([id]) => testState[id] === "Aprovado").length;
    const ncs = nonconformities();
    const fixed = ncs.filter(n => n.status === "Corrigida").length;
    $("m-books").textContent = String(books.length);
    $("m-loans").textContent = String(loans.filter(l => !l.returnDate).length);
    $("m-check").textContent = fmtPct(pct(done, qualityItems.length));
    $("m-tests").textContent = fmtPct(pct(passed, executed.length));
    $("m-tests-detail").textContent = `${passed} de ${executed.length} executados`;
    $("m-nc-open").textContent = String(ncs.length - fixed);
    $("m-nc-fixed").textContent = fmtPct(pct(fixed, ncs.length));
    $("m-risks").textContent = String(risks.length);
    $("m-risks-open").textContent = String(risks.filter(r => r[3] === "Alta" && !r[4]).length);
  }

  /* ---------- Abas ---------- */
  document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === button));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === button.dataset.tab));
  }));

  setDefaultDates(); renderBooks(); renderLoans(); renderQuality();
})();

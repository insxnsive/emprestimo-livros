/* =============================================================
   app.js — acervo de livros, empréstimos e devoluções
   ============================================================= */

(() => {
  "use strict";

  const BOOKS_KEY = "sel_books_v1";
  const LOANS_KEY = "sel_loans_v1";
  const MAX_LOAN_DAYS = 30;
  const DEFAULT_LOAN_DAYS = 14;

  let books = Util.load(BOOKS_KEY, []);
  let loans = Util.load(LOANS_KEY, []);

  const $ = Util.byId;


  /* ===================== Regras de negócio ===================== */

  function openLoansOf(bookId) {
    return loans.filter(loan => loan.bookId === bookId && !loan.returnDate).length;
  }

  function availableCopies(book) {
    return Math.max(0, book.copies - openLoansOf(book.id));
  }

  function loanStatus(loan) {
    if (loan.returnDate) return "Devolvido";
    return Util.today() > loan.dueDate ? "Atrasado" : "Ativo";
  }

  function saveAll() {
    Util.save(BOOKS_KEY, books);
    Util.save(LOANS_KEY, loans);
    document.dispatchEvent(new CustomEvent("library:changed", {
      detail: { books: books.length, openLoans: loans.filter(l => !l.returnDate).length }
    }));
  }

  function refresh() {
    renderBooks();
    renderLoanBookOptions();
    renderLoans();
  }


  /* ========================== Livros ========================== */

  const bookForm = $("book-form");
  const bookFeedback = $("book-feedback");
  const bookIdField = $("book-id");

  function readBookForm() {
    return {
      title: Util.value("title"),
      author: Util.value("author"),
      isbn: Util.value("isbn"),
      publisher: Util.value("publisher"),
      year: Util.value("year"),
      genre: Util.value("genre"),
      copies: Util.value("copies")
    };
  }

  function validateBook(book, editingId) {
    const errors = [];
    const currentYear = new Date().getFullYear();

    if (!book.title) errors.push("Informe o título.");
    if (!book.author) errors.push("Informe o autor.");

    if (!book.isbn) {
      errors.push("Informe o ISBN.");
    } else if (!Util.isValidISBN(book.isbn)) {
      errors.push("ISBN inválido. Use 10 ou 13 dígitos com dígito verificador correto (ex.: 978-85-359-0277-8).");
    } else if (books.some(b => b.id !== editingId && Util.normalizeISBN(b.isbn) === Util.normalizeISBN(book.isbn))) {
      errors.push("Já existe livro cadastrado com este ISBN.");
    }

    if (book.year && !Util.isIntegerBetween(book.year, 1450, currentYear)) {
      errors.push(`Ano de publicação deve ser um número inteiro entre 1450 e ${currentYear}.`);
    }

    if (!Util.isIntegerBetween(book.copies, 1, 99)) {
      errors.push("Exemplares deve ser um número inteiro entre 1 e 99.");
    } else if (editingId && Number(book.copies) < openLoansOf(editingId)) {
      errors.push(`Este livro tem ${openLoansOf(editingId)} exemplar(es) emprestado(s); a quantidade não pode ser menor.`);
    }

    return errors;
  }

  function resetBookForm() {
    bookForm.reset();
    bookIdField.value = "";
    $("copies").value = "1";
    $("book-form-title").textContent = "Cadastrar livro";
    $("book-save").textContent = "Salvar livro";
    $("book-cancel").hidden = true;
  }

  function fillBookForm(book) {
    bookIdField.value = book.id;
    ["title", "author", "isbn", "publisher", "year", "genre", "copies"]
      .forEach(field => { $(field).value = book[field] ?? ""; });
    $("book-form-title").textContent = "Editar livro";
    $("book-save").textContent = "Salvar alterações";
    $("book-cancel").hidden = false;
    Util.clearMessage(bookFeedback);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveBook(event) {
    event.preventDefault();
    Util.clearMessage(bookFeedback);

    const book = readBookForm();
    const editingId = bookIdField.value || null;
    const errors = validateBook(book, editingId);

    if (errors.length) {
      Util.showMessage(bookFeedback, errors.join(" "), "error");
      return;
    }

    book.copies = Number(book.copies);

    if (editingId) {
      books = books.map(b => (b.id === editingId ? { ...b, ...book } : b));
      loans = loans.map(l => (l.bookId === editingId ? { ...l, bookTitle: book.title } : l));
      Util.showMessage(bookFeedback, "Livro atualizado com sucesso.");
    } else {
      books.push({ id: Util.newId(), ...book });
      Util.showMessage(bookFeedback, "Livro cadastrado com sucesso.");
    }

    saveAll();
    resetBookForm();
    refresh();
  }

  function deleteBook(book) {
    const open = openLoansOf(book.id);

    if (open > 0) {
      Util.showMessage(bookFeedback,
        `Não é possível excluir "${book.title}": há ${open} empréstimo(s) em aberto. Registre a devolução primeiro.`, "error");
      return;
    }
    if (!confirm(`Deseja realmente excluir o livro "${book.title}"?`)) return;

    books = books.filter(b => b.id !== book.id);
    if (bookIdField.value === book.id) resetBookForm();

    saveAll();
    refresh();
    Util.showMessage(bookFeedback, "Livro excluído com sucesso.");
  }

  function renderBooks() {
    const query = Util.value("book-search").toLowerCase();
    const queryISBN = Util.normalizeISBN(query);
    const onlyAvailable = $("only-available").checked;

    const filtered = books.filter(book => {
      const matchesText = [book.title, book.author].some(text => text.toLowerCase().includes(query));
      const matchesISBN = queryISBN && Util.normalizeISBN(book.isbn).includes(queryISBN);
      const matches = !query || matchesText || matchesISBN;
      return matches && (!onlyAvailable || availableCopies(book) > 0);
    });

    $("book-count").textContent = books.length;

    if (!filtered.length) {
      const message = books.length ? "Nenhum livro encontrado para os filtros informados." : "Nenhum livro cadastrado.";
      $("book-list").innerHTML = `<tr><td colspan="6" class="empty">${message}</td></tr>`;
      return;
    }

    $("book-list").innerHTML = filtered.map(bookRow).join("");
  }

  function bookRow(book) {
    const e = Util.escape;
    const available = availableCopies(book);
    const badge = available > 0
      ? `<span class="badge ok">Disponível (${available})</span>`
      : `<span class="badge no">Indisponível</span>`;
    const details = [book.publisher, book.year].filter(Boolean).map(e).join(" · ");

    return `
      <tr>
        <td><strong>${e(book.title)}</strong>${details ? `<br><small class="muted">${details}</small>` : ""}</td>
        <td>${e(book.author)}</td>
        <td>${e(book.isbn)}</td>
        <td>${book.copies}</td>
        <td>${badge}</td>
        <td>
          <div class="row-actions">
            <button class="action-btn" data-action="edit" data-id="${e(book.id)}">Editar</button>
            <button class="action-btn delete" data-action="delete" data-id="${e(book.id)}">Excluir</button>
          </div>
        </td>
      </tr>`;
  }

  bookForm.addEventListener("submit", saveBook);

  $("book-list").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    const book = button && books.find(b => b.id === button.dataset.id);
    if (!book) return;

    if (button.dataset.action === "edit") fillBookForm(book);
    if (button.dataset.action === "delete") deleteBook(book);
  });

  $("book-cancel").addEventListener("click", () => {
    resetBookForm();
    Util.clearMessage(bookFeedback);
  });

  $("book-clear").addEventListener("click", () => {
    setTimeout(() => { resetBookForm(); Util.clearMessage(bookFeedback); });
  });

  $("book-search").addEventListener("input", renderBooks);
  $("only-available").addEventListener("change", renderBooks);


  /* ======================== Empréstimos ======================== */

  const loanForm = $("loan-form");
  const loanFeedback = $("loan-feedback");
  const loanBookSelect = $("loan-book");

  function readLoanForm() {
    return {
      bookId: loanBookSelect.value,
      reader: Util.value("reader"),
      email: Util.value("reader-email"),
      loanDate: Util.value("loan-date"),
      dueDate: Util.value("due-date")
    };
  }

  function validateLoan(loan) {
    const errors = [];
    const book = books.find(b => b.id === loan.bookId);

    if (!book) errors.push("Selecione o livro.");
    else if (availableCopies(book) < 1) errors.push("Não há exemplar disponível deste livro.");

    if (!loan.reader) errors.push("Informe o nome do leitor.");
    else if (loan.reader.length < 3) errors.push("O nome do leitor deve ter pelo menos 3 caracteres.");

    if (loan.email && !Util.isValidEmail(loan.email)) {
      errors.push("E-mail inválido. Use o formato nome@dominio.com.");
    }

    const validLoanDate = Util.isValidDate(loan.loanDate);
    if (!validLoanDate) errors.push("Informe a data do empréstimo.");
    else if (loan.loanDate > Util.today()) errors.push("A data do empréstimo não pode estar no futuro.");

    if (!Util.isValidDate(loan.dueDate)) {
      errors.push("Informe a data prevista de devolução.");
    } else if (validLoanDate) {
      const days = Util.daysBetween(loan.loanDate, loan.dueDate);
      if (days < 1) errors.push("A devolução prevista deve ser posterior à data do empréstimo.");
      else if (days > MAX_LOAN_DAYS) errors.push(`O prazo máximo de empréstimo é de ${MAX_LOAN_DAYS} dias.`);
    }

    return errors;
  }

  function setDefaultDates() {
    const today = Util.today();
    $("loan-date").value = today;
    $("due-date").value = Util.addDays(today, DEFAULT_LOAN_DAYS);
  }

  function saveLoan(event) {
    event.preventDefault();
    Util.clearMessage(loanFeedback);

    const loan = readLoanForm();
    const errors = validateLoan(loan);

    if (errors.length) {
      Util.showMessage(loanFeedback, errors.join(" "), "error");
      return;
    }

    const book = books.find(b => b.id === loan.bookId);
    loans.push({ id: Util.newId(), ...loan, bookTitle: book.title, returnDate: null });

    saveAll();
    loanForm.reset();
    setDefaultDates();
    refresh();
    Util.showMessage(loanFeedback,
      `Empréstimo de "${book.title}" para ${loan.reader} registrado. Devolução prevista: ${Util.formatDate(loan.dueDate)}.`);
  }

  function returnLoan(loan) {
    if (!confirm(`Confirmar a devolução de "${loan.bookTitle}" por ${loan.reader}?`)) return;

    loan.returnDate = Util.today();

    saveAll();
    refresh();
    Util.showMessage(loanFeedback, `Devolução de "${loan.bookTitle}" registrada. O exemplar voltou a ficar disponível.`);
  }

  function renderLoanBookOptions() {
    const selected = loanBookSelect.value;
    const available = books
      .filter(book => availableCopies(book) > 0)
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

    const placeholder = available.length ? "Selecione um livro disponível" : "Nenhum livro disponível";
    const options = available.map(book =>
      `<option value="${Util.escape(book.id)}">${Util.escape(book.title)} — ${Util.escape(book.author)} (${availableCopies(book)} disp.)</option>`);

    loanBookSelect.innerHTML = `<option value="">${placeholder}</option>` + options.join("");
    if (available.some(book => book.id === selected)) loanBookSelect.value = selected;
  }

  function renderLoans() {
    const query = Util.value("loan-search").toLowerCase();
    const filter = $("loan-filter").value;
    const order = { Atrasado: 0, Ativo: 1, Devolvido: 2 };
    const open = loans.filter(loan => !loan.returnDate);

    $("loan-active-count").textContent = open.length;
    $("loan-late-count").textContent = open.filter(loan => loanStatus(loan) === "Atrasado").length;

    const filtered = loans
      .filter(loan => filter === "all" || loanStatus(loan) === filter)
      .filter(loan => !query || [loan.reader, loan.bookTitle].some(text => text.toLowerCase().includes(query)))
      .sort((a, b) => order[loanStatus(a)] - order[loanStatus(b)] || a.dueDate.localeCompare(b.dueDate));

    if (!filtered.length) {
      const message = loans.length ? "Nenhum empréstimo encontrado para os filtros informados." : "Nenhum empréstimo registrado.";
      $("loan-list").innerHTML = `<tr><td colspan="7" class="empty">${message}</td></tr>`;
      return;
    }

    $("loan-list").innerHTML = filtered.map(loanRow).join("");
  }

  function loanRow(loan) {
    const e = Util.escape;
    const status = loanStatus(loan);
    const badgeClass = { Ativo: "ok", Atrasado: "late", Devolvido: "done" }[status];
    const action = loan.returnDate
      ? "—"
      : `<button class="action-btn return" data-action="return" data-id="${e(loan.id)}">Registrar devolução</button>`;

    return `
      <tr>
        <td><strong>${e(loan.bookTitle)}</strong></td>
        <td>${e(loan.reader)}${loan.email ? `<br><small class="muted">${e(loan.email)}</small>` : ""}</td>
        <td>${Util.formatDate(loan.loanDate)}</td>
        <td>${Util.formatDate(loan.dueDate)}</td>
        <td>${Util.formatDate(loan.returnDate)}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
        <td>${action}</td>
      </tr>`;
  }

  loanForm.addEventListener("submit", saveLoan);

  $("loan-list").addEventListener("click", event => {
    const button = event.target.closest("button[data-action='return']");
    const loan = button && loans.find(l => l.id === button.dataset.id);
    if (loan && !loan.returnDate) returnLoan(loan);
  });

  $("loan-clear").addEventListener("click", () => {
    setTimeout(() => { setDefaultDates(); Util.clearMessage(loanFeedback); });
  });

  $("loan-search").addEventListener("input", renderLoans);
  $("loan-filter").addEventListener("change", renderLoans);


  /* =========================== Abas =========================== */

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === tab.dataset.tab));
    });
  });


  /* ======================= Inicialização ======================= */

  setDefaultDates();
  refresh();
})();

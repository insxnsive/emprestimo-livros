"""Executa os casos de teste do Sistema de Empréstimo de Livros no Chrome (Playwright).
Uso: python3 run_tests.py <pasta_do_app> <pasta_evidencias> [modo]
modo = full (padrão) | explore (só teste exploratório de ISBN) | ref_nc (código de referência)
"""
import json, sys, os
from playwright.sync_api import sync_playwright

app_dir, out_dir = sys.argv[1], sys.argv[2]
mode = sys.argv[3] if len(sys.argv) > 3 else "full"
os.makedirs(out_dir, exist_ok=True)
URL = "file://" + os.path.abspath(os.path.join(app_dir, "index.html"))
results = []
dialog_answer = {"accept": True, "seen": []}

def rec(cid, scenario, expected, ok, obtained, shot=None):
    results.append({"id": cid, "cenario": scenario, "esperado": expected,
                    "obtido": obtained, "status": "Aprovado" if ok else "Reprovado", "evidencia": shot})
    print(f"{cid}: {'APROVADO' if ok else 'REPROVADO'} — {obtained}")

def shot(page, name):
    p = os.path.join(out_dir, name + ".png"); page.screenshot(path=p, full_page=True); return os.path.basename(p)

def fill_book(page, title="", author="", isbn="", publisher="", year="", copies="1"):
    page.click("button[data-tab=books]")
    for sel, v in [("#title", title), ("#author", author), ("#isbn", isbn), ("#publisher", publisher), ("#year", year), ("#copies", copies)]:
        page.fill(sel, v)
    page.click("#book-save")

def fb(page, sel="#book-feedback"):
    return page.inner_text(sel).strip()

def row_text(page, title):
    return page.locator("#book-list tr", has_text=title).first.inner_text()

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 1280, "height": 900}, timezone_id="America/Sao_Paulo", locale="pt-BR")
    page = ctx.new_page()
    def on_dialog(d):
        dialog_answer["seen"].append(d.message)
        d.accept() if dialog_answer["accept"] else d.dismiss()
    page.on("dialog", on_dialog)
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(URL)

    if mode == "ref_nc":
        page.click("button[data-tab=quality]")
        page.select_option("select[data-nc=NC01]", "Corrigida")
        before = page.inner_text("#metric-nc")
        page.reload(); page.click("button[data-tab=quality]")
        after_sel = page.input_value("select[data-nc=NC01]"); after = page.inner_text("#metric-nc")
        s = shot(page, "EXP02_referencia_status_nc_apos_recarregar")
        rec("EXP02", "Código de referência: alterar NC01 para Corrigida e recarregar.", "Status permanece Corrigida.",
            after_sel == "Corrigida", f"Antes de recarregar: {before} NC aberta(s). Após recarregar: NC01 voltou para '{after_sel}', {after} NC aberta(s).", s)
    elif mode == "explore":
        fill_book(page, "Livro ISBN errado", "Autor Teste", "978-85-359-0277-1", copies="1")
        msg = fb(page); s = shot(page, "EXP01_isbn_digito_errado")
        rec("EXP01", "Cadastrar ISBN com dígito verificador errado (978-85-359-0277-1).", "Cadastro bloqueado.",
            "inválido" in msg, f"Mensagem: \"{msg}\"", s)
    else:
        # CT01
        fill_book(page, "Dom Casmurro", "Machado de Assis", "978-85-359-0277-8", "Companhia das Letras", "2016", "2")
        msg = fb(page); r = row_text(page, "Dom Casmurro")
        rec("CT01", "Cadastrar livro com todos os campos válidos.", "Livro salvo e exibido como Disponível.",
            "sucesso" in msg and "Disponível (2)" in r, f"Mensagem \"{msg}\"; linha mostra \"Disponível (2)\".", shot(page, "CT01_cadastro_valido"))
        # CT02
        fill_book(page, "", "", "9780306406157")
        msg = fb(page); cnt = page.inner_text("#book-count")
        rec("CT02", "Salvar livro sem título e sem autor.", "Cadastro bloqueado com mensagem.",
            "Informe o título" in msg and "Informe o autor" in msg and cnt == "1", f"Mensagem \"{msg}\"; acervo continua com {cnt} livro.", shot(page, "CT02_obrigatorios"))
        # CT03
        fill_book(page, "Outro título", "Outro autor", "9788535902778")
        msg = fb(page); cnt = page.inner_text("#book-count")
        rec("CT03", "Cadastrar ISBN já existente, digitado sem hífens.", "Bloqueado por duplicidade.",
            "Já existe" in msg and cnt == "1", f"Mensagem \"{msg}\".", shot(page, "CT03_isbn_duplicado"))
        # CT04
        msgs = []
        for bad in ["97885ABC02778", "12345", "978-85-359-0277-1"]:
            fill_book(page, "Teste ISBN", "Autor", bad); msgs.append(fb(page))
        ok = all("ISBN inválido" in m for m in msgs) and page.inner_text("#book-count") == "1"
        rec("CT04", "ISBN com letras (97885ABC02778), curto (12345) e com dígito errado (978-85-359-0277-1).", "Rejeitado com formato esperado.",
            ok, "As três entradas foram rejeitadas com \"ISBN inválido...\".", shot(page, "CT04_isbn_invalido"))
        # CT05
        page.locator("#book-list tr", has_text="Dom Casmurro").locator("button[data-action=edit]").click()
        page.fill("#publisher", "Penguin-Companhia"); page.click("#book-save")
        r = row_text(page, "Dom Casmurro")
        ok = "Penguin-Companhia" in r and "Machado de Assis" in r and "978-85-359-0277-8" in r and "Disponível (2)" in r
        rec("CT05", "Editar a editora de Dom Casmurro.", "Alteração salva; demais campos preservados.",
            ok, "Editora alterada; autor, ISBN e exemplares mantidos.", shot(page, "CT05_edicao"))
        # second book for later
        fill_book(page, "O Cortiço", "Aluísio Azevedo", "0-306-40615-2", copies="1")
        # CT06
        page.click("button[data-tab=loans]")
        page.select_option("#loan-book", label=page.locator("#loan-book option", has_text="Dom Casmurro").inner_text())
        page.fill("#reader", "Ana Souza"); page.fill("#reader-email", "ana@exemplo.com"); page.click("#loan-save")
        msg = fb(page, "#loan-feedback"); lr = page.locator("#loan-list tr", has_text="Ana Souza").inner_text()
        page.click("button[data-tab=books]"); r = row_text(page, "Dom Casmurro")
        page.click("button[data-tab=loans]")
        rec("CT06", "Registrar empréstimo de Dom Casmurro para Ana Souza (prazo padrão 14 dias).", "Ativo; disponibilidade cai de 2 para 1.",
            "Ativo" in lr and "Disponível (1)" in r, f"Mensagem \"{msg}\"; disponibilidade passou para 1.", shot(page, "CT06_emprestimo"))
        # CT07
        page.select_option("#loan-book", label=page.locator("#loan-book option", has_text="Dom Casmurro").inner_text())
        page.fill("#reader", "Bruno Lima"); page.click("#loan-save")
        in_list = page.locator("#loan-book option", has_text="Dom Casmurro").count()
        page.click("button[data-tab=books]"); r = row_text(page, "Dom Casmurro")
        rec("CT07", "Emprestar o 2º (último) exemplar de Dom Casmurro.", "Indisponível e fora da lista de seleção.",
            "Indisponível" in r and in_list == 0, f"Livro marcado como Indisponível; opções com o título na lista: {in_list}.", shot(page, "CT07_indisponivel"))
        # CT08
        page.click("button[data-tab=loans]")
        page.select_option("#loan-book", label=page.locator("#loan-book option", has_text="O Cortiço").inner_text())
        page.fill("#reader", "Carla Dias")
        ld = page.input_value("#loan-date")
        page.evaluate("d => { document.getElementById('due-date').value = d; }", ld)
        page.click("#loan-save"); m1 = fb(page, "#loan-feedback")
        import datetime
        far = (datetime.date.fromisoformat(ld) + datetime.timedelta(days=45)).isoformat()
        page.evaluate("d => { document.getElementById('due-date').value = d; }", far)
        page.click("#loan-save"); m2 = fb(page, "#loan-feedback")
        cnt = page.locator("#loan-list tr", has_text="Carla Dias").count()
        rec("CT08", "Devolução prevista igual à data do empréstimo e depois 45 dias após.", "Bloqueado com mensagem de prazo.",
            "posterior" in m1 and "30 dias" in m2 and cnt == 0, f"1ª: \"{m1}\" 2ª: \"{m2}\"", shot(page, "CT08_prazo_invalido"))
        # CT09
        dialog_answer["accept"] = True
        page.locator("#loan-list tr", has_text="Ana Souza").locator("button[data-action=return]").click()
        lr = page.locator("#loan-list tr", has_text="Ana Souza").inner_text()
        page.click("button[data-tab=books]"); r = row_text(page, "Dom Casmurro")
        page.click("button[data-tab=loans]")
        rec("CT09", "Registrar devolução do empréstimo de Ana Souza.", "Devolvido; exemplar volta a ficar disponível.",
            "Devolvido" in lr and "Disponível (1)" in r, "Situação Devolvido; Dom Casmurro voltou para Disponível (1).", shot(page, "CT09_devolucao"))
        # CT10
        page.click("button[data-tab=books]")
        page.locator("#book-list tr", has_text="Dom Casmurro").locator("button[data-action=delete]").click()
        msg = fb(page); still = page.locator("#book-list tr", has_text="Dom Casmurro").count()
        rec("CT10", "Excluir Dom Casmurro (empréstimo de Bruno em aberto).", "Exclusão bloqueada.",
            "Não é possível excluir" in msg and still == 1, f"Mensagem \"{msg}\".", shot(page, "CT10_exclusao_bloqueada"))
        # CT11
        dialog_answer["accept"] = False
        page.locator("#book-list tr", has_text="O Cortiço").locator("button[data-action=delete]").click()
        kept = page.locator("#book-list tr", has_text="O Cortiço").count()
        dialog_answer["accept"] = True
        page.locator("#book-list tr", has_text="O Cortiço").locator("button[data-action=delete]").click()
        gone = page.locator("#book-list tr", has_text="O Cortiço").count()
        rec("CT11", "Excluir O Cortiço: cancelar e depois confirmar.", "Cancelar mantém; confirmar remove.",
            kept == 1 and gone == 0 and len(dialog_answer["seen"]) >= 3, f"Após cancelar: {kept} registro; após confirmar: {gone}.", shot(page, "CT11_exclusao_confirmacao"))
        # CT12
        page.reload()
        r = row_text(page, "Dom Casmurro"); page.click("button[data-tab=loans]")
        n = page.locator("#loan-list tr", has_text="Bruno Lima").count() + page.locator("#loan-list tr", has_text="Ana Souza").count()
        rec("CT12", "Recarregar a página.", "Livro e empréstimos continuam.",
            "Dom Casmurro" in r and n == 2, f"Livro e {n} empréstimos presentes após recarregar.", shot(page, "CT12_persistencia"))
        # CT13 regressão
        fill_book(page, "Outro título", "Outro autor", "9788535902778"); m1 = fb(page)
        fill_book(page, "Teste ISBN", "Autor", "978-85-359-0277-1"); m2 = fb(page)
        fill_book(page, "Livro ISBN-10 com X", "Autor", "0-8044-2957-X"); m3 = fb(page)
        rec("CT13", "Regressão após correção do ISBN: repetir CT03, CT04 e cadastrar ISBN-10 válido terminado em X.", "Validações funcionam e ISBN válido é aceito.",
            "Já existe" in m1 and "ISBN inválido" in m2 and "sucesso" in m3, f"Duplicado bloqueado; dígito errado rejeitado; 0-8044-2957-X aceito.", shot(page, "CT13_regressao"))
        # Painel
        page.click("button[data-tab=quality]"); shot(page, "painel_qualidade")
        page.set_viewport_size({"width": 390, "height": 844}); page.click("button[data-tab=books]"); shot(page, "layout_celular")
    if errors: print("ERROS JS:", errors)
    json.dump(results, open(os.path.join(out_dir, f"resultados_{mode}.json"), "w"), ensure_ascii=False, indent=2)
    browser.close()

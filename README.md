# Empréstimo de Livros

*THIS IS A UNIVERSITY PROJECT DONE BY/AND WITH OTHER STUDENTS.*

A small book-loan app for a software quality management course. You register books, lend them to readers, record returns, and track the project's quality work in a dashboard. The interface is in Brazilian Portuguese.

It runs in the browser with no backend. Open `index.html` in Chrome, Edge or Firefox. Data lives in the browser's LocalStorage, so clearing it deletes everything.

## What it does

- Registers, edits and deletes books. ISBN-10 and ISBN-13 are checked by their check digit, and two books can't share an ISBN.
- Lists books with search by title, author or ISBN and a filter for available ones. Availability is copies minus open loans.
- Lends a book only while a copy is free. The due date must fall 1 to 30 days after the loan date.
- Records returns. A loan is Ativo, Atrasado (past its due date and not returned) or Devolvido.
- Blocks deleting a book that has open loans and asks for confirmation on every other delete.
- Shows a quality dashboard with a checklist, test cases, risks, nonconformities and a PDCA cycle. It computes the progress figures from the checklist, test results and nonconformity status you set.

## Files

- `index.html`, `styles.css`, `app.js`: the whole app, with no framework or build step.
- `fonts/`: Poppins, with its OFL license.
- `documentacao/`: quality plan, checklist, test cases, risk matrix, nonconformity log and PDCA indicators, in Portuguese.

## Limits

There are no reader accounts, login, reservations, renewals or fines. A return is dated today. Use fake data only.

## Formatting

Prettier settings are in `.prettierrc`. To format the code:

```
npx prettier --write index.html styles.css app.js
```

/* =============================================================
   utils.js — funções auxiliares usadas pelos outros scripts
   ============================================================= */

const Util = {

  /* ---------- Armazenamento (LocalStorage) ---------- */

  load(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },

  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /* ---------- Interface ---------- */

  byId(id) {
    return document.getElementById(id);
  },

  value(id) {
    return document.getElementById(id).value.trim();
  },

  escape(text) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return String(text ?? "").replace(/[&<>"']/g, char => map[char]);
  },

  showMessage(element, message, type = "success") {
    element.textContent = message;
    element.className = `feedback ${type}`;
  },

  clearMessage(element) {
    element.textContent = "";
    element.className = "feedback";
  },

  newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  /* ---------- Datas (sempre no formato AAAA-MM-DD, horário local) ---------- */

  today() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  },

  isValidDate(text) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const [y, m, d] = text.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  },

  toUTC(text) {
    const [y, m, d] = text.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  },

  daysBetween(start, end) {
    return Math.round((Util.toUTC(end) - Util.toUTC(start)) / 86400000);
  },

  addDays(text, days) {
    const date = new Date(Util.toUTC(text) + days * 86400000);
    return date.toISOString().slice(0, 10);
  },

  formatDate(text) {
    if (!text) return "—";
    const [y, m, d] = text.split("-");
    return `${d}/${m}/${y}`;
  },

  /* ---------- Validações ---------- */

  normalizeISBN(isbn) {
    return String(isbn || "").toUpperCase().replace(/[\s-]/g, "");
  },

  // Confere o formato e o dígito verificador do ISBN-10 e do ISBN-13
  isValidISBN(isbn) {
    const digits = Util.normalizeISBN(isbn);

    if (/^\d{9}[\dX]$/.test(digits)) {
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        const n = digits[i] === "X" ? 10 : Number(digits[i]);
        sum += n * (10 - i);
      }
      return sum % 11 === 0;
    }

    if (/^\d{13}$/.test(digits)) {
      let sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += Number(digits[i]) * (i % 2 === 0 ? 1 : 3);
      }
      return sum % 10 === 0;
    }

    return false;
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  },

  isIntegerBetween(text, min, max) {
    const n = Number(text);
    return text !== "" && Number.isInteger(n) && n >= min && n <= max;
  }
};

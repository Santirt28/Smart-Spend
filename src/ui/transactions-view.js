import { loadData, saveData } from "../storage.js";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../transactions.js";

export function initTransactionsView() {
  const form = document.querySelector("#transaction-form");
  const tableBody = document.querySelector("#transactions-table-body");
  const emptyMessage = document.querySelector("#transactions-empty");
  const message = document.querySelector("#transaction-form-message");
  const submitButton = form.querySelector('[type="submit"]');
  const cancelButton = document.querySelector("#transaction-cancel");
  const searchInput = document.querySelector("#transaction-search");
  const filterSelect = document.querySelector("#transaction-filter");
  const sortSelect = document.querySelector("#transaction-sort");

  let data = loadData();
  let editingId = null;

  function addCell(row, text, className = "px-3 py-2") {
    const cell = document.createElement("td");
    cell.className = className;
    cell.textContent = text;
    row.append(cell);
  }

  function renderTransactions() {
    tableBody.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();
    const typeFilter = filterSelect.value;
    const sortMode = sortSelect.value;

    const transactions = data.transactions
      .filter((transaction) => {
        const searchableText =
          `${transaction.description} ${transaction.category}`.toLowerCase();
        const matchesSearch = searchableText.includes(searchTerm);
        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortMode) {
          case "date-asc":
            return a.date.localeCompare(b.date);
          case "amount-desc":
            return b.amount - a.amount;
          case "amount-asc":
            return a.amount - b.amount;
          case "date-desc":
          default:
            return b.date.localeCompare(a.date);
        }
      });

    emptyMessage.hidden = transactions.length > 0;
    emptyMessage.textContent = data.transactions.length === 0
      ? "No transactions yet."
      : "No matching transactions.";

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const sign = transaction.type === "expense" ? "−" : "+";

      addCell(row, transaction.date);
      addCell(row, transaction.description);
      addCell(row, transaction.category);
      addCell(row, transaction.type);
      addCell(
        row,
        `${sign}$${transaction.amount.toFixed(2)}`,
        "px-3 py-2 text-right"
      );

      const actions = document.createElement("td");
      actions.className = "space-x-2 px-3 py-2";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.className = "text-emerald-400 underline";
      editButton.setAttribute(
        "aria-label",
        `Edit transaction: ${transaction.description}`
      );
      editButton.addEventListener("click", () => startEditing(transaction));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "text-red-400 underline";
      deleteButton.setAttribute(
        "aria-label",
        `Delete transaction: ${transaction.description}`
      );
      deleteButton.addEventListener("click", () => removeTransaction(transaction));

      actions.append(editButton, deleteButton);
      row.append(actions);
      tableBody.append(row);
    });
  }

  function startEditing(transaction) {
    editingId = transaction.id;
    form.elements.type.value = transaction.type;
    form.elements.amount.value = transaction.amount;
    form.elements.description.value = transaction.description;
    form.elements.category.value = transaction.category;
    form.elements.date.value = transaction.date;
    submitButton.textContent = "Save changes";
    cancelButton.hidden = false;
    message.textContent = "Editing transaction.";
  }

  function cancelEditing() {
    editingId = null;
    form.reset();
    submitButton.textContent = "Add transaction";
    cancelButton.hidden = true;
    message.textContent = "";
  }

  function removeTransaction(transaction) {
    if (!window.confirm(`Delete "${transaction.description}"?`)) return;

    const transactions = deleteTransaction(data.transactions, transaction.id);
    const updatedData = { ...data, transactions };

    if (!saveData(updatedData)) {
      message.textContent = "Could not delete the transaction.";
      return;
    }

    data = updatedData;

    if (editingId === transaction.id) {
      cancelEditing();
    }

    message.textContent = "Transaction deleted.";
    renderTransactions();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    const input = Object.fromEntries(new FormData(form).entries());
    const wasEditing = editingId !== null;

    const result = wasEditing
      ? updateTransaction(data.transactions, editingId, input)
      : addTransaction(data.transactions, input);

    if (!result.ok) {
      message.textContent = Object.values(result.errors).join(" ");
      return;
    }

    const updatedData = { ...data, transactions: result.transactions };

    if (!saveData(updatedData)) {
      message.textContent = "Could not save the transaction.";
      return;
    }

    data = updatedData;
    cancelEditing();
    message.textContent = wasEditing
      ? "Transaction updated."
      : "Transaction saved.";
    renderTransactions();
  });

  cancelButton.addEventListener("click", cancelEditing);
  searchInput.addEventListener("input", renderTransactions);
  filterSelect.addEventListener("change", renderTransactions);
  sortSelect.addEventListener("change", renderTransactions);

  renderTransactions();
}
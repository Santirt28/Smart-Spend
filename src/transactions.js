import { validateTransaction } from "./validation.js";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function addTransaction(transactions, input) {
  const result = validateTransaction(input);

  if (!result.valid) {
    return { ok: false, errors: result.errors, transactions };
  }

  const newTransaction = { id: generateId(), ...result.value };
  return { ok: true, errors: {}, transactions: [...transactions, newTransaction] };
}

export function updateTransaction(transactions, id, input) {
  const exists = transactions.some((transaction) => transaction.id === id);

  if (!exists) {
    return {
      ok: false,
      errors: { general: "Transaction not found." },
      transactions,
    };
  }

  const result = validateTransaction(input);

  if (!result.valid) {
    return { ok: false, errors: result.errors, transactions };
  }

  const updated = transactions.map((transaction) =>
    transaction.id === id ? { id, ...result.value } : transaction
  );

  return { ok: true, errors: {}, transactions: updated };
}

export function deleteTransaction(transactions, id) {
  return transactions.filter((transaction) => transaction.id !== id);
}

export function calculateTotals(transactions) {
  const totals = transactions.reduce(
    (sum, transaction) => {
      if (transaction.type === "income") {
        sum.income += transaction.amount;
      } else {
        sum.expenses += transaction.amount;
      }

      return sum;
    },
    { income: 0, expenses: 0 }
  );

  const income = Math.round(totals.income * 100) / 100;
  const expenses = Math.round(totals.expenses * 100) / 100;
  const balance = Math.round((income - expenses) * 100) / 100;

  return { income, expenses, balance };
}

export function getCurrentMonthKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function filterByMonth(transactions, monthKey) {
  return transactions.filter((transaction) => transaction.date.startsWith(monthKey));
}

export function getRecentTransactions(transactions, limit = 5) {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function calculateExpensesByCategory(transactions) {
  const totals = {};

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") return;

    totals[transaction.category] =
      (totals[transaction.category] || 0) + transaction.amount;
  });

  return Object.fromEntries(
    Object.entries(totals).map(([category, amount]) => [
      category,
      Math.round(amount * 100) / 100,
    ])
  );
}
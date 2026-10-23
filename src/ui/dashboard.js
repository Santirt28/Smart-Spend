import { loadData } from "../storage.js";
import {
  calculateTotals,
  filterByMonth,
  getCurrentMonthKey,
  getRecentTransactions,
} from "../transactions.js";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function setText(selector, text) {
  document.querySelector(selector).textContent = text;
}

function createRecentItem(transaction) {
  const item = document.createElement("li");
  item.className =
    "flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3";

  const info = document.createElement("div");
  const title = document.createElement("p");
  title.className = "font-medium";
  title.textContent = transaction.description;
  const meta = document.createElement("p");
  meta.className = "text-sm text-slate-400";
  meta.textContent = `${transaction.category} · ${transaction.date}`;
  info.append(title, meta);

  const isIncome = transaction.type === "income";
  const amount = document.createElement("span");
  amount.className = isIncome ? "font-semibold text-emerald-400" : "font-semibold text-red-400";
  amount.textContent = `${isIncome ? "+" : "-"}${currencyFormatter.format(transaction.amount)}`;

  item.append(info, amount);
  return item;
}

export function renderDashboard() {
  const { transactions } = loadData();

  const totals = calculateTotals(transactions);
  setText("#dashboard-income", currencyFormatter.format(totals.income));
  setText("#dashboard-expenses", currencyFormatter.format(totals.expenses));
  setText("#dashboard-balance", currencyFormatter.format(totals.balance));

  const balanceElement = document.querySelector("#dashboard-balance");
  balanceElement.classList.toggle("text-red-400", totals.balance < 0);
  balanceElement.classList.toggle("text-emerald-400", totals.balance >= 0);

  const monthTransactions = filterByMonth(transactions, getCurrentMonthKey());
  const monthTotals = calculateTotals(monthTransactions);
  setText("#dashboard-month-income", currencyFormatter.format(monthTotals.income));
  setText("#dashboard-month-expenses", currencyFormatter.format(monthTotals.expenses));

  const recent = getRecentTransactions(transactions, 5);
  const list = document.querySelector("#dashboard-recent");
  list.replaceChildren(...recent.map(createRecentItem));
  document.querySelector("#dashboard-empty").hidden = recent.length > 0;
}
import { loadData } from "../storage.js";
import {
  calculateTotals,
  calculateExpensesByCategory,
  filterByMonth,
  getCurrentMonthKey,
  getRecentTransactions,
} from "../transactions.js";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const chartColors = [
  "#34d399",
  "#38bdf8",
  "#a78bfa",
  "#fbbf24",
  "#fb7185",
  "#2dd4bf",
  "#c084fc",
  "#94a3b8",
];

let expenseChart = null;

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
  amount.className = isIncome
    ? "font-semibold text-emerald-400"
    : "font-semibold text-red-400";
  amount.textContent = `${isIncome ? "+" : "-"}${currencyFormatter.format(
    transaction.amount
  )}`;

  item.append(info, amount);
  return item;
}

function renderExpenseChart(expensesByCategory) {
  const canvas = document.querySelector("#dashboard-expense-chart");
  const chartContainer = canvas.parentElement;
  const emptyMessage = document.querySelector("#dashboard-chart-empty");
  const entries = Object.entries(expensesByCategory);

  if (expenseChart) {
    expenseChart.destroy();
    expenseChart = null;
  }

  if (entries.length === 0) {
    chartContainer.hidden = true;
    emptyMessage.hidden = false;
    emptyMessage.textContent = "No expenses this month yet.";
    return;
  }

  if (!window.Chart) {
    chartContainer.hidden = true;
    emptyMessage.hidden = false;
    emptyMessage.textContent = "Chart could not load. Check your internet connection.";
    return;
  }

  chartContainer.hidden = false;
  emptyMessage.hidden = true;

  expenseChart = new window.Chart(canvas, {
    type: "doughnut",
    data: {
      labels: entries.map(([category]) => category),
      datasets: [
        {
          data: entries.map(([, amount]) => amount),
          backgroundColor: entries.map(
            (_, index) => chartColors[index % chartColors.length]
          ),
          borderColor: "#0f172a",
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#cbd5e1",
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.label}: ${currencyFormatter.format(
                context.parsed
              )}`;
            },
          },
        },
      },
    },
  });
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

  const monthTransactions = filterByMonth(
    transactions,
    getCurrentMonthKey()
  );
  const monthTotals = calculateTotals(monthTransactions);

  setText(
    "#dashboard-month-income",
    currencyFormatter.format(monthTotals.income)
  );
  setText(
    "#dashboard-month-expenses",
    currencyFormatter.format(monthTotals.expenses)
  );

  const expensesByCategory =
    calculateExpensesByCategory(monthTransactions);
  renderExpenseChart(expensesByCategory);

  const recent = getRecentTransactions(transactions, 5);
  const list = document.querySelector("#dashboard-recent");
  list.replaceChildren(...recent.map(createRecentItem));
  document.querySelector("#dashboard-empty").hidden = recent.length > 0;
}
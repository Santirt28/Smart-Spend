import { loadData, saveData } from "../storage.js";
import { getCurrentMonthKey } from "../transactions.js";
import {
  BUDGET_CATEGORIES,
  calculateBudgetProgress,
  deleteBudget,
  saveBudget,
} from "../budgets.js";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUS_STYLES = {
  ok: { bar: "bg-emerald-500", text: "text-emerald-400", label: "On track" },
  warning: { bar: "bg-amber-400", text: "text-amber-400", label: "Close to your limit" },
  over: { bar: "bg-red-500", text: "text-red-400", label: "Over budget" },
};

let list;
let emptyMessage;
let message;

function createBudgetCard(progress) {
  const style = STATUS_STYLES[progress.status];

  const card = document.createElement("li");
  card.className = "rounded-xl border border-slate-800 bg-slate-900 p-4";

  const header = document.createElement("div");
  header.className = "flex items-center justify-between gap-3";

  const title = document.createElement("p");
  title.className = "font-semibold";
  title.textContent = progress.category;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "text-sm text-red-400 underline";
  deleteButton.setAttribute("aria-label", `Delete budget for ${progress.category}`);
  deleteButton.addEventListener("click", () => removeBudget(progress.category));

  header.append(title, deleteButton);

  const amounts = document.createElement("p");
  amounts.className = "mt-1 text-sm text-slate-400";
  amounts.textContent = `${currencyFormatter.format(progress.spent)} of ${currencyFormatter.format(progress.limit)} spent (${progress.percent}%)`;

  const track = document.createElement("div");
  track.className = "mt-3 h-2 overflow-hidden rounded-full bg-slate-800";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-label", `${progress.category} budget used`);
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-valuenow", String(Math.min(progress.percent, 100)));

  const bar = document.createElement("div");
  bar.className = `h-full ${style.bar}`;
  bar.style.width = `${Math.min(progress.percent, 100)}%`;
  track.append(bar);

  const status = document.createElement("p");
  status.className = `mt-2 text-sm ${style.text}`;
  status.textContent =
    progress.status === "over"
      ? `${style.label} by ${currencyFormatter.format(Math.abs(progress.remaining))}`
      : `${style.label} · ${currencyFormatter.format(progress.remaining)} left`;

  card.append(header, amounts, track, status);
  return card;
}

export function renderBudgets() {
  const { budgets, transactions } = loadData();
  const progressList = calculateBudgetProgress(
    budgets,
    transactions,
    getCurrentMonthKey()
  );

  list.replaceChildren(...progressList.map(createBudgetCard));
  emptyMessage.hidden = progressList.length > 0;
}

function removeBudget(category) {
  if (!window.confirm(`Delete the budget for ${category}?`)) return;

  const data = loadData();
  const updated = { ...data, budgets: deleteBudget(data.budgets, category) };

  if (!saveData(updated)) {
    message.textContent = "Could not delete the budget.";
    return;
  }

  message.textContent = "Budget deleted.";
  renderBudgets();
}

export function initBudgetsView() {
  const form = document.querySelector("#budget-form");
  list = document.querySelector("#budgets-list");
  emptyMessage = document.querySelector("#budgets-empty");
  message = document.querySelector("#budget-message");

  BUDGET_CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    form.elements.category.append(option);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    const input = Object.fromEntries(new FormData(form).entries());
    const data = loadData();
    const result = saveBudget(data.budgets, input);

    if (!result.ok) {
      message.textContent = Object.values(result.errors).join(" ");
      return;
    }

    if (!saveData({ ...data, budgets: result.budgets })) {
      message.textContent = "Could not save the budget.";
      return;
    }

    form.elements.limit.value = "";
    message.textContent = "Budget saved.";
    renderBudgets();
  });

  renderBudgets();
}
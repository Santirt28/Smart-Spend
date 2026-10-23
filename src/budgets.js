import { CATEGORIES } from "./validation.js";
import { filterByMonth } from "./transactions.js";

export const BUDGET_CATEGORIES = CATEGORIES.filter(
  (category) => category !== "Salary"
);

const WARNING_THRESHOLD = 80;
const MAX_LIMIT = 1_000_000_000;

function round(value) {
  return Math.round(value * 100) / 100;
}

export function validateBudget(input) {
  const errors = {};
  const category = input.category;
  const rawLimit = String(input.limit ?? "").trim();
  const limit = Number(rawLimit);
  const roundedLimit = round(limit);

  if (!BUDGET_CATEGORIES.includes(category)) {
    errors.category = "Please choose a valid category.";
  }

  if (
    rawLimit === "" ||
    !Number.isFinite(limit) ||
    limit <= 0 ||
    roundedLimit <= 0
  ) {
    errors.limit = "Limit must be at least 0.01.";
  } else if (limit > MAX_LIMIT) {
    errors.limit = "Limit is too large.";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    value: valid ? { category, limit: roundedLimit } : null,
  };
}

export function saveBudget(budgets, input) {
  const result = validateBudget(input);

  if (!result.valid) {
    return { ok: false, errors: result.errors, budgets };
  }

  const exists = budgets.some((budget) => budget.category === result.value.category);
  const updated = exists
    ? budgets.map((budget) =>
        budget.category === result.value.category ? result.value : budget
      )
    : [...budgets, result.value];

  return { ok: true, errors: {}, budgets: updated };
}

export function deleteBudget(budgets, category) {
  return budgets.filter((budget) => budget.category !== category);
}

export function calculateBudgetProgress(budgets, transactions, monthKey) {
  const monthExpenses = filterByMonth(transactions, monthKey).filter(
    (transaction) => transaction.type === "expense"
  );

  return budgets.map((budget) => {
    const spent = round(
      monthExpenses
        .filter((transaction) => transaction.category === budget.category)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );
    const remaining = round(budget.limit - spent);
    const percent = Math.round((spent / budget.limit) * 100);

    let status = "ok";
    if (spent > budget.limit) {
      status = "over";
    } else if (percent >= WARNING_THRESHOLD) {
      status = "warning";
    }

    return { ...budget, spent, remaining, percent, status };
  });
}
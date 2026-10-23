import assert from "node:assert/strict";
import test from "node:test";
import {
  BUDGET_CATEGORIES,
  calculateBudgetProgress,
  deleteBudget,
  saveBudget,
  validateBudget,
} from "../src/budgets.js";

test("validates a budget and rounds its limit to cents", () => {
  assert.deepEqual(validateBudget({ category: "Food", limit: "12.34" }), {
    valid: true,
    errors: {},
    value: { category: "Food", limit: 12.34 },
  });
});

test("rejects a positive limit that rounds down to zero", () => {
  const result = validateBudget({ category: "Food", limit: "0.001" });

  assert.equal(result.valid, false);
  assert.equal(result.value, null);
  assert.equal(result.errors.limit, "Limit must be at least 0.01.");
});

test("does not allow income categories for budgets", () => {
  assert.equal(BUDGET_CATEGORIES.includes("Salary"), false);
  assert.equal(validateBudget({ category: "Salary", limit: "100" }).valid, false);
});

test("saves a category once and replaces its limit", () => {
  const initial = [{ category: "Food", limit: 100 }];
  const result = saveBudget(initial, { category: "Food", limit: "150" });

  assert.equal(result.ok, true);
  assert.deepEqual(result.budgets, [{ category: "Food", limit: 150 }]);
  assert.deepEqual(initial, [{ category: "Food", limit: 100 }]);
});

test("deletes only the selected category budget", () => {
  const budgets = [
    { category: "Food", limit: 100 },
    { category: "Housing", limit: 500 },
  ];

  assert.deepEqual(deleteBudget(budgets, "Food"), [
    { category: "Housing", limit: 500 },
  ]);
});

test("calculates monthly expense progress and excludes income and other months", () => {
  const progress = calculateBudgetProgress(
    [{ category: "Food", limit: 100 }],
    [
      { type: "expense", category: "Food", amount: 79.99, date: "2026-10-02" },
      { type: "expense", category: "Food", amount: 10, date: "2026-10-03" },
      { type: "income", category: "Food", amount: 1000, date: "2026-10-04" },
      { type: "expense", category: "Food", amount: 500, date: "2026-09-30" },
    ],
    "2026-10"
  );

  assert.deepEqual(progress, [
    {
      category: "Food",
      limit: 100,
      spent: 89.99,
      remaining: 10.01,
      percent: 90,
      status: "warning",
    },
  ]);
});

test("marks spending above the limit as over budget", () => {
  const [progress] = calculateBudgetProgress(
    [{ category: "Food", limit: 10 }],
    [{ type: "expense", category: "Food", amount: 15, date: "2026-10-02" }],
    "2026-10"
  );

  assert.equal(progress.status, "over");
  assert.equal(progress.remaining, -5);
  assert.equal(progress.percent, 150);
});
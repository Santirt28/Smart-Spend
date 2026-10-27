import test from "node:test";
import assert from "node:assert/strict";
import { calculateExpensesByCategory } from "../src/transactions.js";

test("groups expenses by category and excludes income", () => {
  const transactions = [
    { type: "income", category: "Salary", amount: 1000 },
    { type: "expense", category: "Food", amount: 12.5 },
    { type: "expense", category: "Food", amount: 7.25 },
    { type: "expense", category: "Transport", amount: 8 },
  ];

  assert.deepEqual(calculateExpensesByCategory(transactions), {
    Food: 19.75,
    Transport: 8,
  });
});

test("returns an empty object when there are no expenses", () => {
  const transactions = [
    { type: "income", category: "Salary", amount: 1000 },
  ];

  assert.deepEqual(calculateExpensesByCategory(transactions), {});
});
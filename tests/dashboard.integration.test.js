import test from "node:test";
import assert from "node:assert/strict";
import { loadData, saveData } from "../src/storage.js";
import { addTransaction, calculateTotals } from "../src/transactions.js";

test("saved transactions load correctly and produce dashboard totals", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage"
  );
  const values = new Map();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(key, String(value));
      },
      removeItem(key) {
        values.delete(key);
      },
    },
  });

  try {
    const data = loadData();

    const incomeResult = addTransaction(data.transactions, {
      type: "income",
      amount: "1200",
      description: "Paycheck",
      category: "Salary",
      date: "2026-10-20",
    });
    assert.equal(incomeResult.ok, true);

    const expenseResult = addTransaction(incomeResult.transactions, {
      type: "expense",
      amount: "75",
      description: "Groceries",
      category: "Food",
      date: "2026-10-21",
    });
    assert.equal(expenseResult.ok, true);

    assert.equal(
      saveData({ ...data, transactions: expenseResult.transactions }),
      true
    );

    const savedData = loadData();

    assert.equal(savedData.transactions.length, 2);
    assert.deepEqual(calculateTotals(savedData.transactions), {
      income: 1200,
      expenses: 75,
      balance: 1125,
    });
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "localStorage", originalDescriptor);
    } else {
      delete globalThis.localStorage;
    }
  }
});
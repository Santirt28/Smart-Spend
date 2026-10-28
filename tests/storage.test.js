import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadData, saveData, resetData } from "../src/storage.js";

let savedItems;

beforeEach(() => {
  savedItems = new Map();

  globalThis.localStorage = {
    getItem(key) {
      return savedItems.has(key) ? savedItems.get(key) : null;
    },
    setItem(key, value) {
      savedItems.set(key, String(value));
    },
    removeItem(key) {
      savedItems.delete(key);
    },
  };
});

describe("storage", () => {
  it("returns empty data when nothing has been saved", () => {
    assert.deepEqual(loadData(), {
      version: 1,
      transactions: [],
      budgets: [],
      goals: [],
    });
  });

  it("saves and loads data", () => {
    const data = {
      version: 1,
      transactions: [{ id: "1", amount: 25 }],
      budgets: [],
      goals: [],
    };

    assert.equal(saveData(data), true);
    assert.deepEqual(loadData(), data);
  });

  it("resets saved data", () => {
    saveData({
      version: 1,
      transactions: [],
      budgets: [],
      goals: [],
    });

    assert.equal(resetData(), true);
    assert.deepEqual(loadData(), {
      version: 1,
      transactions: [],
      budgets: [],
      goals: [],
    });
  });
});
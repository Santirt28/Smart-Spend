import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ALLOCATION,
  sumPercents,
  validateSmartPlan,
  calculateSmartPlan,
} from "../src/smart-plan.js";

describe("smart plan", () => {
  it("has default percentages that total 100%", () => {
    assert.equal(sumPercents(DEFAULT_ALLOCATION), 100);
  });

  it("accepts valid income and percentages", () => {
    const result = validateSmartPlan("2000", DEFAULT_ALLOCATION);

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.income, 2000);
  });

  it("rejects empty, zero, or non-numeric income", () => {
    for (const income of ["", "0", "abc"]) {
      const result = validateSmartPlan(income, DEFAULT_ALLOCATION);

      assert.equal(result.valid, false);
      assert.ok(result.errors.income);
    }
  });

  it("rejects percentages that do not total 100%", () => {
    const allocation = [
      { key: "needs", label: "Needs", percent: 50 },
      { key: "other", label: "Other", percent: 40 },
    ];

    const result = validateSmartPlan("1000", allocation);

    assert.equal(result.valid, false);
    assert.ok(result.errors.percents);
  });

  it("allocates the income and preserves the total after rounding", () => {
    const allocation = [
      { key: "needs", label: "Needs", percent: 50 },
      { key: "other", label: "Other", percent: 50 },
    ];

    const result = calculateSmartPlan(100.01, allocation);
    const total = result.reduce((sum, item) => sum + item.amount, 0);

    assert.deepEqual(
      result.map((item) => item.amount),
      [50.01, 50]
    );
    assert.equal(Math.round(total * 100) / 100, 100.01);
  });
});
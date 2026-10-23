export const DEFAULT_ALLOCATION = [
  { key: "needs", label: "Needs", percent: 50 },
  { key: "investments", label: "Investments", percent: 25 },
  { key: "emergency", label: "Emergency savings", percent: 15 },
  { key: "other", label: "Other", percent: 10 },
];

const MAX_INCOME = 1_000_000_000;

export function sumPercents(allocation) {
  const total = allocation.reduce((sum, item) => sum + item.percent, 0);
  return Math.round(total * 100) / 100;
}

export function validateSmartPlan(rawIncome, allocation) {
  const errors = {};
  const text = String(rawIncome ?? "").trim();
  const income = Number(text);

  if (text === "" || !Number.isFinite(income) || income <= 0) {
    errors.income = "Income must be a number greater than 0.";
  } else if (income > MAX_INCOME) {
    errors.income = "Income is too large.";
  }

  const hasInvalidPercent = allocation.some(
    (item) => !Number.isFinite(item.percent) || item.percent < 0 || item.percent > 100
  );

  if (hasInvalidPercent) {
    errors.percents = "Each percentage must be a number between 0 and 100.";
  } else if (sumPercents(allocation) !== 100) {
    errors.percents = `Percentages must total 100% (currently ${sumPercents(allocation)}%).`;
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors, income: valid ? income : null };
}

export function calculateSmartPlan(income, allocation) {
  const totalCents = Math.round(income * 100);

  const parts = allocation.map((item) => ({
    ...item,
    cents: Math.round((totalCents * item.percent) / 100),
  }));

  // Rounding can leave a cent over or under; the last category absorbs it
  const difference = totalCents - parts.reduce((sum, part) => sum + part.cents, 0);
  if (parts.length > 0) {
    parts[parts.length - 1].cents += difference;
  }

  return parts.map(({ cents, ...item }) => ({ ...item, amount: cents / 100 }));
}
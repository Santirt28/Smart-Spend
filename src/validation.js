export const TRANSACTION_TYPES = ["income", "expense"];

export const CATEGORIES = [
  "Food",
  "Housing",
  "Transport",
  "Health",
  "Entertainment",
  "Shopping",
  "Salary",
  "Other",
];

const MAX_AMOUNT = 1_000_000_000;

function isValidDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateTransaction(input) {
  const errors = {};

  const type = input.type;
  const description = String(input.description ?? "").trim();
  const rawAmount = String(input.amount ?? "").trim();
  const amount = Number(rawAmount);
  const category = input.category;
  const date = input.date;

  if (!TRANSACTION_TYPES.includes(type)) {
    errors.type = "Type must be income or expense.";
  }

  if (rawAmount === "" || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be a number greater than 0.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = "Amount is too large.";
  }

  if (description === "") {
    errors.description = "Description is required.";
  } else if (description.length > 80) {
    errors.description = "Description must be 80 characters or less.";
  }

  if (!CATEGORIES.includes(category)) {
    errors.category = "Please choose a valid category.";
  }

  if (!isValidDate(date)) {
    errors.date = "Please enter a valid date.";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    value: valid
      ? { type, amount: Math.round(amount * 100) / 100, description, category, date }
      : null,
  };
}
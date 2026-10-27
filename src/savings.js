const MAX_AMOUNT = 1_000_000_000;
const MAX_NAME_LENGTH = 60;

function round(value) {
  return Math.round(value * 100) / 100;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function validateGoal(input) {
  const errors = {};

  const name = String(input.name ?? "").trim();
  const targetText = String(input.target ?? "").trim();
  const target = Number(targetText);
  const currentText = String(input.current ?? "").trim();
  const current = currentText === "" ? 0 : Number(currentText);

  if (name === "") {
    errors.name = "Goal name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Goal name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  if (targetText === "" || !Number.isFinite(target) || target <= 0) {
    errors.target = "Target must be a number greater than 0.";
  } else if (target > MAX_AMOUNT) {
    errors.target = "Target is too large.";
  }

  if (!Number.isFinite(current) || current < 0) {
    errors.current = "Current amount must be 0 or more.";
  } else if (!errors.target && current > target) {
    errors.current = "Current amount cannot be greater than the target.";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    value: valid
      ? { name, target: round(target), current: round(current) }
      : null,
  };
}

export function addGoal(goals, input) {
  const result = validateGoal(input);

  if (!result.valid) {
    return { ok: false, errors: result.errors, goals };
  }

  return {
    ok: true,
    errors: {},
    goals: [...goals, { id: generateId(), ...result.value }],
  };
}

export function updateGoal(goals, id, input) {
  if (!goals.some((goal) => goal.id === id)) {
    return { ok: false, errors: { general: "Goal not found." }, goals };
  }

  const result = validateGoal(input);

  if (!result.valid) {
    return { ok: false, errors: result.errors, goals };
  }

  return {
    ok: true,
    errors: {},
    goals: goals.map((goal) => (goal.id === id ? { id, ...result.value } : goal)),
  };
}

export function deleteGoal(goals, id) {
  return goals.filter((goal) => goal.id !== id);
}

export function contributeToGoal(goals, id, rawAmount) {
  const goal = goals.find((item) => item.id === id);

  if (!goal) {
    return { ok: false, errors: { general: "Goal not found." }, goals };
  }

  const text = String(rawAmount ?? "").trim();
  const amount = Number(text);

  if (text === "" || !Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      errors: { amount: "Contribution must be a number greater than 0." },
      goals,
    };
  }

  const remaining = round(goal.target - goal.current);

  if (amount > remaining) {
    return {
      ok: false,
      errors: { amount: `Only $${remaining.toFixed(2)} left to reach this goal.` },
      goals,
    };
  }

  return {
    ok: true,
    errors: {},
    goals: goals.map((item) =>
      item.id === id ? { ...item, current: round(item.current + amount) } : item
    ),
  };
}

export function calculateGoalProgress(goal) {
  const remaining = round(goal.target - goal.current);
  const percent = Math.min(100, Math.floor((goal.current / goal.target) * 100));
  const completed = goal.current >= goal.target;

  return { remaining, percent, completed };
}
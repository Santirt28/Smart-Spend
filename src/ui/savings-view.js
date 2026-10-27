import { loadData, saveData } from "../storage.js";
import {
  addGoal,
  calculateGoalProgress,
  contributeToGoal,
  deleteGoal,
  updateGoal,
} from "../savings.js";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

let form;
let list;
let emptyMessage;
let message;
let submitButton;
let cancelButton;
let editingId = null;

function setMessage(text, isError = false) {
  message.textContent = text;
  message.className = isError ? "text-sm text-red-400" : "text-sm text-slate-300";
}

function persistGoals(goals) {
  const data = loadData();

  if (!saveData({ ...data, goals })) {
    setMessage("Could not save your changes.", true);
    return false;
  }

  return true;
}

function startEditing(goal) {
  editingId = goal.id;
  form.elements.namedItem("name").value = goal.name;
  form.elements.namedItem("target").value = goal.target;
  form.elements.namedItem("current").value = goal.current;
  submitButton.textContent = "Save changes";
  cancelButton.hidden = false;
  setMessage("Editing goal.");
}

function cancelEditing() {
  editingId = null;
  form.reset();
  submitButton.textContent = "Add goal";
  cancelButton.hidden = true;
}

function removeGoal(goal) {
  if (!window.confirm(`Delete the goal "${goal.name}"?`)) return;

  const { goals } = loadData();

  if (!persistGoals(deleteGoal(goals, goal.id))) return;

  if (editingId === goal.id) {
    cancelEditing();
  }

  setMessage("Goal deleted.");
  renderSavings();
}

function addContribution(goal, rawAmount) {
  const { goals } = loadData();
  const result = contributeToGoal(goals, goal.id, rawAmount);

  if (!result.ok) {
    setMessage(Object.values(result.errors).join(" "), true);
    return;
  }

  if (!persistGoals(result.goals)) return;

  setMessage("Contribution added.");
  renderSavings();
}

function createGoalCard(goal) {
  const progress = calculateGoalProgress(goal);

  const card = document.createElement("li");
  card.className = "rounded-xl border border-slate-800 bg-slate-900 p-4";

  const header = document.createElement("div");
  header.className = "flex items-center justify-between gap-3";

  const title = document.createElement("p");
  title.className = "font-semibold";
  title.textContent = goal.name;

  const actions = document.createElement("div");
  actions.className = "space-x-3 text-sm";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.className = "text-emerald-400 underline";
  editButton.setAttribute("aria-label", `Edit goal: ${goal.name}`);
  editButton.addEventListener("click", () => startEditing(goal));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "text-red-400 underline";
  deleteButton.setAttribute("aria-label", `Delete goal: ${goal.name}`);
  deleteButton.addEventListener("click", () => removeGoal(goal));

  actions.append(editButton, deleteButton);
  header.append(title, actions);

  const amounts = document.createElement("p");
  amounts.className = "mt-1 text-sm text-slate-400";
  amounts.textContent = `${currencyFormatter.format(goal.current)} of ${currencyFormatter.format(goal.target)} saved (${progress.percent}%)`;

  const track = document.createElement("div");
  track.className = "mt-3 h-2 overflow-hidden rounded-full bg-slate-800";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-label", `${goal.name} progress`);
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-valuenow", String(progress.percent));

  const bar = document.createElement("div");
  bar.className = "h-full bg-emerald-500";
  bar.style.width = `${progress.percent}%`;
  track.append(bar);

  const status = document.createElement("p");
  status.className = progress.completed
    ? "mt-2 text-sm text-emerald-400"
    : "mt-2 text-sm text-slate-400";
  status.textContent = progress.completed
    ? "Goal reached!"
    : `${currencyFormatter.format(progress.remaining)} to go`;

  card.append(header, amounts, track, status);

  if (!progress.completed) {
    const row = document.createElement("div");
    row.className = "mt-3 flex gap-2";

    const input = document.createElement("input");
    input.type = "number";
    input.name = "contribution";
    input.autocomplete = "off";
    input.step = "0.01";
    input.inputMode = "decimal";
    input.placeholder = "Contribution";
    input.className = "w-full rounded-lg border border-slate-700 bg-slate-950 p-2";
    input.setAttribute("aria-label", `Contribution for ${goal.name}`);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add";
    addButton.className =
      "rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400";
    addButton.addEventListener("click", () => addContribution(goal, input.value));

    row.append(input, addButton);
    card.append(row);
  }

  return card;
}

export function renderSavings() {
  const { goals } = loadData();

  list.replaceChildren(...goals.map(createGoalCard));
  emptyMessage.hidden = goals.length > 0;
}

export function initSavingsView() {
  form = document.querySelector("#goal-form");
  list = document.querySelector("#goals-list");
  emptyMessage = document.querySelector("#goals-empty");
  message = document.querySelector("#goal-message");
  submitButton = document.querySelector("#goal-submit");
  cancelButton = document.querySelector("#goal-cancel");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage("");

    const input = Object.fromEntries(new FormData(form).entries());
    const { goals } = loadData();
    const wasEditing = editingId !== null;

    const result = wasEditing
      ? updateGoal(goals, editingId, input)
      : addGoal(goals, input);

    if (!result.ok) {
      setMessage(Object.values(result.errors).join(" "), true);
      return;
    }

    if (!persistGoals(result.goals)) return;

    cancelEditing();
    setMessage(wasEditing ? "Goal updated." : "Goal saved.");
    renderSavings();
  });

  cancelButton.addEventListener("click", () => {
    cancelEditing();
    setMessage("");
  });

  renderSavings();
}
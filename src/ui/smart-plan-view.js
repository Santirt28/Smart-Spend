import {
  DEFAULT_ALLOCATION,
  calculateSmartPlan,
  sumPercents,
  validateSmartPlan,
} from "../smart-plan.js";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function initSmartPlanView() {
  const form = document.querySelector("#smart-plan-form");
  const fields = document.querySelector("#plan-percent-fields");
  const totalLabel = document.querySelector("#plan-percent-total");
  const message = document.querySelector("#plan-message");
  const results = document.querySelector("#plan-results");
  const resetButton = document.querySelector("#plan-reset");

  function readAllocation() {
    return DEFAULT_ALLOCATION.map((item) => {
      const text = form.elements[item.key].value.trim();
      return { ...item, percent: text === "" ? NaN : Number(text) };
    });
  }

  function updateTotal() {
    const allocation = readAllocation();

    if (allocation.some((item) => Number.isNaN(item.percent))) {
      totalLabel.textContent = "Total: enter every percentage";
      totalLabel.className = "text-sm text-amber-400";
      return;
    }

    const total = sumPercents(allocation);
    totalLabel.textContent = `Total: ${total}%`;
    totalLabel.className = total === 100 ? "text-sm text-emerald-400" : "text-sm text-red-400";
  }

  function buildPercentFields() {
    fields.replaceChildren();

    DEFAULT_ALLOCATION.forEach((item) => {
      const wrapper = document.createElement("div");

      const label = document.createElement("label");
      label.htmlFor = `percent-${item.key}`;
      label.className = "block text-sm text-slate-300";
      label.textContent = `${item.label} (%)`;

      const input = document.createElement("input");
      input.id = `percent-${item.key}`;
      input.name = item.key;
      input.type = "number";
      input.step = "0.01";
      input.min = "0";
      input.max = "100";
      input.inputMode = "decimal";
      input.value = item.percent;
      input.className = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3";
      input.addEventListener("input", updateTotal);

      wrapper.append(label, input);
      fields.append(wrapper);
    });

    updateTotal();
  }

  function createResultItem(part) {
    const item = document.createElement("li");
    item.className = "rounded-xl border border-slate-800 bg-slate-900 p-4";

    const row = document.createElement("div");
    row.className = "flex items-center justify-between gap-3";

    const name = document.createElement("p");
    name.className = "font-semibold";
    name.textContent = `${part.label} (${part.percent}%)`;

    const amount = document.createElement("p");
    amount.className = "font-semibold text-emerald-400";
    amount.textContent = currencyFormatter.format(part.amount);

    row.append(name, amount);

    const track = document.createElement("div");
    track.className = "mt-3 h-2 overflow-hidden rounded-full bg-slate-800";
    const bar = document.createElement("div");
    bar.className = "h-full bg-emerald-500";
    bar.style.width = `${part.percent}%`;
    track.append(bar);

    item.append(row, track);
    return item;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    const allocation = readAllocation();
    const result = validateSmartPlan(form.elements.income.value, allocation);

    if (!result.valid) {
      results.replaceChildren();
      message.textContent = Object.values(result.errors).join(" ");
      return;
    }

    const plan = calculateSmartPlan(result.income, allocation);
    results.replaceChildren(...plan.map(createResultItem));
  });

  resetButton.addEventListener("click", () => {
    buildPercentFields();
    results.replaceChildren();
    message.textContent = "";
  });

  buildPercentFields();
}
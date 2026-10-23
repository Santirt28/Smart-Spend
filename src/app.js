import { initTransactionsView } from "./ui/transactions-view.js";
import { renderDashboard } from "./ui/dashboard.js";
import { initBudgetsView, renderBudgets } from "./ui/budgets-view.js";

const sections = document.querySelectorAll("[data-section]");
const navButtons = document.querySelectorAll("[data-view]");

const ACTIVE_CLASSES = ["text-emerald-400", "bg-slate-800"];
const INACTIVE_CLASS = "text-slate-400";

function showView(viewName) {
  if (viewName === "dashboard") {
    renderDashboard();
  }

  if (viewName === "budgets") {
    renderBudgets();
  }

  sections.forEach((section) => {
    section.hidden = section.dataset.section !== viewName;
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.view === viewName;

    ACTIVE_CLASSES.forEach((className) => {
      button.classList.toggle(className, isActive);
    });

    button.classList.toggle(INACTIVE_CLASS, !isActive);

    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

initTransactionsView();
initBudgetsView();
showView("dashboard");
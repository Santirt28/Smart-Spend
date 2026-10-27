import { initTransactionsView } from "./ui/transactions-view.js";
import { renderDashboard } from "./ui/dashboard.js";
import { initBudgetsView, renderBudgets } from "./ui/budgets-view.js";
import { initSavingsView, renderSavings } from "./ui/savings-view.js";
import { initSmartPlanView } from "./ui/smart-plan-view.js";

const sections = document.querySelectorAll("[data-section]");
const navButtons = document.querySelectorAll("[data-view]");

const ACTIVE_CLASSES = ["text-emerald-400", "bg-slate-800"];
const INACTIVE_CLASS = "text-slate-400";
const VIEW_KEY = "spend-smart-active-view";
const DEFAULT_VIEW = "dashboard";

function showView(viewName) {
  const viewExists = Array.from(sections).some(
    (section) => section.dataset.section === viewName
  );
  const activeView = viewExists ? viewName : DEFAULT_VIEW;

  sections.forEach((section) => {
    section.hidden = section.dataset.section !== activeView;
  });

  if (activeView === "dashboard") {
    renderDashboard();
  }

  if (activeView === "budgets") {
    renderBudgets();
  }

  if (activeView === "savings") {
    renderSavings();
  }

  navButtons.forEach((button) => {
    const isActive = button.dataset.view === activeView;

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

  sessionStorage.setItem(VIEW_KEY, activeView);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

initTransactionsView();
initBudgetsView();
initSavingsView();
initSmartPlanView();

showView(sessionStorage.getItem(VIEW_KEY) || DEFAULT_VIEW);
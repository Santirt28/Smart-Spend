const STORAGE_KEY = "spend-smart-data";
const CURRENT_VERSION = 1;

function createEmptyData() {
  return {
    version: CURRENT_VERSION,
    transactions: [],
    budgets: [],
    goals: [],
  };
}

function isValidData(data) {
  return (
    typeof data === "object" &&
    data !== null &&
    data.version === CURRENT_VERSION &&
    Array.isArray(data.transactions) &&
    Array.isArray(data.budgets) &&
    Array.isArray(data.goals)
  );
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return createEmptyData();
    }
    const parsed = JSON.parse(raw);
    return isValidData(parsed) ? parsed : createEmptyData();
  } catch (error) {
    console.error("Could not read saved data:", error);
    return createEmptyData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Could not save data:", error);
    return false;
  }
}

export function resetData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Could not reset data:", error);
    return false;
  }
}
# Spend Smart

Spend Smart is a responsive personal finance web app for tracking income and expenses, setting monthly budgets, following savings goals, and planning how to split an income amount.

**Live demo:** https://santirt28.github.io/Spend-Smart/
**Repository:** https://github.com/Santirt28/Smart-Spend

## Purpose

Many people want a simple way to see where their money goes without creating an account or sharing data with a third party. Spend Smart keeps everything in the user's own browser and focuses on four questions:

- How much have I earned and spent?
- Am I staying inside my monthly budgets?
- How close am I to my savings goals?
- How could I divide my income?

## Target users

Students and young professionals who want a quick, mobile-friendly tool to organize their personal finances.

## Features

- **Dashboard:** income, expenses, balance, this month's summary, recent transactions, and an expense chart (Chart.js).
- **Transactions:** add, edit, and delete transactions, with search, type filter, and sorting by date or amount.
- **Budgets:** monthly limit per expense category with a progress bar and warnings when you are close to or over the limit.
- **Savings Goals:** create, edit, and delete goals, add contributions, and track progress.
- **Smart Plan:** enter an income amount and adjust percentages (default 50% needs, 25% investments, 15% emergency savings, 10% other). Percentages must total 100%.
- **Validation and feedback:** every form validates input and shows clear messages.
- **Persistence:** all data is saved in `localStorage` and survives page reloads.
- **Responsive design:** sidebar navigation on desktop and a bottom navigation bar on mobile (mobile-first layout).

## Technologies

| Markup | HTML5 (semantic elements, ARIA attributes) |
| Logic | Vanilla JavaScript with ES modules |
| Styling | Tailwind CSS, compiled locally with the Tailwind CLI |
| Charts | Chart.js (external library) |
| Storage | Browser `localStorage` |
| Testing | Node.js built-in test runner (`node --test`) |
| Version control | Git and GitHub (feature branches and pull requests) |
| Hosting | GitHub Pages |

## Project structure

```
spend-smart/
├── index.html
├── package.json
├── dist/output.css          Compiled Tailwind stylesheet
├── src/
│   ├── app.js               Entry point and navigation
│   ├── storage.js           Only module that touches localStorage
│   ├── validation.js        Transaction validation rules
│   ├── transactions.js      Transaction logic and totals (no DOM)
│   ├── budgets.js           Budget logic (no DOM)
│   ├── savings.js           Savings goals logic (no DOM)
│   ├── smart-plan.js        Income allocation logic (no DOM)
│   ├── input.css            Tailwind source file
│   └── ui/                  Modules that render screens and handle events
└── tests/                   Unit and integration tests
```


## Run locally

1. Install [Node.js](https://nodejs.org/) (version 18 or later).
2. Clone the repository and open its folder in a terminal:

   ```bash
   git clone https://github.com/Santirt28/Smart-Spend.git
   cd Smart-Spend
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Build the stylesheet:

   ```bash
   npm run build:css
   ```

5. Open `index.html` with a local development server, such as the VS Code **Live Server** extension. A server is required because the app uses ES modules.

To rebuild the stylesheet automatically while editing:

```bash
npm run watch:css
```

Press **Ctrl + C** to stop the watch process.

## Run the tests

```bash
npm test
```

The suite covers storage, transactions, budgets, and the Smart Plan calculation (unit tests), plus an integration test that saves transactions to storage, loads them back, and checks the dashboard totals.

## How to use

1. Open **Transactions** and add an income or an expense.
2. Open **Budgets** and set a monthly limit for a category. Spending for the current month is compared against it.
3. Open **Savings Goals**, create a goal, and add contributions.
4. Open **Smart Plan**, enter an income amount, and review the suggested split.
5. Return to the **Dashboard** to see totals and the expense chart update.

## Known issues and limitations

- Data is stored only in the current browser's `localStorage`. It does not sync across devices and is lost if the browser data is cleared.
- There is no backend and no secure authentication. Spend Smart does not claim to protect data with accounts or passwords.
- Chart.js is loaded from a CDN, so the chart needs an internet connection.
- Amounts are shown in US dollars only.
- Smart Plan results are customizable suggestions, not professional financial advice.

## Future improvements

- Installable Progressive Web App with offline support.
- Optional demo accounts with separated profiles.
- Export and import of data as JSON or CSV.
- Recurring transactions and multi-currency support.
- Cloud sync with secure authentication.

## Development process

The project was built in phases, each on its own feature branch and merged through a pull request: base layout, storage, transaction logic, transactions screen, dashboard, budgets, savings goals, Smart Plan, charts, tests, and deployment.

## Author

Your Name — JavaScript course final project (2026).
GitHub: [@Santirt28](https://github.com/Santirt28)
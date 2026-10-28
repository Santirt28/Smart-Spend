# Spend Smart

Spend Smart is a responsive personal finance app for tracking income, expenses, budgets, and savings goals. It was created as a JavaScript course project.

## Purpose

Spend Smart helps users understand their spending, monitor monthly budgets, track savings goals, and plan how to allocate income.

## Features

- Dashboard with income, expenses, balance, recent transactions, and a monthly expense chart.
- Add, edit, delete, search, filter, and sort transactions.
- Create budgets by category and track spending against each limit.
- Create savings goals, add contributions, and view progress.
- Calculate suggested income allocations with customizable percentages.
- Save data in the current browser using localStorage.
- Responsive navigation and layouts for desktop and mobile.

## Technologies

- HTML
- JavaScript 
- Tailwind CSS, compiled locally with the Tailwind CLI
- Chart.js
- Node.js 

## Run locally

1. Install [Node.js](https://nodejs.org/).
2. Clone [this repository](https://github.com/Santirt28/Smart-Spend) and open its folder in a terminal.
3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Build the Tailwind stylesheet:

   ```bash
   npm run build:css
   ```

5. Open `index.html` using a local development server, such as the VS Code Live Server extension.

To rebuild the stylesheet automatically while editing, run:

```bash
npm run watch:css
```

Press **Ctrl + C** to stop the watch process.

## Run tests

```bash
npm test
```

## Data and limitations

- Data is stored in localStorage in the current browser and does not sync across devices.
- The app does not provide secure authentication or a backend.
- Smart Plan allocations are customizable suggestions, not professional financial advice.
- Chart.js is loaded from an external CDN and needs an internet connection.

## Future improvements

- Deploy the app with GitHub Pages.
- Add PWA installation and offline support for mobile devices.
- Consider secure authentication and cloud sync if the project scope allows them.
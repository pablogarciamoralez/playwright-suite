# Automation Suite - Automation Exercise (Playwright & TypeScript)

This repository contains a comprehensive automation suite for functional **User Interface (UI)** and **Application Programming Interface (API)** testing, developed using **Playwright** with **TypeScript**. The suite is designed to validate the business flows of the practice website [Automation Exercise](https://automationexercise.com/).

---

## Technologies & Architecture

### 1. Technology Stack
* **Core**: Node.js & TypeScript
* **Testing Framework**: Playwright Test
* **Language**: TypeScript for strict typing and autocompletion during Page Object and Spec development.

### 2. Page Object Model (POM)
To ensure maintainability and code reuse, the project implements the **Page Object Model** pattern.
* **Base Page (`BasePage.page.ts`)**: Base class from which all page objects inherit. It provides wrappers for implicit waits, interactive clicks, and shared navigation helpers.
* **Component Pages**: Each page of the website has its exclusive representation inside the `pages/` directory (e.g., `HomePage.page.ts`, `LoginPage.page.ts`, `CartPage.page.ts`), encapsulating selectors and DOM interaction methods.

### 3. Data-Driven Testing (DDT)
Input data for the test flows is completely decoupled from the test source code:
* **Centralized Data File (`data/testData.json`)**: Contains lists of valid/invalid users, product search keywords, category and brand navigation parameters, and billing details.
* **Dynamic Parameterization**: Tests consume data from the JSON file at runtime. For example, category and brand navigation tests execute dynamically based on the map defined in the data file.

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── playwright.yml         # CI/CD Pipeline (GitHub Actions)
├── data/
│   ├── testData.json              # Input test data (DDT)
│   └── upload.txt                 # Sample text file used for File Upload testing
├── pages/                         # Page Objects
│   ├── BasePage.page.ts           # Base class with interaction and wait utilities
│   ├── HomePage.page.ts           # Locators and methods for the landing page
│   ├── LoginPage.page.ts          # Registration, login, and account deletion flows
│   ├── ProductsPage.page.ts       # Product search and listings page
│   ├── ProductDetailsPage.page.ts # Product details and product reviews submission
│   ├── CartPage.page.ts           # Cart validation and quantities checking
│   ├── CheckoutPage.page.ts       # Address details and billing review verification
│   ├── PaymentPage.page.ts        # Payment processing and invoice PDF downloading
│   ├── ContactUsPage.page.ts      # Contact support form submission with attachments
│   └── TestCasesPage.page.ts      # Test cases list page
├── tests/                         # Test Suites (Specs)
│   ├── auth.spec.ts               # Registration, Login, Logout, and authentication errors
│   ├── cart.spec.ts               # Cart addition, deletion, and quantity checks
│   ├── checkout.spec.ts           # Checkout flows, billing details, and invoice downloads
│   ├── contact.spec.ts            # Contact Us form submission and file uploads
│   ├── products.spec.ts           # Product catalog, brand/category sidebar navigation, and reviews
│   ├── subscription.spec.ts       # Newsletter subscription validation from footer and cart
│   ├── ui.spec.ts                 # Page scrolling behaviors
│   └── api.spec.ts                # Coverage of 14 REST API endpoints (GET, POST, PUT, DELETE)
├── playwright.config.ts           # Global Playwright configuration file
├── package.json                   # Project scripts and dependencies
└── README.md                      # Project documentation
```

---

## 💻 Installation & Setup

Follow these steps to clone and run the project locally:

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended).

### 2. Clone the Project & Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### 3. Install Playwright Browsers
Download the required browser binaries and OS dependencies:
```bash
npx playwright install --with-deps
```

---

## Run Commands

We have configured convenient script shortcuts in `package.json`:

### Global Executions
| Command | Action |
| :--- | :--- |
| `npm run test` | Runs **all** tests (UI and API) in headless mode. |
| `npm run test:ui` | Runs only the **User Interface (UI)** test specs. |
| `npm run test:api` | Runs only the **API** test specs. |
| `npm run report` | Opens the local interactive Playwright HTML report of the last run. |

### Modular Executions (Individual Suites)
If you want to run a specific test suite file, you can use these dedicated shortcuts:
* **Authentication & Registration**: `npm run test:auth` (Runs `auth.spec.ts`)
* **Cart Operations**: `npm run test:cart` (Runs `cart.spec.ts`)
* **Checkout & Orders**: `npm run test:checkout` (Runs `checkout.spec.ts`)
* **Contact & Information**: `npm run test:contact` (Runs `contact.spec.ts`)
* **Products Catalog**: `npm run test:products` (Runs `products.spec.ts`)
* **Newsletter Subscription**: `npm run test:subscription` (Runs `subscription.spec.ts`)
* **UI Interactions**: `npm run test:ui-interactions` (Runs `ui.spec.ts`)

### Other Useful Playwright Commands
* **Run in Interactive UI Mode**:
  ```bash
  npx playwright test --ui
  ```
* **Run a Specific Test by Title**:
  ```bash
  npx playwright test -g "Register User"
  ```

---

## Continuous Integration (CI/CD)

The **GitHub Actions** configuration at `.github/workflows/playwright.yml` automates code validation and publishes test reports:

### Triggers
* **Automatic**: Executes on every `push` or `pull_request` targeting the `main` or `master` branches.
* **Manual**: Can be triggered on demand using the **"Run workflow"** button in the Actions tab on GitHub.

### Workflow Steps (`test` job)
1. Checks out the repository code using `actions/checkout@v4`.
2. Sets up a Node.js v18 environment and configures NPM caching to speed up subsequent runs.
3. Installs project dependencies (`npm ci` or `npm install`).
4. Installs Playwright browsers and dependencies.
5. Runs the entire suite of tests (`npx playwright test`).
6. **Publishing Reports to GitHub Pages**:
   * Once the tests complete (regardless of whether they pass or fail), the Playwright HTML report folder is uploaded as a build artifact.
   * Then, the report is deployed to the repository's `gh-pages` branch, automatically updating the static GitHub Pages site for online viewing.

### GitHub Pages Setup Instructions
To successfully host and view the Playwright HTML reports on GitHub Pages, configure the following settings in your GitHub Repository UI:

1. **Enable Workflow Write Permissions**:
   * Go to **Settings > Actions > General**.
   * Scroll down to **Workflow permissions**.
   * Select **"Read and write permissions"** (required for the CI runner to publish/push the test report to the `gh-pages` branch).
   * Click **Save**.

2. **Configure GitHub Pages Hosting Source**:
   * Run the workflow at least once to automatically create and publish the `gh-pages` branch.
   * Go to **Settings > Pages**.
   * Under **Build and deployment > Source**, select **"Deploy from a branch"**.
   * Under **Branch**, select `gh-pages` and `/ (root)`.
   * Click **Save**.
   * GitHub will launch a separate deploy workflow, and your Playwright HTML reports will be live at `https://<your-username>.github.io/<your-repo-name>/`.


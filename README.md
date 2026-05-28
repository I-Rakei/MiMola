# 🇲🇿 MiMola (My Money) — Household Spending & Budget Tracker

> **"MiMola"** (from *Mola*, the popular Mozambican slang for money) is a premium household spending tracker, budget planner, and inventory manager. It is proudly **made by a Mozambican developer** with the mission of helping families organize their household finances, combat inflation by tracking item price histories, and build a secure financial future.

---

## 🌟 The Mission
In Mozambique and all around the globe, families face the daily challenge of managing household budgets amidst fluctuating item prices and rising inflation. 
**MiMola** was created to address this directly:
- **Empowerment:** Giving families clear insights into exactly where their money is going.
- **Inflation Monitoring:** Tracking the actual price increases (hikes) of essential household commodities over time.
- **Budget Discipline:** Defining active spending categories with monthly limits to avoid overspending.
- **Bilingual Accessibility:** Built natively with both **English** and **Português (Moçambique)** interface support.

---

## 🚀 Key Features

*   **📊 Dynamic Financial Dashboard:** Check income received, monthly household spending, net balance, and end-of-month projected balance at a single glance.
*   **🛒 Inventory & Items Manager:** Register your common household items (e.g., *Arroz 10kg*, *Pão*, *Óleo*), keep track of their standard prices, and easily log new purchases.
*   **📈 Price Hike Tracker:** Keep a detailed, historical record of inflation for individual items. Log price hikes and visualize how commodity prices change over time.
*   **🏷️ Custom Budget Groups:** Categorize items into custom groups (like *Groceries*, *Utilities*, *Schooling*) and set monthly target limits with active warnings when limits are approached.
*   **📒 Comprehensive Digital Ledger:** A complete household bookkeeping ledger showing all logged expenses and income, searchable and filterable.
*   **📅 Interactive Calendar & Reports:** Visualize your expenses on a day-by-day calendar. View detailed monthly summaries and breakdowns, and export your financial reports directly to **PDF** or **Excel**.
*   **🌓 Sleek Customization:** Light and dark mode support, custom primary color branding, and adjustable app configurations.
*   **💻 Native Desktop Experience:** Wrapped inside a lightweight, highly responsive **Electron** container for cross-platform desktop use (Windows, macOS, Linux).

---

## 📁 Project Structure

The project is structured as a modern React web application powered by Vite, integrated seamlessly with Electron for desktop execution:

```
MiMola/
├── electron/              # Electron main process and dev/build runner configuration
│   ├── dev.js             # Development desktop wrapper script
│   └── main.js            # Electron main process logic (window setup, menu)
├── public/                # Public static assets (app logos and icons)
├── src/                   # React frontend application
│   ├── components/        # UI components (Welcome screen, Dashboard, Modals, Tabs)
│   ├── controllers/       # Controller logic and helper handlers
│   ├── utils/             # Local database (IndexedDB) and i18n translation systems
│   ├── App.css            # Stylesheets and visual theme variables
│   ├── App.jsx            # Main React layout and tab navigation router
│   ├── index.css          # Design system, variables, and typography definitions
│   └── main.jsx           # React app mount entrypoint
├── package.json           # Scripts, dependencies, and desktop builder config
└── vite.config.js         # Vite configuration with React support
```

---

## 🛠️ Installation & Running Guide

Ensure you have **Node.js** installed on your computer.

### 1. Clone or Download the Repository
Open your terminal in the workspace directory and navigate to the app directory:
```bash
cd MiMola
```

### 2. Install Dependencies
Run the following command to download and install all necessary packages (Vite, React, Bootstrap, and Electron):
```bash
npm install
```

### 3. Run in Development Mode
You can run the application in two different environments depending on your workflow:

#### Web App Version (Vite Dev Server)
To run and view the app in your local web browser:
```bash
npm run dev
```
*The terminal will output a local URL (e.g., `http://localhost:5173`) where you can access the app.*

#### Desktop App Version (Electron Wrapper)
To launch the native desktop application window:
```bash
npm run dev:electron
```
*This starts both the Vite server and an Electron window running the app natively.*

---

## 📦 Building for Production

### Build the Web Bundle
To build a highly optimized production bundle of the React web app:
```bash
npm run build
```
*Outputs static files into the `dist/` directory.*

### Build the Native Desktop Installer (Windows)
To pack the application into a distribution installer executable for Windows:
```bash
npm run build:electron
```
*Outputs standard Windows installers (`.exe`) into the `dist-electron/` directory.*

---

## 🌍 Supported Languages (Idiomas Suportados)
- **English** 🇬🇧
- **Português (Moçambique)** 🇲🇿

*You can easily toggle between languages during onboarding or at any time in the **Settings (Definições)** tab.*

---

## 🎨 Built With
- **React 19** & **Vite 8** — Fast frontend rendering and building.
- **Electron 42** & **Electron Builder** — Cross-platform desktop native wrapper.
- **Bootstrap 5 & Icons** — Premium responsive styling and interactive elements.
- **IndexedDB** — Local browser and desktop storage for private, offline-first data retention (your financial data never leaves your computer!).

---

> *"De Moçambique para o mundo — a ajudar famílias a gerir o seu mola com sabedoria."*  
> *(From Mozambique to the world — helping families manage their cash with wisdom.)*

# 📱 Montra — Personal Finance Manager & Budget Tracker

Montra is a premium, feature-rich, and high-performance **React Native** application designed to help users track expenses, manage budgets, and gain complete control over their financial health. Powered by modern architecture, Montra offers elegant visualizations, real-time customer support, strict offline capabilities, and state-of-the-art native security integrations.

---

## ✨ Core Features

### 📊 1. Elegant Dashboard & Financial Analytics
*   **Balance Overview:** Real-time visibility into your total account balance, monthly income, and monthly expense metrics.
*   **Month-over-Month Filters:** Effortlessly navigate through historical months using a modern date picker wheel.
*   **Spend Frequency Chart:** Fully interactive bar charts (powered by `echarts` and `react-native-gifted-charts`) that break down weekly/monthly expenditures.
*   **Interactive Bottom Sheet Filter:** Filter recent transactions dynamically directly from your dashboard.

### 📱 2. Interactive "Fin-Story" (Instagram-style Recap)
*   **Visual Monthly Recap:** View your financial summary inside WhatsApp/Instagram-style story slides.
*   **Interactive Gestures:** Includes automatic progress indicators, long-press to pause, and tap-left/right to navigate between stories.
*   **Interactive Cards:** Visually highlights your biggest monthly expense category, highest income wallet, exceeded budgets, and displays motivational financial quotes from a custom API.
*   **Pull-to-Dismiss:** A smooth, natural swipe-down gesture (built with `PanResponder`) to close the story mode.

### 💸 3. Smart Transaction & Transfer Manager
*   **Flexible Logging:** Add, edit, or delete **Expenses**, **Incomes**, and **Wallet-to-Wallet Transfers**.
*   **Category Customization:** Assign transactions to categories (Shopping, Food, Transportation, Salary, Rent) or dynamically create custom category tags on the fly.
*   **Recurring Transactions:** Schedule future transactions with repeat frequencies (Daily, Weekly, Monthly, Yearly) along with custom execution limits.

### 📎 4. Attachment & Receipt Uploader
*   **File Types Supported:** Attach PDF, Excel, Word, or Image receipts to transactions via a modern picker.
*   **Manage Attachments:** Upload files with native progress loaders and remove/update attachments dynamically with immediate synchronization.

### 🎯 5. Category Budgets & Limit Alerts
*   **Custom Category Limits:** Establish monthly category-based budget caps.
*   **Smart Warnings:** Enable notifications that alert you when your spending exceeds a specific percentage threshold (e.g., 80%) of your budget.
*   **Budget Progress Indicators:** Track how much budget you have consumed at a glance with clean progress sliders.

### 💬 6. WebSocket Live Support Chat
*   **Real-time Support:** Chat directly with support staff using a lightweight WebSocket client.
*   **Swipe-to-Reply:** A native, interactive swipe-right gesture on messages to quote/reply to them.
*   **Message Interactions:** Long-press to edit or delete messages in-flight.
*   **Read Status & Typing Indicators:** Displays checkmarks for read status (single tick/double tick) and animated typing bubbles.
*   **Smart Date Separation:** Automatically splits chat logs with clean date headers.

### 🔒 7. Advanced Security & Privacy Lock
*   **Biometrics Integration:** FaceID and TouchID authentication (via `react-native-biometrics`) to unlock the app securely.
*   **Passcode/PIN Lock:** Alternative PIN lock fallback.
*   **Hard Exit:** Custom security module that executes a hard native app termination if unauthorized access is detected.

### 🌐 8. Global Settings & Localization
*   **Multi-Currency Support:** Choose your primary currency formatting and symbols (USD, INR, EUR, etc.).
*   **20+ Languages Localized:** Fully translated codebase using `i18next` for English, Spanish, German, French, Hindi, Tamil, Russian, Japanese, Arabic, and more.
*   **Profile Editing:** Customize profile details, change passwords, and upload profile pictures.

### 📁 9. Financial Data Exporter
*   **Format Options:** Export transaction ledger data into **CSV** or **Excel (.xlsx)** spreadsheets.
*   **Date Ranges:** Define export scope (30 days, 60 days, 6 months, 1 year, lifetime).
*   **File Management:** Automatically writes files to the device's default downloads directory.

### 📡 10. Connection Resilience & Alerts
*   **Network Detection:** Automatic offline detection using NetInfo.
*   **Sticky Banners:** Displays a non-intrusive red banner at the top of the app when the connection is interrupted.

---

## 🛠 Tech Stack

*   **Core Framework:** [React Native v0.82](https://reactnative.dev/) & [React v19](https://react.dev/)
*   **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & `react-redux`
*   **Navigation:** [React Navigation v7](https://reactnavigation.org/) (Bottom Tabs & Native Stack Navigator)
*   **Database & Networking:** [Axios](https://axios-http.com/) (with JWT authentication interceptors and auto-retry policies)
*   **Forms & Validation:** [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup)
*   **Graphics & Animation:** [Lottie React Native](https://github.com/lottie-react-native/lottie-react-native) & [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
*   **Localization:** `i18next` & `react-i18next`
*   **Security:** `react-native-biometrics` & `react-native-encrypted-storage`
*   **File Handling:** `react-native-blob-util` & `@react-native-documents/picker`

---

## 🏗 Project Architecture

Below is the directory structure of the application source code:

```text
src/
├── assets/                  # SVG icons, animations (Lottie), and images
├── components/
│   ├── auth/                # Signin, Signup, ForgotPassword, OTP, and GetStarted screens
│   ├── budget/              # Budget details and configurations
│   ├── charts/              # Dashboard charts (Bar Chart, Pie Chart)
│   ├── financeReport/       # Finance stories and monthly report widgets
│   ├── profile/             # Settings, Chat Support, Security, Languages, and Exports
│   ├── setUpScreen/         # PIN initialization, Account setup, and Onboarding
│   └── transactions/        # Common Add & Details panels for Income, Expenses, and Transfers
├── hooks/                   # Custom hooks (e.g., useSocket, useNotificationChannels)
├── lib/                     # Global helpers, shortcuts, and utility functions
├── localization/            # Translation dictionary folders (ar, de, en, es, hi, ta, etc.)
├── navigations/             # AuthStack, SetupStack, BottomTabNavigator, and AppStack config
├── services/                # Axios interceptors, permission checks, and API services
├── shared/                  # Common UI components (Input, Button, RBSheet, Header)
├── store/                   # Redux toolkit store configuration & slices
├── theme/                   # Style definitions and theme presets
└── types/                   # TypeScript global declarations
```

---

## ⚡ Custom Native Turbo Modules

Montra implements three custom native modules written specifically for native platform execution:
1.  **`NativeShortcut`:** Bridges Android Quick Actions and iOS Launcher Shortcuts. Pressing down on the app icon on the home screen allows users to quickly jump into "Add Expense" or "Add Income" screens.
2.  **`NativeRestart`:** Restarts the native activity of the application in one function call.
3.  **`NativeHardExit`:** Terminates the application thread instantly on Android/iOS (highly useful for security verification failures).

---

## 🚀 Getting Started

Ensure you have configured your development system according to the [React Native Environment Setup Guide](https://reactnative.dev/docs/set-up-your-environment).

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Kathir2002/montra.git
cd montra
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and specify your API base URLs:
```env
API_URL=https://your-api-domain.com/
```

### 3. iOS Setup (macOS only)
Install CocoaPods dependencies:
```bash
bundle install
bundle exec pod install
```

### 4. Running the Dev Server (Metro)
Start Metro:
```bash
npm start
```

### 5. Build and Run the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

---

## 📦 Building a Release APK (Android)

To bundle the application and generate a release APK, run the following command:
```bash
npm run apk
```
This script runs a Gradle clean and builds the production bundle at `android/app/build/outputs/apk/release/app-release.apk`.
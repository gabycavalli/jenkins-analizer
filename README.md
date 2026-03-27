# Jenkins Log Analyzer

A modern, fast tool (built with Web technologies and Electron) to analyze extracted Jenkins logs and get a visual report of the called endpoints, automatically detecting critical failures and displaying their severity.

Since everything is processed 100% locally, sensitive logs never leave your computer.

---

## 🚀 Method 1: Quick Browser Usage (Edge / Chrome)
Since the application is designed with independent modern web technologies (as a Single Page Application), it is not strictly necessary to compile it to use it.

1. Open the project folder in Windows File Explorer: `C:\Users\gabri\repos\jenkins-reader`
2. **Double-click** the `index.html` file.
3. It will open in your default browser (e.g., Microsoft Edge or Chrome).
4. Drag and drop your text file (`Build#1999...txt`) into the scan area to process it immediately.

---

## 💻 Method 2: Native Desktop App Usage (Development Mode)
If you prefer to view it in its own isolated window without browser tabs using **Electron**.

**Prerequisites:**
- Have [Node.js](https://nodejs.org/) installed on your PC.

1. Open your terminal (PowerShell or CMD) and navigate to the project folder:
   ```bash
   cd c:\Users\gabri\repos\jenkins-reader
   ```
2. *(First time only)* Make sure the dependencies are installed:
   ```bash
   npm install
   ```
3. Run the desktop application:
   ```bash
   npm start
   ```

---

## 📦 Packaging: Build into an Executable (`.exe`)
You can package the application to send it to your teammates as a native `.exe` file. They won't need to install Node or know how to use the console.

1. Open the console at `c:\Users\gabri\repos\jenkins-reader`.
2. Run the builder:
   ```bash
   npm run build
   ```
3. Wait a few minutes for **electron-builder** to download the necessary binaries (only on the first build) and generate your program.
4. The final program will be placed in a new subfolder called `dist` or `out` inside the directory. Distribute the generated file!

---

## 🎨 Additional Features
- **Visual Dashboard**: Summary of successful requests (200), warnings (400), and server errors (500+).
- **Real-Time Filters**: Ability to search by status or URL segment with immediate matching.
- **Glassmorphic Dark Mode**: Eye-friendly UI with precise severity colors.

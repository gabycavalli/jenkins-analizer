const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

// Disable security warnings in dev if needed, or simply let Electron do its thing.
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'), // Optionally add icon later
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true, // Required for secure preload or direct fetch if needed, but we read via HTML5 File API!
        },
        backgroundColor: '#0f172a', // Tailwind slate-900
        show: false // Don't show until ready-to-show
    });

    // Remove the default application menubar for a sleeker look
    Menu.setApplicationMenu(null);

    // Load the index.html of the app.
    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

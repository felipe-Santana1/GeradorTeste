const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        resizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        title: 'Gerador QRCode PIX',
        backgroundColor: '#002f57'
    });

    mainWindow.loadFile('index.html');

    // Abre DevTools em desenvolvimento (comentar em produção)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

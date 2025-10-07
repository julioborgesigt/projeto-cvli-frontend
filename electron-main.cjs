// electron-main.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Verifica se estamos em ambiente de desenvolvimento ou produção
// app.isPackaged será 'true' quando o aplicativo for empacotado pelo electron-builder
const isDev = !app.isPackaged;

// URL do servidor Vite (apenas para desenvolvimento)
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // É uma boa prática de segurança manter isso desativado se não estiver usando preload
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (isDev) {
    // Em desenvolvimento, carrega a URL do servidor Vite e abre o DevTools
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // Em produção, carrega o arquivo index.html do build do Vite
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
   
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ethers } from 'ethers';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: preloadPath
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle Ethereum requests from renderer
  ipcMain.handle('ethereum-request', async (_, args: { method: string; params?: any[] }) => {
    try {
      // Create a new provider for each request
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      return await provider.send(args.method, args.params || []);
    } catch (error) {
      console.error('Error handling Ethereum request:', error);
      throw error;
    }
  });

  // Forward Ethereum events to renderer
  ipcMain.on('ethereum-accountsChanged', (_, accounts: string[]) => {
    mainWindow?.webContents.send('ethereum-accountsChanged', accounts);
  });
  ipcMain.on('ethereum-chainChanged', (_, chainId: string) => {
    mainWindow?.webContents.send('ethereum-chainChanged', chainId);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 
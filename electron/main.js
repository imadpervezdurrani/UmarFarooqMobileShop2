import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import expressApp from '../mobile-shop-backend/app.js';
import { connectDB } from '../mobile-shop-backend/config/db.js';

let mainWindow = null;
let expressServer = null;
const BACKEND_PORT = process.env.PORT || 3000;
const IS_DEV = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Ensure single app instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Function to check if backend server is already running
function isBackendRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Start embedded backend Express server inside Electron
async function startBackend() {
  const running = await isBackendRunning(BACKEND_PORT);
  if (running) {
    console.log(`[Electron Main] Backend server already running on port ${BACKEND_PORT}.`);
    return;
  }

  try {
    connectDB();
    expressServer = expressApp.listen(BACKEND_PORT, () => {
      console.log(`[Electron Main] Embedded Express server running on port ${BACKEND_PORT}`);
    });
  } catch (err) {
    console.error('[Electron Main] Error starting embedded backend:', err);
  }
}

// Stop backend on app exit
function stopBackend() {
  if (expressServer) {
    console.log('[Electron Main] Closing embedded backend server...');
    expressServer.close();
    expressServer = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Umar Farooq Mobile Zone - Shop Management System',
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  mainWindow.maximize();
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (IS_DEV) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  stopBackend();
});

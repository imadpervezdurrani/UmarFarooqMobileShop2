import { contextBridge, ipcRenderer } from 'electron';

// Expose safe desktop APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
});

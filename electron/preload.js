const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    get: () => ipcRenderer.invoke('db-get'),
    save: (data) => ipcRenderer.invoke('db-save', data)
  },
  exportCSV: (csvContent, filename) => ipcRenderer.invoke('export-csv', csvContent, filename),
  exportPDF: (filename) => ipcRenderer.invoke('export-pdf', filename)
});

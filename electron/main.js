import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
const dbPath = path.join(app.getPath('userData'), 'mimola-db.json');
const backupPath = path.join(app.getPath('userData'), 'mimola-db.backup.json');

// Initialize database with default template if not exists
function initDatabase() {
  if (!fs.existsSync(dbPath)) {
    const defaultData = { profile: {}, transactions: [], items: [], _version: 1 };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
  } else {
    // Create a backup of the existing DB on every startup
    try {
      fs.copyFileSync(dbPath, backupPath);
    } catch (e) {
      console.error('Failed to create startup backup:', e);
    }
  }
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 880,
    minWidth: 900,
    minHeight: 700,
    title: 'MiMola - Spending & Income Tracker',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  // Load production file or development server
  if (process.env.NODE_ENV === 'development') {
    const portArg = process.argv.find(arg => arg.startsWith('--port='));
    const port = portArg ? portArg.split('=')[1] : '5173';
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Database Handlers
ipcMain.handle('db-get', () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error reading local database:', error);
    // Attempt to recover from backup
    try {
      if (fs.existsSync(backupPath)) {
        console.warn('Recovering from backup file...');
        const backupData = fs.readFileSync(backupPath, 'utf-8');
        const parsed = JSON.parse(backupData);
        // Restore the main file from backup
        fs.writeFileSync(dbPath, backupData, 'utf-8');
        return parsed;
      }
    } catch (backupError) {
      console.error('Backup recovery also failed:', backupError);
    }
    return { profile: undefined, transactions: [], items: [] };
  }
});

ipcMain.handle('db-save', (event, data) => {
  try {
    // Atomic write: write to temp file, then rename
    const tmpPath = dbPath + '.tmp';
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(tmpPath, jsonStr, 'utf-8');
    fs.renameSync(tmpPath, dbPath);
    return { success: true };
  } catch (error) {
    console.error('Error writing local database:', error);
    // Fallback: try direct write if rename fails (e.g. cross-device)
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      return { success: true };
    } catch (fallbackError) {
      console.error('Fallback write also failed:', fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }
});

// IPC Export Handlers
ipcMain.handle('export-csv', (event, csvContent, filename) => {
  const filePath = dialog.showSaveDialogSync(mainWindow, {
    title: 'Export Excel/CSV Report',
    defaultPath: path.join(app.getPath('documents'), filename || 'mimola-export.csv'),
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (filePath) {
    try {
      fs.writeFileSync(filePath, csvContent, 'utf-8');
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Error writing CSV export:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, cancelled: true };
});

ipcMain.handle('export-pdf', async (event, filename) => {
  const filePath = dialog.showSaveDialogSync(mainWindow, {
    title: 'Export PDF Report',
    defaultPath: path.join(app.getPath('documents'), filename || 'mimola-report.pdf'),
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (filePath) {
    try {
      const data = await mainWindow.webContents.printToPDF({
        printBackground: true,
        margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        pageSize: 'A4',
        landscape: false
      });
      fs.writeFileSync(filePath, data);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Error rendering PDF export:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, cancelled: true };
});

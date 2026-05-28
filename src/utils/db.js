// ─── Database helpers ───────────────────────────────────────

const DB_VERSION = 1;

export async function loadDB() {
  if (window.electronAPI) {
    try {
      const db = await window.electronAPI.db.get();
      if (db) return migrateDB(db);
    } catch (e) {
      console.error('Failed to load electron DB:', e);
      // Do NOT fall through to localStorage — Electron data is the source of truth.
      // Attempt to load the backup from localStorage as a last resort.
      const backup = localStorage.getItem('mimola_db_backup');
      if (backup) {
        try {
          console.warn('Loading from emergency localStorage backup');
          return migrateDB(JSON.parse(backup));
        } catch (_) { /* corrupt backup */ }
      }
      return null;
    }
  }

  // Web-only (non-Electron) path
  const saved = localStorage.getItem('mimola_db');
  if (saved) {
    try { return migrateDB(JSON.parse(saved)); } catch (e) { console.error(e); }
  }
  return null;
}

export async function saveDB(data) {
  const payload = { ...data, _version: DB_VERSION };

  if (window.electronAPI) {
    let result;
    try {
      result = await window.electronAPI.db.save(payload);
    } catch (e) {
      throw new Error(`Electron IPC save failed: ${e.message}`);
    }
    if (result && !result.success) {
      throw new Error(`Electron file save failed: ${result.error || 'unknown error'}`);
    }
  } else {
    try {
      localStorage.setItem('mimola_db', JSON.stringify(payload));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        throw new Error('Storage full — cannot save data. Please export your data and clear some space.');
      }
      throw e;
    }
  }
}

// ─── Schema migration ───────────────────────────────────────
function migrateDB(db) {
  if (!db) return db;
  const version = db._version || 0;

  // v0 → v1: ensure all required fields exist
  if (version < 1) {
    db.profile = db.profile || {};
    db.transactions = db.transactions || [];
    db.items = db.items || [];
    // Ensure items have hikeHistory array
    db.items = db.items.map(item => ({
      ...item,
      hikeHistory: item.hikeHistory || [],
    }));
    db._version = 1;
  }

  // Ensure reports array exists for storing generated reports history
  if (!db.reports) {
    db.reports = [];
  }

  return db;
}

export const DEFAULT_PROFILE = {
  name: '',
  monthlyIncome: 0,
  primaryColor: '#f6821f',
  appName: 'MiMola',
  appLogo: 'house',
  language: 'en',
  onboarded: false,
  theme: 'light' // 'light' or 'dark'
};

export const STATIC_CATEGORIES = [
  { id: 'c_food', label: 'Food & Groceries' },
  { id: 'c_housing', label: 'House Rent & Housing' },
  { id: 'c_utilities', label: 'Water & Electricity Bills' },
  { id: 'c_transport', label: 'Transport & Fuel' },
  { id: 'c_health', label: 'Health & Pharmacy' },
  { id: 'c_entertainment', label: 'Entertainment' },
  { id: 'c_other', label: 'Other' }
];

export const DEFAULT_ITEMS = [];

export const DEFAULT_TX = [];

// Logo preset icons (Bootstrap Icons class names)
export const LOGO_PRESETS = [
  { id: 'house',  icon: 'bi-house-fill',  label: 'House'  },
  { id: 'wallet', icon: 'bi-wallet2',     label: 'Wallet' },
  { id: 'coin',   icon: 'bi-coin',        label: 'Coins'  },
  { id: 'chart',  icon: 'bi-graph-up',    label: 'Chart'  },
];

import { useState, useEffect, useCallback, useRef } from 'react';
import { t as translate } from './utils/i18n';
import { loadDB, saveDB, DEFAULT_PROFILE, STATIC_CATEGORIES, DEFAULT_ITEMS, DEFAULT_TX } from './utils/db';

import WelcomeScreen from './components/WelcomeScreen';
import Header from './components/Header';
import TabNav from './components/TabNav';
import Toast from './components/Toast';
import Dashboard from './components/Dashboard';
import ItemsTab from './components/ItemsTab';
import ExpensesTab from './components/ExpensesTab';
import ConfirmModal from './components/ConfirmModal';
import ReportModal from './components/ReportModal';

import CalendarTab from './components/CalendarTab';
import LedgerTab from './components/LedgerTab';
import SettingsTab from './components/SettingsTab';
import ReportsTab from './components/ReportsTab';

import { useTransactionController } from './controllers/transactionController';
import { useItemController } from './controllers/itemController';
import { useCheckoutController } from './controllers/checkoutController';
import { useProfileController } from './controllers/profileController';

import './App.css';

function App() {
  // ── Core State ─────────────────────────────────────────────
  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });

  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Ref mirrors (always hold latest state for persist) ────
  const profileRef = useRef(profile);
  const transactionsRef = useRef(transactions);
  const itemsRef = useRef(items);
  const reportsRef = useRef(reports);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { transactionsRef.current = transactions; }, [transactions]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { reportsRef.current = reports; }, [reports]);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('mimola_activeTab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('mimola_activeTab', activeTab);
  }, [activeTab]);

  // Global Confirm State
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const requestConfirm = (title, message, onConfirm) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  // Calendar
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // ── Report Modal State ────────────────────────────────────
  const [reportModalOpen, setReportModalOpen] = useState(false);
  // Holds the filtered data for the print-only PDF layout
  const [reportData, setReportData] = useState(null);

  // ── i18n helper ────────────────────────────────────────────
  const t = useCallback((key) => translate(profile.language || 'en', key), [profile.language]);
  const months = t('months') || [];
  const days = t('days') || [];

  // ── Dynamic Theming ────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    const c = profile.primaryColor || '#f6821f';
    root.style.setProperty('--primary', c);
    root.style.setProperty('--cf-orange', c);
    // Darken for hover
    const darken = (hex, amt) => {
      let r = parseInt(hex.slice(1,3), 16);
      let g = parseInt(hex.slice(3,5), 16);
      let b = parseInt(hex.slice(5,7), 16);
      r = Math.max(0, r - amt); g = Math.max(0, g - amt); b = Math.max(0, b - amt);
      return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    };
    root.style.setProperty('--cf-orange-hover', darken(c, 25));
    root.style.setProperty('--cf-orange-muted', c + '1a');
  }, [profile.primaryColor]);

  // ── Load DB on mount ───────────────────────────────────────
  useEffect(() => {
    async function load() {
      const db = await loadDB();
      if (db) {
        setProfile(db.profile || { ...DEFAULT_PROFILE });

        setTransactions(db.transactions || []);
        setItems(db.items || []);
        setReports(db.reports || []);
      } else {
        // First launch — will show welcome screen
        setProfile({ ...DEFAULT_PROFILE });

        setTransactions(DEFAULT_TX);
        setItems(DEFAULT_ITEMS);
        setReports([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Persist helper (reads latest state from refs, accepts overrides) ──
  const persistPending = useRef(false);
  const persist = useCallback((overrides = {}) => {
    const data = {
      profile: overrides.profile ?? profileRef.current,
      transactions: overrides.transactions ?? transactionsRef.current,
      items: overrides.items ?? itemsRef.current,
      reports: overrides.reports ?? reportsRef.current,
    };
    persistPending.current = true;
    saveDB(data)
      .catch((e) => {
        console.error('Persist failed:', e);
        setToastMsg('⚠️ Save failed — your last change may not be saved!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      })
      .finally(() => { persistPending.current = false; });
  }, []);

  // Flush pending save on close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Synchronous last-resort save to localStorage
      try {
        const data = {
          profile: profileRef.current,
          transactions: transactionsRef.current,
          items: itemsRef.current,
          reports: reportsRef.current,
        };
        localStorage.setItem('mimola_db_backup', JSON.stringify(data));
      } catch (_) { /* best effort */ }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const alertToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleAddReport = useCallback((reportInfo) => {
    const newReport = {
      id: Date.now().toString(),
      generatedAt: new Date().toISOString(),
      ...reportInfo
    };
    setReports(prev => {
      const updated = [newReport, ...prev];
      persist({ reports: updated });
      return updated;
    });
  }, [persist]);

  const handleDeleteReport = useCallback((id) => {
    setReports(prev => {
      const updated = prev.filter(r => r.id !== id);
      persist({ reports: updated });
      return updated;
    });
    alertToast('Report deleted from history');
  }, [persist]);

  // ── Onboarding complete ────────────────────────────────────
  const handleOnboardComplete = (data) => {
    const newProfile = {
      ...profile,
      name: data.name,
      monthlyIncome: data.monthlyIncome,
      language: data.language,
      onboarded: true,
    };
    setProfile(newProfile);
    persist({ profile: newProfile });
  };

  // ── Controllers ────────────────────────────────────────────
  const { handleAddExpense, handleDeleteTx, handleRepeatExpenses } = useTransactionController({
    transactions, setTransactions, items, profile, persist, alertToast, requestConfirm, closeConfirm, t
  });

  const { handleQuickAddItem, handleAddMultipleItems, handleItemSubmit, handleDeleteItem, handlePriceHike } = useItemController({
    items, setItems, transactions, profile, persist, alertToast, requestConfirm, closeConfirm, t
  });

  const { handleLogPurchase, handleCheckoutCart } = useCheckoutController({
    transactions, setTransactions, items, profile, persist, alertToast, t
  });

  const { handleSaveProfile, handleResetApp } = useProfileController({
    profile, setProfile, transactions, setTransactions, items, setItems, 
    setActiveTab, persist, DEFAULT_PROFILE, alertToast, requestConfirm, closeConfirm, t
  });

  // ── Calendar navigation ────────────────────────────────────
  const changeMonth = (offset) => {
    let m = selectedMonth + offset;
    let y = selectedYear;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  // ── Calculations ───────────────────────────────────────────
  const activeMonthTx = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const baseIncome = parseFloat(profile.monthlyIncome) || 0;
  const totalIncome = baseIncome + activeMonthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = activeMonthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  const getProjectedSpent = () => {
    const today = new Date();
    const isCurrent = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (totalExpenses === 0) return 0;
    const elapsed = isCurrent ? today.getDate() : daysInMonth;
    return (totalExpenses / elapsed) * daysInMonth;
  };

  // ── Report Export (with date range) ────────────────────────
  const openReportModal = () => {
    setReportModalOpen(true);
  };

  const handleReportExport = async (type, dateFrom, dateTo) => {
    // Filter transactions by date range
    const filtered = transactions.filter(tx => {
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      return true;
    });

    const rIncome = filtered.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const rExpenses = filtered.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

    if (type === 'csv') {
      const headers = 'Date,Type,Category,Description,Amount (MZN)\n';
      const rows = filtered.map(tx => {
        const catInfo = STATIC_CATEGORIES.find(c => c.id === tx.category);
        const cat = tx.type === 'income' ? 'Income' : (catInfo ? catInfo.label : 'Other');
        return `"${tx.date}","${tx.type}","${cat}","${tx.description.replace(/"/g, '""')}",${tx.amount}`;
      }).join('\n');

      const summary = `\n\nReport Period: ${dateFrom} to ${dateTo}\nBase Monthly Income: MZN ${baseIncome.toFixed(2)}\nAdditional Income: MZN ${rIncome.toFixed(2)}\nTotal Expenses: MZN ${rExpenses.toFixed(2)}\nNet Balance: MZN ${(baseIncome + rIncome - rExpenses).toFixed(2)}\nTotal Records: ${filtered.length}\n`;
      const csv = headers + rows + summary;
      const fname = `mimola-report-${dateFrom}-to-${dateTo}.csv`;

      if (window.electronAPI) {
        const res = await window.electronAPI.exportCSV(csv, fname);
        if (res.success) {
          alertToast(`Excel exported: ${res.path}`);
          handleAddReport({
            title: 'Financial Report',
            context: 'financial',
            type: 'csv',
            dateFrom: dateFrom || 'All Time',
            dateTo: dateTo || 'All Time',
            recordCount: filtered.length,
            income: rIncome,
            expenses: rExpenses
          });
        }
      } else {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fname;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alertToast('CSV Downloaded');
        handleAddReport({
          title: 'Financial Report',
          context: 'financial',
          type: 'csv',
          dateFrom: dateFrom || 'All Time',
          dateTo: dateTo || 'All Time',
          recordCount: filtered.length,
          income: rIncome,
          expenses: rExpenses
        });
      }
      setReportModalOpen(false);

    } else if (type === 'pdf') {
      // Set report data so the print layout renders with filtered content
      setReportData({
        transactions: filtered,
        dateFrom,
        dateTo,
        income: rIncome,
        expenses: rExpenses,
        baseIncome,
      });
      setReportModalOpen(false);

      // Allow React to render the print layout, then trigger print
      setTimeout(async () => {
        const fname = `mimola-report-${dateFrom}-to-${dateTo}.pdf`;
        let logged = false;
        if (window.electronAPI) {
          const res = await window.electronAPI.exportPDF(fname);
          if (res.success) {
            alertToast(`PDF Saved: ${res.path}`);
            logged = true;
          }
        } else {
          window.print();
          logged = true;
        }
        if (logged) {
          handleAddReport({
            title: 'Financial Report',
            context: 'financial',
            type: 'pdf',
            dateFrom: dateFrom || 'All Time',
            dateTo: dateTo || 'All Time',
            recordCount: filtered.length,
            income: rIncome,
            expenses: rExpenses
          });
        }
        // Clear report data after a short delay
        setTimeout(() => setReportData(null), 1000);
      }, 300);
    }
  };

  // ── Loading screen ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-secondary mb-2" role="status"></div>
          <p className="fw-semibold text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Welcome / Onboarding ───────────────────────────────────
  if (!profile.onboarded) {
    return <WelcomeScreen appName={profile.appName} onComplete={handleOnboardComplete} />;
  }

  // ── Report data for print ──────────────────────────────────
  const printTx = reportData ? reportData.transactions : activeMonthTx;
  const printIncome = reportData ? reportData.income : totalIncome;
  const printExpenses = reportData ? reportData.expenses : totalExpenses;
  const printNet = reportData 
    ? (reportData.baseIncome + reportData.income - reportData.expenses) 
    : netSavings;
  const printPeriod = reportData
    ? `${reportData.dateFrom} — ${reportData.dateTo}`
    : `${months[selectedMonth]} ${selectedYear}`;

  // ── Main App ───────────────────────────────────────────────
  return (
    <div className="mimola-shell">
      {/* Header spanning full width */}
      <Header profile={profile} />

      {/* Tabs spanning full width */}
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} onOpenReport={openReportModal} />

      {/* ════════════════ PRINT-ONLY: Premium Report Layout ═══════════════ */}
      {reportData && (
        <div className="print-only">
          <div className="report-page">
            {/* Report header with logo */}
            <div className="report-header-premium">
              <div className="report-logo-section">
                <img src="logo.svg" alt="MiMola" className="report-logo-img" />
              </div>
              <div className="report-header-divider"></div>
              <div className="report-meta">
                <div className="report-meta-label">FINANCIAL REPORT</div>
                <div className="report-meta-period">{printPeriod}</div>
                <div className="report-meta-date">Generated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Summary cards row */}
            <div className="report-summary-row">
              <div className="report-summary-card">
                <div className="report-summary-label">TOTAL INCOME</div>
                <div className="report-summary-value report-income">
                  {printIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })} MZN
                </div>
              </div>
              <div className="report-summary-card">
                <div className="report-summary-label">TOTAL EXPENSES</div>
                <div className="report-summary-value report-expense">
                  {printExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })} MZN
                </div>
              </div>
              <div className="report-summary-card">
                <div className="report-summary-label">NET BALANCE</div>
                <div className={`report-summary-value ${printNet >= 0 ? 'report-income' : 'report-expense'}`}>
                  {printNet >= 0 ? '+' : ''}{printNet.toLocaleString(undefined, { minimumFractionDigits: 2 })} MZN
                </div>
              </div>
              <div className="report-summary-card">
                <div className="report-summary-label">TRANSACTIONS</div>
                <div className="report-summary-value">{printTx.length}</div>
              </div>
            </div>

            {/* Transactions table */}
            <div className="report-section-title">Transaction Details</div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount (MZN)</th>
                </tr>
              </thead>
              <tbody>
                {printTx.map(tx => {
                  const catInfo = STATIC_CATEGORIES.find(c => c.id === tx.category);
                  return (
                    <tr key={tx.id} className={tx.type === 'income' ? 'report-row-income' : ''}>
                      <td>{tx.date}</td>
                      <td>{tx.description}</td>
                      <td>{tx.type === 'income' ? 'Income' : (catInfo ? catInfo.label : 'Other')}</td>
                      <td>
                        <span className={`report-type-badge ${tx.type}`}>
                          {tx.type === 'income' ? '↑ Income' : '↓ Expense'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="report-footer">
              <div className="report-footer-left">
                <img src="logo.svg" alt="MiMola" className="report-footer-logo" />
                <span>MiMola Financial Tracker</span>
              </div>
              <div className="report-footer-right">
                Confidential • {printPeriod}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ════════════════ END PRINT-ONLY ═══════════════════════════════════ */}

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions} items={items} t={t}
            selectedYear={selectedYear} selectedMonth={selectedMonth} months={months}
            onSetMonth={setSelectedMonth} onSetYear={setSelectedYear}
            totalIncome={totalIncome} totalExpenses={totalExpenses}
            baseIncome={baseIncome}
            netSavings={netSavings} projectedSpent={getProjectedSpent()}
            onAddItem={handleQuickAddItem}
            onAddMultipleItems={handleAddMultipleItems}
            onAddExpense={handleAddExpense}
            onCheckoutCart={handleCheckoutCart}
            onRepeatExpenses={handleRepeatExpenses}
            onDeleteTx={handleDeleteTx}
            onSetTab={setActiveTab}
          />
        )}

        {activeTab === 'items' && (
          <ItemsTab
            items={items} t={t}
            onItemSubmit={handleItemSubmit}
            onDeleteItem={handleDeleteItem}
            onPriceHike={handlePriceHike}
            onAddReport={handleAddReport}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            reports={reports}
            t={t}
            transactions={transactions}
            onDeleteReport={handleDeleteReport}
            onRegenerate={handleReportExport}
            requestConfirm={requestConfirm}
            closeConfirm={closeConfirm}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            transactions={transactions} t={t}
            selectedYear={selectedYear} selectedMonth={selectedMonth} months={months}
            onDeleteTx={handleDeleteTx}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            transactions={transactions} t={t}
            selectedYear={selectedYear} selectedMonth={selectedMonth}
            months={months} days={days}
            onChangeMonth={changeMonth}
          />
        )}

        {activeTab === 'transactions' && (
          <LedgerTab
            transactions={transactions} t={t}
            onDeleteTx={handleDeleteTx}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            profile={profile} t={t}
            onSaveProfile={handleSaveProfile}
            onResetApp={handleResetApp}
          />
        )}
      </main>

      <Toast message={toastMsg} visible={showToast} />

      {confirmState.isOpen && (
        <ConfirmModal 
          title={confirmState.title} 
          message={confirmState.message} 
          onConfirm={confirmState.onConfirm} 
          onCancel={closeConfirm} 
        />
      )}

      {/* Report date range modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onExport={handleReportExport}
        title="Generate Financial Report"
        subtitle="Choose a date range and export format for your report."
        transactions={transactions}
      />
    </div>
  );
}

export default App;

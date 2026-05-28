import { useState, useMemo } from 'react';
import ExpenseChart from './ExpenseChart';
import RepeatExpressModal from './RepeatExpressModal';
import BuyCartModal from './BuyCartModal';
import Pagination from './Pagination';
import { STATIC_CATEGORIES } from '../utils/db';

export default function Dashboard({
  transactions, items, t,
  selectedYear, selectedMonth, months,
  onSetMonth, onSetYear,
  totalIncome, totalExpenses, baseIncome, netSavings, projectedSpent,
  onAddItem, onAddMultipleItems, onAddExpense, onCheckoutCart, onRepeatExpenses,
  onDeleteTx, onSetTab,
}) {
  // Quick action modals
  const [quickAction, setQuickAction] = useState(null); // 'item' | 'buy' | 'repeat' | null
  const [qaItemForm, setQaItemForm] = useState({ id: null, name: '', price: '', category: '' });
  const [pendingItems, setPendingItems] = useState([]);

  // Pagination & Search
  const [txSearch, setTxSearch] = useState('');
  const [txPage, setTxPage] = useState(1);

  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => 
      (tx.description || '').toLowerCase().includes((txSearch || '').toLowerCase())
    );
  }, [transactions, txSearch]);

  const totalTxPages = Math.ceil(filteredTxs.length / 10);
  const paginatedTxs = filteredTxs.slice((txPage - 1) * 10, txPage * 10);

  const handleQaItem = (e) => {
    e.preventDefault();
    if (!qaItemForm.name || !qaItemForm.price) return;
    
    if (qaItemForm.id) {
      // Edit
      setPendingItems(pendingItems.map(item => item.id === qaItemForm.id ? { ...qaItemForm, price: parseFloat(qaItemForm.price) } : item));
    } else {
      // Add
      setPendingItems([...pendingItems, { ...qaItemForm, id: 'temp_' + Date.now(), price: parseFloat(qaItemForm.price) }]);
    }
    
    setQaItemForm({ id: null, name: '', price: '', category: '' });
  };

  const handleSaveAllItems = () => {
    if (pendingItems.length === 0) return;
    onAddMultipleItems(pendingItems);
    setPendingItems([]);
    setQuickAction(null);
  };

  const handleEditPendingItem = (item) => {
    setQaItemForm({ ...item, price: item.price.toString() });
  };

  const handleDeletePendingItem = (id) => {
    setPendingItems(pendingItems.filter(item => item.id !== id));
  };



  return (
    <>
      {/* Month Filter */}
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h4 className="m-0 fw-bold">Overview</h4>
        <div className="input-group input-group-sm w-auto shadow-sm">
          <span className="input-group-text bg-white"><i className="bi bi-calendar3 text-primary"></i></span>
          <select className="form-select border-start-0" style={{ width: 'auto', fontWeight: 'bold' }} value={selectedMonth} onChange={e => onSetMonth(parseInt(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="form-select" style={{ minWidth: '85px', fontWeight: 'bold' }} value={selectedYear} onChange={e => onSetYear(parseInt(e.target.value))}>
            {[...Array(7)].map((_, i) => {
              const y = new Date().getFullYear() - 3 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <section className="row g-3 mb-3 no-print">
        <div className="col-lg-3 col-sm-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body stat-card">
              <span className="stat-label">Income</span>
              <span className="stat-value">{totalIncome.toLocaleString()} MZN</span>
              <span className="stat-subtext">{t('dashboard.totalEarnings')}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body stat-card">
              <span className="stat-label">Spending</span>
              <span className="stat-value">{totalExpenses.toLocaleString()} MZN</span>
              <span className="stat-subtext">{t('dashboard.expensesIn')} {months[selectedMonth]}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body stat-card">
              <span className="stat-label">Net Balance</span>
              <span className={`stat-value ${netSavings < 0 ? 'text-danger' : 'text-success'}`}>
                {netSavings >= 0 ? '+' : ''}{netSavings.toLocaleString()} MZN
              </span>
              <span className="stat-subtext">{t('dashboard.netMonthly')}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body stat-card">
              <span className="stat-label">Projected spending</span>
              <span className="stat-value">{Math.round(projectedSpent).toLocaleString()} MZN</span>
              <span className="stat-subtext">{t('dashboard.estimatedEnd')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <div className="quick-actions-bar mb-3 no-print">
        <button className="btn btn-primary shadow-sm px-4" onClick={() => setQuickAction('buy')}>
          <i className="bi bi-cart me-2"></i>Buy Item
        </button>
        <button className="btn btn-outline-secondary px-4" onClick={() => setQuickAction('item')}>
          <i className="bi bi-plus-lg me-2"></i>{t('quickActions.addItem')}
        </button>
        <button className="btn btn-outline-secondary px-4" onClick={() => setQuickAction('repeat')}>
          <i className="bi bi-arrow-repeat me-2"></i>Repeat Express
        </button>
      </div>

      {quickAction === 'item' && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-fullscreen m-0 w-100 h-100">
            <div className="modal-content qa-modal bg-light h-100 border-0 rounded-0">
              <div className="modal-header cf-accent-border bg-white">
                <h5 className="modal-title">{t('quickActions.addItem')}</h5>
                <button type="button" className="btn-close" onClick={() => setQuickAction(null)}></button>
              </div>
              <div className="modal-body d-flex justify-content-center align-items-start pt-5">
                <div className="card shadow-sm w-100" style={{ maxWidth: '800px' }}>
                  <div className="card-body">
                    <div className="row g-4">
                      <div className="col-md-5 border-end">
                        <h6 className="fw-bold mb-3">{qaItemForm.id ? 'Edit Item' : 'Add Item'}</h6>
                        <form onSubmit={handleQaItem}>
                          <div className="mb-3">
                            <label className="form-label">{t('items.nameLabel')}</label>
                            <input type="text" className="form-control" placeholder={t('items.namePlaceholder')}
                              value={qaItemForm.name} onChange={e => setQaItemForm({...qaItemForm, name: e.target.value})} autoFocus />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">{t('items.priceLabel')}</label>
                            <div className="input-group">
                              <span className="input-group-text">MZN</span>
                              <input type="number" step="0.01" className="form-control" placeholder="0.00"
                                value={qaItemForm.price} onChange={e => setQaItemForm({...qaItemForm, price: e.target.value})} />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={qaItemForm.category}
                              onChange={e => setQaItemForm({...qaItemForm, category: e.target.value})}>
                              <option value="">Select a category</option>
                              {STATIC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                          </div>
                          <div className="d-flex gap-2 mt-2">
                            <button type="submit" className="btn btn-outline-primary w-100 py-2">
                              <i className="bi bi-plus-lg me-1"></i> {qaItemForm.id ? 'Update List' : 'Add to List'}
                            </button>
                            {qaItemForm.id && (
                              <button type="button" className="btn btn-light border py-2" onClick={() => setQaItemForm({ id: null, name: '', price: '', category: '' })}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                      <div className="col-md-7 d-flex flex-column">
                        <h6 className="fw-bold mb-3">Pending Items ({pendingItems.length})</h6>
                        <div className="flex-grow-1 overflow-auto bg-light rounded border p-2" style={{ maxHeight: '300px', minHeight: '200px' }}>
                          {pendingItems.length === 0 ? (
                            <div className="text-center text-muted pt-5">
                              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                              No items added yet.
                            </div>
                          ) : (
                            <ul className="list-group list-group-flush">
                              {pendingItems.map((item) => {
                                const catInfo = STATIC_CATEGORIES.find(c => c.id === item.category);
                                return (
                                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-bottom">
                                    <div>
                                      <div className="fw-bold">{item.name}</div>
                                      <div className="small text-muted">
                                        MZN {item.price.toFixed(2)} &bull; {catInfo ? catInfo.label : 'Other'}
                                      </div>
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                      <button className="btn btn-light border" onClick={() => handleEditPendingItem(item)}><i className="bi bi-pencil"></i></button>
                                      <button className="btn btn-light border text-danger" onClick={() => handleDeletePendingItem(item.id)}><i className="bi bi-trash"></i></button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                        <button 
                          className="btn btn-cf-orange w-100 py-2 mt-3 fw-bold shadow-sm" 
                          disabled={pendingItems.length === 0}
                          onClick={handleSaveAllItems}
                        >
                          {t('common.save')} All to Catalog
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {quickAction === 'buy' && (
        <BuyCartModal 
          items={items}
          baseIncome={baseIncome}
          onClose={() => setQuickAction(null)}
          onCheckout={(cart) => {
            onCheckoutCart(cart);
            setQuickAction(null);
          }}
          t={t}
        />
      )}

      {quickAction === 'repeat' && (
        <RepeatExpressModal 
          transactions={transactions}
          baseIncome={baseIncome}
          months={months}
          t={t}
          onClose={() => setQuickAction(null)}
          onRepeat={(txs) => {
            onRepeatExpenses(txs);
            setQuickAction(null);
          }}
        />
      )}

      {/* Main dashboard grid */}
      <div className="row g-3 no-print">
        <div className="col-lg-12">
          {/* Expense chart */}
          <div className="card mb-3 border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-0 pt-3">
              <span className="fw-bold">{t('dashboard.monthlyOverview')}</span>
            </div>
            <div className="card-body p-2">
              <ExpenseChart
                transactions={transactions}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                months={months}
                t={t}
              />
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card border-0 shadow-sm d-flex flex-column">
            <div className="card-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center bg-white border-0 pt-3 gap-2">
              <span className="fw-bold">{t('dashboard.recentPayments')}</span>
              <div className="d-flex gap-2">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search payments..." 
                    value={txSearch}
                    onChange={e => { setTxSearch(e.target.value); setTxPage(1); }}
                  />
                </div>
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-nowrap" onClick={() => onSetTab('transactions')}>
                  {t('dashboard.viewAll')}
                </button>
              </div>
            </div>
            <div className="card-body p-0 overflow-auto">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 border-0">{t('ledger.date')}</th>
                    <th className="border-0">{t('ledger.description')}</th>
                    <th className="border-0">{t('ledger.itemGroup')}</th>
                    <th className="text-end border-0">{t('ledger.amount')}</th>
                    <th className="text-center border-0 pe-4">{t('ledger.action')}</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {paginatedTxs.map(tx => {
                    const catInfo = STATIC_CATEGORIES.find(c => c.id === tx.category);
                    return (
                      <tr key={tx.id}>
                        <td className="ps-4">
                          <span className="text-muted small fw-medium">{tx.date}</span>
                        </td>
                        <td className="fw-semibold text-dark">{tx.description}</td>
                        <td>
                          {tx.type === 'income' ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">{t('common.income')}</span>
                          ) : (
                            <span className="badge bg-light text-secondary border rounded-pill">{catInfo ? catInfo.label : t('common.other')}</span>
                          )}
                        </td>
                        <td className={`text-end fw-bold ${tx.type === 'income' ? 'text-success' : 'text-dark'}`}>
                          {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} MZN
                        </td>
                        <td className="text-center pe-4">
                          <button className="btn btn-sm btn-outline-danger py-1 rounded-circle" style={{ width: '32px', height: '32px' }} onClick={() => onDeleteTx(tx.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTxs.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-muted py-5">{t('dashboard.noTransactions')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={txPage} totalPages={totalTxPages} onPageChange={setTxPage} />
          </div>
        </div>
      </div>
    </>
  );
}

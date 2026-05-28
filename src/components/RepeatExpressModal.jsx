import { useState, useMemo } from 'react';
import { STATIC_CATEGORIES } from '../utils/db';
import Pagination from './Pagination';

export default function RepeatExpressModal({ transactions, baseIncome, onClose, onRepeat, t, months }) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  const [searchMonthQuery, setSearchMonthQuery] = useState('');
  const [searchTxQuery, setSearchTxQuery] = useState('');
  
  const [monthPage, setMonthPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  // Group transactions by month
  const getHistoricalMonths = () => {
    const monthGroups = {};
    transactions.forEach(tx => {
      const [year, month] = tx.date.split('-');
      const key = `${year}-${month}`;
      if (!monthGroups[key]) {
        monthGroups[key] = { 
          key, 
          year: parseInt(year), 
          month: parseInt(month) - 1, // 0-indexed for months array
          txs: [], 
          income: baseIncome, 
          expense: 0 
        };
      }
      monthGroups[key].txs.push(tx);
      if (tx.type === 'income') monthGroups[key].income += tx.amount;
      else monthGroups[key].expense += tx.amount;
    });
    return Object.values(monthGroups).sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  };

  const history = getHistoricalMonths();
  const selectedData = selectedMonthKey ? history.find(h => h.key === selectedMonthKey) : null;

  const filteredHistory = useMemo(() => {
    return history.filter(h => 
      `${months[h.month]} ${h.year}`.toLowerCase().includes((searchMonthQuery || '').toLowerCase())
    );
  }, [history, searchMonthQuery, months]);

  const filteredTxs = useMemo(() => {
    if (!selectedData) return [];
    return selectedData.txs.filter(tx => 
      tx.type === 'expense' && 
      (tx.description || '').toLowerCase().includes((searchTxQuery || '').toLowerCase())
    );
  }, [selectedData, searchTxQuery]);

  const monthTotalPages = Math.ceil(filteredHistory.length / 10) || 1;
  const paginatedHistory = filteredHistory.slice((monthPage - 1) * 10, monthPage * 10);

  const txTotalPages = Math.ceil(filteredTxs.length / 10) || 1;
  const paginatedTxs = filteredTxs.slice((txPage - 1) * 10, txPage * 10);

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
      <div className="modal-dialog modal-fullscreen m-0 w-100 h-100">
        <div className="modal-content bg-light h-100 border-0 rounded-0">
          <div className="modal-header cf-accent-border bg-white">
            <h5 className="modal-title d-flex align-items-center">
              {selectedMonthKey && (
                <button className="btn btn-sm btn-light me-3 border" onClick={() => setSelectedMonthKey(null)}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              )}
              <i className="bi bi-arrow-repeat text-primary me-2"></i> Repeat Express
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-0">
            <div className="container py-5" style={{ maxWidth: '800px' }}>
              
              {!selectedMonthKey ? (
                // --- MONTH LIST VIEW ---
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h3 className="fw-bold m-0">Select a Past Month</h3>
                      <p className="text-muted m-0">Choose a month to duplicate its expenses.</p>
                    </div>
                    <div className="input-group input-group-sm w-25">
                      <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search month..." 
                        value={searchMonthQuery}
                        onChange={e => { setSearchMonthQuery(e.target.value); setMonthPage(1); }}
                      />
                    </div>
                  </div>
                  
                  {history.length === 0 ? (
                    <div className="text-center text-muted py-5 bg-white rounded shadow-sm border">
                      <i className="bi bi-calendar-x display-4 mb-3 d-block"></i>
                      No past transactions found.
                    </div>
                  ) : (
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-0 overflow-auto">
                        <table className="table table-hover mb-0 align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Month & Year</th>
                              <th className="text-end">Income</th>
                              <th className="text-end">Expenses</th>
                              <th className="text-end">Net</th>
                              <th className="text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedHistory.map(h => {
                              const net = h.income - h.expense;
                              return (
                                <tr key={h.key} style={{ cursor: 'pointer' }} onClick={() => {
                                  setSelectedMonthKey(h.key);
                                  setSelectedTxIds(h.txs.filter(tx => tx.type === 'expense').map(tx => tx.id));
                                  setSearchTxQuery('');
                                  setTxPage(1);
                                }}>
                                  <td className="fw-bold text-primary">{months[h.month]} {h.year}</td>
                                  <td className="text-end fw-semibold text-success">{h.income.toLocaleString()} MZN</td>
                                  <td className="text-end fw-semibold text-danger">{h.expense.toLocaleString()} MZN</td>
                                  <td className={`text-end fw-bold ${net >= 0 ? 'text-success' : 'text-danger'}`}>{net.toLocaleString()} MZN</td>
                                  <td className="text-center">
                                    <button className="btn btn-sm btn-outline-primary py-1">Select <i className="bi bi-arrow-right"></i></button>
                                  </td>
                                </tr>
                              );
                            })}
                            {filteredHistory.length === 0 && (
                              <tr><td colSpan="5" className="text-center py-4 text-muted">No matching months found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <Pagination currentPage={monthPage} totalPages={monthTotalPages} onPageChange={setMonthPage} />
                    </div>
                  )}
                </>
              ) : (
                // --- MONTH DETAIL VIEW ---
                <>
                  <div className="card border-0 shadow-sm mb-4 bg-white">
                    <div className="card-body text-center p-4">
                      <h3 className="fw-bold text-primary mb-1">{months[selectedData.month]} {selectedData.year} Summary</h3>
                      <div className="d-flex justify-content-center gap-4 mt-3">
                        <div>
                          <span className="d-block text-muted small text-uppercase fw-bold">Income</span>
                          <span className="fs-5 fw-bold text-success">{selectedData.income.toLocaleString()} MZN</span>
                        </div>
                        <div>
                          <span className="d-block text-muted small text-uppercase fw-bold">Expenses</span>
                          <span className="fs-5 fw-bold text-danger">{selectedData.expense.toLocaleString()} MZN</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white pt-3 pb-2 d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold m-0">Itemized Expenditures</h5>
                      <div className="input-group input-group-sm w-25">
                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search expenses..." 
                          value={searchTxQuery}
                          onChange={e => { setSearchTxQuery(e.target.value); setTxPage(1); }}
                        />
                      </div>
                    </div>
                    <div className="card-body p-0 overflow-auto">
                      <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '40px' }} className="text-center">
                              <input 
                                type="checkbox" 
                                className="form-check-input"
                                checked={paginatedTxs.length > 0 && paginatedTxs.every(tx => selectedTxIds.includes(tx.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newIds = [...new Set([...selectedTxIds, ...paginatedTxs.map(t => t.id)])];
                                    setSelectedTxIds(newIds);
                                  } else {
                                    const pageIds = paginatedTxs.map(t => t.id);
                                    setSelectedTxIds(selectedTxIds.filter(id => !pageIds.includes(id)));
                                  }
                                }}
                              />
                            </th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th className="text-end">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedTxs.map(tx => {
                            const catInfo = STATIC_CATEGORIES.find(c => c.id === tx.category);
                            const isSelected = selectedTxIds.includes(tx.id);
                            return (
                              <tr key={tx.id} style={{ cursor: 'pointer', backgroundColor: isSelected ? '#f8faff' : 'transparent' }}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedTxIds(selectedTxIds.filter(id => id !== tx.id));
                                    } else {
                                      setSelectedTxIds([...selectedTxIds, tx.id]);
                                    }
                                  }}>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    className="form-check-input" 
                                    checked={isSelected}
                                    onChange={() => {}}
                                  />
                                </td>
                                <td className={`small ${!isSelected ? 'text-muted text-decoration-line-through' : ''}`}>{tx.date}</td>
                                <td className={`fw-bold ${!isSelected ? 'text-muted text-decoration-line-through' : ''}`}>{tx.description}</td>
                                <td>
                                  <span className={`badge border rounded-pill ${isSelected ? 'bg-light text-secondary' : 'bg-transparent text-muted'}`}>
                                    {catInfo ? catInfo.label : t('common.other')}
                                  </span>
                                </td>
                                <td className={`text-end fw-bold ${isSelected ? 'text-dark' : 'text-muted text-decoration-line-through'}`}>
                                  {tx.amount.toLocaleString()} MZN
                                </td>
                              </tr>
                            );
                          })}
                          {filteredTxs.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-4 text-muted">No expenses found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination currentPage={txPage} totalPages={txTotalPages} onPageChange={setTxPage} />
                  </div>

                  <div className="text-center mt-5">
                    <button 
                      className="btn btn-primary btn-lg px-5 shadow-sm rounded-pill"
                      disabled={selectedTxIds.length === 0}
                      onClick={() => {
                        const txsToRepeat = selectedData.txs.filter(tx => selectedTxIds.includes(tx.id));
                        onRepeat(txsToRepeat);
                      }}
                    >
                      <i className="bi bi-arrow-repeat me-2"></i> 
                      Repeat {selectedTxIds.length} selected expenses into Current Month
                    </button>
                    <p className="text-muted small mt-3">
                      This will create identical expense records for the current active month.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

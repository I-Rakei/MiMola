import { useState, useMemo } from 'react';
import ExpenseChart from './ExpenseChart';
import { STATIC_CATEGORIES } from '../utils/db';
import Pagination from './Pagination';

export default function ExpensesTab({ transactions, t, onDeleteTx, selectedYear, selectedMonth, months }) {
  const expenseTxs = transactions.filter(tx => tx.type === 'expense');
  const totalExpenses = expenseTxs.reduce((sum, tx) => sum + tx.amount, 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExpenses = useMemo(() => {
    return expenseTxs.filter(tx => 
      (tx.description || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [expenseTxs, searchQuery]);

  const totalPages = Math.ceil(filteredExpenses.length / 10);
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="row g-3">
      {/* Analytics Card */}
      <div className="col-lg-5">
        <div className="card h-100 no-print">
          <div className="card-header cf-accent-border">
            <span>Expense Breakdown</span>
          </div>
          <div className="card-body">
            {expenseTxs.length > 0 ? (
              <ExpenseChart 
                transactions={transactions} 
                selectedYear={selectedYear} 
                selectedMonth={selectedMonth} 
                months={months} 
                t={t} 
              />
            ) : (
              <div className="text-center text-muted py-5">
                <i className="bi bi-pie-chart text-secondary display-4 d-block mb-3"></i>
                No expenses logged yet.
              </div>
            )}
            
            <hr className="my-4" />
            
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold m-0 text-muted text-uppercase">Total Expenses</h6>
              <h4 className="fw-bold text-danger m-0">{totalExpenses.toLocaleString()} MZN</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="col-lg-7">
        <div className="card d-flex flex-column h-100 no-print">
          <div className="card-header cf-accent-border d-flex justify-content-between align-items-center">
            <span>All Expenses ({filteredExpenses.length})</span>
            <div className="input-group input-group-sm w-50">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search expenses..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="card-body p-0 overflow-auto">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>{t('ledger.date')}</th>
                  <th>Category</th>
                  <th>{t('ledger.description')}</th>
                  <th className="text-end">{t('ledger.amount')}</th>
                  <th className="text-center">{t('ledger.action')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map(tx => {
                  const catInfo = STATIC_CATEGORIES.find(c => c.id === tx.category);
                  return (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>
                        <span className="badge bg-light text-secondary border rounded-pill">
                          {catInfo ? catInfo.label : t('common.other')}
                        </span>
                      </td>
                      <td className="fw-semibold">{tx.description}</td>
                      <td className="text-end fw-bold text-danger">
                        -{tx.amount.toFixed(2)} MZN
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger py-1" onClick={() => onDeleteTx(tx.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-5">No expenses recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}

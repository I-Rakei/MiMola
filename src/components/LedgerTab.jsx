import { useState, useMemo } from 'react';
import { STATIC_CATEGORIES } from '../utils/db';
import Pagination from './Pagination';

export default function LedgerTab({ transactions, t, onDeleteTx }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => 
      (tx.description || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [transactions, searchQuery]);

  const totalPages = Math.ceil(filteredTxs.length / 10);
  const paginatedTxs = filteredTxs.slice((currentPage - 1) * 10, currentPage * 10);
  return (
    <div className="card d-flex flex-column h-100 no-print">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>{t('ledger.title')} ({filteredTxs.length} {t('ledger.items')})</span>
        <div className="input-group input-group-sm w-50">
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search transactions..." 
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
              <th>{t('ledger.type')}</th>
              <th>Category</th>
              <th>{t('ledger.description')}</th>
              <th className="text-end">{t('ledger.amount')}</th>
              <th className="text-center">{t('ledger.action')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTxs.map(tx => {
              const catInfo = STATIC_CATEGORIES.find(c => c.id === tx.category);
              return (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td><span className="badge bg-light text-secondary">{t(`common.${tx.type}`)}</span></td>
                  <td>
                    {tx.type === 'income' ? '—' : (
                      <span className="badge bg-light text-secondary">{catInfo ? catInfo.label : t('common.other')}</span>
                    )}
                  </td>
                  <td className="fw-semibold">{tx.description}</td>
                  <td className={`text-end fw-bold ${tx.type === 'income' ? 'text-success' : ''}`}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)} MZN
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-danger py-1" onClick={() => onDeleteTx(tx.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredTxs.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted py-5">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

import { useState, useMemo } from 'react';

export default function ReportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  title = 'Generate Report',
  subtitle = 'Select a date range for your report.',
  transactions = null, // if provided, shows a preview of filtered data
}) {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(todayStr);

  // Preview stats when transactions are provided
  const previewStats = useMemo(() => {
    if (!transactions) return null;
    const filtered = transactions.filter(tx => {
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      return true;
    });
    const income = filtered.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expenses = filtered.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    return { count: filtered.length, income, expenses, net: income - expenses };
  }, [transactions, dateFrom, dateTo]);

  if (!isOpen) return null;

  const handleExport = (type) => {
    onExport(type, dateFrom, dateTo);
  };

  // Quick presets
  const setPreset = (preset) => {
    const now = new Date();
    let from, to;
    switch (preset) {
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = now;
        break;
      case 'lastMonth': {
        const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        from = lastM;
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      }
      case 'last3Months':
        from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        to = now;
        break;
      case 'last6Months':
        from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        to = now;
        break;
      case 'thisYear':
        from = new Date(now.getFullYear(), 0, 1);
        to = now;
        break;
      case 'allTime':
        from = new Date(2020, 0, 1);
        to = now;
        break;
      default:
        return;
    }
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          
          {/* Header with gradient accent */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--cf-orange), #ff9b45)', 
            padding: '1.5rem 1.8rem',
            color: '#fff'
          }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: '1.15rem' }}>
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>{title}
                </h5>
                <p className="mb-0 small" style={{ opacity: 0.85 }}>{subtitle}</p>
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                style={{ marginTop: '2px' }}
              ></button>
            </div>
          </div>

          <div className="modal-body p-4">
            {/* Quick preset buttons */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted text-uppercase mb-2">Quick Select</label>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'lastMonth', label: 'Last Month' },
                  { id: 'last3Months', label: 'Last 3 Months' },
                  { id: 'last6Months', label: 'Last 6 Months' },
                  { id: 'thisYear', label: 'This Year' },
                  { id: 'allTime', label: 'All Time' },
                ].map(p => (
                  <button 
                    key={p.id} 
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={() => setPreset(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range inputs */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label small fw-bold text-muted text-uppercase">From</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold text-muted text-uppercase">To</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Preview stats */}
            {previewStats && (
              <div className="rounded-3 p-3 mb-4" style={{ background: '#f8f9fb', border: '1px solid var(--border-light)' }}>
                <div className="small fw-bold text-muted text-uppercase mb-2">Report Preview</div>
                <div className="row g-2 text-center">
                  <div className="col-3">
                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: 'var(--text-1)' }}>{previewStats.count}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>RECORDS</div>
                  </div>
                  <div className="col-3">
                    <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>{previewStats.income.toLocaleString()}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>INCOME</div>
                  </div>
                  <div className="col-3">
                    <div className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>{previewStats.expenses.toLocaleString()}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>EXPENSES</div>
                  </div>
                  <div className="col-3">
                    <div className={`fw-bold ${previewStats.net >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.1rem' }}>
                      {previewStats.net.toLocaleString()}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>NET</div>
                  </div>
                </div>
              </div>
            )}

            {/* Export buttons */}
            <div className="d-flex gap-3">
              <button 
                className="btn btn-outline-success flex-fill py-3 d-flex flex-column align-items-center gap-1 rounded-3"
                onClick={() => handleExport('csv')}
                style={{ border: '2px solid' }}
              >
                <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '1.5rem' }}></i>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>Export Excel (CSV)</span>
              </button>
              <button 
                className="btn btn-outline-danger flex-fill py-3 d-flex flex-column align-items-center gap-1 rounded-3"
                onClick={() => handleExport('pdf')}
                style={{ border: '2px solid' }}
              >
                <i className="bi bi-file-earmark-pdf" style={{ fontSize: '1.5rem' }}></i>
                <span className="fw-bold" style={{ fontSize: '0.82rem' }}>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

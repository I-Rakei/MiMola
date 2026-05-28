import { useState, useMemo } from 'react';
import { STATIC_CATEGORIES } from '../utils/db';
import Pagination from './Pagination';
import ReportModal from './ReportModal';

export default function ItemsTab({
  items, t,
  onItemSubmit, onDeleteItem, onPriceHike,
  onAddReport,
}) {
  const [form, setForm] = useState({ id: '', name: '', price: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [hikeModal, setHikeModal] = useState(null); // item or null
  const [hikePrice, setHikePrice] = useState('');
  const [profileItem, setProfileItem] = useState(null); // item or null — opens full-page profile

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      (item.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [items, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / 10);
  const paginatedItems = filteredItems.slice((currentPage - 1) * 10, currentPage * 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onItemSubmit({
      ...form,
      price: parseFloat(form.price),
      isEditing,
    });
    setForm({ id: '', name: '', price: '', category: '' });
    setIsEditing(false);
  };

  const startEdit = (item) => {
    setForm({ id: item.id, name: item.name, price: item.price.toString(), category: item.category || '' });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ id: '', name: '', price: '', category: '' });
    setIsEditing(false);
  };

  const openHike = (item) => {
    setHikeModal(item);
    setHikePrice('');
  };

  const handleHike = (e) => {
    e.preventDefault();
    if (!hikePrice) return;
    onPriceHike(hikeModal.id, hikeModal.price, parseFloat(hikePrice));
    setHikeModal(null);
    setHikePrice('');
  };

  // When the profile page is open, keep item data in sync
  const liveProfileItem = profileItem ? items.find(i => i.id === profileItem.id) || profileItem : null;

  // ── Full-page Item Profile ────────────────────────────────
  if (liveProfileItem) {
    return (
      <ItemProfilePage 
        item={liveProfileItem} 
        t={t} 
        onBack={() => setProfileItem(null)} 
        onAddReport={onAddReport}
      />
    );
  }

  return (
    <div className="row g-3 no-print">
      {/* Form */}
      <div className="col-lg-5">
        <div className="card">
          <div className="card-header cf-accent-border">
            <span className="text-cf-orange">
              {isEditing ? t('items.editTitle') : t('items.addTitle')}
            </span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label">{t('items.nameLabel')}</label>
                <input type="text" className="form-control" placeholder={t('items.namePlaceholder')}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="mb-2">
                <label className="form-label">{t('items.priceLabel')}</label>
                <div className="input-group">
                  <span className="input-group-text">MZN</span>
                  <input type="number" step="0.01" className="form-control" placeholder="0.00"
                    value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="">{t('common.other')}</option>
                  {STATIC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-cf-orange px-4">
                  {isEditing ? t('items.saveChanges') : t('items.register')}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-light border" onClick={cancelEdit}>
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="col-lg-7">
        <div className="card d-flex flex-column h-100">
          <div className="card-header cf-accent-border d-flex justify-content-between align-items-center">
            <span>{t('items.listTitle')}</span>
            <div className="input-group input-group-sm w-50">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="card-body p-0 overflow-auto">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>{t('items.nameLabel')}</th>
                  <th>Category</th>
                  <th>{t('items.currentPrice')}</th>
                  <th className="text-center">{t('items.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(item => {
                  const catInfo = STATIC_CATEGORIES.find(c => c.id === item.category);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div 
                          className="fw-bold text-primary" 
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => setProfileItem(item)}
                        >
                          {item.name}
                        </div>
                      </td>
                      <td><span className="badge bg-light text-secondary border rounded-pill">{catInfo ? catInfo.label : t('common.other')}</span></td>
                      <td className="fw-bold text-cf-orange">{item.price.toFixed(2)} MZN</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <button className="btn btn-sm btn-outline-cf-orange py-1 px-2" title={t('items.increasePrice')}
                            onClick={() => openHike(item)}>
                            {t('items.hike')}
                          </button>
                          <button className="btn btn-sm btn-light border py-1" onClick={() => startEdit(item)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger py-1" onClick={() => onDeleteItem(item.id, item.name)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">{t('items.noItems')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Price hike modal */}
      {hikeModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header cf-accent-border bg-white">
                <h5 className="modal-title">{t('items.hikeTitle')} - {hikeModal.name}</h5>
                <button type="button" className="btn-close" onClick={() => setHikeModal(null)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-4">{t('items.hikeDesc')}</p>
                <form onSubmit={handleHike}>
                  <div className="mb-3">
                    <label className="form-label">{t('items.newPriceLabel')}</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light">MZN</span>
                      <input type="number" step="0.01" className="form-control fw-bold"
                        value={hikePrice} onChange={e => setHikePrice(e.target.value)} autoFocus />
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button type="button" className="btn btn-light border px-4" onClick={() => setHikeModal(null)}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-danger px-4 fw-bold shadow-sm">
                      <i className="bi bi-graph-up-arrow me-2"></i>{t('items.recordHike')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Item Profile Page Component ──────────────────────────────────
function ItemProfilePage({ item, t, onBack, onAddReport }) {
  const history = item.hikeHistory || [];

  // ── Report Modal ──────────────────────────────────────────
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // ── Print Data (for PDF exports) ──────────────────────────
  const [printData, setPrintData] = useState(null);

  // ── Filters ────────────────────────────────────────────────
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'biggest' | 'smallest'
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Date filters
    if (dateFrom) {
      result = result.filter(h => h.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(h => h.date <= dateTo);
    }

    // Search (matches on price values)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.date.includes(q) ||
        h.oldPrice.toString().includes(q) ||
        h.newPrice.toString().includes(q)
      );
    }

    // Sort
    switch (sortOrder) {
      case 'oldest':
        result.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'newest':
        result.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case 'biggest':
        result.sort((a, b) => Math.abs(b.newPrice - b.oldPrice) - Math.abs(a.newPrice - a.oldPrice));
        break;
      case 'smallest':
        result.sort((a, b) => Math.abs(a.newPrice - a.oldPrice) - Math.abs(b.newPrice - b.oldPrice));
        break;
      default:
        break;
    }

    return result;
  }, [history, dateFrom, dateTo, sortOrder, searchQuery]);

  const totalPages = Math.ceil(filteredHistory.length / perPage) || 1;
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ── Stats ──────────────────────────────────────────────────
  const totalHikes = history.length;
  const avgChange = totalHikes > 0
    ? history.reduce((sum, h) => sum + (h.newPrice - h.oldPrice), 0) / totalHikes
    : 0;
  const biggestHike = totalHikes > 0
    ? Math.max(...history.map(h => h.newPrice - h.oldPrice))
    : 0;
  const originalPrice = totalHikes > 0
    ? history[history.length - 1].oldPrice
    : item.price;
  const totalChange = item.price - originalPrice;

  // ── Export via ReportModal ─────────────────────────────────
  const handleReportExport = async (type, rDateFrom, rDateTo) => {
    // Filter history by the report date range
    let exportHistory = [...history];
    if (rDateFrom) exportHistory = exportHistory.filter(h => h.date >= rDateFrom);
    if (rDateTo) exportHistory = exportHistory.filter(h => h.date <= rDateTo);

    const exportData = exportHistory.map(h => {
      const diff = h.newPrice - h.oldPrice;
      const pct = h.oldPrice > 0 ? (diff / h.oldPrice * 100) : 0;
      return { date: h.date, oldPrice: h.oldPrice, newPrice: h.newPrice, change: diff, changePct: pct };
    });

    if (type === 'csv') {
      const headers = 'Date,Old Price (MZN),New Price (MZN),Change (MZN),Change (%)\n';
      const rows = exportData.map(d => 
        `"${d.date}",${d.oldPrice.toFixed(2)},${d.newPrice.toFixed(2)},${d.change.toFixed(2)},${d.changePct.toFixed(1)}%`
      ).join('\n');
      
      const summary = `\n\nItem: ${item.name}\nReport Period: ${rDateFrom || 'All'} to ${rDateTo || 'All'}\nCurrent Price: MZN ${item.price.toFixed(2)}\nOriginal Price: MZN ${originalPrice.toFixed(2)}\nTotal Change: MZN ${totalChange.toFixed(2)}\nRecords in Range: ${exportData.length}\n`;
      const csv = headers + rows + summary;
      const fname = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-price-history.csv`;

      if (window.electronAPI) {
        const res = await window.electronAPI.exportCSV(csv, fname);
        if (res.success) {
          alert(`CSV exported: ${res.path}`);
          if (onAddReport) {
            onAddReport({
              title: `Price History: ${item.name}`,
              context: 'price_history',
              itemName: item.name,
              type: 'csv',
              dateFrom: rDateFrom || 'All Time',
              dateTo: rDateTo || 'All Time',
              recordCount: exportData.length
            });
          }
        }
      } else {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fname;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (onAddReport) {
          onAddReport({
            title: `Price History: ${item.name}`,
            context: 'price_history',
            itemName: item.name,
            type: 'csv',
            dateFrom: rDateFrom || 'All Time',
            dateTo: rDateTo || 'All Time',
            recordCount: exportData.length
          });
        }
      }
      setReportModalOpen(false);

    } else if (type === 'pdf') {
      setPrintData({
        history: exportHistory,
        dateFrom: rDateFrom,
        dateTo: rDateTo
      });
      setReportModalOpen(false);
      setTimeout(async () => {
        const fname = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-price-history.pdf`;
        let logged = false;
        if (window.electronAPI) {
          const res = await window.electronAPI.exportPDF(fname);
          if (res.success) {
            alert(`PDF saved: ${res.path}`);
            logged = true;
          }
        } else {
          window.print();
          logged = true;
        }
        if (logged && onAddReport) {
          onAddReport({
            title: `Price History: ${item.name}`,
            context: 'price_history',
            itemName: item.name,
            type: 'pdf',
            dateFrom: rDateFrom || 'All Time',
            dateTo: rDateTo || 'All Time',
            recordCount: exportHistory.length
          });
        }
        setTimeout(() => setPrintData(null), 1000);
      }, 300);
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSortOrder('newest');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const catInfo = STATIC_CATEGORIES.find(c => c.id === item.category);
  const hasActiveFilters = dateFrom || dateTo || sortOrder !== 'newest' || searchQuery;

  const printHistory = printData ? printData.history : filteredHistory;
  const printPeriod = printData 
    ? `${printData.dateFrom || 'All Time'} — ${printData.dateTo || 'All Time'}`
    : `${dateFrom || 'All Time'} — ${dateTo || 'All Time'}`;

  return (
    <>
      <div className="no-print">
        {/* Navigation bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light border shadow-sm px-3" onClick={onBack}>
              <i className="bi bi-arrow-left me-2"></i>Back to Items
            </button>
            <div>
              <h4 className="m-0 fw-bold">{item.name}</h4>
              <div className="d-flex align-items-center gap-2 mt-1">
                <span className="badge bg-light text-secondary border rounded-pill">
                  {catInfo ? catInfo.label : t('common.other')}
                </span>
                <span className="text-muted small">•</span>
                <span className="fw-bold" style={{ color: 'var(--cf-orange)' }}>
                  Current: MZN {item.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary shadow-sm" onClick={() => setReportModalOpen(true)} disabled={history.length === 0}>
            <i className="bi bi-file-earmark-bar-graph me-2"></i>Export Report
          </button>
        </div>

        {/* Stat cards */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body stat-card">
                <span className="stat-label">Original Price</span>
                <span className="stat-value">{originalPrice.toFixed(2)} MZN</span>
                <span className="stat-subtext">First recorded price</span>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body stat-card">
                <span className="stat-label">Total Change</span>
                <span className={`stat-value ${totalChange > 0 ? 'text-danger' : totalChange < 0 ? 'text-success' : ''}`}>
                  {totalChange > 0 ? '+' : ''}{totalChange.toFixed(2)} MZN
                </span>
                <span className="stat-subtext">Since first record</span>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body stat-card">
                <span className="stat-label">Avg. Change</span>
                <span className={`stat-value ${avgChange > 0 ? 'text-danger' : avgChange < 0 ? 'text-success' : ''}`}>
                  {avgChange > 0 ? '+' : ''}{avgChange.toFixed(2)} MZN
                </span>
                <span className="stat-subtext">Per hike event</span>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body stat-card">
                <span className="stat-label">Total Hikes</span>
                <span className="stat-value">{totalHikes}</span>
                <span className="stat-subtext">{biggestHike > 0 ? `Biggest: +${biggestHike.toFixed(2)} MZN` : 'No hikes yet'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-3">
            <div className="d-flex flex-wrap gap-3 align-items-end">
              <div>
                <label className="form-label small fw-bold text-muted mb-1">Search</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search history..." 
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{ minWidth: '160px' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label small fw-bold text-muted mb-1">From</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div>
                <label className="form-label small fw-bold text-muted mb-1">To</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div>
                <label className="form-label small fw-bold text-muted mb-1">Sort By</label>
                <select 
                  className="form-select form-select-sm" 
                  value={sortOrder}
                  onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }}
                  style={{ minWidth: '150px' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="biggest">Biggest Change</option>
                  <option value="smallest">Smallest Change</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                  <i className="bi bi-x-lg me-1"></i>Clear Filters
                </button>
              )}
              <div className="ms-auto text-muted small fw-medium align-self-center">
                {filteredHistory.length} of {history.length} records
              </div>
            </div>
          </div>
        </div>

        {/* Price History Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-3">
            <h5 className="fw-bold m-0">
              <i className="bi bi-graph-up-arrow me-2 text-danger"></i>
              Price History
            </h5>
          </div>
          <div className="card-body p-0 overflow-auto">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Date</th>
                  <th className="text-end">Old Price</th>
                  <th className="text-end">New Price</th>
                  <th className="text-end">Change (MZN)</th>
                  <th className="text-end pe-4">Change (%)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((h, i) => {
                  const diff = h.newPrice - h.oldPrice;
                  const pct = h.oldPrice > 0 ? (diff / h.oldPrice * 100) : 0;
                  const isIncrease = diff > 0;
                  const isDecrease = diff < 0;
                  return (
                    <tr key={`${h.date}-${i}`}>
                      <td className="ps-4">
                        <span className="fw-medium">{h.date}</span>
                      </td>
                      <td className="text-end text-muted">
                        <span className="text-decoration-line-through">{h.oldPrice.toFixed(2)} MZN</span>
                      </td>
                      <td className="text-end fw-bold text-dark">
                        {h.newPrice.toFixed(2)} MZN
                      </td>
                      <td className={`text-end fw-bold ${isIncrease ? 'text-danger' : isDecrease ? 'text-success' : ''}`}>
                        {isIncrease ? '+' : ''}{diff.toFixed(2)} MZN
                      </td>
                      <td className="text-end pe-4">
                        <span className={`badge ${isIncrease ? 'bg-danger-subtle text-danger' : isDecrease ? 'bg-success-subtle text-success' : 'bg-light text-muted'} rounded-pill px-3 py-2`}>
                          <i className={`bi ${isIncrease ? 'bi-arrow-up-short' : isDecrease ? 'bi-arrow-down-short' : 'bi-dash'} me-1`}></i>
                          {isIncrease ? '+' : ''}{pct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-5">
                      <i className="bi bi-inbox display-4 d-block mb-3 opacity-50"></i>
                      {history.length === 0 
                        ? 'No price hikes recorded yet. Use the "Hike" button to record price changes.' 
                        : 'No records match your current filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Print layout for PDF export — premium with logo */}
      <div className="print-only">
        <div className="report-page">
          {/* Report header with logo */}
          <div className="report-header-premium">
            <div className="report-logo-section">
              <img src="logo.svg" alt="MiMola" className="report-logo-img" />
            </div>
            <div className="report-header-divider"></div>
            <div className="report-meta">
              <div className="report-meta-label">PRICE HISTORY REPORT</div>
              <div className="report-meta-period">{item.name}</div>
              <div className="report-meta-date">Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="report-summary-row">
            <div className="report-summary-card">
              <div className="report-summary-label">CATEGORY</div>
              <div className="report-summary-value">{catInfo ? catInfo.label : 'Other'}</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">CURRENT PRICE</div>
              <div className="report-summary-value">{item.price.toFixed(2)} MZN</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">ORIGINAL PRICE</div>
              <div className="report-summary-value">{originalPrice.toFixed(2)} MZN</div>
            </div>
            <div className="report-summary-card">
              <div className="report-summary-label">TOTAL CHANGE</div>
              <div className={`report-summary-value ${totalChange > 0 ? 'report-expense' : 'report-income'}`}>
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(2)} MZN
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="report-section-title">Price Change History ({printHistory.length} records)</div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Old Price (MZN)</th>
                <th style={{ textAlign: 'right' }}>New Price (MZN)</th>
                <th style={{ textAlign: 'right' }}>Change (MZN)</th>
                <th style={{ textAlign: 'right' }}>Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {printHistory.map((h, i) => {
                const diff = h.newPrice - h.oldPrice;
                const pct = h.oldPrice > 0 ? (diff / h.oldPrice * 100) : 0;
                return (
                  <tr key={`print-${i}`}>
                    <td>{h.date}</td>
                    <td style={{ textAlign: 'right' }}>{h.oldPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{h.newPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{diff > 0 ? '+' : ''}{diff.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
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
              Confidential • {item.name}
            </div>
          </div>
        </div>
      </div>

      {/* Report date range modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onExport={handleReportExport}
        title={`Export: ${item.name}`}
        subtitle="Select a date range for the price history report."
      />
    </>
  );
}

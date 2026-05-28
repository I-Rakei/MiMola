import { useState, useMemo } from 'react';
import Pagination from './Pagination';
import ReportModal from './ReportModal';

export default function ReportsTab({ 
  reports, t, transactions,
  onDeleteReport, onRegenerate, requestConfirm, closeConfirm 
}) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'csv' | 'pdf'
  const [contextFilter, setContextFilter] = useState(''); // '' | 'financial' | 'price_history'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // Regenerate modal
  const [regenModal, setRegenModal] = useState(null); // report entry to regenerate

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.itemName || '').toLowerCase().includes(q) ||
        (r.context || '').toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter(r => r.type === typeFilter);
    }

    if (contextFilter) {
      result = result.filter(r => r.context === contextFilter);
    }

    if (dateFrom) {
      result = result.filter(r => r.generatedAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(r => r.generatedAt <= dateTo + 'T23:59:59');
    }

    // Sort newest first
    result.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

    return result;
  }, [reports, searchQuery, typeFilter, contextFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredReports.length / perPage) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * perPage, currentPage * perPage);

  const hasActiveFilters = searchQuery || typeFilter || contextFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setContextFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Stats
  const totalReports = reports.length;
  const csvCount = reports.filter(r => r.type === 'csv').length;
  const pdfCount = reports.filter(r => r.type === 'pdf').length;
  const financialCount = reports.filter(r => r.context === 'financial').length;
  const priceCount = reports.filter(r => r.context === 'price_history').length;

  const handleDelete = (report) => {
    requestConfirm(
      'Delete Report Record',
      `Are you sure you want to remove this report record? This only removes the log entry, not any exported files.`,
      () => {
        onDeleteReport(report.id);
        closeConfirm();
      }
    );
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="no-print">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0 fw-bold">Report History</h4>
        <span className="text-muted small">{totalReports} reports generated</span>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body stat-card">
              <span className="stat-label">Total Reports</span>
              <span className="stat-value">{totalReports}</span>
              <span className="stat-subtext">All time</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body stat-card">
              <span className="stat-label">Excel (CSV)</span>
              <span className="stat-value text-success">{csvCount}</span>
              <span className="stat-subtext">Spreadsheet exports</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body stat-card">
              <span className="stat-label">PDF Reports</span>
              <span className="stat-value text-danger">{pdfCount}</span>
              <span className="stat-subtext">Document exports</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body stat-card">
              <span className="stat-label">Categories</span>
              <span className="stat-value">{financialCount}<small className="text-muted fw-normal"> / </small>{priceCount}</span>
              <span className="stat-subtext">Financial / Price History</span>
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
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ minWidth: '160px' }}
                />
              </div>
            </div>
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Type</label>
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                style={{ minWidth: '120px' }}
              >
                <option value="">All Types</option>
                <option value="csv">Excel (CSV)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Category</label>
              <select
                className="form-select form-select-sm"
                value={contextFilter}
                onChange={e => { setContextFilter(e.target.value); setCurrentPage(1); }}
                style={{ minWidth: '150px' }}
              >
                <option value="">All Categories</option>
                <option value="financial">Financial Report</option>
                <option value="price_history">Price History</option>
              </select>
            </div>
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Generated From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div>
              <label className="form-label small fw-bold text-muted mb-1">Generated To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {hasActiveFilters && (
              <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                <i className="bi bi-x-lg me-1"></i>Clear
              </button>
            )}
            <div className="ms-auto text-muted small fw-medium align-self-center">
              {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>
      </div>

      {/* Reports table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Generated</th>
                <th>Report</th>
                <th>Period</th>
                <th className="text-center">Type</th>
                <th className="text-end">Records</th>
                <th className="text-end">Summary</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map(report => (
                <tr key={report.id}>
                  <td className="ps-4">
                    <div className="fw-medium">{formatDate(report.generatedAt)}</div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{report.title}</div>
                    <div className="text-muted small">
                      {report.context === 'financial' ? (
                        <><i className="bi bi-graph-up me-1"></i>Financial Report</>
                      ) : (
                        <><i className="bi bi-tag me-1"></i>{report.itemName || 'Price History'}</>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="small text-muted">
                      {report.dateFrom || '—'} → {report.dateTo || '—'}
                    </span>
                  </td>
                  <td className="text-center">
                    {report.type === 'csv' ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                        <i className="bi bi-file-earmark-spreadsheet me-1"></i>CSV
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">
                        <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                      </span>
                    )}
                  </td>
                  <td className="text-end fw-semibold">{report.recordCount}</td>
                  <td className="text-end">
                    {report.context === 'financial' ? (
                      <div className="small">
                        {report.income != null && (
                          <span className="text-success me-2">+{report.income.toLocaleString()}</span>
                        )}
                        {report.expenses != null && (
                          <span className="text-danger">-{report.expenses.toLocaleString()}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                  <td className="text-center pe-4">
                    <div className="d-flex gap-1 justify-content-center">
                      {report.context === 'financial' && (
                        <button
                          className="btn btn-sm btn-outline-primary py-1 px-2"
                          title="Regenerate this report"
                          onClick={() => setRegenModal(report)}
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        title="Delete record"
                        onClick={() => handleDelete(report)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5">
                    <i className="bi bi-file-earmark-x display-4 d-block mb-3 opacity-50"></i>
                    {reports.length === 0
                      ? 'No reports generated yet. Use the "Reports" button to create your first report.'
                      : 'No reports match your current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Regenerate modal — uses ReportModal with date range prefilled */}
      {regenModal && (
        <ReportModal
          isOpen={true}
          onClose={() => setRegenModal(null)}
          onExport={(type, dateFrom, dateTo) => {
            setRegenModal(null);
            onRegenerate(type, dateFrom, dateTo);
          }}
          title="Regenerate Report"
          subtitle={`Re-export based on: ${regenModal.title}`}
          transactions={transactions}
        />
      )}
    </div>
  );
}

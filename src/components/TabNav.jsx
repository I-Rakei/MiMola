export default function TabNav({ activeTab, setActiveTab, t, onOpenReport }) {
  const tabs = [
    { id: 'dashboard',    icon: 'bi-grid-fill',     label: t('nav.dashboard') },
    { id: 'items',        icon: 'bi-box-seam',      label: t('nav.items') },
    { id: 'expenses',     icon: 'bi-graph-down-arrow', label: t('nav.expenses') },
    { id: 'calendar',     icon: 'bi-calendar3',     label: t('nav.calendar') },
    { id: 'transactions', icon: 'bi-list-columns',  label: t('nav.ledger') },
    { id: 'reports',      icon: 'bi-file-earmark-bar-graph', label: t('nav.reports') },
    { id: 'settings',     icon: 'bi-gear',          label: t('nav.settings') },
  ];

  return (
    <div className="tabs-bar no-print">
      <div className="content-grid px-3 d-flex justify-content-between align-items-center">
        <ul className="nav app-tabs">
          {tabs.map(tab => (
            <li key={tab.id} className="nav-item">
              <button
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`bi ${tab.icon} me-1`}></i>{tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Single Report button — opens the date range modal */}
        <button 
          className="btn btn-sm btn-primary shadow-sm" 
          onClick={onOpenReport}
        >
          <i className="bi bi-file-earmark-bar-graph me-1"></i> Export Report
        </button>
      </div>
    </div>
  );
}

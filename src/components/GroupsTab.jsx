import { useState } from 'react';

export default function GroupsTab({
  groups, items, t,
  onGroupSubmit, onDeleteGroup, onToggleGroup,
  onDeleteItem, onStartEditItem,
}) {
  const [form, setForm] = useState({ id: '', name: '', monthlyBudget: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onGroupSubmit({ ...form, monthlyBudget: parseFloat(form.monthlyBudget) || 0, isEditing });
    setForm({ id: '', name: '', monthlyBudget: '', category: '' });
    setIsEditing(false);
  };

  const startEdit = (g) => {
    setForm({ id: g.id, name: g.name, monthlyBudget: g.monthlyBudget.toString(), category: g.category || '' });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ id: '', name: '', monthlyBudget: '', category: '' });
    setIsEditing(false);
  };

  return (
    <div className="row g-3 no-print">
      {/* Form */}
      <div className="col-lg-5">
        <div className="card">
          <div className="card-header">
            <span>{isEditing ? t('groups.editTitle') : t('groups.createTitle')}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label">{t('groups.nameLabel')}</label>
                <input type="text" className="form-control" placeholder={t('groups.namePlaceholder')}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <input type="text" className="form-control" placeholder="e.g. Food, Utilities"
                  value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary px-4">
                  {isEditing ? t('groups.save') : t('groups.add')}
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

      {/* Groups list */}
      <div className="col-lg-7">
        <div className="card">
          <div className="card-header">
            <span>{t('groups.listTitle')}</span>
          </div>
          <div className="card-body p-0">
            <ul className="list-group list-group-flush">
              {groups.map(g => {
                const isActive = g.active !== false;
                const groupItems = items.filter(it => it.groupId === g.id);
                const isExpanded = expandedGroup === g.id;

                return (
                  <li key={g.id}
                    className={`list-group-item ${!isActive ? 'group-inactive' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1" style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedGroup(isExpanded ? null : g.id)}>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'} small text-muted`}></i>
                          <div>
                            <div className={`fw-bold ${!isActive ? 'text-muted' : ''}`}>
                              {g.name}
                              {g.category && <span className="badge bg-light text-secondary ms-2 border">{g.category}</span>}
                            </div>
                            <span className="text-muted small">
                              {t('groups.limit')}: {g.monthlyBudget.toLocaleString()} MZN{t('groups.perMonth')}
                              <span className="ms-2">·</span>
                              <span className="ms-2">{groupItems.length} {t('nav.items').toLowerCase()}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-1 align-items-center">
                        <button
                          className={`btn btn-sm ${isActive ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                          onClick={() => onToggleGroup(g.id)}
                          title={isActive ? t('groups.deactivate') : t('groups.activate')}
                        >
                          {isActive ? (
                            <><i className="bi bi-pause-circle me-1"></i>{t('groups.active')}</>
                          ) : (
                            <><i className="bi bi-play-circle me-1"></i>{t('groups.inactive')}</>
                          )}
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => startEdit(g)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDeleteGroup(g.id, g.name)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    {/* Expanded: items in this group */}
                    {isExpanded && (
                      <div className="group-items-expand mt-2">
                        <div className="small fw-bold text-muted text-uppercase mb-1">
                          {t('groups.itemsInGroup')}
                        </div>
                        {groupItems.length > 0 ? (
                          <table className="table table-sm mb-0">
                            <tbody>
                              {groupItems.map(it => (
                                <tr key={it.id}>
                                  <td className="fw-semibold">{it.name}</td>
                                  <td className="text-cf-orange fw-bold">{it.price.toFixed(2)} MZN</td>
                                  <td className="text-end">
                                    <button className="btn btn-sm btn-light border py-0 me-1"
                                      onClick={() => onStartEditItem(it)}>
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger py-0"
                                      onClick={() => onDeleteItem(it.id, it.name)}>
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="small text-muted mb-0">{t('groups.noItemsInGroup')}</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
              {groups.length === 0 && (
                <li className="list-group-item text-center text-muted py-4">{t('groups.noGroups')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

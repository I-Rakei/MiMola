import { useState } from 'react';
import { LANGUAGES } from '../utils/i18n';
import { LOGO_PRESETS } from '../utils/db';

export default function SettingsTab({ profile, t, onSaveProfile, onResetApp }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    monthlyIncome: profile.monthlyIncome || '',
    primaryColor: profile.primaryColor || '#f6821f',
    appName: profile.appName || 'MiMola',
    appLogo: profile.appLogo || 'house',
    language: profile.language || 'en',
  });

  const handleSave = (e) => {
    e.preventDefault();
    onSaveProfile({
      ...form,
      monthlyIncome: parseFloat(form.monthlyIncome) || 0,
    });
  };

  const handleReset = () => {
    onResetApp();
  };

  return (
    <div className="row g-3 no-print">
      {/* Profile */}
      <div className="col-lg-6">
        <div className="card mb-3">
          <div className="card-header">
            <span>{t('settings.profileSection')}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              <div className="mb-2">
                <label className="form-label">{t('settings.nameLabel')}</label>
                <input type="text" className="form-control" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('settings.incomeLabel')}</label>
                <div className="input-group">
                  <span className="input-group-text">MZN</span>
                  <input type="number" className="form-control" value={form.monthlyIncome}
                    onChange={e => setForm({...form, monthlyIncome: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">{t('settings.save')}</button>
            </form>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-danger">
          <div className="card-header" style={{ color: '#dc3545' }}>
            <span>{t('settings.dangerZone')}</span>
          </div>
          <div className="card-body">
            <p className="small text-muted mb-2">{t('settings.resetConfirm')}</p>
            <button className="btn btn-outline-danger" onClick={handleReset}>
              <i className="bi bi-exclamation-triangle me-1"></i>{t('settings.resetApp')}
            </button>
          </div>
        </div>
      </div>

      {/* Appearance + Language */}
      <div className="col-lg-6">
        <div className="card mb-3">
          <div className="card-header">
            <span>{t('settings.appearanceSection')}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              {/* App Name */}
              <div className="mb-3">
                <label className="form-label">{t('settings.appNameLabel')}</label>
                <input type="text" className="form-control" value={form.appName}
                  onChange={e => setForm({...form, appName: e.target.value})} />
              </div>

              {/* Primary Colour */}
              <div className="mb-3">
                <label className="form-label">{t('settings.primaryColor')}</label>
                <div className="d-flex align-items-center gap-3">
                  <input type="color" className="form-control form-control-color"
                    value={form.primaryColor}
                    onChange={e => setForm({...form, primaryColor: e.target.value})}
                    style={{ width: 44, height: 36, padding: 2 }} />
                  <div className="color-presets d-flex gap-2">
                    {['#f6821f', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'].map(c => (
                      <button key={c} type="button"
                        className={`color-swatch ${form.primaryColor === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setForm({...form, primaryColor: c})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* App Logo */}
              <div className="mb-3">
                <label className="form-label">{t('settings.appLogoLabel')}</label>
                <div className="d-flex gap-2">
                  {LOGO_PRESETS.map(p => (
                    <button key={p.id} type="button"
                      className={`logo-preset-btn ${form.appLogo === p.id ? 'active' : ''}`}
                      onClick={() => setForm({...form, appLogo: p.id})}>
                      <i className={`bi ${p.icon}`}></i>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary">{t('settings.save')}</button>
            </form>
          </div>
        </div>

        {/* Language */}
        <div className="card">
          <div className="card-header">
            <span>{t('settings.languageSection')}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label">{t('settings.languageLabel')}</label>
                <select className="form-select" value={form.language}
                  onChange={e => setForm({...form, language: e.target.value})}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.native} — {l.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">{t('settings.save')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

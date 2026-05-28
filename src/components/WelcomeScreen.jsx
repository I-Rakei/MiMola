import { useState, useEffect } from 'react';
import { LANGUAGES, t as translate } from '../utils/i18n';

export default function WelcomeScreen({ appName, onComplete }) {
  const [step, setStep] = useState(0);         // 0 = splash, 1 = form
  const [lang, setLang] = useState('en');
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [theme, setTheme] = useState('light');

  const t = (key) => translate(lang, key);

  // After 1.8s the splash auto-advances — or user can click
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      monthlyIncome: parseFloat(income) || 0,
      language: lang,
      theme: theme,
    });
  };

  // Step 0 — Animated splash
  if (step === 0) {
    return (
      <div className="welcome-screen" onClick={() => setStep(1)}>
        <div className="welcome-splash">
          <div className="welcome-logo-ring">
            <img src="logo.svg" alt="Logo" className="welcome-logo-img" />
          </div>
          <h1 className="welcome-app-name">{appName}</h1>
          <p className="welcome-tagline">Household spending tracker</p>
          <div className="welcome-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 — Onboarding form
  return (
    <div className="welcome-screen">
      <div className="welcome-form-container">
        <div className="welcome-form-header">
          <div className="welcome-logo-ring welcome-logo-ring--small">
            <img src="logo.svg" alt="Logo" className="welcome-logo-img" />
          </div>
          <h2 className="welcome-title">{t('welcome.title')}</h2>
          <p className="welcome-subtitle">{t('welcome.subtitle')}</p>
        </div>

        <form className="welcome-form" onSubmit={handleSubmit}>
          {/* Language picker */}
          <div className="mb-3">
            <label className="form-label">{t('welcome.languageLabel')}</label>
            <div className="welcome-lang-grid">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={`welcome-lang-btn ${lang === l.code ? 'active' : ''}`}
                  onClick={() => setLang(l.code)}
                >
                  <span className="welcome-lang-native">{l.native}</span>
                  <span className="welcome-lang-name">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-3">
            <label className="form-label">{t('welcome.nameLabel')}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t('welcome.namePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Income */}
          <div className="mb-4">
            <label className="form-label">{t('welcome.incomeLabel')}</label>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white text-muted">MZN</span>
              <input type="number" step="0.01" className="form-control" placeholder="0.00"
                value={income} onChange={e => setIncome(e.target.value)} />
            </div>
            <div className="form-text mt-2">{t('welcome.incomeHelp')}</div>
          </div>



          <button
            type="submit"
            className="btn btn-primary w-100 py-2 welcome-start-btn"
            disabled={!name.trim()}
          >
            {t('welcome.start')}
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

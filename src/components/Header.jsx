import { LOGO_PRESETS } from '../utils/db';

export default function Header({ profile }) {
  const logoPreset = LOGO_PRESETS.find(p => p.id === profile.appLogo);
  const logoIcon = logoPreset ? logoPreset.icon : 'bi-house-fill';

  return (
    <header className="app-header no-print">
      <div className="content-grid d-flex align-items-center w-100 px-3">
        <div className="d-flex align-items-center">
          <img src="logo.svg" alt="Logo" style={{ height: '36px' }} />
        </div>
        {profile.name && (
          <span className="text-secondary small ms-3 ps-3" style={{ borderLeft: '1px solid var(--border)' }}>
            {profile.name}
          </span>
        )}
      </div>
    </header>
  );
}

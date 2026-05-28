export const useProfileController = ({ 
  profile, setProfile, transactions, setTransactions, items, setItems, setActiveTab, persist, DEFAULT_PROFILE, alertToast, requestConfirm, closeConfirm, t 
}) => {

  const handleSaveProfile = (data) => {
    const newProfile = { ...profile, ...data };
    setProfile(newProfile);
    persist({ profile: newProfile });
    alertToast(t('settings.saved'));
  };

  const handleResetApp = () => {
    requestConfirm(
      t('settings.dangerZone') || 'Reset Application', 
      t('settings.resetConfirm') || 'Are you sure you want to completely erase all your data? This action cannot be undone.', 
      () => {
        // Auto-backup before destructive reset
        try {
          const backup = {
            profile,
            transactions,
            items,
            backupDate: new Date().toISOString(),
          };
          localStorage.setItem('mimola_db_pre_reset_backup', JSON.stringify(backup));
        } catch (_) { /* best effort */ }

        setProfile(DEFAULT_PROFILE);
        setTransactions([]);
        setItems([]);
        persist({ profile: DEFAULT_PROFILE, transactions: [], items: [] });
        setActiveTab('dashboard');
        closeConfirm();
        alertToast('App has been reset.');
      }
    );
  };

  return { handleSaveProfile, handleResetApp };
};

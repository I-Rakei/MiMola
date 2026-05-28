export const useTransactionController = ({ 
  transactions, setTransactions, items, profile, persist, alertToast, requestConfirm, closeConfirm, t 
}) => {

  const handleAddExpense = (data) => {
    const tx = {
      id: 'tx_' + crypto.randomUUID(),
      amount: data.amount,
      groupId: data.type === 'expense' ? (data.groupId || '') : '',
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description,
      type: data.type,
      category: data.category,
    };
    setTransactions(prev => {
      const updated = [tx, ...prev];
      persist({ transactions: updated });
      return updated;
    });
    alertToast(`${t('common.logged')}: MZN ${tx.amount.toFixed(2)}`);
  };

  const handleDeleteTx = (id) => {
    requestConfirm(
      t('common.confirmDelete') || 'Confirm Deletion', 
      'Are you sure you want to delete this transaction?', 
      () => {
        setTransactions(prev => {
          const updated = prev.filter(tx => tx.id !== id);
          persist({ transactions: updated });
          return updated;
        });
        alertToast(t('common.deleted'));
        closeConfirm();
      }
    );
  };

  const handleRepeatExpenses = (pastExpenses) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTxs = pastExpenses.map(tx => ({
      ...tx,
      id: 'tx_' + crypto.randomUUID(),
      date: todayStr
    }));
    setTransactions(prev => {
      const updated = [...newTxs, ...prev];
      persist({ transactions: updated });
      return updated;
    });
    alertToast(`Duplicated ${newTxs.length} expenses to current month!`);
  };

  return { handleAddExpense, handleDeleteTx, handleRepeatExpenses };
};

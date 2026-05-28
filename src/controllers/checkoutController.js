export const useCheckoutController = ({ 
  transactions, setTransactions, items, profile, persist, alertToast, t 
}) => {

  const handleLogPurchase = (item) => {
    const tx = {
      id: 'tx_' + crypto.randomUUID(),
      amount: item.price,
      groupId: item.groupId,
      date: new Date().toISOString().split('T')[0],
      description: `Bought ${item.name}`,
      type: 'expense',
      category: item.category,
    };
    setTransactions(prev => {
      const updated = [tx, ...prev];
      persist({ transactions: updated });
      return updated;
    });
    alertToast(`${t('common.logged')}: ${item.name} (MZN ${item.price.toFixed(2)})`);
  };

  const handleCheckoutCart = (cartItems) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTxs = cartItems.map(c => ({
      id: 'tx_' + crypto.randomUUID(),
      amount: c.item.price * c.quantity,
      type: 'expense',
      category: c.item.category,
      date: todayStr,
      description: `Bought ${c.item.name} (x${c.quantity})`,
    }));
    
    setTransactions(prev => {
      const updated = [...newTxs, ...prev];
      persist({ transactions: updated });
      return updated;
    });
    
    const totalSpent = newTxs.reduce((s, tx) => s + tx.amount, 0);
    alertToast(`${t('common.logged')}: ${newTxs.length} items (MZN ${totalSpent.toFixed(2)})`);
  };

  return { handleLogPurchase, handleCheckoutCart };
};

export const useItemController = ({ 
  items, setItems, transactions, profile, persist, alertToast, requestConfirm, closeConfirm, t 
}) => {

  const handleQuickAddItem = (data) => {
    const item = {
      id: 'item_' + crypto.randomUUID(),
      name: data.name,
      price: data.price,
      category: data.category,
      quantity: data.quantity || 1,
      hikeHistory: []
    };
    setItems(prev => {
      const updated = [item, ...prev];
      persist({ items: updated });
      return updated;
    });
    alertToast(`${t('common.created')}: ${item.name}`);
  };

  const handleAddMultipleItems = (itemsArray) => {
    const newItems = itemsArray.map((data) => ({
      id: 'item_' + crypto.randomUUID(),
      name: data.name,
      price: data.price,
      category: data.category || '',
      quantity: 1,
      hikeHistory: []
    }));
    
    setItems(prev => {
      const updated = [...newItems, ...prev];
      persist({ items: updated });
      return updated;
    });
    alertToast(`${t('common.created')}: ${newItems.length} items added`);
  };

  const handleItemSubmit = (data) => {
    if (data.id) {
      // Edit mode
      setItems(prev => {
        const updated = prev.map(i => i.id === data.id ? { ...i, ...data } : i);
        persist({ items: updated });
        return updated;
      });
      alertToast(t('common.updated'));
    } else {
      // Create mode
      const item = {
        ...data,
        id: 'item_' + crypto.randomUUID(),
        hikeHistory: []
      };
      setItems(prev => {
        const updated = [item, ...prev];
        persist({ items: updated });
        return updated;
      });
      alertToast(t('common.created'));
    }
  };

  const handleDeleteItem = (id, name) => {
    requestConfirm(
      t('common.confirmDelete') || 'Confirm Deletion', 
      `Are you sure you want to delete ${name}? This will not affect past transactions.`, 
      () => {
        setItems(prev => {
          const updated = prev.filter(i => i.id !== id);
          persist({ items: updated });
          return updated;
        });
        alertToast(t('common.deleted'));
        closeConfirm();
      }
    );
  };

  const handlePriceHike = (itemId, oldPrice, newPrice) => {
    setItems(prev => {
      const updated = prev.map(i => {
        if (i.id === itemId) {
          const history = i.hikeHistory || [];
          return {
            ...i,
            price: newPrice,
            hikeHistory: [
              { oldPrice, newPrice, date: new Date().toISOString().split('T')[0] },
              ...history
            ]
          };
        }
        return i;
      });
      persist({ items: updated });
      return updated;
    });
    alertToast(t('common.updated'));
  };

  return { handleQuickAddItem, handleAddMultipleItems, handleItemSubmit, handleDeleteItem, handlePriceHike };
};

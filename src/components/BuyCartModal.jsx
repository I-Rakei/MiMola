import { useState, useMemo } from 'react';
import { STATIC_CATEGORIES } from '../utils/db';

export default function BuyCartModal({ items, baseIncome, onClose, onCheckout, t }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // cart is an array of objects: { item: itemObj, quantity: number }
  const [cart, setCart] = useState([]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory ? item.category === selectedCategory : true;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, selectedCategory]);

  // --- Cart Management ---
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.item.id === itemId) {
          const newQ = c.quantity + delta;
          return newQ > 0 ? { ...c, quantity: newQ } : c;
        }
        return c;
      });
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  // --- Calculations ---
  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
  const remainingIncome = baseIncome - cartTotal;

  // --- Checkout ---
  const handleSave = () => {
    if (cart.length === 0) return;
    onCheckout(cart);
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
      <div className="modal-dialog modal-fullscreen m-0 w-100 h-100">
        <div className="modal-content bg-light h-100 border-0 rounded-0 d-flex flex-column">
          
          {/* Header */}
          <div className="modal-header cf-accent-border bg-white shadow-sm z-1">
            <h5 className="modal-title d-flex align-items-center fw-bold">
              <i className="bi bi-cart3 text-primary me-2 fs-4"></i> Point of Sale
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          {/* Body */}
          <div className="modal-body p-0 d-flex flex-column flex-lg-row overflow-hidden">
            
            {/* Left Column: Catalog */}
            <div className="flex-grow-1 d-flex flex-column border-end bg-white" style={{ flexBasis: '60%' }}>
              
              {/* Search & Filter Bar */}
              <div className="p-3 border-bottom bg-light d-flex gap-2">
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search items..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="form-select" 
                  style={{ maxWidth: '200px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {STATIC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {/* Item Grid */}
              <div className="p-3 overflow-auto flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="row g-3">
                  {filteredItems.map(item => {
                    const catInfo = STATIC_CATEGORIES.find(c => c.id === item.category);
                    return (
                      <div key={item.id} className="col-sm-6 col-md-4 col-xl-3">
                        <div 
                          className="card h-100 border-0 shadow-sm hover-lift" 
                          style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                          onClick={() => addToCart(item)}
                        >
                          <div className="card-body text-center d-flex flex-column justify-content-between">
                            <div>
                              <div className="fw-bold text-dark mb-1">{item.name}</div>
                              <span className="badge bg-light text-secondary border rounded-pill small mb-2">
                                {catInfo ? catInfo.label : 'Other'}
                              </span>
                            </div>
                            <div className="fw-bold text-primary mt-2">{item.price.toFixed(2)} MZN</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <div className="col-12 text-center text-muted py-5">
                      <i className="bi bi-search display-4 d-block mb-3 opacity-50"></i>
                      No items found matching your filters.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Cart */}
            <div className="d-flex flex-column bg-white" style={{ flexBasis: '40%', minWidth: '350px' }}>
              
              {/* Cart Items */}
              <div className="flex-grow-1 overflow-auto p-3">
                <h5 className="fw-bold mb-4">Current Cart</h5>
                
                {cart.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-cart-x display-4 d-block mb-3 opacity-50"></i>
                    Your cart is empty.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {cart.map(c => (
                      <li key={c.item.id} className="list-group-item px-0 py-3 border-bottom d-flex justify-content-between align-items-center">
                        <div className="me-2" style={{ maxWidth: '50%' }}>
                          <div className="fw-bold text-truncate">{c.item.name}</div>
                          <div className="text-muted small">{c.item.price.toFixed(2)} MZN / ea</div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                          {/* Quantity Controls (Side by Side) */}
                          <div className="input-group input-group-sm" style={{ width: '100px' }}>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => updateQuantity(c.item.id, -1)}>-</button>
                            <input type="text" className="form-control text-center fw-bold px-0" value={c.quantity} readOnly />
                            <button className="btn btn-outline-secondary" type="button" onClick={() => updateQuantity(c.item.id, 1)}>+</button>
                          </div>
                          
                          <div className="fw-bold text-end" style={{ width: '80px' }}>
                            {(c.item.price * c.quantity).toFixed(2)}
                          </div>
                          
                          <button className="btn btn-sm text-danger p-0" onClick={() => removeFromCart(c.item.id)}>
                            <i className="bi bi-x-circle-fill fs-5"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Cart Footer / Summary */}
              <div className="mt-auto border-top p-4 bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Cart Value</span>
                  <span className="fs-4 fw-bold text-dark">{cartTotal.toLocaleString()} MZN</span>
                </div>
                
                <hr className="my-3 opacity-10" />
                
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted text-uppercase fw-bold">Monthly Income</span>
                  <span className="fw-semibold text-success">{baseIncome.toLocaleString()} MZN</span>
                </div>
                
                <div className="d-flex justify-content-between small mb-4">
                  <span className="text-muted text-uppercase fw-bold">Remaining After Purchase</span>
                  <span className={`fw-bold ${remainingIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                    {remainingIncome.toLocaleString()} MZN
                  </span>
                </div>

                <button 
                  className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm rounded-3"
                  disabled={cart.length === 0}
                  onClick={handleSave}
                >
                  <i className="bi bi-check-circle me-2"></i> Checkout & Save
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

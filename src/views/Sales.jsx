import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PrintableInvoice } from '../components/print/PrintableInvoice';
import {
  ShoppingCart,
  Plus,
  Trash2,
  User,
  CreditCard,
  DollarSign,
  Printer,
  RotateCcw,
  CheckCircle2,
  Smartphone,
  Search,
} from 'lucide-react';
import { sortByNewest } from '../utils/sortUtils';

export const Sales = ({ searchQuery = '', setSelectedSale, setActiveTab }) => {
  const {
    storeSettings,
    products,
    customers,
    createSale,
    refundSale,
    sales,
    isAdmin,
  } = useApp();

  // Selected Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);

  // Product Selection Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedImei, setSelectedImei] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // Financial Adjustments
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Invoice & Refund Modal
  const [currentSaleInvoice, setCurrentSaleInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [targetRefundSale, setTargetRefundSale] = useState(null);

  // Handle Customer Selection
  const handleCustomerChange = (id) => {
    setSelectedCustomerId(id);
    if (id) {
      const c = customers.find((cust) => cust.id === id);
      if (c) {
        setCustomerName(c.name);
        setCustomerPhone(c.phone);
      }
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  // Handle Product Picker Selection
  const handleProductSelect = (id) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setItemPrice(prod.salePrice);
      setSelectedImei(prod.imei1 || '');
    }
  };

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (prod.stock < itemQty) {
      alert(`Only ${prod.stock} units left in stock!`);
      return;
    }

    const cartItem = {
      productId: prod.id,
      brand: prod.brand,
      model: prod.model,
      category: prod.category || 'New Phone',
      color: prod.color,
      imei: selectedImei || prod.imei1 || 'N/A',
      price: parseFloat(itemPrice) || prod.salePrice,
      quantity: parseInt(itemQty, 10) || 1,
      total: (parseFloat(itemPrice) || prod.salePrice) * (parseInt(itemQty, 10) || 1),
    };

    setCart((prev) => [...prev, cartItem]);

    // Reset picker
    setSelectedProductId('');
    setSelectedImei('');
    setItemPrice('');
    setItemQty(1);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Financial Computations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const grandTotal = Math.max(0, subtotal - (parseFloat(discount) || 0) + taxAmount);
  const actualPaid = paidAmount === '' ? grandTotal : parseFloat(paidAmount);
  const balanceDue = Math.max(0, grandTotal - actualPaid);

  // Submit Sale & Generate Invoice
  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Please add at least one mobile device or item to the cart!');
      return;
    }

    const salePayload = {
      customerId: selectedCustomerId || null,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      items: cart,
      subtotal,
      discount,
      tax: taxAmount,
      grandTotal,
      paidAmount: actualPaid,
      paymentMethod,
    };

    // Await async API call
    const newSale = await createSale(salePayload);
    if (newSale) {
      setCurrentSaleInvoice(newSale);
      setIsInvoiceModalOpen(true);

      // Reset POS Terminal
      setCart([]);
      setSelectedCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setPaidAmount('');
    }
  };

  // Process Refund
  const handleProcessRefund = (sale, productId) => {
    if (window.confirm(`Confirm return & restock for ${sale.invoiceNo}?`)) {
      const ok = refundSale(sale.id, productId, 1);
      if (ok) {
        setIsRefundModalOpen(false);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Point of Sale (POS) & Checkout</h1>
          <p className="page-subtitle">Process customer sales, select IMEIs, generate invoices, and deduct stock</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="btn btn-secondary"
          >
            <RotateCcw size={16} />
            <span>Process Return / Refund</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Left Side: Product Selector & Cart Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Add Product to Cart Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} color="var(--accent-cyan)" />
              <span>Select Product & IMEI</span>
            </h3>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Select Mobile Device from Stock</label>
                <select
                  className="form-select"
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                >
                  <option value="">-- Choose Mobile / Product --</option>
                  {products
                    .filter((p) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        (p.brand && p.brand.toLowerCase().includes(q)) ||
                        (p.model && p.model.toLowerCase().includes(q)) ||
                        (p.imei1 && String(p.imei1).includes(searchQuery)) ||
                        (p.imei2 && String(p.imei2).includes(searchQuery))
                      );
                    })
                    .map((p) => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        [{p.category || 'New Phone'}] {p.brand} {p.model} ({p.ram}/{p.storage}) - {p.ptaStatus} | Stock: {p.stock} | Price: {storeSettings.currency} {(p.salePrice || 0).toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {selectedProductId && (
              <div className="form-row" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">IMEI Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter or select IMEI"
                    value={selectedImei}
                    onChange={(e) => setSelectedImei(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Unit Price ({storeSettings.currency})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ maxWidth: '100px' }}>
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <button onClick={handleAddToCart} type="button" className="btn btn-emerald" style={{ height: '42px', width: '100%' }}>
                    <Plus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Cart Items Table */}
          <div className="glass-card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem 0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sales Order Items ({cart.length})</h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="btn btn-danger btn-sm">
                  Clear Cart
                </button>
              )}
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>IMEI</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Cart is empty. Select a mobile device above to add to cart.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700 }}>{item.brand} {item.model}</span>
                            <Badge variant={item.category || 'New Phone'}>{item.category || 'New Phone'}</Badge>
                          </div>
                          {item.color && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color: {item.color}</div>}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                          {item.imei}
                        </td>
                        <td>{storeSettings.currency} {(item.price || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          {storeSettings.currency} {(item.total || 0).toLocaleString()}
                        </td>
                        <td>
                          <button onClick={() => removeFromCart(idx)} className="btn btn-danger btn-icon" style={{ width: '30px', height: '30px' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Customer Info & Checkout Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Selection */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent-violet)" />
              <span>Customer Information</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Select Registered Customer (Optional)</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                <option value="">-- Walk-in / Unregistered Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - Dues: {storeSettings.currency} {(c.remainingCredit || c.dues || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Muhammad Ali"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="03001234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--accent-emerald)" />
              <span>Payment Summary</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>{storeSettings.currency} {(subtotal || 0).toLocaleString()}</span>
              </div>

              {/* Discount Input */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="form-label">Discount ({storeSettings.currency}):</span>
                <input
                  type="number"
                  style={{ width: '110px', height: '32px', textAlign: 'right' }}
                  className="form-input"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              {/* Tax Rate Input */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="form-label">Tax Rate (%):</span>
                <input
                  type="number"
                  style={{ width: '110px', height: '32px', textAlign: 'right' }}
                  className="form-input"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              {/* Grand Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderTop: '1px dashed var(--border-color)',
                  borderBottom: '1px dashed var(--border-color)',
                  margin: '0.5rem 0',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                }}
              >
                <span>Grand Total:</span>
                <span>{storeSettings.currency} {(grandTotal || 0).toLocaleString()}</span>
              </div>

              {/* Payment Method Option */}
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`btn ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online')}
                    className={`btn ${paymentMethod === 'Online' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Online / Card
                  </button>
                </div>
              </div>

              {/* Amount Paid Input */}
              <div className="form-group">
                <label className="form-label">Amount Recieved ({storeSettings.currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={`Default: ${grandTotal || 0}`}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>

              {/* Remaining Balance Dues */}
              {(balanceDue || 0) > 0 && (
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fb7185',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    justify: 'space-between',
                  }}
                >
                  <span>Remaining Credit Due:</span>
                  <span>{storeSettings.currency} {(balanceDue || 0).toLocaleString()}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="btn btn-emerald"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
            >
              <CheckCircle2 size={18} />
              <span>Complete Sale & Print Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Sale Completed Successfully"
      >
        <PrintableInvoice
          sale={currentSaleInvoice}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Process Item Refund & Restock"
      >
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Select an invoice to return a mobile unit and restore stock:
          </p>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Item to Refund</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales
                  .filter((s) => s.status !== 'Refunded')
                  .sort(sortByNewest)
                  .slice(0, 5)
                  .map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{s.invoiceNo}</td>
                      <td>{s.customerName}</td>
                      <td>
                        {(s.items || []).map((it, i) => (
                          <div key={i} style={{ fontSize: '0.85rem' }}>
                            {it.brand} {it.model} ({it.imei})
                          </div>
                        ))}
                      </td>
                      <td>
                        {(s.items || []).map((it, i) => (
                          <button
                            key={i}
                            onClick={() => handleProcessRefund(s, it.productId)}
                            className="btn btn-danger btn-sm"
                          >
                            Refund & Restock
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

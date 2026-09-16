import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ShoppingBag, Plus, Truck, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { sortByNewest } from '../utils/sortUtils';

export const Purchases = () => {
  const {
    storeSettings,
    products,
    suppliers,
    purchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    isAdmin,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editSupplierName, setEditSupplierName] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('Paid');

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imeiInput, setImeiInput] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const handleSupplierSelect = (id) => {
    setSelectedSupplierId(id);
    const s = suppliers.find((supp) => supp.id === id);
    if (s) {
      setSupplierName(s.name);
    }
  };

  const handleProductSelect = (id) => {
    setSelectedProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      setPurchasePrice(p.purchasePrice);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || !supplierName) {
      alert('Please select a supplier and a product!');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    const cost = parseFloat(purchasePrice) || prod?.purchasePrice || 0;
    const qty = parseInt(quantity, 10) || 1;
    const totalCost = cost * qty;
    const actualPaid = paidAmount === '' ? totalCost : parseFloat(paidAmount);

    const purchasePayload = {
      supplierId: selectedSupplierId || null,
      supplierName,
      items: [
        {
          productId: selectedProductId,
          productName: `${prod?.brand} ${prod?.model}`,
          imei: imeiInput || prod?.imei1 || 'N/A',
          purchasePrice: cost,
          quantity: qty,
          total: totalCost,
        },
      ],
      totalAmount: totalCost,
      paidAmount: actualPaid,
      paymentStatus: actualPaid >= totalCost ? 'Paid' : 'Partial',
    };

    createPurchase(purchasePayload);
    setIsModalOpen(false);

    // Reset Form
    setSelectedSupplierId('');
    setSupplierName('');
    setSelectedProductId('');
    setPurchasePrice('');
    setQuantity(1);
    setImeiInput('');
    setPaidAmount('');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase & Stock Influx Management</h1>
          <p className="page-subtitle">Record inventory purchases from suppliers, add stock, and track payables</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-emerald">
          <Plus size={16} />
          <span>New Stock Purchase</span>
        </button>
      </div>

      {/* Purchase History Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stock Purchase History</h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier Name</th>
                <th>Purchased Items & IMEIs</th>
                <th>Date</th>
                <th>Total Cost</th>
                <th>Paid Amount</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                [...purchases].sort(sortByNewest).map((po) => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      {po.purchaseNo}
                    </td>
                    <td style={{ fontWeight: 600 }}>{po.supplierName}</td>
                    <td>
                      {po.items.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          {it.productName} (x{it.quantity}){' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                            [{it.imei || 'N/A'}]
                          </span>
                        </div>
                      ))}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{po.date}</td>
                    <td style={{ fontWeight: 700 }}>
                      {storeSettings.currency} {(po.totalAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {storeSettings.currency} {(po.paidAmount || 0).toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={po.paymentStatus || 'Paid'}>{po.paymentStatus || 'Paid'}</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setEditingPurchase(po);
                            setEditSupplierName(po.supplierName);
                            setEditTotalAmount(po.totalAmount);
                            setEditPaidAmount(po.paidAmount);
                            setEditPaymentStatus(po.paymentStatus || 'Paid');
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Edit Purchase Order"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete purchase order ${po.purchaseNo}? Inventory stock will be adjusted accordingly.`)) {
                              deletePurchase(po.id);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          title="Delete Purchase Order"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Stock Purchase Order"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Supplier</label>
            <select
              className="form-select"
              value={selectedSupplierId}
              onChange={(e) => handleSupplierSelect(e.target.value)}
            >
              <option value="">-- Choose Supplier or Enter Name Below --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Supplier Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Telemart Wholesalers"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Mobile Device / Product to Restock *</label>
            <select
              className="form-select"
              required
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.category || 'New Phone'}] {p.brand} {p.model} ({p.ram}/{p.storage}) | Current Stock: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unit Purchase Price ({storeSettings.currency})</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity to Add</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">IMEI Number (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter new IMEI number for unit"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Cost: {storeSettings.currency} {((parseFloat(purchasePrice) || 0) * (parseInt(quantity, 10) || 1)).toLocaleString()}</label>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paid to Supplier ({storeSettings.currency})</label>
              <input
                type="number"
                className="form-input"
                placeholder="Leave blank if fully paid"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald">
              Record Purchase & Increase Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal
        isOpen={Boolean(editingPurchase)}
        onClose={() => setEditingPurchase(null)}
        title={editingPurchase ? `Edit Purchase Order: ${editingPurchase.purchaseNo}` : 'Edit Purchase Order'}
      >
        {editingPurchase && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newTotal = parseFloat(editTotalAmount) || 0;
              const newPaid = parseFloat(editPaidAmount) || 0;
              updatePurchase(editingPurchase.id, {
                supplierName: editSupplierName,
                totalAmount: newTotal,
                paidAmount: newPaid,
                paymentStatus: editPaymentStatus,
              });
              setEditingPurchase(null);
            }}
          >
            <div className="form-group">
              <label className="form-label">Supplier Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editSupplierName}
                onChange={(e) => setEditSupplierName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Cost ({storeSettings.currency}) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="form-input"
                  value={editTotalAmount}
                  onChange={(e) => setEditTotalAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Paid Amount ({storeSettings.currency})</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={editPaidAmount}
                  onChange={(e) => setEditPaidAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={editPaymentStatus}
                onChange={(e) => setEditPaymentStatus(e.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditingPurchase(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

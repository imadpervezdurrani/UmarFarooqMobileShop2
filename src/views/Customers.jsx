import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Users, Plus, DollarSign, BookOpen, Phone, MapPin, CheckCircle2, Edit, Trash2 } from 'lucide-react';

export const Customers = ({ searchQuery }) => {
  const { storeSettings, customers, addCustomer, updateCustomer, deleteCustomer, recordCustomerPayment, sales } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDues, setEditDues] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    remainingCredit: 0,
  });

  // Ledger & Payment Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addCustomer(formData);
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', address: '', remainingCredit: 0 });
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;
    recordCustomerPayment(selectedCustomer.id, paymentAmount);
    setIsPaymentOpen(false);
    setPaymentAmount('');
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      !searchQuery ||
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && String(c.phone).includes(searchQuery)) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalOutstandingDues = customers.reduce((sum, c) => sum + (c.remainingCredit || c.dues || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Ledger & Credit Dues</h1>
          <p className="page-subtitle">Manage customer directory, track credit dues, and collect partial payments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            className="glass-card"
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Outstanding Dues:</div>
            <div style={{ fontWeight: 800, color: '#fb7185', fontSize: '1.1rem' }}>
              {storeSettings.currency} {(totalOutstandingDues || 0).toLocaleString()}
            </div>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Total Purchases</th>
                <th>Total Paid</th>
                <th>Remaining Credit Dues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{c.phone || 'N/A'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.address || 'N/A'}</td>
                    <td>{storeSettings.currency} {(c.totalPurchases || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {storeSettings.currency} {(c.totalPaid || 0).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: (c.remainingCredit || c.dues || 0) > 0 ? '#fb7185' : 'var(--accent-emerald)' }}>
                      {storeSettings.currency} {(c.remainingCredit || c.dues || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsLedgerOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="View Ledger"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <BookOpen size={14} />
                        </button>
                        {(c.remainingCredit || c.dues || 0) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsPaymentOpen(true);
                            }}
                            className="btn btn-emerald btn-sm"
                            title="Collect Dues"
                            style={{ padding: '0.35rem 0.5rem' }}
                          >
                            <DollarSign size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCustomer(c);
                            setEditName(c.name || '');
                            setEditPhone(c.phone || '');
                            setEditAddress(c.address || '');
                            setEditDues(c.remainingCredit ?? c.dues ?? 0);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Edit Customer Profile & Dues"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            const dues = c.remainingCredit || c.dues || 0;
                            const confirmMsg = dues > 0
                              ? `Warning: ${c.name} has ${storeSettings.currency} ${dues.toLocaleString()} unpaid dues. Are you sure you want to delete this customer?`
                              : `Are you sure you want to delete customer ${c.name}?`;
                            if (window.confirm(confirmMsg)) {
                              deleteCustomer(c.id);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          title="Delete Customer Profile"
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

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer Profile"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Muhammad Usman"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="03xx-xxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="City / Sector"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Credit Dues ({storeSettings.currency})</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={formData.remainingCredit}
              onChange={(e) => setFormData({ ...formData, remainingCredit: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Ledger Modal */}
      <Modal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        title={selectedCustomer ? `Customer Account Ledger: ${selectedCustomer.name}` : 'Customer Ledger'}
      >
        {selectedCustomer && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div>Phone: <strong>{selectedCustomer.phone || 'N/A'}</strong></div>
              <div>Remaining Dues: <strong style={{ color: '#fb7185' }}>{storeSettings.currency} {(selectedCustomer.remainingCredit || selectedCustomer.dues || 0).toLocaleString()}</strong></div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice No</th>
                    <th>Grand Total</th>
                    <th>Paid</th>
                    <th>Remaining Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {sales
                    .filter((s) => s.customerId === selectedCustomer.id)
                    .map((s) => (
                      <tr key={s.id}>
                        <td>{s.date || 'N/A'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{s.invoiceNo}</td>
                        <td>{storeSettings.currency} {(s.grandTotal || s.netTotal || s.totalAmount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--accent-emerald)' }}>{storeSettings.currency} {(s.paidAmount || 0).toLocaleString()}</td>
                        <td style={{ color: '#fb7185', fontWeight: 600 }}>{storeSettings.currency} {(s.remainingBalance ?? s.dueAmount ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={selectedCustomer ? `Collect Dues Payment: ${selectedCustomer.name}` : 'Collect Payment'}
      >
        {selectedCustomer && (
          <form onSubmit={handleRecordPaymentSubmit}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Current Outstanding Balance: <strong style={{ color: '#fb7185' }}>{storeSettings.currency} {(selectedCustomer.remainingCredit || selectedCustomer.dues || 0).toLocaleString()}</strong>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount Received ({storeSettings.currency}) *</label>
              <input
                type="number"
                step="any"
                required
                max={selectedCustomer.remainingCredit || selectedCustomer.dues || 0}
                className="form-input"
                placeholder={`Max: ${selectedCustomer.remainingCredit || selectedCustomer.dues || 0}`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setIsPaymentOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald">
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Customer & Dues Modal */}
      <Modal
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Edit Customer'}
      >
        {editingCustomer && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCustomer(editingCustomer.id, {
                name: editName,
                phone: editPhone,
                address: editAddress,
                remainingCredit: parseFloat(editDues) || 0,
              });
              setEditingCustomer(null);
            }}
          >
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Outstanding Credit Dues ({storeSettings.currency})</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={editDues}
                onChange={(e) => setEditDues(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditingCustomer(null)} className="btn btn-secondary">
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

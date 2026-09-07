import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import {
  Truck,
  Plus,
  DollarSign,
  Printer,
  History,
  ShoppingBag,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const Suppliers = ({ searchQuery }) => {
  const {
    storeSettings,
    suppliers,
    addSupplier,
    recordSupplierPayment,
    recordSupplierBill,
    fetchSupplierLedger,
    purchases,
    processPurchaseReturn,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    openingBalance: 0,
  });

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [activeLedgerData, setActiveLedgerData] = useState(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  // Form states
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const [billTotalAmount, setBillTotalAmount] = useState('');
  const [billPaidAmount, setBillPaidAmount] = useState('0');
  const [billNotes, setBillNotes] = useState('');

  const [returnPurchaseId, setReturnPurchaseId] = useState('');
  const [returnProductId, setReturnProductId] = useState('');
  const [returnAmount, setReturnAmount] = useState('');
  const [returnReason, setReturnReason] = useState('');

  // Fetch Ledger data whenever selectedSupplier changes
  useEffect(() => {
    if (selectedSupplier) {
      fetchSupplierLedger(selectedSupplier.id).then((data) => {
        if (data) {
          setActiveLedgerData(data);
        }
      });
    } else {
      setActiveLedgerData(null);
    }
  }, [selectedSupplier, suppliers, purchases]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addSupplier({
      ...formData,
      openingBalance: parseFloat(formData.openingBalance) || 0,
      amountPayable: parseFloat(formData.openingBalance) || 0,
    });
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', address: '', openingBalance: 0 });
  };

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplier || !payoutAmount) return;
    recordSupplierPayment(selectedSupplier.id, payoutAmount, payoutNotes);
    setIsPayoutOpen(false);
    setPayoutAmount('');
    setPayoutNotes('');
  };

  const handleBillSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplier || !billTotalAmount) return;
    recordSupplierBill(selectedSupplier.id, billTotalAmount, billPaidAmount, billNotes);
    setIsBillOpen(false);
    setBillTotalAmount('');
    setBillPaidAmount('0');
    setBillNotes('');
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnPurchaseId || !returnAmount) return;
    processPurchaseReturn(returnPurchaseId, {
      productId: returnProductId,
      returnAmount: parseFloat(returnAmount),
      reason: returnReason,
    });
    setIsReturnOpen(false);
    setReturnPurchaseId('');
    setReturnProductId('');
    setReturnAmount('');
    setReturnReason('');
  };

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      !searchQuery ||
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.phone && String(s.phone).includes(searchQuery)) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalPayableDues = suppliers.reduce(
    (sum, s) => sum + (parseFloat(s.amountPayable || s.closingPayable || 0)),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Accounts & Double-Entry Ledger</h1>
          <p className="page-subtitle">
            Manage wholesale supplier payables, credit purchases, debit payments, and purchase returns
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            className="glass-card"
            style={{
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closing Payable Dues:</div>
            <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>
              {storeSettings.currency} {totalPayableDues.toLocaleString()} Cr
            </div>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Supplier Profile</span>
          </button>
        </div>
      </div>

      {/* Main Suppliers Directory Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Supplier Profile</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Opening Balance</th>
                <th>Total Purchases (Cr)</th>
                <th>Total Payments / Returns (Dr)</th>
                <th>Current Payable (Cr)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No suppliers match search criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={16} color="var(--accent-cyan)" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.phone}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.address || 'N/A'}</td>
                    <td>{storeSettings.currency} {(s.openingBalance || 0).toLocaleString()} Cr</td>
                    <td>{storeSettings.currency} {(s.totalPurchases || 0).toLocaleString()} Cr</td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {storeSettings.currency} {(s.amountPaid || s.totalPayments || 0).toLocaleString()} Dr
                    </td>
                    <td
                      style={{
                        fontWeight: 800,
                        color: (s.amountPayable || 0) > 0 ? '#fbbf24' : 'var(--accent-emerald)',
                      }}
                    >
                      {storeSettings.currency} {(s.amountPayable || 0).toLocaleString()} Cr
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {/* 1. View Ledger / Statement */}
                        <button
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsStatementOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="View complete accounting ledger & running balance"
                        >
                          <History size={13} />
                          <span>Ledger</span>
                        </button>

                        {/* 2. Add Bill (Credit Purchase) */}
                        <button
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsBillOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          title="Add stock purchase bill (Credit Payable)"
                        >
                          <ShoppingBag size={13} />
                          <span>Add Purchase (Cr)</span>
                        </button>

                        {/* 3. Send Payout (Debit Payment) */}
                        <button
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsPayoutOpen(true);
                          }}
                          className="btn btn-emerald btn-sm"
                          title="Record payment to supplier (Debit Payment)"
                        >
                          <DollarSign size={13} />
                          <span>Pay (Dr)</span>
                        </button>

                        {/* 4. Purchase Return (Debit Credit) */}
                        <button
                          onClick={() => {
                            setSelectedSupplier(s);
                            const suppPos = purchases.filter((p) => p.supplierId === s.id);
                            if (suppPos.length > 0) {
                              setReturnPurchaseId(suppPos[0].id);
                            }
                            setIsReturnOpen(true);
                          }}
                          className="btn btn-amber btn-sm"
                          title="Record purchase return to supplier (Debit)"
                        >
                          <RotateCcw size={13} />
                          <span>Return (Dr)</span>
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

      {/* Register New Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Supplier Profile"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Supplier Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Telemart Wholesalers"
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
            <label className="form-label">Address / Plaza</label>
            <input
              type="text"
              className="form-input"
              placeholder="Hafeez Center, Lahore"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Opening Balance ({storeSettings.currency} Cr) *</label>
            <input
              type="number"
              step="any"
              className="form-input"
              placeholder="0 (Initial credit balance owed to supplier)"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Accounting Ledger & Statement Modal */}
      <Modal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        title={selectedSupplier ? `Supplier Accounting Ledger: ${selectedSupplier.name}` : 'Supplier Ledger'}
      >
        {selectedSupplier && (
          <div>
            {/* Top Action Bar */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={16} color="var(--accent-cyan)" />
                <span>Double-Entry Running Balance Account Ledger</span>
              </div>
              <button onClick={() => window.print()} className="btn btn-primary btn-sm">
                <Printer size={14} />
                <span>Print Ledger Statement</span>
              </button>
            </div>

            {/* Printable Statement Document */}
            <div
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '2rem',
                borderRadius: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    {storeSettings.storeName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{storeSettings.tagline}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{storeSettings.address}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                    SUPPLIER PAYABLE LEDGER
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Statement Date: {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
              </div>

              {/* Profile & Summary Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Supplier Profile:
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginTop: '0.2rem' }}>
                    {selectedSupplier.name}
                  </div>
                  <div style={{ color: '#475569' }}>Phone: {selectedSupplier.phone}</div>
                  <div style={{ color: '#475569' }}>Address: {selectedSupplier.address || 'N/A'}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Ledger Dues Summary:
                  </div>
                  <div style={{ marginTop: '0.2rem', color: '#475569' }}>
                    Opening Balance: <strong>{storeSettings.currency} {(activeLedgerData?.openingBalance || selectedSupplier.openingBalance || 0).toLocaleString()} Cr</strong>
                  </div>
                  <div style={{ color: '#0284c7' }}>
                    Total Purchases (Credit): <strong>{storeSettings.currency} {(activeLedgerData?.totalCredit || selectedSupplier.totalPurchases || 0).toLocaleString()} Cr</strong>
                  </div>
                  <div style={{ color: '#16a34a' }}>
                    Total Payments & Returns (Debit): <strong>{storeSettings.currency} {(activeLedgerData?.totalDebit || selectedSupplier.amountPaid || 0).toLocaleString()} Dr</strong>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
                    Closing Payable: {storeSettings.currency} {(activeLedgerData?.closingPayable || selectedSupplier.amountPayable || 0).toLocaleString()} Cr
                  </div>
                </div>
              </div>

              {/* Detailed Ledger Table */}
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                Chronological Account Ledger Transactions:
              </div>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.825rem',
                  marginBottom: '1.5rem',
                }}
              >
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Description & Ref</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Debit (Dr)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Credit (Cr)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {!activeLedgerData || activeLedgerData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No ledger transactions logged for this supplier yet.
                      </td>
                    </tr>
                  ) : (
                    activeLedgerData.transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{tx.date}</td>
                        <td style={{ padding: '0.65rem 0.75rem', textTransform: 'capitalize', fontWeight: 700 }}>
                          <span
                            style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background:
                                tx.type === 'purchase'
                                  ? '#e0f2fe'
                                  : tx.type === 'payment'
                                  ? '#dcfce7'
                                  : tx.type === 'purchase_return'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                              color:
                                tx.type === 'purchase'
                                  ? '#0369a1'
                                  : tx.type === 'payment'
                                  ? '#15803d'
                                  : tx.type === 'purchase_return'
                                  ? '#b45309'
                                  : '#334155',
                            }}
                          >
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.description}</div>
                          {tx.referenceId && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                              Ref: {tx.referenceId}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>
                          {tx.debit > 0 ? `${storeSettings.currency} ${tx.debit.toLocaleString()} Dr` : '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#0284c7', fontWeight: 700 }}>
                          {tx.credit > 0 ? `${storeSettings.currency} ${tx.credit.toLocaleString()} Cr` : '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {storeSettings.currency} {tx.balance.toLocaleString()} {tx.balanceType}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Statement Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1rem',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <div>Double-entry accounting ledger verified for {selectedSupplier.name}</div>
                <div style={{ textAlign: 'center', borderTop: '1px solid #cbd5e1', width: '180px', paddingTop: '0.25rem', color: '#475569' }}>
                  Authorized Stamp & Signature
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Stock Purchase Bill Modal */}
      <Modal
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        title={selectedSupplier ? `Add Stock Purchase (Credit): ${selectedSupplier.name}` : 'Add Purchase'}
      >
        {selectedSupplier && (
          <form onSubmit={handleBillSubmit}>
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Payable Dues:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                {storeSettings.currency} {(selectedSupplier.amountPayable || 0).toLocaleString()} Cr
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Total Amount ({storeSettings.currency} Cr) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="Total bill amount (Credit)"
                value={billTotalAmount}
                onChange={(e) => setBillTotalAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Paid On Spot ({storeSettings.currency} Dr)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="0 if fully on credit"
                value={billPaidAmount}
                onChange={(e) => setBillPaidAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Stock Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 5x iPhone 15 Pro Max 256GB"
                value={billNotes}
                onChange={(e) => setBillNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setIsBillOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Purchase Credit Entry
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayoutOpen}
        onClose={() => setIsPayoutOpen(false)}
        title={selectedSupplier ? `Record Payment to ${selectedSupplier.name}` : 'Record Payment'}
      >
        {selectedSupplier && (
          <form onSubmit={handlePayoutSubmit}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Current Payable Dues: <strong style={{ color: '#fbbf24' }}>{storeSettings.currency} {(selectedSupplier.amountPayable || 0).toLocaleString()} Cr</strong>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount ({storeSettings.currency} Dr) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="Enter payment amount paid to supplier"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method / Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="Cash / Bank Transfer / Cheque"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setIsPayoutOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald">
                Record Debit Payment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Process Purchase Return Modal */}
      <Modal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        title={selectedSupplier ? `Purchase Return to ${selectedSupplier.name}` : 'Purchase Return'}
      >
        {selectedSupplier && (
          <form onSubmit={handleReturnSubmit}>
            <div className="form-group">
              <label className="form-label">Select Original Purchase Order *</label>
              <select
                required
                className="form-input"
                value={returnPurchaseId}
                onChange={(e) => setReturnPurchaseId(e.target.value)}
              >
                <option value="">Select PO...</option>
                {purchases
                  .filter((p) => p.supplierId === selectedSupplier.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.purchaseNo} ({p.date || 'N/A'}) - Total: {storeSettings.currency} {(p.totalAmount || 0).toLocaleString()}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Return Amount ({storeSettings.currency} Dr) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="Returned goods credit amount"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Return Reason / Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="Defective unit / Wrong stock returned"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setIsReturnOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-amber">
                Record Purchase Return (Debit)
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PrintableInvoice } from '../components/print/PrintableInvoice';
import { FileText, Search, Printer, Eye, Calendar, DollarSign, Edit, Trash2, RotateCcw } from 'lucide-react';

export const Invoices = ({ searchQuery, selectedSale, setSelectedSale }) => {
  const { storeSettings, sales, updateSale, deleteSale, refundSale } = useApp();

  const [statusFilter, setStatusFilter] = useState('All');
  const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('Cash');
  const [editStatus, setEditStatus] = useState('Paid');

  useEffect(() => {
    if (selectedSale) {
      setActiveInvoiceModal(selectedSale);
    }
  }, [selectedSale]);

  const filteredSales = (sales || []).filter((s) => {
    const items = s.items || [];
    const matchesSearch =
      !searchQuery ||
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.customerPhone && s.customerPhone.includes(searchQuery)) ||
      items.some((it) => (it.imei && it.imei.includes(searchQuery)) || (it.model && it.model.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice Records & History</h1>
          <p className="page-subtitle">View, search, and re-print all generated customer sales invoices</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Filter:</div>
        {['All', 'Paid', 'Partial', 'Unpaid', 'Refunded'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
          >
            {st}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Total Invoices: <strong>{filteredSales.length}</strong>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date & Time</th>
                <th>Customer Details</th>
                <th>Purchased Items & IMEIs</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Balance Dues</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No invoices match your search query.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {s.invoiceNo}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div>{s.date}</div>
                      <div style={{ fontSize: '0.75rem' }}>{s.time}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.customerPhone}</div>
                    </td>
                    <td>
                      {(s.items || []).map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          {it.brand} {it.model}{' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                            [{it.imei || 'N/A'}]
                          </span>
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {storeSettings.currency} {(s.grandTotal || s.netTotal || s.totalAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {storeSettings.currency} {(s.paidAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ color: ((s.remainingBalance ?? s.dueAmount ?? 0) > 0) ? '#fb7185' : 'var(--text-muted)', fontWeight: 600 }}>
                      {storeSettings.currency} {(s.remainingBalance ?? s.dueAmount ?? 0).toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={s.status || 'Paid'}>{s.status || 'Paid'}</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            setActiveInvoiceModal(s);
                            if (setSelectedSale) setSelectedSale(s);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="View / Print Invoice"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSale(s);
                            setEditCustomerName(s.customerName || '');
                            setEditCustomerPhone(s.customerPhone || '');
                            setEditPaidAmount(s.paidAmount || 0);
                            setEditPaymentMethod(s.paymentMethod || 'Cash');
                            setEditStatus(s.status || 'Paid');
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Edit Invoice Details"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        {s.status !== 'Refunded' && (
                          <button
                            onClick={() => {
                              const itemsCount = (s.items || []).length;
                              if (
                                window.confirm(
                                  `Are you sure you want to refund Invoice #${s.invoiceNo}?\n\n• Sold products (${itemsCount} item${itemsCount > 1 ? 's' : ''}) will be returned & added back to inventory stock.\n• Sales revenue and profit will be deducted accordingly.`
                                )
                              ) {
                                refundSale(s.id);
                              }
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Refund Invoice & Restock Products to Inventory"
                            style={{
                              padding: '0.35rem 0.5rem',
                              color: '#f59e0b',
                              borderColor: 'rgba(245, 158, 11, 0.4)',
                              background: 'rgba(245, 158, 11, 0.1)',
                            }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete invoice ${s.invoiceNo}? Stock will be restored and any customer dues balance adjusted.`)) {
                              deleteSale(s.id, true);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          title="Delete Invoice"
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

      {/* Invoice View Modal */}
      <Modal
        isOpen={Boolean(activeInvoiceModal)}
        onClose={() => {
          setActiveInvoiceModal(null);
          if (setSelectedSale) setSelectedSale(null);
        }}
        title={`Invoice View: ${activeInvoiceModal?.invoiceNo}`}
      >
        <PrintableInvoice
          sale={activeInvoiceModal}
          onClose={() => {
            setActiveInvoiceModal(null);
            if (setSelectedSale) setSelectedSale(null);
          }}
        />
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={Boolean(editingSale)}
        onClose={() => setEditingSale(null)}
        title={editingSale ? `Edit Invoice: ${editingSale.invoiceNo}` : 'Edit Invoice'}
      >
        {editingSale && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newPaid = parseFloat(editPaidAmount) || 0;
              updateSale(editingSale.id, {
                customerName: editCustomerName,
                customerPhone: editCustomerPhone,
                paidAmount: newPaid,
                paymentMethod: editPaymentMethod,
                status: editStatus,
              });
              setEditingSale(null);
            }}
          >
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={editCustomerName}
                onChange={(e) => setEditCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Phone</label>
              <input
                type="text"
                className="form-input"
                value={editCustomerPhone}
                onChange={(e) => setEditCustomerPhone(e.target.value)}
              />
            </div>
            <div className="form-row">
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
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                  <option value="Card">Card</option>
                  <option value="Credit / Khata">Credit / Khata</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Status</label>
              <select
                className="form-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Refunded">Refunded</option>
              </select>
              {editStatus === 'Refunded' && (
                <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  ⚠️ Marking as <strong>Refunded</strong> will automatically restore all items on this invoice back to inventory stock and deduct sales/profits.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditingSale(null)} className="btn btn-secondary">
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

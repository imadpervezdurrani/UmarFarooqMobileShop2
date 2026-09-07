import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Receipt, Plus, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';

export const Expenses = () => {
  const { storeSettings, expenses, addExpense, deleteExpense, isAdmin } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['Rent', 'Electricity', 'Salaries', 'Internet', 'Transport', 'Maintenance', 'Other'];

  const [formData, setFormData] = useState({
    category: 'Rent',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return;
    addExpense(formData);
    setIsModalOpen(false);
    setFormData({
      category: 'Rent',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const filteredExpenses = expenses.filter((e) => {
    return selectedCategory === 'All' || e.category === selectedCategory;
  });

  const totalExpenseVal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Log store operational expenses, categorise costs, and monitor overheads</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            className="glass-card"
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filtered Expense Total:</div>
            <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>
              {storeSettings.currency} {totalExpenseVal.toLocaleString()}
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Category:</span>
        <button
          onClick={() => setSelectedCategory('All')}
          className={`btn btn-sm ${selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description / Notes</th>
                <th>Recorded By</th>
                <th>Amount</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No expenses logged under this category.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.date}</td>
                    <td>
                      <Badge variant="amber">{e.category}</Badge>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>{e.description || 'N/A'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.recordedBy}</td>
                    <td style={{ fontWeight: 700, color: '#fb7185', fontSize: '1rem' }}>
                      {storeSettings.currency} {e.amount.toLocaleString()}
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="btn btn-danger btn-icon"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Store Expense Entry"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Expense Category *</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount ({storeSettings.currency}) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="Amount spent"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Remarks</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Monthly electricity bill paid via online banking"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Expense Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

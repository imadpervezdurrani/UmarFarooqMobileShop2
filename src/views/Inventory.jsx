import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  History,
  Filter,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';

export const Inventory = ({ searchQuery }) => {
  const {
    storeSettings,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    stockHistory,
    isAdmin,
  } = useApp();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPta, setSelectedPta] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);

  const categoryOptions = ['New Phone', 'Used Phone'];
  const ptaOptions = ['PTA Approved', 'Non-PTA', 'JV', 'CPID', 'OEM'];
  const brandOptions = [
    'Apple',
    'Samsung',
    'Google',
    'Xiaomi',
    'Redmi',
    'Poco',
    'Realme',
    'Vivo',
    'Oppo',
    'OnePlus',
    'Infinix',
    'Tecno',
    'Itel',
    'QMobile',
    'Sparx',
    'Dcode',
    'Nokia',
    'Honor',
    'Huawei',
    'Motorola',
    'Sony',
    'Nothing',
    'Asus',
    'ZTE',
    'Other',
  ];

  const ramOptions = [
    '1GB',
    '2GB',
    '3GB',
    '4GB',
    '6GB',
    '8GB',
    '12GB',
    '16GB',
    '24GB',
    'N/A',
  ];

  const storageOptions = [
    '16GB',
    '32GB',
    '64GB',
    '128GB',
    '256GB',
    '512GB',
    '1TB',
    'N/A',
  ];

  const [customBrand, setCustomBrand] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    brand: 'Apple',
    model: '',
    category: 'New Phone',
    ram: '8GB',
    storage: '256GB',
    color: 'Titanium Natural',
    imei1: '',
    imei2: '',
    purchasePrice: '',
    salePrice: '',
    stock: 1,
    ptaStatus: 'PTA Approved',
    minStockLimit: 2,
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setCustomBrand('');
    setFormData({
      brand: 'Apple',
      model: '',
      category: 'New Phone',
      ram: '8GB',
      storage: '256GB',
      color: '',
      imei1: '',
      imei2: '',
      purchasePrice: '',
      salePrice: '',
      stock: 1,
      ptaStatus: 'PTA Approved',
      minStockLimit: 2,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const isStandardBrand = brandOptions.includes(p.brand) && p.brand !== 'Other';
    if (!isStandardBrand && p.brand) {
      setCustomBrand(p.brand);
    } else {
      setCustomBrand('');
    }
    setFormData({
      brand: isStandardBrand ? p.brand : 'Other',
      model: p.model,
      category: p.category || 'New Phone',
      ram: p.ram,
      storage: p.storage,
      color: p.color,
      imei1: p.imei1 || '',
      imei2: p.imei2 || '',
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stock: p.stock,
      ptaStatus: p.ptaStatus,
      minStockLimit: p.minStockLimit || 2,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.model.trim()) return;

    const finalBrand = formData.brand === 'Other' ? (customBrand.trim() || 'Other') : formData.brand;
    const finalData = { ...formData, brand: finalBrand };

    if (editingProduct) {
      updateProduct(editingProduct.id, finalData);
    } else {
      addProduct(finalData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const openHistoryModal = (p) => {
    setHistoryProduct(p);
    setIsHistoryModalOpen(true);
  };

  // Stock Metrics
  const newPhonesCount = products.filter((p) => (p.category || 'New Phone') === 'New Phone').reduce((sum, p) => sum + (p.stock || 0), 0);
  const usedPhonesCount = products.filter((p) => p.category === 'Used Phone').reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockLimit).length;

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.imei1 && p.imei1.includes(searchQuery)) ||
      (p.imei2 && p.imei2.includes(searchQuery));

    const matchesCategory = selectedCategory === 'All' || (p.category || 'New Phone') === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesPta = selectedPta === 'All' || p.ptaStatus === selectedPta;

    return matchesSearch && matchesCategory && matchesBrand && matchesPta;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product & Inventory Management</h1>
          <p className="page-subtitle">Track New Phones, Used Phones, IMEIs, PTA status, stock levels, and cost margins</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Mobile Device</span>
        </button>
      </div>

      {/* Quick Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
            <Smartphone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Models</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{products.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>models</span></div>
          </div>
        </div>

        <div 
          className="glass-card" 
          onClick={() => setSelectedCategory(selectedCategory === 'New Phone' ? 'All' : 'New Phone')}
          style={{ 
            padding: '1rem 1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            cursor: 'pointer',
            border: selectedCategory === 'New Phone' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
            transition: 'var(--transition-fast)'
          }}
        >
          <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 600 }}>✨ New Phones</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{newPhonesCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>in stock</span></div>
          </div>
        </div>

        <div 
          className="glass-card" 
          onClick={() => setSelectedCategory(selectedCategory === 'Used Phone' ? 'All' : 'Used Phone')}
          style={{ 
            padding: '1rem 1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            cursor: 'pointer',
            border: selectedCategory === 'Used Phone' ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
            transition: 'var(--transition-fast)'
          }}
        >
          <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 600 }}>🔄 Used Phones</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{usedPhonesCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>in stock</span></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: 600 }}>Low Stock Alert</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{lowStockCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>items</span></div>
          </div>
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
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Filter size={16} color="var(--accent-cyan)" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-select filter-select"
          style={{
            width: '180px',
            borderColor: selectedCategory !== 'All' ? 'var(--accent-cyan)' : undefined,
          }}
        >
          <option value="All">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'New Phone' ? '✨ New Phone' : '🔄 Used Phone'}
            </option>
          ))}
        </select>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="form-select filter-select"
          style={{
            width: '160px',
            borderColor: selectedBrand !== 'All' ? 'var(--accent-cyan)' : undefined,
          }}
        >
          <option value="All">All Brands</option>
          {Array.from(
            new Set([
              ...brandOptions.filter((b) => b !== 'Other'),
              ...products.map((p) => p.brand).filter(Boolean),
            ])
          ).map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* PTA Status Filter */}
        <select
          value={selectedPta}
          onChange={(e) => setSelectedPta(e.target.value)}
          className="form-select filter-select"
          style={{
            width: '180px',
            borderColor: selectedPta !== 'All' ? 'var(--accent-cyan)' : undefined,
          }}
        >
          <option value="All">All PTA Statuses</option>
          {ptaOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {(selectedCategory !== 'All' || selectedBrand !== 'All' || selectedPta !== 'All') && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setSelectedPta('All');
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', height: '36px', padding: '0 0.75rem' }}
          >
            Reset Filters
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> devices
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Brand & Model</th>
                <th>RAM / Storage / Color</th>
                <th>Dual IMEI (IMEI 1 & 2)</th>
                <th>PTA Status</th>
                {isAdmin && <th>Purchase Cost</th>}
                <th>Selling Price</th>
                <th>Stock Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock <= p.minStockLimit;
                  const itemCat = p.category || 'New Phone';
                  return (
                    <tr key={p.id}>
                      <td>
                        <Badge variant={itemCat}>{itemCat === 'New Phone' ? '✨ New Phone' : '🔄 Used Phone'}</Badge>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {p.brand} {p.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {p.id}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {p.ram} / {p.storage}
                        </div>
                        {p.color && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Color: {p.color}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--accent-cyan)' }}>IMEI 1: {p.imei1 || 'N/A'}</div>
                        <div style={{ color: 'var(--text-muted)' }}>IMEI 2: {p.imei2 || 'N/A'}</div>
                      </td>
                      <td>
                        <Badge variant={p.ptaStatus}>{p.ptaStatus}</Badge>
                      </td>
                      {isAdmin && (
                        <td style={{ color: 'var(--text-muted)' }}>
                          {storeSettings.currency} {(p.purchasePrice || 0).toLocaleString()}
                        </td>
                      )}
                      <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {storeSettings.currency} {(p.salePrice || 0).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: isLowStock ? '#fb7185' : 'var(--text-main)' }}>
                            {p.stock}
                          </span>
                          {isLowStock && <Badge variant="rose">Low Stock Alert</Badge>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openHistoryModal(p)}
                            className="btn btn-secondary btn-icon"
                            title="Stock Movement History"
                          >
                            <History size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-secondary btn-icon"
                            title="Edit Device"
                          >
                            <Edit2 size={15} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="btn btn-danger btn-icon"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.brand} ${editingProduct.model}` : 'Add New Mobile Product'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category / Condition *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="New Phone">✨ 1st New Phone (Box Pack)</option>
                <option value="Used Phone">🔄 2nd Used Phone (Pre-owned)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <select
                className="form-select"
                value={formData.brand}
                onChange={(e) => {
                  setFormData({ ...formData, brand: e.target.value });
                  if (e.target.value !== 'Other') setCustomBrand('');
                }}
              >
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.brand === 'Other' && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ color: 'var(--accent-cyan)' }}>
                Specify Custom Brand Name *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Type brand name (e.g. Sharp, Meizu, Lenovo, etc.)"
                required
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Model Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Galaxy S24 Ultra 5G or iPhone 15 Pro Max"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Titanium Natural / Black"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>RAM</span>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'normal' }}>
                  Select or Edit
                </span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-select"
                  style={{ width: '110px', flexShrink: 0 }}
                  value={ramOptions.includes(formData.ram) ? formData.ram : 'Custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'Custom') {
                      setFormData({ ...formData, ram: e.target.value });
                    }
                  }}
                >
                  <option value="" disabled>Select</option>
                  {ramOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Custom">Custom...</option>
                </select>
                <input
                  type="text"
                  className="form-input"
                  list="ramSuggestions"
                  placeholder="e.g. 4GB, 8GB..."
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                />
                <datalist id="ramSuggestions">
                  {ramOptions.filter((r) => r !== 'N/A').map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Storage</span>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'normal' }}>
                  Select or Edit
                </span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-select"
                  style={{ width: '110px', flexShrink: 0 }}
                  value={storageOptions.includes(formData.storage) ? formData.storage : 'Custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'Custom') {
                      setFormData({ ...formData, storage: e.target.value });
                    }
                  }}
                >
                  <option value="" disabled>Select</option>
                  {storageOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="Custom">Custom...</option>
                </select>
                <input
                  type="text"
                  className="form-input"
                  list="storageSuggestions"
                  placeholder="e.g. 64GB, 128GB..."
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                />
                <datalist id="storageSuggestions">
                  {storageOptions.filter((s) => s !== 'N/A').map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Primary IMEI 1</label>
              <input
                type="text"
                className="form-input"
                placeholder="15-digit IMEI 1"
                value={formData.imei1}
                onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secondary IMEI 2</label>
              <input
                type="text"
                className="form-input"
                placeholder="15-digit IMEI 2"
                value={formData.imei2}
                onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">PTA Registration Status</label>
              <select
                className="form-select"
                value={formData.ptaStatus}
                onChange={(e) => setFormData({ ...formData, ptaStatus: e.target.value })}
              >
                {ptaOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Alert Limit</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.minStockLimit}
                onChange={(e) => setFormData({ ...formData, minStockLimit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purchase Price ({storeSettings.currency})</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="Cost price"
                disabled={!isAdmin}
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Retail Sale Price ({storeSettings.currency}) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="Sale price"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Save New Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={historyProduct ? `Stock History: ${historyProduct.brand} ${historyProduct.model}` : 'Stock History'}
      >
        {historyProduct && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Current Stock: <strong style={{ color: 'var(--accent-cyan)' }}>{historyProduct.stock} units</strong>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Stock After</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory
                    .filter((sh) => sh.productName.includes(historyProduct.model))
                    .map((sh) => (
                      <tr key={sh.id}>
                        <td>{sh.date}</td>
                        <td>
                          <Badge variant={sh.quantity > 0 ? 'emerald' : 'rose'}>{sh.changeType}</Badge>
                        </td>
                        <td style={{ fontWeight: 700, color: sh.quantity > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {sh.quantity > 0 ? `+${sh.quantity}` : sh.quantity}
                        </td>
                        <td>{sh.stockAfter}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sh.reference}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

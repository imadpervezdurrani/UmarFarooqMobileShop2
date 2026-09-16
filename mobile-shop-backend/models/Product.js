import store, { saveDB } from '../config/db.js';
import { sortByNewest } from '../utils/sortUtils.js';

export const Product = {
  find: () => [...store.products].sort(sortByNewest),
  findById: (id) => store.products.find((p) => p.id === id),
  create: (data) => {
    const newProduct = {
      id: data.id || `prod-${Date.now()}`,
      brand: data.brand,
      model: data.model,
      category: data.category || 'New Phone',
      condition: data.condition || (data.category === 'Used Phone' ? 'Used' : 'New'),
      categoryId: data.categoryId || null,
      ram: data.ram || '',
      storage: data.storage || '',
      color: data.color || '',
      imei1: data.imei1 || '',
      imei2: data.imei2 || '',
      purchasePrice: parseFloat(data.purchasePrice) || 0,
      salePrice: parseFloat(data.salePrice) || 0,
      stock: parseInt(data.stock, 10) || 0,
      ptaStatus: data.ptaStatus || 'PTA Approved',
      minStockLimit: parseInt(data.minStockLimit, 10) || 2,
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    };
    store.products.unshift(newProduct);
    saveDB();
    return newProduct;
  },
  findByIdAndUpdate: (id, fields) => {
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    store.products[idx] = {
      ...store.products[idx],
      ...fields,
      purchasePrice: fields.purchasePrice !== undefined ? parseFloat(fields.purchasePrice) : store.products[idx].purchasePrice,
      salePrice: fields.salePrice !== undefined ? parseFloat(fields.salePrice) : store.products[idx].salePrice,
      stock: fields.stock !== undefined ? parseInt(fields.stock, 10) : store.products[idx].stock,
    };
    saveDB();
    return store.products[idx];
  },
  findByIdAndDelete: (id) => {
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const deleted = store.products.splice(idx, 1)[0];
    saveDB();
    return deleted;
  },
};

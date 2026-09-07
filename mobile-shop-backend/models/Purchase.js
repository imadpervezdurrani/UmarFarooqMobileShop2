import store, { saveDB } from '../config/db.js';

export const Purchase = {
  find: () => {
    return store.purchases.map((po) => ({
      ...po,
      items: store.purchase_items.filter((pi) => pi.purchaseId === po.id),
    }));
  },
  findById: (id) => {
    const po = store.purchases.find((p) => p.id === id);
    if (!po) return null;
    return {
      ...po,
      items: store.purchase_items.filter((pi) => pi.purchaseId === po.id),
    };
  },
  create: (poData, items) => {
    const count = store.purchases.length;
    const purchaseNo = `PO-${1000 + count + 1}`;
    const newPo = {
      id: `po-${Date.now()}`,
      purchaseNo,
      supplierId: poData.supplierId || null,
      supplierName: poData.supplierName,
      date: poData.date || new Date().toISOString().split('T')[0],
      totalAmount: parseFloat(poData.totalAmount),
      paidAmount: parseFloat(poData.paidAmount),
      remainingPayable: Math.max(0, poData.totalAmount - poData.paidAmount),
      paymentStatus: poData.paymentStatus || 'Paid',
    };
    store.purchases.unshift(newPo);

    items.forEach((it, idx) => {
      store.purchase_items.push({
        id: `pi-${Date.now()}-${idx}`,
        purchaseId: newPo.id,
        productId: it.productId,
        productName: it.productName,
        imei: it.imei || '',
        purchasePrice: parseFloat(it.purchasePrice),
        quantity: parseInt(it.quantity, 10),
        total: parseFloat(it.total),
      });
    });

    saveDB();
    return { ...newPo, items };
  },
  findByIdAndUpdate: (id, fields) => {
    const idx = store.purchases.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    store.purchases[idx] = { ...store.purchases[idx], ...fields };
    saveDB();
    return {
      ...store.purchases[idx],
      items: store.purchase_items.filter((pi) => pi.purchaseId === id),
    };
  },
  findByIdAndDelete: (id) => {
    const idx = store.purchases.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const deleted = store.purchases.splice(idx, 1)[0];
    store.purchase_items = store.purchase_items.filter((pi) => pi.purchaseId !== id);
    saveDB();
    return deleted;
  },
};

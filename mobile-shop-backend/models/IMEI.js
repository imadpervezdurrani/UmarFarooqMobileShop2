import store, { saveDB } from '../config/db.js';

export const IMEI = {
  find: () => store.imeis,
  findByProductId: (productId) => store.imeis.filter((i) => i.productId === productId),
  findByImeiNumber: (imeiNo) => store.imeis.find((i) => i.imei1 === imeiNo || i.imei2 === imeiNo),
  create: (data) => {
    const newImei = {
      id: `imei-${Date.now()}`,
      productId: data.productId,
      imei1: data.imei1,
      imei2: data.imei2 || '',
      status: data.status || 'Available',
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.imeis.push(newImei);
    saveDB();
    return newImei;
  },
  updateStatus: (imei1, newStatus) => {
    const target = store.imeis.find((i) => i.imei1 === imei1 || i.imei2 === imei1);
    if (target) {
      target.status = newStatus;
      saveDB();
    }
    return target;
  },
};

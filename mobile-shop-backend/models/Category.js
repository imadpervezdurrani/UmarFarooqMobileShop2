import store, { saveDB } from '../config/db.js';

export const Category = {
  find: () => store.categories,
  findById: (id) => store.categories.find((c) => c.id === id),
  create: (data) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      brandCount: data.brandCount || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.categories.push(newCat);
    saveDB();
    return newCat;
  },
  findByIdAndUpdate: (id, fields) => {
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.categories[idx] = { ...store.categories[idx], ...fields };
    saveDB();
    return store.categories[idx];
  },
  findByIdAndDelete: (id) => {
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const deleted = store.categories.splice(idx, 1)[0];
    saveDB();
    return deleted;
  },
};

import store, { saveDB } from '../config/db.js';

export const User = {
  find: () => store.users,
  findById: (id) => store.users.find((u) => u.id === id),
  findByEmail: (email) => store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  create: (userData) => {
    const newUser = {
      id: `u-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'staff',
      title: userData.title || 'Staff Member',
      avatar: userData.avatar || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.users.unshift(newUser);
    saveDB();
    return newUser;
  },
  findByIdAndUpdate: (id, fields) => {
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    store.users[idx] = { ...store.users[idx], ...fields };
    saveDB();
    return store.users[idx];
  },
  findByIdAndDelete: (id) => {
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const deleted = store.users.splice(idx, 1)[0];
    saveDB();
    return deleted;
  },
};

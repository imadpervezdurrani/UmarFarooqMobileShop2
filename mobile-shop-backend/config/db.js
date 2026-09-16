import mongoose from 'mongoose';
import dns from 'dns';
import { sortByNewest } from '../utils/sortUtils.js';

export const defaultSampleData = {
  users: [
    {
      id: 'u-1',
      name: 'Umar Farooq (Owner)',
      email: 'admin@celltech.com',
      password: '$2b$10$8ORXpVGE3EzDfFQgcEqy1.4f7jIJlTGQZy1lGignBdrd63R.nNJYG',
      role: 'admin',
      title: 'Store Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: 'u-2',
      name: 'Hamza Khan',
      email: 'hamza@celltech.com',
      password: '$2b$10$8ORXpVGE3EzDfFQgcEqy1.4f7jIJlTGQZy1lGignBdrd63R.nNJYG',
      role: 'staff',
      title: 'Senior Sales Executive',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString().split('T')[0],
    },
  ],
  products: [],
  categories: [
    { id: 'cat-1', name: 'New Phone', description: 'Brand new / box-pack smartphones' },
    { id: 'cat-2', name: 'Used Phone', description: 'Pre-owned / second-hand mobile devices' },
    { id: 'cat-3', name: 'Accessories & Chargers', description: 'Cables, fast chargers, adapters' },
    { id: 'cat-4', name: 'Earbuds & Headphones', description: 'Wireless earbuds, handsfree' },
    { id: 'cat-5', name: 'Smart Watches & Bands', description: 'Fitness bands and smart watches' },
    { id: 'cat-6', name: 'Covers & Protectors', description: 'Glass protectors, silicone cases' },
  ],
  customers: [],
  suppliers: [],
  purchases: [],
  purchase_items: [],
  sales: [],
  sale_items: [],
  expenses: [],
  stock_transactions: [],
};

export const store = {
  users: [...defaultSampleData.users],
  products: [],
  categories: [...defaultSampleData.categories],
  imeis: [],
  customers: [],
  suppliers: [],
  supplier_ledgers: [],
  purchases: [],
  purchase_items: [],
  sales: [],
  sale_items: [],
  invoices: [],
  payments: [],
  expenses: [],
  stock_transactions: [],
};

export function ensureSeedData() {
  if (!store.users || store.users.length === 0) {
    store.users = [...defaultSampleData.users];
  }
  if (!store.categories || store.categories.length === 0) {
    store.categories = [...defaultSampleData.categories];
  }
}

export async function loadFromMongoDB() {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      let hasDocs = false;
      for (const col of collections) {
        const key = col.name;
        if (store[key] !== undefined) {
          const docs = await db.collection(key).find({}).toArray();
          if (docs.length > 0) {
            hasDocs = true;
            const mapped = docs.map(({ _id, ...rest }) => rest);
            // Sort records with newest first
            if (key !== 'users' && key !== 'categories') {
              mapped.sort(sortByNewest);
            }
            store[key] = mapped;
          }
        }
      }

      if (!hasDocs) {
        ensureSeedData();
      } else {
        console.log('🍃 Loaded collections from MongoDB into Memory Store');
      }
    } else {
      ensureSeedData();
    }
  } catch (err) {
    console.error('Error loading from MongoDB:', err.message);
    ensureSeedData();
  }
}

let isSyncing = false;
let hasPendingSync = false;

export async function syncToMongoDB() {
  if (isSyncing) {
    hasPendingSync = true;
    return;
  }

  isSyncing = true;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const db = mongoose.connection.db;
      const keys = Object.keys(store);

      for (const key of keys) {
        if (store[key] && Array.isArray(store[key])) {
          const collection = db.collection(key);
          const items = store[key];

          // Always sanitize in-memory items to ensure no leaked _id
          for (const item of items) {
            if (item && item._id !== undefined) {
              delete item._id;
            }
          }

          if (items.length === 0) {
            await collection.deleteMany({});
          } else {
            const hasId = items.every((item) => item && item.id);
            if (hasId) {
              const currentIds = items.map((d) => d.id);
              // 1. Remove records that were deleted in store
              await collection.deleteMany({ id: { $nin: currentIds } });

              // 2. Atomically upsert each document by its unique string 'id'
              const operations = items.map((doc) => {
                const { _id, ...cleanDoc } = doc;
                return {
                  updateOne: {
                    filter: { id: doc.id },
                    update: { $set: cleanDoc },
                    upsert: true,
                  },
                };
              });
              if (operations.length > 0) {
                await collection.bulkWrite(operations, { ordered: false });
              }
            } else {
              // Fallback for arrays without unique id property
              await collection.deleteMany({});
              const cleanDocs = items.map(({ _id, ...rest }) => ({ ...rest }));
              if (cleanDocs.length > 0) {
                await collection.insertMany(cleanDocs);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('MongoDB sync error:', err.message);
  } finally {
    isSyncing = false;
    if (hasPendingSync) {
      hasPendingSync = false;
      syncToMongoDB();
    }
  }
}

export function saveDB() {
  syncToMongoDB();
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/UmarFarooqMobileShop';

  // Ensure SRV DNS lookup resolves reliably for MongoDB Atlas on Windows
  if (mongoURI.includes('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch (e) {
      // Ignore if not permitted
    }
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'UmarFarooqMobileShop',
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`
  =======================================================
  🍃 MONGODB CONNECTED & LIVE: UmarFarooqMobileShop
  =======================================================
  ➜ Connection URI: ${mongoURI}
  ➜ Host: ${conn.connection.host}
  ➜ Database Name: ${conn.connection.name}
  =======================================================
    `);

    await loadFromMongoDB();
    await syncToMongoDB();
  } catch (error) {
    console.warn('MongoDB Connection Warning:', error.message);
    ensureSeedData();
  }
};

export function resetDatabaseData() {
  Object.keys(store).forEach((key) => {
    if (defaultSampleData[key]) {
      store[key] = JSON.parse(JSON.stringify(defaultSampleData[key]));
    } else {
      store[key] = [];
    }
  });
  saveDB();
  return { message: 'Database reset: All dummy records cleared successfully.' };
}

export default store;

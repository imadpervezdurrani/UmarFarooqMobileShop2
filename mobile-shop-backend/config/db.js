import mongoose from 'mongoose';
import dns from 'dns';
import { sortByNewest } from '../utils/sortUtils.js';

export const defaultSampleData = {
  users: [
    {
      id: 'u-1',
      name: 'Umar Farooq (Owner)',
      email: 'admin@gmail.com',
      password: '$2b$10$oTcgftO0LlSoRXmBMP3T9OOxMXENTdEPV.SmBoU16C3yz0NNbg6Y2',
      role: 'admin',
      title: 'Store Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      id: 'u-2',
      name: 'Umar Farooq (Owner)',
      email: 'UmarFarooq@celltech.com',
      password: '$2b$10$oTcgftO0LlSoRXmBMP3T9OOxMXENTdEPV.SmBoU16C3yz0NNbg6Y2',
      role: 'admin',
      title: 'Store Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
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

let dbInstance = null;
let connectionPromise = null;
let lastLoadTime = 0;
const CACHE_TTL_MS = 4000;

export async function getDB() {
  if (dbInstance) return dbInstance;
  return await connectDB();
}

export async function loadFromMongoDB(force = false) {
  const now = Date.now();
  if (!force && now - lastLoadTime < CACHE_TTL_MS) {
    return;
  }

  try {
    const db = await getDB();
    if (db) {
      const collections = await db.listCollections().toArray();

      await Promise.all(
        collections.map(async (col) => {
          const key = col.name;
          if (store[key] !== undefined) {
            const docs = await db.collection(key).find({}).toArray();
            const mapped = docs.map(({ _id, ...rest }) => rest);
            if (key !== 'users' && key !== 'categories') {
              mapped.sort(sortByNewest);
            }
            store[key] = mapped;
          }
        })
      );

      lastLoadTime = Date.now();
      ensureSeedData();
    } else {
      ensureSeedData();
    }
  } catch (err) {
    console.error('Error loading from MongoDB:', err.message);
    ensureSeedData();
  }
}

export async function syncToMongoDB(specificKey = null) {
  try {
    const db = await getDB();
    if (db) {
      const keys = specificKey ? [specificKey] : Object.keys(store);

      await Promise.all(
        keys.map(async (key) => {
          if (store[key] && Array.isArray(store[key]) && store[key].length > 0) {
            const collection = db.collection(key);
            const items = store[key];

            // Sanitize documents
            for (const item of items) {
              if (item && item._id !== undefined) {
                delete item._id;
              }
            }

            const currentIds = items.map((d) => d.id).filter(Boolean);
            if (currentIds.length > 0) {
              // Delete records removed from store
              await collection.deleteMany({ id: { $nin: currentIds } });

              // Bulk upsert all records in parallel
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
            }
          }
        })
      );

      // Invalidate load cache so next GET reflects newly saved data
      lastLoadTime = 0;
    } else {
      console.warn('Cannot sync to MongoDB: db is null');
    }
  } catch (err) {
    console.error('MongoDB sync error:', err.message);
  }
}

export function saveDB(specificKey = null) {
  return syncToMongoDB(specificKey);
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config.env') });

export const connectDB = async () => {
  if (dbInstance) return dbInstance;
  if (connectionPromise) return connectionPromise;

  const mongoURI =
    process.env.MONGO_URI ||
    'mongodb+srv://imadk5557_db_user:Peshawar1@cluster0.0dfboq4.mongodb.net/UmarFarooqMobileShop?retryWrites=true&w=majority&appName=Cluster0';

  if (mongoURI && mongoURI.includes('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch (e) {}
  }

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(mongoURI, {
        dbName: 'UmarFarooqMobileShop',
        serverSelectionTimeoutMS: 15000,
      });
      dbInstance = conn.connection.db;
      console.log(`🍃 MONGODB CONNECTED & LIVE: UmarFarooqMobileShop`);
      await loadFromMongoDB(true);
      return dbInstance;
    } catch (error) {
      console.warn('MongoDB Connection Warning:', error.message);
      ensureSeedData();
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
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

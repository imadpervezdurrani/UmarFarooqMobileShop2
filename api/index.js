import app from '../mobile-shop-backend/app.js';
import { connectDB } from '../mobile-shop-backend/config/db.js';
import mongoose from 'mongoose';

let connectPromise = null;

async function ensureDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!connectPromise) {
    connectPromise = connectDB().finally(() => {
      connectPromise = null;
    });
  }
  return connectPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (err) {
    console.warn('MongoDB connection warning in serverless handler:', err.message);
  }
  return app(req, res);
}


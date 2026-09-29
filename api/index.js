import app from '../mobile-shop-backend/app.js';
import { connectDB } from '../mobile-shop-backend/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn('MongoDB connection warning in handler:', err.message);
  }
  return app(req, res);
}



import app from '../mobile-shop-backend/app.js';
import { connectDB } from '../mobile-shop-backend/config/db.js';
import mongoose from 'mongoose';

let isConnecting = false;

export default async function handler(req, res) {
  if (mongoose.connection.readyState !== 1 && !isConnecting) {
    isConnecting = true;
    try {
      await connectDB();
    } catch (err) {
      console.warn('MongoDB connection in serverless function:', err.message);
    } finally {
      isConnecting = false;
    }
  }
  return app(req, res);
}


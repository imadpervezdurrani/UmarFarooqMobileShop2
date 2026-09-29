import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load Environment Variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import { errorHandler } from './middleware/errorMiddleware.js';
import { resetDatabaseData, loadFromMongoDB, syncToMongoDB } from './config/db.js';

const app = express();

// Enable Full CORS & Preflight headers
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role'],
  })
);

app.use(express.json());

// Guaranteed MongoDB Atlas synchronization for Serverless & Cloud deployment
app.use(async (req, res, next) => {
  // On GET requests, ensure memory store reflects latest MongoDB Atlas data
  if (
    req.method === 'GET' &&
    !req.path.includes('/health') &&
    !req.path.includes('/download')
  ) {
    try {
      await loadFromMongoDB();
    } catch (e) {
      console.warn('loadFromMongoDB middleware error:', e.message);
    }
  }

  // On data-mutating requests (POST, PUT, DELETE, PATCH):
  // Intercept res.json to AWAIT writing all changes to MongoDB Atlas before sending HTTP response!
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const originalJson = res.json.bind(res);
    res.json = async function (data) {
      try {
        await syncToMongoDB();
      } catch (syncErr) {
        console.error('CRITICAL: MongoDB sync error before response:', syncErr.message);
      }
      return originalJson(data);
    };
  }

  next();
});

// Health Check API
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    server: 'Mobile Shop Management Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Desktop App Download Endpoint
app.get(['/api/download-desktop-app', '/download-desktop-app'], (req, res) => {
  const possiblePaths = [
    path.join(__dirname, '..', 'release'),
    path.join(__dirname, '..', 'dist-electron'),
  ];

  function findExeFile(dirPath) {
    if (!fs.existsSync(dirPath)) return null;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile() && entry.name.endsWith('.exe')) {
        return { filePath: fullPath, fileName: entry.name };
      }
      if (entry.isDirectory()) {
        const found = findExeFile(fullPath);
        if (found) return found;
      }
    }
    return null;
  }

  for (const dirPath of possiblePaths) {
    const found = findExeFile(dirPath);
    if (found) {
      return res.download(found.filePath, found.fileName);
    }
  }

  res.status(404).send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 3rem; background: #0f172a; color: #f8fafc;">
        <h2 style="color: #38bdf8;">Umar Farooq Mobile Zone - Desktop App</h2>
        <p>The desktop application installer executable (.exe) has not been built yet.</p>
        <p>To generate the Windows installer, run the following command in terminal:</p>
        <code style="background: #1e293b; padding: 0.5rem 1rem; border-radius: 6px; color: #38bdf8; display: inline-block; margin: 1rem 0;">npm run build:electron</code>
      </body>
    </html>
  `);
});

// Database Reset & Seed Endpoint (Admin/Dev)
app.post(['/api/reset', '/reset'], (req, res) => {
  const result = resetDatabaseData();
  res.json(result);
});

app.get(['/api/reset', '/reset'], (req, res) => {
  const result = resetDatabaseData();
  res.json(result);
});

app.get(['/api/seed', '/seed'], (req, res) => {
  const result = resetDatabaseData();
  res.json(result);
});

// Mount Routes for both /api and root prefixes (for standard and serverless routing)
const mountRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/customers`, customerRoutes);
  app.use(`${prefix}/suppliers`, supplierRoutes);
  app.use(`${prefix}/purchases`, purchaseRoutes);
  app.use(`${prefix}/sales`, saleRoutes);
  app.use(`${prefix}/invoices`, invoiceRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/expenses`, expenseRoutes);
  app.use(`${prefix}/stock`, stockRoutes);
  app.use(`${prefix}/reports`, reportRoutes);
};

mountRoutes('/api');
mountRoutes('');

// Error Handling Middleware
app.use(errorHandler);

export default app;

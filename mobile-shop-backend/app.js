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
import { resetDatabaseData } from './config/db.js';

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

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'Mobile Shop Management Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Desktop App Download Endpoint
app.get('/api/download-desktop-app', (req, res) => {
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
app.post('/api/reset', (req, res) => {
  const result = resetDatabaseData();
  res.json(result);
});

app.get('/api/reset', (req, res) => {
  const result = resetDatabaseData();
  res.json(result);
});

app.get('/api/seed', (req, res) => {
  const result = resetDatabaseData();
  res.json(result);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;

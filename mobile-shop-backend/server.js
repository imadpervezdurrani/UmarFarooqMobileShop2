import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5001;

// Connect MongoDB Database
connectDB();

// Start Express HTTP Server
const server = app.listen(PORT, () => {
  console.log(`
  =======================================================
  🚀 MOBILE SHOP BACKEND SERVER RUNNING WITH ULTRAMSG WHATSAPP
  =======================================================
  ➜ Environment: ${process.env.NODE_ENV || 'development'}
  ➜ Server URL:  http://localhost:${PORT}
  ➜ Health Check: http://localhost:${PORT}/api/health
  =======================================================
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  PORT ${PORT} IS ALREADY IN USE!`);
    console.error(`Another instance or desktop app is already running on port ${PORT}.`);
    console.error(`Run this command to free port ${PORT}: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
  } else {
    console.error('Server error:', err);
  }
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

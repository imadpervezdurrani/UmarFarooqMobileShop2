# 📱 Umar Farooq Mobile Zone - Shop Management System

A complete Point of Sale (POS), Inventory, Customer Dues, Supplier Purchases, and Expense Management System built for mobile phone retail and wholesale shops.

---

## 📋 Table of Contents
1. [System Overview & Architecture](#-system-overview--architecture)
2. [Prerequisites (Client Machine Requirements)](#-prerequisites-client-machine-requirements)
3. [Quick Start (One-Click Launch)](#-quick-start-one-click-launch)
4. [Step-by-Step Installation Guide (From Scratch)](#-step-by-step-installation-guide-from-scratch)
   - [Step 1: Install Node.js & MongoDB](#step-1-install-nodejs--mongodb)
   - [Step 2: Project Setup & Dependency Installation](#step-2-project-setup--dependency-installation)
   - [Step 3: Backend Configuration (`config.env`)](#step-3-backend-configuration-configenv)
   - [Step 4: Launching the Application](#step-4-launching-the-application)
5. [Default Login Credentials](#-default-login-credentials)
6. [Desktop Application Installer (`.exe`)](#-desktop-application-installer-exe)
7. [System Modules & Features](#-system-modules--features)
8. [Database Backup & Restore](#-database-backup--restore)
9. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏛️ System Overview & Architecture

- **Frontend**: React 19, Vite, Lucide Icons, Vanilla CSS (Dark, Light & Ocean themes)
- **Backend API**: Node.js, Express.js (REST API, JWT Authentication, bcryptjs)
- **Database**: MongoDB Community Server (`mongodb://localhost:27017/UmarFarooqMobileShop`)
- **Desktop Packaging**: Electron & Electron-Builder

```
omarfarooq/
├── Client-Package/              # Ready-to-install Windows Setup (.exe)
│   ├── Umar Farooq Mobile Zone Setup.exe
│   └── README-LOGIN-INFO.txt
├── mobile-shop-backend/         # Express API & MongoDB Backend
│   ├── config/
│   │   ├── config.env           # Environment configurations (Port, DB URI, JWT)
│   │   └── db.js                # Database connection & memory store sync
│   ├── controllers/             # API request handlers
│   ├── models/                  # Database models & queries
│   ├── routes/                  # API endpoints
│   ├── server.js                # Server entry point
│   └── package.json
├── src/                         # Frontend React Source Code
│   ├── context/AppContext.jsx   # Global application state & API synchronization
│   ├── views/                   # Dashboard, POS, Inventory, Invoices, Customers, etc.
│   └── index.css                # Custom theme styling & components
├── START_SYSTEM.bat             # One-click Windows startup script
├── package.json                 # Frontend dependencies & build scripts
└── vite.config.js
```

---

## 💻 Prerequisites (Client Machine Requirements)

Before running the project on a client's computer, ensure the following software is installed:

1. **Operating System**: Windows 10 or Windows 11 (64-bit)
2. **Node.js**: Version **18.x** or **20.x LTS** ([Download from nodejs.org](https://nodejs.org/))
   - *Verify installation in terminal*:
     ```bash
     node -v
     npm -v
     ```
3. **MongoDB Community Server**: Version **6.0** or **7.0** ([Download from mongodb.com](https://www.mongodb.com/try/download/community))
   - Ensure MongoDB is installed as a **Windows Service** (runs automatically in background).
   - *(Optional)* **MongoDB Compass**: GUI to inspect database tables easily.

---

## 🚀 Quick Start (One-Click Launch)

If Node.js and MongoDB are already installed:

1. Double-click the **`START_SYSTEM.bat`** file located in the project root folder.
2. It will automatically:
   - Start the Backend API server on `http://localhost:3000`
   - Start the Frontend interface on `http://localhost:5173`
   - Open the web application automatically in your default browser!

---

## 🛠️ Step-by-Step Installation Guide (From Scratch)

### Step 1: Install Node.js & MongoDB
1. Download and install **Node.js (LTS)** from [https://nodejs.org](https://nodejs.org). Make sure to check the box "Add to PATH".
2. Download and install **MongoDB Community Server** from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
   - During setup, select **"Complete"** and keep **"Install MongoDB as a Service"** checked.

### Step 2: Project Setup & Dependency Installation

Open PowerShell or Command Prompt as Administrator, navigate to the project directory:

```bash
# Navigate to the project root
cd f:\omarfarooq

# 1. Install Frontend Dependencies
npm install

# 2. Install Backend Dependencies
cd mobile-shop-backend
npm install
cd ..
```

### Step 3: Backend Configuration (`config.env`)

Check or edit `mobile-shop-backend/config/config.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/UmarFarooqMobileShop
JWT_SECRET=celltech_mobile_shop_jwt_secret_key_2026_super_secure
JWT_EXPIRE=30d
```

> **Note**: `MONGO_URI` points to the local MongoDB database named `UmarFarooqMobileShop`. If using a remote MongoDB Atlas connection, replace the URI string here.

### Step 4: Launching the Application

You can launch the servers manually using two separate terminal windows:

#### Terminal 1 (Backend Server):
```bash
cd f:\omarfarooq\mobile-shop-backend
npm start
```
*Output should show:*
```
🍃 MONGODB CONNECTED & LIVE: UmarFarooqMobileShop
Server running on port 3000
```

#### Terminal 2 (Frontend Client):
```bash
cd f:\omarfarooq
npm run dev
```
*Output should show:*
```
➜ Local:   http://localhost:5173/
```

Open `http://localhost:5173` in Google Chrome or any modern browser.

---

## 🔑 Default Login Credentials

| Role | Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Store Owner / Admin** | Umar Farooq | `admin@celltech.com` | `password123` *(or `admin123`)* |
| **Sales Staff** | Hamza Khan | `hamza@celltech.com` | `password123` |

> 🔒 **Security Tip**: After first login, go to **Staff / User Management** or **Settings** to update passwords.

---

## 🖥️ Desktop Application Installer (`.exe`)

For clients who prefer a native Windows desktop app without running terminal commands:

1. Open the folder `Client-Package/`.
2. Double-click **`Umar Farooq Mobile Zone Setup.exe`**.
3. The app installs automatically and creates a Desktop shortcut.
4. Note: Ensure the Backend server (`START_SYSTEM.bat` or background service) is running so the desktop app can communicate with the database.

To rebuild the installer from source:
```bash
cd f:\omarfarooq
npm run build:electron
```
The new installer will be generated in `release/`.

---

## 📱 System Modules & Features

1. **Dashboard Overview**:
   - Real-time today's sales, gross profit, active stock valuation, and low-stock alerts.
2. **Point of Sale (POS) / Billing**:
   - Fast barcode / IMEI searching.
   - Cash, Bank Transfer, JazzCash / EasyPaisa, and Credit (Udhaar) sales.
   - Thermal 80mm receipt generation and downloadable A4 PDF invoice.
   - Automated WhatsApp invoice sharing via UltraMsg integration.
3. **Inventory Management**:
   - Dual category support: **New Box Pack** & **Used Phones**.
   - Comprehensive brand selector (Apple, Samsung, Google Pixel, Xiaomi, Redmi, Poco, Realme, Vivo, Oppo, Infinix, Tecno, QMobile, and custom brands).
   - RAM (1GB–24GB) and Storage (16GB–1TB) quick select & editable inputs.
   - Multi-IMEI tracking (IMEI 1 & IMEI 2) and PTA registration status.
4. **Customer Directory & Credit (Udhaar) Ledger**:
   - Customer balances, payment collection history, and account statements.
   - Edit and delete customer records.
5. **Purchases & Supplier Payables**:
   - Stock influx records with supplier invoicing.
   - Supplier ledger management and bill payouts.
   - Edit and delete purchase orders with automatic stock readjustment.
6. **Expense Tracker**:
   - Categorized daily expense logging (Shop Rent, Bills, Salaries, Refreshments, Maintenance).
7. **Reports & Financial Analytics**:
   - Daily, weekly, and monthly revenue, profit margin calculations, and expense summaries.

---

## 💾 Database Backup & Restore

### Taking a Backup:
Open Command Prompt and run:
```bash
mongodump --db=UmarFarooqMobileShop --out=C:\Backups\MobileShop_%date:~-4,4%%date:~-10,2%%date:~-7,2%
```

### Restoring a Backup:
```bash
mongorestore --db=UmarFarooqMobileShop C:\Backups\<Backup_Folder>\UmarFarooqMobileShop
```

---

## ❓ Troubleshooting & FAQs

#### 1. Error: `listen EADDRINUSE: address already in use :::3000`
- **Cause**: Another node process is already using Port 3000.
- **Solution**: Open PowerShell and kill the running process:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
  ```
  Then restart backend server.

#### 2. Error: `MongoDB Connection Warning: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause**: MongoDB service is not running on the client computer.
- **Solution**: Open Windows Services (`services.msc`), find **MongoDB Server**, right-click and click **Start**.

#### 3. How to change Store Name, Address, or Logo?
- Navigate to **Settings** from the sidebar menu to update Store Name, Contact Numbers, Address, Receipt Footer Message, and Currency symbol (`Rs.`).

---

**Developed for**: Umar Farooq Mobile Zone  
**Support & Contact**: Umar Farooq (`0345-7725525` / `Umarfarooq201520@gmail.com`)

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { PwaInstallBanner } from './components/common/PwaInstallPrompt';
import { LayoutDashboard, ShoppingCart, FileText, Smartphone, Menu } from 'lucide-react';

import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Sales } from './views/Sales';
import { Purchases } from './views/Purchases';
import { Invoices } from './views/Invoices';
import { Customers } from './views/Customers';
import { Suppliers } from './views/Suppliers';
import { Expenses } from './views/Expenses';
import { Reports } from './views/Reports';
import { Users } from './views/Users';

function MainLayout() {
  const { isAuthenticated, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <Login />
        <Toast />
        <PwaInstallBanner />
      </>
    );
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && ['dashboard', 'reports', 'users', 'expenses'].includes(activeTab)) {
      setActiveTab('inventory');
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} setSelectedSale={setSelectedSale} />;
      case 'inventory':
        return <Inventory searchQuery={searchQuery} />;
      case 'sales':
        return <Sales searchQuery={searchQuery} setSelectedSale={setSelectedSale} setActiveTab={setActiveTab} />;
      case 'purchases':
        return <Purchases searchQuery={searchQuery} />;
      case 'invoices':
        return <Invoices searchQuery={searchQuery} selectedSale={selectedSale} setSelectedSale={setSelectedSale} />;
      case 'customers':
        return <Customers searchQuery={searchQuery} />;
      case 'suppliers':
        return <Suppliers searchQuery={searchQuery} />;
      case 'expenses':
        return <Expenses searchQuery={searchQuery} />;
      case 'reports':
        return <Reports searchQuery={searchQuery} />;
      case 'users':
        return <Users searchQuery={searchQuery} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} setSelectedSale={setSelectedSale} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="main-viewport">
        <Navbar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="content-body">{renderView()}</main>
      </div>

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`mobile-bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileSidebarOpen(false);
          }}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('sales');
            setIsMobileSidebarOpen(false);
          }}
        >
          <ShoppingCart size={20} />
          <span>POS Sale</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('invoices');
            setIsMobileSidebarOpen(false);
          }}
        >
          <FileText size={20} />
          <span>Invoices</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('inventory');
            setIsMobileSidebarOpen(false);
          }}
        >
          <Smartphone size={20} />
          <span>Stock</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${isMobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>

      <Toast />
      <PwaInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

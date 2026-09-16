import React, { useState } from 'react';
import {
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Users,
  Truck,
  Receipt,
  BarChart3,
  ShieldAlert,
  ChevronRight,
  Laptop,
  Download,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DownloadAppModal } from '../common/DownloadAppModal';
import { PwaInstallModal } from '../common/PwaInstallPrompt';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { isAdmin } = useApp();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const isElectron = window.electronAPI?.isElectron;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Products / Stock', icon: Smartphone },
    { id: 'sales', label: 'New Sale (POS)', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'invoices', label: 'Invoices History', icon: FileText },
    { id: 'customers', label: 'Customer Dues', icon: Users },
    { id: 'suppliers', label: 'Supplier Payables', icon: Truck },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'users', label: 'Profile & Staff Team', icon: Users },
    { id: 'install-mobile-app', label: 'Install Mobile App (PWA)', icon: Smartphone, isPwaInstallAction: true },
    { id: 'download-app', label: 'Download Desktop App', icon: Laptop, isDownloadAction: true },
  ];

  const handleNavClick = (item) => {
    if (item.isDownloadAction) {
      setShowDownloadModal(true);
    } else if (item.isPwaInstallAction) {
      setShowPwaModal(true);
    } else {
      setActiveTab(item.id);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 998,
          }}
        />
      )}
      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '250px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'var(--transition-fast)',
        }}
      >
        <div style={{ padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-dim)',
              }}
            >
              Navigation Menu
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mobile-sidebar-close-btn"
              title="Close Menu"
              style={{
                display: 'none', // Shown on mobile
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.3rem',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem 1.5rem 0.75rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = item.adminOnly && !isAdmin;

            return (
              <div
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  margin: '0.25rem 0',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  background: item.isDownloadAction
                    ? 'rgba(56, 189, 248, 0.08)'
                    : isActive
                    ? 'rgba(56, 189, 248, 0.12)'
                    : 'transparent',
                  borderLeft: isActive ? '4px solid var(--accent-cyan)' : '4px solid transparent',
                  color: item.isDownloadAction
                    ? 'var(--accent-cyan)'
                    : isActive
                    ? 'var(--accent-cyan)'
                    : 'var(--text-muted)',
                  fontWeight: isActive || item.isDownloadAction ? 700 : 500,
                  opacity: isRestricted ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Icon size={18} color={item.isDownloadAction || isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                </div>
                {item.isDownloadAction ? (
                  <Download size={14} color="var(--accent-cyan)" />
                ) : (
                  isActive && <ChevronRight size={14} color="var(--accent-cyan)" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Download App Action Banner */}
        {!isElectron && (
          <div
            style={{
              margin: '0.75rem',
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(14, 165, 233, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.25rem',
              }}
            >
              <Laptop size={15} color="var(--accent-cyan)" /> Windows App
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              Run natively as Desktop Client
            </div>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="btn btn-primary btn-sm"
              style={{
                width: '100%',
                fontSize: '0.75rem',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontWeight: 700,
              }}
            >
              <Download size={13} /> Download App (.exe)
            </button>
          </div>
        )}

        {/* Footer Branding */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
            ⚡ Developed by <span style={{ color: 'var(--accent-cyan)' }}>Imad Khan</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Cell: <strong>+92 348 0779919</strong>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
            imad31910@gmail.com
          </div>
        </div>
      </aside>

      <DownloadAppModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
      <PwaInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />
    </>
  );
};


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Smartphone,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Search,
  CheckCircle,
  LogOut,
  Sun,
  Moon,
  Compass,
  X,
  Laptop,
  Download,
} from 'lucide-react';
import { DownloadAppModal } from '../common/DownloadAppModal';

export const Navbar = ({ onSearch, searchQuery, setActiveTab }) => {
  const { storeSettings, currentUser, switchRole, logout, isAdmin, products, theme, setTheme } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const isElectron = window.electronAPI?.isElectron;
  const lowStockCount = (products || []).filter((p) => p.stock <= p.minStockLimit).length;

  return (
    <>
      <header
        style={{
          height: '70px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          transition: 'var(--transition-fast)',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
            }}
          >
            <Smartphone size={24} color="#041221" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.15rem',
                letterSpacing: '-0.01em',
                color: 'var(--text-main)',
              }}
            >
              {storeSettings.storeName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {storeSettings.tagline}
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <div
          style={{
            position: 'relative',
            width: '340px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px' }}
          />
          <input
            type="text"
            placeholder="Search products, IMEIs, invoices, customers..."
            value={searchQuery || ''}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '38px',
              paddingRight: searchQuery ? '36px' : '14px',
              height: '38px',
              fontSize: '0.85rem',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          />
          {searchQuery && (
            <X
              size={16}
              color="var(--text-muted)"
              onClick={() => onSearch && onSearch('')}
              style={{ position: 'absolute', right: '12px', cursor: 'pointer' }}
            />
          )}
        </div>

        {/* Right Controls, Theme Toggle, User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Low Stock Alert */}
          {lowStockCount > 0 && (
            <div
              className="badge badge-amber"
              title={`${lowStockCount} item(s) on low stock alert`}
              style={{ cursor: 'pointer', padding: '0.4rem 0.75rem' }}
            >
              <AlertTriangle size={14} />
              <span>{lowStockCount} Low Stock</span>
            </div>
          )}

          {/* Theme Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="btn btn-secondary btn-sm"
              title="Switch color theme"
              style={{
                padding: '0.45rem 0.75rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {theme === 'dark' && <Moon size={15} color="var(--accent-cyan)" />}
            {theme === 'light' && <Sun size={15} color="#eab308" />}
            {theme === 'ocean' && <Compass size={15} color="#14b8a6" />}
            <span style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{theme}</span>
          </button>

          {/* Theme Selector Dropdown Menu */}
          {showThemeDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '180px',
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '0.5rem',
                boxShadow: 'var(--shadow-card)',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  padding: '0.35rem 0.5rem',
                  textTransform: 'uppercase',
                }}
              >
                Select Theme
              </div>

              <div
                onClick={() => {
                  setTheme('dark');
                  setShowThemeDropdown(false);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Moon size={15} color="var(--accent-cyan)" />
                <span style={{ flex: 1 }}>Dark Obsidian</span>
                {theme === 'dark' && <CheckCircle size={14} color="var(--accent-cyan)" />}
              </div>

              <div
                onClick={() => {
                  setTheme('light');
                  setShowThemeDropdown(false);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  background: theme === 'light' ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '0.2rem',
                }}
              >
                <Sun size={15} color="#eab308" />
                <span style={{ flex: 1 }}>Clean Light</span>
                {theme === 'light' && <CheckCircle size={14} color="#eab308" />}
              </div>

              <div
                onClick={() => {
                  setTheme('ocean');
                  setShowThemeDropdown(false);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  background: theme === 'ocean' ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '0.2rem',
                }}
              >
                <Compass size={15} color="#14b8a6" />
                <span style={{ flex: 1 }}>Oceanic Teal</span>
                {theme === 'ocean' && <CheckCircle size={14} color="#14b8a6" />}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.4rem 0.85rem',
                background: isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                border: `1px solid ${isAdmin ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                borderRadius: '24px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: isAdmin ? '#34d399' : '#38bdf8',
                  }}
                >
                  {currentUser.role} Mode
                </div>
              </div>
            </div>

            {/* Profile Dropdown Panel */}
            {showRoleDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '240px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  boxShadow: 'var(--shadow-card)',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Switch Active Role
                </div>
                <div
                  onClick={() => {
                    switchRole('admin');
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    background: isAdmin ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  <ShieldCheck size={16} color="var(--accent-emerald)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Admin (Owner)</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Full store management
                    </div>
                  </div>
                  {isAdmin && <CheckCircle size={14} color="var(--accent-emerald)" />}
                </div>

                <div
                  onClick={() => {
                    switchRole('staff');
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    background: !isAdmin ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <UserCheck size={16} color="var(--accent-cyan)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Sales Staff</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      POS & Sales operations
                    </div>
                  </div>
                  {!isAdmin && <CheckCircle size={14} color="var(--accent-cyan)" />}
                </div>

                {/* Manage Profile Link */}
                <div
                  onClick={() => {
                    setShowRoleDropdown(false);
                    if (setActiveTab) setActiveTab('users');
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--accent-cyan)',
                  }}
                >
                  <User size={16} />
                  <span>My Profile & Password</span>
                </div>

                {/* Logout Option */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                  }}
                >
                  <div
                    onClick={() => {
                      setShowRoleDropdown(false);
                      logout();
                    }}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      color: '#fb7185',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out / Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Direct Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign out of your account"
          style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
    <DownloadAppModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
  </>
);
};

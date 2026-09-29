import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  AlertTriangle,
  Search,
  CheckCircle,
  LogOut,
  Sun,
  Moon,
  Compass,
  X,
  Menu,
} from 'lucide-react';

export const Navbar = ({ onSearch, searchQuery, onToggleMobileSidebar }) => {
  const { storeSettings, logout, products, theme, setTheme } = useApp();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const lowStockCount = (products || []).filter((p) => p.stock <= p.minStockLimit).length;

  return (
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="mobile-hamburger-btn"
          title="Open Mobile Navigation Menu"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.5rem',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'none', // Shown on mobile via CSS
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={20} />
        </button>

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
            flexShrink: 0,
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

      {/* Right Controls, Theme Toggle & Logout */}
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
  );
};

import React from 'react';
import { Laptop, Download, CheckCircle, X, Shield, Terminal, Zap } from 'lucide-react';
import { API_BASE_URL } from '../../context/AppContext';

export const DownloadAppModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isElectron = window.electronAPI?.isElectron;

  const handleDownload = () => {
    const downloadUrl = `${API_BASE_URL}/download-desktop-app`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '1.75rem 1.5rem',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Laptop size={28} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                Umar Farooq Mobile Zone
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                Desktop Application for Windows (Electron.js)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {isElectron ? (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={24} color="#22c55e" />
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem' }}>
                  Aap already Desktop Application mein hain!
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Active Electron Desktop Client Connected.
                </span>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                System ko standalone Windows desktop app ke taur par istemal karne ke liye niche diye gaye link se <strong>Setup Executable (.exe)</strong> download karein.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <Zap size={16} color="var(--accent-cyan)" /> Fast Native Performance & Thermal Receipt Printing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <Shield size={16} color="var(--accent-cyan)" /> Auto-Managed Integrated Local Database Server
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <Laptop size={16} color="var(--accent-cyan)" /> Independent Windows Window (No Browser Tab Needed)
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                  }}
                >
                  <Download size={18} /> Download Desktop App (.exe)
                </button>
              </div>

              {/* Terminal build hint for devs */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <Terminal size={14} color="var(--accent-cyan)" /> To Build .exe Installer Locally:
                </div>
                <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                  npm run build:electron
                </code>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.1)',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

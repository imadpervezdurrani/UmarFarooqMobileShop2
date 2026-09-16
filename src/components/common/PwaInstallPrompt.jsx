import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle, Share2, PlusSquare, Zap, Shield, Sparkles } from 'lucide-react';
import { promptPwaInstall, isPwaInstalled, isIosDevice, canInstallPwa } from '../../registerServiceWorker';

export const PwaInstallModal = ({ isOpen, onClose }) => {
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installPromptReady, setInstallPromptReady] = useState(false);

  useEffect(() => {
    setInstalled(isPwaInstalled());
    setIsIos(isIosDevice());
    setInstallPromptReady(canInstallPwa());

    const handleStatusChange = (e) => {
      setInstallPromptReady(e.detail?.isAvailable || false);
      if (e.detail?.installed) {
        setInstalled(true);
      }
    };

    window.addEventListener('pwa-install-status', handleStatusChange);
    return () => window.removeEventListener('pwa-install-status', handleStatusChange);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await promptPwaInstall();
    if (res?.outcome === 'accepted') {
      setInstalled(true);
      onClose();
    }
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
        zIndex: 2100,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '1.5rem',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#0b0f19',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              <Smartphone size={28} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Umar Farooq Mobile App
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                Android & iOS Progressive Web App (PWA)
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {installed ? (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <CheckCircle size={28} color="#10b981" />
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem' }}>
                  Mobile App Already Installed!
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Aapka system phone ki home screen par installed app ki tarah mojood hai.
                </span>
              </div>
            </div>
          ) : isIos ? (
            <div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                iPhone / iPad par install karne ke liye <strong>Safari Browser</strong> mein yeh do aasan steps karein:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Share2 size={18} color="var(--accent-cyan)" />
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Step 1:</strong> Safari ke bottom bar par <strong>Share</strong> icon par tap karein
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlusSquare size={18} color="var(--accent-emerald)" />
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Step 2:</strong> Menu scroll karke <strong>'Add to Home Screen'</strong> par tap karein
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  padding: '0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--accent-cyan)',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.08)',
                }}
              >
                App aapke iPhone ki Home Screen par standalone icon ke sath add ho jayegi!
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Apne Android phone ya desktop browser par <strong>Umar Farooq Mobile Zone</strong> ko direct mobile app ke taur par install karein:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <Zap size={16} color="var(--accent-cyan)" /> Standalone Fullscreen View (Bina Browser Bar Ke)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <Sparkles size={16} color="var(--accent-emerald)" /> Fast Offline & Quick Local Performance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <Shield size={16} color="var(--accent-violet)" /> Direct Home Screen Icon Access
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)',
                }}
              >
                <Download size={20} /> Install Mobile App Now
              </button>

              {!installPromptReady && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.75rem', marginBottom: 0 }}>
                  Agar prompt na aaye, Chrome ke 3 dots (⋮) menu se <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> select karein.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.1)',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const PwaInstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in session
    const isDismissed = sessionStorage.getItem('uf_pwa_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }

    const checkStatus = () => {
      const isStandalone = isPwaInstalled();
      const isMobile = window.innerWidth <= 768;
      setCanShow(!isStandalone && (isMobile || canInstallPwa()));
    };

    checkStatus();
    window.addEventListener('resize', checkStatus);
    window.addEventListener('pwa-install-status', checkStatus);

    return () => {
      window.removeEventListener('resize', checkStatus);
      window.removeEventListener('pwa-install-status', checkStatus);
    };
  }, []);

  if (dismissed || !canShow) return <PwaInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('uf_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      <div
        className="pwa-floating-banner"
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          left: '1rem',
          maxWidth: '420px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(18, 26, 43, 0.95), rgba(8, 11, 19, 0.98))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(56, 189, 248, 0.2)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              Umar Farooq Mobile App
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Phone par app install karein
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Download size={14} /> Install
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              padding: '0.35rem',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <PwaInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

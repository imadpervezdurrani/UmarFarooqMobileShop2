import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, accentColor = 'var(--accent-cyan)' }) => {
  return (
    <div className="glass-card stat-card glass-card-interactive" style={{ '--accent-gradient': `linear-gradient(90deg, ${accentColor}, transparent)` }}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ color: accentColor, background: `${accentColor}15` }}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
};

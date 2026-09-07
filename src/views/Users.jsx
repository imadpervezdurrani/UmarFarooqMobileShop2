import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  User,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  Edit2,
  Trash2,
  Plus,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  UserPlus,
  Briefcase,
  Smartphone,
  Save,
} from 'lucide-react';

export const Users = () => {
  const {
    currentUser,
    switchRole,
    isAdmin,
    users = [],
    updateProfile,
    changePassword,
    addUser,
    updateUser,
    deleteUser,
    resetDatabase,
  } = useApp();

  // Active Tab: 'profile' | 'staff' | 'permissions'
  const [activeTab, setActiveTab] = useState('profile');

  // --- 1. Profile Edit Form State ---
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    title: currentUser?.title || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- 2. Change Password Form State ---
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // --- 3. Staff Modal State ---
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    title: 'Sales Executive',
  });
  const [showStaffPass, setShowStaffPass] = useState(false);

  // Handle Profile Update Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) return;

    setIsSavingProfile(true);
    await updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      title: profileForm.title,
    });
    setIsSavingProfile(false);
  };

  // Handle Password Change Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      alert('New password must be at least 4 characters long.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsChangingPass(false);

    if (res?.success) {
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  // Open Add Staff Modal
  const openAddStaffModal = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      title: 'Sales Executive',
    });
    setIsStaffModalOpen(true);
  };

  // Open Edit Staff Modal
  const openEditStaffModal = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: '',
      role: staff.role || 'staff',
      title: staff.title || 'Sales Executive',
    });
    setIsStaffModalOpen(true);
  };

  // Handle Staff Add / Update Submit
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim()) return;

    if (editingStaff) {
      const payload = {
        name: staffForm.name,
        email: staffForm.email,
        role: staffForm.role,
        title: staffForm.title,
      };
      if (staffForm.password) payload.password = staffForm.password;
      await updateUser(editingStaff.id, payload);
    } else {
      if (!staffForm.password) {
        alert('Please provide an initial password for the new staff member.');
        return;
      }
      await addUser(staffForm);
    }

    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = async (id, staffName) => {
    if (window.confirm(`Are you sure you want to remove staff member "${staffName}"?`)) {
      await deleteUser(id);
    }
  };

  const permissionsList = [
    { action: 'Create Sales POS & Invoices', admin: true, staff: true, note: 'Allowed for daily counter sales' },
    { action: 'Add / Edit Mobile Devices', admin: true, staff: true, note: 'Can enter new devices & specs' },
    { action: 'Delete Mobile Inventory', admin: true, staff: false, note: 'Restricted to prevent accidental data loss' },
    { action: 'View Wholesale Purchase Cost Prices', admin: true, staff: false, note: 'Kept confidential from sales staff' },
    { action: 'Process Item Return / Refund', admin: true, staff: false, note: 'Requires owner authorization' },
    { action: 'View Profit & Loss Reports', admin: true, staff: false, note: 'Financial statements owner-only' },
    { action: 'Log Store Expenses', admin: true, staff: true, note: 'Staff can log utility & daily expenses' },
    { action: 'Delete Expense Log Entries', admin: true, staff: false, note: 'Owner audit control' },
    { action: 'Add & Manage Staff Accounts', admin: true, staff: false, note: 'Administrator access only' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Staff Management</h1>
          <p className="page-subtitle">Manage your personal profile, update password, add staff members, and control role permissions</p>
        </div>
        {isAdmin && (
          <button onClick={openAddStaffModal} className="btn btn-primary">
            <UserPlus size={16} />
            <span>Add New Staff</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.88rem' }}
        >
          <User size={16} />
          <span>My Profile & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.88rem' }}
        >
          <UserCheck size={16} />
          <span>Staff Team ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`btn ${activeTab === 'permissions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.88rem' }}
        >
          <ShieldCheck size={16} />
          <span>Security & Permissions</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: MY PROFILE & CHANGE PASSWORD */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Edit Profile Info */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent-cyan)" />
              <span>Personal Information</span>
            </h3>

            {/* Profile Avatar Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(8, 11, 19, 0.5)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg, var(--accent-emerald), #059669)' : 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <Badge variant={isAdmin ? 'emerald' : 'cyan'}>
                    {currentUser?.role?.toUpperCase()} • {currentUser?.title || 'Staff'}
                  </Badge>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Your Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="your.email@example.com"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Store Administrator / Owner"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="submit" disabled={isSavingProfile} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                  <Save size={16} />
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Change Password */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={18} color="var(--accent-amber)" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder="Enter current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    className="form-input"
                    placeholder="Enter new password (min 4 chars)"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    className="form-input"
                    placeholder="Re-type new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={isChangingPass || !passwordForm.oldPassword || !passwordForm.newPassword}
                  className="btn btn-emerald"
                  style={{ padding: '0.6rem 1.5rem' }}
                >
                  <Lock size={16} />
                  <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: STAFF & TEAM MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'staff' && (
        <div>
          <div className="glass-card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Staff & Admin Accounts</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Add team members, assign administrator or sales staff privileges
                </p>
              </div>
              {isAdmin && (
                <button onClick={openAddStaffModal} className="btn btn-primary btn-sm">
                  <UserPlus size={15} />
                  <span>Add Staff Member</span>
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Email Address</th>
                    <th>Role & Privilege</th>
                    <th>Designation</th>
                    <th>Created Date</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No staff accounts registered yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((staff) => {
                      const isCurrent = staff.id === currentUser?.id;
                      const staffIsAdmin = staff.role === 'admin';

                      return (
                        <tr key={staff.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background: staffIsAdmin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                                  color: staffIsAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  border: `1px solid ${staffIsAdmin ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                                }}
                              >
                                {staff.name ? staff.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span>{staff.name}</span>
                                  {isCurrent && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                                      (You)
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {staff.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{staff.email}</td>
                          <td>
                            <Badge variant={staffIsAdmin ? 'emerald' : 'cyan'}>
                              {staffIsAdmin ? 'Admin (Full Access)' : 'Sales Staff'}
                            </Badge>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {staff.title || (staffIsAdmin ? 'Store Administrator' : 'Sales Executive')}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {staff.createdAt || 'N/A'}
                          </td>
                          {isAdmin && (
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => openEditStaffModal(staff)}
                                  className="btn btn-secondary btn-icon"
                                  title="Edit Staff Member"
                                >
                                  <Edit2 size={15} />
                                </button>
                                {!isCurrent && (
                                  <button
                                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                    className="btn btn-danger btn-icon"
                                    title="Delete Staff Member"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: SECURITY & ROLE PERMISSION MATRIX */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'permissions' && (
        <div>
          {/* Role Switcher Banner */}
          <div
            className="glass-card"
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              border: `1px solid ${isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}
              >
                {currentUser?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Active Testing Session: {currentUser?.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Current Role Mode: <span style={{ color: isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)', fontWeight: 700 }}>{currentUser?.role?.toUpperCase()}</span> ({currentUser?.title})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => switchRole('admin')}
                className={`btn ${isAdmin ? 'btn-emerald' : 'btn-secondary'}`}
              >
                <ShieldCheck size={16} />
                <span>Switch to Admin Mode</span>
              </button>
              <button
                onClick={() => switchRole('staff')}
                className={`btn ${!isAdmin ? 'btn-primary' : 'btn-secondary'}`}
              >
                <UserCheck size={16} />
                <span>Switch to Sales Staff Mode</span>
              </button>
            </div>
          </div>

          {/* Permission Comparison Matrix Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="var(--accent-cyan)" />
              <span>Role Permission Matrix</span>
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>System Action / Feature</th>
                    <th style={{ textAlign: 'center' }}>Admin (Owner)</th>
                    <th style={{ textAlign: 'center' }}>Sales Staff</th>
                    <th>Security Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionsList.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{p.action}</td>
                      <td style={{ textAlign: 'center' }}>
                        {p.admin ? (
                          <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                            <CheckCircle2 size={16} /> Allowed
                          </span>
                        ) : (
                          <span style={{ color: '#fb7185', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <XCircle size={16} /> Denied
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {p.staff ? (
                          <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                            <CheckCircle2 size={16} /> Allowed
                          </span>
                        ) : (
                          <span style={{ color: '#fb7185', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <XCircle size={16} /> Denied
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Database Maintenance & Clear Dummy Data Card */}
          {isAdmin && (
            <div
              className="glass-card"
              style={{
                marginTop: '1.5rem',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={18} />
                  <span>Clear All Dummy & Test Data</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Wipe all sample products, dummy invoices, dummy purchases, and test logs from the database & localStorage.
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to purge all dummy/test products, sales, and logs? Your store settings and admin accounts will be kept.')) {
                    resetDatabase();
                  }
                }}
                className="btn btn-danger"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                <Trash2 size={15} />
                <span>Purge Dummy Data Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADD / EDIT STAFF MODAL */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Add New Staff Member'}
      >
        <form onSubmit={handleStaffSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Ali Ahmed"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Login Username) *</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. ali@celltech.com"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {editingStaff ? 'Reset Password (Leave blank to keep unchanged)' : 'Initial Password *'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showStaffPass ? 'text' : 'password'}
                required={!editingStaff}
                minLength={4}
                className="form-input"
                placeholder={editingStaff ? '••••••••' : 'Enter password (min 4 chars)'}
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowStaffPass(!showStaffPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showStaffPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role Privilege *</label>
              <select
                className="form-select"
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    role: e.target.value,
                    title: e.target.value === 'admin' ? 'Store Administrator' : 'Sales Executive',
                  })
                }
              >
                <option value="staff">Sales Staff (POS & Stock Entry)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Cashier"
                value={staffForm.title}
                onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsStaffModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{editingStaff ? 'Save Changes' : 'Create Staff Member'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

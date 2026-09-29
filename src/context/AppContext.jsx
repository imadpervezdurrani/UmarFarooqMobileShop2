import React, { createContext, useContext, useState, useEffect } from 'react';
import { sortByNewest } from '../utils/sortUtils';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;
    // When on Vercel or HTTPS, use relative /api to prevent Mixed Content & port 3000 failures
    if (protocol === 'https:' || hostname.includes('vercel.app')) {
      return '/api';
    }
    // If accessing via local Wi-Fi IP from phone (e.g., 192.168.x.x)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3000/api`;
    }
  }
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();

const defaultStoreSettings = {
  storeName: 'Umar Farooq Mobile Zone',
  ownerName: 'Umar Farooq',
  tagline: 'Premium Smartphones & Official Warranty Hub',
  phone: '0345-7725525',
  email: 'Umarfarooq201520@gmail.com',
  address: 'Al-Firdous Plaza, Shop No.01 Ground Floor, Nowshera Cantt',
  currency: 'Rs.',
  invoicePrefix: 'INV-',
  purchasePrefix: 'PO-',
  taxRate: 0,
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Store Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('celltech_settings');
    return saved
      ? {
          ...defaultStoreSettings,
          ...JSON.parse(saved),
          ownerName: 'Umar Farooq',
          storeName: 'Umar Farooq Mobile Zone',
          phone: '0345-7725525',
          email: 'Umarfarooq201520@gmail.com',
          address: 'Al-Firdous Plaza, Shop No.01 Ground Floor, Nowshera Cantt',
        }
      : {
          ...defaultStoreSettings,
          ownerName: 'Umar Farooq',
          storeName: 'Umar Farooq Mobile Zone',
          phone: '0345-7725525',
          email: 'Umarfarooq201520@gmail.com',
          address: 'Al-Firdous Plaza, Shop No.01 Ground Floor, Nowshera Cantt',
        };
  });

  // Active Theme State ('dark' | 'light' | 'ocean')
  const [theme, setThemeState] = useState(() => localStorage.getItem('celltech_theme') || 'dark');

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('celltech_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showToast(`Switched active theme to ${newTheme.toUpperCase()} mode`, 'info');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Current User & Auth State (Strictly Database Verified)
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem('celltech_token') || '';
    if (token === 'offline-local-token') {
      localStorage.removeItem('celltech_token');
      localStorage.removeItem('celltech_user');
      return '';
    }
    return token;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    if (localStorage.getItem('celltech_token') === 'offline-local-token') return null;
    const saved = localStorage.getItem('celltech_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('celltech_token');
    return Boolean(token && token !== 'offline-local-token' && localStorage.getItem('celltech_user'));
  });

  // Main Entities State (Loaded directly from Database)
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper headers with JWT Bearer Token
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': authToken ? `Bearer ${authToken}` : '',
    'x-user-role': currentUser?.role || 'admin',
  });

  // Fetch all data from Express API
  const fetchAllDataFromBackend = async () => {
    try {
      const [prodRes, custRes, suppRes, salesRes, poRes, expRes, payRes, histRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/customers`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/suppliers`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/sales`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/purchases`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/expenses`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/payments`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/stock`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/users`, { headers: getHeaders() }),
      ]);

      if (prodRes.ok) {
        const res = await prodRes.json();
        if (res.data) setProducts([...res.data].sort(sortByNewest));
      }
      if (custRes.ok) {
        const res = await custRes.json();
        if (res.data) setCustomers([...res.data].sort(sortByNewest));
      }
      if (suppRes.ok) {
        const res = await suppRes.json();
        if (res.data) setSuppliers([...res.data].sort(sortByNewest));
      }
      if (salesRes.ok) {
        const res = await salesRes.json();
        if (res.data) {
          const uniqueSales = Array.from(new Map(res.data.map((item) => [item.id, item])).values()).sort(sortByNewest);
          setSales(uniqueSales);
        }
      }
      if (poRes.ok) {
        const res = await poRes.json();
        if (res.data) setPurchases([...res.data].sort(sortByNewest));
      }
      if (expRes.ok) {
        const res = await expRes.json();
        if (res.data) setExpenses([...res.data].sort(sortByNewest));
      }
      if (payRes.ok) {
        const res = await payRes.json();
        if (res.data) setPayments([...res.data].sort(sortByNewest));
      }
      if (histRes.ok) {
        const res = await histRes.json();
        if (res.data) setStockHistory([...res.data].sort(sortByNewest));
      }
      if (userRes && userRes.ok) {
        const res = await userRes.json();
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setUsers(res.data);
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend API server offline:', err.message);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDataFromBackend();
    }
  }, [currentUser, isAuthenticated]);

  // Sync settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('celltech_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Secure API Login Handler
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const body = await res.json();
        const user = body.data?.user;
        const token = body.data?.token;

        if (user && token) {
          setCurrentUser(user);
          setAuthToken(token);
          setIsAuthenticated(true);
          localStorage.setItem('celltech_user', JSON.stringify(user));
          localStorage.setItem('celltech_token', token);
          showToast(`Welcome back, ${user.name}!`);
          return true;
        }
      } else {
        const errBody = await res.json().catch(() => ({}));
        showToast(errBody.message || 'Invalid email or password', 'error');
        return false;
      }
    } catch (err) {
      console.error('Backend API connection error during login:', err.message);
      showToast('Cannot connect to backend database server. Please ensure backend is running.', 'error');
      return false;
    }

    showToast('Authentication failed: Invalid credentials', 'error');
    return false;
  };

  // Logout Handler
  const logout = () => {
    setCurrentUser(null);
    setAuthToken('');
    setIsAuthenticated(false);
    localStorage.removeItem('celltech_user');
    localStorage.removeItem('celltech_token');
    showToast('Logged out successfully', 'info');
  };

  // Switch role helper for active session
  const switchRole = (roleType) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: roleType };
    setCurrentUser(updatedUser);
    localStorage.setItem('celltech_user', JSON.stringify(updatedUser));
    showToast(`Switched active user to ${roleType.toUpperCase()} role`, 'info');
  };

  const isAdmin = currentUser?.role === 'admin';

  // ----------------------------------------------------
  // PROFILE & STAFF MANAGEMENT ACTIONS
  // ----------------------------------------------------
  const updateProfile = async (fields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const updated = { ...currentUser, ...data.data };
        setCurrentUser(updated);
        localStorage.setItem('celltech_user', JSON.stringify(updated));
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...data.data } : u)));
        showToast('Profile updated successfully!');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const updated = { ...currentUser, ...fields };
      setCurrentUser(updated);
      localStorage.setItem('celltech_user', JSON.stringify(updated));
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...fields } : u)));
      showToast('Profile updated!');
      return { success: true };
    }
  };

  const changePassword = async ({ oldPassword, newPassword }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password changed successfully!');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to change password', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Error changing password', 'error');
      return { success: false, message: err.message };
    }
  };

  const addUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUsers((prev) => [data.data, ...prev]);
        showToast(`Staff member "${data.data.name}" added successfully!`);
        return { success: true, user: data.data };
      } else {
        showToast(data.message || 'Failed to add staff member', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('API Error adding user:', err);
      showToast('Cannot connect to database server', 'error');
      return { success: false, message: err.message };
    }
  };

  const updateUser = async (id, fields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUsers((prev) => prev.map((u) => (u.id === id ? data.data : u)));
        if (currentUser?.id === id) {
          const updated = { ...currentUser, ...data.data };
          setCurrentUser(updated);
          localStorage.setItem('celltech_user', JSON.stringify(updated));
        }
        showToast('Staff member updated successfully!');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to update staff member', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('API Error updating user:', err);
      showToast('Cannot connect to database server', 'error');
      return { success: false };
    }
  };

  const deleteUser = async (id) => {
    if (currentUser?.id === id) {
      showToast('Cannot delete your own active account!', 'error');
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast('Staff member deleted successfully!');
        return true;
      } else {
        showToast('Failed to delete staff member from database', 'error');
        return false;
      }
    } catch (err) {
      console.error('API Error deleting user:', err);
      showToast('Cannot connect to database server', 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // PRODUCT & INVENTORY ACTIONS
  // ----------------------------------------------------
  const addProduct = async (prodData) => {
    const newProduct = {
      ...prodData,
      id: `prod-${Date.now()}`,
      category: prodData.category || 'New Phone',
      stock: parseInt(prodData.stock, 10) || 0,
      purchasePrice: parseFloat(prodData.purchasePrice) || 0,
      salePrice: parseFloat(prodData.salePrice) || 0,
      minStockLimit: parseInt(prodData.minStockLimit, 10) || 2,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        const body = await res.json();
        const savedProd = body.data || newProduct;
        setProducts((prev) => [savedProd, ...prev.filter((p) => p.id !== savedProd.id)]);
        fetchAllDataFromBackend();
        showToast(`Product "${savedProd.brand} ${savedProd.model}" added to Database!`);
        return savedProd;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to add product to database', 'error');
        return null;
      }
    } catch (err) {
      console.error('API Error adding product:', err);
      showToast('Cannot reach database server to save product', 'error');
      return null;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast('Product updated successfully in Database!');
        return true;
      } else {
        showToast('Failed to update product in database', 'error');
        return false;
      }
    } catch (err) {
      console.error('API Error updating product:', err);
      showToast('Cannot reach database server', 'error');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Admins can delete products!', 'error');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('Deleted product from Database', 'warning');
        return true;
      } else {
        showToast('Failed to delete product from database', 'error');
        return false;
      }
    } catch (err) {
      console.error('API Error deleting product:', err);
      showToast('Cannot reach database server', 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // SALES & POS ACTIONS
  // ----------------------------------------------------
  const createSale = async (salePayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...salePayload,
          salesPerson: currentUser ? currentUser.name : 'Staff',
        }),
      });

      if (res.ok) {
        const body = await res.json();
        const createdSale = body.data;
        setSales((prev) => [createdSale, ...prev.filter((s) => s.id !== createdSale.id)]);
        fetchAllDataFromBackend();
        showToast(`Invoice ${createdSale.invoiceNo} generated via Database!`);
        
        // Auto-dispatch WhatsApp invoice
        if (createdSale.customerPhone) {
          sendInvoiceWhatsApp(createdSale.invoiceNo, createdSale.customerPhone);
        }
        
        return createdSale;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Failed to complete sale in database', 'error');
        return null;
      }
    } catch (err) {
      console.error('API Error processing sale:', err);
      showToast('Cannot reach database server to process sale', 'error');
      return null;
    }
  };

  const refundSale = async (saleId, productId = null, refundQty = 1) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Admins can process refunds!', 'error');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/sales/${saleId}/refund`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, refundQty }),
      });

      if (res.ok) {
        await fetchAllDataFromBackend();
        showToast('Refund processed & stock restored in Database!', 'success');
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to process refund in database', 'error');
        return false;
      }
    } catch (err) {
      console.error('API Error processing refund:', err);
      showToast('Cannot reach database server', 'error');
      return false;
    }
  };

  const updateSale = async (id, fields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const body = await res.json();
        setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...body.data } : s)));
        await fetchAllDataFromBackend();
        showToast('Invoice updated successfully in Database!');
        return body.data;
      } else {
        showToast('Failed to update invoice in database', 'error');
        return null;
      }
    } catch (err) {
      console.error('API Error updating sale:', err);
      showToast('Cannot reach database server', 'error');
      return null;
    }
  };

  const deleteSale = async (id, restock = true) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ restock }),
      });
      if (res.ok) {
        setSales((prev) => prev.filter((s) => s.id !== id));
        fetchAllDataFromBackend();
        showToast('Invoice deleted from Database!', 'warning');
        return true;
      } else {
        showToast('Failed to delete invoice from database', 'error');
        return false;
      }
    } catch (err) {
      console.error('API Error deleting sale:', err);
      showToast('Cannot reach database server', 'error');
      return false;
    }
  };

  const sendInvoiceWhatsApp = async (invoiceNo, phone = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${invoiceNo}/send-whatsapp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        const body = await res.json();
        showToast(`Invoice ${invoiceNo} dispatched to customer on WhatsApp!`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error dispatching WhatsApp invoice:', err);
    }
  };

  // ----------------------------------------------------
  // PURCHASE & PURCHASE RETURN ACTIONS
  // ----------------------------------------------------
  const createPurchase = async (purchasePayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(purchasePayload),
      });

      if (res.ok) {
        const body = await res.json();
        const createdPo = body.data;
        setPurchases((prev) => [createdPo, ...prev]);
        fetchAllDataFromBackend();
        showToast(`PO ${createdPo.purchaseNo} logged & stock increased!`);
        return createdPo;
      }
    } catch (err) {
      console.error('API Error creating purchase:', err);
    }
  };

  const processPurchaseReturn = async (purchaseId, returnPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases/${purchaseId}/return`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(returnPayload),
      });

      if (res.ok) {
        const body = await res.json();
        fetchAllDataFromBackend();
        showToast(`Purchase Return logged: ${storeSettings.currency} ${parseFloat(returnPayload.returnAmount).toLocaleString()} credited`);
        return body.data;
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to process purchase return', 'error');
      }
    } catch (err) {
      console.error('API Error processing purchase return:', err);
    }
  };

  const updatePurchase = async (id, fields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const body = await res.json();
        setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, ...body.data } : p)));
        fetchAllDataFromBackend();
        showToast('Purchase order updated!');
        return body.data;
      }
    } catch (err) {
      console.error('API Error updating purchase:', err);
    }
    setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
    showToast('Purchase order updated');
    return true;
  };

  const deletePurchase = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setPurchases((prev) => prev.filter((p) => p.id !== id));
        fetchAllDataFromBackend();
        showToast('Purchase order deleted!', 'warning');
        return true;
      }
    } catch (err) {
      console.error('API Error deleting purchase:', err);
    }
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    showToast('Purchase order removed', 'warning');
    return true;
  };

  // ----------------------------------------------------
  // CUSTOMER & SUPPLIER ACTIONS
  // ----------------------------------------------------
  const addCustomer = async (cust) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cust),
      });
      if (res.ok) {
        const body = await res.json();
        setCustomers((prev) => [body.data, ...prev]);
        showToast(`Customer "${body.data.name}" registered in Database!`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error adding customer:', err);
    }
  };

  const recordCustomerPayment = async (customerId, amount, notes = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${customerId}/payment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount, notes }),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast(`Recorded customer payment of ${storeSettings.currency} ${parseFloat(amount).toLocaleString()}`);
      }
    } catch (err) {
      console.error('API Error recording customer payment:', err);
    }
  };

  const updateCustomer = async (id, fields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const body = await res.json();
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...body.data } : c)));
        fetchAllDataFromBackend();
        showToast('Customer details & dues updated in Database!');
        return body.data;
      } else {
        showToast('Failed to update customer in database', 'error');
        return null;
      }
    } catch (err) {
      console.error('API Error updating customer:', err);
      showToast('Cannot reach database server', 'error');
      return null;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        fetchAllDataFromBackend();
        showToast('Customer profile deleted from Database!', 'warning');
        return true;
      } else {
        showToast('Failed to delete customer from database', 'error');
        return false;
      }
    } catch (err) {
      console.error('API Error deleting customer:', err);
      showToast('Cannot reach database server', 'error');
      return false;
    }
  };

  const addSupplier = async (supp) => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supp),
      });
      if (res.ok) {
        const body = await res.json();
        setSuppliers((prev) => [body.data, ...prev.filter((s) => s.id !== body.data.id)]);
        fetchAllDataFromBackend();
        showToast(`Supplier "${body.data.name}" registered in Database!`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error adding supplier:', err);
    }
  };

  const fetchSupplierLedger = async (supplierId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/ledger`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch (err) {
      console.error('API Error fetching supplier ledger:', err);
    }
    return null;
  };

  const recordSupplierPayment = async (supplierId, amount, notes = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/payout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount, notes }),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast(`Recorded payout of ${storeSettings.currency} ${parseFloat(amount).toLocaleString()}`);
      }
    } catch (err) {
      console.error('API Error recording supplier payout:', err);
    }
  };

  const recordSupplierBill = async (supplierId, totalAmount, paidAmount = 0, notes = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/bill`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ totalAmount, paidAmount, notes }),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast(`Recorded new bill of ${storeSettings.currency} ${parseFloat(totalAmount).toLocaleString()}`);
      }
    } catch (err) {
      console.error('API Error recording supplier bill:', err);
    }
  };

  // ----------------------------------------------------
  // EXPENSE ACTIONS
  // ----------------------------------------------------
  const addExpense = async (expData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...expData,
          recordedBy: currentUser ? currentUser.name : 'Admin',
        }),
      });
      if (res.ok) {
        const body = await res.json();
        setExpenses((prev) => [body.data, ...prev]);
        showToast(`Expense of ${storeSettings.currency} ${body.data.amount.toLocaleString()} added under ${body.data.category}`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error adding expense:', err);
    }
  };

  const deleteExpense = async (id) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Admins can delete expense logs!', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        showToast('Expense record deleted from Database', 'warning');
      }
    } catch (err) {
      console.error('API Error deleting expense:', err);
    }
  };

  // ----------------------------------------------------
  // RESET DATABASE
  // ----------------------------------------------------
  const resetDatabase = async () => {
    if (!isAdmin) {
      showToast('Permission Denied: Admin required to reset data!', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast('Database reset to empty state', 'info');
      }
    } catch (err) {
      console.error('API Error resetting database:', err);
    }
  };

  const updateStoreSettings = (newSet) => {
    setStoreSettings((prev) => ({ ...prev, ...newSet }));
    showToast('Store settings updated!');
  };

  return (
    <AppContext.Provider
      value={{
        storeSettings,
        updateStoreSettings,
        theme,
        setTheme,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        isAdmin,
        users,
        setUsers,
        updateProfile,
        changePassword,
        addUser,
        updateUser,
        deleteUser,
        isBackendConnected,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        suppliers,
        addSupplier,
        recordSupplierPayment,
        recordSupplierBill,
        fetchSupplierLedger,
        sales,
        createSale,
        updateSale,
        deleteSale,
        refundSale,
        sendInvoiceWhatsApp,
        purchases,
        createPurchase,
        updatePurchase,
        deletePurchase,
        processPurchaseReturn,
        expenses,
        addExpense,
        deleteExpense,
        payments,
        stockHistory,
        toast,
        showToast,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FileText,
  Printer,
  Calendar,
  PieChart,
  ShoppingBag,
  Receipt,
  Users,
  Truck,
  Smartphone,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

export const Reports = () => {
  const {
    storeSettings,
    sales = [],
    purchases = [],
    expenses = [],
    products = [],
    customers = [],
    suppliers = [],
    isAdmin,
  } = useApp();

  // Active Report Tab: 'pnl' | 'monthly' | 'sales' | 'expenses' | 'stock' | 'dues'
  const [activeReportTab, setActiveReportTab] = useState('pnl');

  // Timeframe filter for P&L: 'this_month' | 'last_month' | 'today' | 'this_year' | 'all'
  const [pnlTimeframe, setPnlTimeframe] = useState('this_month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Date constants
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const thisMonthKey = now.toISOString().substring(0, 7); // "YYYY-MM"
  
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = lastMonthDate.toISOString().substring(0, 7);
  const currentYearStr = now.getFullYear().toString();

  // Defensive array fallbacks
  const safeSales = Array.isArray(sales) ? sales : [];
  const safePurchases = Array.isArray(purchases) ? purchases : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  // Helper safe number getters
  const getSaleTotal = (s) => (s?.grandTotal ?? s?.netTotal ?? s?.totalAmount ?? 0);
  const getSaleCOGS = (s) => {
    const items = Array.isArray(s.items) ? s.items : [];
    return items.reduce(
      (itemSum, item) =>
        itemSum + (parseFloat(item.purchaseCost) || 0) * (parseInt(item.quantity, 10) || 1),
      0
    );
  };

  // ----------------------------------------------------
  // 1. FILTERED PROFIT & LOSS CALCULATIONS
  // ----------------------------------------------------
  const filterByTimeframe = (items, dateField = 'date') => {
    return items.filter((item) => {
      const itemDate = item[dateField] || '';
      if (!itemDate) return false;

      if (pnlTimeframe === 'today') return itemDate === todayStr;
      if (pnlTimeframe === 'this_month') return itemDate.startsWith(thisMonthKey);
      if (pnlTimeframe === 'last_month') return itemDate.startsWith(lastMonthKey);
      if (pnlTimeframe === 'this_year') return itemDate.startsWith(currentYearStr);
      return true; // 'all'
    });
  };

  // Filter active (non-refunded) sales vs refunded sales
  const activeSales = safeSales.filter((s) => s.status !== 'Refunded');
  const refundedSales = safeSales.filter((s) => s.status === 'Refunded');

  const filteredSales = filterByTimeframe(activeSales, 'date');
  const filteredRefunds = filterByTimeframe(refundedSales, 'date');
  const pnlRefundsDeducted = filteredRefunds.reduce((sum, s) => sum + getSaleTotal(s), 0);

  const filteredPurchases = filterByTimeframe(safePurchases, 'date');
  const filteredExpenses = filterByTimeframe(safeExpenses, 'date');

  const pnlRevenue = filteredSales.reduce((sum, s) => sum + getSaleTotal(s), 0);
  const pnlCOGS = filteredSales.reduce((sum, s) => sum + getSaleCOGS(s), 0);
  const pnlGrossProfit = pnlRevenue - pnlCOGS;
  const pnlExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const pnlNetProfit = pnlGrossProfit - pnlExpenses;
  const pnlGrossMarginPercent = pnlRevenue > 0 ? ((pnlGrossProfit / pnlRevenue) * 100).toFixed(1) : '0';
  const pnlNetMarginPercent = pnlRevenue > 0 ? ((pnlNetProfit / pnlRevenue) * 100).toFixed(1) : '0';

  // ----------------------------------------------------
  // 2. MONTHLY SALES & PROFIT/LOSS BREAKDOWN (12 MONTHS)
  // ----------------------------------------------------
  const monthsList = [
    { num: '01', name: 'January' },
    { num: '02', name: 'February' },
    { num: '03', name: 'March' },
    { num: '04', name: 'April' },
    { num: '05', name: 'May' },
    { num: '06', name: 'June' },
    { num: '07', name: 'July' },
    { num: '08', name: 'August' },
    { num: '09', name: 'September' },
    { num: '10', name: 'October' },
    { num: '11', name: 'November' },
    { num: '12', name: 'December' },
  ];

  const monthlyReportData = monthsList.map((m) => {
    const monthPrefix = `${selectedYear}-${m.num}`;
    const mSales = activeSales.filter((s) => (s.date || '').startsWith(monthPrefix));
    const mPurchases = safePurchases.filter((p) => (p.date || '').startsWith(monthPrefix));
    const mExpenses = safeExpenses.filter((e) => (e.date || '').startsWith(monthPrefix));
    const mRefunds = refundedSales.filter((s) => (s.date || '').startsWith(monthPrefix));

    const salesTotal = mSales.reduce((sum, s) => sum + getSaleTotal(s), 0);
    const cogsTotal = mSales.reduce((sum, s) => sum + getSaleCOGS(s), 0);
    const purchasesTotal = mPurchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
    const expensesTotal = mExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const refundsTotal = mRefunds.reduce((sum, s) => sum + getSaleTotal(s), 0);

    const grossProfit = salesTotal - cogsTotal;
    const netProfit = grossProfit - expensesTotal;
    const margin = salesTotal > 0 ? ((netProfit / salesTotal) * 100).toFixed(1) : '0';

    return {
      monthKey: monthPrefix,
      monthName: `${m.name} ${selectedYear}`,
      shortName: m.name.substring(0, 3),
      salesCount: mSales.length,
      salesTotal,
      cogsTotal,
      purchasesTotal,
      expensesTotal,
      refundsTotal,
      grossProfit,
      netProfit,
      margin,
    };
  });

  const yearTotalSales = monthlyReportData.reduce((sum, m) => sum + m.salesTotal, 0);
  const yearTotalCOGS = monthlyReportData.reduce((sum, m) => sum + m.cogsTotal, 0);
  const yearTotalExpenses = monthlyReportData.reduce((sum, m) => sum + m.expensesTotal, 0);
  const yearTotalGrossProfit = yearTotalSales - yearTotalCOGS;
  const yearTotalNetProfit = yearTotalGrossProfit - yearTotalExpenses;
  const yearTotalMargin = yearTotalSales > 0 ? ((yearTotalNetProfit / yearTotalSales) * 100).toFixed(1) : '0';
  const maxMonthlyVal = Math.max(...monthlyReportData.map((m) => Math.max(m.salesTotal, m.expensesTotal)), 50000);

  // ----------------------------------------------------
  // 3. OVERALL METRICS
  // ----------------------------------------------------
  const totalStockValue = safeProducts.reduce(
    (sum, p) => sum + (parseInt(p.stock, 10) || 0) * (parseFloat(p.purchasePrice) || 0),
    0
  );
  const totalCustomerDues = safeCustomers.reduce(
    (sum, c) => sum + (parseFloat(c.remainingCredit || c.amountDue) || 0),
    0
  );
  const totalSupplierPayables = safeSuppliers.reduce(
    (sum, s) => sum + (parseFloat(s.amountPayable || s.closingPayable) || 0),
    0
  );

  // Category-wise Expense calculation
  const expenseCategories = ['Rent', 'Electricity', 'Salaries', 'Internet', 'Transport', 'Maintenance', 'Other'];
  const expenseBreakdown = expenseCategories.map((cat) => {
    const amount = safeExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return { category: cat, amount };
  });

  // Payment Method Breakdown (Active Sales only)
  const cashSales = activeSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + getSaleTotal(s), 0);
  const onlineSales = activeSales
    .filter((s) => s.paymentMethod === 'Online')
    .reduce((sum, s) => sum + getSaleTotal(s), 0);

  // Brand-wise Sales breakdown (Active Sales only)
  const brandSalesMap = {};
  activeSales.forEach((s) => {
    const items = Array.isArray(s.items) ? s.items : [];
    items.forEach((it) => {
      const b = it.brand || 'Mobile Device';
      brandSalesMap[b] = (brandSalesMap[b] || 0) + (parseFloat(it.total) || parseFloat(it.price) || 0);
    });
  });

  return (
    <div>
      {/* Printable Store Header (Only visible on printout) */}
      <div
        className="print-only-statement-header"
        style={{
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #0f172a',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {storeSettings.storeName}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>Proprietor: {storeSettings.ownerName}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{storeSettings.address}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>Phone: {storeSettings.phone} • Email: {storeSettings.email}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7' }}>
            FINANCIAL REPORT STATEMENT
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
            Printed Date: {todayStr}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Software Developed by: Imad Khan (00923480779919)
          </div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Reports & Financial Intelligence</h1>
          <p className="page-subtitle">Monthly sales analysis, real-time Profit & Loss statements, and expense breakdown</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-secondary">
          <Printer size={16} />
          <span>Print Financial Statement</span>
        </button>
      </div>

      {/* Report Tabs Selector */}
      <div
        className="glass-card no-print"
        style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'pnl', label: 'Profit & Loss Statement', icon: TrendingUp },
          { id: 'monthly', label: 'Monthly Sales & Performance', icon: Calendar },
          { id: 'sales', label: 'Sales & Brands Analysis', icon: BarChart3 },
          { id: 'expenses', label: 'Expense Breakdown', icon: Receipt },
          { id: 'stock', label: 'Stock Valuation', icon: Smartphone },
          { id: 'dues', label: 'Customer & Supplier Dues', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`btn btn-sm ${activeReportTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.55rem 1rem' }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: PROFIT & LOSS STATEMENT (P&L) */}
      {/* ==================================================== */}
      {activeReportTab === 'pnl' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Timeframe Filter Bar */}
          <div
            className="glass-card no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '0.9rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Statement Period:</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'this_year', label: `This Year (${currentYearStr})` },
                { id: 'all', label: 'All Time (Overall)' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setPnlTimeframe(tf.id)}
                  className={`btn btn-sm ${pnlTimeframe === tf.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prominent Profit / Loss Status Card */}
          <div
            className="glass-card"
            style={{
              background: pnlNetProfit >= 0
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))'
                : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(225, 29, 72, 0.05))',
              border: `1px solid ${pnlNetProfit >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: pnlNetProfit >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: pnlNetProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185',
                }}
              >
                {pnlNetProfit >= 0 ? <TrendingUp size={28} /> : <AlertOctagon size={28} />}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Statement Result ({pnlTimeframe.replace('_', ' ').toUpperCase()})
                </div>
                <div
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color: pnlNetProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185',
                    marginTop: '0.2rem',
                  }}
                >
                  {pnlNetProfit >= 0 ? 'NET STORE PROFIT' : 'NET STORE LOSS'}: {storeSettings.currency} {pnlNetProfit.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Margin</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{pnlGrossMarginPercent}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Margin</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: pnlNetProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185' }}>
                  {pnlNetMarginPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue (Sales)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                {storeSettings.currency} {pnlRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {filteredSales.length} invoice(s) generated
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cost of Goods (COGS)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                - {storeSettings.currency} {pnlCOGS.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Wholesale purchase cost
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Gross Profit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                {storeSettings.currency} {pnlGrossProfit.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Revenue minus Device Costs
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Store Expenses</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
                - {storeSettings.currency} {pnlExpenses.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {filteredExpenses.length} expense log(s)
              </div>
            </div>

            {filteredRefunds.length > 0 && (
              <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700 }}>Refunds Deducted</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                  - {storeSettings.currency} {pnlRefundsDeducted.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {filteredRefunds.length} invoice(s) refunded & restocked
                </div>
              </div>
            )}
          </div>

          {/* Detailed Line-by-Line Income Statement Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Income Statement Financial Breakdown ({pnlTimeframe.replace('_', ' ').toUpperCase()})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>1. Gross Revenue from Mobile Sales (Active)</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{storeSettings.currency} {pnlRevenue.toLocaleString()}</strong>
              </div>
              {filteredRefunds.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)', color: '#f59e0b' }}>
                  <span>• Deducted: Customer Returns/Refunds ({filteredRefunds.length} invoice(s) restored to stock)</span>
                  <strong>- {storeSettings.currency} {pnlRefundsDeducted.toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>2. Less: Cost of Goods Sold (Wholesale Purchase Cost of sold units)</span>
                <strong style={{ color: 'var(--text-muted)' }}>- {storeSettings.currency} {pnlCOGS.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, background: 'rgba(56, 189, 248, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                <span>3. GROSS PROFIT MARGIN ({pnlGrossMarginPercent}%)</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>{storeSettings.currency} {pnlGrossProfit.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>4. Less: Operating Expenses (Rent, Salaries, Electricity, Internet, Maintenance)</span>
                <strong style={{ color: '#fbbf24' }}>- {storeSettings.currency} {pnlExpenses.toLocaleString()}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  background: pnlNetProfit >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: `1px solid ${pnlNetProfit >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                }}
              >
                <span>5. NET STORE PROFIT / (LOSS)</span>
                <span style={{ color: pnlNetProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185' }}>
                  {storeSettings.currency} {pnlNetProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: MONTHLY SALES & FINANCIAL PERFORMANCE */}
      {/* ==================================================== */}
      {activeReportTab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Year Selector & Overview */}
          <div
            className="glass-card no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monthly Sales & Financial Performance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Detailed month-by-month sales, costs, expenses, and net profit report
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Year:</span>
              <select
                className="form-select filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="2026">Year 2026</option>
                <option value="2025">Year 2025</option>
                <option value="2024">Year 2024</option>
              </select>
            </div>
          </div>

          {/* Annual KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Annual Sales Revenue ({selectedYear})</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                {storeSettings.currency} {yearTotalSales.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Annual Gross Profit</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                {storeSettings.currency} {yearTotalGrossProfit.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Annual Expenses</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
                {storeSettings.currency} {yearTotalExpenses.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: `4px solid ${yearTotalNetProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185'}` }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Annual Net Profit / (Loss)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: yearTotalNetProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185', marginTop: '0.25rem' }}>
                {storeSettings.currency} {yearTotalNetProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Monthly Comparison Bar Chart */}
          <div className="glass-card no-print">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              12-Month Sales vs Expenses Comparison ({selectedYear})
            </h3>

            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '0.85rem', padding: '1rem 0' }}>
              {monthlyReportData.map((m, idx) => {
                const salesPercent = Math.max(4, Math.min(100, (m.salesTotal / maxMonthlyVal) * 100));
                const expPercent = Math.max(4, Math.min(100, (m.expensesTotal / maxMonthlyVal) * 100));

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', height: '80%', justifyContent: 'center' }}>
                      <div
                        title={`${m.monthName} Sales: ${storeSettings.currency} ${m.salesTotal.toLocaleString()}`}
                        style={{
                          width: '45%',
                          height: `${salesPercent}%`,
                          background: 'linear-gradient(180deg, var(--accent-cyan), rgba(56, 189, 248, 0.2))',
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                      <div
                        title={`${m.monthName} Expenses: ${storeSettings.currency} ${m.expensesTotal.toLocaleString()}`}
                        style={{
                          width: '45%',
                          height: `${expPercent}%`,
                          background: 'linear-gradient(180deg, var(--accent-amber), rgba(245, 158, 11, 0.2))',
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {m.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 12-Month Detailed Breakdown Table */}
          <div className="glass-card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Monthly Financial Performance Statement ({selectedYear})</h3>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Invoices</th>
                    <th>Monthly Sales</th>
                    <th>Device Costs (COGS)</th>
                    <th>Expenses</th>
                    <th>Gross Profit</th>
                    <th>Net Profit / (Loss)</th>
                    <th>Net Margin</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReportData.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{m.monthName}</td>
                      <td>{m.salesCount} sale(s)</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {storeSettings.currency} {m.salesTotal.toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {storeSettings.currency} {m.cogsTotal.toLocaleString()}
                      </td>
                      <td style={{ color: '#fbbf24' }}>
                        {storeSettings.currency} {m.expensesTotal.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                        {storeSettings.currency} {m.grossProfit.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 800, color: m.netProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185' }}>
                        {storeSettings.currency} {m.netProfit.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.margin}%</td>
                      <td>
                        {m.salesTotal === 0 && m.expensesTotal === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Activity</span>
                        ) : m.netProfit >= 0 ? (
                          <Badge variant="emerald">Profit</Badge>
                        ) : (
                          <Badge variant="rose">Loss</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: SALES & BRAND ANALYSIS */}
      {/* ==================================================== */}
      {activeReportTab === 'sales' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
          {/* Brand Sales Distribution */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Sales Revenue by Brand</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(brandSalesMap).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No sales data recorded yet.</div>
              ) : (
                Object.entries(brandSalesMap).map(([brand, val], idx) => {
                  const totalRev = activeSales.reduce((sum, s) => sum + getSaleTotal(s), 0);
                  const percent = Math.round((val / (totalRev || 1)) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{brand}</span>
                        <span>
                          {storeSettings.currency} {val.toLocaleString()} ({percent}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Payment Method Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cash Sales Collected</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                  {storeSettings.currency} {cashSales.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Online / Card Transfers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-violet)', marginTop: '0.2rem' }}>
                  {storeSettings.currency} {onlineSales.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: EXPENSE BREAKDOWN */}
      {/* ==================================================== */}
      {activeReportTab === 'expenses' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Expense Category Distribution</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Logged Entries Count</th>
                  <th>Total Spent</th>
                  <th>Share of Expenses</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((eb, idx) => {
                  const totalExp = safeExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
                  const percent = Math.round((eb.amount / (totalExp || 1)) * 100);
                  const count = safeExpenses.filter((e) => e.category === eb.category).length;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{eb.category}</td>
                      <td>{count} entry(ies)</td>
                      <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                        {storeSettings.currency} {eb.amount.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-amber)', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', width: '40px' }}>{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: STOCK VALUATION */}
      {/* ==================================================== */}
      {activeReportTab === 'stock' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inventory Valuation Report</h3>
            <Badge variant="cyan">Total Stock Value: {storeSettings.currency} {totalStockValue.toLocaleString()}</Badge>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Model</th>
                  <th>Category</th>
                  <th>PTA Status</th>
                  <th>In Stock Qty</th>
                  <th>Unit Cost</th>
                  <th>Total Inventory Asset Value</th>
                </tr>
              </thead>
              <tbody>
                {safeProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No inventory items recorded yet.
                    </td>
                  </tr>
                ) : (
                  safeProducts.map((p) => {
                    const assetValue = (parseInt(p.stock, 10) || 0) * (parseFloat(p.purchasePrice) || 0);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.brand} {p.model}</td>
                        <td><Badge variant={p.category || 'New Phone'}>{p.category || 'New Phone'}</Badge></td>
                        <td><Badge variant={p.ptaStatus}>{p.ptaStatus}</Badge></td>
                        <td style={{ fontWeight: 700 }}>{p.stock}</td>
                        <td>{storeSettings.currency} {(p.purchasePrice || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {storeSettings.currency} {assetValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: DUES & PAYABLES */}
      {/* ==================================================== */}
      {activeReportTab === 'dues' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Customer Dues */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fb7185', marginBottom: '1.25rem' }}>
              Customer Outstanding Receivables ({storeSettings.currency} {totalCustomerDues.toLocaleString()})
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Remaining Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {safeCustomers.filter((c) => (c.remainingCredit || c.amountDue || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No customer dues.
                      </td>
                    </tr>
                  ) : (
                    safeCustomers
                      .filter((c) => (c.remainingCredit || c.amountDue || 0) > 0)
                      .map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{c.phone}</td>
                          <td style={{ fontWeight: 700, color: '#fb7185' }}>
                            {storeSettings.currency} {(c.remainingCredit || c.amountDue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Payables */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '1.25rem' }}>
              Supplier Account Payables ({storeSettings.currency} {totalSupplierPayables.toLocaleString()})
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Supplier Name</th>
                    <th>Phone</th>
                    <th>Amount Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {safeSuppliers.filter((s) => (s.amountPayable || s.closingPayable || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No supplier payables.
                      </td>
                    </tr>
                  ) : (
                    safeSuppliers
                      .filter((s) => (s.amountPayable || s.closingPayable || 0) > 0)
                      .map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.phone}</td>
                          <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                            {storeSettings.currency} {(s.amountPayable || s.closingPayable || 0).toLocaleString()} Cr
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

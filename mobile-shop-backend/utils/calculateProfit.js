export const calculateFinancialSummary = (sales = [], expenses = [], products = []) => {
  const totalRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);

  const totalCOGS = sales.reduce((sum, s) => {
    return (
      sum +
      (s.items || []).reduce((itemSum, item) => itemSum + (parseFloat(item.purchaseCost) || 0) * item.quantity, 0)
    );
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const totalStockValuation = products.reduce((sum, p) => sum + (parseInt(p.stock, 10) || 0) * (parseFloat(p.purchasePrice) || 0), 0);

  return {
    totalRevenue,
    totalCOGS,
    grossProfit,
    totalExpenses,
    netProfit,
    totalStockValuation,
  };
};

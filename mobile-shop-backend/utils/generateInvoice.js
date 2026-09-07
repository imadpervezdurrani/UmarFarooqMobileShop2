export const generateInvoiceNumber = (existingCount = 0, prefix = 'INV-') => {
  const nextNumber = 1001 + existingCount;
  return `${prefix}${nextNumber}`;
};

export const formatInvoicePayload = (sale) => {
  return {
    invoiceNo: sale.invoiceNo,
    date: sale.date,
    time: sale.time,
    customer: {
      name: sale.customerName,
      phone: sale.customerPhone,
    },
    items: sale.items,
    totals: {
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      grandTotal: sale.grandTotal,
      paidAmount: sale.paidAmount,
      remainingBalance: sale.remainingBalance,
    },
    paymentMethod: sale.paymentMethod,
    salesPerson: sale.salesPerson,
    status: sale.status,
  };
};

/**
 * Universal comparator to sort data collections with the newest items first (descending order).
 * Works across Products, Sales/Invoices, Purchases, Customers, Suppliers, Expenses, etc.
 */
export const sortByNewest = (a, b) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // 1. Check numeric timestamp embedded in ID (e.g. prod-17265..., sale-17265...)
  const getTimestampFromId = (id) => {
    if (!id || typeof id !== 'string') return 0;
    const match = id.match(/\d{10,}/); // 10+ digits timestamp from Date.now()
    return match ? parseInt(match[0], 10) : 0;
  };
  const tsA = getTimestampFromId(a.id);
  const tsB = getTimestampFromId(b.id);
  if (tsA && tsB && tsA !== tsB) {
    return tsB - tsA;
  }

  // 2. Check invoiceNo or purchaseNo numerical sequences (e.g., INV-1005 > INV-1001)
  const getDocSequence = (item) => {
    const docNo = item.invoiceNo || item.purchaseNo;
    if (!docNo || typeof docNo !== 'string') return 0;
    const matches = docNo.match(/\d+/g);
    return matches ? parseInt(matches[matches.length - 1], 10) : 0;
  };
  const seqA = getDocSequence(a);
  const seqB = getDocSequence(b);
  if (seqA && seqB && seqA !== seqB) {
    return seqB - seqA;
  }

  // 3. Compare Date & Time strings
  const dateA = a.date || a.createdAt;
  const dateB = b.date || b.createdAt;
  if (dateA && dateB) {
    const timeA = a.time ? ` ${a.time}` : '';
    const timeB = b.time ? ` ${b.time}` : '';
    const dtA = new Date(`${dateA}${timeA}`).getTime();
    const dtB = new Date(`${dateB}${timeB}`).getTime();
    if (!isNaN(dtA) && !isNaN(dtB) && dtA !== dtB) {
      return dtB - dtA;
    }
    if (dateA !== dateB) {
      return String(dateB).localeCompare(String(dateA));
    }
  }

  // 4. Timestamp in only one item
  if (tsA && !tsB) return -1;
  if (!tsA && tsB) return 1;

  // 5. Fallback string comparison in reverse
  return String(b.id || '').localeCompare(String(a.id || ''));
};

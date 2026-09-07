import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Smartphone, ShieldCheck, Send, FileDown } from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import html2pdf from 'html2pdf.js';

export const PrintableInvoice = ({ sale, onClose }) => {
  const { storeSettings, sendInvoiceWhatsApp, showToast } = useApp();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const barcodeRef = useRef(null);
  const invoiceRef = useRef(null);

  const items = sale?.items || [];
  const subtotal = sale?.subtotal || 0;
  const grandTotal = sale?.grandTotal || 0;
  const paidAmount = sale?.paidAmount || 0;
  const remainingBalance = sale?.remainingBalance || 0;
  const discount = sale?.discount || 0;
  const tax = sale?.tax || 0;

  useEffect(() => {
    if (!sale) return;

    // 1. Generate QR Code with Shop Name, Owner, Address, Contact Number, Invoice, Total
    const qrData = [
      `🏢 Shop: ${storeSettings.storeName || 'Umar Farooq Mobile Zone'}`,
      `👤 Proprietor: ${storeSettings.ownerName || 'Umar Farooq'}`,
      `📍 Address: ${storeSettings.address || 'Al-Firdous Plaza, Shop No.01 Ground Floor, Nowshera Cantt'}`,
      `📞 Contact / WhatsApp: ${storeSettings.phone || '0345-7725525'}`,
      `✉️ Email: ${storeSettings.email || 'Umarfarooq201520@gmail.com'}`,
      `🧾 Invoice No: ${sale.invoiceNo || ''}`,
      `📅 Date: ${sale.date || ''}`,
      `💰 Grand Total: ${storeSettings.currency || 'Rs.'} ${(grandTotal || 0).toLocaleString()}`,
    ].join('\n');

    QRCode.toDataURL(qrData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));

    // 2. Generate Barcode with Invoice Number
    if (barcodeRef.current && sale.invoiceNo) {
      try {
        JsBarcode(barcodeRef.current, sale.invoiceNo, {
          format: 'CODE128',
          width: 1.6,
          height: 38,
          displayValue: true,
          fontSize: 12,
          font: 'monospace',
          lineColor: '#0f172a',
          background: '#ffffff',
          margin: 0,
        });
      } catch (err) {
        console.error('Error generating barcode:', err);
      }
    }
  }, [sale, storeSettings, grandTotal]);

  if (!sale) return null;

  const handleSendWhatsAppPDF = async () => {
    if (!sale.customerPhone) {
      showToast('Customer phone number is missing on this invoice!', 'error');
      return;
    }

    // Call Backend UltraMsg API to send PDF document via WhatsApp
    await sendInvoiceWhatsApp(sale.invoiceNo, sale.customerPhone);

    // Format WhatsApp direct Web link with PDF Document URL fallback
    let cleanPhone = sale.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('92')) cleanPhone = '92' + cleanPhone;

    const pdfLink = `http://localhost:3000/api/invoices/${sale.invoiceNo}/pdf`;
    const waText = encodeURIComponent(
      `🧾 *INVOICE DOCUMENT: ${sale.invoiceNo}*\n🏢 *${storeSettings.storeName}*\n\nDear *${sale.customerName || 'Customer'}*,\nPlease download your official PDF Invoice here:\n${pdfLink}\n\n💰 *Total Paid:* Rs. ${grandTotal.toLocaleString()}\n\nThank you for your business!`
    );

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    showToast('Generating official 1:1 PDF invoice...', 'info');

    try {
      const element = invoiceRef.current;
      const opt = {
        margin: [6, 8, 6, 8],
        filename: `Invoice-${sale.invoiceNo || 'INV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      };

      await html2pdf().set(opt).from(element).save();
      showToast(`Invoice ${sale.invoiceNo} PDF downloaded successfully!`, 'success');
    } catch (err) {
      console.error('Error generating client PDF, falling back to backend:', err);
      window.open(`http://localhost:3000/api/invoices/${sale.invoiceNo}/pdf`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (sale.customerPhone) {
      sendInvoiceWhatsApp(sale.invoiceNo, sale.customerPhone);
    }
    document.body.classList.add('printing-invoice');
    const cleanup = () => {
      document.body.classList.remove('printing-invoice');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2500);
  };

  return (
    <div className="printable-area-wrapper">
      {/* Action Buttons Top Bar (Hidden when printed) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--accent-emerald)" />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>
            Invoice #{sale.invoiceNo || 'INV-0000'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary"
            disabled={isDownloading}
            title="Download PDF with exact same visual design"
          >
            <FileDown size={16} />
            <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
          <button onClick={handleSendWhatsAppPDF} className="btn btn-emerald">
            <Send size={16} />
            <span>Send PDF on WhatsApp</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary" title="Print invoice with exact colors & layout">
            <Printer size={16} />
            <span>Print & Dispatch PDF</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Actual Printable Invoice Container */}
      <div
        ref={invoiceRef}
        className="invoice-receipt"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '2.5rem',
          borderRadius: '16px',
          fontFamily: 'Inter, system-ui, sans-serif',
          maxWidth: '750px',
          margin: '0 auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="invoice-header-section"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Smartphone size={26} color="#0284c7" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                {storeSettings.storeName}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.2rem' }}>
              Proprietor: {storeSettings.ownerName || 'Umar Farooq'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {storeSettings.address}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginTop: '0.2rem' }}>
              📞 Contact / WhatsApp: <span style={{ color: '#0284c7', fontFamily: 'monospace' }}>{storeSettings.phone}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              ✉️ Email: <span style={{ color: '#0284c7' }}>{storeSettings.email}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0284c7',
                letterSpacing: '-0.02em',
              }}
            >
              INVOICE
            </div>
            {/* Barcode for Invoice Number */}
            <div style={{ margin: '0.35rem 0', background: '#ffffff', padding: '2px 4px', borderRadius: '4px' }}>
              <svg ref={barcodeRef} style={{ maxWidth: '190px', height: 'auto' }} />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
              Date: <strong>{sale.date || 'N/A'}</strong> ({sale.time || ''})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Payment Method: <strong>{sale.paymentMethod || 'Cash'}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Salesperson Info */}
        <div
          className="invoice-customer-section"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            background: '#f8fafc',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              Billed To (Customer)
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginTop: '0.2rem' }}>
              {sale.customerName || 'Walk-in Customer'}
            </div>
            <div style={{ color: '#475569' }}>Phone: {sale.customerPhone || 'N/A'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              Sales Executive
            </div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
              {sale.salesPerson || 'Staff'}
            </div>
            <div style={{ color: '#475569' }}>
              Status: <span style={{ fontWeight: 700, color: sale.status === 'Paid' ? '#16a34a' : '#d97706' }}>{sale.status || 'Paid'}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table
          className="invoice-table-section"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr style={{ background: '#0f172a', color: '#ffffff' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>#</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Product / Specification</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>IMEI Number</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                  No item details recorded on this invoice.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#64748b' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.brand || ''} {item.model || item.productName || 'Mobile Product'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {item.category && (
                        <span
                          style={{
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: item.category === 'New Phone' ? '#ecfdf5' : '#fef3c7',
                            color: item.category === 'New Phone' ? '#047857' : '#b45309',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        >
                          {item.category}
                        </span>
                      )}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#0284c7',
                      fontSize: '0.85rem',
                    }}
                  >
                    {item.imei || 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {storeSettings.currency} {(item.price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity || 1}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                    {storeSettings.currency} {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals & Financial Breakdown */}
        <div
          className="invoice-totals-section"
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Warranty & Return Policy:
            </div>
            <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.5', margin: 0 }}>
              <li>Official PTA approved warranty claims require original invoice.</li>
              <li>Software warranty 1 Year; Hardware warranty per brand guidelines.</li>
              <li>No refund or replacement without box, seal, and IMEI match.</li>
            </ul>

            {/* Official Shop QR Code Box */}
            <div
              className="invoice-qr-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1.5px dashed #cbd5e1',
              }}
            >
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Shop QR Code"
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '2px',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{ width: '92px', height: '92px', background: '#e2e8f0', borderRadius: '6px', flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.85rem', marginBottom: '3px' }}>
                  📱 Official Shop QR Code
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{storeSettings.storeName}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                  📍 {storeSettings.address}
                </div>
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', marginTop: '3px' }}>
                  📞 {storeSettings.phone}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '3px', fontWeight: 500 }}>
                  Scan with any phone camera for shop & contact details
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#475569' }}>
              <span>Subtotal:</span>
              <span>{storeSettings.currency} {(subtotal || 0).toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>- {storeSettings.currency} {(discount || 0).toLocaleString()}</span>
              </div>
            )}

            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#475569' }}>
                <span>Tax:</span>
                <span>+ {storeSettings.currency} {(tax || 0).toLocaleString()}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderTop: '2px dashed #cbd5e1',
                borderBottom: '2px dashed #cbd5e1',
                margin: '0.5rem 0',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#0f172a',
              }}
            >
              <span>Grand Total:</span>
              <span style={{ color: '#0284c7' }}>
                {storeSettings.currency} {(grandTotal || 0).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#16a34a', fontWeight: 600 }}>
              <span>Paid Amount:</span>
              <span>{storeSettings.currency} {(paidAmount || 0).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: remainingBalance > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
              <span>Balance Dues:</span>
              <span>{storeSettings.currency} {(remainingBalance || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div
          className="invoice-footer-section"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.25rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Thank you for shopping at {storeSettings.storeName}!</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              For support & warranty inquiries: <strong>{storeSettings.phone}</strong> | <strong>{storeSettings.email}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1.5px solid #94a3b8', width: '200px', paddingTop: '0.35rem', color: '#0f172a' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{storeSettings.ownerName || 'Umar Farooq'}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proprietor / Authorized</div>
          </div>
        </div>

        {/* Developer Credit Strip */}
        <div
          className="invoice-developer-section"
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.6rem',
            borderTop: '1px dashed #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: '#94a3b8',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            💻 <strong style={{ color: '#475569' }}>Software Developed by:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>Imad Khan</span>
          </div>
          <div>
            📞 Contact: <strong style={{ color: '#0284c7' }}>+92 348 0779919</strong> &nbsp;|&nbsp; ✉️ <strong style={{ color: '#0284c7' }}>imad31910@gmail.com</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

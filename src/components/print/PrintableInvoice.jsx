import React, { useState, useEffect, useRef } from 'react';
import { useApp, API_BASE_URL } from '../../context/AppContext';
import { Printer, Smartphone, ShieldCheck, Send, FileDown, Receipt } from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import html2pdf from 'html2pdf.js';

export const PrintableInvoice = ({ sale, onClose }) => {
  const { storeSettings, sendInvoiceWhatsApp, showToast } = useApp();
  const [printMode, setPrintMode] = useState('a4'); // 'a4' | 'thermal'
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
      width: printMode === 'thermal' ? 100 : 150,
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
          width: printMode === 'thermal' ? 1.4 : 1.6,
          height: printMode === 'thermal' ? 32 : 38,
          displayValue: true,
          fontSize: printMode === 'thermal' ? 10 : 12,
          font: 'monospace',
          lineColor: '#000000',
          background: '#ffffff',
          margin: 0,
        });
      } catch (err) {
        console.error('Error generating barcode:', err);
      }
    }
  }, [sale, storeSettings, grandTotal, printMode]);

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

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pdfLink = `${origin}${API_BASE_URL}/invoices/${sale.invoiceNo}/pdf`;
    const waText = encodeURIComponent(
      `🧾 *INVOICE DOCUMENT: ${sale.invoiceNo}*\n🏢 *${storeSettings.storeName}*\n\nDear *${sale.customerName || 'Customer'}*,\nPlease download your official PDF Invoice here:\n${pdfLink}\n\n💰 *Total Paid:* Rs. ${grandTotal.toLocaleString()}\n\nThank you for your business!`
    );

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    const isThermal = printMode === 'thermal';
    showToast(isThermal ? 'Generating 80mm POS Thermal Receipt PDF...' : 'Generating official 1:1 A4 PDF invoice...', 'info');

    try {
      const element = invoiceRef.current;
      const opt = {
        margin: isThermal ? [2, 2, 4, 2] : [6, 8, 6, 8],
        filename: `Invoice-${sale.invoiceNo || 'INV'}-${isThermal ? 'Thermal-80mm' : 'A4'}.pdf`,
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
          format: isThermal ? [80, 260] : 'a4',
          orientation: 'portrait',
        },
      };

      await html2pdf().set(opt).from(element).save();
      showToast(`Invoice ${sale.invoiceNo} PDF downloaded successfully!`, 'success');
    } catch (err) {
      console.error('Error generating client PDF, falling back to backend:', err);
      window.open(`${API_BASE_URL}/invoices/${sale.invoiceNo}/pdf`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = (mode = printMode) => {
    if (sale.customerPhone) {
      sendInvoiceWhatsApp(sale.invoiceNo, sale.customerPhone);
    }
    setPrintMode(mode);

    setTimeout(() => {
      if (mode === 'thermal') {
        document.body.classList.add('printing-invoice', 'printing-thermal');
      } else {
        document.body.classList.add('printing-invoice');
      }

      const cleanup = () => {
        document.body.classList.remove('printing-invoice', 'printing-thermal');
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      window.print();
      setTimeout(cleanup, 2500);
    }, 60);
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
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              #{sale.invoiceNo || 'INV-0000'}
            </span>
          </div>

          {/* Mode Switcher Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setPrintMode('a4')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: printMode === 'a4' ? 'var(--accent-cyan)' : 'transparent',
                color: printMode === 'a4' ? '#041221' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition-fast)',
              }}
            >
              <Printer size={14} />
              <span>A4 Full Page</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('thermal')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: printMode === 'thermal' ? '#f59e0b' : 'transparent',
                color: printMode === 'thermal' ? '#000000' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition-fast)',
              }}
            >
              <Receipt size={14} />
              <span>80mm Thermal (POS)</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary btn-sm"
            disabled={isDownloading}
            title="Download PDF in selected format"
          >
            <FileDown size={15} />
            <span>{isDownloading ? 'Generating...' : 'PDF'}</span>
          </button>
          <button onClick={handleSendWhatsAppPDF} className="btn btn-emerald btn-sm">
            <Send size={15} />
            <span>WhatsApp</span>
          </button>

          {/* Quick Print Buttons */}
          <button
            onClick={() => handlePrint('thermal')}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
            }}
            title="Print slip on 80mm POS Thermal Receipt Printer"
          >
            <Receipt size={15} />
            <span>Print Thermal (80mm)</span>
          </button>

          <button
            onClick={() => handlePrint('a4')}
            className="btn btn-primary btn-sm"
            title="Print on standard A4 Laser / Office Printer"
          >
            <Printer size={15} />
            <span>Print A4</span>
          </button>

          {onClose && (
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Close
            </button>
          )}
        </div>
      </div>

      {/* RENDER MODE 1: 80mm POS Thermal Receipt Format */}
      {printMode === 'thermal' ? (
        <div
          ref={invoiceRef}
          className="invoice-receipt thermal-receipt-mode"
          style={{
            background: '#ffffff',
            color: '#000000',
            width: '320px',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '1.25rem 1rem 2rem 1rem',
            borderRadius: '8px',
            fontFamily: "'Courier New', Courier, monospace, monospace",
            fontSize: '0.8rem',
            lineHeight: '1.35',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '1px solid #cbd5e1',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                marginBottom: '2px',
              }}
            >
              {storeSettings.storeName || 'Umar Farooq Mobile Zone'}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              Proprietor: {storeSettings.ownerName || 'Umar Farooq'}
            </div>
            <div style={{ fontSize: '0.72rem', margin: '2px 0', color: '#111' }}>
              {storeSettings.address}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              Tel/WhatsApp: {storeSettings.phone}
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Receipt Title */}
          <div
            style={{
              textAlign: 'center',
              fontWeight: 900,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            *** CASH SALE RECEIPT ***
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Meta Info */}
          <div style={{ fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Invoice #:</span>
              <strong>{sale.invoiceNo}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Date & Time:</span>
              <span>{sale.date} {sale.time || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer:</span>
              <strong>{sale.customerName || 'Walk-in Customer'}</strong>
            </div>
            {sale.customerPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Contact:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sales Staff:</span>
              <span>{sale.salesPerson || 'Staff'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment Mode:</span>
              <strong>{sale.paymentMethod || 'Cash'}</strong>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Items Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ flex: 1.8 }}>Item / Spec</span>
            <span style={{ width: '30px', textAlign: 'center' }}>Qty</span>
            <span style={{ width: '60px', textAlign: 'right' }}>Price</span>
            <span style={{ width: '65px', textAlign: 'right' }}>Total</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

          {/* Items Rows */}
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '6px', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 800 }}>
                {item.brand || ''} {item.model || item.productName || 'Mobile Product'}
              </div>
              {item.imei && (
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                  IMEI: {item.imei}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                <span style={{ color: '#333' }}>
                  {item.category || ''} {item.color ? `(${item.color})` : ''}
                </span>
                <span>
                  {item.quantity || 1} x {(item.price || 0).toLocaleString()} = <strong>{storeSettings.currency} {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</strong>
                </span>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '2px dashed #000', margin: '6px 0' }} />

          {/* Totals */}
          <div style={{ fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Items:</span>
              <span>{items.reduce((sum, it) => sum + (it.quantity || 1), 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>{storeSettings.currency} {(subtotal || 0).toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount:</span>
                <span>- {storeSettings.currency} {(discount || 0).toLocaleString()}</span>
              </div>
            )}
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax:</span>
                <span>+ {storeSettings.currency} {(tax || 0).toLocaleString()}</span>
              </div>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.05rem',
                fontWeight: 900,
              }}
            >
              <span>GRAND TOTAL:</span>
              <span>{storeSettings.currency} {(grandTotal || 0).toLocaleString()}</span>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Paid Amount:</span>
              <span>{storeSettings.currency} {(paidAmount || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Remaining Balance:</span>
              <span>{storeSettings.currency} {(remainingBalance || 0).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

          {/* Barcode for Thermal */}
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <svg ref={barcodeRef} style={{ maxWidth: '240px', height: 'auto' }} />
          </div>

          {/* QR Code for Thermal */}
          {qrCodeUrl && (
            <div style={{ textAlign: 'center', margin: '6px 0' }}>
              <img src={qrCodeUrl} alt="QR Code" style={{ width: '70px', height: '70px' }} />
              <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>Scan for Shop & Warranty Details</div>
            </div>
          )}

          {/* Warranty Terms */}
          <div style={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: '1.35', marginTop: '6px' }}>
            <div style={{ fontWeight: 800 }}>*** WARRANTY & RETURN POLICY ***</div>
            <div>• Official PTA approved warranty with box & slip</div>
            <div>• Used Phone: 3 Days Checking Warranty</div>
            <div>• No refund or replacement without original receipt</div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

          {/* Footer Note */}
          <div style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
            *** THANK YOU FOR VISITING! ***
          </div>

          {/* Developer Credit */}
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#444', marginTop: '4px' }}>
            Software Developed by: Imad Khan (+92 348 0779919)
          </div>

          {/* Paper cutter margin space */}
          <div style={{ height: '25px' }} />
        </div>
      ) : (
        /* RENDER MODE 2: Standard A4 Full Page Invoice Format */
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
      )}
    </div>
  );
};

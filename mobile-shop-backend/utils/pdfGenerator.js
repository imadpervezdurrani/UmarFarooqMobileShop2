import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function generateInvoicePDFBuffer(sale) {
  const qrData = [
    `Shop: Umar Farooq Mobile Zone`,
    `Owner: Umar Farooq`,
    `Address: Al-Firdous Plaza, Shop No.01 Ground Floor, Nowshera Cantt`,
    `Contact: 0345-7725525`,
    `Email: Umarfarooq201520@gmail.com`,
    `Invoice: ${sale.invoiceNo || ''}`,
    `Grand Total: Rs. ${(sale.grandTotal || 0).toLocaleString()}`,
  ].join('\n');

  let qrBuffer = null;
  try {
    qrBuffer = await QRCode.toBuffer(qrData, { width: 160, margin: 1 });
  } catch (err) {
    console.error('QR Buffer generation error in PDF:', err);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Store Header
    doc
      .fillColor('#0f172a')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Umar Farooq Mobile Zone', 40, 36);

    doc
      .fillColor('#0284c7')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Proprietor: Umar Farooq', 40, 58);

    doc
      .fillColor('#64748b')
      .fontSize(8.5)
      .font('Helvetica')
      .text('Al-Firdous Plaza, Shop No.01 Ground Floor, Nowshera Cantt', 40, 72);

    doc
      .fillColor('#334155')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Contact / WhatsApp: ', 40, 85, { continued: true })
      .fillColor('#0284c7')
      .text('0345-7725525');

    doc
      .fillColor('#334155')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Email: ', 40, 98, { continued: true })
      .fillColor('#0284c7')
      .text('Umarfarooq201520@gmail.com');

    // Invoice Details Top Right
    doc
      .fillColor('#0284c7')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('INVOICE', 350, 36, { width: 200, align: 'right' });

    doc
      .fillColor('#0f172a')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`#${sale.invoiceNo || 'INV-0000'}`, 350, 62, { width: 200, align: 'right' });

    doc
      .fillColor('#64748b')
      .fontSize(8.5)
      .font('Helvetica')
      .text(`Date: ${sale.date || ''} (${sale.time || ''})`, 350, 78, { width: 200, align: 'right' })
      .text(`Payment Method: ${sale.paymentMethod || 'Cash'}`, 350, 92, { width: 200, align: 'right' });

    doc.moveTo(40, 114).lineTo(550, 114).strokeColor('#e2e8f0').lineWidth(1.5).stroke();

    // Billed To & Sales Executive Info Box
    const infoBoxTop = 124;
    doc.roundedRect(40, infoBoxTop, 510, 48, 6).fill('#f8fafc');

    // Left Column: Customer
    doc
      .fillColor('#64748b')
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .text('BILLED TO (CUSTOMER)', 55, infoBoxTop + 8);

    doc
      .fillColor('#0f172a')
      .fontSize(10.5)
      .font('Helvetica-Bold')
      .text(sale.customerName || 'Walk-in Customer', 55, infoBoxTop + 20);

    doc
      .fillColor('#475569')
      .fontSize(8.5)
      .font('Helvetica')
      .text(`Phone: ${sale.customerPhone || 'N/A'}`, 55, infoBoxTop + 34);

    // Right Column: Salesperson & Status
    doc
      .fillColor('#64748b')
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .text('SALES EXECUTIVE', 340, infoBoxTop + 8, { width: 195, align: 'right' });

    doc
      .fillColor('#0f172a')
      .fontSize(9.5)
      .font('Helvetica-Bold')
      .text(sale.salesPerson || 'Staff', 340, infoBoxTop + 20, { width: 195, align: 'right' });

    const statusColor = sale.status === 'Paid' ? '#16a34a' : sale.status === 'Refunded' ? '#d97706' : '#dc2626';
    doc
      .fillColor('#475569')
      .fontSize(8.5)
      .font('Helvetica')
      .text('Status: ', 340, infoBoxTop + 34, { width: 155, align: 'right', continued: true })
      .fillColor(statusColor)
      .font('Helvetica-Bold')
      .text(sale.status || 'Paid');

    // Table Header (Dark Navy #0f172a)
    const tableTop = 186;
    doc.rect(40, tableTop, 510, 24).fill('#0f172a');

    doc
      .fillColor('#ffffff')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('#', 50, tableTop + 7)
      .text('Product / Specification', 75, tableTop + 7)
      .text('IMEI Number', 270, tableTop + 7, { width: 90, align: 'center' })
      .text('Unit Price', 365, tableTop + 7, { width: 70, align: 'right' })
      .text('Qty', 440, tableTop + 7, { width: 35, align: 'center' })
      .text('Total', 485, tableTop + 7, { width: 60, align: 'right' });

    // Table Items
    let position = tableTop + 30;
    const items = sale.items || [];

    if (items.length === 0) {
      doc
        .fillColor('#64748b')
        .fontSize(9)
        .font('Helvetica')
        .text('No item details recorded on this invoice.', 40, position, { align: 'center', width: 510 });
      position += 25;
    } else {
      items.forEach((it, idx) => {
        doc
          .fillColor('#64748b')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(`${idx + 1}`, 50, position);

        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(`${it.brand || ''} ${it.model || it.productName || 'Mobile Item'}`, 75, position);

        if (it.color) {
          doc
            .fillColor('#64748b')
            .fontSize(7.5)
            .font('Helvetica')
            .text(`Color: ${it.color}`, 75, position + 11);
        }

        doc
          .fillColor('#0284c7')
          .fontSize(8.5)
          .font('Courier-Bold')
          .text(it.imei || 'N/A', 270, position, { width: 90, align: 'center' });

        doc
          .fillColor('#0f172a')
          .fontSize(8.5)
          .font('Helvetica')
          .text(`Rs. ${(it.price || 0).toLocaleString()}`, 365, position, { width: 70, align: 'right' })
          .text(`${it.quantity || 1}`, 440, position, { width: 35, align: 'center' })
          .font('Helvetica-Bold')
          .text(`Rs. ${((it.price || 0) * (it.quantity || 1)).toLocaleString()}`, 485, position, { width: 60, align: 'right' });

        position += it.color ? 26 : 22;
        doc.moveTo(40, position - 4).lineTo(550, position - 4).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      });
    }

    // Lower Section: Warranty Policy & Totals
    position += 12;
    const totalsTop = position;

    // Left Column: Warranty Policy & QR Code
    doc
      .fillColor('#0f172a')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Warranty & Return Policy:', 40, totalsTop);

    doc
      .fillColor('#64748b')
      .fontSize(7.5)
      .font('Helvetica')
      .text('• Official PTA approved warranty claims require original invoice.', 40, totalsTop + 14)
      .text('• Software warranty 1 Year; Hardware warranty per brand guidelines.', 40, totalsTop + 26)
      .text('• No refund or replacement without box, seal, and IMEI match.', 40, totalsTop + 38);

    // QR Code Box
    const qrBoxTop = totalsTop + 54;
    doc.roundedRect(40, qrBoxTop, 270, 72, 6).fill('#f8fafc').strokeColor('#cbd5e1').lineWidth(1).stroke();

    if (qrBuffer) {
      doc.image(qrBuffer, 48, qrBoxTop + 8, { width: 56, height: 56 });
    }

    doc
      .fillColor('#0284c7')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('Official Shop QR Code', 112, qrBoxTop + 10)
      .fillColor('#0f172a')
      .fontSize(8.5)
      .text('Umar Farooq Mobile Zone', 112, qrBoxTop + 22)
      .fillColor('#64748b')
      .fontSize(7)
      .font('Helvetica')
      .text('Al-Firdous Plaza, Nowshera Cantt', 112, qrBoxTop + 34)
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .text('Contact: 0345-7725525', 112, qrBoxTop + 45)
      .fillColor('#0284c7')
      .fontSize(6.5)
      .font('Helvetica')
      .text('Scan for shop & warranty verification', 112, qrBoxTop + 56);

    // Right Column: Totals Box
    doc.roundedRect(330, totalsTop, 220, 126, 6).fill('#f8fafc');

    doc
      .fillColor('#475569')
      .fontSize(8.5)
      .font('Helvetica')
      .text('Subtotal:', 345, totalsTop + 10)
      .text(`Rs. ${(sale.subtotal || 0).toLocaleString()}`, 440, totalsTop + 10, { width: 95, align: 'right' });

    let runningTop = totalsTop + 24;
    if (sale.discount > 0) {
      doc
        .fillColor('#dc2626')
        .text('Discount:', 345, runningTop)
        .text(`- Rs. ${(sale.discount || 0).toLocaleString()}`, 440, runningTop, { width: 95, align: 'right' });
      runningTop += 14;
    }

    if (sale.tax > 0) {
      doc
        .fillColor('#475569')
        .text('Tax:', 345, runningTop)
        .text(`+ Rs. ${(sale.tax || 0).toLocaleString()}`, 440, runningTop, { width: 95, align: 'right' });
      runningTop += 14;
    }

    // Grand Total Bar
    doc.moveTo(345, runningTop + 2).lineTo(535, runningTop + 2).dash(3, { space: 2 }).strokeColor('#cbd5e1').stroke();
    doc.undash();

    doc
      .fillColor('#0f172a')
      .fontSize(10.5)
      .font('Helvetica-Bold')
      .text('Grand Total:', 345, runningTop + 8);

    doc
      .fillColor('#0284c7')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Rs. ${(sale.grandTotal || 0).toLocaleString()}`, 440, runningTop + 8, { width: 95, align: 'right' });

    runningTop += 24;
    doc.moveTo(345, runningTop).lineTo(535, runningTop).dash(3, { space: 2 }).strokeColor('#cbd5e1').stroke();
    doc.undash();

    doc
      .fillColor('#16a34a')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Paid Amount:', 345, runningTop + 6)
      .text(`Rs. ${(sale.paidAmount || 0).toLocaleString()}`, 440, runningTop + 6, { width: 95, align: 'right' });

    const balanceDueColor = (sale.remainingBalance || 0) > 0 ? '#dc2626' : '#64748b';
    doc
      .fillColor(balanceDueColor)
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Balance Dues:', 345, runningTop + 20)
      .text(`Rs. ${(sale.remainingBalance || 0).toLocaleString()}`, 440, runningTop + 20, { width: 95, align: 'right' });

    // Footer Signature
    const footerTop = 720;
    doc.moveTo(40, footerTop).lineTo(550, footerTop).strokeColor('#e2e8f0').lineWidth(1).stroke();

    doc
      .fillColor('#0f172a')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Thank you for shopping at Umar Farooq Mobile Zone!', 40, footerTop + 10)
      .fillColor('#64748b')
      .fontSize(7.5)
      .font('Helvetica')
      .text('For support & warranty inquiries: 0345-7725525 | Umarfarooq201520@gmail.com', 40, footerTop + 22);

    doc.moveTo(390, footerTop + 20).lineTo(540, footerTop + 20).strokeColor('#94a3b8').lineWidth(1).stroke();
    doc
      .fillColor('#0f172a')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('Umar Farooq', 390, footerTop + 24, { width: 150, align: 'center' })
      .fillColor('#64748b')
      .fontSize(7)
      .text('PROPRIETOR / AUTHORIZED', 390, footerTop + 35, { width: 150, align: 'center' });

    // Developer Credit Strip
    doc.moveTo(40, footerTop + 52).lineTo(550, footerTop + 52).dash(2, { space: 2 }).strokeColor('#e2e8f0').stroke();
    doc.undash();

    doc
      .fillColor('#94a3b8')
      .fontSize(7)
      .font('Helvetica')
      .text('Software Developed by: Imad Khan | Contact: +92 348 0779919 | Email: imad31910@gmail.com', 40, footerTop + 56, { align: 'center', width: 510 });

    doc.end();
  });
}

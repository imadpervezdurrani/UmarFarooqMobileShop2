export async function sendWhatsAppPDFInvoice({ phone, invoiceNo, customerName, grandTotal, pdfBase64, pdfUrl, storeName }) {
  try {
    if (!phone) {
      return { success: false, error: 'Customer phone number is missing' };
    }

    // Format Pakistani phone numbers: e.g. 03149085117 -> 923149085117
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
      cleanPhone = '92' + cleanPhone;
    }

    const caption = `🧾 *INVOICE DOCUMENT: ${invoiceNo}*\n🏢 *${storeName || 'Umar Farooq Mobile Zone'}*\n\nDear *${customerName || 'Valued Customer'}*,\nPlease find your official PDF Invoice attached for your records.\n\n💰 *Total Amount:* Rs. ${(grandTotal || 0).toLocaleString()}\n\nThank you for shopping with us! 🙏`;

    // UltraMsg Document API Credentials (Instance: instance190363, Token: 1nb64d36citsz8o3)
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || 'instance190363';
    const token = process.env.ULTRAMSG_TOKEN || '1nb64d36citsz8o3';
    const documentApiUrl = `https://api.ultramsg.com/${instanceId}/messages/document`;

    // Use Direct Base64 PDF Data String or Public URL
    const docPayload = pdfBase64
      ? `data:application/pdf;base64,${pdfBase64}`
      : (pdfUrl || `http://localhost:3000/api/invoices/${invoiceNo}/pdf`);

    const bodyParams = new URLSearchParams();
    bodyParams.append('token', token);
    bodyParams.append('to', cleanPhone);
    bodyParams.append('filename', `Invoice-${invoiceNo}.pdf`);
    bodyParams.append('document', docPayload);
    bodyParams.append('caption', caption);

    const response = await fetch(documentApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    const data = await response.json();
    return { success: true, response: data, phone: cleanPhone };
  } catch (err) {
    console.error('UltraMsg WhatsApp PDF API Error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendWhatsAppInvoice(params) {
  return sendWhatsAppPDFInvoice(params);
}

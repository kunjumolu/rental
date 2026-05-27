export const printInvoice = (invoice) => {
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const taxAmount = subtotal * ((Number(invoice.taxRate || 0)) / 100);
  const paidAmount = Number(invoice.paidAmount || 0);
  const balance = Number(invoice.balance || 0);
  const total = Number(invoice.total || 0);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN");
    } catch {
      return dateStr;
    }
  };

  const itemsHtml = items
    .map(
      (item, index) => `
      <tr style="border-bottom: 1px solid #f3f4f6; background: ${index % 2 === 0 ? "#fff" : "#fafafa"}">
        <td style="padding: 12px 16px; font-size: 14px; color: #111827;">${item.description || "-"}</td>
        <td style="padding: 12px 16px; font-size: 14px; color: #6b7280; text-align: center;">${item.quantity || 0}</td>
        <td style="padding: 12px 16px; font-size: 14px; color: #6b7280; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #fff;
          color: #111827;
          padding: 40px;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
        <div>
          <h1 style="font-size: 36px; font-weight: 800; color: #111827; letter-spacing: -1px;">INVOICE</h1>
          <p style="font-size: 20px; font-weight: 700; color: #6B21A8; margin-top: 6px;">${invoice.invoiceNumber}</p>
        </div>
        <div style="text-align: right;">
          <span style="
            display: inline-block;
            padding: 4px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
            background: ${invoice.status === "paid" ? "#d1fae5" : invoice.status === "overdue" ? "#fee2e2" : "#f3f4f6"};
            color: ${invoice.status === "paid" ? "#065f46" : invoice.status === "overdue" ? "#b91c1c" : "#374151"};
            text-transform: uppercase;
          ">${invoice.status}</span>
          <div style="margin-top: 12px; font-size: 13px; color: #6b7280; line-height: 1.8;">
            <div><strong style="color: #374151;">Issue Date:</strong> ${formatDate(invoice.issueDate)}</div>
            <div><strong style="color: #374151;">Due Date:</strong> ${formatDate(invoice.dueDate)}</div>
          </div>
        </div>
      </div>

      <hr style="border: none; border-top: 2px solid #e5e7eb; margin-bottom: 32px;" />

      <!-- From / Bill To -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">FROM</p>
          <p style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px;">White Legacy</p>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.8;">
            Kerala, India<br/>
            operations@whitelegacy.com
          </p>
        </div>
        <div>
          <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">BILL TO</p>
          <p style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px;">${invoice.customerName || "-"}</p>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.8;">
            ${invoice.customerAddress || ""}<br/>
            ${invoice.customerEmail || ""}
          </p>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
            <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
            <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
            <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || `
            <tr>
              <td colspan="4" style="padding: 24px; text-align: center; color: #9ca3af; font-size: 14px;">No items</td>
            </tr>
          `}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
            <span>Tax (${invoice.taxRate || 0}%)</span>
            <span>${formatCurrency(taxAmount)}</span>
          </div>
          ${Number(invoice.discount) > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
            <span>Discount</span>
            <span>${formatCurrency(invoice.discount)}</span>
          </div>
          ` : ""}
          <div style="display: flex; justify-content: space-between; padding: 14px 0; font-size: 22px; font-weight: 800; color: #111827; border-top: 2px solid #e5e7eb; margin-top: 4px;">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #10b981;">
            <span>Paid</span>
            <span>${formatCurrency(paidAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: 700; color: ${balance > 0 ? "#ef4444" : "#10b981"};">
            <span>Balance Due</span>
            <span>${formatCurrency(balance)}</span>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
      <!-- Notes -->
      <div style="margin-top: 40px; padding: 16px 20px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 13px; color: #374151;"><strong>Notes:</strong> ${invoice.notes}</p>
      </div>
      ` : ""}

      <!-- Footer -->
      <div style="margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af;">Thank you for your business!</p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">White Legacy — operations@whitelegacy.com</p>
      </div>

      <!-- Print button -->
      <div class="no-print" style="margin-top: 32px; text-align: center;">
        <button
          onclick="window.print()"
          style="
            padding: 12px 32px;
            background: #6B21A8;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
          "
        >
          🖨️ Print Invoice
        </button>
        <button
          onclick="window.close()"
          style="
            margin-left: 12px;
            padding: 12px 24px;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
          "
        >
          Close
        </button>
      </div>

    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
};
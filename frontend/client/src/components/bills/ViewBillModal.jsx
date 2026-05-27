import React from "react";
import { X, Pencil, Printer } from "lucide-react";

export default function ViewBillModal({ isOpen, onClose, bill, onEdit }) {
  if (!isOpen || !bill) return null;

  const items = Array.isArray(bill.items) ? bill.items : [];

  const fmt = (v) =>
    `₹${Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const fmtDate = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("en-IN"); }
    catch { return d; }
  };

  const subtotal = Number(bill.subtotal) || items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const discount = Number(bill.discount) || 0;
  const total    = Number(bill.amount) || Math.max(subtotal - discount, 0);
  const paid     = Number(bill.paid_amount) || 0;
  const balance  = Number(bill.balance_amount) || Math.max(total - paid, 0);

  const statusStyle = {
    paid:    { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    overdue: { bg: "#fee2e2", color: "#b91c1c" },
    draft:   { bg: "#f3f4f6", color: "#374151" },
  }[bill.status] || { bg: "#f3f4f6", color: "#374151" };

  /* ----------- Print ----------- */
  const handlePrint = () => {
    const itemRows = items.length
      ? items.map((it, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};border-bottom:1px solid #f3f4f6;">
          <td style="padding:12px 16px;font-size:14px;">
            <div style="font-weight:600;color:#111827;">${escapeHtml(it.item_name || '-')}</div>
            ${it.item_sku ? `<div style="font-size:12px;color:#6b7280;">SKU: ${escapeHtml(it.item_sku)}</div>` : ''}
          </td>
          <td style="padding:12px 16px;font-size:13px;color:#6b7280;">${escapeHtml(it.account || '-')}</td>
          <td style="padding:12px 16px;font-size:14px;text-align:center;">${Number(it.quantity || 0)}</td>
          <td style="padding:12px 16px;font-size:14px;text-align:right;color:#6b7280;">${fmt(it.rate)}</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${fmt(it.amount)}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" style="padding:24px;text-align:center;color:#9ca3af;">No items</td></tr>`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Bill ${escapeHtml(bill.bill_number || '')}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px;max-width:840px;margin:0 auto;color:#111827;}
  @media print { body{padding:20px;} .no-print{display:none!important;} }
</style></head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
    <div>
      <h1 style="font-size:36px;font-weight:800;letter-spacing:-1px;">BILL</h1>
      <p style="font-size:20px;font-weight:700;color:#6B21A8;margin-top:6px;">${escapeHtml(bill.bill_number || '')}</p>
    </div>
    <div style="text-align:right;">
      <span style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:13px;font-weight:700;background:${statusStyle.bg};color:${statusStyle.color};text-transform:uppercase;">${escapeHtml(bill.status || 'draft')}</span>
      <div style="margin-top:12px;font-size:13px;color:#6b7280;line-height:1.8;">
        <div><strong style="color:#374151;">Bill Date:</strong> ${fmtDate(bill.bill_date)}</div>
        <div><strong style="color:#374151;">Due Date:</strong> ${fmtDate(bill.due_date)}</div>
      </div>
    </div>
  </div>
  <hr style="border:none;border-top:2px solid #e5e7eb;margin-bottom:32px;">

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:40px;">
    <div>
      <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">VENDOR</p>
      <p style="font-size:18px;font-weight:700;margin-bottom:4px;">${escapeHtml(bill.vendor_name || '-')}</p>
      <p style="font-size:13px;color:#6b7280;line-height:1.8;">
        ${escapeHtml(bill.vendor_email || '')}
      </p>
    </div>
    <div>
      <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">DETAILS</p>
      <p style="font-size:13px;color:#374151;line-height:1.8;">
        Order #: ${escapeHtml(bill.order_number || '-')}<br/>
        Payment Terms: ${escapeHtml(bill.payment_terms || '-')}<br/>
        ${bill.subject ? `Subject: ${escapeHtml(bill.subject)}` : ''}
      </p>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
    <thead>
      <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Account</th>
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Rate</th>
        <th style="padding:12px 16px;font-size:12px;font-weight:700;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div style="display:flex;justify-content:flex-end;">
    <div style="width:320px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;">
        <span>Subtotal</span><span>${fmt(subtotal)}</span>
      </div>
      ${discount > 0 ? `
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;">
        <span>Discount</span><span>${fmt(discount)}</span>
      </div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:14px 0;font-size:22px;font-weight:800;border-top:2px solid #e5e7eb;margin-top:4px;">
        <span>Total</span><span>${fmt(total)}</span>
      </div>
      ${paid > 0 ? `
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:#10b981;">
        <span>Paid</span><span>${fmt(paid)}</span>
      </div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:16px;font-weight:700;color:${balance > 0 ? '#ef4444' : '#10b981'};">
        <span>Balance Due</span><span>${fmt(balance)}</span>
      </div>
    </div>
  </div>

  ${bill.notes ? `
  <div style="margin-top:40px;padding:16px 20px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
    <p style="font-size:13px;color:#374151;"><strong>Notes:</strong> ${escapeHtml(bill.notes)}</p>
  </div>` : ''}

  <div class="no-print" style="margin-top:32px;text-align:center;">
    <button onclick="window.print()" style="padding:12px 32px;background:#6B21A8;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">🖨️ Print</button>
    <button onclick="window.close()" style="margin-left:12px;padding:12px 24px;background:#f3f4f6;color:#374151;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Close</button>
  </div>
  <script>setTimeout(()=>window.print(),350);</script>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=800");
    if (!w) { alert("Please allow popups to print bills."); return; }
    w.document.write(html); w.document.close(); w.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[820px] max-h-[92vh] overflow-y-auto rounded-[20px] bg-white shadow-2xl relative">
        <button onClick={onClose} className="absolute right-5 top-5 text-[#6b7280] hover:text-[#111827]">
          <X size={22} />
        </button>

        <div className="px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">BILL</h1>
              <p className="text-[20px] font-semibold text-[#6B21A8] mt-2">{bill.bill_number || "-"}</p>
            </div>
            <div className="text-right">
              <span
                className="inline-flex px-4 py-1 rounded-full font-semibold text-[13px] uppercase"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {bill.status}
              </span>
              <div className="mt-3 text-[13px] text-[#6b7280]">
                <div>Bill Date: {fmtDate(bill.bill_date)}</div>
                <div>Due Date: {fmtDate(bill.due_date)}</div>
              </div>
            </div>
          </div>

          {/* Vendor + Meta */}
          <div className="mt-8 border-t border-[#e5e7eb] pt-6 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wide mb-2">Vendor</h3>
              <p className="text-[15px] font-bold text-[#111827]">{bill.vendor_name || "-"}</p>
              {bill.vendor_email && <p className="text-[13px] text-[#6b7280] mt-1">{bill.vendor_email}</p>}
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wide mb-2">Details</h3>
              <div className="text-[13px] text-[#374151] space-y-1">
                <div>Order #: <span className="font-medium">{bill.order_number || "-"}</span></div>
                <div>Payment Terms: <span className="font-medium">{bill.payment_terms || "-"}</span></div>
                {bill.subject && <div>Subject: <span className="font-medium">{bill.subject}</span></div>}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-8">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Items</h3>
            <div className="rounded-[12px] border border-[#e5e7eb] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <Th>Item</Th>
                    <Th>Account</Th>
                    <Th align="center">Qty</Th>
                    <Th align="right">Rate</Th>
                    <Th align="right">Amount</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#9ca3af]">No items</td>
                    </tr>
                  ) : items.map((it, i) => (
                    <tr key={it.id || i} className="border-b border-[#f3f4f6] last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-[14px] font-medium text-[#111827]">{it.item_name || "-"}</div>
                        {it.item_sku && <div className="text-[12px] text-[#6b7280]">SKU: {it.item_sku}</div>}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#6b7280]">{it.account || "-"}</td>
                      <td className="px-4 py-3 text-[13px] text-center">{Number(it.quantity || 0)}</td>
                      <td className="px-4 py-3 text-[13px] text-right text-[#6b7280]">{fmt(it.rate)}</td>
                      <td className="px-4 py-3 text-[14px] text-right font-semibold">{fmt(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-[#e5e7eb] pt-5 flex justify-end">
            <div className="w-[300px] space-y-2">
              <Row label="Subtotal" value={fmt(subtotal)} />
              {discount > 0 && <Row label="Discount" value={fmt(discount)} />}
              <div className="flex justify-between text-[18px] font-bold text-[#111827] pt-2 border-t border-[#e5e7eb]">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-[#10b981]">
                <span>Paid</span><span>{fmt(paid)}</span>
              </div>
              <div className={`flex justify-between text-[15px] font-semibold ${balance > 0 ? "text-[#ef4444]" : "text-[#10b981]"}`}>
                <span>Balance Due</span><span>{fmt(balance)}</span>
              </div>
            </div>
          </div>

          {bill.notes && (
            <div className="mt-6 rounded-[12px] bg-[#f9fafb] px-4 py-3 text-[13px] text-[#374151]">
              <span className="font-semibold">Notes: </span>{bill.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-8 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] sticky bottom-0">
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="h-[42px] px-5 rounded-[12px] bg-[#6B21A8] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#581c87] transition"
            >
              <Printer size={16} /> Print
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="h-[42px] px-5 rounded-[12px] border border-[#d1d5db] bg-white text-[#374151] text-[14px] font-semibold flex items-center gap-2 hover:bg-[#f9fafb] transition"
              >
                <Pencil size={16} /> Edit
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-[42px] rounded-[12px] border border-[#d1d5db] px-5 text-[14px] font-medium text-[#374151]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th className={`px-4 py-3 text-${align} text-[12px] font-semibold text-[#6b7280] uppercase tracking-wide`}>
      {children}
    </th>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-[14px] text-[#6b7280]">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

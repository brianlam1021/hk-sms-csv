const HEADERS = ["日期", "金額", "貨幣", "商戶", "銀行", "卡尾"];

function escapeCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

export function rowsToCsv(rows) {
  const lines = [
    HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.date,
        formatAmount(row.amount),
        row.currency,
        row.merchant,
        row.bank,
        row.cardTail,
      ]
        .map(escapeCell)
        .join(","),
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function downloadCsv(rows, filename = "hk-sms-ledger.csv") {
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

import { parseSmsText, summarize } from "./parser.js";
import { downloadCsv } from "./csv.js";
import { SAMPLE_SMS } from "./samples.js";

const els = {
  input: document.getElementById("sms-input"),
  loadSamples: document.getElementById("load-samples"),
  clear: document.getElementById("clear-input"),
  download: document.getElementById("download-csv"),
  status: document.getElementById("parse-status"),
  empty: document.getElementById("empty-state"),
  results: document.getElementById("results"),
  totalAmount: document.getElementById("total-amount"),
  totalCount: document.getElementById("total-count"),
  unmatchedCount: document.getElementById("unmatched-count"),
  byBank: document.getElementById("by-bank"),
  byMerchant: document.getElementById("by-merchant"),
  previewBody: document.getElementById("preview-body"),
  unmatchedBox: document.getElementById("unmatched-box"),
  unmatchedList: document.getElementById("unmatched-list"),
};

let currentRows = [];

function money(amount, currency = "HKD") {
  return `${currency} ${amount.toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function renderBreakdown(target, entries) {
  target.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "尚無資料";
    target.append(empty);
    return;
  }
  for (const [label, amount] of entries) {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("strong");
    value.textContent = money(amount);
    item.append(name, value);
    target.append(item);
  }
}

function renderPreview(rows) {
  els.previewBody.replaceChildren();
  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.className = "muted";
    td.textContent = "沒有可匯出的列。";
    tr.append(td);
    els.previewBody.append(tr);
    return;
  }
  for (const row of rows) {
    const tr = document.createElement("tr");
    const cells = [
      row.date || "—",
      money(row.amount, row.currency),
      row.merchant || "—",
      row.bank,
      row.cardTail || "—",
    ];
    for (const value of cells) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    }
    els.previewBody.append(tr);
  }
}

function renderUnmatched(lines) {
  els.unmatchedList.replaceChildren();
  if (!lines.length) {
    els.unmatchedBox.hidden = true;
    return;
  }
  els.unmatchedBox.hidden = false;
  for (const line of lines) {
    const li = document.createElement("li");
    li.textContent = line;
    els.unmatchedList.append(li);
  }
}

function render() {
  const text = els.input.value;
  const { rows, unmatched } = parseSmsText(text);
  currentRows = rows;
  const stats = summarize(rows);
  const hasText = Boolean(text.trim());

  els.empty.hidden = hasText;
  els.results.hidden = !hasText;
  els.download.disabled = rows.length === 0;

  els.totalAmount.textContent = money(stats.total);
  els.totalCount.textContent = String(stats.count);
  els.unmatchedCount.textContent = String(unmatched.length);
  renderBreakdown(els.byBank, stats.byBank);
  renderBreakdown(els.byMerchant, stats.byMerchant);
  renderPreview(rows);
  renderUnmatched(unmatched);

  if (!hasText) {
    els.status.textContent = "尚未貼上短訊。文字只留在這個分頁，離開或重整即消失。";
    return;
  }
  els.status.textContent = `已辨識 ${stats.count} 筆簽賬，${unmatched.length} 行未能對上。未能對上的行不計入總額，也不會寫入 CSV。`;
}

els.input.addEventListener("input", render);
els.loadSamples.addEventListener("click", () => {
  els.input.value = SAMPLE_SMS;
  els.input.focus();
  render();
});
els.clear.addEventListener("click", () => {
  els.input.value = "";
  els.input.focus();
  render();
});
els.download.addEventListener("click", () => {
  if (!currentRows.length) return;
  downloadCsv(currentRows);
});

render();

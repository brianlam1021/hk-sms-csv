/**
 * Hong Kong Small Claims Tribunal / Labour Tribunal filing-fee estimator.
 *
 * SCT — Small Claims Tribunal (Fees) Rules (Cap. 338B), as amended by
 * L.N. 112 of 2024 (effective 31 October 2024). Official table Oct 2024:
 *   https://www.judiciary.hk/doc/en/court_services_facilities/gcssct_9_202410.pdf
 *   https://www.judiciary.hk/doc/zh/court_services_facilities/gcssct_9_202410.pdf
 * Guide: https://www.judiciary.hk/en/court_services_facilities/sc.html
 *
 * LT — Labour Tribunal (Fees) Rules (Cap. 25B) Schedule (filing, witness
 * summons, review, leave to appeal). Judiciary Labour Tribunal guide also
 * lists $10 per address to serve claim documents:
 *   https://www.judiciary.hk/en/court_services_facilities/labour.html
 *
 * Checked 28 October 2026.
 * Reference only — not a Judiciary official tool, and not legal advice.
 */

export const AS_OF = "2026-10-28";
export const SCT_LIMIT = 75000;
export const MAX_COUNT = 99;

/** Cap. 338B item 1 — filing of a claim or counterclaim. */
export const SCT_FILING_BANDS = [
  { id: "le5k", fee: 20, max: 5000 },
  { id: "le25k", fee: 40, minExclusive: 5000, max: 25000 },
  { id: "le50k", fee: 70, minExclusive: 25000, max: 50000 },
  { id: "le75k", fee: 120, minExclusive: 50000, max: 75000 },
];

/** Common add-ons from the same SCT fee table (items 1A–4 and 10A). */
export const SCT_ADDONS = {
  interPartySummons: { id: "interPartySummons", item: "1A", fee: 55, kind: "count" },
  witnessSummons: { id: "witnessSummons", item: "2", fee: 33, kind: "count" },
  amendedDocument: { id: "amendedDocument", item: "2A", fee: 20, kind: "count" },
  writOfExecution: { id: "writOfExecution", item: "2B", fee: 55, kind: "count" },
  setAside: { id: "setAside", item: "2C", fee: 61, kind: "flag" },
  review: { id: "review", item: "3", fee: 61, kind: "flag" },
  leaveToAppeal: { id: "leaveToAppeal", item: "4", fee: 61, kind: "flag" },
  bailiffDelivery: { id: "bailiffDelivery", item: "10A", fee: 10, kind: "count" },
};

/** Cap. 25B item 1 — filing of claim. */
export const LT_FILING_BANDS = [
  { id: "le2k", fee: 20, max: 2000 },
  { id: "le5k", fee: 30, minExclusive: 2000, max: 5000 },
  { id: "le10k", fee: 40, minExclusive: 5000, max: 10000 },
  { id: "over10k", fee: 50, minExclusive: 10000 },
];

/**
 * LT add-ons cited from Cap. 25B (items 2–4) and the Judiciary Labour
 * Tribunal page ($10 per address to serve documents on the defendant).
 */
export const LT_ADDONS = {
  witnessSummons: { id: "witnessSummons", item: "2", fee: 25, kind: "count", source: "cap25B" },
  review: { id: "review", item: "3", fee: 45, kind: "flag", source: "cap25B" },
  leaveToAppeal: { id: "leaveToAppeal", item: "4", fee: 45, kind: "flag", source: "cap25B" },
  serviceAddress: { id: "serviceAddress", item: "service", fee: 10, kind: "count", source: "judiciaryPage" },
};

export function formatMoney(amount, digits) {
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 0 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + "HK$" + parts.join(".");
}

export function parseAmount(value) {
  if (value === "" || value == null) return null;
  var n = typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

export function parseCount(value) {
  var n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MAX_COUNT, Math.floor(n));
}

export function normalizeTribunal(value) {
  return value === "lt" ? "lt" : "sct";
}

export function emptySettings() {
  return {
    tribunal: "sct",
    claimAmount: 3000,
    interPartySummons: 0,
    witnessSummons: 0,
    amendedDocument: 0,
    writOfExecution: 0,
    setAside: false,
    review: false,
    leaveToAppeal: false,
    bailiffDelivery: 0,
    serviceAddress: 0,
  };
}

export function demo3k() {
  return Object.assign(emptySettings(), { tribunal: "sct", claimAmount: 3000 });
}

export function demo60k() {
  return Object.assign(emptySettings(), { tribunal: "sct", claimAmount: 60000 });
}

export function demoWitness() {
  return Object.assign(emptySettings(), {
    tribunal: "sct",
    claimAmount: 8000,
    witnessSummons: 1,
  });
}

export function demoLt() {
  return Object.assign(emptySettings(), {
    tribunal: "lt",
    claimAmount: 12000,
    witnessSummons: 1,
    serviceAddress: 1,
  });
}

/**
 * SCT item 1: does not exceed 5,000 → 20;
 * exceeds 5,000 but does not exceed 25,000 → 40;
 * exceeds 25,000 but does not exceed 50,000 → 70;
 * exceeds 50,000 but does not exceed 75,000 → 120;
 * exceeds 75,000 → cannot file as SCT.
 */
export function lookupSctFiling(amount) {
  var n = parseAmount(amount);
  if (n == null || n < 0) {
    return { ok: false, reason: "badAmount", amount: n };
  }
  if (n > SCT_LIMIT) {
    return { ok: false, reason: "overLimit", amount: n, limit: SCT_LIMIT };
  }
  var band;
  if (n <= 5000) band = SCT_FILING_BANDS[0];
  else if (n <= 25000) band = SCT_FILING_BANDS[1];
  else if (n <= 50000) band = SCT_FILING_BANDS[2];
  else band = SCT_FILING_BANDS[3];
  return { ok: true, id: band.id, fee: band.fee, amount: n, limit: SCT_LIMIT };
}

/**
 * Cap. 25B item 1: does not exceed 2,000 → 20;
 * exceeds 2,000 but does not exceed 5,000 → 30;
 * exceeds 5,000 but does not exceed 10,000 → 40;
 * exceeds 10,000 → 50.
 */
export function lookupLtFiling(amount) {
  var n = parseAmount(amount);
  if (n == null || n < 0) {
    return { ok: false, reason: "badAmount", amount: n };
  }
  var band;
  if (n <= 2000) band = LT_FILING_BANDS[0];
  else if (n <= 5000) band = LT_FILING_BANDS[1];
  else if (n <= 10000) band = LT_FILING_BANDS[2];
  else band = LT_FILING_BANDS[3];
  return { ok: true, id: band.id, fee: band.fee, amount: n };
}

function addonLine(spec, qty) {
  var n = spec.kind === "flag" ? (qty ? 1 : 0) : parseCount(qty);
  if (n <= 0) return null;
  return {
    id: spec.id,
    item: spec.item,
    fee: spec.fee,
    qty: n,
    total: spec.fee * n,
    source: spec.source || "cap338B",
  };
}

function normalizeSettings(input) {
  var raw = input && typeof input === "object" ? input : {};
  return {
    tribunal: normalizeTribunal(raw.tribunal),
    claimAmount: raw.claimAmount,
    interPartySummons: parseCount(raw.interPartySummons),
    witnessSummons: parseCount(raw.witnessSummons),
    amendedDocument: parseCount(raw.amendedDocument),
    writOfExecution: parseCount(raw.writOfExecution),
    setAside: raw.setAside === true,
    review: raw.review === true,
    leaveToAppeal: raw.leaveToAppeal === true,
    bailiffDelivery: parseCount(raw.bailiffDelivery),
    serviceAddress: parseCount(raw.serviceAddress),
  };
}

export function compute(settings) {
  var s = normalizeSettings(settings);
  var warnings = [];
  var tribunal = s.tribunal;
  var filing = tribunal === "lt" ? lookupLtFiling(s.claimAmount) : lookupSctFiling(s.claimAmount);

  if (!filing.ok) {
    warnings.push(filing.reason || "badAmount");
  }

  var lines = [];
  if (filing.ok) {
    lines.push({
      id: "filing",
      item: "1",
      fee: filing.fee,
      qty: 1,
      total: filing.fee,
      band: filing.id,
    });
  }

  var addonSpecs =
    tribunal === "lt"
      ? [
          [LT_ADDONS.witnessSummons, s.witnessSummons],
          [LT_ADDONS.review, s.review],
          [LT_ADDONS.leaveToAppeal, s.leaveToAppeal],
          [LT_ADDONS.serviceAddress, s.serviceAddress],
        ]
      : [
          [SCT_ADDONS.interPartySummons, s.interPartySummons],
          [SCT_ADDONS.witnessSummons, s.witnessSummons],
          [SCT_ADDONS.amendedDocument, s.amendedDocument],
          [SCT_ADDONS.writOfExecution, s.writOfExecution],
          [SCT_ADDONS.setAside, s.setAside],
          [SCT_ADDONS.review, s.review],
          [SCT_ADDONS.leaveToAppeal, s.leaveToAppeal],
          [SCT_ADDONS.bailiffDelivery, s.bailiffDelivery],
        ];

  var addonsTotal = 0;
  for (var i = 0; i < addonSpecs.length; i++) {
    var line = addonLine(addonSpecs[i][0], addonSpecs[i][1]);
    if (line) {
      lines.push(line);
      addonsTotal += line.total;
    }
  }

  var filingFee = filing.ok ? filing.fee : null;
  var hasTotal = filing.ok || addonsTotal > 0;
  var total = hasTotal ? (filingFee || 0) + addonsTotal : null;

  return {
    ok: filing.ok,
    tribunal: tribunal,
    claimAmount: filing.amount != null ? filing.amount : parseAmount(s.claimAmount),
    filing: filing,
    lines: lines,
    filingFee: filingFee,
    addonsTotal: addonsTotal,
    total: total,
    warnings: warnings,
    overLimit: filing.reason === "overLimit",
    abandonExcess: filing.reason === "overLimit" && tribunal === "sct"
      ? { claimAmount: SCT_LIMIT, filingFee: 120, band: "le75k" }
      : null,
  };
}

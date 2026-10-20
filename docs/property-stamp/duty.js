/**
 * Hong Kong ad valorem stamp duty (AVD) on sale / transfer of immovable
 * property (Cap. 117 Schedule 1). Not tenancy stamp duty (see tenancy-stamp)
 * and not property tax (see property-tax).
 *
 * Rates checked against IRD / GovHK as of 20 October 2026:
 *   - From 26 Feb 2026: residential → Part 1 of Scale 1 / Scale 2
 *     (identical bands; 6.5% above ~$109.57M). Non-residential → Scale 3.
 *   - From 28 Feb 2024: BSD, SSD and NRSD abolished for residential;
 *     Scale 1 Part 1 rates aligned with Scale 2.
 *   - Pre-26 Feb 2026 Scale 2 (both types) matches today's Scale 3 table.
 *
 * Duty is rounded up to the nearest $1 when a fraction of $1 arises.
 * Chargeable amount = higher of consideration or market value.
 *
 * https://www.ird.gov.hk/eng/faq/avd.htm
 * https://www.gov.hk/en/residents/taxes/stamp/stamp_duty_rates.htm
 * https://www.ird.gov.hk/eng/faq/dsmm.htm
 */

export const AS_OF = "2026-10-20";
export const RATES_EFFECTIVE = "2026-02-26";
export const DSM_ABOLISHED = "2024-02-28";

/**
 * Scale bands: each entry is either a flat amount, a percentage of the
 * chargeable amount, or a base + % of excess over a threshold.
 * Bands are ordered by max (inclusive upper bound; Infinity for open end).
 */
export const SCALE_RESIDENTIAL = [
  { max: 4000000, kind: "flat", amount: 100, label: "≤ $4,000,000 → $100" },
  {
    max: 4323780,
    kind: "excess",
    base: 100,
    rate: 0.2,
    over: 4000000,
    label: "$4,000,001–$4,323,780 → $100 + 20% of excess over $4,000,000",
  },
  { max: 4500000, kind: "pct", rate: 0.015, label: "$4,323,781–$4,500,000 → 1.5%" },
  {
    max: 4935480,
    kind: "excess",
    base: 67500,
    rate: 0.1,
    over: 4500000,
    label: "$4,500,001–$4,935,480 → $67,500 + 10% of excess over $4,500,000",
  },
  { max: 6000000, kind: "pct", rate: 0.0225, label: "$4,935,481–$6,000,000 → 2.25%" },
  {
    max: 6642860,
    kind: "excess",
    base: 135000,
    rate: 0.1,
    over: 6000000,
    label: "$6,000,001–$6,642,860 → $135,000 + 10% of excess over $6,000,000",
  },
  { max: 9000000, kind: "pct", rate: 0.03, label: "$6,642,861–$9,000,000 → 3%" },
  {
    max: 10080000,
    kind: "excess",
    base: 270000,
    rate: 0.1,
    over: 9000000,
    label: "$9,000,001–$10,080,000 → $270,000 + 10% of excess over $9,000,000",
  },
  { max: 20000000, kind: "pct", rate: 0.0375, label: "$10,080,001–$20,000,000 → 3.75%" },
  {
    max: 21739120,
    kind: "excess",
    base: 750000,
    rate: 0.1,
    over: 20000000,
    label: "$20,000,001–$21,739,120 → $750,000 + 10% of excess over $20,000,000",
  },
  { max: 100000000, kind: "pct", rate: 0.0425, label: "$21,739,121–$100,000,000 → 4.25%" },
  {
    max: 109574470,
    kind: "excess",
    base: 4250000,
    rate: 0.3,
    over: 100000000,
    label: "$100,000,001–$109,574,470 → $4,250,000 + 30% of excess over $100,000,000",
  },
  { max: Infinity, kind: "pct", rate: 0.065, label: "≥ $109,574,471 → 6.5%" },
];

/** Scale 3 (non-residential from 26 Feb 2026) — same as pre-amendment Scale 2. */
export const SCALE_NON_RESIDENTIAL = [
  { max: 4000000, kind: "flat", amount: 100, label: "≤ $4,000,000 → $100" },
  {
    max: 4323780,
    kind: "excess",
    base: 100,
    rate: 0.2,
    over: 4000000,
    label: "$4,000,001–$4,323,780 → $100 + 20% of excess over $4,000,000",
  },
  { max: 4500000, kind: "pct", rate: 0.015, label: "$4,323,781–$4,500,000 → 1.5%" },
  {
    max: 4935480,
    kind: "excess",
    base: 67500,
    rate: 0.1,
    over: 4500000,
    label: "$4,500,001–$4,935,480 → $67,500 + 10% of excess over $4,500,000",
  },
  { max: 6000000, kind: "pct", rate: 0.0225, label: "$4,935,481–$6,000,000 → 2.25%" },
  {
    max: 6642860,
    kind: "excess",
    base: 135000,
    rate: 0.1,
    over: 6000000,
    label: "$6,000,001–$6,642,860 → $135,000 + 10% of excess over $6,000,000",
  },
  { max: 9000000, kind: "pct", rate: 0.03, label: "$6,642,861–$9,000,000 → 3%" },
  {
    max: 10080000,
    kind: "excess",
    base: 270000,
    rate: 0.1,
    over: 9000000,
    label: "$9,000,001–$10,080,000 → $270,000 + 10% of excess over $9,000,000",
  },
  { max: 20000000, kind: "pct", rate: 0.0375, label: "$10,080,001–$20,000,000 → 3.75%" },
  {
    max: 21739120,
    kind: "excess",
    base: 750000,
    rate: 0.1,
    over: 20000000,
    label: "$20,000,001–$21,739,120 → $750,000 + 10% of excess over $20,000,000",
  },
  { max: Infinity, kind: "pct", rate: 0.0425, label: "≥ $21,739,121 → 4.25%" },
];

function finite(n, fallback) {
  var v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function nonNeg(n) {
  var v = finite(n, 0);
  return v < 0 ? 0 : v;
}

export function roundDuty(amount) {
  var n = nonNeg(amount);
  if (n === 0) return 0;
  return Math.ceil(n - 1e-12);
}

export function parseYmd(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  var y = Number(m[1]);
  var mo = Number(m[2]);
  var d = Number(m[3]);
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y: y, mo: mo, d: d };
}

export function formatYmd(ymd) {
  if (!ymd) return "";
  return (
    String(ymd.y) +
    "-" +
    String(ymd.mo).padStart(2, "0") +
    "-" +
    String(ymd.d).padStart(2, "0")
  );
}

export function cmpYmd(a, b) {
  if (!a || !b) return 0;
  if (a.y !== b.y) return a.y - b.y;
  if (a.mo !== b.mo) return a.mo - b.mo;
  return a.d - b.d;
}

export function dutyOnAmount(amount, bands) {
  var v = nonNeg(amount);
  if (v === 0) {
    return { raw: 0, duty: 0, band: bands[0], bandIndex: 0 };
  }
  for (var i = 0; i < bands.length; i++) {
    var band = bands[i];
    if (v <= band.max) {
      var raw = 0;
      if (band.kind === "flat") raw = band.amount;
      else if (band.kind === "pct") raw = v * band.rate;
      else raw = band.base + (v - band.over) * band.rate;
      return { raw: raw, duty: roundDuty(raw), band: band, bandIndex: i };
    }
  }
  var last = bands[bands.length - 1];
  var lastRaw = last.kind === "pct" ? v * last.rate : last.amount;
  return { raw: lastRaw, duty: roundDuty(lastRaw), band: last, bandIndex: bands.length - 1 };
}

/**
 * Pick the scale for an instrument date + property type.
 * Current (on/after 26 Feb 2026): residential = Scale 1 Part 1 / Scale 2;
 * non-residential = Scale 3.
 * Before 26 Feb 2026 (on/after 28 Feb 2024 DSM abolition): both use the
 * graduated Scale 2 table that matches today's Scale 3 (no 6.5% tier).
 */
export function resolveScale(propertyType, instrumentYmd) {
  var residential = propertyType !== "nonResidential";
  var afterNew =
    !instrumentYmd || cmpYmd(instrumentYmd, parseYmd(RATES_EFFECTIVE)) >= 0;
  if (residential && afterNew) {
    return {
      id: "scale1and2",
      bands: SCALE_RESIDENTIAL,
      nameZh: "第一標準第1部／第二標準（住宅，稅率相同）",
      nameEn: "Part 1 of Scale 1 / Scale 2 (residential; rates identical)",
    };
  }
  return {
    id: residential ? "scale2-pre2026" : "scale3",
    bands: SCALE_NON_RESIDENTIAL,
    nameZh: residential
      ? "第二標準（2026-02-26前住宅；與現時第三標準相同）"
      : afterNew
        ? "第三標準（非住宅）"
        : "第二標準／第三標準（非住宅；稅表相同）",
    nameEn: residential
      ? "Scale 2 (residential before 26 Feb 2026; same table as Scale 3)"
      : afterNew
        ? "Scale 3 (non-residential)"
        : "Scale 2 / Scale 3 (non-residential; same table)",
  };
}

export function emptyModel() {
  return {
    propertyType: "residential",
    consideration: 6000000,
    marketValue: 0,
    instrumentDate: "2026-10-20",
    buyerShare: 100,
  };
}

export function demoFlat() {
  return {
    propertyType: "residential",
    consideration: 6000000,
    marketValue: 0,
    instrumentDate: "2026-10-20",
    buyerShare: 100,
  };
}

export function demoLuxury() {
  return {
    propertyType: "residential",
    consideration: 120000000,
    marketValue: 0,
    instrumentDate: "2026-10-20",
    buyerShare: 100,
  };
}

export function demoShop() {
  return {
    propertyType: "nonResidential",
    consideration: 15000000,
    marketValue: 0,
    instrumentDate: "2026-10-20",
    buyerShare: 100,
  };
}

export function formatHkd(n, digits) {
  var d = digits == null ? 0 : digits;
  var v = finite(n, 0);
  var abs = Math.abs(v).toLocaleString("en-HK", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  return (v < 0 ? "−" : "") + "HK$" + abs;
}

export function compute(input) {
  var model = Object.assign(emptyModel(), input || {});
  var warnings = [];
  var consideration = nonNeg(model.consideration);
  var marketValue = nonNeg(model.marketValue);
  var chargeable = Math.max(consideration, marketValue);
  var instrument = parseYmd(model.instrumentDate);
  var propertyType = model.propertyType === "nonResidential" ? "nonResidential" : "residential";

  if (chargeable <= 0) {
    warnings.push("zeroAmount");
  }
  if (marketValue > 0 && marketValue > consideration) {
    warnings.push("valueHigher");
  }
  if (!instrument) {
    warnings.push("badDate");
  }

  var dsmCutoff = parseYmd(DSM_ABOLISHED);
  var ratesCutoff = parseYmd(RATES_EFFECTIVE);
  var bsdSsdNrsd = 0;
  var dsmStatus = "abolished";
  if (instrument && cmpYmd(instrument, dsmCutoff) < 0) {
    dsmStatus = "mayApply";
    warnings.push("dsmHistorical");
  } else {
    warnings.push("dsmAbolished");
  }
  if (instrument && cmpYmd(instrument, ratesCutoff) < 0) {
    warnings.push("preNewRates");
  }
  if (propertyType === "residential" && chargeable > 100000000) {
    warnings.push("luxuryBand");
  }

  var scale = resolveScale(propertyType, instrument);
  var calc =
    chargeable > 0
      ? dutyOnAmount(chargeable, scale.bands)
      : { raw: 0, duty: 0, band: scale.bands[0], bandIndex: 0 };

  var share = Math.min(100, Math.max(0, finite(model.buyerShare, 100)));
  var buyer = Math.round(calc.duty * (share / 100) * 100) / 100;
  var seller = Math.round((calc.duty - buyer) * 100) / 100;

  var effectivePct = chargeable > 0 ? calc.duty / chargeable : 0;

  return {
    model: model,
    propertyType: propertyType,
    consideration: consideration,
    marketValue: marketValue,
    chargeable: chargeable,
    instrument: instrument,
    scale: scale,
    band: calc.band,
    bandIndex: calc.bandIndex,
    rawDuty: calc.raw,
    avd: calc.duty,
    bsd: bsdSsdNrsd,
    ssd: bsdSsdNrsd,
    nrsd: bsdSsdNrsd,
    dsmStatus: dsmStatus,
    total: calc.duty,
    effectivePct: effectivePct,
    buyerShare: share,
    buyer: buyer,
    seller: seller,
    warnings: warnings,
  };
}

export function summaryToCsv(result, labels) {
  var rows = [
    [labels.item, labels.amount],
    [labels.chargeable, String(result.chargeable)],
    [labels.avd, String(result.avd)],
    [labels.bsd, String(result.bsd)],
    [labels.ssd, String(result.ssd)],
    [labels.nrsd, String(result.nrsd)],
    [labels.total, String(result.total)],
    [labels.buyer, String(result.buyer)],
    [labels.seller, String(result.seller)],
  ];
  var body = rows
    .map(function (row) {
      return row
        .map(function (cell) {
          var s = String(cell);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        })
        .join(",");
    })
    .join("\n");
  return "\uFEFF" + body + "\n";
}

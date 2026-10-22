/**
 * Hong Kong domestic water + sewage estimator.
 * Formula and worked examples: WSD "Water & Sewage Tariff"
 * (Waterworks Regulations: a 4-month period is 121.64 days; each tier
 * is scaled by actual meter-reading days). Sewage: $2.92/m³ from 1 Apr 2017,
 * first 12 m³ of a 4-month period exempt (also scaled by days).
 * Figures checked against those pages as of 22 October 2026.
 * https://www.wsd.gov.hk/en/customer-services/manage-account-and-water-bills/water-sewage-tariff/
 * https://www.wsd.gov.hk/tc/customer-services/manage-account-and-water-bills/water-sewage-tariff/
 */

export const AS_OF = "2026-10-22";
export const FOUR_MONTH_DAYS = 121.64;
export const DOMESTIC_TIERS = [
  { id: "t1", volume: 12, rate: 0 },
  { id: "t2", volume: 31, rate: 4.16 },
  { id: "t3", volume: 19, rate: 6.45 },
  { id: "t4", volume: Infinity, rate: 9.05 },
];
export const SEWAGE_RATE = 2.92;
export const SEWAGE_FREE_M3 = 12;
export const TRADE_RATE = 4.58;
export const CONSTRUCTION_RATE = 7.11;
export const FLUSHING_FREE_M3 = 30;
export const FLUSHING_RATE = 4.58;
export const OVERDUE_RATE = 0.05;
export const SUPPLIES = ["domestic", "trade", "construction", "flushing"];

function finite(n, fallback) {
  var v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function nonNeg(n) {
  var v = finite(n, 0);
  return v < 0 ? 0 : v;
}

export function roundTo(n, digits) {
  var f = Math.pow(10, digits);
  return Math.round((finite(n, 0) + Number.EPSILON) * f) / f;
}

/** WSD published examples truncate each tier charge to the cent. */
export function moneyTrunc(n) {
  var v = finite(n, 0);
  if (v < 0) return -moneyTrunc(-v);
  return Math.floor(v * 100 + 1e-9) / 100;
}

export function moneyRound(n) {
  return roundTo(n, 2);
}

export function volume3(n) {
  return roundTo(n, 3);
}

export function daysFactor(days) {
  return roundTo(nonNeg(days) / FOUR_MONTH_DAYS, 5);
}

export function daysBetween(startIso, endIso) {
  var a = parseIsoDate(startIso);
  var b = parseIsoDate(endIso);
  if (!a || !b) return null;
  return Math.round((b - a) / 86400000);
}

function parseIsoDate(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  var t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (!Number.isFinite(t)) return null;
  return t;
}

export function emptyModel() {
  return {
    supply: "domestic",
    consumption: 66,
    days: 127,
    startDate: "1995-08-01",
    endDate: "1995-12-06",
    flats: 1,
    sewage: true,
    overdue: false,
  };
}

/** WSD Example 1: Mr Chan, 66 m³ over 127 days. Water $274.05. */
export function demoChan() {
  return {
    supply: "domestic",
    consumption: 66,
    days: 127,
    startDate: "1995-08-01",
    endDate: "1995-12-06",
    flats: 1,
    sewage: true,
    overdue: false,
  };
}

/** WSD Example 2: Mr Lee, 66 m³ over 117 days. Water $299.51. */
export function demoLee() {
  return {
    supply: "domestic",
    consumption: 66,
    days: 117,
    startDate: "1995-08-01",
    endDate: "1995-11-26",
    flats: 1,
    sewage: true,
    overdue: false,
  };
}

/** WSD trade example: 100 m³ × $4.58 = $458. */
export function demoTrade() {
  return {
    supply: "trade",
    consumption: 100,
    days: 122,
    startDate: "",
    endDate: "",
    flats: 1,
    sewage: true,
    overdue: false,
  };
}

export function formatHkd(n, digits) {
  var d = digits == null ? 2 : digits;
  var v = finite(n, 0);
  var abs = Math.abs(v).toLocaleString("en-HK", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  return (v < 0 ? "−" : "") + "HK$" + abs;
}

export function formatM3(n) {
  return volume3(n).toLocaleString("en-HK", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function allocateTiers(consumption, caps, rates) {
  var rem = volume3(consumption);
  var rows = [];
  for (var i = 0; i < caps.length; i++) {
    var cap = caps[i];
    var vol = cap === Infinity ? rem : volume3(Math.min(rem, cap));
    if (vol < 0) vol = 0;
    rem = volume3(rem - vol);
    if (rem < 0) rem = 0;
    var charge = moneyTrunc(vol * rates[i]);
    rows.push({
      volume: vol,
      cap: cap,
      rate: rates[i],
      charge: charge,
    });
  }
  return rows;
}

export function compute(input) {
  var model = Object.assign(emptyModel(), input || {});
  var warnings = [];
  var supply = SUPPLIES.indexOf(model.supply) >= 0 ? model.supply : "domestic";
  var consumption = nonNeg(model.consumption);
  var days = nonNeg(model.days);
  var flats = Math.max(1, Math.min(500, Math.round(finite(model.flats, 1) || 1)));
  var sewageOn = Boolean(model.sewage) && supply !== "flushing";
  var overdue = Boolean(model.overdue);
  var factor = daysFactor(days);

  if (consumption <= 0) warnings.push("zeroConsumption");
  if (days <= 0) warnings.push("zeroDays");
  if (days > 800) {
    days = 800;
    factor = daysFactor(days);
    warnings.push("daysCapped");
  }
  if (supply === "flushing") warnings.push("flushingNotIndividual");
  warnings.push("notWsdBill");
  if (sewageOn) warnings.push("sewageIfConnected");
  if (supply === "trade" || supply === "construction") warnings.push("noSmeConcession");
  if (supply === "trade") warnings.push("noTes");

  var waterRows = [];
  var waterCharge = 0;
  var sewageFree = 0;
  var sewageVolume = 0;
  var sewageCharge = 0;

  if (supply === "domestic") {
    var dCaps = [
      volume3(DOMESTIC_TIERS[0].volume * factor),
      volume3(DOMESTIC_TIERS[1].volume * factor),
      volume3(DOMESTIC_TIERS[2].volume * factor),
      Infinity,
    ];
    var dRates = DOMESTIC_TIERS.map(function (t) {
      return t.rate;
    });
    waterRows = allocateTiers(consumption, dCaps, dRates);
    waterCharge = moneyRound(
      waterRows.reduce(function (sum, row) {
        return sum + row.charge;
      }, 0),
    );
    sewageFree = dCaps[0];
  } else if (supply === "trade") {
    waterCharge = moneyTrunc(consumption * TRADE_RATE);
    waterRows = [{ volume: volume3(consumption), cap: Infinity, rate: TRADE_RATE, charge: waterCharge }];
    sewageFree = 0;
  } else if (supply === "construction") {
    waterCharge = moneyTrunc(consumption * CONSTRUCTION_RATE);
    waterRows = [{ volume: volume3(consumption), cap: Infinity, rate: CONSTRUCTION_RATE, charge: waterCharge }];
    sewageFree = 0;
  } else {
    var flushFree = volume3(FLUSHING_FREE_M3 * flats * factor);
    var flushVol = volume3(Math.max(0, consumption - flushFree));
    var flushCharge = moneyTrunc(flushVol * FLUSHING_RATE);
    waterRows = [
      { volume: volume3(Math.min(consumption, flushFree)), cap: flushFree, rate: 0, charge: 0 },
      { volume: flushVol, cap: Infinity, rate: FLUSHING_RATE, charge: flushCharge },
    ];
    waterCharge = flushCharge;
    sewageOn = false;
    sewageFree = 0;
  }

  if (sewageOn) {
    sewageVolume = volume3(Math.max(0, consumption - sewageFree));
    sewageCharge = moneyTrunc(sewageVolume * SEWAGE_RATE);
  }

  var subtotal = moneyRound(waterCharge + sewageCharge);
  var surcharge = overdue ? moneyTrunc(subtotal * OVERDUE_RATE) : 0;
  if (overdue) warnings.push("overdueSurcharge");
  var total = moneyRound(subtotal + surcharge);

  return {
    model: Object.assign({}, model, {
      supply: supply,
      consumption: consumption,
      days: days,
      flats: flats,
      sewage: sewageOn,
      overdue: overdue,
    }),
    supply: supply,
    consumption: consumption,
    days: days,
    flats: flats,
    factor: factor,
    waterRows: waterRows,
    waterCharge: waterCharge,
    sewageOn: sewageOn,
    sewageFree: sewageFree,
    sewageVolume: sewageVolume,
    sewageCharge: sewageCharge,
    subtotal: subtotal,
    overdue: overdue,
    surcharge: surcharge,
    total: total,
    warnings: warnings,
    ok: consumption > 0 && days > 0,
  };
}

export function summaryToCsv(result, labels) {
  var rows = [
    [labels.item, labels.amount],
    [labels.supply, result.supply],
    [labels.consumption, String(result.consumption)],
    [labels.days, String(result.days)],
    [labels.factor, String(result.factor)],
    [labels.water, String(result.waterCharge)],
    [labels.sewage, String(result.sewageCharge)],
    [labels.subtotal, String(result.subtotal)],
    [labels.surcharge, String(result.surcharge)],
    [labels.total, String(result.total)],
  ];
  (result.waterRows || []).forEach(function (row, i) {
    rows.push([labels.tier + " " + (i + 1), String(row.charge)]);
  });
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

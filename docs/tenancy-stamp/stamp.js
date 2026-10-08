/**
 * Hong Kong tenancy-agreement stamp duty (Cap. 117 Schedule 1).
 * Rates, rounding, term-counting and worked examples: IRD IRSD119
 * (Stamp Office, September 2024). Late-stamping scale: GovHK / IRSD119.
 * Key-money rate 4.25% when rent is also payable: IRSD119.
 * Figures checked against those pages as of 8 October 2026.
 * https://www.ird.gov.hk/eng/pdf/irsd119.pdf
 */

export const AS_OF = "2026-10-08";
export const SOURCE_LEAFLET = "IRSD119";
export const LEAFLET_DATE = "2024-09";
export const COUNTERPART_FEE = 5;
export const KEY_MONEY_RATE = 0.0425;
export const RENT_ROUND = 100;
export const STAMP_WITHIN_DAYS = 30;

export const RATES = {
  uncertain: 0.0025,
  upto1: 0.0025,
  over1: 0.005,
  over3: 0.01,
};

function finite(n, fallback) {
  var v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function nonNeg(n) {
  var v = finite(n, 0);
  return v < 0 ? 0 : v;
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

function toDate(ymd) {
  return new Date(ymd.y, ymd.mo - 1, ymd.d);
}

export function addDays(ymd, n) {
  var dt = toDate(ymd);
  dt.setDate(dt.getDate() + n);
  return { y: dt.getFullYear(), mo: dt.getMonth() + 1, d: dt.getDate() };
}

export function addYears(ymd, n) {
  var dt = toDate(ymd);
  dt.setFullYear(dt.getFullYear() + n);
  return { y: dt.getFullYear(), mo: dt.getMonth() + 1, d: dt.getDate() };
}

export function addMonths(ymd, n) {
  var dt = toDate(ymd);
  var day = ymd.d;
  dt.setDate(1);
  dt.setMonth(dt.getMonth() + n);
  var last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  dt.setDate(Math.min(day, last));
  return { y: dt.getFullYear(), mo: dt.getMonth() + 1, d: dt.getDate() };
}

export function cmpYmd(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  if (a.mo !== b.mo) return a.mo - b.mo;
  return a.d - b.d;
}

export function daysInclusive(a, b) {
  var ms = toDate(b).getTime() - toDate(a).getTime();
  return Math.round(ms / 86400000) + 1;
}

export function daysBetween(a, b) {
  var ms = toDate(b).getTime() - toDate(a).getTime();
  return Math.round(ms / 86400000);
}

/**
 * IRD IRSD119: both commencement and cessation dates count.
 * 1 Jan 2024–31 Dec 2024 = 1 year (does not exceed 1 year).
 * 1 Jan 2024–1 Jan 2025 = 1 year and 1 day (exceeds 1 year).
 */
export function termFromDates(start, end) {
  if (!start || !end || cmpYmd(end, start) < 0) return null;
  var years = 0;
  while (cmpYmd(addDays(addYears(start, years + 1), -1), end) <= 0) {
    years += 1;
    if (years > 200) break;
  }
  var endOfYears = years === 0 ? addDays(start, -1) : addDays(addYears(start, years), -1);
  var extraDays = cmpYmd(end, endOfYears) > 0 ? daysInclusive(addDays(endOfYears, 1), end) : 0;
  return { years: years, extraDays: extraDays };
}

export function termFromMonths(months) {
  var m = nonNeg(months);
  if (m === 0) return { years: 0, extraDays: 0, months: 0 };
  return {
    years: Math.floor(m / 12),
    extraDays: m % 12 === 0 ? 0 : Math.round((m % 12) * (365 / 12)),
    months: m,
  };
}

/** Whole calendar months in [start, end] if end is the last day of an N-month term. */
export function wholeMonths(start, end) {
  if (!start || !end || cmpYmd(end, start) < 0) return 0;
  var m = 0;
  while (cmpYmd(addDays(addMonths(start, m + 1), -1), end) <= 0) {
    m += 1;
    if (m > 2400) break;
  }
  return m;
}

export function rateBand(years, extraDays) {
  if (years > 3 || (years === 3 && extraDays > 0)) return "over3";
  if (years > 1 || (years === 1 && extraDays > 0)) return "over1";
  return "upto1";
}

export function yearFraction(years, extraDays) {
  return years + extraDays / 365;
}

export function roundUpToNearest(amount, step) {
  var n = nonNeg(amount);
  if (n === 0) return 0;
  return Math.ceil(n / step - 1e-12) * step;
}

export function roundRentBase(amount) {
  return roundUpToNearest(amount, RENT_ROUND);
}

export function roundDuty(amount) {
  return roundUpToNearest(amount, 1);
}

export function emptyModel() {
  return {
    termMode: "months",
    termMonths: 24,
    startDate: "2026-09-01",
    endDate: "2028-08-31",
    monthlyRent: 10000,
    rentFreeMonths: 2,
    rent2Months: 0,
    monthlyRent2: 0,
    counterparts: 1,
    keyMoney: 0,
    deposit: 20000,
    landlordShare: 50,
    signedDate: "2026-07-02",
    stampDate: "2026-07-20",
    uncertainYearly: 0,
  };
}

export function demoRentFree() {
  // IRSD119 Example 9 (updated year labels only; same arithmetic).
  return {
    termMode: "months",
    termMonths: 24,
    startDate: "2024-09-01",
    endDate: "2026-08-31",
    monthlyRent: 10000,
    rentFreeMonths: 2,
    rent2Months: 0,
    monthlyRent2: 0,
    counterparts: 1,
    keyMoney: 0,
    deposit: 20000,
    landlordShare: 50,
    signedDate: "2024-07-02",
    stampDate: "2024-07-20",
    uncertainYearly: 0,
  };
}

export function demoShort() {
  // IRSD119 Example 6.
  return {
    termMode: "months",
    termMonths: 8,
    startDate: "2024-07-01",
    endDate: "2025-02-28",
    monthlyRent: 5000,
    rentFreeMonths: 0,
    rent2Months: 0,
    monthlyRent2: 0,
    counterparts: 0,
    keyMoney: 0,
    deposit: 10000,
    landlordShare: 50,
    signedDate: "2024-07-01",
    stampDate: "2024-07-15",
    uncertainYearly: 0,
  };
}

export function demoOverOneYear() {
  // IRSD119 Examples 1–2: same calendar year vs +1 day.
  return {
    termMode: "dates",
    termMonths: 12,
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    monthlyRent: 10000,
    rentFreeMonths: 0,
    rent2Months: 0,
    monthlyRent2: 0,
    counterparts: 0,
    keyMoney: 0,
    deposit: 0,
    landlordShare: 50,
    signedDate: "2023-12-15",
    stampDate: "2024-01-05",
    uncertainYearly: 0,
  };
}

function rentTotalFromMonths(model, termMonths) {
  var second = Math.min(nonNeg(model.rent2Months), termMonths);
  var first = Math.max(0, termMonths - second);
  var free = Math.min(nonNeg(model.rentFreeMonths), termMonths);
  var rent1 = nonNeg(model.monthlyRent);
  var rent2 = nonNeg(model.monthlyRent2) || rent1;
  // Apply rent-free months to the earliest paid months (first period first).
  var paidFirst = Math.max(0, first - free);
  var leftoverFree = Math.max(0, free - first);
  var paidSecond = Math.max(0, second - leftoverFree);
  return paidFirst * rent1 + paidSecond * rent2;
}

export function latePenaltyTimes(signed, stamped) {
  if (!signed || !stamped) {
    return { times: 0, delayDays: 0, deadline: null, onTime: true, band: "ontime" };
  }
  var deadline = addDays(signed, STAMP_WITHIN_DAYS);
  var delayDays = daysBetween(deadline, stamped);
  if (delayDays <= 0) {
    return { times: 0, delayDays: 0, deadline: deadline, onTime: true, band: "ontime" };
  }
  var oneMonth = addMonths(deadline, 1);
  var twoMonths = addMonths(deadline, 2);
  if (cmpYmd(stamped, oneMonth) <= 0) {
    return { times: 2, delayDays: delayDays, deadline: deadline, onTime: false, band: "1m" };
  }
  if (cmpYmd(stamped, twoMonths) <= 0) {
    return { times: 4, delayDays: delayDays, deadline: deadline, onTime: false, band: "2m" };
  }
  return { times: 10, delayDays: delayDays, deadline: deadline, onTime: false, band: "over" };
}

/**
 * GovHK typical voluntary-disclosure remission (not a guarantee):
 * 14% × duty × days delayed / 365, minimum $500.
 * Last reviewed on GovHK August 2025; cited as of 8 October 2026.
 */
export function voluntaryDisclosurePenalty(duty, delayDays) {
  if (delayDays <= 0 || duty <= 0) return 0;
  return Math.max(500, (0.14 * duty * delayDays) / 365);
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
  var termMode = model.termMode || "months";
  var start = parseYmd(model.startDate);
  var end = parseYmd(model.endDate);
  var signed = parseYmd(model.signedDate);
  var stamped = parseYmd(model.stampDate);

  var term = null;
  var termMonths = nonNeg(model.termMonths);
  var totalRent = 0;
  var band = "upto1";
  var fraction = 0;

  if (termMode === "uncertain") {
    band = "uncertain";
    totalRent = 0;
    fraction = 1;
    term = { years: 0, extraDays: 0 };
  } else if (termMode === "dates") {
    term = termFromDates(start, end);
    if (!term) {
      warnings.push("badDates");
      return emptyResult(model, warnings);
    }
    band = rateBand(term.years, term.extraDays);
    fraction = yearFraction(term.years, term.extraDays);
    if (term.years === 0 && term.extraDays === 0) {
      warnings.push("zeroTerm");
      return emptyResult(model, warnings);
    }
    termMonths = wholeMonths(start, end);
    if (termMonths <= 0) termMonths = Math.max(1, Math.round(daysInclusive(start, end) / (365 / 12)));
    totalRent = rentTotalFromMonths(model, termMonths);
  } else {
    term = termFromMonths(termMonths);
    if (termMonths <= 0) {
      warnings.push("zeroTerm");
      return emptyResult(model, warnings);
    }
    if (termMonths <= 12) band = "upto1";
    else if (termMonths <= 36) band = "over1";
    else band = "over3";
    fraction = termMonths / 12;
    totalRent = rentTotalFromMonths(model, termMonths);
  }

  if (nonNeg(model.deposit) > 0) warnings.push("depositIgnored");
  if (nonNeg(model.rentFreeMonths) > 0) warnings.push("rentFreeCounts");
  if (band === "over1" && termMode === "dates" && term && term.years === 1 && term.extraDays > 0) {
    warnings.push("oneYearAndADay");
  }
  if (termMode === "dates" && start && end) {
    var exactYearEnd = addDays(addYears(start, 1), -1);
    if (cmpYmd(end, exactYearEnd) === 0) warnings.push("exactOneYear");
  }

  var rate = RATES[band];
  var rawBase;
  if (termMode === "uncertain") {
    rawBase = nonNeg(model.uncertainYearly);
  } else if (band === "upto1") {
    rawBase = totalRent;
  } else {
    rawBase = fraction > 0 ? totalRent / fraction : 0;
  }
  var rentBase = roundRentBase(rawBase);
  var rentDuty = roundDuty(rentBase * rate);
  var keyMoney = nonNeg(model.keyMoney);
  var keyDuty = 0;
  if (keyMoney > 0) {
    if (totalRent > 0 || termMode === "uncertain") {
      keyDuty = roundDuty(keyMoney * KEY_MONEY_RATE);
    } else {
      warnings.push("keyMoneyNoRent");
    }
  }
  var counterparts = Math.floor(nonNeg(model.counterparts));
  var counterpartDuty = counterparts * COUNTERPART_FEE;
  var duty = rentDuty + keyDuty + counterpartDuty;

  var late = latePenaltyTimes(signed, stamped);
  var penalty = late.times * duty;
  var reduced = late.onTime ? 0 : voluntaryDisclosurePenalty(duty, late.delayDays);
  var total = duty + penalty;
  var share = Math.min(100, Math.max(0, finite(model.landlordShare, 50)));
  var landlord = Math.round(duty * (share / 100) * 100) / 100;
  var tenant = Math.round((duty - landlord) * 100) / 100;

  if (!late.onTime) warnings.push("lateStamp");

  return {
    model: model,
    termMode: termMode,
    term: term,
    termMonths: termMonths,
    band: band,
    rate: rate,
    fraction: fraction,
    totalRent: totalRent,
    rawBase: rawBase,
    rentBase: rentBase,
    rentDuty: rentDuty,
    keyMoney: keyMoney,
    keyDuty: keyDuty,
    counterparts: counterparts,
    counterpartDuty: counterpartDuty,
    duty: duty,
    late: late,
    penalty: penalty,
    reducedPenalty: Math.round(reduced * 100) / 100,
    totalWithPenalty: total,
    landlordShare: share,
    landlord: landlord,
    tenant: tenant,
    warnings: warnings,
    start: start,
    end: end,
    signed: signed,
    stamped: stamped,
  };
}

function emptyResult(model, warnings) {
  return {
    model: model,
    termMode: model.termMode,
    term: null,
    termMonths: 0,
    band: "upto1",
    rate: RATES.upto1,
    fraction: 0,
    totalRent: 0,
    rawBase: 0,
    rentBase: 0,
    rentDuty: 0,
    keyMoney: 0,
    keyDuty: 0,
    counterparts: 0,
    counterpartDuty: 0,
    duty: 0,
    late: { times: 0, delayDays: 0, deadline: null, onTime: true, band: "ontime" },
    penalty: 0,
    reducedPenalty: 0,
    totalWithPenalty: 0,
    landlordShare: finite(model.landlordShare, 50),
    landlord: 0,
    tenant: 0,
    warnings: warnings,
    start: parseYmd(model.startDate),
    end: parseYmd(model.endDate),
    signed: parseYmd(model.signedDate),
    stamped: parseYmd(model.stampDate),
  };
}

export function summaryToCsv(result, labels) {
  var rows = [
    [labels.item, labels.amount],
    [labels.totalRent, String(result.totalRent)],
    [labels.rentBase, String(result.rentBase)],
    [labels.rentDuty, String(result.rentDuty)],
    [labels.keyDuty, String(result.keyDuty)],
    [labels.counterpartDuty, String(result.counterpartDuty)],
    [labels.duty, String(result.duty)],
    [labels.penalty, String(result.penalty)],
    [labels.total, String(result.totalWithPenalty)],
    [labels.landlord, String(result.landlord)],
    [labels.tenant, String(result.tenant)],
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

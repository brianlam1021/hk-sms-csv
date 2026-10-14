/**
 * Hong Kong Property Tax (Cap. 112 s.5 / s.5B) estimator.
 * Formula and worked examples: GovHK "How Property Tax is Computed"
 * and IRD FAQ on Property Tax returns (BIR57).
 * Standard rate 15% for years of assessment 2020/21–2026/27 (IRD BIR57 notes).
 * Figures checked against those pages as of 14 October 2026.
 * https://www.gov.hk/en/residents/taxes/property/propertycompute.htm
 * https://www.ird.gov.hk/eng/faq/pty.htm
 */

export const AS_OF = "2026-10-14";
export const STANDARD_RATE = 0.15;
export const REPAIRS_ALLOWANCE = 0.2;
export const HOLDOVER_RATIO = 0.9;
export const FIRST_INSTALMENT_SHARE = 7 / 12;
export const SECOND_INSTALMENT_SHARE = 5 / 12;
export const RATE_YEARS = ["2025/26", "2026/27"];

function finite(n, fallback) {
  var v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function nonNeg(n) {
  var v = finite(n, 0);
  return v < 0 ? 0 : v;
}

function money(n) {
  return Math.round((finite(n, 0) + Number.EPSILON) * 100) / 100;
}

export function nextYearOfAssessment(year) {
  var m = /^(\d{4})\/(\d{2})$/.exec(String(year || "").trim());
  if (!m) return "";
  var start = Number(m[1]) + 1;
  return String(start) + "/" + String((start + 1) % 100).padStart(2, "0");
}

export function emptyModel() {
  return {
    yearOfAssessment: "2025/26",
    monthlyRent: 10000,
    monthsLet: 12,
    otherConsideration: 0,
    irrecoverableRent: 0,
    ownerPaidRates: 0,
    expectedNextAv: 0,
    ownerShare: 100,
  };
}

/** GovHK Example 1: $10,000/month, tenant paid rates, full year. */
export function demoFullYear() {
  return {
    yearOfAssessment: "2025/26",
    monthlyRent: 10000,
    monthsLet: 12,
    otherConsideration: 0,
    irrecoverableRent: 0,
    ownerPaidRates: 0,
    expectedNextAv: 0,
    ownerShare: 100,
  };
}

/** GovHK Example 2: let 1 July, $30,000/month, owner-paid rates $12,000. */
export function demoMidYear() {
  return {
    yearOfAssessment: "2025/26",
    monthlyRent: 30000,
    monthsLet: 9,
    otherConsideration: 0,
    irrecoverableRent: 0,
    ownerPaidRates: 12000,
    expectedNextAv: 0,
    ownerShare: 100,
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
  var year = RATE_YEARS.indexOf(model.yearOfAssessment) >= 0 ? model.yearOfAssessment : "2025/26";
  var monthsLet = nonNeg(model.monthsLet);
  var monthlyRent = nonNeg(model.monthlyRent);
  var other = nonNeg(model.otherConsideration);
  var irrecoverable = nonNeg(model.irrecoverableRent);
  var rates = nonNeg(model.ownerPaidRates);
  var share = Math.min(100, Math.max(0, finite(model.ownerShare, 100)));
  var expectedNextAv = nonNeg(model.expectedNextAv);

  if (monthsLet <= 0) warnings.push("zeroMonths");
  if (monthsLet > 12) {
    monthsLet = 12;
    warnings.push("monthsCapped");
  }
  if (monthlyRent <= 0 && other <= 0) warnings.push("zeroRent");
  if (irrecoverable > 0) warnings.push("irrecoverableDeposit");
  if (rates > 0) warnings.push("ratesNotRent");
  warnings.push("noMortgageDeduct");
  warnings.push("notPersonalAssessment");

  var rentalIncome = money(monthlyRent * monthsLet);
  var consideration = money(rentalIncome + other);
  var assessableValue = money(consideration - irrecoverable);
  if (assessableValue < 0) {
    assessableValue = 0;
    warnings.push("irrecoverableExceeds");
  }
  var afterRates = money(assessableValue - rates);
  if (afterRates < 0) {
    afterRates = 0;
    warnings.push("ratesExceed");
  }
  var allowance = money(afterRates * REPAIRS_ALLOWANCE);
  var nav = money(afterRates - allowance);
  var tax = money(nav * STANDARD_RATE);

  var fullYearFactor = monthsLet > 0 && monthsLet < 12 ? 12 / monthsLet : 1;
  var estimatedAv = money(assessableValue * fullYearFactor);
  var estimatedNav = money(nav * fullYearFactor);
  var provisionalTax = money(estimatedNav * STANDARD_RATE);
  if (monthsLet > 0 && monthsLet < 12) warnings.push("partialYear");

  var firstInstalment = money(tax + provisionalTax * FIRST_INSTALMENT_SHARE);
  var secondInstalment = money(provisionalTax * SECOND_INSTALMENT_SHARE);
  var totalPayable = money(tax + provisionalTax);

  var holdoverThreshold = money(estimatedAv * HOLDOVER_RATIO);
  var holdoverLikely = expectedNextAv > 0 && expectedNextAv < holdoverThreshold;
  if (holdoverLikely) warnings.push("holdoverLikely");

  var ownerTax = money(tax * (share / 100));
  var otherOwnersTax = money(tax - ownerTax);

  return {
    model: Object.assign({}, model, {
      yearOfAssessment: year,
      monthlyRent: monthlyRent,
      monthsLet: monthsLet,
      otherConsideration: other,
      irrecoverableRent: irrecoverable,
      ownerPaidRates: rates,
      expectedNextAv: expectedNextAv,
      ownerShare: share,
    }),
    yearOfAssessment: year,
    nextYear: nextYearOfAssessment(year),
    rate: STANDARD_RATE,
    monthsLet: monthsLet,
    rentalIncome: rentalIncome,
    otherConsideration: other,
    consideration: consideration,
    irrecoverableRent: irrecoverable,
    assessableValue: assessableValue,
    ownerPaidRates: rates,
    afterRates: afterRates,
    allowance: allowance,
    nav: nav,
    tax: tax,
    estimatedAv: estimatedAv,
    estimatedNav: estimatedNav,
    provisionalTax: provisionalTax,
    firstInstalment: firstInstalment,
    secondInstalment: secondInstalment,
    totalPayable: totalPayable,
    holdoverThreshold: holdoverThreshold,
    holdoverLikely: holdoverLikely,
    ownerShare: share,
    ownerTax: ownerTax,
    otherOwnersTax: otherOwnersTax,
    warnings: warnings,
    ok: monthsLet > 0 && (monthlyRent > 0 || other > 0),
  };
}

export function summaryToCsv(result, labels) {
  var rows = [
    [labels.item, labels.amount],
    [labels.year, result.yearOfAssessment],
    [labels.nextYear, result.nextYear],
    [labels.rentalIncome, String(result.rentalIncome)],
    [labels.other, String(result.otherConsideration)],
    [labels.irrecoverable, String(result.irrecoverableRent)],
    [labels.assessableValue, String(result.assessableValue)],
    [labels.rates, String(result.ownerPaidRates)],
    [labels.allowance, String(result.allowance)],
    [labels.nav, String(result.nav)],
    [labels.tax, String(result.tax)],
    [labels.provisional, String(result.provisionalTax)],
    [labels.total, String(result.totalPayable)],
    [labels.first, String(result.firstInstalment)],
    [labels.second, String(result.secondInstalment)],
    [labels.holdover, String(result.holdoverThreshold)],
    [labels.owner, String(result.ownerTax)],
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

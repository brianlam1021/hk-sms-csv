/**
 * Hong Kong Salaries Tax (Cap. 112) estimator.
 * Charge the lower of: progressive rates on net chargeable income, or
 * two-tiered standard rates on net income (before allowances). Then apply
 * the one-off tax reduction to final tax (not a tax return).
 *
 * Sources checked 17 October 2026:
 *   GovHK “Tax Rates of Salaries Tax & Personal Assessment”
 *   GovHK “Amount of Allowance”
 *   IRD PAM 61 “Allowances, Deductions and Tax Rate Table” (August 2026)
 *   IRD FAQ on 2026-27 Budget tax measures
 *   IRD “A guide to Salaries Tax (1)” worked example (2025/26)
 *
 * Progressive (2020/21 onwards until superseded):
 *   first $50,000 2%; next $50,000 6%; next $50,000 10%;
 *   next $50,000 14%; remainder 17%.
 * Two-tiered standard rates (2024/25 onwards):
 *   first $5,000,000 of net income 15%; remainder 16%.
 * Net income = assessable income − deductions (mandatory MPF, cap $18,000).
 * Net chargeable income = net income − allowances.
 * Married person’s allowance replaces basic allowance (not stacked).
 * Dependent parent living with the taxpayer the whole year also gets the
 * additional dependent-parent allowance.
 *
 * Estimate only — not an IRD tool, not a tax return, not tax advice.
 * https://www.gov.hk/en/residents/taxes/taxfiling/taxrates/salariesrates.htm
 * https://www.gov.hk/en/residents/taxes/salaries/allowances/allowances/7years.htm
 * https://www.ird.gov.hk/eng/pdf/pam61e.pdf
 */

export const AS_OF = "2026-10-17";
export const MPF_CAP = 18000;
export const STANDARD_TIER = 5000000;
export const STANDARD_LOW = 0.15;
export const STANDARD_HIGH = 0.16;
export const RATE_YEARS = ["2024/25", "2025/26", "2026/27"];
export const MAX_CHILDREN = 9;
export const MAX_PARENTS = 8;
export const PROGRESSIVE_TOP_RATE = 0.17;
export const PROGRESSIVE_AFTER = 200000;
export const PROGRESSIVE_AFTER_TAX = 16000;

export const PROGRESSIVE_BANDS = [
  { size: 50000, rate: 0.02 },
  { size: 50000, rate: 0.06 },
  { size: 50000, rate: 0.1 },
  { size: 50000, rate: 0.14 },
];

export const YEAR_TABLE = {
  "2024/25": {
    basic: 132000,
    married: 264000,
    child: 130000,
    parent60: 50000,
    parent60Add: 50000,
    parent55: 25000,
    parent55Add: 25000,
    reductionCap: 1500,
  },
  "2025/26": {
    basic: 132000,
    married: 264000,
    child: 130000,
    parent60: 50000,
    parent60Add: 50000,
    parent55: 25000,
    parent55Add: 25000,
    reductionCap: 3000,
  },
  "2026/27": {
    basic: 145000,
    married: 290000,
    child: 140000,
    parent60: 55000,
    parent60Add: 55000,
    parent55: 27500,
    parent55Add: 27500,
    reductionCap: 0,
  },
};

function finite(n, fallback) {
  var v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function money(n) {
  return Math.round((finite(n, 0) + Number.EPSILON) * 100) / 100;
}

export function formatMoney(amount, digits) {
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 2 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + "HK$" + parts.join(".");
}

export function formatNum(amount, digits) {
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 2 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + parts.join(".");
}

export function formatPct(rate) {
  var n = finite(rate, 0) * 100;
  var text = n.toFixed(2).replace(/\.?0+$/, "");
  return text + "%";
}

export function yearTable(year) {
  return YEAR_TABLE[year] || YEAR_TABLE["2025/26"];
}

export function emptySettings() {
  return {
    yearOfAssessment: "2025/26",
    income: 360000,
    mpf: 18000,
    married: false,
    children: 0,
    parents60: 0,
    parents60Live: 0,
    parents55: 0,
    parents55Live: 0,
  };
}

/** IRD “A guide to Salaries Tax (1)” 2025/26 example: $40,000 × 6 months. */
export function demoIrdGuide() {
  return {
    yearOfAssessment: "2025/26",
    income: 240000,
    mpf: 9000,
    married: false,
    children: 0,
    parents60: 0,
    parents60Live: 0,
    parents55: 0,
    parents55Live: 0,
  };
}

/** Typical monthly $30,000 employee, mandatory MPF at the $18,000 cap. */
export function demoTypical() {
  return emptySettings();
}

/** Married + 1 child, $50,000/month. */
export function demoMarriedChild() {
  return {
    yearOfAssessment: "2025/26",
    income: 600000,
    mpf: 18000,
    married: true,
    children: 1,
    parents60: 0,
    parents60Live: 0,
    parents55: 0,
    parents55Live: 0,
  };
}

/** High income where two-tiered standard rates beat progressive. */
export function demoStandardRate() {
  return {
    yearOfAssessment: "2025/26",
    income: 2500000,
    mpf: 18000,
    married: false,
    children: 0,
    parents60: 0,
    parents60Live: 0,
    parents55: 0,
    parents55Live: 0,
  };
}

export function clampCount(n, max) {
  var v = Math.floor(finite(n, 0));
  if (v < 0) return 0;
  if (v > max) return max;
  return v;
}

export function progressiveTax(nci) {
  var remaining = money(Math.max(0, finite(nci, 0)));
  var tax = 0;
  var bands = [];
  var i;
  for (i = 0; i < PROGRESSIVE_BANDS.length; i++) {
    var b = PROGRESSIVE_BANDS[i];
    var slice = money(Math.min(remaining, b.size));
    if (slice <= 0) break;
    var sliceTax = money(slice * b.rate);
    bands.push({ size: slice, rate: b.rate, tax: sliceTax });
    tax = money(tax + sliceTax);
    remaining = money(remaining - slice);
  }
  if (remaining > 0) {
    var topTax = money(remaining * PROGRESSIVE_TOP_RATE);
    bands.push({ size: remaining, rate: PROGRESSIVE_TOP_RATE, tax: topTax });
    tax = money(tax + topTax);
  }
  return { tax: tax, bands: bands };
}

export function standardTaxOn(netIncome) {
  var n = money(Math.max(0, finite(netIncome, 0)));
  var band1 = money(Math.min(n, STANDARD_TIER));
  var band2 = money(Math.max(0, n - STANDARD_TIER));
  var tax = money(band1 * STANDARD_LOW + band2 * STANDARD_HIGH);
  return { tax: tax, band1: band1, band2: band2 };
}

export function allowancesFrom(settings, table) {
  var married = !!(settings && settings.married);
  var personal = married ? table.married : table.basic;
  var children = clampCount(settings && settings.children, MAX_CHILDREN);
  var parents60 = clampCount(settings && settings.parents60, MAX_PARENTS);
  var parents60Live = clampCount(settings && settings.parents60Live, MAX_PARENTS);
  var parents55 = clampCount(settings && settings.parents55, MAX_PARENTS);
  var parents55Live = clampCount(settings && settings.parents55Live, MAX_PARENTS);
  var childAllow = money(children * table.child);
  var parentAllow = money(
    parents60 * table.parent60 +
      parents60Live * (table.parent60 + table.parent60Add) +
      parents55 * table.parent55 +
      parents55Live * (table.parent55 + table.parent55Add)
  );
  return {
    married: married,
    personal: personal,
    children: children,
    child: childAllow,
    parents60: parents60,
    parents60Live: parents60Live,
    parents55: parents55,
    parents55Live: parents55Live,
    parent: parentAllow,
    total: money(personal + childAllow + parentAllow),
  };
}

/**
 * Estimate salaries tax for one taxpayer (separate assessment).
 * Does not model joint assessment, Personal Assessment, additional child
 * allowance in the year of birth, single-parent allowance, or deductions
 * other than mandatory MPF (capped).
 */
export function compute(settings) {
  var year =
    settings && RATE_YEARS.indexOf(settings.yearOfAssessment) >= 0
      ? settings.yearOfAssessment
      : "2025/26";
  var table = yearTable(year);
  var warnings = [];
  var incomeRaw = settings && settings.income;
  var incomeNum = Number(incomeRaw);
  var mpfRaw = settings && settings.mpf;
  var mpfNum = Number(mpfRaw);

  if (incomeRaw === "" || incomeRaw == null || !Number.isFinite(incomeNum)) {
    warnings.push("noIncome");
  } else if (incomeNum < 0) {
    warnings.push("negIncome");
  }
  if (mpfRaw !== "" && mpfRaw != null && Number.isFinite(mpfNum) && mpfNum < 0) {
    warnings.push("negMpf");
  }

  var childrenRaw = finite(settings && settings.children, 0);
  var parentsOver =
    finite(settings && settings.parents60, 0) > MAX_PARENTS ||
    finite(settings && settings.parents60Live, 0) > MAX_PARENTS ||
    finite(settings && settings.parents55, 0) > MAX_PARENTS ||
    finite(settings && settings.parents55Live, 0) > MAX_PARENTS;
  if (childrenRaw > MAX_CHILDREN) warnings.push("childrenCapped");
  if (parentsOver) warnings.push("parentsCapped");

  var ok =
    warnings.indexOf("noIncome") === -1 &&
    warnings.indexOf("negIncome") === -1 &&
    warnings.indexOf("negMpf") === -1;

  var income = ok ? money(Math.max(0, incomeNum)) : 0;
  var mpfEntered = ok && Number.isFinite(mpfNum) && mpfNum > 0 ? money(mpfNum) : 0;
  var mpf = money(Math.min(mpfEntered, MPF_CAP));
  if (ok && mpfEntered > MPF_CAP) warnings.push("mpfCapped");

  var netIncome = ok ? money(Math.max(0, income - mpf)) : 0;
  var allow = allowancesFrom(settings, table);
  var nci = ok ? money(Math.max(0, netIncome - allow.total)) : 0;

  var prog = progressiveTax(nci);
  var std = standardTaxOn(netIncome);
  var basis = prog.tax <= std.tax ? "progressive" : "standard";
  var taxBeforeReduction = basis === "progressive" ? prog.tax : std.tax;
  var reduction =
    table.reductionCap > 0 ? money(Math.min(taxBeforeReduction, table.reductionCap)) : 0;
  var finalTax = money(taxBeforeReduction - reduction);

  if (ok && income === 0) warnings.push("zeroIncome");
  if (ok && nci === 0 && income > 0) warnings.push("coveredByAllowances");
  if (ok && allow.married) warnings.push("marriedReplacesBasic");
  if (ok && basis === "standard") warnings.push("usedStandard");
  if (ok && basis === "progressive") warnings.push("usedProgressive");
  if (ok && reduction > 0) warnings.push("reductionFinalOnly");
  if (ok && year === "2026/27") warnings.push("noReduction2027");
  warnings.push("notJointAssessment");
  warnings.push("notPersonalAssessment");
  warnings.push("otherDeductions");
  warnings.push("notTaxReturn");

  return {
    ok: ok,
    warnings: warnings,
    yearOfAssessment: year,
    table: table,
    income: income,
    mpfEntered: mpfEntered,
    mpf: mpf,
    mpfCap: MPF_CAP,
    netIncome: netIncome,
    allowances: allow,
    netChargeableIncome: nci,
    progressiveTax: prog.tax,
    progressiveBands: prog.bands,
    standardTax: std.tax,
    standardBand1: std.band1,
    standardBand2: std.band2,
    basis: basis,
    taxBeforeReduction: taxBeforeReduction,
    reductionCap: table.reductionCap,
    reduction: reduction,
    finalTax: finalTax,
  };
}

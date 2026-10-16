/**
 * Hong Kong Profits Tax (Cap. 112) two-tier estimator.
 * Rates: IRD “Profits Tax”, IRD FAQ on the two-tiered rates regime,
 * and GovHK “Tax Rates of Profits Tax”, checked 16 October 2026.
 * Corporations: 8.25% on first $2,000,000 / 16.5% remainder (2018/19 onwards).
 * Unincorporated: 7.5% / 15%. Only one connected entity may use two-tier.
 * One-off reduction applies to the final assessment only, not provisional tax:
 *   2024/25 100% cap $1,500; 2025/26 100% cap $3,000 (gazetted 22 May 2026);
 *   2026/27 none announced.
 * IRD’s Tax Calculator is salaries tax / Personal Assessment — no official
 * interactive profits-tax calculator. IRD publishes rate tables and IR957 PDF.
 * https://www.ird.gov.hk/eng/tax/bus_pft.htm
 * https://www.ird.gov.hk/eng/faq/2tr.htm
 * https://www.gov.hk/en/residents/taxes/taxfiling/taxrates/profitsrates.htm
 * Estimate only — not an IRD tool.
 */

export const AS_OF = "2026-10-16";
export const TIER_THRESHOLD = 2000000;
export const CORP_LOW = 0.0825;
export const CORP_HIGH = 0.165;
export const UNC_LOW = 0.075;
export const UNC_HIGH = 0.15;
export const HOLDOVER_RATIO = 0.9;
export const FIRST_INSTALMENT_SHARE = 0.75;
export const SECOND_INSTALMENT_SHARE = 0.25;
export const RATE_YEARS = ["2024/25", "2025/26", "2026/27"];

/** One-off 100% profits-tax reduction ceiling by year of assessment. */
export const REDUCTION_CAP = {
  "2024/25": 1500,
  "2025/26": 3000,
  "2026/27": 0,
};

var ENTITIES = {
  corporation: true,
  unincorporated: true,
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

export function nextYearOfAssessment(year) {
  var m = /^(\d{4})\/(\d{2})$/.exec(String(year || "").trim());
  if (!m) return "";
  var start = Number(m[1]) + 1;
  return String(start) + "/" + String((start + 1) % 100).padStart(2, "0");
}

export function reductionCapFor(year) {
  var cap = REDUCTION_CAP[year];
  return cap == null ? 0 : cap;
}

export function ratesFor(entity) {
  if (entity === "unincorporated") {
    return { low: UNC_LOW, high: UNC_HIGH };
  }
  return { low: CORP_LOW, high: CORP_HIGH };
}

export function emptySettings() {
  return {
    yearOfAssessment: "2025/26",
    entity: "corporation",
    twoTier: true,
    assessableProfits: 800000,
    lossBroughtForward: 0,
    expectedNextProfits: 0,
  };
}

/** Typical SME corporation under two-tier, 2025/26 reduction $3,000. */
export function demoSmeCorp() {
  return emptySettings();
}

/** Over the $2,000,000 band: remainder at the full rate. */
export function demoOverCap() {
  return {
    yearOfAssessment: "2025/26",
    entity: "corporation",
    twoTier: true,
    assessableProfits: 3000000,
    lossBroughtForward: 0,
    expectedNextProfits: 0,
  };
}

/** Connected entity not nominated: whole profit at 16.5%. */
export function demoStandard() {
  return {
    yearOfAssessment: "2025/26",
    entity: "corporation",
    twoTier: false,
    assessableProfits: 800000,
    lossBroughtForward: 0,
    expectedNextProfits: 0,
  };
}

/**
 * Tax on net assessable profits. Reduction is applied only when
 * applyReduction is true (final assessment). Provisional tax uses
 * the same rates with applyReduction false.
 */
export function taxOn(netProfits, entity, twoTier, year, applyReduction) {
  var rates = ratesFor(entity);
  var profits = money(Math.max(0, finite(netProfits, 0)));
  var band1 = 0;
  var band2 = 0;
  var tax = 0;
  if (twoTier) {
    band1 = money(Math.min(profits, TIER_THRESHOLD));
    band2 = money(Math.max(0, profits - TIER_THRESHOLD));
    tax = money(band1 * rates.low + band2 * rates.high);
  } else {
    band2 = profits;
    tax = money(profits * rates.high);
  }
  var standardTax = money(profits * rates.high);
  var twoTierSaving = money(Math.max(0, standardTax - tax));
  var cap = applyReduction ? reductionCapFor(year) : 0;
  var reduction = cap > 0 ? money(Math.min(tax, cap)) : 0;
  var finalTax = money(tax - reduction);
  return {
    netProfits: profits,
    band1: band1,
    band2: band2,
    lowRate: twoTier ? rates.low : rates.high,
    highRate: rates.high,
    taxBeforeReduction: tax,
    reductionCap: cap,
    reduction: reduction,
    finalTax: finalTax,
    standardTax: standardTax,
    twoTierSaving: twoTierSaving,
  };
}

/**
 * Estimate this year’s profits tax, next year’s provisional tax,
 * two demand-note instalments, and the 90% holdover threshold.
 */
export function compute(settings) {
  var year =
    settings && RATE_YEARS.indexOf(settings.yearOfAssessment) >= 0
      ? settings.yearOfAssessment
      : "2025/26";
  var entity =
    settings && ENTITIES[settings.entity] ? settings.entity : "corporation";
  var twoTier = !(settings && settings.twoTier === false);
  var profitsRaw = settings && settings.assessableProfits;
  var profitsNum = Number(profitsRaw);
  var lossRaw = settings && settings.lossBroughtForward;
  var lossNum = Number(lossRaw);
  var expectedNum = Number(settings && settings.expectedNextProfits);
  var warnings = [];

  if (profitsRaw === "" || profitsRaw == null || !Number.isFinite(profitsNum)) {
    warnings.push("noProfits");
  } else if (profitsNum < 0) {
    warnings.push("negProfits");
  }
  if (lossRaw !== "" && lossRaw != null && Number.isFinite(lossNum) && lossNum < 0) {
    warnings.push("negLoss");
  }
  if (Number.isFinite(expectedNum) && expectedNum < 0) {
    warnings.push("negExpected");
  }

  var ok =
    warnings.indexOf("noProfits") === -1 &&
    warnings.indexOf("negProfits") === -1 &&
    warnings.indexOf("negLoss") === -1;

  var assessable = ok ? money(Math.max(0, profitsNum)) : 0;
  var loss = ok && Number.isFinite(lossNum) && lossNum > 0 ? money(lossNum) : 0;
  var net = ok ? money(Math.max(0, assessable - loss)) : 0;
  var unusedLoss = ok ? money(Math.max(0, loss - assessable)) : 0;

  var current = taxOn(net, entity, twoTier, year, true);
  var nextYear = nextYearOfAssessment(year);
  var provisional = taxOn(net, entity, twoTier, nextYear, false);

  if (ok && assessable === 0) warnings.push("zeroProfits");
  if (ok && loss > 0) warnings.push("lossUsed");
  if (ok && unusedLoss > 0) warnings.push("lossCarry");
  if (ok && !twoTier) warnings.push("standardRate");
  if (ok && twoTier) warnings.push("twoTierNote");
  if (ok && current.reduction > 0) warnings.push("reductionFinalOnly");
  if (ok && year === "2026/27") warnings.push("noReduction2027");
  if (ok && entity === "unincorporated") warnings.push("notPersonalAssessment");
  warnings.push("notAccountingProfit");

  var holdoverThreshold = money(net * HOLDOVER_RATIO);
  var expectedNext = Number.isFinite(expectedNum) && expectedNum > 0 ? money(expectedNum) : 0;
  var holdoverLikely = expectedNext > 0 && expectedNext < holdoverThreshold;
  if (holdoverLikely) warnings.push("holdoverLikely");

  var firstInstalment = money(current.finalTax + provisional.finalTax * FIRST_INSTALMENT_SHARE);
  var secondInstalment = money(provisional.finalTax * SECOND_INSTALMENT_SHARE);
  var totalPayable = money(current.finalTax + provisional.finalTax);

  return {
    ok: ok,
    warnings: warnings,
    yearOfAssessment: year,
    nextYear: nextYear,
    entity: entity,
    twoTier: twoTier,
    assessableProfits: assessable,
    lossBroughtForward: loss,
    netProfits: net,
    unusedLoss: unusedLoss,
    band1: current.band1,
    band2: current.band2,
    lowRate: current.lowRate,
    highRate: current.highRate,
    taxBeforeReduction: current.taxBeforeReduction,
    reductionCap: current.reductionCap,
    reduction: current.reduction,
    finalTax: current.finalTax,
    standardTax: current.standardTax,
    twoTierSaving: current.twoTierSaving,
    provisionalTax: provisional.finalTax,
    provisionalBeforeReduction: provisional.taxBeforeReduction,
    firstInstalment: firstInstalment,
    secondInstalment: secondInstalment,
    totalPayable: totalPayable,
    holdoverThreshold: holdoverThreshold,
    holdoverLikely: holdoverLikely,
    expectedNextProfits: expectedNext,
  };
}

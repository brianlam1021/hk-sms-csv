/**
 * Hong Kong Employment Ordinance Cap. 57 — Severance Payment (SP) /
 * Long Service Payment (LSP) estimator for general employees.
 *
 * Formula & ceilings checked against Labour Department sources as of 2026-10-21:
 * - LD FAQ Cap.57 (SP/LSP computation, eligibility)
 * - Concise Guide to the EO Ch.11
 * - Abolition of MPF Offsetting Arrangement FAQ (transition 1 May 2025)
 *
 * https://www.labour.gov.hk/eng/faq/cap57l_whole.htm
 * https://www.labour.gov.hk/tc/public/pdf/wcp/ConciseGuide/11.pdf
 * https://www.op.labour.gov.hk/en/faq.html
 *
 * Estimate only — not LD / EasyCal / legal advice. Does not invent MPF offsets.
 */

export const AS_OF = "2026-10-21";
export const TRANSITION_YMD = "2025-05-01";
export const MONTHLY_WAGE_CEILING = 22500;
export const YEAR_UNIT_CAP = 15000; // 2/3 of $22,500
export const TOTAL_CAP = 390000;
export const SP_MIN_MONTHS = 24;
export const LSP_MIN_YEARS = 5;

var MS_PER_DAY = 86400000;

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

/** Parse YYYY-MM-DD as UTC midnight; returns Date or null. */
export function parseYmd(ymd) {
  if (ymd == null || ymd === "") return null;
  var s = String(ymd).trim();
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  var y = Number(m[1]);
  var mo = Number(m[2]);
  var d = Number(m[3]);
  var dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

export function formatYmd(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  var y = date.getUTCFullYear();
  var m = String(date.getUTCMonth() + 1).padStart(2, "0");
  var d = String(date.getUTCDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

/**
 * Reckonable years between two calendar dates (pro rata).
 * LD: incomplete years on a pro rata basis. Uses day count / 365.25 so
 * May-anniversary spans that include leap days land on whole years
 * (matches LD FAQ worked examples).
 * If end === start, years = 0. End before start → 0.
 */
export function yearsBetween(startDate, endDate) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return 0;
  var days = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
  if (days <= 0) return 0;
  return money(days / 365.25);
}

export function monthsBetweenApprox(startDate, endDate) {
  return money(yearsBetween(startDate, endDate) * 12);
}

/** Per-year unit: min(wage × 2/3, $15,000) for monthly; min(18-day sum, $15,000) for daily. */
export function yearUnit(wageOrEighteenDays, wageType) {
  var raw = Number(wageOrEighteenDays);
  if (!Number.isFinite(raw) || raw < 0) return 0;
  if (wageType === "daily") {
    return money(Math.min(raw, YEAR_UNIT_CAP));
  }
  var cappedWage = Math.min(raw, MONTHLY_WAGE_CEILING);
  return money(cappedWage * (2 / 3));
}

export function emptySettings() {
  return {
    entitlement: "sp",
    wageType: "monthly",
    startDate: "2021-05-01",
    endDate: "2028-05-01",
    useAverage: false,
    monthlyWage: 18000,
    monthlyWagePre: 15000,
    eighteenDays: 12000,
    eighteenDaysPre: 10000,
    spReason: "redundancy",
    lspReason: "dismissal",
  };
}

/** LD FAQ worked example: 4 yrs pre @ $15,000 + 3 yrs post @ $18,000 = $76,000. */
export function demoStraddle() {
  return {
    entitlement: "lsp",
    wageType: "monthly",
    startDate: "2021-05-01",
    endDate: "2028-05-01",
    useAverage: false,
    monthlyWage: 18000,
    monthlyWagePre: 15000,
    eighteenDays: 12000,
    eighteenDaysPre: 10000,
    spReason: "redundancy",
    lspReason: "dismissal",
  };
}

/** Simple monthly SP after transition only. */
export function demoMonthlySp() {
  return {
    entitlement: "sp",
    wageType: "monthly",
    startDate: "2025-06-01",
    endDate: "2028-06-01",
    useAverage: false,
    monthlyWage: 21000,
    monthlyWagePre: 21000,
    eighteenDays: 12000,
    eighteenDaysPre: 12000,
    spReason: "redundancy",
    lspReason: "dismissal",
  };
}

/** Cap example from LD FAQ Q5: 20 yrs pre + 10 yrs post → total capped at $390,000. */
export function demoCap() {
  return {
    entitlement: "lsp",
    wageType: "monthly",
    startDate: "2005-05-01",
    endDate: "2035-05-01",
    useAverage: false,
    monthlyWage: 30000,
    monthlyWagePre: 22500,
    eighteenDays: 15000,
    eighteenDaysPre: 15000,
    spReason: "redundancy",
    lspReason: "dismissal",
  };
}

var SP_REASONS = {
  redundancy: true,
  fixedTermRedundancy: true,
  layoff: true,
};

var LSP_REASONS = {
  dismissal: true,
  fixedTermNonRenewal: true,
  death: true,
  illHealth: true,
  age65: true,
};

/**
 * Eligibility under EO Cap.57 (simplified selectable checks).
 * SP and LSP are mutually exclusive — caller picks one entitlement type.
 */
export function checkEligibility(settings, yearsTotal) {
  var entitlement = settings && settings.entitlement === "lsp" ? "lsp" : "sp";
  var reasons = [];
  var eligible = false;

  if (entitlement === "sp") {
    var spReason = SP_REASONS[settings && settings.spReason]
      ? settings.spReason
      : "redundancy";
    if (!(yearsTotal * 12 >= SP_MIN_MONTHS - 1e-9)) {
      reasons.push("spShortService");
    } else if (!SP_REASONS[spReason]) {
      reasons.push("spNoReason");
    } else {
      eligible = true;
    }
    return { eligible: eligible, entitlement: "sp", reason: spReason, failReasons: reasons };
  }

  var lspReason = LSP_REASONS[settings && settings.lspReason]
    ? settings.lspReason
    : "dismissal";
  if (!(yearsTotal + 1e-9 >= LSP_MIN_YEARS)) {
    reasons.push("lspShortService");
  } else if (!LSP_REASONS[lspReason]) {
    reasons.push("lspNoReason");
  } else {
    eligible = true;
  }
  return { eligible: eligible, entitlement: "lsp", reason: lspReason, failReasons: reasons };
}

function portionAmount(unit, years) {
  return money(unit * years);
}

/**
 * Core estimator.
 * @param {object} settings
 * @returns {object}
 */
export function compute(settings) {
  var warnings = [];
  var entitlement = settings && settings.entitlement === "lsp" ? "lsp" : "sp";
  var wageType = settings && settings.wageType === "daily" ? "daily" : "monthly";
  var useAverage = !!(settings && settings.useAverage);

  var start = parseYmd(settings && settings.startDate);
  var end = parseYmd(settings && settings.endDate);
  var transition = parseYmd(TRANSITION_YMD);

  if (!start) warnings.push("badStart");
  if (!end) warnings.push("badEnd");
  if (start && end && end < start) warnings.push("endBeforeStart");

  var monthlyWage = Number(settings && settings.monthlyWage);
  var monthlyWagePre = Number(settings && settings.monthlyWagePre);
  var eighteenDays = Number(settings && settings.eighteenDays);
  var eighteenDaysPre = Number(settings && settings.eighteenDaysPre);

  if (wageType === "monthly") {
    if (!Number.isFinite(monthlyWage) || monthlyWage < 0) warnings.push("badWage");
    if (monthlyWage < 0) warnings.push("negWage");
  } else {
    if (!Number.isFinite(eighteenDays) || eighteenDays < 0) warnings.push("badWage");
    if (eighteenDays < 0) warnings.push("negWage");
  }

  var datesOk =
    warnings.indexOf("badStart") === -1 &&
    warnings.indexOf("badEnd") === -1 &&
    warnings.indexOf("endBeforeStart") === -1;
  var wageOk =
    warnings.indexOf("badWage") === -1 && warnings.indexOf("negWage") === -1;

  var yearsTotal = datesOk ? yearsBetween(start, end) : 0;
  var eligibility = checkEligibility(
    {
      entitlement: entitlement,
      spReason: settings && settings.spReason,
      lspReason: settings && settings.lspReason,
    },
    yearsTotal
  );

  var straddles = false;
  var yearsPre = 0;
  var yearsPost = 0;
  var mode = "single";

  if (datesOk) {
    // Straddle: commenced before transition AND terminated on/after transition.
    straddles = start < transition && end >= transition;
    if (straddles) {
      mode = "straddle";
      yearsPre = yearsBetween(start, transition);
      yearsPost = yearsBetween(transition, end);
    } else {
      mode = "single";
      yearsPre = 0;
      yearsPost = 0;
    }
  }

  // Pre-transition wage inputs (needed when straddling).
  if (straddles && wageType === "monthly") {
    if (!Number.isFinite(monthlyWagePre) || monthlyWagePre < 0) {
      warnings.push("badWagePre");
      wageOk = false;
    }
  }
  if (straddles && wageType === "daily") {
    if (!Number.isFinite(eighteenDaysPre) || eighteenDaysPre < 0) {
      warnings.push("badWagePre");
      wageOk = false;
    }
  }

  if (wageType === "monthly" && Number.isFinite(monthlyWage) && monthlyWage > MONTHLY_WAGE_CEILING) {
    warnings.push("wageCapped");
  }
  if (wageType === "daily" && Number.isFinite(eighteenDays) && eighteenDays > YEAR_UNIT_CAP) {
    warnings.push("eighteenCapped");
  }
  if (
    straddles &&
    wageType === "monthly" &&
    Number.isFinite(monthlyWagePre) &&
    monthlyWagePre > MONTHLY_WAGE_CEILING
  ) {
    warnings.push("wagePreCapped");
  }
  if (
    straddles &&
    wageType === "daily" &&
    Number.isFinite(eighteenDaysPre) &&
    eighteenDaysPre > YEAR_UNIT_CAP
  ) {
    warnings.push("eighteenPreCapped");
  }

  if (useAverage) warnings.push("avgNote");

  var unitTerm = 0;
  var unitPre = 0;
  if (wageOk) {
    if (wageType === "monthly") {
      unitTerm = yearUnit(monthlyWage, "monthly");
      unitPre = straddles ? yearUnit(monthlyWagePre, "monthly") : unitTerm;
    } else {
      unitTerm = yearUnit(eighteenDays, "daily");
      unitPre = straddles ? yearUnit(eighteenDaysPre, "daily") : unitTerm;
    }
  }

  var preRaw = 0;
  var postRaw = 0;
  var singleRaw = 0;
  var preAmount = 0;
  var postAmount = 0;
  var totalBeforeCap = 0;
  var total = 0;
  var excessDeducted = 0;
  var capApplied = false;

  var ok = datesOk && wageOk && eligibility.eligible;

  if (datesOk && wageOk && eligibility.eligible) {
    if (mode === "straddle") {
      preRaw = portionAmount(unitPre, yearsPre);
      postRaw = portionAmount(unitTerm, yearsPost);
      totalBeforeCap = money(preRaw + postRaw);
      if (totalBeforeCap > TOTAL_CAP) {
        // Excess deducted from post-transition portion (LD FAQ Q5).
        excessDeducted = money(totalBeforeCap - TOTAL_CAP);
        preAmount = money(Math.min(preRaw, TOTAL_CAP));
        postAmount = money(Math.max(0, TOTAL_CAP - preAmount));
        total = money(preAmount + postAmount);
        capApplied = true;
        warnings.push("totalCapped");
      } else {
        preAmount = preRaw;
        postAmount = postRaw;
        total = totalBeforeCap;
      }
    } else {
      singleRaw = portionAmount(unitTerm, yearsTotal);
      totalBeforeCap = singleRaw;
      if (singleRaw > TOTAL_CAP) {
        total = TOTAL_CAP;
        excessDeducted = money(singleRaw - TOTAL_CAP);
        capApplied = true;
        warnings.push("totalCapped");
      } else {
        total = singleRaw;
      }
    }
  } else if (!eligibility.eligible && datesOk) {
    warnings = warnings.concat(eligibility.failReasons);
  }

  if (ok) warnings.push("mpfOffsetNote");

  return {
    ok: ok,
    warnings: warnings,
    entitlement: entitlement,
    wageType: wageType,
    useAverage: useAverage,
    startDate: start ? formatYmd(start) : "",
    endDate: end ? formatYmd(end) : "",
    transitionDate: TRANSITION_YMD,
    mode: mode,
    straddles: straddles,
    yearsTotal: yearsTotal,
    yearsPre: yearsPre,
    yearsPost: yearsPost,
    monthlyWage: wageType === "monthly" && Number.isFinite(monthlyWage) ? money(monthlyWage) : 0,
    monthlyWagePre:
      wageType === "monthly" && Number.isFinite(monthlyWagePre) ? money(monthlyWagePre) : 0,
    eighteenDays: wageType === "daily" && Number.isFinite(eighteenDays) ? money(eighteenDays) : 0,
    eighteenDaysPre:
      wageType === "daily" && Number.isFinite(eighteenDaysPre) ? money(eighteenDaysPre) : 0,
    unitTerm: unitTerm,
    unitPre: unitPre,
    preRaw: preRaw,
    postRaw: postRaw,
    singleRaw: singleRaw,
    preAmount: preAmount,
    postAmount: postAmount,
    totalBeforeCap: totalBeforeCap,
    total: total,
    excessDeducted: excessDeducted,
    capApplied: capApplied,
    yearUnitCap: YEAR_UNIT_CAP,
    monthlyCeiling: MONTHLY_WAGE_CEILING,
    totalCap: TOTAL_CAP,
    eligibility: eligibility,
    asOf: AS_OF,
  };
}

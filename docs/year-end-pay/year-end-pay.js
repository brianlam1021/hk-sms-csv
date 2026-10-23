/**
 * Hong Kong statutory end-of-year payment (年終酬金 / 雙糧) estimator.
 * Employment Ordinance Cap. 57 Part IIA, ss.11AA–11F.
 *
 * Full payment (s.11B): employed under a continuous contract for the
 * whole payment period.
 * Pro-rata (s.11F): not employed for the whole period, but not less than
 * 3 months in the period, and either still employed after expiry or the
 * contract ends — except employee resignation (other than s.10) or
 * s.9 summary dismissal.
 *
 * Amount: contractual sum if specified; otherwise one month’s average
 * wages (Concise Guide Ch.8 / LD wages FAQ). Pro-rata portion =
 * full amount × (days of service in the period / days in the period)
 * when the contract does not specify a different fraction (s.11F(2)).
 *
 * Probation (s.11F(1A) / LD FAQ / 1823): for the 3-month eligibility
 * test, exclude the probation period or 3 months, whichever is shorter.
 * Once eligible, the amount uses the whole employment in the period
 * (including probation).
 *
 * Default payment period if the contract is silent: a lunar year (LD FAQ).
 *
 * Figures and citations checked against LD Cap.57 FAQ (cap57j), Concise
 * Guide Chapter 8, and 1823 pro-rata-on-termination FAQ as of 2026-10-23.
 * Not legal advice; a contract may grant more than the statute.
 */

export const AS_OF = "2026-10-23";
export const ELIGIBILITY_MONTHS = 3;
export const PROBATION_EXCLUDE_CAP_MONTHS = 3;
export const DAYS_PER_MONTH_PROXY = 90;

/** First day (初一) of the lunar year that begins in that Gregorian year. */
export const LUNAR_CNY = {
  2016: "2016-02-08",
  2017: "2017-01-28",
  2018: "2018-02-16",
  2019: "2019-02-05",
  2020: "2020-01-25",
  2021: "2021-02-12",
  2022: "2022-02-01",
  2023: "2023-01-22",
  2024: "2024-02-10",
  2025: "2025-01-29",
  2026: "2026-02-17",
  2027: "2027-02-06",
  2028: "2028-01-26",
  2029: "2029-02-13",
  2030: "2030-02-03",
  2031: "2031-01-23",
  2032: "2032-02-11",
  2033: "2033-01-31",
  2034: "2034-02-19",
  2035: "2035-02-08",
  2036: "2036-01-28",
};

export const LUNAR_STEM_BRANCH = {
  2016: "丙申",
  2017: "丁酉",
  2018: "戊戌",
  2019: "己亥",
  2020: "庚子",
  2021: "辛丑",
  2022: "壬寅",
  2023: "癸卯",
  2024: "甲辰",
  2025: "乙巳",
  2026: "丙午",
  2027: "丁未",
  2028: "戊申",
  2029: "己酉",
  2030: "庚戌",
  2031: "辛亥",
  2032: "壬子",
  2033: "癸丑",
  2034: "甲寅",
  2035: "乙卯",
  2036: "丙辰",
};

export const AMOUNT_MODES = ["fixed", "average"];
export const PERIOD_KINDS = ["lunar", "calendar", "custom"];
export const SERVICE_MODES = ["dates", "days"];
export const TERMINATIONS = ["stillEmployed", "dismissed", "resigned", "summary"];

const MS_DAY = 86400000;

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

export function moneyRound(n) {
  return roundTo(n, 2);
}

export function parseYmd(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  var y = Number(m[1]);
  var mo = Number(m[2]);
  var d = Number(m[3]);
  var t = Date.UTC(y, mo - 1, d);
  var dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return t;
}

export function formatYmd(utcMs) {
  var dt = new Date(utcMs);
  var y = dt.getUTCFullYear();
  var mo = String(dt.getUTCMonth() + 1).padStart(2, "0");
  var d = String(dt.getUTCDate()).padStart(2, "0");
  return y + "-" + mo + "-" + d;
}

export function daysInclusive(startIso, endIso) {
  var a = parseYmd(startIso);
  var b = parseYmd(endIso);
  if (a == null || b == null) return null;
  return Math.round((b - a) / MS_DAY) + 1;
}

/** Add calendar months using civil-date overflow (31 Jan + 1 month → 2/3 Mar). */
export function addCalendarMonths(utcMs, months) {
  var dt = new Date(utcMs);
  return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + months, dt.getUTCDate());
}

/**
 * True when the inclusive span start…end is at least `months` calendar months.
 * 1 Jan–31 Mar = 3 months; 15 Jan–14 Apr = 3 months.
 */
export function hasCalendarMonths(startIso, endIso, months) {
  var a = parseYmd(startIso);
  var b = parseYmd(endIso);
  if (a == null || b == null || b < a) return false;
  var threshold = addCalendarMonths(a, months) - MS_DAY;
  return b >= threshold;
}

export function lunarBounds(year) {
  var y = Number(year);
  var start = LUNAR_CNY[y];
  var next = LUNAR_CNY[y + 1];
  if (!start || !next) return null;
  return { start: start, end: formatYmd(parseYmd(next) - MS_DAY) };
}

export function calendarBounds(year) {
  var y = Number(year);
  if (!Number.isInteger(y) || y < 1900 || y > 2100) return null;
  return { start: y + "-01-01", end: y + "-12-31" };
}

export function overlapIso(aStart, aEnd, bStart, bEnd) {
  var as = parseYmd(aStart);
  var ae = parseYmd(aEnd);
  var bs = parseYmd(bStart);
  var be = parseYmd(bEnd);
  if (as == null || ae == null || bs == null || be == null) return null;
  if (ae < as || be < bs) return null;
  var start = Math.max(as, bs);
  var end = Math.min(ae, be);
  if (end < start) return { start: null, end: null, days: 0 };
  return { start: formatYmd(start), end: formatYmd(end), days: Math.round((end - start) / MS_DAY) + 1 };
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

export function emptyModel() {
  return {
    amountMode: "fixed",
    amount: 20000,
    periodKind: "calendar",
    periodYear: 2026,
    customStart: "2026-01-01",
    customEnd: "2026-12-31",
    serviceMode: "dates",
    empStart: "2026-01-01",
    empEnd: "2026-06-30",
    employedDays: 181,
    termination: "dismissed",
    contractGrantResign: false,
    excludeProbation: false,
    probationMonths: 3,
  };
}

/** Sanity case: HK$20,000 double pay, ~6/12 of a calendar year, employer dismissal. */
export function demoDismissedHalfYear() {
  return emptyModel();
}

/** Same facts as the half-year demo, but the employee resigned. */
export function demoResignedHalfYear() {
  return Object.assign(emptyModel(), { termination: "resigned", contractGrantResign: false });
}

/** Full calendar year, still employed — full contractual amount. */
export function demoFullYear() {
  return Object.assign(emptyModel(), {
    empStart: "2026-01-01",
    empEnd: "2026-12-31",
    employedDays: 365,
    termination: "stillEmployed",
  });
}

/**
 * Five months’ service with a 3-month probation: after exclusion the
 * qualifying service is under 3 months, so not eligible.
 */
export function demoProbationShort() {
  return Object.assign(emptyModel(), {
    empStart: "2026-01-01",
    empEnd: "2026-05-31",
    employedDays: 151,
    termination: "dismissed",
    excludeProbation: true,
    probationMonths: 3,
  });
}

function resolvePeriod(model) {
  var kind = PERIOD_KINDS.indexOf(model.periodKind) >= 0 ? model.periodKind : "calendar";
  if (kind === "lunar") {
    var lunar = lunarBounds(model.periodYear);
    if (!lunar) return { ok: false, kind: kind, warning: "badLunarYear" };
    return {
      ok: true,
      kind: kind,
      year: Number(model.periodYear),
      start: lunar.start,
      end: lunar.end,
      days: daysInclusive(lunar.start, lunar.end),
      labelKey: "lunar",
    };
  }
  if (kind === "custom") {
    var days = daysInclusive(model.customStart, model.customEnd);
    if (days == null) return { ok: false, kind: kind, warning: "badCustomDates" };
    if (days <= 0) return { ok: false, kind: kind, warning: "endBeforeStart" };
    return {
      ok: true,
      kind: kind,
      year: null,
      start: model.customStart,
      end: model.customEnd,
      days: days,
      labelKey: "custom",
    };
  }
  var cal = calendarBounds(model.periodYear);
  if (!cal) return { ok: false, kind: "calendar", warning: "badCalendarYear" };
  return {
    ok: true,
    kind: "calendar",
    year: Number(model.periodYear),
    start: cal.start,
    end: cal.end,
    days: daysInclusive(cal.start, cal.end),
    labelKey: "calendar",
  };
}

function clampProbationMonths(n) {
  var v = finite(n, 3);
  if (v < 0) v = 0;
  if (v > PROBATION_EXCLUDE_CAP_MONTHS) v = PROBATION_EXCLUDE_CAP_MONTHS;
  return v;
}

function qualifyingFromDates(empStart, empEnd, periodStart, periodEnd, excludeProbation, probationMonths) {
  var ov = overlapIso(empStart, empEnd, periodStart, periodEnd);
  if (!ov || !ov.start) {
    return { employedDays: 0, qualifyingDays: 0, qualifyingStart: null, qualifyingEnd: null, excludedDays: 0 };
  }
  var excludedDays = 0;
  var qualStart = ov.start;
  if (excludeProbation && probationMonths > 0) {
    var probEndMs = addCalendarMonths(parseYmd(empStart), probationMonths) - MS_DAY;
    var probEnd = formatYmd(probEndMs);
    var probOv = overlapIso(empStart, probEnd, ov.start, ov.end);
    excludedDays = probOv && probOv.days ? probOv.days : 0;
    if (parseYmd(ov.start) <= probEndMs) {
      var next = probEndMs + MS_DAY;
      if (next <= parseYmd(ov.end)) qualStart = formatYmd(next);
      else {
        return {
          employedDays: ov.days,
          qualifyingDays: 0,
          qualifyingStart: null,
          qualifyingEnd: null,
          excludedDays: excludedDays,
        };
      }
    }
  }
  var qualifyingDays = daysInclusive(qualStart, ov.end);
  return {
    employedDays: ov.days,
    qualifyingDays: qualifyingDays == null ? 0 : Math.max(0, qualifyingDays),
    qualifyingStart: qualStart,
    qualifyingEnd: ov.end,
    excludedDays: excludedDays,
  };
}

function eligibilityReason(opts) {
  var termination = opts.termination;
  var completedWhole = opts.completedWhole;
  var serviceOk = opts.serviceOk;
  var contractGrantResign = opts.contractGrantResign;

  if (termination === "summary" && !completedWhole) return "no_summary";
  if (termination === "resigned" && !completedWhole && !contractGrantResign) return "no_resigned";
  if (!serviceOk && !completedWhole) return "no_short_service";
  if (completedWhole) {
    if (termination === "summary") return "yes_full_after_summary_note";
    if (termination === "resigned") return "yes_full_after_resign_note";
    return "yes_full";
  }
  if (termination === "resigned" && contractGrantResign) return "yes_prorata_resign_contract";
  if (termination === "dismissed") return "yes_prorata_dismissed";
  if (termination === "stillEmployed") return "yes_prorata_employed";
  if (termination === "summary") return "no_summary";
  return "yes_prorata_employed";
}

export function compute(input) {
  var model = Object.assign(emptyModel(), input || {});
  var warnings = [];
  var amountMode = AMOUNT_MODES.indexOf(model.amountMode) >= 0 ? model.amountMode : "fixed";
  var serviceMode = SERVICE_MODES.indexOf(model.serviceMode) >= 0 ? model.serviceMode : "dates";
  var termination = TERMINATIONS.indexOf(model.termination) >= 0 ? model.termination : "dismissed";
  var contractGrantResign = Boolean(model.contractGrantResign);
  var excludeProbation = Boolean(model.excludeProbation);
  var probationMonths = clampProbationMonths(model.probationMonths);
  var amount = finite(model.amount, NaN);

  var period = resolvePeriod(model);
  if (!period.ok) {
    warnings.push(period.warning);
    return {
      ok: false,
      eligible: false,
      reason: period.warning,
      payable: false,
      amount: 0,
      fullAmount: Number.isFinite(amount) ? moneyRound(amount) : 0,
      periodDays: 0,
      employedDays: 0,
      qualifyingDays: 0,
      ratio: 0,
      warnings: warnings,
      period: period,
      amountMode: amountMode,
      termination: termination,
      completedWhole: false,
      serviceOk: false,
      serviceApprox: false,
      formula: "",
    };
  }

  if (!Number.isFinite(amount) || amount < 0) {
    warnings.push("badAmount");
  }
  if (amount < 0) amount = 0;
  var fullAmount = Number.isFinite(amount) ? moneyRound(amount) : 0;

  var employedDays = 0;
  var qualifyingDays = 0;
  var excludedDays = 0;
  var serviceApprox = false;
  var overlapStart = null;
  var overlapEnd = null;
  var empStart = model.empStart || "";
  var empEnd = model.empEnd || "";

  if (serviceMode === "dates") {
    if (!parseYmd(empStart)) {
      warnings.push("badEmpStart");
    } else {
      if (!empEnd) {
        empEnd = period.end;
      } else if (!parseYmd(empEnd)) {
        warnings.push("badEmpEnd");
        empEnd = "";
      }
      if (empEnd && parseYmd(empEnd) < parseYmd(empStart)) {
        warnings.push("empEndBeforeStart");
      }
      if (empEnd && parseYmd(empEnd)) {
        if (termination === "stillEmployed" && parseYmd(empEnd) < parseYmd(period.end)) {
          // Still employed at period end: count through the last day of the period.
          empEnd = period.end;
        }
        var ov = overlapIso(empStart, empEnd, period.start, period.end);
        if (ov && ov.start) {
          overlapStart = ov.start;
          overlapEnd = ov.end;
        }
        var q = qualifyingFromDates(
          empStart,
          empEnd,
          period.start,
          period.end,
          excludeProbation,
          probationMonths,
        );
        employedDays = q.employedDays;
        qualifyingDays = q.qualifyingDays;
        excludedDays = q.excludedDays;
      }
    }
  } else {
    employedDays = Math.round(nonNeg(model.employedDays));
    if (employedDays <= 0) warnings.push("badEmployedDays");
    if (employedDays > period.days) {
      employedDays = period.days;
      warnings.push("daysCappedToPeriod");
    }
    excludedDays = 0;
    if (excludeProbation && probationMonths > 0) {
      excludedDays = Math.min(employedDays, Math.round(probationMonths * (DAYS_PER_MONTH_PROXY / 3)));
      serviceApprox = true;
      warnings.push("daysApprox3Months");
    } else if (employedDays < period.days) {
      serviceApprox = true;
      warnings.push("daysApprox3Months");
    }
    qualifyingDays = Math.max(0, employedDays - excludedDays);
  }

  if (employedDays > period.days) {
    employedDays = period.days;
  }

  var completedWhole = period.days > 0 && employedDays >= period.days;
  var serviceOk;
  if (serviceMode === "dates" && overlapStart && overlapEnd) {
    var qualStart = overlapStart;
    if (excludeProbation && excludedDays > 0 && empStart) {
      var afterProb = addCalendarMonths(parseYmd(empStart), probationMonths);
      if (afterProb > parseYmd(overlapStart)) qualStart = formatYmd(afterProb);
    }
    if (qualifyingDays <= 0) serviceOk = false;
    else serviceOk = hasCalendarMonths(qualStart, overlapEnd, ELIGIBILITY_MONTHS);
  } else {
    serviceOk = qualifyingDays >= DAYS_PER_MONTH_PROXY;
  }

  if (completedWhole) serviceOk = true;

  var reason = eligibilityReason({
    termination: termination,
    completedWhole: completedWhole,
    serviceOk: serviceOk,
    contractGrantResign: contractGrantResign,
  });

  var eligible = reason.indexOf("yes_") === 0;
  var payable = eligible && Number.isFinite(amount) && amount >= 0 && !warnings.includes("badAmount");

  if (termination === "resigned" && !completedWhole && !contractGrantResign) {
    warnings.push("resignedNotEntitled");
  }
  if (termination === "summary" && !completedWhole) {
    warnings.push("summaryNotEntitled");
  }
  if (!completedWhole && !serviceOk && (termination === "dismissed" || termination === "stillEmployed" || (termination === "resigned" && contractGrantResign))) {
    warnings.push("shortService");
  }
  if (excludeProbation && excludedDays > 0) {
    warnings.push("probationExcludedForTest");
  }
  if (reason === "yes_full_after_resign_note") warnings.push("fullAfterResign");
  if (reason === "yes_full_after_summary_note") warnings.push("fullAfterSummary");
  if (contractGrantResign && termination === "resigned" && eligible) {
    warnings.push("contractBeatsStatute");
  }

  var ratio = period.days > 0 ? employedDays / period.days : 0;
  if (ratio > 1) ratio = 1;
  var estimated = 0;
  if (payable) {
    estimated = completedWhole ? fullAmount : moneyRound(fullAmount * ratio);
  }

  var formula = "";
  if (payable && completedWhole) {
    formula =
      "Full end-of-year payment (EO s.11B; employed throughout the payment period)\n" +
      "= " +
      formatHkd(fullAmount);
  } else if (payable) {
    formula =
      "Pro-rata (EO s.11F(2)): full amount × (days employed in period ÷ days in period)\n" +
      "= " +
      formatHkd(fullAmount) +
      " × (" +
      employedDays +
      " ÷ " +
      period.days +
      ")\n" +
      "= " +
      formatHkd(estimated);
  } else if (reason === "no_resigned") {
    formula = "Not payable: employee resigned before the payment period expired (EO s.11F(1B); LD FAQ Q2).";
  } else if (reason === "no_summary") {
    formula = "Not payable: summary dismissal under EO s.9 (s.11F(1B)).";
  } else if (reason === "no_short_service") {
    formula =
      "Not payable: qualifying service in the payment period is under 3 months (EO s.11F(1); probation excluded for this test only).";
  }

  return {
    ok: payable || (!warnings.includes("badAmount") && period.ok && (serviceMode === "days" || Boolean(parseYmd(model.empStart)))),
    eligible: eligible,
    payable: payable,
    reason: reason,
    amount: estimated,
    fullAmount: fullAmount,
    amountMode: amountMode,
    termination: termination,
    contractGrantResign: contractGrantResign,
    excludeProbation: excludeProbation,
    probationMonths: probationMonths,
    period: period,
    periodDays: period.days,
    periodStart: period.start,
    periodEnd: period.end,
    employedDays: employedDays,
    qualifyingDays: qualifyingDays,
    excludedDays: excludedDays,
    overlapStart: overlapStart,
    overlapEnd: overlapEnd,
    empStart: empStart,
    empEnd: empEnd,
    ratio: ratio,
    monthsApprox: period.days > 0 ? roundTo((employedDays / period.days) * 12, 2) : 0,
    completedWhole: completedWhole,
    serviceOk: serviceOk,
    serviceApprox: serviceApprox,
    formula: formula,
    warnings: warnings,
    model: Object.assign({}, model, {
      amountMode: amountMode,
      amount: fullAmount,
      serviceMode: serviceMode,
      termination: termination,
      contractGrantResign: contractGrantResign,
      excludeProbation: excludeProbation,
      probationMonths: probationMonths,
      employedDays: employedDays,
    }),
  };
}

export function summaryToCsv(result, labels) {
  var rows = [
    [labels.item, labels.amount],
    [labels.eligibility, result.eligible ? labels.yes : labels.no],
    [labels.reason, result.reason],
    [labels.period, (result.periodStart || "") + " – " + (result.periodEnd || "")],
    [labels.periodDays, String(result.periodDays)],
    [labels.employedDays, String(result.employedDays)],
    [labels.qualifyingDays, String(result.qualifyingDays)],
    [labels.ratio, String(roundTo(result.ratio, 6))],
    [labels.full, String(result.fullAmount)],
    [labels.estimate, String(result.amount)],
    [labels.termination, result.termination],
    [labels.formula, result.formula.replace(/\n/g, " | ")],
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

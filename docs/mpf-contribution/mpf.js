/**
 * Hong Kong MPF mandatory contribution estimator.
 * Tables: MPFA “Mandatory contributions — Employees” and “Self-employed persons”
 * as of 15 October 2026. Monthly min/max relevant income $7,100 / $30,000;
 * non-monthly daily min/max $280 / $1,000 × days in the wage period;
 * self-employed yearly min/max $85,200 / $360,000.
 * https://www.mpfa.org.hk/mpf-system/mandatory-contributions/employees
 * https://www.mpfa.org.hk/mpf-system/mandatory-contributions/self-employed-persons
 * Estimate only — not an MPFA / eMPF tool.
 */

export const AS_OF = "2026-10-15";
export const RATE = 0.05;
export const MONTHLY_MIN = 7100;
export const MONTHLY_MAX = 30000;
export const DAILY_MIN = 280;
export const DAILY_MAX = 1000;
export const YEARLY_MIN = 85200;
export const YEARLY_MAX = 360000;
export const MONTHLY_CAP_CONTRIB = 1500;
export const YEARLY_CAP_CONTRIB = 18000;
export const TAX_DEDUCT_CAP = 18000;

var PERIODS = {
  monthly: true,
  weekly: true,
  semiMonthly: true,
  daily: true,
  yearly: true,
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

export function emptySettings() {
  return {
    role: "employee",
    period: "monthly",
    income: 20000,
    days: 7,
    holiday: false,
    voluntary: 0,
  };
}

/** MPFA table mid-band example: $20,000/month → each $1,000. */
export function demoEmployee() {
  return emptySettings();
}

/** Below monthly minimum: employee $0, employer still 5%. */
export function demoBelowMin() {
  return {
    role: "employee",
    period: "monthly",
    income: 6000,
    days: 7,
    holiday: false,
    voluntary: 0,
  };
}

/** Above monthly maximum: each capped at $1,500. */
export function demoCapped() {
  return {
    role: "employee",
    period: "monthly",
    income: 50000,
    days: 7,
    holiday: false,
    voluntary: 0,
  };
}

export function defaultDays(period) {
  if (period === "weekly") return 7;
  if (period === "semiMonthly") return 15;
  if (period === "daily") return 1;
  return 0;
}

export function needsDays(period) {
  return period === "weekly" || period === "semiMonthly" || period === "daily";
}

export function levelsFor(period, days) {
  var p = PERIODS[period] ? period : "monthly";
  if (p === "yearly") {
    return { period: p, min: YEARLY_MIN, max: YEARLY_MAX, days: 0 };
  }
  if (p === "monthly") {
    return { period: p, min: MONTHLY_MIN, max: MONTHLY_MAX, days: 0 };
  }
  var d = finite(days, NaN);
  if (!Number.isFinite(d) || d <= 0) d = defaultDays(p);
  return {
    period: p,
    min: money(DAILY_MIN * d),
    max: money(DAILY_MAX * d),
    days: d,
  };
}

function bandOf(income, min, max) {
  if (!(income > 0)) return "zero";
  if (income < min) return "belowMin";
  if (income > max) return "aboveMax";
  return "inBand";
}

/**
 * Mandatory contribution for one contribution / wage period.
 * Employee: employer always 5% of relevant income capped at the period max;
 * employee 5% of the same capped amount only if income reaches the period min
 * and the 30-day employee contribution holiday is not flagged.
 * Self-employed: 5% of relevant income, $0 below the min, capped at the max.
 */
export function compute(settings) {
  var role = settings && settings.role === "selfEmployed" ? "selfEmployed" : "employee";
  var period = settings && PERIODS[settings.period] ? settings.period : "monthly";
  if (role === "employee" && period === "yearly") period = "monthly";
  if (role === "selfEmployed" && needsDays(period)) period = "monthly";

  var incomeRaw = settings && settings.income;
  var incomeNum = Number(incomeRaw);
  var holiday = !!(settings && settings.holiday) && role === "employee";
  var voluntaryNum = Number(settings && settings.voluntary);
  var warnings = [];

  if (incomeRaw === "" || incomeRaw == null || !Number.isFinite(incomeNum)) {
    warnings.push("noIncome");
  } else if (incomeNum < 0) {
    warnings.push("negIncome");
  }

  var lv = levelsFor(period, settings && settings.days);
  if (needsDays(period)) {
    var daysNum = Number(settings && settings.days);
    if (!Number.isFinite(daysNum) || daysNum <= 0) warnings.push("noDays");
    else if (daysNum > 31) warnings.push("daysHigh");
  }

  if (Number.isFinite(voluntaryNum) && voluntaryNum < 0) warnings.push("negVoluntary");
  var voluntary = Number.isFinite(voluntaryNum) && voluntaryNum > 0 ? money(voluntaryNum) : 0;

  var ok =
    warnings.indexOf("noIncome") === -1 &&
    warnings.indexOf("negIncome") === -1 &&
    warnings.indexOf("noDays") === -1;

  var income = ok ? money(incomeNum) : 0;
  var min = lv.min;
  var max = lv.max;
  var band = ok ? bandOf(income, min, max) : "zero";
  var capped = income > max ? max : income;
  var employerMC = 0;
  var employeeMC = 0;
  var selfMC = 0;

  if (ok && income > 0) {
    if (role === "selfEmployed") {
      if (income >= min) selfMC = money(capped * RATE);
    } else {
      employerMC = money(capped * RATE);
      if (income >= min && !holiday) employeeMC = money(capped * RATE);
    }
  }

  if (ok && holiday) warnings.push("holidayOn");
  if (ok && band === "belowMin") {
    warnings.push(role === "selfEmployed" ? "selfBelowMin" : "employeeBelowMin");
  }
  if (ok && band === "aboveMax") warnings.push("capped");
  if (ok && period === "yearly") warnings.push("yearlySep");

  var totalMC = money(employerMC + employeeMC + selfMC);
  var deducted = money((role === "selfEmployed" ? selfMC : employeeMC) + voluntary);
  var takeHome = ok ? money(income - deducted) : 0;

  var annualEmployer = null;
  var annualEmployee = null;
  var annualSelf = null;
  var annualTotal = null;
  if (ok && period === "monthly" && !holiday) {
    annualEmployer = role === "employee" ? money(employerMC * 12) : 0;
    annualEmployee = role === "employee" ? money(employeeMC * 12) : 0;
    annualSelf = role === "selfEmployed" ? money(selfMC * 12) : 0;
    annualTotal = money((annualEmployer || 0) + (annualEmployee || 0) + (annualSelf || 0));
  } else if (ok && period === "yearly") {
    annualSelf = selfMC;
    annualTotal = selfMC;
  }

  return {
    ok: ok,
    warnings: warnings,
    role: role,
    period: period,
    income: income,
    days: lv.days,
    minLevel: min,
    maxLevel: max,
    band: band,
    relevantCapped: ok ? money(capped) : 0,
    rate: RATE,
    employerMC: employerMC,
    employeeMC: employeeMC,
    selfMC: selfMC,
    voluntary: voluntary,
    totalMC: totalMC,
    deductedFromPay: deducted,
    takeHome: takeHome,
    annualEmployer: annualEmployer,
    annualEmployee: annualEmployee,
    annualSelf: annualSelf,
    annualTotal: annualTotal,
    holiday: holiday,
    taxDeductCap: TAX_DEDUCT_CAP,
  };
}

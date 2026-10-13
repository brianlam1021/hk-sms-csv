/** Pure hourly-wage estimate math. No DOM. HKD only. */

export function emptySettings() {
  return {
    mode: "monthly",
    amount: 20800,
    daysPerMonth: 26,
    hoursPerDay: 8,
    hoursPerWeek: 44,
  };
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

function finitePositive(n) {
  return Number.isFinite(n) && n > 0;
}

/**
 * Convert monthly / daily / hourly pay using:
 *   hoursPerMonth = daysPerMonth × hoursPerDay
 *   hourly = monthly ÷ hoursPerMonth
 * Weekly pay is a separate view: weekly = hourly × hoursPerWeek.
 * It is not used to derive monthly pay.
 */
export function compute(settings) {
  var mode = settings && settings.mode;
  if (mode !== "daily" && mode !== "hourly") mode = "monthly";

  var amount = Number(settings && settings.amount);
  var days = Number(settings && settings.daysPerMonth);
  var hoursDay = Number(settings && settings.hoursPerDay);
  var hoursWeek = Number(settings && settings.hoursPerWeek);

  var warnings = [];
  if (!finitePositive(amount)) warnings.push("noAmount");
  if (!finitePositive(days)) warnings.push("noDays");
  if (!finitePositive(hoursDay)) warnings.push("noHoursDay");

  var weekOk = finitePositive(hoursWeek);
  if (Number.isFinite(hoursWeek) && hoursWeek < 0) warnings.push("badHoursWeek");

  var hoursPerMonth = finitePositive(days) && finitePositive(hoursDay) ? days * hoursDay : 0;
  var hourly = 0;
  var daily = 0;
  var monthly = 0;
  var weekly = null;
  var ok = warnings.indexOf("noAmount") === -1 &&
    warnings.indexOf("noDays") === -1 &&
    warnings.indexOf("noHoursDay") === -1;

  if (ok) {
    if (mode === "monthly") {
      monthly = amount;
      hourly = monthly / hoursPerMonth;
      daily = monthly / days;
    } else if (mode === "daily") {
      daily = amount;
      hourly = daily / hoursDay;
      monthly = daily * days;
    } else {
      hourly = amount;
      daily = hourly * hoursDay;
      monthly = hourly * hoursPerMonth;
    }
    if (weekOk) weekly = hourly * hoursWeek;
  }

  return {
    ok: ok,
    warnings: warnings,
    mode: mode,
    amount: amount,
    daysPerMonth: days,
    hoursPerDay: hoursDay,
    hoursPerWeek: weekOk ? hoursWeek : 0,
    hoursPerMonth: hoursPerMonth,
    hourly: hourly,
    daily: daily,
    monthly: monthly,
    weekly: weekly,
  };
}

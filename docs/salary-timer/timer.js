/** Pure monthly-salary ticker math. No DOM. Times are local-calendar. */

export const CURRENCIES = {
  HKD: { code: "HKD", symbol: "HK$" },
  CNY: { code: "CNY", symbol: "CN¥" },
  USD: { code: "USD", symbol: "US$" },
  TWD: { code: "TWD", symbol: "NT$" },
};

export const PRESETS = {
  monfri96: {
    weekdays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "18:00",
    lunchEnabled: true,
    lunchStart: "13:00",
    lunchEnd: "14:00",
  },
  monfri95: {
    weekdays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    lunchEnabled: true,
    lunchStart: "13:00",
    lunchEnd: "14:00",
  },
  monsat96: {
    weekdays: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
    lunchEnabled: true,
    lunchStart: "13:00",
    lunchEnd: "14:00",
  },
};

export function emptySettings() {
  return {
    salary: 20000,
    currency: "HKD",
    daysMode: "auto",
    workDaysPerMonth: 22,
    weekdays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "18:00",
    lunchEnabled: true,
    lunchStart: "13:00",
    lunchEnd: "14:00",
    showSecondRate: true,
    pausedAt: null,
    preset: "monfri96",
  };
}

export function applyPreset(settings, key) {
  var preset = PRESETS[key];
  if (!preset) {
    return Object.assign({}, settings, { preset: "custom" });
  }
  return Object.assign({}, settings, preset, { preset: key });
}

export function detectPreset(settings) {
  var keys = Object.keys(PRESETS);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var p = PRESETS[key];
    if (
      sameWeekdays(settings.weekdays, p.weekdays) &&
      settings.startTime === p.startTime &&
      settings.endTime === p.endTime &&
      !!settings.lunchEnabled === !!p.lunchEnabled &&
      (!p.lunchEnabled ||
        (settings.lunchStart === p.lunchStart && settings.lunchEnd === p.lunchEnd))
    ) {
      return key;
    }
  }
  return "custom";
}

function sameWeekdays(a, b) {
  var left = normalizeWeekdays(a);
  var right = normalizeWeekdays(b);
  if (left.length !== right.length) return false;
  for (var i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return false;
  }
  return true;
}

export function normalizeWeekdays(list) {
  var seen = {};
  var out = [];
  var src = Array.isArray(list) ? list : [];
  for (var i = 0; i < src.length; i++) {
    var n = Number(src[i]);
    if (n >= 0 && n <= 6 && !seen[n]) {
      seen[n] = true;
      out.push(n);
    }
  }
  out.sort(function (x, y) {
    return x - y;
  });
  return out;
}

export function parseHms(value) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!m) return null;
  var h = Number(m[1]);
  var min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 3600 + min * 60;
}

export function formatHms(totalSec) {
  var sec = Math.max(0, Math.floor(Number(totalSec) || 0));
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec % 3600) / 60);
  var s = sec % 60;
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    (s ? ":" + String(s).padStart(2, "0") : "")
  );
}

export function secondsOfDay(date) {
  return (
    date.getHours() * 3600 +
    date.getMinutes() * 60 +
    date.getSeconds() +
    date.getMilliseconds() / 1000
  );
}

export function workWindows(settings) {
  var start = parseHms(settings.startTime);
  var end = parseHms(settings.endTime);
  if (start == null || end == null) return [];
  if (end <= start) return [];

  var spans = [[start, end]];
  if (!settings.lunchEnabled) return spans;

  var lunchStart = parseHms(settings.lunchStart);
  var lunchEnd = parseHms(settings.lunchEnd);
  if (lunchStart == null || lunchEnd == null || lunchEnd <= lunchStart) return spans;

  var cutA = Math.max(lunchStart, start);
  var cutB = Math.min(lunchEnd, end);
  if (cutB <= cutA) return spans;

  var out = [];
  if (cutA > start) out.push([start, cutA]);
  if (end > cutB) out.push([cutB, end]);
  return out;
}

export function secondsInWindows(windows, fromSec, toSec) {
  var n = 0;
  var from = Number(fromSec);
  var to = Number(toSec);
  if (!(to > from)) return 0;
  for (var i = 0; i < windows.length; i++) {
    var lo = Math.max(windows[i][0], from);
    var hi = Math.min(windows[i][1], to);
    if (hi > lo) n += hi - lo;
  }
  return n;
}

export function dailyWorkSeconds(settings) {
  var windows = workWindows(settings);
  return secondsInWindows(windows, 0, 86400);
}

export function isWorkDay(settings, date) {
  var days = normalizeWeekdays(settings.weekdays);
  return days.indexOf(date.getDay()) !== -1;
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function countWorkDaysInMonth(settings, year, monthIndex) {
  var total = daysInMonth(year, monthIndex);
  var n = 0;
  for (var d = 1; d <= total; d++) {
    if (isWorkDay(settings, new Date(year, monthIndex, d))) n += 1;
  }
  return n;
}

export function countWorkDaysBefore(settings, date) {
  var n = 0;
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  for (var d = 1; d < day; d++) {
    if (isWorkDay(settings, new Date(year, month, d))) n += 1;
  }
  return n;
}

export function inLunch(settings, sec) {
  if (!settings.lunchEnabled) return false;
  var start = parseHms(settings.startTime);
  var end = parseHms(settings.endTime);
  var lunchStart = parseHms(settings.lunchStart);
  var lunchEnd = parseHms(settings.lunchEnd);
  if (start == null || end == null || lunchStart == null || lunchEnd == null) return false;
  if (end <= start || lunchEnd <= lunchStart) return false;
  var cutA = Math.max(lunchStart, start);
  var cutB = Math.min(lunchEnd, end);
  return sec >= cutA && sec < cutB;
}

function rateDays(settings, now) {
  var calendar = countWorkDaysInMonth(settings, now.getFullYear(), now.getMonth());
  if (settings.daysMode === "manual") {
    var manual = Number(settings.workDaysPerMonth);
    if (manual > 0) return { days: manual, calendar: calendar };
  }
  return { days: calendar, calendar: calendar };
}

export function workStatus(settings, now) {
  if (settings.pausedAt) return "paused";
  if (!isWorkDay(settings, now)) return "off";
  var sec = secondsOfDay(now);
  var start = parseHms(settings.startTime);
  var end = parseHms(settings.endTime);
  if (start == null || end == null || end <= start) return "off";
  if (sec < start) return "before";
  if (sec >= end) return "after";
  if (inLunch(settings, sec)) return "lunch";
  return "working";
}

export function formatMoney(amount, currency, digits) {
  var meta = CURRENCIES[currency] || CURRENCIES.HKD;
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 2 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + meta.symbol + parts.join(".");
}

export function compute(settings, nowInput) {
  var now = nowInput instanceof Date ? new Date(nowInput.getTime()) : new Date();
  if (settings.pausedAt) {
    var frozen = new Date(settings.pausedAt);
    if (!Number.isNaN(frozen.getTime())) now = frozen;
  }

  var warnings = [];
  var salary = Number(settings.salary);
  if (!Number.isFinite(salary) || salary < 0) salary = 0;
  if (salary === 0) warnings.push("noSalary");

  var weekdays = normalizeWeekdays(settings.weekdays);
  if (!weekdays.length) warnings.push("noWeekdays");

  var windows = workWindows(settings);
  var daySec = secondsInWindows(windows, 0, 86400);
  if (daySec <= 0) warnings.push("badHours");
  if (settings.lunchEnabled) {
    var lunchStart = parseHms(settings.lunchStart);
    var lunchEnd = parseHms(settings.lunchEnd);
    if (lunchStart == null || lunchEnd == null || lunchEnd <= lunchStart) {
      warnings.push("badLunch");
    }
  }

  var daysInfo = rateDays(settings, now);
  if (daysInfo.days <= 0) warnings.push("noDays");

  var monthTotalSec = daysInfo.days * daySec;
  var secondRate = monthTotalSec > 0 && salary > 0 ? salary / monthTotalSec : 0;
  var todayElapsed = isWorkDay(settings, now)
    ? secondsInWindows(windows, 0, secondsOfDay(now))
    : 0;
  var priorDays = countWorkDaysBefore(settings, now);
  var monthElapsed = priorDays * daySec + todayElapsed;
  if (monthElapsed > monthTotalSec && settings.daysMode === "manual") {
    monthElapsed = Math.min(monthElapsed, monthTotalSec);
    warnings.push("manualDaysCap");
  }

  var todayEarned = todayElapsed * secondRate;
  var monthEarned = monthElapsed * secondRate;
  var remainingTodaySec = Math.max(0, daySec - todayElapsed);
  var remainingMonthSec = Math.max(0, monthTotalSec - monthElapsed);

  return {
    ok: warnings.indexOf("badHours") === -1 && warnings.indexOf("noWeekdays") === -1,
    warnings: warnings,
    currency: CURRENCIES[settings.currency] ? settings.currency : "HKD",
    salary: salary,
    hoursPerDay: daySec / 3600,
    workDaysMonth: daysInfo.days,
    workDaysCalendar: daysInfo.calendar,
    secondRate: secondRate,
    minuteRate: secondRate * 60,
    hourRate: secondRate * 3600,
    dayRate: secondRate * daySec,
    todayEarned: todayEarned,
    monthEarned: monthEarned,
    remainingToday: remainingTodaySec * secondRate,
    remainingMonth: remainingMonthSec * secondRate,
    todayElapsedSec: todayElapsed,
    todayTotalSec: daySec,
    monthElapsedSec: monthElapsed,
    monthTotalSec: monthTotalSec,
    progressToday: daySec > 0 ? Math.min(1, todayElapsed / daySec) : 0,
    progressMonth: monthTotalSec > 0 ? Math.min(1, monthElapsed / monthTotalSec) : 0,
    status: workStatus(settings, now),
    now: now,
  };
}

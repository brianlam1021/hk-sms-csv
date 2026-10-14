/** Pure FDH contract-termination settlement math. No DOM. */

export var FOOD_MIN = 1236;
export var MEAL_TRAVEL_DEFAULT = 100;
export var MAW_NEW = 5220;
export var MAW_OLD = 5100;
export var MAW_CUTOVER = "2026-10-03";
export var LEAVE_DAY_DIVISOR = 26;

export var REASONS = ["expiry", "employer_notice", "helper_notice", "lieu"];
export var PAY_METHODS = ["bank", "cash", "cheque"];
export var AIRFARE_MODES = ["ticket", "cash"];
export var FOOD_MODES = ["provided", "allowance"];

var EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

var CN_DIGITS = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
var TEENS = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

export function num(v, fallback) {
  var n = Number(v);
  return isFinite(n) ? n : fallback;
}

export function roundMoney(n) {
  var x = num(n, 0);
  return Math.round(x * 100) / 100;
}

export function emptyForm() {
  return {
    employerName: "",
    helperName: "",
    helperId: "",
    contractStart: "",
    contractEnd: "",
    reason: "expiry",
    wage: MAW_NEW,
    foodMode: "provided",
    foodAllowance: FOOD_MIN,
    foodDue: 0,
    unpaidFrom: "",
    unpaidTo: "",
    unpaidAmount: 0,
    leaveDays: 0,
    leavePay: 0,
    lieuAmount: 0,
    airfareMode: "ticket",
    airfareAmount: 0,
    journeyDays: 1,
    journeyRate: MEAL_TRAVEL_DEFAULT,
    extras: [],
    payMethod: "bank",
    bankRef: "",
    payDate: "",
    witnessName: "",
    notes: "",
  };
}

export function demoForm() {
  return {
    employerName: "Chan Tai Man",
    helperName: "Maria Santos",
    helperId: "1234",
    contractStart: "2024-11-01",
    contractEnd: "2026-10-31",
    reason: "expiry",
    wage: MAW_NEW,
    foodMode: "provided",
    foodAllowance: FOOD_MIN,
    foodDue: 0,
    unpaidFrom: "2026-10-01",
    unpaidTo: "2026-10-31",
    unpaidAmount: MAW_NEW,
    leaveDays: 7,
    leavePay: suggestLeavePay(MAW_NEW, 7),
    lieuAmount: 0,
    airfareMode: "ticket",
    airfareAmount: 0,
    journeyDays: 2,
    journeyRate: MEAL_TRAVEL_DEFAULT,
    extras: [],
    payMethod: "bank",
    bankRef: "",
    payDate: "2026-10-31",
    witnessName: "",
    notes: "",
  };
}

export function mawForContract(iso) {
  if (iso && String(iso) < MAW_CUTOVER) return MAW_OLD;
  return MAW_NEW;
}

export function suggestLeavePay(wage, days) {
  var w = num(wage, 0);
  var d = num(days, 0);
  if (w <= 0 || d <= 0) return 0;
  return roundMoney((w / LEAVE_DAY_DIVISOR) * d);
}

export function mealTravelAmount(days, rate) {
  var d = Math.max(0, num(days, 0));
  var r = Math.max(0, num(rate, 0));
  return roundMoney(d * r);
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function parseIso(iso) {
  if (!iso) return null;
  var p = String(iso).split("-");
  if (p.length < 3) return null;
  var y = Number(p[0]);
  var m = Number(p[1]);
  var d = Number(p[2]);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function daysBetween(fromIso, toIso) {
  var a = parseIso(fromIso);
  var b = parseIso(toIso);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000);
}

export function inclusiveDays(fromIso, toIso) {
  if (!fromIso || !toIso) return 0;
  return daysBetween(fromIso, toIso) + 1;
}

export function formatDateZh(iso) {
  if (!iso) return "________";
  var p = String(iso).split("-");
  if (p.length < 3) return "________";
  return Number(p[0]) + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
}

export function formatDateEn(iso) {
  if (!iso) return "________";
  var p = String(iso).split("-").map(Number);
  if (p.length < 3 || !p[0] || !p[1] || !p[2]) return "________";
  return p[2] + " " + EN_MONTHS[p[1] - 1] + " " + p[0];
}

export function formatHKD(n) {
  var x = num(n, 0);
  var neg = x < 0;
  x = Math.abs(x);
  var parts = x.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + "HK$" + parts.join(".");
}

function sectionToChinese(n) {
  var units = ["", "拾", "佰", "仟"];
  var s = "";
  var zero = false;
  var str = String(n).padStart(4, "0");
  for (var i = 0; i < 4; i++) {
    var d = Number(str.charAt(i));
    var unitIndex = 3 - i;
    if (d === 0) {
      if (s.length) zero = true;
    } else {
      if (zero) s += "零";
      s += CN_DIGITS[d] + units[unitIndex];
      zero = false;
    }
  }
  return s;
}

function integerToChineseUpper(n) {
  if (n === 0) return "零";
  var sections = [];
  var x = n;
  while (x > 0) {
    sections.push(x % 10000);
    x = Math.floor(x / 10000);
  }
  var sectionUnits = ["", "萬", "億", "兆"];
  var result = "";
  var pendingZero = false;
  for (var i = sections.length - 1; i >= 0; i--) {
    var section = sections[i];
    if (section === 0) {
      if (result) pendingZero = true;
      continue;
    }
    if (pendingZero) result += "零";
    result += sectionToChinese(section) + sectionUnits[i];
    pendingZero = section < 1000 && i > 0;
  }
  return result;
}

export function toChineseUpper(amount) {
  var n = num(amount, 0);
  if (n < 0) n = 0;
  var rounded = roundMoney(n);
  var dollars = Math.floor(rounded + 1e-9);
  var cents = Math.round((rounded - dollars) * 100);
  if (cents === 100) {
    dollars += 1;
    cents = 0;
  }
  var jiao = Math.floor(cents / 10);
  var fen = cents % 10;
  var s = integerToChineseUpper(dollars) + "元";
  if (cents === 0) return s + "正";
  if (jiao) s += CN_DIGITS[jiao] + "角";
  else if (fen) s += "零";
  if (fen) s += CN_DIGITS[fen] + "分";
  return s;
}

function chunkToEnglish(n) {
  var parts = [];
  var hundred = Math.floor(n / 100);
  var rest = n % 100;
  if (hundred) parts.push(ONES[hundred] + " Hundred");
  if (rest >= 10 && rest < 20) {
    parts.push(TEENS[rest - 10]);
  } else {
    var ten = Math.floor(rest / 10);
    var one = rest % 10;
    if (ten && one) parts.push(TENS[ten] + "-" + ONES[one]);
    else if (ten) parts.push(TENS[ten]);
    else if (one) parts.push(ONES[one]);
  }
  return parts.join(" ");
}

function integerToEnglish(n) {
  if (n === 0) return "Zero";
  var scales = ["", "Thousand", "Million", "Billion"];
  var parts = [];
  var i = 0;
  var x = n;
  while (x > 0) {
    var chunk = x % 1000;
    if (chunk) {
      var words = chunkToEnglish(chunk);
      if (scales[i]) words += " " + scales[i];
      parts.unshift(words);
    }
    x = Math.floor(x / 1000);
    i += 1;
  }
  return parts.join(" ");
}

export function toEnglishWords(amount) {
  var n = num(amount, 0);
  if (n < 0) n = 0;
  var rounded = roundMoney(n);
  var dollars = Math.floor(rounded + 1e-9);
  var cents = Math.round((rounded - dollars) * 100);
  if (cents === 100) {
    dollars += 1;
    cents = 0;
  }
  var s = integerToEnglish(dollars) + (dollars === 1 ? " Hong Kong Dollar" : " Hong Kong Dollars");
  if (cents) {
    s += " and " + integerToEnglish(cents) + (cents === 1 ? " Cent" : " Cents");
  }
  return s + " Only";
}

export function reasonLabel(code) {
  if (code === "employer_notice") {
    return { zh: "僱主給予通知終止", en: "Terminated by employer’s notice" };
  }
  if (code === "helper_notice") {
    return { zh: "外傭給予通知終止", en: "Terminated by helper’s notice" };
  }
  if (code === "lieu") {
    return { zh: "以工資代替通知終止", en: "Terminated with payment in lieu of notice" };
  }
  return { zh: "合約期滿", en: "Contract expiry" };
}

export function methodLabel(code) {
  if (code === "cash") return { zh: "現金", en: "cash" };
  if (code === "cheque") return { zh: "支票", en: "cheque" };
  return { zh: "銀行轉帳／自動轉帳", en: "bank transfer / autopay" };
}

function extraAmount(row) {
  var amt = roundMoney(row && row.amount);
  if (row && row.kind === "deduct") return -Math.abs(amt);
  return Math.abs(amt);
}

function periodText(fromIso, toIso) {
  if (!fromIso && !toIso) return "";
  return (
    formatDateZh(fromIso) +
    " 至 " +
    formatDateZh(toIso) +
    " / " +
    formatDateEn(fromIso) +
    " to " +
    formatDateEn(toIso)
  );
}

/**
 * Build printable line items and a net total from user-entered amounts.
 * Does not invent SP/LSP or statutory annual-leave pay.
 */
export function computeSettlement(form) {
  var f = form || emptyForm();
  var lines = [];
  var unpaid = roundMoney(f.unpaidAmount);
  var foodDue = f.foodMode === "allowance" ? roundMoney(f.foodDue) : 0;
  var leavePay = roundMoney(f.leavePay);
  var leaveDays = Math.max(0, num(f.leaveDays, 0));
  var lieu = roundMoney(f.lieuAmount);
  var airfare = f.airfareMode === "cash" ? roundMoney(f.airfareAmount) : 0;
  var journeyDays = Math.max(0, num(f.journeyDays, 0));
  var journeyRate = Math.max(0, num(f.journeyRate, MEAL_TRAVEL_DEFAULT));
  var mealTravel = mealTravelAmount(journeyDays, journeyRate);
  var extras = Array.isArray(f.extras) ? f.extras : [];

  if (unpaid || f.unpaidFrom || f.unpaidTo) {
    var unpaidPeriod = periodText(f.unpaidFrom, f.unpaidTo);
    lines.push({
      key: "unpaid",
      sign: 1,
      amount: unpaid,
      labelZh: "未付工資" + (unpaidPeriod ? "（" + unpaidPeriod + "）" : ""),
      labelEn: "Unpaid wages" + (unpaidPeriod ? " (" + unpaidPeriod + ")" : ""),
    });
  }

  if (f.foodMode === "allowance" && foodDue) {
    lines.push({
      key: "food",
      sign: 1,
      amount: foodDue,
      labelZh: "未付膳食津貼",
      labelEn: "Unpaid food allowance",
    });
  }

  if (leaveDays || leavePay) {
    var dayBit = leaveDays ? leaveDays + " 日 / " + leaveDays + " day(s)" : "";
    lines.push({
      key: "leave",
      sign: 1,
      amount: leavePay,
      labelZh: "未放年假薪酬" + (dayBit ? "（" + dayBit + "）" : ""),
      labelEn: "Pay for unused annual leave" + (dayBit ? " (" + dayBit + ")" : ""),
    });
  }

  if (lieu) {
    lines.push({
      key: "lieu",
      sign: 1,
      amount: lieu,
      labelZh: "代通知金",
      labelEn: "Payment in lieu of notice",
    });
  }

  if (f.airfareMode === "cash") {
    lines.push({
      key: "airfare",
      sign: 1,
      amount: airfare,
      labelZh: "回程旅費（現金代替機票）",
      labelEn: "Return passage (cash in lieu of ticket)",
    });
  } else {
    lines.push({
      key: "airfare",
      sign: 0,
      amount: 0,
      provided: true,
      labelZh: "回程旅費（已提供機票）",
      labelEn: "Return passage (air ticket provided)",
    });
  }

  if (journeyDays || mealTravel) {
    lines.push({
      key: "mealTravel",
      sign: 1,
      amount: mealTravel,
      labelZh: "回程膳食及交通津貼（" + journeyDays + " 日 × " + formatHKD(journeyRate) + "）",
      labelEn:
        "Food and travelling allowance for return journey (" +
        journeyDays +
        " day(s) × " +
        formatHKD(journeyRate) +
        ")",
    });
  }

  extras.forEach(function (row, i) {
    var signed = extraAmount(row);
    if (!row || (!row.desc && !signed)) return;
    var deduct = row.kind === "deduct";
    lines.push({
      key: "extra-" + (row.id || i),
      sign: deduct ? -1 : 1,
      amount: Math.abs(signed),
      labelZh: (row.desc || "").trim() || (deduct ? "其他扣減" : "其他加項"),
      labelEn: (row.desc || "").trim() || (deduct ? "Other deduction" : "Other addition"),
    });
  });

  var total = 0;
  lines.forEach(function (line) {
    if (line.provided) return;
    total += line.sign * line.amount;
  });
  total = roundMoney(total);

  return {
    lines: lines,
    unpaid: unpaid,
    foodDue: foodDue,
    leavePay: leavePay,
    leaveDays: leaveDays,
    lieu: lieu,
    airfare: airfare,
    airfareProvided: f.airfareMode !== "cash",
    mealTravel: mealTravel,
    journeyDays: journeyDays,
    journeyRate: journeyRate,
    total: total,
  };
}

export function buildWarnings(form) {
  var f = form || emptyForm();
  var warns = [];
  var maw = mawForContract(f.contractStart);
  var wage = num(f.wage, 0);

  if (wage > 0 && wage < maw) {
    warns.push("wageBelowMaw");
  }
  if (f.foodMode === "allowance" && num(f.foodAllowance, 0) < FOOD_MIN) {
    warns.push("foodBelowMin");
  }
  if (f.reason === "lieu" && roundMoney(f.lieuAmount) <= 0) {
    warns.push("lieuMissing");
  }
  if (f.airfareMode === "cash" && roundMoney(f.airfareAmount) <= 0) {
    warns.push("airfareMissing");
  }
  if (num(f.journeyDays, 0) > 0 && num(f.journeyRate, 0) !== MEAL_TRAVEL_DEFAULT) {
    warns.push("journeyRateCustom");
  }
  if ((f.unpaidFrom || f.unpaidTo) && roundMoney(f.unpaidAmount) <= 0) {
    warns.push("unpaidMissing");
  }
  if (num(f.leaveDays, 0) > 0 && roundMoney(f.leavePay) <= 0) {
    warns.push("leavePayMissing");
  }
  if (f.contractStart && f.contractEnd && inclusiveDays(f.contractStart, f.contractEnd) >= 730) {
    warns.push("checkSpLsp");
  }
  if (f.unpaidFrom && f.unpaidTo && inclusiveDays(f.unpaidFrom, f.unpaidTo) < 1) {
    warns.push("badUnpaidPeriod");
  }
  if (f.contractStart && f.contractEnd && inclusiveDays(f.contractStart, f.contractEnd) < 1) {
    warns.push("badContractPeriod");
  }
  return warns;
}
